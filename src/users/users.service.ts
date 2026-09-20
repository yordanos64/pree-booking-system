import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { IsPhoneNumber } from 'class-validator';

@Injectable()
export class UserService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) {}

    private getRequiredSecret(key: string): string {
        const value = this.configService.get<string>(key);
        if (!value) {
            throw new Error(`Missing required environment variable: ${key}`);
        }
        return value;
    }

    async create(createUserDto: CreateUserDto) {
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

        try {
            const user = await this.prisma.user.create({
                data: {
                    name: createUserDto.name,
                    email: createUserDto.email,
                    phoneNumber: createUserDto.phoneNumber,
                    password: hashedPassword,
                    role: Role.PASSENGER,
                },
            });
           const result = {
            id: user.id,
            email:user.email
           }
            
            return result;
        } catch (error:any) {
            if (error.code === 'P2002') {
                throw new ConflictException('User with this email or phone number already exists');
            }
            throw error;
        }
    }

    async SignIn(loginUserDto: LoginUserDto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: loginUserDto.email },
        });

        if (!existingUser) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordMatch = await bcrypt.compare(loginUserDto.password, existingUser.password);
        if (!isPasswordMatch) {
            throw new UnauthorizedException('Invalid credentials');
        }

       

        const payload = {
            sub: existingUser.id,
            email: existingUser.email,
            role: existingUser.role,
        };

        const accessToken = await this.jwtService.signAsync(payload, {
            secret: this.getRequiredSecret('JWT_ACCESS_SECRET'),
            expiresIn: '15m',
        });

        const refreshToken = await this.jwtService.signAsync(payload, {
            secret: this.getRequiredSecret('JWT_REFRESH_SECRET'),
            expiresIn: '7d',
        });

        const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
        await this.prisma.refreshToken.create({
            data: {
                tokenHash,
                userId: existingUser.id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });

        return {
            accessToken,
            refreshToken,
            user: {
                id:existingUser.id,
                email:existingUser.email,
                name:existingUser.name,
                IsPhoneNumber:existingUser.phoneNumber,
                role:existingUser.role
            }
        };
    }

    async refreshTokens(incomingRefreshToken: string) {
        let payload: { sub: string; email: string; role: Role };
        try {
            payload = await this.jwtService.verifyAsync(incomingRefreshToken, {
                secret: this.getRequiredSecret('JWT_REFRESH_SECRET'),
            });
        } catch {
            throw new UnauthorizedException('Invalid or expired refresh token');
        }

        const storedTokens = await this.prisma.refreshToken.findMany({
            where: { userId: payload.sub },
        });

        const incomingHash = crypto.createHash('sha256').update(incomingRefreshToken).digest('hex');

       let matchedToken: typeof storedTokens[number] | null = null;

for (const stored of storedTokens) {
    const incomingBuf = Buffer.from(incomingHash);
    const storedBuf = Buffer.from(stored.tokenHash);

    // Ensure lengths match before timingSafeEqual to avoid a Node.js TypeError crash
    if (
        incomingBuf.length === storedBuf.length &&
        crypto.timingSafeEqual(incomingBuf, storedBuf)
    ) {
        matchedToken = stored;
        break;
    }
}

if (!matchedToken) {
    // Security measure: If an already-revoked token is being reused, 
    // it indicates a token theft attempt. Revoke all tokens for this user.
    await this.prisma.refreshToken.deleteMany({ where: { userId: payload.sub } });
    throw new UnauthorizedException('Refresh token reuse detected. All sessions revoked.');
}

// ROTATION: Delete the used refresh token
await this.prisma.refreshToken.delete({
    where: { id: matchedToken.id },
});
        const tokenPayload = {
            sub: payload.sub,
            email: payload.email,
            role: payload.role,
        };

        const newAccessToken = await this.jwtService.signAsync(tokenPayload, {
            secret: this.getRequiredSecret('JWT_ACCESS_SECRET'),
            expiresIn: '15m',
        });

        const newRefreshToken = await this.jwtService.signAsync(tokenPayload, {
            secret: this.getRequiredSecret('JWT_REFRESH_SECRET'),
            expiresIn: '7d',
        });

        const newTokenHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex');
        await this.prisma.refreshToken.create({
            data: {
                tokenHash: newTokenHash,
                userId: payload.sub,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });

        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        };
    }

   async logout(incomingRefreshToken: string) {
    let payload: { sub: string };
    try {
        payload = await this.jwtService.verifyAsync(incomingRefreshToken, {
            secret: this.getRequiredSecret('JWT_REFRESH_SECRET'),
        });
    } catch {
        return { message: 'Logged out successfully' }; // token already invalid, nothing to do
    }

    const incomingHash = crypto.createHash('sha256').update(incomingRefreshToken).digest('hex');

    const storedTokens = await this.prisma.refreshToken.findMany({
        where: { userId: payload.sub },  // ✅ scoped now
    });

    for (const stored of storedTokens) {
        if (crypto.timingSafeEqual(Buffer.from(incomingHash), Buffer.from(stored.tokenHash))) {
            await this.prisma.refreshToken.delete({ where: { id: stored.id } });
            break;
        }
    }

    return { message: 'Logged out successfully' };
}
}
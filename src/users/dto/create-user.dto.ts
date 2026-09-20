import { IsEmail, IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsEmail()
    email: string;

    @IsNotEmpty()
    @Matches(/^(\+251|0)9\d{8}$/, {
        message: 'Phone number must be a valid Ethiopian number (e.g. 0912345678 or +251912345678)',
    })
    phoneNumber: string;

    @IsString()
    @MinLength(6, { message: 'Password must be at least 6 characters long' })
    password: string;
}
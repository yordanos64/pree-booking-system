import { Controller,Body,Post ,HttpCode, HttpStatus} from "@nestjs/common";
import { UserService} from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { LoginUserDto } from "./dto/login-user.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
@Controller('user')
export class UserController{
    constructor(private readonly userService: UserService){}
    @Post('signUp')
    async signup(@Body() createUserDto:CreateUserDto){
        return await this.userService.create(createUserDto);
    }
@HttpCode(HttpStatus.OK)
@Post('signin')
async signin(@Body() loginUserDto:LoginUserDto){
    return await this.userService.SignIn(loginUserDto);
}
 @Post('refresh') 
 async refresh(@Body() refreshTokenDto:RefreshTokenDto){
    return await this.userService.refreshTokens(refreshTokenDto.refreshToken)
 }
@Post('logout')
  async logout(@Body() refreshTokenDto: RefreshTokenDto) {
    return await this.userService.logout(refreshTokenDto.refreshToken);
  }
}

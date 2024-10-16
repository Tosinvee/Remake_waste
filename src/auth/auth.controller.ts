import { Body, Controller, HttpCode, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dtos/signup.dto';
import { Public } from 'src/common/decorator/public.decorator';
import { lookup } from 'dns';
import { LocalAuthGuard } from './guards/localAuth.guard';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService:AuthService){}

    @Post('signup')
    public async signup (@Body() signupDto: SignUpDto){
        return this.authService.signup(signupDto);
    }

    @Post('verifyemail')
    @HttpCode(200)
    public async verifyEmail(@Body() body:{email: string, otp: string} ){
        return this.authService.verifyEmail(body.email,body.otp);
    }

    @Post('regenerateotp')
    @HttpCode(200)
    public async regenerateOtp(@Body() body:{email: string} ){
        return this.authService.sendotp(body.email);
    }

    @Public()
    @Post('login')
    @UseGuards(LocalAuthGuard)
    async login(@Request() req:any){
        return this.authService.login(req.user)
    }
    
}

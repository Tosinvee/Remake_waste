import { BadGatewayException, BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { SignUpDto } from './dtos/signup.dto';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { MailService } from 'src/mail/mail.service';
import { ConfigService } from '@nestjs/config';
import { Users } from './interface/user.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private userService: UserService,
        private mailService: MailService,
        private jwtService:JwtService,
        private configService: ConfigService
    ) { }

    async validateUser(email:string, password:string): Promise<Users | null>{
       const user = await this.userService.findByEmail(email)
       
       if(user &&(await bcrypt.compare(password, user.password))){
        if(!user.emailVerified){
            await this.sendotp(user.email);
            throw new BadRequestException('Email not verified. OTP sent to email')
            
        }
       }
       return null
    }

    async sendotp(email: string): Promise<{ message: string }> {
        const otp = this.mailService.generateOtp(100000);
        const emailFormat = await this.mailService.format(otp, "OTP Verification");
        const sendersEmail = this.configService.get<string>('mail.user');

        const generatedMail = await this.mailService.sendMail({
            from: sendersEmail,
            to: email,
            subject: 'OTP VERIFICATION',
            html: emailFormat
        })
        if (generatedMail === 'Error sending email') {
            throw new BadGatewayException('Error sending email')
        }
        await this.userRepository.update({ email }, { verificationCode: otp, createdAt: new Date() })
        return { message: 'Otp sent to email' }
    }


    async signup(user: SignUpDto): Promise<{ message: string }> {
        const existingUser = await this.userService.findByEmail(user.email);

        if (existingUser) {
            throw new BadRequestException('User already exist')
        }
        const hashedPassword = await bcrypt.hash(user.password, 10)
        await this.userRepository.save({
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            password: hashedPassword
        });
        return await this.sendotp(user.email)
    }

    async verifyEmail(email: string, otp: string): Promise<{ message: string; }> {
        const user = await this.userService.findByEmail(email);
        if (!user) {
            throw new NotFoundException('User not found');
          }
        if (user.verificationCode === otp && this.mailService.verifyOtpTime(user.createdAt)) {
            await this.userRepository.update({ email }, { emailVerified: true })

            return {
                message: 'Email verified sucessfully',
            }
        }
        throw new BadRequestException('Invalid otp')
    }
 async login(user:Users) {
    const payload = {email:user.email, sub:user.id, roles:user.roles}

    return {
        access_token:this.jwtService.sign(payload, {expiresIn: '1hr'})
    }
 } 

}


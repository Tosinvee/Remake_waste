import { BadGatewayException, BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { SignUpDto } from './dtos/signup.dto';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { MailService } from 'src/mail/mail.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private userService: UserService,
        private mailService: MailService,
        private configService: ConfigService
    ) { }

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

}

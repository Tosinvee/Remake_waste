import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from 'src/user/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from 'src/user/user.service';
import { UserModule } from 'src/user/user.module';
import { MailModule } from 'src/mail/mail.module';

@Module({
  providers: [AuthService],
  controllers: [AuthController],
  imports:[TypeOrmModule.forFeature([User]),
UserModule,
MailModule]
})
export class AuthModule {}

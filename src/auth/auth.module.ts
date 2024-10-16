import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from 'src/user/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from 'src/user/user.service';
import { UserModule } from 'src/user/user.module';
import { MailModule } from 'src/mail/mail.module';
import { ConfigModule } from '@nestjs/config';
import jwtConfig from './jwt.config';
import { JwtModule } from '@nestjs/jwt';

@Module({
  providers: [AuthService],
  controllers: [AuthController],
  imports:[TypeOrmModule.forFeature([User]),
  forwardRef(() => UserModule),
  ConfigModule.forFeature(jwtConfig),
  JwtModule.registerAsync(jwtConfig.asProvider()),  

MailModule]
})
export class AuthModule {}

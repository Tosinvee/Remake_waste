import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class SignUpDto{
    @IsEmail()
    @IsNotEmpty()
    email:string;

    @IsString()
    @MinLength(8)
    @IsNotEmpty()
    password:string

    @IsString()
    @MaxLength(98)
    @IsNotEmpty()
    firstName:string

    @IsString()
    @MaxLength(98)
    @IsNotEmpty()
    lastName:string
}
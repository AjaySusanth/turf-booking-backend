import { IsEmail, IsOptional, IsString, IsStrongPassword } from "class-validator";

export class SignupDto {
    @IsString()
    name: string

    @IsEmail()
    email:string

    @IsString()
    @IsOptional()
    phone: string

    @IsString()
    @IsStrongPassword()
    password:string

}
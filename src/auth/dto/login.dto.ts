import { IsEmail, IsString, IsStrongPassword } from "class-validator";

export class LoginDto {
    @IsEmail()
    email: string;

    @IsString()
    password: string;
}

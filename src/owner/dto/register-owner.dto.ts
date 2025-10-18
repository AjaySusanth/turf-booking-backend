import { IsNotEmpty, IsString } from "class-validator";

export class RegisterOwnerDto {
    @IsString()
    @IsNotEmpty()
    businessName: string


    @IsString()
    @IsNotEmpty()
    address: string
    
}
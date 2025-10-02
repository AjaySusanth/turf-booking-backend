import { Injectable } from '@nestjs/common';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { LogoutDto } from './dto/logout.dto';

@Injectable()
export class AuthService {
    async signup(dto:SignupDto) {
        return "signup"
    }

    async login(dto:LoginDto) {
        return "login"
    }

    async refresh(dto:RefreshDto) {
        return "refresh"
    }

    async logout(dto:LogoutDto) {
        return "logout"
    }

    
}

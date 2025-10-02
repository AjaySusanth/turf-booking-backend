import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { LogoutDto } from './dto/logout.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body() dto:SignupDto) {
    return this.authService.signup(dto)
  }

  @Post('login')
  async login(@Body() dto:LoginDto) {
    return this.authService.login(dto)
  }

  @Post('refresh')
  async refresh(@Body() dto:RefreshDto) {
    return this.authService.refresh(dto)
  }

  @Post('logout')
  async logout(@Body() dto:LogoutDto) {
    return this.authService.logout(dto)
  }

}

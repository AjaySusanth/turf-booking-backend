import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { LogoutDto } from './dto/logout.dto';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as argon2 from 'argon2';
import { AuthResponseDto } from './dto/auth-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async signup(dto: SignupDto): Promise<AuthResponseDto> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    if (dto.phone) {
        const existingPhoneUser = await this.prisma.user.findUnique({
            where: { phone: dto.phone },
        });
        if (existingPhoneUser) {
            throw new BadRequestException('Phone already registered');
        }
    }


    // Hash password
    const passwordHash = await argon2.hash(dto.password);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        passwordHash,
      },
    });

    // Issue JWT access token
    const accessToken = this.generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Return user info + token
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user?.phone,
      role: user.role,
      accessToken,
      refreshToken: '', // Implement refresh in the next stage!
    };
  }

  async login(dto: LoginDto) {

    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const valid = await argon2.verify(user.passwordHash, dto.password);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Issue JWT access token
    const accessToken = this.generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user?.phone,
      role: user.role,
      accessToken,
      refreshToken: '', // Implement refresh in the next stage!
    };
  }

  async refresh(dto: RefreshDto) {
    return 'refresh';
  }

  async logout(dto: LogoutDto) {
    return 'logout';
  }

  private generateAccessToken(user: {
    id: string;
    email: string;
    role: string;
  }) {
    return this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
  }
}

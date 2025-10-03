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
import { createHash, randomBytes } from 'crypto';

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

    // Generate refresh token
      const { refreshToken, refreshTokenHash, expiresAt } = this.issueRefreshTokenArtifacts();

    // Store session
    await this.prisma.userSession.upsert({
      where: {userId:user.id},
      update:{ refreshTokenHash, expiresAt, revokedAt: null },
      create:{ userId:user.id, refreshTokenHash, expiresAt }
    })

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
      refreshToken
    };
  }

  async login(dto: LoginDto) :Promise<AuthResponseDto>{

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

    // Generate refresh token
    const { refreshToken, refreshTokenHash, expiresAt } = this.issueRefreshTokenArtifacts();

    // Store session
    await this.prisma.userSession.upsert({
      where: {userId:user.id},
      update:{ refreshTokenHash, expiresAt, revokedAt: null },
      create:{ userId:user.id, refreshTokenHash, expiresAt }
    })

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
      refreshToken
    };
  }

  async refresh(dto: RefreshDto): Promise<AuthResponseDto>{

    const session = await this.findSessionByRefreshToken(dto.refreshToken)

    if (!session) throw new UnauthorizedException('Invalid refresh token');

    if (session.revokedAt)
      throw new UnauthorizedException('Refresh token revoked');

    if (session.expiresAt <= new Date()) {
      await this.revokeSession(session.id);
      throw new UnauthorizedException('Refresh token expired');
    }

    const { refreshToken, refreshTokenHash, expiresAt } = this.issueRefreshTokenArtifacts();

    await this.prisma.userSession.update({
      where: { id: session.id },
      data: { refreshTokenHash, expiresAt },
    });

    const accessToken = this.generateAccessToken({
      id: session.user.id,
      email: session.user.email,
      role: session.user.role,
    });

    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      phone: session.user?.phone,
      role: session.user.role,
      accessToken,
      refreshToken
    };

  }


  async logout(dto: LogoutDto) : Promise<{success: boolean}> {

    const session = await this.findSessionByRefreshToken(dto.refreshToken)

    if (!session || session.revokedAt) return { success: true };

    await this.revokeSession(session.id);

    return { success: true };
    
  }

  private generateAccessToken(user: {
    id: string;
    email: string;
    role: string;
  }): string {
    return this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
  }

  private issueRefreshTokenArtifacts() : {
    refreshToken :string, refreshTokenHash:string,expiresAt:Date
  } {
    const refreshToken = this.generateRefreshToken();
    const refreshTokenHash = this.hashToken(refreshToken)
    const expiresAt = this.getRefreshTokenExpiry();
    return {refreshToken, refreshTokenHash,expiresAt}
  }

  private generateRefreshToken(): string {
     return randomBytes(64).toString('hex');
  }

  private getRefreshTokenExpiry():Date {
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 days expiry
    return expiresAt
  }

  private async revokeSession(sessionId: string) {
    await this.prisma.userSession.update({
      where: { id: sessionId },
      data: { revokedAt: new Date() },
    });
  }

  private async findSessionByRefreshToken(refreshToken:string) {
    const refreshTokenHash = this.hashToken(refreshToken)

    return await this.prisma.userSession.findUnique({
      where: {refreshTokenHash},
      include: {user:true}
    })

  }

  private hashToken(token: string): string {
    // SHA-256 hex digest
    return createHash('sha256').update(token).digest('hex');
  }
}

import { UserRole } from "../../../generated/prisma";


export class AuthResponseDto {
  id: string;
  email: string;
  name: string
  phone?: string;
  role: UserRole;
  accessToken: string;
  refreshToken: string;
}
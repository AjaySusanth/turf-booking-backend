import { UserRole } from "../../../generated/prisma";


export class AuthResponseDto {
  id: string;
  email: string;
  name: string
  phone?: string | null;
  role: UserRole;
  accessToken: string;
  refreshToken: string;
}
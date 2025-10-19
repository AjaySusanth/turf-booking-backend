import { BadRequestException, CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { UserRole } from "../../../generated/prisma";
import { ROLES_KEY } from "../decorator/roles.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean | Promise<boolean>{
        const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY,[
            context.getHandler(),
            context.getClass()
        ])

        if (!requiredRoles || requiredRoles.length === 0) return true

        const req = context.switchToHttp().getRequest()
        const user = req.user as {userId: string, role?:UserRole}

        if(!user) {
            throw new BadRequestException("Missing authenticated user")
        }

        if (user.role === UserRole.ADMIN) return true

        const allowed = !!user.role && requiredRoles.includes(user.role)

        if(!allowed) {
            throw new ForbiddenException("Access Denied, Insufficient Role")
        }

        return true
    }
}

import { BadRequestException, ForbiddenException, InternalServerErrorException, NotFoundException, UnauthorizedException } from "@nestjs/common";


export function mapRpcErrorToHttp(err: any): never {
    const payload = err?.error ?? err;

    const code = payload?.code as string | undefined;
    const message = payload?.message ?? "Request failed!!!"

    if (code === "BAD_REQUEST" || code === "VALIDATION_ERROR"){
        throw new BadRequestException(message)
    }
    if (code === "NOT_FOUND" || code === "VALIDATION_ERROR"){
        throw new NotFoundException(message)
    }
    if (code === "UNAUTHORIZED" || code === "VALIDATION_ERROR"){
        throw new UnauthorizedException(message)
    }
    if (code === "FORBIDDEN" || code === "VALIDATION_ERROR"){
        throw new ForbiddenException(message)
    }

    throw new InternalServerErrorException(message)
}
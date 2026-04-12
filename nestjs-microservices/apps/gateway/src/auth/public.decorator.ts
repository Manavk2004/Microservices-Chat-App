import { SetMetadata } from "@nestjs/common";


export const IS_PUBLIC_KEY = 'isPublic';
export const REQUIRED_ROLE_KEY = "requiredRole"

export const Public = () => SetMetadata(IS_PUBLIC_KEY, true)


import { IsNumber, IsOptional, IsString, Min } from "class-validator";



export class SeaerchQueryDto{

    @IsString()
    q!: string;

    @IsOptional()
    @IsNumber()
    @Min(1)
    limit?: number;
}
import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class UpdateTerminalDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    code?: string;

    @IsOptional()
    @IsNumber()
    latitude?: number;

    @IsOptional()
    @IsNumber()
    Longtude?: number;
}
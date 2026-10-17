import { IsOptional, IsInt, Min, Max, IsString, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class CursorPaginationQueryDto {
  @IsOptional()
  @IsString()
 
  cursorId!: string; 

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit!: number = 10;

  @IsOptional()

  @Type(() => Boolean)
  @IsBoolean()
  onlyActive!: boolean = true;

  @IsOptional()
  @IsString()
  search!: string;
}

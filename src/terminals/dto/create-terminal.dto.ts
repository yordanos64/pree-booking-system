import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTerminalDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsString()
  location!: string;
}
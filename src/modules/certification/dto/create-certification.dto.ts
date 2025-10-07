import { IsString, IsDateString, IsOptional, IsNotEmpty, MaxLength } from 'class-validator';

/**
 * DTO para crear una nueva certificación
 * Define las reglas de validación para los datos de entrada
 */
export class CreateCertificationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  institution: string;

  @IsDateString()
  issueDate: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;
}

import { IsString, IsEmail, IsNotEmpty, MaxLength } from 'class-validator';

/**
 * DTO para crear una nueva persona
 * Define las reglas de validación para los datos de entrada
 */
export class CreatePersonDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  fullName: string;

  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  email: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  role: string;
}

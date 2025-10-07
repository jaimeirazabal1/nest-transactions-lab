import { IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateCertificationDto } from './create-certification.dto';
import { CreatePersonDto } from '../../person/dto/create-person.dto';

/**
 * DTO para crear una certificación junto con sus participantes
 * Este es el DTO principal que usaremos para demostrar las transacciones
 */
export class CreateCertificationWithPersonsDto extends CreateCertificationDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePersonDto)
  @ArrayMinSize(1, { message: 'Debe incluir al menos una persona' })
  persons: CreatePersonDto[];
}

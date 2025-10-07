import { Controller, Get, Param } from '@nestjs/common';
import { PersonService } from './person.service';

/**
 * Controlador de Personas
 * Expone endpoints para consultar información de personas
 */
@Controller('persons')
export class PersonController {
  constructor(private readonly personService: PersonService) {}

  /**
   * Endpoint para obtener todas las personas
   * GET /api/v1/persons
   */
  @Get()
  async findAll() {
    return {
      success: true,
      message: 'Personas obtenidas exitosamente',
      data: await this.personService.findAll(),
    };
  }

  /**
   * Endpoint para obtener una persona específica
   * GET /api/v1/persons/:id
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const person = await this.personService.findOne(id);
    
    if (!person) {
      return {
        success: false,
        message: 'Persona no encontrada',
        data: null,
      };
    }

    return {
      success: true,
      message: 'Persona obtenida exitosamente',
      data: person,
    };
  }

  /**
   * Endpoint para obtener todas las personas de una certificación
   * GET /api/v1/persons/certification/:certificationId
   */
  @Get('certification/:certificationId')
  async findByCertification(@Param('certificationId') certificationId: string) {
    const persons = await this.personService.findByCertification(certificationId);
    
    return {
      success: true,
      message: `Personas de la certificación ${certificationId}`,
      data: persons,
      count: persons.length,
    };
  }
}

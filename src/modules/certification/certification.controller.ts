import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { CertificationService } from './certification.service';
import { CreateCertificationWithPersonsDto } from './dto/create-certification-with-persons.dto';

/**
 * Controlador de Certificaciones
 * Expone endpoints para demostrar el manejo de transacciones
 */
@Controller('certifications')
export class CertificationController {
  constructor(private readonly certificationService: CertificationService) {}

  /**
   * Endpoint para crear una certificación con personas (caso exitoso)
   * POST /api/v1/certifications
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(
    @Body() createCertificationDto: CreateCertificationWithPersonsDto,
  ) {
    return {
      success: true,
      message: 'Certificación y personas creadas exitosamente',
      data: await this.certificationService.createWithPersons(createCertificationDto),
    };
  }

  /**
   * Endpoint para crear una certificación con personas simulando error
   * POST /api/v1/certifications/simulate-error
   * Demuestra cómo las transacciones previenen la corrupción de datos
   */
  @Post('simulate-error')
  @HttpCode(HttpStatus.BAD_REQUEST)
  @UsePipes(new ValidationPipe({ transform: true }))
  async createWithError(
    @Body() createCertificationDto: CreateCertificationWithPersonsDto,
  ) {
    try {
      // Simular error en la 5ta persona (índice 4)
      await this.certificationService.createWithPersonsAndSimulateError(
        createCertificationDto,
        4,
      );
    } catch (error) {
      return {
        success: false,
        message: 'Error simulado - Transacción cancelada correctamente',
        error: error.message,
        details: 'Ningún dato fue guardado debido al rollback automático',
      };
    }
  }

  /**
   * Endpoint para obtener todas las certificaciones
   * GET /api/v1/certifications
   */
  @Get()
  async findAll() {
    return {
      success: true,
      message: 'Certificaciones obtenidas exitosamente',
      data: await this.certificationService.findAll(),
    };
  }

  /**
   * Endpoint para obtener una certificación específica
   * GET /api/v1/certifications/:id
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const certification = await this.certificationService.findOne(id);
    
    if (!certification) {
      return {
        success: false,
        message: 'Certificación no encontrada',
        data: null,
      };
    }

    return {
      success: true,
      message: 'Certificación obtenida exitosamente',
      data: certification,
    };
  }
}

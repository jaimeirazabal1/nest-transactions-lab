import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Certification } from '../../entities/certification.entity';
import { Person } from '../../entities/person.entity';
import { CreateCertificationDto } from './dto/create-certification.dto';
import { CreateCertificationWithPersonsDto } from './dto/create-certification-with-persons.dto';

/**
 * Servicio de Certificaciones
 * Demuestra el uso de transacciones con QueryRunner para garantizar atomicidad
 * CRÍTICO: Si falla la inserción de alguna persona, se cancela toda la operación
 */
@Injectable()
export class CertificationService {
  private readonly logger = new Logger(CertificationService.name);

  constructor(
    @InjectRepository(Certification)
    private certificationRepository: Repository<Certification>,
    @InjectRepository(Person)
    private personRepository: Repository<Person>,
    private dataSource: DataSource,
  ) {}

  /**
   * Crea una certificación con sus participantes usando transacciones
   * Este método demuestra el manejo de transacciones con QueryRunner
   * 
   * @param createCertificationDto - Datos de la certificación y personas
   * @returns La certificación creada con todas las personas
   */
  async createWithPersons(
    createCertificationDto: CreateCertificationWithPersonsDto,
  ): Promise<Certification> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      this.logger.log('🚀 Iniciando transacción para crear certificación con personas');

      // 1. Crear la certificación
      const certification = queryRunner.manager.create(Certification, {
        title: createCertificationDto.title,
        institution: createCertificationDto.institution,
        issueDate: new Date(createCertificationDto.issueDate),
        description: createCertificationDto.description,
        status: 'active',
      });

      const savedCertification = await queryRunner.manager.save(Certification, certification);
      this.logger.log(`✅ Certificación creada: ${savedCertification.id}`);

      // 2. Crear todas las personas asociadas
      const persons = [];
      for (let i = 0; i < createCertificationDto.persons.length; i++) {
        const personData = createCertificationDto.persons[i];
        
        this.logger.log(`📝 Procesando persona ${i + 1}/${createCertificationDto.persons.length}: ${personData.fullName}`);

        // Validar que el email no exista ya en esta certificación
        const existingPerson = await queryRunner.manager.findOne(Person, {
          where: { email: personData.email },
        });

        if (existingPerson) {
          throw new BadRequestException(
            `El email ${personData.email} ya existe en el sistema`,
          );
        }

        const person = queryRunner.manager.create(Person, {
          fullName: personData.fullName,
          email: personData.email,
          role: personData.role,
          certificationId: savedCertification.id,
        });

        const savedPerson = await queryRunner.manager.save(Person, person);
        persons.push(savedPerson);
        
        this.logger.log(`✅ Persona creada: ${savedPerson.fullName} (${savedPerson.email})`);
      }

      // 3. Confirmar la transacción
      await queryRunner.commitTransaction();
      this.logger.log('🎉 Transacción completada exitosamente');

      // 4. Retornar la certificación con todas las personas
      savedCertification.persons = persons;
      return savedCertification;

    } catch (error) {
      // 5. En caso de error, hacer rollback automático
      await queryRunner.rollbackTransaction();
      this.logger.error(`❌ Error en transacción: ${error.message}`);
      this.logger.error('🔄 Rollback ejecutado - Ningún dato fue guardado');
      
      throw error;
    } finally {
      // 6. Liberar la conexión
      await queryRunner.release();
      this.logger.log('🔌 Conexión liberada');
    }
  }

  /**
   * Crea una certificación con personas simulando un error en una persona específica
   * Este método demuestra cómo las transacciones previenen la corrupción de datos
   * 
   * @param createCertificationDto - Datos de la certificación y personas
   * @param failAtPersonIndex - Índice de la persona donde simular el error (0-based)
   * @returns La certificación creada o lanza una excepción
   */
  async createWithPersonsAndSimulateError(
    createCertificationDto: CreateCertificationWithPersonsDto,
    failAtPersonIndex: number = 4, // Por defecto falla en la 5ta persona (índice 4)
  ): Promise<Certification> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      this.logger.log(`🚀 Iniciando transacción con simulación de error en persona ${failAtPersonIndex + 1}`);

      // 1. Crear la certificación
      const certification = queryRunner.manager.create(Certification, {
        title: createCertificationDto.title,
        institution: createCertificationDto.institution,
        issueDate: new Date(createCertificationDto.issueDate),
        description: createCertificationDto.description,
        status: 'active',
      });

      const savedCertification = await queryRunner.manager.save(Certification, certification);
      this.logger.log(`✅ Certificación creada: ${savedCertification.id}`);

      // 2. Crear las personas hasta llegar al punto de fallo
      const persons = [];
      for (let i = 0; i < createCertificationDto.persons.length; i++) {
        const personData = createCertificationDto.persons[i];
        
        this.logger.log(`📝 Procesando persona ${i + 1}/${createCertificationDto.persons.length}: ${personData.fullName}`);

        // Simular error en la persona especificada
        if (i === failAtPersonIndex) {
          this.logger.error(`💥 Simulando error en persona ${i + 1}: ${personData.fullName}`);
          throw new BadRequestException(
            `Error simulado al procesar la persona: ${personData.fullName}`,
          );
        }

        // Validar que el email no exista ya
        const existingPerson = await queryRunner.manager.findOne(Person, {
          where: { email: personData.email },
        });

        if (existingPerson) {
          throw new BadRequestException(
            `El email ${personData.email} ya existe en el sistema`,
          );
        }

        const person = queryRunner.manager.create(Person, {
          fullName: personData.fullName,
          email: personData.email,
          role: personData.role,
          certificationId: savedCertification.id,
        });

        const savedPerson = await queryRunner.manager.save(Person, person);
        persons.push(savedPerson);
        
        this.logger.log(`✅ Persona creada: ${savedPerson.fullName} (${savedPerson.email})`);
      }

      // 3. Confirmar la transacción (nunca llegará aquí si hay error)
      await queryRunner.commitTransaction();
      this.logger.log('🎉 Transacción completada exitosamente');

      savedCertification.persons = persons;
      return savedCertification;

    } catch (error) {
      // 4. En caso de error, hacer rollback automático
      await queryRunner.rollbackTransaction();
      this.logger.error(`❌ Error en transacción: ${error.message}`);
      this.logger.error('🔄 Rollback ejecutado - Ningún dato fue guardado');
      
      throw error;
    } finally {
      // 5. Liberar la conexión
      await queryRunner.release();
      this.logger.log('🔌 Conexión liberada');
    }
  }

  /**
   * Obtiene todas las certificaciones
   */
  async findAll(): Promise<Certification[]> {
    return this.certificationRepository.find({
      relations: ['persons'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtiene una certificación por ID
   */
  async findOne(id: string): Promise<Certification> {
    return this.certificationRepository.findOne({
      where: { id },
      relations: ['persons'],
    });
  }
}

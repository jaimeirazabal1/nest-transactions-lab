import { DataSource } from 'typeorm';
import { Certification } from '../../entities/certification.entity';
import { Person } from '../../entities/person.entity';

/**
 * Seed para datos iniciales de certificaciones
 * Crea datos de ejemplo para probar el laboratorio de transacciones
 */
export class CertificationSeed {
  constructor(private dataSource: DataSource) {}

  /**
   * Ejecuta el seed de certificaciones
   */
  async run(): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      console.log('🌱 Iniciando seed de certificaciones...');

      // Datos de ejemplo para el laboratorio
      const certificationData = {
        title: 'Curso de NestJS Avanzado',
        institution: 'Academia Tech',
        issueDate: new Date('2024-01-15'),
        description: 'Certificación del curso avanzado de NestJS con TypeORM y transacciones de base de datos',
        status: 'active',
      };

      // Crear la certificación
      const certification = queryRunner.manager.create(Certification, certificationData);
      const savedCertification = await queryRunner.manager.save(Certification, certification);
      
      console.log(`✅ Certificación creada: ${savedCertification.title}`);

      // Datos de las personas (participantes)
      const personsData = [
        {
          fullName: 'María González',
          email: 'maria@email.com',
          role: 'Estudiante',
          certificationId: savedCertification.id,
        },
        {
          fullName: 'Carlos López',
          email: 'carlos@email.com',
          role: 'Estudiante',
          certificationId: savedCertification.id,
        },
        {
          fullName: 'Ana Martínez',
          email: 'ana@email.com',
          role: 'Instructor',
          certificationId: savedCertification.id,
        },
        {
          fullName: 'Pedro Sánchez',
          email: 'pedro@email.com',
          role: 'Estudiante',
          certificationId: savedCertification.id,
        },
        {
          fullName: 'Laura Díaz',
          email: 'laura@email.com',
          role: 'Estudiante',
          certificationId: savedCertification.id,
        },
      ];

      // Crear todas las personas usando transacciones
      for (const personData of personsData) {
        const person = queryRunner.manager.create(Person, personData);
        const savedPerson = await queryRunner.manager.save(Person, person);
        console.log(`✅ Persona creada: ${savedPerson.fullName} (${savedPerson.email})`);
      }

      await queryRunner.commitTransaction();
      console.log('🎉 Seed de certificaciones completado exitosamente');

    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('❌ Error en seed de certificaciones:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Limpia los datos de prueba
   */
  async clean(): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      console.log('🧹 Limpiando datos de certificaciones...');

      // Eliminar personas primero (debido a las foreign keys)
      await queryRunner.manager.delete(Person, {});
      console.log('✅ Personas eliminadas');

      // Eliminar certificaciones
      await queryRunner.manager.delete(Certification, {});
      console.log('✅ Certificaciones eliminadas');

      await queryRunner.commitTransaction();
      console.log('🎉 Limpieza completada exitosamente');

    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('❌ Error en limpieza:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}

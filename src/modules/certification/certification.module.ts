import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CertificationController } from './certification.controller';
import { CertificationService } from './certification.service';
import { Certification } from '../../entities/certification.entity';
import { Person } from '../../entities/person.entity';

/**
 * Módulo de Certificaciones
 * Configura el controlador, servicio y entidades necesarias
 */
@Module({
  imports: [TypeOrmModule.forFeature([Certification, Person])],
  controllers: [CertificationController],
  providers: [CertificationService],
  exports: [CertificationService],
})
export class CertificationModule {}

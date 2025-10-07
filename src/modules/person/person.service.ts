import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Person } from '../../entities/person.entity';

/**
 * Servicio de Personas
 * Maneja las operaciones relacionadas con las personas en las certificaciones
 */
@Injectable()
export class PersonService {
  constructor(
    @InjectRepository(Person)
    private personRepository: Repository<Person>,
  ) {}

  /**
   * Obtiene todas las personas
   */
  async findAll(): Promise<Person[]> {
    return this.personRepository.find({
      relations: ['certification'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtiene una persona por ID
   */
  async findOne(id: string): Promise<Person> {
    return this.personRepository.findOne({
      where: { id },
      relations: ['certification'],
    });
  }

  /**
   * Obtiene todas las personas de una certificación específica
   */
  async findByCertification(certificationId: string): Promise<Person[]> {
    return this.personRepository.find({
      where: { certificationId },
      relations: ['certification'],
      order: { createdAt: 'ASC' },
    });
  }

  /**
   * Verifica si un email ya existe en el sistema
   */
  async emailExists(email: string): Promise<boolean> {
    const person = await this.personRepository.findOne({
      where: { email },
    });
    return !!person;
  }
}

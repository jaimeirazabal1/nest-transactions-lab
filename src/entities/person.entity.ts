import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Certification } from './certification.entity';

/**
 * Entidad Person
 * Representa una persona que participa en una certificación
 * Cada persona debe estar asociada a una certificación
 */
@Entity('persons')
export class Person {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  fullName: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 100 })
  role: string;

  @Column({ type: 'uuid' })
  certificationId: string;

  // Relación muchos a uno con Certification
  // Una persona pertenece a una sola certificación
  @ManyToOne(() => Certification, (certification) => certification.persons, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'certificationId' })
  certification: Certification;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

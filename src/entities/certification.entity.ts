import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Person } from './person.entity';

/**
 * Entidad Certification
 * Representa una certificación emitida por la plataforma
 * Cada certificación puede tener múltiples participantes (personas)
 */
@Entity('certifications')
export class Certification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 255 })
  institution: string;

  @Column({ type: 'date' })
  issueDate: Date;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 50, default: 'active' })
  status: string;

  // Relación uno a muchos con Person
  // Si se elimina una certificación, se eliminan todas las personas asociadas
  @OneToMany(() => Person, (person) => person.certification, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  persons: Person[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

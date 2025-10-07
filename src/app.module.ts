import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CertificationModule } from './modules/certification/certification.module';
import { PersonModule } from './modules/person/person.module';
import { Certification } from './entities/certification.entity';
import { Person } from './entities/person.entity';

/**
 * Módulo principal de la aplicación
 * Configura TypeORM, variables de entorno y módulos de la aplicación
 */
@Module({
  imports: [
    // Configuración de variables de entorno
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    
    // Configuración de TypeORM con PostgreSQL
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres123',
      database: process.env.DB_DATABASE || 'certifications_db',
      entities: [Certification, Person],
      synchronize: process.env.NODE_ENV === 'development',
      logging: process.env.NODE_ENV === 'development',
      ssl: false,
    }),
    
    // Módulos de la aplicación
    CertificationModule,
    PersonModule,
  ],
})
export class AppModule {}

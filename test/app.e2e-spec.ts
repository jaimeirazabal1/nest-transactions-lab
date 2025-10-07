import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { Certification } from '../src/entities/certification.entity';
import { Person } from '../src/entities/person.entity';

/**
 * Tests End-to-End para el laboratorio de transacciones
 * Demuestran el comportamiento de la API en escenarios reales
 */
describe('Laboratorio de Transacciones NestJS (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  // Datos de prueba para los tests
  const testCertificationData = {
    title: 'Curso de NestJS Avanzado',
    institution: 'Academia Tech',
    issueDate: '2024-01-15',
    description: 'Certificación del curso avanzado de NestJS',
    persons: [
      {
        fullName: 'María González',
        email: 'maria@email.com',
        role: 'Estudiante',
      },
      {
        fullName: 'Carlos López',
        email: 'carlos@email.com',
        role: 'Estudiante',
      },
      {
        fullName: 'Ana Martínez',
        email: 'ana@email.com',
        role: 'Instructor',
      },
      {
        fullName: 'Pedro Sánchez',
        email: 'pedro@email.com',
        role: 'Estudiante',
      },
      {
        fullName: 'Laura Díaz',
        email: 'laura@email.com',
        role: 'Estudiante',
      },
    ],
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    dataSource = moduleFixture.get<DataSource>(DataSource);

    // Configurar la aplicación igual que en main.ts
    app.useGlobalPipes(
      new (await import('@nestjs/common')).ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.setGlobalPrefix('api/v1');

    await app.init();
  });

  afterAll(async () => {
    // Limpiar datos de prueba
    await dataSource.getRepository(Person).delete({});
    await dataSource.getRepository(Certification).delete({});
    await app.close();
  });

  describe('POST /api/v1/certifications', () => {
    it('debería crear una certificación con todas las personas exitosamente', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/certifications')
        .send(testCertificationData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('exitosamente');
      expect(response.body.data).toBeDefined();
      expect(response.body.data.title).toBe(testCertificationData.title);
      expect(response.body.data.persons).toHaveLength(5);

      // Verificar que todas las personas tienen IDs únicos
      const personIds = response.body.data.persons.map((p: any) => p.id);
      const uniqueIds = new Set(personIds);
      expect(uniqueIds.size).toBe(5);

      // Verificar que cada persona tiene el mismo certificationId
      response.body.data.persons.forEach((person: any) => {
        expect(person.certificationId).toBe(response.body.data.id);
      });
    });

    it('debería fallar con datos inválidos', async () => {
      const invalidData = {
        title: '', // Título vacío
        institution: 'Academia Tech',
        issueDate: 'invalid-date',
        persons: [], // Array vacío
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/certifications')
        .send(invalidData)
        .expect(400);

      expect(response.body.message).toBeDefined();
    });
  });

  describe('POST /api/v1/certifications/simulate-error', () => {
    it('debería simular error y hacer rollback correctamente', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/certifications/simulate-error')
        .send(testCertificationData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Error simulado');
      expect(response.body.details).toContain('Ningún dato fue guardado');

      // Verificar que no se creó ninguna certificación
      const certifications = await dataSource.getRepository(Certification).find();
      expect(certifications).toHaveLength(0);

      // Verificar que no se creó ninguna persona
      const persons = await dataSource.getRepository(Person).find();
      expect(persons).toHaveLength(0);
    });
  });

  describe('GET /api/v1/certifications', () => {
    beforeEach(async () => {
      // Crear datos de prueba para estos tests
      const certification = dataSource.getRepository(Certification).create({
        title: 'Test Certification',
        institution: 'Test Institution',
        issueDate: new Date('2024-01-15'),
        description: 'Test Description',
        status: 'active',
      });
      await dataSource.getRepository(Certification).save(certification);

      const person = dataSource.getRepository(Person).create({
        fullName: 'Test Person',
        email: 'test@email.com',
        role: 'Estudiante',
        certificationId: certification.id,
      });
      await dataSource.getRepository(Person).save(person);
    });

    afterEach(async () => {
      // Limpiar después de cada test
      await dataSource.getRepository(Person).delete({});
      await dataSource.getRepository(Certification).delete({});
    });

    it('debería obtener todas las certificaciones', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/certifications')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('debería obtener una certificación específica', async () => {
      // Primero crear una certificación
      const certification = dataSource.getRepository(Certification).create({
        title: 'Specific Test Certification',
        institution: 'Test Institution',
        issueDate: new Date('2024-01-15'),
        description: 'Test Description',
        status: 'active',
      });
      const savedCertification = await dataSource.getRepository(Certification).save(certification);

      const response = await request(app.getHttpServer())
        .get(`/api/v1/certifications/${savedCertification.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(savedCertification.id);
      expect(response.body.data.title).toBe('Specific Test Certification');
    });

    it('debería retornar error para certificación inexistente', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      
      const response = await request(app.getHttpServer())
        .get(`/api/v1/certifications/${fakeId}`)
        .expect(200);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('no encontrada');
    });
  });

  describe('GET /api/v1/persons', () => {
    beforeEach(async () => {
      // Crear datos de prueba
      const certification = dataSource.getRepository(Certification).create({
        title: 'Test Certification',
        institution: 'Test Institution',
        issueDate: new Date('2024-01-15'),
        description: 'Test Description',
        status: 'active',
      });
      await dataSource.getRepository(Certification).save(certification);

      const person = dataSource.getRepository(Person).create({
        fullName: 'Test Person',
        email: 'test@email.com',
        role: 'Estudiante',
        certificationId: certification.id,
      });
      await dataSource.getRepository(Person).save(person);
    });

    afterEach(async () => {
      await dataSource.getRepository(Person).delete({});
      await dataSource.getRepository(Certification).delete({});
    });

    it('debería obtener todas las personas', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/persons')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    it('debería obtener personas por certificación', async () => {
      // Crear certificación y persona
      const certification = dataSource.getRepository(Certification).create({
        title: 'Test Certification',
        institution: 'Test Institution',
        issueDate: new Date('2024-01-15'),
        description: 'Test Description',
        status: 'active',
      });
      const savedCertification = await dataSource.getRepository(Certification).save(certification);

      const person = dataSource.getRepository(Person).create({
        fullName: 'Test Person',
        email: 'test@email.com',
        role: 'Estudiante',
        certificationId: savedCertification.id,
      });
      await dataSource.getRepository(Person).save(person);

      const response = await request(app.getHttpServer())
        .get(`/api/v1/persons/certification/${savedCertification.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.count).toBeGreaterThan(0);
    });
  });
});

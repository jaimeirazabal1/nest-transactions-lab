import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository, QueryRunner } from 'typeorm';
import { BadRequestException } from '@nestjs/common';
import { CertificationService } from './certification.service';
import { Certification } from '../../entities/certification.entity';
import { Person } from '../../entities/person.entity';
import { CreateCertificationWithPersonsDto } from './dto/create-certification-with-persons.dto';

/**
 * Tests para el servicio de certificaciones
 * Demuestran el funcionamiento correcto de las transacciones y rollback automático
 */
describe('CertificationService', () => {
  let service: CertificationService;
  let certificationRepository: Repository<Certification>;
  let personRepository: Repository<Person>;
  let dataSource: DataSource;
  let queryRunner: QueryRunner;

  // Mock del QueryRunner
  const mockQueryRunner = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
    },
  };

  // Mock del DataSource
  const mockDataSource = {
    createQueryRunner: jest.fn(() => mockQueryRunner),
  };

  // Mock de los repositorios
  const mockCertificationRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockPersonRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CertificationService,
        {
          provide: getRepositoryToken(Certification),
          useValue: mockCertificationRepository,
        },
        {
          provide: getRepositoryToken(Person),
          useValue: mockPersonRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<CertificationService>(CertificationService);
    certificationRepository = module.get<Repository<Certification>>(
      getRepositoryToken(Certification),
    );
    personRepository = module.get<Repository<Person>>(getRepositoryToken(Person));
    dataSource = module.get<DataSource>(DataSource);
    queryRunner = mockQueryRunner;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createWithPersons', () => {
    const createCertificationDto: CreateCertificationWithPersonsDto = {
      title: 'Curso de NestJS Avanzado',
      institution: 'Academia Tech',
      issueDate: '2024-01-15',
      description: 'Certificación del curso avanzado',
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
      ],
    };

    it('debería crear una certificación con personas exitosamente', async () => {
      // Arrange
      const mockCertification = { id: 'cert-123', ...createCertificationDto };
      const mockPersons = [
        { id: 'person-1', ...createCertificationDto.persons[0] },
        { id: 'person-2', ...createCertificationDto.persons[1] },
      ];

      queryRunner.manager.create.mockImplementation((entity, data) => {
        if (entity === Certification) {
          return mockCertification;
        }
        return mockPersons[queryRunner.manager.create.mock.calls.length - 2];
      });

      queryRunner.manager.save.mockImplementation((entity, data) => {
        if (entity === Certification) {
          return { ...mockCertification, id: 'cert-123' };
        }
        return mockPersons[queryRunner.manager.save.mock.calls.length - 2];
      });

      queryRunner.manager.findOne.mockResolvedValue(null); // No existe email duplicado

      // Act
      const result = await service.createWithPersons(createCertificationDto);

      // Assert
      expect(queryRunner.connect).toHaveBeenCalled();
      expect(queryRunner.startTransaction).toHaveBeenCalled();
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
      expect(queryRunner.rollbackTransaction).not.toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result.persons).toHaveLength(2);
    });

    it('debería hacer rollback cuando hay un email duplicado', async () => {
      // Arrange
      const mockCertification = { id: 'cert-123', ...createCertificationDto };
      
      queryRunner.manager.create.mockReturnValue(mockCertification);
      queryRunner.manager.save.mockImplementation((entity, data) => {
        if (entity === Certification) {
          return { ...mockCertification, id: 'cert-123' };
        }
        throw new Error('Email duplicado');
      });

      queryRunner.manager.findOne.mockResolvedValue({ email: 'maria@email.com' }); // Email existe

      // Act & Assert
      await expect(service.createWithPersons(createCertificationDto)).rejects.toThrow(
        BadRequestException,
      );

      expect(queryRunner.connect).toHaveBeenCalled();
      expect(queryRunner.startTransaction).toHaveBeenCalled();
      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
      expect(queryRunner.commitTransaction).not.toHaveBeenCalled();
    });
  });

  describe('createWithPersonsAndSimulateError', () => {
    const createCertificationDto: CreateCertificationWithPersonsDto = {
      title: 'Curso de NestJS Avanzado',
      institution: 'Academia Tech',
      issueDate: '2024-01-15',
      description: 'Certificación del curso avanzado',
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

    it('debería hacer rollback cuando falla en la 5ta persona', async () => {
      // Arrange
      const mockCertification = { id: 'cert-123', ...createCertificationDto };
      
      queryRunner.manager.create.mockReturnValue(mockCertification);
      queryRunner.manager.save.mockImplementation((entity, data) => {
        if (entity === Certification) {
          return { ...mockCertification, id: 'cert-123' };
        }
        return { id: 'person-123', ...data };
      });

      queryRunner.manager.findOne.mockResolvedValue(null); // No hay emails duplicados

      // Act & Assert
      await expect(
        service.createWithPersonsAndSimulateError(createCertificationDto, 4),
      ).rejects.toThrow(BadRequestException);

      expect(queryRunner.connect).toHaveBeenCalled();
      expect(queryRunner.startTransaction).toHaveBeenCalled();
      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
      expect(queryRunner.commitTransaction).not.toHaveBeenCalled();
    });

    it('debería completar exitosamente cuando no hay error simulado', async () => {
      // Arrange
      const mockCertification = { id: 'cert-123', ...createCertificationDto };
      
      queryRunner.manager.create.mockReturnValue(mockCertification);
      queryRunner.manager.save.mockImplementation((entity, data) => {
        if (entity === Certification) {
          return { ...mockCertification, id: 'cert-123' };
        }
        return { id: 'person-123', ...data };
      });

      queryRunner.manager.findOne.mockResolvedValue(null); // No hay emails duplicados

      // Act
      const result = await service.createWithPersonsAndSimulateError(
        createCertificationDto,
        10, // Índice fuera del rango, no debería fallar
      );

      // Assert
      expect(queryRunner.connect).toHaveBeenCalled();
      expect(queryRunner.startTransaction).toHaveBeenCalled();
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
      expect(queryRunner.rollbackTransaction).not.toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });
});

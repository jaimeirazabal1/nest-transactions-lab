# 🎓 Laboratorio de Transacciones NestJS - Sistema de Certificaciones

## 📋 Descripción

Este laboratorio demuestra el manejo completo de **transacciones de base de datos** usando **NestJS** y **TypeORM** con PostgreSQL. El proyecto simula un sistema real de emisión de certificados donde es **CRÍTICO** que si falla la inserción de alguna persona, se cancele toda la operación.

### 🎯 Objetivos del Laboratorio

- ✅ Demostrar transacciones ACID con QueryRunner
- ✅ Implementar rollback automático en caso de errores
- ✅ Validar atomicidad de operaciones complejas
- ✅ Probar escenarios exitosos y de fallo
- ✅ Crear tests que verifiquen el comportamiento

## 🏗️ Arquitectura del Sistema

### Entidades Principales

1. **Certification**: Representa una certificación emitida
2. **Person**: Representa una persona que participa en una certificación

### Relaciones

- Una `Certification` puede tener múltiples `Person`
- Una `Person` pertenece a una sola `Certification`
- Relación **Uno a Muchos** con eliminación en cascada

## 🚀 Inicio Rápido

### Prerrequisitos

- Docker y Docker Compose
- Node.js 18+ (opcional, si ejecutas sin Docker)
- npm o yarn

### Instalación y Ejecución

```bash
# 1. Clonar el repositorio
git clone https://github.com/jaimeirazabal1/nest-transactions-lab
cd nest-transactions-lab

# 2. Instalar dependencias
npm install

# 3. Ejecutar con Docker Compose
docker-compose up -d

# 4. Ejecutar seeds (datos iniciales)
npm run seed:run

# 5. La aplicación estará disponible en:
# http://localhost:3000
```

### Sin Docker

```bash
# 1. Instalar PostgreSQL localmente
# 2. Crear base de datos: certifications_db
# 3. Configurar variables de entorno en .env
# 4. npm run start:dev
```

## 🧪 Escenarios de Prueba

### Escenario 1: Caso Exitoso ✅

Crear una certificación con 5 participantes exitosamente:

```bash
curl -X POST http://localhost:3000/api/v1/certifications \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Curso de NestJS Avanzado",
    "institution": "Academia Tech",
    "issueDate": "2024-01-15",
    "description": "Certificación del curso avanzado de NestJS",
    "persons": [
      {
        "fullName": "María González",
        "email": "maria@email.com",
        "role": "Estudiante"
      },
      {
        "fullName": "Carlos López",
        "email": "carlos@email.com",
        "role": "Estudiante"
      },
      {
        "fullName": "Ana Martínez",
        "email": "ana@email.com",
        "role": "Instructor"
      },
      {
        "fullName": "Pedro Sánchez",
        "email": "pedro@email.com",
        "role": "Estudiante"
      },
      {
        "fullName": "Laura Díaz",
        "email": "laura@email.com",
        "role": "Estudiante"
      }
    ]
  }'
```

**Resultado esperado:**
- ✅ Código de respuesta: 201
- ✅ Certificación creada con ID único
- ✅ 5 personas creadas y asociadas
- ✅ Todos los datos guardados en la base de datos

### Escenario 2: Caso de Error ❌

Simular fallo en la 5ta persona para demostrar rollback:

```bash
curl -X POST http://localhost:3000/api/v1/certifications/simulate-error \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Curso de NestJS Avanzado",
    "institution": "Academia Tech",
    "issueDate": "2024-01-15",
    "description": "Certificación del curso avanzado de NestJS",
    "persons": [
      {
        "fullName": "María González",
        "email": "maria@email.com",
        "role": "Estudiante"
      },
      {
        "fullName": "Carlos López",
        "email": "carlos@email.com",
        "role": "Estudiante"
      },
      {
        "fullName": "Ana Martínez",
        "email": "ana@email.com",
        "role": "Instructor"
      },
      {
        "fullName": "Pedro Sánchez",
        "email": "pedro@email.com",
        "role": "Estudiante"
      },
      {
        "fullName": "Laura Díaz",
        "email": "laura@email.com",
        "role": "Estudiante"
      }
    ]
  }'
```

**Resultado esperado:**
- ❌ Código de respuesta: 400
- ❌ Mensaje de error simulado
- ❌ **Ningún dato guardado** (rollback automático)
- ❌ Base de datos permanece limpia

## 📊 Endpoints de la API

### Certificaciones

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/v1/certifications` | Crear certificación con personas (caso exitoso) |
| `POST` | `/api/v1/certifications/simulate-error` | Crear certificación simulando error (demostrar rollback) |
| `GET` | `/api/v1/certifications` | Obtener todas las certificaciones |
| `GET` | `/api/v1/certifications/:id` | Obtener certificación específica |

### Personas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/v1/persons` | Obtener todas las personas |
| `GET` | `/api/v1/persons/:id` | Obtener persona específica |
| `GET` | `/api/v1/persons/certification/:id` | Obtener personas de una certificación |

## 🔍 Consultas Útiles

### Verificar que no hay datos (después del rollback)

```bash
# Verificar certificaciones
curl http://localhost:3000/api/v1/certifications

# Verificar personas
curl http://localhost:3000/api/v1/persons
```

### Verificar datos después de creación exitosa

```bash
# Obtener todas las certificaciones
curl http://localhost:3000/api/v1/certifications

# Obtener una certificación específica (reemplaza :id)
curl http://localhost:3000/api/v1/certifications/:id
```

## 🧪 Ejecutar Tests

```bash
# Tests unitarios
npm run test

# Tests e2e
npm run test:e2e

# Tests con coverage
npm run test:cov

# Tests en modo watch
npm run test:watch
```

## 🔧 Comandos de Desarrollo

```bash
# Desarrollo en modo watch
npm run start:dev

# Compilar aplicación
npm run build

# Ejecutar aplicación compilada
npm run start:prod

# Ejecutar seeds
npm run seed:run

# Ejecutar seeds con limpieza
npm run seed:run -- --clean

# Linting
npm run lint

# Formatear código
npm run format
```

## 🐳 Docker

### Comandos Docker

```bash
# Construir imagen
docker-compose build

# Ejecutar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f app

# Detener servicios
docker-compose down

# Limpiar volúmenes (¡CUIDADO! Borra la base de datos)
docker-compose down -v
```

### Servicios Docker

- **PostgreSQL**: Puerto 5432
- **NestJS App**: Puerto 3000

## 📁 Estructura del Proyecto

```
nest-transactions-lab/
├── src/
│   ├── config/
│   │   └── typeorm.config.ts          # Configuración TypeORM
│   ├── entities/
│   │   ├── certification.entity.ts    # Entidad Certification
│   │   └── person.entity.ts           # Entidad Person
│   ├── modules/
│   │   ├── certification/
│   │   │   ├── dto/                   # Data Transfer Objects
│   │   │   ├── certification.controller.ts
│   │   │   ├── certification.service.ts  # Lógica de transacciones
│   │   │   └── certification.module.ts
│   │   └── person/
│   │       ├── dto/
│   │       ├── person.controller.ts
│   │       ├── person.service.ts
│   │       └── person.module.ts
│   ├── database/
│   │   └── seeds/                     # Datos iniciales
│   ├── app.module.ts                  # Módulo principal
│   └── main.ts                        # Punto de entrada
├── test/
│   └── app.e2e-spec.ts               # Tests end-to-end
├── docker-compose.yml                # Configuración Docker
├── Dockerfile                        # Imagen Docker
└── README.md                         # Este archivo
```

## 🔄 Flujo de Transacciones

### Proceso Exitoso

1. **Inicio**: Crear QueryRunner y conectar
2. **Transacción**: Iniciar transacción
3. **Certificación**: Crear y guardar certificación
4. **Personas**: Iterar y crear cada persona
5. **Validación**: Verificar emails únicos
6. **Commit**: Confirmar transacción
7. **Limpieza**: Liberar conexión

### Proceso con Error

1. **Inicio**: Crear QueryRunner y conectar
2. **Transacción**: Iniciar transacción
3. **Certificación**: Crear y guardar certificación
4. **Personas**: Iterar hasta encontrar error
5. **Error**: Lanzar excepción
6. **Rollback**: Cancelar transacción automáticamente
7. **Limpieza**: Liberar conexión

## 🛠️ Tecnologías Utilizadas

- **NestJS**: Framework Node.js
- **TypeORM**: ORM para TypeScript
- **PostgreSQL**: Base de datos relacional
- **Docker**: Containerización
- **Jest**: Framework de testing
- **class-validator**: Validación de DTOs
- **class-transformer**: Transformación de datos

## 📚 Conceptos Demostrados

### Transacciones ACID

- **Atomicidad**: Todo o nada
- **Consistencia**: Datos válidos siempre
- **Aislamiento**: Operaciones independientes
- **Durabilidad**: Cambios permanentes

### QueryRunner

- Manejo manual de conexiones
- Control granular de transacciones
- Rollback automático en errores
- Liberación de recursos

### Validaciones

- DTOs con class-validator
- Validación de emails únicos
- Transformación de tipos
- Manejo de errores

## 🚨 Puntos Críticos

1. **Atomicidad**: Si falla cualquier persona, se cancela toda la operación
2. **Emails únicos**: No se permiten emails duplicados
3. **Rollback automático**: En caso de error, ningún dato se guarda
4. **Liberación de recursos**: QueryRunner siempre se libera

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es para fines educativos y de laboratorio.

## 🆘 Soporte

Si tienes problemas:

1. Verifica que Docker esté ejecutándose
2. Revisa los logs: `docker-compose logs -f`
3. Verifica la conectividad a PostgreSQL
4. Ejecuta los tests para validar funcionalidad

---

**¡Disfruta aprendiendo sobre transacciones con NestJS! 🎉**

# 🔄 Diagrama del Flujo de Transacciones

## Flujo Exitoso ✅

```mermaid
flowchart TD
    A[🚀 Inicio: Crear QueryRunner] --> B[🔌 Conectar a Base de Datos]
    B --> C[🔄 Iniciar Transacción]
    C --> D[📋 Crear Certificación]
    D --> E[💾 Guardar Certificación]
    E --> F[👥 Iterar Personas]
    F --> G{¿Email único?}
    G -->|Sí| H[👤 Crear Persona]
    G -->|No| I[❌ Error: Email duplicado]
    H --> J{¿Más personas?}
    J -->|Sí| F
    J -->|No| K[✅ Commit Transacción]
    K --> L[🔌 Liberar Conexión]
    L --> M[🎉 Éxito: Todos los datos guardados]
    
    I --> N[🔄 Rollback Transacción]
    N --> O[🔌 Liberar Conexión]
    O --> P[❌ Error: Ningún dato guardado]
```

## Flujo con Error Simulado ❌

```mermaid
flowchart TD
    A[🚀 Inicio: Crear QueryRunner] --> B[🔌 Conectar a Base de Datos]
    B --> C[🔄 Iniciar Transacción]
    C --> D[📋 Crear Certificación]
    D --> E[💾 Guardar Certificación]
    E --> F[👥 Iterar Personas]
    F --> G{¿Es persona #5?}
    G -->|No| H[👤 Crear Persona]
    G -->|Sí| I[💥 Error Simulado]
    H --> J{¿Más personas?}
    J -->|Sí| F
    J -->|No| K[✅ Commit Transacción]
    K --> L[🔌 Liberar Conexión]
    L --> M[🎉 Éxito: Todos los datos guardados]
    
    I --> N[🔄 Rollback Automático]
    N --> O[🔌 Liberar Conexión]
    O --> P[❌ Error: Ningún dato guardado]
```

## Arquitectura del Sistema

```mermaid
erDiagram
    CERTIFICATION {
        uuid id PK
        varchar title
        varchar institution
        date issueDate
        text description
        varchar status
        timestamp createdAt
        timestamp updatedAt
    }
    
    PERSON {
        uuid id PK
        varchar fullName
        varchar email UK
        varchar role
        uuid certificationId FK
        timestamp createdAt
        timestamp updatedAt
    }
    
    CERTIFICATION ||--o{ PERSON : "tiene"
```

## Estados de la Transacción

```mermaid
stateDiagram-v2
    [*] --> Iniciando
    Iniciando --> Conectando: Crear QueryRunner
    Conectando --> TransaccionIniciada: Conectar exitoso
    TransaccionIniciada --> CreandoCertificacion: Iniciar transacción
    CreandoCertificacion --> CreandoPersonas: Certificación guardada
    CreandoPersonas --> ValidandoEmail: Crear persona
    ValidandoEmail --> CreandoPersonas: Email único
    ValidandoEmail --> Error: Email duplicado
    CreandoPersonas --> Commit: Todas las personas creadas
    Commit --> Exito: Commit exitoso
    Error --> Rollback: Error detectado
    Rollback --> Falla: Rollback completado
    Exito --> [*]
    Falla --> [*]
```

## Comparación: Con vs Sin Transacciones

### Sin Transacciones (Problemático) ❌

```mermaid
flowchart TD
    A[Crear Certificación] --> B[Guardar Certificación]
    B --> C[Crear Persona 1]
    C --> D[Crear Persona 2]
    D --> E[Crear Persona 3]
    E --> F[Crear Persona 4]
    F --> G[Error en Persona 5]
    G --> H[❌ Certificación huérfana en BD]
    H --> I[❌ Datos inconsistentes]
```

### Con Transacciones (Correcto) ✅

```mermaid
flowchart TD
    A[Iniciar Transacción] --> B[Crear Certificación]
    B --> C[Crear Persona 1]
    C --> D[Crear Persona 2]
    D --> E[Crear Persona 3]
    E --> F[Crear Persona 4]
    F --> G[Error en Persona 5]
    G --> H[Rollback Automático]
    H --> I[✅ Ningún dato guardado]
    I --> J[✅ Estado consistente]
```

## Componentes del Sistema

```mermaid
graph TB
    subgraph "Frontend/Cliente"
        A[HTTP Request]
    end
    
    subgraph "NestJS Application"
        B[CertificationController]
        C[CertificationService]
        D[DTOs & Validation]
    end
    
    subgraph "TypeORM Layer"
        E[QueryRunner]
        F[Entity Manager]
        G[Transaction Management]
    end
    
    subgraph "PostgreSQL Database"
        H[certifications table]
        I[persons table]
    end
    
    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    F --> G
    G --> H
    G --> I
```

## Flujo de Datos en el Laboratorio

```mermaid
sequenceDiagram
    participant Client
    participant Controller
    participant Service
    participant QueryRunner
    participant Database
    
    Client->>Controller: POST /certifications
    Controller->>Service: createWithPersons(data)
    Service->>QueryRunner: createQueryRunner()
    QueryRunner->>Database: connect()
    QueryRunner->>Database: startTransaction()
    
    Service->>QueryRunner: save(Certification)
    QueryRunner->>Database: INSERT certification
    
    loop Para cada persona
        Service->>QueryRunner: save(Person)
        QueryRunner->>Database: INSERT person
    end
    
    Service->>QueryRunner: commitTransaction()
    QueryRunner->>Database: COMMIT
    QueryRunner->>Database: release()
    Service-->>Controller: return result
    Controller-->>Client: 201 Created
```

## Manejo de Errores

```mermaid
sequenceDiagram
    participant Service
    participant QueryRunner
    participant Database
    
    Service->>QueryRunner: startTransaction()
    QueryRunner->>Database: BEGIN
    
    Service->>QueryRunner: save(Certification)
    QueryRunner->>Database: INSERT certification
    
    Service->>QueryRunner: save(Person1)
    QueryRunner->>Database: INSERT person1
    
    Service->>QueryRunner: save(Person2)
    QueryRunner->>Database: INSERT person2
    
    Service->>QueryRunner: save(Person3) [ERROR]
    QueryRunner->>Database: ❌ ERROR
    
    Service->>QueryRunner: rollbackTransaction()
    QueryRunner->>Database: ROLLBACK
    
    Service->>QueryRunner: release()
    QueryRunner->>Database: CLOSE CONNECTION
```

---

## 📝 Notas Importantes

1. **Atomicidad**: Todo el proceso es una sola unidad de trabajo
2. **Consistencia**: Los datos siempre están en un estado válido
3. **Aislamiento**: Las transacciones no interfieren entre sí
4. **Durabilidad**: Los cambios se mantienen después de commit

### Puntos Críticos del Laboratorio

- ✅ **QueryRunner**: Manejo manual de conexiones y transacciones
- ✅ **Rollback automático**: En caso de cualquier error
- ✅ **Validaciones**: Emails únicos y datos requeridos
- ✅ **Liberación de recursos**: Siempre se libera la conexión
- ✅ **Logging**: Trazabilidad completa del proceso

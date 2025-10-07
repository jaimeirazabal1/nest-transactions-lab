-- Script de inicialización de PostgreSQL
-- Este script se ejecuta automáticamente al crear el contenedor

-- Crear la base de datos si no existe
-- (PostgreSQL ya crea la base de datos por las variables de entorno)

-- Crear extensiones útiles
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Configurar timezone
SET timezone = 'UTC';

-- Mensaje de confirmación
SELECT 'Base de datos inicializada correctamente' as status;

import { DataSource } from 'typeorm';
import { typeOrmConfig } from '../../config/typeorm.config';
import { CertificationSeed } from './certification.seed';

/**
 * Script principal para ejecutar todos los seeds
 * Ejecuta los seeds de datos iniciales para el laboratorio
 */
async function runSeeds() {
  // Forzamos synchronize=true para crear el esquema al ejecutar seeds
  const dataSource = new DataSource({
    ...typeOrmConfig.options,
    synchronize: true,
    logging: true,
  });
  
  try {
    await dataSource.initialize();
    console.log('🔌 Conexión a la base de datos establecida');

    const certificationSeed = new CertificationSeed(dataSource);

    // Limpiar datos existentes (opcional)
    const shouldClean = process.argv.includes('--clean');
    if (shouldClean) {
      await certificationSeed.clean();
    }

    // Ejecutar seeds
    await certificationSeed.run();

    console.log('🎉 Todos los seeds ejecutados exitosamente');

  } catch (error) {
    console.error('❌ Error ejecutando seeds:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
    console.log('🔌 Conexión cerrada');
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  runSeeds();
}

export { runSeeds };

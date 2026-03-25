const fs = require('fs');
const path = require('path');

/**
 * Database Initialization Module
 * Ejecuta el schema al conectarse si las tablas no existen
 * - Si las tablas ya existen, no hace nada (idempotente)
 * - Si no existen, las crea
 */

async function initializeDatabase(pool) {
  try {
    console.log('[DB] Verificando si las tablas existen...');

    // Verificar si la tabla loan_books existe
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'loan_books'
      );
    `);

    const tableExists = result.rows[0].exists;

    if (tableExists) {
      console.log('[DB] ✓ Tablas ya existen. Salteando inicialización.');
      return true;
    }

    console.log('[DB] Tablas no encontradas. Creando schema...');

    // Leer y ejecutar el schema
    const schemaPath = path.join(__dirname, '..', '..', 'db', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Ejecutar el schema
    await pool.query(schema);

    console.log('[DB] ✓ Schema ejecutado correctamente');
    console.log('[DB] ✓ Tablas creadas: loan_books, dept_reader');
    console.log('[DB] ✓ Índices creados para optimizar consultas');

    return true;
  } catch (error) {
    console.error('[DB] ✗ Error inicializando base de datos:', error.message);
    throw error;
  }
}

module.exports = { initializeDatabase };

const { MongoClient } = require('mongodb');
const dns = require('dns');
require('dotenv').config();

// Configurar Google DNS
dns.setServers(['8.8.8.8', '8.8.4.4']);

let db = null;
let client = null;

async function connectDB() {
  try {
    if (db) {
      console.log('✓ Usando conexión existente a MongoDB');
      return db;
    }

    const uri = process.env.MONGODB_URI;
    const dbName = process.env.DB_NAME || 'Finanzas';

    if (!uri) {
      throw new Error('MONGODB_URI no está configurado en .env');
    }

    console.log('Conectando a MongoDB Atlas...');
    client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    await client.connect();
    
    db = client.db(dbName);
    console.log(`✓ Conectado a MongoDB Atlas - Base de datos: ${dbName}`);
    
    return db;
  } catch (error) {
    console.error('✗ Error conectando a MongoDB:', error.message);
    throw error;
  }
}

async function closeDB() {
  if (client) {
    await client.close();
    db = null;
    client = null;
    console.log('✓ Conexión a MongoDB cerrada');
  }
}

function getDB() {
  if (!db) {
    throw new Error('Base de datos no conectada. Llama a connectDB() primero.');
  }
  return db;
}

module.exports = {
  connectDB,
  closeDB,
  getDB
};

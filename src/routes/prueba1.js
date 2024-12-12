const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Rutas principales y secundarias para los archivos JSON
const PRIMARY_PATH = path.join(__dirname, '../clientes.json');
const SECONDARY_PATH = path.join(__dirname, '../testCarpetaSecundaria/clientes.json');

// Función para verificar y usar el archivo principal o secundario
const getValidFilePath = async () => {
  return new Promise((resolve) => {
    fs.access(PRIMARY_PATH, fs.constants.R_OK | fs.constants.W_OK, (err) => {
      if (err) {
        console.warn('Archivo principal no disponible. Usando ruta secundaria.');
        resolve(SECONDARY_PATH);
      } else {
        resolve(PRIMARY_PATH);
      }
    });
  });
};

// Función para leer el archivo de clientes
const readClientesFile = async () => {
  const filePath = await getValidFilePath();
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf-8', (err, data) => {
      if (err) {
        return reject(`Error al leer el archivo de clientes en ${filePath}`);
      }
      resolve(data ? JSON.parse(data) : []);
    });
  });
};

// Función para escribir en el archivo de clientes
const writeClientesFile = async (clientes) => {
  const filePath = await getValidFilePath();
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, JSON.stringify(clientes, null, 2), 'utf-8', (err) => {
      if (err) {
        return reject(`Error al guardar los datos de los clientes en ${filePath}`);
      }
      resolve();
    });
  });
};

// Ruta GET para obtener todos los clientes
router.get('/test', async (req, res) => {
  try {
    const clientes = await readClientesFile();
    res.status(200).json(clientes); // Responde con la lista de clientes
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ocurrió un error al obtener los clientes' });
  }
});

module.exports = router;
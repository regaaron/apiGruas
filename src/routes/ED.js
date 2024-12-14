const express = require('express');
const { encryptFile, decryptFile } = require('../encripFiles/encrypService');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Ruta para encriptar `clientes.json`
router.post('/encrypt', async (req, res) => {
  const inputFileName = 'clientes.json';
  const outputFileName = 'clientes.encrypted';

  try {
    const message = await encryptFile(`../jsonFiles/${inputFileName}`, `../encripFiles/${outputFileName}`);
    res.json({ message });
  } catch (err) {
    res.status(500).json({ error: 'Error encriptando el archivo.', details: err.message });
  }
});

// Ruta para desencriptar `clientes.encrypted`
router.post('/decrypt', async (req, res) => {
  const inputFileName = 'conductores.encrypted';
  const outputFileName = 'conductores.json';

  try {
    const message = await decryptFile(`../encripFiles/${inputFileName}`, `../encripFiles/${outputFileName}`);
    res.json({ message });
  } catch (err) {
    res.status(500).json({ error: 'Error desencriptando el archivo.', details: err.message });
  }
});

// Ruta para obtener datos de clientes
router.get('/test', (req, res) => {
  const filePath = path.resolve(__dirname, '../encripFiles/clientes.json');

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Archivo no encontrado. Asegúrate de desencriptarlo primero.' });
  }

  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Error leyendo el archivo.', details: err.message });
  }
});

module.exports = router;

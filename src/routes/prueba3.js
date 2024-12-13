const express = require('express');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process'); // Para ejecutar comandos en la terminal
const router = express.Router();

const ENCRYPTED_FILE_PATH = path.join(__dirname, '../encripFiles/clientes.cfr');
const DECRYPTED_FILE_PATH = path.join(__dirname, '../encripFiles/clientes_temp.json');
const SECRET_KEY = 'test2'; // La clave que usas para encriptar/desencriptar
const DEEP = 3; // La profundidad de encriptación usada

// Función para ejecutar comandos de terminal (usando cfrf.js)
const runCommand = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        return reject(`Error ejecutando comando: ${stderr || error.message}`);
      }
      resolve(stdout);
    });
  });
};

// Ruta GET para obtener los clientes desencriptados
router.get('/test3', async (req, res) => {
  try {
    // Desencriptar el archivo usando cfrf.js
    const decryptCommand = `node cfrf.js ${ENCRYPTED_FILE_PATH} des ${SECRET_KEY} ${DEEP} ${DECRYPTED_FILE_PATH}`;
    await runCommand(decryptCommand);

    // Leer los datos desencriptados
    const data = fs.readFileSync(DECRYPTED_FILE_PATH, 'utf-8');
    const clientes = JSON.parse(data);

    // Eliminar el archivo temporal desencriptado
    fs.unlinkSync(DECRYPTED_FILE_PATH);

    // Responder con los datos
    res.status(200).json(clientes);
  } catch (error) {
    console.error('Error en la operación:', error);

    // Intentar eliminar el archivo temporal si existe
    if (fs.existsSync(DECRYPTED_FILE_PATH)) {
      fs.unlinkSync(DECRYPTED_FILE_PATH);
    }

    res.status(500).json({ error: 'Ocurrió un error al obtener los clientes' });
  }
});

module.exports = router;

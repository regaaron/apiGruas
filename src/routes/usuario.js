const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const FILE_PATH = path.join(__dirname, '../usuario.json');

// Función para leer el archivo de usuarios
const readUsuariosFile = () => {
  return new Promise((resolve, reject) => {
    fs.readFile(FILE_PATH, 'utf-8', (err, data) => {
      if (err) {
        return reject('Error al leer el archivo de usuarios');
      }
      resolve(data ? JSON.parse(data) : []);
    });
  });
};

// Endpoint de login
router.post('/login', async (req, res) => {
  try {
    const { username } = req.body; // Obtenemos el username del body

    // Leer los usuarios desde el archivo
    const usuarios = await readUsuariosFile();

    // Buscar el usuario por su username
    const usuario = usuarios.find(u => u.username === username);

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Enviar respuesta exitosa
    res.status(200).json({
      message: 'Inicio de sesión exitoso',
      usuario: { id: usuario.id, username: usuario.username }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ocurrió un error durante el inicio de sesión' });
  }
});

module.exports = router;

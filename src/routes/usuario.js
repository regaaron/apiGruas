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

// Endpoint de login// Endpoint de login
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Leer los usuarios desde el archivo
  fs.readFile(FILE_PATH, 'utf-8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Error al leer el archivo de usuarios' });
    }

    const usuarios = JSON.parse(data);

    // Validar las credenciales
    const usuario = usuarios.find(user => user.username === username && user.password === password);
    if (usuario) {
      return res.status(200).json({ message: 'Inicio de sesión exitoso', usuario });
    } else {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }
  });
});

module.exports = router;

const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const encryptionService = require('../encripFiles/encrypService'); // Ajusta según tu estructura de carpetas

const ENCRYPTED_FILE_PATH = path.join(__dirname, '../encripFiles/usuario.encrypted');
const TEMP_DECRYPTED_FILE_PATH = path.join(__dirname, '../encripFiles/usuario.json'); // Archivo temporal desencriptado

// Función para leer el archivo de usuarios desencriptándolo
const readUsuariosFile = async () => {
  try {
    // Desencriptar el archivo
    await encryptionService.decryptFile(ENCRYPTED_FILE_PATH, TEMP_DECRYPTED_FILE_PATH);

    // Leer el archivo desencriptado
    const data = fs.readFileSync(TEMP_DECRYPTED_FILE_PATH, 'utf-8');
    const usuarios = data ? JSON.parse(data) : [];

    // Eliminar el archivo temporal desencriptado
    fs.unlinkSync(TEMP_DECRYPTED_FILE_PATH);

    return usuarios;
  } catch (error) {
    console.error('Error al desencriptar o leer el archivo:', error);
    throw new Error('Error al procesar los datos de usuarios');
  }
};

// Función para escribir en el archivo de usuarios encriptado
const writeUsuariosFile = async (usuarios) => {
  try {
    // Crear el archivo temporal desencriptado
    fs.writeFileSync(TEMP_DECRYPTED_FILE_PATH, JSON.stringify(usuarios, null, 2), 'utf-8');

    // Encriptar el archivo temporal y guardar en la ubicación encriptada
    await encryptionService.encryptFile(TEMP_DECRYPTED_FILE_PATH, ENCRYPTED_FILE_PATH);

    // Eliminar el archivo temporal desencriptado
    fs.unlinkSync(TEMP_DECRYPTED_FILE_PATH);
  } catch (error) {
    console.error('Error al escribir los datos de usuarios:', error);
    throw new Error('Error al guardar los datos de usuarios');
  }
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

const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const encryptionService = require('../encripFiles/encrypService'); // Ajusta según tu estructura de carpetas

const ENCRYPTED_FILE_PATH = path.join(__dirname, '../encripFiles/viajes.encrypted');
const TEMP_DECRYPTED_FILE_PATH = path.join(__dirname, '../encripFiles/viajes.json'); // Archivo temporal desencriptado

// Función para leer el archivo de viajes desencriptándolo
const readViajesFile = async () => {
  try {
    // Desencriptar el archivo
    await encryptionService.decryptFile(ENCRYPTED_FILE_PATH, TEMP_DECRYPTED_FILE_PATH);

    // Leer el archivo desencriptado
    const data = fs.readFileSync(TEMP_DECRYPTED_FILE_PATH, 'utf-8');
    const viajes = data ? JSON.parse(data) : [];

    // Eliminar el archivo temporal desencriptado
    fs.unlinkSync(TEMP_DECRYPTED_FILE_PATH);

    return viajes;
  } catch (error) {
    console.error('Error al desencriptar o leer el archivo:', error);
    throw new Error('Error al procesar los datos de viajes');
  }
};

// Función para escribir en el archivo de viajes encriptado
const writeViajesFile = async (viajes) => {
  try {
    // Crear el archivo temporal desencriptado
    fs.writeFileSync(TEMP_DECRYPTED_FILE_PATH, JSON.stringify(viajes, null, 2), 'utf-8');

    // Encriptar el archivo temporal y guardar en la ubicación encriptada
    await encryptionService.encryptFile(TEMP_DECRYPTED_FILE_PATH, ENCRYPTED_FILE_PATH);

    // Eliminar el archivo temporal desencriptado
    fs.unlinkSync(TEMP_DECRYPTED_FILE_PATH);
  } catch (error) {
    console.error('Error al escribir los datos de viajes:', error);
    throw new Error('Error al guardar los datos de viajes');
  }
};

// Ruta POST para registrar un viaje
router.post('/Registrar-Viajes', async (req, res) => {
  try {
    const nuevoViaje = req.body;

    // Leer los viajes desde el archivo
    const viajes = await readViajesFile();

    // Generar un nuevo ID para el viaje
    const nuevoId = viajes.length > 0 
      ? viajes[viajes.length - 1].id_viaje + 1
      : 1;

    // Asignar el nuevo ID al viaje
    nuevoViaje.id_viaje = nuevoId;

    // Agregar el nuevo viaje al array
    viajes.push(nuevoViaje);

    // Escribir los datos actualizados en el archivo
    await writeViajesFile(viajes);

    // Enviar una respuesta exitosa
    res.status(201).json({
      message: 'Viaje registrado exitosamente',
      viaje: nuevoViaje,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ocurrió un error al registrar el viaje' });
  }
});

// Ruta GET para obtener todos los viajes
router.get('/ver-viajes', async (req, res) => {
  try {
    const viajes = await readViajesFile();
    res.status(200).json(viajes); // Responde con la lista de viajes
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ocurrió un error al obtener los viajes' });
  }
});

// Ruta PUT para actualizar un viaje
router.put('/Actualizar-Viajes', async (req, res) => {
  try {
    const { id_conductor, latitud_conductor, longitud_conductor, id_cliente } = req.body;

    // Leer los viajes desde el archivo
    const viajes = await readViajesFile();

    // Buscar el viaje donde el id_conductor es 0 y el id_cliente coincide
    const viajeIndex = viajes.findIndex(viaje =>
      viaje.id_conductor === 0 && viaje.id_cliente === parseInt(id_cliente)
    );

    if (viajeIndex === -1) {
      return res.status(404).json({ error: 'Viaje no encontrado' });
    }

    // Actualizar los valores del viaje
    viajes[viajeIndex].id_conductor = id_conductor;
    viajes[viajeIndex].latitud_conductor = latitud_conductor;
    viajes[viajeIndex].longitud_conductor = longitud_conductor;

    // Guardar los cambios en el archivo
    await writeViajesFile(viajes);

    res.status(200).json({ message: 'Viaje actualizado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ocurrió un error al actualizar el viaje' });
  }
});

module.exports = router;

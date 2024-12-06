const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Ruta del archivo JSON donde se guardan las ubicaciones de los conductores
const FILE_PATH = path.join(__dirname, '../ubicacionesConductores.json');

// Función para leer el archivo de ubicaciones
const readUbicaciones = () => {
  return new Promise((resolve, reject) => {
    fs.readFile(FILE_PATH, 'utf-8', (err, data) => {
      if (err) {
        return reject('Error al leer el archivo de ubicaciones');
      }
      resolve(data ? JSON.parse(data) : []);
    });
  });
};

// Función para escribir en el archivo de ubicaciones
const writeUbicaciones = (ubicaciones) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(FILE_PATH, JSON.stringify(ubicaciones, null, 2), 'utf-8', (err) => {
      if (err) {
        return reject('Error al guardar los datos de ubicaciones');
      }
      resolve();
    });
  });
};

// Ruta GET para obtener la lista de ubicaciones de los conductores
router.get('/ver-ubicaciones', async (req, res) => {
  try {
    const ubicaciones = await readUbicaciones();
    res.status(200).json(ubicaciones); // Responde con la lista de ubicaciones
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ocurrió un error al obtener las ubicaciones' });
  }
});

// Ruta POST para registrar una nueva ubicación de un conductor
router.post('/registrar-ubicacion', async (req, res) => {
  try {
    const nuevaUbicacion = req.body;

    // Leer las ubicaciones desde el archivo
    const ubicaciones = await readUbicaciones();

    // Agregar la nueva ubicación al array
    ubicaciones.push(nuevaUbicacion);

    // Escribir los datos actualizados en el archivo
    await writeUbicaciones(ubicaciones);

    // Enviar una respuesta exitosa
    res.status(201).json({
      message: 'Ubicación registrada exitosamente',
      ubicacion: nuevaUbicacion,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ocurrió un error al registrar la ubicación' });
  }
});

module.exports = router;

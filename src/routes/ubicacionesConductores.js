const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const FILE_PATH = path.join(__dirname, '../conductores.json');

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

router.get('/ver-ubicaciones', async (req, res) => {
  try {
    const ubicaciones = await readUbicaciones();
    // Filtrar solo ubicaciones activas
    const ubicacionesActivas = ubicaciones.filter(conductor => conductor.ubicacion.activo);
    res.status(200).json(ubicacionesActivas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ocurrió un error al obtener las ubicaciones' });
  }
});

router.post('/registrar-ubicacion', async (req, res) => {
  try {
    const nuevaUbicacion = req.body;

    const ubicaciones = await readUbicaciones();

    // Agregar la nueva ubicación al array
    ubicaciones.push(nuevaUbicacion);

    await writeUbicaciones(ubicaciones);

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

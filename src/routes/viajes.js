const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const FILE_PATH = path.join(__dirname, '../viajes.json');

// Función para leer el archivo de viajes
const readViajesFile = () => {
  return new Promise((resolve, reject) => {
    fs.readFile(FILE_PATH, 'utf-8', (err, data) => {
      if (err) {
        return reject('Error al leer el archivo de viajes');
      }
      resolve(data ? JSON.parse(data) : []);
    });
  });
};

// Función para escribir en el archivo de viajes  
const writeViajesFile = (viajes) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(FILE_PATH, JSON.stringify(viajes, null, 2), 'utf-8', (err) => {
      if (err) {
        return reject('Error al guardar los datos de los viajes');
      }
      resolve();
    });
  });
};

// Función para actualizar el archivo de viajes
router.put('/Actualizar-Viajes', async (req, res) => {
  try {
    const { id_conductor, latitud_conductor, longitud_conductor, id_cliente } = req.body;

    // Leer el archivo de viajes
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

    // Escribir los cambios en el archivo de viajes
    await writeViajesFile(viajes);

    res.status(200).json({ message: 'Viaje actualizado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ocurrió un error al actualizar el viaje' });
  }
});


// Ruta POST para registrar un viajes
router.post('/Registrar-Viajes', async (req, res) => {
  try {
    const nuevoviajes = req.body;

    // Leer los viajes desde el archivo
    const viajes = await readViajesFile();

    // Generar un nuevo ID para el cliente
    const nuevoId = viajes.length > 0 
      ? viajes[viajes.length - 1].id_viaje + 1
      : 1;

    // Asignar el nuevo ID al conductor
    nuevoviajes.id_viaje = nuevoId;

    // Agregar el nuevo conductor al array
    viajes.push(nuevoviajes);

    // Escribir los datos actualizados en el archivo
    await writeViajesFile(viajes);

    // Enviar una respuesta exitosa
    res.status(201).json({
      message: 'viajes registrado exitosamente',
      viajes: nuevoviajes
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ocurrió un error al registrar el viajes' });
  }
});

// Ruta GET para obtener todos los viajes
router.get('/ver-viajes', async (req, res) => {
    try {
      const viajes = await readViajesFile();
      res.status(200).json(viajes);  // Responde con la lista de viajes
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Ocurrió un error al obtener los viajes' });
    }
  });
  
module.exports = router;

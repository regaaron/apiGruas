const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Ruta del archivo JSON donde se guardan los conductores
// Esto se cambiara a la ruta del nfs del servidor
const VIAJES_FILE_PATH = path.join(__dirname, '../viajes.json');


// Función para leer el archivo de viajes
const readViajesFile = () => {
    return new Promise((resolve, reject) => {
      fs.readFile(VIAJES_FILE_PATH, 'utf-8', (err, data) => {
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
      fs.writeFile(VIAJES_FILE_PATH, JSON.stringify(viajes, null, 2), 'utf-8', (err) => {
        if (err) {
          return reject('Error al guardar los datos de los viajes');
        }
        resolve();
      });
    });
  };


// Ruta POST para registrar un nuevo viaje
router.post('/Registrar-Viaje', async (req, res) => {
    try {
      const nuevoViaje = req.body;
  
      // Leer los viajes desde el archivo
      const viajes = await readViajesFile();
  
      // Generar un nuevo ID para el viaje
      const nuevoId = viajes.length > 0 
        ? viajes[viajes.length - 1].id + 1
        : 1;
  
      // Asignar un nuevo ID y agregarlo al array de viajes
      nuevoViaje.id = nuevoId;
      viajes.push(nuevoViaje);
  
      // Escribir los datos actualizados en el archivo
      await writeViajesFile(viajes);
  
      // Enviar una respuesta exitosa
      res.status(201).json({
        message: 'Viaje registrado exitosamente',
        viaje: nuevoViaje
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
      res.status(200).json(viajes);  // Responde con la lista de viajes
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Ocurrió un error al obtener los viajes' });
    }
  });
  
module.exports = router;
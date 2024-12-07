const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Ruta del archivo JSON donde se guardan los conductores
// Esto se cambiara a la ruta del nfs del servidor
const FILE_PATH = path.join(__dirname, '../conductores.json');

// Función para leer el archivo de conductores
const readConductoresFile = () => {
  return new Promise((resolve, reject) => {
    fs.readFile(FILE_PATH, 'utf-8', (err, data) => {
      if (err) {
        return reject('Error al leer el archivo de conductores');
      }
      resolve(data ? JSON.parse(data) : []);
    });
  });
};

// Función para escribir en el archivo de conductores
const writeConductoresFile = (conductores) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(FILE_PATH, JSON.stringify(conductores, null, 2), 'utf-8', (err) => {
      if (err) {
        return reject('Error al guardar los datos de los conductores');
      }
      resolve();
    });
  });
};

// Ruta POST para registrar un conductor
router.post('/Registrar-Conductor', async (req, res) => {
  try {
    const nuevoConductor = req.body;

    // Leer los conductores desde el archivo
    const conductores = await readConductoresFile();

    // Generar un nuevo ID para el conductor
    const nuevoId = conductores.length > 0 
      ? conductores[conductores.length - 1].id + 1
      : 1;

    // Asignar el nuevo ID al conductor
    nuevoConductor.id = nuevoId;

    // Agregar el nuevo conductor al array
    conductores.push(nuevoConductor);

    // Escribir los datos actualizados en el archivo
    await writeConductoresFile(conductores);

    // Enviar una respuesta exitosa
    res.status(201).json({
      message: 'Conductor registrado exitosamente',
      conductor: nuevoConductor
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ocurrió un error al registrar el conductor' });
  }
});

// Ruta GET para obtener todos los conductores
router.get('/ver-conductores', async (req, res) => {
    try {
      const conductores = await readConductoresFile();
      res.status(200).json(conductores);  // Responde con la lista de conductores
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Ocurrió un error al obtener los conductores' });
    }
  });
  
// Actualizar la ubicación del conductor
router.put('/actualizar-ubicacion/conductores/:id', async (req, res) => {
  try {
    const { id } = req.params;  // Obtener el ID del conductor desde los parámetros
    const { latitud, longitud, activo, atendido, solicitud} = req.body;  // Obtener la nueva ubicación desde el cuerpo de la solicitud

    // Leer los conductores desde el archivo
    const conductores = await readConductoresFile();

    // Buscar el conductor por ID
    const conductorIndex = conductores.findIndex(conductor => conductor.id === parseInt(id));

    if (conductorIndex === -1) {
      return res.status(404).json({ error: 'Conductor no encontrado' });
    }

    // Actualizar los valores de la ubicación del conductor
    conductores[conductorIndex].ubicacion = {
      latitud: latitud !== undefined ? latitud : conductores[conductorIndex].ubicacion.latitud,
      longitud: longitud !== undefined ? longitud : conductores[conductorIndex].ubicacion.longitud,
      activo: activo !== undefined ? activo : conductores[conductorIndex].ubicacion.activo,
      atendido: atendido !== undefined ? atendido : conductores[conductorIndex].ubicacion.atendido
    };

    // Actualizar el campo 'solicitud' si se proporciona
    if (solicitud !== undefined) {
      conductores[conductorIndex].solicitud = solicitud;
    }

    // Guardar los cambios en el archivo
    await writeConductoresFile(conductores);

    // Responder con éxito
    res.status(200).json({
      message: 'Ubicación del conductor actualizada exitosamente',
      conductor: conductores[conductorIndex]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ocurrió un error al actualizar la ubicación del conductor' });
  }
});


module.exports = router;

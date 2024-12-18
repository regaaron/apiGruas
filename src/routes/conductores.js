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

    // Asignar valores predeterminados
    nuevoConductor.id = nuevoId;
    nuevoConductor.ubicacion = {
      latitud: null,
      longitud: null,
      activo: false,
      atendido: false
    };
    nuevoConductor.password = nuevoConductor.password || null;
    nuevoConductor.solicitud = {
      espera: false,
      usuario: 0
    };
    nuevoConductor.aceptada = false;

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
    const { latitud, longitud, activo, atendido, espera, usuario} = req.body;  // Obtener la nueva ubicación desde el cuerpo de la solicitud

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


    conductores[conductorIndex].solicitud = {
      espera: espera !== undefined ? espera: conductores[conductorIndex].solicitud.espera,
      usuario: usuario !== undefined ? usuario: conductores[conductorIndex].solicitud.usuario
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


// Actualizar solo la variable 'aceptada' del conductor
router.put('/actualizar-aceptada/conductores/:id', async (req, res) => {
  try {
    const { id } = req.params;  // Obtener el ID del conductor desde los parámetros
    const { aceptada } = req.body;  // Obtener el nuevo valor de 'aceptada' desde el cuerpo de la solicitud

    // Verificar que el campo 'aceptada' haya sido proporcionado
    if (aceptada === undefined) {
      return res.status(400).json({ error: "'aceptada' es un campo obligatorio" });
    }

    // Leer los conductores desde el archivo
    const conductores = await readConductoresFile();

    // Buscar el conductor por ID
    const conductorIndex = conductores.findIndex(conductor => conductor.id === parseInt(id));

    if (conductorIndex === -1) {
      return res.status(404).json({ error: 'Conductor no encontrado' });
    }

    // Actualizar solo el valor de 'aceptada'
    conductores[conductorIndex].aceptada = aceptada;

    // Guardar los cambios en el archivo
    await writeConductoresFile(conductores);

    // Responder con éxito
    res.status(200).json({
      message: 'Campo "aceptada" del conductor actualizado exitosamente',
      conductor: conductores[conductorIndex]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ocurrió un error al actualizar el campo "aceptada" del conductor' });
  }
});


// Actualizar conductor por ID
router.put('/actualizar-conductor/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const datosActualizados = req.body;

    // Leer los conductores desde el archivo
    const conductores = await readConductoresFile();

    // Encontrar el índice del conductor a actualizar
    const index = conductores.findIndex((c) => c.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Conductor no encontrado' });
    }

    // Actualizar los datos del conductor
    conductores[index] = { ...conductores[index], ...datosActualizados };

    // Escribir los datos actualizados en el archivo
    await writeConductoresFile(conductores);

    res.status(200).json({
      message: 'Conductor actualizado exitosamente',
      conductor: conductores[index],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ocurrió un error al actualizar el conductor' });
  }
});


module.exports = router;

const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const encryptionService = require('../encripFiles/encrypService'); // Ajusta según tu estructura de carpetas

const ENCRYPTED_FILE_PATH = path.join(__dirname, '../encripFiles/conductores.encrypted');
const TEMP_DECRYPTED_FILE_PATH = path.join(__dirname, '../encripFiles/conductores.json'); // Archivo temporal desencriptado

// Función para leer el archivo de conductores desencriptándolo
const readConductoresFile = async () => {
  try {
    // Desencriptar el archivo
    await encryptionService.decryptFile(ENCRYPTED_FILE_PATH, TEMP_DECRYPTED_FILE_PATH);

    // Leer el archivo desencriptado
    const data = fs.readFileSync(TEMP_DECRYPTED_FILE_PATH, 'utf-8');
    const conductores = data ? JSON.parse(data) : [];

    // Eliminar el archivo temporal desencriptado
    fs.unlinkSync(TEMP_DECRYPTED_FILE_PATH);

    return conductores;
  } catch (error) {
    console.error('Error al desencriptar o leer el archivo:', error);
    throw new Error('Error al procesar los datos de conductores');
  }
};

// Función para escribir en el archivo de conductores encriptado
const writeConductoresFile = async (conductores) => {
  try {
    // Crear el archivo temporal desencriptado
    fs.writeFileSync(TEMP_DECRYPTED_FILE_PATH, JSON.stringify(conductores, null, 2), 'utf-8');

    // Encriptar el archivo temporal y guardar en la ubicación encriptada
    await encryptionService.encryptFile(TEMP_DECRYPTED_FILE_PATH, ENCRYPTED_FILE_PATH);

    // Eliminar el archivo temporal desencriptado
    fs.unlinkSync(TEMP_DECRYPTED_FILE_PATH);
  } catch (error) {
    console.error('Error al escribir los datos de conductores:', error);
    throw new Error('Error al guardar los datos de conductores');
  }
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
      conductor: nuevoConductor,
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
    res.status(200).json(conductores); // Responde con la lista de conductores
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ocurrió un error al obtener los conductores' });
  }
});

// Ruta PUT para actualizar la ubicación de un conductor
router.put('/actualizar-ubicacion/conductores/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { latitud, longitud, activo, atendido, espera, usuario } = req.body;

    // Leer los conductores desde el archivo
    const conductores = await readConductoresFile();

    // Buscar el conductor por ID
    const conductorIndex = conductores.findIndex(conductor => conductor.id === parseInt(id));
    if (conductorIndex === -1) {
      return res.status(404).json({ error: 'Conductor no encontrado' });
    }

    // Actualizar los valores de la ubicación y solicitud
    conductores[conductorIndex].ubicacion = {
      latitud: latitud !== undefined ? latitud : conductores[conductorIndex].ubicacion.latitud,
      longitud: longitud !== undefined ? longitud : conductores[conductorIndex].ubicacion.longitud,
      activo: activo !== undefined ? activo : conductores[conductorIndex].ubicacion.activo,
      atendido: atendido !== undefined ? atendido : conductores[conductorIndex].ubicacion.atendido,
    };

    conductores[conductorIndex].solicitud = {
      espera: espera !== undefined ? espera : conductores[conductorIndex].solicitud.espera,
      usuario: usuario !== undefined ? usuario : conductores[conductorIndex].solicitud.usuario,
    };

    // Guardar los cambios en el archivo
    await writeConductoresFile(conductores);

    // Responder con éxito
    res.status(200).json({
      message: 'Ubicación del conductor actualizada exitosamente',
      conductor: conductores[conductorIndex],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ocurrió un error al actualizar la ubicación del conductor' });
  }
});

// Ruta PUT para actualizar la variable 'aceptada' de un conductor
router.put('/actualizar-aceptada/conductores/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { aceptada } = req.body;

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

    // Actualizar el campo 'aceptada'
    conductores[conductorIndex].aceptada = aceptada;

    // Guardar los cambios en el archivo
    await writeConductoresFile(conductores);

    // Responder con éxito
    res.status(200).json({
      message: 'Campo "aceptada" del conductor actualizado exitosamente',
      conductor: conductores[conductorIndex],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ocurrió un error al actualizar el campo "aceptada" del conductor' });
  }
});

module.exports = router;

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

// Ruta GET para obtener ubicaciones activas de conductores
router.get('/ver-ubicaciones', async (req, res) => {
  try {
    const conductores = await readConductoresFile();

    // Filtrar solo ubicaciones activas
    const ubicacionesActivas = conductores.filter(conductor => conductor.ubicacion?.activo);
    res.status(200).json(ubicacionesActivas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ocurrió un error al obtener las ubicaciones' });
  }
});

// Ruta POST para registrar una nueva ubicación de conductor
router.post('/registrar-ubicacion', async (req, res) => {
  try {
    const nuevaUbicacion = req.body;

    // Leer los conductores desde el archivo
    const conductores = await readConductoresFile();

    // Generar un nuevo ID para el conductor si no está definido
    const nuevoId = conductores.length > 0
      ? conductores[conductores.length - 1].id + 1
      : 1;
    nuevaUbicacion.id = nuevaUbicacion.id || nuevoId;

    // Agregar la nueva ubicación al array
    conductores.push(nuevaUbicacion);

    // Escribir los datos actualizados en el archivo
    await writeConductoresFile(conductores);

    res.status(201).json({
      message: 'Ubicación registrada exitosamente',
      ubicacion: nuevaUbicacion,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ocurrió un error al registrar la ubicación' });
  }
});

// Ruta PUT para actualizar la ubicación de un conductor
router.put('/actualizar-ubicacion/conductores/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { latitud, longitud, activo } = req.body;

    // Leer los conductores desde el archivo
    const conductores = await readConductoresFile();

    // Buscar el conductor por ID
    const conductorIndex = conductores.findIndex(conductor => conductor.id === parseInt(id));
    if (conductorIndex === -1) {
      return res.status(404).json({ error: 'Conductor no encontrado' });
    }

    // Actualizar la ubicación del conductor
    conductores[conductorIndex].ubicacion = {
      latitud: latitud !== undefined ? latitud : conductores[conductorIndex].ubicacion?.latitud,
      longitud: longitud !== undefined ? longitud : conductores[conductorIndex].ubicacion?.longitud,
      activo: activo !== undefined ? activo : conductores[conductorIndex].ubicacion?.activo,
    };

    // Guardar los cambios en el archivo
    await writeConductoresFile(conductores);

    res.status(200).json({
      message: 'Ubicación actualizada exitosamente',
      conductor: conductores[conductorIndex],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ocurrió un error al actualizar la ubicación del conductor' });
  }
});

module.exports = router;

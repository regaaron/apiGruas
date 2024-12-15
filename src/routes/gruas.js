const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const encryptionService = require('../encripFiles/encrypService'); // Ajusta según tu estructura de carpetas

const ENCRYPTED_FILE_PATH = path.join(__dirname, '../encripFiles/gruas.encrypted');
const TEMP_DECRYPTED_FILE_PATH = path.join(__dirname, '../encripFiles/gruas.json'); // Archivo temporal desencriptado

// Función para leer el archivo de grúas desencriptándolo
const readGruasFile = async () => {
  try {
    // Desencriptar el archivo
    await encryptionService.decryptFile(ENCRYPTED_FILE_PATH, TEMP_DECRYPTED_FILE_PATH);

    // Leer el archivo desencriptado
    const data = fs.readFileSync(TEMP_DECRYPTED_FILE_PATH, 'utf-8');
    const gruas = data ? JSON.parse(data) : [];

    // Eliminar el archivo temporal desencriptado
    fs.unlinkSync(TEMP_DECRYPTED_FILE_PATH);

    return gruas;
  } catch (error) {
    console.error('Error al desencriptar o leer el archivo:', error);
    throw new Error('Error al procesar los datos de grúas');
  }
};

// Función para escribir en el archivo de grúas encriptado
const writeGruasFile = async (gruas) => {
  try {
    // Crear el archivo temporal desencriptado
    fs.writeFileSync(TEMP_DECRYPTED_FILE_PATH, JSON.stringify(gruas, null, 2), 'utf-8');

    // Encriptar el archivo temporal y guardar en la ubicación encriptada
    await encryptionService.encryptFile(TEMP_DECRYPTED_FILE_PATH, ENCRYPTED_FILE_PATH);

    // Eliminar el archivo temporal desencriptado
    fs.unlinkSync(TEMP_DECRYPTED_FILE_PATH);
  } catch (error) {
    console.error('Error al escribir los datos de grúas:', error);
    throw new Error('Error al guardar los datos de grúas');
  }
};

// Ruta POST para registrar una grúa
router.post('/Registrar-Grua', async (req, res) => {
  try {
    const nuevaGrua = req.body;

    // Leer las grúas desde el archivo
    const gruas = await readGruasFile();

    // Generar un nuevo ID para la grúa
    const nuevoId = gruas.length > 0 ? gruas[gruas.length - 1].id + 1 : 1;

    // Asignar el nuevo ID a la grúa
    nuevaGrua.id = nuevoId;

    // Agregar la nueva grúa al array
    gruas.push(nuevaGrua);

    // Escribir los datos actualizados en el archivo
    await writeGruasFile(gruas);

    // Enviar una respuesta exitosa
    res.status(201).json({
      message: 'Grúa registrada exitosamente',
      grua: nuevaGrua,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ocurrió un error al registrar la grúa' });
  }
});

// Ruta GET para obtener todas las grúas
router.get('/ver-gruas', async (req, res) => {
  try {
    const gruas = await readGruasFile();
    res.status(200).json(gruas); // Responde con la lista de grúas
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ocurrió un error al obtener las grúas' });
  }
});

router.put('/editar-grua/:id', async (req, res) => {
  try {
    const gruaId = parseInt(req.params.id);
    const actualizacion = req.body;

    // Leer las grúas desde el archivo
    const gruas = await readGruasFile();

    // Buscar la grúa a editar
    const index = gruas.findIndex(grua => grua.id === gruaId);
    if (index === -1) {
      return res.status(404).json({ error: 'Grúa no encontrada' });
    }

    // Actualizar la grúa
    gruas[index] = { ...gruas[index], ...actualizacion };

    // Escribir los datos actualizados en el archivo
    await writeGruasFile(gruas);

    // Enviar una respuesta exitosa
    res.json({
      message: 'Grúa actualizada exitosamente',
      grua: gruas[index]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ocurrió un error al actualizar la grúa' });
  }
});

module.exports = router;

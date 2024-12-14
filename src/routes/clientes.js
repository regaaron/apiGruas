const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const encryptionService = require('../encripFiles/encrypService'); // Ajusta según tu estructura de carpetas

const ENCRYPTED_FILE_PATH = path.join(__dirname, '../encripFiles/clientes.encrypted');
const TEMP_DECRYPTED_FILE_PATH = path.join(__dirname, '../encripFiles/clientes.json'); // Archivo temporal desencriptado

// Función para leer el archivo de clientes desencriptándolo
const readClientesFile = async () => {
  try {
    // Desencriptar el archivo
    await encryptionService.decryptFile(ENCRYPTED_FILE_PATH, TEMP_DECRYPTED_FILE_PATH);

    // Leer el archivo desencriptado
    const data = fs.readFileSync(TEMP_DECRYPTED_FILE_PATH, 'utf-8');
    const clientes = data ? JSON.parse(data) : [];

    // Eliminar el archivo temporal desencriptado
    fs.unlinkSync(TEMP_DECRYPTED_FILE_PATH);

    return clientes;
  } catch (error) {
    console.error('Error al desencriptar o leer el archivo:', error);
    throw new Error('Error al procesar los datos de clientes');
  }
};

// Función para escribir en el archivo de clientes encriptado
const writeClientesFile = async (clientes) => {
  try {
    // Crear el archivo temporal desencriptado
    fs.writeFileSync(TEMP_DECRYPTED_FILE_PATH, JSON.stringify(clientes, null, 2), 'utf-8');

    // Encriptar el archivo temporal y guardar en la ubicación encriptada
    await encryptionService.encryptFile(TEMP_DECRYPTED_FILE_PATH, ENCRYPTED_FILE_PATH);

    // Eliminar el archivo temporal desencriptado
    fs.unlinkSync(TEMP_DECRYPTED_FILE_PATH);
  } catch (error) {
    console.error('Error al escribir los datos de clientes:', error);
    throw new Error('Error al guardar los datos de clientes');
  }
};

// Ruta POST para registrar un cliente
router.post('/Registrar-Cliente', async (req, res) => {
  try {
    const nuevoCliente = req.body;

    // Leer los clientes desde el archivo
    const clientes = await readClientesFile();

    // Generar un nuevo ID para el cliente
    const nuevoId = clientes.length > 0
      ? clientes[clientes.length - 1].id + 1
      : 1;

    // Asignar el nuevo ID al cliente
    nuevoCliente.id = nuevoId;

    // Agregar el nuevo cliente al array
    clientes.push(nuevoCliente);

    // Escribir los datos actualizados en el archivo
    await writeClientesFile(clientes);

    // Enviar una respuesta exitosa
    res.status(201).json({
      message: 'Cliente registrado exitosamente',
      cliente: nuevoCliente,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ocurrió un error al registrar el cliente' });
  }
});

// Ruta GET para obtener todos los clientes
router.get('/ver-clientes', async (req, res) => {
  try {
    const clientes = await readClientesFile();
    res.status(200).json(clientes); // Responde con la lista de clientes
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ocurrió un error al obtener los clientes' });
  }
});

// Ruta PUT para actualizar la ubicación de un cliente
router.put('/actualizar-ubicacion/clientes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { latitud, longitud, activo, atendido, conductor } = req.body;

    // Leer los clientes desde el archivo
    const clientes = await readClientesFile();

    // Buscar el cliente por ID
    const clienteIndex = clientes.findIndex(cliente => cliente.id === parseInt(id));
    if (clienteIndex === -1) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    // Actualizar la ubicación del cliente
    clientes[clienteIndex].ubicacion = {
      latitud: latitud !== undefined ? latitud : clientes[clienteIndex].ubicacion.latitud,
      longitud: longitud !== undefined ? longitud : clientes[clienteIndex].ubicacion.longitud,
      activo: activo !== undefined ? activo : clientes[clienteIndex].ubicacion.activo,
      atendido: atendido !== undefined ? atendido : clientes[clienteIndex].ubicacion.atendido,
      conductor: conductor !== undefined ? conductor : clientes[clienteIndex].ubicacion.conductor,
    };

    // Guardar los cambios en el archivo
    await writeClientesFile(clientes);

    // Responder con éxito
    res.status(200).json({
      message: 'Ubicación actualizada exitosamente',
      cliente: clientes[clienteIndex],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ocurrió un error al actualizar la ubicación del cliente' });
  }
});

module.exports = router;

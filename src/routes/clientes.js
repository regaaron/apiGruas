const express = require('express');
const fs = require('fs');
const path = require('path');
const { encryptFile, decryptFile } = require('../encripFiles/encrypService'); // Importar lógica de encriptación
const router = express.Router();

const ENCRYPTED_FILE_PATH = path.join(__dirname, '../encripFiles/clientes.encrypted');
const TEMP_FILE_PATH = path.join(__dirname, '../encripFiles/clientes.temp.json');

// Función para leer y desencriptar el archivo de clientes
const readClientesFile = async () => {
  try {
    // Desencripta el archivo y genera el archivo temporal
    await decryptFile(ENCRYPTED_FILE_PATH, TEMP_FILE_PATH);

    // Lee el contenido del archivo temporal
    const data = fs.readFileSync(TEMP_FILE_PATH, 'utf-8');
    
    // Elimina el archivo temporal después de leerlo
    fs.unlinkSync(TEMP_FILE_PATH);

    // Retorna los datos como un objeto JSON
    console.log("efectivamente lo desencripte y mande la info devuelta")
    return data ? JSON.parse(data) : [];
  } catch (err) {
    throw new Error('Error al leer el archivo de clientes: ' + err.message);
  }
};

// Función para escribir y encriptar el archivo de clientes
const writeClientesFile = async (clientes) => {
  try {
    // Escribe los datos en el archivo temporal
    fs.writeFileSync(TEMP_FILE_PATH, JSON.stringify(clientes, null, 2), 'utf-8');

    // Encripta el archivo temporal y sobrescribe el archivo encriptado original
    await encryptFile(TEMP_FILE_PATH, ENCRYPTED_FILE_PATH);

    // Elimina el archivo temporal después de encriptarlo
    fs.unlinkSync(TEMP_FILE_PATH);
  } catch (err) {
    throw new Error('Error al guardar los datos de los clientes: ' + err.message);
  }
};

// Ruta POST para registrar un cliente
router.post('/Registrar-Cliente', async (req, res) => {
  try {
    const nuevoCliente = req.body;

    // Leer los clientes desde el archivo
    const clientes = await readClientesFile();

    // Generar un nuevo ID para el cliente
    const nuevoId = clientes.length > 0 ? clientes[clientes.length - 1].id + 1 : 1;

    // Asignar el nuevo ID al cliente
    nuevoCliente.id = nuevoId;

    // Agregar el nuevo cliente al array
    clientes.push(nuevoCliente);

    // Escribir los datos actualizados en el archivo
    await writeClientesFile(clientes);

    // Enviar una respuesta exitosa
    res.status(201).json({
      message: 'Cliente registrado exitosamente',
      cliente: nuevoCliente
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
    res.status(200).json(clientes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ocurrió un error al obtener los clientes' });
  }
});

// Ruta PUT para actualizar la ubicación de un cliente
router.put('/actualizar-ubicacion/clientes/:id', async (req, res) => {
  try {
    const { id } = req.params; // Obtener el ID desde los parámetros de la ruta
    const { latitud, longitud, activo, atendido } = req.body; // Obtener datos del cuerpo de la solicitud

    // Leer los clientes desde el archivo
    const clientes = await readClientesFile();

    // Buscar el cliente por ID
    const clienteIndex = clientes.findIndex((cliente) => cliente.id === parseInt(id));

    if (clienteIndex === -1) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    // Actualizar los valores de la ubicación del cliente
    clientes[clienteIndex].ubicacion = {
      latitud: latitud !== undefined ? latitud : clientes[clienteIndex].ubicacion.latitud,
      longitud: longitud !== undefined ? longitud : clientes[clienteIndex].ubicacion.longitud,
      activo: activo !== undefined ? activo : clientes[clienteIndex].ubicacion.activo,
      atendido: atendido !== undefined ? atendido : clientes[clienteIndex].ubicacion.atendido
    };

    // Guardar los cambios en el archivo
    await writeClientesFile(clientes);

    // Responder con éxito
    res.status(200).json({
      message: 'Ubicación actualizada exitosamente',
      cliente: clientes[clienteIndex]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ocurrió un error al actualizar la ubicación del cliente' });
  }
});

module.exports = router;

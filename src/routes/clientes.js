const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const FILE_PATH = path.join(__dirname, '../clientes.json');

// Función para leer el archivo de clientes
const readClientesFile = () => {
  return new Promise((resolve, reject) => {
    fs.readFile(FILE_PATH, 'utf-8', (err, data) => {
      if (err) {
        return reject('Error al leer el archivo de clientes');
      }
      resolve(data ? JSON.parse(data) : []);
    });
  });
};

// Función para escribir en el archivo de clientes
const writeClientesFile = (clientes) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(FILE_PATH, JSON.stringify(clientes, null, 2), 'utf-8', (err) => {
      if (err) {
        return reject('Error al guardar los datos de los clientes');
      }
      resolve();
    });
  });
};

// Ruta POST para registrar un cliente
router.post('/Registrar-Cliente', async (req, res) => {
  try {
    const nuevocliente = req.body;

    // Leer los clientes desde el archivo
    const clientes = await readClientesFile();

    // Generar un nuevo ID para el cliente
    const nuevoId = clientes.length > 0 
      ? clientes[clientes.length - 1].id + 1
      : 1;

    // Asignar el nuevo ID al conductor
    nuevocliente.id = nuevoId;

    // Agregar el nuevo conductor al array
    clientes.push(nuevocliente);

    // Escribir los datos actualizados en el archivo
    await writeClientesFile(clientes);

    // Enviar una respuesta exitosa
    res.status(201).json({
      message: 'Cliente registrado exitosamente',
      clientes: nuevocliente
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
      res.status(200).json(clientes);  // Responde con la lista de clientes
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Ocurrió un error al obtener los clientes' });
    }
  });


  router.put('/actualizar-ubicacion/clientes/:id', async (req, res) => {
    try {
      const { id } = req.params; // Obtener el ID desde los parámetros de la ruta
      const { latitud, longitud, activo, atendido, conductor } = req.body; // Obtener la nueva ubicación y atendido desde el cuerpo de la solicitud
  
      // Leer los clientes desde el archivo
      const clientes = await readClientesFile();
  
      // Buscar el cliente por ID
      const clienteIndex = clientes.findIndex(cliente => cliente.id === parseInt(id));
  
      if (clienteIndex === -1) {
        return res.status(404).json({ error: 'Cliente no encontrado' });
      }
  
      // Actualizar los valores de la ubicación del cliente, incluyendo atendido
      clientes[clienteIndex].ubicacion = {
        latitud: latitud !== undefined ? latitud : clientes[clienteIndex].ubicacion.latitud,
        longitud: longitud !== undefined ? longitud : clientes[clienteIndex].ubicacion.longitud,
        activo: activo !== undefined ? activo : clientes[clienteIndex].ubicacion.activo,
        atendido: atendido !== undefined ? atendido : clientes[clienteIndex].ubicacion.atendido,
        conductor: conductor !== undefined ? conductor: clientes[clienteIndex].ubicacion.conductor
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

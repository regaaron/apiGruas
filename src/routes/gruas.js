const { json } = require('body-parser');
const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Ruta del archivo JSON donde se guardan las grúas
const FILE_PATH = path.join(__dirname, '../gruas.json');

// Función para leer el archivo de grúas
const readGruas = () => {
  return new Promise((resolve, reject) => {
    fs.readFile(FILE_PATH, 'utf-8', (err, data) => {
      if (err) {
        return reject('Error al leer el archivo de grúas');
      }
      resolve(data ? JSON.parse(data) : []);
    });
  });
};

// Función para escribir en el archivo de grúas
const writeGruas = (gruas) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(FILE_PATH, JSON.stringify(gruas, null, 2), 'utf-8', (err) => {
      if (err) {
        return reject('Error al guardar los datos de las grúas');
      }
      resolve();
    });
  });
};

// Ruta POST para registrar una grúa
router.post('/Registrar-Grua', async (req, res) => {
  try {
    const nuevaGrua = req.body;

    // Leer las grúas desde el archivo
    const gruas = await readGruas();

    // Generar un nuevo ID para la grúa
    const nuevoId = gruas.length > 0 ? gruas[gruas.length - 1].id + 1 : 1;

    // Asignar el nuevo ID a la grúa
    nuevaGrua.id = nuevoId;

    // Agregar la nueva grúa al array
    gruas.push(nuevaGrua);

    // Escribir los datos actualizados en el archivo
    await writeGruas(gruas);

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


router.get('/ver-gruas',async(req,res)=>{
    try{
        const gruas = await readGruas();
        res.status(200).json(gruas); // resonde con la lista de gruas
    }catch(error){
        console.log(error);
        res.status(500).json({error: 'Ocurrio un error al obtener la lista de gruas'});
    }
});

// Ruta PUT para editar una grúa
router.put('/editar-grua/:id', async (req, res) => {
  try {
    const gruaId = parseInt(req.params.id);
    const actualizacion = req.body;

    // Leer las grúas desde el archivo
    const gruas = await readGruas();

    // Buscar la grúa a editar
    const index = gruas.findIndex(grua => grua.id === gruaId);
    if (index === -1) {
      return res.status(404).json({ error: 'Grúa no encontrada' });
    }

    // Actualizar la grúa
    gruas[index] = { ...gruas[index], ...actualizacion };

    // Escribir los datos actualizados en el archivo
    await writeGruas(gruas);

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

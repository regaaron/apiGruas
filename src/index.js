const express = require('express');
const app = express();
const cors = require('cors');

// Configura CORS para permitir solicitudes desde cualquier origen
app.use(cors({ origin: '*' }));


app.use(express.json());

// Importa las rutas de conductores
const conductoresRoutes = require('./routes/conductores');
const gruasRoutes = require('./routes/gruas');
const clientesRoutes = require('./routes/clientes');
const ubicacionesConductoresRoutes = require('./routes/ubicacionesConductores');
const login = require('./routes/usuario');
const viajes = require('./routes/viajes');
const test = require('./routes/prueba1');
const test2 = require('./routes/prueba3');

// Usa las rutas de conductores
app.use('/', conductoresRoutes);  
app.use('/', gruasRoutes);
app.use('/', clientesRoutes);
app.use('/', ubicacionesConductoresRoutes);
app.use('/', login);
app.use('/', viajes);
app.use('/', test);
app.use('/', test2);


// Inicia el servidor en el puerto 3000
const PORT = 3000;
app.listen(PORT,'0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});

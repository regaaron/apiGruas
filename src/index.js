const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');

app.use(cors({
    origin: '*', // Permitir cualquier origen
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos permitidos
}));


app.use(express.json());

// Importa las rutas de conductores
const conductoresRoutes = require('./routes/conductores');
const gruasRoutes = require('./routes/gruas');
const clientesRoutes = require('./routes/clientes');
const ubicacionesConductoresRoutes = require('./routes/ubicacionesConductores');
const login = require('./routes/usuario');
const viajes = require('./routes/viajes');
const test = require('./routes/ED');

// Usa las rutas de conductores
app.use('/', conductoresRoutes);  
app.use('/', gruasRoutes);
app.use('/', clientesRoutes);
app.use('/', ubicacionesConductoresRoutes);
app.use('/', login);
app.use('/', viajes);
app.use('/', test);

app.use(express.static(path.join(__dirname, 'public', 'browser')));

// Todas las demás rutas deben devolver el index.html de Angular
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'browser', 'index.html'));
});

// Inicia el servidor en el puerto 3000
const PORT = 3000;
app.listen(PORT,'0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});

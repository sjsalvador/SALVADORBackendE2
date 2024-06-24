const express = require('express');
const { create } = require('express-handlebars');
const handlebars = require('handlebars');
const layouts = require('handlebars-layouts');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const productsRouter = require('./routes/products.router');
const cartsRouter = require('./routes/cart.router');

const app = express();
const port = 8080;
const server = http.createServer(app);
const io = socketIo(server);

// Configurar Handlebars y registrar los helpers
handlebars.registerHelper(layouts(handlebars)); // Registra los helpers de layouts
const hbs = create({
  extname: '.handlebars',
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views/layouts'),
  partialsDir: path.join(__dirname, 'views/partials')
});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // Servir archivos estáticos
app.use('/api/products', productsRouter(io)); // Pasa `io` como parámetro al router de productos
app.use('/api/carts', cartsRouter);

// Ruta raíz
app.get('/', (req, res) => {
  res.send('Welcome to the API');
});

// Ruta para home.handlebars
app.get('/home', (req, res) => {
  const products = require('./data/products.json');
  res.render('home', { products });
});

// Ruta para realTimeProducts.handlebars
app.get('/realtimeproducts', (req, res) => {
  const products = require('./data/products.json');
  res.render('realTimeProducts', { products });
});

// Configurar socket.io
io.on('connection', (socket) => {
  console.log('New client connected');
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

module.exports = { app, io };

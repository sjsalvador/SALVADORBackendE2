const express = require('express');
const fs = require('fs');
const path = require('path');

const productsFilePath = path.join(__dirname, '../data/products.json');

const createProductsRouter = (io) => {
  const router = express.Router();

  // Helper function to read the products file
  const readProductsFile = () => {
    const data = fs.readFileSync(productsFilePath, 'utf8');
    return JSON.parse(data);
  };

  // Helper function to write to the products file
  const writeProductsFile = (products) => {
    fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2));
  };

  // GET all products
  router.get('/', (req, res) => {
    const products = readProductsFile();
    const limit = req.query.limit ? parseInt(req.query.limit) : products.length;
    res.json(products.slice(0, limit));
  });

  // GET product by ID
  router.get('/:pid', (req, res) => {
    const products = readProductsFile();
    const product = products.find(p => p.id === parseInt(req.params.pid));
    if (product) {
      res.json(product);
    } else {
      res.status(404).send('Product not found');
    }
  });

  // Crear nuevo producto
  router.post('/', (req, res) => {
    const products = readProductsFile();
    const newProduct = {
      id: products.length > 0 ? products[products.length - 1].id + 1 : 1,
      ...req.body,
      status: req.body.status !== undefined ? req.body.status : true
    };
    products.push(newProduct);
    writeProductsFile(products);
    io.emit('updateProducts', products);  // Emitir evento de WebSocket
    res.status(201).json(newProduct);
  });

  // Actualizar producto por ID
  router.put('/:pid', (req, res) => {
    const products = readProductsFile();
    const index = products.findIndex(p => p.id === parseInt(req.params.pid));
    if (index !== -1) {
      products[index] = { ...products[index], ...req.body, id: products[index].id };
      writeProductsFile(products);
      io.emit('updateProducts', products);  // Emitir evento de WebSocket
      res.json(products[index]);
    } else {
      res.status(404).send('Product not found');
    }
  });

  // Eliminar product por ID
  router.delete('/:pid', (req, res) => {
    let products = readProductsFile();
    const index = products.findIndex(p => p.id === parseInt(req.params.pid));
    if (index !== -1) {
      products = products.filter(p => p.id !== parseInt(req.params.pid));
      writeProductsFile(products);
      io.emit('updateProducts', products);  // Emitir evento de WebSocket
      res.status(204).send();
    } else {
      res.status(404).send('Product not found');
    }
  });

  return router;
};

module.exports = createProductsRouter;

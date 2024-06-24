const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const cartsFilePath = path.join(__dirname, '../data/carts.json');
const productsFilePath = path.join(__dirname, '../data/products.json');

// Helper function to read the carts file
const readCartsFile = () => {
  const data = fs.readFileSync(cartsFilePath, 'utf8');
  return JSON.parse(data);
};

// Helper function to write to the carts file
const writeCartsFile = (carts) => {
  fs.writeFileSync(cartsFilePath, JSON.stringify(carts, null, 2));
};

// Helper function to read the products file
const readProductsFile = () => {
  const data = fs.readFileSync(productsFilePath, 'utf8');
  return JSON.parse(data);
};

// POST new cart
router.post('/', (req, res) => {
  const carts = readCartsFile();
  const newCart = {
    id: carts.length > 0 ? carts[carts.length - 1].id + 1 : 1,
    products: []
  };
  carts.push(newCart);
  writeCartsFile(carts);
  res.status(201).json(newCart);
});

// GET cart by ID
router.get('/:cid', (req, res) => {
  const carts = readCartsFile();
  const cart = carts.find(c => c.id === parseInt(req.params.cid));
  if (cart) {
    res.json(cart);
  } else {
    res.status(404).send('Cart not found');
  }
});

// POST add product to cart
router.post('/:cid/product/:pid', (req, res) => {
  const carts = readCartsFile();
  const products = readProductsFile();
  const cart = carts.find(c => c.id === parseInt(req.params.cid));
  const product = products.find(p => p.id === parseInt(req.params.pid));
  
  if (cart && product) {
    const productInCart = cart.products.find(p => p.product === product.id);
    if (productInCart) {
      productInCart.quantity += 1;
    } else {
      cart.products.push({ product: product.id, quantity: 1 });
    }
    writeCartsFile(carts);
    res.status(201).json(cart);
  } else {
    res.status(404).send('Cart or Product not found');
  }
});

module.exports = router;

const express = require('express');
const app = express();
const port = 3500;
const winston = require('winston');
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [new winston.transports.Console()]
});
app.use(express.json());

// Mock products
const products = [{ id: 1, name: 'Product A', price: 10 }, { id: 2, name: 'Product B', price: 20 },{ id: 3, name: 'Product C', price: 30 }];

app.get('/products', (req, res) => {
  res.json(products);
  logger.info('Fetched products', {count: products.length});
});

app.post('/cart', (req, res) => {
  // Simulate adding to cart
  res.send('Item added to cart');
  logger.info('Added to cart', { body: req.body });
});

app.listen(port, () => {
  logger.info(`App running on http://localhost:${port}`);
});

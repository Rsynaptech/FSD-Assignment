const express = require('express');
const products = require('./products');

const app = express();
const port = process.env.PORT || 3000;
let nextProductId = products.length + 1;

app.use(express.json());

app.get('/', (request, response) => {
  response.json({
    name: 'Products REST API',
    productCount: products.length,
    endpoints: {
      products: '/api/products',
      productById: '/api/products/:id'
    }
  });
});

app.get('/api/products', (request, response) => {
  const { category, inStock, maxPrice } = request.query;
  let result = products;

  if (category) {
    result = result.filter((product) => product.category.toLowerCase() === category.toLowerCase());
  }

  if (inStock !== undefined) {
    result = result.filter((product) => product.inStock === (inStock === 'true'));
  }

  if (maxPrice !== undefined) {
    const price = Number(maxPrice);
    if (Number.isNaN(price)) {
      return response.status(400).json({ error: 'maxPrice must be a number' });
    }
    result = result.filter((product) => product.price <= price);
  }

  response.json({ count: result.length, data: result });
});

app.get('/api/products/:id', (request, response) => {
  const product = products.find((item) => item.id === Number(request.params.id));

  if (!product) {
    return response.status(404).json({ error: 'Product not found' });
  }

  response.json(product);
});

app.post('/api/products', (request, response) => {
  const { name, description, category, price, inStock = true, rating = 0 } = request.body;

  if (!name || !description || !category || typeof price !== 'number') {
    return response.status(400).json({
      error: 'name, description, category, and numeric price are required'
    });
  }

  const product = {
    id: nextProductId++,
    name,
    description,
    category,
    price,
    inStock: Boolean(inStock),
    rating: Number(rating)
  };

  products.push(product);
  response.status(201).json(product);
});

app.put('/api/products/:id', (request, response) => {
  const productIndex = products.findIndex((item) => item.id === Number(request.params.id));

  if (productIndex === -1) {
    return response.status(404).json({ error: 'Product not found' });
  }

  const { name, description, category, price, inStock, rating } = request.body;
  if (!name || !description || !category || typeof price !== 'number') {
    return response.status(400).json({
      error: 'name, description, category, and numeric price are required'
    });
  }

  products[productIndex] = {
    id: products[productIndex].id,
    name,
    description,
    category,
    price,
    inStock: Boolean(inStock),
    rating: Number(rating)
  };

  response.json(products[productIndex]);
});

app.delete('/api/products/:id', (request, response) => {
  const productIndex = products.findIndex((item) => item.id === Number(request.params.id));

  if (productIndex === -1) {
    return response.status(404).json({ error: 'Product not found' });
  }

  products.splice(productIndex, 1);
  response.status(204).send();
});

app.use((request, response) => {
  response.status(404).json({ error: 'Route not found' });
});

app.listen(port, () => {
  console.log(`Products API running at http://localhost:${port}`);
});

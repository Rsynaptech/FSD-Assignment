# Assignment 2: Products REST API

An Express.js REST API with 100 in-memory products.

## Run the API

```bash
npm install
npm start
```

The server runs at `http://localhost:3000` by default. Set `PORT` to use another port.

## Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/` | API overview |
| GET | `/api/products` | Get all products |
| GET | `/api/products/:id` | Get one product |
| POST | `/api/products` | Create a product |
| PUT | `/api/products/:id` | Replace a product |
| DELETE | `/api/products/:id` | Delete a product |

The collection endpoint supports `category`, `inStock`, and `maxPrice` query filters. For example:

```text
GET /api/products?category=Electronics&inStock=true&maxPrice=100
```

POST and PUT requests should send JSON with `name`, `description`, `category`, and numeric `price` fields. Data is stored in memory and resets when the server restarts.

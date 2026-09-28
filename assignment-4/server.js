const express = require('express');
const fs = require('node:fs/promises');
const path = require('node:path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'requests.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

async function readRequests() {
  try {
    const contents = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(contents);
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.writeFile(DATA_FILE, '[]\n');
      return [];
    }
    throw error;
  }
}

async function writeRequests(requests) {
  await fs.writeFile(DATA_FILE, `${JSON.stringify(requests, null, 2)}\n`);
}

function validateRequest(body) {
  const requiredFields = ['name', 'email', 'category', 'description', 'priority'];
  const missingField = requiredFields.find((field) => !String(body[field] || '').trim());

  if (missingField) {
    return `Please provide ${missingField}.`;
  }

  if (!/^\S+@\S+\.\S+$/.test(body.email.trim())) {
    return 'Please provide a valid email address.';
  }

  if (!['Low', 'Medium', 'High', 'Urgent'].includes(body.priority)) {
    return 'Please choose a valid priority.';
  }

  if (body.status && !['Open', 'In progress', 'Resolved'].includes(body.status)) {
    return 'Please choose a valid status.';
  }

  return null;
}

app.get('/api/requests', async (request, response, next) => {
  try {
    response.json(await readRequests());
  } catch (error) {
    next(error);
  }
});

app.get('/api/requests/:id', async (request, response, next) => {
  try {
    const requests = await readRequests();
    const item = requests.find((entry) => entry.id === request.params.id);

    if (!item) {
      return response.status(404).json({ error: 'Request not found.' });
    }

    return response.json(item);
  } catch (error) {
    return next(error);
  }
});

app.post('/api/requests', async (request, response, next) => {
  try {
    const validationError = validateRequest(request.body);
    if (validationError) {
      return response.status(400).json({ error: validationError });
    }

    const requests = await readRequests();
    const newRequest = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: request.body.name.trim(),
      email: request.body.email.trim(),
      category: request.body.category.trim(),
      description: request.body.description.trim(),
      priority: request.body.priority,
      status: 'Open',
      createdAt: new Date().toISOString(),
    };

    requests.unshift(newRequest);
    await writeRequests(requests);
    return response.status(201).json(newRequest);
  } catch (error) {
    return next(error);
  }
});

app.put('/api/requests/:id', async (request, response, next) => {
  try {
    const requests = await readRequests();
    const index = requests.findIndex((entry) => entry.id === request.params.id);

    if (index === -1) {
      return response.status(404).json({ error: 'Request not found.' });
    }

    const updatedRequest = { ...requests[index], ...request.body };
    const validationError = validateRequest(updatedRequest);
    if (validationError) {
      return response.status(400).json({ error: validationError });
    }

    for (const field of ['name', 'email', 'category', 'description']) {
      updatedRequest[field] = updatedRequest[field].trim();
    }
    delete updatedRequest.id;
    updatedRequest.id = requests[index].id;

    requests[index] = updatedRequest;
    await writeRequests(requests);
    return response.json(updatedRequest);
  } catch (error) {
    return next(error);
  }
});

app.delete('/api/requests/:id', async (request, response, next) => {
  try {
    const requests = await readRequests();
    const remainingRequests = requests.filter((entry) => entry.id !== request.params.id);

    if (remainingRequests.length === requests.length) {
      return response.status(404).json({ error: 'Request not found.' });
    }

    await writeRequests(remainingRequests);
    return response.status(204).end();
  } catch (error) {
    return next(error);
  }
});

app.use((error, request, response, next) => {
  console.error(error);
  if (response.headersSent) {
    return next(error);
  }
  return response.status(500).json({ error: 'Something went wrong. Please try again.' });
});

app.listen(PORT, () => {
  console.log(`Campus Help Desk is running at http://localhost:${PORT}`);
});

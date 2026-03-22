import express from 'express';
import productsRouter from './routes/products';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'autopago-backend' });
});

app.get('/api', (_req, res) => {
  res.json({ message: 'Autopago API' });
});

app.use('/api/products', productsRouter);

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});

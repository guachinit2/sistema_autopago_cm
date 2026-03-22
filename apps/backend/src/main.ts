import express from 'express';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'autopago-backend' });
});

app.get('/api', (_req, res) => {
  res.json({ message: 'Autopago API' });
});

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});

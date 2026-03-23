import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { errorHandler } from './common/errors';
import { appConfig } from './config';
import {
  productsRouter,
  cartsRouter,
  ordersRouter,
  paymentMethodsRouter,
  paymentsRouter,
} from './modules';

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: appConfig.corsOrigin }));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'autopago-backend' });
});

app.get('/api', (_req, res) => {
  res.json({ message: 'Autopago API' });
});

app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/payment-methods', paymentMethodsRouter);
app.use('/api/payments', paymentsRouter);

app.use(errorHandler);

app.listen(appConfig.port, () => {
  console.log(`Backend running on port ${appConfig.port}`);
});

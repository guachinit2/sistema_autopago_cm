# Plan de Backend: Sistema de Autopago

## Resumen

Este documento detalla el plan de desarrollo del backend para el sistema de autopago, incluyendo arquitectura, módulos, endpoints, base de datos y consideraciones técnicas.

---

## 1. Stack Tecnológico

### 1.1 Core

- **NestJS 10** - Framework Node.js
- **TypeScript** - Tipado estático
- **Node.js 20+** - Runtime

### 1.2 Base de Datos

- **PostgreSQL 15** - Base de datos principal
- **TypeORM** - ORM para gestión de datos
- **Redis 7** - Caché y sesiones

### 1.3 Comunicación

- **Express** - Servidor HTTP
- **Socket.io** - WebSockets para tiempo real
- **REST API** - Endpoints RESTful

### 1.4 Seguridad

- **Passport.js** - Autenticación
- **JWT** - Tokens de sesión
- **bcrypt** - Hash de contraseñas
- **Helmet** - Headers de seguridad

---

## 2. Estructura de Proyecto

```
apps/backend/
├── src/
│   ├── common/
│   │   ├── decorators/       # Custom decorators
│   │   ├── filters/          # Exception filters
│   │   ├── guards/           # Auth guards
│   │   ├── interceptors/     # Response interceptors
│   │   └── pipes/            # Validation pipes
│   ├── config/
│   │   ├── database.config.ts
│   │   ├── redis.config.ts
│   │   └── app.config.ts
│   ├── modules/
│   │   ├── auth/             # Autenticación
│   │   ├── products/         # Catálogo de productos
│   │   ├── checkout/         # Carrito y checkout
│   │   ├── payments/         # Pagos
│   │   ├── inventory/        # Inventario
│   │   ├── scale/            # Básculas
│   │   ├── operator/         # Operadores
│   │   ├── audit/            # Auditoría
│   │   └── reports/          # Reportes
│   ├── socket/
│   │   ├── events/           # Socket events
│   │   └── gateways/         # Socket gateways
│   ├── database/
│   │   ├── entities/         # TypeORM entities
│   │   ├── migrations/       # DB migrations
│   │   └── seeds/            # Seed data
│   ├── main.ts
│   └── app.module.ts
```

---

## 3. Entidades de Base de Datos

### 3.1 Product (Producto)

```typescript
@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  barcode: string; // EAN-13, EAN-8, UPC-A, UPC-E

  @Column({ unique: true })
  sku: string;

  @Column()
  name: string;

  @Column()
  category: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  pricePerKg: number; // Para productos por peso

  @Column({ default: false })
  isWeightProduct: boolean;

  @Column({ nullable: true })
  image: string;

  @Column('int', { default: 0 })
  stock: number;

  @Column('int', { default: 10 })
  minStock: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### 3.2 CheckoutSession (Sesión de Checkout)

```typescript
@Entity('checkout_sessions')
export class CheckoutSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  kioskId: string;

  @Column({
    type: 'enum',
    enum: ['active', 'pending_payment', 'completed', 'cancelled', 'abandoned'],
    default: 'active'
  })
  status: string;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  subtotal: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  tax: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  total: number;

  @Column({ nullable: true })
  operatorId: string;

  @Column({ nullable: true })
  paymentMethod: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
    default: 'pending'
  })
  paymentStatus: string;

  @Column({ nullable: true })
  paymentId: string;

  @Column({ nullable: true })
  completedAt: Date;

  @CreateDateColumn()
  startedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### 3.3 CartItem (Item del Carrito)

```typescript
@Entity('cart_items')
export class CartItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  sessionId: string;

  @Column()
  productId: string;

  @Column('int')
  quantity: number;

  @Column('decimal', { precision: 10, scale: 3, nullable: true })
  weight: number; // En gramos, para productos por peso

  @Column('decimal', { precision: 10, scale: 2 })
  unitPrice: number;

  @Column('decimal', { precision: 10, scale: 2 })
  totalPrice: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### 3.4 Operator (Operador)

```typescript
@Entity('operators')
export class Operator {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: ['operator', 'supervisor', 'admin'],
    default: 'operator'
  })
  role: string;

  @Column('simple-array', { nullable: true })
  kioskIds: string[];

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 0 })
  failedLoginAttempts: number;

  @Column({ nullable: true })
  lockedUntil: Date;

  @Column({ nullable: true })
  lastLogin: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### 3.5 AuditLog (Registro de Auditoría)

```typescript
@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  userRole: string;

  @Column()
  action: string;

  @Column('jsonb')
  details: Record<string, any>;

  @Column({ nullable: true })
  entityType: string;

  @Column({ nullable: true })
  entityId: string;

  @Column({ nullable: true })
  kioskId: string;

  @Column()
  ipAddress: string;

  @Column()
  userAgent: string;

  @CreateDateColumn()
  timestamp: Date;
}
```

### 3.6 InventoryMovement (Movimiento de Inventario)

```typescript
@Entity('inventory_movements')
export class InventoryMovement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  productId: string;

  @Column()
  type: string; // 'addition', 'reduction', 'adjustment', 'reserve', 'release', 'sale'

  @Column('int')
  quantity: number;

  @Column('int')
  previousStock: number;

  @Column('int')
  newStock: number;

  @Column({ nullable: true })
  sessionId: string;

  @Column({ nullable: true })
  operatorId: string;

  @Column({ nullable: true })
  reason: string;

  @CreateDateColumn()
  createdAt: Date;
}
```

---

## 4. Módulos y Endpoints

### 4.1 Módulo de Productos

**Ubicación:** `modules/products/`

**Endpoints:**

```
GET    /api/products/:id              # Obtener producto por ID
GET    /api/products/barcode/:code    # Buscar por código de barras
GET    /api/products/sku/:sku         # Buscar por SKU
GET    /api/products                  # Listar productos (con filtros)
POST   /api/products                  # Crear producto
PUT    /api/products/:id              # Actualizar producto
DELETE /api/products/:id              # Eliminar producto (soft delete)
GET    /api/products/categories       # Listar categorías
GET    /api/products/search           # Búsqueda avanzada
```

**Casos de uso:**
- Escaneo de código de barras en kiosk
- Búsqueda para gestión de inventario
- Catálogo para reportes

---

### 4.2 Módulo de Checkout

**Ubicación:** `modules/checkout/`

**Endpoints:**

```
POST   /api/checkout/sessions              # Crear sesión de checkout
GET    /api/checkout/sessions/:id          # Obtener sesión
GET    /api/checkout/sessions/kiosk/:kioskId  # Sesión activa por kiosk
POST   /api/checkout/:sessionId/items      # Agregar item al carrito
PUT    /api/checkout/:sessionId/items/:itemId  # Actualizar cantidad
DELETE /api/checkout/:sessionId/items/:itemId  # Eliminar item
GET    /api/checkout/:sessionId/cart       # Obtener carrito completo
POST   /api/checkout/:sessionId/cancel     # Cancelar sesión
POST   /api/checkout/:sessionId/abandon    # Abandonar sesión
GET    /api/checkout/:sessionId/receipt    # Generar recibo
```

**Casos de uso:**
- Gestión del carrito de compras
- Persistencia de sesiones
- Cálculo de totales con impuestos

---

### 4.3 Módulo de Pagos

**Ubicación:** `modules/payments/`

**Endpoints:**

```
POST   /api/payments/initiate              # Iniciar pago
GET    /api/payments/:id/status            # Consultar estado
POST   /api/payments/:id/confirm           # Confirmar pago
POST   /api/payments/:id/cancel            # Cancelar pago
POST   /api/payments/:id/refund            # Reintegrar pago
GET    /api/payments/methods               # Métodos de pago disponibles
POST   /api/payments/mock/process          # Simular pago (desarrollo)
```

**Casos de uso:**
- Procesamiento de pagos
- Mock para desarrollo
- Integración con pasarelas reales

---

### 4.4 Módulo de Inventario

**Ubicación:** `modules/inventory/`

**Endpoints:**

```
GET    /api/inventory/:productId           # Stock actual
GET    /api/inventory                      # Listar inventario
POST   /api/inventory/adjust               # Ajuste manual
GET    /api/inventory/low-stock            # Productos bajo stock
GET    /api/inventory/movements/:productId # Historial de movimientos
POST   /api/inventory/reserve              # Reservar stock
POST   /api/inventory/release              # Liberar reserva
POST   /api/inventory/confirm-sale         # Confirmar venta
```

**Casos de uso:**
- Reserva al agregar al carrito
- Liberación al eliminar del carrito
- Confirmación al completar pago
- Ajustes manuales por operadores

---

### 4.5 Módulo de Báscula

**Ubicación:** `modules/scale/`

**Endpoints:**

```
GET    /api/scale/status                   # Estado de conexión
POST   /api/scale/connect                  # Conectar báscula
POST   /api/scale/disconnect               # Desconectar
GET    /api/scale/reading                  # Lectura actual
POST   /api/scale/calibrate                # Iniciar calibración
GET    /api/scale/calibration-history      # Historial de calibraciones
POST   /api/scale/test                     # Test de conexión
```

**Casos de uso:**
- Lectura de peso en tiempo real
- Cálculo de precio por peso
- Calibración de dispositivos

---

### 4.6 Módulo de Autenticación

**Ubicación:** `modules/auth/`

**Endpoints:**

```
POST   /api/auth/login                     # Iniciar sesión
POST   /api/auth/logout                    # Cerrar sesión
POST   /api/auth/refresh                   # Refresh token
GET    /api/auth/me                        # Perfil actual
POST   /api/auth/change-password           # Cambiar contraseña
POST   /api/auth/recover                   # Recuperar contraseña
POST   /api/auth/reset-password            # Resetear contraseña
```

**Casos de uso:**
- Login de operadores
- Gestión de sesiones JWT
- Recuperación de contraseña

---

### 4.7 Módulo de Operador

**Ubicación:** `modules/operator/`

**Endpoints:**

```
GET    /api/operator/dashboard             # Dashboard principal
GET    /api/operator/kiosks                # Lista de kiosks
GET    /api/operator/kiosks/:id/status     # Estado de kiosk
GET    /api/operator/sessions/active       # Sesiones activas
POST   /api/operator/assist/:sessionId     # Iniciar asistencia
POST   /api/operator/assist/:sessionId/end # Finalizar asistencia
POST   /api/operator/override/price        # Override de precio
POST   /api/operator/override/discount     # Aplicar descuento
POST   /api/operator/override/cancel       # Cancelar transacción
POST   /api/operator/override/item         # Eliminar item
GET    /api/operator/alerts                # Alertas activas
```

**Casos de uso:**
- Dashboard de monitoreo
- Asistencia remota a clientes
- Overrides y descuentos manuales

---

### 4.8 Módulo de Auditoría

**Ubicación:** `modules/audit/`

**Endpoints:**

```
GET    /api/audit                          # Listar eventos (con filtros)
GET    /api/audit/:id                      # Detalle de evento
GET    /api/audit/export                   # Exportar a CSV
GET    /api/audit/actions                  # Tipos de acciones
GET    /api/audit/users                    # Usuarios con actividad
```

**Tipos de acciones auditadas:**
- `auth.login`, `auth.logout`, `auth.failed`
- `product.create`, `product.update`, `product.delete`
- `price.override`
- `discount.apply`
- `inventory.adjust`, `inventory.override`
- `checkout.start`, `checkout.cancel`, `checkout.complete`
- `payment.initiate`, `payment.complete`, `payment.failed`, `payment.refund`
- `scale.calibrate`
- `operator.assist.start`, `operator.assist.end`

---

### 4.9 Módulo de Reportes

**Ubicación:** `modules/reports/`

**Endpoints:**

```
GET    /api/reports/sales                  # Reporte de ventas
GET    /api/reports/sales/daily            # Ventas diarias
GET    /api/reports/sales/hourly           # Ventas por hora
GET    /api/reports/products/top           # Productos más vendidos
GET    /api/reports/inventory/summary      # Resumen de inventario
GET    /api/reports/kiosks/performance     # Rendimiento por kiosk
GET    /api/reports/operators/activity     # Actividad de operadores
POST   /api/reports/export                 # Exportar reporte
```

**Casos de uso:**
- Métricas para dashboard
- Exportación de datos
- Análisis de rendimiento

---

## 5. Eventos Socket.io

### 5.1 Eventos del Cliente (Kiosk → Servidor)

```
connect                    # Conexión inicial
disconnect                 # Desconexión
cart:updated               # Carrito actualizado
product:scanned            # Producto escaneado
scale:reading              # Lectura de báscula
payment:completed          # Pago completado
assistance:requested       # Solicitud de ayuda
assistance:response        # Respuesta a asistencia
```

### 5.2 Eventos del Servidor (Servidor → Kiosk)

```
cart:sync                   # Sincronización de carrito
product:found               # Producto encontrado
product:not-found           # Producto no encontrado
inventory:update            # Actualización de inventario
scale:reading               # Lectura de peso
payment:status              # Estado de pago
operator:message            # Mensaje de operador
operator:override           # Override aplicado
session:timeout             # Timeout de sesión
alert:low-stock             # Alerta de stock bajo
```

### 5.3 Eventos del Servidor (Servidor → Operador)

```
kiosk:connected             # Kiosk conectado
kiosk:disconnected          # Kiosk desconectado
kiosk:status                # Estado de kiosk
session:started             # Sesión iniciada
session:completed           # Sesión completada
session:cancelled           # Sesión cancelada
assistance:requested        # Solicitud de ayuda
inventory:low-stock         # Stock bajo
scale:disconnected          # Báscula desconectada
```

---

## 6. Servicios Principales

### 6.1 ProductService

```typescript
@Injectable()
export class ProductService {
  findByBarcode(barcode: string): Promise<Product | null>;
  findById(id: string): Promise<Product | null>;
  findAll(filters: ProductFilters): Promise<{ items: Product[]; total: number }>;
  create(data: CreateProductDto): Promise<Product>;
  update(id: string, data: UpdateProductDto): Promise<Product>;
  delete(id: string): Promise<void>;
  search(query: string): Promise<Product[]>;
  getCategories(): Promise<string[]>;
  decrementStock(id: string, quantity: number): Promise<void>;
  incrementStock(id: string, quantity: number): Promise<void>;
}
```

### 6.2 CheckoutService

```typescript
@Injectable()
export class CheckoutService {
  createSession(kioskId: string): Promise<CheckoutSession>;
  getSession(id: string): Promise<CheckoutSession>;
  getActiveSessionByKiosk(kioskId: string): Promise<CheckoutSession | null>;
  addItem(sessionId: string, productId: string, quantity: number, weight?: number): Promise<Cart>;
  removeItem(sessionId: string, itemId: string): Promise<Cart>;
  updateQuantity(sessionId: string, itemId: string, quantity: number): Promise<Cart>;
  cancelSession(sessionId: string, reason: string): Promise<void>;
  abandonSession(sessionId: string): Promise<void>;
  calculateTotals(sessionId: string): Promise<Cart>;
  generateReceipt(sessionId: string): Promise<Receipt>;
}
```

### 6.3 InventoryService

```typescript
@Injectable()
export class InventoryService {
  getStock(productId: string): Promise<number>;
  reserveStock(productId: string, quantity: number, sessionId: string): Promise<void>;
  releaseStock(productId: string, quantity: number, sessionId: string): Promise<void>;
  confirmSale(productId: string, quantity: number, sessionId: string): Promise<void>;
  adjustStock(productId: string, quantity: number, operatorId: string, reason: string): Promise<void>;
  getLowStockProducts(): Promise<Product[]>;
  getMovements(productId: string): Promise<InventoryMovement[]>;
}
```

### 6.4 PaymentService

```typescript
@Injectable()
export class PaymentService {
  initiatePayment(sessionId: string, method: string): Promise<Payment>;
  confirmPayment(paymentId: string): Promise<Payment>;
  cancelPayment(paymentId: string): Promise<Payment>;
  refundPayment(paymentId: string): Promise<Payment>;
  getPaymentStatus(paymentId: string): Promise<Payment>;
  mockProcess(amount: number): Promise<PaymentResult>;
}
```

### 6.5 ScaleService

```typescript
@Injectable()
export class ScaleService {
  connect(kioskId: string): Promise<void>;
  disconnect(kioskId: string): Promise<void>;
  getStatus(kioskId: string): Promise<ScaleStatus>;
  getReading(kioskId: string): Promise<ScaleReading>;
  startCalibration(kioskId: string, referenceWeight: number): Promise<CalibrationResult>;
  getCalibrationHistory(kioskId: string): Promise<CalibrationRecord[]>;
  testConnection(kioskId: string): Promise<ScaleTestResult>;
}
```

---

## 7. Guards y Decorators

### 7.1 Auth Guards

```typescript
@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean;
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private roles: string[]) {}
  canActivate(context: ExecutionContext): boolean;
}

@Injectable()
export class KioskGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean;
}
```

### 7.2 Custom Decorators

```typescript
export const CurrentUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return data ? request.user[data] : request.user;
  },
);

export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

export const KioskId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.params.kioskId || request.body.kioskId;
  },
);
```

---

## 8. Consideraciones Técnicas

### 8.1 Códigos de Barras Soportados

- **EAN-13**: Estándar europeo, 13 dígitos
- **EAN-8**: Versión corta, 8 dígitos
- **UPC-A**: Estándar estadounidense, 12 dígitos
- **UPC-E**: Versión comprimida, 8 dígitos
- **Code 128**: Códigos internos de inventario

### 8.2 Validación de Productos

```typescript
@Injectable()
export class ProductValidator {
  validateBarcode(barcode: string): boolean {
    // Validar formato y checksum EAN-13/UPC-A
    const pattern = /^\d{12,13}$/;
    if (!pattern.test(barcode)) return false;
    return this.validateChecksum(barcode);
  }

  validatePrice(price: number, isWeightProduct: boolean): boolean {
    if (isWeightProduct && price <= 0) return false;
    if (!isWeightProduct && price < 0) return false;
    return true;
  }
}
```

### 8.3 Cálculo de Impuestos

```typescript
@Injectable()
export class TaxCalculator {
  calculateTax(subtotal: number, taxRate: number = 0.16): {
    subtotal: number;
    tax: number;
    total: number;
  } {
    const tax = Number((subtotal * taxRate).toFixed(2));
    const total = Number((subtotal + tax).toFixed(2));
    return { subtotal, tax, total };
  }
}
```

### 8.4 Manejo de Concurrencia

```typescript
@Injectable()
export class InventoryConcurrencyService {
  @Transaction()
  async reserveStock(
    @TransactionManager() manager: EntityManager,
    productId: string,
    quantity: number,
    sessionId: string,
  ): Promise<void> {
    const product = await manager.findOne(Product, {
      where: { id: productId },
      lock: { mode: 'pessimistic_write' },
    });

    if (product.stock < quantity) {
      throw new InsufficientStockException();
    }

    product.stock -= quantity;
    await manager.save(product);

    await manager.insert(InventoryMovement, {
      productId,
      type: 'reserve',
      quantity: -quantity,
      previousStock: product.stock + quantity,
      newStock: product.stock,
      sessionId,
    });
  }
}
```

---

## 9. Configuración de Infraestructura

### 9.1 Docker Compose

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: autopago
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./apps/backend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgres://postgres:postgres@postgres:5432/autopago
      - REDIS_URL=redis://redis:6379
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - ./apps/backend:/app
      - /app/node_modules

volumes:
  postgres_data:
  redis_data:
```

### 9.2 Variables de Entorno

```env
# Servidor
NODE_ENV=development
PORT=3000
API_PREFIX=api

# Base de Datos
DATABASE_URL=postgres://postgres:postgres@localhost:5432/autopago
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=autopago

# Redis
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRES_IN=7d

# Seguridad
BCRYPT_ROUNDS=10
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX=100

# Socket.io
SOCKET_CORS_ORIGIN=http://localhost:5173

# Báscula
SCALE_MIN_WEIGHT=10
SCALE_MAX_WEIGHT=30000
SCALE_STABILITY_THRESHOLD=5
SCALE_STABILITY_TIME=1000
```

---

## 10. Próximos Pasos

1. Configurar estructura del proyecto NestJS
2. Crear entidades de base de datos
3. Implementar módulo de productos (prioridad alta)
4. Implementar módulo de checkout
5. Implementar módulo de pagos mock
6. Configurar Socket.io para tiempo real
7. Implementar módulo de autenticación
8. Implementar módulo de inventario
9. Implementar módulo de báscula
10. Implementar módulo de auditoría
11. Crear tests unitarios (cobertura >70%)
12. Documentar API con Swagger

---

*Documento generado el 22 de marzo de 2026*
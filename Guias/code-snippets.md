# Code Snippets - Sistema de Autopago

Este documento contiene todas las referencias de código, estructuras y ejemplos técnicos mencionados en el plan maestro.

---

## 1. Estructura del Backend (NestJS)

```
src/
├── modules/
│   ├── products/
│   │   ├── products.controller.ts
│   │   ├── products.service.ts
│   │   ├── products.module.ts
│   │   ├── dto/
│   │   └── entities/
│   ├── checkout/
│   │   ├── checkout.controller.ts
│   │   ├── checkout.service.ts
│   │   └── checkout.module.ts
│   └── inventory/
│       ├── inventory.controller.ts
│       ├── inventory.service.ts
│       └── inventory.module.ts
├── common/
│   ├── decorators/
│   ├── filters/
│   ├── guards/
│   └── interceptors/
├── config/
└── app.module.ts
```

---

## 2. Estructura del Frontend (React)

```
src/
├── components/
│   ├── common/
│   │   ├── Button/
│   │   ├── Input/
│   │   └── Modal/
│   ├── checkout/
│   │   ├── ProductScanner/
│   │   ├── Cart/
│   │   └── Payment/
│   └── admin/
│       ├── Dashboard/
│       └── Inventory/
├── hooks/
│   ├── useCheckout.ts
│   ├── useProducts.ts
│   └── useSocket.ts
├── services/
│   ├── api.ts
│   └── socket.ts
├── stores/
│   └── checkoutStore.ts
├── pages/
│   ├── KioskPage.tsx
│   └── AdminPage.tsx
└── App.tsx
```

---

## 3. API Endpoints (REST)

```
POST   /api/v1/products/search        # Búsqueda de productos por código de barras
GET    /api/v1/products/:id           # Obtener producto por ID
POST   /api/v1/checkout/sessions      # Crear nueva sesión de checkout
GET    /api/v1/checkout/sessions/:id  # Obtener sesión activa
POST   /api/v1/checkout/sessions/:id/items  # Agregar item al carrito
DELETE /api/v1/checkout/sessions/:id/items/:itemId  # Eliminar item
POST   /api/v1/checkout/sessions/:id/payment  # Procesar pago
GET    /api/v1/inventory/:productId   # Consultar inventario
```

---

## 4. Eventos Socket.io

**Client → Server:**

- `checkout:join` - Unirse a sesión de checkout
- `cart:add` - Agregar producto al carrito
- `cart:remove` - Eliminar producto del carrito
- `payment:init` - Iniciar proceso de pago

**Server → Client:**

- `cart:updated` - Carrito actualizado
- `product:found` - Producto escaneado encontrado
- `product:not_found` - Producto no encontrado
- `payment:success` - Pago exitoso
- `payment:failed` - Pago fallido
- `inventory:low` - Alerta de inventario bajo

---

## 5. Modelo de Datos Principal (SQL)

```sql
-- Tablas principales del sistema
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku VARCHAR(50) UNIQUE NOT NULL,
    barcode VARCHAR(100),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    cost_price DECIMAL(10, 2),
    tax_rate DECIMAL(5, 2) DEFAULT 0,
    category_id UUID REFERENCES categories(id),
    inventory_count INTEGER DEFAULT 0,
    min_stock INTEGER DEFAULT 10,
    is_weighted BOOLEAN DEFAULT FALSE,
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE checkout_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kiosk_id UUID NOT NULL,
    customer_id UUID REFERENCES customers(id),
    status VARCHAR(20) DEFAULT 'active',
    subtotal DECIMAL(10, 2) DEFAULT 0,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) DEFAULT 0,
    payment_method VARCHAR(50),
    payment_reference VARCHAR(255),
    started_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES checkout_sessions(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    weight_kg DECIMAL(8, 3),
    discount_id UUID REFERENCES promotions(id),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES checkout_sessions(id),
    type VARCHAR(50) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE inventory_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id),
    movement_type VARCHAR(20) NOT NULL,
    quantity_change INTEGER NOT NULL,
    previous_count INTEGER NOT NULL,
    new_count INTEGER NOT NULL,
    reference_type VARCHAR(50),
    reference_id UUID,
    operator_id UUID,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    user_role VARCHAR(50),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id UUID,
    old_value JSONB,
    new_value JSONB,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 6. Integración de Báscula (TypeScript)

```typescript
interface ScaleIntegration {
  connect(): Promise<void>;
  disconnect(): void;
  onWeightChange(callback: (weight: WeightReading) => void): void;
  getCurrentWeight(): Promise<WeightReading>;
  tare(): Promise<void>;
}

interface WeightReading {
  weightKg: number;
  unit: 'kg' | 'lb';
  timestamp: Date;
  isStable: boolean;
}
```

---

## 7. Gestión de Sesiones (TypeScript)

```typescript
interface CheckoutSession {
  id: string;
  kioskId: string;
  status: SessionStatus;
  items: CartItem[];
  reservedInventory: Map<productId, quantity>;
  startedAt: Date;
  expiresAt: Date;
}

class SessionManager {
  async createSession(kioskId: string): Promise<CheckoutSession>;
  async extendSession(sessionId: string): Promise<void>;
  async expireSession(sessionId: string): Promise<void>;
  async recoverOrphanedSessions(): Promise<void>;
}
```

---

## 8. Sistema de Autenticación JWT (NestJS)

```typescript
@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = extractTokenFromHeader(request);
    const payload = this.jwtService.verify(token);
    request.user = payload;
    return true;
  }
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.roles?.includes(role));
  }
}
```

---

## 9. Estructura de Microservicios

```
├── services/
│   ├── api-gateway/           # Kong/NestJS Gateway
│   ├── auth-service/          # Autenticación centralizada
│   ├── product-service/       # Catálogo de productos
│   ├── checkout-service/      # Sesiones de checkout
│   ├── inventory-service/     # Gestión de inventario
│   ├── payment-service/       # Procesamiento de pagos
│   ├── receipt-service/       # Generación de recibos
│   ├── notification-service/  # Notificaciones
│   └── analytics-service/     # Métricas y reportes
├── shared/
│   ├── common/                # Librerías compartidas
│   ├── contracts/             # Contratos de comunicación
│   └── config/                # Configuraciones centralizadas
```

---

## 10. Sistema de Promociones (TypeScript)

```typescript
interface Promotion {
  id: UUID;
  code: string;
  type: 'percentage' | 'fixed' | 'bogo';
  value: decimal;
  minPurchase?: decimal;
  maxDiscount?: decimal;
  startDate: Date;
  endDate: Date;
  applicableProducts?: UUID[];
  applicableCategories?: UUID[];
  stackable: boolean;
  usageLimit?: integer;
  usageCount: integer;
}

class PromotionEngine {
  validateCode(code: string, cart: Cart): PromotionResult;
  applyPromotion(promotion: Promotion, cart: Cart): Cart;
  calculateDiscount(promotion: Promotion, cart: Cart): decimal;
  trackUsage(promotionId: UUID, customerId: UUID): void;
}
```

---

## 11. Documentación API (OpenAPI/Swagger)

```typescript
/**
 * @swagger
 * /api/v1/products:
 *   get:
 *     summary: Obtiene lista de productos
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de productos
 */
```

---

## 12. Property-Based Testing (TypeScript)

```typescript
import { property, integer } from 'jsverify';

describe('PromotionEngine', () => {
  property(
    'discount never exceeds cart total',
    forall({ cart: cartArbitrary }, (gen) => {
      const cart = gen.cart;
      const promotion = createValidPromotion();
      const result = engine.applyPromotion(promotion, cart);
      return result.discount <= cart.subtotal;
    })
  );

  property(
    'quantity updates preserve cart integrity',
    forall({ cart: cartArbitrary, productId: productArbitrary }, (gen) => {
      const cart = gen.cart;
      const productId = gen.productId;
      const newQuantity = integer(0, 100).generate();
      const updatedCart = cartService.updateQuantity(cart, productId, newQuantity);
      return calculateCartTotal(updatedCart) >= 0;
    })
  );
});
```

---

## 13. Pruebas de Carga (k6)

```typescript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up
    { duration: '5m', target: 100 }, // Stay at 100
    { duration: '2m', target: 500 }, // Ramp up to 500
    { duration: '5m', target: 500 }, // Stay at 500
    { duration: '2m', target: 0 }, // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  const res = http.post(`${BASE_URL}/api/v1/checkout/sessions`);
  check(res, { 'session created': (r) => r.status === 201 });
  sleep(1);
}
```

---

## 14. Stack de Monitoreo

```
├── Prometheus          # Métricas
├── Grafana            # Dashboards
├── ELK Stack          # Logs
│   ├── Elasticsearch
│   ├── Logstash
│   └── Kibana
└── Jaeger             # Distributed tracing

// Métricas clave
- checkout_session_duration_seconds
- products_scanned_total
- payment_processing_seconds
- inventory_updates_total
- kiosk_online_status
- socketio_connections_active
```

---

## 15. Pipeline CI/CD (GitHub Actions)

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run tests
        run: npm test -- --coverage
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Build Docker images
        run: docker-compose build
      - name: Push images
        run: |
          docker push ${{ secrets.REGISTRY }}/backend:${{ github.sha }}
          docker push ${{ secrets.REGISTRY }}/frontend:${{ github.sha }}

  deploy-staging:
    needs: build
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - name: Deploy to staging
        run: kubectl apply -f k8s/staging/

  deploy-production:
    needs: deploy-staging
    runs-on: ubuntu-latest
    environment: production
    steps:
      - name: Deploy to production
        run: kubectl apply -f k8s/production/
```

---

## 16. Runbook: Recuperación de Kiosk Fallido

```markdown
# Runbook: Recuperación de Kiosk Fallido

## Síntomas

- El kiosk no responde a requests
- Conexión Socket.io perdida
- Usuarios reportan problemas

## Pasos de Recuperación

1. Verificar estado del pod
   kubectl get pods -n checkout | grep kiosk-03

2. Revisar logs
   kubectl logs -n checkout kiosk-03-xxx --tail=100

3. Si el pod está en estado Error:
   kubectl delete pod -n checkout kiosk-03-xxx

   # El Deployment recreará el pod automáticamente

4. Verificar recuperación
   kubectl get pods -n checkout | grep kiosk-03
   kubectl logs -n checkout kiosk-03-new --tail=50

5. Si el problema persiste:
   - Revisar eventos del cluster
   - Verificar recursos de memoria/CPU
   - Contactar a equipo de infraestructura
```

---

## 17. Arquitectura de Integración con Repositorios Existentes

```
┌─────────────────────────────────────────────────────────────────┐
│                    CAPA DE ADAPTACIÓN                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │ Adapter     │  │ Adapter     │  │ Adapter     │
│  │ Repository A│  │ Repository B│  │ Repository C│
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘
└─────────┼────────────────┼────────────────┼────────────────────┘
          │                │                │
    ┌─────▼─────┐    ┌─────▼─────┐    ┌─────▼─────┐
    │ Interface │    │ Interface │    │ Interface │
    │   A       │    │   B       │    │   C       │
    └─────┬─────┘    └─────┬─────┘    └─────┬─────┘
          │                │                │
    ┌─────▼───────────────────────────────────────▼─────┐
    │              NÚCLEO DEL SISTEMA                   │
    │              (Nuevo Desarrollo)                    │
    └───────────────────────────────────────────────────┘
```

---

## 18. Arquitectura de Event Bus

```
┌─────────────────────────────────────────────────────────────┐
│                    EVENT BUS                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  RabbitMQ   │  │   Kafka     │  │   Redis     │         │
│  │  (Primary)  │  │  (Streams)  │  │  (Pub/Sub)  │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘

// Eventos del dominio
- product.created
- product.updated
- product.deleted
- inventory.reserved
- inventory.confirmed
- inventory.released
- checkout.started
- checkout.item_added
- checkout.completed
- payment.processed
- payment.failed
```

---

## 19. Diagrama de Arquitectura de Alto Nivel

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENTE (React.js)                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────────┐  │
│  │  Kiosk UI       │  │  Admin Dashboard│  │  Mobile App (PWA)           │  │
│  │  (Touch Screen) │  │  (Gestión)      │  │  (Opcional)                 │  │
│  └────────┬────────┘  └────────┬────────┘  └──────────────┬──────────────┘  │
└───────────┼────────────────────┼───────────────────────────┼──────────────────┘
            │                    │                           │
            └────────────────────┼───────────────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │     NGINX / Traefik      │  (Load Balancer & Reverse Proxy)
                    │     Puerto 80/443        │
                    └────────────┬────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
┌────────▼────────┐  ┌──────────▼──────────┐  ┌─────────▼─────────┐
│   Frontend      │  │     Backend         │  │   Socket.io       │
│   (React)       │  │   (NestJS)          │  │   Server          │
│   Puerto 3000   │  │   Puerto 3001       │  │   Puerto 3002     │
└─────────────────┘  └──────────┬──────────┘  └───────────────────┘
                                │
         ┌──────────────────────┼──────────────────────┐
         │                      │                      │
┌────────▼────────┐  ┌─────────▼─────────┐  ┌─────────▼─────────┐
│   PostgreSQL    │  │   Redis           │  │   External APIs   │
│   (Puerto 5432) │  │   (Cache/Session) │  │   (Payment, SMS)  │
│   Datos         │  │   Puerto 6379     │  │                   │
└─────────────────┘  └───────────────────┘  └───────────────────┘
```

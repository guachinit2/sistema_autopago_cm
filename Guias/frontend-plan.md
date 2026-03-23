# Plan de Frontend: Sistema de Autopago

## Resumen

Este documento detalla el plan de desarrollo del frontend para el sistema de autopago, incluyendo las tecnologías a utilizar, la estructura de pantallas por fase, los componentes reutilizables y el flujo de usuario.

---

## Estado del desarrollo (actualizado)

| Fase | Pantalla | Estado |
|------|----------|--------|
| **Fase 1** | **4.1** Pantalla Principal (HomePage) | ✅ Completado |
| | **4.2** Pantalla de Escaneo (ScanPage) | ✅ Completado |
| | **4.3** Pantalla del Carrito (CartPage) | ❌ Eliminada — Ir directo a pagos |
| | **4.4** Pantalla de Selección de Pago | ✅ Completado |
| | **4.5** Pantalla de Confirmación de Pago | ✅ Completado |
| | **4.5.5** Pantalla de Ingreso de Documento de Identidad | 🔲 Siguiente |
| | **4.6** Pantalla de Recibo Digital | 🔲 Pendiente |
| **Fase 2** | 4.7–4.10 (Pesaje, Operador) | 🔲 Pendiente |
| **Fase 3** | 4.11–4.15 (Admin, Reportes) | 🔲 Pendiente |

**Fase actual:** 4.5.5 — Pantalla de Ingreso de Documento de Identidad

**Flujo actual:** Home → ID (4.5.5) → Escaneo → Pagos → Confirmación → Recibo *(CartPage eliminada)*

---

## 1. Stack Tecnológico

### 1.1 Core

- **React 18** - Framework principal
- **Vite** - Build tool y dev server
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Framework de estilos
- **shadcn/ui** - Biblioteca de componentes UI

### 1.2 Estado y Comunicación

- **Zustand** - Gestión de estado global
- **Axios** - Cliente HTTP para API REST
- **Socket.io-client** - Comunicación en tiempo real

### 1.3 Funcionalidades Específicas

- **html5-qrcode** - Escaneo de códigos de barras con cámara
- **date-fns** - Manipulación de fechas y formatos
- **Recharts** - Gráficos para métricas y reportes

---

## 2. Estructura de Proyecto

```
apps/frontend/
├── src/
│   ├── components/
│   │   ├── ui/              # Componentes base shadcn/ui
│   │   ├── kiosk/           # Componentes específicos de kiosk
│   │   ├── operator/        # Componentes de operador
│   │   └── shared/          # Componentes compartidos
│   ├── pages/
│   │   ├── kiosk/           # Pantallas del kiosk público
│   │   ├── operator/        # Pantallas del operador
│   │   └── admin/           # Pantallas de administración
│   ├── hooks/
│   │   ├── useCart.ts       # Hook del carrito
│   │   ├── useScanner.ts    # Hook del escáner
│   │   ├── useScale.ts      # Hook de báscula
│   │   └── useSocket.ts     # Hook de Socket.io
│   ├── stores/
│   │   ├── useCartStore.ts  # Estado del carrito
│   │   ├── useProductStore.ts
│   │   ├── useSessionStore.ts
│   │   └── useOperatorStore.ts
│   ├── services/
│   │   ├── api.ts           # Cliente Axios
│   │   ├── productService.ts
│   │   ├── checkoutService.ts
│   │   └── paymentService.ts
│   ├── types/
│   │   └── index.ts         # Tipos TypeScript
│   ├── utils/
│   │   └── formatters.ts    # Funciones de formato
│   ├── App.tsx
│   └── main.tsx
```

---

## 3. Componentes UI Reutilizables

### 3.1 Componentes Base (shadcn/ui)

- Button - Botones táctiles
- Card - Contenedores de contenido
- Input - Campos de texto
- Label - Etiquetas de formulario
- Table - Tablas de datos
- Dialog - Modales
- Toast - Notificaciones
- Badge - Etiquetas de estado

### 3.2 Componentes de Kiosk

```typescript
// Componentes específicos para interfaz táctil

interface KioskButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  onClick: () => void;
}

interface KioskCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onRemoveFromCart: (productId: string) => void;
  quantity?: number;
}

interface QuantityControlProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  size?: 'sm' | 'md' | 'lg';
}

interface ProductScannerProps {
  onScan: (code: string) => void;
  onError?: (error: string) => void;
  enabled?: boolean;
}

interface WeightDisplayProps {
  weight: number; // en gramos
  unit: 'g' | 'kg';
  stable: boolean;
  pricePerKg?: number;
  onConfirm: (weight: number) => void;
}

interface CartItemProps {
  item: CartItem;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
}

interface CartSummaryProps {
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  onCheckout: () => void;
}
```

---

## 4. Pantallas por Fase

### FASE 1: MVP (Semanas 1-6)

#### 4.1 Pantalla Principal del Kiosk

**Ubicación:** `pages/kiosk/HomePage.tsx`

**Elementos:**

- Logo del mercado
- Botón grande "INICIAR COMPRA" (mínimo 120px de altura)
- Instrucciones breves en 3 pasos
- Botón de ayuda accesible
- Footer con hora y fecha

**Comportamiento:**

- Timeout de inactividad (5 min) → pantalla de ahorro
- Sonido de confirmación al iniciar
- Botón "INICIAR COMPRA" → navega a **Pantalla de Ingreso de Documento (4.5.5)**, no directo a escaneo

**Estados:**

- Idle (pantalla de bienvenida)
- Active (sesión activa)
- Timeout (pantalla de ahorro)

---

#### 4.2 Pantalla de Escaneo

**Ubicación:** `pages/kiosk/ScanPage.tsx`

**Elementos:**

- Vista de cámara en tiempo real (html5-qrcode)
- Overlay de guía para código de barras
- Indicador de enfoque
- Feedback visual al detectar código:
  - Verde: código válido
  - Rojo: código no encontrado
  - Amarillo: código parcial
- Input manual de código (fallback)
- Botón para escáner USB físico
- Botón "Volver" (a Home o pantalla anterior)
- Botón "Confirmar" → **va directo a Pantalla de Pagos** (no a carrito)

**Comportamiento:**

- Escaneo continuo mientras la cámara está activa
- Transición automática al detectar código válido
- Sonido de beep al detectar código
- Vibración en dispositivos móviles

**Fallback USB:**

- Detección automática de escáner USB
- Listener de eventos de teclado
- Parsing de códigos EAN/UPC

---

#### 4.3 Pantalla del Carrito — **ELIMINADA**

> **Nota:** Esta pantalla ha sido eliminada del flujo. El carrito se visualiza en el sidebar de la Pantalla de Escaneo (4.2). Al hacer clic en "Confirmar", el usuario va **directo a la Pantalla de Selección de Pago (4.4)**.

---

#### 4.4 Pantalla de Selección de Pago

**Ubicación:** `pages/kiosk/PaymentMethodPage.tsx`

**Elementos:**

- Título "SELECCIONA MÉTODO DE PAGO"
- Grid de opciones (2x2):
  - TARJETA (icono crédito)
  - EFECTIVO (icono dinero)
  - PAGO MÓVIL (icono QR)
  - OTROS (dropdown)
- Cada opción: botón grande con icono y nombre
- Botón "VOLVER" (a pantalla de escaneo)

**Comportamiento:**

- Selección única
- Transición a pantalla de confirmación
- Sonido de selección

---

#### 4.5 Pantalla de Confirmación de Pago

**Ubicación:** `pages/kiosk/PaymentConfirmPage.tsx`

**Elementos:**

- Resumen de compra (mismo que carrito)
- Total a pagar destacado
- Botón "CONFIRMAR PAGO" (grande, verde)
- Botón "CANCELAR" (rojo)
- Información del método de pago seleccionado

**Comportamiento:**

- Loading spinner durante procesamiento
- Timeout de 30 segundos para confirmar
- Sonido de procesamiento

---

#### 4.5.5 Pantalla de Ingreso de Documento de Identidad

**Ubicación:** `pages/kiosk/IdInputPage.tsx`

**Elementos:**

- Título "Ingrese su documento de identidad"
- Input numérico para documento venezolano:
  - Máximo 8 dígitos
  - Formato: solo números (ejemplo: 26754321)
  - Placeholder o hint: "Cédula de identidad"
- Botón "Continuar" (deshabilitado hasta ingresar documento válido)
- Botón "Volver" a Home
- Mensaje de validación si el formato es incorrecto

**Comportamiento:**

- Validación en tiempo real: solo números, máx. 8 caracteres
- Al ingresar documento válido y pulsar Continuar → navegar a **Pantalla de Escaneo (4.2)**
- Persistir documento en sesión/store para el recibo y trazabilidad

**Flujo:**

- **Home (4.1)** → Usuario hace clic en "Iniciar compra" → **ID Input (4.5.5)** → Documento válido → **Escaneo (4.2)**

---

#### 4.6 Pantalla de Recibo Digital

**Ubicación:** `pages/kiosk/ReceiptPage.tsx`

**Elementos:**

- Header "COMPRA COMPLETADA"
- Lista de productos comprados
- Desglose: subtotal, IVA, total
- Fecha y hora de la transacción
- Número de transacción
- Mensaje de agradecimiento
- Botón "NUEVA COMPRA" (grande)
- Opción "ENVIAR RECIBO POR EMAIL"

**Comportamiento:**

- Animación de impresión
- Sonido de impresión
- Timeout de 60 segundos para nueva compra

---

### FASE 2: Multi-kiosk y Pesaje (Semanas 7-12)

#### 4.7 Pantalla de Pesaje de Productos

**Ubicación:** `pages/kiosk/WeightPage.tsx`

**Elementos:**

- Display grande de peso actual:
  - Valor numérico (kg con 3 decimales)
  - Indicador visual de estabilidad
  - Animación de carga
- Feedback contextual:
  - "Coloque el producto en la báscula"
  - "Espere a que se estabilice el peso"
  - "Peso óptimo - Listo"
  - "Peso insuficiente - Agregue más"
  - "Peso excesivo - Retire producto"
- Precio calculado en tiempo real
- Botón "AGREGAR AL CARRITO"
- Botón "CANCELAR"

**Comportamiento:**

- Actualización de peso cada 100ms
- Detección de estabilidad (variación < 5g por 1s)
- Cálculo automático: precio × peso
- Timeout de 30 segundos sin peso estable
- Alerta a operador si peso máximo excedido

**Indicador de estabilidad:**

- Rojo: inestable
- Amarillo: estabilizando
- Verde: estable

---

#### 4.8 Pantalla de Login de Operador

**Ubicación:** `pages/operator/LoginPage.tsx`

**Elementos:**

- Logo
- Título "ACCESO DE OPERADOR"
- Input: USUARIO
- Input: CONTRASEÑA
- Botón "INGRESAR"
- Checkbox "Recordar sesión"
- Link "¿Olvidó su contraseña?"
- Botón "VOLVER"

**Comportamiento:**

- Validación de campos
- Loading durante autenticación
- Error visual si credenciales inválidas
- Redirect a dashboard si exitoso
- Persistencia de sesión con JWT

---

#### 4.9 Pantalla de Dashboard de Operador

**Ubicación:** `pages/operator/DashboardPage.tsx`

**Elementos:**

- Header con usuario logueado y logout
- Grid de métricas:
  - Kiosks activos (número)
  - Transacciones en curso
  - Ingresos del día
  - Alertas pendientes
- Lista de kiosks con estado:
  - Verde: operativo
  - Amarillo: requiere atención
  - Rojo: error
  - Gris: desconectado
- Lista de transacciones activas:
  - Kiosk ID
  - Tiempo transcurrido
  - Total actual
  - Acciones: "Ver", "Asistir"
- Panel de alertas:
  - Inventario bajo
  - Errores de hardware
  - Transacciones sospechosas

**Comportamiento:**

- Actualización en tiempo real via Socket.io
- Filtros por estado
- Búsqueda por kiosk ID
- Click en kiosk → pantalla de asistencia

---

#### 4.10 Pantalla de Asistencia Remota

**Ubicación:** `pages/operator/AssistancePage.tsx`

**Elementos:**

- Header con kiosk ID y tiempo de sesión
- Vista del carrito del cliente (solo lectura)
- Panel de controls de override:
  - Aplicar descuento (% o monto fijo)
  - Modificar precio de item
  - Eliminar item
  - Cancelar transacción
  - Finalizar transacción por el cliente
- Campo de razón para cada override
- Botones de acción:
  - "ENVIAR AL KIOSK"
  - "CERRAR SESIÓN"
- Chat de comunicación con cliente (opcional)

**Comportamiento:**

- Preview de cambios antes de enviar
- Confirmación para acciones destructivas
- Registro de todas las acciones para auditoría
- Timeout de sesión de asistencia

---

### FASE 3: Administración (Semanas 13-18)

#### 4.11 Pantalla de Gestión de Productos

**Ubicación:** `pages/admin/ProductsPage.tsx`

**Elementos:**

- Header con título y botón "NUEVO PRODUCTO"
- Buscador por nombre, código, SKU
- Filtros por categoría
- Tabla de productos:
  - Código de barras
  - Nombre
  - Categoría
  - Precio
  - ¿Por peso?
  - Stock
  - Acciones: Editar, Eliminar
- Modal de alta/edición:
  - Código de barras
  - Nombre
  - Categoría (dropdown)
  - Precio
  - ¿Producto por peso?
  - Precio por kg (si aplica)
  - Stock inicial
  - Imagen (upload)

**Comportamiento:**

- Búsqueda en tiempo real
- Ordenación por columnas
- Paginación
- Validación de código único
- Preview de imagen

---

#### 4.12 Pantalla de Gestión de Inventario

**Ubicación:** `pages/admin/InventoryPage.tsx`

**Elementos:**

- Header con métricas rápidas
- Tabla de inventario:
  - Producto
  - Stock actual
  - Stock mínimo
  - Estado (OK/BAJO/AGOTADO)
  - Último movimiento
- Panel de ajuste manual:
  - Producto (dropdown)
  - Cantidad (+/-)
  - Motivo (dropdown)
  - Comentario
- Historial de movimientos:
  - Fecha
  - Producto
  - Cambio
  - Motivo
  - Usuario

**Comportamiento:**

- Resaltado de productos bajo stock
- Cálculo automático de estado
- Exportación a CSV
- Filtros por fecha y motivo

---

#### 4.13 Pantalla de Configuración de Báscula

**Ubicación:** `pages/admin/ScaleConfigPage.tsx`

**Elementos:**

- Estado de conexión actual
- Botón "CONECTAR BÁSCULA"
- Botón "DESCONECTAR"
- Panel de test:
  - Lectura actual
  - Botón "LEER PESO"
- Panel de calibración:
  - Peso de referencia (input)
  - Botón "INICIAR CALIBRACIÓN"
  - Resultado de calibración
- Historial de calibraciones

**Comportamiento:**

- Detección automática de dispositivo
- Timeout de conexión
- Alertas de desconexión
- Registro de resultados de calibración

---

#### 4.14 Pantalla de Reportes de Ventas

**Ubicación:** `pages/admin/ReportsPage.tsx`

**Elementos:**

- Filtros:
  - Fecha desde/hasta
  - Categoría
  - Producto
  - Kiosk
- Selector de rango rápido: Hoy, Esta semana, Este mes
- Gráfico de transacciones por hora
- Gráfico de productos más vendidos
- Tabla de resumen:
  - Total de transacciones
  - Ingresos totales
  - Ticket promedio
  - Productos más vendidos
- Botones de exportación:
  - CSV
  - Excel
  - PDF

**Comportamiento:**

- Actualización al aplicar filtros
- Animaciones en gráficos
- Descarga de reportes

---

#### 4.15 Pantalla de Auditoría

**Ubicación:** `pages/admin/AuditPage.tsx`

**Elementos:**

- Filtros:
  - Usuario
  - Acción
  - Fecha
  - Kiosk
- Timeline de eventos:
  - Timestamp
  - Usuario
  - Acción
  - Detalle
  - IP
- Detalle expandible por evento
- Exportación a CSV

**Tipos de acciones auditadas:**

- Login/Logout
- Cambio de precio
- Descuento manual
- Override de inventario
- Cancelación de transacción
- Acceso a datos sensibles

---

## 5. Flujo de Usuario Principal

```
FLUJO DE COMPRA:
Principal → Escaneo → Carrito → Pago → Confirmación → Recibo → Principal

FLUJO DE PESAJE:
Carrito → Producto × Peso → Pantalla Pesaje → Peso estable → Precio calculado → Carrito

FLUJO DE OPERADOR:
Login → Dashboard → Selección Kiosk → Asistencia
```

---

## 6. Tipos TypeScript Principales

```typescript
export interface Product {
  id: string;
  barcode: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  pricePerKg?: number;
  isWeightProduct: boolean;
  image?: string;
  stock: number;
  minStock: number;
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  weight?: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Cart {
  id: string;
  kioskId: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'active' | 'pending_payment' | 'completed' | 'cancelled';
}

export interface CheckoutSession {
  id: string;
  kioskId: string;
  cart: Cart;
  paymentMethod?: string;
  paymentStatus: 'pending' | 'processing' | 'completed' | 'failed';
  operatorId?: string;
  startedAt: Date;
}

export interface Operator {
  id: string;
  username: string;
  role: 'operator' | 'admin';
  kioskIds: string[];
}

export interface AuditEvent {
  id: string;
  userId: string;
  userRole: string;
  action: string;
  details: Record<string, any>;
  kioskId?: string;
  ipAddress: string;
  timestamp: Date;
}

export interface ScaleReading {
  weight: number;
  stable: boolean;
  timestamp: Date;
}

export interface KioskStatus {
  kioskId: string;
  status: 'online' | 'offline' | 'error' | 'maintenance';
  activeSession?: CheckoutSession;
  lastHeartbeat: Date;
  scaleConnected: boolean;
  alerts: string[];
}
```

---

## 7. Servicios de API

```typescript
export const productService = {
  getByBarcode(barcode: string): Promise<Product>;
  getById(id: string): Promise<Product>;
  search(query: string): Promise<Product[]>;
  create(product: Partial<Product>): Promise<Product>;
  update(id: string, product: Partial<Product>): Promise<Product>;
  delete(id: string): Promise<void>;
};

export const checkoutService = {
  createSession(kioskId: string): Promise<CheckoutSession>;
  addItem(sessionId: string, productId: string, quantity: number): Promise<Cart>;
  removeItem(sessionId: string, itemId: string): Promise<Cart>;
  updateQuantity(sessionId: string, itemId: string, quantity: number): Promise<Cart>;
  getSession(sessionId: string): Promise<CheckoutSession>;
  cancelSession(sessionId: string, reason: string): Promise<void>;
};

export const paymentService = {
  initiatePayment(sessionId: string, method: string): Promise<Payment>;
  confirmPayment(paymentId: string): Promise<Payment>;
  cancelPayment(paymentId: string): Promise<void>;
  getPaymentStatus(paymentId: string): Promise<Payment>;
};
```

---

## 8. Hooks Personalizados

```typescript
export function useCart(sessionId: string) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addItem = async (productId: string, quantity: number) => {
    setLoading(true);
    try {
      const updatedCart = await checkoutService.addItem(sessionId, productId, quantity);
      setCart(updatedCart);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (itemId: string) => {
    /* ... */
  };
  const updateQuantity = async (itemId: string, quantity: number) => {
    /* ... */
  };

  return { cart, loading, error, addItem, removeItem, updateQuantity };
}

export function useScanner(onScan: (code: string) => void) {
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startScanning = async () => {
    /* ... */
  };
  const stopScanning = () => {
    /* ... */
  };

  return { isActive, error, startScanning, stopScanning };
}

export function useScale(kioskId: string) {
  const [reading, setReading] = useState<ScaleReading | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    socket.on('scale:reading', (data: ScaleReading) => {
      setReading(data);
    });
    return () => {
      socket.off('scale:reading');
    };
  }, [kioskId]);

  return { reading, connected };
}
```

---

## 9. Consideraciones de UX/UI

### 9.1 Diseño Táctil

- Buttons mínimos: 48x48px, ideal 64x64px
- Espaciado entre elementos: 16px mínimo
- Fonts: mínimo 16px para texto, 24px para headers
- Colores: contraste WCAG AA mínimo
- Feedback visual: hover, active, disabled states

### 9.2 Accesibilidad

- Labels para todos los inputs
- ARIA attributes para componentes personalizados
- Navegación por teclado
- Soporte para lectores de pantalla
- Contraste de colores

### 9.3 Rendimiento

- Lazy loading de páginas
- Memoización de componentes
- Optimización de imágenes
- Debouncing en búsquedas
- Virtualización en listas largas

### 9.4 Modo Offline

- Service Worker para assets estáticos
- Cola de operaciones para sincronización
- Indicador de estado de conexión
- Sincronización automática al reconectar

---

## 10. Próximos Pasos

1. Configurar estructura del proyecto
2. Instalar dependencias (shadcn/ui, axios, socket.io-client)
3. Crear componentes base (KioskButton, KioskCard)
4. Implementar servicios de API
5. Desarrollar pantallas de Fase 1
6. Testing de flujos principales

---

_Documento generado el 22 de marzo de 2026_

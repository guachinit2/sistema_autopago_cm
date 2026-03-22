# Guía de Implementación: Repositorios y Librerías

Esta guía detalla cómo integrar los repositorios de GitHub mencionados en el plan maestro del sistema de autopago.

---

## 1. Estructura del Repositorio Principal

### 1.1 Monorepo con Turborepo

```
self-checkout-system/
├── apps/
│   ├── frontend/          # React + Vite
│   └── backend/           # NestJS
├── packages/
│   ├── ui-components/     # Componentes compartidos
│   ├── utils/             # Utilidades compartidas
│   └── config/            # Configuraciones TypeScript, ESLint
├── libs/                  # Librerías externas integradas
│   ├── scanner/           # Wrapper de html5-qrcode
│   ├── printer/           # Wrapper de node-escpos
│   └── payments/          # Adaptadores de pago
├── docker/
├── docker-compose.yml
├── turbo.json
├── package.json
└── tsconfig.json
```

### 1.2 Inicialización del Repositorio

```bash
# Crear estructura base
mkdir self-checkout-system && cd self-checkout-system

# Inicializar monorepo con Turborepo
npm init -y
npm install -D turbo

# Crear estructura de directorios
mkdir -p apps/{frontend,backend} packages/{ui-components,utils,config} libs/{scanner,printer,payments}

# Configurar package.json raíz
{
  "name": "self-checkout-system",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*",
    "libs/*"
  ],
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint"
  }
}
```

---

## 2. Integración de Librerías por Categoría

### 2.1 Escaneo de Códigos de Barras

**Librería:** `html5-qrcode` (mebjas/html5-qrcode)

**Instalación:**
```bash
cd apps/frontend
npm install html5-qrcode
```

**Implementación del Wrapper:**

```typescript
// libs/scanner/src/index.ts
import { Html5Qrcode, Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';

export interface ScannerConfig {
  formats?: Html5QrcodeSupportedFormats[];
  fps?: number;
  qrbox?: { width: number; height: number };
  aspectRatio?: number;
}

export interface ScanResult {
  text: string;
  format: string;
  timestamp: Date;
}

export class BarcodeScanner {
  private scanner: Html5Qrcode | null = null;
  private onScanCallback: ((result: ScanResult) => void) | null = null;

  async initialize(config: ScannerConfig = {}): Promise<void> {
    this.scanner = new Html5Qrcode('reader', {
      formatsToSupport: config.formats || [
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.UPC_E,
      ],
    });
  }

  async startCamera(
    elementId: string,
    onScan: (result: ScanResult) => void
  ): Promise<void> {
    if (!this.scanner) {
      await this.initialize();
    }

    this.onScanCallback = onScan;

    await this.scanner!.start(
      { facingMode: 'environment' },
      {
        fps: 10,
        qrbox: { width: 250, height: 150 },
      },
      (decodedText) => {
        const result: ScanResult = {
          text: decodedText,
          format: 'auto-detect',
          timestamp: new Date(),
        };
        this.onScanCallback?.(result);
      },
      () => {} // Ignore continuous scanning
    );
  }

  async stopCamera(): Promise<void> {
    if (this.scanner && this.scanner.isScanning) {
      await this.scanner.stop();
    }
  }

  async scanFromImage(file: File): Promise<ScanResult | null> {
    if (!this.scanner) {
      await this.initialize();
    }

    try {
      const result = await this.scanner!.scanFile(file, true);
      return {
        text: result[0].decodedText,
        format: result[0].format?.formatName || 'unknown',
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('No se encontró código de barras en la imagen:', error);
      return null;
    }
  }
}

export const scanner = new BarcodeScanner();
```

**Uso en Componente React:**

```typescript
// apps/frontend/src/components/ProductScanner.tsx
import { useEffect, useState, useCallback } from 'react';
import { scanner } from '@self-checkout/scanner';

export function ProductScanner({ onProductScanned }: { onProductScanned: (code: string) => void }) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleScan = useCallback((result: ScanResult) => {
    onProductScanned(result.text);
    // Vibración para feedback háptico
    if (navigator.vibrate) {
      navigator.vibrate(100);
    }
  }, [onProductScanned]);

  useEffect(() => {
    if (isScanning) {
      scanner.startCamera('scanner-container', handleScan).catch(setError);
    }

    return () => {
      scanner.stopCamera();
    };
  }, [isScanning, handleScan]);

  return (
    <div className="scanner-container">
      {error && <div className="error">{error}</div>}
      <div id="scanner-container" style={{ width: '100%' }} />
      {!isScanning && (
        <button onClick={() => setIsScanning(true)}>
          Iniciar Escáner
        </button>
      )}
    </div>
  );
}
```

---

### 2.2 Interfaz de Usuario Táctil

**Librería:** `shadcn/ui` + `radix-ui/react primitives`

**Instalación:**
```bash
cd apps/frontend
npx shadcn-ui@latest init

# Instalar componentes necesarios
npx shadcn-ui@latest add button card input dialog toast select badge table tabs
npm install @radix-ui/react-slot @radix-ui/react-dialog @radix-ui/react-toast
```

**Configuración de Tailwind:**

```typescript
// apps/frontend/tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './src/**/*.{ts,tsx}',
    '../../packages/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
};
```

**Componente de Kiosk Optimizado para Táctil:**

```typescript
// apps/frontend/src/components/kiosk/KioskButton.tsx
import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@self-checkout/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        kiosk: 'h-24 text-xl font-semibold bg-green-600 text-white hover:bg-green-700',
        kioskDanger: 'h-24 text-xl font-semibold bg-red-600 text-white hover:bg-red-700',
        kioskWarning: 'h-24 text-xl font-semibold bg-yellow-500 text-white hover:bg-yellow-600',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
        kiosk: 'h-24 w-full text-xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const KioskButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
KioskButton.displayName = 'KioskButton';

export { KioskButton, buttonVariants };
```

---

### 2.3 Control de Impresora Térmica

**Librería:** `node-escpos` (node-escpos/driver)

**Instalación:**
```bash
cd apps/backend
npm install escpos @escpos/driver usb
```

**Implementación del Servicio de Impresión:**

```typescript
// libs/printer/src/thermal-printer.service.ts
import { Printer, USB } from 'escpos';
import { USBAdapter } from 'escpos/driver/usb';

export interface PrinterConfig {
  vendorId: number;
  productId: number;
  width?: number; // 58mm o 80mm
  encoding?: string;
}

export interface ReceiptData {
  storeName: string;
  address: string;
  date: Date;
  items: {
    name: string;
    quantity: number;
    price: number;
    total: number;
  }[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
  transactionId: string;
}

export class ThermalPrinterService {
  private printer: Printer | null = null;
  private device: USB | null = null;
  private isConnected: boolean = false;

  async connect(config: PrinterConfig): Promise<void> {
    try {
      this.device = new USB(config.vendorId, config.productId);
      const adapter = new USBAdapter(this.device);
      this.printer = new Printer(adapter, {
        encoding: config.encoding || 'GB18030',
        width: config.width || 58,
      });
      this.isConnected = true;
      console.log('Impresora térmica conectada exitosamente');
    } catch (error) {
      console.error('Error conectando a la impresora:', error);
      throw new Error('No se pudo conectar a la impresora');
    }
  }

  async printReceipt(data: ReceiptData): Promise<void> {
    if (!this.printer || !this.isConnected) {
      throw new Error('Impresora no conectada');
    }

    try {
      // Configuración inicial
      this.printer.font('A');
      this.printer.align('CT');
      this.printer.size(1, 1);

      // Encabezado
      this.printer.text('════════════════════════════');
      this.printer.text(data.storeName);
      this.printer.text(data.address);
      this.printer.text('────────────────────────────────');
      this.printer.align('LT');
      this.printer.text(`Fecha: ${data.date.toLocaleString()}`);
      this.printer.text(`Transacción: ${data.transactionId}`);
      this.printer.text('────────────────────────────────');

      // Items
      data.items.forEach((item) => {
        const line = `${item.quantity}x ${item.name}`;
        const priceLine = `$${item.total.toFixed(2)}`;
        this.printer.text(line.padEnd(25) + priceLine.padStart(15));
      });

      this.printer.text('────────────────────────────────');
      this.printer.align('RT');
      this.printer.text(`Subtotal: $${data.subtotal.toFixed(2)}`);
      this.printer.text(`IVA: $${data.tax.toFixed(2)}`);
      this.printer.font('A').size(2, 2);
      this.printer.text(`TOTAL: $${data.total.toFixed(2)}`);
      this.printer.font('A').size(1, 1);

      // Método de pago
      this.printer.text('────────────────────────────────');
      this.printer.align('CT');
      this.printer.text(`Pago: ${data.paymentMethod}`);
      this.printer.text('');
      this.printer.text('¡Gracias por su compra!');
      this.printer.text('');
      this.printer.cut();
      this.printer.close();

      console.log('Recibo impreso correctamente');
    } catch (error) {
      console.error('Error imprimiendo recibo:', error);
      throw error;
    }
  }

  async printTestPage(): Promise<void> {
    if (!this.printer || !this.isConnected) {
      throw new Error('Impresora no conectada');
    }

    this.printer.font('A');
    this.printer.align('CT');
    this.printer.text('PRUEBA DE IMPRESORA');
    this.printer.text('Sistema de Autopago');
    this.printer.cut();
    this.printer.close();
  }

  async disconnect(): Promise<void> {
    if (this.printer && this.isConnected) {
      this.printer.close();
      this.isConnected = false;
      console.log('Impresora desconectada');
    }
  }

  async getStatus(): Promise<{ connected: boolean; ready: boolean }> {
    return {
      connected: this.isConnected,
      ready: this.isConnected && this.printer !== null,
    };
  }
}

export const printerService = new ThermalPrinterService();
```

**API Controller:**

```typescript
// apps/backend/src/modules/printer/printer.controller.ts
import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { PrinterService } from './printer.service';

@Controller('printer')
export class PrinterController {
  constructor(private readonly printerService: PrinterService) {}

  @Post('print')
  async printReceipt(@Body() data: ReceiptData) {
    await this.printerService.printReceipt(data);
    return { success: true };
  }

  @Post('test')
  async printTest() {
    await this.printerService.printTestPage();
    return { success: true };
  }

  @Get('status')
  async getStatus() {
    return this.printerService.getStatus();
  }
}
```

---

### 2.4 Gestión de Base de Datos

**Librería:** `typeorm` (typeorm/typeorm)

**Instalación:**
```bash
cd apps/backend
npm install @nestjs/typeorm typeorm pg
```

**Configuración de Entidades:**

```typescript
// apps/backend/src/modules/products/entities/product.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { CartItem } from '../../cart/entities/cart-item.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  sku: string;

  @Column({ nullable: true, length: 100 })
  barcode: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  costPrice: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  taxRate: number;

  @Column({ type: 'int', default: 0 })
  inventoryCount: number;

  @Column({ type: 'int', default: 10 })
  minStock: number;

  @Column({ type: 'boolean', default: false })
  isWeighted: boolean;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ nullable: true, length: 500 })
  imageUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => CartItem, (cartItem) => cartItem.product)
  cartItems: CartItem[];
}
```

**Configuración del Módulo:**

```typescript
// apps/backend/src/modules/products/products.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
```

**Configuración de la Base de Datos:**

```typescript
// apps/backend/src/config/database.config.ts
import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'self_checkout',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV === 'development',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
}));
```

---

### 2.5 Integración de Pagos

**Librería:** `mercadopago/sdk-nodejs` o `stripe`

**Instalación (Mercado Pago):**
```bash
cd apps/backend
npm install mercadopago
cd apps/frontend
npm install @mercadopago/sdk-js
```

**Implementación del Servicio de Pagos:**

```typescript
// libs/payments/src/mercadopago.service.ts
import MercadoPago from 'mercadopago';

export interface PaymentConfig {
  accessToken: string;
  publicKey: string;
}

export interface PaymentRequest {
  amount: number;
  currency: string;
  description: string;
  transactionId: string;
  customerEmail?: string;
}

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  status: 'approved' | 'pending' | 'rejected' | 'cancelled';
  message: string;
}

export class MercadoPagoService {
  private isConfigured: boolean = false;

  configure(config: PaymentConfig): void {
    MercadoPago.configurations.setAccessToken(config.accessToken);
    this.isConfigured = true;
  }

  async createPayment(request: PaymentRequest): Promise<PaymentResult> {
    if (!this.isConfigured) {
      throw new Error('MercadoPago no está configurado');
    }

    try {
      const payment = await MercadoPago.payment.create({
        transaction_amount: request.amount,
        description: request.description,
        payment_method_id: 'visa', // En producción, esto viene del frontend
        payer: {
          email: request.customerEmail || 'customer@email.com',
        },
        external_reference: request.transactionId,
      });

      return {
        success: payment.body.status === 'approved',
        paymentId: payment.body.id.toString(),
        status: payment.body.status as PaymentResult['status'],
        message: payment.body.status_detail || 'Pago procesado',
      };
    } catch (error) {
      console.error('Error creando pago en MercadoPago:', error);
      return {
        success: false,
        status: 'rejected',
        message: error.message || 'Error procesando pago',
      };
    }
  }

  async getPaymentStatus(paymentId: string): Promise<PaymentResult> {
    try {
      const payment = await MercadoPago.payment.get(parseInt(paymentId, 10));
      return {
        success: payment.body.status === 'approved',
        paymentId: payment.body.id.toString(),
        status: payment.body.status as PaymentResult['status'],
        message: payment.body.status_detail || '',
      };
    } catch (error) {
      return {
        success: false,
        status: 'rejected',
        message: error.message,
      };
    }
  }

  async refundPayment(paymentId: string, amount?: number): Promise<PaymentResult> {
    try {
      const refund = await MercadoPago.refund.create({
        payment_id: parseInt(paymentId, 10),
        amount: amount, // Si no se especifica, reembolsa el total
      });

      return {
        success: true,
        paymentId: paymentId,
        status: 'cancelled',
        message: 'Reembolso procesado correctamente',
      };
    } catch (error) {
      return {
        success: false,
        status: 'rejected',
        message: error.message,
      };
    }
  }
}

export const mercadoPagoService = new MercadoPagoService();
```

**Mock para Desarrollo:**

```typescript
// libs/payments/src/mock-payment.service.ts
export interface PaymentRequest {
  amount: number;
  currency: string;
  description: string;
  transactionId: string;
}

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  status: 'approved' | 'pending' | 'rejected' | 'cancelled';
  message: string;
}

export class MockPaymentService {
  async processPayment(request: PaymentRequest): Promise<PaymentResult> {
    // Simular delay de procesamiento
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // 95% de éxito para simular producción
    const isSuccess = Math.random() > 0.05;

    return {
      success: isSuccess,
      paymentId: `MOCK-${Date.now()}`,
      status: isSuccess ? 'approved' : 'rejected',
      message: isSuccess ? 'Pago aprobado' : 'Pago rechazado - Fondos insuficientes',
    };
  }

  async refundPayment(paymentId: string): Promise<PaymentResult> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
      success: true,
      paymentId,
      status: 'cancelled',
      message: 'Reembolso procesado correctamente',
    };
  }
}

export const mockPaymentService = new MockPaymentService();
```

---

## 3. Docker Compose para Desarrollo

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: self-checkout-db
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: self_checkout
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: self-checkout-redis
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
    container_name: self-checkout-backend
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=development
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_USERNAME=postgres
      - DB_PASSWORD=postgres
      - DB_NAME=self_checkout
      - REDIS_HOST=redis
      - REDIS_PORT=6379
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - ./apps/backend:/app
      - /app/node_modules

  frontend:
    build:
      context: ./apps/frontend
      dockerfile: Dockerfile
    container_name: self-checkout-frontend
    ports:
      - "3000:3000"
    environment:
      - VITE_API_URL=http://localhost:3001
    depends_on:
      - backend
    volumes:
      - ./apps/frontend:/app
      - /app/node_modules

volumes:
  postgres_data:
  redis_data:
```

---

## 4. Resumen de Dependencias por Capa

| Capa | Repositorio/Librería | Propósito |
|------|---------------------|-----------|
| Escáner | html5-qrcode | Lectura de códigos de barras con cámara |
| UI | shadcn/ui + radix-ui | Componentes táctiles accesibles |
| Impresora | node-escpos | Control de impresora térmica |
| Base de Datos | typeorm + pg | ORM para PostgreSQL |
| Pagos | mercadopago/sdk-nodejs | Procesamiento de pagos |
| Tiempo Real | socket.io | Comunicación bidireccional |

---

## 5. Comandos de Inicialización Rápida

```bash
# 1. Clonar e inicializar monorepo
git clone https://github.com/tu-org/self-checkout-system.git
cd self-checkout-system

# 2. Instalar dependencias
npm install

# 3. Levantar servicios base
docker-compose up -d postgres redis

# 4. Inicializar base de datos
cd apps/backend
npm run migration:run

# 5. Iniciar desarrollo
npm run dev

# Verificar que todo funciona
curl http://localhost:3001/health
curl http://localhost:3000
```

---

*Esta guía debe complementarse con la documentación específica de cada librería para configuraciones avanzadas.*
# Plan Frontend: Sistema de Autopago

## Estructura de Directorios

```
apps/frontend/src/
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
├── App.tsx
└── main.tsx
```

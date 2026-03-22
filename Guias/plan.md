# Plan Maestro: Sistema de Autopago para Mercados

## Resumen Ejecutivo

Este documento presenta un plan detallado para el desarrollo de un sistema de autopago (self-checkout) para mercados, inspirado en el modelo de Farmatodo. El proyecto será desarrollado por un equipo de 3 desarrolladores utilizando una arquitectura modular que prioriza la capacidad de prueba temprana, la escalabilidad progresiva y la integración eficiente con repositorios existentes de GitHub.

La arquitectura propuesta sigue el patrón de microservicios con comunicación síncrona via REST API y comunicación asíncrona via Socket.io para actualizaciones en tiempo real. El sistema está diseñado para crecer desde una implementación mínima viable hasta una solución empresarial completa.

---

## 1. Arquitectura General del Sistema

### 1.1 Componentes Principales

El sistema se compone de cinco capas principales que trabajan de forma coordinada:

**Capa de Presentación (Frontend):**
- Interfaz de Kiosk para pantalla táctil
- Dashboard administrativo para gestión
- Aplicación móvil opcional (PWA)

**Capa de Balanceo:**
- NGINX o Traefik como reverse proxy
- Distribución de carga entre instancias
- Terminación de SSL/TLS

**Capa de Servicios (Backend):**
- API REST con NestJS para operaciones síncronas
- Servidor Socket.io para comunicación en tiempo real
- Servicios de negocio modulares y reutilizables

**Capa de Datos:**
- PostgreSQL como base de datos principal
- Redis para caché y gestión de sesiones
- APIs externas para pagos y notificaciones

### 1.2 Evolución de la Arquitectura

**Fase 1 - Monolito Modular:**
Los servicios de checkout, inventario y productos comparten el mismo proceso pero están claramente delimitados en módulos independientes.

**Fase 2 - Descomposición:**
Los servicios de pago, recibos y notificaciones se separan en procesos independientes para permitir escalabilidad individual.

**Fase 3 - Escalabilidad:**
Los servicios de analíticas, usuarios e integración se despliegan como microservicios independientes con su propio ciclo de vida.

---

## 2. Estrategia de Integración con Repositorios Existentes

### 2.1 Patrón de Adaptadores

La integración con repositorios heredados sigue un patrón de capas de adaptación que aísla los cambios del núcleo del sistema:

La capa de adaptadores traduce las interfaces de los repositorios externos a contratos internos del sistema. Cada repositorio heredado tiene su propio adaptador que implementa una interfaz definida por el núcleo del sistema. Esto permite modificar o reemplazar repositorios externos sin afectar la lógica de negocio.

### 2.2 Plan de Migración por Tipo de Repositorio

**Repositorio de Frontend Legacy:**
La migración se enfoca en extraer componentes reutilizables, convertirlos a TypeScript para tipado estático, e integrarlos con el nuevo estado global del sistema. La conversión a React Hooks se realiza de forma gradual para minimizar riesgos.

**Repositorio de Backend Legacy:**
La lógica de negocio se extrae a servicios NestJS mientras se adaptan los endpoints a la nueva estructura de API. Las consultas SQL se migran a TypeORM siguiendo el patrón Repository para abstraer el acceso a datos.

**Repositorio de Utilidades:**
Las funciones se convierten en módulos npm independientes, se versionan con semver y se publican en un registry privado para su consumo interno.

---

## 3. Plan de Fases de Desarrollo

### FASE 1: Fundamentos y Prototipo Rápido (Semanas 1-3)

**Objetivo:** Validar arquitectura básica y demostrar funcionalidad core

**Entregable Mínimo Viable:**
Un kiosk funcional con escaneo de productos, carrito de compras básico, persistencia en base de datos e interfaz de operador simple.

**Entregables Clave:**

1. **Configuración del Entorno:**
   Repositorio con estructura monorepo, Docker Compose con PostgreSQL y Redis, TypeScript configurado, ESLint y Prettier, Husky para git hooks, CI/CD básico en GitHub Actions.

2. **API de Productos:**
   Búsqueda por código de barras, consulta por ID, gestión de catálogo con tiempos de respuesta menores a 200ms.

3. **Carrito Básico:**
   Agregar productos, eliminar productos, cálculo de totales, persistencia de sesión.

4. **Comunicación en Tiempo Real:**
   Eventos bidireccionales entre kiosk y servidor para actualizaciones instantáneas del carrito.

**Criterio de Éxito:**
- Un usuario puede escanear productos y agregarlos al carrito
- El sistema calcula totales correctamente
- Los datos persisten en PostgreSQL
- La interfaz responde en menos de 500ms
- Tests unitarios con cobertura mayor al 70%

---

### FASE 2: Características Completas de Checkout (Semanas 4-6)

**Objetivo:** Sistema de checkout completamente funcional con múltiples kiosks operando simultáneamente.

**Entregable:** Sistema multi-kiosk con gestión de inventario en tiempo real y soporte para productos por peso.

**Entregables Clave:**

1. **Sistema de Carrito Avanzado:**
   Modificación de cantidades, eliminación de items, aplicación de descuentos manuales, separación visual por categorías.

2. **Integración de Báscula:**
   Protocolo de comunicación con dispositivos de peso, lectura en tiempo real, cálculo de precio basado en peso, manejo de productos inestables.

3. **Sistema de Pagos:**
   Mock de pasarela de pagos, soporte para tarjetas y pagos móviles, manejo de errores con reintentos, generación de recibos.

4. **Inventario en Tiempo Real:**
   Reserva al agregar al carrito, liberación al eliminar, confirmación al completar pago, alertas de stock bajo via Socket.io.

5. **Gestión Multi-Kiosk:**
   Sesiones distribuidas, recuperación de sesiones huérfanas, balanceo de carga entre instancias.

6. **Interfaz de Operador:**
   Dashboard de monitoreo, vista de sesiones activas, asistencia remota, override de precios, cancelación de transacciones.

**Criterio de Éxito:**
- Múltiples kiosks operan simultáneamente
- Inventario se actualiza en tiempo real (menos de 100ms)
- Pagos fallidos se manejan correctamente
- Operadores pueden asistir clientes remotamente
- Recibos se generan correctamente

---

### FASE 3: Seguridad, Auditoría y Estabilidad (Semanas 7-9)

**Objetivo:** Sistema seguro y auditable listo para despliegue en staging con compliance básico.

**Entregable:** Sistema con autenticación, auditoría completa y procedimientos de recuperación.

**Entregables Clave:**

1. **Sistema de Autenticación:**
   JWT con tokens de 15 minutos, roles de acceso (Customer, Operator, Administrator), bloqueo tras intentos fallidos.

2. **Sistema de Auditoría:**
   Registro de todas las acciones críticas incluyendo login/logout, cambios de precio, descuentos manuales, override de inventario, transacciones de pago.

3. **Mejoras de Seguridad:**
   Encriptación de datos sensibles (PCI-DSS básico), rate limiting, protección CSRF, sanitización de inputs, headers de seguridad.

4. **Recuperación y Respaldo:**
   Backup automático, point-in-time recovery, replicación de Redis, procedimientos de disaster recovery, health checks.

5. **Optimización de Rendimiento:**
   Caché de productos en Redis, índices optimizados en PostgreSQL, connection pooling, lazy loading en frontend.

**Criterio de Éxito:**
- Sistema cumple estándares de seguridad básicos
- Todas las acciones críticas están auditadas
- Recuperación automática de fallos
- Tiempos de respuesta menores a 200ms
- Tests de seguridad sin hallazgos críticos

---

### FASE 4: Escalabilidad y Características Avanzadas (Semanas 10-13)

**Objetivo:** Sistema escalable con características empresariales listo para producción con múltiples tiendas.

**Entregable:** Arquitectura de microservicios con message queue y dashboard avanzado.

**Entregables Clave:**

1. **Descomposición en Microservicios:**
   API Gateway centralizado, servicios independientes para auth, productos, checkout, inventario, pagos, recibos, notificaciones y analíticas.

2. **Message Queue para Eventos:**
   RabbitMQ como bus de eventos principal, Kafka para streams de datos, Redis Pub/Sub para notificaciones en tiempo real.

3. **Sistema de Promociones:**
   Código de promociones, porcentaje y monto fijo, fechas de vigencia, límites de uso, promociones apilables.

4. **Dashboard de Administración:**
   Métricas en tiempo real, reportes de ventas, análisis de inventario, gestión de promociones, monitoreo de kiosks.

5. **API para Integraciones:**
   Documentación OpenAPI/Swagger, endpoints para sistemas externos, webhooks para eventos.

**Criterio de Éxito:**
- Sistema escala horizontalmente
- Eventos se procesan asíncronamente
- Dashboard muestra métricas en tiempo real
- Promociones funcionan correctamente
- Documentación completa y actualizada

---

### FASE 5: Optimización y Producción (Semanas 14-16)

**Objetivo:** Sistema production-ready con alta confiabilidad y monitoreo completo.

**Entregable:** Sistema desplegado en producción con pipeline automatizado y observabilidad.

**Entregables Clave:**

1. **Property-Based Testing:**
   Tests basados en propiedades para lógica de negocio crítica, generación automática de casos de prueba, validación de invariantes.

2. **Pruebas de Carga:**
   Simulación de 500 usuarios concurrentes, validación de umbrales de rendimiento, identificación de cuellos de botella.

3. **Monitoreo y Observabilidad:**
   Prometheus para métricas, Grafana para dashboards, ELK Stack para logs, Jaeger para distributed tracing.

4. **Pipeline CI/CD Completo:**
   Tests automatizados en cada commit, build de imágenes Docker, deployment a staging y producción, rollback automático.

5. **Documentación de Operaciones:**
   Runbooks para escenarios comunes, procedimientos de incident response, planes de contingencia.

**Criterio de Éxito:**
- Sistema pasa pruebas de carga de 500 usuarios
- Monitoreo configurado y funcionando
- Pipeline CI/CD automatizado
- Runbooks documentados
- Listo para producción

---

## 4. Distribución de Trabajo por Integrante

### Desarrollador 1 (Backend Lead)

**Semanas 1-3:** Configuración del backend, servicios de productos, estructura de módulos NestJS.

**Semanas 4-6:** Sistema de checkout, integración de pagos, gestión de sesiones.

**Semanas 7-9:** Seguridad, auditoría, autenticación JWT, optimización de base de datos.

**Semanas 10-13:** Descomposición en microservicios, message queue, event sourcing.

**Semanas 14-16:** Optimización de rendimiento, pruebas de carga, CI/CD avanzado.

### Desarrollador 2 (Frontend Lead)

**Semanas 1-3:** Configuración del frontend, componentes base, estructura de la aplicación React.

**Semanas 4-6:** Interfaz de kiosk, carrito de compras, flujo de pagos.

**Semanas 7-9:** Dashboard de operador, optimización de UI, componentes reutilizables.

**Semanas 10-13:** Dashboard avanzado, reportes, visualización de métricas.

**Semanas 14-16:** Testing E2E, optimización de rendimiento, accesibilidad.

### Desarrollador 3 (Full Stack / DevOps)

**Semanas 1-3:** Docker, docker-compose, base de datos, CI/CD inicial, infraestructura.

**Semanas 4-6:** Socket.io, inventario en tiempo real, conexión entre servicios.

**Semanas 7-9:** Monitoreo, logging, backup, recuperación de fallos.

**Semanas 10-13:** Kubernetes, escalabilidad, API externa, integraciones.

**Semanas 14-16:** Documentación, deployment, soporte, optimización de infraestructura.

### Ceremony de Equipo

**Daily Standup (15 min):** Qué hice ayer, qué haré hoy, bloqueos.

**Sprint Planning (2 horas, cada 2 semanas):** Revisión de backlog, estimación de tareas, commitment.

**Retrospectiva (1 hora, cada 2 semanas):** Qué funcionó bien, qué puede mejorar, acciones.

**Demo (1 hora, cada sprint):** Demo de funcionalidades completadas, feedback del equipo.

---

## 5. Matriz de Dependencias entre Fases

**Fase 1** es la base de todo el proyecto. No se puede avanzar a fases posteriores sin completar los entregables de esta fase.

**Fase 2** depende de: API de productos funcional, carrito básico, base de datos configurada.

**Fase 3** depende de: Sistema de checkout completo, inventario en tiempo real, Socket.io funcional.

**Fase 4** depende de: Sistema seguro, auditoría completa, tests de integración.

**Fase 5** depende de: Microservicios, message queue, API externa.

---

## 6. Métricas de Éxito del Proyecto

### Métricas Técnicas

| Métrica | Objetivo | Fase |
|---------|----------|------|
| Tiempo de respuesta API (p95) | < 200ms | Fase 3 |
| Tiempo de respuesta API (p99) | < 500ms | Fase 4 |
| Cobertura de tests | > 80% | Fase 3 |
| Cobertura de tests | > 90% | Fase 5 |
| Uptime del sistema | > 99.5% | Fase 5 |
| Tiempo de recovery | < 5 min | Fase 5 |
| Usuarios concurrentes | 500+ | Fase 5 |

### Métricas de Negocio

| Métrica | Objetivo | Fase |
|---------|----------|------|
| Transacciones por hora (por kiosk) | 30+ | Fase 2 |
| Tiempo promedio de checkout | < 3 min | Fase 3 |
| Tasa de éxito de pagos | > 95% | Fase 3 |
| Tasa de asistencia de operador | < 5% | Fase 4 |

---

## 7. Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Retrasos en integración de repositorios heredados | Media | Alto | Planificar buffer de 2 semanas, crear adapters tempranamente |
| Problemas de rendimiento con Socket.io | Media | Medio | Implementar Redis adapter desde Fase 2 |
| Complejidad de microservicios | Alta | Medio | Empezar con monolito modular, descomponer gradualmente |
| Cambios en requisitos de pasarela de pagos | Baja | Alto | Usar abstracción de payment gateway |
| Fallos de hardware (báscula, escáner) | Media | Medio | Implementar modo manual de respaldo |

---

## 8. Checklist de Preparación para Cada Fase

### Fase 1
- Repositorio creado y configurado
- Docker Compose funcional
- TypeScript configurado
- API de productos implementada
- Carrito básico funcional
- Tests unitarios > 70% cobertura
- CI/CD básico configurado

### Fase 2
- Múltiples kiosks funcionando
- Integración de báscula
- Sistema de pagos simulado
- Inventario en tiempo real
- Interfaz de operador
- Tests de integración completos

### Fase 3
- Autenticación implementada
- Sistema de auditoría completo
- Tests de seguridad
- Backup y recuperación
- Optimización de rendimiento
- Documentación de API

### Fase 4
- Microservicios desplegados
- Message queue funcionando
- Promociones y descuentos
- Dashboard avanzado
- API externa documentada
- Tests de carga

### Fase 5
- Property-based tests
- Pruebas de estrés
- Monitoreo completo
- Runbooks documentados
- Pipeline CI/CD completo
- Listo para producción

---

## 9. Próximos Pasos Inmediatos

**Esta semana:**
- Crear repositorio con estructura monorepo
- Configurar Docker Compose con PostgreSQL y Redis
- Inicializar proyecto NestJS y React
- Configurar GitHub Actions básico

**Próximas 2 semanas:**
- Implementar API de productos
- Crear interfaz básica de kiosk
- Implementar carrito de compras
- Configurar Socket.io básico
- Demo de funcionalidad MVP

---

*Este plan es un documento vivo y debe actualizarse según el progreso del equipo y cambios en requisitos. Para referencias técnicas detalladas, consultar code-snippets.md.*
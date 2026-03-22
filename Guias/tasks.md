# Plan de Tareas: Sistema de Autopago

Este documento detalla las tareas específicas para cada miembro del equipo, organizadas por fase y área de responsabilidad. Aunque un solo desarrollador podría técnicamente completar todas las tareas, la separación permite un mejor seguimiento del progreso y facilita la revisión de código y la identificación de cuellos de botella.

---

## Resumen de Asignaciones por Fase

| Fase                     | Desarrollador Backend                                | Desarrollador Frontend                            | Desarrollador DevOps                     |
| ------------------------ | ---------------------------------------------------- | ------------------------------------------------- | ---------------------------------------- |
| **Corto Plazo (1-6)**    | Estructura backend, API productos, pagos mock        | Frontend React, escaneo, carrito, UI táctil       | Docker, DB, Socket.io, infraestructura   |
| **Mediano Plazo (7-18)** | Multi-kiosk, inventario real-time, pesaje, seguridad | Dashboard operador, métricas real-time, UI pesaje | Logging, staging, health checks, backups |
| **Largo Plazo (19-32)**  | Microservicios, RabbitMQ, promociones, PBT           | APIs externas, optimización, reportes             | K8s, CI/CD avanzado, monitoreo, runbooks |

---

## FASE 1: Objetivos a Corto Plazo (Semanas 1-6)

### 1.1 Desarrollador Backend - Tareas

- [ ] **1.1.1** Configurar monorepo con Turborepo y estructura de directorios
- [ ] **1.1.2** Inicializar proyecto NestJS con TypeScript y ESLint
- [ ] **1.1.3** Configurar TypeORM con PostgreSQL y entidades base
- [ ] **1.1.4** Implementar entidad Product con campos para productos por peso
- [ ] **1.1.5** Implementar entidad CheckoutSession para gestión de sesiones
- [ ] **1.1.6** Implementar entidad CartItem para items del carrito
- [ ] **1.1.7** Crear módulo Products con endpoints CRUD básicos
- [ ] **1.1.8** Implementar endpoint búsqueda por código de barras (EAN/UPC)
- [ ] **1.1.9** Implementar endpoint búsqueda por SKU
- [ ] **1.1.10** Crear módulo Checkout con gestión de sesiones
- [ ] **1.1.11** Implementar agregar item al carrito con reserva de inventario
- [ ] **1.1.12** Implementar eliminar item del carrito con liberación de inventario
- [ ] **1.1.13** Implementar modificar cantidad de items
- [ ] **1.1.14** Implementar cálculo de totales con impuestos
- [ ] **1.1.15** Crear módulo Payments con mock de pasarela de pagos
- [ ] **1.1.16** Implementar simulación de pago exitoso
- [ ] **1.1.17** Implementar simulación de pago fallido
- [ ] **1.1.18** Configurar Docker Compose con PostgreSQL y Redis
- [ ] **1.1.19** Crear migraciones de base de datos iniciales
- [ ] **1.1.20** Escribir tests unitarios para módulo Products (cobertura >70%)
- [ ] **1.1.21** Escribir tests unitarios para módulo Checkout (cobertura >70%)
- [ ] **1.1.22** Documentar API con Swagger/OpenAPI

### 1.2 Desarrollador Frontend - Tareas

- [ ] **1.2.1** Inicializar proyecto React con Vite y TypeScript
- [ ] **1.2.2** Configurar Tailwind CSS con shadcn/ui
- [ ] **1.2.3** Instalar e integrar librería html5-qrcode
- [ ] **1.2.4** Crear wrapper de escáner de códigos de barras
- [ ] **1.2.5** Implementar componente ProductScanner con cámara
- [ ] **1.2.6** Implementar fallback para escáner USB físico
- [ ] **1.2.7** Crear componentes UI táctiles (KioskButton, KioskCard)
- [ ] **1.2.8** Implementar pantalla principal del kiosk
- [ ] **1.2.9** Implementar componente Cart con lista de productos
- [ ] **1.2.10** Implementar controls de cantidad (+/-) para cada item
- [ ] **1.2.11** Implementar botón eliminar item del carrito
- [ ] **1.2.12** Implementar resumen de totales con impuestos
- [ ] **1.2.13** Crear pantalla de selección de método de pago
- [ ] **1.2.14** Implementar pantalla de confirmación de pago
- [ ] **1.2.15** Implementar pantalla de recibo digital
- [ ] **1.2.16** Configurar integración con API mediante Axios
- [ ] **1.2.17** Configurar cliente Socket.io para tiempo real
- [ ] **1.2.18** Implementar store de estado global (Zustand/Redux)
- [ ] **1.2.19** Escribir tests unitarios para componentes (cobertura >60%)
- [ ] **1.2.20** Optimizar rendimiento de renderizado para táctil

### 1.3 Desarrollador DevOps - Tareas

- [ ] **1.3.1** Configurar servidor PostgreSQL con Docker
- [ ] **1.3.2** Configurar servidor Redis con Docker
- [ ] **1.3.3** Crear archivo docker-compose.yml completo
- [ ] **1.3.4** Configurar red interna entre servicios
- [ ] **1.3.5** Implementar servidor Socket.io standalone
- [ ] **1.3.6** Configurar eventos de carrito actualizado
- [ ] **1.3.7** Configurar eventos de producto encontrado/no encontrado
- [ ] **1.3.8** Configurar eventos de pago exitoso/fallido
- [ ] **1.3.9** Crear script de inicialización de base de datos
- [ ] **1.3.10** Crear script de seed de productos de prueba
- [ ] **1.3.11** Configurar GitHub Actions para CI básico
- [ ] **1.3.12** Configurar pipeline de linteo y formateo
- [ ] **1.3.13** Configurar ejecución de tests en CI
- [ ] **1.3.14** Crear Dockerfile para backend
- [ ] **1.3.15** Crear Dockerfile para frontend
- [ ] **1.3.16** Documentar guía de instalación del entorno
- [ ] **1.3.17** Documentar comandos de uso común
- [ ] **1.3.18** Configurar variables de entorno por ambiente
- [ ] **1.3.19** Implementar health check endpoint en backend
- [ ] **1.3.20** Configurar logging estructurado con Winston/Pino

---

## FASE 2: Objetivos a Mediano Plazo - Primera Sub-fase (Semanas 7-12)

### 2.1 Desarrollador Backend - Tareas

- [ ] **2.1.1** Implementar sistema de sesiones distribuidas multi-kiosk
- [ ] **2.1.2** Implementar optimistic locking para inventario
- [ ] **2.1.3** Crear servicio de reserva de inventario
- [ ] **2.1.4** Implementar liberación automática de inventario (timeout)
- [ ] **2.1.5** Implementar confirmación de inventario en pago exitoso
- [ ] **2.1.6** Crear integración con librería node-escpos para básculas
- [ ] **2.1.7** Implementar interfaz ScaleIntegration para básculas USB
- [ ] **2.1.8** Implementar lectura de peso en tiempo real
- [ ] **2.1.9** Implementar cálculo de precio por peso (precio × kg)
- [ ] **2.1.10** Implementar manejo de peso inestable (reintentos)
- [ ] **2.1.11** Implementar alertas de peso mínimo/máximo
- [ ] **2.1.12** Crear endpoint para estado de báscula conectada
- [ ] **2.1.13** Implementar sistema de autenticación JWT
- [ ] **2.1.14** Implementar RolesGuard (cliente, operador, admin)
- [ ] **2.1.15** Implementar rate limiting por IP
- [ ] **2.1.16** Implementar sanitización de inputs
- [ ] **2.1.17** Configurar headers de seguridad (Helmet)
- [ ] **2.1.18** Implementar encriptación de datos sensibles
- [ ] **2.1.19** Escribir tests de integración multi-kiosk
- [ ] **2.1.20** Escribir tests de integración de pesaje

### 2.2 Desarrollador Frontend - Tareas

- [ ] **2.2.1** Implementar pantalla de selección de producto por peso
- [ ] **2.2.2** Crear componente de visualización de peso en tiempo real
- [ ] **2.2.3** Implementar indicador de estabilidad del peso
- [ ] **2.2.4** Implementar feedback visual para peso insuficiente
- [ ] **2.2.5** Implementar feedback visual para peso óptimo
- [ ] **2.2.6** Implementar feedback visual para peso excesivo
- [ ] **2.2.7** Crear pantalla de operador con autenticación
- [ ] **2.2.8** Implementar dashboard de kiosks activos
- [ ] **2.2.9** Implementar lista de sesiones de checkout activas
- [ ] **2.2.10** Implementar botón de asistencia remota
- [ ] **2.2.11** Implementar controls de override para operador
- [ ] **2.2.12** Implementar aplicación de descuento manual
- [ ] **2.2.13** Implementar override de precio
- [ ] **2.2.14** Implementar cancelación de transacción
- [ ] **2.2.15** Crear componente de métricas en tiempo real
- [ ] **2.2.16** Implementar gráfico de transacciones por hora
- [ ] **2.2.17** Implementar indicador de ingresos del día
- [ ] **2.2.18** Implementar lista de productos bajo inventario
- [ ] **2.2.19** Optimizar rendimiento de actualizaciones en tiempo real
- [ ] **2.2.20** Implementar modo offline con sincronización

### 2.3 Desarrollador DevOps - Tareas

- [ ] **2.3.1** Implementar health checks avanzados (liveness, readiness)
- [ ] **2.3.2** Configurar logging estructurado con correlación de IDs
- [ ] **2.3.3** Implementar sistema de alertas básicas
- [ ] **2.3.4** Configurar ambiente de staging
- [ ] **2.3.5** Crear pipeline de deployment a staging
- [ ] **2.3.6** Implementar backups automáticos de PostgreSQL
- [ ] **2.3.7** Implementar backups de Redis
- [ ] **2.3.8** Configurar replicación de Redis
- [ ] **2.3.9** Documentar procedimientos de backup y restore
- [ ] **2.3.10** Implementar métricas personalizadas (Prometheus)
- [ ] **2.3.11** Configurar dashboard básico de Grafana
- [ ] **2.3.12** Implementar rate limiting a nivel de nginx
- [ ] **2.3.13** Configurar SSL/TLS para ambiente de staging
- [ ] **2.3.14** Crear script de deployment rollback
- [ ] **2.3.15** Documentar arquitectura de infraestructura
- [ ] **2.3.16** Implementar pruebas de carga básicas (k6)
- [ ] **2.3.17** Configurar retención de logs
- [ ] **2.3.18** Implementar sistema de versionado de API
- [ ] **2.3.19** Crear ambiente de testing de integración
- [ ] **2.3.20** Documentar runbook de recuperación de DB

---

## FASE 3: Objetivos a Mediano Plazo - Segunda Sub-fase (Semanas 13-18)

### 3.1 Desarrollador Backend - Tareas

- [ ] **3.1.1** Implementar tabla de auditoría append-only
- [ ] **3.1.2** Implementar logging de eventos de autenticación
- [ ] **3.1.3** Implementar logging de cambios de precio
- [ ] **3.1.4** Implementar logging de descuentos manuales
- [ ] **3.1.5** Implementar logging de override de inventario
- [ ] **3.1.6** Implementar logging de transacciones de pago
- [ ] **3.1.7** Crear endpoint de consulta de auditoría filtrable
- [ ] **3.1.8** Implementar exportación de auditoría a CSV
- [ ] **3.1.9** Implementar soft delete para productos
- [ ] **3.1.10** Implementar historial de precios de productos
- [ ] **3.1.11** Optimizar queries de productos con índices
- [ ] **3.1.12** Implementar caché de productos en Redis
- [ ] **3.1.13** Implementar invalidación de caché inteligente
- [ ] **3.1.14** Implementar connection pooling optimizado
- [ ] **3.1.15** Implementar circuit breaker para servicios externos
- [ ] **3.1.16** Implementar retry automático para operaciones fallidas
- [ ] **3.1.17** Crear módulo de reportes de ventas
- [ ] **3.1.18** Crear módulo de análisis de inventario
- [ ] **3.1.19** Implementar endpoint de métricas de negocio
- [ ] **3.1.20** Escribir tests de seguridad

### 3.2 Desarrollador Frontend - Tareas

- [ ] **3.2.1** Implementar pantalla de inicio de sesión de operador
- [ ] **3.2.2** Implementar manejo de sesión JWT
- [ ] **3.2.3** Implementar refresh token automático
- [ ] **3.2.4** Crear pantalla de configuración de báscula
- [ ] **3.2.5** Implementar test de conexión de báscula
- [ ] **3.2.6** Implementar pantalla de calibración de báscula
- [ ] **3.2.7** Crear pantalla de gestión de productos
- [ ] **3.2.8** Implementar formulario de alta de producto
- [ ] **3.2.9** Implementar formulario de edición de producto
- [ ] **3.2.10** Implementar toggle para producto por peso
- [ ] **3.2.11** Crear pantalla de gestión de inventario
- [ ] **3.2.12** Implementar ajuste manual de inventario
- [ ] **3.2.13** Implementar historial de movimientos de inventario
- [ ] **3.2.14** Crear pantalla de reportes de ventas
- [ ] **3.2.15** Implementar filtro por fecha
- [ ] **3.2.16** Implementar exportación a CSV
- [ ] **3.2.17** Crear pantalla de auditoría
- [ ] **3.2.18** Implementar filtros de auditoría
- [ ] **3.2.19** Implementar visualización de detalle de evento
- [ ] **3.2.20** Mejorar accesibilidad de todas las pantallas

### 3.3 Desarrollador DevOps - Tareas

- [ ] **3.3.1** Configurar ambiente de producción
- [ ] **3.3.2** Configurar SSL/TLS para producción
- [ ] **3.3.3** Implementar balanceo de carga (nginx)
- [ ] **3.3.4** Configurar múltiples réplicas de backend
- [ ] **3.3.5** Implementar auto-scaling básico
- [ ] **3.3.6** Configurar CDN para assets estáticos
- [ ] **3.3.7** Implementar pipeline de deployment a producción
- [ ] **3.3.8** Configurar approval manual para producción
- [ ] **3.3.9** Implementar logging de producción (ELK)
- [ ] **3.3.10** Configurar alertas de producción
- [ ] **3.3.11** Implementar dashboard de monitoreo de producción
- [ ] **3.3.12** Documentar procedimientos de incident response
- [ ] **3.3.13** Implementar pruebas de humo post-deployment
- [ ] **3.3.14** Configurar backup geográficamente distribuido
- [ ] **3.3.15** Implementar disaster recovery plan
- [ ] **3.3.16** Crear runbook de escalamiento
- [ ] **3.3.17** Configurar rate limiting por usuario
- [ ] **3.3.18** Implementar WAF básico
- [ ] **3.3.19** Configurar auditoría de seguridad
- [ ] **3.3.20** Realizar penetration testing básico

---

## FASE 4: Objetivos a Largo Plazo - Primera Sub-fase (Semanas 19-26)

### 4.1 Desarrollador Backend - Tareas

- [ ] **4.1.1** Diseñar arquitectura de microservicios
- [ ] **4.1.2** Crear API Gateway con Kong o NestJS Gateway
- [ ] **4.1.3** Extraer servicio de autenticación (auth-service)
- [ ] **4.1.4** Extraer servicio de productos (product-service)
- [ ] **4.1.5** Extraer servicio de checkout (checkout-service)
- [ ] **4.1.6** Extraer servicio de inventario (inventory-service)
- [ ] **4.1.7** Extraer servicio de pagos (payment-service)
- [ ] **4.1.8** Implementar RabbitMQ como message queue
- [ ] **4.1.9** Definir contratos de eventos del dominio
- [ ] **4.1.10** Implementar publisher de eventos
- [ ] **4.1.11** Implementar subscriber de eventos
- [ ] **4.1.12** Implementar dead letter queue
- [ ] **4.1.13** Crear servicio de promociones (promotion-service)
- [ ] **4.1.14** Implementar motor de códigos de descuento
- [ ] **4.1.15** Implementar promociones por porcentaje
- [ ] **4.1.16** Implementar promociones por monto fijo
- [ ] **4.1.17** Implementar promociones BOGO
- [ ] **4.1.18** Implementar restricciones de promociones
- [ ] **4.1.19** Implementar límites de uso por cliente
- [ ] **4.1.20** Implementar promociones apilables

### 4.2 Desarrollador Frontend - Tareas

- [ ] **4.2.1** Documentar API con OpenAPI/Swagger
- [ ] **4.2.2** Generar cliente TypeScript desde OpenAPI
- [ ] **4.2.3** Implementar SDK para integraciones externas
- [ ] **4.2.4** Crear portal de desarrolladores
- [ ] **4.2.5** Implementar webhooks configurables
- [ ] **4.2.6** Implementar autenticación de webhooks
- [ ] **4.2.7** Crear pantalla de configuración de webhooks
- [ ] **4.2.8** Implementar logs de webhooks enviados
- [ ] **4.2.9** Implementar reintentos de webhooks fallidos
- [ ] **4.2.10** Crear módulo de reportes avanzados
- [ ] **4.2.11** Implementar gráfico de tendencias de venta
- [ ] **4.2.12** Implementar análisis ABC de productos
- [ ] **4.2.13** Implementar predicción de inventario
- [ ] **4.2.14** Crear pantalla de exportación de reportes
- [ ] **4.2.15** Implementar exportación a PDF
- [ ] **4.2.16** Implementar exportación a Excel
- [ ] **4.2.17** Optimizar rendimiento con virtualización
- [ ] **4.2.18** Implementar lazy loading de componentes
- [ ] **4.2.19** Optimizar bundle size
- [ ] **4.2.20** Implementar Service Worker para PWA

### 4.3 Desarrollador DevOps - Tareas

- [ ] **4.3.1** Configurar cluster Kubernetes
- [ ] **4.3.2** Crear Helm charts para cada microservicio
- [ ] **4.3.3** Configurar namespaces por ambiente
- [ ] **4.3.4** Implementar Ingress controller
- [ ] **4.3.5** Configurar auto-scaling horizontal (HPA)
- [ ] **4.3.6** Implementar vertical pod autoscaler
- [ ] **4.3.7** Configurar persistent volumes para DB
- [ ] **4.3.8** Implementar Redis cluster
- [ ] **4.3.9** Configurar PostgreSQL replica
- [ ] **4.3.10** Implementar service mesh (Istio/Linkerd)
- [ ] **4.3.11** Configurar circuit breakers en K8s
- [ ] **4.3.12** Implementar distributed tracing (Jaeger)
- [ ] **4.3.13** Configurar métricas personalizadas en Prometheus
- [ ] **4.3.14** Crear dashboards de Grafana por servicio
- [ ] **4.3.15** Implementar alertas de SLO
- [ ] **4.3.16** Configurar on-call rotation
- [ ] **4.3.17** Implementar feature flags
- [ ] **4.3.18** Configurar blue-green deployment
- [ ] **4.3.19** Implementar canary deployments
- [ ] **4.3.20** Documentar arquitectura de Kubernetes

---

## FASE 5: Objetivos a Largo Plazo - Segunda Sub-fase (Semanas 27-32)

### 5.1 Desarrollador Backend - Tareas

- [ ] **5.1.1** Implementar property-based testing para carrito
- [ ] **5.1.2** Implementar property-based testing para promociones
- [ ] **5.1.3** Implementar property-based testing para pesaje
- [ ] **5.1.4** Implementar property-based testing para inventario
- [ ] **5.1.5** Crear generadores de datos arbitrarios
- [ ] **5.1.6** Definir invariantes del dominio
- [ ] **5.1.7** Implementar tests de estrés para API
- [ ] **5.1.8** Implementar tests de estrés para Socket.io
- [ ] **5.1.9** Implementar tests de failover
- [ ] **5.1.10** Implementar tests de recovery
- [ ] **5.1.11** Crear servicio de recibos (receipt-service)
- [ ] **5.1.12** Implementar generación de recibos PDF
- [ ] **5.1.13** Implementar envío de recibos por email
- [ ] **5.1.14** Implementar generación de recibos HTML
- [ ] **5.1.15** Crear servicio de notificaciones (notification-service)
- [ ] **5.1.16** Implementar notificaciones push
- [ ] **5.1.17** Implementar notificaciones SMS
- [ ] **5.1.18** Crear servicio de analíticas (analytics-service)
- [ ] **5.1.19** Implementar agregación de métricas
- [ ] **5.1.20** Implementar retención de datos históricos

### 5.2 Desarrollador Frontend - Tareas

- [ ] **5.2.1** Implementar dark mode
- [ ] **5.2.2** Implementar modo de alto contraste
- [ ] **5.2.3** Mejorar accesibilidad (WCAG 2.1 AA)
- [ ] **5.2.4** Implementar navegación por teclado
- [ ] **5.2.5** Implementar lectores de pantalla
- [ ] **5.2.6** Crear pantalla de configuración de usuario
- [ ] **5.2.7** Implementar preferencias de idioma
- [ ] **5.2.8** Implementar preferencias de moneda
- [ ] **5.2.9** Crear pantalla de ayuda contextual
- [ ] **5.2.10** Implementar tutorial interactivo
- [ ] **5.2.11** Implementar feedback de usuario
- [ ] **5.2.12** Crear pantalla deAcerca de
- [ ] **5.2.13** Implementar versión offline de la app
- [ ] **5.2.14** Implementar sincronización de datos offline
- [ ] **5.2.15** Crear pantalla de estado de conexión
- [ ] **5.2.16** Implementar manejo de errores amigable
- [ ] **5.2.17** Implementar retry automático de operaciones
- [ ] **5.2.18** Crear pantalla de confirmación de acciones
- [ ] **5.2.19** Implementar undo para acciones reversibles
- [ ] **5.2.20** Optimizar para tablets de diferentes tamaños

### 5.3 Desarrollador DevOps - Tareas

- [ ] **5.3.1** Implementar chaos engineering
- [ ] **5.3.2** Configurar chaos mesh en K8s
- [ ] **5.3.3** Implementar tests de inyección de fallos
- [ ] **5.3.4** Documentar SLOs y SLIs
- [ ] **5.3.5** Implementar error budget
- [ ] **5.3.6** Configurar alertas de SLO burn rate
- [ ] **5.3.7** Implementar cost optimization
- [ ] **5.3.8** Configurar spot instances
- [ ] **5.3.9** Implementar auto-scaling basado en costos
- [ ] **5.3.10** Documentar runbooks completos
- [ ] **5.3.11** Crear runbook de alta de tienda
- [ ] **5.3.12** Crear runbook de baja de tienda
- [ ] **5.3.13** Crear runbook de escalamiento
- [ ] **5.3.14** Crear runbook de incident response
- [ ] **5.3.15** Crear runbook de post-mortem
- [ ] **5.3.16** Implementar multi-region deployment
- [ ] **5.3.17** Configurar CDN global
- [ ] **5.3.18** Implementar disaster recovery multi-region
- [ ] **5.3.19** Configurar backup cross-region
- [ ] **5.3.20** Documentar procedimientos de compliance

---

## Tareas Transversales (Todas las Fases)

### Tareas que Involucran a Todo el Equipo

- [ ] **T.1** Revisión de código semanal (todos los viernes)
- [ ] **T.2** Actualización de documentación (cada sprint)
- [ ] **T.3** Reunión de retrospectiva (cada 2 semanas)
- [ ] **T.4** Demo de funcionalidades (cada 2 semanas)
- [ ] **T.5** Actualización de tareas completadas
- [ ] **T.6** Identificación de deuda técnica
- [ ] **T.7** Planificación del siguiente sprint
- [ ] **T.8** Revisión de riesgos del proyecto
- [ ] **T.9** Actualización de métricas de progreso
- [ ] **T.10** Comunicación con stakeholders

---

## Métricas de Progreso por Fase

### Fase 1 (Corto Plazo)

- Tasks completados: \_\_ / 60
- Porcentaje: \_\_%
- Criterio mínimo: 80% de tasks completados

### Fase 2 (Mediano Plazo - Primera)

- Tasks completados: \_\_ / 60
- Porcentaje: \_\_%
- Criterio mínimo: 80% de tasks completados

### Fase 3 (Mediano Plazo - Segunda)

- Tasks completados: \_\_ / 60
- Porcentaje: \_\_%
- Criterio mínimo: 80% de tasks completados

### Fase 4 (Largo Plazo - Primera)

- Tasks completados: \_\_ / 60
- Porcentaje: \_\_%
- Criterio mínimo: 80% de tasks completados

### Fase 5 (Largo Plazo - Segunda)

- Tasks completados: \_\_ / 60
- Porcentaje: \_\_%
- Criterio mínimo: 80% de tasks completados

---

## Notas de Implementación

### Consideraciones para el Módulo de Pesaje

El sistema de pesaje de productos frescos debe ser implementado considerando los siguientes aspectos técnicos que son críticos para la experiencia del usuario:

**Integración de Hardware:** La comunicación con básculas USB utiliza el protocolo estándar de la industria. El sistema debe detectar automáticamente el dispositivo y manejar la conexión y desconexión en tiempo real. Se recomienda implementar un mecanismo de heartbeat para detectar básculas desconectadas.

**Manejo de Peso Inestable:** Los productos frescos como frutas y verduras pueden moverse durante el pesaje. El sistema debe implementar un algoritmo de promediado móvil con desviación estándar para determinar cuándo el peso está estable. El umbral de estabilidad debe ser configurable por producto.

**Fallback Manual:** En caso de que la báscula no funcione o se desconecte, el sistema debe permitir al operador ingresar el peso manualmente. Este modo degradado debe ser transparente para el cliente y debe registrar el modo de entrada del peso para auditoría.

**Calibración:** El sistema debe incluir un modo de calibración que permita a los técnicos de mantenimiento verificar la precisión de la báscula utilizando pesos de referencia certificados. Los resultados de calibración deben almacenarse y generar alertas cuando la precisión esté fuera de tolerancia.

### Notas sobre la Distribución de Tareas

Aunque las tareas están asignadas a desarrolladores específicos, se espera colaboración entre áreas cuando sea necesario. Un desarrollador de backend puede ayudar con tareas de frontend si tiene disponibilidad, y viceversa. Lo importante es mantener el progreso general del proyecto y no permitir que una tarea bloquee a otros miembros del equipo.

Las tareas marcadas con asterisco (\*) son bloqueantes para otras tareas y deben tener prioridad alta. Si una tarea bloqueante no puede completarse en el tiempo estimado, el equipo debe reunirse para replanificar y ajustar el cronograma.

---

_Este documento debe ser actualizado semanalmente con el progreso real del equipo. Las tareas completadas deben tener la fecha de completación y el nombre de quien las completó._

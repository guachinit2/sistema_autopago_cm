# Documento de Diseño: Sistema de Autopago

## Visión del Proyecto

Este documento define la visión estratégica del sistema de autopago, estableciendo objetivos claros a corto, mediano y largo plazo con criterios de éxito medibles. El sistema está diseñado para evolucionar desde un prototipo funcional hasta una plataforma empresarial completa capaz de operar en múltiples tiendas con funcionalidades avanzadas como pesaje de productos frescos.

La arquitectura contempla desde el inicio la capacidad de integración con hardware de pesaje, permitiendo que el sistema funcione tanto en mode de escaneo tradicional como en modo de productos frescos donde el peso determina el precio final.

---

## 1. Objetivos a Corto Plazo (Semanas 1-6)

### 1.1 Alcance del Objetivo

El objetivo a corto plazo se centra en establecer las bases técnicas del proyecto y demostrar un flujo completo de checkout funcional con un solo kiosk. Durante esta fase, el equipo validará la arquitectura propuesta, integrará las librerías fundamentales y producirá un prototipo que pueda ser utilizado para pruebas internas y demostraciones a stakeholders.

Esta fase es crítica porque establece los patrones de desarrollo, las convenciones de código y la infraestructura base sobre la cual se construirán todas las funcionalidades posteriores. Un error arquitectónico en esta fase tendría un impacto significativo en fases posteriores, por lo que se prioriza la simplicidad y la validación temprana sobre la optimización prematura.

### 1.2 Entregables Esperados

El entregable principal de esta fase es un kiosk funcional que permita a un usuario completar el flujo completo de compra: escanear productos, agregarlos al carrito, visualizar el total y simular un pago exitoso. Este kiosk operará de forma independiente y utilizará una base de datos local para persistir la información de productos y transacciones.

Además del kiosk principal, se entregarán las configuraciones de infraestructura necesarias para que cualquier miembro del equipo pueda levantar el entorno de desarrollo en menos de 30 minutos, incluyendo la base de datos PostgreSQL, el servidor Redis para caché y el backend NestJS con todas las dependencias instaladas y configuradas.

### 1.3 Funcionalidades Incluidas

**Módulo de Productos:** Catálogo de productos con búsqueda por código de barras, consulta por SKU y gestión básica de inventario. El sistema debe ser capaz de responder a consultas de productos en menos de 200 milisegundos y soportar los formatos de código de barras más comunes en el mercado latinoamericano, incluyendo EAN-13, EAN-8, UPC-A y UPC-E.

**Módulo de Carrito:** Carrito de compras que permite agregar productos, eliminar productos, modificar cantidades y calcular totales con impuestos. El carrito debe actualizarse de forma instantánea en la interfaz y persistir el estado para permitir interrupciones temporales en el proceso de compra.

**Módulo de Escaneo:** Integración con la librería html5-qrcode para permitir el escaneo de códigos de barras utilizando la cámara del dispositivo. Se implementará tanto el modo de escaneo continuo como el modo de captura única para adaptarse a diferentes escenarios de uso.

**Módulo de Pagos (Simulado):** Mock completo de pasarela de pagos que simula el proceso de autorización y confirmación de transacciones. Este módulo permite probar el flujo completo sin necesidad de conexiones a proveedores de pago reales y puede ser reemplazado por integraciones reales en fases posteriores.

**Módulo de Pesaje (Básico):** Estructura preparada para la integración con básculas de peso, incluyendo las interfaces y contratos necesarios. Durante esta fase no se implementará la conexión física con dispositivos, pero se diseñará la arquitectura para que la integración sea transparente y no requiera cambios en el código de negocio.

### 1.4 Criterios de Éxito

Para considerar exitosa la fase a corto plazo, el sistema debe cumplir con los siguientes criterios medibles que serán verificados mediante pruebas automatizadas y revisión manual:

**Criterio de Funcionalidad:** Un usuario puede completar el flujo completo de compra (iniciar sesión, escanear al menos 5 productos diferentes, modificar cantidades, eliminar un producto, calcular total con impuestos y completar pago simulado) en menos de 5 minutos sin errores bloqueantes.

**Criterio de Rendimiento:** El tiempo de respuesta de la API para consultas de productos debe ser menor a 200 milisegundos en el percentil 95 bajo condiciones de carga normal. El tiempo de actualización del carrito en la interfaz debe ser menor a 100 milisegundos.

**Criterio de Estabilidad:** El sistema debe mantener una disponibilidad del 99 por ciento durante las horas de prueba, con capacidad de recuperación automática ante fallos del servidor en menos de 30 segundos.

**Criterio de Cobertura:** La cobertura de pruebas unitarias debe ser mayor al 70 por ciento para el código del backend y mayor al 60 por ciento para el código del frontend.

**Criterio de Documentación:** Todo el código debe incluir comentarios en español que expliquen la lógica de negocio. Se debe completar la documentación de API utilizando Swagger y la guía de instalación debe permitir a un nuevo desarrollador levantar el entorno en menos de una hora.

---

## 2. Objetivos a Mediano Plazo (Semanas 7-18)

### 2.1 Alcance del Objetivo

El objetivo a mediano plazo expande el sistema desde un único kiosk funcional hasta una plataforma multi-kiosk con gestión de inventario en tiempo real, seguridad empresarial y las primeras integraciones de hardware. Durante esta fase, el sistema evoluciona de prototipo a producto mínimo viable listo para pruebas en un entorno controlado de producción.

La fase se divide en dos sub-fases de seis semanas cada una. La primera sub-fase se enfoca en la escalabilidad multi-kiosk y la integración de hardware de pesaje. La segunda sub-fase se enfoca en seguridad, auditoría y la preparación del sistema para despliegue en producción con múltiples tiendas.

Esta fase representa el mayor desafío técnico del proyecto porque introduce la complejidad de la concurrencia, la sincronización de estado entre múltiples dispositivos y la integración con hardware físico que puede comportarse de forma impredecible.

### 2.2 Entregables Esperados

El entregable principal de esta fase es una plataforma completa capaz de operar múltiples kiosks simultáneamente, con inventario sincronizado en tiempo real y capacidad de asistencia remota por parte de operadores. El sistema debe ser capaz de manejar al menos 10 kiosks concurrentes sin degradación perceptible del rendimiento.

Se entregarán también las integraciones completas con básculas de peso para productos frescos, permitiendo que el sistema calcule precios basados en peso en tiempo real. Esta funcionalidad es crítica para la propuesta de valor del sistema, ya que diferencia una solución genérica de un sistema especializado para mercados y farmacias.

Adicionalmente, se entregarán el dashboard de administración con métricas en tiempo real, el sistema de auditoría completo para cumplimiento regulatorio y las configuraciones de despliegue para ambientes de staging y producción.

### 2.3 Funcionalidades Incluidas

**Módulo Multi-Kiosk:** Sistema de gestión de sesiones distribuidas que permite múltiples kiosks operando simultáneamente. Cada kiosk puede iniciar, pausar y completar transacciones de forma independiente, mientras el servidor centraliza el inventario y detecta conflictos en tiempo real. El sistema implementa el patrón de optimistic locking para manejar actualizaciones concurrentes del inventario sin bloquear operaciones.

**Módulo de Pesaje en Tiempo Real:** Integración completa con básculas de peso mediante la librería node-escpos. El sistema puede conectarse a dispositivos USB o seriales, leer pesos en tiempo real con precisión de gramos, calcular precios basados en peso para productos frescos y manejar escenarios como productos inestables,重量 mínima no alcanzada y重量 máxima excedida.

**Módulo de Inventario en Tiempo Real:** Sistema de reserva de inventario que decrementa las cantidades disponibles cuando un producto se agrega al carrito, libera las cantidades cuando se elimina del carrito y confirma la deducción cuando el pago se completa. El sistema notifica a todos los kiosks conectados cuando el inventario de un producto baja del umbral mínimo.

**Módulo de Operador:** Interfaz de asistencia remota que permite a operadores ver el estado de todos los kiosks, recibir solicitudes de ayuda, conectarse a sesiones específicas para asistir clientes, aplicar descuentos manuales, override de precios y cancelar transacciones problemáticas.

**Módulo de Seguridad:** Implementación de autenticación JWT con roles diferenciados (cliente, operador, administrador), encriptación de datos sensibles siguiendo estándares PCI-DSS básicos, rate limiting para prevenir ataques de fuerza bruta, sanitización de inputs y headers de seguridad.

**Módulo de Auditoría:** Sistema de registro inmutable de todas las acciones críticas, incluyendo login y logout, cambios de precio, descuentos manuales, override de inventario, transacciones de pago y acceso a datos sensibles. Los registros de auditoría se almacenan en una tabla append-only y pueden ser exportados para auditorías regulatorias.

**Módulo de Dashboard:** Panel de administración con métricas en tiempo real, incluyendo número de transacciones activas, ingresos del día, productos más vendidos, estado de todos los kiosks y alertas de inventario bajo. El dashboard permite drill-down a transacciones específicas y generación de reportes en CSV.

### 2.4 Criterios de Éxito

**Criterio de Concurrencia:** El sistema debe soportar al menos 10 kiosks operando simultáneamente con latencia de actualización de inventario menor a 100 milisegundos entre kiosks. No deben existir condiciones de carrera que resulten en inventario negativo o ventas duplicadas.

**Criterio de Pesaje:** El sistema debe calcular precios basados en peso con precisión de dos decimales, manejar correctamente productos inestables con reintentos automáticos y notificar al operador cuando el peso excede límites razonables para el producto.

**Criterio de Seguridad:** El sistema debe pasar un escaneo de vulnerabilidades sin hallazgos críticos o altos. Los tokens JWT deben tener expiración de 15 minutos y las contraseñas deben almacenarse usando bcrypt con costo mínimo de 10.

**Criterio de Auditoría:** Todos los eventos críticos deben ser registrados con timestamp preciso, usuario responsable, dirección IP y datos relevantes. Los registros no deben poder ser modificados o eliminados por usuarios del sistema.

**Criterio de Rendimiento:** El tiempo de respuesta de la API debe mantenerse por debajo de 300 milisegundos en el percentil 95 bajo carga de 10 kiosks activos. El tiempo de recovery ante fallos del servidor debe ser menor a 2 minutos.

---

## 3. Objetivos a Largo Plazo (Semanas 19-32)

### 3.1 Alcance del Objetivo

El objetivo a largo plazo transforma la plataforma en un sistema empresarial completo listo para despliegue en múltiples tiendas con capacidades de escalabilidad horizontal, integración con sistemas externos y optimización continua del rendimiento. Esta fase marca la transición de proyecto de desarrollo a producto en mantenimiento.

Durante esta fase, se implementa la descomposición en microservicios para permitir el escalado independiente de cada componente, se integra un message queue para procesamiento asíncrono de eventos y se establecen las prácticas de DevOps necesarias para operaciones continuas.

La visión a largo plazo contempla un sistema que puede ser desplegado en múltiples regiones geográficas, con soporte para múltiples tiendas por región, múltiples kiosks por tienda y múltiples usuarios por kiosk, todo gestionado desde una plataforma centralizada de administración.

### 3.2 Entregables Esperados

El entregable principal de esta fase es una plataforma de producción completamente automatizada, lista para ser utilizada por clientes reales en un ambiente de producción. El sistema debe ser capaz de escalar horizontalmente para manejar picos de demanda, como días previos a festividades o eventos especiales.

Se entregarán también los pipelines de CI/CD completos con deployment automatizado a ambientes de staging y producción, los runbooks de operaciones para los escenarios más comunes, las métricas y dashboards de monitoreo y las integraciones con sistemas externos como proveedores de pago y sistemas contables.

### 3.3 Funcionalidades Incluidas

**Arquitectura de Microservicios:** Descomposición del monolito en servicios independientes que pueden ser desplegados y escalados de forma autónoma. Los servicios incluyen API Gateway para enrutamiento unificado, servicio de autenticación centralizado, servicio de productos, servicio de checkout, servicio de inventario, servicio de pagos, servicio de recibos, servicio de notificaciones y servicio de analíticas.

**Message Queue con RabbitMQ:** Implementación de un bus de eventos asíncrono para comunicación entre microservicios. Los eventos incluyen creación, actualización y eliminación de productos, reservas y confirmaciones de inventario, inicio y completación de checkouts, procesamiento de pagos y alertas del sistema.

**Sistema de Promociones:** Motor de promociones flexible que soporta códigos de descuento, promociones por porcentaje, promociones por monto fijo, promociones Buy One Get One, restricciones por categoría o producto, fechas de vigencia, límites de uso por cliente y promociones apilables.

**Integración con Sistemas Externos:** APIs documentadas con OpenAPI para integración con sistemas de terceros, webhooks para notificación de eventos, adaptadores para múltiples proveedores de pago (MercadoPago, Stripe, PayPal) y exportación de datos contables en formatos estándar.

**Property-Based Testing:** Suite de pruebas basadas en propiedades para la lógica de negocio crítica, incluyendo validación de invariantes del carrito, correctitud del cálculo de impuestos, comportamiento del motor de promociones y manejo de edge cases en el pesaje de productos.

**Pruebas de Carga y Estrés:** Escenarios de prueba que simulan condiciones de producción extremas, incluyendo picos de 500 usuarios concurrentes, fallos de red parciales y recuperación de desastres. Los resultados de estas pruebas definen los límites operativos del sistema.

**Monitoreo y Observabilidad:** Stack completo de monitoreo con Prometheus para métricas, Grafana para dashboards, ELK Stack para logs y Jaeger para distributed tracing. El sistema debe enviar alertas automáticas cuando se detecten anomalías en el rendimiento o disponibilidad.

**Pipeline de CI/CD:** Pipeline automatizado que incluye ejecución de tests, análisis estático de código, construcción de imágenes Docker, escaneo de vulnerabilidades, deployment a staging con pruebas automatizadas y deployment a producción con approval manual.

### 3.4 Criterios de Éxito

**Criterio de Escalabilidad:** El sistema debe escalar horizontalmente agregando instancias de microservicios sin downtime ni pérdida de datos. El tiempo de startup de una nueva instancia debe ser menor a 30 segundos.

**Criterio de Confiabilidad:** El sistema debe mantener una disponibilidad del 99.5 por ciento medido mensualmente. El tiempo máximo de recuperación ante fallos (RTO) debe ser menor a 5 minutos y la pérdida máxima de datos (RPO) debe ser menor a 1 minuto.

**Criterio de Rendimiento:** El sistema debe mantener tiempos de respuesta menores a 500 milisegundos en el percentil 99 bajo carga de 500 usuarios concurrentes. El procesamiento de eventos asíncronos debe completarse en menos de 5 segundos desde la emisión.

**Criterio de Calidad:** La cobertura de pruebas unitarias debe ser mayor al 85 por ciento y la cobertura de pruebas de integración debe ser mayor al 70 por ciento. Todos los tests deben pasar en menos de 10 minutos.

**Criterio de Operaciones:** El tiempo medio de resolución (MTTR) para incidentes debe ser menor a 30 minutos. El sistema debe generar menos de 5 falsos positivos por día en las alertas de monitoreo.

---

## 4. Matriz de Responsabilidades por Objetivo

### 4.1 Asignación a Corto Plazo

**Desarrollador Backend (Líder Técnico):** Configuración del monorepo, estructura del backend NestJS, integración de TypeORM, implementación del módulo de productos, implementación del módulo de pagos simulado, configuración de Docker Compose, configuración inicial de CI/CD.

**Desarrollador Frontend (Líder de UI):** Configuración del frontend React, integración de shadcn/ui, implementación del módulo de escaneo con html5-qrcode, implementación del módulo de carrito, implementación del flujo de checkout, diseño de interfaces táctiles.

**Desarrollador DevOps (Líder de Infraestructura):** Configuración de PostgreSQL, configuración de Redis, configuración del servidor Socket.io, implementación del módulo de eventos en tiempo real, configuración de ambientes, documentación de instalación.

### 4.2 Asignación a Mediano Plazo

**Desarrollador Backend:** Implementación del módulo multi-kiosk, implementación del módulo de inventario en tiempo real, integración de básculas de peso, implementación del módulo de seguridad JWT, implementación del módulo de auditoría.

**Desarrollador Frontend:** Implementación del módulo de operador, desarrollo del dashboard de administración, optimización de rendimiento de interfaces, implementación de métricas en tiempo real, diseño de interfaces de pesaje.

**Desarrollador DevOps:** Implementación de health checks, configuración de logging estructurado, setup de ambiente de staging, implementación de backups automáticos, configuración de rate limiting, documentación de operaciones.

### 4.3 Asignación a Largo Plazo

**Desarrollador Backend:** Descomposición en microservicios, implementación de RabbitMQ, desarrollo del motor de promociones, integración con proveedores de pago, implementación de property-based testing.

**Desarrollador Frontend:** Desarrollo de APIs externas, optimización de rendimiento bajo carga, implementación de dashboards de Grafana, desarrollo de reportes exportables.

**Desarrollador DevOps:** Implementación de Kubernetes, configuración de auto-scaling, setup de monitoreo completo, implementación de CI/CD avanzado, desarrollo de runbooks, implementación de disaster recovery.

---

## 5. Dependencias entre Objetivos

### 5.1 Flujo de Dependencias

El objetivo a corto plazo es prerrequisito de todos los demás objetivos. No se puede avanzar a las fases de mediano o largo plazo sin haber completado exitosamente los criterios de éxito de la fase anterior.

El objetivo a mediano plazo tiene las siguientes dependencias internas: la integración de básculas de peso depende del módulo de productos completado en corto plazo; el módulo multi-kiosk depende del servidor Socket.io configurado en corto plazo; el dashboard de administración depende de los endpoints de API completados en corto plazo.

El objetivo a largo plazo tiene las siguientes dependencias internas: la descomposición en microservicios depende de la arquitectura modular establecida en mediano plazo; el message queue depende del sistema de eventos en tiempo real de mediano plazo; las pruebas de carga dependen de la estabilidad del sistema de mediano plazo.

### 5.2 Gates de Calidad

Cada fase tiene un gate de calidad que debe ser aprobado antes de avanzar a la siguiente fase. El gate incluye la verificación de todos los criterios de éxito, una revisión de código por pares, una sesión de pruebas de aceptación y la aprobación del product owner.

Si un gate de calidad no es aprobado, el equipo debe permanecer en la fase actual hasta que todos los criterios sean cumplidos. No se permite avanzar con deuda técnica conocida.

---

## 6. Consideraciones Especiales para Pesaje de Productos

### 6.1 Requisitos del Módulo de Pesaje

El sistema debe ser capaz de pesar productos frescos de la misma forma que los sistemas de autopago de Gamma Express. Esto requiere una integración profunda con hardware de básculas y una lógica de negocio específica para manejar los escenarios únicos de los productos por peso.

El módulo de pesaje debe soportar múltiples tipos de básculas, incluyendo básculas de plataforma para productos grandes, básculas de mostrador para productos pequeños y básculas integradas en las bolsas de empaque. El sistema debe detectar automáticamente el tipo de báscula conectada y ajustar los parámetros de lectura en consecuencia.

### 6.2 Flujo de Pesaje de Productos

Cuando un cliente selecciona un producto que requiere pesaje, el sistema guía al cliente a través de un flujo específico. Primero, el cliente coloca el producto en la báscula y espera a que el peso se estabilice. El sistema muestra el peso actual en tiempo real y proporciona retroalimentación visual cuando el peso es insuficiente, óptimo o excesivo.

Una vez que el peso se estabiliza dentro de los rangos aceptables, el sistema calcula el precio multiplicando el peso por el precio por kilogramo del producto y agrega el item al carrito. El cliente puede agregar más del mismo producto, en cuyo caso el sistema累计 el peso total.

### 6.3 Manejo de Errores de Pesaje

El sistema debe manejar gracefully los escenarios de error comunes en el pesaje de productos. Si el peso es insuficiente (por debajo del mínimo detectable), el sistema solicita al cliente que agregue más producto. Si el peso es excesivo (超出 el máximo razonable para el producto), el sistema alerta a un operador para verificación manual.

Si la báscula se desconecta durante una transacción, el sistema debe detectar la desconexión en menos de 5 segundos y notificar al cliente. La transacción puede continuar en modo degradado, solicitando al operador que ingrese el peso manualmente.

### 6.4 Calibración y Mantenimiento

El sistema debe incluir funcionalidades de calibración y mantenimiento para las básculas. Los operadores pueden ejecutar rutinas de calibración que verifican la precisión de la báscula utilizando pesos de referencia. El sistema registra los resultados de calibración y alerta cuando la precisión está fuera de los rangos aceptables.

---

*Este documento debe ser revisado al final de cada fase para validar el progreso y ajustar los objetivos de las fases siguientes según los aprendizajes obtenidos.*
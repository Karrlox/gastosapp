# Gestor de Gastos e Ingresos – FabricandoHogares

Aplicación web interna para la inmobiliaria **FabricandoHogares** que permite gestionar gastos, ingresos, proyectos/propiedades y presupuestos mensuales, con autenticación de usuarios y almacenamiento en Firebase (Auth + Firestore).

## Características principales

- Autenticación de usuarios con **Firebase Authentication** (email y contraseña).[page:2]
- Gestión de **gastos** e **ingresos** con:
  - Descripción, importe, fecha, categoría, frecuencia y proyecto opcional.
  - Listados filtrables por categoría, fecha y texto de búsqueda.
- Resumen financiero automático:
  - Total de ingresos, total de gastos y balance calculados en tiempo real.[page:1][page:2]
- Listado de **próximos pagos/cobros** en los próximos 7 días.
- Gestión de **proyectos/propiedades** y asociación de transacciones a cada uno.
- Sistema de **presupuestos mensuales por categoría de gasto** con barras de progreso y avisos cuando se supera el presupuesto.
- Diseño responsive basado en **Tailwind CSS** + estilos propios (`css/style.css`).

## Tecnologías usadas

- **Frontend**
  - HTML5 + CSS3
  - [Tailwind CSS CDN](https://cdn.tailwindcss.com)
  - Fuente **Inter** (Google Fonts)
  - JavaScript ES Modules (`js/app.js`)

- **Backend as a Service**
  - **Firebase Authentication** (email/password).
  - **Cloud Firestore** para datos de usuarios, gastos, ingresos, proyectos y presupuestos.

## Estructura del proyecto

```txt
.
├── index.html        # Estructura principal de la app
├── css/
│   └── style.css     # Estilos personalizados
└── js/
    └── app.js        # Lógica de la aplicación (Firebase, Firestore, eventos UI)

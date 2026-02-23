# Security Policy

Este documento describe las consideraciones de seguridad del proyecto **Gestor de Gastos e Ingresos – FabricandoHogares** y cómo gestionar posibles vulnerabilidades.[page:1][page:2]

## Modelo de seguridad

### Autenticación

- La app utiliza **Firebase Authentication** con email y contraseña para identificar usuarios.
- La sesión se gestiona íntegramente por Firebase; el frontend escucha los cambios mediante `onAuthStateChanged` para mostrar/ocultar el contenido según el estado de login.[page:2]

### Almacenamiento de datos

- Todos los datos de negocio (gastos, ingresos, proyectos, presupuestos) se almacenan en **Cloud Firestore**.[page:2]
- La estructura de datos está **namespaced por usuario**, en rutas del estilo:
  - `artifacts/{projectId}/users/{userId}/expenses`
  - `artifacts/{projectId}/users/{userId}/incomes`
  - `artifacts/{projectId}/users/{userId}/projects`
  - `artifacts/{projectId}/users/{userId}/budgets`
- El frontend **siempre** construye rutas usando `currentUserId` (UID del usuario autenticado en Firebase), lo que proporciona separación lógica entre usuarios.[page:2]

### Reglas recomendadas de Firestore

Para garantizar el aislamiento entre usuarios, se recomienda usar reglas de seguridad en Firestore similares a:

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /artifacts/{appId}/users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}

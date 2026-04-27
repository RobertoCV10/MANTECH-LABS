# Sistema de Notificaciones

## Arquitectura

El sistema de notificaciones centralizado permite:
1. Mostrar notificaciones temporales (snackbars)
2. Mantener un historial de notificaciones persistentes
3. Recibir notificaciones desde el main process (background)
4. Preparación para notificaciones push externas

## Componentes

### NotificationContext
- **Ubicación**: `src/renderer/src/context/NotificationContext.tsx`
- **Propósito**: Estado global de notificaciones
- **Métodos**:
  - `success(message, title?, persistent?)` - Notificación de éxito
  - `error(message, title?, persistent?)` - Notificación de error
  - `warning(message, title?, persistent?)` - Notificación de advertencia
  - `info(message, title?, persistent?)` - Notificación informativa
  - `markAsRead(id)` - Marcar notificación como leída
  - `markAllAsRead()` - Marcar todas como leídas
  - `removeNotification(id)` - Eliminar notificación
  - `clearAll()` - Limpiar todas las notificaciones

### NotificationSnackbar
- **Ubicación**: `src/renderer/src/components/notifications/NotificationSnackbar.tsx`
- **Propósito**: Mostrar notificaciones temporales tipo snackbar
- **Comportamiento**: 
  - Auto-oculta después de 5-8 segundos (según severidad)
  - Muestra una notificación a la vez
  - Colores por severidad (success=verde, error=rojo, etc.)

### NotificationPanel
- **Ubicación**: `src/renderer/src/components/notifications/NotificationPanel.tsx`
- **Propósito**: Panel de historial de notificaciones
- **Acceso**: Click en el ícono de campana en la barra superior
- **Features**:
  - Lista cronológica de notificaciones
  - Badge con contador de no leídas
  - Marcar como leída individual o masivamente
  - Eliminar notificaciones individuales o todas
  - Timestamp relativo (hace 5 minutos, etc.)

## Uso en Renderer

### Hook useNotify (Recomendado)

```typescript
import { useNotify } from '../../hooks/useNotify'

const Component = () => {
  const notify = useNotify()

  const handleAction = () => {
    // Notificación temporal (solo snackbar)
    notify.success('Operación completada')
    notify.error('Error en la operación')
    notify.warning('Advertencia')
    notify.info('Información')

    // Notificación persistente (se guarda en historial)
    notify.persistent.success('Backup creado', 'Éxito')
    notify.persistent.error('Fallo crítico', 'Error')
  }
}
```

### Hook useNotification (Acceso completo)

```typescript
import { useNotification } from '../../context/NotificationContext'

const Component = () => {
  const { notifications, unreadCount, success, error } = useNotification()

  // Acceder al historial completo
  console.log(notifications)
  console.log(unreadCount)
}
```

## Uso desde Main Process

### Utilidades

```typescript
import { sendNotification, notifySuccess, notifyError } from './utils/notifications'

// En un handler IPC
ipcMain.handle('operacion-larga', async (event) => {
  const window = BrowserWindow.fromWebContents(event.sender)
  
  try {
    // Operación...
    notifySuccess(window, 'Operación completada exitosamente', 'Éxito')
  } catch (error) {
    notifyError(window, 'La operación falló', 'Error Crítico')
  }
})
```

### Funciones disponibles

- `sendNotification(window, type, message, title?, persistent?)` - Genérico
- `notifySuccess(window, message, title?)` - Éxito
- `notifyError(window, message, title?)` - Error (persistente por defecto)
- `notifyWarning(window, message, title?)` - Advertencia (persistente por defecto)
- `notifyInfo(window, message, title?)` - Información
- `broadcastNotification(type, message, title?, persistent?)` - A todas las ventanas

## Tipos de Notificación

```typescript
interface Notification {
  id: string              // ID único generado automáticamente
  type: NotificationType  // 'success' | 'error' | 'warning' | 'info'
  title?: string          // Título opcional
  message: string         // Mensaje principal
  timestamp: number       // Timestamp de creación
  persistent: boolean     // Si se guarda en historial
  read: boolean           // Estado de lectura
  source?: 'renderer' | 'main'  // Origen de la notificación
}
```

## Migración de Componentes Existentes

### Antes (Snackbar local)

```typescript
const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

const showSnackbar = (message: string, severity: string) => {
  setSnackbar({ open: true, message, severity })
}

// En el JSX
<Snackbar open={snackbar.open} onClose={() => setSnackbar({ ...snackbar, open: false })}>
  <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
</Snackbar>
```

### Después (Sistema centralizado)

```typescript
const notify = useNotify()

const handleAction = () => {
  notify.success('Mensaje de éxito')
  notify.error('Mensaje de error')
}

// En el JSX - No se necesita snackbar local
// El NotificationSnackbar global maneja la visualización
```

## Consideraciones

### Cuándo usar notificaciones persistentes
- Errores críticos que requieren atención
- Operaciones importantes completadas (backup, factory reset)
- Eventos del sistema (actualizaciones, cambios de estado)

### Cuándo usar notificaciones temporales
- Feedback de acciones cotidianas
- Confirmaciones simples
- Errores de validación

### No usar notificaciones para
- Datos sensibles (contraseñas, tokens)
- Mensajes muy largos (mejor usar diálogos)
- Información que requiere acción inmediata del usuario

## Próximas Mejoras (Roadmap)

- [ ] Notificaciones push fuera de la app (Windows Toast Notifications)
- [ ] Agrupación de notificaciones similares
- [ ] Filtros por tipo en el panel
- [ ] Búsqueda en historial
- [ ] Exportar/importar historial
- [ ] Sonidos personalizados por tipo
- [ ] Integración con sistema de logs

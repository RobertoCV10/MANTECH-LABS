#  MantechLabs

**Aplicación de escritorio para optimización de Windows con modo Gaming y mantenimiento del sistema.**

![Windows](https://img.shields.io/badge/Windows-10%2F11-blue?style=flat&logo=windows)
![Electron](https://img.shields.io/badge/Electron-39.2.6-47848BF?style=flat&logo=electron)
![License](https://img.shields.io/badge/License-MIT-green)
![Version](https://img.shields.io/badge/Version-0.8.0-orange)

---

##  Características

###  Modo Gaming
- Plan de energía Ultimate Performance
- Deshabilitar telemetría de Windows
- Silenciar notificaciones (Focus Assist)
- Game Mode optimizado

###  Optimización de RAM
- Limpiar Standby List
- Reducir Working Set de procesos
- Monitoreo en tiempo real

###  Limpieza de Archivos Temporales
- User Temp (`%TEMP%`)
- Windows Temp
- Prefetch
- Windows Update Cache

###  Mantenimiento del Sistema
- Checklist interactivo
- Seguimiento de progreso por fecha
- Notificaciones de vencimiento

###  Monitoreo en Tiempo Real
- CPU (uso y temperatura)
- RAM (active, available, cache, working set)
- Disco (uso, lectura/escritura, SMART)

---

##  Tecnologías

| Capa | Tecnología |
|------|------------|
| Framework | Electron 39 + Electron-Vite |
| Frontend | React 19 + TypeScript |
| UI | Material UI 7 + Emotion |
| Gráficos | Lucide React + Recharts |
| Sistema | PowerShell + Node.js |
| Datos | i18next (ES/EN) |
| Actualizaciones | electron-updater |

---

##  Requisitos del Sistema

- **OS:** Windows 10/11 (64-bit)
- **RAM:** 4 GB mínimo
- **Espacio:** 300 MB
- **Permisos:** Administrador (para algunas funciones)

---

##  Descarga

Ver [Releases](https://github.com/RobertoCV10/MANTECH-LABS/releases) para descargar el installer.

---

##  Desarrollo

### Configuración

```bash
# Clonar repo
git clone https://github.com/RobertoCV10/MANTECH-LABS.git
cd MANTECH-LABS

# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Build producción
npm run build:win

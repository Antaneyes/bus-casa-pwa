# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Descripción General

Bus Casa es una PWA (Progressive Web App) y aplicación nativa Android (usando Capacitor) para encontrar paradas de autobús EMT Valencia cercanas para volver a casa. La app calcula una puntuación inteligente basada en la distancia a la parada + distancia de la parada a casa, y muestra tiempos de llegada en tiempo real.

## Arquitectura

### Tecnologías Principales
- **Frontend**: JavaScript vanilla (sin frameworks), HTML5, CSS3
- **Mapas**: Leaflet.js para visualización interactiva
- **PWA**: Service Worker para funcionalidad offline
- **Android Nativo**: Capacitor 6.0 para compilar a APK
- **Deployment Web**: Docker + Nginx Alpine
- **API**: EMT Valencia OpenDataSoft API para datos de paradas y tiempos

### Estructura de Archivos Críticos

#### Archivos Web (PWA)
- `index.html` - UI principal con estructura semántica
- `main.js` - Lógica completa de la app (geolocalización, mapas, cálculo de puntuación, API)
- `styles.css` - Estilos con soporte de tema oscuro/claro
- `sw.js` - Service Worker para cacheo (Network First para API, Cache First para assets)
- `manifest.json` - PWA manifest
- `config.private.js` - **NUNCA COMMITEADO** - Contiene coordenadas privadas de casa (`window.SECRET_CONFIG`)

#### Configuración Capacitor
- `capacitor.config.json` - Configuración de Capacitor
  - `appId`: `com.antaneyes.buscasa`
  - `webDir`: `www` - Directorio donde se copian los assets web
  - Plugin crítico: `CapacitorHttp` habilitado para descargar APKs

#### Docker
- `Dockerfile` - Imagen Nginx Alpine
- `docker-compose.yml` - Servicio en puerto 8091
- `nginx.conf` - Configuración de servidor web
- `deploy.ps1` - Script PowerShell para despliegue rápido

#### CI/CD
- `.github/workflows/build-android.yml` - GitHub Actions para builds automáticos de Android
  - Se ejecuta en push a `android-capacitor` o manualmente
  - Genera `www/` dinámicamente
  - Usa secrets: `HOME_LAT`, `HOME_LON`, `KEYSTORE_BASE64`, `KEYSTORE_PASSWORD`, `KEY_ALIAS`
  - Añade permisos de ubicación y `REQUEST_INSTALL_PACKAGES` al AndroidManifest
  - Incrementa `versionCode` con `github.run_number`

### Lógica de Negocio Clave

#### Configuración en `main.js` (`CONFIG` object):
- `HOME_COORDS`: Lee de `window.SECRET_CONFIG` o usa valores por defecto
- `USEFUL_LINES`: Array de líneas de bus relevantes (incluye aliases como 'C2', 'C3', 'C1')
- `LINE_ALIASES`: Mapeo de números internos API a nombres comerciales (ej: '79'/'80' → 'C2')
- `DESTINATION_STOPS`: Mapeo de línea → código de parada cerca de casa
- `EXCLUDED_STOPS`: Paradas con datos erróneos en el dataset

#### Sistema de Puntuación:
```javascript
score = distanciaUsuarioAParada + distanciaParadaACasa
```
Menor puntuación = mejor opción. La parada ideal es la más cercana al usuario que además esté en la dirección correcta hacia casa.

#### Plugins Nativos Capacitor Usados:
- `@capacitor/geolocation` - Ubicación GPS
- `@capacitor/status-bar` - Control de status bar
- `@hugotomazi/capacitor-navigation-bar` - Control de barra de navegación
- `@capacitor/filesystem` - Guardar archivos (APKs)
- `@capacitor/app` - Hooks del ciclo de vida
- `@capacitor-community/file-opener` - Abrir APKs para instalar
- `@capacitor/core` con CapacitorHttp - Descargar APKs desde GitHub

## Comandos de Desarrollo

### Docker (Web)
```bash
# Despliegue completo
.\deploy.ps1

# O manualmente:
docker-compose build
docker-compose up -d
docker-compose down

# Ver logs
docker-compose logs -f
```

La app web estará en `http://localhost:8091`

### Capacitor (Android)

**IMPORTANTE**: El directorio `android/` NO está en el repo. Se genera dinámicamente.

```bash
# 1. Preparar directorio www/
mkdir www
cp index.html main.js styles.css manifest.json sw.js icon-192.png config.private.js www/

# 2. Generar proyecto Android (primera vez)
npx cap add android

# 3. Sincronizar cambios
npx cap sync android

# 4. Abrir en Android Studio
npx cap open android
```

#### Permisos Android Requeridos
Añadir manualmente a `android/app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.REQUEST_INSTALL_PACKAGES" />
<uses-feature android:name="android.hardware.location.gps" />
<!-- En <application>: -->
android:usesCleartextTraffic="true"
```

#### Build APK Release (Manual)
```bash
cd android
./gradlew assembleRelease \
  -Pandroid.injected.signing.store.file="/path/to/bus-casa-release.keystore" \
  -Pandroid.injected.signing.store.password="PASSWORD" \
  -Pandroid.injected.signing.key.alias="ALIAS" \
  -Pandroid.injected.signing.key.password="PASSWORD"
```

APK estará en: `android/app/build/outputs/apk/release/app-release.apk`

### Actualizar Versión

1. Cambiar `CONFIG.CURRENT_VERSION` en `main.js` (usado por auto-update nativo)
2. Cambiar versión en `index.html` (footer)
3. Cambiar versión en `.github/workflows/build-android.yml` (línea `versionName`)
4. Actualizar `CACHE_NAME` en `sw.js` si cambió UI/assets
5. Cambiar query param `?v=` en `index.html` para `styles.css` y `main.js` (evitar cache)

## Gestión de Configuración Privada

El archivo `config.private.js` **NUNCA** debe commitearse (está en `.gitignore`). Formato:
```javascript
window.SECRET_CONFIG = { HOME_LAT: 39.xxxxx, HOME_LON: -0.xxxxx };
```

En CI/CD, se genera dinámicamente desde GitHub Secrets.

## Branch Strategy

- `master` - Rama principal para PWA web
- `android-capacitor` - Rama para builds Android con GitHub Actions

## Notas Importantes

1. **UI Nativa**: La app usa muchos ajustes CSS específicos para Android (viewport-fit=cover, safe areas, StatusBar transparente). No eliminar estilos relacionados con `env(safe-area-*)`.

2. **API Limits**: La API de EMT tiene límite de 100 registros por petición. Si se necesitan más paradas, hay que hacer múltiples requests con `offset`.

3. **Leaflet**: Los assets de Leaflet se cargan desde CDN (unpkg.com). Asegurar que CSP permita este origen.

4. **Service Worker**: Estrategia híbrida - Network First para API (datos frescos), Cache First para assets (velocidad).

5. **Keystore**: El archivo `bus-casa-release.keystore` está en `.gitignore`. Para builds release, usar el stored en GitHub Secrets como Base64.

6. **Auto-update Native**: La app tiene un sistema de auto-actualización que descarga APKs desde GitHub Releases usando CapacitorHttp y los instala con FileOpener. Ver función relevante en `main.js`.

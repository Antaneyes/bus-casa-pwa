# Bus Casa PWA

Progressive Web App para encontrar paradas de autobús EMT Valencia cercanas para volver a casa.

## Características

- 🚌 Encuentra paradas cercanas de líneas útiles
- 📍 Geolocalización en tiempo real
- 🎯 Sistema de puntuación inteligente (distancia a parada + distancia a casa)
- 🗺️ Mapa interactivo con Leaflet
- ⏱️ Tiempos de llegada en tiempo real
- 🌓 Modo oscuro/claro
- 📱 PWA instalable
- 🔄 Funciona offline

## Despliegue con Docker

### Construcción

```bash
docker-compose build
```

### Ejecución

```bash
docker-compose up -d
```

La aplicación estará disponible en `http://localhost:8091`

### Configuración con Cloudflare Tunnel

La aplicación está configurada para funcionar con `emt.ombi.es` a través de Cloudflare Tunnel.

Asegúrate de que tu Cloudflare Tunnel apunte al puerto `8091` del contenedor.

### Detener

```bash
docker-compose down
```

## Configuración

Las coordenadas de casa y las paradas de destino están configuradas en `main.js`:

- `CONFIG.HOME_COORDS`: Coordenadas de tu casa
- `CONFIG.DESTINATION_STOPS`: Mapeo de líneas a paradas de destino

## Tecnologías

- HTML5 + CSS3 + JavaScript vanilla
- Leaflet.js para mapas
- Service Worker para PWA
- Nginx Alpine para servir la aplicación
- Docker para despliegue

# ROADMAP - Bus Casa

## ✅ Resuelto en v0.91

### 4.-Añadir distancia a casa en tooltips de chips de líneas - ✅ RESUELTO (commit d63111a)
- Los chips ahora muestran "Bajarse en: X #ID · 🏠 Xm" con distancia calculada
- `buildUsefulLineChips()` usa `calculateDistance()` igual que `getArrivalDestInfo()`
- Afecta a tarjetas del mapa y lista de abajo

### 5.-Líneas de tranvía no se destacan como mejor opción - ✅ RESUELTO (commit d63111a)
- Cambio prioridad en `accentColor`: `isBestLine` antes de `isTram`
- Si T4/T6 es bestLine → rosa #ec4899 (highlight), no siempre verde
- Fix en `loadArrivalsInDrawer()` línea 1535

### 7.-Paradas de tranvía sin mostrar llegadas - ✅ RESUELTO
- Neptú(126) devolvía `line: 8` (no L6) → eliminada de paradas L6
- Tossal del Rei(132) mantenida como destination-only (`linesHomeward: []`) para lookup de destino
- `stopsById` ahora incluye TODAS las paradas (no solo homeward) para que `getArrivalDestInfo()` funcione
- Logging debug añadido en `fetchFgvArrivals()` para diagnosticar futuros problemas
- Marítim y Canyamelar mantenidas (sin datos era timing, son paradas válidas L6)

### 8.-Botón refresh no recarga tranvías - ✅ RESUELTO
- `loadArrivalsInline` no estaba en `window` → botón 🔄 inline fallaba con error "not defined"
- Fix: añadido `window.loadArrivalsInline = loadArrivalsInline;`
- Ahora funciona para bus y tram en tarjetas de lista

### 9.-Solo muestra una llegada de tranvía - ✅ NO ERA BUG
- El código procesa todas las llegadas correctamente con `forEach`
- Lo que veía el usuario era el filtro de dirección funcionando (elimina trenes en dirección incorrecta)
- Logging añadido para verificar filtrado

### 10.-Verificar paradas L6 - ✅ RESUELTO
- Neptú(126) confirmado como línea 8 → eliminada
- Resto de paradas L6 verificadas con API real → funcionan correctamente
- 9 paradas L6-only finales (8 activas + Tossal del Rei como destination-only)

### 11.-Service Worker cachea respuestas de API - ✅ PARCIALMENTE RESUELTO (commit c97ffd7)
- Fix: cambio a Network First para HTML/JS/CSS propios (antes Cache First para TODO)
- Cache First solo para CDN/fonts y assets externos
- ⚠️ Pendiente: requests a `/api/*` todavía usan Cache First (deberían usar Network First)

## 🟡 Prioridad Media (UX y Precisión)

### 6.-Revisar sistema de puntuación de paradas
- La puntuación actual es `distanciaUsuarioAParada + distanciaParadaACasa`
- En pruebas reales no siempre marca como mejor la parada que el usuario considera óptima
- Posibles mejoras: ponderar factores (frecuencia, tiempo espera, transbordos), ajustar pesos, considerar ETA real

### 12.-Configuración duplicada entre main.js y build-stops.js
- `USEFUL_LINES`, `DESTINATION_STOPS` y `LINE_ALIASES` están definidos en ambos archivos
- Si se modifica uno hay que recordar cambiar el otro → propenso a errores
- Mover a un fichero compartido (ej: `config.shared.json`) que ambos importen

## 🟢 Prioridad Baja (Mejoras y Mantenimiento)

### 3.-Cambio de tema/interfaz
- Rediseño visual de la interfaz a algo más bonito/moderno
- Revisar paleta de colores, tipografía, layout de tarjetas
- Posibles mejoras: nuevo estilo de cards, animaciones, mejor contraste

### 2.-Quitar datos de tranvía hardcoded
- Las paradas FGV (L4, L6) están hardcoded en `build-stops.js` (coordenadas, IDs, nombres)
- La API `/estaciones` de FGV (`https://www.fgv.es/fgv/app/es/api/v1/V/estaciones`) devuelve toda la info necesaria
- Migrar `build-stops.js` para que consulte la API en vez de usar arrays estáticos
- Mantener solo la lógica de qué estaciones son L4, L6 o compartidas (o detectarlo automáticamente)

### 1.-Regeneración automática de stops-data.json
- Actualmente `node build-stops.js` se ejecuta manualmente
- Implementar cron/scheduled task que lo regenere periódicamente (ej: cada madrugada)
- Opciones: GitHub Actions scheduled workflow, cron en Docker, o script en el servidor
- El GTFS de EMT se actualiza con poca frecuencia pero conviene mantenerlo al día

### 13.-Limpiar CSS muerto
- Selectores `.stop-lines`, `.line-badge.best-line`, `.stop-home-distance`, `.stop-best-line` no se usan
- Quedaron de refactorizaciones anteriores → eliminar para reducir tamaño

### 14.-nginx: gzip no comprime JSON
- `gzip_types` en `nginx.conf` no incluye `application/json`
- `stops-data.json` (~230KB) se sirve sin comprimir → más lento en primera carga
- Añadir `application/json` a la lista de tipos comprimidos

### 15.-Memory leaks en event listeners de tarjetas
- `displayStops()` añade event listeners con `querySelectorAll('.stop-card').forEach()` cada vez que renderiza
- Los listeners anteriores no se limpian → se acumulan en memoria
- Usar event delegation en el contenedor padre en vez de listeners individuales

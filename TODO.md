# TODO - Bus Casa

## ✅ Resuelto en v0.91

### 7.-Paradas de tranvía sin mostrar llegadas - ✅ RESUELTO
- Neptú(126) devolvía `line: 8` (no L6) → eliminada de paradas L6
- Tossal del Rei(132) eliminada (parada destino, no útil para ir a casa)
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
- 8 paradas L6-only finales

## 🔴 Prioridad Alta (Funcionalidad Crítica)

*(Vacío - todos resueltos)*

## 🟡 Prioridad Media (UX y Precisión)

### 6.-Revisar sistema de puntuación de paradas
- La puntuación actual es `distanciaUsuarioAParada + distanciaParadaACasa`
- En pruebas reales no siempre marca como mejor la parada que el usuario considera óptima
- Posibles mejoras: ponderar factores (frecuencia, tiempo espera, transbordos), ajustar pesos, considerar ETA real

### 5.-Líneas de tranvía no se destacan como mejor opción
- En las tarjetas, las líneas de bus marcan la mejor en otro color pero las de tranvía no
- Revisar lógica de `bestLine` / destacado de línea óptima para que también aplique a T4/T6

### 4.-Añadir distancia a casa en tooltips de chips de líneas
- Los chips de líneas útiles (en tarjetas interactivas del mapa y lista de abajo) muestran al hover "Bajarse en: X #ID"
- Falta añadir también la distancia a casa, igual que ya se muestra en las subtarjetas de llegadas (ej: "Bajarse en: Sagunt #tram-93 · 🏠 350m")
- Afecta a `buildUsefulLineChips()` en `main.js`

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

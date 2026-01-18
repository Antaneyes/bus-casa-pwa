// ========================================
// CONFIGURACIÓN Y CONSTANTES
// ========================================

const CONFIG = {
    // Coordenadas de casa (Avenida de la Constitución 56, 46009 Valencia)
    HOME_COORDS: {
        lat: 39.486761,
        lon: -0.377689
    },

    // Líneas útiles para volver a casa
    USEFUL_LINES: ['11', '6', '16', '26', '98', 'C2', 'C3', 'C1', '94', '95', '60', '64', '28'],

    // Paradas de destino cerca de casa por línea
    DESTINATION_STOPS: {
        '11': 215,    // Alboraia - Primat Reig
        '6': 322,     // Sagunt - Fra Pere Vives
        '16': 322,    // Sagunt - Fra Pere Vives
        '26': 322,    // Sagunt - Fra Pere Vives
        '98': 1808,   // Ruaya (parell) - Visitació
        'C1': 1305,   // Guillem de Castro - Na Jordana
        'C2': 351,    // El Pla de la Saïdia (riu) - Constitució
        'C3': 1682,   // Primat Reig - Constitució
        '94': 351,    // El Pla de la Saïdia (riu) - Constitució
        '95': 343,    // El Pla de la Saïdia - Constitució
        '60': 1217,   // Doctor Peset Aleixandre - Felip Rinaldi
        '64': 242,    // Doctor Peset Aleixandre - Guardacostes
        '28': 331     // Burjassot - Centre Cultural Bombas Gens
    },

    // API de EMT Valencia
    API_URL: 'https://valencia.opendatasoft.com/api/explore/v2.1/catalog/datasets/emt/records',
    API_LIMIT: 100, // Límite por petición
    API_MAX_REQUESTS: 15, // Máximo de peticiones para obtener todas las paradas

    // Radio de búsqueda por defecto (metros)
    DEFAULT_RADIUS: 500,

    MAP_CONFIG: {
        defaultZoom: 15,
        maxZoom: 18,
        minZoom: 12
    },

    // Cabeceras de línea (puntos extremos) para calcular dirección
    HEADBOARDS: {
        '6': [
            { name: 'TORREFIEL', keywords: ['TORREFIEL'], lat: 39.4939, lon: -0.3748 },
            { name: 'HOSPITAL LA FE', keywords: ['FE', 'MALILLA'], lat: 39.4443, lon: -0.3764 }
        ],
        '11': [
            { name: 'ALBORAYA', keywords: ['ALBORAYA', 'ALBORAIA', 'ORRIOLS'], lat: 39.4998, lon: -0.3516 },
            { name: 'PATRAIX', keywords: ['PATRAIX'], lat: 39.4581, lon: -0.3957 }
        ],
        '16': [
            { name: 'VINALESA', keywords: ['VINALESA', 'CASAS'], lat: 39.5371, lon: -0.3712 },
            { name: 'POETA QUEROL', keywords: ['POETA', 'QUEROL', 'CENTRE'], lat: 39.4715, lon: -0.3752 }
        ],
        '26': [
            { name: 'MONCADA', keywords: ['MONCADA', 'ALFARA'], lat: 39.5445, lon: -0.3958 },
            { name: 'POETA QUEROL', keywords: ['POETA', 'QUEROL', 'CENTRE'], lat: 39.4715, lon: -0.3752 }
        ],
        '28': [
            { name: 'ARTISTA FALLER', keywords: ['FALLER', 'ARTISTA'], lat: 39.5021, lon: -0.3921 },
            { name: 'XATIVA', keywords: ['XATIVA', 'ESTACIO'], lat: 39.4678, lon: -0.3781 }
        ],
        '60': [
            { name: 'TORREFIEL', keywords: ['TORREFIEL'], lat: 39.4939, lon: -0.3748 },
            { name: 'SANT AGUSTI', keywords: ['AGUSTI'], lat: 39.4682, lon: -0.3774 }
        ],
        '64': [
            { name: 'BENICALAP', keywords: ['BENICALAP'], lat: 39.4925, lon: -0.3912 },
            { name: 'HOSPITAL LA FE', keywords: ['FE', 'MALILLA'], lat: 39.4443, lon: -0.3764 }
        ],
        '94': [
            { name: 'GRAO', keywords: ['GRAO', 'FRANCA', 'MARITIM', 'MARINA'], lat: 39.4582, lon: -0.3325 },
            { name: 'CAMPANAR', keywords: ['CAMPANAR'], lat: 39.4891, lon: -0.4024 }
        ],
        '95': [
            { name: 'LA MARINA', keywords: ['MARINA', 'NEPTU', 'GRAO'], lat: 39.4621, lon: -0.3258 },
            { name: 'HOSPITAL GENERAL', keywords: ['GENERAL', 'CREUS', 'NOU', 'OCTUBRE'], lat: 39.4695, lon: -0.4102 }
        ],
        '98': [
            { name: 'ESTACIO CABANYAL', keywords: ['CABANYAL', 'ESTACIO', 'MARITIM', 'SERRERIA'], lat: 39.4675, lon: -0.3342 },
            { name: 'AV. CID', keywords: ['CID'], lat: 39.4682, lon: -0.4021 }
        ],
        'C1': [
            { name: 'PARE D\'ORFENS', keywords: ['ORFENS', 'BLANQUERIA'], lat: 39.4792, lon: -0.3775 },
            { name: 'XATIVA', keywords: ['XATIVA', 'ESTACIO'], lat: 39.4678, lon: -0.3781 }
        ],
        'C2': [
            { name: 'GRAN VIA / CENTRO', keywords: ['NA JORDANA', 'GUILLEM', 'GRAN VIA'], lat: 39.4715, lon: -0.3800 },
            { name: 'TRANSITOS / PERIFERIA', keywords: ['PRIMADO', 'CONSTITUCIO', 'SAIDIA'], lat: 39.4880, lon: -0.3750 }
        ],
        'C3': [
            { name: 'AVENIDA DEL CID / OESTE', keywords: ['CID', 'TRES CREUS'], lat: 39.4682, lon: -0.4021 },
            { name: 'POLITECNICO / ESTE', keywords: ['TARONGERS', 'FAUSTO', 'CATALUNYA', 'BOSCA'], lat: 39.4796, lon: -0.3392 }
        ]
    }
};

// ========================================
// ESTADO DE LA APLICACIÓN
// ========================================

const state = {
    userLocation: null,
    allStops: [],
    filteredStops: [],
    selectedRadius: CONFIG.DEFAULT_RADIUS,
    map: null,
    markers: [],
    userMarker: null,
    useFakeLocation: false,
    fakeLocation: null,
    selectingLocation: false
};

// ========================================
// ELEMENTOS DEL DOM
// ========================================

const elements = {
    locationStatus: document.getElementById('location-status'),
    statusText: document.querySelector('.status-text'),
    map: document.getElementById('map'),
    stopsList: document.getElementById('stops-list'),
    stopsCount: document.getElementById('stops-count'),
    radioBtns: document.querySelectorAll('.radio-btn'),
    locateBtn: document.getElementById('locate-btn'),
    themeToggle: document.getElementById('theme-toggle'),
    themeIcon: document.querySelector('.theme-icon'),
    arrivalsModal: document.getElementById('arrivals-modal'),
    arrivalsIframe: document.getElementById('arrivals-iframe'),
    closeModal: document.getElementById('close-modal'),
    // Fake location controls
    toggleFakeLocation: document.getElementById('toggle-fake-location'),
    fakeLocationControls: document.getElementById('fake-location-controls'),
    btnSelectLocation: document.getElementById('btn-select-location'),
    resetFakeLocation: document.getElementById('reset-fake-location'),
    fakeLocationInfo: document.getElementById('fake-location-info'),
    fakeCoordsDisplay: document.getElementById('fake-coords-display')
};

// ========================================
// INICIALIZACIÓN
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

async function initializeApp() {
    console.log('🚀 Iniciando Bus Casa PWA...');

    // Inicializar tema
    initializeTheme();

    // Inicializar mapa
    initializeMap();

    // Inicializar event listeners
    initializeEventListeners();

    // Cargar paradas de EMT
    await loadStops();

    // Obtener ubicación del usuario
    getUserLocation();

    // Registrar Service Worker
    registerServiceWorker();
}

// ========================================
// GEOLOCALIZACIÓN
// ========================================

function getUserLocation() {
    if (state.useFakeLocation && state.fakeLocation) {
        console.log('🎭 Usando ubicación simulada:', state.fakeLocation);
        state.userLocation = state.fakeLocation;
        updateUserMarker();
        filterAndDisplayStops();
        return;
    }

    if (!navigator.geolocation) {
        showError('Tu navegador no soporta geolocalización');
        return;
    }

    showLocationStatus('Obteniendo ubicación...');

    navigator.geolocation.watchPosition(
        (position) => {
            if (!state.useFakeLocation) {
                state.userLocation = {
                    lat: position.coords.latitude,
                    lon: position.coords.longitude
                };

                console.log('📍 Ubicación obtenida:', state.userLocation);
                hideLocationStatus();
                updateUserMarker();
                filterAndDisplayStops();
            }
        },
        (error) => {
            console.error('Error de geolocalización:', error);
            showError('No se pudo obtener tu ubicación. Verifica los permisos.');
        },
        {
            enableHighAccuracy: true,
            maximumAge: 10000,
            timeout: 5000
        }
    );
}

// ========================================
// API - CARGAR PARADAS
// ========================================

async function loadStops() {
    try {
        showLocationStatus('Cargando paradas de EMT...');

        let allResults = [];
        let offset = 0;
        let hasMore = true;
        let requestCount = 0;

        // Cargar paradas con paginación
        while (hasMore && requestCount < CONFIG.API_MAX_REQUESTS) {
            const url = `${CONFIG.API_URL}?limit=${CONFIG.API_LIMIT}&offset=${offset}`;
            console.log(`🌐 Petición ${requestCount + 1}: offset=${offset}`);

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            const data = await response.json();
            console.log(`📊 Recibidas ${data.results.length} paradas (total acumulado: ${allResults.length + data.results.length})`);

            allResults = allResults.concat(data.results);

            // Verificar si hay más resultados
            if (data.results.length < CONFIG.API_LIMIT) {
                hasMore = false;
                console.log('✅ Todas las paradas cargadas');
            } else {
                offset += CONFIG.API_LIMIT;
                requestCount++;
            }
        }

        console.log(`📦 Total paradas cargadas: ${allResults.length}`);
        if (allResults.length > 0) {
            console.log('� Ejemplo de parada:', allResults[0]);
        }

        // Procesar y filtrar paradas
        const allProcessed = allResults
            .filter(stop => !stop.suprimida)
            .map(stop => ({
                id: stop.id_parada,
                name: stop.denominacion,
                lines: stop.lineas ? stop.lineas.split(',').map(l => l.trim()) : [],
                coords: {
                    lat: stop.geo_point_2d.lat,
                    lon: stop.geo_point_2d.lon
                },
                arrivalsUrl: stop.proximas_llegadas
            }));

        console.log(`📍 Paradas procesadas (sin suprimir): ${allProcessed.length}`);
        console.log('🔍 Líneas útiles configuradas:', CONFIG.USEFUL_LINES);

        state.allStops = allProcessed.filter(stop => hasUsefulLine(stop.lines));

        console.log(`✅ Paradas con líneas útiles: ${state.allStops.length}`);
        if (state.allStops.length > 0) {
            console.log('📋 Ejemplo de parada útil:', state.allStops[0]);
        } else {
            console.warn('⚠️ NO SE ENCONTRARON PARADAS CON LÍNEAS ÚTILES');
            console.log('🔎 Verificando algunas paradas al azar:');
            allProcessed.slice(0, 10).forEach(stop => {
                console.log(`  - ${stop.name}: líneas [${stop.lines.join(', ')}]`);
            });
        }

        hideLocationStatus();

        // Si ya tenemos ubicación, filtrar y mostrar
        if (state.userLocation) {
            filterAndDisplayStops();
        }

    } catch (error) {
        console.error('❌ Error cargando paradas:', error);
        showError('Error al cargar las paradas de EMT');
    }
}

// ========================================
// FILTRADO Y CÁLCULOS
// ========================================

function hasUsefulLine(lines) {
    return lines.some(line => CONFIG.USEFUL_LINES.includes(line));
}

function filterAndDisplayStops() {
    if (!state.userLocation) {
        console.log('⏳ Esperando ubicación del usuario...');
        return;
    }

    console.log('📍 Ubicación del usuario:', state.userLocation);
    console.log('🏠 Ubicación de casa:', CONFIG.HOME_COORDS);
    console.log(`📏 Radio de búsqueda: ${state.selectedRadius}m`);
    console.log(`🏪 Total paradas útiles disponibles: ${state.allStops.length}`);

    // Crear un mapa de paradas de destino para acceso rápido
    const destinationStopsMap = new Map();
    state.allStops.forEach(stop => {
        destinationStopsMap.set(stop.id, stop);
    });

    // Calcular distancias y puntuar paradas
    const stopsWithDistance = state.allStops
        .map(stop => {
            // Distancia desde tu ubicación actual a la parada de subida
            const distanceToStop = calculateDistance(
                state.userLocation.lat,
                state.userLocation.lon,
                stop.coords.lat,
                stop.coords.lon
            );

            // Calcular la distancia mínima a casa considerando todas las líneas de esta parada
            let minDistanceToHome = Infinity;
            let bestLine = null;
            let bestDestinationStop = null;

            stop.lines.forEach(line => {
                const destinationStopId = CONFIG.DESTINATION_STOPS[line];
                if (destinationStopId) {
                    const destinationStop = destinationStopsMap.get(destinationStopId);
                    if (destinationStop) {
                        const distanceToHome = calculateDistance(
                            destinationStop.coords.lat,
                            destinationStop.coords.lon,
                            CONFIG.HOME_COORDS.lat,
                            CONFIG.HOME_COORDS.lon
                        );

                        if (distanceToHome < minDistanceToHome) {
                            minDistanceToHome = distanceToHome;
                            bestLine = line;
                            bestDestinationStop = destinationStop;
                        }
                    }
                }
            });

            // Si no encontramos parada de destino, usar la distancia directa (fallback)
            const distanceStopToHome = minDistanceToHome !== Infinity ? minDistanceToHome :
                calculateDistance(
                    stop.coords.lat,
                    stop.coords.lon,
                    CONFIG.HOME_COORDS.lat,
                    CONFIG.HOME_COORDS.lon
                );

            // Calcular dirección
            const direction = calculateDirection(
                state.userLocation.lat,
                state.userLocation.lon,
                stop.coords.lat,
                stop.coords.lon
            );

            // CALCULO DE PENALIZACIÓN POR "CAMINATA HACIA ATRÁS"
            // Si para ir a la parada te alejas de tu destino final, penalizamos el score.
            let directionPenalty = 0;
            if (bestDestinationStop) {
                const distUserToDest = calculateDistance(
                    state.userLocation.lat, state.userLocation.lon,
                    bestDestinationStop.coords.lat, bestDestinationStop.coords.lon
                );
                const distStopToDest = calculateDistance(
                    stop.coords.lat, stop.coords.lon,
                    bestDestinationStop.coords.lat, bestDestinationStop.coords.lon
                );

                // Si la parada está más lejos del destino que tú mismo, es una caminata "hacia atrás"
                if (distStopToDest > distUserToDest + 50) {
                    directionPenalty = (distStopToDest - distUserToDest) * 1.5;
                }
            }

            // Sistema de puntuación (menor es mejor)
            // Peso: 50% distancia a parada, 30% distancia desde destino a casa, 20% penalización dirección
            const score = (distanceToStop * 0.5) + (distanceStopToHome * 0.3) + directionPenalty;

            return {
                ...stop,
                distanceToStop,
                distanceStopToHome,
                direction,
                score,
                bestLine,
                bestDestinationStop,
                isBackwards: directionPenalty > 0
            };
        });

    // Mostrar las 5 paradas mejor puntuadas para debug
    const topScored = stopsWithDistance
        .sort((a, b) => a.score - b.score)
        .slice(0, 5);

    console.log('🏆 Top 5 paradas mejor puntuadas:');
    topScored.forEach((stop, index) => {
        console.log(`  ${index + 1}. ${stop.name}`);
        console.log(`     📍 A parada: ${stop.distanceToStop}m`);
        if (stop.bestLine && stop.bestDestinationStop) {
            console.log(`     🚌 Mejor línea: ${stop.bestLine} → ${stop.bestDestinationStop.name}`);
        }
        console.log(`     🏠 Te deja a: ${stop.distanceStopToHome}m de casa`);
        console.log(`     ⭐ Score: ${Math.round(stop.score)}m`);
    });

    // Filtrar por radio y ordenar por puntuación (mejor primero)
    const stopsInRadius = stopsWithDistance
        .filter(stop => stop.distanceToStop <= state.selectedRadius)
        .sort((a, b) => a.score - b.score);

    // Filtrar para evitar duplicados excesivos de líneas
    // PERO permitir duplicados si las paradas son muy buenas (Top 3 general)
    const shownLines = new Set();
    state.filteredStops = [];

    // Obtenemos el Top 3 de puntuación absoluta sin filtros de duplicados
    const globalTop3Ids = new Set(stopsInRadius.slice(0, 3).map(s => s.id));

    for (const stop of stopsInRadius) {
        let shouldInclude = false;

        // Si es una de las 3 mejores paradas absolutas, la mostramos siempre
        if (globalTop3Ids.has(stop.id)) {
            shouldInclude = true;
        } else {
            // Para el resto, solo si tiene líneas útiles que no hemos mostrado todavía
            const usefulLinesInStop = stop.lines.filter(line => CONFIG.USEFUL_LINES.includes(line));
            const newUsefulLines = usefulLinesInStop.filter(line => !shownLines.has(line));
            if (newUsefulLines.length > 0) {
                shouldInclude = true;
            }
        }

        if (shouldInclude) {
            state.filteredStops.push(stop);
            // Marcar todas sus líneas útiles como mostradas
            stop.lines.filter(line => CONFIG.USEFUL_LINES.includes(line))
                .forEach(l => shownLines.add(l));
        }

        // Limitar a máximo 6 paradas para no saturar la UI
        if (state.filteredStops.length >= 6) break;
    }

    console.log(`✅ Paradas dentro del radio de ${state.selectedRadius}m: ${state.filteredStops.length}`);
    console.log(`📋 Líneas útiles cubiertas: ${Array.from(shownLines).join(', ')}`);

    // Actualizar UI
    displayStops();
    updateMapMarkers();
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Radio de la Tierra en metros
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round(R * c); // Distancia en metros
}

function calculateDirection(lat1, lon1, lat2, lon2) {
    const Δλ = (lon2 - lon1) * Math.PI / 180;
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;

    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) -
        Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
    const θ = Math.atan2(y, x);
    const bearing = (θ * 180 / Math.PI + 360) % 360;

    // Convertir grados a dirección cardinal
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
    const index = Math.round(bearing / 45) % 8;
    return directions[index];
}

// ========================================
// RENDERIZADO DE PARADAS
// ========================================

function displayStops() {
    if (state.filteredStops.length === 0) {
        elements.stopsList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🚫</div>
                <p class="empty-text">No hay paradas cercanas</p>
                <p class="empty-subtext">Intenta aumentar el radio de búsqueda</p>
            </div>
        `;
        elements.stopsCount.textContent = '0 paradas';
        return;
    }

    elements.stopsCount.textContent = `${state.filteredStops.length} parada${state.filteredStops.length !== 1 ? 's' : ''}`;

    elements.stopsList.innerHTML = state.filteredStops.map((stop, index) => {
        // Marcar las 3 mejores opciones
        const isBestOption = index < 3;
        const rankBadge = index === 0 ? '🥇 MEJOR OPCIÓN' :
            index === 1 ? '🥈 2ª OPCIÓN' :
                index === 2 ? '🥉 3ª OPCIÓN' : '';

        // Información de la mejor línea
        const bestLineInfo = stop.bestLine && stop.bestDestinationStop ?
            `<p class="stop-best-line">🚌 Mejor: Línea ${stop.bestLine} → ${stop.bestDestinationStop.name}</p>` : '';

        return `
        <div class="stop-card ${isBestOption ? 'best-option' : ''} ${stop.isBackwards ? 'is-backwards' : ''}" data-stop-id="${stop.id}">
            ${stop.isBackwards ? '<div class="backwards-badge">⚠️ Caminata contraria a casa</div>' : ''}
            ${rankBadge ? `<div class="rank-badge">${rankBadge}</div>` : ''}
            <div class="stop-header">
                <div>
                    <h3 class="stop-name">${stop.name}</h3>
                    <p class="stop-direction">📍 ${stop.distanceToStop}m a pie</p>
                    ${bestLineInfo}
                    <p class="stop-home-distance">🏠 Te deja a ${stop.distanceStopToHome}m de casa</p>
                </div>
                <span class="stop-distance">${formatDistance(stop.distanceToStop)}</span>
            </div>
            <div class="stop-lines">
                ${stop.lines.map(line => `<span class="line-badge ${line === stop.bestLine ? 'best-line' : ''}">${line}</span>`).join('')}
            </div>
            <button class="btn-show-arrivals" data-arrivals-url="${stop.arrivalsUrl}" data-stop-id="${stop.id}">
                ⏱️ Ver tiempos de llegada
            </button>
            <div class="arrivals-container" id="arrivals-${stop.id}" style="display: none;">
                <!-- Los tiempos se cargarán aquí -->
            </div>
        </div>
    `;
    }).join('');

    // Añadir event listeners a los botones de tiempos
    document.querySelectorAll('.btn-show-arrivals').forEach(button => {
        button.addEventListener('click', async (e) => {
            e.stopPropagation();
            const url = button.dataset.arrivalsUrl;
            const stopId = button.dataset.stopId;
            const container = document.getElementById(`arrivals-${stopId}`);

            // Encontrar la parada en el estado para ver sus líneas
            const stop = state.filteredStops.find(s => s.id == stopId);
            if (stop) {
                console.log(`🚏 Parada ${stopId} (${stop.name}): Líneas según API: [${stop.lines.join(', ')}]`);
            }

            // Toggle: si ya está visible, ocultarlo
            if (container.style.display === 'block') {
                container.style.display = 'none';
                button.textContent = '⏱️ Ver tiempos de llegada';
                return;
            }

            // Mostrar y cargar tiempos
            container.style.display = 'block';
            button.textContent = '🔼 Ocultar tiempos';
            await loadArrivalsInline(url, stopId);
        });
    });
}

// Nueva función para cargar tiempos inline
async function loadArrivalsInline(url, stopId) {
    const container = document.getElementById(`arrivals-${stopId}`);

    // Mostrar loading
    container.innerHTML = `
        <div class="arrivals-loading-inline">
            <div class="loading-spinner-small"></div>
            <span>Cargando tiempos...</span>
        </div>
    `;

    try {
        // Hacer fetch a través del proxy
        const proxyUrl = url.replace('http://www.emtvalencia.es', '/api/emt-proxy');
        console.log(`⏱️ Cargando tiempos para parada ${stopId} desde:`, proxyUrl);

        const response = await fetch(proxyUrl);
        const html = await response.text();

        // Parsear HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // Extraer tiempos de los divs con imagenParada (misma lógica que el popup del mapa)
        const arrivals = [];
        const allArrivals = []; // Para debugging
        const divs = doc.querySelectorAll('div[style*="border-bottom"]');

        console.log(`📊 Parada ${stopId}: Encontrados ${divs.length} divs con border-bottom`);

        divs.forEach(div => {
            const img = div.querySelector('img[title]');
            const span = div.querySelector('span[style*="position"]');

            if (img && span) {
                const line = img.getAttribute('title');
                const text = span.textContent.trim();
                allArrivals.push({ line, text }); // Guardar para debugging

                // Solo incluir líneas útiles
                if (CONFIG.USEFUL_LINES.includes(line)) {
                    // Extraer destino y tiempo
                    // El texto suele ser "DESTINO - TIEMPO"
                    let destination = "Desconocido";
                    let time = null;

                    // Buscar el patrón de tiempo al final
                    const timeMatch = text.match(/- (\d{2}:\d{2})$/);
                    const minMatch = text.match(/- (\d+ min\.?)$/);

                    if (timeMatch) {
                        time = timeMatch[1];
                        destination = text.substring(0, text.lastIndexOf(' - ')).trim();
                    } else if (minMatch) {
                        time = minMatch[1];
                        destination = text.substring(0, text.lastIndexOf(' - ')).trim();
                    } else {
                        // Fallback: intentar separar por el último guion
                        const lastDashIndex = text.lastIndexOf(' - ');
                        if (lastDashIndex !== -1) {
                            destination = text.substring(0, lastDashIndex).trim();
                            time = text.substring(lastDashIndex + 3).trim();
                        }
                    }

                    if (time) {
                        const directionInfo = validateDirection(line, destination);
                        arrivals.push({ line, destination, time, directionInfo });
                    } else {
                        console.log(`⚠️ Parada ${stopId}: Línea ${line} útil pero no se pudo extraer tiempo de: "${text}"`);
                    }
                } else {
                    console.log(`🚫 Parada ${stopId}: Línea ${line} filtrada (no está en USEFUL_LINES)`);
                }
            }
        });

        console.log(`✅ Parada ${stopId}: ${arrivals.length} llegadas de líneas útiles encontradas`);
        if (allArrivals.length > 0 && arrivals.length === 0) {
            console.log(`📋 Parada ${stopId}: Todas las llegadas encontradas:`, allArrivals);
        }

        // Renderizar tiempos
        if (arrivals.length > 0) {
            container.innerHTML = `
                <div class="arrivals-inline-header">
                    <h4>⏱️ Próximas llegadas</h4>
                    <button class="btn-refresh-inline" onclick="loadArrivalsInline('${url}', '${stopId}')">
                        🔄
                    </button>
                </div>
                <div class="arrivals-inline-list">
                    ${arrivals.map(arrival => `
                        <div class="arrival-inline-item ${arrival.directionInfo.isValid === false ? 'wrong-direction' : ''}">
                            <div class="arrival-inline-line-group">
                                <div style="display: flex; align-items: center; gap: 5px;" title="${arrival.directionInfo.reason}${arrival.directionInfo.targetName ? ' (Hacia ' + arrival.directionInfo.targetName + ')' : ''}">
                                    <span class="arrival-inline-line">${arrival.line}</span>
                                    ${arrival.directionInfo.isValid === false ? '⚠️' : arrival.directionInfo.isValid === true ? '✅' : '➖'}
                                </div>
                                <span class="arrival-inline-dest">${arrival.destination}</span>
                            </div>
                            <span class="arrival-inline-time">${arrival.time}</span>
                        </div>
                    `).join('')}
                </div>
            `;
        } else {
            const reason = allArrivals.length === 0 ?
                'No hay autobuses próximos' :
                'No hay autobuses de tus líneas útiles';

            container.innerHTML = `
                <div class="arrivals-inline-error">
                    <p>${reason}</p>
                    <button class="btn-refresh-inline" onclick="loadArrivalsInline('${url}', '${stopId}')">
                        🔄 Reintentar
                    </button>
                </div>
            `;
        }

    } catch (error) {
        console.error('Error cargando tiempos:', error);
        container.innerHTML = `
            <div class="arrivals-inline-error">
                <p>Error al cargar los tiempos</p>
                <button class="btn-refresh-inline" onclick="loadArrivalsInline('${url}', '${stopId}')">
                    🔄 Reintentar
                </button>
            </div>
        `;
    }
}

function formatDistance(meters) {
    if (meters < 1000) {
        return `${meters}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
}

// ========================================
// MAPA
// ========================================

function initializeMap() {
    state.map = L.map('map').setView(
        [CONFIG.HOME_COORDS.lat, CONFIG.HOME_COORDS.lon],
        CONFIG.MAP_CONFIG.defaultZoom
    );

    // Tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: CONFIG.MAP_CONFIG.maxZoom,
        minZoom: CONFIG.MAP_CONFIG.minZoom
    }).addTo(state.map);

    console.log('🗺️ Mapa inicializado');

    // Click en el mapa para seleccionar ubicación (registrado aquí para asegurar que el mapa esté listo)
    state.map.on('click', (e) => {
        console.log('🗺️ Click en mapa detectado. Modo selección:', state.selectingLocation);

        if (state.selectingLocation) {
            const lat = e.latlng.lat;
            const lon = e.latlng.lng;

            state.useFakeLocation = true;
            state.fakeLocation = { lat, lon };
            state.userLocation = { lat, lon };
            state.selectingLocation = false;

            // Actualizar UI
            elements.btnSelectLocation.textContent = '🗺️ Seleccionar en Mapa';
            elements.btnSelectLocation.style.background = '';
            state.map.getContainer().style.cursor = '';
            elements.fakeLocationInfo.classList.remove('hidden');
            elements.fakeCoordsDisplay.textContent = `${lat.toFixed(6)}, ${lon.toFixed(6)}`;

            console.log('🎭 Ubicación simulada aplicada:', state.fakeLocation);
            showLocationStatus('Usando ubicación simulada');
            setTimeout(hideLocationStatus, 2000);

            updateUserMarker();
            filterAndDisplayStops();
        }
    });
}

function updateUserMarker() {
    if (!state.userLocation) return;

    // Eliminar marcador anterior
    if (state.userMarker) {
        state.map.removeLayer(state.userMarker);
    }

    // Crear nuevo marcador
    state.userMarker = L.marker([state.userLocation.lat, state.userLocation.lon], {
        icon: L.divIcon({
            className: 'user-marker',
            html: '<div style="background: #6366f1; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 10px rgba(0,0,0,0.3);"></div>',
            iconSize: [20, 20]
        })
    }).addTo(state.map);

    state.userMarker.bindPopup('📍 Tu ubicación');

    // Centrar mapa
    state.map.setView([state.userLocation.lat, state.userLocation.lon], CONFIG.MAP_CONFIG.defaultZoom);
}

function updateMapMarkers() {
    // Limpiar marcadores anteriores
    state.markers.forEach(marker => state.map.removeLayer(marker));
    state.markers = [];

    // Añadir marcadores de paradas
    state.filteredStops.forEach(stop => {
        const marker = L.marker([stop.coords.lat, stop.coords.lon], {
            icon: L.divIcon({
                className: 'stop-marker',
                html: '<div style="background: #ec4899; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: 16px;">🚌</div>',
                iconSize: [30, 30]
            })
        }).addTo(state.map);

        // Pasar TODAS las líneas útiles a la función de tiempos para no omitir ninguna
        const stopUsefulLines = stop.lines.filter(l => CONFIG.USEFUL_LINES.includes(l));
        const allUsefulLinesJson = JSON.stringify(CONFIG.USEFUL_LINES);

        const popupContent = `
            <div class="map-popup">
                <div class="popup-header-row" style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; margin-bottom: 5px;">
                    <strong style="font-size: 14px;">${stop.name}</strong>
                    <button class="btn-refresh-popup" 
                            onclick='loadTimesInPopup("${stop.arrivalsUrl}", "${stop.id}", ${allUsefulLinesJson})'
                            style="background: none; border: none; cursor: pointer; font-size: 16px; padding: 2px; line-height: 1;">🔄</button>
                </div>
                <div style="font-size: 12px; color: #666; margin-bottom: 4px;">
                    📍 ${stop.distanceToStop}m | 🚌 ${stopUsefulLines.join(', ')}
                </div>
                <div id="popup-times-${stop.id}" style="margin-top: 8px;">
                    <div style="text-align: center; padding: 8px;">
                        <div class="loading-spinner-small"></div>
                    </div>
                </div>
            </div>
        `;

        marker.bindPopup(popupContent, {
            maxWidth: 350,
            minWidth: 300,
            className: 'custom-popup'
        });

        marker.on('popupopen', () => {
            // Cargar tiempos automáticamente al abrir el popup
            // Usamos la lista completa de líneas útiles para asegurar consistencia
            loadTimesInPopup(stop.arrivalsUrl, stop.id, CONFIG.USEFUL_LINES);
        });

        state.markers.push(marker);
    });
}

// Función global para cargar tiempos en el popup del mapa
window.loadTimesInPopup = async function (url, stopId, usefulLines) {
    const container = document.getElementById(`popup-times-${stopId}`);
    if (!container) return;

    // Mostrar loading al refrescar
    container.innerHTML = `
        <div style="text-align: center; padding: 15px;">
            <div class="loading-spinner-small"></div>
            <div style="font-size: 11px; color: #999; margin-top: 5px;">Actualizando...</div>
        </div>
    `;

    try {
        // Hacer fetch a través del proxy
        const proxyUrl = url.replace('http://www.emtvalencia.es', '/api/emt-proxy');
        console.log(`🗺️ Cargando tiempos popup para parada ${stopId}`);

        const response = await fetch(proxyUrl);
        const html = await response.text();

        // Parsear HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // Extraer tiempos de los divs con imagenParada
        const arrivals = [];
        const allArrivals = []; // Para debugging
        const divs = doc.querySelectorAll('div[style*="border-bottom"]');

        console.log(`📊 Popup parada ${stopId}: Encontrados ${divs.length} divs`);

        divs.forEach(div => {
            const img = div.querySelector('img[title]');
            const span = div.querySelector('span[style*="position"]');

            if (img && span) {
                const line = img.getAttribute('title');
                const text = span.textContent.trim();
                allArrivals.push({ line, text });

                // Solo incluir líneas útiles
                if (usefulLines.includes(line)) {
                    // Extraer destino y tiempo
                    let destination = "Desconocido";
                    let time = null;

                    const timeMatch = text.match(/- (\d{2}:\d{2})$/);
                    const minMatch = text.match(/- (\d+ min\.?)$/);

                    if (timeMatch) {
                        time = timeMatch[1];
                        destination = text.substring(0, text.lastIndexOf(' - ')).trim();
                    } else if (minMatch) {
                        time = minMatch[1];
                        destination = text.substring(0, text.lastIndexOf(' - ')).trim();
                    } else {
                        const lastDashIndex = text.lastIndexOf(' - ');
                        if (lastDashIndex !== -1) {
                            destination = text.substring(0, lastDashIndex).trim();
                            time = text.substring(lastDashIndex + 3).trim();
                        }
                    }

                    if (time) {
                        const directionInfo = validateDirection(line, destination);
                        arrivals.push({ line, destination, time, directionInfo });
                    } else {
                        console.log(`⚠️ Popup ${stopId}: Línea ${line} útil pero no se pudo extraer tiempo de: "${text}"`);
                    }
                }
            }
        });

        console.log(`✅ Popup parada ${stopId}: ${arrivals.length} llegadas útiles encontradas`);
        if (allArrivals.length > 0 && arrivals.length === 0) {
            console.log(`📋 Popup ${stopId}: Todas las llegadas:`, allArrivals);
        }

        // Renderizar tiempos
        if (arrivals.length > 0) {
            container.innerHTML = `
                <div style="margin-top: 4px; padding-top: 8px; border-top: 1px solid rgba(99, 102, 241, 0.2);">
                    <div style="font-weight: 600; margin-bottom: 4px; color: #6366f1; font-size: 13px;">⏱️ Próximas llegadas:</div>
                    ${arrivals.map(arrival => `
                        <div style="
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            padding: 6px;
                            margin-top: 4px;
                            background: ${arrival.directionInfo.isValid === false ? 'rgba(0,0,0,0.05)' : 'rgba(99, 102, 241, 0.1)'};
                            border-radius: 6px;
                            border-left: 3px solid ${arrival.directionInfo.isValid === false ? '#f59e0b' : arrival.directionInfo.isValid === true ? '#10b981' : '#ccc'};
                            opacity: ${arrival.directionInfo.isValid === false ? '0.7' : '1'};
                        " title="${arrival.directionInfo.reason}${arrival.directionInfo.targetName ? ' (Hacia ' + arrival.directionInfo.targetName + ')' : ''}">
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <div style="display: flex; align-items: center; gap: 4px;">
                                    <span class="line-badge" style="margin: 0; padding: 2px 8px; font-size: 11px;">${arrival.line}</span>
                                    <span style="font-size: 14px;">${arrival.directionInfo.isValid === false ? '⚠️' : arrival.directionInfo.isValid === true ? '✅' : '➖'}</span>
                                </div>
                                <span style="font-size: 11px; font-weight: 500; color: #444; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 120px;">
                                    ${arrival.destination}
                                </span>
                            </div>
                            <span style="font-weight: 700; color: #4f46e5; font-size: 12px; white-space: nowrap; margin-left: 8px;">${arrival.time}</span>
                        </div>
                    `).join('')}
                </div>
            `;
        } else {
            const reason = allArrivals.length === 0 ?
                'No hay autobuses próximos' :
                'No hay autobuses de tus líneas';
            container.innerHTML = `<p style="text-align: center; color: #666; margin-top: 8px; font-size: 12px;">${reason}</p>`;
        }

    } catch (error) {
        console.error(`❌ Error cargando tiempos popup parada ${stopId}:`, error);
        container.innerHTML = '<p style="text-align: center; color: #ef4444; margin-top: 8px; font-size: 12px;">Error al cargar tiempos</p>';
    }
};

// ========================================
// MODAL DE TIEMPOS
// ========================================

async function showArrivalsModal(url) {
    // Mostrar modal con loading
    elements.arrivalsModal.classList.remove('hidden');
    elements.arrivalsIframe.innerHTML = `
        <div class="arrivals-loading">
            <div class="loading-spinner"></div>
            <p>Cargando tiempos de llegada...</p>
        </div>
    `;

    try {
        // Hacer fetch a través del proxy de nginx (evita CORS)
        const proxyUrl = url.replace('http://www.emtvalencia.es', '/api/emt-proxy');
        const response = await fetch(proxyUrl);
        const html = await response.text();

        // Crear un parser DOM
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // Extraer información de la parada
        const stopName = doc.querySelector('h1')?.textContent?.trim() || 'Parada';

        // Extraer tiempos de llegada
        const arrivals = [];
        const rows = doc.querySelectorAll('table tr');

        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length >= 3) {
                const line = cells[0]?.textContent?.trim();
                const destination = cells[1]?.textContent?.trim();
                const time = cells[2]?.textContent?.trim();

                if (line && destination && time) {
                    arrivals.push({ line, destination, time });
                }
            }
        });

        // Si no se encontraron tiempos, intentar otro formato
        if (arrivals.length === 0) {
            const divs = doc.querySelectorAll('div');
            divs.forEach(div => {
                const text = div.textContent;
                // Buscar patrones como "Línea 6 - Destino - 5 min"
                const match = text.match(/Línea\s+(\d+|[A-Z]\d+)\s+-\s+(.+?)\s+-\s+(.+)/i);
                if (match) {
                    arrivals.push({
                        line: match[1],
                        destination: match[2].trim(),
                        time: match[3].trim()
                    });
                }
            });
        }

        // Renderizar tiempos
        if (arrivals.length > 0) {
            elements.arrivalsIframe.innerHTML = `
                <div class="arrivals-content">
                    <h3 class="arrivals-stop-name">${stopName}</h3>
                    <div class="arrivals-list">
                        ${arrivals.map(arrival => `
                            <div class="arrival-item">
                                <div class="arrival-line-badge">${arrival.line}</div>
                                <div class="arrival-info">
                                    <div class="arrival-destination">${arrival.destination}</div>
                                    <div class="arrival-time">${arrival.time}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <button class="btn-refresh-arrivals" onclick="showArrivalsModal('${url}')">
                        🔄 Actualizar
                    </button>
                </div>
            `;
        } else {
            // Si no se pudieron extraer, mostrar iframe como fallback
            elements.arrivalsIframe.innerHTML = `
                <div class="arrivals-content">
                    <p class="arrivals-error">No se pudieron cargar los tiempos automáticamente.</p>
                    <a href="${url}" target="_blank" class="btn-open-emt">
                        Abrir en EMT Valencia →
                    </a>
                </div>
            `;
        }

    } catch (error) {
        console.error('Error al cargar tiempos:', error);
        elements.arrivalsIframe.innerHTML = `
            <div class="arrivals-content">
                <p class="arrivals-error">Error al cargar los tiempos de llegada.</p>
                <a href="${url}" target="_blank" class="btn-open-emt">
                    Abrir en EMT Valencia →
                </a>
            </div>
        `;
    }
}

function hideArrivalsModal() {
    elements.arrivalsModal.classList.add('hidden');
    elements.arrivalsIframe.innerHTML = '';
}

// ========================================
// TEMA OSCURO/CLARO
// ========================================

function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        elements.themeIcon.textContent = '☀️';
    }
}

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    elements.themeIcon.textContent = isDark ? '☀️' : '🌙';
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

// ========================================
// EVENT LISTENERS
// ========================================

function initializeEventListeners() {
    // Radio selector
    elements.radioBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            elements.radioBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.selectedRadius = parseInt(btn.dataset.radius);
            filterAndDisplayStops();
        });
    });

    // Botón de localización
    elements.locateBtn.addEventListener('click', () => {
        getUserLocation();
    });

    // Toggle tema
    elements.themeToggle.addEventListener('click', toggleTheme);

    // Cerrar modal
    elements.closeModal.addEventListener('click', hideArrivalsModal);
    elements.arrivalsModal.querySelector('.modal-overlay').addEventListener('click', hideArrivalsModal);

    // Fake location controls
    if (elements.toggleFakeLocation) {
        elements.toggleFakeLocation.addEventListener('click', () => {
            elements.fakeLocationControls.classList.toggle('hidden');
        });
    }

    if (elements.btnSelectLocation) {
        elements.btnSelectLocation.addEventListener('click', () => {
            console.log('🎯 Botón "Seleccionar en Mapa" clickeado');
            state.selectingLocation = true;
            elements.btnSelectLocation.textContent = '🎯 Haz clic en el mapa...';
            elements.btnSelectLocation.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
            state.map.getContainer().style.cursor = 'crosshair';
            console.log('✅ Modo selección activado. Cursor cambiado a crosshair');
        });
    }

    if (elements.resetFakeLocation) {
        elements.resetFakeLocation.addEventListener('click', () => {
            state.useFakeLocation = false;
            state.fakeLocation = null;
            state.selectingLocation = false;
            elements.fakeLocationInfo.classList.add('hidden');
            elements.btnSelectLocation.textContent = '🗺️ Seleccionar en Mapa';
            elements.btnSelectLocation.style.background = '';
            state.map.getContainer().style.cursor = '';

            console.log('📍 Volviendo a GPS real');
            showLocationStatus('Usando GPS real');
            setTimeout(hideLocationStatus, 2000);

            getUserLocation();
        });
    }
}

// ========================================
// UI HELPERS
// ========================================

function showLocationStatus(message) {
    elements.statusText.textContent = message;
    elements.locationStatus.classList.remove('hidden');
}

function hideLocationStatus() {
    elements.locationStatus.classList.add('hidden');
}

function showError(message) {
    elements.statusText.textContent = `❌ ${message}`;
    elements.locationStatus.classList.remove('hidden');
    setTimeout(hideLocationStatus, 5000);
}

// Lógica de validación de dirección inteligente (Vectorial)
function validateDirection(lineNum, incomingDestName) {
    if (!state.userLocation) return { isValid: true, reason: 'Ubicación desconocida' };

    const lineHeadboards = CONFIG.HEADBOARDS[lineNum];
    if (!lineHeadboards) return { isValid: true, reason: 'Sin cabeceras configuradas' };

    // Buscar la cabecera que coincide con el destino (usando keywords)
    let matchedHeadboard = null;
    let normalizedIncoming = incomingDestName.toUpperCase();

    for (const headboard of lineHeadboards) {
        // Comprobar si alguna keyword está en el destino recibido
        const hasKeyword = headboard.keywords.some(kw => normalizedIncoming.includes(kw));
        if (hasKeyword) {
            matchedHeadboard = headboard;
            break;
        }
    }

    if (!matchedHeadboard) {
        console.log(`🧭 Línea ${lineNum}: No se reconoció el destino "${incomingDestName}".`);
        return { isValid: null, reason: 'Dirección desconocida', targetName: null };
    }

    // Lógica Vectorial Inteligente con Normalización:
    // Vector V1: Mi ubicación actual -> Mi casa
    const dx1 = CONFIG.HOME_COORDS.lon - state.userLocation.lon;
    const dy1 = CONFIG.HOME_COORDS.lat - state.userLocation.lat;
    const mag1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);

    // Vector V2: Mi ubicación actual -> El destino del bus
    const dx2 = matchedHeadboard.lon - state.userLocation.lon;
    const dy2 = matchedHeadboard.lat - state.userLocation.lat;
    const mag2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

    // Si estamos en el destino o en casa, marcar como válido
    if (mag1 < 0.0001 || mag2 < 0.0001) return { isValid: true, reason: 'Ya estás en el destino o en casa' };

    // Producto punto de vectores NORMALIZADOS (da el coseno del ángulo)
    const dotProduct = ((dx1 / mag1) * (dx2 / mag2)) + ((dy1 / mag1) * (dy2 / mag2));

    // Umbral de validación: 
    // dotProduct > 0.2 (~78 grados) implica que el bus te acerca significativamente.
    // Si es negativo, el bus se aleja (más de 90 grados).
    const isValid = dotProduct > 0.2;

    console.log(`🧭 Línea ${lineNum}: Joshua -> ${matchedHeadboard.name} | CosineSimilarity: ${dotProduct.toFixed(4)} | Resultado: ${isValid ? 'Hacia Casa ✅' : (dotProduct < 0 ? 'Se aleja ⚠️' : 'Lateral ➖')}`);

    return {
        isValid: dotProduct < 0 ? false : (dotProduct > 0.2 ? true : null),
        reason: dotProduct < 0 ? 'Sentido contrario' : (dotProduct > 0.2 ? 'Te acerca a casa' : 'Dirección lateral'),
        targetName: matchedHeadboard.name,
        cos: dotProduct
    };
}

// ========================================
// SERVICE WORKER
// ========================================

function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('✅ Service Worker registrado:', reg))
            .catch(err => console.error('❌ Error registrando Service Worker:', err));
    }
}

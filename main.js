// ========================================
// CONFIGURACIÓN Y CONSTANTES
// ========================================

const CONFIG = {
    // Coordenadas de casa (Externalizadas para privacidad)
    HOME_COORDS: {
        lat: window.SECRET_CONFIG?.HOME_LAT || 39.486761,
        lon: window.SECRET_CONFIG?.HOME_LON || -0.377689
    },

    USEFUL_LINES: ['11', '6', '16', '26', '98', 'C2', 'C3', 'C1', '94', '95', '60', '64', '28', '79', '80', '89', '90', '5'],

    // Mapeo de números antiguos (API) a nombres comerciales (UI)
    LINE_ALIASES: {
        '79': 'C2',
        '80': 'C2',
        '89': 'C3',
        '90': 'C3',
        '5': 'C1'
    },

    // Paradas a excluir (datos erróneos en dataset)
    EXCLUDED_STOPS: [2220, 2221, 2014, 2313, 488, 1696, 2229, 1552, 1754, 1749, 1753],

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
        '28': 331,    // Burjassot - Centre Cultural Bombas Gens
        '79': 351,    // C2 Interior
        '80': 351,    // C2 Exterior
        '89': 1682,   // C3 Exterior
        '90': 1682,   // C3 Interior
        '5': 1305     // C1
    },

    // API de EMT Valencia
    API_URL: 'https://valencia.opendatasoft.com/api/explore/v2.1/catalog/datasets/emt/records',
    API_LIMIT: 100, // Límite por petición
    API_MAX_REQUESTS: 15, // Máximo de peticiones para obtener todas las paradas

    // Radio de búsqueda por defecto (metros)
    DEFAULT_RADIUS: 500,

    // Configuración del mapa
    MAP_CONFIG: {
        defaultZoom: 15,
        maxZoom: 18,
        minZoom: 12
    },

    // Detección automática de entorno nativo (Capacitor)
    IS_NATIVE: window.location.protocol === 'capacitor:' || !!window.Capacitor,

    // Configuración de actualizaciones (v74)
    CURRENT_VERSION: '0.86.0', // Sincronizado con el footer
    UPDATE_URL: 'https://raw.githubusercontent.com/Antaneyes/bus-casa-pwa/android-capacitor/update.json'
};

// ========================================
// DIAGNÓSTICO Y LOGS (v61)
// ========================================

const DebugLogger = {
    logs: [],
    maxLogs: 100,

    init() {
        // Guardar logs originales
        const originalLog = console.log;
        const originalError = console.error;
        const originalWarn = console.warn;

        console.log = (...args) => {
            this.addLog('INFO', args);
            originalLog.apply(console, args);
        };
        console.error = (...args) => {
            this.addLog('ERROR', args);
            originalError.apply(console, args);
        };
        console.warn = (...args) => {
            this.addLog('WARN', args);
            originalWarn.apply(console, args);
        };

        window.onerror = (msg, url, line, col, error) => {
            this.addLog('CRITICAL', [`${msg} at ${line}:${col}`]);
        };

        console.log('📝 Logger de diagnóstico activado');
    },

    addLog(level, args) {
        const timestamp = new Date().toLocaleTimeString();
        const message = args.map(arg => {
            if (arg instanceof Error) {
                return `${arg.message} ${arg.stack ? '\n' + arg.stack : ''}`;
            }
            if (typeof arg === 'object') {
                try {
                    return JSON.stringify(arg);
                } catch (e) {
                    return '[Objeto no serializable]';
                }
            }
            return String(arg);
        }).join(' ');

        this.logs.unshift({ timestamp, level, message });
        if (this.logs.length > this.maxLogs) this.logs.pop();

        // Guardado persistente opcional para debug extremos
        localStorage.setItem('app_debug_logs', JSON.stringify(this.logs.slice(0, 50)));
    },

    getFormattedLogs() {
        return this.logs.map(l => `[${l.timestamp}] [${l.level}] ${l.message}`).join('\n');
    }
};

// Activar inmediatamente
DebugLogger.init();

// Función unificada para configurar la UI nativa (v86)
async function applyNativeUIConfig() {
    if (!window.Capacitor) return;

    try {
        const { StatusBar, NavigationBar } = window.Capacitor.Plugins;

        // 1. Configurar Status Bar (Superior)
        if (StatusBar) {
            await StatusBar.setOverlaysWebView({ overlay: true });
            try {
                // Forzamos estilo de iconos (oscuros para fondo claro)
                await StatusBar.setStyle({ style: 'DARK' });
            } catch (e) { }

            // Inyectamos un padding-top al body de forma bruta por JS
            // 44px es un estándar seguro para evitar el notch en Android
            document.body.style.paddingTop = '44px';
            console.log('✅ StatusBar configurada y padding-top forzado (44px)');
        }

        // 2. Configurar Navigation Bar (Inferior)
        if (NavigationBar) {
            // Ponemos el color sólido de fondo de la app para que se funda con la UI
            const colorConfig = {
                color: '#f8faff',
                darkButtons: true // Iconos oscuros sobre fondo claro
            };

            if (typeof NavigationBar.setColor === 'function') {
                await NavigationBar.setColor(colorConfig);
                console.log('✅ NavigationBar: Color sólido aplicado (#f8faff)');
            } else if (typeof NavigationBar.setNavigationBarColor === 'function') {
                await NavigationBar.setNavigationBarColor(colorConfig);
                console.log('✅ NavigationBar: Color sólido aplicado (v2)');
            }
        }
    } catch (e) {
        console.warn('⚠️ Error configurando UI nativa:', e);
    }
}

// Configuración inmediata
if (window.Capacitor) {
    applyNativeUIConfig();
}

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
    selectingLocation: false,
    mapCentered: false, // Flag para centrado único
    lastOpenedStop: null // Para refrescar el Drawer
};

// ========================================
// ELEMENTOS DEL DOM
// ========================================

const elements = {};

// ========================================
// INICIALIZACIÓN
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

async function initializeApp() {
    console.log('🚀 Iniciando Bus Casa PWA...');

    // Inicializar elementos del DOM de forma robusta
    mapElements();

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

    // Configurar Diagnóstico (v61)
    setupDebugTrigger();

    // Configurar UI Nativa (v53)
    const isNative = window.location.protocol === 'capacitor:' || !!window.Capacitor;
    console.log(`🔍 Detección de entorno: protocol=${window.location.protocol}, Capacitor=${!!window.Capacitor}, IS_NATIVE=${isNative}`);

    if (isNative) {
        applyNativeUIConfig();
        console.log('📱 Entorno nativo detectado, iniciando checkUpdates...');
        checkUpdates();
    } else {
        console.warn('⚠️ No se detectó entorno nativo, checkUpdates NO se ejecutará');
    }
}

// La configuración se hace ahora a través de applyNativeUIConfig()

let versionClicks = 0;
let versionClickTimer = null;

function setupDebugTrigger() {
    const footer = document.querySelector('footer');
    if (!footer) return;

    footer.style.cursor = 'pointer';
    footer.onclick = () => {
        versionClicks++;
        clearTimeout(versionClickTimer);

        versionClickTimer = setTimeout(() => {
            versionClicks = 0;
        }, 3000);

        if (versionClicks >= 5) {
            versionClicks = 0;
            showDebugModal();
        }
    };
}

function showDebugModal() {
    const existing = document.getElementById('debug-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'debug-modal';
    modal.style = `
        position: fixed; top: 0; left: 0; right: 0; bottom: 0; 
        background: var(--color-bg); z-index: 20000; padding: 20px;
        display: flex; flex-direction: column; gap: 15px;
        font-family: monospace; overflow: hidden;
    `;

    modal.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid var(--color-primary); padding-bottom: 10px;">
            <div style="font-weight: 700; color: var(--color-primary);">🛠 CONSOLA DE DIAGNÓSTICO</div>
            <button id="close-debug" style="background: none; border: none; font-size: 20px; cursor: pointer; color: var(--color-text);">✕</button>
        </div>
        <div id="debug-log-view" style="flex: 1; overflow-y: auto; font-size: 11px; white-space: pre-wrap; background: rgba(0,0,0,0.05); padding: 10px; border-radius: 8px; border: 1px solid var(--color-border);">
            ${DebugLogger.getFormattedLogs() || 'No hay logs todavía'}
        </div>
        <div style="display: flex; gap: 10px;">
            <button id="copy-debug" style="flex: 1; padding: 12px; background: var(--color-primary); color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">Copiar Logs</button>
            <button id="clear-debug" style="padding: 12px; background: #ef4444; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">Limpiar</button>
        </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('close-debug').onclick = () => modal.remove();
    document.getElementById('clear-debug').onclick = () => {
        DebugLogger.logs = [];
        document.getElementById('debug-log-view').innerHTML = 'Logs limpiados';
    };
    document.getElementById('copy-debug').onclick = async () => {
        const text = DebugLogger.getFormattedLogs();
        try {
            await navigator.clipboard.writeText(text);
            const btn = document.getElementById('copy-debug');
            btn.innerText = '✅ ¡Copiado!';
            setTimeout(() => btn.innerText = 'Copiar Logs', 2000);
        } catch (err) {
            alert('Error al copiar: ' + err);
        }
    };
}

// ========================================
// AUTO-UPDATE APK (v48)
// ========================================

async function checkUpdates() {
    console.log('🔍 Comprobando actualizaciones...');
    try {
        let updateData;
        const url = `${CONFIG.UPDATE_URL}?t=${Date.now()}`;

        if (window.Capacitor?.Plugins?.CapacitorHttp) {
            const response = await window.Capacitor.Plugins.CapacitorHttp.get({ url });

            if (response.status === 404 || response.status === 403) {
                console.warn(`⚠️ No se pudo acceder a update.json (${response.status}). Nota: Si el repositorio es PRIVADO, GitHub bloquea el acceso externo. Usa un Gist público o aloja el archivo en otro sitio.`);
                return;
            }

            if (response.status !== 200) {
                console.error(`❌ Error de red (${response.status}): No se pudo comprobar actualizaciones.`);
                return;
            }

            let rawData = response.data;
            console.log('📡 Respuesta de red recibida (OK):', typeof rawData);

            if (typeof rawData === 'string') {
                try {
                    const start = rawData.indexOf('{');
                    const end = rawData.lastIndexOf('}');
                    if (start !== -1 && end !== -1) {
                        const cleanJson = rawData.substring(start, end + 1);
                        updateData = JSON.parse(cleanJson);
                    } else {
                        updateData = JSON.parse(rawData);
                    }
                } catch (e) {
                    console.error('🔥 Error de parseo:', e.message, 'Texto:', rawData.substring(0, 50));
                    return;
                }
            } else {
                updateData = rawData;
            }
        } else {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            updateData = await response.json();
        }

        if (!updateData || !updateData.version) {
            console.warn('⚠️ Estructura de actualización inválida:', updateData);
            return;
        }

        console.log(`📦 Versión remota: ${updateData.version} | Local: ${CONFIG.CURRENT_VERSION}`);

        if (isNewerVersion(updateData.version, CONFIG.CURRENT_VERSION)) {
            showUpdatePrompt(updateData);
        }
    } catch (error) {
        console.error('❌ Error comprobando actualizaciones:', error);
    }
}

function isNewerVersion(remote, local) {
    const r = (remote || '').split('.').map(Number);
    const l = (local || '').split('.').map(Number);
    const length = Math.max(r.length, l.length);
    for (let i = 0; i < length; i++) {
        const rv = r[i] || 0;
        const lv = l[i] || 0;
        if (rv > lv) return true;
        if (rv < lv) return false;
    }
    return false;
}

function showUpdatePrompt(updateData) {
    const existing = document.getElementById('update-prompt');
    if (existing) return;

    const prompt = document.createElement('div');
    prompt.id = 'update-prompt';
    prompt.style = `
        position: fixed; bottom: 20px; left: 20px; right: 20px; z-index: 10000;
        background: var(--color-surface); padding: 20px; border-radius: 16px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.3); border: 2px solid var(--color-primary);
        animation: slideUp 0.3s ease-out;
    `;

    prompt.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 12px;">
            <div style="font-weight: 700; font-size: 18px; color: var(--color-primary);">🚀 Actualización Disponible</div>
            <div style="font-size: 14px; opacity: 0.9;">Nueva versión <b>v${updateData.version}</b> lista para descargar.</div>
            <div style="display: flex; gap: 10px; margin-top: 8px;">
                <button id="btn-update-now" style="flex: 1; padding: 12px; border-radius: 8px; border: none; background: var(--color-primary); color: white; font-weight: 600; cursor: pointer;">Actualizar ahora</button>
                <button id="btn-update-later" style="padding: 12px; border-radius: 8px; border: none; background: rgba(0,0,0,0.1); color: var(--color-text); cursor: pointer;">Luego</button>
            </div>
        </div>
    `;

    document.body.appendChild(prompt);

    document.getElementById('btn-update-now').onclick = () => {
        prompt.innerHTML = `
            <div style="text-align: center; padding: 10px;">
                <div class="loading-spinner-small" style="margin: 0 auto 10px;"></div>
                <div style="font-weight: 600;">Descargando APK...</div>
                <div style="font-size: 12px; opacity: 0.7; margin-top: 4px;">No cierres la App</div>
            </div>
        `;
        downloadAndInstallAPK(updateData.url);
    };

    document.getElementById('btn-update-later').onclick = () => {
        prompt.remove();
    };
}

async function downloadAndInstallAPK(url) {
    try {
        const { Filesystem, FileOpener, CapacitorHttp } = window.Capacitor.Plugins;
        console.log('⬇️ Descargando APK vía CapacitorHttp:', url);

        const fileName = 'update.apk';

        if (CapacitorHttp && typeof CapacitorHttp.downloadFile === 'function') {
            const options = { url, filePath: fileName, fileDirectory: 'CACHE' };
            const response = await CapacitorHttp.downloadFile(options);
            await FileOpener.open({
                filePath: response.path,
                contentType: 'application/vnd.android.package-archive'
            });
        } else {
            const response = await fetch(url);
            const blob = await response.blob();
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = async () => {
                const b64 = reader.result.split(',')[1];
                const savedParams = { path: fileName, data: b64, directory: 'CACHE' };
                const savedFile = await Filesystem.writeFile(savedParams);
                await FileOpener.open({
                    filePath: savedFile.uri,
                    contentType: 'application/vnd.android.package-archive'
                });
            };
        }
    } catch (error) {
        console.error('❌ Error:', error);
        alert('Fallo la descarga. ¿Repo público?');
    } finally {
        document.getElementById('update-prompt')?.remove();
    }
}

// ========================================
// GEOLOCALIZACIÓN
// ========================================

async function getUserLocation() {
    if (state.useFakeLocation && state.fakeLocation) {
        console.log('🎭 Usando ubicación simulada:', state.fakeLocation);
        state.userLocation = state.fakeLocation;
        updateUserMarker();
        filterAndDisplayStops();
        return;
    }

    // Intentar obtener ubicación nativa si estamos en Capacitor
    if (CONFIG.IS_NATIVE && window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Geolocation) {
        try {
            const coordinates = await window.Capacitor.Plugins.Geolocation.getCurrentPosition();
            handleLocationUpdate(coordinates);
            return;
        } catch (error) {
            console.error('Error con Geolocation nativo:', error);
            // Fallback al navegador normal
        }
    }

    if (!navigator.geolocation) {
        showError('Tu navegador no soporta geolocalización');
        return;
    }

    showLocationStatus('Obteniendo ubicación...');

    navigator.geolocation.watchPosition(
        (position) => {
            if (!state.useFakeLocation) {
                handleLocationUpdate(position);
            }
        },
        (error) => {
            console.error('Error de geolocalización:', error);
            handleLocationError(error);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
}

function handleLocationUpdate(position) {
    state.userLocation = {
        lat: position.coords.latitude,
        lon: position.coords.longitude
    };

    console.log('📍 Ubicación actualizada:', state.userLocation);
    hideLocationStatus();

    // Actualizar marcador del usuario
    updateUserMarker();

    // Filtrar paradas basadas en la nueva ubicación
    filterAndDisplayStops();

    // Si el mapa no ha sido centrado aún, centrarlo
    if (!state.mapCentered && state.map) {
        state.map.setView([state.userLocation.lat, state.userLocation.lon], CONFIG.MAP_CONFIG.defaultZoom);
        state.mapCentered = true;
    }
}

function handleLocationError(error) {
    let msg = 'Error de geolocalización desconocida';
    if (error.code === 1) msg = 'Permiso de ubicación denegado por el usuario';
    else if (error.code === 2) msg = 'Ubicación no disponible';
    else if (error.code === 3) msg = 'Tiempo de espera agotado';
    else if (error.message) msg = error.message;

    console.error('Error de geolocalización:', msg);
    showError(`📍 ${msg}`);
    hideLocationStatus();
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

            let response;
            // Usar CapacitorHttp si está disponible para evitar problemas de CORS/protocolo en nativo
            if (CONFIG.IS_NATIVE && window.Capacitor?.Plugins?.CapacitorHttp) {
                const options = { url };
                const res = await window.Capacitor.Plugins.CapacitorHttp.get(options);
                response = {
                    ok: res.status >= 200 && res.status < 300,
                    status: res.status,
                    json: async () => res.data
                };
            } else {
                response = await fetch(url);
            }

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
            .filter(stop => !stop.suprimida && !CONFIG.EXCLUDED_STOPS.includes(parseInt(stop.id_parada)))
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

            // Sistema de puntuación inteligente (menor es mejor)
            // Se prioriza la cercanía a la parada (60%) sobre la distancia de la parada a casa (40%).
            // Esto asegura que no caminemos demasiado hasta una parada lejana aunque nos deje en la puerta.
            const score = (distanceToStop * 0.6) + (distanceStopToHome * 0.4);

            return {
                ...stop,
                distanceToStop,
                distanceStopToHome,
                direction,
                score,
                bestLine,
                bestDestinationStop,
                isBackwards: false
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

    // Simplificado: Mostrar simplemente las 10 mejores paradas en radio (sin filtro de duplicados)
    // El usuario prefiere ver todo lo disponible sin que el sistema elija por él
    state.filteredStops = stopsInRadius.slice(0, 10);
    const shownLines = new Set();
    state.filteredStops.forEach(stop => {
        stop.lines.filter(line => CONFIG.USEFUL_LINES.includes(line))
            .forEach(l => shownLines.add(l));
    });

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
        <div class="stop-card ${isBestOption ? 'best-option' : ''}" data-stop-id="${stop.id}">
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
                ${stop.lines.map(line => {
            const displayLine = CONFIG.LINE_ALIASES[line] || line;
            return `<span class="line-badge ${line === stop.bestLine ? 'best-line' : ''}">${displayLine}</span>`;
        }).join('')}
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

    // Encontrar la parada en el estado global para conocer sus líneas
    const stop = state.allStops.find(s => s.id == stopId);
    if (!stop) {
        console.error(`❌ No se encontró la parada ${stopId} en el estado.`);
        return;
    }

    // Mostrar loading
    container.innerHTML = `
        <div class="arrivals-loading-inline">
            <div class="loading-spinner-small"></div>
            <span>Cargando tiempos...</span>
        </div>
    `;

    try {
        // Hacer fetch a través del proxy si estamos en la web, o nativo si está disponible
        let html;
        if (CONFIG.IS_NATIVE && window.Capacitor?.Plugins?.CapacitorHttp) {
            console.log(`🚀 Usando CapacitorHttp para: ${url}`);
            const response = await window.Capacitor.Plugins.CapacitorHttp.get({ url: url });
            html = response.data;
        } else {
            const proxyUrl = url.replace(/^https?:\/\/www\.emtvalencia\.es/, '/api/emt-proxy');
            console.log(`🌐 Usando Fetch estándar: ${proxyUrl}`);
            const response = await fetch(proxyUrl);
            html = await response.text();
        }

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

                // Solo incluir líneas útiles (comparando nombres comerciales para soportar aliases)
                const commercialLine = CONFIG.LINE_ALIASES[line] || line;
                const commercialUsefulLines = stop.lines
                    .filter(l => CONFIG.USEFUL_LINES.includes(l))
                    .map(l => CONFIG.LINE_ALIASES[l] || l);

                if (commercialUsefulLines.includes(commercialLine)) {
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
                        arrivals.push({ line, destination, time });
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
                        <div class="arrival-inline-item">
                            <div class="arrival-inline-line-group">
                                <span class="arrival-inline-line">${CONFIG.LINE_ALIASES[arrival.line] || arrival.line}</span>
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
            elements.toggleFakeLocation.classList.add('active');
            elements.toggleFakeLocation.innerHTML = '📍 Simulación activa';
            state.map.getContainer().style.cursor = '';

            console.log('🎭 Ubicación simulada aplicada:', state.fakeLocation);
            showLocationStatus('Ubicación fijada');
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

    // Centrar mapa SOLO la primera vez que se obtiene ubicación
    if (!state.mapCentered) {
        state.map.setView([state.userLocation.lat, state.userLocation.lon], CONFIG.MAP_CONFIG.defaultZoom);
        state.mapCentered = true;
    }
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

        // En lugar de un popup, abrir el Drawer al hacer clic
        marker.on('click', () => {
            openStopDrawer(stop);
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
        // Cargar tiempos (Nativo o Web)
        let html;
        if (CONFIG.IS_NATIVE && window.Capacitor?.Plugins?.CapacitorHttp) {
            const response = await window.Capacitor.Plugins.CapacitorHttp.get({ url: url });
            html = response.data;
        } else {
            const proxyUrl = url.replace(/^https?:\/\/www\.emtvalencia\.es/, '/api/emt-proxy');
            const response = await fetch(proxyUrl);
            html = await response.text();
        }

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

                // Normalizar para comparar con aliases
                const commercialLine = CONFIG.LINE_ALIASES[line] || line;
                const commercialUsefulLines = usefulLines.map(l => CONFIG.LINE_ALIASES[l] || l);

                if (commercialUsefulLines.includes(commercialLine)) {
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
                        arrivals.push({ line, destination, time });
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
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                        <span style="font-weight: 600; color: #6366f1; font-size: 13px;">⏱️ Próximas llegadas:</span>
                        <button onclick="loadTimesInPopup('${url}', '${stopId}', ${JSON.stringify(usefulLines)})" 
                                style="background: none; border: none; cursor: pointer; font-size: 14px; padding: 2px;">🔄</button>
                    </div>
                    ${arrivals.map(arrival => `
                        <div style="
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            padding: 6px;
                            margin-top: 4px;
                            background: rgba(99, 102, 241, 0.1);
                            border-radius: 6px;
                        ">
                            <div style="display: flex; align-items: center; gap: 8px; flex: 1; min-width: 0;">
                                <span style="
                                    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                                    color: white;
                                    padding: 2px 6px;
                                    border-radius: 4px;
                                    font-weight: 700;
                                    font-size: 11px;
                                    min-width: 25px;
                                    text-align: center;
                                    flex-shrink: 0;
                                >${CONFIG.LINE_ALIASES[arrival.line] || arrival.line}</span>
                                <span style="
                                    font-size: 11px;
                                    color: #4b5563;
                                    white-space: nowrap;
                                    overflow: hidden;
                                    text-overflow: ellipsis;
                                    font-weight: 500;
                                ">${arrival.destination}</span>
                            </div>
                            <span style="
                                font-weight: 700;
                                color: #6366f1;
                                font-size: 12px;
                                flex-shrink: 0;
                                margin-left: 8px;
                            ">${arrival.time}</span>
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
    // Captura de errores globales para depuración en móvil
    window.onerror = function (msg, url, line, col, error) {
        const errorMsg = `❌ Error: ${msg} en ${line}:${col}`;
        console.error(errorMsg, error);
        if (msg.includes('TypeError') || msg.includes('ReferenceError')) {
            showLocationStatus(errorMsg);
        }
    };

    // Fake location logic recurrente (v33)
    if (elements.toggleFakeLocation) {
        elements.toggleFakeLocation.addEventListener('click', () => {
            // Siempre activa modo selección, permite cambiar de sitio sin resetear primero
            state.selectingLocation = true;
            elements.toggleFakeLocation.classList.add('active');
            elements.toggleFakeLocation.innerHTML = '🎯 Haz clic en el mapa...';
            state.map.getContainer().style.cursor = 'crosshair';
            console.log('✅ Modo selección activado (v33 recurrente)');
        });
    }

    // Radio Menu Logic (v33)
    if (elements.radiusTrigger) {
        elements.radiusTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            elements.radiusMenu.classList.toggle('hidden');
        });
    }

    // Cerrar menú al hacer clic fuera
    document.addEventListener('click', () => {
        if (elements.radiusMenu) elements.radiusMenu.classList.add('hidden');
    });

    if (elements.radiusOptions) {
        elements.radiusOptions.forEach(btn => {
            btn.addEventListener('click', () => {
                elements.radiusOptions.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.selectedRadius = parseInt(btn.dataset.radius);
                filterAndDisplayStops();
                elements.radiusMenu.classList.add('hidden');
            });
        });
    }

    // Botón de localización real en mapa (v33)
    if (elements.realLocateBtn) {
        elements.realLocateBtn.addEventListener('click', () => {
            state.useFakeLocation = false;
            state.fakeLocation = null;
            if (elements.toggleFakeLocation) {
                elements.toggleFakeLocation.classList.remove('active');
                elements.toggleFakeLocation.innerHTML = '📍 Simular Ubicación';
            }
            getUserLocation();
        });
    }

    // Toggle tema
    if (elements.themeToggle) {
        elements.themeToggle.addEventListener('click', toggleTheme);
    }

    // Cerrar Drawer
    if (elements.closeDrawer) {
        elements.closeDrawer.addEventListener('click', closeStopDrawer);
    }
    if (elements.drawerOverlay) {
        elements.drawerOverlay.addEventListener('click', closeStopDrawer);
    }

}

// ========================================
// LÓGICA DE UI ADAPTATIVA Y DRAWER
// ========================================

function mapElements() {
    elements.locationStatus = document.getElementById('location-status');
    elements.statusText = document.querySelector('.status-text');
    elements.map = document.getElementById('map');
    elements.stopsList = document.getElementById('stops-list');
    elements.stopsCount = document.getElementById('stops-count');
    elements.radioBtns = document.querySelectorAll('.radio-btn');
    elements.locateBtn = document.getElementById('locate-btn');
    elements.themeToggle = document.getElementById('theme-toggle');
    elements.themeIcon = document.querySelector('.theme-icon');
    elements.arrivalsModal = document.getElementById('arrivals-modal');
    elements.arrivalsIframe = document.getElementById('arrivals-iframe');
    elements.closeModal = document.getElementById('close-modal');
    elements.toggleFakeLocation = document.getElementById('toggle-fake-location');
    elements.header = document.querySelector('.header');

    // v33 elements
    elements.radiusTrigger = document.getElementById('radius-trigger');
    elements.radiusMenu = document.getElementById('radius-menu');
    elements.radiusOptions = document.querySelectorAll('.radius-option');
    elements.realLocateBtn = document.getElementById('real-locate-btn');
    elements.stopInfoDrawer = document.getElementById('stop-info-drawer');
    elements.drawerStopName = document.getElementById('drawer-stop-name');
    elements.drawerStopInfo = document.getElementById('drawer-stop-info');
    elements.drawerArrivals = document.getElementById('drawer-arrivals-container');
    elements.drawerFooter = document.getElementById('drawer-footer');
    elements.closeDrawer = document.getElementById('close-drawer');
    elements.drawerOverlay = document.getElementById('drawer-overlay');
}


function openStopDrawer(stop) {
    state.lastOpenedStop = stop;
    elements.drawerStopName.textContent = stop.name;
    const usefulLinesInStop = stop.lines.filter(l => CONFIG.USEFUL_LINES.includes(l));
    elements.drawerStopInfo.textContent = `📍 ${stop.distanceToStop}m a pie | 🏠 A ${stop.distanceStopToHome}m de casa`;

    // Cargando...
    elements.drawerArrivals.innerHTML = `
        <div style="text-align: center; padding: 40px 20px;">
            <div class="loading-spinner-small" style="width: 30px; height: 30px; margin: 0 auto; border-width: 4px;"></div>
            <p style="margin-top: 15px; color: #666; font-size: 14px;">Consultando tiempos en tiempo real...</p>
        </div>
    `;

    // Botón Google Maps
    elements.drawerFooter.innerHTML = `
        <a href="https://www.google.com/maps/search/?api=1&query=${stop.coords.lat},${stop.coords.lon}" 
           target="_blank" 
           class="btn-google-maps"
           style="display: flex; align-items: center; justify-content: center; gap: 10px; background: #fff; border: 1px solid #dadce0; color: #3c4043; padding: 14px; border-radius: 12px; font-size: 15px; font-weight: 600; text-decoration: none; transition: background 0.2s, box-shadow 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <span style="font-size: 20px;">📍</span> Ir a Google Maps
        </a>
    `;

    elements.stopInfoDrawer.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Evitar scroll de fondo

    // Cargar tiempos
    loadArrivalsInDrawer(stop.arrivalsUrl, stop.id, usefulLinesInStop, stop.bestLine);
}

function refreshStopDrawer() {
    if (!state.lastOpenedStop) return;

    // Mostrar loading de nuevo
    elements.drawerArrivals.innerHTML = `
        <div style="text-align: center; padding: 40px 20px;">
            <div class="loading-spinner-small" style="width: 30px; height: 30px; margin: 0 auto; border-width: 4px;"></div>
            <p style="margin-top: 15px; color: #666; font-size: 14px;">Actualizando tiempos...</p>
        </div>
    `;

    const stop = state.lastOpenedStop;
    const usefulLinesInStop = stop.lines.filter(l => CONFIG.USEFUL_LINES.includes(l));
    loadArrivalsInDrawer(stop.arrivalsUrl, stop.id, usefulLinesInStop, stop.bestLine);
}

// Hacerla global para el onclick del HTML
window.refreshStopDrawer = refreshStopDrawer;

function closeStopDrawer() {
    elements.stopInfoDrawer.classList.add('hidden');
    document.body.style.overflow = '';
}

async function loadArrivalsInDrawer(url, stopId, usefulLines, bestLine) {
    try {
        let html;
        if (CONFIG.IS_NATIVE && window.Capacitor?.Plugins?.CapacitorHttp) {
            const response = await window.Capacitor.Plugins.CapacitorHttp.get({ url: url });
            html = response.data;
        } else {
            const proxyUrl = url.replace(/^https?:\/\/www\.emtvalencia\.es/, '/api/emt-proxy');
            const response = await fetch(proxyUrl);
            html = await response.text();
        }

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const divs = doc.querySelectorAll('div[style*="border-bottom"]');

        const arrivals = [];
        divs.forEach(div => {
            const img = div.querySelector('img[title]');
            const span = div.querySelector('span[style*="position"]');

            if (img && span) {
                const line = img.getAttribute('title');
                const text = span.textContent.trim();

                // Normalizar para comparar con aliases
                const commercialLine = CONFIG.LINE_ALIASES[line] || line;
                const commercialUsefulLines = usefulLines.map(l => CONFIG.LINE_ALIASES[l] || l);

                if (commercialUsefulLines.includes(commercialLine)) {
                    // Extraer destino y tiempo de forma robusta igual que en la lista
                    let destination = "Desconocido";
                    let time = text; // Fallback

                    const timeMatch = text.match(/- (\d{2}:\d{2})$/);
                    const minMatch = text.match(/- (\d+ min\.?)$/);

                    if (timeMatch) {
                        time = timeMatch[1];
                        destination = text.substring(0, text.lastIndexOf(' - ')).trim();
                    } else if (minMatch) {
                        time = minMatch[1];
                        destination = text.substring(0, text.lastIndexOf(' - ')).trim();
                    } else {
                        // Intentar separar por el último guion si no hay match claro
                        const lastDashIndex = text.lastIndexOf(' - ');
                        if (lastDashIndex !== -1) {
                            destination = text.substring(0, lastDashIndex).trim();
                            time = text.substring(lastDashIndex + 3).trim();
                        }
                    }

                    arrivals.push({ line, time, destination });
                }
            }
        });

        if (arrivals.length === 0) {
            elements.drawerArrivals.innerHTML = `
                <div style="text-align: center; padding: 30px; color: #666;">
                    <p>No hay llegadas próximas para las líneas guardadas.</p>
                </div>
            `;
            return;
        }

        elements.drawerArrivals.innerHTML = arrivals.map(arrival => {
            const commercialLine = CONFIG.LINE_ALIASES[arrival.line] || arrival.line;
            const commercialBestLine = CONFIG.LINE_ALIASES[bestLine] || bestLine;
            const isBestLine = commercialLine === commercialBestLine;
            const accentColor = isBestLine ? '#ec4899' : '#6366f1';

            return `
                <div class="drawer-arrival-item" style="border-left-color: ${accentColor}">
                    <div class="drawer-arrival-info">
                        <div class="drawer-arrival-line-row">
                            <span class="line-badge" style="margin:0; min-width: 40px; background: ${accentColor}">${commercialLine}</span>
                            <span style="font-weight: 600; font-size: 14px; margin-left: 8px; color: var(--color-text);">${arrival.destination}</span>
                        </div>
                    </div>
                    <div class="drawer-arrival-time" style="color: ${accentColor}; font-weight: 800;">${arrival.time}</div>
                </div>
            `;
        }).join('');

    } catch (error) {
        console.error('Error cargando tiempos en drawer:', error);
        elements.drawerArrivals.innerHTML = '<p style="text-align: center; padding: 20px; color: #ef4444;">Error al cargar tiempos</p>';
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

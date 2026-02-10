#!/usr/bin/env node
/**
 * build-stops.js - Genera stops-data.json desde GTFS de EMT Valencia
 *
 * Uso: node build-stops.js
 *
 * Descarga el GTFS ZIP del portal de datos abiertos de Valencia,
 * extrae las paradas con sus líneas y genera un JSON estático.
 * Determina qué líneas van "hacia casa" en cada parada usando las
 * terminales de cada shape del GTFS.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

// URL del GTFS de EMT Valencia (Ajuntament de València - VLCi)
const GTFS_URL = 'https://opendata.vlci.valencia.es/dataset/ab058cf8-ad3e-4d9c-ac89-0c6367ecf351/resource/c81b69e6-c082-44dc-acc6-66fc417b4e66/download/google_transit.zip';

const TEMP_DIR = path.join(__dirname, '.gtfs-temp');
const OUTPUT_FILE = path.join(__dirname, 'stops-data.json');
const ZIP_FILE = path.join(TEMP_DIR, 'google_transit.zip');

// Líneas útiles (mismas que CONFIG.USEFUL_LINES en main.js)
const USEFUL_LINES = ['11', '6', '16', '26', '98', 'C2', 'C3', 'C1', '94', '95', '60', '64', '28', 'T4'];

// Paradas de destino cerca de casa por línea (mismas que CONFIG.DESTINATION_STOPS en main.js)
const DESTINATION_STOPS = {
    '11': 215, '6': 322, '16': 322, '26': 322, '98': 1808,
    'C1': 1305, 'C2': 351, 'C3': 1682, '94': 351, '95': 343,
    '60': 1217, '64': 242, '28': 331,
    'T4': 'tram-93' // Sagunt (más cercana a casa)
};

// Paradas de tranvía FGV MetroValencia (no provienen del GTFS de EMT)
// API: https://www.fgv.es/fgv/app/es/api/v1/V/horarios-prevision-3/{estacion_id_FGV}
const FGV_API_BASE = 'https://www.fgv.es/fgv/app/es/api/v1/V/horarios-prevision-3/';

// IDs de paradas compartidas L4/L6 (Trinitat ↔ Dr. Lluch)
const L4_L6_SHARED = [83, 82, 81, 84, 85, 86, 87, 88, 89, 90, 12, 91];

// L4: Dr. Lluch ↔ Mas del Rosari (33 estaciones)
const FGV_TRAM_STOPS = [
    // Zona Playa (sureste) - compartidas L4/L6
    { id: 'tram-83',  name: 'Dr. Lluch',                    lat: 39.4693069458, lon: -0.3281527758, fgvId: 83 },
    { id: 'tram-82',  name: 'Platja les Arenes',            lat: 39.4689292908, lon: -0.3257277906, fgvId: 82 },
    { id: 'tram-81',  name: 'Platja Malva-rosa',            lat: 39.4736900330, lon: -0.3257277906, fgvId: 81 },
    { id: 'tram-84',  name: 'Cabanyal',                     lat: 39.4728546143, lon: -0.3275833428, fgvId: 84 },
    { id: 'tram-85',  name: 'La Cadena',                    lat: 39.4752044678, lon: -0.3293749988, fgvId: 85 },
    // Zona Universitat / Tarongers - compartidas L4/L6
    { id: 'tram-86',  name: 'Beteró',                       lat: 39.4765930176, lon: -0.3342027664, fgvId: 86 },
    { id: 'tram-87',  name: 'Tarongers - Ernest Lluch',     lat: 39.4781379700, lon: -0.3396222293, fgvId: 87 },
    { id: 'tram-88',  name: 'La Carrasca',                  lat: 39.4796600342, lon: -0.3448249996, fgvId: 88 },
    { id: 'tram-89',  name: 'Universitat Politècnica',      lat: 39.4813156128, lon: -0.3504999876, fgvId: 89 },
    { id: 'tram-90',  name: 'Vicente Zaragozá',             lat: 39.4833717346, lon: -0.3579472303, fgvId: 90 },
    // Zona Centro-Norte - compartidas L4/L6
    { id: 'tram-12',  name: 'Benimaclet',                   lat: 39.4848518372, lon: -0.3623333275, fgvId: 12 },
    { id: 'tram-91',  name: 'Trinitat',                     lat: 39.4862709045, lon: -0.3677638769, fgvId: 91 },
    // Solo L4 desde aquí
    { id: 'tram-92',  name: 'Pont de Fusta',                lat: 39.4817810059, lon: -0.3731805682, fgvId: 92 },
    { id: 'tram-93',  name: 'Sagunt',                       lat: 39.4864997864, lon: -0.3749722242, fgvId: 93 },
    { id: 'tram-94',  name: 'Reus',                         lat: 39.4859657288, lon: -0.3817070127, fgvId: 94 },
    { id: 'tram-95',  name: 'Marxalenes',                   lat: 39.4879722595, lon: -0.3838368952, fgvId: 95 },
    { id: 'tram-96',  name: 'Trànsits',                     lat: 39.4895629883, lon: -0.3872583210, fgvId: 96 },
    { id: 'tram-97',  name: 'Benicalap',                    lat: 39.4900283813, lon: -0.3909277916, fgvId: 97 },
    { id: 'tram-98',  name: 'Garbí',                        lat: 39.4922904968, lon: -0.3945111036, fgvId: 98 },
    { id: 'tram-99',  name: 'Florista',                     lat: 39.4944343567, lon: -0.3968166709, fgvId: 99 },
    { id: 'tram-100', name: 'Palau de Congressos',          lat: 39.4971809387, lon: -0.4001416564, fgvId: 100 },
    { id: 'tram-55',  name: 'Empalme',                      lat: 39.4995765686, lon: -0.4021083415, fgvId: 55 },
    { id: 'tram-101', name: 'La Granja',                    lat: 39.5040321350, lon: -0.4124779999, fgvId: 101 },
    { id: 'tram-102', name: 'Sant Joan',                    lat: 39.5052909851, lon: -0.4163239896, fgvId: 102 },
    { id: 'tram-103', name: 'Campus',                       lat: 39.5072212219, lon: -0.4174583256, fgvId: 103 },
    { id: 'tram-104', name: 'Vicent Andrés Estellés',       lat: 39.5085601807, lon: -0.4198839962, fgvId: 104 },
    { id: 'tram-105', name: 'À Punt',                       lat: 39.5122032166, lon: -0.4247489870, fgvId: 105 },
    { id: 'tram-106', name: 'Fira València',                lat: 39.5041427612, lon: -0.4254944324, fgvId: 106 },
    { id: 'tram-114', name: 'Ll. Llarga - Terramelar',      lat: 39.5098991394, lon: -0.4304472208, fgvId: 114 },
    { id: 'tram-113', name: 'Parc Científic',               lat: 39.5151405334, lon: -0.4226219952, fgvId: 113 },
    { id: 'tram-112', name: 'Tomás y Valiente',             lat: 39.5197715759, lon: -0.4256361127, fgvId: 112 },
    { id: 'tram-111', name: 'La Coma',                      lat: 39.5215721130, lon: -0.4317069948, fgvId: 111 },
    { id: 'tram-110', name: 'Mas del Rosari',               lat: 39.5249595642, lon: -0.4358249903, fgvId: 110 },
].map(s => {
    const isShared = L4_L6_SHARED.includes(s.fgvId);
    const lines = isShared ? ['T4', 'T6'] : ['T4'];
    const label = isShared ? 'Tranvía L4/L6' : 'Tranvía L4';
    return {
        id: s.id, name: s.name + ` (${label})`,
        lat: s.lat, lon: s.lon,
        lines, linesHomeward: lines,
        type: 'tram', arrivalsUrl: FGV_API_BASE + s.fgvId
    };
});

// L6: Tossal del Rei ↔ Marítim (paradas exclusivas, no compartidas con L4)
const FGV_L6_ONLY_STOPS = [
    // Zona Norte (exclusivas L6)
    { id: 'tram-128', name: 'Alfauir',                      lat: 39.4892997742, lon: -0.3660329878, fgvId: 128 },
    { id: 'tram-129', name: 'Orriols',                      lat: 39.4931488037, lon: -0.3676636219, fgvId: 129 },
    { id: 'tram-130', name: 'Estadi Ciutat de València',    lat: 39.4949188232, lon: -0.3655419946, fgvId: 130 },
    { id: 'tram-131', name: 'Sant Miquel dels Reis',        lat: 39.4972190857, lon: -0.3684949875, fgvId: 131 },
    { id: 'tram-132', name: 'Tossal del Rei',               lat: 39.4959526062, lon: -0.3725369871, fgvId: 132, isDestinationOnly: true },
    // Zona Sur/Marítim (exclusivas L6)
    { id: 'tram-127', name: 'Canyamelar',                   lat: 39.4665222168, lon: -0.3279320002, fgvId: 127 },
    { id: 'tram-122', name: 'Francesc Cubells',             lat: 39.4632453918, lon: -0.3339729905, fgvId: 122 },
    { id: 'tram-123', name: 'Grau - La Marina',             lat: 39.4631004333, lon: -0.3294720054, fgvId: 123 },
    { id: 'tram-115', name: 'Marítim',                      lat: 39.4649391174, lon: -0.3382369876, fgvId: 115 },
].map(s => ({
    id: s.id, name: s.name + ' (Tranvía L6)',
    lat: s.lat, lon: s.lon,
    lines: ['T6'],
    // Tossal del Rei: solo destino, no útil para coger (ya estás en casa)
    linesHomeward: s.isDestinationOnly ? [] : ['T6'],
    type: 'tram', arrivalsUrl: FGV_API_BASE + s.fgvId
}));

// Distancia máxima (metros) entre cualquier parada del shape y la destination stop
// para considerar que el shape "pasa por" la destination stop
const HOMEWARD_THRESHOLD = 300;

function download(url, dest) {
    return new Promise((resolve, reject) => {
        const follow = (url) => {
            https.get(url, (res) => {
                if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                    follow(res.headers.location);
                    return;
                }
                if (res.statusCode !== 200) {
                    reject(new Error(`HTTP ${res.statusCode}`));
                    return;
                }
                const file = fs.createWriteStream(dest);
                res.pipe(file);
                file.on('finish', () => { file.close(); resolve(); });
            }).on('error', reject);
        };
        follow(url);
    });
}

function parseCSV(content) {
    const lines = content.split('\n').filter(l => l.trim());
    if (lines.length === 0) return [];
    const headers = parseCSVLine(lines[0]);
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        if (values.length === headers.length) {
            const row = {};
            headers.forEach((h, idx) => row[h] = values[idx]);
            rows.push(row);
        }
    }
    return rows;
}

function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
            if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
            else inQuotes = !inQuotes;
        } else if (ch === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else if (ch !== '\r') {
            current += ch;
        }
    }
    result.push(current.trim());
    return result;
}

function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3;
    const toRad = v => v * Math.PI / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function main() {
    console.log('🚌 Build stops-data.json desde GTFS EMT Valencia\n');

    // 1. Preparar directorio temporal
    if (fs.existsSync(TEMP_DIR)) fs.rmSync(TEMP_DIR, { recursive: true });
    fs.mkdirSync(TEMP_DIR, { recursive: true });

    // 2. Descargar GTFS
    console.log('⬇️  Descargando GTFS...');
    await download(GTFS_URL, ZIP_FILE);
    console.log('✅ Descargado');

    // 3. Descomprimir
    console.log('📦 Descomprimiendo...');
    if (process.platform === 'win32') {
        execSync(`powershell -Command "Expand-Archive -Path '${ZIP_FILE}' -DestinationPath '${TEMP_DIR}' -Force"`, { stdio: 'pipe' });
    } else {
        execSync(`unzip -o "${ZIP_FILE}" -d "${TEMP_DIR}"`, { stdio: 'pipe' });
    }
    console.log('✅ Descomprimido');

    // 4. Leer archivos GTFS
    console.log('📖 Leyendo archivos GTFS...');
    const stops = parseCSV(fs.readFileSync(path.join(TEMP_DIR, 'stops.txt'), 'utf-8'));
    const routes = parseCSV(fs.readFileSync(path.join(TEMP_DIR, 'routes.txt'), 'utf-8'));
    const trips = parseCSV(fs.readFileSync(path.join(TEMP_DIR, 'trips.txt'), 'utf-8'));
    const stopTimesRaw = fs.readFileSync(path.join(TEMP_DIR, 'stop_times.txt'), 'utf-8');

    console.log(`   stops.txt: ${stops.length} paradas`);
    console.log(`   routes.txt: ${routes.length} rutas`);
    console.log(`   trips.txt: ${trips.length} viajes`);

    // Mapa de coordenadas de paradas para cálculos de distancia
    const stopCoords = new Map();
    stops.forEach(s => stopCoords.set(s.stop_id, { lat: parseFloat(s.stop_lat), lon: parseFloat(s.stop_lon) }));

    // 5. Construir mapeos
    const routeNameMap = new Map();
    routes.forEach(r => routeNameMap.set(r.route_id, r.route_short_name));

    // trip_id -> { route (short_name), shape_id }
    const tripInfoMap = new Map();
    trips.forEach(t => {
        tripInfoMap.set(t.trip_id, {
            route: routeNameMap.get(t.route_id),
            shape: t.shape_id
        });
    });

    // 6. Procesar stop_times: recopilar paradas por shape y líneas por parada
    console.log('📊 Procesando stop_times.txt...');
    const stLines = stopTimesRaw.split('\n');
    const stHeaders = parseCSVLine(stLines[0]);
    const tripIdIdx = stHeaders.indexOf('trip_id');
    const stopIdIdx = stHeaders.indexOf('stop_id');
    const seqIdx = stHeaders.indexOf('stop_sequence');

    // stop_id -> Set<line> (todas las líneas)
    const stopAllLines = new Map();
    // shape_id -> { route, stopSeqs: Map<stop_id, sequence> }
    const shapeInfo = new Map();
    // stop_id -> Map<line, Set<shape_id>>
    const stopLineShapes = new Map();

    for (let i = 1; i < stLines.length; i++) {
        const line = stLines[i].trim();
        if (!line) continue;
        const parts = line.split(',');
        const tripId = parts[tripIdIdx]?.trim();
        const stopId = parts[stopIdIdx]?.trim();
        const seq = parseInt(parts[seqIdx]?.trim());
        if (!tripId || !stopId) continue;

        const info = tripInfoMap.get(tripId);
        if (!info || !info.route) continue;

        // Todas las líneas por parada
        if (!stopAllLines.has(stopId)) stopAllLines.set(stopId, new Set());
        stopAllLines.get(stopId).add(info.route);

        // Paradas por shape con secuencia (guardar la menor secuencia por stop)
        if (!shapeInfo.has(info.shape)) {
            shapeInfo.set(info.shape, { route: info.route, stopSeqs: new Map() });
        }
        const si = shapeInfo.get(info.shape);
        if (!si.stopSeqs.has(stopId) || seq < si.stopSeqs.get(stopId)) {
            si.stopSeqs.set(stopId, seq);
        }

        // Shapes por línea por parada
        if (!stopLineShapes.has(stopId)) stopLineShapes.set(stopId, new Map());
        const lineShapes = stopLineShapes.get(stopId);
        if (!lineShapes.has(info.route)) lineShapes.set(info.route, new Set());
        lineShapes.get(info.route).add(info.shape);
    }

    console.log(`   ${stopAllLines.size} paradas con líneas, ${shapeInfo.size} shapes`);

    // 7. Para cada shape, determinar la secuencia de la destination stop (si existe)
    // Un shape lleva "hacia casa" a una parada si:
    //   - La destination stop está en el recorrido del shape (o una parada muy cercana)
    //   - La destination stop aparece DESPUÉS de la parada candidata en la secuencia
    console.log('🏠 Determinando dirección de cada shape...');

    // shape_id -> { destSeq: number } para shapes que contienen la destination stop
    const shapeDestSeq = new Map();

    for (const [shapeId, si] of shapeInfo) {
        const line = si.route;
        const destStopId = DESTINATION_STOPS[line];
        if (!destStopId) continue;

        const destStopIdStr = String(destStopId);

        // Comprobación directa
        if (si.stopSeqs.has(destStopIdStr)) {
            shapeDestSeq.set(shapeId, si.stopSeqs.get(destStopIdStr));
            continue;
        }

        // Comprobación por proximidad
        const destCoords = stopCoords.get(destStopIdStr);
        if (!destCoords) continue;

        for (const [sid, seq] of si.stopSeqs) {
            const sc = stopCoords.get(sid);
            if (!sc) continue;
            if (haversineDistance(sc.lat, sc.lon, destCoords.lat, destCoords.lon) <= HOMEWARD_THRESHOLD) {
                shapeDestSeq.set(shapeId, seq);
                break;
            }
        }
    }

    console.log(`   ${shapeDestSeq.size} shapes contienen destination stop (de ${shapeInfo.size} total)`);

    // 7b. Encadenar shapes de la misma línea
    // Algunas líneas (ej: C3 circular) se dividen en múltiples shapes consecutivos.
    // Si shape A termina en parada X, y shape B empieza en X y contiene la destination,
    // entonces shape A también es "homeward" (todas sus paradas van hacia la destination).
    console.log('🔗 Encadenando shapes consecutivos...');

    // Construir mapa: para cada línea, shapes que empiezan/terminan en cada parada
    const lineShapeEndpoints = new Map(); // line -> { byFirst: Map<stopId, [shapeId]>, byLast: Map<stopId, [shapeId]> }
    for (const [shapeId, si] of shapeInfo) {
        const line = si.route;
        if (!USEFUL_LINES.includes(line)) continue;

        // Encontrar primera y última parada del shape
        let minSeq = Infinity, maxSeq = -Infinity, firstStop = null, lastStop = null;
        for (const [sid, seq] of si.stopSeqs) {
            if (seq < minSeq) { minSeq = seq; firstStop = sid; }
            if (seq > maxSeq) { maxSeq = seq; lastStop = sid; }
        }

        if (!lineShapeEndpoints.has(line)) {
            lineShapeEndpoints.set(line, { byFirst: new Map(), byLast: new Map() });
        }
        const ep = lineShapeEndpoints.get(line);
        if (firstStop) {
            if (!ep.byFirst.has(firstStop)) ep.byFirst.set(firstStop, []);
            ep.byFirst.get(firstStop).push(shapeId);
        }
        if (lastStop) {
            if (!ep.byLast.has(lastStop)) ep.byLast.set(lastStop, []);
            ep.byLast.get(lastStop).push(shapeId);
        }
    }

    // Para cada shape sin destination, ver si encadena con uno que sí la tiene
    let chainCount = 0;
    for (const [shapeId, si] of shapeInfo) {
        if (shapeDestSeq.has(shapeId)) continue; // Ya tiene destination
        const line = si.route;
        if (!USEFUL_LINES.includes(line)) continue;

        // Encontrar última parada de este shape
        let maxSeq = -Infinity, lastStop = null;
        for (const [sid, seq] of si.stopSeqs) {
            if (seq > maxSeq) { maxSeq = seq; lastStop = sid; }
        }
        if (!lastStop) continue;

        // Buscar shapes de la misma línea que empiecen donde este termina
        const ep = lineShapeEndpoints.get(line);
        if (!ep) continue;

        // También buscar por proximidad (la última parada puede no ser exactamente la misma)
        const lastCoords = stopCoords.get(lastStop);
        const candidateFirstStops = new Set();
        if (ep.byFirst.has(lastStop)) {
            candidateFirstStops.add(lastStop);
        }
        if (lastCoords) {
            for (const [firstStopId] of ep.byFirst) {
                const fc = stopCoords.get(firstStopId);
                if (fc && haversineDistance(lastCoords.lat, lastCoords.lon, fc.lat, fc.lon) <= HOMEWARD_THRESHOLD) {
                    candidateFirstStops.add(firstStopId);
                }
            }
        }

        for (const firstStopId of candidateFirstStops) {
            const nextShapes = ep.byFirst.get(firstStopId) || [];
            for (const nextShapeId of nextShapes) {
                if (shapeDestSeq.has(nextShapeId)) {
                    // Solo encadenar si la destination está en la primera mitad del next shape
                    // Evita marcar como homeward shapes donde el bus da casi toda la vuelta
                    const nextSi = shapeInfo.get(nextShapeId);
                    const nextDestSeq = shapeDestSeq.get(nextShapeId);
                    let nextMaxSeq = 0;
                    for (const seq of nextSi.stopSeqs.values()) {
                        if (seq > nextMaxSeq) nextMaxSeq = seq;
                    }
                    if (nextDestSeq <= nextMaxSeq * 0.5) {
                        shapeDestSeq.set(shapeId, maxSeq + 1);
                        chainCount++;
                    }
                    break;
                }
            }
            if (shapeDestSeq.has(shapeId)) break;
        }
    }

    console.log(`   ${chainCount} shapes encadenados (total homeward: ${shapeDestSeq.size})`);

    // 8. Para cada parada, determinar linesHomeward
    const isUsefulLine = (name) => USEFUL_LINES.includes(name);

    const outputStops = [];
    stops.forEach(stop => {
        const stopId = stop.stop_id;
        const allLines = stopAllLines.get(stopId);
        if (!allLines) return;

        const lineArray = Array.from(allLines);
        const hasUseful = lineArray.some(l => isUsefulLine(l));
        if (!hasUseful) return;

        // Determinar qué líneas útiles van hacia casa en esta parada
        // Una línea va hacia casa si hay un shape donde esta parada aparece ANTES de la destination stop
        const linesHomeward = [];
        const lineShapes = stopLineShapes.get(stopId);
        if (lineShapes) {
            for (const [line, shapes] of lineShapes) {
                if (!isUsefulLine(line)) continue;
                for (const shapeId of shapes) {
                    const destSeq = shapeDestSeq.get(shapeId);
                    if (destSeq === undefined) continue;
                    const si = shapeInfo.get(shapeId);
                    const stopSeq = si?.stopSeqs.get(stopId);
                    if (stopSeq !== undefined && stopSeq <= destSeq) {
                        linesHomeward.push(line);
                        break;
                    }
                }
            }
        }

        const numericId = parseInt(stopId);
        outputStops.push({
            id: isNaN(numericId) ? stopId : numericId,
            name: stop.stop_name || '',
            lat: parseFloat(stop.stop_lat),
            lon: parseFloat(stop.stop_lon),
            lines: lineArray.sort(),
            linesHomeward: linesHomeward.sort(),
            arrivalsUrl: `http://www.emtvalencia.es/QR.php?sec=est&p=${isNaN(numericId) ? stopId : numericId}`
        });
    });

    // Añadir paradas de tranvía FGV (L4 + L6)
    const allTramStops = [...FGV_TRAM_STOPS, ...FGV_L6_ONLY_STOPS];
    allTramStops.forEach(tram => {
        outputStops.push({
            id: tram.id,
            name: tram.name,
            lat: tram.lat,
            lon: tram.lon,
            lines: tram.lines,
            linesHomeward: tram.linesHomeward,
            type: tram.type,
            arrivalsUrl: tram.arrivalsUrl
        });
    });
    console.log(`\n🚊 Añadidas ${allTramStops.length} paradas de tranvía FGV (${FGV_TRAM_STOPS.length} L4 + ${FGV_L6_ONLY_STOPS.length} L6-only)`);

    outputStops.sort((a, b) => (typeof a.id === 'number' && typeof b.id === 'number') ? a.id - b.id : String(a.id).localeCompare(String(b.id)));

    const output = {
        generated: new Date().toISOString().split('T')[0],
        source: 'GTFS EMT Valencia + FGV MetroValencia',
        totalStops: outputStops.length,
        stops: outputStops
    };

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2), 'utf-8');

    // 9. Stats
    console.log(`\n✅ Generado ${OUTPUT_FILE}`);
    console.log(`   ${outputStops.length} paradas con líneas útiles`);

    const countByLine = {};
    const countHomeward = {};
    outputStops.forEach(s => {
        s.lines.forEach(l => { if (isUsefulLine(l)) countByLine[l] = (countByLine[l] || 0) + 1; });
        s.linesHomeward.forEach(l => { countHomeward[l] = (countHomeward[l] || 0) + 1; });
    });

    console.log('\n📊 Paradas por línea (total / hacia casa):');
    USEFUL_LINES.forEach(l => {
        const total = countByLine[l] || 0;
        const home = countHomeward[l] || 0;
        console.log(`   Línea ${l.padEnd(3)}: ${String(total).padStart(3)} total | ${String(home).padStart(3)} hacia casa`);
    });

    // 10. Limpiar
    fs.rmSync(TEMP_DIR, { recursive: true });
    console.log('\n🧹 Archivos temporales eliminados');
}

main().catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
});

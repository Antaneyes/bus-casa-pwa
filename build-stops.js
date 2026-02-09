#!/usr/bin/env node
/**
 * build-stops.js - Genera stops-data.json desde GTFS de EMT Valencia
 *
 * Uso: node build-stops.js
 *
 * Descarga el GTFS ZIP del portal de datos abiertos de Valencia,
 * extrae las paradas con sus líneas y genera un JSON estático.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

// URL del GTFS de EMT Valencia (Ajuntament de València - VLCi)
const GTFS_URL = 'https://opendata.vlci.valencia.es/dataset/ab058cf8-ad3e-4d9c-ac89-0c6367ecf351/resource/c81b69e6-c082-44dc-acc6-66fc417b4e66/download/google_transit2026-02-07.zip';

const TEMP_DIR = path.join(__dirname, '.gtfs-temp');
const OUTPUT_FILE = path.join(__dirname, 'stops-data.json');
const ZIP_FILE = path.join(TEMP_DIR, 'google_transit.zip');

// Líneas útiles (mismas que CONFIG.USEFUL_LINES en main.js)
const USEFUL_LINES = ['11', '6', '16', '26', '98', 'C2', 'C3', 'C1', '94', '95', '60', '64', '28', '79', '80', '89', '90', '5'];

// Aliases de líneas (route_short_name en GTFS puede ser diferente)
const LINE_ALIASES = { '79': 'C2', '80': 'C2', '89': 'C3', '90': 'C3', '5': 'C1' };

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
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (ch === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else if (ch === '\r') {
            // skip
        } else {
            current += ch;
        }
    }
    result.push(current.trim());
    return result;
}

async function main() {
    console.log('🚌 Build stops-data.json desde GTFS EMT Valencia\n');

    // 1. Preparar directorio temporal
    if (fs.existsSync(TEMP_DIR)) {
        fs.rmSync(TEMP_DIR, { recursive: true });
    }
    fs.mkdirSync(TEMP_DIR, { recursive: true });

    // 2. Descargar GTFS
    console.log('⬇️  Descargando GTFS...');
    await download(GTFS_URL, ZIP_FILE);
    console.log('✅ Descargado');

    // 3. Descomprimir
    console.log('📦 Descomprimiendo...');
    const platform = process.platform;
    if (platform === 'win32') {
        execSync(`powershell -Command "Expand-Archive -Path '${ZIP_FILE}' -DestinationPath '${TEMP_DIR}' -Force"`, { stdio: 'pipe' });
    } else {
        execSync(`unzip -o "${ZIP_FILE}" -d "${TEMP_DIR}"`, { stdio: 'pipe' });
    }
    console.log('✅ Descomprimido');

    // 4. Leer archivos GTFS
    console.log('📖 Leyendo archivos GTFS...');

    const stopsRaw = fs.readFileSync(path.join(TEMP_DIR, 'stops.txt'), 'utf-8');
    const routesRaw = fs.readFileSync(path.join(TEMP_DIR, 'routes.txt'), 'utf-8');
    const tripsRaw = fs.readFileSync(path.join(TEMP_DIR, 'trips.txt'), 'utf-8');
    const stopTimesRaw = fs.readFileSync(path.join(TEMP_DIR, 'stop_times.txt'), 'utf-8');

    const stops = parseCSV(stopsRaw);
    const routes = parseCSV(routesRaw);
    const trips = parseCSV(tripsRaw);

    console.log(`   stops.txt: ${stops.length} paradas`);
    console.log(`   routes.txt: ${routes.length} rutas`);
    console.log(`   trips.txt: ${trips.length} viajes`);

    // 5. Construir mapeos
    // route_id -> route_short_name
    const routeNameMap = new Map();
    routes.forEach(r => routeNameMap.set(r.route_id, r.route_short_name));

    // trip_id -> route_short_name
    const tripRouteMap = new Map();
    trips.forEach(t => tripRouteMap.set(t.trip_id, routeNameMap.get(t.route_id)));

    // stop_id -> Set de route_short_names
    console.log('📊 Procesando stop_times.txt (puede tardar unos segundos)...');
    const stopLines = new Map();

    // Procesar stop_times línea por línea para eficiencia de memoria
    const stLines = stopTimesRaw.split('\n');
    const stHeaders = parseCSVLine(stLines[0]);
    const tripIdIdx = stHeaders.indexOf('trip_id');
    const stopIdIdx = stHeaders.indexOf('stop_id');

    for (let i = 1; i < stLines.length; i++) {
        const line = stLines[i].trim();
        if (!line) continue;
        // Optimization: fast split since stop_times has no quoted fields
        const parts = line.split(',');
        const tripId = parts[tripIdIdx]?.trim();
        const stopId = parts[stopIdIdx]?.trim();
        if (!tripId || !stopId) continue;

        const routeName = tripRouteMap.get(tripId);
        if (!routeName) continue;

        if (!stopLines.has(stopId)) stopLines.set(stopId, new Set());
        stopLines.get(stopId).add(routeName);
    }

    console.log(`   stop_times procesados: ${stopLines.size} paradas con líneas`);

    // 6. Generar output
    const isUsefulLine = (lineName) => {
        if (USEFUL_LINES.includes(lineName)) return true;
        // Check aliases
        const aliased = LINE_ALIASES[lineName];
        if (aliased && USEFUL_LINES.includes(aliased)) return true;
        return false;
    };

    const outputStops = [];
    stops.forEach(stop => {
        const stopId = stop.stop_id;
        const lines = stopLines.get(stopId);
        if (!lines) return;

        const lineArray = Array.from(lines);
        const hasUseful = lineArray.some(l => isUsefulLine(l));
        if (!hasUseful) return;

        // Extraer ID numérico del stop_id (GTFS puede tener prefijos)
        // EMT Valencia usa IDs numéricos directamente
        const numericId = parseInt(stopId);

        outputStops.push({
            id: isNaN(numericId) ? stopId : numericId,
            name: stop.stop_name || '',
            lat: parseFloat(stop.stop_lat),
            lon: parseFloat(stop.stop_lon),
            lines: lineArray.sort(),
            arrivalsUrl: `http://www.emtvalencia.es/QR.php?sec=est&p=${isNaN(numericId) ? stopId : numericId}`
        });
    });

    // Ordenar por ID
    outputStops.sort((a, b) => (typeof a.id === 'number' && typeof b.id === 'number') ? a.id - b.id : String(a.id).localeCompare(String(b.id)));

    const output = {
        generated: new Date().toISOString().split('T')[0],
        source: 'GTFS EMT Valencia (opendata.vlci.valencia.es)',
        totalStops: outputStops.length,
        stops: outputStops
    };

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2), 'utf-8');

    // 7. Stats
    const allLines = new Set();
    outputStops.forEach(s => s.lines.forEach(l => allLines.add(l)));

    console.log(`\n✅ Generado ${OUTPUT_FILE}`);
    console.log(`   ${outputStops.length} paradas con líneas útiles`);
    console.log(`   Líneas encontradas: ${Array.from(allLines).sort().join(', ')}`);

    // Verificación: contar paradas por línea
    const countByLine = {};
    outputStops.forEach(s => s.lines.forEach(l => { countByLine[l] = (countByLine[l] || 0) + 1; }));
    console.log('\n📊 Paradas por línea:');
    Object.keys(countByLine).sort().forEach(l => {
        const marker = USEFUL_LINES.includes(l) ? '✅' : '  ';
        console.log(`   ${marker} Línea ${l}: ${countByLine[l]} paradas`);
    });

    // 8. Limpiar
    fs.rmSync(TEMP_DIR, { recursive: true });
    console.log('\n🧹 Archivos temporales eliminados');
}

main().catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
});

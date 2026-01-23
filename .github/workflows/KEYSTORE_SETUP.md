# Configuración de GitHub Secrets

He generado el keystore automáticamente. Ahora necesitas configurar estos **3 secrets** en GitHub:

## Paso 1: Ve a GitHub

1. Abre tu repositorio: https://github.com/Antaneyes/bus-casa-pwa
2. Ve a **Settings** → **Secrets and variables** → **Actions**
3. Haz click en **New repository secret**

## Paso 2: Crea estos 3 secrets

### Secret 1: KEYSTORE_BASE64
- **Name:** `KEYSTORE_BASE64`
- **Value:** Abre el archivo `keystore_base64.txt` que está en `c:\docker\app-bus-casa\` y copia TODO su contenido

### Secret 2: KEYSTORE_PASSWORD
- **Name:** `KEYSTORE_PASSWORD`
- **Value:** `BusCasa2026!`

### Secret 3: KEY_ALIAS
- **Name:** `KEY_ALIAS`
- **Value:** `bus-casa`

## Paso 3: Verifica

Una vez creados los 3 secrets, deberías ver esto en GitHub:
- ✅ KEYSTORE_BASE64 (Updated X seconds ago)
- ✅ KEYSTORE_PASSWORD (Updated X seconds ago)
- ✅ KEY_ALIAS (Updated X seconds ago)

## ⚠️ IMPORTANTE

**NO borres el archivo `bus-casa-release.keystore`** de tu máquina local. Es tu backup por si algo falla.

**NO subas el archivo `.keystore` a GitHub**. Ya está en el `.gitignore`.

Una vez configurados los secrets, todos los APKs futuros tendrán la misma firma y podrás actualizar sin desinstalar.

# Script de despliegue para Bus Casa PWA

Write-Host "🚀 Desplegando Bus Casa PWA..." -ForegroundColor Cyan

# Detener contenedores existentes
Write-Host "`n📦 Deteniendo contenedores existentes..." -ForegroundColor Yellow
docker-compose down

# Construir imagen
Write-Host "`n🔨 Construyendo imagen Docker..." -ForegroundColor Yellow
docker-compose build

# Iniciar contenedores
Write-Host "`n▶️  Iniciando contenedores..." -ForegroundColor Yellow
docker-compose up -d

# Verificar estado
Write-Host "`n✅ Verificando estado..." -ForegroundColor Yellow
docker-compose ps

Write-Host "`n🎉 Despliegue completado!" -ForegroundColor Green
Write-Host "📱 La aplicación está disponible en:" -ForegroundColor Cyan
Write-Host "   - Local: http://localhost:8080" -ForegroundColor White
Write-Host "   - Cloudflare: https://emt.ombi.es" -ForegroundColor White

Write-Host "`n📋 Comandos útiles:" -ForegroundColor Cyan
Write-Host "   Ver logs:     docker-compose logs -f" -ForegroundColor White
Write-Host "   Detener:      docker-compose down" -ForegroundColor White
Write-Host "   Reiniciar:    docker-compose restart" -ForegroundColor White

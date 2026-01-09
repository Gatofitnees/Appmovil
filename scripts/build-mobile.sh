
#!/bin/bash

echo "🚀 Iniciando build para móviles de GatofitAI..."

# Limpiar builds anteriores
echo "🧹 Limpiando builds anteriores..."
rm -rf dist/
rm -rf android/app/src/main/assets/public/
rm -rf ios/App/App/public/

# Generar archivo de sonido de notificaciones
echo "🔊 Generando archivo de sonido de notificaciones..."
python3 scripts/gen-notification-sound.py

# Copiar archivo de sonido al bundle de iOS
echo "📋 Copiando sonido de notificaciones al bundle de iOS..."
cp scripts/notification.wav ios/App/App/notification.wav

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

# Build de la aplicación web
echo "🔨 Construyendo aplicación web..."
npm run build

# Sincronizar con plataformas nativas
echo "📱 Sincronizando con plataformas nativas..."
npx cap sync

# Copy notification sound again after sync (in case sync overwrites it)
echo "📋 Verificando sonido de notificaciones..."
cp scripts/notification.wav ios/App/App/notification.wav

echo "✅ Build completado! Ahora puedes:"
echo "   • Para Android: npx cap open android"
echo "   • Para iOS: npx cap open ios"
echo ""
echo "📖 Consulta MOBILE_BUILD_GUIDE.md para instrucciones detalladas"
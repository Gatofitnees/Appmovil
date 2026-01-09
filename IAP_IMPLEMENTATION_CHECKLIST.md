# 📋 Checklist: Próximos Pasos - Implementación de In-App Purchases

## ✅ Completado en Esta Sesión

- [x] Hook `useInAppPurchase.ts` creado y actualizado con validación de recibos
- [x] Componente `InAppPurchaseButton.tsx` creado 
- [x] `PremiumPlanCard.tsx` actualizado con detección de plataforma
- [x] Funciones Supabase para validación de recibos creadas:
  - [x] `verify-appstore-receipt/index.ts`
  - [x] `verify-playstore-receipt/index.ts`
- [x] Migración Supabase creada para agregar campos de pago
- [x] Guía de configuración `IN_APP_PURCHASES_SETUP.md` creada

## 🔄 Próximos Pasos (Por Orden)

### FASE 1: Configuración de Cuentas & Credenciales (Requiere Acción Manual)

#### Paso 1: Crear Cuenta RevenueCat ✳️ IMPORTANTE
- [ ] Ir a https://www.revenuecat.com/
- [ ] Crear cuenta/login
- [ ] Crear nuevo proyecto "GatoFit"
- [ ] Ir a Settings > API Keys
- [ ] Copiar **Public API Key** (ej: pk_live_xxxxx)
- [ ] Guardar en archivo `.env.local`:
```
VITE_REVENUECAT_API_KEY=pk_live_xxxxx
```

#### Paso 2: Configurar App Store Connect (iOS)
- [ ] Ir a https://appstoreconnect.apple.com
- [ ] Seleccionar App > Subscriptions
- [ ] Crear primer producto:
  - ID: `gatofit_premium_monthly`
  - Precio: $6.50 USD/mes
  - Duración: 1 mes, renovación automática
- [ ] Crear segundo producto:
  - ID: `gatofit_premium_yearly`
  - Precio: $30.00 USD/año
  - Duración: 1 año, renovación automática
- [ ] En Subscriptions > Shared Secret:
  - Copiar "App-Specific Shared Secret"
  - Guardar en `.env.local`:
```
APPLE_SHARED_SECRET=xxxxx
```
- [ ] En RevenueCat:
  - Settings > iOS > Conectar App Store
  - Pegar App-Specific Shared Secret
  - Verificar Bundle ID coincida (com.gatofit.app)

#### Paso 3: Configurar Google Play Console (Android)
- [ ] Ir a https://play.google.com/console
- [ ] Seleccionar App > In-app products > Subscriptions
- [ ] Crear primer producto:
  - ID: `gatofit_premium_monthly`
  - Precio: $6.50 USD/mes
  - Duración: 1 mes, renovación automática
- [ ] Crear segundo producto:
  - ID: `gatofit_premium_yearly`
  - Precio: $30.00 USD/año
  - Duración: 1 año, renovación automática
- [ ] En Settings > API Access:
  - Crear Service Account (si no existe)
  - Descargar JSON key
  - Guardar en `.env.local`:
```
GOOGLE_PACKAGE_NAME=com.gatofit.app
GOOGLE_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'
```
- [ ] En RevenueCat:
  - Settings > Android > Conectar Google Play
  - Pegar Service Account JSON

### FASE 2: Sincronizar Dependencias (Terminal)

```bash
# Ir al directorio del proyecto
cd /Users/gatofit/Documents/gatofit-ai

# Sincronizar Capacitor con iOS
npx cap sync ios

# Sincronizar Capacitor con Android
npx cap sync android

# Copiar archivos de configuración
cp .env.local .env.development
```

### FASE 3: Compilar para Dispositivos

#### Compilar para iOS
```bash
# Buildear para web (necesario antes de Capacitor)
npm run build

# Compilar para iOS
npx cap build ios

# Abrir en Xcode si necesitas configurar signing
open ios/App/App.xcworkspace
```

#### Compilar para Android
```bash
# Build para Android
npm run build
npx cap build android

# Si tienes Android Studio instalado:
open -a "Android Studio" android/
```

### FASE 4: Aplicar Migración Supabase

```bash
# Conectarse a Supabase CLI
supabase link --project-ref xxxxx

# Aplicar migración
supabase migration up
```

O manualmente en Supabase Dashboard:
1. Ir a SQL Editor
2. Copiar contenido de `supabase/migrations/20251212_add_iap_fields_to_subscriptions.sql`
3. Ejecutar query

### FASE 5: Testing en Simuladores

#### Test en iOS Simulator
```bash
# En Xcode:
# 1. Seleccionar iPhone 16 simulator
# 2. Product > Run
# 3. Ir a Settings > Account & Subscriptions > Test IAP
```

#### Test en Android Emulator
```bash
# Desde Android Studio:
# 1. Crear emulator (API 34+)
# 2. Instalar app
# 3. Usar Google Play Billing Test app
```

#### Cuentas de Test

**Apple:**
- Crear en App Store Connect > Sandbox > Test Users
- Email: testuser+xxx@example.com
- Usar en simulator con este account

**Google:**
- Agregar email en Google Play Console > Testers
- El tester puede instalar app y comprar con método de pago real (revierte automáticamente)

### FASE 6: Verificación Final

- [ ] Hook `useInAppPurchase` inicializa correctamente en app nativa
- [ ] Productos cargan desde RevenueCat
- [ ] Botón "Comprar" aparece solo en iOS/Android
- [ ] Compra abre nativo checkout (App Store o Play Store)
- [ ] Después de compra, aparece "Éxito" y se activa premium
- [ ] Database `user_subscriptions` actualiza correctamente
- [ ] Premium features desbloqueadas (si implementadas)
- [ ] Restaurar compras funciona en device nuevo
- [ ] Web sigue usando PayPal

## 📁 Archivos Modificados/Creados

### Creados
- `src/hooks/subscription/useInAppPurchase.ts` - Hook principal con RevenueCat
- `src/components/subscription/InAppPurchaseButton.tsx` - Botón de compra nativo
- `supabase/functions/verify-appstore-receipt/index.ts` - Validación Apple
- `supabase/functions/verify-playstore-receipt/index.ts` - Validación Google
- `supabase/migrations/20251212_add_iap_fields_to_subscriptions.sql` - Schema update
- `IN_APP_PURCHASES_SETUP.md` - Guía completa

### Modificados
- `src/components/subscription/PremiumPlanCard.tsx` - Integración de platform detection

## 🔐 Variables de Entorno Requeridas

```env
# RevenueCat
VITE_REVENUECAT_API_KEY=pk_live_xxxxx

# Apple
APPLE_SHARED_SECRET=xxxxx

# Google
GOOGLE_PACKAGE_NAME=com.gatofit.app
GOOGLE_API_KEY=AIzaSy...
GOOGLE_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'

# Environment
ENVIRONMENT=production
```

## 🧪 Testing Checklist

- [ ] Compra en iOS Simulator con cuenta de test
- [ ] Compra en Android Emulator con cuenta de test
- [ ] Verificar receipt en backend (Supabase functions)
- [ ] Premium features funcionan después de compra
- [ ] Renovación automática funciona (después de 1 mes de test)
- [ ] Cancelación en App Store/Play Store revoca premium
- [ ] Restaurar compras en nuevo device
- [ ] PayPal sigue funcionando en web

## 📊 Monitoreo Post-Launch

### RevenueCat Dashboard
- https://app.revenuecat.com/dashboard
- Ver suscripciones activas en tiempo real
- Analizar churn (cancelaciones)
- Monitorear MRR (Monthly Recurring Revenue)

### App Store Connect
- https://appstoreconnect.apple.com/apps
- View Financial Reports
- Monitor subscription renewals

### Google Play Console  
- https://play.google.com/console
- Financial Reports
- Subscriber Analysis

## ❓ Troubleshooting Común

### "No offerings available" 
→ RevenueCat no conectado a App Store/Google Play. Verificar credentials.

### "Entitlements not active"
→ Recibo no fue validado por Apple/Google. Revisar migración de Supabase.

### Compra success pero premium no se activa
→ Supabase function de validación falló silenciosamente. Ver logs en Supabase.

### PayPal sigue apareciendo en iOS
→ Revisar que `PremiumPlanCard` detecte plataforma correctamente con `Capacitor.getPlatform()`.

## 📞 Recursos de Ayuda

- **RevenueCat Docs**: https://docs.revenuecat.com/docs
- **Capacitor iOS**: https://capacitorjs.com/docs/ios
- **Capacitor Android**: https://capacitorjs.com/docs/android
- **App Store Subscriptions**: https://developer.apple.com/app-store/subscriptions/
- **Google Play Billing**: https://developer.android.com/google/play/billing/

## 🎯 KPIs a Monitorear

- Tasa de conversión (free → premium)
- Número de suscripciones activas
- Churn rate (mensual y anual)
- Ingresos recurrentes mensuales (MRR)
- LTV (Lifetime Value) por usuario
- ARPU (Average Revenue Per User)

---

**Status**: ✅ Código completado | ⏳ Pendiente configuración manual de cuentas
**Siguiente**: Crear cuenta RevenueCat y configurar App Store Connect

# 🛍️ Guía: Implementación de Pagos In-App (App Store & Google Play)

## Visión General

Se ha implementado un sistema completo de pagos in-app que reemplaza completamente PayPal. Los usuarios ahora pueden:
- Comprar suscripciones directamente desde App Store (iOS)
- Comprar suscripciones directamente desde Google Play (Android)
- Los usuarios web seguirán usando PayPal (actualización futura)

## 🔧 Componentes Implementados

### 1. **Hook: `useInAppPurchase.ts`**
- `initializeRevenueCat()` - Inicializar SDK de RevenueCat
- `loadProducts()` - Cargar productos disponibles
- `purchaseProduct()` - Procesar compra
- `checkPremiumStatus()` - Verificar si es premium
- `restorePurchases()` - Restaurar compras anteriores

### 2. **Componente: `InAppPurchaseButton.tsx`**
- Botón de compra que solo aparece en plataformas nativas
- Detecta iOS y Android automáticamente
- Muestra UI solo en app nativa, no en web

### 3. **Actualización: `PremiumPlanCard.tsx`**
- Detecta automáticamente si es plataforma nativa
- En app nativa: muestra `InAppPurchaseButton`
- En web: mantiene PayPal checkout

### 4. **Supabase Functions**
- `verify-appstore-receipt` - Valida recibos de Apple
- `verify-playstore-receipt` - Valida recibos de Google

## 📋 Pasos de Configuración

### Paso 1: Obtener API Key de RevenueCat

1. Ir a https://www.revenuecat.com/
2. Crear cuenta/login
3. Crear proyecto nuevo
4. Ir a Settings > API Keys
5. Copiar Public API Key
6. Guardar en `.env`:
```
VITE_REVENUECAT_API_KEY=pk_live_xxxxx
```

### Paso 2: Configurar App Store Connect (iOS)

1. Ir a https://appstoreconnect.apple.com
2. Seleccionar App > Subscriptions (In-App Purchases)
3. Crear dos productos de suscripción:
   - **ID**: `gatofit_premium_monthly`
     - Precio: $6.50 USD/mes
     - Duración: 1 mes, renovación automática
   
   - **ID**: `gatofit_premium_yearly`
     - Precio: $30.00 USD/año
     - Duración: 1 año, renovación automática

4. En Subscriptions > Shared Secret:
   - Copiar el "App-Specific Shared Secret"
   - Guardar en `.env`:
```
APPLE_SHARED_SECRET=xxxxx
```

5. En RevenueCat:
   - Ir a Project Settings > iOS
   - Conectar App Store
   - Pegar App-Specific Shared Secret
   - Verificar que App ID coincida

### Paso 3: Configurar Google Play Console (Android)

1. Ir a https://play.google.com/console
2. Seleccionar App > In-app products > Subscriptions
3. Crear dos productos de suscripción:
   - **ID**: `gatofit_premium_monthly`
     - Precio: $6.50 USD/mes
     - Duración: 1 mes, renovación automática
   
   - **ID**: `gatofit_premium_yearly`
     - Precio: $30.00 USD/año
     - Duración: 1 año, renovación automática

4. En Settings > API Access:
   - Crear Service Account
   - Descargar JSON key
   - En RevenueCat > Project Settings > Android:
     - Conectar Google Play
     - Pegar Service Account JSON

5. Guardar credenciales en `.env`:
```
GOOGLE_PACKAGE_NAME=com.gatofit.app
GOOGLE_API_KEY=AIzaSy...
GOOGLE_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'
```

### Paso 4: Actualizar capacitor.config.ts

```typescript
const config: CapacitorConfig = {
  // ... existing config
  plugins: {
    // ... other plugins
    RevenueCat: {
      apiKey: process.env.VITE_REVENUECAT_API_KEY || '',
    }
  }
};
```

### Paso 5: Sincronizar y Compilar

```bash
# Sincronizar dependencias
npx cap sync ios
npx cap sync android

# Compilar para iOS
npm run build
npx cap build ios

# Compilar para Android
npm run build
npx cap build android
```

## 🔄 Flujo de Compra

```
Usuario toca botón "Comprar ahora" 
    ↓
Detecta plataforma (iOS/Android/Web)
    ↓
iOS/Android: RevenueCat abre nativa checkout
    ↓
Usuario completa pago en App Store/Play Store
    ↓
RevenueCat valida el recibo
    ↓
App sincroniza con Supabase
    ↓
Backend verifica el recibo con Apple/Google
    ↓
Marca usuario como Premium
    ↓
Muestra éxito y activa features
```

## 📱 IDs de Productos

| Plan | iOS ID | Android ID | Precio |
|------|--------|-----------|--------|
| Monthly | `gatofit_premium_monthly` | `gatofit_premium_monthly` | $6.50/mes |
| Yearly | `gatofit_premium_yearly` | `gatofit_premium_yearly` | $30/año |

## 🛡️ Validación de Recibos (Backend)

### Apple App Store
- RevenueCat maneja automáticamente
- Fallback: `verify-appstore-receipt` function
- Valida con Apple servers

### Google Play
- RevenueCat maneja automáticamente
- Fallback: `verify-playstore-receipt` function
- Valida con Google servers

## ✅ Checklist de Implementación

- [x] Hook `useInAppPurchase` creado
- [x] Componente `InAppPurchaseButton` creado
- [x] `PremiumPlanCard` actualizado
- [x] Funciones Supabase creadas
- [ ] RevenueCat account configurada
- [ ] App Store Connect productos creados
- [ ] Google Play productos creados
- [ ] `.env` variables configuradas
- [ ] `capacitor.config.ts` actualizado
- [ ] Compilar y testear en dispositivos reales

## 🧪 Testing

### Test en Simulator (iOS)

```bash
# Compilar para simulator
npm run build
npx cap run ios

# En Xcode:
# Features > Scheme > Edit Scheme > Run > Pre-actions
# Agregar script: defaults write com.apple.dt.Xcode IDESourceTreeDisplayNames -dict-add SRCROOT "SOURCE_ROOT"
```

### Test en Emulator (Android)

```bash
npm run build
npx cap run android
```

### Cuentas de Test

**Apple:**
- App Store Connect > Sandbox > Test Users
- Crear usuario de test
- Usar en dispositivo para compras de test

**Google:**
- Google Play Console > Testers
- Agregar email como tester
- Instalar app vía Play Store en fase de test

## 🚀 Próximos Pasos

1. **Setup RevenueCat**: Crear cuenta y obtener API keys
2. **Setup App Store**: Crear productos y configurar
3. **Setup Google Play**: Crear productos y configurar
4. **Llenar `.env`**: Configurar todas las variables
5. **Test End-to-End**: Probar compras en devicess reales
6. **Monitor Subscriptions**: Usar dashboards de RevenueCat y tiendas
7. **Renovación de Recibos**: Implementar validación periódica

## 📊 Monitoreo

### RevenueCat Dashboard
- https://app.revenuecat.com
- Ver suscripciones activas
- Analizar MRR (Monthly Recurring Revenue)
- Monitorear renovaciones y cancelaciones

### App Store Connect
- https://appstoreconnect.apple.com
- Ver ingresos
- Analizar retención

### Google Play Console
- https://play.google.com/console
- Ver ingresos
- Analizar churn

## ⚠️ Consideraciones Importantes

1. **Precios**: Los precios en App Stores deben coincidir con los que ofreces
2. **Impuestos**: Cada tienda maneja impuestos automáticamente
3. **Comisiones**: Apple y Google toman 15-30% de comisión
4. **Renovación**: Automática si el usuario no cancela
5. **Cancelación**: Usuario cancela directamente en App Store Settings
6. **Sincronización**: Backend valida cada recibo con las tiendas

## 🔗 Referencias

- RevenueCat Docs: https://docs.revenuecat.com
- Apple StoreKit: https://developer.apple.com/storekit/
- Google Play Billing: https://developer.android.com/google/play/billing
- Capacitor iOS: https://capacitorjs.com/docs/ios
- Capacitor Android: https://capacitorjs.com/docs/android

## 📞 Soporte

Para problemas con:
- **RevenueCat**: https://support.revenuecat.com
- **Apple**: https://developer.apple.com/support
- **Google**: https://support.google.com/googleplay/android-developer

---

**Status**: ✅ Código implementado, pendiente configuración de tiendas y testing

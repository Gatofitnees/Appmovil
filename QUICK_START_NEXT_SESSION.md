# ⚡ QUICK START: Próxima Sesión

**¿Qué hacer ahora?** → Ir a paso 1  
**¿Donde estamos?** → 40% completado (código 100%, config 0%)  
**¿Cuánto falta?** → ~3 horas para production-ready

---

## ⏱️ Top Priority (Do This First!)

### 🔴 Paso 1: RevenueCat Account (15 min)

1. Ir a https://www.revenuecat.com
2. Click "Sign Up"
3. Crear cuenta con tu email
4. Crear proyecto llamado "GatoFit"
5. Ir a **Settings > API Keys**
6. Copiar la **Public API Key** que empieza con `pk_live_`
7. En el proyecto, abrir `.env.local` y agregar:
```
VITE_REVENUECAT_API_KEY=pk_live_xxxxx_aqui
```

**Si no tienes `.env.local`**, crear archivo en raiz del proyecto.

---

## 🟣 Paso 2: App Store Connect (30 min)

1. Ir a https://appstoreconnect.apple.com
2. Seleccionar tu app GatoFit
3. Ir a **In-App Purchases**
4. Click "+"
5. **Crear primer producto:**
   - Tipo: Renewable Subscription
   - Reference Name: Premium Monthly
   - Product ID: `gatofit_premium_monthly`
   - Duration: 1 Month
   - Price: $6.50 USD
   - Localizations: Dejar en inglés por ahora
   - Click Save
   
6. **Crear segundo producto:**
   - Tipo: Renewable Subscription  
   - Reference Name: Premium Yearly
   - Product ID: `gatofit_premium_yearly`
   - Duration: 1 Year
   - Price: $30.00 USD
   - Localizations: Dejar en inglés
   - Click Save

7. Ir a **Subscriptions > Shared Secret**
8. Copiar el "App-Specific Shared Secret" (empieza con letras)
9. En `.env.local` agregar:
```
APPLE_SHARED_SECRET=xxxxx_aqui
```

10. En RevenueCat, ir a **Settings > iOS**
11. Click "Connect App Store"
12. Pegar el Shared Secret
13. Verificar que Bundle ID coincida (com.gatofit.app)

---

## 🔵 Paso 3: Google Play Console (30 min)

1. Ir a https://play.google.com/console
2. Seleccionar tu app GatoFit
3. Ir a **Monetize > Products > In-app products > Subscriptions**
4. Click "Create subscription"
5. **Crear primer producto:**
   - Subscription ID: `gatofit_premium_monthly`
   - Default price: $6.50 USD
   - Billing period: Monthly
   - Click Create
   - Dejar en Draft (no publish aún)

6. Click "Create subscription" de nuevo
7. **Crear segundo producto:**
   - Subscription ID: `gatofit_premium_yearly`
   - Default price: $30.00 USD
   - Billing period: Yearly
   - Click Create
   - Dejar en Draft

8. Ir a **All products > Create new subscription**... espera, ya creamos
9. Ir a **Settings > API access**
10. Click "Create new service account"
11. Descargar el JSON key
12. Guardar ese JSON en `.env.local`:
```
GOOGLE_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"..."}'
```
También agregar:
```
GOOGLE_PACKAGE_NAME=com.gatofit.app
```

13. En RevenueCat, ir a **Settings > Android**
14. Click "Connect Google Play"
15. Pegar el Service Account JSON

---

## 🟢 Paso 4: Aplicar Migración (5 min)

En terminal:
```bash
cd /Users/gatofit/Documents/gatofit-ai

# Opción A: Si tienes Supabase CLI
supabase link --project-ref xxxxx
supabase migration up

# Opción B: Manual via Dashboard
# 1. https://app.supabase.com → Select Project
# 2. SQL Editor → New query
# 3. Copiar contenido de: supabase/migrations/20251212_add_iap_fields_to_subscriptions.sql
# 4. Click "Run"
```

---

## ✅ Verificación Checklist

- [ ] RevenueCat account creado
- [ ] API Key guardada en .env.local
- [ ] App Store: 2 productos creados
- [ ] App Store: Shared Secret guardado
- [ ] Google Play: 2 productos creados
- [ ] Google Play: Service Account JSON guardado
- [ ] Supabase: Migración aplicada
- [ ] RevenueCat: iOS conectado
- [ ] RevenueCat: Android conectado

**Si todo está checked** → IR A TESTING

---

## 🧪 Testing (1.5 horas)

### iOS Simulator

```bash
# Build
npm run build
npx cap run ios

# En Xcode:
# 1. Seleccionar iPhone 16 simulator
# 2. Click Run (Play button)

# En la app:
# 1. Ir a Planes/Premium
# 2. Ver que aparece botón "Comprar Ahora"
# 3. Hacer click
# 4. Se debe abrir App Store nativo
# 5. Usar cuenta de test
```

### Android Emulator

```bash
# Build
npm run build
npx cap run android

# En Android Studio:
# 1. Crear emulator (API 34+)
# 2. Click Run

# En la app:
# 1. Ir a Planes/Premium
# 2. Ver que aparece botón "Comprar Ahora"
# 3. Hacer click
# 4. Se debe abrir Google Play checkout nativo
# 5. Usar cuenta de test
```

### Web (PayPal - debe seguir funcionando)

```bash
npm run dev

# En browser:
# 1. Ir a Planes/Premium
# 2. Ver que aparece botón "Comprar con PayPal"
# 3. IAP button NO debe aparecer
```

---

## 🐛 Si Hay Errores

### Error: "No offerings available"
- Verificar RevenueCat API Key en .env.local
- Verificar que productos están creados en tiendas
- Verificar que RevenueCat está conectado a tiendas

### Error: "Producto no encontrado"
- Verificar IDs:
  - Esperado: `gatofit_premium_monthly` y `gatofit_premium_yearly`
  - En tiendas deben coincidir exactamente

### Error: "Entitlements not active"
- Verificar que producto está en categoría "Subscriptions" (no "Consumable")
- Verificar que suscripción está configurada para renovación automática

### Error: Compra success pero premium no aparece
- Ver logs en Supabase
- Verificar que migración fue aplicada
- Revisar que receipt validation function se ejecutó

---

## 📁 Archivos Clave

| Archivo | Propósito |
|---------|-----------|
| `.env.local` | Credenciales (crear si no existe) |
| `src/hooks/subscription/useInAppPurchase.ts` | Hook principal |
| `src/components/subscription/InAppPurchaseButton.tsx` | Botón IAP |
| `src/components/subscription/PremiumPlanCard.tsx` | Tarjeta (modificada) |
| `supabase/migrations/20251212_...sql` | Schema update |

---

## 🚀 Después de Testing

Si todo funciona:

```bash
# Build para App Store
npm run build
npx cap build ios
# Upload a App Store Connect (Xcode)

# Build para Google Play
npm run build
npx cap build android
# Upload a Google Play Console
```

---

## 💬 Notas Importantes

1. **`.env.local` es local**, no se sube a git (está en .gitignore)
2. **Test accounts**: Usar cuentas de test en tiendas, no cuentas reales
3. **Precios**: Asegurar que coincidan en todas partes ($6.50 monthly, $30 yearly)
4. **Building**: Los builds toman 5-10 min cada uno
5. **PayPal sigue funcionando**: No tocar el código existente de PayPal
6. **Premium features**: Ya deben estar implementadas en la app (si no, hacer eso después)

---

## 🎯 Timeline Estimado

| Tarea | Tiempo | Status |
|-------|--------|--------|
| RevenueCat setup | 15 min | Necesario |
| App Store setup | 30 min | Necesario |
| Google Play setup | 30 min | Necesario |
| Supabase migration | 5 min | Necesario |
| Compilar + test iOS | 45 min | Validación |
| Compilar + test Android | 45 min | Validación |
| **TOTAL** | **2.5 hrs** | |

---

## ❓ Dudas?

Ver estos archivos para más detalles:
- `IN_APP_PURCHASES_SETUP.md` - Guía completa
- `IAP_IMPLEMENTATION_CHECKLIST.md` - Checklist detallado
- `IAP_STATUS_REPORT.md` - Status report completo

---

**Listo para empezar?** → Ir al Paso 1 de arriba ⬆️

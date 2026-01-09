# 🍎 Configuración de App Store Connect - ACTUALIZADA

**Fecha**: 15 de Diciembre de 2024  
**Estado**: ✅ Productos configurados en App Store Connect

---

## 📱 Productos de Suscripción Configurados

### Suscripción Mensual
- **Product ID**: `SUSCRIPCION_MENSUAL`
- **Apple ID**: `6756597845`
- **Duración**: 1 mes (renovación automática)
- **Precio**: Por configurar en App Store Connect
- **Estado**: ✅ Creado en App Store Connect

### Suscripción Anual
- **Product ID**: `SUSCRIPCION_ANUAL`
- **Apple ID**: `6756597955`
- **Duración**: 1 año (renovación automática)
- **Precio**: Por configurar en App Store Connect
- **Estado**: ✅ Creado en App Store Connect

---

## 🔧 Cambios Aplicados en el Código

### Archivos Actualizados:

1. **`src/components/subscription/InAppPurchaseButton.tsx`**
   - Product IDs actualizados:
     - Mensual: `SUSCRIPCION_MENSUAL` (antes: `gatofit_premium_monthly`)
     - Anual: `SUSCRIPCION_ANUAL` (antes: `gatofit_premium_yearly`)

2. **`src/hooks/subscription/useInAppPurchase.ts`**
   - Detección de plan_type actualizada para reconocer `ANUAL` en el ID
   - Mantiene compatibilidad con IDs antiguos

3. **`.env`**
   - RevenueCat API Key agregada:
     - `VITE_REVENUECAT_API_KEY="test_vqFjnLpSVlVGZLUtRezZkYcjzaY"`

---

## ✅ Checklist de Configuración

- [x] Product IDs configurados en App Store Connect
- [x] Apple IDs asignados
- [x] Código actualizado con nuevos IDs
- [x] RevenueCat API Key configurada en `.env`
- [ ] Shared Secret de App Store configurado (pendiente)
- [ ] Productos conectados a RevenueCat (pendiente)
- [ ] Precios configurados en App Store Connect (pendiente)
- [ ] Testing en simulador iOS (pendiente)

---

## 🔄 Próximos Pasos

### 1. Configurar Shared Secret (5 min)
1. Ir a App Store Connect
2. Subscriptions > Shared Secret
3. Copiar el "App-Specific Shared Secret"
4. Agregarlo al archivo `.env`:
```bash
APPLE_SHARED_SECRET=tu_shared_secret_aqui
```

### 2. Configurar Precios en App Store Connect (10 min)
1. Ir a cada producto en App Store Connect
2. Configurar precio:
   - Mensual: $6.50 USD (sugerido)
   - Anual: $30.00 USD (sugerido)
3. Configurar localizaciones (mínimo inglés)
4. Guardar cambios

### 3. Conectar a RevenueCat (10 min)
1. Ir a RevenueCat Dashboard
2. Settings > iOS
3. Click "Connect App Store"
4. Pegar el Shared Secret
5. Agregar los Product IDs:
   - `SUSCRIPCION_MENSUAL`
   - `SUSCRIPCION_ANUAL`
6. Verificar que Bundle ID coincida: `com.gatofit.app`

### 4. Crear Offerings en RevenueCat (10 min)
1. En RevenueCat Dashboard
2. Products > Offerings
3. Crear offering "Default"
4. Agregar packages:
   - Monthly: `SUSCRIPCION_MENSUAL`
   - Yearly: `SUSCRIPCION_ANUAL`
5. Activar el offering

---

## 🧪 Testing

### En Simulador iOS
```bash
# Build y ejecutar
npm run build
npx cap run ios

# En Xcode:
# 1. Seleccionar simulador iPhone 16
# 2. Product > Run
# 3. Ir a Planes/Premium
# 4. Verificar que aparecen los productos
# 5. Intentar compra (usar sandbox account)
```

#### Alternativa sin App Store en simulador (StoreKit Configuration)
El simulador no permite iniciar sesión con App Store. Para simular compras:

- En Xcode: File → New → File… → StoreKit Configuration File → nómbralo `Gatofit.storekit`.
- Ábrelo y crea 2 productos:
   - Auto‑Renewable Subscription `SUSCRIPCION_MENSUAL` (duración 1 mes).
   - Auto‑Renewable Subscription `SUSCRIPCION_ANUAL` (duración 1 año).
- Crea un Subscription Group y asigna ambos productos al grupo.
- Edit Scheme → pestaña Options → StoreKit Configuration → selecciona `Gatofit.storekit`.
- Ejecuta la app en el simulador y prueba la compra. No requiere iniciar sesión.

Notas:
- RevenueCat seguirá cargando el Offering con la clave `appl_` y hará checkout contra el StoreKit simulado.
- Asegúrate de que los IDs en el `.storekit` coincidan EXACTAMENTE con `SUSCRIPCION_MENSUAL` y `SUSCRIPCION_ANUAL`.

### Cuentas de Test
- Crear en App Store Connect > Users and Access > Sandbox Testers
- Usar email diferente al de tu Apple ID
- Formato: `test+ios@example.com`

### En Dispositivo Real (Sandbox)
- Ajustes → App Store → al final "Sandbox Account" → inicia sesión con el tester.
- Ejecuta desde Xcode en el dispositivo (Debug). Abre Premium y compra.
- Si ves mensajes "No active account", verifica que la cuenta sandbox esté iniciada y que App Store Connect tenga precios configurados.

---

## 📊 Mapeo de IDs

| Tipo | Product ID | Apple ID | RevenueCat Package |
|------|-----------|----------|-------------------|
| Mensual | `SUSCRIPCION_MENSUAL` | 6756597845 | Monthly |
| Anual | `SUSCRIPCION_ANUAL` | 6756597955 | Yearly |

---

## ⚠️ Notas Importantes

1. **Product IDs son case-sensitive**: Asegúrate de usar exactamente `SUSCRIPCION_MENSUAL` y `SUSCRIPCION_ANUAL` en mayúsculas
2. **Apple IDs son únicos**: No se pueden reutilizar si eliminas un producto
3. **Testing requiere sandbox account**: No usar tu Apple ID personal
4. **Precios**: Deben estar configurados antes de poder testear
5. **RevenueCat**: Los productos deben estar conectados y en un offering activo

---

## 🔍 Verificación de Código

El código ya está actualizado para usar los nuevos IDs. Puedes verificar:

```typescript
// src/components/subscription/InAppPurchaseButton.tsx
const productId = planType === 'yearly' 
  ? 'SUSCRIPCION_ANUAL'      // ✅ Actualizado
  : 'SUSCRIPCION_MENSUAL';   // ✅ Actualizado

// src/hooks/subscription/useInAppPurchase.ts
plan_type: productId.includes('ANUAL') || productId.includes('yearly') 
  ? 'yearly' 
  : 'monthly',  // ✅ Detecta ambos formatos
```

---

## 📞 Si Hay Problemas

### Error: "Product not found"
- Verificar que los IDs en RevenueCat coincidan exactamente
- Verificar que los productos estén en un offering activo
- Verificar que el offering sea el "current offering"

### Error: "No offerings available"
- Verificar API Key de RevenueCat en `.env`
- Verificar que App Store esté conectado en RevenueCat
- Verificar que los productos tengan precios configurados

### Productos no aparecen en la app
- Verificar que `RevenueCat.configure()` se llame al inicio
- Verificar logs en consola para errores
- Verificar que estés en un device/simulador iOS (no web)

---

**Estado Actual**: ✅ Código actualizado y listo  
**Próximo Paso**: Configurar Shared Secret y precios en App Store Connect

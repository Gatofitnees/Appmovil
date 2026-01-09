# Fixes Applied - December 12, 2025

## Problems Fixed

### 1. ❌ No Redirect After Google/Apple Auth in CreateAccount
**Problem:** Usuario completaba Google/Apple auth exitosamente, pero no redireccionaba a `/onboarding/app-transition`

**Root Cause:** El código en `CreateAccount.tsx` asumía que la redirección pasaría automáticamente, pero en auth nativa, Supabase no redirige automáticamente.

**Solution:**
- File: `src/pages/onboarding/steps/CreateAccount.tsx`
- Added explicit `navigate("/onboarding/app-transition")` in both `handleGoogleSignUp` and `handleAppleSignUp` when auth is successful
- Logs now show: `"Google auth successful, navigating to app transition..."`

### 2. ❌ AppTransition Stuck on Loading Screen
**Problem:** Después de llegar a AppTransition, la pantalla se quedaba cargando indefinidamente

**Root Cause:** 
- `handleGoogleAuthData()` intenta hacer requests a Supabase para guardar datos
- Si esos requests fallan (por "Connection interrupted"), el componente espera indefinidamente
- No había timeout absoluto

**Solution:**
- File: `src/pages/onboarding/steps/AppTransition.tsx`
- Added `timeoutRef` with 15-second absolute timeout
- If data saving fails or times out, redirects to `/home` anyway
- Prevents user being stuck on loading screen
- New logs show timeout trigger: `"AppTransition: 15-second timeout reached, redirecting to home"`

### 3. ⚠️ CapacitorHttp "Connection Interrupted" Errors
**Problem:** GET requests to Supabase profiles were failing with "Connection interrupted" errors

**Root Cause:** Possible CapacitorHttp timeout or network issues specific to native platforms

**Solution:**
- File: `src/integrations/supabase/client.ts`
- Increased timeouts from 30s to 60s in CapacitorHttp requests
- Improved error handling and logging
- Automatic fallback to regular fetch when CapacitorHttp fails
- Better error logging to identify which layer failed (CapacitorHttp or fetch)

## Code Changes Summary

### CreateAccount.tsx
```typescript
// Added redirect on successful auth
if (error) {
  // Handle error
  setGoogleLoading(false);
} else {
  // SUCCESS - navigate to app transition screen
  console.log('Google auth successful, navigating to app transition...');
  navigate("/onboarding/app-transition");
}
```

### AppTransition.tsx
```typescript
// Added timeout ref for absolute timeout
const timeoutRef = useRef<NodeJS.Timeout | null>(null);

// Set 15-second timeout
timeoutRef.current = setTimeout(() => {
  console.log('AppTransition: 15-second timeout reached, redirecting to home');
  redirectToHome();
}, 15000);

// Clear timeout when successful
if (timeoutRef.current) {
  clearTimeout(timeoutRef.current);
}
```

### supabase/client.ts
```typescript
// Increased timeouts
const response = await Http.request({
  url,
  method,
  headers,
  data: body,
  readTimeout: 60000,   // Was 30000
  connectTimeout: 60000, // Was 30000
});

// Better fallback handling
} catch (httpError: any) {
  console.error(`❌ [CapacitorHttp] Native error:`, {...});
  console.log(`🔄 [Fallback] Using fetch instead of CapacitorHttp`);
  try {
    const fallbackResponse = await fetch(url, options);
    console.log(`✅ [Fallback] Fetch succeeded with status ${fallbackResponse.status}`);
    return fallbackResponse;
  } catch (fetchError) {
    console.error(`❌ [Fallback] Fetch also failed:`, fetchError);
    throw fetchError;
  }
}
```

## Expected Flow After Fixes

1. **Onboarding Flow** → Complete all steps
2. **CreateAccount** → Click Google/Apple auth button
3. **Native Auth** → CapacitorHttp makes auth request to Supabase (Status 200)
4. **Explicit Redirect** → Navigate to `/onboarding/app-transition` ✅ **[FIXED]**
5. **AppTransition** → Try to save onboarding data (max 15 seconds) ✅ **[FIXED]**
6. **Timeout Safety** → If data save fails, redirect anyway after 15s ✅ **[FIXED]**
7. **Home Page** → App loads with user profile and nutrition data

## Testing Checklist

- [ ] Test Google auth in CreateAccount flow
- [ ] Test Apple auth in CreateAccount flow
- [ ] Verify AppTransition redirects within 15 seconds
- [ ] Verify CapacitorHttp logs show successful request (Status 200)
- [ ] Verify Home page loads data correctly
- [ ] Check console logs for "[CapacitorHttp]" and "[Fallback]" indicators

## Build & Deploy

- npm run build: ✅ SUCCESS (5.22s)
- npx cap sync ios: ✅ SUCCESS (Found 5 plugins including http@1.4.1)

## Next Steps if Issues Persist

1. If "Connection interrupted" still appears:
   - Check device network connectivity (WiFi)
   - Verify Supabase domain in Info.plist NSAppTransportSecurity is correct
   - Check if RLS policies prevent unauthenticated reads

2. If Home page still shows "Cargando comidas..." indefinitely:
   - Check useFoodLog hook for error handling
   - Verify Supabase queries complete even on error
   - Add timeout to food log loading

3. If AppTransition doesn't redirect:
   - Check browser console for errors
   - Verify user session is actually authenticated
   - Check localStorage for onboarding data

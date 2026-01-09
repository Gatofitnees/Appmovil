# Configuración de Sonido para Notificaciones iOS - Solución Final

## Problema Identificado
Las notificaciones en iOS se entregaban correctamente pero **no producían sonido** a pesar de tener:
- ✅ Configuración de `AppDelegate.swift` con UNUserNotificationCenterDelegate
- ✅ Configuración de AVAudioSession
- ✅ Info.plist con permisos de sonido
- ✅ Frameworks linkedidos (UserNotifications, AVFoundation)

## Raíz del Problema
Según la investigación de la documentación oficial de Capacitor LocalNotifications v7:

1. **Android**: El `sound` en la configuración global (`capacitor.config.ts`) SI aplica
2. **iOS**: El `sound` en la configuración global NO aplica - debe especificarse por CADA notificación
3. **iOS + Capacitor**: Si NO especificas `sound` en la notificación, iOS **NO producirá sonido**
4. **iOS + Capacitor**: Si especificas `sound: 'default'`, Capacitor intenta buscar un archivo llamado "default.wav" en el bundle

## Solución Implementada

### Paso 1: Generar Archivo de Sonido
Se creó un script Python que genera un archivo WAV de notificación:
- **Archivo**: `scripts/gen-notification-sound.py`
- **Salida**: `scripts/notification.wav`
- **Duración**: 0.5 segundos (recomendado para notificaciones)
- **Frecuencia**: 800 Hz (tono agradable)
- **Formato**: WAV 16-bit PCM, 44.1 kHz, Mono

### Paso 2: Agregar Sonido al Bundle de iOS
- Se copia automáticamente a `ios/App/App/notification.wav` durante el build
- El archivo se copia nuevamente después de `cap sync` para evitar que sea sobrescrito

### Paso 3: Referenciar el Sonido en las Notificaciones
Se actualizaron 3 archivos para usar `sound: 'notification'`:

#### a) `src/hooks/useDailyNotifications.ts`
```typescript
const iosWorkoutConfig = {
  // ... otras propiedades
  sound: 'notification',  // Referencia al archivo notification.wav
};

const iosMealConfig = {
  // ... otras propiedades
  sound: 'notification',  // Referencia al archivo notification.wav
};
```

#### b) `src/features/workout/hooks/useRestTimer.ts`
```typescript
await LocalNotifications.schedule({
  notifications: [
    {
      // ... otras propiedades
      sound: 'notification',  // Referencia al archivo notification.wav
    }
  ]
});
```

### Paso 4: Configuración de Xcode
El archivo `notification.wav` está ubicado en:
- `ios/App/App/notification.wav`

**Nota**: El archivo debe estar en el directorio raíz del app bundle para que Capacitor LocalNotifications v7 lo encuentre.

### Paso 5: Build Automation
El script `scripts/build-mobile.sh` ahora automatiza todo:
```bash
# 1. Genera el archivo de sonido
python3 scripts/gen-notification-sound.py

# 2. Lo copia al bundle de iOS
cp scripts/notification.wav ios/App/App/notification.wav

# 3. Construye la app
npm run build

# 4. Sincroniza con iOS
npx cap sync ios

# 5. Verifica y copia nuevamente (post-sync)
cp scripts/notification.wav ios/App/App/notification.wav
```

## Verificación de la Solución

### Checklist de Verificación
- [x] Archivo `scripts/notification.wav` generado (44144 bytes)
- [x] Archivo copiado a `ios/App/App/notification.wav`
- [x] `useDailyNotifications.ts` usando `sound: 'notification'`
- [x] `useRestTimer.ts` usando `sound: 'notification'`
- [x] `AppDelegate.swift` configurado correctamente
- [x] `Info.plist` con permisos de sonido
- [x] Frameworks linked (UserNotifications, AVFoundation)
- [x] AVAudioSession configurada en AppDelegate
- [x] Build completado exitosamente
- [x] Sync de Capacitor completado

### Cómo Probar
1. Compilar la app iOS: `npm run build && npx cap sync ios && npx cap open ios`
2. En Xcode, compilar y ejecutar en un dispositivo
3. Las notificaciones NOW **DEBERÍAN SONAR** cuando se entreguen
4. Probar:
   - Notificaciones diarias (12pm y 6pm)
   - Notificaciones de fin de descanso (rest timer)
   - Notificaciones en foreground y background

## Archivos Modificados/Creados
1. ✅ `scripts/gen-notification-sound.py` - Genera el archivo WAV
2. ✅ `scripts/notification.wav` - Archivo de sonido de notificación
3. ✅ `ios/App/App/notification.wav` - Copia en el bundle
4. ✅ `ios/post-sync-hook.sh` - Script de post-sync
5. ✅ `scripts/add-notification-sound-to-xcode.sh` - Verificación
6. ✅ `scripts/build-mobile.sh` - Build automation actualizado
7. ✅ `src/hooks/useDailyNotifications.ts` - Actualizado con `sound`
8. ✅ `src/features/workout/hooks/useRestTimer.ts` - Actualizado con `sound`

## Información Técnica Adicional

### Documentación de Referencia
- [Capacitor LocalNotifications v7](https://capacitorjs.com/docs/apis/local-notifications)
- [Apple UNNotificationSound](https://developer.apple.com/documentation/usernotifications/unnotificationsound)
- [iOS Notification Sound Requirements](https://developer.apple.com/library/archive/qa/qa1519/_index.html)

### Limitaciones de iOS para Sonidos de Notificación
- El archivo de sonido DEBE ser < 30 segundos
- Formatos soportados: WAV, CAF, AIFF (Linear PCM, ADPCM, µLaw, aLaw)
- El archivo debe estar en el app bundle o en `/Library/Sounds` del container
- No se pueden usar sonidos del sistema directamente (a menos que haya un archivo físico)

### Por Qué Funciona Esta Solución
1. **Archivo Físico**: En lugar de confiar en identificadores abstractos, tenemos un archivo WAV real
2. **Ubicación Correcta**: El archivo está en el app bundle donde Capacitor puede encontrarlo
3. **Nombre Correcto**: El archivo se llama `notification.wav` y se refencia como `sound: 'notification'`
4. **AppDelegate Correcto**: El handler `willPresent` devuelve `.sound` en las opciones de presentación
5. **AVAudioSession**: Configurada para permitir reproducción de audio

## Próximos Pasos (Opcional)
- Considerar agregar múltiples sonidos diferentes para diferentes tipos de notificaciones
- Permitir que el usuario seleccione diferentes sonidos en Settings
- Optimizar el archivo de sonido para un tamaño más pequeño (convertir a ADPCM)

## Soporte Futuro
Si las notificaciones siguen sin sonar después de esta configuración:
1. Verificar los logs de XCode durante la ejecución
2. Revisar que el dispositivo NO esté en modo silencioso
3. Verificar que el volumen del dispositivo esté al máximo
4. Comprobar en Settings > Notifications que el app tiene permiso de sonido

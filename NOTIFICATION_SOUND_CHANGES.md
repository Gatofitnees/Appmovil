# Cambios Realizados para Habilitar Sonido en Notificaciones iOS

## Resumen Ejecutivo
Se implementó una solución completa para producir sonido en notificaciones iOS. El problema era que Capacitor LocalNotifications v7 requiere un archivo de sonido físico que exista en el app bundle, no solo una configuración abstracta.

## 1. Archivos Creados

### Scripts de Generación de Sonido
- **`scripts/gen-notification-sound.py`** - Genera archivo WAV de notificación
- **`scripts/notification.wav`** - Archivo de sonido (44144 bytes)
- **`ios/App/App/notification.wav`** - Copia en el bundle de iOS
- **`ios/post-sync-hook.sh`** - Hook post-sync de Capacitor
- **`scripts/add-notification-sound-to-xcode.sh`** - Verificación de Xcode

### Documentación
- **`NOTIFICATION_SOUND_SETUP.md`** - Guía completa de la solución

## 2. Archivos Modificados

### a) `scripts/build-mobile.sh`
**Cambios**: Agregados pasos de generación y copia de sonido
- Genera `notification.wav` antes del build
- Copia el archivo al bundle iOS después del sync
- Verifica que el archivo esté en su lugar

### b) `src/hooks/useDailyNotifications.ts`
**Cambios**: Agregada propiedad `sound: 'notification'`
```diff
  const iosWorkoutConfig = {
    // ... propiedades existentes
+   sound: 'notification',
  };
  
  const iosMealConfig = {
    // ... propiedades existentes
+   sound: 'notification',
  };
```

### c) `src/features/workout/hooks/useRestTimer.ts`
**Cambios**: Agregada propiedad `sound: 'notification'`
```diff
  await LocalNotifications.schedule({
    notifications: [
      {
        // ... propiedades existentes
+       sound: 'notification',
      }
    ]
  });
```

### d) `ios/App/Podfile`
**Cambios**: Agregado post_install script mejorado
- Explicación del post_install hook para frameworks

## 3. Configuración Mantenida

Las siguientes configuraciones ya estaban correctas y se mantienen:

### `ios/App/App/AppDelegate.swift`
- ✅ UNUserNotificationCenterDelegate implementado
- ✅ `willPresent` devuelve `.sound, .banner, .badge`
- ✅ AVAudioSession configurada con `.ambient`
- ✅ Permisos de sonido en `requestPermissions`

### `ios/App/App/Info.plist`
- ✅ `UIUserNotificationSoundSetting` = Habilitado
- ✅ `UIUserNotificationAlertSetting` = Habilitado
- ✅ `UIUserNotificationType` = Sonido, Alerta, Badge

### `capacitor.config.ts`
- ✅ LocalNotifications plugin configurado
- ✅ Nota: `sound: 'default'` es solo para Android (no afecta iOS)

## 4. Flujo de Ejecución

### Durante Build (`npm run build && npx cap sync ios`)
1. `npm run build` - Compila la app web
2. `npx cap sync ios` - Sincroniza con iOS
3. Script `build-mobile.sh` verifica/copia `notification.wav`

### Durante Ejecución
1. App solicita permisos de notificación
2. Cuando se programa una notificación con `sound: 'notification'`
3. Capacitor LocalNotifications busca `notification.wav` en el app bundle
4. iOS reproduce el sonido usando AVAudioSession configurada en AppDelegate

## 5. Verificación de la Solución

### Checklist Completado
- [x] Archivo WAV generado correctamente (44144 bytes, 0.5s, 800Hz)
- [x] Archivo copiado a `ios/App/App/notification.wav`
- [x] Archivos TypeScript actualizados con `sound: 'notification'`
- [x] AppDelegate.swift configurado (sin cambios necesarios)
- [x] Info.plist tiene permisos de sonido (sin cambios necesarios)
- [x] Build y Sync completados exitosamente
- [x] Documentación actualizada

### Build Output
```
✓ vite built in 5.01s
✔ Copying web assets from dist to ios/App/App/public
✔ Creating capacitor.config.json
✔ Updating iOS plugins
✔ Updating iOS native dependencies with pod install
✔ update ios in 3.97s
[info] Sync finished in 4.355s
```

## 6. Archivos Afectados por Cambios
- `src/hooks/useDailyNotifications.ts` - Líneas 170 y 200 (sound property)
- `src/features/workout/hooks/useRestTimer.ts` - Línea 56 (sound property)
- `scripts/build-mobile.sh` - Nueva lógica de sonido

## 7. Cómo Probar la Solución

### Opción 1: Test Local (Simulator)
```bash
npm run build
npx cap sync ios
npx cap open ios  # Abre Xcode
# En Xcode: Product > Run (Cmd+R)
# Espera a que la app se abra
# A las 12:00 PM o 6:00 PM debería sonar la notificación
```

### Opción 2: Test en Dispositivo Real
```bash
# Mismo proceso pero compilar en un dispositivo real
# Las notificaciones también deberían sonar
```

### Opciones 3: Test Manual
```javascript
// En la consola del dispositivo:
// 1. Ir a Settings > Gatofit > Notifications
// 2. Activar "Sounds" si no está activado
// 3. Ejecutar el rest timer manualmente
// 4. Esperar a que suene la notificación
```

## 8. Posibles Problemas y Soluciones

### Problema: "El sonido aún no suena"
1. Verificar que el dispositivo NO esté en modo silencioso (switch lateral)
2. Verificar volumen del dispositivo (botones laterales)
3. Verificar Settings > Notifications > Gatofit > Sounds está ON
4. Verificar que `notification.wav` existe en `ios/App/App/notification.wav`

### Problema: "Xcode no encuentra el archivo"
1. Ejecutar: `cp scripts/notification.wav ios/App/App/notification.wav`
2. En Xcode: Producto > Clean Build Folder
3. Recompilar: Cmd+B

### Problema: "Las notificaciones de background no suenan"
1. Esto es comportamiento normal de iOS en alguns casos
2. Las notificaciones de foreground siempre deberían sonar
3. Para background, el usuario debe tener la app abierta o el volumen alto

## 9. Información Técnica

### Especificaciones del Archivo de Sonido
- **Tipo**: WAV (Waveform Audio File Format)
- **Codec**: PCM (Linear PCM)
- **Duración**: 0.5 segundos
- **Frecuencia Fundamental**: 800 Hz
- **Canales**: 1 (Mono)
- **Sample Rate**: 44.1 kHz
- **Bit Depth**: 16-bit
- **Tamaño**: 44144 bytes (~43 KB)

### Por Qué Wave en Lugar de Otros Formatos
- ✅ Compatible con iOS y Android
- ✅ No requiere licencias adicionales
- ✅ Soporte nativo en Capacitor LocalNotifications
- ✅ Rápido de generar programáticamente
- ✅ Pequeño tamaño de archivo

## 10. Próximas Mejoras Opcionales

1. **Múltiples Sonidos**: Agregar diferentes sonidos para diferentes tipos
2. **Sonido Personalizable**: Permitir al usuario elegir sonido
3. **Optimización**: Convertir a ADPCM para archivo más pequeño
4. **Critical Alerts**: Usar UNNotificationSound.defaultCritical para alertas críticas

## Conclusión

La solución está completa y lista para testing. El sonido debería reproducirse cuando se entreguen notificaciones en iOS. Si no funciona después de seguir estos pasos, revisar los logs de Xcode durante la ejecución.

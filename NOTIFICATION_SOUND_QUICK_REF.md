# 🔊 REFERENCIA RÁPIDA - Notificaciones iOS con Sonido

## RESUMEN DE LA SOLUCIÓN

**Problema**: Notificaciones en iOS no producían sonido
**Causa Raíz**: Capacitor LocalNotifications v7 requiere archivo de sonido físico en el bundle
**Solución**: Agregar `sound: 'notification'` en las notificaciones + archivo WAV en bundle

## ARCHIVOS CLAVE

```
scripts/notification.wav
├─ Archivo de sonido generado automáticamente
├─ 44 KB, 0.5s, 800 Hz
└─ Se copia a ios/App/App/notification.wav en cada build

src/hooks/useDailyNotifications.ts (Líneas 170, 205)
├─ Notificación de entrenamiento (12pm)
├─ Notificación de comida (6pm)
└─ Ambas con: sound: 'notification'

src/features/workout/hooks/useRestTimer.ts (Línea 57)
├─ Notificación de fin de descanso
└─ Con: sound: 'notification'
```

## COMANDOS RÁPIDOS

### Build y Sync Completo
```bash
npm run build && npx cap sync ios
```

### Build con Script
```bash
bash scripts/build-mobile.sh
```

### Regenerar Sonido
```bash
python3 scripts/gen-notification-sound.py
cp scripts/notification.wav ios/App/App/notification.wav
```

### Abrir en Xcode
```bash
npx cap open ios
```

## VERIFICACIÓN

```bash
# Verificar archivo de sonido
ls -lh ios/App/App/notification.wav

# Verificar referencias en código
grep -n "sound: 'notification'" src/hooks/useDailyNotifications.ts
grep -n "sound: 'notification'" src/features/workout/hooks/useRestTimer.ts

# Verificar build script
grep notification scripts/build-mobile.sh
```

## TEST RÁPIDO

1. **En Simulator**:
   ```bash
   npx cap open ios  # Abre Xcode
   # Cmd+R para correr
   # Esperar a que suene la notificación
   ```

2. **En Dispositivo Real**:
   ```bash
   # Compilar en Xcode con el dispositivo conectado
   # Esperar notificación
   ```

3. **Verificar en Settings**:
   - Settings > Gatofit > Notifications
   - Asegurarse que "Sounds" está ON

## SONIDOS DONDE SE APLICA

1. **Notificaciones Diarias** (12pm y 6pm) ✅
2. **Rest Timer** (Fin de descanso) ✅
3. **Cualquier notificación futura** - Solo agregar `sound: 'notification'` ✅

## SI NO FUNCIONA

1. Verificar que el dispositivo NO esté silenciado (switch lateral)
2. Subir volumen del dispositivo
3. Settings > Gatofit > Notifications > Sounds = ON
4. Limpiar build: `rm -rf ios/App/App/public/ && npm run build`
5. Sincronizar: `npx cap sync ios`

## DOCUMENTACIÓN COMPLETA

- 📖 `NOTIFICATION_SOUND_SETUP.md` - Guía técnica detallada
- 📝 `NOTIFICATION_SOUND_CHANGES.md` - Cambios implementados
- ✨ `NOTIFICATION_SOUND_IMPLEMENTATION.md` - Estado actual

## ESTADO ACTUAL

✅ IMPLEMENTADO Y LISTO PARA TESTING

Próximo paso: Compilar y probar en iOS

---
Referencia rápida para: `sound: 'notification'` en iOS

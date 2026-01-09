
import React, { useState, useRef, useEffect } from 'react';
import { useFoodCapture } from '@/hooks/useFoodCapture';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { StatusBar } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
import { CameraControls } from './camera/CameraControls';
import { CameraErrorDialog } from './camera/CameraErrorDialog';
import { CameraLoadingOverlay } from './camera/CameraLoadingOverlay';
import { CameraViewfinder } from './camera/CameraViewfinder';
import { motion } from 'framer-motion';

interface CameraCaptureProps {
  isOpen: boolean;
  onClose: () => void;
  onPhotoTaken: (blob: Blob) => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({
  isOpen,
  onClose,
  onPhotoTaken,
}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { isLoading, clearError } = useFoodCapture();

  useEffect(() => {
    if (isOpen) {
      startCamera();
      // Hide navigation bar and safe area bar when camera is open
      const navBar = document.querySelector('nav');
      if (navBar) {
        (navBar as HTMLElement).style.display = 'none';
      }

      const safeAreaBar = document.getElementById('safe-area-bar');
      if (safeAreaBar) {
        safeAreaBar.style.display = 'none';
      }

      if (Capacitor.isNativePlatform()) {
        StatusBar.hide().catch(console.error);
      }
    } else {
      stopCamera();
      // Show navigation bar and safe area bar when camera is closed
      const navBar = document.querySelector('nav');
      if (navBar) {
        (navBar as HTMLElement).style.display = '';
      }

      const safeAreaBar = document.getElementById('safe-area-bar');
      if (safeAreaBar) {
        safeAreaBar.style.display = '';
      }

      if (Capacitor.isNativePlatform()) {
        StatusBar.show().catch(console.error);
      }
    }

    return () => {
      stopCamera();
      // Ensure navigation bar and safe area bar are shown when component unmounts
      const navBar = document.querySelector('nav');
      if (navBar) {
        (navBar as HTMLElement).style.display = '';
      }

      const safeAreaBar = document.getElementById('safe-area-bar');
      if (safeAreaBar) {
        safeAreaBar.style.display = '';
      }

      if (Capacitor.isNativePlatform()) {
        StatusBar.show().catch(console.error);
      }
    };
  }, [isOpen, facingMode]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);

      let errorMessage = 'Error al acceder a la cámara';
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage = 'Permisos de cámara denegados. Permite el acceso para tomar fotos.';
        } else if (error.name === 'NotFoundError') {
          errorMessage = 'No se encontró ninguna cámara en este dispositivo.';
        } else if (error.name === 'NotReadableError') {
          errorMessage = 'La cámara está siendo usada por otra aplicación.';
        }
      }

      setCameraError(errorMessage);

      // Fallback to any available camera
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({
          video: true
        });
        setStream(fallbackStream);
        setCameraError(null);

        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
        }
      } catch (fallbackError) {
        console.error('Error accessing any camera:', fallbackError);
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
        track.enabled = false; // Double ensure
      });
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    setIsProcessing(true);
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    canvas.toBlob(async (blob) => {
      if (blob) {
        onPhotoTaken(blob);
        onClose();
      } else {
        setIsProcessing(false);
      }
    }, 'image/jpeg', 0.8);
  };

  const handleGallerySelect = async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        const image = await Camera.getPhoto({
          quality: 90,
          allowEditing: false,
          resultType: CameraResultType.Uri,
          source: CameraSource.Photos // Force gallery only
        });

        if (image.webPath) {
          // Convert webPath to blob
          const response = await fetch(image.webPath);
          const blob = await response.blob();
          onPhotoTaken(blob);
          onClose();
        }
      } catch (error) {
        console.error('Error selecting from gallery:', error);
      }
    } else {
      // Fallback for web
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';

      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          onPhotoTaken(file);
          onClose();
        }
      };

      input.click();
    }
  };

  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black z-[100]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative w-full h-full">
        <CameraErrorDialog
          isVisible={!!cameraError}
          errorMessage={cameraError || ''}
          onUseGallery={handleGallerySelect}
          onRetryCamera={startCamera}
          isProcessing={isProcessing}
          isLoading={isLoading}
        />

        {/* Video Stream */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />

        <canvas ref={canvasRef} className="hidden" />

        <CameraControls
          onClose={onClose}
          onSwitchCamera={switchCamera}
          onCapturePhoto={capturePhoto}
          onGallerySelect={handleGallerySelect}
          isProcessing={isProcessing}
          isLoading={isLoading}
          cameraError={cameraError}
          showNoFoodDialog={false}
        />

        <CameraLoadingOverlay
          isVisible={(isProcessing || isLoading) && !cameraError}
        />

        <CameraViewfinder
          isVisible={!isProcessing && !isLoading && !cameraError}
        />
      </div>
    </motion.div>
  );
};

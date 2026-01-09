
import React from 'react';
import { Camera, Image, X, RotateCcw, ImageIcon, Loader, Zap } from 'lucide-react';
import Button from '@/components/Button';

interface CameraControlsProps {
  onClose: () => void;
  onSwitchCamera: () => void;
  onCapturePhoto: () => void;
  onGallerySelect: () => void;
  isProcessing: boolean;
  isLoading: boolean;
  cameraError: string | null;
  showNoFoodDialog: boolean;
}

export const CameraControls: React.FC<CameraControlsProps> = ({
  onClose,
  onSwitchCamera,
  onCapturePhoto,
  onGallerySelect,
  isProcessing,
  isLoading,
  cameraError,
  showNoFoodDialog
}) => {
  return (
    <>
      {/* Header Controls */}
      <div className="absolute top-0 left-0 right-0 px-4 pb-4 pt-16 bg-gradient-to-b from-black/80 to-transparent z-50">
        <div className="flex justify-between items-center">
          <button
            onClick={onClose}
            className="h-10 w-10 rounded-full p-0 bg-black/30 hover:bg-black/50 backdrop-blur-sm flex items-center justify-center transition-colors"
            style={{ WebkitTapHighlightColor: 'transparent' }}
            type="button"
          >
            <X className="h-6 w-6 text-white" />
          </button>

          <button
            onClick={onSwitchCamera}
            disabled={isProcessing || isLoading || !!cameraError || showNoFoodDialog}
            className="h-10 w-10 rounded-full p-0 bg-black/30 hover:bg-black/50 backdrop-blur-sm flex items-center justify-center transition-colors disabled:opacity-50"
            style={{ WebkitTapHighlightColor: 'transparent' }}
            type="button"
          >
            <RotateCcw className="h-5 w-5 text-white" />
          </button>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/70 via-black/30 to-transparent">
        <div className="flex flex-col items-center gap-4">
          {/* Controls row */}
          <div className="flex items-center justify-between w-full max-w-xs">
            {/* Gallery Button */}
            <Button
              variant="secondary"
              size="sm"
              onClick={onGallerySelect}
              className="h-14 w-14 rounded-full p-0 bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-200"
              disabled={isProcessing || isLoading || showNoFoodDialog}
            >
              <ImageIcon className="h-6 w-6 text-white" />
            </Button>

            {/* Capture Button - Center */}
            <Button
              variant="primary"
              onClick={onCapturePhoto}
              className="h-20 w-20 rounded-full p-0 bg-white/90 backdrop-blur-md shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30 hover:scale-105 transition-all duration-200 border border-white/30"
              disabled={isProcessing || isLoading || !!cameraError || showNoFoodDialog}
            >
              {isProcessing || isLoading ? (
                <Loader className="h-8 w-8 text-gray-800 animate-spin" />
              ) : (
                <Camera className="h-8 w-8 text-gray-800" />
              )}
            </Button>

            {/* Flash Button */}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => { }} // Flash functionality placeholder
              className="h-14 w-14 rounded-full p-0 bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-200"
              disabled={isProcessing || isLoading || !!cameraError || showNoFoodDialog}
            >
              <Zap className="h-6 w-6 text-white" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};


import React, { useRef } from 'react';
import { Camera, Image as ImageIcon } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useSecureAvatarUpload } from '@/hooks/useSecureAvatarUpload';
import { Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBranding } from '@/contexts/BrandingContext';

interface AvatarUploadProps {
  currentAvatar?: string | null;
  userName?: string;
  onAvatarUpdate?: (newUrl: string) => void;
  size?: 'sm' | 'md' | 'lg';
  isPremium?: boolean;
  isAsesorado?: boolean;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({
  currentAvatar,
  userName,
  onAvatarUpdate,
  size = 'lg',
  isPremium = false,
  isAsesorado = false
}) => {
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { uploadAvatar, isUploading } = useSecureAvatarUpload();
  const { branding } = useBranding();

  const sizeClasses = {
    sm: 'h-16 w-16',
    md: 'h-24 w-24',
    lg: 'h-32 w-32'
  };

  const crownSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const newUrl = await uploadAvatar(file);
    if (newUrl && onAvatarUpdate) {
      onAvatarUpdate(newUrl);
    }

    // Clear the input so the same file can be selected again
    event.target.value = '';
  };

  const handleGalleryClick = () => {
    galleryInputRef.current?.click();
  };

  const handleCameraClick = () => {
    cameraInputRef.current?.click();
  };

  const brandColor = branding.primaryButtonColor || '#ef4444';

  return (
    <div className="flex flex-col items-center space-y-3">
      <div className="relative">
        <Avatar
          className={cn(
            sizeClasses[size],
            // Removed static border classes for isAsesorado
            !isAsesorado && (isPremium ? "border-2 border-yellow-400 shadow-lg shadow-yellow-400/20" : "border border-black/10")
          )}
          style={isAsesorado ? {
            borderWidth: '2px', // Ensure border width is set
            borderStyle: 'solid',
            borderColor: brandColor,
            boxShadow: `0 10px 15px -3px ${brandColor}33, 0 4px 6px -2px ${brandColor}1a`
          } : undefined}
        >
          <AvatarImage src={currentAvatar || undefined} alt={userName || 'Avatar'} />
          <AvatarFallback className="text-lg font-bold">
            {userName?.charAt(0)?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>

        {isUploading && (
          <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
          </div>
        )}

        {/* Premium Crown - Positioned at top-right corner, rotated 45 degrees - Hidden if isAsesorado is true */}
        {isPremium && !isAsesorado && (
          <div className="absolute -top-1 -right-1 z-10">
            <div className="relative">
              <Crown
                className={cn(
                  crownSizes[size],
                  "text-yellow-400 transform rotate-45 drop-shadow-lg"
                )}
                style={{
                  filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))'
                }}
              />
              {/* Subtle glow effect */}
              <Crown
                className={cn(
                  crownSizes[size],
                  "absolute top-0 left-0 text-yellow-300 transform rotate-45 opacity-60"
                )}
                style={{
                  filter: 'blur(2px)'
                }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleGalleryClick}
          disabled={isUploading}
          className="flex items-center gap-2"
        >
          <ImageIcon className="h-4 w-4" />
          Galería
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleCameraClick}
          disabled={isUploading}
          className="flex items-center gap-2"
        >
          <Camera className="h-4 w-4" />
          Cámara
        </Button>
      </div>

      {/* Separate inputs for gallery and camera */}
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        capture="user"
      />
    </div>
  );
};

export default AvatarUpload;

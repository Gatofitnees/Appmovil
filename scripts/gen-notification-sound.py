#!/usr/bin/env python3
"""
Generate a simple notification sound WAV file for iOS
Creates a short beep sound suitable for notifications
"""

import wave
import struct
import math
import sys
import os

def generate_notification_sound(filename, duration=0.5, frequency=800, sample_rate=44100):
    """
    Generate a simple sine wave beep sound
    
    Args:
        filename: Output WAV file path
        duration: Duration in seconds (should be < 30s for iOS)
        frequency: Frequency in Hz (default 800 for a pleasant beep)
        sample_rate: Sample rate in Hz (default 44100)
    """
    num_samples = int(duration * sample_rate)
    
    # Create WAV file
    with wave.open(filename, 'w') as wav_file:
        # 1 channel (mono), 2 bytes per sample, sample rate
        wav_file.setnchannels(1)  # Mono
        wav_file.setsampwidth(2)  # 16-bit
        wav_file.setframerate(sample_rate)
        
        # Generate sine wave samples
        frames = []
        for i in range(num_samples):
            # Calculate sample value for sine wave
            sample = math.sin(2 * math.pi * frequency * i / sample_rate)
            
            # Apply fade out at the end to avoid clicking
            if i > num_samples * 0.8:  # Fade last 20%
                fade_factor = (num_samples - i) / (num_samples * 0.2)
                sample *= fade_factor
            
            # Convert to 16-bit PCM
            sample_int = int(sample * 32767)
            frames.append(struct.pack('<h', sample_int))
        
        wav_file.writeframes(b''.join(frames))
    
    print(f"✅ Generated notification sound: {filename}")
    print(f"   Duration: {duration}s")
    print(f"   Frequency: {frequency}Hz")
    print(f"   Sample rate: {sample_rate}Hz")

if __name__ == "__main__":
    # Default output path
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_path = os.path.join(script_dir, "notification.wav")
    
    # Generate the sound
    try:
        generate_notification_sound(output_path, duration=0.5, frequency=800)
        
        # Verify file was created
        if os.path.exists(output_path):
            file_size = os.path.getsize(output_path)
            print(f"✅ File created successfully: {file_size} bytes")
        else:
            print(f"❌ Failed to create {output_path}")
            sys.exit(1)
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

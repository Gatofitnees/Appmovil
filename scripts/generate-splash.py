#!/usr/bin/env python3
"""
Script para generar splash screens con logo centrado en fondo negro
Usa PIL/Pillow para crear las imágenes
"""

try:
    from PIL import Image, ImageDraw
    import os
    
    # Tamaño del splash (2732x2732 para iOS universal)
    size = (2732, 2732)
    
    # Crear imagen con fondo negro
    img = Image.new('RGB', size, color='black')
    draw = ImageDraw.Draw(img)
    
    # Dibujar logo blanco centrado (forma simplificada de martillo)
    # Tamaño del logo: 480x480 centrado (60% del tamaño anterior)
    center_x, center_y = size[0] // 2, size[1] // 2
    logo_size = 480
    
    # Coordenadas del logo
    left = center_x - logo_size // 2
    top = center_y - logo_size // 2
    right = center_x + logo_size // 2
    bottom = center_y + logo_size // 2
    
    # Dibujar formas básicas del logo (martillo estilizado) - escalado a 60%
    # Mango del martillo (rotado)
    handle_points = [
        (center_x - 90, center_y + 150),
        (center_x - 48, center_y + 192),
        (center_x + 120, center_y - 36),
        (center_x + 78, center_y - 78)
    ]
    draw.polygon(handle_points, fill='white')
    
    # Cabeza del martillo
    head_points = [
        (center_x + 48, center_y - 120),
        (center_x + 168, center_y - 60),
        (center_x + 138, center_y),
        (center_x + 18, center_y - 60)
    ]
    draw.polygon(head_points, fill='white')
    
    # Detalle del rayo en el centro
    lightning = [
        (center_x + 84, center_y - 48),
        (center_x + 72, center_y - 12),
        (center_x + 93, center_y - 12),
        (center_x + 75, center_y + 18),
        (center_x + 87, center_y - 6),
        (center_x + 78, center_y - 6)
    ]
    draw.polygon(lightning, fill='black')
    
    # Guardar la imagen
    output_dir = 'ios/App/App/Assets.xcassets/Splash.imageset'
    os.makedirs(output_dir, exist_ok=True)
    
    # Guardar en diferentes resoluciones
    img.save(f'{output_dir}/splash-2732x2732.png')
    img.save(f'{output_dir}/splash-2732x2732-1.png')
    img.save(f'{output_dir}/splash-2732x2732-2.png')
    
    print("✓ Splash screens generados exitosamente")
    print(f"  - {output_dir}/splash-2732x2732.png")
    print(f"  - {output_dir}/splash-2732x2732-1.png")
    print(f"  - {output_dir}/splash-2732x2732-2.png")
    
except ImportError:
    print("⚠️  PIL/Pillow no está instalado")
    print("   Instalando con: pip3 install Pillow")
    import subprocess
    subprocess.run(['pip3', 'install', 'Pillow'], check=True)
    print("   Por favor, ejecuta el script nuevamente")

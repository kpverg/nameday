from PIL import Image
import os

# Source image
source = "assets/Appimg.png"
img = Image.open(source)

# Android sizes
android_sizes = {
    'ldpi': 36,
    'mdpi': 48,
    'hdpi': 72,
    'xhdpi': 96,
    'xxhdpi': 144,
    'xxxhdpi': 192,
}

# Create Android icons
for dpi, size in android_sizes.items():
    resized = img.resize((size, size), Image.Resampling.LANCZOS)
    dir_path = f"android/app/src/main/res/mipmap-{dpi}"
    os.makedirs(dir_path, exist_ok=True)
    resized.save(f"{dir_path}/ic_launcher.png")
    resized.save(f"{dir_path}/ic_launcher_round.png")
    print(f"Created {dpi}: {size}x{size}")

# iOS sizes
ios_sizes = [
    (20, "20"),
    (29, "29"),
    (38, "38"),
    (40, "40"),
    (58, "58"),
    (60, "60"),
    (76, "76"),
    (80, "80"),
    (87, "87"),
    (120, "120"),
    (152, "152"),
    (167, "167"),
    (180, "180"),
]

# Create iOS icons
ios_dir = "ios/nameday/Images.xcassets/AppIcon.appiconset"
os.makedirs(ios_dir, exist_ok=True)

for size, size_str in ios_sizes:
    resized = img.resize((size, size), Image.Resampling.LANCZOS)
    resized.save(f"{ios_dir}/AppIcon-{size_str}.png")
    print(f"Created iOS: {size}x{size}")

print("All icons created successfully!")

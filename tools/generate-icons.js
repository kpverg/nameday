const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const src = path.resolve(__dirname, '..', 'assets', 'app_icon_source.png');
if (!fs.existsSync(src)) {
  console.error('Source icon not found at', src);
  process.exit(1);
}

// Android mipmap sizes
const androidSizes = [
  { name: 'mipmap-mdpi', size: 48 },
  { name: 'mipmap-hdpi', size: 72 },
  { name: 'mipmap-xhdpi', size: 96 },
  { name: 'mipmap-xxhdpi', size: 144 },
  { name: 'mipmap-xxxhdpi', size: 192 },
];

// iOS app icon sizes (AppIcon.appiconset)
const iosSizes = [20, 29, 40, 60, 76, 83.5, 1024];

async function generate() {
  // Android
  for (const s of androidSizes) {
    const dir = path.resolve(
      __dirname,
      '..',
      'android',
      'app',
      'src',
      'main',
      'res',
      s.name,
    );
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const out = path.resolve(dir, 'ic_launcher.png');
    await sharp(src).resize(s.size, s.size).png().toFile(out);
    console.log('Wrote', out);
  }

  // iOS
  const iosAppIconDir = path.resolve(
    __dirname,
    '..',
    'ios',
    'nameday',
    'Images.xcassets',
    'AppIcon.appiconset',
  );
  if (!fs.existsSync(iosAppIconDir))
    fs.mkdirSync(iosAppIconDir, { recursive: true });

  const contents = { images: [], info: { version: 1, author: 'xcode' } };

  // Generate a few required iOS sizes and entries
  const iosEntries = [
    { size: 20, scales: [1, 2, 3] },
    { size: 29, scales: [1, 2, 3] },
    { size: 40, scales: [1, 2, 3] },
    { size: 60, scales: [2, 3] },
    { size: 76, scales: [1, 2] },
    { size: 83.5, scales: [2] },
    { size: 1024, scales: [1] },
  ];

  for (const entry of iosEntries) {
    for (const scale of entry.scales) {
      const px = Math.round(entry.size * scale);
      const filename = `icon_${entry.size}x${entry.size}@${scale}x.png`.replace(
        '.',
        '_',
      );
      const out = path.resolve(iosAppIconDir, filename);
      await sharp(src).resize(px, px).png().toFile(out);
      contents.images.push({
        size: `${entry.size}x${entry.size}`,
        idiom: 'universal',
        filename: filename,
        scale: `${scale}x`,
      });
      console.log('Wrote', out);
    }
  }

  fs.writeFileSync(
    path.resolve(iosAppIconDir, 'Contents.json'),
    JSON.stringify(contents, null, 2),
  );
  console.log('Wrote Contents.json in', iosAppIconDir);
}

generate().catch(err => {
  console.error(err);
  process.exit(1);
});

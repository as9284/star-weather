import sharp from "sharp";
import { mkdirSync } from "fs";
import { join } from "path";

const sizes = [192, 512];
const svgPath = join(process.cwd(), "public", "icon.svg");
const outDir = join(process.cwd(), "public", "icons");

mkdirSync(outDir, { recursive: true });

for (const size of sizes) {
  // Regular icon
  await sharp(svgPath)
    .resize(size, size)
    .png()
    .toFile(join(outDir, `icon-${size}x${size}.png`));
  console.log(`✓ icon-${size}x${size}.png`);

  // Maskable icon (add ~15% safe zone padding)
  const padded = Math.round(size * 0.7);
  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 224, g: 229, b: 236, alpha: 1 },
    },
  })
    .composite([
      {
        input: await sharp(svgPath).resize(padded, padded).png().toBuffer(),
        gravity: "center",
      },
    ])
    .png()
    .toFile(join(outDir, `icon-${size}x${size}-maskable.png`));
  console.log(`✓ icon-${size}x${size}-maskable.png`);

  // Dark background variant for maskable
  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 42, g: 45, b: 53, alpha: 1 },
    },
  })
    .composite([
      {
        input: await sharp(svgPath).resize(padded, padded).png().toBuffer(),
        gravity: "center",
      },
    ])
    .png()
    .toFile(join(outDir, `icon-${size}x${size}-maskable-dark.png`));
  console.log(`✓ icon-${size}x${size}-maskable-dark.png`);
}

// Apple touch icon (180x180)
await sharp(svgPath)
  .resize(180, 180)
  .png()
  .toFile(join(outDir, "apple-touch-icon.png"));
console.log("✓ apple-touch-icon.png");

// Favicon (32x32)
await sharp(svgPath)
  .resize(32, 32)
  .png()
  .toFile(join(outDir, "favicon-32x32.png"));
console.log("✓ favicon-32x32.png");

console.log("\nAll icons generated!");

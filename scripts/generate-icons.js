/**
 * PWA Icon Generator
 * Generates placeholder icons for development
 *
 * Usage: node scripts/generate-icons.js
 *
 * For production, use PWABuilder: https://www.pwabuilder.com/imageGenerator
 */

import { createCanvas } from 'canvas';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconsDir = join(__dirname, '..', 'public', 'icons');

// Icon configuration
const BACKGROUND_COLOR = '#667eea';  // Purple gradient start
const TEXT_COLOR = '#ffffff';
const SIZES = [192, 512];

/**
 * Generate a simple icon with camera symbol
 */
function generateIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background - gradient effect
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#667eea');
  gradient.addColorStop(1, '#764ba2');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  // Rounded corners effect (draw rounded rect)
  const radius = size * 0.15;
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.moveTo(radius, 0);
  ctx.lineTo(size - radius, 0);
  ctx.quadraticCurveTo(size, 0, size, radius);
  ctx.lineTo(size, size - radius);
  ctx.quadraticCurveTo(size, size, size - radius, size);
  ctx.lineTo(radius, size);
  ctx.quadraticCurveTo(0, size, 0, size - radius);
  ctx.lineTo(0, radius);
  ctx.quadraticCurveTo(0, 0, radius, 0);
  ctx.closePath();
  ctx.fill();

  // Camera icon (simplified)
  ctx.fillStyle = TEXT_COLOR;
  ctx.strokeStyle = TEXT_COLOR;
  ctx.lineWidth = size * 0.02;

  const centerX = size / 2;
  const centerY = size / 2;
  const iconSize = size * 0.4;

  // Camera body
  const bodyWidth = iconSize;
  const bodyHeight = iconSize * 0.7;
  const bodyX = centerX - bodyWidth / 2;
  const bodyY = centerY - bodyHeight / 2 + iconSize * 0.1;

  ctx.beginPath();
  ctx.roundRect(bodyX, bodyY, bodyWidth, bodyHeight, size * 0.05);
  ctx.stroke();

  // Camera lens
  const lensRadius = iconSize * 0.2;
  ctx.beginPath();
  ctx.arc(centerX, centerY + iconSize * 0.05, lensRadius, 0, Math.PI * 2);
  ctx.stroke();

  // Camera top (flash mount)
  const topWidth = iconSize * 0.3;
  const topHeight = iconSize * 0.15;
  ctx.beginPath();
  ctx.roundRect(centerX - topWidth / 2, bodyY - topHeight, topWidth, topHeight, size * 0.02);
  ctx.fill();

  // Small lens detail
  ctx.beginPath();
  ctx.arc(centerX, centerY + iconSize * 0.05, lensRadius * 0.4, 0, Math.PI * 2);
  ctx.fill();

  return canvas.toBuffer('image/png');
}

// Ensure icons directory exists
if (!existsSync(iconsDir)) {
  mkdirSync(iconsDir, { recursive: true });
}

// Generate icons
for (const size of SIZES) {
  const buffer = generateIcon(size);
  const filename = `icon-${size}.png`;
  const filepath = join(iconsDir, filename);
  writeFileSync(filepath, buffer);
  console.log(`✅ Generated: ${filename} (${size}x${size})`);
}

console.log('\n📱 PWA icons generated successfully!');
console.log('📁 Location: public/icons/');

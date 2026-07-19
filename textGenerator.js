import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fontsDir = join(__dirname, '..', 'fonts');

// Register fonts
try {
  // Load Liberation Sans (main font)
  const fontPath = join(fontsDir, 'LiberationSans-Bold.ttf');
  const fontData = readFileSync(fontPath);
  GlobalFonts.register(fontData, 'LiberationSans');
  console.log('✅ Liberation Sans loaded');
} catch (err) {
  console.warn('⚠️ Liberation Sans not found, using system fallback');
}

try {
  // Load Noto Color Emoji for emoji support
  const emojiPath = join(fontsDir, 'NotoColorEmoji.ttf');
  const emojiData = readFileSync(emojiPath);
  GlobalFonts.register(emojiData, 'NotoColorEmoji');
  console.log('✅ Noto Color Emoji loaded');
} catch (err) {
  console.warn('⚠️ Noto Color Emoji not found, emoji may render as boxes');
}

// Font stack for fallback
const FONT_FAMILY = "'LiberationSans', 'Arial', 'Helvetica', 'NotoColorEmoji', 'Apple Color Emoji', 'Segoe UI Emoji', sans-serif";

/**
 * Split text into lines with BRAT-style justification
 */
function wrapText(ctx, text, maxWidth, fontSize) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = [];

  for (const word of words) {
    // Skip empty words
    if (word === '') continue;

    const testLine = currentLine.length === 0 ? word : currentLine.join(' ') + ' ' + word;
    const metrics = ctx.measureText(testLine);
    
    if (metrics.width <= maxWidth) {
      currentLine.push(word);
    } else {
      if (currentLine.length > 0) {
        lines.push([...currentLine]);
        currentLine = [word];
      } else {
        // Word is longer than maxWidth, force it
        lines.push([word]);
        currentLine = [];
      }
    }
  }

  if (currentLine.length > 0) {
    lines.push(currentLine);
  }

  return lines;
}

/**
 * Calculate canvas dimensions and line positions
 */
function calculateLayout(lines, fontSize, padding, maxWidth) {
  const lineHeight = fontSize * 1.4;
  const totalHeight = lines.length * lineHeight + padding * 2;
  
  const positions = lines.map((lineWords, index) => {
    const y = padding + index * lineHeight + fontSize * 0.85;
    return { words: lineWords, y };
  });

  return { positions, totalHeight, lineHeight };
}

/**
 * Draw justified text with BRAT-style spacing
 */
function drawJustifiedLine(ctx, words, y, fontSize, maxWidth, color) {
  if (words.length === 1) {
    // Single word - left aligned
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillStyle = color;
    ctx.fillText(words[0], 0, y);
    return;
  }

  // Calculate total width of all words
  const totalWordWidth = words.reduce((sum, word) => {
    return sum + ctx.measureText(word).width;
  }, 0);

  // Calculate total spaces needed
  const spaces = words.length - 1;
  const extraSpace = (maxWidth - totalWordWidth) / spaces;

  // Draw each word with justified spacing
  let x = 0;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'bottom';
  ctx.fillStyle = color;

  for (let i = 0; i < words.length; i++) {
    ctx.fillText(words[i], x, y);
    if (i < words.length - 1) {
      const wordWidth = ctx.measureText(words[i]).width;
      x += wordWidth + extraSpace;
    }
  }
}

/**
 * Main image generation function
 */
export async function generateBratImage({
  text,
  width = 512,
  fontSize = 92,
  padding = 40,
  background = '#FFFFFF',
  color = '#000000'
}) {
  // Create canvas for measurement
  const measureCanvas = createCanvas(1, 1);
  const measureCtx = measureCanvas.getContext('2d');
  
  // Set font for measurement
  measureCtx.font = `bold ${fontSize}px ${FONT_FAMILY}`;
  
  // Max width for text (accounting for padding)
  const maxWidth = width - (padding * 2);
  
  // Wrap text into lines
  const lines = wrapText(measureCtx, text, maxWidth, fontSize);
  
  // Calculate layout
  const { positions, totalHeight, lineHeight } = calculateLayout(
    lines,
    fontSize,
    padding,
    maxWidth
  );

  // Create final canvas
  const canvas = createCanvas(width, Math.ceil(totalHeight));
  const ctx = canvas.getContext('2d');

  // Set font for rendering (must be set before any text operations)
  ctx.font = `bold ${fontSize}px ${FONT_FAMILY}`;
  
  // Enable anti-aliasing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Background
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw text lines with justification
  for (const { words, y } of positions) {
    drawJustifiedLine(ctx, words, y, fontSize, maxWidth, color);
  }

  // Return image buffer
  return canvas.toBuffer('image/png', {
    compressionLevel: 6,
    filters: canvas.PNG_FILTER_NONE
  });
}
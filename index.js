import express from 'express';
import rateLimit from 'express-rate-limit';
import { generateBratImage } from './utils/textGenerator.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Rate limiting: 100 requests per minute
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Too many requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use(limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Main generation endpoint
app.get('/generate', async (req, res) => {
  try {
    const {
      text,
      width = 512,
      fontSize = 92,
      padding = 40,
      background = '#FFFFFF',
      color = '#000000'
    } = req.query;

    // Validate text
    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Text is required'
      });
    }

    // Validate text length
    if (text.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Text exceeds maximum length of 500 characters'
      });
    }

    // Validate numeric parameters
    const widthNum = parseInt(width);
    const fontSizeNum = parseInt(fontSize);
    const paddingNum = parseInt(padding);

    if (isNaN(widthNum) || widthNum < 100 || widthNum > 2000) {
      return res.status(400).json({
        success: false,
        message: 'Width must be between 100 and 2000'
      });
    }

    if (isNaN(fontSizeNum) || fontSizeNum < 10 || fontSizeNum > 300) {
      return res.status(400).json({
        success: false,
        message: 'Font size must be between 10 and 300'
      });
    }

    if (isNaN(paddingNum) || paddingNum < 0 || paddingNum > 200) {
      return res.status(400).json({
        success: false,
        message: 'Padding must be between 0 and 200'
      });
    }

    // Generate image
    const imageBuffer = await generateBratImage({
      text: decodeURIComponent(text),
      width: widthNum,
      fontSize: fontSizeNum,
      padding: paddingNum,
      background,
      color
    });

    // Set response headers
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('Content-Length', imageBuffer.length);
    
    // Send image
    res.send(imageBuffer);

  } catch (error) {
    console.error('Error generating image:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate image',
      error: error.message
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 BRAT Text Image Generator running on http://localhost:${PORT}`);
  console.log(`📝 Example: http://localhost:${PORT}/generate?text=ini%20apa%20kok%20ganteng`);
});
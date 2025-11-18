import Tesseract from 'tesseract.js';
import sharp from 'sharp'; // NEW: Image processing library

export const extractText = async (imageBuffer) => {
  try {
    console.log('Processing image (Grayscale & Resizing)...');
    
    // 1. Pre-process image with Sharp
    // Convert to grayscale and ensure it's large enough for OCR
    const processedBuffer = await sharp(imageBuffer)
      .grayscale() // Convert to B&W
      .normalize() // Enhance contrast
      .toBuffer();

    console.log('Starting Tesseract OCR on processed image...');
    
    // 2. Run OCR
    const { data: { text } } = await Tesseract.recognize(
      processedBuffer,
      'eng',
      {
        // logger: m => console.log(m.progress) // Uncomment to see progress bars
      }
    );
    
    // Clean up text (remove newlines and extra spaces)
    const cleanText = text.replace(/\n/g, " ").replace(/\s+/g, " ").trim();
    
    console.log('OCR Result:', cleanText.substring(0, 50) + "..."); // Log first 50 chars
    return cleanText;

  } catch (error) {
    console.error("OCR Error:", error.message);
    return ""; 
  }
};
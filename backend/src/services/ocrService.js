const Tesseract = require('tesseract.js');
const sharp = require('sharp');
const { GoogleGenerativeAI } = require('@google/generative-ai');

class OCRService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.textModel = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  /**
   * Extract text from image using Tesseract OCR
   */
  async extractTextFromImage(imageBuffer) {
    try {
      console.log('📸 Starting OCR text extraction...');
      
      // Preprocess image for better OCR
      const processedImage = await sharp(imageBuffer)
        .greyscale()
        .normalize()
        .sharpen()
        .toBuffer();

      // Perform OCR
      const { data: { text } } = await Tesseract.recognize(
        processedImage,
        'eng',
        {
          logger: m => console.log(`OCR Progress: ${m.status} ${m.progress ? Math.round(m.progress * 100) + '%' : ''}`)
        }
      );

      console.log('✅ OCR text extraction complete');
      console.log('📝 Extracted text length:', text.length);
      
      return text;
    } catch (error) {
      console.error('❌ OCR extraction error:', error);
      throw new Error(`OCR failed: ${error.message}`);
    }
  }

  /**
   * Process bill using OCR + Gemini text analysis
   */
  async processBillWithOCR(imageBuffer) {
    try {
      // Step 1: Extract text using OCR
      const extractedText = await this.extractTextFromImage(imageBuffer);
      
      if (!extractedText || extractedText.trim().length < 10) {
        throw new Error('Could not extract sufficient text from image');
      }

      console.log('🤖 Analyzing extracted text with Gemini...');

      // Step 2: Analyze text with Gemini
      const prompt = `
        Analyze this bill/invoice text and extract the following information in JSON format:
        
        ${extractedText}
        
        Extract:
        - vendor: store/vendor name
        - billNumber: bill/invoice number
        - date: bill date (format: YYYY-MM-DD)
        - grandTotal: total bill amount (number)
        - items: array of items with:
          - item: product name (string)
          - quantity: number of units (number)
          - price: unit price (number)
          - total: total price for item (number)
        
        Return ONLY valid JSON in this exact format:
        {
          "vendor": "Store Name",
          "billNumber": "INV-123",
          "date": "2024-02-09",
          "grandTotal": 2522.00,
          "items": [
            {
              "item": "Product Name",
              "quantity": 1,
              "price": 400.00,
              "total": 400.00
            }
          ]
        }
        
        Important:
        - Extract ALL items from the bill
        - Ensure all numbers are actual numbers, not strings
        - Use exact product names as written
        - If date format is different, convert to YYYY-MM-DD
        - Return empty string for missing vendor/billNumber
      `;

      const result = await this.textModel.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Clean and parse JSON
      const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
      
      try {
        const parsedData = JSON.parse(cleanedText);
        
        // Validate structure
        if (!parsedData.items || !Array.isArray(parsedData.items)) {
          throw new Error('Invalid response: items array missing');
        }

        // Validate and fix each item
        parsedData.items = parsedData.items.map((item, index) => {
          if (!item.item) {
            throw new Error(`Item ${index} missing name`);
          }
          
          return {
            item: item.item,
            quantity: Number(item.quantity) || 1,
            price: Number(item.price) || 0,
            total: Number(item.total) || (Number(item.quantity) * Number(item.price))
          };
        });

        // Ensure grandTotal is a number
        parsedData.grandTotal = Number(parsedData.grandTotal) || 0;

        console.log(`✅ Successfully processed bill with ${parsedData.items.length} items`);
        return parsedData;

      } catch (parseError) {
        console.error('❌ JSON parsing error:', parseError);
        console.error('Raw response:', text);
        throw new Error('Failed to parse AI response');
      }

    } catch (error) {
      console.error('❌ Bill processing error:', error);
      throw new Error(`Bill processing failed: ${error.message}`);
    }
  }
}

module.exports = new OCRService();

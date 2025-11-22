const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is required');
    }
    
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Use gemini-1.5-pro or gemini-pro for vision tasks
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
  }

  /**
   * Process bill image and extract items data
   * @param {Buffer} imageBuffer - Image buffer from uploaded file
   * @param {string} mimeType - MIME type of the image
   * @returns {Promise<Array>} - Array of extracted items
   */
  async processBillImage(imageBuffer, mimeType) {
    try {
      const prompt = `
        Analyze this purchase bill/invoice image and extract the following information in JSON format:
        
        For each item found, provide:
        - item: exact product name as written
        - quantity: number of units purchased
        - price: unit price per item (not total)
        - total: total price for this item (quantity × price)
        
        Also extract:
        - vendor: store/vendor name
        - billNumber: bill/invoice number if visible
        - date: bill date if visible
        - grandTotal: total bill amount
        
        Return ONLY valid JSON in this exact format:
        {
          "vendor": "Store Name",
          "billNumber": "INV-123",
          "date": "2024-01-15",
          "grandTotal": 150.50,
          "items": [
            {
              "item": "Coca-Cola 500ml",
              "quantity": 24,
              "price": 25.00,
              "total": 600.00
            }
          ]
        }
        
        Important:
        - Extract ALL items visible in the bill
        - Use exact product names as written
        - Ensure quantities and prices are numbers
        - If information is unclear, make reasonable assumptions
        - Return empty string for missing vendor/billNumber/date
      `;

      const imagePart = {
        inlineData: {
          data: imageBuffer.toString('base64'),
          mimeType: mimeType
        }
      };

      const result = await this.model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text();

      // Clean and parse the JSON response
      const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
      
      try {
        const parsedData = JSON.parse(cleanedText);
        
        // Validate the structure
        if (!parsedData.items || !Array.isArray(parsedData.items)) {
          throw new Error('Invalid response structure: items array missing');
        }

        // Validate each item
        parsedData.items.forEach((item, index) => {
          if (!item.item || typeof item.quantity !== 'number' || typeof item.price !== 'number') {
            throw new Error(`Invalid item at index ${index}: missing required fields`);
          }
          
          // Calculate total if missing
          if (!item.total) {
            item.total = item.quantity * item.price;
          }
        });

        console.log(`✅ Successfully processed bill with ${parsedData.items.length} items`);
        return parsedData;

      } catch (parseError) {
        console.error('❌ JSON parsing error:', parseError);
        console.error('Raw response:', text);
        throw new Error('Failed to parse AI response as JSON');
      }

    } catch (error) {
      console.error('❌ Gemini API error:', error);
      throw new Error(`Bill processing failed: ${error.message}`);
    }
  }

  /**
   * Process text-based bill data (for testing or manual input)
   * @param {string} billText - Text content of the bill
   * @returns {Promise<Array>} - Array of extracted items
   */
  async processBillText(billText) {
    try {
      const prompt = `
        Analyze this bill text and extract items in JSON format:
        
        ${billText}
        
        Return the same JSON structure as described in the image processing prompt.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
      const parsedData = JSON.parse(cleanedText);

      return parsedData;
    } catch (error) {
      console.error('❌ Text processing error:', error);
      throw new Error(`Text processing failed: ${error.message}`);
    }
  }
}

module.exports = new GeminiService();
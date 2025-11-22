const Tesseract = require('tesseract.js');
const sharp = require('sharp');

class OCRService {
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
   * Parse bill text using pattern matching (no AI needed)
   */
  parseBillText(text) {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    
    const result = {
      vendor: '',
      billNumber: '',
      date: '',
      grandTotal: 0,
      items: []
    };

    // Extract vendor (usually first few lines)
    result.vendor = lines[0] || 'Unknown Vendor';

    // Extract bill number
    const billMatch = text.match(/(?:invoice|bill|receipt)[\s#:]*(\w+[-\d]+)/i);
    if (billMatch) result.billNumber = billMatch[1];

    // Extract date
    const dateMatch = text.match(/(\d{1,2}[-\/]\w{3,}[-\/]\d{2,4}|\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/);
    if (dateMatch) result.date = dateMatch[1];

    // Extract total
    const totalMatch = text.match(/(?:total|amount|grand total)[\s:]*(?:rs\.?|₹)?\s*([\d,]+\.?\d*)/i);
    if (totalMatch) {
      result.grandTotal = parseFloat(totalMatch[1].replace(/,/g, ''));
    }

    // Extract items - look for patterns
    const itemPatterns = [
      // Pattern: Name Qty Price Total
      /^(.+?)\s+(\d+)\s+(?:rs\.?|₹)?\s*([\d,]+\.?\d*)\s+(?:rs\.?|₹)?\s*([\d,]+\.?\d*)$/i,
      // Pattern: Name Price x Qty = Total
      /^(.+?)\s+(?:rs\.?|₹)?\s*([\d,]+\.?\d*)\s*x\s*(\d+)\s*=?\s*(?:rs\.?|₹)?\s*([\d,]+\.?\d*)$/i
    ];

    for (const line of lines) {
      // Skip header lines
      if (/^(sr|no|item|product|description|qty|quantity|rate|price|amount|total)/i.test(line)) {
        continue;
      }

      for (const pattern of itemPatterns) {
        const match = line.match(pattern);
        if (match) {
          const [, name, qtyOrPrice, priceOrQty, total] = match;
          
          const qty = parseInt(qtyOrPrice) || parseInt(priceOrQty) || 1;
          const price = parseFloat((priceOrQty || qtyOrPrice).replace(/,/g, '')) || 0;
          const itemTotal = parseFloat(total.replace(/,/g, '')) || (qty * price);

          if (name && name.length > 2) {
            result.items.push({
              item: name.trim(),
              quantity: qty,
              price: price,
              total: itemTotal
            });
          }
          break;
        }
      }
    }

    // If no items found, try simpler extraction
    if (result.items.length === 0) {
      console.log('⚠️ No items found with patterns, trying simple extraction...');
      
      for (const line of lines) {
        const numbers = line.match(/[\d,]+\.?\d*/g);
        if (numbers && numbers.length >= 2 && line.length > 5) {
          const name = line.replace(/[\d,\.]+/g, '').trim();
          if (name.length > 3) {
            const price = parseFloat(numbers[0].replace(/,/g, '')) || 0;
            const total = parseFloat(numbers[numbers.length - 1].replace(/,/g, '')) || price;
            
            result.items.push({
              item: name,
              quantity: 1,
              price: price,
              total: total
            });
          }
        }
      }
    }

    return result;
  }

  /**
   * Process bill using pure OCR (no AI needed)
   */
  async processBillWithOCR(imageBuffer) {
    try {
      // Extract text using OCR
      const extractedText = await this.extractTextFromImage(imageBuffer);
      
      if (!extractedText || extractedText.trim().length < 10) {
        throw new Error('Could not extract sufficient text from image');
      }

      console.log('📝 Parsing bill text...');
      console.log('Extracted text preview:', extractedText.substring(0, 500));

      // Parse text using pattern matching
      const billData = this.parseBillText(extractedText);

      if (billData.items.length === 0) {
        throw new Error('No items could be extracted. Please ensure the image is clear.');
      }

      console.log(`✅ Successfully processed bill with ${billData.items.length} items`);
      return billData;

    } catch (error) {
      console.error('❌ Bill processing error:', error);
      throw new Error(`Bill processing failed: ${error.message}`);
    }
  }
}

module.exports = new OCRService();

const PDFDocument = require('pdfkit');
const s3Service = require('./s3Service');

class PDFService {
  /**
   * Generate customer bill PDF
   * @param {Object} saleData - Sale information
   * @param {Array} items - Array of sold items
   * @returns {Promise<string>} - PDF file URL
   */
  async generateCustomerBill(saleData, items) {
    try {
      // Create PDF document
      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];

      // Collect PDF data
      doc.on('data', buffers.push.bind(buffers));
      
      return new Promise(async (resolve, reject) => {
        doc.on('end', async () => {
          try {
            const pdfBuffer = Buffer.concat(buffers);
            
            // Upload PDF to S3 or save locally
            const fileName = `bill-${saleData.id}-${Date.now()}.pdf`;
            const pdfUrl = await s3Service.uploadFile(
              pdfBuffer, 
              fileName, 
              'application/pdf', 
              'bills'
            );
            
            resolve(pdfUrl);
          } catch (error) {
            reject(error);
          }
        });

        // Generate PDF content
        this.addHeader(doc);
        this.addCustomerInfo(doc, saleData);
        this.addItemsTable(doc, items);
        this.addTotals(doc, saleData, items);
        this.addFooter(doc);

        // Finalize PDF
        doc.end();
      });

    } catch (error) {
      console.error('❌ PDF generation error:', error);
      throw new Error(`PDF generation failed: ${error.message}`);
    }
  }

  /**
   * Add header to PDF
   */
  addHeader(doc) {
    doc
      .fontSize(20)
      .font('Helvetica-Bold')
      .text('SALES INVOICE', 50, 50)
      .fontSize(12)
      .font('Helvetica')
      .text('Your Shop Name', 50, 80)
      .text('123 Shop Street, City, State 12345', 50, 95)
      .text('Phone: (555) 123-4567', 50, 110)
      .text('Email: shop@example.com', 50, 125);

    // Add invoice details on the right
    const currentDate = new Date().toLocaleDateString();
    doc
      .text(`Date: ${currentDate}`, 400, 80)
      .text(`Invoice #: INV-${Date.now()}`, 400, 95);

    // Add line separator
    doc
      .moveTo(50, 150)
      .lineTo(550, 150)
      .stroke();
  }

  /**
   * Add customer information
   */
  addCustomerInfo(doc, saleData) {
    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('Bill To:', 50, 170);

    doc
      .fontSize(12)
      .font('Helvetica')
      .text(saleData.customer_name || 'Walk-in Customer', 50, 190);

    if (saleData.customer_phone) {
      doc.text(`Phone: ${saleData.customer_phone}`, 50, 205);
    }

    doc.text(`Payment Method: ${saleData.payment_method || 'Cash'}`, 50, 220);
  }

  /**
   * Add items table
   */
  addItemsTable(doc, items) {
    const tableTop = 260;
    const itemCodeX = 50;
    const descriptionX = 150;
    const quantityX = 350;
    const priceX = 400;
    const totalX = 480;

    // Table header
    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('Item', itemCodeX, tableTop)
      .text('Description', descriptionX, tableTop)
      .text('Qty', quantityX, tableTop)
      .text('Price', priceX, tableTop)
      .text('Total', totalX, tableTop);

    // Header underline
    doc
      .moveTo(itemCodeX, tableTop + 15)
      .lineTo(totalX + 50, tableTop + 15)
      .stroke();

    // Table rows
    let currentY = tableTop + 30;
    doc.font('Helvetica');

    items.forEach((item, index) => {
      const y = currentY + (index * 25);

      doc
        .text(index + 1, itemCodeX, y)
        .text(item.name || item.item, descriptionX, y, { width: 180 })
        .text(item.quantity.toString(), quantityX, y)
        .text(`$${item.unit_price.toFixed(2)}`, priceX, y)
        .text(`$${item.total_price.toFixed(2)}`, totalX, y);
    });

    // Table bottom line
    const tableBottom = currentY + (items.length * 25) + 10;
    doc
      .moveTo(itemCodeX, tableBottom)
      .lineTo(totalX + 50, tableBottom)
      .stroke();

    return tableBottom;
  }

  /**
   * Add totals section
   */
  addTotals(doc, saleData, items) {
    const subtotal = items.reduce((sum, item) => sum + parseFloat(item.total_price), 0);
    const tax = subtotal * 0.1; // 10% tax (adjust as needed)
    const total = subtotal + tax;

    const totalsY = 450;

    doc
      .fontSize(12)
      .font('Helvetica')
      .text('Subtotal:', 400, totalsY)
      .text(`$${subtotal.toFixed(2)}`, 480, totalsY)
      .text('Tax (10%):', 400, totalsY + 20)
      .text(`$${tax.toFixed(2)}`, 480, totalsY + 20)
      .font('Helvetica-Bold')
      .text('Total:', 400, totalsY + 40)
      .text(`$${total.toFixed(2)}`, 480, totalsY + 40);

    // Total line
    doc
      .moveTo(400, totalsY + 35)
      .lineTo(530, totalsY + 35)
      .stroke();
  }

  /**
   * Add footer
   */
  addFooter(doc) {
    doc
      .fontSize(10)
      .font('Helvetica')
      .text('Thank you for your business!', 50, 550)
      .text('Return Policy: Items can be returned within 7 days with receipt.', 50, 565)
      .text('For questions, contact us at shop@example.com or (555) 123-4567', 50, 580);
  }

  /**
   * Generate inventory report PDF
   * @param {Array} items - Inventory items
   * @returns {Promise<string>} - PDF file URL
   */
  async generateInventoryReport(items) {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));

      return new Promise(async (resolve, reject) => {
        doc.on('end', async () => {
          try {
            const pdfBuffer = Buffer.concat(buffers);
            const fileName = `inventory-report-${Date.now()}.pdf`;
            const pdfUrl = await s3Service.uploadFile(
              pdfBuffer, 
              fileName, 
              'application/pdf', 
              'reports'
            );
            resolve(pdfUrl);
          } catch (error) {
            reject(error);
          }
        });

        // Generate report content
        this.addReportHeader(doc, 'Inventory Report');
        this.addInventoryTable(doc, items);

        doc.end();
      });

    } catch (error) {
      console.error('❌ Inventory report generation error:', error);
      throw new Error(`Report generation failed: ${error.message}`);
    }
  }

  /**
   * Add report header
   */
  addReportHeader(doc, title) {
    doc
      .fontSize(20)
      .font('Helvetica-Bold')
      .text(title, 50, 50)
      .fontSize(12)
      .font('Helvetica')
      .text(`Generated on: ${new Date().toLocaleDateString()}`, 50, 80)
      .moveTo(50, 100)
      .lineTo(550, 100)
      .stroke();
  }

  /**
   * Add inventory table
   */
  addInventoryTable(doc, items) {
    const tableTop = 130;
    const nameX = 50;
    const categoryX = 200;
    const quantityX = 300;
    const priceX = 370;
    const valueX = 450;

    // Table header
    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('Item Name', nameX, tableTop)
      .text('Category', categoryX, tableTop)
      .text('Quantity', quantityX, tableTop)
      .text('Price', priceX, tableTop)
      .text('Value', valueX, tableTop);

    // Header underline
    doc
      .moveTo(nameX, tableTop + 15)
      .lineTo(valueX + 50, tableTop + 15)
      .stroke();

    // Table rows
    let currentY = tableTop + 30;
    doc.font('Helvetica');

    items.forEach((item, index) => {
      const y = currentY + (index * 20);
      const totalValue = item.quantity * item.unit_price;

      doc
        .text(item.name, nameX, y, { width: 140 })
        .text(item.category || 'N/A', categoryX, y)
        .text(item.quantity.toString(), quantityX, y)
        .text(`$${item.unit_price.toFixed(2)}`, priceX, y)
        .text(`$${totalValue.toFixed(2)}`, valueX, y);
    });
  }
}

module.exports = new PDFService();
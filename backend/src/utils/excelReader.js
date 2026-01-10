import xlsx from 'xlsx';

/**
 * Read Excel buffer and return array of { productId, productName }.
 * Expects header columns: product_id | product_name (case-insensitive, with/without underscores)
 */
export const parseProductExcel = (buffer) => {
  try {
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    
    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      throw new Error('Excel file has no sheets');
    }
    
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    
    if (!sheet) {
      throw new Error('Excel sheet is empty or invalid');
    }
    
    // Parse with raw option to preserve numbers as strings
    const rows = xlsx.utils.sheet_to_json(sheet, { 
      defval: '',
      raw: false, // Convert everything to strings to preserve leading zeros
    });

    if (rows.length === 0) {
      throw new Error('Excel file has no data rows');
    }

    // Get column names from first row (case-insensitive matching)
    const firstRow = rows[0];
    const columnMap = {};
    
    // Find product_id column (case-insensitive, with/without underscores)
    for (const key in firstRow) {
      const lowerKey = key.toLowerCase().replace(/[_\s]/g, '');
      if (lowerKey === 'productid' || lowerKey === 'product_id') {
        columnMap.productId = key;
      } else if (lowerKey === 'productname' || lowerKey === 'product_name') {
        columnMap.productName = key;
      }
    }

    if (!columnMap.productId) {
      throw new Error('Column "product_id" or "productId" not found in Excel file');
    }
    if (!columnMap.productName) {
      throw new Error('Column "product_name" or "productName" not found in Excel file');
    }

    return rows.map((row, index) => {
      // Handle productId - preserve as string, remove any formatting
      let productId = String(row[columnMap.productId] || '').trim();
      
      // If it's a number in Excel, convert to string
      // Remove any decimal points or scientific notation
      if (productId.includes('.')) {
        productId = productId.split('.')[0]; // Remove decimal part
      }
      if (productId.includes('e') || productId.includes('E')) {
        // Handle scientific notation (e.g., 1.23e+15)
        try {
          const num = parseFloat(productId);
          productId = num.toFixed(0);
        } catch (e) {
          productId = '';
        }
      }
      
      // Remove any non-numeric characters
      productId = productId.replace(/\D/g, '');
      
      // Note: If productId was stored as a number in Excel and has leading zeros,
      // they will be lost. Users should format the column as Text in Excel.
      
      const productName = String(row[columnMap.productName] || '').trim();
      
      return {
        productId,
        productName,
        rowNumber: index + 2, // +2 because index is 0-based and we skip header
      };
    }).filter(row => row.productId || row.productName); // Filter out completely empty rows
  } catch (error) {
    throw new Error(`Failed to parse Excel file: ${error.message}`);
  }
};


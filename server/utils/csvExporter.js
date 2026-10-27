/**
 * Escapes a single CSV cell value according to RFC 4180
 * Handles commas, double-quotes, newlines, and formula injection
 */
const escapeCSVCell = (val) => {
  if (val === null || val === undefined) {
    return '""';
  }

  let str = String(val).trim();

  // Prevent formula injection in spreadsheet software
  if (['=', '+', '-', '@'].includes(str.charAt(0))) {
    str = `'${str}`;
  }

  // Double up any quotes inside the string
  const escaped = str.replace(/"/g, '""');
  return `"${escaped}"`;
};

/**
 * Converts transaction documents to a formatted CSV string
 */
const generateTransactionsCSV = (transactions) => {
  const headers = [
    'Date',
    'Title',
    'Type',
    'Category',
    'Amount',
    'Payment Method',
    'Notes'
  ];

  const headerRow = headers.map(escapeCSVCell).join(',');

  const dataRows = transactions.map((t) => {
    const formattedDate = t.date ? new Date(t.date).toISOString().split('T')[0] : '';
    return [
      escapeCSVCell(formattedDate),
      escapeCSVCell(t.title),
      escapeCSVCell(t.type),
      escapeCSVCell(t.category),
      escapeCSVCell(t.amount.toFixed(2)),
      escapeCSVCell(t.paymentMethod || 'Cash'),
      escapeCSVCell(t.notes || '')
    ].join(',');
  });

  return [headerRow, ...dataRows].join('\r\n');
};

module.exports = {
  escapeCSVCell,
  generateTransactionsCSV
};

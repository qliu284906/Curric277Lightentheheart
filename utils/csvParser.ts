
import { User, SignupSource } from '../types';

// Simple CSV parser that handles quoted strings
const parseCSV = (text: string): string[][] => {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentVal = '';
  let inQuotes = false;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        currentVal += '"';
        i++; // skip next quote
      } else if (char === '"') {
        inQuotes = false;
      } else {
        currentVal += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        currentRow.push(currentVal.trim());
        currentVal = '';
      } else if (char === '\n' || char === '\r') {
        currentRow.push(currentVal.trim());
        currentVal = '';
        if (currentRow.length > 0 && currentRow.some(c => c)) {
            rows.push(currentRow);
        }
        currentRow = [];
        // Handle \r\n
        if (char === '\r' && nextChar === '\n') i++;
      } else {
        currentVal += char;
      }
    }
  }
  // Flush last value/row
  if (currentVal || currentRow.length > 0) {
    currentRow.push(currentVal.trim());
    rows.push(currentRow);
  }
  return rows;
};

export const processSheetData = (csvText: string): User[] => {
  const rows = parseCSV(csvText);
  if (rows.length < 2) return [];

  const headers = rows[0].map(h => h.toLowerCase().replace(/[^a-z]/g, ''));
  
  // Find the 'Claimed by' column
  const claimedByIndex = headers.findIndex(h => h.includes('claimedby'));
  
  // Optional: Find 'WeekID' or 'Week' to use as label
  const weekIndex = headers.findIndex(h => h.includes('week') || h === 'id');

  if (claimedByIndex === -1) {
    console.warn("Could not find 'Claimed by' column. Headers found:", headers);
    // Fallback: Use the first column if no specific header matches
    // But better to return empty and let UI warn
    return [];
  }

  const users: User[] = [];

  // Start from row 1 (skip header)
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const name = row[claimedByIndex];

    if (name && name.length > 1) { // Ignore empty or single char junk
        const weekLabel = weekIndex !== -1 ? row[weekIndex] : `Row ${i}`;
        // Clean up week label if it's just a number
        const label = isNaN(Number(weekLabel)) ? weekLabel : `Week ${weekLabel}`;

        users.push({
            id: `import-${i}`,
            name: name,
            source: SignupSource.LEGACY,
            timestamp: Date.now(),
            label: label
        });
    }
  }

  return users;
};

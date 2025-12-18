
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

  // Normalize headers to lowercase letters only for easier matching
  const headers = rows[0].map(h => h.toLowerCase().replace(/[^a-z]/g, ''));
  
  // 1. Identify critical columns
  // Priority: "name" -> "studentname" -> "claimedby"
  let nameIndex = headers.findIndex(h => h === 'name');
  if (nameIndex === -1) nameIndex = headers.findIndex(h => h.includes('studentname'));
  if (nameIndex === -1) nameIndex = headers.findIndex(h => h.includes('claimedby'));
  
  // 2. Identify optional columns
  const idIndex = headers.findIndex(h => h === 'id' || h === 'userid');
  const labelIndex = headers.findIndex(h => h.includes('label') || h.includes('week'));
  const timestampIndex = headers.findIndex(h => h.includes('time') || h.includes('date'));

  if (nameIndex === -1) {
    console.warn("Parser error: Could not find a 'Name' column in CSV headers:", headers);
    return [];
  }

  const users: User[] = [];

  // Start from row 1 (skip header)
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    // Ensure row has enough columns
    if (row.length <= nameIndex) continue;

    const name = row[nameIndex];

    if (name && name.length > 1) { // Ignore empty or single char junk
        
        // Try to get ID from CSV, otherwise generate a stable one based on row index
        let userId = idIndex !== -1 && row[idIndex] ? row[idIndex] : `import-${i}`;
        
        // Try to get Label from CSV, otherwise default
        let userLabel = labelIndex !== -1 && row[labelIndex] ? row[labelIndex] : 'Guest Participant';
        
        // Clean up label (legacy "Week X" logic vs plain text)
        if (!isNaN(Number(userLabel))) {
            userLabel = `Week ${userLabel}`;
        }

        // Try to parse timestamp
        let ts = Date.now();
        if (timestampIndex !== -1 && row[timestampIndex]) {
            const parsedTs = Date.parse(row[timestampIndex]);
            if (!isNaN(parsedTs)) ts = parsedTs;
        }

        users.push({
            id: userId,
            name: name,
            source: SignupSource.LEGACY, // Marked as legacy/imported
            timestamp: ts,
            label: userLabel,
            isLit: true // Imported data is assumed to be active participants
        });
    }
  }

  return users;
};

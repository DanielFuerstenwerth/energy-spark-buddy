import { ScoreData } from './dataLoader';

const GOOGLE_SHEETS_URL = 'https://docs.google.com/spreadsheets/d/1-LLeZNX-TUYPkI2EBJaWltwHHTJpVnyPWU7_SfiWk9U/export?format=csv';

export async function loadScoresFromGoogleSheets(): Promise<Map<string, ScoreData>> {
  try {
    const response = await fetch(GOOGLE_SHEETS_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const text = await response.text();
    const lines = text.trim().split('\n');
    const scoresMap = new Map<string, ScoreData>();
    
    // Skip header row
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Parse CSV line - handle quoted fields
      const fields: string[] = [];
      let currentField = '';
      let insideQuotes = false;
      
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        
        if (char === '"') {
          insideQuotes = !insideQuotes;
        } else if (char === ',' && !insideQuotes) {
          fields.push(currentField);
          currentField = '';
        } else {
          currentField += char;
        }
      }
      fields.push(currentField); // Add last field
      
      if (fields.length >= 4) {
        const vnb_id = fields[0].trim();
        const vnb_name = fields[1].trim();
        const scoreStr = fields[5]?.trim(); // score is at index 5
        const updated_at = fields[6]?.trim() || new Date().toISOString().split('T')[0];
        
        const score = scoreStr ? parseFloat(scoreStr) : null;
        
        if (vnb_id && vnb_name) {
          scoresMap.set(vnb_id, {
            vnb_id,
            vnb_name,
            score: isNaN(score!) ? null : score,
            updated_at
          });
        }
      }
    }
    
    console.log(`Loaded ${scoresMap.size} VNB records from Google Sheets`);
    return scoresMap;
  } catch (error) {
    console.error('Error loading from Google Sheets:', error);
    // Fallback to local CSV
    const fallbackResponse = await fetch('/data/scores_ggv.csv');
    const text = await fallbackResponse.text();
    return parseCSV(text);
  }
}

function parseCSV(text: string): Map<string, ScoreData> {
  const lines = text.trim().split('\n');
  const scoresMap = new Map<string, ScoreData>();
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const parts = line.split(',');
    if (parts.length >= 4) {
      const vnb_id = parts[0].trim();
      const vnb_name = parts[1].trim();
      const scoreStr = parts[2].trim();
      const updated_at = parts[3].trim();
      
      const score = scoreStr ? parseFloat(scoreStr) : null;
      
      if (vnb_id && vnb_name) {
        scoresMap.set(vnb_id, {
          vnb_id,
          vnb_name,
          score: isNaN(score!) ? null : score,
          updated_at
        });
      }
    }
  }
  
  return scoresMap;
}

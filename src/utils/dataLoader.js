import * as XLSX from 'xlsx';
import fallbackData from '../data/processed_districts.json';

/**
 * Data Loader with validation and fallback
 * Loads dataset from JSON or parses raw XLSX files if requested.
 */
export async function loadDashboardData() {
  try {
    // 1. Try loading preprocessed bundle from /data/processed_districts.json
    const res = await fetch('/data/processed_districts.json');
    if (res.ok) {
      const data = await res.json();
      if (validateDataset(data)) {
        return {
          success: true,
          source: 'public/data/processed_districts.json',
          data: data.districts,
          metadata: data.metadata
        };
      }
    }
  } catch (err) {
    console.warn('Could not fetch /data/processed_districts.json, using bundled data:', err);
  }

  // 2. Bundled fallback
  if (fallbackData && fallbackData.districts) {
    return {
      success: true,
      source: 'src/data/processed_districts.json (bundled)',
      data: fallbackData.districts,
      metadata: fallbackData.metadata
    };
  }

  throw new Error('Unable to load district datasets. Please ensure data files exist in public/data directory.');
}

/**
 * Validates dataset structure and required indicators
 */
export function validateDataset(payload) {
  if (!payload || !Array.isArray(payload.districts) || payload.districts.length === 0) {
    return false;
  }

  const sample = payload.districts[0];
  const requiredFields = [
    'districtCode',
    'districtName',
    'totalPopulation',
    'totalMigrants',
    'transport',
    'services',
    'indices'
  ];

  for (const field of requiredFields) {
    if (!(field in sample)) {
      console.error(`Validation error: Missing required field "${field}" in district data.`);
      return false;
    }
  }

  return true;
}

/**
 * Client-side XLSX reader (SheetJS) for user verification / direct file parsing
 */
export async function parseExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        resolve({
          sheetNames: workbook.SheetNames,
          rows: json,
          rowCount: json.length,
          colCount: json[0]?.length || 0
        });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

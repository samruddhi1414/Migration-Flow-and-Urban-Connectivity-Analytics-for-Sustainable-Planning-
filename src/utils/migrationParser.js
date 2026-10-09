/**
 * Migration Census 2011 Table D-03 Parser
 * Extracts strictly ONE total migration row per district to prevent double-counting.
 */

export function parseMigrationRecords(migrationRows) {
  const migrationMap = {};

  const toInt = (val) => {
    if (val === null || val === undefined) return 0;
    const n = parseInt(String(val).replace(/,/g, ''), 10);
    return isNaN(n) ? 0 : n;
  };

  for (let i = 4; i < migrationRows.length; i++) {
    const r = migrationRows[i];
    if (!r || r.length < 30) continue;

    const tbl = String(r[0] || '').trim();
    const st = String(r[1] || '').trim();
    const dcodeRaw = String(r[2] || '').trim();

    if (tbl !== 'D0603' || st !== '27' || dcodeRaw === '000' || dcodeRaw === 'None' || dcodeRaw === '') {
      continue;
    }

    let dcode = '';
    try {
      dcode = String(parseInt(dcodeRaw, 10)).padStart(3, '0');
    } catch {
      continue;
    }

    const areaName = String(r[3] || '').trim();
    const enumType = String(r[4] || '').trim();
    const duration = String(r[5] || '').trim();
    const lastRes = String(r[6] || '').trim();
    const lastResTru = String(r[7] || '').trim();

    // Strictly match the single Total row per district
    if (enumType === 'Total' && duration.includes('All duration') && lastRes === 'Total' && lastResTru === 'Total') {
      migrationMap[dcode] = {
        districtCode: dcode,
        districtName: areaName,
        totalMigrants: toInt(r[8]),
        maleMigrants: toInt(r[9]),
        femaleMigrants: toInt(r[10]),
        workMigrants: toInt(r[11]),
        businessMigrants: toInt(r[14]),
        educationMigrants: toInt(r[17]),
        marriageMigrants: toInt(r[20]),
        movedAfterBirth: toInt(r[23]),
        movedWithHousehold: toInt(r[26]),
        otherMigrants: toInt(r[29])
      };
    }
  }

  return migrationMap;
}

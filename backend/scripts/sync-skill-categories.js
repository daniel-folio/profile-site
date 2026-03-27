const fs = require('fs');
const path = require('path');

// --- 공통 유틸: TS 파일에서 배열 추출 ---
function extractArrayFromTsFile(filePath, constName) {
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️ [Sync] File not found: ${filePath}`);
    return null;
  }
  const content = fs.readFileSync(filePath, 'utf8');
  const regex = new RegExp(`export const ${constName} = \\[\\s*([\\s\\S]*?)\\s*\\]`);
  const match = content.match(regex);
  if (!match) {
    console.warn(`⚠️ [Sync] Could not find '${constName}' in ${filePath}`);
    return null;
  }
  return match[1]
    .split(',')
    .map(s => s.trim().replace(/^['"](.*)['"]$/, '$1'))
    .filter(s => s.length > 0 && !s.startsWith('//'));
}

// --- 공통 유틸: 스키마 Enum 업데이트 ---
function syncEnumToSchema(schemaPath, attributeName, newValues, label) {
  if (!fs.existsSync(schemaPath)) {
    console.warn(`⚠️ [Sync] Backend schema not found: ${schemaPath}`);
    return;
  }
  const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
  const attr = schema.attributes[attributeName];
  if (!attr || attr.type !== 'enumeration') {
    console.warn(`⚠️ [Sync] '${attributeName}' is not an enumeration in ${schemaPath}`);
    return;
  }
  const current = JSON.stringify(attr.enum);
  const next = JSON.stringify(newValues);
  if (current !== next) {
    schema.attributes[attributeName].enum = newValues;
    fs.writeFileSync(schemaPath, JSON.stringify(schema, null, 2) + '\n');
    console.log(`✅ [Sync] ${label} → schema.json enum updated.`);
  } else {
    console.log(`✅ [Sync] ${label} → already up to date.`);
  }
}

// ------- 1. 스킬 카테고리 동기화 -------
try {
  const skillCategories = extractArrayFromTsFile(
    path.join(__dirname, '../../frontend/src/lib/skillCategories.ts'),
    'SKILL_CATEGORY_ORDER'
  );
  if (skillCategories) {
    syncEnumToSchema(
      path.join(__dirname, '../src/api/skill/content-types/skill/schema.json'),
      'category',
      skillCategories,
      'Skill categories'
    );
  }
} catch (e) {
  console.error('⚠️ [Sync] Skill categories sync failed:', e.message);
}

// ------- 2. 프로젝트 카테고리 동기화 -------
try {
  const projectCategories = extractArrayFromTsFile(
    path.join(__dirname, '../../frontend/src/lib/projectCategories.ts'),
    'PROJECT_CATEGORY_ORDER'
  );
  if (projectCategories) {
    syncEnumToSchema(
      path.join(__dirname, '../src/api/project/content-types/project/schema.json'),
      'projectType',
      projectCategories,
      'Project categories'
    );
  }
} catch (e) {
  console.error('⚠️ [Sync] Project categories sync failed:', e.message);
}

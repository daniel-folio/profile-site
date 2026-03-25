const fs = require('fs');
const path = require('path');

// 경로 설정: frontend의 원본(SSOT)과 backend의 스키마 파일 위치
const tsFilePath = path.join(__dirname, '../../frontend/src/lib/skillCategories.ts');
const schemaPath = path.join(__dirname, '../src/api/skill/content-types/skill/schema.json');

try {
  if (!fs.existsSync(tsFilePath)) {
    console.warn(`⚠️ [Sync] Frontend categories file not found at ${tsFilePath}`);
    process.exit(0);
  }

  const tsContent = fs.readFileSync(tsFilePath, 'utf8');
  // 배열 내부 값 추출을 위한 정규식
  const match = tsContent.match(/export const SKILL_CATEGORY_ORDER = \[\s*([\s\S]*?)\s*\];/);
  
  if (!match) {
    console.error('⚠️ [Sync] Could not find SKILL_CATEGORY_ORDER array in skillCategories.ts');
    process.exit(0); // 빌드를 막지 않기 위해 non-fatal 처리
  }

  // 문자열 추출 및 정제
  const categories = match[1]
    .split(',')
    .map(s => s.trim().replace(/^['"](.*)['"]$/, '$1'))
    .filter(s => s.length > 0 && !s.startsWith('//'));

  if (!fs.existsSync(schemaPath)) {
    console.warn(`⚠️ [Sync] Backend schema file not found at ${schemaPath}`);
    process.exit(0);
  }

  const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));

  // Enum 업데이트 로직
  if (schema.attributes.category && schema.attributes.category.type === 'enumeration') {
    const currentEnum = JSON.stringify(schema.attributes.category.enum);
    const newEnum = JSON.stringify(categories);
    
    if (currentEnum !== newEnum) {
      schema.attributes.category.enum = categories;
      fs.writeFileSync(schemaPath, JSON.stringify(schema, null, 2) + '\n');
      console.log('✅ [Sync] Successfully synced skill categories from frontend to Strapi schema.json');
    } else {
      console.log('✅ [Sync] Skill categories are already up to date.');
    }
  } else {
    console.warn('⚠️ [Sync] Category attribute is missing or not an enumeration in schema.json');
  }
} catch (error) {
  console.error('⚠️ [Sync] Failed to sync skill categories:', error.message);
}

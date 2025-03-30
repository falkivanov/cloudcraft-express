
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const filesToUpdate = [
  'src/components/file-upload/processors/BaseFileProcessor.ts',
  'src/components/file-upload/processors/FileProcessor.ts',
  'src/components/file-upload/processors/ScorecardProcessor.ts',
  'src/components/file-upload/useFileUpload.ts',
  'src/components/fleet/vehicle-details/form/EmployeeSelect.tsx',
  'src/components/quality/hooks/useQualityData.ts',
  'src/components/quality/scorecard/data/dataProvider.ts',
  'src/components/quality/scorecard/data/weeks/week11/driverKPIs.ts',
  'src/components/quality/scorecard/hooks/useScorecardWeek.tsx',
  'src/components/quality/scorecard/utils/parser/extractionStrategies.ts',
  'src/components/quality/scorecard/utils/pdfParser.ts',
  'src/hooks/useVehicleData.tsx'
];

filesToUpdate.forEach(filePath => {
  const fullPath = path.join(rootDir, filePath);
  let content = fs.readFileSync(fullPath, 'utf8');
  
  // Replace '@/utils/storageUtils' with '@/utils/storage'
  content = content.replace(/@\/utils\/storageUtils/g, '@/utils/storage');
  
  fs.writeFileSync(fullPath, content);
  console.log(`Updated imports in ${filePath}`);
});

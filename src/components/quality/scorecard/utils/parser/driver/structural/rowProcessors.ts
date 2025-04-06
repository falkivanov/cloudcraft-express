
// This file is no longer needed as it's been refactored into smaller files
// The functionality has been moved to:
// - src/components/quality/scorecard/utils/parser/driver/processors/dataRowProcessor.ts
// - src/components/quality/scorecard/utils/parser/driver/processors/singleRowProcessor.ts
// - src/components/quality/scorecard/utils/parser/driver/processors/tableProcessor.ts
// - src/components/quality/scorecard/utils/parser/driver/processors/metricUtils.ts
// - src/components/quality/scorecard/utils/parser/driver/processors/constants.ts

// Import and re-export from the new location for backward compatibility
import {
  processDataRows,
  processDriverRow
} from '../../driver/processors';

export {
  processDataRows,
  processDriverRow
};

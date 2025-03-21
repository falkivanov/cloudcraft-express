
// Export all week data functions
export { getWeek6Data } from './week6';
export { getWeek7Data } from './week7';
export { getWeek8Data } from './week8';
export { getWeek9Data } from './week9';
export { getWeek10Data } from './week10'; // Renamed from getDummyScoreCardData
export { getWeek11Data } from './week11';

// Maintain backward compatibility with dummy data
export { getWeek10Data as getDummyScoreCardData } from './week10';

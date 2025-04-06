
export interface WeekOption {
  id: string;
  label: string;
  weekNum?: number;
  year?: number;
  date?: Date;
}

export interface CustomerContactWeekData {
  id: string;
  label: string;
  weekNum: number;
  year: number;
}

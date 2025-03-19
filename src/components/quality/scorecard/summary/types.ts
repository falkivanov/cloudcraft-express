
import { ScoreCardData } from "../types";

export interface MetricChangeInfo {
  difference: number;
  percentChange: number;
  isPositive: boolean;
}

export interface RankChangeInfo {
  icon: JSX.Element;
  color: string;
}

export interface SummaryCardProps {
  title: string;
  icon: JSX.Element;
  value: number | string;
  status?: string;
  statusColorClass?: string;
  change?: MetricChangeInfo | null;
  previousValue?: number | string;
  rankChangeInfo?: RankChangeInfo | null;
  rankNote?: string;
}


import { Wave, WaveAssignment } from "../../types/wave-types";

export interface WaveState {
  waves: Wave[];
  waveCount: number;
}

export interface DistributionOptions {
  applyEvenlyForRemaining?: boolean;
}

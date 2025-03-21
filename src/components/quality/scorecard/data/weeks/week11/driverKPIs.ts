
import { DriverKPI } from "../../../types";
import { getDriverGroup1 } from "./driverGroups/group1";
import { getDriverGroup2 } from "./driverGroups/group2";
import { getDriverGroup3 } from "./driverGroups/group3";
import { getDriverGroup4 } from "./driverGroups/group4";
import { getDriverGroup5 } from "./driverGroups/group5";

export const getDriverKPIs = (): DriverKPI[] => {
  return [
    ...getDriverGroup1(),
    ...getDriverGroup2(),
    ...getDriverGroup3(),
    ...getDriverGroup4(),
    ...getDriverGroup5()
  ];
};

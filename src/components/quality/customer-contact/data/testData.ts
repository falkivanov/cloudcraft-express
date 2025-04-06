
import { DriverComplianceData } from "../types";

// Test data for KW11 2025 with actual employees only
export const getKW11TestData = (): DriverComplianceData[] => {
  return [
    { name: "Seif Jidi", firstName: "Seif", totalAddresses: 7, totalContacts: 5, compliancePercentage: 71.43 },
    { name: "Yozdshan Mehmedaliev", firstName: "Yozdshan", totalAddresses: 8, totalContacts: 7, compliancePercentage: 87.50 },
    { name: "Ivan Stanev Ivanov", firstName: "Ivan", totalAddresses: 104, totalContacts: 102, compliancePercentage: 98.08 },
    { name: "Ahmad Nikdan", firstName: "Ahmad", totalAddresses: 97, totalContacts: 96, compliancePercentage: 98.97 },
    { name: "Anca Radu", firstName: "Anca", totalAddresses: 29, totalContacts: 29, compliancePercentage: 100.00 },
    { name: "Marian Asavaoei", firstName: "Marian", totalAddresses: 44, totalContacts: 42, compliancePercentage: 95.45 },
    { name: "Samuel Kłein", firstName: "Samuel", totalAddresses: 94, totalContacts: 81, compliancePercentage: 86.17 },
    { name: "Ayman Gozdalski", firstName: "Ayman", totalAddresses: 31, totalContacts: 31, compliancePercentage: 100.00 },
    { name: "Marios Zlatanov", firstName: "Marios", totalAddresses: 78, totalContacts: 77, compliancePercentage: 98.72 },
    { name: "Dennis Benna", firstName: "Dennis", totalAddresses: 3, totalContacts: 3, compliancePercentage: 100.00 },
    { name: "Paul Atandi", firstName: "Paul", totalAddresses: 1, totalContacts: 1, compliancePercentage: 100.00 },
    { name: "Robert Toma", firstName: "Robert", totalAddresses: 304, totalContacts: 300, compliancePercentage: 98.68 },
    { name: "Dumitru Tarlev", firstName: "Dumitru", totalAddresses: 49, totalContacts: 48, compliancePercentage: 97.96 },
    { name: "Tim Zimmermann", firstName: "Tim", totalAddresses: 133, totalContacts: 132, compliancePercentage: 99.25 },
    { name: "Ionut Paraschiv", firstName: "Ionut", totalAddresses: 3, totalContacts: 3, compliancePercentage: 100.00 },
    { name: "Laurentiu Plaveti", firstName: "Laurentiu", totalAddresses: 35, totalContacts: 34, compliancePercentage: 97.14 },
    { name: "Ghamgin Abdullah", firstName: "Ghamgin", totalAddresses: 55, totalContacts: 52, compliancePercentage: 94.55 },
    { name: "Oleksandr Voitenko", firstName: "Oleksandr", totalAddresses: 64, totalContacts: 64, compliancePercentage: 100.00 },
    { name: "Yusufi Bilyal", firstName: "Yusufi", totalAddresses: 1, totalContacts: 0, compliancePercentage: 0 },
    { name: "Aleks Mihaylov", firstName: "Aleks", totalAddresses: 16, totalContacts: 11, compliancePercentage: 68.75 },
    { name: "Dorinel Draghiceanu", firstName: "Dorinel", totalAddresses: 16, totalContacts: 14, compliancePercentage: 87.50 },
    { name: "Razvan Plaveti", firstName: "Razvan", totalAddresses: 54, totalContacts: 53, compliancePercentage: 98.15 },
    { name: "Salar Kafli", firstName: "Salar", totalAddresses: 149, totalContacts: 148, compliancePercentage: 99.33 },
    { name: "Maksym Shamov", firstName: "Maksym", totalAddresses: 128, totalContacts: 127, compliancePercentage: 99.22 },
    { name: "Vladyslav Plakhotin", firstName: "Vladyslav", totalAddresses: 256, totalContacts: 255, compliancePercentage: 99.61 },
    { name: "Rodica Pall", firstName: "Rodica", totalAddresses: 37, totalContacts: 35, compliancePercentage: 94.59 },
    { name: "Petre Nicolae", firstName: "Petre", totalAddresses: 19, totalContacts: 17, compliancePercentage: 89.47 },
    { name: "Kim Uwe Rixecker", firstName: "Kim", totalAddresses: 5, totalContacts: 5, compliancePercentage: 100.00 },
    { name: "Razvan Stan", firstName: "Razvan", totalAddresses: 137, totalContacts: 124, compliancePercentage: 90.51 }
  ];
};

// Generate HTML test data for KW11 2025
export const getKW11TestHTMLData = (): string => {
  const html = `
    <h1>DE-MASC-DSU1 Contact Compliance Report 2025-11</h1>
    <div>
      <h2>Driver Summary</h2>
      <table border="1" cellpadding="5" cellspacing="0">
        <tr>
          <th>Transporter ID</th>
          <th>Total Addresses</th>
          <th>Total Contacts</th>
          <th>Contact Compliance</th>
        </tr>
        <tr>
          <td>A152NJJUHX8M2KZ</td>
          <td>7</td>
          <td>5</td>
          <td>71.43%</td>
        </tr>
        <tr>
          <td>A196ZSP1F736F2</td>
          <td>8</td>
          <td>7</td>
          <td>87.50%</td>
        </tr>
        <tr>
          <td>A1926P63C711MX</td>
          <td>104</td>
          <td>102</td>
          <td>98.08%</td>
        </tr>
        <tr>
          <td>A1OPT5SF1TG664</td>
          <td>97</td>
          <td>96</td>
          <td>98.97%</td>
        </tr>
        <tr>
          <td>A2B3B877JZL11I</td>
          <td>29</td>
          <td>29</td>
          <td>100.00%</td>
        </tr>
        <tr>
          <td>A2MJVR7N7XD7Q8</td>
          <td>44</td>
          <td>42</td>
          <td>95.45%</td>
        </tr>
        <tr>
          <td>A2UHP1W6T1BCMC</td>
          <td>94</td>
          <td>81</td>
          <td>86.17%</td>
        </tr>
        <tr>
          <td>A2Q07SAZ5Y0VFY</td>
          <td>31</td>
          <td>31</td>
          <td>100.00%</td>
        </tr>
        <tr>
          <td>A2V82R55OSF7X8</td>
          <td>78</td>
          <td>77</td>
          <td>98.72%</td>
        </tr>
        <tr>
          <td>A2V82R55OSFX14</td>
          <td>3</td>
          <td>3</td>
          <td>100.00%</td>
        </tr>
        <tr>
          <td>A3C3GA8F8JETVE</td>
          <td>1</td>
          <td>1</td>
          <td>100.00%</td>
        </tr>
        <tr>
          <td>A3DIG631DG25QY</td>
          <td>304</td>
          <td>300</td>
          <td>98.68%</td>
        </tr>
        <tr>
          <td>A3N2BRRNP752ZQ</td>
          <td>49</td>
          <td>48</td>
          <td>97.96%</td>
        </tr>
        <tr>
          <td>A3N2BRRXP752ZR</td>
          <td>133</td>
          <td>132</td>
          <td>99.25%</td>
        </tr>
        <tr>
          <td>A3SL76UAGX66QN</td>
          <td>3</td>
          <td>3</td>
          <td>100.00%</td>
        </tr>
        <tr>
          <td>A3TNJMKRYZAJT</td>
          <td>35</td>
          <td>34</td>
          <td>97.14%</td>
        </tr>
        <tr>
          <td>A3VCXA6YWV5RY2</td>
          <td>55</td>
          <td>52</td>
          <td>94.55%</td>
        </tr>
        <tr>
          <td>A8IR8HQXDC559</td>
          <td>64</td>
          <td>64</td>
          <td>100.00%</td>
        </tr>
        <tr>
          <td>A10VZ0WWQQNSX1</td>
          <td>1</td>
          <td>0</td>
          <td>0.00%</td>
        </tr>
        <tr>
          <td>A202LSZPWHAUZ8</td>
          <td>16</td>
          <td>11</td>
          <td>68.75%</td>
        </tr>
        <tr>
          <td>A202LSZPWHAUZ7</td>
          <td>16</td>
          <td>14</td>
          <td>87.50%</td>
        </tr>
        <tr>
          <td>A3SLMUAGX66QM</td>
          <td>54</td>
          <td>53</td>
          <td>98.15%</td>
        </tr>
        <tr>
          <td>A3TNJMKFYZAJS</td>
          <td>149</td>
          <td>148</td>
          <td>99.33%</td>
        </tr>
        <tr>
          <td>A3S1VUGX6QM</td>
          <td>128</td>
          <td>127</td>
          <td>99.22%</td>
        </tr>
        <tr>
          <td>A3TN7KRYZAJS</td>
          <td>256</td>
          <td>255</td>
          <td>99.61%</td>
        </tr>
        <tr>
          <td>A3PWR98298A4D</td>
          <td>37</td>
          <td>35</td>
          <td>94.59%</td>
        </tr>
        <tr>
          <td>A3PWRO87291A4C</td>
          <td>19</td>
          <td>17</td>
          <td>89.47%</td>
        </tr>
        <tr>
          <td>AFEWTT1RO68B</td>
          <td>5</td>
          <td>5</td>
          <td>100.00%</td>
        </tr>
        <tr>
          <td>A3G57M6GUHDOR1</td>
          <td>137</td>
          <td>124</td>
          <td>90.51%</td>
        </tr>
      </table>
    </div>
  `;
  return html;
};

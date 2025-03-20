
import { DriverComplianceData } from "./types";

// Generate personalized message for drivers with compliance below 98%
export const generateDriverMessage = (driver: DriverComplianceData) => {
  const missingContacts = driver.totalAddresses - driver.totalContacts;
  return `Hi ${driver.firstName}, letzte Woche musstest du ${driver.totalAddresses} Kunden kontaktieren, hast aber nur ${driver.totalContacts} kontaktiert (${missingContacts} fehlende Kontakte). Bitte versuch diese Woche auf 100% zu kommen.`;
};

// Style for compliance values
export const getComplianceStyle = (percentage: number) => {
  if (percentage < 85) return "bg-red-100 text-red-800 font-semibold";
  if (percentage < 98) return "bg-amber-100 text-amber-800 font-semibold";
  return "bg-green-100 text-green-800 font-semibold";
};

export const getProgressColor = (percentage: number) => {
  if (percentage < 85) return "bg-red-500";
  if (percentage < 98) return "bg-amber-500";
  return "bg-green-500";
};

// Test data for KW11 2025
export const getKW11TestData = (): DriverComplianceData[] => {
  return [
    { name: "Michael Schmidt (A13JMD0G4ND0QP)", firstName: "Michael", totalAddresses: 1, totalContacts: 0, compliancePercentage: 0 },
    { name: "Lukas Weber (AFEKFKJRBZPAJ)", firstName: "Lukas", totalAddresses: 37, totalContacts: 12, compliancePercentage: 32.43 },
    { name: "Emma Müller (A2O2LSZPWHAUZ9)", firstName: "Emma", totalAddresses: 16, totalContacts: 11, compliancePercentage: 68.75 },
    { name: "Sophie Wagner (A152NJUHX8M2KZ)", firstName: "Sophie", totalAddresses: 7, totalContacts: 5, compliancePercentage: 71.43 },
    { name: "Felix Becker (A11VMJUKO6L3PR)", firstName: "Felix", totalAddresses: 55, totalContacts: 41, compliancePercentage: 74.55 },
    { name: "Daniel Fischer (ADIJZKWF55MKF)", firstName: "Daniel", totalAddresses: 10, totalContacts: 8, compliancePercentage: 80.00 },
    { name: "Julia Schneider (A3TWNMMACBJY9F)", firstName: "Julia", totalAddresses: 36, totalContacts: 30, compliancePercentage: 83.33 },
    { name: "Thomas Schäfer (A3K5L8S7OQ1XTO)", firstName: "Thomas", totalAddresses: 14, totalContacts: 12, compliancePercentage: 85.71 },
    { name: "Anna Koch (A2UHPLW6T1BCMG)", firstName: "Anna", totalAddresses: 94, totalContacts: 81, compliancePercentage: 86.17 },
    { name: "Markus Schulz (A3PWRO98298A4C)", firstName: "Markus", totalAddresses: 16, totalContacts: 14, compliancePercentage: 87.50 },
    { name: "Nina Hoffmann (A196ZSPLF236F2)", firstName: "Nina", totalAddresses: 8, totalContacts: 7, compliancePercentage: 87.50 },
    { name: "Tobias Richter (A2JPYZS80JHMK0)", firstName: "Tobias", totalAddresses: 19, totalContacts: 17, compliancePercentage: 89.47 },
    { name: "Katharina Schröder (A3J7QG6AJVB55I)", firstName: "Katharina", totalAddresses: 137, totalContacts: 124, compliancePercentage: 90.51 },
    { name: "Jan Neumann (A2LPAE5ZS2S1B8)", firstName: "Jan", totalAddresses: 11, totalContacts: 10, compliancePercentage: 90.91 },
    { name: "Lisa Krüger (A2HZRFY1S2TQDA)", firstName: "Lisa", totalAddresses: 25, totalContacts: 23, compliancePercentage: 92.00 },
    { name: "Martin Schwarz (A3E6DFN30CWSTJ)", firstName: "Martin", totalAddresses: 162, totalContacts: 151, compliancePercentage: 93.21 },
    { name: "Sabine Werner (A39C0B8K7Q9AFR)", firstName: "Sabine", totalAddresses: 54, totalContacts: 51, compliancePercentage: 94.44 },
    { name: "Peter König (A3VCXA6YWVSRY1)", firstName: "Peter", totalAddresses: 55, totalContacts: 52, compliancePercentage: 94.55 },
    { name: "Lena Huber (A2LSJD2RSS0U7)", firstName: "Lena", totalAddresses: 37, totalContacts: 35, compliancePercentage: 94.59 },
    { name: "Christian Wolf (A1WAR63W2VKZ92)", firstName: "Christian", totalAddresses: 39, totalContacts: 37, compliancePercentage: 94.87 },
    { name: "Sandra Bauer (AFEW6TT1R068A)", firstName: "Sandra", totalAddresses: 42, totalContacts: 40, compliancePercentage: 95.24 },
    { name: "Florian Meyer (A2MJVR7N7XD7Q7)", firstName: "Florian", totalAddresses: 44, totalContacts: 42, compliancePercentage: 95.45 },
    { name: "Stefanie Keller (A3TNJMKRYZAJS)", firstName: "Stefanie", totalAddresses: 35, totalContacts: 34, compliancePercentage: 97.14 },
    { name: "Robert Lang (A17HETLL9XXO3)", firstName: "Robert", totalAddresses: 36, totalContacts: 35, compliancePercentage: 97.22 },
    { name: "Melanie Fuchs (A21OHX147OT3Y3)", firstName: "Melanie", totalAddresses: 45, totalContacts: 44, compliancePercentage: 97.78 },
    { name: "Tim Zimmermann (A3N2BRRNP752ZQ)", firstName: "Tim", totalAddresses: 49, totalContacts: 48, compliancePercentage: 97.96 },
    { name: "Nicole Braun (A1926P63C7L1MX)", firstName: "Nicole", totalAddresses: 104, totalContacts: 102, compliancePercentage: 98.08 },
    { name: "Andreas Schmitt (AW3332YL5B5OX)", firstName: "Andreas", totalAddresses: 54, totalContacts: 53, compliancePercentage: 98.15 },
    { name: "Laura Krause (A3DIG631DG25QY)", firstName: "Laura", totalAddresses: 304, totalContacts: 300, compliancePercentage: 98.68 },
    { name: "Marc Hartmann (A2V82R55OSFX13)", firstName: "Marc", totalAddresses: 78, totalContacts: 77, compliancePercentage: 98.72 },
    { name: "Christine Maier (A10PTSFT1G664)", firstName: "Christine", totalAddresses: 97, totalContacts: 96, compliancePercentage: 98.97 }
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
          <td>A13JMD0G4ND0QP</td>
          <td>1</td>
          <td>0</td>
          <td>0.00%</td>
        </tr>
        <tr>
          <td>AFEKFKJRBZPAJ</td>
          <td>37</td>
          <td>12</td>
          <td>32.43%</td>
        </tr>
        <tr>
          <td>A2O2LSZPWHAUZ9</td>
          <td>16</td>
          <td>11</td>
          <td>68.75%</td>
        </tr>
        <tr>
          <td>A152NJUHX8M2KZ</td>
          <td>7</td>
          <td>5</td>
          <td>71.43%</td>
        </tr>
        <tr>
          <td>A11VMJUKO6L3PR</td>
          <td>55</td>
          <td>41</td>
          <td>74.55%</td>
        </tr>
        <tr>
          <td>ADIJZKWF55MKF</td>
          <td>10</td>
          <td>8</td>
          <td>80.00%</td>
        </tr>
        <tr>
          <td>A3TWNMMACBJY9F</td>
          <td>36</td>
          <td>30</td>
          <td>83.33%</td>
        </tr>
        <tr>
          <td>A3K5L8S7OQ1XTO</td>
          <td>14</td>
          <td>12</td>
          <td>85.71%</td>
        </tr>
        <tr>
          <td>A2UHPLW6T1BCMG</td>
          <td>94</td>
          <td>81</td>
          <td>86.17%</td>
        </tr>
        <tr>
          <td>A3PWRO98298A4C</td>
          <td>16</td>
          <td>14</td>
          <td>87.50%</td>
        </tr>
        <tr>
          <td>A196ZSPLF236F2</td>
          <td>8</td>
          <td>7</td>
          <td>87.50%</td>
        </tr>
        <tr>
          <td>A2JPYZS80JHMK0</td>
          <td>19</td>
          <td>17</td>
          <td>89.47%</td>
        </tr>
        <tr>
          <td>A3J7QG6AJVB55I</td>
          <td>137</td>
          <td>124</td>
          <td>90.51%</td>
        </tr>
        <tr>
          <td>A2LPAE5ZS2S1B8</td>
          <td>11</td>
          <td>10</td>
          <td>90.91%</td>
        </tr>
        <tr>
          <td>A2HZRFY1S2TQDA</td>
          <td>25</td>
          <td>23</td>
          <td>92.00%</td>
        </tr>
        <tr>
          <td>A3E6DFN30CWSTJ</td>
          <td>162</td>
          <td>151</td>
          <td>93.21%</td>
        </tr>
        <tr>
          <td>A39C0B8K7Q9AFR</td>
          <td>54</td>
          <td>51</td>
          <td>94.44%</td>
        </tr>
        <tr>
          <td>A3VCXA6YWVSRY1</td>
          <td>55</td>
          <td>52</td>
          <td>94.55%</td>
        </tr>
        <tr>
          <td>A2LSJD2RSS0U7</td>
          <td>37</td>
          <td>35</td>
          <td>94.59%</td>
        </tr>
        <tr>
          <td>A1WAR63W2VKZ92</td>
          <td>39</td>
          <td>37</td>
          <td>94.87%</td>
        </tr>
        <tr>
          <td>AFEW6TT1R068A</td>
          <td>42</td>
          <td>40</td>
          <td>95.24%</td>
        </tr>
        <tr>
          <td>A2MJVR7N7XD7Q7</td>
          <td>44</td>
          <td>42</td>
          <td>95.45%</td>
        </tr>
        <tr>
          <td>A3TNJMKRYZAJS</td>
          <td>35</td>
          <td>34</td>
          <td>97.14%</td>
        </tr>
        <tr>
          <td>A17HETLL9XXO3</td>
          <td>36</td>
          <td>35</td>
          <td>97.22%</td>
        </tr>
        <tr>
          <td>A21OHX147OT3Y3</td>
          <td>45</td>
          <td>44</td>
          <td>97.78%</td>
        </tr>
        <tr>
          <td>A3N2BRRNP752ZQ</td>
          <td>49</td>
          <td>48</td>
          <td>97.96%</td>
        </tr>
        <tr>
          <td>A1926P63C7L1MX</td>
          <td>104</td>
          <td>102</td>
          <td>98.08%</td>
        </tr>
        <tr>
          <td>AW3332YL5B5OX</td>
          <td>54</td>
          <td>53</td>
          <td>98.15%</td>
        </tr>
        <tr>
          <td>A3DIG631DG25QY</td>
          <td>304</td>
          <td>300</td>
          <td>98.68%</td>
        </tr>
        <tr>
          <td>A2V82R55OSFX13</td>
          <td>78</td>
          <td>77</td>
          <td>98.72%</td>
        </tr>
        <tr>
          <td>A10PTSFT1G664</td>
          <td>97</td>
          <td>96</td>
          <td>98.97%</td>
        </tr>
      </table>
    </div>
  `;
  return html;
};

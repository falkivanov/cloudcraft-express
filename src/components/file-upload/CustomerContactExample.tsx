
import React from "react";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

const CustomerContactExample = () => {
  const exampleHtml = `
<!DOCTYPE html>
<html>
<head>
  <title>DE-MASC-DSOT Contact Compliance Report 2023-10</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f2f2f2; }
    tr:nth-child(even) { background-color: #f9f9f9; }
    h1, h2 { text-align: center; }
    .high-compliance { color: green; }
    .medium-compliance { color: orange; }
    .low-compliance { color: red; }
  </style>
</head>
<body>
  <h1>DE-MASC-DSOT Contact Compliance Report 2023-10</h1>
  
  <h2>Driver Summary</h2>
  <table>
    <tr>
      <th>Transporter ID</th>
      <th>Total Addresses</th>
      <th>Total Contacts</th>
      <th>Contact Compliance</th>
    </tr>
    <tr>
      <td>A152NJUHX8M2KZ</td>
      <td>11</td>
      <td>1</td>
      <td class="low-compliance">9.09%</td>
    </tr>
    <tr>
      <td>ADJZKWFS5MKF</td>
      <td>9</td>
      <td>5</td>
      <td class="low-compliance">55.56%</td>
    </tr>
    <tr>
      <td>A210HYCUI5QEHH</td>
      <td>36</td>
      <td>24</td>
      <td class="medium-compliance">66.67%</td>
    </tr>
    <tr>
      <td>A2QQ7SAZ5YNVFY</td>
      <td>8</td>
      <td>6</td>
      <td class="medium-compliance">75.00%</td>
    </tr>
    <tr>
      <td>A2LSJD2RSBS0U7</td>
      <td>17</td>
      <td>13</td>
      <td class="medium-compliance">76.47%</td>
    </tr>
    <tr>
      <td>A3VCXABYWVSRY1</td>
      <td>53</td>
      <td>41</td>
      <td class="medium-compliance">77.36%</td>
    </tr>
    <tr>
      <td>A3DIG631DG25QY</td>
      <td>151</td>
      <td>117</td>
      <td class="medium-compliance">77.48%</td>
    </tr>
    <tr>
      <td>AW3332YL5B5OX</td>
      <td>55</td>
      <td>43</td>
      <td class="medium-compliance">78.18%</td>
    </tr>
    <tr>
      <td>A196ZSPLRZ36F2</td>
      <td>19</td>
      <td>15</td>
      <td class="medium-compliance">78.95%</td>
    </tr>
    <tr>
      <td>A2UHPLW6TIBCMG</td>
      <td>44</td>
      <td>35</td>
      <td class="medium-compliance">79.55%</td>
    </tr>
    <tr>
      <td>ACYZ1MJ3N1Y6L</td>
      <td>5</td>
      <td>4</td>
      <td class="high-compliance">80.00%</td>
    </tr>
    <tr>
      <td>A1926P63C7L1MX</td>
      <td>107</td>
      <td>90</td>
      <td class="high-compliance">84.11%</td>
    </tr>
    <tr>
      <td>A39C0B8K7Q9AFR</td>
      <td>85</td>
      <td>72</td>
      <td class="high-compliance">84.71%</td>
    </tr>
    <tr>
      <td>A2O2LSZPWHAUZ9</td>
      <td>37</td>
      <td>32</td>
      <td class="high-compliance">86.49%</td>
    </tr>
    <tr>
      <td>A1IVMJUKO6L3PR</td>
      <td>25</td>
      <td>22</td>
      <td class="high-compliance">88.00%</td>
    </tr>
    <tr>
      <td>A10PTFSFT1G664</td>
      <td>47</td>
      <td>42</td>
      <td class="high-compliance">89.36%</td>
    </tr>
    <tr>
      <td>A3TWNMMACBJY9F</td>
      <td>29</td>
      <td>26</td>
      <td class="high-compliance">89.66%</td>
    </tr>
    <tr>
      <td>A17HETILL9XXO3</td>
      <td>11</td>
      <td>10</td>
      <td class="high-compliance">90.91%</td>
    </tr>
    <tr>
      <td>A2HZRFY1S2TQDA</td>
      <td>27</td>
      <td>25</td>
      <td class="high-compliance">92.59%</td>
    </tr>
    <tr>
      <td>A2NPJB1DNCQSWT</td>
      <td>116</td>
      <td>108</td>
      <td class="high-compliance">93.10%</td>
    </tr>
  </table>

  <h2>Compliance Summary</h2>
  <table>
    <tr>
      <th>Compliance Level</th>
      <th>Number of Transporters</th>
      <th>Percentage</th>
    </tr>
    <tr>
      <td class="high-compliance">High (80%+)</td>
      <td>12</td>
      <td>60%</td>
    </tr>
    <tr>
      <td class="medium-compliance">Medium (60-79%)</td>
      <td>6</td>
      <td>30%</td>
    </tr>
    <tr>
      <td class="low-compliance">Low (Below 60%)</td>
      <td>2</td>
      <td>10%</td>
    </tr>
  </table>

  <h2>Monthly Trend</h2>
  <table>
    <tr>
      <th>Month</th>
      <th>Average Compliance</th>
      <th>Change</th>
    </tr>
    <tr>
      <td>August 2023</td>
      <td>72.5%</td>
      <td>-</td>
    </tr>
    <tr>
      <td>September 2023</td>
      <td>74.8%</td>
      <td>+2.3%</td>
    </tr>
    <tr>
      <td>October 2023</td>
      <td>78.3%</td>
      <td>+3.5%</td>
    </tr>
  </table>
</body>
</html>
  `;

  const downloadHtmlFile = () => {
    const element = document.createElement("a");
    const file = new Blob([exampleHtml], { type: "text/html" });
    element.href = URL.createObjectURL(file);
    element.download = "contact-compliance-report.html";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="p-4 border rounded-lg bg-muted mt-6">
      <h3 className="text-lg font-medium mb-4">Contact Compliance Beispiel-Datei</h3>
      <p className="mb-4">
        Sie können diese Beispiel-HTML-Datei herunterladen, um die Contact Compliance Report-Funktionalität zu testen. Der Bericht enthält Daten zum Fahrer-Compliance-Status.
      </p>
      <Button onClick={downloadHtmlFile} className="flex items-center gap-2">
        <FileText className="h-4 w-4" />
        Contact Compliance Report herunterladen
      </Button>
    </div>
  );
};

export default CustomerContactExample;

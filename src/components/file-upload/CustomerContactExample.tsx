
import React from "react";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

const CustomerContactExample = () => {
  const exampleHtml = `
<!DOCTYPE html>
<html>
<head>
  <title>Customer Contact Weekly Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .header { background-color: #004D99; color: white; padding: 10px; text-align: center; }
    .summary { margin: 20px 0; padding: 15px; background-color: #f0f0f0; border-radius: 5px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f2f2f2; }
    tr:nth-child(even) { background-color: #f9f9f9; }
    .contact-type-email { color: #0066cc; }
    .contact-type-phone { color: #009900; }
    .contact-type-chat { color: #cc6600; }
    .status-resolved { color: green; }
    .status-pending { color: orange; }
    .priority-high { color: red; font-weight: bold; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Customer Contact Weekly Report</h1>
    <h2>Week 24 (June 10 - June 16, 2023)</h2>
  </div>
  
  <div class="summary">
    <h3>Weekly Summary</h3>
    <p>Total Contacts: 187</p>
    <p>Resolution Rate: 92%</p>
    <p>Average Response Time: 2.4 hours</p>
    <p>Satisfaction Score: 4.3/5.0</p>
  </div>
  
  <h3>Contact Details by Type</h3>
  <table>
    <tr>
      <th>Contact Type</th>
      <th>Count</th>
      <th>Percentage</th>
      <th>Avg. Resolution Time</th>
    </tr>
    <tr>
      <td class="contact-type-email">Email</td>
      <td>92</td>
      <td>49.2%</td>
      <td>3.1 hours</td>
    </tr>
    <tr>
      <td class="contact-type-phone">Phone</td>
      <td>68</td>
      <td>36.4%</td>
      <td>1.5 hours</td>
    </tr>
    <tr>
      <td class="contact-type-chat">Live Chat</td>
      <td>27</td>
      <td>14.4%</td>
      <td>0.8 hours</td>
    </tr>
  </table>
  
  <h3>Top Contact Reasons</h3>
  <table>
    <tr>
      <th>Reason</th>
      <th>Count</th>
      <th>Percentage</th>
    </tr>
    <tr>
      <td>Delivery Status</td>
      <td>58</td>
      <td>31.0%</td>
    </tr>
    <tr>
      <td>Shipping Delay</td>
      <td>43</td>
      <td>23.0%</td>
    </tr>
    <tr>
      <td>Package Damage</td>
      <td>24</td>
      <td>12.8%</td>
    </tr>
    <tr>
      <td>Billing Issue</td>
      <td>19</td>
      <td>10.2%</td>
    </tr>
    <tr>
      <td>Other</td>
      <td>43</td>
      <td>23.0%</td>
    </tr>
  </table>
  
  <h3>High Priority Cases</h3>
  <table>
    <tr>
      <th>Case ID</th>
      <th>Customer</th>
      <th>Issue</th>
      <th>Status</th>
      <th>Assigned To</th>
    </tr>
    <tr>
      <td>CS-2023-0142</td>
      <td>Mustermann GmbH</td>
      <td class="priority-high">Missing Delivery (3 Packages)</td>
      <td class="status-pending">Pending</td>
      <td>Julia Weber</td>
    </tr>
    <tr>
      <td>CS-2023-0158</td>
      <td>Schmidt Logistics</td>
      <td class="priority-high">Damaged Important Documents</td>
      <td class="status-resolved">Resolved</td>
      <td>Thomas Becker</td>
    </tr>
    <tr>
      <td>CS-2023-0163</td>
      <td>Delivery Express</td>
      <td class="priority-high">Significant Delivery Delay</td>
      <td class="status-resolved">Resolved</td>
      <td>Anna Schulz</td>
    </tr>
  </table>
  
  <h3>Customer Satisfaction Metrics</h3>
  <table>
    <tr>
      <th>Metric</th>
      <th>Current Week</th>
      <th>Previous Week</th>
      <th>Change</th>
    </tr>
    <tr>
      <td>Overall Satisfaction</td>
      <td>4.3/5.0</td>
      <td>4.1/5.0</td>
      <td>+0.2</td>
    </tr>
    <tr>
      <td>Resolution Speed</td>
      <td>4.0/5.0</td>
      <td>3.8/5.0</td>
      <td>+0.2</td>
    </tr>
    <tr>
      <td>Agent Helpfulness</td>
      <td>4.7/5.0</td>
      <td>4.6/5.0</td>
      <td>+0.1</td>
    </tr>
    <tr>
      <td>Issue Resolution</td>
      <td>4.2/5.0</td>
      <td>4.0/5.0</td>
      <td>+0.2</td>
    </tr>
  </table>
</body>
</html>
  `;

  const downloadHtmlFile = () => {
    const element = document.createElement("a");
    const file = new Blob([exampleHtml], { type: "text/html" });
    element.href = URL.createObjectURL(file);
    element.download = "customer-contact-example.html";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="p-4 border rounded-lg bg-muted mt-6">
      <h3 className="text-lg font-medium mb-4">Customer Contact Beispiel-Datei</h3>
      <p className="mb-4">
        Sie können diese Beispiel-HTML-Datei herunterladen, um die Customer Contact Report-Funktionalität zu testen.
      </p>
      <Button onClick={downloadHtmlFile} className="flex items-center gap-2">
        <FileText className="h-4 w-4" />
        Beispiel-HTML herunterladen
      </Button>
    </div>
  );
};

export default CustomerContactExample;

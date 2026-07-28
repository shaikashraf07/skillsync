const fs = require('fs');
const path = require('path');

function generateHtmlReport(results = [], outputPath = null) {
  const total = results.length;
  const passed = results.filter(r => r.status === 'PASSED' || r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAILED' || r.status === 'FAIL').length;
  const passRate = total > 0 ? ((passed / total) * 100).toFixed(2) : '0.00';

  const targetPath = outputPath || path.join(__dirname, '../reports/execution-report.html');
  const dir = path.dirname(targetPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>SkillSync Mobile Appium E2E Automation Report</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0F172A; color: #F8FAFC; margin: 0; padding: 24px; }
    .container { max-width: 1200px; margin: 0 auto; }
    .header { background: #1E293B; border-radius: 12px; padding: 24px; margin-bottom: 24px; border: 1px solid #334155; }
    .title { font-size: 26px; font-weight: bold; color: #38BDF8; margin: 0 0 8px 0; }
    .subtitle { font-size: 14px; color: #94A3B8; margin: 0; }
    .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
    .card { background: #1E293B; border-radius: 10px; padding: 20px; text-align: center; border: 1px solid #334155; }
    .card-num { font-size: 32px; font-weight: bold; margin: 4px 0; }
    .card-num.pass { color: #34D399; }
    .card-num.fail { color: #F87171; }
    .card-num.rate { color: #FBBF24; }
    .card-num.total { color: #38BDF8; }
    .card-label { font-size: 13px; color: #94A3B8; text-transform: uppercase; letter-spacing: 1px; }
    table { width: 100%; border-collapse: collapse; background: #1E293B; border-radius: 10px; overflow: hidden; border: 1px solid #334155; margin-bottom: 24px; }
    th { background: #0F172A; color: #94A3B8; text-align: left; padding: 14px 16px; font-size: 13px; text-transform: uppercase; border-bottom: 1px solid #334155; }
    td { padding: 12px 16px; font-size: 14px; border-bottom: 1px solid #334155; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: bold; }
    .badge-pass { background: rgba(52, 211, 153, 0.15); color: #34D399; }
    .badge-fail { background: rgba(248, 113, 113, 0.15); color: #F87171; }
    .footer { text-align: center; font-size: 13px; color: #64748B; margin-top: 32px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="title">📱 SkillSync Mobile Appium E2E Execution Report</div>
      <div class="subtitle">Comprehensive Automated Android Mobile Testing Suite • Target App: com.skillsync.app</div>
    </div>

    <div class="grid">
      <div class="card">
        <div class="card-label">Total Test Cases</div>
        <div class="card-num total">${total.toLocaleString()}</div>
      </div>
      <div class="card">
        <div class="card-label">Passed</div>
        <div class="card-num pass">${passed.toLocaleString()}</div>
      </div>
      <div class="card">
        <div class="card-label">Failed</div>
        <div class="card-num fail">${failed}</div>
      </div>
      <div class="card">
        <div class="card-label">Pass Rate</div>
        <div class="card-num rate">${passRate}%</div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Test ID</th>
          <th>Category</th>
          <th>Test Description / Assertion</th>
          <th>Duration</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${results.slice(0, 100).map(r => `
          <tr>
            <td><strong>${r.id}</strong></td>
            <td>${r.category}</td>
            <td>${r.testName}</td>
            <td>${r.durationMs} ms</td>
            <td><span class="badge ${r.status === 'PASSED' || r.status === 'PASS' ? 'badge-pass' : 'badge-fail'}">${r.status}</span></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    ${total > 100 ? `<div style="text-align: center; color: #94A3B8; font-size: 13px; margin-bottom: 24px;">Showing first 100 of ${total.toLocaleString()} test cases. Complete results exported to Excel sheet.</div>` : ''}

    <div class="footer">
      Generated automatically by SkillSync Mobile Appium Test Suite • ${new Date().toISOString()}
    </div>
  </div>
</body>
</html>`;

  fs.writeFileSync(targetPath, html);
  console.log(`[Appium HTML Reporter] HTML execution report generated: ${targetPath}`);
  return targetPath;
}

module.exports = generateHtmlReport;

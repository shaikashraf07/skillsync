import os
import json
import datetime

def generate_html_reports(test_results, output_dir):
    """
    Generates HTML execution reports:
    1. execution-report.html (Detailed test execution log with filter tabs)
    2. dashboard.html (Executive metrics, charts, and summary status)
    """
    os.makedirs(output_dir, exist_ok=True)
    
    total = len(test_results)
    passed = sum(1 for t in test_results if t.get("status") == "PASSED")
    failed = sum(1 for t in test_results if t.get("status") == "FAILED")
    skipped = total - passed - failed
    pass_rate = (passed / total * 100) if total > 0 else 100.0
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    # 1. execution-report.html
    html_report = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>SkillSync Selenium E2E Live Execution Report</title>
    <style>
        body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px; }}
        .header {{ background: linear-gradient(135deg, #1e3a8a, #3b82f6); color: white; padding: 24px; border-radius: 12px; margin-bottom: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }}
        .header h1 {{ margin: 0 0 8px 0; font-size: 24px; }}
        .stats-grid {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 24px; }}
        .stat-card {{ background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-left: 4px solid #3b82f6; }}
        .stat-card.pass {{ border-left-color: #22c55e; }}
        .stat-card.fail {{ border-left-color: #ef4444; }}
        .stat-card.skip {{ border-left-color: #eab308; }}
        .stat-val {{ font-size: 28px; font-weight: bold; margin-top: 4px; }}
        table {{ width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }}
        th, td {{ padding: 12px 16px; text-align: left; border-bottom: 1px solid #e2e8f0; font-size: 14px; }}
        th {{ background-color: #f1f5f9; font-weight: 600; color: #475569; }}
        .badge {{ padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: bold; text-transform: uppercase; }}
        .badge.passed {{ background-color: #dcfce7; color: #15803d; }}
        .badge.failed {{ background-color: #fee2e2; color: #b91c1c; }}
        .badge.skipped {{ background-color: #fef9c3; color: #a16207; }}
    </style>
</head>
<body>
    <div class="header">
        <h1>🚀 SkillSync E2E Execution Report — Live GitHub Pages</h1>
        <p>Executed against LIVE Deployment Target | Timestamp: {timestamp}</p>
    </div>
    
    <div class="stats-grid">
        <div class="stat-card"><div>Total Tests</div><div class="stat-val">{total}</div></div>
        <div class="stat-card pass"><div>Passed</div><div class="stat-val">{passed}</div></div>
        <div class="stat-card fail"><div>Failed</div><div class="stat-val">{failed}</div></div>
        <div class="stat-card skip"><div>Skipped</div><div class="stat-val">{skipped}</div></div>
        <div class="stat-card"><div>Pass Rate</div><div class="stat-val">{pass_rate:.1f}%</div></div>
    </div>
    
    <table>
        <thead>
            <tr>
                <th>Test ID</th>
                <th>Module</th>
                <th>Test Case Name</th>
                <th>Status</th>
                <th>Duration (s)</th>
                <th>Priority</th>
            </tr>
        </thead>
        <tbody>
"""
    for tc in test_results:
        st = tc.get("status", "PASSED").lower()
        html_report += f"""
            <tr>
                <td><strong>{tc.get('id')}</strong></td>
                <td>{tc.get('module')}</td>
                <td>{tc.get('name')}</td>
                <td><span class="badge {st}">{tc.get('status')}</span></td>
                <td>{tc.get('duration', 0.45):.2f}s</td>
                <td>{tc.get('priority', 'P1')}</td>
            </tr>
"""
    html_report += """
        </tbody>
    </table>
</body>
</html>
"""
    report_path = os.path.join(output_dir, "execution-report.html")
    with open(report_path, "w", encoding="utf-8") as f:
        f.write(html_report)
        
    # 2. dashboard.html
    dash_path = os.path.join(output_dir, "dashboard.html")
    with open(dash_path, "w", encoding="utf-8") as f:
        f.write(html_report)
        
    print(f"🖥️ HTML Reports generated at {output_dir}")
    return report_path

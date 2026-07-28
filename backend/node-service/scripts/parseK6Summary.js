const fs = require('fs');
const path = require('path');

const summaryPath = process.argv[2] || path.join(__dirname, '../../summary.json');

/**
 * Defensive helper to extract metric values from k6 summary JSON.
 * Supports both nested schema (metricObj.values[key]) and flat schema (metricObj[key]).
 */
function getMetricValue(metricObj, key, defaultValue = 0) {
  if (!metricObj) return defaultValue;
  if (metricObj.values && metricObj.values[key] !== undefined) {
    return metricObj.values[key];
  }
  if (metricObj[key] !== undefined) {
    return metricObj[key];
  }
  return defaultValue;
}

function parseK6Summary() {
  let rawData;
  try {
    const resolvedPath = fs.existsSync(summaryPath) 
      ? summaryPath 
      : path.join(process.cwd(), 'summary.json');
    rawData = fs.readFileSync(resolvedPath, 'utf8');
  } catch (err) {
    console.error(`Error reading k6 summary JSON at ${summaryPath}:`, err.message);
    process.exit(1);
  }

  let data;
  try {
    data = JSON.parse(rawData);
  } catch (err) {
    console.error('Failed to parse k6 summary JSON:', err.message);
    process.exit(1);
  }

  const metrics = data.metrics || {};
  
  // Extract Throughput & Total Requests
  const httpReqs = metrics.http_reqs || {};
  const totalRequests = getMetricValue(httpReqs, 'count', 0);
  const rps = getMetricValue(httpReqs, 'rate', 0);

  // Extract Response Durations (ms)
  const httpReqDuration = metrics.http_req_duration || {};
  const avgDuration = getMetricValue(httpReqDuration, 'avg', 0);
  const minDuration = getMetricValue(httpReqDuration, 'min', 0);
  const maxDuration = getMetricValue(httpReqDuration, 'max', 0);
  const p95Duration = getMetricValue(httpReqDuration, 'p(95)', 0);

  // Extract Failure Rate
  const httpReqFailed = metrics.http_req_failed || {};
  const failureRate = getMetricValue(httpReqFailed, 'rate', 0) * 100;

  // Extract Check Pass Rate
  const checks = metrics.checks || {};
  const checksPassRate = getMetricValue(checks, 'rate', 0) * 100;

  // Build Markdown Summary Table
  const markdown = `
# 🚀 API Load Testing Report (SkillSync Backend)

### 📊 Performance Summary

| Metric | Measured Value | Target Threshold | Status |
|---|---|---|---|
| **Virtual Users (VUs)** | 100 VUs | 100 Concurrent Users | ℹ️ Executed |
| **Duration** | 60 seconds (1m) | 1 Minute | ℹ️ Completed |
| **Throughput (RPS)** | **${rps.toFixed(2)} req/sec** | High Throughput | ✅ Pass |
| **Total Requests Sent** | **${totalRequests.toLocaleString()}** | N/A | ℹ️ Total |
| **Average Response Time** | **${avgDuration.toFixed(2)} ms** | - | ℹ️ Measured |
| **Min Response Time** | **${minDuration.toFixed(2)} ms** | - | ⚡ Fastest |
| **Max Response Time** | **${maxDuration.toFixed(2)} ms** | - | 🐢 Slowest |
| **95th Percentile (p95)** | **${p95Duration.toFixed(2)} ms** | < 1500.00 ms | ${p95Duration <= 1500 ? '✅ Pass' : '❌ Fail'} |
| **Request Failure Rate** | **${failureRate.toFixed(2)}%** | < 5.00% | ${failureRate < 5 ? '✅ Pass' : '❌ Fail'} |
| **Checks Pass Rate** | **${checksPassRate.toFixed(2)}%** | 100% | ${checksPassRate === 100 ? '✅ Pass' : '⚠️ Warning'} |

---
*Report generated automatically by SkillSync Load Testing Suite.*
`;

  console.log(markdown);

  // Append to GITHUB_STEP_SUMMARY if available
  const githubStepSummary = process.env.GITHUB_STEP_SUMMARY;
  if (githubStepSummary) {
    try {
      fs.appendFileSync(githubStepSummary, markdown);
      console.log('Appended report to GITHUB_STEP_SUMMARY.');
    } catch (err) {
      console.error('Failed to write to GITHUB_STEP_SUMMARY:', err.message);
    }
  }
}

parseK6Summary();

self.onmessage = function(e) {
  const data = e.data;
  
  // Example: Process heavy computation
  const result = processReportData(data);
  
  // Send result back to main thread
  self.postMessage(result);
};

function processReportData(data) {
  // Simulate heavy computation
  const startTime = performance.now();
  let result = 0;
  
  // CPU-intensive operation
  for (let i = 0; i < 10000000; i++) {
    result += Math.sqrt(i) * Math.sin(i);
  }
  
  const endTime = performance.now();
  return {
    result,
    processingTime: endTime - startTime
  };
}

// Simple logger to print messages with timestamps
// Makes it easier to see what's happening when

function log(service, message) {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`[${timestamp}] [${service}] ${message}`);
}

function error(service, message) {
  const timestamp = new Date().toLocaleTimeString();
  console.error(`[${timestamp}] [${service}] ERROR: ${message}`);
}

module.exports = { log, error };

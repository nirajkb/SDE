// Simple Event Bus for Pub-Sub pattern
// This is like a message board where services can post messages and read them

const EventEmitter = require('events');

class EventBus extends EventEmitter {
  constructor() {
    super();
    this.messageCount = 0;
  }

  // Publish a message to a topic
  // Think of topic as a category like "new-clicks" or "fraud-alerts"
  publish(topic, data) {
    this.messageCount++;
    
    // Send the message to all subscribers of this topic
    this.emit(topic, data);
  }

  // Subscribe to a topic
  // When someone publishes to this topic, run the callback function
  subscribe(topic, callback) {
    this.on(topic, callback);
  }

  // Get total messages published
  getTotalMessages() {
    return this.messageCount;
  }
}

// Create one instance that everyone will use
const eventBus = new EventBus();

module.exports = eventBus;

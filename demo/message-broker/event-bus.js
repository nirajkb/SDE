/**
 * Simple Event Bus - Pub-Sub Message Broker
 * Demonstrates core pub-sub pattern without external dependencies
 */

const EventEmitter = require('events');

class EventBus extends EventEmitter {
  constructor() {
    super();
    this.topics = new Map();
    this.messageHistory = [];
  }

  /**
   * Publish a message to a topic
   */
  publish(topic, message) {
    const timestamp = new Date().toISOString();
    const eventData = {
      topic,
      message,
      timestamp,
      id: this.generateEventId()
    };

    // Store in history
    this.messageHistory.push(eventData);

    // Log the publish action
    console.log(`[Event Bus] Publishing to topic: ${topic}`);
    console.log(`[Event Bus] Event ID: ${eventData.id}`);

    // Emit the event
    this.emit(topic, eventData);

    // Count subscribers
    const subscriberCount = this.listenerCount(topic);
    console.log(`[Event Bus] ${subscriberCount} subscriber(s) notified\n`);

    return eventData.id;
  }

  /**
   * Subscribe to a topic
   */
  subscribe(topic, callback) {
    console.log(`[Event Bus] New subscriber registered for topic: ${topic}`);
    this.on(topic, callback);
  }

  /**
   * Unsubscribe from a topic
   */
  unsubscribe(topic, callback) {
    this.off(topic, callback);
  }

  /**
   * Get message history
   */
  getHistory(topic = null) {
    if (topic) {
      return this.messageHistory.filter(msg => msg.topic === topic);
    }
    return this.messageHistory;
  }

  /**
   * Get subscriber count for a topic
   */
  getSubscriberCount(topic) {
    return this.listenerCount(topic);
  }

  /**
   * Generate unique event ID
   */
  generateEventId() {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      totalMessages: this.messageHistory.length,
      topics: Array.from(this.eventNames()),
      topicStats: this.eventNames().map(topic => ({
        topic,
        subscribers: this.listenerCount(topic),
        messages: this.messageHistory.filter(m => m.topic === topic).length
      }))
    };
  }
}

// Export singleton instance
module.exports = new EventBus();

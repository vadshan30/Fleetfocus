import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class WebSocketService {
  constructor() {
    this.client = null;
    this.connected = false;
    this.connecting = false;
    this.reconnectAttempt = 0;
    this.maxReconnectAttempts = 10;
    this.baseReconnectDelay = 1000;
    this.subscriptions = new Map();
    this.listeners = new Map();
    this.statusListeners = new Set();
  }

  _setStatus(connected, connecting = false) {
    const wasConnected = this.connected;
    this.connected = connected;
    this.connecting = connecting;
    if (connected !== wasConnected || connecting) {
      this._notifyStatusListeners();
    }
  }

  _notifyStatusListeners() {
    const status = this.getStatus();
    this.statusListeners.forEach((callback) => {
      try {
        callback(status);
      } catch (e) {
        console.error('[WebSocket] Status listener error:', e);
      }
    });
  }

  getStatus() {
    if (this.connected) return 'connected';
    if (this.connecting) return 'connecting';
    return 'disconnected';
  }

  onStatusChange(callback) {
    this.statusListeners.add(callback);
    callback(this.getStatus());
    return () => this.statusListeners.delete(callback);
  }

  connect() {
    if (this.client?.connected) {
      return Promise.resolve();
    }

    this._setStatus(false, true);

    return new Promise((resolve, reject) => {
      this.client = new Client({
        webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
        reconnectDelay: 0,
        debug: (str) => {
          console.log('[WebSocket]', str);
        },
        onConnect: () => {
          console.log('[WebSocket] Connected');
          this._setStatus(true, false);
          this.reconnectAttempt = 0;
          this.resubscribeAll();
          resolve();
        },
        onDisconnect: () => {
          console.log('[WebSocket] Disconnected');
          this._setStatus(false, false);
          this.scheduleReconnect();
        },
        onStompError: (frame) => {
          console.error('[WebSocket] STOMP error:', frame.headers['message'], frame.body);
        },
      });

      this.client.activate();

      setTimeout(() => {
        if (!this.connected) {
          this._setStatus(false, false);
          reject(new Error('Connection timeout'));
        }
      }, 10000);
    });
  }

  scheduleReconnect() {
    if (this.reconnectAttempt >= this.maxReconnectAttempts) {
      console.error('[WebSocket] Max reconnect attempts reached');
      this._setStatus(false, false);
      return;
    }

    const delay = this.baseReconnectDelay * Math.pow(2, this.reconnectAttempt);
    this.reconnectAttempt++;
    console.log(`[WebSocket] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempt})`);
    this._setStatus(false, true);

    setTimeout(() => {
      this.connect().catch(() => {});
    }, delay);
  }

  resubscribeAll() {
    this.subscriptions.forEach((callback, topic) => {
      this.subscribe(topic, callback);
    });
  }

  subscribe(topic, callback) {
    if (!this.client?.connected) {
      this.subscriptions.set(topic, callback);
      this.connect().catch(() => {});
      return () => this.unsubscribe(topic);
    }

    const subscription = this.client.subscribe(topic, (message) => {
      try {
        const payload = JSON.parse(message.body);
        callback(payload);
      } catch (e) {
        console.error('[WebSocket] Failed to parse message:', e);
      }
    });

    const listeners = this.listeners.get(topic) || new Set();
    listeners.add(callback);
    this.listeners.set(topic, listeners);

    return () => {
      subscription.unsubscribe();
      const topicListeners = this.listeners.get(topic);
      if (topicListeners) {
        topicListeners.delete(callback);
        if (topicListeners.size === 0) {
          this.listeners.delete(topic);
          this.subscriptions.delete(topic);
        }
      }
    };
  }

  unsubscribe(topic) {
    const listeners = this.listeners.get(topic);
    if (listeners) {
      listeners.clear();
      this.listeners.delete(topic);
    }
    this.subscriptions.delete(topic);
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
      this._setStatus(false, false);
      this.subscriptions.clear();
      this.listeners.clear();
    }
  }

  isConnected() {
    return this.connected;
  }
}

const websocketService = new WebSocketService();

export default websocketService;
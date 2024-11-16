import { io } from '../app.js';

export class Notification {
  static async push(message) {
    io.emit('notifications', { message });
  }
}

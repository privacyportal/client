import { randomUUID } from '@privacyportal/client-e2ee';

export default class PwdStrengthTasks {
  worker: Worker;
  pendingRequests: Map<string, any>;

  constructor() {
    this.worker = new Worker(new URL('./PwdStrengthWorker.js', import.meta.url), { type: 'module' });
    this.pendingRequests = new Map();

    this.worker.onmessage = (event) => {
      const { id, result, error } = event.data;
      const promise = this.pendingRequests.get(id);
      if (promise) {
        error ? promise.reject(error) : promise.resolve(result);
        this.pendingRequests.delete(id);
      }
    };

    this.worker.postMessage({ action: 'init' });
  }

  async performTask(action: string, params: any) {
    const id = randomUUID();
    const promise = new Promise((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject });
    });
    this.worker.postMessage({ id, action, params });
    return promise;
  }

  async checkPwdStrength(password: string) {
    return this.performTask('check', { password });
  }

  cleanup() {
    this.worker.terminate();
  }
}

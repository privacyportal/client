import { randomUUID } from '@privacyportal/client-e2ee';

type ServiceKeys = {
  acc: {
    id: string;
    pk: string;
    sk: string;
  };
  service: {
    id: string;
    pk: string;
    name: string;
  };
  srch: {
    sk: string;
  };
};

type E2EEParams = {
  masterKey: CryptoKey;
  wrappingKey: CryptoKey;
  serviceKeys: ServiceKeys;
};

export default class CryptoTasks {
  serviceName: string;
  worker: Worker;
  pendingRequests: Map<string, any>;

  constructor(params: E2EEParams) {
    this.worker = new Worker(new URL('./CryptoWorker.js', import.meta.url), { type: 'module' });
    this.pendingRequests = new Map();
    this.serviceName = params.serviceKeys.service.name;

    this.worker.onmessage = (event) => {
      const { id, result, error } = event.data;
      const promise = this.pendingRequests.get(id);
      if (promise) {
        error ? promise.reject(error) : promise.resolve(result);
        this.pendingRequests.delete(id);
      }
    };

    this.worker.postMessage({ action: 'init', params });
  }

  async performTask(action: string, params: any) {
    const id = randomUUID();
    const promise = new Promise((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject });
    });
    this.worker.postMessage({ id, action, params });
    return promise;
  }

  async encryptStr(input: string) {
    return this.performTask('encrypt', { input });
  }

  async decryptItem(item: any) {
    return this.performTask('decrypt', { item });
  }

  async hashStr(input: string) {
    return this.performTask('srch_hash', { input });
  }

  cleanup() {
    this.worker.terminate();
  }
}

class ServerPool {
  constructor(config) {
    this.config = config;
    this.pool = new Map([]);
  }

  has(key) {
    return this.pool.has(key);
  }

  set(key, ref) {
    this.pool.set(key, ref);
  }

  get(key = '') {
    return this.pool.get(key);
  }

  delete(key) {
    this.pool.delete(key);
  }
}

const serverPool = new ServerPool();
window.serverPool = serverPool;
export default serverPool;

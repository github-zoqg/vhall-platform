class Storage {
  constructor(options = {}) {
    this.prefix = options.prefix || 'middlePlatform';
  }
  get(key, type = 'local') {
    return [`${type}Storage`].getItem(key);
  }
  set(key, value, type = 'local') {
    return [`${type}Storage`].setItem(key, value);
  }
}

export default new Storage();

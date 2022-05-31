import Vue from 'vue';

const install = (Vue, options) => {
  // 使用vue的混入方法，在创建之前，给每个组件都增加 $domainStore 属性
  Vue.mixin({
    // 创建之前会被执行
    beforeCreate() {
      // 根实例有 domainStore 属性
      if (this.$options && this.$options.domainStore) {
        this.$domainStore = this.$options.domainStore;
      } else {
        // 根实例上没有的 domainStore 属性，往父亲节点找
        this.$domainStore = this.$parent && this.$parent.$domainStore;
      }
    }
  });
};

export class Store {
  constructor(options) {
    const state = options.state; //数据变化要更新视图 （vue的核心逻辑依赖收集）
    this._vm = new Vue({
      data: {
        // 属性如果是通过$开头的 默认不会将这个属性挂载到vm上
        $$domainStore: state
      }
    });
  }
  get state() {
    // 属性访问器   new Store().state  Object.defineProperty({get()})
    return this._vm._data.$$domainStore;
  }
}

export default {
  install, // 给用户提供一个install方法，默认会被调用
  Store
};

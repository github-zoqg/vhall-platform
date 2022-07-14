import Vue from 'vue';
import Com from './com.vue';
const ComConstructor = Vue.extend(Com);
export default (options = {}) => {
  let root = document.body;
  if (options.el) {
    root = document.querySelectorAll(options.el)[0] || root;
  }
  const chList = root.querySelectorAll('.com-zan');
  if (chList.length >= 10) { // 最多10个同时启动
    return;
  }
  const instance = new ComConstructor({
    propsData: {
      showIdx: Math.round(Math.random() * 7)
    }
  });
  instance.vm = instance.$mount();
  const autoDestory = options.autoDestroy === undefined || options.autoDestroy;
  if (instance) {
    root.appendChild(instance.vm.$el);
    if (autoDestory) {
      const st = setTimeout(() => {
        clearTimeout(st);
        root.removeChild(instance.vm.$el);
        instance.vm.$destroy();
      }, 2000);
    }
  }
  return instance ? instance.vm : null;
};

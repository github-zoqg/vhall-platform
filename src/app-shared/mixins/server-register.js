/**
 * 服务注册
 */
export default {
  //组件的唯一标识
  props: {
    cuid: String
  },
  computed: {
    // 组件的配置新
    widget() {
      return this.cuid && window.$serverConfig && window.$serverConfig[this.cuid];
    }
  },
  methods: {
    _initWidgetOptions() {
      // 使用window.$serverConfig 中的配置内容，赋值给组件的data
      const widget = window.$serverConfig?.[this.cuid];
      if (widget && widget.options && typeof widget.options === 'object') {
        Object.keys(widget.options).forEach(key => {
          if (Object.prototype.hasOwnProperty.call(this, key)) {
            this[key] = widget.options[key];
          }
        });
      }
    }
  },
  created() {
    //  注册服务到服务池
    if (this.cuid && window.$middleEventSdk) {
      window.$middleEventSdk.serverPool.set(this.cuid, this);
    }
  },
  mounted() {
    this._initWidgetOptions();
  }
};

import { hasOwnProperty } from '@/packages/app-shared/utils/tool';
export default {
  props: {
    cuid: String
  },
  computed: {
    widget() {
      return this.cuid && window.$serverConfig && window.$serverConfig[this.cuid];
    }
  },
  methods: {
    _initWidgetOptions() {
      console.log(`this.cuid:${this.cuid}_initWidgetOptions`);
      const widget = window.$serverConfig?.[this.cuid];
      if (widget && widget.options && typeof widget.options === 'object') {
        Object.keys(widget.options).forEach(key => {
          if (hasOwnProperty(this, key)) {
            this[key] = widget.options[key];
          }
        });
      }
    }
  },
  created() {
    //  注册服务到服务池
    if (this.cuid && this.componentType !== 'CONTAINER' && window.$middleEventSdk) {
      window.$middleEventSdk.serverPool.set(this.cuid, this);
    }
  }
};

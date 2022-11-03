<template>
  <div class="clear-screen-container" :class="[className]" @click="clearScreen">
    <component
      v-for="item of subWidgets"
      :is="item.component"
      :key="item.cuid"
      :cuid="item.cuid"
    ></component>
  </div>
</template>
<script>
  import { useRoomBaseServer } from 'middle-domain';
  export default {
    name: 'VmpClearScreen',
    props: {
      cuid: {
        type: String,
        default() {
          return '';
        }
      }
    },
    computed: {
      isSelf() {
        const result = this.widget?.options?.isSelf;
        return typeof result === 'undefined' ? true : result;
      },
      /***
       * 最外层容器的class名称
       * 支持直接配置className或options属性中配置className，如果两个都配置则合并去重
       */
      className() {
        let arr = [];
        let outCls = this.widget?.className;
        if (outCls && typeof outCls === 'string') {
          arr.push(outCls);
        } else if (Array.isArray(outCls)) {
          arr = arr.concat(outCls);
        }
        let innCls = this.widget?.options?.className;
        if (innCls && typeof innCls === 'string') {
          arr.push(innCls);
        } else if (Array.isArray(innCls)) {
          arr = arr.concat(innCls);
        }
        return Array.from(new Set(arr)).join(' ');
      },
      // 渲染配置组件的children
      subWidgets() {
        const rlt = [];
        const list = (this.widget && this.widget.children) || [];
        for (const cuid of list) {
          const subWidget = window.$serverConfig[cuid];
          if (subWidget && subWidget.component) {
            rlt.push({
              cuid,
              component: subWidget.component
            });
          }
        }
        return rlt;
      }
    },
    created() {
      this.roomBaseServer = useRoomBaseServer();
    },
    methods: {
      clearScreen(e) {
        if (!this.isSelf || (this.isSelf && e.target === e.currentTarget)) {
          this.roomBaseServer.state.isClearScreen = !this.roomBaseServer.state.isClearScreen;
        }
      }
    }
  };
</script>
<style lang="less">
  .clear-screen-container {
    position: relative;
  }
</style>

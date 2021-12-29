<!--
通用容器组件
用途：此组件用于实现有一个div为根元素的容器.
-->
<template>
  <div :class="[className]">
    <component
      v-for="item of subWidgets"
      :is="item.component"
      :key="item.cuid"
      :cuid="item.cuid"
    ></component>
  </div>
</template>

<script>
  export default {
    name: 'VmpContainer',
    props: {
      cuid: String,
      componentType: {
        type: String,
        default: () => {
          return 'CONTAINER'; // 容器类型
        }
      }
    },
    computed: {
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
    }
  };
</script>

<template>
  <aside class="vmp-aside" :style="{ width }">
    {{ text }}
    <slot></slot>
  </aside>
</template>

<script>
  export default {
    name: 'VmpAside',

    componentName: 'VmpAside',

    props: {
      width: {
        type: String,
        default: 'auto'
      }
    },
    data: function () {
      return {
        text: '哈哈哈'
      };
    }
  };
</script>

<template>
  <div class="vmp-aside-menu">
    <vmp-container :cuid="cuid"></vmp-container>
  </div>
</template>
<script>
  export default {
    name: 'VmpAsideMenu',
    props: {
      cuid: String
    },
    created() {
      // 注册到服务池
      this.$serverPool.set(this.cuid, this);
    },
    methods: {
      handleClick: function () {}
    }
  };
</script>

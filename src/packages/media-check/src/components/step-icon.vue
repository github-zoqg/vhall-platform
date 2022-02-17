<template>
  <span class="vh-iconfont" :class="[iconStyles]"></span>
</template>

<script>
  export default {
    props: {
      icon: {
        type: String,
        default: ''
      },
      item: {
        type: Object,
        default: () => ({})
      }
    },
    computed: {
      iconStyles() {
        if (this.item.status === 'fail') {
          return 'vh-a-line-exclamationpoint';
        }

        if (this.item.status === 'success') {
          return 'vh-line-check';
        }

        return this.item.icon;
      }
    }
  };
</script>

<style lang="less">
  .is-process {
    .vh-iconfont {
      color: #3562fa;
    }
  }
</style>

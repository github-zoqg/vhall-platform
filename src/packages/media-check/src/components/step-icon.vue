<template>
  <span class="vmp-media-check__step-icon vh-iconfont" :class="[iconStyles]"></span>
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
  .vmp-media-check__step-icon {
    color: #999;
    font-size: 24px;
  }

  .is-process {
    .vmp-media-check__step-icon {
      color: #3562fa;
    }
  }

  .is-finish {
    .vmp-media-check__step-icon {
      color: #fff;
    }
  }
</style>

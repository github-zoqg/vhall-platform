<template>
  <header class="rank-title">
    <span>{{ title }}</span>
    <i v-if="showClose" class="vh-iconfont vh-line-close" @click="handleClose"></i>
  </header>
</template>
<script>
  export default {
    name: 'RankTitleWap',
    props: {
      title: {
        type: String,
        default() {
          return '';
        }
      },
      showClose: {
        type: Boolean,
        default() {
          return false;
        }
      }
    },
    methods: {
      handleClose() {
        this.$emit('close');
      }
    }
  };
</script>
<style lang="less">
  .rank-title {
    display: block;
    height: 116px;
    box-sizing: border-box;
    padding: 36px 32px 40px 32px;
    span {
      font-weight: 500;
      font-size: 28px;
      line-height: 40px;
      color: #262626;
      width: 100%;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
    .vh-line-close {
      flex-shrink: 0;
      margin-left: 32px;
    }
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
</style>

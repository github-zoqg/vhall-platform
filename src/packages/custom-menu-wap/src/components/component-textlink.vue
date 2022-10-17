<template>
  <div class="vmp-custom-menu-textlink">
    <div class="textlink-previewbox">
      <div class="textlink">
        <span @click="jump">{{ info.text }}</span>
      </div>
    </div>
  </div>
</template>
<script>
  import { getBrowserType } from '@/app-shared/utils/getBrowserType.js';
  /**
   * 文字连接自定义菜单
   */
  export default {
    name: 'component-textlink',
    props: {
      info: {
        required: false
      }
    },
    methods: {
      jump() {
        if (!this.info || !this.info.src) return;
        const { system } = getBrowserType();
        if ('ios' === system) {
          console.log('当前是手机端打开-ios');
          window.location.href = this.info.src;
        } else {
          console.log('当前是手机端打开-其它');
          window.open(this.info.src);
        }
      }
    }
  };
</script>
<style lang="less">
  .vmp-custom-menu-textlink {
    width: 100%;
    box-sizing: border-box;
    padding: 0 0;
    margin-top: 24px;
    .textlink {
      width: 100%;
      // height: 24px;
      font-size: 28px;
      font-weight: 400;
      color: #1e4edc !important;
      line-height: 28px;
      word-break: break-all;
      margin: 20px 0px;
      // text-align: center;
      & > span:hover {
        cursor: pointer;
      }
    }
  }
</style>

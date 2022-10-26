<template>
  <div class="lives-wrapbox">
    <live-list :checked-list="info.webinars" @link="linkWatch" />
  </div>
</template>
<script>
  /**
   * 直播自定义菜单
   */
  import liveList from './live-list';
  import { getBrowserType } from '@/app-shared/utils/getBrowserType.js';
  // import { mapState } from 'vuex';

  export default {
    name: 'component-lives',
    props: {
      info: {
        required: false
      }
    },
    computed: {
      // ...mapState('watchBase', ['watchInitData']),
      // webinarStatus() {
      //   return this.watchInitData.webinar.type;
      // }
    },
    components: {
      liveList
    },
    data() {
      return {};
    },
    methods: {
      linkWatch(id) {
        const webKey = process.env.VUE_APP_WEB_KEY || '/v3';
        const url =
          window.location.protocol + process.env.VUE_APP_WAP_WATCH + webKey + `/lives/watch/${id}`;
        const { system } = getBrowserType();
        if ('ios' === system) {
          console.log('当前是手机端打开-ios');
          window.location.href = url;
        } else {
          console.log('当前是手机端打开-其它');
          window.open(url);
        }
      }
    }
  };
</script>
<style lang="less" scoped>
  .lives-wrapbox {
    width: 100%;
  }
  /deep/ .menus-checkedBox {
    width: 100%;
    min-height: 40px;
    display: flex;
    flex-direction: row;
    justify-content: center;
    .vh-chose-active-item {
      width: 310px;
      height: 80px;
      margin-right: 12px;
      margin-bottom: 16px;
      .vh-chose-active-item__cover {
        height: 136px;
      }
      .vh-chose-active-item__title {
        font-size: 16px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #000000;
        line-height: 24px;
      }
      .vh-chose-active-item__info {
        height: 18px;
        font-size: 14px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #666666;
        line-height: 18px;
      }
    }
  }
</style>

<template>
  <div class="vmp-header-watch">
    <div class="vmp-header-watch-left">
      <!-- 品牌设置-标识图片 -->
      <div class="vmp-header-watch-left-logo">
        <img src="./images/logo-red@2x.png" alt="" />
      </div>
    </div>
    <div class="vmp-header-watch-center">
      <div class="vmp-header-watch-center-title">
        {{ webinarInfo.subject }}
        <span class="vmp-header-watch-center-title-living">
          <img src="./images/live-white.gif" alt="" />
          <label>直播</label>
        </span>
        <!-- <span class="vmp-header-watch-center-title-subscribe"></span> -->
      </div>
      <div class="vmp-header-watch-center-host">
        <a href="">主办方：{{ webinarInfo.userinfo.nickname }}</a>
        <span>{{ webinarInfo.start_time }}</span>
      </div>
    </div>
    <div class="vmp-header-watch-right"></div>
  </div>
</template>
<script>
  import { contextServer } from 'vhall-sass-domain';
  export default {
    name: 'VmpHeaderWatch',
    data() {
      return {
        webinarInfo: {} //活动的信息
      };
    },
    beforeCreate() {
      this.roomBaseServer = contextServer.get('roomBaseServer');
    },
    created() {
      this.roomBaseState = this.roomBaseServer.state;
      this.getWebinarInfo();
    },
    methods: {
      getWebinarInfo() {
        const { webinar } = this.roomBaseState.watchInitData;
        this.webinarInfo = webinar;
        console.log(this.webinarInfo, '11111===zhangxiao===???');
      }
    }
  };
</script>
<style lang="less">
  .vmp-header-watch {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 72px;
    width: 100%;
    margin: 0 32px 0 8px;
    &-left {
      margin-right: 7px;
      &-logo {
        width: 120px;
        height: 44px;
        margin: 14px 0;
        img {
          width: 100%;
          height: 100%;
          object-fit: scale-down;
        }
      }
    }
    &-center {
      text-align: left;
      flex: 1;
      color: @font-dark-normal;
      &-title {
        font-size: 18px;
        &-living {
          padding: 0 8px;
          height: 20px;
          border-radius: 10px;
          display: inline-block;
          line-height: 18px;
          margin: 2px auto;
          img {
            width: 8px;
            height: 8px;
            display: inline-block;
            vertical-align: top;
            margin: 6px 2px 6px 0;
          }
          label {
            display: inline-block;
            vertical-align: top;
            height: 16px;
            font-size: 12px;
            font-weight: normal;
            color: @font-error-low;
            line-height: 16px;
            margin: 2px 0 2px 0;
          }
        }
      }
      &-host {
        font-size: 14px;
        color: @font-dark-low;
        a {
          color: @font-dark-low;
          &:hover {
            color: @font-link;
          }
        }
        span {
          padding-left: 8px;
        }
      }
    }
  }
</style>

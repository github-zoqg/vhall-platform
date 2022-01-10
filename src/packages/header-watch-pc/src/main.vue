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
        {{ webinarInfo.subject | splitLenStr(40) }}
        <span
          v-if="webinarInfo.type != 6"
          :class="
            'vmp-header-watch-center-title-tags vmp-header-watch-center-title-tags_' +
            webinarInfo.type
          "
        >
          <img v-if="webinarInfo.type == 1" src="./images/live-white.gif" alt="" />
          <label>{{ webinarInfo.type | webinarFilter }}</label>
        </span>
        <span
          v-if="webinarInfo.type != 6 && webinarInfo.no_delay_webinar == 1"
          class="vmp-header-watch-center-title-delay"
        >
          <img :src="noDelayIconUrl" alt="" />
        </span>
      </div>
      <div class="vmp-header-watch-center-host">
        <a href="">主办方：{{ webinarInfo.userinfo.nickname }}</a>
        <span>{{ webinarInfo.start_time }}</span>
      </div>
    </div>
    <div class="vmp-header-watch-right">
      <vmp-air-container :cuid="cuid"></vmp-air-container>
    </div>
  </div>
</template>
<script>
  import { useRoomBaseServer } from 'middleDomain';
  export default {
    name: 'VmpHeaderWatch',
    data() {
      return {
        noDelayIconUrl:
          '//cnstatic01.e.vhall.com/saas-v3/static/common/img/nodelay-icon/v1.0.0/pc/delay-icon_zh-CN.png',
        webinarInfo: {} //活动的信息
      };
    },
    filters: {
      webinarFilter(val) {
        const webinarArr = ['直播', '预约', '结束', '点播', '回放'];
        return webinarArr[val - 1];
      },
      splitLenStr(name, len) {
        return name && name.length > len ? name.substring(0, len) + '...' : name;
      }
    },
    beforeCreate() {
      this.roomBaseServer = useRoomBaseServer();
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
        &-tags {
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
        &-tags_1 {
          background: @bg-error-light;
        }
        &-tags_2 {
          background: @bg-subscribe-normal;
        }
        &-tags_3 {
          background: @bg-end-normal;
        }
        &-tags_4 {
          background: @bg-demand-normal;
        }
        &-tags_5 {
          background: @bg-playback-normal;
        }
        &-delay {
          display: inline-block;
          width: 66px;
          height: 28px;
          margin-left: 8px;
          vertical-align: middle;
          img {
            height: 100%;
            width: 100%;
            object-fit: scale-down;
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
    &-right {
      display: flex;
      padding-right: 32px;
    }
  }
</style>

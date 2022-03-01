<template>
  <div class="vmp-split-screen">
    <div class="vmp-split-screen__tip">
      <span class="tip-txt">分屏模式</span>
      <span
        class="exit-shadow vh-iconfont vh-line-close"
        @click="exitShadow"
        title="退出分屏"
      ></span>
      <span
        class="v-fullScreen vh-iconfont"
        :class="isFullscreen ? 'vh-line-narrow' : 'vh-line-amplification'"
        @click="enterFullScreen"
        title="全屏"
      ></span>
    </div>

    <vmp-air-container v-if="dataReady" cuid="comStreamList"></vmp-air-container>
  </div>
</template>

<script>
  import roomState from '../headless/room-state.js';
  import { Domain, useRoomBaseServer } from 'middle-domain';
  export default {
    name: 'SplitScreen',
    data() {
      return {
        state: 0,
        errMsg: '',
        isFullscreen: false,
        dataReady: false
      };
    },
    async created() {
      try {
        console.log('%c---初始化直播房间 开始', 'color:blue');
        // 初始化直播房间
        const domain = await this.initSendLive();
        const roomBaseServer = useRoomBaseServer();

        const res = await roomState();

        console.log('%c---初始化直播房间 完成', 'color:blue');
        this.dataReady = true;
      } catch (err) {
        console.error('---初始化直播房间出现异常--');
        console.error(err);
        if (err.code == 510008) {
          // 未登录
          location.href = `${process.env.VUE_APP_WEB_BASE + process.env.VUE_APP_WEB_KEY}/login?${
            location.search
          }`;
        }
        this.errMsg = err.msg;
      }
    },
    methods: {
      // 初始化直播房间
      initSendLive() {
        const { id } = this.$route.params;
        return new Domain({
          plugins: ['chat', 'doc', 'interaction'],
          requestHeaders: {
            token: localStorage.getItem('token') || '',
            'gray-id': sessionStorage.getItem('initGrayId')
          },
          initRoom: {
            webinar_id: id, //活动id
            clientType: 'send',
            check_online: 0 // 不检查主持人是否在房间
          }
        });
      },
      enterFullScreen() {},
      exitShadow() {}
    }
  };
</script>

<style lang="less">
  .vmp-split-screen {
    &:hover {
      .vmp-split-screen__tip {
        display: flex;
      }
    }
    width: 100%;
    height: 100%;
    overflow: auto;
    background: #2d2d2d;
    flex: 1;
    height: 100%;
    background-color: #2d2d2d;
    display: -webkit-box;
    display: flex;
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    flex-direction: column;
    position: relative;

    .vmp-split-screen__tip {
      display: none;
      position: fixed;
      z-index: 12;
      width: 100%;
      height: 50px;
      background-color: #434343;
      color: white;
      // display: -webkit-box;
      // display: flex;
      -webkit-box-align: center;
      align-items: center;
      padding: 0 20px;
      -webkit-box-pack: justify;
      justify-content: space-between;
      .exit-shadow {
        cursor: pointer;
        width: 32px;
        height: 32px;
        line-height: 32px;
        font-size: 18px;
        color: #fff;
        position: absolute;
        top: 8px;
        right: 44px;
      }
      .v-fullScreen {
        cursor: pointer;
        width: 32px;
        height: 32px;
        line-height: 32px;
        font-size: 18px;
        color: #fff;
        position: absolute;
        top: 8px;
        right: 100px;
      }
    }
    /deep/ & {
      #vhall-subcribe-screen {
        position: fixed;
        top: 0;
        right: 0;
        left: 0;
        bottom: 0;
        z-index: 10;
      }

      .vhall-remote-strams-box {
        -webkit-box-align: center;
        align-items: center;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;
        margin: auto;
        overflow: hidden;
        overflow: hidden;
        height: 100%;
        .vhall-subStream-box--pophover {
          display: none !important;
        }

        &:hover {
          .vhall-subStream-box--pophover {
            display: none !important;
          }
        }
      }
    }
  }
</style>

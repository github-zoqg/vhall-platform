<template>
  <div class="vmp-wap-body">
    <!-- 直播结束 -->
    <div
      v-if="isLivingEnd"
      class="vmp-wap-body-ending"
      :style="`backgroundImage: url('${webinarsBgImg}')`"
    >
      <div class="vmp-wap-body-ending-box">
        <div class="vmp-wap-body-ending-box-img">
          <img src="./img/livingEnd@2x.png" alt="" />
        </div>
        <h1 class="vmp-wap-body-ending-box-text">{{ $t('player.player_1017') }}</h1>
      </div>
    </div>
    <div
      id="wap-player-mini"
      :class="[mini ? 'vmp-wap-body-mini' : '']"
      @touchstart="touchstart($event)"
      @touchmove.prevent="touchmove($event)"
    >
      <!-- 播放器 -->
      <vmp-air-container
        :cuid="childrenComp[0]"
        :oneself="true"
        v-if="!isShowContainer && !isLivingEnd"
      ></vmp-air-container>

      <!-- 流列表 -->
      <vmp-air-container
        v-show="isShowContainer && !isLivingEnd"
        :cuid="childrenComp[1]"
        :oneself="true"
      ></vmp-air-container>

      <!-- wap端订阅桌面共享的容器 -->
      <vmp-air-container :cuid="childrenComp[2]" :oneself="true" v-show="!isLivingEnd" />
      <!--
        注意：
          由于互动组件监听的互动的各种消息，包含同意上麦，监听后进行上麦操作
            此处不能用v-if
       -->
    </div>
  </div>
</template>
<script>
  import { useMsgServer } from 'middle-domain';
  import move from './js/move';
  import { Dialog } from 'vant';
  export default {
    name: 'VmpWapBody',
    mixins: [move],
    data() {
      return {
        childrenComp: [],
        isLivingEnd: false,
        mini: false
      };
    },
    computed: {
      isShowContainer() {
        return (
          (this.$domainStore.state.roomBaseServer.watchInitData.webinar.no_delay_webinar == 1 ||
            this.$domainStore.state.micServer.isSpeakOn) &&
          this.$domainStore.state.roomBaseServer.watchInitData.webinar.type == 1
        );
      },
      webinarsBgImg() {
        const cover = '//cnstatic01.e.vhall.com/static/img/mobile/video_default_nologo.png';
        return this.$domainStore.state.roomBaseServer.watchInitData.webinar.img_url || cover;
      }
    },
    beforeCreate() {
      this.msgServer = useMsgServer();
    },
    async created() {
      if (
        [3, 6].includes(this.$domainStore.state.roomBaseServer.watchInitData.webinar.mode) &&
        this.$domainStore.state.roomBaseServer.watchInitData.webinar.type == 1
      ) {
        await Dialog.alert({
          title: '提示',
          message: '本场直播支持视频连线，建议您允许系统启用相应设备以使用该功能。'
        });
      }
      this.childrenComp = window.$serverConfig[this.cuid].children;
    },
    mounted() {
      this.msgServer.$onMsg('ROOM_MSG', msg => {
        // live_over 结束直播
        if (msg.data.type == 'live_over') {
          this.isLivingEnd = true;
          this.mini = false;
        }
        // 分组直播 没有结束讨论 直接结束直播
        if (msg.data.type == 'group_switch_end') {
          if (msg.data.over_live) {
            this.isLivingEnd = true;
          }
        }
        if (msg.data.type == 'questionnaire_push') {
          this.mini = true;
        }
      });
    },
    methods: {
      questionnaireVisible(flag) {
        this.mini = flag;
      }
    }
  };
</script>
<style lang="less">
  .vmp-wap-body {
    position: relative;
    height: 100%;
    &-ending {
      background-repeat: no-repeat;
      background-size: 100% 100%;
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
      z-index: 20;
      &-box {
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.6);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        &-img {
          width: 141px;
          height: 104px;
          img {
            width: 100%;
            height: 100%;
            object-fit: scale-down;
          }
        }
        &-text {
          font-size: 28px;
          line-height: 50px;
          height: 50px;
          color: #fff;
          padding-left: 25px;
          font-weight: 400;
          padding-top: 30px;
        }
      }
    }
    &-mini {
      position: fixed;
      height: 168px;
      left: 55%;
      top: 70%;
      width: 300px;
      z-index: 5000;
      overflow: hidden;
      .vmp-wap-player-header,
      .vmp-wap-player-footer {
        display: none;
      }
      .vmp-wap-stream-wrap {
        height: 100%;
        .vmp-stream-list__main-screen {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
      }
      .vmp-wap-stream-wrap-mask > .vmp-wap-stream-wrap-mask-heat,
      .vmp-wap-stream-wrap-mask-screen {
        display: none;
      }
    }
  }
</style>

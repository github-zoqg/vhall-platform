<template>
  <div class="vmp-header-right">
    <section class="vmp-header-right_btn-box">
      <div v-if="liveStep == 1" class="vmp-header-right_btn" @click="handleStartClick">
        开始直播
      </div>
      <div v-if="liveStep == 2" class="vmp-header-right_btn">正在启动...</div>
      <div
        v-if="liveStep == 3"
        class="vmp-header-right_btn vmp-header-right_duration"
        @click="handleEndClick"
      >
        <span class="vmp-header-right_duration-text">{{ formatDuration }}</span>
        <span class="vmp-header-right_duration-end">结束直播</span>
      </div>
      <div v-if="liveStep == 4" class="vmp-header-right_btn">正在结束...</div>
      <div class="vmp-header-right_control">
        <headerControl
          :isShowQuit="isShowQuit"
          :isShowSupport="isShowSupport"
          :isShowSplitScreen="isShowSplitScreen"
          @openVirtualProple="openVirtualProple"
        ></headerControl>
      </div>
      <div class="vmp-header-right_full"><i class="iconfont iconicon_quanping"></i></div>
    </section>
  </div>
</template>

<script>
  import headerControl from './components/header-control.vue';
  import { useRoomBaseServer } from 'middle-domain';
  import { boxEventOpitons } from '@/packages/app-shared/utils/tool';
  export default {
    name: 'VmpHeaderRight',
    data() {
      return {
        liveStep: 1,
        liveDuration: '',
        isShowQuit: false, //是否显示退出
        isShowSupport: false, //是否显示技术支持
        isShowSplitScreen: false //是否显示分屏
      };
    },
    computed: {
      formatDuration() {
        const temp = this.liveDuration * 1000;
        const hours = this.$moment.duration(temp).hours();
        const minutes = this.$moment.duration(temp).minutes();
        const seconds = this.$moment.duration(temp).seconds();
        console.log(
          `${hours < 10 ? '0' + hours : hours}:${minutes < 10 ? '0' + minutes : minutes}:${
            seconds < 10 ? '0' + seconds : seconds
          }`
        );
        return `${hours < 10 ? '0' + hours : hours}:${minutes < 10 ? '0' + minutes : minutes}:${
          seconds < 10 ? '0' + seconds : seconds
        }`;
      }
    },
    components: {
      headerControl
    },
    created() {
      this.roomBaseServer = useRoomBaseServer();
      this.initConfig();
    },
    mounted() {
      const { watchInitData } = this.roomBaseServer.state;
      if (watchInitData.webinar.type == 1) {
        this.liveDuration = watchInitData.webinar.live_time;
        this.calculateLiveDuration();
        this.handleStartClick();
      }
    },
    methods: {
      initConfig() {
        const widget = window.$serverConfig?.[this.cuid];
        if (widget && widget.options) {
          Object.assign(this.$data, widget.options);
        }
      },
      // 打开虚拟人数的弹窗
      openVirtualProple() {
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitVirtualClick'));
      },
      // 推流成功事件
      async handlePublishComplate() {
        const { watchInitData } = this.roomBaseServer.state;
        if (watchInitData.webinar.type != 1) {
          const res = await this.postStartLive();
          // 开始直播成功
          if (res.code == 200) {
            this.liveStep = 3;
            this.calculateLiveDuration();
          }
        } else {
          this.liveStep = 3;
        }
      },
      // 调开始直播接口
      postStartLive() {
        return this.roomBaseServer.startLive({
          webinar_id: this.roomBaseServer.state.watchInitData.webinar.id
        });
      },
      // 开始直播
      handleStartClick() {
        this.roomBaseServer.setDevice();
        this.liveStep = 2;
        // 派发推流事件
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitClickStartLive'));
      },
      // 结束直播
      async handleEndClick() {
        this.liveStep = 4;
        const res = await this.roomBaseServer.endLive({
          webinar_id: this.roomBaseServer.state.watchInitData.webinar.id
        });
        if (res.code == 200) {
          // 派发结束直播事件
          window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitClickEndLive'));
        }
      },
      handleUnpublishComplate() {
        this.liveStep = 1;
      },
      calculateLiveDuration() {
        if (this._durationInterval) {
          window.clearInterval(this._durationInterval);
        }
        this._durationInterval = window.setInterval(() => {
          this.liveDuration++;
        }, 1000);
      }
    }
  };
</script>

<style lang="less">
  .vmp-header-right {
    .vmp-header-right_btn-box {
      float: right;
      display: flex;
      height: 100%;
      align-items: center;
    }
    .vmp-header-right_btn {
      width: 80px;
      height: 26px;
      border-radius: 80px;
      font-size: 14px;
      text-align: center;
      line-height: 26px;
      color: @font-error-low;
      padding: 0 10px;
      cursor: pointer;
      background-color: @bg-error-light;
    }
    .vmp-header-right_duration {
      &-end {
        display: none;
      }
      &:hover {
        .vmp-header-right_duration-text {
          display: none;
        }
        .vmp-header-right_duration-end {
          display: inline;
        }
      }
    }
    &_control {
      margin-left: 12px;
      color: @font-error-low;
      font-size: 14px;
    }
    &_full {
      margin: 0 20px 0 12px;
      background-color: hsla(0, 0%, 88.6%, 0.15);
      border-radius: 50%;
      width: 28px;
      height: 28px;
      color: @font-error-low;
      font-size: 14px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      .iconfont {
        font-size: 14px;
      }
    }
  }
</style>

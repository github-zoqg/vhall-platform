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
        <span class="vmp-header-right_duration-text">{{ liveDuration }}</span>
        <span class="vmp-header-right_duration-end">结束直播</span>
      </div>
      <div v-if="liveStep == 4" class="vmp-header-right_btn">正在结束...</div>
    </section>
  </div>
</template>

<script>
  import { useRoomBaseServer } from 'middleDomain';
  export default {
    name: 'VmpHeaderRight',
    data() {
      return {
        liveStep: 1,
        liveDuration: '',
        localDuration: 0,
        roomBaseState: null
      };
    },
    created() {
      this.roomBaseServer = useRoomBaseServer();
      this.roomBaseState = this.roomBaseServer.state;
    },
    mounted() {
      this.calculateLiveDuration();
    },
    methods: {
      // 推流成功事件
      async handlePublishComplate() {
        const res = await this.postStartLive();
        // 开始直播成功
        if (res.code == 200) {
          this.liveStep = 3;
          this.calculateLiveDuration();
        } else {
          // TODO: 开始直播失败,将房间还原到初始化的状态
        }
      },
      // 调开始直播接口
      postStartLive() {
        return this.roomBaseServer.startLive({
          webinar_id: this.roomBaseState.watchInitData.webinar.id
        });
      },
      // 开始直播
      handleStartClick() {
        this.roomBaseServer.setDevice();
        this.liveStep = 2;
        // 派发推流事件
        window.$middleEventSdk?.event?.send({
          cuid: this.cuid,
          method: 'emitClickStartLive'
        });
      },
      // 结束直播
      async handleEndClick() {
        this.liveStep = 4;
        const res = await this.roomBaseServer.endLive({
          webinar_id: this.roomBaseState.watchInitData.webinar.id
        });
        if (res.code == 200) {
          // 派发结束直播事件
          window.$middleEventSdk?.event?.send({
            cuid: this.cuid,
            method: 'emitClickEndLive'
          });
        }
      },
      handleUnpublishComplate() {
        this.liveStep = 1;
      },
      calculateLiveDuration() {
        if (this._durationInterval) {
          window.clearInterval(this._durationInterval);
        }
        let temp = 0;
        this._durationInterval = window.setInterval(() => {
          this.localDuration = this.localDuration + 1;
          temp = this.localDuration * 1000;
          const hours = this.$moment.duration(temp).hours();
          const minutes = this.$moment.duration(temp).minutes();
          const seconds = this.$moment.duration(temp).seconds();
          this.liveDuration = `${hours < 10 ? '0' + hours : hours}:${
            minutes < 10 ? '0' + minutes : minutes
          }:${seconds < 10 ? '0' + seconds : seconds}`;
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
      color: #fff;
      padding: 0 10px;
      cursor: pointer;
      background-color: #fc5659;
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
  }
</style>

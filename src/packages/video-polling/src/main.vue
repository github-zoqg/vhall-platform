<template>
  <div class="vmp-video-polling" ref="videoPolling">
    <!-- 头部悬浮区 -->
    <div class="vmp-video-polling__tip">
      <span class="vmp-video-polling__tip-txt">视频轮巡视频墙</span>
      <div class="vmp-video-polling__tip-wrap">
        <span class="vmp-video-polling__tip-auto">
          距离展示下一组 10:00
          <el-button type="primary" size="medium" round>继续轮巡</el-button>
        </span>
        <span class="vmp-video-polling__tip-next" @click="nextPolling">下一组</span>
        <span
          class="vmp-video-polling__tip-btn vh-iconfont"
          :class="isFullscreen ? 'vh-line-narrow' : 'vh-line-amplification'"
          @click="enterFullScreen"
          title="全屏"
        ></span>
        <span
          class="vmp-video-polling__tip-btn vh-iconfont vh-line-switch-button"
          @click="exitVideoPolling"
          title="退出轮巡"
        ></span>
      </div>
    </div>
    <!-- body -->
    <div class="vmp-video-polling__body">
      <!-- 左侧视频订阅区域 -->
      <div class="vmp-video-polling__body-stream">
        <div
          class="vmp-split-screen__stream-container"
          v-for="speaker in pollingList"
          :key="speaker.id"
        >
          <div class="vmp-split-screen__stream-container-box">
            <vmp-stream-polling-remote :stream="speaker"></vmp-stream-polling-remote>
          </div>
        </div>
      </div>
      <!-- 右侧用户列表 -->
      <div class="vmp-video-polling__body-user">
        <vmp-video-polling-member-list></vmp-video-polling-member-list>
      </div>
    </div>
  </div>
</template>

<script>
  import { useVideoPollingServer } from 'middle-domain';
  import screenfull from 'screenfull';
  import VmpVideoPollingMemberList from '@/packages/video-polling-member-list/src/main';
  export default {
    name: 'VmpVideoPolling',
    components: {
      VmpVideoPollingMemberList
    },
    data() {
      return {
        childrenCom: [],
        isFullscreen: false, // 是否进入全屏
        downTime: '10:00'
      };
    },
    computed: {
      // 轮询列表
      pollingList() {
        return this.$domainStore.state.videoPollingServer.pollingList;
      }
    },
    watch: {},
    beforeCreate() {
      this.videoPollingServer = useVideoPollingServer();
    },
    created() {
      this._isExitPolling = false;
      // 进入时，重置为0
      localStorage.setItem(`isVideoPolling_${this.$route.params.id}`, 0);
      this.childrenCom = window.$serverConfig[this.cuid].children;
    },
    mounted() {
      // 限定特定的组件的全屏更改
      screenfull.on('change', () => {
        this.isFullscreen = screenfull.isFullscreen;
      });
    },
    beforeDestroy() {
      // 如果是主动退出视频轮巡，就不存 当前轮巡页面的状态
      if (this._isExitPolling) return;
      localStorage.setItem(`isVideoPolling_${this.$route.params.id}`, 1);
    },
    methods: {
      // 下一组
      nextPolling() {
        // let _time = 0;
        // if (_time > 0 && _time < 10) {
        //   this.$message.error('请勿频繁操作');
        //   return;
        // }
        // this.nextTimer = setInterval(() => {
        //   _time += 1;
        //   console.log(_time, '???!3124');
        //   if (_time >= 10) {
        //     _time = 0;
        //     clearInterval(this.nextTimer);
        //     return false;
        //   }
        // }, 1000);
      },
      // 退出视频轮询
      exitVideoPolling() {
        this.$confirm('关闭后将结束视频轮巡功能', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          customClass: 'zdy-message-box',
          lockScroll: false,
          cancelButtonClass: 'zdy-confirm-cancel'
        }).then(() => {
          this.videoPollingServer.videoRoundEnd().then(res => {
            if (res.code === 200) {
              this._isExitPolling = true;
              // this.$message.success('退出成功');
              localStorage.removeItem(`isVideoPolling_${this.$route.params.id}`);
              window.close();
            } else {
              this.$message.error(res.msg);
            }
          });
        });
      },
      // 切换全屏
      enterFullScreen() {
        screenfull.toggle(this.$refs.videoPolling);
      }
    }
  };
</script>

<style lang="less">
  .vmp-video-polling {
    width: 100%;
    height: 100%;
    overflow: auto;
    background-color: #2d2d2d;
    display: flex;
    flex-direction: column;
    &__tip {
      display: flex;
      width: 100%;
      height: 48px;
      line-height: 48px;
      background-color: #434343;
      align-items: center;
      justify-content: space-between;
      &-txt {
        font-size: 18px;
        font-weight: 400;
        color: #e6e6e6;
        line-height: 24px;
        margin-left: 20px;
      }
      &-wrap {
        padding-right: 8px;
      }
      &-auto {
        color: #fff;
        line-height: 20px;
        font-size: 14px;
        margin-right: 32px;
        .el-button.el-button--medium {
          padding: 3px 23px;
          margin-left: 16px;
        }
      }
      &-next {
        margin-right: 32px;
        display: inline-block;
        width: 88px;
        height: 32px;
        text-align: center;
        line-height: 32px;
        border: 1px solid #979797;
        border-radius: 20px;
        color: #fff;
        font-size: 14px;
        cursor: pointer;
        &:hover {
          border: 1px solid #fb3a32;
          color: #fb3a32;
        }
      }
      &-btn {
        cursor: pointer;
        display: inline-block;
        width: 32px;
        height: 32px;
        border-radius: 100%;
        background: #e2e2e2;
        background-color: rgba(226, 226, 226, 0.15);
        line-height: 32px;
        text-align: center;
        font-size: 18px;
        color: #cccccc;
        margin-right: 16px;
        &:hover {
          background: #e2e2e2;
          background-color: rgba(226, 226, 226, 0.3);
        }
      }
    }
    &__body {
      display: flex;
      height: 100%;
      &-stream {
        flex: 1;
      }
      &-user {
        width: 360px;
        height: 100%;
        background-color: #2a2a2a;
      }
    }
  }
</style>

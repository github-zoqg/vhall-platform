<template>
  <div class="vmp-video-polling" ref="videoPolling">
    <!-- 头部悬浮区 -->
    <div class="vmp-video-polling__tip">
      <span class="vmp-video-polling__tip-txt">视频轮巡视频墙</span>
      <div class="vmp-video-polling__tip-wrap">
        <span
          class="vmp-video-polling__tip-btn vh-iconfont"
          :class="isFullscreen ? 'vh-line-narrow' : 'vh-line-amplification'"
          @click="enterFullScreen"
          title="全屏"
        ></span>
        <span
          class="vmp-video-polling__tip-btn vh-iconfont vh-line-switch-button"
          @click="exitVideoPolling"
          title="退出分屏"
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
        isFullscreen: false // 是否进入全屏
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
      this.childrenCom = window.$serverConfig[this.cuid].children;
    },
    mounted() {
      // 限定特定的组件的全屏更改
      screenfull.on('change', () => {
        this.isFullscreen = screenfull.isFullscreen;
      });
    },
    methods: {
      // 退出视频轮询
      exitVideoPolling() {},
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
      height: 72px;
      background-color: #434343;
      align-items: center;
      justify-content: space-between;
      &-txt {
        font-size: 18px;
        font-weight: 500;
        color: #e6e6e6;
        line-height: 24px;
        margin-left: 20px;
      }
      &-wrap {
        padding-right: 8px;
      }
      &-btn {
        cursor: pointer;
        display: inline-block;
        width: 40px;
        height: 40px;
        border-radius: 100%;
        background: #e2e2e2;
        background-color: rgba(226, 226, 226, 0.15);
        line-height: 40px;
        text-align: center;
        font-size: 18px;
        color: #cccccc;
        margin-right: 16px;
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

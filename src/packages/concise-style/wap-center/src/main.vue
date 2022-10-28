<template>
  <div class="vmp-concise-center-wap">
    <!-- 播放 按钮 -->
    <div v-show="!isPlayering && !isVodEnd && !isSmallPlayer" class="vmp-wap-player-pause">
      <p @click="startPlay">
        <i class="vh-iconfont vh-line-video-play"></i>
      </p>
    </div>
    <div class="docGroup">
      <!-- good组件-->
      <vmp-air-container :cuid="childrenComp[0]" :oneself="true"></vmp-air-container>
    </div>
  </div>
</template>

<script>
  import { boxEventOpitons } from '@/app-shared/utils/tool.js';

  export default {
    name: 'VmpConciseCenterWap',
    components: {},
    data() {
      return {
        isShowPoster: true, //是否展示活动图片背景
        isPlayering: false, // 是否是播放状态
        isSmallPlayer: false,
        isVodEnd: false, // 回放结束
        childrenComp: []
      };
    },
    watch: {},
    computed: {},
    created() {
      this.childrenComp = window.$serverConfig[this.cuid].children;
    },
    mounted() {},
    beforeDestroy() {},
    methods: {
      startPlay() {
        this.isPlayering ? this.pause() : this.play();
      },
      // 播放
      play() {
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitPlayerPlay'));
      },
      // 暂停
      pause() {
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitPlayerPause'));
      },
      // 改变播放状态
      updatePlayStatus(val) {
        this.isPlayering = val;
      }
    }
  };
</script>

<style lang="less">
  .vmp-basic-bd {
    background-color: transparent !important;
  }
  .vmp-concise-center-wap {
    overflow: hidden;
    position: relative;
    width: 100%;
    height: 100%;
    > .vmp-wap-player-pause {
      height: 100%;
      width: 100%;
      position: absolute;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 12;
      background: transparent;
      p {
        width: 108px;
        height: 108px;
        border-radius: 50%;
        background: rgba(0, 0, 0, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        i {
          font-size: 46px;
          color: #f5f5f5;
        }
      }
    }
  }
</style>

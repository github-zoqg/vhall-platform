<template>
  <div class="vmp-wap-player">
    <p v-show="isNoBuffer" class="vmp-wap-player-prompt">
      <span>{{ prompt }}</span>
    </p>
    <div v-show="!isNoBuffer" id="videoWapBox" class="vmp-wap-player-video">
      <!-- 背景图片 -->
      <div class="vmp-wap-player-prompt">
        <span v-if="!isAudio && promptFlag">{{ prompt }}</span>
        <img
          v-if="loadingFlag && !isAudio"
          class="vmp-wap-player-prompt-load"
          src="./images/load.gif"
        />
        <img v-if="isShowPoster" class="vmp-wap-player-prompt-poster" :src="webinarsBgImg" />
      </div>
      <!-- 播放 按钮 -->
      <div class="vmp-wap-player-pause">
        <p @click="startPlay">
          <i class="vh-iconfont vh-a-line-videoplay"></i>
        </p>
      </div>
      <div id="videoDom">
        <!-- 视频容器 -->
      </div>
    </div>
  </div>
</template>
<script>
  import { secondToDateZH, isMse, browser } from './js/utils';
  // import controlEventPoint from './components/control-event-point.vue';
  import { useRoomBaseServer, usePlayerServer } from 'middle-domain';
  export default {
    name: 'VmpWapPlayer',
    filters: {
      secondToDate(val) {
        return secondToDateZH(val);
      },
      fromalText(val) {
        let text;
        switch (val) {
          case 'same':
            text = '原画';
            break;
          case '720p':
            text = '超清';
            break;
          case '480p':
            text = '高清';
            break;
          case 'a':
            text = '音频';
            break;
          case '360p':
            text = '标清';
            break;
          default:
            text = '标清';
        }
        return text;
      }
    },
    components: {
      // controlEventPoint
    },
    computed: {
      isNotEmbed() {
        return this.embedObj
          ? !!(this.embedObj.embed == false && this.embedObj.embedVideo == false)
          : true;
      },
      //判断是否是音频直播模式
      isAudio() {
        return this.roomBaseState.watchInitData.webinar.mode == 1;
      },
      // 背景图片
      webinarsBgImg() {
        const cover = '//cnstatic01.e.vhall.com/static/images/mobile/video_default_nologo.png';
        const { warmup, webinar } = this.roomBaseState.watchInitData;
        if (warmup && warmup.warmup_paas_record_id) {
          return warmup.warmup_img_url
            ? warmup.warmup_img_url
            : webinar.img_url
            ? webinar.img_url
            : cover;
        } else {
          return webinar.img_url || cover;
        }
      }
    },
    data() {
      const { state: playerState } = this.playerServer;
      return {
        playerState,
        isNoBuffer: false,
        promptFlag: false,
        prompt: '内容即将呈现...', // 刚开始点击时展示文案
        loadingFlag: false,
        isShowPoster: true, //是否展示活动图片背景
        isPlayering: false // 是否是播放状态
      };
    },
    beforeCreate() {
      this.roomBaseServer = useRoomBaseServer();
      this.playerServer = usePlayerServer();
    },
    async created() {
      this.roomBaseState = this.roomBaseServer.state;
      this.embedObj = this.roomBaseState.embedObj;
    },
    methods: {
      startPlay() {
        console.log('111woshi1zhibo直播');
      }
    }
  };
</script>
<style lang="less">
  .vmp-wap-player {
    height: 422px;
    width: 100%;
    position: relative;
    &-prompt {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      text-align: center;
      line-height: 422px;
      background: rgb(0, 0, 0);
      font-size: 28px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: rgba(255, 255, 255, 1);
      &-load {
        width: 60px;
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
      }
      &-poster {
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
        z-index: 3;
      }
    }
    &-pause {
      height: 100%;
      width: 100%;
      position: absolute;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 4;
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

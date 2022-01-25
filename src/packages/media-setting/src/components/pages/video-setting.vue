<template>
  <section class="vmp-media-setting-video">
    <main>
      <section class="vmp-media-setting-item">
        <label class="vmp-media-setting-item__label">摄像头</label>
        <section class="vmp-media-setting-item__content">
          <el-radio-group v-model="selectedVideoType" @change="onVideoTypeChange">
            <el-radio label="camera">摄像头</el-radio>
            <el-radio label="picture">图片</el-radio>
          </el-radio-group>
        </section>
      </section>

      <section v-show="selectedVideoType === 'camera'" class="vmp-media-setting-item">
        <el-select
          class="vmp-media-setting-item__content"
          v-model="selectedId"
          @change="videoChange"
        >
          <el-option
            v-for="item in devices"
            :key="item.deviceId"
            :value="item.deviceId"
            :label="item.label"
          ></el-option>
        </el-select>
      </section>

      <section v-show="selectedVideoType === 'camera'" class="vmp-media-setting-video-canvas">
        <div id="vmp-media-setting-preview-video" style="height: 100%"></div>
        <div
          v-show="isVideoSwitching || isVideoError"
          class="vmp-media-setting-preview-loading-container"
        >
          <img :src="videoLoadingImg" alt="" />
          <p>{{ videoTipsText }}</p>
        </div>
      </section>

      <section v-show="selectedVideoType === 'picture'">
        <picture-uploader :canvasImgUrl.sync="canvasImgUrl" />
      </section>
    </main>
    <footer v-show="selectedVideoType === 'camera'">
      <section class="vmp-media-setting-tips">
        <section class="vmp-media-setting-tips__title">看不到摄像头画面？试试以下方法：</section>
        <section class="vmp-media-setting-tips__content">
          <p>1. 请允许浏览器使用摄像头权限</p>
          <p>2. 确认摄像头没有被其他程序占用</p>
          <p>3. 选择外置摄像头或者更换电脑</p>
        </section>
      </section>
    </footer>
  </section>
</template>

<script>
  import canvasDefaultImg from '../../assets/img/canvasDefault.png';
  import videoSwitchImg from '@/packages/app-shared/assets/img/video.gif';
  import videoFailImg from '@/packages/app-shared/assets/img/videoFailed.png';
  import PictureUploader from '../picture-uploader.vue';

  export default {
    props: {
      mediaCheckServer: {
        type: Object,
        default: () => {}
      },
      devices: {
        type: Array,
        default: () => []
      },
      selectedId: {
        type: String,
        default: ''
      },
      selectedAudioId: {
        type: String,
        default: ''
      }
    },
    components: {
      PictureUploader
    },
    data() {
      return {
        selectedVideoType: 'camera', // camera or picture
        videoLoadingImg: videoSwitchImg,
        localStreamId: '',
        canvasImgUrl: canvasDefaultImg,
        isVideoSwitching: false,
        isVideoError: false,
        videoTipsText: '设备切换中，请稍后…',
        roomId: null,
        interactToken: null,

        videoError: false
      };
    },
    watch: {
      selectedId() {
        this.createPreview();
      }
    },
    beforeDestroy() {
      this.destroyStream();
    },
    methods: {
      async onVideoTypeChange(value) {
        this.selectedVideoType = value;
        if (value === 'picture') {
          return this.destroyStream();
        }

        if (value === 'camera') {
          await this.destroyStream();
          this.createPreview();
        }
      },
      videoChange(val) {
        console.log('选择视频设备ID 发生变化', val);
        if (!val) return;

        this.createPreview();
      },
      // 创建视频流
      async createPreview() {
        await this.destroyStream();
        // 处理git图

        const options = {
          videoNode: 'vmp-media-setting-preview-video',
          audio: true, // TODO: 需要状态判断
          video: true,
          profile: VhallRTC.RTC_VIDEO_PROFILE_480P_16X9_M,
          mute: { audio: false, video: false },
          videoDevice: this.selectedId
        };

        try {
          this.videoError = false;
          this.isVideoSwitching = true;
          const streamId = await this.mediaCheckServer.startVideoPreview(options);
          this.localStreamId = streamId;
          this.isVideoSwitching = false;
        } catch (err) {
          this.isVideoSwitching = false;
          this.videoError = true;
          this.videoTipsText = '摄像头切换失败，请稍后重试';
          this.$message.error(`创建本地预览流失败，请检查设备`);
          console.error(`创建本地预览流失败`, err);
        }
      },
      async destroyStream() {
        if (!this.localStreamId) return;
        try {
          await this.mediaCheckServer.stopVideoPreview(this.localStreamId);
          this.localStreamId = null;
        } catch (err) {
          console.error(`销毁流异常`, err);
        }
      },
      //TODO: let stream save
      saveStream() {},
      uploadSuccessCanvas() {},
      updateDeviceSetting() {}
    }
  };
</script>

<style lang="less">
  .vmp-media-setting-video-canvas {
    height: 166px;
    border-radius: 4px;
    overflow: hidden;
    position: relative;

    .vmp-media-setting-preview-loading-container {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      background: #1a1a1a;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;

      img {
        flex: 0 0 auto;
      }

      p {
        padding-top: 10px;
        font-size: 12px;
        color: #ffffff;
        line-height: 20px;
      }
    }
  }
</style>

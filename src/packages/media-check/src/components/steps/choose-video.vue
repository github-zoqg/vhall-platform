<template>
  <section class="vh-media-check-video">
    <!-- 摄像头区域 -->
    <section class="vh-media-check-video-camera">
      <div v-show="resourceSuccess">
        <div id="vh-device-check-video"></div>
      </div>

      <div v-show="!resourceSuccess" class="preview-video-error">
        <img class="preview-video-error__img" :src="defaultImg" alt="默认占位图" />
        <span class="preview-video-error__desc">{{ desc }}</span>
      </div>
    </section>

    <!-- 选择摄像头 -->
    <section class="vh-media-check-selector">
      <label>摄像头</label>
      <el-select v-if="devices.length != 0" v-model="selectedId" @change="videoChange">
        <el-option
          v-for="item in devices"
          :key="item.deviceId"
          :value="item.deviceId"
          :label="item.label"
        ></el-option>
      </el-select>
      <el-select value="" v-if="devices.length == 0" disabled>
        <el-option key="" value="" :label="$t('setting.setting_1033')"></el-option>
      </el-select>
    </section>

    <footer class="vh-media-check-footer">
      <div class="vh-check-tip">
        <span class="vh-iconfont vh-line-detection icon-tip"></span>
        <span>您能看到摄像头画面吗？</span>
      </div>
      <div class="button-container">
        <el-button
          round
          class="confirm"
          type="primary"
          :disabled="!resourceReady || videoError"
          @click="success"
        >
          能看到
        </el-button>
        <el-button round class="cancel" @click="fail">看不到</el-button>
      </div>
    </footer>
  </section>
</template>

<script>
  import { DESC_OPTS } from '../../js/config';

  import defaultVideoImg from '../../assets/video.gif';
  import failedVideoImg from '../../assets/videoFailed.png';

  export default {
    name: 'choose-video',
    props: {
      defaultSelected: {
        type: String,
        default: ''
      },
      devices: {
        type: Array,
        default: () => []
      },
      server: {
        type: Object,
        default: () => {}
      }
    },
    data() {
      return {
        resourceReady: false,
        videoError: false,
        selectedId: '',
        localStreamId: null,
        defaultImg: defaultVideoImg,
        desc: '设备切换中，请稍侯...'
      };
    },
    computed: {
      resourceSuccess() {
        return this.resourceReady && !this.videoError;
      }
    },
    watch: {
      defaultSelected(cur) {
        this.setSelectedId(cur);
      }
    },
    mounted() {
      // this.startVideoPreview({ action: 'preview' });
    },
    methods: {
      setSelectedId(id) {
        this.selectedId = this.selectedId || id;
        this.startVideoPreview({ action: 'preview' });
      },
      videoChange() {
        this.startVideoPreview({ action: 'switching' });
      },
      async startVideoPreview({ action = 'preview' }) {
        try {
          await this.stopVideoPreview();
          const streamId = await this.server.startVideoPreview({
            videoNode: 'vh-device-check-video',
            videoDevice: this.selectedId
          });

          this.localStreamId = streamId;
          this.resourceReady = true;
        } catch (error) {
          this.desc = action === 'switching' ? DESC_OPTS.SWITCHING_ERROR : DESC_OPTS.PREVIEW_ERROR;
          this.defaultImg = failedVideoImg;
          this.$message.error('视频预览失败，请检查设备');
          console.error('创建本地预览流失败', error);
        }
      },
      async stopVideoPreview() {
        if (!this.localStreamId) return;

        try {
          await this.server.stopVideoPreview(this.localStreamId);
          console.log('销毁预览成功');
          this.resourceReady = false;
          this.localStreamId = null;
        } catch (error) {
          this.resourceReady = false;
          console.error('销毁预览失败', error);
        }
      },
      async success() {
        // 释放视频设备权限
        if (this.localStreamId) {
          await this.stopVideoPreview();
        }

        window?.vhallReportForProduct.report(110006, {
          report_extra: { dn: this.selectedId }
        }); // 埋点 - 摄像头检测成功

        this.$emit('next', { result: 'success', val: this.selectedId });
      },
      fail() {
        window?.vhallReportForProduct.report(110010, {
          report_extra: { dn: this.selectedId }
        }); // 埋点 - 摄像头检测失败

        this.$emit('next', { result: 'fail' });
      }
    }
  };
</script>

<style lang="less">
  .vh-media-check-video {
    width: 296px;
    margin: 0 auto;

    // selector
    .vh-media-check-selector {
      display: flex;
      align-items: center;
      margin-top: 11px;

      label {
        flex: 0;
        min-width: 44px;
        font-size: 12px;
        color: #1a1a1a;
      }
      .el-select {
        flex: 1;
      }
    }

    .vh-media-check-video-camera {
      #vh-device-check-video {
        border-radius: 4px;
        overflow: hidden;
        width: 296px;
        height: 166px;
        background-color: black;
      }

      .preview-video-error {
        width: 296px;
        height: 166px;
        border-radius: 4px;
        margin: auto;
        background: #1a1a1a;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        .preview-video-error__img {
          width: 72px;
        }
        .preview-video-error__desc {
          padding-top: 10px;
          font-size: 12px;
          color: #fff;
          line-height: 20px;
        }
      }
    }

    // footer
    .vh-media-check-footer {
      margin-top: 40px;
      margin-bottom: 30px;

      // tip
      .vh-check-tip {
        text-align: center;
        color: #1a1a1a;
        display: flex;
        justify-content: center;
        align-items: center;
        & > .iconfont {
          font-size: 20px;
        }
        &.audio-preview {
          padding-top: 15px;
        }

        .icon-tip {
          color: #fb3a32;
          padding-right: 7px;
        }
      }

      // button-container
      .button-container {
        text-align: right;
        margin-top: 64px;
        position: absolute;
        bottom: 4px;
        right: 32px;

        .el-button:last-child {
          margin-left: 12px;
        }
      }
    }
  }
</style>

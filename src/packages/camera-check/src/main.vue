<template>
  <section class="vmp-camera-check-container">
    <saas-dialog
      :visible="isShow"
      :title="$t('setting.setting_1032')"
      width="380px"
      style="min-width: 380px"
      @onReturn="closeVideoSetting"
      @onClose="closeVideoSetting"
    >
      <main class="vmp-camera-setting-dialog-body">
        <section class="vmp-camera-setting-item">
          <label class="vmp-camera-setting-item__label">{{ $t('setting.setting_1006') }}</label>
        </section>

        <section class="vmp-camera-setting-item">
          <el-select
            class="vmp-camera-setting-item__content"
            :placeholder="$t('form.form_1018')"
            v-model="mediaState.video"
          >
            <el-option
              v-for="item in devices"
              :key="item.deviceId"
              :value="item.deviceId"
              :label="item.label"
            ></el-option>
          </el-select>
        </section>

        <section class="vmp-camera-setting-video-canvas">
          <div
            ref="videoPreviewer"
            id="vmp-camera-setting-preview-video"
            style="height: 100%"
          ></div>
          <div
            v-show="isVideoSwitching || isVideoError"
            class="vmp-camera-setting-preview-loading-container"
          >
            <img :src="videoLoadingImg" alt="" />
            <p>{{ videoTipsText }}</p>
          </div>
        </section>
        <footer>
          <section class="vmp-camera-setting-tips">
            <section class="vmp-camera-setting-tips__title">
              {{ $t('setting.setting_1011') }}
            </section>
            <section class="vmp-camera-setting-tips__content">
              <p>1. {{ $t('setting.setting_1012') }}</p>
              <p>2. {{ $t('setting.setting_1013') }}</p>
              <p>3. {{ $t('setting.setting_1014') }}</p>
            </section>
          </section>
        </footer>
        <!-- 底部按钮区域 -->
        <footer class="vmp-camera-setting-footer">
          <a
            class="vmp-camera-setting-footer__help"
            href="//www.vhall.com/saas/doc/1722.html"
            target="_blank"
          >
            {{ $t('setting.setting_1029') }}
          </a>
          <section>
            <el-button size="small" round type="primary" @click="saveMediaSetting">
              {{ $t('account.account_1062') }}
            </el-button>
            <el-button @click="closeVideoSetting" round size="small">
              {{ $t('account.account_1063') }}
            </el-button>
          </section>
        </footer>
      </main>
    </saas-dialog>
  </section>
</template>

<script>
  import SaasDialog from '@/packages/pc-alert/src/dialog.vue';
  import videoSwitchImg from '@/app-shared/assets/img/video.gif';
  import videoFailImg from '@/app-shared/assets/img/videoFailed.png';
  import { useMediaSettingServer } from 'middle-domain';
  import { boxEventOpitons } from '@/app-shared/utils/tool';

  /**
   * 获取差异obj
   * @param {*} source 源对象
   * @param {*} current 对比对象
   * @param {*} options 配置项
   */
  function getDiffObject(source, current, { ignoreKeys = [] }) {
    let diff = {};

    for (const key in current) {
      if (Object.hasOwnProperty.call(current, key)) {
        if (ignoreKeys.includes(key)) continue;
        if (current[key] !== source[key]) {
          diff[key] = current[key];
        }
      }
    }
    return diff;
  }

  export default {
    name: 'VmpCameraCheck',
    components: {
      SaasDialog
    },
    data() {
      return {
        isShow: false,
        mediaState: this.mediaSettingServer.state,
        videoLoadingImg: videoSwitchImg,
        isVideoSwitching: false, // video正在切换
        isVideoError: false, // video读取错误
        videoTipsText: this.$t('setting.setting_1008')
      };
    },
    computed: {
      devices() {
        return this.mediaState.devices.videoInputDevices;
      }
    },
    watch: {
      async isShow(val) {
        if (val) {
          await this.getDevices();
          this.setDefaultSelected();
        }
      },
      'mediaState.video'(val) {
        if (val === undefined || val === '') return;
        if (!this.isShow) return;
        this.createPreview();
      }
    },
    beforeCreate() {
      this.mediaSettingServer = useMediaSettingServer();
    },
    created() {
      this._originCaptureState = {}; // 原始选中的数据
      this._diffOptions = {}; // 差异数据（更改的数据）
    },
    beforeDestroy() {
      this.destroyStream();
    },
    methods: {
      /**
       * 获得用户更改的字段（diff字段）
       */
      getDiffOptions() {
        const source = this._originCaptureState;
        let current = { ...this.mediaState };

        if (this.isRepublishMode) current.isRepublishMode = true;

        const ignoreKeys = ['devices', 'videoPreviewStreamId', 'videoPreviewStream'];

        return getDiffObject(source, current, { ignoreKeys });
      },
      /**
       * 获取所有设备
       */
      async getDevices() {
        // 获取视频列表
        await this.mediaSettingServer.getCameras(
          item => item.label && item.deviceId !== 'desktopScreen'
        );
        return true;
      },
      // 展示弹窗
      showCameraCheck() {
        this.isShow = true;
        if (!this._isFirstShow) {
          this._isFirstShow = true;
        } else {
          this.createPreview();
        }
      },
      closeVideoSetting() {
        this.isShow = false;
        this.destroyStream();
      },

      /**
       * 保存操作
       */
      async saveMediaSetting() {
        this._diffOptions = this.getDiffOptions();
        this.saveSelected();
        this.$message.success(this.$t('common.common_1034'));
        this.closeVideoSetting();
        this.sendChangeEvent();
        this.getStateCapture(); // 更新快照
      },
      /**
       * 缓存设置字段
       */
      saveSelected() {
        const localMap = new Map([['media-check.selected.video', this.mediaState.video || '']]);

        for (const [key, value] of localMap) {
          localStorage.setItem(key, value);
        }
      },
      /**
       * 发送变化事件
       */
      sendChangeEvent() {
        const diffOptions = this._diffOptions;
        if (Object.keys(diffOptions) === 0) return;

        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'saveOptions', diffOptions));
      },
      /**
       * 获取所有设置的快照
       */
      getStateCapture() {
        // 关心的都是浅拷贝数据
        let state = { ...this.mediaSettingServer.state };

        this._originCaptureState = state;
      },
      /**
       * 创建视频预览流
       */
      async createPreview() {
        await this.destroyStream();

        this.$refs['videoPreviewer'].innerHTML = '';

        const options = {
          videoNode: 'vmp-camera-setting-preview-video',
          audio: this.mediaState.audioInput === '' ? false : true,
          video: this.mediaState.video === '' ? false : true,
          profile: VhallRTC.RTC_VIDEO_PROFILE_480P_16X9_M,
          mute: { audio: false, video: false },
          videoDevice: this.mediaState.video
        };

        try {
          this.isVideoError = false;
          this.isVideoSwitching = true;
          this.videoLoadingImg = videoSwitchImg;
          await this.mediaSettingServer.startVideoPreview(options);
          this.isVideoSwitching = false;
        } catch (err) {
          this.isVideoSwitching = false;
          this.videoLoadingImg = videoFailImg;
          this.isVideoError = true;
          this.videoTipsText = this.$t('setting.setting_1010');
          this.$message.error(this.$t('message.message_1031'));
          console.error(this.$t('message.message_1028'), err);
        }
      },
      /**
       * 销毁预览流
       */
      async destroyStream() {
        try {
          return this.mediaSettingServer.stopVideoPreview();
        } catch (err) {
          console.error(`销毁流异常`, err);
        }

        return true;
      },

      /**
       * 从缓存中取回默认值并应用进去
       * @notices 设置默认选中值前，会先请求设备，是异步状态。但在异步请求的过程中如果用户做了新的选择，就优先选中他自身。比如this.mediaState.video = this.mediaState.video。以免数据跳动。
       */
      setDefaultSelected() {
        const getCurSelect = (devices, id) => {
          const isExsit = devices.find(item => item.deviceId === id);
          console.log('devices:', id, devices);
          if (id && !isExsit) return '';

          return id;
        };
        return new Promise(resolve => {
          const videoInputDevices = this.devices;
          // 视频
          if (videoInputDevices.length > 0) {
            const localVideoId = localStorage.getItem('media-check.selected.video');
            const lastSelect = this.mediaState.video || localVideoId;
            const curSelect = getCurSelect(videoInputDevices, lastSelect);
            this.mediaState.video = curSelect || videoInputDevices[0].deviceId;
          } else {
            localStorage.removeItem('media-check.selected.video');
          }
          resolve(this.mediaState.video);
        });
      }
    }
  };
</script>

<style lang="less">
  .vmp-camera-setting-dialog-body {
    background: #fff;
    display: flex;
    flex-direction: column;
    height: 430px;
    box-sizing: border-box;
    width: 100%;
    padding: 0px 32px 24px;

    // 复用元素
    .vmp-camera-setting-item {
      margin-bottom: 16px;
      display: flex;

      &__label {
        width: 58px;
        font-size: 14px;
        flex: 0 0 auto;
        text-align: left;
        margin-right: 10px;
        display: flex;
        align-items: center;
      }

      &__content {
        flex: 1;

        &--column {
          flex-direction: column;
        }
      }
    }

    .vmp-camera-setting-tips {
      padding-top: 16px;

      &__title {
        font-size: 14px;
        color: #1a1a1a;
        margin-bottom: 8px;
      }

      &__content {
        p {
          font-size: 13px;
          color: #666;
        }
      }
    }

    .vmp-camera-setting-video-canvas {
      height: 166px;
      border-radius: 4px;
      overflow: hidden;
      position: relative;

      .vmp-camera-setting-preview-loading-container {
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
          color: #fff;
          line-height: 20px;
        }
      }
    }

    .vmp-camera-setting-footer {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;

      & > * {
        margin-top: 8px;
      }

      &__help {
        color: #666;
        cursor: pointer;
        font-size: 14px;
        margin-top: 8px;
        &:hover {
          color: #3562fa;
        }
      }
    }
  }
</style>

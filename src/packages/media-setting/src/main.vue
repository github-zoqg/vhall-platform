<template>
  <section class="vmp-media-setting-container">
    <saas-dialog
      :visible="isShow"
      :title="$t('account.account_1005')"
      width="480px"
      style="min-width: 480px"
      :showDefault="false"
      @onReturn="closeMediaSetting"
      @onClose="closeMediaSetting"
    >
      <section v-loading="loading" v-show="isShow" class="vmp-media-setting-dialog-body">
        <!-- 左侧菜单 -->
        <aside class="vmp-media-setting-menu">
          <setting-menu :selected-item="selectedMenuItem" @change="changeSelectedMenuItem" />
        </aside>

        <!-- 右侧面板 -->
        <section class="vmp-media-setting-content">
          <main class="vmp-media-setting-content-main">
            <!-- 基础设置 -->
            <basic-setting v-show="selectedMenuItem === 'basic-setting'" />
            <!-- 摄像头 -->
            <video-setting
              ref="videoSetting"
              v-show="selectedMenuItem === 'video-setting'"
              :is-show="isShow"
              :selected-item="selectedMenuItem"
            />
            <!-- 麦克风 -->
            <audio-in-setting v-show="selectedMenuItem === 'audio-in-setting'" />
            <!-- 扬声器 -->
            <audio-out-setting
              ref="audioOutSetting"
              v-show="selectedMenuItem === 'audio-out-setting'"
            />
          </main>

          <!-- 底部按钮区域 -->
          <footer class="vmp-media-setting-content-footer">
            <a
              class="vmp-media-setting-content-footer__help"
              href="//www.vhall.com/saas/doc/1722.html"
              target="_blank"
            >
              {{ $t('setting.setting_1029') }}
            </a>
            <section>
              <el-button size="small" round type="primary" @click="saveMediaSetting">
                {{ $t('account.account_1062') }}
              </el-button>
              <el-button @click="closeMediaSetting" round size="small">
                {{ $t('account.account_1063') }}
              </el-button>
            </section>
          </footer>
        </section>
      </section>
    </saas-dialog>

    <!-- 弹窗容器 -->
    <aside>
      <saas-alert
        :visible="isConfirmVisible"
        :confirm="true"
        :confirmText="$t('common.common_1010')"
        :cancelText="$t('account.account_1063')"
        @onSubmit="onConfirmSave"
        @onClose="onCloseConfirm"
        @onCancel="onCloseConfirm"
      >
        <main slot="content">{{ alertText }}</main>
      </saas-alert>
    </aside>

    <!--设备禁用弹窗 -->
    <saas-alert
      :visible="popAlert.visible"
      @onClose="closeConfirm"
      @onCancel="closeConfirm"
      :knowText="$t('account.account_1062')"
    >
      <main slot="content">{{ popAlert.text }}</main>
    </saas-alert>
    <!--主持人设备禁用弹窗 -->
    <saas-alert
      :visible="hostAlertVisible"
      @onClose="hostAlertVisible = false"
      @onSubmit="handleCheck"
      retry="检查设备"
    >
      <main slot="content">
        因设备问题导致直播中断，请检查设备。
        <br />
        注意：如果没有可用设备，建议使用图片推流
      </main>
    </saas-alert>
  </section>
</template>

<script>
  /**
   * 注：发起端有 基础设置、摄像头、麦克风、扬声器 四项
   * 而观看端 没有基础设置
   */
  import SaasAlert from '@/packages/pc-alert/src/alert.vue';
  import SaasDialog from '@/packages/pc-alert/src/dialog.vue';

  import SettingMenu from './components/setting-menu.vue';
  import BasicSetting from './components/pages/basic-setting.vue';
  import VideoSetting from './components/pages/video-setting.vue';
  import AudioInSetting from './components/pages/audio-in-setting.vue';
  import AudioOutSetting from './components/pages/audio-out-setting.vue';
  import { boxEventOpitons } from '@/packages/app-shared/utils/tool';

  import { useMediaSettingServer, useInteractiveServer, useRoomBaseServer } from 'middle-domain';

  import mediaSettingConfirm from './js/showConfirm';
  import { RATE_REPORT_MAP, SCREEN_RATE_REPORT_MAP, LAYOUT_REPORT_MAP } from './js/reportMap';

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
    name: 'VmpPcMediaSetting',
    components: {
      SaasAlert,
      SaasDialog,

      SettingMenu,
      BasicSetting,
      VideoSetting,
      AudioInSetting,
      AudioOutSetting
    },
    data() {
      return {
        loading: false,
        mediaState: this.mediaSettingServer.state,
        isShow: false, // 整体media-setting是否可见
        isConfirmVisible: false, // 确定框可视性
        isRepublishMode: false, // 设备异常重推流
        selectedMenuItem: 'basic-setting',
        alertText: this.$t('setting.setting_1031'),
        popAlert: {
          text: this.$t('interact.interact_1011'),
          visible: false
        },
        hostAlertVisible: false
      };
    },
    computed: {
      devices() {
        return this.mediaState.devices;
      }
    },
    beforeCreate() {
      this.mediaSettingServer = useMediaSettingServer();
    },
    created() {
      this._originCaptureState = {}; // 原始选中的数据
      this._diffOptions = {}; // 差异数据（更改的数据）
    },
    async mounted() {
      const { watchInitData } = useRoomBaseServer().state;
      this.webinar = watchInitData.webinar;
      const role = watchInitData.join_info?.role_name;
      // 绑定confirm对应的视图操作
      mediaSettingConfirm.onShow(text => {
        this.alertText = text;
        this.isConfirmVisible = true;
      });
      // 监听设备禁用
      useInteractiveServer().$on('EVENT_STREAM_END', msg => {
        if (+msg.data.streamType !== 3) {
          // 非桌面共享
          if (role == 1) {
            this.hostAlertVisible = true;
          } else {
            this.popAlert.visible = true;
          }
        }
      });
    },
    beforeDestroy() {
      mediaSettingConfirm && mediaSettingConfirm.destroy();
    },
    methods: {
      // 关闭弹窗
      closeConfirm() {
        this.popAlert.visible = false;
      },
      /**
       * 展示弹窗
       */
      showMediaSetting() {
        this.isShow = true;
        this.reset();
      },
      /**
       * 设备被禁用，重新检查设备
       */
      handleCheck() {
        this.hostAlertVisible = false;
        this.isRepublishMode = true;
        this.showMediaSetting();
      },
      /**
       * 关闭弹窗
       */
      closeMediaSetting() {
        this.isShow = false;
        this.isRepublishMode = false;
        this?.$refs['videoSetting']?.destroyStream();
        this?.$refs['audioOutSetting']?.pauseAudio();
      },
      /**
       * 点击对话框确认按钮（保存）的回调
       */
      onConfirmSave() {
        this.isConfirmVisible = false;
        mediaSettingConfirm.dispatchAction('confirm');
      },
      /**
       * 关闭对话框按钮的回调
       */
      onCloseConfirm() {
        this.isConfirmVisible = false;
        mediaSettingConfirm.dispatchAction('close');
      },
      /**
       * 更改左侧菜单选中项
       * @param {String} id
       */
      changeSelectedMenuItem(id) {
        this.selectedMenuItem = id;
      },
      /**
       * 重置状态并重新获取设备状态
       */
      async reset() {
        try {
          this.loading = true;
          this.setDefaultVideoType();
          await this.getDevices();
          this.setDefaultSelected();
          this.selectedMenuItem === 'video-setting' && this.$refs['videoSetting'].createPreview();
          this.getStateCapture();
          this.loading = false;
        } catch (error) {
          console.error('error:', error);
        }
      },
      /**
       * 保存操作
       * (中途会弹窗确认，否决将不执行真实保存操作)
       */
      async saveMediaSetting() {
        const watchInitData = this.$domainStore.state.roomBaseServer.watchInitData;

        let action = 'not-living';

        this._diffOptions = this.getDiffOptions();
        const videoTypeChanged = this._diffOptions.videoType !== undefined;
        const pictureUrlChanged = this._diffOptions.canvasImgUrl !== undefined;

        console.log('diffOptions:', this._diffOptions);

        // 直播中
        if (watchInitData.webinar.type === 1 && (videoTypeChanged || pictureUrlChanged)) {
          const text = this.$t('setting.setting_1031');
          action = await mediaSettingConfirm.show(text);
        }

        if (action === 'not-living' || action === 'confirm') {
          await this.updateDeviceSetting();
          this.closeMediaSetting();
          this.sendChangeEvent();
          this.setReport();
          this.getStateCapture(); // 更新快照
        }
      },
      setReport() {
        const { rate, screenRate, layout } = this.mediaState;
        const diffOptions = this.getDiffOptions();

        /**
         * 埋点 - rate -> 分辨率（仅主持人端上报）
         *  110014-标清 110015-高清 110016-流畅 110147-超清
         */
        const rateCode = RATE_REPORT_MAP.get(rate);
        window?.vhallReportForProduct?.report(rateCode);

        /**
         * 埋点 - screenRate -> PPT静态/视频
         *  110017-PPT静态 110018-视频动态
         */
        const screenRateCode = SCREEN_RATE_REPORT_MAP.get(screenRate);
        window?.vhallReportForProduct?.report(screenRateCode);

        /**
         * 埋点 - layout -> 观看布局（旁路布局）
         * 110019-主次浮窗 110020-主次平铺 110021-均匀排列
         */
        const layoutCode = LAYOUT_REPORT_MAP.get(layout);
        window?.vhallReportForProduct?.report(layoutCode);

        /**
         * 埋点 - 推流摄像头
         * 触发条件：保存时+摄像头ID切换时
         */
        const videoTypeChanged = diffOptions.videoType !== undefined;
        if (diffOptions.video && !videoTypeChanged) {
          window?.vhallReport.report(110143, {
            report_extra: { dn: diffOptions.video }
          });
        }

        /**
         * 埋点 - 推流麦克风
         * 触发条件：保存时+麦克风需要重新推流时
         */
        if (diffOptions.audioInput) {
          window?.vhallReport.report(110144, {
            report_extra: { dn: diffOptions.audioInput }
          });
        }
      },
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
       * 发送变化事件
       */
      sendChangeEvent() {
        const diffOptions = this._diffOptions;
        if (Object.keys(diffOptions) === 0) return;

        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'saveOptions', diffOptions));
      },
      /**
       * 更新设置并缓存字段
       */
      async updateDeviceSetting() {
        const { watchInitData } = useRoomBaseServer().state;

        if (watchInitData?.join_info?.role_name == '1') {
          // 保存的配置上传服务器
          await this.mediaSettingServer.setStream({
            room_id: watchInitData.interact.room_id,
            definition: this.mediaState.rate || 'RTC_VIDEO_PROFILE_360P_16x9_M',
            layout: this.mediaState.layout || 0,
            screen_definition: this.mediaState.screenRate // 桌面共享清晰度
          });
        }

        this.saveSelected();
        this.$message.success(this.$t('common.common_1034'));
        return true;
      },
      /**
       * 获取所有设备
       */
      async getDevices() {
        // 获取视频列表
        await this.mediaSettingServer.getCameras(
          item => item.label && item.deviceId !== 'desktopScreen'
        );

        // 获取话筒
        await this.mediaSettingServer.getMicrophones(
          d => d.deviceId !== 'default' && d.deviceId !== 'communications' && d.label
        );

        // 获取扬声器
        await this.mediaSettingServer.getSpeakers(item => item.label);

        return true;
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
       * 缓存设置字段
       */
      saveSelected() {
        const canvasObj = JSON.stringify({
          flag: this.mediaState.videoType === 'picture',
          streamUrl: this.mediaState.canvasImgUrl
        });

        const localMap = new Map([
          [`saveCanvasObj_${this.webinar.id}`, canvasObj],
          [`selectVideoType_${this.webinar.id}`, this.mediaState.videoType || 'camera']
        ]);

        const sessionMap = new Map([
          ['selectedVideoDeviceId', this.mediaState.video || ''],
          ['selectedAudioDeviceId', this.mediaState.audioInput || ''],
          ['selectedAudioOutputDeviceId', this.mediaState.audioInput || ''],
          ['selectedRate', this.mediaState.rate || ''],
          ['selectedScreenRate', this.mediaState.screenRate || ''],
          ['layout', this.mediaState.layout || '']
        ]);

        // 记录
        for (const [key, value] of localMap) {
          localStorage.setItem(key, value);
        }
        for (const [key, value] of sessionMap) {
          sessionStorage.setItem(key, value);
        }
      },
      /**
       * 设置默认的视频类型
       */
      setDefaultVideoType() {
        // 视频类型
        // 设置图片推流
        const param = JSON.parse(localStorage.getItem(`saveCanvasObj_${this.webinar.id}`));
        if (param && param.flag === true && param.streamUrl !== '') {
          this.mediaState.videoType = 'picture';
          this.mediaState.canvasImgUrl = param.streamUrl;
        }
      },
      /**
       * 从缓存中取回默认值并应用进去
       * @notices 设置默认选中值前，会先请求设备，是异步状态。但在异步请求的过程中如果用户做了新的选择，就优先选中他自身。比如this.mediaState.video = this.mediaState.video。以免数据跳动。
       */
      setDefaultSelected() {
        const {
          videoInputDevices = [],
          audioInputDevices = [],
          audioOutputDevices = []
        } = this.devices;

        const getCurSelect = (devices, id) => {
          const isExsit = devices.find(item => item.deviceId === id);
          console.log('devices:', id, devices);
          if (id && !isExsit) return '';

          return id;
        };

        debugger;

        // 视频
        if (videoInputDevices.length > 0) {
          const sessionVideoId = sessionStorage.getItem('selectedVideoDeviceId');
          const lastSelect = this.mediaState.video || sessionVideoId;
          const curSelect = getCurSelect(videoInputDevices, lastSelect);
          this.mediaState.video = curSelect || videoInputDevices[0].deviceId;
        } else {
          this.mediaState.video = '';
          sessionStorage.removeItem('selectedVideoDeviceId');
        }

        // 麦克风
        if (audioInputDevices.length > 0) {
          const sessionAudioId = sessionStorage.getItem('selectedAudioDeviceId');
          const lastSelect = this.mediaState.audioInput || sessionAudioId;
          const curSelect = getCurSelect(audioInputDevices, lastSelect);
          this.mediaState.audioInput = curSelect || audioInputDevices[0].deviceId;
        } else {
          this.mediaState.audioInput = '';
          sessionStorage.removeItem('selectedAudioDeviceId');
        }

        // 扬声器
        if (audioOutputDevices.length > 0) {
          const sessionAudioOutputId = sessionStorage.getItem('selectedAudioOutputDeviceId');
          const lastSelect = this.mediaState.audioOutput || sessionAudioOutputId;
          const curSelect = getCurSelect(audioOutputDevices, lastSelect);

          this.mediaState.audioOutput = curSelect || audioOutputDevices[0].deviceId;
        } else {
          this.mediaState.audioOutput = '';
          sessionStorage.removeItem('selectedAudioOutputDeviceId');
        }
      }
    }
  };
</script>

<style lang="less">
  .vmp-media-setting-dialog-body {
    .el-radio__input.is-checked + .el-radio__label {
      color: #606266;
    }

    background: #fff;
    display: flex;
    height: 500px;
    box-sizing: border-box;

    // 左侧菜单
    .vmp-media-setting-menu {
      height: 100%;
      width: 120px;
      flex: 0 0 auto;
    }

    // 右侧正文
    .vmp-media-setting-content {
      height: 100%;
      flex: 1 1 auto;
      box-sizing: border-box;
      background-color: #f7f7f7;
      display: flex;
      flex-direction: column;
      width: 360px;
      padding: 64px 32px 24px;

      &-main {
        flex: 1;

        // 复用元素
        .vmp-media-setting-item {
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

        .vmp-media-setting-tips {
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
      }

      &-footer {
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
  }
</style>

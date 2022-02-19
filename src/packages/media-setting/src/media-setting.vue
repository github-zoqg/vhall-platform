<template>
  <section class="vmp-media-setting-dialog-body">
    <!-- 左侧菜单 -->
    <aside class="vmp-media-setting-menu">
      <setting-menu :selected-item="selectedMenuItem" @change="changeSelectedMenuItem" />
    </aside>

    <!-- 右侧面板 -->
    <section class="vmp-media-setting-content">
      <main class="vmp-media-setting-content-main">
        <!-- 基础设置 -->
        <basic-setting v-show="selectedMenuItem === 'basic-setting'" @showConfirm="showConfirm" />
        <!-- 摄像头 -->
        <video-setting v-show="selectedMenuItem === 'video-setting'" />
        <!-- 麦克风 -->
        <audio-in-setting v-show="selectedMenuItem === 'audio-in-setting'" />
        <!-- 扬声器 -->
        <audio-out-setting v-show="selectedMenuItem === 'audio-out-setting'" />
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
          <el-button size="small" type="primary" @click="saveSetting">
            {{ $t('account.account_1062') }}
          </el-button>
          <el-button @click="clickClose" size="small">
            {{ $t('account.account_1063') }}
          </el-button>
        </section>
      </footer>
    </section>
  </section>
</template>

<script>
  /**
   * 注：发起端有 基础设置、摄像头、麦克风、扬声器 四项
   * 而观看端 没有基础设置
   */
  import SettingMenu from './components/setting-menu.vue';
  import BasicSetting from './components/pages/basic-setting.vue';
  import VideoSetting from './components/pages/video-setting.vue';
  import AudioInSetting from './components/pages/audio-in-setting.vue';
  import AudioOutSetting from './components/pages/audio-out-setting.vue';
  import { boxEventOpitons } from '@/packages/app-shared/utils/tool';

  import { useMediaSettingServer, useRoomBaseServer } from 'middle-domain';

  export default {
    name: 'VmpPcMediaSetting',
    components: {
      SettingMenu,
      BasicSetting,
      VideoSetting,
      AudioInSetting,
      AudioOutSetting
    },
    data() {
      return {
        mediaState: this.mediaSettingServer.state,
        isShow: true,
        selectedMenuItem: 'basic-setting',

        liveMode: 0 // 1-音频 2-视频 3-互动
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
      const { watchInitData } = useRoomBaseServer().state;
      this.liveMode = watchInitData?.webinar?.mode;
      this.webinar = watchInitData.webinar;
    },
    mounted() {
      this.restart();
    },
    methods: {
      // action
      clickClose() {
        this.$emit('closeDlg');
      },
      changeSelectedMenuItem(id) {
        console.log('on click on lick', id);
        this.selectedMenuItem = id;
      },
      showConfirm(text = '', payload = {}) {
        this.$emit('showConfirm', text, payload);
      },
      restart() {
        try {
          this.getVideoDeviceInfo();
        } catch (error) {
          console.error('error:', error);
        }
      },
      saveSetting() {
        // const watchInitData = this.$domainStore.state.roomBaseServer.watchInitData;
        // if (watchInitData.webinar.type === 1) {
        this.showConfirm(`修改设置后导致重新推流，是否继续保存?`);
        this.updateDeviceSetting();
        // }
      },
      async updateDeviceSetting() {
        const { watchInitData } = useRoomBaseServer().state;

        // 角色为1
        if (watchInitData?.join_info?.role_name == '1') {
          await this.mediaSettingServer.setStream({
            room_id: watchInitData.interact.room_id,
            definition: this.mediaState.rate || 'RTC_VIDEO_PROFILE_360P_16x9_M',
            layout: this.mediaState.layout || 0,
            screen_definition: this.mediaState.screenRate // 桌面共享清晰度
          });
          // 角色不为1

          this.saveSelected();
        } else {
          // TODO: event.deviceSplit(options)&selectVideoType
          window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'saveOptions'));

          this.saveSelected();

          this.$message.success('保存成功！');
        }

        // 这里发送事件通知 stream 变化
        this.mediaSettingServer.stopVideoPreview();
        this.$emit('submit', false);
      },
      async getVideoDeviceInfo() {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(trackInput => trackInput.stop());
        this.getDevices();
      },
      // 按条件获取devices列表
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

        this.setDefaultSelected();
      },
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

      setDefaultSelected() {
        const {
          videoInputDevices = [],
          audioInputDevices = [],
          audioOutputDevices = []
        } = this.devices;

        // 视频
        if (videoInputDevices.length > 0) {
          const sessionVideoId = sessionStorage.getItem('selectedVideoDeviceId');
          this.mediaState.video = sessionVideoId || videoInputDevices[0].deviceId;
        } else {
          sessionStorage.removeItem('selectedVideoDeviceId');
        }

        // 麦克风
        if (audioInputDevices.length > 0) {
          const sessionAudioId = sessionStorage.getItem('selectedAudioDeviceId');
          this.mediaState.audioInput = sessionAudioId || audioInputDevices[0].deviceId;
        } else {
          sessionStorage.removeItem('selectedAudioDeviceId');
        }

        // 扬声器
        if (audioOutputDevices.length > 0) {
          const sessionAudioOutputId = sessionStorage.getItem('selectedAudioOutputDeviceId');
          this.mediaState.audioOutput = sessionAudioOutputId || audioOutputDevices[0].deviceId;
        } else {
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
    // height: 100%;
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
      padding: 64px 32px 24px 32px;

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

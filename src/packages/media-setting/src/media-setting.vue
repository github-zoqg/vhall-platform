<template>
  <section class="vmp-media-setting-dialog-body">
    <!-- 左侧菜单 -->
    <aside class="vmp-media-setting-menu">
      <setting-menu :selected-item="selectedItem" @change="changeSelectedItem"></setting-menu>
    </aside>

    <!-- 右侧面板 -->
    <section class="vmp-media-setting-content">
      <main class="vmp-media-setting-content-main">
        <basic-setting
          v-show="selectedItem === 'basic-setting'"
          :selected="selected"
          @showConfirm="showConfirm"
        />
        <video-setting
          v-show="selectedItem === 'video-setting'"
          :mediaCheckServer="mediaCheckServer"
          :devices="devices.videoInputDevices"
          @onSelectChange="onSelectChange"
        />
        <audio-in-setting
          v-show="selectedItem === 'audio-in-setting'"
          :devices="devices.audioInputDevices"
          @onSelectChange="onSelectChange"
        />
        <audio-out-setting
          v-show="selectedItem === 'audio-out-setting'"
          :devices="devices.audioOutputDevices"
          @onSelectChange="onSelectChange"
        />
      </main>

      <!-- 底部按钮区域 -->
      <footer class="vmp-media-setting-content-footer">
        <a
          class="vmp-media-setting-content-footer__help"
          href="//www.vhall.com/saas/doc/1722.html"
          target="_blank"
        >
          帮助与支持
        </a>
        <section>
          <el-button size="small" type="primary" @click="saveSetting">确定</el-button>
          <el-button @click="clickClose" size="small">取消</el-button>
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
  import { getOptionEntity } from './js/getOptionEntity';

  import { useMediaCheckServer, useRoomBaseServer } from 'middle-domain';

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
        isShow: true,
        selectedItem: 'basic-setting',

        liveMode: 0,

        menuList: getOptionEntity(),
        mediaState: this.mediaCheckServer.state,
        selected: {
          rate: '', // 画质
          pptRate: '', // PPT模式（动态/静态）
          layout: '', //布局
          video: '',
          audioInput: '',
          audioOutput: ''
        }
      };
    },
    computed: {
      devices() {
        return this.mediaState.devices;
      }
    },
    beforeCreate() {
      this.mediaCheckServer = useMediaCheckServer();
    },
    created() {
      const { watchInitData } = useRoomBaseServer().state;
      this.liveMode = watchInitData?.webinar?.mode;
    },
    mounted() {
      this.restart();
    },
    methods: {
      onSelectChange(type, val) {
        this.selected[type] = val;
      },
      // action
      clickClose() {
        this.$emit('closeDlg');
      },
      deviceChange() {},
      changeSelectedItem(id) {
        console.log('on click on lick', id);
        this.selectedItem = id;
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
        // TODO: 开播才弹出对话框  if(status=== 1)
        // this.showConfirm(`修改设置后导致重新推流，是否继续保存?`);
        this.updateDeviceSetting();
      },
      updateDeviceSetting() {
        // 这里发送事件通知 stream 变化
        alert('test');
        this.$emit('submit', false);
      },
      async getVideoDeviceInfo() {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(trackInput => trackInput.stop());
        this.getDevices();
      },
      async getDevices() {
        // 获取视频列表
        await this.mediaCheckServer.getCameras(
          item => item.label && item.deviceId !== 'desktopScreen'
        );

        // 获取话筒
        await this.mediaCheckServer.getMicrophones(
          d => d.deviceId !== 'default' && d.deviceId !== 'communications' && d.label
        );

        // 获取扬声器
        await this.mediaCheckServer.getSpeakers(item => item.label);
      },
      saveSelected() {
        const saveMap = new Map([
          ['selectedVideoDeviceId', this.selected.video],
          ['selectedAudioDeviceId', this.selected.audioInput],
          ['selectedAudioOutputDeviceId', this.selected.audioInput],
          ['layout', this.selected.layout]
        ]);

        for (const [key, value] of saveMap) {
          sessionStorage.setItem(key, value);
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

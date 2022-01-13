<template>
  <section class="vmp-media-setting-container">
    <el-dialog
      :visible.sync="isShow"
      :close-on-click-model="false"
      :close-on-press-escape="false"
      destroy-on-close
      center
      top="15vh"
      @open="restart"
    >
      <section class="vmp-media-setting-dialog-body">
        <!-- 左侧菜单 -->
        <aside class="vmp-media-setting-menu">
          <setting-menu :selected-item="selectedItem" @change="changeSelectedItem"></setting-menu>
        </aside>

        <!-- 右侧面板 -->
        <section class="vmp-media-setting-content">
          <main class="vmp-media-setting-content-main">
            <basic-setting v-show="selectedItem === 'basic-setting'" />
            <video-setting
              v-show="selectedItem === 'video-setting'"
              :devices="devices.videoInputDevices"
              :selectedId.sync="selected.video"
            />
            <audio-in-setting
              v-show="selectedItem === 'audio-in-setting'"
              :devices="devices.audioInputDevices"
              :selectedId.sync="selected.audioInput"
            />
            <audio-out-setting
              v-show="selectedItem === 'audio-out-setting'"
              :devices="devices.audioOutputDevices"
              :selectedId.sync="selected.audioOutput"
            />
          </main>
          <footer class="vmp-media-setting-content-footer">
            <a
              class="vmp-media-setting-content-footer__help"
              href="//www.vhall.com/saas/doc/1722.html"
              target="_blank"
            >
              帮助与支持
            </a>
            <section>
              <el-button size="small">确定</el-button>
              <el-button size="small">取消</el-button>
            </section>
          </footer>
        </section>
      </section>
    </el-dialog>
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

  import { useMediaCheckServer } from 'middle-domain';

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
        menuList: getOptionEntity(),

        mediaState: this.mediaCheckServer.state,
        selected: {
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
    mounted() {
      this.restart();
    },
    methods: {
      changeSelectedItem(id) {
        this.selectedItem = id;
      },
      restart() {
        try {
          this.getVideoDeviceInfo();
        } catch (error) {
          console.error('error:', error);
        }
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

        this.setDefaultSelected();
      },
      setDefaultSelected() {
        // 设置默认选项
        if (this.devices.videoInputDevices.length > 0) {
          this.selected.video = this.devices.videoInputDevices[0].deviceId;
        } else {
          sessionStorage.removeItem('media-check.selected.video');
        }

        if (this.devices.audioInputDevices.length > 0) {
          this.selected.audioInput = this.devices.audioInputDevices[0].deviceId;
        } else {
          sessionStorage.removeItem('media-check.selected.audioInput');
        }

        if (this.devices.audioOutputDevices.length > 0) {
          this.selected.audioOutput = this.devices.audioOutputDevices[0].deviceId;
        } else {
          sessionStorage.removeItem('media-check.selected.audioOutput');
        }
      }
    }
  };
</script>

<style lang="less">
  .vmp-media-setting-container {
    .el-dialog__body {
      width: 480px;
      height: 500px;
    }

    .vmp-media-setting-dialog-body {
      display: flex;
      height: 100%;
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
        padding: 64px 32px;

        &-main {
          flex: 1;

          // 复用元素
          .vmp-media-setting-item {
            margin-bottom: 16px;
            display: flex;

            &__label {
              width: 68px;
              flex: 0 0 auto;
              text-align: left;
              margin-right: 10px;
              display: flex;
              align-items: center;
            }

            &__content {
              flex: 1;
            }
          }

          .vmp-media-setting-tips {
            p {
              font-size: 13px;
              color: #666;
            }
          }
        }

        &-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;

          &__help {
            color: rgb(58, 56, 56);
            &:hover {
              color: #3562fa;
            }
          }
        }
      }
    }
  }
</style>

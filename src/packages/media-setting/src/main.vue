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
            <video-setting v-show="selectedItem === 'video-setting'" />
            <audio-in-setting v-show="selectedItem === 'audio-in-setting'" />
            <audio-out-setting v-show="selectedItem === 'audio-out-setting'" />
          </main>
          <footer class="vmp-media-setting-content-footer">
            <a class="vmp-media-setting-content-footer__help" href="">帮助与支持</a>
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
        menuList: getOptionEntity()
      };
    },
    methods: {
      changeSelectedItem(id) {
        this.selectedItem = id;
      },
      restart() {}
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

      // 左侧菜单
      .vmp-media-setting-menu {
        width: 120px;
      }

      // 右侧正文
      .vmp-media-setting-content {
        background-color: #f7f7f7;
        display: flex;
        flex-direction: column;

        &-main {
          flex: 1;
        }

        &-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;

          &__help {
            color: #666;
            &:hover {
              color: #3562fa;
            }
          }
        }
      }
    }
  }
</style>

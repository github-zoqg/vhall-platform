<template>
  <ul class="vmp-media-setting-menu">
    <li class="vmp-media-setting-menu__title">{{ $t('setting.setting_1030') }}</li>
    <li
      class="vmp-media-setting-menu__item"
      :class="{ 'vmp-media-setting-menu__item--active': selectedItem === item.id }"
      v-for="item of filterMenuList"
      :key="item.id"
      @click="onClickItem(item)"
    >
      {{ $t(item.text) }}
    </li>
  </ul>
</template>

<script>
  import { LIVE_MODE_MAP } from '../js/liveMap';
  import { useMediaSettingServer, useRoomBaseServer } from 'middle-domain';

  export default {
    props: {
      selectedItem: {
        type: String,
        default: 'basic-setting'
      }
    },
    data() {
      return {
        isSafari: navigator.userAgent.match(/Version\/([\d.]+).*Safari/),
        menuList: Object.freeze([
          { id: 'basic-setting', text: '基础设置' },
          { id: 'video-setting', text: 'setting.setting_1003' },
          { id: 'audio-in-setting', text: 'setting.setting_1004' },
          { id: 'audio-out-setting', text: 'setting.setting_1005' }
        ]),
        mediaState: this.mediaSettingServer.state,
        liveMode: 3, // 1-音频 2-视频 3-互动 6-分组
        roleName: '', // 角色
        LIVE_MODE_MAP
      };
    },
    computed: {
      isShowBasic() {
        // 隐藏基本配置内的不同问题  进行计算
        const isInteractMode =
          this.liveMode == LIVE_MODE_MAP['INTERACT'] || this.liveMode == LIVE_MODE_MAP['GROUP'];
        const cond1 = !(this.roleName == '1' && this.mediaState.video && this.liveMode != 1);
        const cond2 = !(this.roleName == '1' && this.liveMode != 1);
        const cond3 = !(this.roleName == '1' && this.liveMode != 2 && isInteractMode);

        console.log('cond::', cond1, cond2, cond3);
        if (cond1 && cond2 && cond3) {
          if (this.liveMode == 1) {
            this.$emit('change', 'audio-in-setting');
          } else {
            this.$emit('change', 'video-setting');
          }
          return false;
        } else {
          return true;
        }
      },
      /**
       * 过滤菜单选项(控制其显隐)
       */
      filterMenuList() {
        return this.menuList.filter(item => {
          // 云导播推流页媒体设置菜单
          if (/lives\/yun/.test(location.pathname)) {
            return !['basic-setting', 'audio-out-setting'].includes(item.id);
          }
          // 基础设置显隐
          if (item.id === 'basic-setting' && !this.isShowBasic) return false;

          // 摄像头显隐
          if (item.id === 'video-setting' && this.liveMode == 1) return false;

          // 扬声器显隐
          if (item.id === 'audio-out-setting' && this.isSafari) return false;

          return true;
        });
      }
    },
    beforeCreate() {
      this.mediaSettingServer = useMediaSettingServer();
    },
    created() {
      this.roomBaseServer = useRoomBaseServer();
      this.initViewData();
      // 如果是云导播推流页
      if (/lives\/yun/.test(location.pathname)) {
        this.onClickItem({ id: 'video-setting', text: 'setting.setting_1003' });
      }
    },
    methods: {
      /**
       * 初始化viewData（判断显隐用）
       */
      initViewData() {
        const { configList = {}, watchInitData = {} } = this.roomBaseServer.state;
        const { join_info = {}, webinar = {}, interact = {} } = watchInitData;

        this.webinar = webinar;
        this.joinInfo = join_info;
        this.liveMode = watchInitData?.webinar?.mode;
        this.configList = configList;
        this.webinarId = webinar.id;
        this.playerType = webinar.type;
        this.roomId = interact.room_id;
        this.roleName = join_info.role_name;
        this.userId = join_info.user_id;
      },
      /**
       * 点击某个选项
       * @param {Object} item
       */
      onClickItem(item) {
        this.$emit('change', item.id);
      }
    }
  };
</script>

<style lang="less">
  .vmp-media-setting-menu {
    display: flex;
    flex-direction: column;

    .vmp-media-setting-menu__title {
      line-height: 64px;
      margin-bottom: 0px;
      font-size: 18px;
      font-weight: 700;
      text-align: left;
      padding-left: 24px;
      color: #1a1a1a;
      position: relative;
      cursor: pointer;
    }

    .vmp-media-setting-menu__item {
      cursor: pointer;
      box-sizing: border-box;
      font-size: 14px;
      height: 40px;
      display: flex;
      align-items: center;
      padding-left: 24px;
      user-select: none;

      &:hover {
        color: #fb3a32;
      }

      &--active {
        color: #fb3a32;
        background: #f7f7f7;
        position: relative;

        &::before {
          position: absolute;
          content: '';
          height: 100%;
          left: 0;
          width: 3px;
          background: #fb3a32;
        }
      }
    }
  }
</style>

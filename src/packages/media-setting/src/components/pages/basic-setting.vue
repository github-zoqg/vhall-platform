<template>
  <section>
    <main>
      <section class="vmp-media-setting-item" v-if="roleName == 1">
        <label class="vmp-media-setting-item__label">画质选择</label>
        <el-select
          class="vmp-media-setting-item__content"
          v-model="mediaState.rate"
          @change="rateChange(mediaState.rate)"
        >
          <el-option
            v-for="rate in ratesConfig"
            :key="rate"
            :value="rate"
            :label="formatDefinitionLabel(rate)"
          ></el-option>
        </el-select>
      </section>

      <section class="vmp-media-setting-item">
        <label class="vmp-media-setting-item__label">桌面共享</label>
        <el-select
          class="vmp-media-setting-item__content"
          v-model="mediaState.screenRate"
          placeholder="请选择桌面共享模式"
        >
          <el-option
            v-for="rate in screenRatesConfig"
            :key="rate.label"
            :value="rate.value"
            :label="rate.label"
          ></el-option>
        </el-select>
      </section>

      <section class="vmp-media-setting-item">
        <label class="vmp-media-setting-item__label">插播文件</label>
        <el-select class="vmp-media-setting-item__content" v-model="mediaState.videoHint">
          <el-option
            v-for="item in videoContentHint"
            :key="item.label"
            :value="item.value"
            :label="item.label"
          ></el-option>
        </el-select>
      </section>

      <section
        class="vmp-media-setting-item"
        v-if="liveMode != LIVE_MODE_MAP['VIDEO'] && roleName == 1"
      >
        <label class="vmp-media-setting-item__label">观看端布局(视频)</label>
        <section class="vmp-media-setting-item__content">
          <div
            class="vmp-media-setting-item-layout__item"
            :class="{
              'vmp-media-setting-item-layout__item--selected': mediaState.layout === item.id,
              disabled: liveStatus === 1
            }"
            v-for="item of filterLayoutConfig"
            :key="item.id"
            @click="setLayout(item.id)"
          >
            <img :src="item.img" alt="" />
            <p>{{ item.text }}</p>
          </div>
        </section>
      </section>
    </main>

    <footer>
      <section class="vmp-media-setting-tips">
        <section class="vmp-media-setting-tips__title">{{ $t('account.account_1061') }}：</section>
        <section class="vmp-media-setting-tips__title">桌面共享</section>
        <section class="vmp-media-setting-tips__content">
          <p>1.PPT静态演示：适用于桌面共享时演示文档、图片等静态内容</p>
          <p>2.视频动态演示：适用于演示视频等多动画内容</p>
        </section>
        <section class="vmp-media-setting-tips__title">插播文件</section>
        <section class="vmp-media-setting-tips__content">
          <p>1.流畅度优先：适用于插播文件时演示视频等多动画内容</p>
          <p>2.清晰度优先：适用于插播文件时演示文档、图片等静态内容</p>
        </section>
      </section>
    </footer>
  </section>
</template>

<script>
  import { useMediaSettingServer, useMsgServer } from 'middle-domain';
  import { LIVE_MODE_MAP } from '../../js/liveMap';
  import mediaSettingConfirm from '../../js/showConfirm';

  import FloatImg from '../../assets/img/float.png';
  import TiledImg from '../../assets/img/tiled.png';
  import TiledReverseImg from '../../assets/img/tiled-reverse.png';
  import GridImg from '../../assets/img/grid.png';
  export default {
    name: 'BasicSetting',
    data() {
      return {
        loading: false, // 读取中
        mediaState: this.mediaSettingServer.state,
        lastSelectRate: '', // 上一选中的画质的值（用于取消更改时还原）
        ratesConfig: Object.freeze([
          'RTC_VIDEO_PROFILE_720P_16x9_M', // 超清
          'RTC_VIDEO_PROFILE_480P_16x9_M', // 高清
          'RTC_VIDEO_PROFILE_360P_16x9_M', // 标清
          'RTC_VIDEO_PROFILE_240P_16x9_M' // 流畅
        ]),
        screenRatesConfig: Object.freeze([
          { value: 'RTC_SCREEN_PROFILE_1080P_16x9_H', label: '视频动态演示模式' },
          { value: 'RTC_SCREEN_PROFILE_1080P_16x9_M', label: 'PPT静态演示模式' }
        ]),
        videoContentHint: Object.freeze([
          { value: 'detail', label: '清晰度优先' },
          { value: 'motion', label: '流畅度优先' }
        ]),
        layoutConfig: Object.freeze([
          { id: 'CANVAS_ADAPTIVE_LAYOUT_FLOAT_MODE', img: FloatImg, text: '主次浮窗' },
          { id: 'CANVAS_ADAPTIVE_LAYOUT_TILED_MODE', img: TiledImg, text: '主次平铺' },
          { id: 'CANVAS_ADAPTIVE_LAYOUT_GRID_MODE', img: GridImg, text: '均匀排列' }
        ]),
        LIVE_MODE_MAP
      };
    },
    computed: {
      webinar() {
        return this.$domainStore.state.roomBaseServer.watchInitData.webinar;
      },
      // 直播类型：1-音频 2-视频 3-互动 6-互动
      roleName() {
        return this.$domainStore.state.roomBaseServer.watchInitData.join_info.role_name;
      },
      // 直播状态： 直播中、已结束....
      liveStatus() {
        return this.webinar.type;
      },
      // 直播类型：1-音频 2-视频 3-互动 6-互动
      liveMode() {
        return this.webinar.mode;
      },
      // 是否是无延迟
      isNoDelay() {
        return this.webinar.no_delay_webinar === 1;
      },
      // 在不同场景下的layoutConfig
      filterLayoutConfig() {
        // 分组、无延迟时，只展示一种布局
        const isGroupLive = this.liveMode === LIVE_MODE_MAP['GROUP'];

        // 分组时，主次布局是颠倒的，更换对应的img图片
        if (isGroupLive) {
          return this.layoutConfig
            .filter(item => item.id === 'CANVAS_ADAPTIVE_LAYOUT_TILED_MODE')
            .map(item => {
              item.img = TiledReverseImg;
              return item;
            });
        }

        if (this.isNoDelay) {
          return this.layoutConfig.filter(item => item.id === 'CANVAS_ADAPTIVE_LAYOUT_TILED_MODE');
        }

        return this.layoutConfig;
      }
    },
    watch: {
      'mediaState.rate': function (cur, old) {
        this.lastSelectRate = old;
      }
    },
    beforeCreate() {
      this.mediaSettingServer = useMediaSettingServer();
      this.msgServer = useMsgServer();
    },
    created() {
      this.listenEvents();
    },
    mounted() {
      this.setDefault();
    },
    beforeDestroy() {
      this.removeEvents();
    },
    methods: {
      listenEvents() {
        // 结束直播时恢复 标清
        this._onLiveOver = () => {
          this.mediaState.rate = this.ratesConfig[2]; // 恢复标清;
          sessionStorage.setItem('selectedRate', '');
        };
        this.msgServer.$on('live_over', this._onLiveOver);
      },
      removeEvents() {
        this.msgServer.$off('live_over', this._onLiveOver);
      },
      /**
       * 设置布局(layout)
       * @param {String} id
       */
      setLayout(id) {
        if (this.liveStatus === 1) return;
        this.mediaState.layout = id;
      },
      /**
       * 应用默认选项
       */
      setDefault() {
        const saveRate = sessionStorage.getItem('selectedRate') || this.ratesConfig[2]; // 默认标清
        const saveScreenRate =
          sessionStorage.getItem('selectedScreenRate') || this.screenRatesConfig[1].value; // 默认PPT静态
        const videoHint = sessionStorage.getItem('videoHint') || this.videoContentHint[0].value; // 插播文件默认清晰度
        const savedLayout =
          this.mediaState.layout ||
          sessionStorage.getItem('layout') ||
          'CANVAS_ADAPTIVE_LAYOUT_TILED_MODE'; // 默认主次平铺

        this.mediaState.rate = saveRate;
        this.mediaState.screenRate = saveScreenRate;
        this.mediaState.videoHint = videoHint;
        this.mediaState.layout = savedLayout;
      },
      /**
       * 格式化清晰度(rate to text)
       * @param {String} label
       */
      formatDefinitionLabel(label) {
        const map = new Map([
          ['RTC_VIDEO_PROFILE_240P_16x9_M', '流畅'],
          ['RTC_VIDEO_PROFILE_480P_16x9_M', 'player.player_1003'],
          ['RTC_VIDEO_PROFILE_360P_16x9_M', 'player.player_1004'],
          ['RTC_VIDEO_PROFILE_720P_16x9_M', 'player.player_1005'],
          ['240', 'RTC_VIDEO_PROFILE_240P_16x9_M'],
          ['480', 'RTC_VIDEO_PROFILE_480P_16x9_M'],
          ['360', 'RTC_VIDEO_PROFILE_360P_16x9_M'],
          ['720', 'RTC_VIDEO_PROFILE_720P_16x9_M']
        ]);
        return this.$t(map.get(label));
      },
      /**
       * 更改清晰度
       * @notes 如果选择的是超清，会进行弹窗询问，如果取消则会还原选择前的值
       * @param {String} selected
       */
      async rateChange(selected) {
        if (selected === 'RTC_VIDEO_PROFILE_720P_16x9_M') {
          const text = '当前设置清晰度对设备硬件性能要求较高，是否继续使用？';
          const action = await mediaSettingConfirm.show(text);
          action === 'close' && (this.mediaState.rate = this.lastSelectRate);
        }
      }
    }
  };
</script>

<style lang="less">
  .vmp-media-setting-item__content {
    display: flex;
    justify-content: space-between;

    .vmp-media-setting-item-layout__item {
      border: 1px solid #c4c4c4;
      width: 72px;
      height: 50px;
      border-radius: 4px;
      background-size: 100%;
      user-select: none;
      cursor: pointer;

      &--selected {
        border: 1px solid #fb3a32;
      }

      &.disabled {
        cursor: not-allowed;
      }

      img {
        width: 100%;
        height: 100%;
        user-select: none;
        pointer-events: none;
      }

      p {
        margin-top: 2px;
        color: #666;
        font-size: 12px;
        text-align: center;
      }
    }
  }

  .vmp-media-setting-tips__content {
    margin-bottom: 8px;
  }
</style>

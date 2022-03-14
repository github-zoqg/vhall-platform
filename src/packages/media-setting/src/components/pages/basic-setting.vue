<template>
  <section>
    <main>
      <section class="vmp-media-setting-item">
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
          :disabled="liveStatus === 1"
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

      <section class="vmp-media-setting-item" v-if="liveMode != LIVE_MODE_MAP['VIDEO']">
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
        <section class="vmp-media-setting-tips__content">
          <p>1.PPT静态演示：适用于桌面共享时演示文档、图片等静态内容</p>
          <p>2.视频动态演示：适用于演示视频等多动画内容</p>
          <p>3. 直播中不可更改桌面共享类型</p>
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
  import GridImg from '../../assets/img/grid.png';
  export default {
    data() {
      return {
        loading: false,
        mediaState: this.mediaSettingServer.state,
        lastSelectRate: '', // 上一选中的值
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
      liveStatus() {
        return this.webinar.type;
      },
      liveMode() {
        return this.webinar.mode;
      },
      isNoDelay() {
        return this.webinar.no_delay_webinar === 1;
      },
      filterLayoutConfig() {
        // 分组、无延迟时，只展示一种布局
        const isGroupLive = this.liveMode === LIVE_MODE_MAP['GROUP'];
        if (isGroupLive || this.isNoDelay) {
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
      this.setDefault();
      this.listenEvents();
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
          this.$forceUpdate();
        };
        this.msgServer.$on('live_over', this._onLiveOver);
      },
      removeEvents() {
        this.msgServer.$off('live_over', this._onLiveOver);
      },
      setLayout(id) {
        if (this.liveStatus === 1) return;
        this.mediaState.layout = id;
      },

      setDefault() {
        const saveRate = sessionStorage.getItem('selectedRate') || this.ratesConfig[2]; // 默认标清
        const saveScreenRate =
          sessionStorage.getItem('selectedScreenRate') || this.screenRatesConfig[1].value; // 默认PPT静态
        const savedLayout = sessionStorage.getItem('layout') || this.filterLayoutConfig[0].id;

        this.mediaState.rate = saveRate;
        this.mediaState.screenRate = saveScreenRate;
        this.mediaState.layout = savedLayout;
      },

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
        border: 1px solid #fc5659;
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
</style>

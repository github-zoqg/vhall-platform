<template>
  <section>
    <main>
      <section class="vmp-media-setting-item">
        <label class="vmp-media-setting-item__label">画质选择</label>
        <el-select
          class="vmp-media-setting-item__content"
          v-model="selectedRate"
          @change="rateChange(selectedRate)"
        >
          <el-option
            v-for="rate in rates"
            :key="rate.label"
            :value="rate.label"
            :label="formatDefinitionLabel(rate.label)"
          ></el-option>
        </el-select>
      </section>

      <section class="vmp-media-setting-item">
        <label class="vmp-media-setting-item__label">桌面共享</label>
        <el-select
          class="vmp-media-setting-item__content"
          v-model="selectedPPTRate"
          placeholder="请选择桌面共享模式"
        >
          <el-option
            v-for="rate in pptRates"
            :key="rate.label"
            :value="rate.value"
            :label="rate.label"
          ></el-option>
        </el-select>
      </section>

      <section class="vmp-media-setting-item">
        <label class="vmp-media-setting-item__label">观看端布局(视频)</label>
        <section class="vmp-media-setting-item__content">
          <div
            class="vmp-media-setting-item-layout__item"
            :class="{ 'vmp-media-setting-item-layout__item--selected': selectedLayout === item.id }"
            v-for="item of layoutConfig"
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
        <section class="vmp-media-setting-tips__title">提示：</section>
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
  import { getDefinitionMap, getPPTOptions } from '../../js/getOptionEntity';
  import FloatImg from '../../assets/img/float.png';
  import TiledImg from '../../assets/img/tiled.png';
  import GridImg from '../../assets/img/grid.png';
  export default {
    props: {
      selected: {
        require: true,
        default: () => ({})
      }
    },
    data() {
      return {
        rates: '',
        selectedRate: '',
        selectedPPTRate: '',
        selectedLayout: 'CANVAS_ADAPTIVE_LAYOUT_FLOAT_MODE',
        pptRates: getPPTOptions(),
        layoutConfig: Object.freeze([
          { id: 'CANVAS_ADAPTIVE_LAYOUT_FLOAT_MODE', img: FloatImg, text: '主次浮窗' },
          { id: 'CANVAS_ADAPTIVE_LAYOUT_TILED_MODE', img: TiledImg, text: '主次平铺' },
          { id: 'CANVAS_ADAPTIVE_LAYOUT_GRID_MODE', img: GridImg, text: '均匀排列' }
        ])
      };
    },
    watch: {
      'selected.video'(cur, old) {
        if (cur === old) return;
        this.getVideoConstraints(cur);
      }
    },
    methods: {
      setLayout(id) {
        this.selectedLayout = id;
      },
      async getVideoConstraints(deviceId) {
        console.log('getVideoConstraints', deviceId);
        if (!deviceId) return;

        const constraints = await VhallRTC.vhallrtc.getVideoConstraints({ deviceId });
        console.log('媒体设置获取设备分辨率列表和对应设备ID', constraints, deviceId);
        const availableRates = [
          'RTC_VIDEO_PROFILE_720P_16x9_M',
          'RTC_VIDEO_PROFILE_480P_16x9_M',
          'RTC_VIDEO_PROFILE_360P_16x9_M',
          'RTC_VIDEO_PROFILE_720P_16x9_M',
          'RTC_VIDEO_PROFILE_240P_16x9_M'
        ];
        this.rates = constraints.filter(item => {
          return availableRates.includes(item.label);
        });
      },
      setDefault() {
        const saveRate = sessionStorage.getItem('selectedRate');
        const savedLayout = sessionStorage.getItem('layout');

        this.saveRate = this.saveRate || saveRate;

        this.selectedLayout =
          this.selectedLayout ||
          (savedLayout != 'null' && savedLayout != 'undefined' ? savedLayout : '') ||
          'CANVAS_ADAPTIVE_LAYOUT_TILED_MODE';
      },
      formatDefinitionLabel(label) {
        const map = getDefinitionMap();
        return map.get(label);
      },
      rateChange(selected) {
        let text = '';
        let payload = {};

        if (selected === 'RTC_VIDEO_PROFILE_720P_16x9_M') {
          text = '当前设置清晰度对设备硬件性能要求较高，是否继续使用？';
        } else {
          text = '修改设置后会导致重新推流，是否继续保存？';
        }

        this.$emit('showConfirm', text, payload);
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

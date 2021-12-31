<template>
  <!-- 文档工具栏 -->
  <div class="vmp-doc-toolbar">
    <!-- 左: 选择文档等操作 -->
    <div class="vmp-doc-toolbar__hd">
      <div v-show="showChooseDocBtn" class="choose-document">
        {{ $t('i18n.usual.chooseDocument') }}
      </div>

      <div class="audience-visible">
        <span style="margin-right: 5px">{{ $t('i18n.usual.audienceVisible') }}</span>
        <el-switch v-model="value1" active-color="#13ce66"></el-switch>
      </div>
    </div>
    <!-- 中：画笔相关工具 -->
    <div class="vmp-doc-toolbar__bd">
      <!-- 选择 -->
      <div class="vmp-icon-item" :title="$t('i18n.usual.choose')">
        <i class="iconfont iconxuanze"></i>
      </div>
      <!-- 橡皮擦 -->
      <div class="vmp-icon-item" :title="$t('i18n.usual.eraser')">
        <i class="iconfont iconxiangpica"></i>
      </div>
      <!-- 画笔 -->
      <div class="vmp-icon-item has-corner" :title="$t('i18n.usual.pencil')">
        <i class="iconfont iconhuabi"></i>
        <vmp-pencil-popup
          itemType="pen"
          :dval="7"
          :itemArr="sizeArr"
          :colorArr="colorArr"
        ></vmp-pencil-popup>
      </div>
      <!-- 荧光笔 -->
      <div class="vmp-icon-item has-corner" :title="$t('i18n.usual.highlighter')">
        <i class="iconfont iconjiguangbi"></i>
        <vmp-pencil-popup
          itemType="pen"
          :dval="7"
          :itemArr="sizeArr"
          :colorArr="colorArr"
        ></vmp-pencil-popup>
      </div>
      <!-- 形状 -->
      <div class="vmp-icon-item has-corner" :title="$t('i18n.usual.shape')">
        <i class="iconfont icontuxing"></i>
        <vmp-pencil-popup
          itemType="shape"
          dval="setCircle"
          :itemArr="shapeArr"
          :colorArr="colorArr"
        ></vmp-pencil-popup>
      </div>
      <!-- 文字 -->
      <div class="vmp-icon-item has-corner" :title="$t('i18n.usual.text')">
        <i class="iconfont iconwenzi"></i>
        <vmp-pencil-popup
          itemType="text"
          :dval="18"
          :itemArr="fontArr"
          :colorArr="colorArr"
        ></vmp-pencil-popup>
      </div>
      <!-- 清除 -->
      <div class="vmp-icon-item" title="清除"><i class="iconfont iconqingkong"></i></div>
    </div>
    <!-- 右：全屏、文档章节等信息-->
    <div class="vmp-doc-toolbar__ft">
      <div v-show="showThumbnailBtn" class="vmp-icon-item" :title="$t('i18n.usual.docThumb')">
        <i class="iconfont iconsuolvetu"></i>
      </div>
      <div class="vmp-icon-item" :title="$t('i18n.usual.fullscreen')">
        <i class="iconfont iconquanping"></i>
      </div>
      <div class="vmp-icon-item" :title="$t('i18n.usual.close')" v-if="hasCloseBtn">
        <i class="iconfont iconguanbi2"></i>
      </div>
    </div>
  </div>
</template>
<script>
  import VmpPencilPopup from './popup.vue';

  export default {
    name: 'VmpDocToolbar',
    components: {
      VmpPencilPopup
    },
    data() {
      return {
        value1: true,
        sizeArr: [
          { label: '4', value: 4 },
          { label: '7', value: 7 },
          { label: '10', value: 10 },
          { label: '13', value: 13 }
        ],
        fontArr: [
          { label: '小', value: 14, showSize: '12' },
          { label: '中', value: 18, showSize: '16' },
          { label: '大', value: 30, showSize: '18' },
          { label: '超', value: 48, showSize: '20' }
        ],
        shapeArr: [
          { label: '圆形', value: 'setCircle', icon: 'iconfont iconyuanxing' },
          {
            label: '四边形',
            value: 'setSquare',
            icon: 'iconfont iconzhengfangxing'
          },
          {
            label: '单向箭头',
            value: 'setSingleArrow',
            icon: 'iconfont iconjiantou'
          },
          {
            label: '双向箭头',
            value: 'setDoubleArrow',
            icon: 'iconfont iconshuangjiantou'
          }
        ],
        colorArr: Object.freeze([
          { value: '#FFFFFF', title: '白色' },
          { value: '#9B9B9B', title: '浅灰' },
          { value: '#2E3038', title: '深灰' },
          { value: '#000000', title: '黑色' },
          { value: '#FD2C0A', title: '红色' },
          { value: '#FF6E00', title: '橙色' },
          { value: '#FFD400', title: '黄色' },
          { value: '#98CD47', title: '绿色' },
          { value: '#01D6D1', title: '青色' },
          { value: '#0097F0', title: '蓝色' },
          { value: '#8B6DC2', title: '紫色' },
          { value: '#FF9B9E', title: '粉色' }
        ]),
        // 是否有关闭按钮
        hasCloseBtn: true,
        showChooseDocBtn: true,
        showThumbnailBtn: true
      };
    },
    mounted() {
      this.initConfig();
    },
    methods: {
      // 初始化配置
      initConfig() {
        const widget = window.$serverConfig?.[this.cuid];
        if (widget && widget.options) {
          // eslint-disable-next-line
          if (widget.options.hasOwnProperty('hasCloseBtn')) {
            this.hasCloseBtn = widget.options.hasCloseBtn;
          }
        }
      },
      showAtMode(v) {
        if (v === 'board') {
          this.showChooseDocBtn = false;
          this.showThumbnailBtn = false;
        } else {
          this.showChooseDocBtn = true;
          this.showThumbnailBtn = true;
        }
      }
    }
  };
</script>
<style lang="less">
  .vmp-doc-toolbar {
    height: 50px;
    width: 100%;
    background: #2d2d2d;
    border-bottom: 1px solid #1f1f1f;
    position: absolute;
    top: 0;
    left: 0;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    z-index: 2;
  }

  .vmp-doc-toolbar__hd {
    max-width: 250px;
    display: flex;
    flex-direction: row;
    .choose-document {
      height: 27px;
      width: 76px;
      border-radius: 15px;
      border: 1px solid #dadada;
      font-size: 12px;
      color: #dadada;
      line-height: 27px;
      text-align: center;
      margin-left: 16px;
      cursor: pointer;
      &:hover {
        background: #fc5659;
        border-color: #fc5659;
      }
    }
    .audience-visible {
      font-size: 12px;
      color: #dadada;
      line-height: 17px;
      display: -webkit-box;
      display: -ms-flexbox;
      display: flex;
      -webkit-box-align: center;
      -ms-flex-align: center;
      align-items: center;
      margin-left: 20px;
      position: relative;

      .el-switch .el-switch__core {
        border-color: #ddd !important;
        background-color: #2d2d2d !important;
        &::after {
          background-color: #ddd;
        }
      }
      .el-switch.is-checked .el-switch__core {
        border-color: #13ce66 !important;
        background-color: #13ce66 !important;
      }
    }
  }
  .vmp-doc-toolbar__bd {
    flex: 1;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
  }
  .vmp-doc-toolbar__ft {
    display: flex;
    flex-direction: row;
    margin-right: 10px;
  }

  .vmp-icon-item {
    height: 36px;
    width: 36px;
    margin-left: 3px;
    border-radius: 4px;
    text-align: center;
    vertical-align: middle;
    position: relative;
    line-height: 36px;
    cursor: pointer;
    z-index: 100;

    i {
      font-size: 17px;
      color: #dadada;
    }

    &:hover {
      background: #000;
      .vmp-pencil-popup {
        display: block;
      }
    }
    &.has-corner {
      margin-right: 3px;
    }
  }
  .vmp-icon-item.has-corner::after {
    content: '';
    display: inline-block;
    position: absolute;
    right: 0;
    bottom: 0;
    border: 4px solid transparent;
    border-left-color: #dadada;
    -webkit-transform: rotate(45deg);
    transform: rotate(45deg);
  }
</style>

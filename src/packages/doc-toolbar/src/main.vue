<template>
  <!-- 文档工具栏 -->
  <div class="vmp-doc-toolbar">
    <!-- 左: 选择文档等操作 -->
    <div class="vmp-doc-toolbar__hd">
      <div v-show="suit === 'document'" class="choose-document" @click="openDocDlglist">
        {{ $t('usual.chooseDocument') }}
      </div>

      <div class="audience-visible">
        <span style="margin-right: 5px">{{ $t('usual.audienceVisible') }}</span>
        <div class="audience-visible__swith">
          <el-switch
            v-model="switchStatus"
            active-color="#13ce66"
            @change="audienceVisibleChange"
          ></el-switch>
          <!-- 提示 -->
          <div class="audience-tip" v-show="showAudienceTip">
            <div class="audience-tip__arrow"></div>
            <span @click="showAudienceTip = false" class="iconfont iconguanbi1"></span>
            如果想让观众看到文档/白板内容， 必须开启“观众可见”开关
          </div>
        </div>
      </div>
    </div>
    <!-- 中：画笔相关工具 -->
    <div class="vmp-doc-toolbar__bd">
      <div class="vmp-doc-toolbar__brush">
        <!-- 选择 -->
        <div
          class="vmp-icon-item"
          :title="$t('usual.choose')"
          :class="{ selected: currentBrush === 'select' }"
          @click="handleBoardTool('select')"
        >
          <i class="iconfont iconxuanze"></i>
        </div>
        <!-- 画笔 -->
        <div
          class="vmp-icon-item has-corner"
          :title="$t('usual.pen')"
          :class="{ selected: currentBrush === 'pen' }"
          @click="handleBoardTool('pen')"
        >
          <i class="iconfont iconhuabi"></i>
          <vmp-pen-popup></vmp-pen-popup>
        </div>
        <!-- 荧光笔 -->
        <div
          class="vmp-icon-item has-corner"
          :title="$t('usual.highlighter')"
          :class="{ selected: currentBrush === 'highlighter' }"
          @click="handleBoardTool('highlighter')"
        >
          <i class="iconfont iconjiguangbi"></i>
          <vmp-highlighter-popup></vmp-highlighter-popup>
        </div>
        <!-- 形状 -->
        <div
          class="vmp-icon-item has-corner"
          :title="$t('usual.shape')"
          :class="{ selected: currentBrush === 'shape' }"
          @click="handleBoardTool('shape')"
        >
          <i class="iconfont icontuxing"></i>
          <vmp-shape-popup></vmp-shape-popup>
        </div>
        <!-- 文本 -->
        <div
          class="vmp-icon-item has-corner"
          :title="$t('usual.text')"
          :class="{ selected: currentBrush === 'text' }"
          @click="handleBoardTool('text')"
        >
          <i class="iconfont iconwenzi"></i>
          <vmp-text-popup></vmp-text-popup>
        </div>
        <!-- 橡皮擦 -->
        <div
          class="vmp-icon-item"
          :title="$t('usual.eraser')"
          :class="{ selected: currentBrush === 'eraser' }"
          @click="handleBoardTool('eraser')"
        >
          <i class="iconfont iconxiangpica"></i>
        </div>
        <!-- 清除 -->
        <div class="vmp-icon-item" :title="$t('usual.clear')" @click="handleBoardTool('clear')">
          <i class="iconfont iconqingkong"></i>
        </div>

        <!-- 退出全屏 -->
        <div
          class="vmp-icon-item vmp-icon-item--exitFullscreen"
          :title="$t('usual.clear')"
          @click="fullscreen"
        >
          <i class="iconfont iconquanpingguanbi"></i>
        </div>
      </div>
    </div>
    <!-- 右：全屏、文档章节等信息-->
    <div class="vmp-doc-toolbar__ft">
      <vmp-air-container :cuid="cuid"></vmp-air-container>
    </div>
  </div>
</template>
<script>
  import VmpPenPopup from './pen-popup.vue';
  import VmpHighlighterPopup from './highlighter-popup.vue';
  import VmpShapePopup from './shape-popup.vue';
  import VmpTextPopup from './text-popup.vue';
  import { useDocServer } from 'middleDomain';
  export default {
    name: 'VmpDocToolbar',
    components: {
      VmpPenPopup,
      VmpHighlighterPopup,
      VmpShapePopup,
      VmpTextPopup
    },
    provide() {
      return {
        getSuit: () => this.suit,
        pen: this.pen,
        highlighter: this.highlighter,
        shape: this.shape,
        text: this.text,
        changeTool: this.changeTool
      };
    },
    inject: ['fullscreen', 'openDocDlglist'],
    data() {
      return {
        showAudienceTip: true,
        // 当前工具适配容器类型
        suit: '', // 文档：document ， 白板： board
        // 观众是否可见
        switchStatus: false,
        // 当前笔刷,可选 select, pen, highlighter, shape, text, eraser
        currentBrush: 'pen',
        // 画笔状态
        pen: {
          size: 7, // 粗细
          color: '#FD2C0A' // 颜色
        },
        //荧光笔
        highlighter: {
          size: 7, // 粗细
          color: '#FD2C0A' //颜色
        },
        // 形状
        shape: {
          kind: 'setCircle', //
          color: '#FD2C0A' //颜色
        },
        // 文本
        text: {
          size: 18, // 字号
          color: '#FD2C0A' //颜色
        }
      };
    },
    beforeCreate() {
      this.docServer = useDocServer();
    },
    mounted() {
      this.initConfig();
      this.recoverLastState();
    },
    methods: {
      // 初始化配置
      initConfig() {},

      /**
       *  brush：笔刷,可选 select, pen, highlighter, shape, text, eraser
       */
      changeTool(brush, key, value) {
        console.log(brush, ';', key, ';', value);
        const currentContainerId = this.docServer.state.docInstance.currentCid;
        this.currentBrush = brush;
        if (key) {
          this[brush][key] = value;
        }
        switch (brush) {
          // 选择
          case 'select': {
            this.docServer.cancelDrawable({ id: currentContainerId });
            break;
          }
          // 画笔
          case 'pen': {
            console.log('-------设置画笔 this.pen:', this.pen);
            this.docServer.setPen({ id: currentContainerId });
            this.docServer.setStrokeWidth({
              id: currentContainerId,
              width: this.pen.size
            });
            this.docServer.setStroke({
              id: this.currentContainerId,
              color: this.pen.color
            });
            break;
          }
          // 荧光笔
          case 'highlighter': {
            this.docServer.setHighlighters({ id: currentContainerId });
            this.docServer.setStrokeWidth({
              id: currentContainerId,
              width: this.highlighter.size
            });
            this.docServer.setStroke({
              id: this.currentContainerId,
              color: this.highlighter.color
            });
            break;
          }
          case 'shape': {
            this.docServer[this.shape.kind]({ id: currentContainerId });
            this.docServer.setStroke({
              id: this.currentContainerId,
              color: this.shape.color
            });
            break;
          }
          case 'text': {
            this.docServer.setText({ id: currentContainerId });
            this.docServer.setStrokeWidth({
              id: currentContainerId,
              width: this.text.size
            });
            this.docServer.setStroke({
              id: this.currentContainerId,
              color: this.text.color
            });
            break;
          }
          case 'eraser': {
            this.docServer.setEraser({
              id: this.currentContainerId
            });
            break;
          }
        }
      },
      /**
       * 切换画板工具
       */
      async handleBoardTool(brush) {
        if (brush === 'clear') {
          // TODO 提示文本进行国际化处理
          try {
            await this.$confirm('确定要清空白板么？', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            });
            this.docServer.clear();
          } catch (err) {
            console.log(err);
          }
          // 还需要重设当前画笔
          this.changeTool(this.currentBrush);
          return;
        }
        this.changeTool(brush);
      },
      /**
       *  刷新或者退出重进恢复上次的状态
       */
      recoverLastState: async function () {
        const { switch_status } = await this.docServer.getContainerInfo();
        this.switchStatus = Boolean(switch_status);
      },
      /**
       * 切换到 文档还是白板
       * @param type:文档：document， 白板：board
       */
      async switchTo(type = 'document') {
        // 当前工具适配容器类型
        this.suit = type;
        console.log('this.suit: ', this.suit);
        console.log(
          'this.docServer?.state.docInstance.currentCid:',
          this.docServer?.state.docInstance.currentCid
        );

        // 当前容器不能为空，否则设置画笔会报错
        if (this.docServer?.state.docInstance.currentCid) {
          // 需要重新设置一下笔刷工具
          this.changeTool(this.currentBrush);
        }
      },
      /**
       * 观众可见切换
       */
      audienceVisibleChange() {
        if (this.switchStatus) {
          this.docServer.switchOnContainer();
        } else {
          this.docServer.switchOffContainer();
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

  .vmp-doc-toolbar__brush {
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
      .vmp-brush-popup {
        display: block;
      }
    }
    &.selected {
      background: #000;
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
  .vmp-icon-item--exitFullscreen {
    display: none;
  }

  .audience-visible__swith {
    z-index: 2;
  }
  .audience-tip {
    position: absolute;
    top: 40px;
    width: 192px;
    word-break: break-all;
    background: #ff9b00;
    border-radius: 4px;
    line-height: 20px;
    padding: 9px 14px;
    color: #fff;
    box-sizing: content-box;
    user-select: none;

    span.iconfont {
      position: absolute;
      top: 2px;
      right: 5px;
      color: #fffdef;
      width: 15px;
      height: 15px;
      font-size: 12px;
      display: block;
      cursor: pointer;
      z-index: 2;
    }

    .audience-tip__arrow {
      position: absolute;
      display: block;
      width: 0;
      height: 0;
      border-width: 0 8px 8px;
      border-style: solid;
      border-color: transparent transparent #ff9b00;
      top: -8px;
      left: 10px;
    }
  }
</style>

<template>
  <!-- 文档工具栏 -->
  <div class="vmp-doc-toolbar" :class="[{ 'is-watch': isWatch }]">
    <!-- 左: 选择文档等操作 -->
    <div class="vmp-doc-toolbar__hd" v-show="hasDocPermission">
      <div v-show="currentType !== 'board'" class="choose-document" @click="openDocDlglist">
        {{ $t('usual.chooseDocument') }}
      </div>

      <!-- 观看端没有观众可见的按钮 -->
      <div class="audience-visible" v-if="!isWatch">
        <span style="margin-right: 5px">
          {{ $t('usual.audienceVisible') }}
        </span>
        <div class="audience-visible__swith">
          <el-switch
            @click.native="handleSwitchStatus"
            v-model="switchStatus"
            active-color="#13ce66"
          ></el-switch>
          <!-- 提示 -->
          <div class="audience-tip" v-show="showAudienceTip">
            <div class="audience-tip__arrow"></div>
            <span
              @click="showAudienceTip = false"
              class="close-icon vh-iconfont vh-line-close"
            ></span>
            如果想让观众看到文档/白板内容， 必须开启“观众可见”开关
          </div>
        </div>
      </div>
    </div>
    <!-- 中：画笔相关工具 -->
    <div class="vmp-doc-toolbar__bd">
      <div class="vmp-doc-toolbar__brush" v-show="showBrushToolbar">
        <!-- 选择 -->
        <div
          class="vmp-icon-item"
          :title="$t('usual.choose')"
          :class="{ selected: currentBrush === 'select' }"
          @click="handleBoardTool('select')"
        >
          <i class="vh-saas-iconfont vh-saas-line-choose"></i>
        </div>
        <!-- 画笔 -->
        <div
          class="vmp-icon-item has-corner"
          :title="$t('usual.pen')"
          :class="{ selected: currentBrush === 'pen' }"
          @click="handleBoardTool('pen')"
        >
          <i class="vh-iconfont vh-line-brush"></i>
          <vmp-pen-popup></vmp-pen-popup>
        </div>
        <!-- 荧光笔 -->
        <div
          class="vmp-icon-item has-corner"
          :title="$t('usual.highlighter')"
          :class="{ selected: currentBrush === 'highlighter' }"
          @click="handleBoardTool('highlighter')"
        >
          <i class="vh-iconfont vh-a-line-fluorescentpen"></i>
          <vmp-highlighter-popup></vmp-highlighter-popup>
        </div>
        <!-- 形状 -->
        <div
          class="vmp-icon-item has-corner"
          :title="$t('usual.shape')"
          :class="{ selected: currentBrush === 'shape' }"
          @click="handleBoardTool('shape')"
        >
          <i class="vh-iconfont vh-a-Rectangletool"></i>
          <vmp-shape-popup></vmp-shape-popup>
        </div>
        <!-- 文本 -->
        <div
          class="vmp-icon-item has-corner"
          :title="$t('usual.text')"
          :class="{ selected: currentBrush === 'text' }"
          @click="handleBoardTool('text')"
        >
          <i class="vh-iconfont vh-line-text"></i>
          <vmp-text-popup></vmp-text-popup>
        </div>
        <!-- 橡皮擦 -->
        <div
          class="vmp-icon-item"
          :title="$t('usual.eraser')"
          :class="{ selected: currentBrush === 'eraser' }"
          @click="handleBoardTool('eraser')"
        >
          <i class="vh-iconfont vh-line-eraser"></i>
        </div>
        <!-- 清除 -->
        <div class="vmp-icon-item" :title="$t('usual.clear')" @click="handleBoardTool('clear')">
          <i class="vh-iconfont vh-line-delete"></i>
        </div>

        <!-- 退出全屏 -->
        <div
          class="vmp-icon-item vmp-icon-item--exitFullscreen"
          :title="$t('usual.clear')"
          @click="fullscreen"
        >
          <i class="vh-iconfont vh-a-line-exitfullscreen"></i>
        </div>

        <!-- 这个章节按钮用于观看端文档显示，主持端章节按钮在最右边 -->
        <div
          v-show="currentType !== 'board' && isWatch"
          class="vmp-icon-item"
          :title="$t('usual.docThumb')"
          @click="toggleThumbnail"
        >
          <i class="vh-saas-iconfont vh-saas-a-line-documentthumbnail"></i>
        </div>
      </div>
    </div>
    <!-- 右：全屏、文档章节等信息，观看端不显示这一部分功能-->
    <div class="vmp-doc-toolbar__ft" v-if="!isWatch">
      <div class="vmp-icon-item" :title="$t('doc.doc_1010')" @click="fullscreen">
        <i class="vh-iconfont vh-a-line-fullscreen"></i>
      </div>
      <div
        v-show="currentType !== 'board'"
        class="vmp-icon-item"
        :title="$t('usual.docThumb')"
        @click="toggleThumbnail"
      >
        <i class="vh-saas-iconfont vh-saas-a-line-documentthumbnail"></i>
      </div>
    </div>
  </div>
</template>
<script>
  import VmpPenPopup from './pen-popup.vue';
  import VmpHighlighterPopup from './highlighter-popup.vue';
  import VmpShapePopup from './shape-popup.vue';
  import VmpTextPopup from './text-popup.vue';
  import { useRoomBaseServer, useDocServer, useMsgServer, useGroupServer } from 'middle-domain';
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
        pen: this.pen,
        highlighter: this.highlighter,
        shape: this.shape,
        text: this.text,
        changeTool: this.changeTool
      };
    },
    inject: ['fullscreen', 'toggleThumbnail', 'openDocDlglist'],
    data() {
      return {
        showAudienceTip: true,
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
    watch: {
      ['docServer.state.currentCid'](val) {
        if (val) {
          // 有容器切换，想保存上传的画笔属性，需要重新设置一下
          this.changeTool(this.currentBrush);
        }
      }
    },
    computed: {
      // 是否观看端(send是发起端，其它的都是你观看端)
      isWatch() {
        console.log('this.roomBaseServer.state.clientType:', this.roomBaseServer.state.clientType);
        return this.roomBaseServer.state.clientType !== 'send';
      },
      switchStatus: {
        get() {
          return this.docServer.state.switchStatus;
        },
        set() {}
      },
      currentType() {
        return this.docServer.state.currentCid.split('-')[0];
      },
      // 是否有演示权限
      hasDocPermission() {
        return this.docServer.state.hasDocPermission;
      },
      // 是否显示画笔工具栏
      showBrushToolbar() {
        // 有文档演示权限, 主持端或者 观看端+有文档内容
        return (
          this.hasDocPermission && (!this.isWatch || (this.isWatch && this.currentType.length > 0))
        );
      }
    },
    beforeCreate() {
      this.roomBaseServer = useRoomBaseServer();
      this.docServer = useDocServer();
      this.msgServer = useMsgServer();
      this.groupServer = useGroupServer();
    },
    methods: {
      /**
       *  brush：笔刷,可选 select, pen, highlighter, shape, text, eraser
       */
      changeTool(brush, key, value) {
        if (!this.docServer?.state.currentCid) {
          console.log('容器不存在，不可设置画笔');
          return;
        }

        console.log('changeTool brush:', brush, '; key:', key, '; value:', value);
        this.currentBrush = brush;
        if (!brush) return;
        if (key) {
          this[brush][key] = value;
        }
        // 取消缩放、移动模式
        this.docServer.cancelZoom();
        switch (brush) {
          // 选择
          case 'select': {
            this.docServer.cancelDrawable();
            break;
          }
          // 画笔
          case 'pen': {
            console.log('设置画笔', this.pen);
            this.docServer.setPen();
            this.docServer.setStrokeWidth(this.pen.size);
            this.docServer.setStroke(this.pen.color);
            break;
          }
          // 荧光笔
          case 'highlighter': {
            this.docServer.setHighlighters();
            this.docServer.setStrokeWidth(this.highlighter.size);
            this.docServer.setStroke(this.highlighter.color);
            break;
          }
          case 'shape': {
            this.docServer[this.shape.kind]();
            this.docServer.setStroke(this.shape.color);
            break;
          }
          case 'text': {
            this.docServer.setText();
            this.docServer.setStrokeWidth(this.text.size);
            this.docServer.setStroke(this.text.color);
            break;
          }
          case 'eraser': {
            this.docServer.setEraser();
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
      handleSwitchStatus() {
        this.docServer.toggleSwitchStatus();
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

      span.close-icon {
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
  }
  .vmp-doc-toolbar.is-watch {
    background: transparent;

    .vmp-doc-toolbar__hd {
      position: absolute;
      margin-left: 60px;
      z-index: 1;
    }
    .choose-document {
      width: 90px;
      height: 36px;
      line-height: 36px;
      background: rgba(0, 0, 0, 0.6);
      border-radius: 97px;
      border: 1px solid #666;
      color: #fff;
      font-size: 14px;
    }

    .vmp-doc-toolbar__brush {
      width: 282px;
      height: 36px;
      line-height: 32px;
      background: rgba(0, 0, 0, 0.6);
      border-radius: 20px;
      border: 1px solid #999;
      z-index: 1;
      margin-left: 120px;
    }

    .vmp-icon-item {
      height: 24px;
      width: 26px;
      line-height: 24px;
      margin-left: 6px;

      i {
        font-size: 14px;
        color: #f7f7f7;
        margin-right: 2px;
      }

      .vmp-brush-popup {
        top: 24px;
      }
    }
    .choose-document {
      width: 90px;
      height: 36px;
      line-height: 36px;
      background: rgba(0, 0, 0, 0.6);
      border-radius: 97px;
      border: 1px solid #666;
      color: #fff;
      font-size: 14px;
    }
    .vmp-doc-toolbar__brush {
      width: 282px;
      height: 36px;
      line-height: 32px;
      background: rgba(0, 0, 0, 0.6);
      border-radius: 20px;
      border: 1px solid #999;
    }
    .vmp-icon-item {
      height: 24px;
      width: 26px;
      line-height: 24px;
      margin-left: 6px;

      .vmp-icon-item.has-corner::after {
        right: -2px;
        bottom: -2px;
      }
    }
  }
</style>

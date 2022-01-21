<template>
  <div
    class="vmp-doc-une"
    :class="[{ 'is-watch': isWatch }, `vmp-doc-une--${displayMode}`]"
    ref="docWrapper"
  >
    <!-- 这里配置的是文档工具栏 -->
    <VmpDocToolbar
      v-show="displayMode === 'normal' || displayMode === 'fullscreen'"
    ></VmpDocToolbar>

    <!-- 文档白板内容区 -->
    <div ref="docContent" class="vmp-doc-une__content">
      <div ref="docInner" class="vmp-doc-inner">
        <div style="width: 0; height: 0">
          <!-- display:none|block 会影响父级元素和iframe的通信，会导致通信时长延长5s左右，故采用visible -->
          <div
            v-for="item of docServer.state.containerList"
            :id="item.cid"
            :key="item.cid"
            class="doc-box"
            :style="{ visibility: item.cid == currentCid ? 'visible' : 'hidden' }"
          ></div>
        </div>
      </div>

      <!-- 没有文档时的占位组件 -->
      <div class="vmp-doc-placeholder" v-show="docLoadComplete && !currentCid">
        <div class="vmp-doc-placeholder__inner">
          <i class="iconfont iconzanwuwendang"></i>
          <span>暂未分享任何文档</span>
        </div>
      </div>

      <!-- 文档操作栏: 翻页、放大、缩小、还原、拖拽 -->
      <ul class="vmp-doc-pagebar" @click="handlePage" v-show="showPagebar">
        <li
          v-if="hasPager"
          data-value="prevStep"
          title="上一步"
          class="doc-pagebar__opt iconfont iconzuofanye"
        ></li>
        <li v-if="hasPager" class="page-number">
          <span class="page-index">{{ docServer.state.pageNum }}</span>
          <span class="page-split">/</span>
          <span class="page-total">{{ docServer.state.pageTotal }}</span>
        </li>
        <li
          v-if="hasPager"
          data-value="nextStep"
          title="下一步"
          class="doc-pagebar__opt iconfont iconyoufanye"
        ></li>
        <li data-value="zoomIn" title="放大" class="doc-pagebar__opt iconfont iconfangda"></li>
        <li data-value="zoomOut" title="缩小" class="doc-pagebar__opt iconfont iconsuoxiao"></li>
        <li data-value="zoomReset" title="还原" class="doc-pagebar__opt iconfont iconhuanyuan"></li>
        <li data-value="move" title="移动" class="doc-pagebar__opt iconfont iconyidong"></li>
        <li
          v-if="isWatch && displayMode === 'normal'"
          data-value="fullscreen"
          title="全屏"
          class="doc-pagebar__opt iconfont iconquanping"
        ></li>
        <li
          v-if="isWatch && displayMode === 'fullscreen'"
          data-value="fullscreen"
          title="退出全屏"
          class="doc-pagebar__opt iconfont iconquanpingguanbi"
        ></li>
      </ul>

      <!-- 文档缩略图 -->
      <ul class="vmp-doc-thumbnailbar" @click="handleThumbnail" v-show="thumbnailShow">
        <li
          class="doc-thumbnailbar__opt"
          v-for="(item, index) in docServer.state.thumbnailList"
          :key="'thum' + index"
          :data-value="index"
          :class="{ selected: pageNum - 1 === index }"
        >
          <span class="doc-thumbnailbar-seq">{{ index + 1 }}</span>
          <img :src="item" />
        </li>
      </ul>
    </div>

    <!-- 文档加载时的遮罩和进度 -->
    <div v-show="!docLoadComplete" class="el-loading-mask vmp-doc-mask">
      <div class="el-loading-spinner">
        <svg viewBox="25 25 50 50" class="circular">
          <circle cx="50" cy="50" r="20" fill="none" class="path"></circle>
        </svg>
        <p class="el-loading-text">文档加载中</p>
      </div>
    </div>
  </div>
</template>
<script>
  import VmpDocToolbar from './toolbar/main.vue';
  import screenfull from 'screenfull';
  import { useRoomBaseServer, useDocServer, useMsgServer } from 'middle-domain';
  import elementResizeDetectorMaker from 'element-resize-detector';
  import { throttle, boxEventOpitons } from '@/packages/app-shared/utils/tool';

  export default {
    name: 'VmpDocUne',
    components: { VmpDocToolbar },
    provide() {
      return {
        fullscreen: this.fullscreen,
        displayMode: this.displayMode,
        toggleThumbnail: this.toggleThumbnail,
        openDocDlglist: this.openDocDlglist
      };
    },
    data() {
      return {
        className: '',
        displayMode: 'normal', // normal: 正常; mini: 小屏; fullscreen:全屏
        keepAspectRatio: true,
        hasPager: true, // 是否有分页操作(观看端没有)
        thumbnailShow: false // 文档缩略是否显示
      };
    },
    computed: {
      docLoadComplete() {
        return this.docServer.state.docLoadComplete;
      },
      currentCid() {
        return this.docServer.state.currentCid;
      },
      pageNum() {
        return this.docServer.state.pageNum;
      },
      // 显示文档时 && (普通模式，或 观看端全屏模式下);
      showPagebar() {
        return (
          this.docServer.state.currentCid.split('-')[0] === 'document' &&
          (this.displayMode === 'normal' || (this.displayMode === 'fullscreen' && this.isWatch))
        );
      },
      // 是否观看端
      isWatch() {
        return this.roomBaseServer.state.clientType !== 'send';
      },
      // 文档是否可见
      show() {
        // 主持端始终可见，观看端
        return (
          this.roomBaseServer.state.clientType === 'send' ||
          (this.roomBaseServer.state.clientType !== 'send' && this.docServer.state.switchStatus)
        );
      }

      // switchStatus=false && clientType=''
    },
    beforeCreate() {
      this.roomBaseServer = useRoomBaseServer();
      this.docServer = useDocServer();
      this.msgServer = useMsgServer();
      // TODO 方便查数据
      window.docServer = useDocServer();
    },
    methods: {
      /**
       * 全屏
       */
      fullscreen() {
        screenfull.toggle(this.$refs.docWrapper);
      },
      /**
       * 缩略图列表展开与这都
       */
      toggleThumbnail() {
        this.thumbnailShow = !this.thumbnailShow;
      },
      setDisplayMode(mode) {
        if (!['normal', 'mini', 'fullscreen'].includes(mode)) {
          console.error('展示模式必须是normal, mini, fullscreen中的一个');
          return;
        }
        this.displayMode = mode;
        if (this.displayMode === 'mini') {
          this.thumbnailShow = false;
        }
        this.resize();
      },
      /**
       * 屏幕缩放
       */
      resize() {
        let rect;
        if (this.isWatch) {
          if (this.displayMode === 'mini') {
            rect = {
              width: 360,
              height: 204
            };
          } else {
            rect = this.$refs.docWrapper?.getBoundingClientRect();
          }
        } else {
          rect = screenfull.isFullscreen
            ? this.$refs.docWrapper?.getBoundingClientRect()
            : this.$refs.docContent?.getBoundingClientRect();
        }
        if (!rect) return;
        let { width, height } = rect;
        if (!width || !height) return;

        let w = null,
          h = null;
        if (this.keepAspectRatio) {
          if (width / height > 16 / 9) {
            h = height;
            w = (h / 9) * 16;
          } else {
            w = width;
            h = (w / 16) * 9;
          }
        } else {
          w = width;
          h = height;
        }
        this.docViewRect = { width: w, height: h };
        console.log('[doc] this.docViewRect:', this.docViewRect);
        if (this.docServer.state.currentCid) {
          this.docServer.setSize(w, h);
        }
      },
      /**
       * 初始化各种事件
       */
      initEvents() {
        // 监控文档区域大小改变事件
        let erd = elementResizeDetectorMaker();
        erd.listenTo(this.$refs.docWrapper, throttle(this.resize, 200));

        // 全屏/退出全屏事件
        screenfull.onchange(() => {
          console.log('screenfull.isFullscreen:', screenfull.isFullscreen);
          if (screenfull.isFullscreen) {
            this.displayMode = 'fullscreen';
          } else {
            this.displayMode = 'normal';
          }
        });

        //
        this.docServer.on(VHDocSDK.Event.SELECT_CONTAINER, async data => {
          // if (this.currentCid == data.id || (this.roleName != 1 && this.liveStatus != 1)) {
          //   return;
          // }
          console.log('[doc] ===========选择容器======', data);
          // this.docInfo.docShowType = data.id.split('-')[0];
          this.docServer.state.currentCid = data.id;
          // 判断容器是否存在
          const currentItem = this.docServer.state.containerList.find(item => item.cid === data.id);
          if (currentItem) {
            this.docServer.activeContainer(data.id);
          } else {
            const { id: cid, docId } = data;
            console.log('[doc] cid:', cid);
            this.addNewFile({ fileType: cid.split('-')[0], docId, cid });
          }
        });

        this.msgServer.$on('DOC_MSG', msg => {
          console.log('------DOC_MSG-----文档消息：', msg);
        });

        //
        this.docServer.on(VHDocSDK.Event.SELECT_CONTAINER, async data => {
          // if (this.currentCid == data.id || (this.roleName != 1 && this.liveStatus != 1)) {
          //   return;
          // }
          console.log('[doc] ===========选择容器======', data);
          // this.docInfo.docShowType = data.id.split('-')[0];
          this.docServer.state.currentCid = data.id;
          // 判断容器是否存在
          const currentItem = this.docServer.state.containerList.find(item => item.cid === data.id);
          if (currentItem) {
            this.docServer.activeContainer(data.id);
          } else {
            const { id: cid, docId } = data;
            console.log('[doc] cid:', cid);
            this.addNewFile({ fileType: cid.split('-')[0], docId, cid });
          }
        });

        this.msgServer.$on('DOC_MSG', msg => {
          console.log('------DOC_MSG-----文档消息：', msg);
        });
      },
      /**
       * 新增文档或白板
       * @param {*} fileType
       * @param {*} docId
       * @param {*} docType
       */
      async addNewFile({ fileType, docId, docType, cid }) {
        const { width, height } = this.docViewRect;
        console.log(
          '[doc] addNewFile:',
          JSON.stringify({
            width,
            height,
            fileType,
            cid,
            docId,
            docType
          })
        );
        await this.docServer.addNewDocumentOrBorad({
          width,
          height,
          fileType,
          cid,
          docId,
          docType,
          bindCidFun: async cid => {
            console.log('[doc] bindCidFun:', cid);
            await this.$nextTick();
          }
        });
        this.resize();
      },
      /**
       *  刷新或者退出重进恢复上次的文档
       */
      recoverLastDocs: async function () {
        console.log('[doc] 刷新或者退出重进恢复上次的文档');
        if (!this.docViewRect) return;
        const { width, height } = this.docViewRect;
        await this.docServer.recover({
          width,
          height,
          bindCidFun: async () => {
            await this.$nextTick();
          }
        });
        // 调整大小
        this.resize();

        const fileType = this.docServer.state.currentCid.split('-')[0] || 'document';
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitSwitchTo', [fileType]));
      },
      /**
       * 切换到 文档还是白板
       * @param fileType:文档：document， 白板：board
       */
      async switchTo(fileType) {
        console.log('[doc] doc-une 切换到。。。:', fileType);
        // 缩略图栏隐藏
        this.thumbnailShow = false;
        if (fileType === 'document') {
          // 切换到文档
          if (this.docServer.state.docCid) {
            await this.docServer.activeContainer(this.docServer.state.docCid);
            this.resize();
          } else {
            this.docServer.state.currentCid = '';
          }
        } else if (fileType === 'board') {
          // 切换到白板
          if (this.docServer.state.boardCid) {
            await this.docServer.activeContainer(this.docServer.state.boardCid);
            this.resize();
          } else {
            // 白板不存在自动新建一个
            this.addNewFile({ fileType: 'board' });
          }
        }
      },
      /**
       * 打开选择文档列表
       */
      openDocDlglist() {
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitOpenDocList'));
      },
      /**
       * 演示文档
       * @param docId 文档id
       * @param docType 演示类型：1：静态文档（jpg） 2：动态文档(PPT)
       * @param switchStatus 观众可见：true/false
       */
      async demonstrate(docId, docType, switchStatus) {
        console.log(
          '[doc] 演示文档:docId=',
          docId,
          ';docType=',
          docType,
          '; switchStatu:',
          switchStatus
        );
        for (const item of this.docServer.state.containerList) {
          if (String.prototype.startsWith.call(item.cid, 'document')) {
            // 文档容器删除
            await this.docServer.destroyContainer(item.cid);
          }
        }
        let boardItem;
        if (this.docServer.state.boardCid) {
          boardItem = this.docServer.state.containerList.find(item => {
            return item.cid === this.docServer.state.boardCid;
          });
        }
        this.docServer.state.containerList = boardItem ? [boardItem] : [];
        await this.addNewFile({ fileType: 'document', docId, docType });
        this.docServer.setSwitchStatus(switchStatus);
      },
      /**
       * 页面操作工具
       * @param {*} e
       */
      handlePage(e) {
        if (!this.docServer.state.currentCid || this.docServer.state.currentCid === 'board') {
          return;
        }
        if (e.target.nodeName === 'UL') return;
        const type =
          e.target.dataset.value ||
          e.target.parentNode.dataset.value ||
          e.target.parentNode.parentNode.dataset.value ||
          null;
        if (!type) return;
        if (!this.docServer.state.allComplete) {
          return this.$message.warning('请文档加载完成以后再操作');
        }
        switch (type) {
          case 'prevStep':
            if (this.docServer.state.pageNum > 1) {
              this.docServer.prevStep();
            }
            break;
          case 'nextStep':
            if (this.docServer.state.pageNum < this.docServer.state.pageTotal) {
              this.docServer.nextStep();
            }
            break;
          // 放大
          case 'zoomIn':
            this.docServer.zoomIn();
            break;
          // 缩小
          case 'zoomOut':
            this.docServer.zoomOut();
            break;
          // 还原
          case 'zoomReset':
            this.docServer.zoomReset();
            break;
          // 移动
          case 'move':
            this.docServer.move();
            break;
          // 全屏
          case 'fullscreen':
            this.fullscreen();
            break;
        }
      },

      /**
       * 缩略图点击
       */
      handleThumbnail(e) {
        if (!this.docServer.state.currentCid) {
          return;
        }
        if (this.docServer.state.currentCid === this.docServer.state.docCid) {
          if (e.target.nodeName === 'UL') return;
          const index =
            e.target.dataset.value ||
            e.target.parentNode.dataset.value ||
            e.target.parentNode.parentNode.dataset.value ||
            null;
          if (!index) return;
          const page = Number(index);
          this.docServer.gotoPage({ id: this.docServer.currentCid, page });
        }
      }
    },
    mounted() {
      // 初始化事件
      this.initEvents();

      console.log('----this.$refs.docWrapper---', this.$refs.docWrapper);
      // 初始化 this.docViewRect
      this.resize();

      // 清空
      // this.docServer.resetContainer();
      // 恢复上一次的文档数据;
      this.recoverLastDocs();
    }
  };
</script>
<style lang="less">
  .vmp-doc-une {
    width: 100%;
    height: 100%;
    min-height: 204px;
    display: flex;
    flex-direction: column;
    color: #fff;

    .vmp-doc-mask {
      background: rgba(0, 0, 0, 0.3);
      z-index: 100;
    }

    .vmp-doc-une__hd {
      width: 100%;
      box-sizing: border-box;
    }
    .vmp-doc-une__content {
      flex: 1;
      position: relative;
    }
    .vmp-doc-placeholder {
      // display: none;
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      overflow: hidden;

      .vmp-doc-placeholder__inner {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #2d2d2d;
        flex-direction: column;
        i {
          font-size: 137px;
          color: #7c7c7c;
        }
        span {
          color: #999999;
          line-height: 22px;
        }
      }
    }
    .vmp-doc-inner {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      overflow: hidden;

      .doc-box {
        top: 50%;
        left: 50%;
        position: absolute;
        transform: translate(-50%, -50%);
        overflow: visible !important;
      }
    }
    .vmp-doc-pagebar {
      user-select: none;
      position: absolute;
      left: 50%;
      transform: translate3d(-50%, 0, 0);
      bottom: 20px;
      padding: 3px 16px;
      background: rgba(0, 0, 0, 0.8);
      border-radius: 30px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #f7f7f7;
      line-height: 1;
      font-size: 14px;
      .iconfont {
        cursor: pointer;

        &:hover {
          color: #fc5659;
        }
      }
      .doc-pagebar__opt {
        padding: 7px 10px;
      }
    }
  }
  .vmp-doc-thumbnailbar {
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    width: 144px;
    background-color: #000;
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow-y: scroll;

    li.doc-thumbnailbar__opt {
      height: 63px;
      width: 110px;
      margin-top: 15px;
      position: relative;

      &.selected {
        box-shadow: 0 0 0 2px #f57274;
      }

      img {
        width: 100%;
        height: 100%;
      }
    }
    li.doc-thumbnailbar__opt:not(.selected) {
      &:hover {
        box-shadow: 0 0 0 2px #f3686b;
      }
    }
    li:last-child {
      margin-bottom: 20px;
    }
    .doc-thumbnailbar-seq {
      display: block;
      min-width: 20px;
      height: 14px;
      background: #000;
      opacity: 0.7;
      color: #fff;
      font-size: 12px;
      line-height: 14px;
      text-align: center;
      position: absolute;
      left: 0;
      bottom: 0;
    }
  }

  .vmp-doc-une.vmp-doc-une--mini {
    position: absolute !important;
    width: 309px;
    height: 240px;
    top: 0;
    right: 0;
    z-index: 10;
  }

  // 文档全屏时
  .vmp-doc-une.vmp-doc-une--fullscreen {
    .vmp-doc-toolbar {
      background: transparent;
      border-color: transparent;
    }
    .vmp-doc-toolbar__hd,
    .vmp-doc-toolbar__ft {
      display: none;
    }
    .vmp-doc-toolbar__brush {
      background: #1a1a1a;
      padding: 2px 10px;
      border-radius: 100px;
    }
    .vmp-icon-item--exitFullscreen {
      display: block;
    }
  }

  // 作为观看端时的样式
  .vmp-doc-une.is-watch {
    // 普通模式
    &.vmp-doc-une--normal {
      position: absolute;
      top: 0;
      bottom: 56px;
      width: calc(100% - 380px);
      height: auto;
      min-height: auto;
    }

    //mini模式
    &.vmp-doc-une--mini {
      position: absolute;
      width: 360px;
      height: 204px;
      min-height: 204px;
      top: 0;
      right: 0;
      z-index: 10;
    }

    // 全屏模式
    &.vmp-doc-une--fullscreen {
    }

    .vmp-doc-toolbar {
      position: absolute;
      border: 0;
      top: 20px;
    }
    .vmp-doc-pagebar {
      display: none;
    }
    &:hover {
      .vmp-doc-pagebar {
        display: flex;
      }
    }
  }
</style>

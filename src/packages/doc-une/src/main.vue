<template>
  <div
    class="vmp-doc-une"
    :class="[className, { 'vmp-doc-une--fullscreen': isFullscreen }]"
    ref="docWrapper"
  >
    <!-- 这里配置的是文档工具栏 -->
    <div class="vmp-doc-une__hd" v-if="hasToolbar">
      <VmpDocToolbar></VmpDocToolbar>
    </div>

    <!-- 文档白板内容区 -->
    <div ref="docContent" class="vmp-doc-une__content">
      <div ref="docInner" class="vmp-doc-inner">
        <div style="width: 0; height: 0">
          <!-- display:none|block 会影响父级元素和iframe的通信，会导致通信时长延长5s左右，故采用visible -->
          <div
            v-for="item of docServer.state.fileOrBoardList"
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
  import { useRoomBaseServer, useDocServer } from 'middle-domain';
  import elementResizeDetectorMaker from 'element-resize-detector';
  import { throttle, boxEventOpitons } from '@/packages/app-shared/utils/tool';

  export default {
    name: 'VmpDocUne',
    components: { VmpDocToolbar },
    provide() {
      return {
        fullscreen: this.fullscreen,
        toggleThumbnail: this.toggleThumbnail,
        openDocDlglist: this.openDocDlglist
      };
    },
    data() {
      return {
        className: '',
        keepAspectRatio: true,
        hasToolbar: true, // 是否有工具栏(观看端没有)
        hasPager: true, // 是否有分页操作(观看端没有)
        isFullscreen: false, //是否全屏
        thumbnailShow: false // 文档缩略是否显示
      };
    },
    computed: {
      docLoadComplete() {
        return this.docServer.state.docLoadComplete;
      },
      currentType() {
        return this.docServer.state.currentType;
      },
      currentCid() {
        return this.docServer.state.currentCid;
      },
      pageNum() {
        return this.docServer.state.pageNum;
      },
      showPagebar() {
        return this.docServer.state.currentType === 'document' && !this.isFullscreen;
      }
    },
    beforeCreate() {
      this.roomBaseServer = useRoomBaseServer();
      this.docServer = useDocServer();
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
      /**
       * 屏幕缩放
       */
      resize() {
        let { width, height } = screenfull.isFullscreen
          ? this.$refs.docWrapper?.getBoundingClientRect()
          : this.$refs.docContent?.getBoundingClientRect();
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
          this.isFullscreen = screenfull.isFullscreen;
        });
      },
      /**
       * 新增文档或白板
       * @param {*} fileType
       * @param {*} docId
       * @param {*} docType
       */
      async addNewFile(fileType, docId, docType) {
        const { width, height } = this.docViewRect;
        await this.docServer.addNewDocumentOrBorad({
          width,
          height,
          fileType,
          docId,
          docType,
          bindCidFun: async cid => {
            console.log('addNewDocumentOrBorad:', cid);
            await this.$nextTick();
          }
        });
        this.resize();
      },
      /**
       *  刷新或者退出重进恢复上次的文档
       */
      recoverLastDocs: async function () {
        console.log('刷新或者退出重进恢复上次的文档');
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

        window.$middleEventSdk?.event?.send(
          boxEventOpitons(this.cuid, 'emitSwitchTo', [this.docServer.state.currentType])
        );
      },
      /**
       * 切换到 文档还是白板
       * @param type:文档：document， 白板：board
       */
      async switchTo(type) {
        console.log('doc-une 切换到。。。:', type);

        // 缩略图栏隐藏
        this.thumbnailShow = false;
        this.docServer.state.currentType = type;
        const is_board = type === 'board' ? 2 : 1;

        // 查找当前列表是否存在文档或白板
        const item = this.docServer.state.fileOrBoardList.find(item => {
          return Number(item.is_board) === is_board;
        });
        if (item) {
          // 如果存在，设置为当文档或白板
          this.docServer.state.currentCid = item.cid;
          await this.docServer.selectContainer(item.cid);
          this.resize();
          return;
        }

        // 如果不存在
        if (type === 'document') {
          this.docServer.state.currentCid = '';
        } else if (type === 'board') {
          // 白板不存在自动新建一个
          this.addNewFile('board');
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
        console.log('演示文档:docId=', docId, ';docType=', docType, '; switchStatu:', switchStatus);
        const doc = this.docServer.state.fileOrBoardList.find(item => {
          return item.docId === docId && item.doc_type === docType;
        });
        if (doc) {
          console.log('--文档已经存在,直接应用:', doc);
          this.docServer.state.currentCid = doc.cid;
          this.docServer.state.currentType = 'document';
          this.docServer.state.pageNum = Number(doc.slideIndex) + 1;
          this.docServer.state.pageTotal = doc.slidesTotal;
          await this.docServer.selectContainer(doc.cid);
          this.docServer.getCurrentThumbnailList();
        } else {
          // 否则新建
          console.log('--文档不存在,新建文档');
          await this.addNewFile('document', docId, docType);
          this.docServer.setSwitchStatus(switchStatus);
        }
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
        }
      },

      /**
       * 缩略图点击
       */
      handleThumbnail(e) {
        if (!this.docServer.state.currentCid || this.docServer.state.currentType === 'board') {
          return;
        }
        if (e.target.nodeName === 'UL') return;
        const index =
          e.target.dataset.value ||
          e.target.parentNode.dataset.value ||
          e.target.parentNode.parentNode.dataset.value ||
          null;
        if (!index) return;
        const page = Number(index) + 1;
        this.docServer.gotoPage({ id: this.docServer.currentCid, page });
      }
    },
    mounted() {
      // 初始化事件
      this.initEvents();

      // 初始化 this.docViewRect
      this.resize();

      // TODO 测试设置文档工具栏是否可见
      this.hasToolbar = this.roomBaseServer.state.configList.hasToolbar;

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
    min-height: 360px;
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

  // 文档全屏时
  .vmp-doc-une.vmp-doc-une--fullscreen {
    .vmp-doc-une__hd {
      position: absolute;
      width: auto;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      z-index: 102;
    }
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
</style>

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
      <div class="vmp-doc-inner">
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
      <div class="vmp-doc-placeholder" v-show="!currentCid">
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
          :class="{ selected: slideIndex === index }"
        >
          <span class="doc-thumbnailbar-seq">{{ index + 1 }}</span>
          <img :src="item" />
        </li>
      </ul>
    </div>
  </div>
</template>
<script>
  import VmpDocToolbar from './toolbar/main.vue';
  import screenfull from 'screenfull';
  import { useRoomBaseServer, useDocServer } from 'middle-domain';

  export default {
    name: 'VmpDocUne',
    components: { VmpDocToolbar },
    provide() {
      return {
        getKind: function () {
          return this.$domainStore.state.docServer.currentType;
        },
        fullscreen: this.fullscreen,
        openDocDlglist: this.openDocDlglist
      };
    },
    data() {
      return {
        className: '',
        keepAspectRatio: true,
        hasToolbar: true, // 是否有工具栏(观看端没有)
        hasPager: false, // 是否有分页操作(观看端没有)
        isFullscreen: false, //是否全屏
        thumbnailShow: false // 文档缩略是否显示
      };
    },
    computed: {
      currentType() {
        return this.docServer.state.currentType;
      },
      currentCid() {
        return this.docServer.state.currentCid;
      },
      showPagebar() {
        return this.docServer.state.currentType === 'document' && !this.isFullscreen;
      }
    },
    beforeCreate() {
      this.roomBaseServer = useRoomBaseServer();
      this.docServer = useDocServer();
      window.docServer = useDocServer();
    },
    created() {
      this.initEvents();
    },
    methods: {
      // 初始化配置
      initConfig() {
        this._initWidgetOptions();
      },
      /**
       * 全屏
       */
      fullscreen() {
        screenfull.toggle(this.$refs.docWrapper);
      },
      /**
       * 屏幕缩放
       */
      resize() {
        let { width, height } = screenfull.isFullscreen
          ? this.$refs.docWrapper.getBoundingClientRect()
          : this.$refs.docContent.getBoundingClientRect();

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
          if (w === 0 || h === 0) {
            w = 898;
            h = 506;
            // w = this.$store.state.smChange ? 300 : 898;
            // h = this.$store.state.smChange ? 170 : 506;
          }
        } else {
          w = width;
          h = height;
        }
        this.docViewRect = { width: w, height: h };
        // this.$refs.docContent.style.height = `${h}px`;
        // this.$refs.docContent.style.width = `${w}px`;
        if (this.docServer.state.currentCid) this.docServer.setSize(w, h);
      },

      /**
       * 缩略图切换
       */
      onThumbnailToggle() {
        this.thumbnailShow = !this.thumbnailShow;
      },
      /**
       * 初始化各种事件
       */
      initEvents() {
        // TODO 节流
        window.addEventListener('resize', this.resize);

        // 全屏/退出全屏事件
        screenfull.onchange(() => {
          console.log('screenfull.isFullscreen:', screenfull.isFullscreen);
          this.isFullscreen = screenfull.isFullscreen;
        });
      },
      async addNewFile(fileType, docId, docType) {
        const { width, height } = this.docViewRect;
        const options = this.docServer.prepareDocumentOrBorad(
          width,
          height,
          fileType,
          docId,
          docType
        );
        // await this.$forceUpdate();
        await this.$nextTick();
        await this.docServer.addNewDocumentOrBorad(options);
      },
      /**
       *  刷新或者退出重进恢复上次的文档
       */
      recoverLastDocs: async function () {
        console.log('刷新或者退出重进恢复上次的文档');

        // 获取远端所有所有容器列表
        await this.docServer.getAllContainerInfo();

        // 执行nextTick让div的id绑定完成
        await this.$nextTick();

        console.log('ssss:', document.getElementById('board-5f9480c'));
        // 加载文档和白板数据
        const { width, height } = this.docViewRect;
        await this.docServer.loadDocumentOrBoradData(width, height);

        this.resize();
        // window.$middleEventSdk?.event?.send({
        //   cuid: this.cuid,
        //   method: 'emitSwitchTo',
        //   params: [this.docServer.state.currentType]
        // });
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
          await this.docServer.selectContainer(item.cid);
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
        window.$middleEventSdk?.event?.send({
          cuid: this.cuid,
          method: 'emitOpenDocList'
        });
      },
      /**
       * 演示文档
       * @param docId 文档id
       * @param docType 演示类型：1：静态文档（jpg） 2：动态文档(PPT)
       * @param switchStatus 观众可见：true/false
       */
      async demonstrate(docId, docType, switchStatus) {
        console.log('演示文档:docId=', docId, ';docType=', docType, '; switchStatu:', switchStatus);
        // 保留一个白板，其它删除
        const board = this.docServer.state.fileOrBoardList.find(item => {
          return item.is_board === 2;
        });
        for (let item of this.docServer.state.fileOrBoardList) {
          if (!(board && item.id === board.id)) {
            this.docServer.destroyContainer({ id: item.cid });
          }
        }
        this.docServer.state.fileOrBoardList = board ? [board] : [];
        await this.addNewFile('document', docId, docType);
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
        this.slideIndex = page - 1;
      }
    },
    mounted() {
      this.initConfig();

      this.resize();
      // TODO 测试设置文档工具栏是否可见
      this.hasToolbar = this.roomBaseServer.state.configList.hasToolbar;

      // 清空
      // this.docServer.resetContainer();
      // 恢复上一次的文档数据;
      this.recoverLastDocs();
    },
    beforeDestroy() {
      window.removeEventListener('resize', this.resize);
    }
  };
</script>
<style lang="less">
  .vmp-doc-une {
    display: flex;
    flex-direction: column;
    color: #fff;
    flex: 1;
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

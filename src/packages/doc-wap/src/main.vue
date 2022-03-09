<template>
  <div
    id="docWrapper"
    class="vmp-doc-wap"
    :class="[`vmp-doc-wap--${displayMode}`]"
    :style="{ height: docViewRect.height > 0 ? docViewRect.height + 'px' : '100%' }"
    v-show="switchStatus"
    ref="docWrapper"
  >
    <!-- 文档白板内容区 -->
    <div ref="docContent" class="vmp-doc-une__content">
      <div ref="docInner" class="vmp-doc-inner">
        <div>
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
          <img src="./img/doc_null.png" style="width: 100px; margin-bottom: 20px" />
          <span>主讲人未添加文档，请稍等...</span>
        </div>
      </div>

      <!--上一页按钮 -->
      <div
        v-show="hasPager && pageNum > 1"
        @click="handlePage('prev')"
        class="btn-pager btn-pager--prev"
      >
        <i class="vh-iconfont vh-line-arrow-left"></i>
      </div>

      <!-- 下一页按钮 -->
      <div
        v-show="hasPager && pageNum < pageTotal"
        @click="handlePage('next')"
        class="btn-pager btn-pager--next"
      >
        <i class="vh-iconfont vh-line-arrow-right"></i>
      </div>
    </div>

    <!-- 全屏切换 -->
    <div @click="fullscreen" class="btn-doc-fullscreen">
      <i v-if="displayMode === 'fullscreen'" class="vh-iconfont vh-line-narrow"></i>
      <i v-else class="vh-iconfont vh-line-amplification"></i>
    </div>
    <!-- 文档拖动后还原 -->
    <div @click="restore" class="btn-doc-restore">
      <i class="vh-saas-iconfont vh-saas-a-line-Documenttonarrow"></i>
    </div>
  </div>
</template>
<script>
  import screenfull from 'screenfull';
  import { useRoomBaseServer, useDocServer, useMsgServer, useGroupServer } from 'middle-domain';
  import { boxEventOpitons } from '@/packages/app-shared/utils/tool.js';

  export default {
    name: 'VmpDocWap',

    data() {
      return {
        className: '',
        displayMode: 'normal', // normal: 正常; fullscreen:全屏
        keepAspectRatio: true,
        docViewRect: {
          width: 0,
          height: 0
        }
      };
    },
    computed: {
      docLoadComplete() {
        return this.docServer.state.docLoadComplete;
      },
      currentCid() {
        return this.docServer.state.currentCid;
      },
      switchStatus() {
        return this.docServer.state.switchStatus;
      },
      pageNum() {
        return this.docServer.state.pageNum;
      },
      pageTotal() {
        return this.docServer.state.pageTotal;
      },
      // 是否有翻页按钮
      hasPager() {
        return !!this.roomBaseServer.state.interactToolStatus.is_adi_watch_doc;
      }
    },
    watch: {
      ['docServer.state.isChannelChanged'](newval) {
        console.log('-[doc]---watch频道变更', newval);
        if (newval) {
          if (this.roomBaseServer.state.watchInitData.webinar.type == 1) {
            this.docServer.state.isChannelChanged = false;
            // 初始化事件
            this.initEvents();
            // 清空
            // this.docServer.resetContainer();
            // 恢复上一次的文档数据;
            this.recoverLastDocs();
          }
        }
      }
    },
    beforeCreate() {
      this.roomBaseServer = useRoomBaseServer();
      this.docServer = useDocServer();
      this.msgServer = useMsgServer();
      this.groupServer = useGroupServer();
    },
    created() {
      // 初始化事件
      this.initEvents();
    },
    mounted() {
      // 清空
      // this.docServer.resetContainer();
      if (this.roomBaseServer.state.watchInitData.webinar.type == 1) {
        // 恢复上一次的文档数据;
        this.recoverLastDocs();
      }
    },
    methods: {
      /**
       * 全屏
       */
      fullscreen() {
        screenfull.toggle(this.$refs.docWrapper);
      },
      async setDisplayMode(mode) {
        console.log('[doc] setDisplayMode:', mode);
        if (!['normal', 'fullscreen'].includes(mode)) {
          console.error('展示模式必须是normal,  fullscreen中的一个');
          return;
        }
        if (this.displayMode === mode) {
          console.log('当前已经是该模式，无需设置');
          return;
        }

        if (this.displayMode === 'fullscreen') {
          // 全屏模式转其它模式
          this.fullscreen();
          screenfull.targetMode = mode;
        } else if (mode === 'fullscreen') {
          // 其它模式转全屏模式
          this.fullscreen();
        }
        await this.$nextTick();
        // 文档大小的改变，会自动触发 erd.listenTo 事件;
      },
      // 文档移动后还原
      restore() {
        this.docServer.zoomReset();
      },
      initEvents() {
        // 文档是否可见状态变化事件
        this.docServer.$on('dispatch_doc_switch_change', val => {
          if (val) {
            this.recoverLastDocs();
          }
        });

        // 回放文档加载事件
        this.docServer.$on('dispatch_doc_vod_cuepoint_load_complate', async () => {
          if (this.docServer.state.containerList.length === 0) {
            const data = this.docServer.getVodAllCids();
            this.docServer.state.containerList = data.map(item => {
              return {
                cid: item.cid
              };
            });
            console.log('[doc] containerList:', this.docServer.state.containerList);
            this.docServer.state.switchStatus = this.docServer.state.containerList.length > 0;
            await this.$nextTick();
            if (this.docServer.state.switchStatus) {
              // emitShowMenuTab
              this.resize();
              // console.log('[doc] vod recoverLastDocs docViewRect:', this.docViewRect);
              const { width, height } = this.docViewRect;
              if (!width || !height) return;
              for (const item of data) {
                this.docServer.initContainer({
                  cid: item.cid,
                  width,
                  height,
                  fileType: item.type.toLowerCase()
                });
              }
              window.$middleEventSdk?.event?.send(
                boxEventOpitons(this.cuid, 'emitShowMenuTab', {
                  visible: true,
                  type: 2
                })
              );
            } else {
              window.$middleEventSdk?.event?.send(
                boxEventOpitons(this.cuid, 'emitShowMenuTab', {
                  visible: false,
                  type: 2
                })
              );
            }
          }
        });

        // 全屏/退出全屏事件
        screenfull.onchange(ev => {
          // console.log('screenfull.isFullscreen:', screenfull.isFullscreen);
          if (ev.target.id !== 'docWrapper') return;
          if (screenfull.isFullscreen) {
            this.displayMode = 'fullscreen';
          } else {
            this.displayMode = screenfull.targetMode || 'normal';
          }
        });

        this.docServer.on(VHDocSDK.Event.SELECT_CONTAINER, async data => {
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
      },

      /**
       * 屏幕缩放
       */
      resize() {
        let rect = this.$refs.docWrapper?.getBoundingClientRect();
        if (rect.width === 0) {
          const parentNode = this.$refs.docWrapper.parentNode;
          const cWidth = parseFloat(window.getComputedStyle(parentNode).width);
          rect = {
            width: cWidth,
            height: (cWidth / 16) * 9
          };
        }
        if (!rect) return;
        let { width, height } = rect;

        if (!width || !height) return;
        let w = width;
        let h = (w / 16) * 9;
        this.docViewRect = { width: w, height: h };
        console.log('[doc] this.docViewRect:', this.docViewRect);
        if (
          this.docServer.state.currentCid &&
          document.getElementById(this.docServer.state.currentCid)
        ) {
          this.docServer.setSize(w, h);
        }
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
        try {
          // 获取容器列表
          await this.docServer.getContainerList();
        } catch (ex) {
          console.error('获取容器列表数据失败：', ex);
          this.docServer.setDocLoadComplete();
        }
        // console.log('[doc] recoverLastDocs containerList:', this.docServer.state.containerList);
        if (this.docServer.state.containerList.length === 0) {
          // 没有文档
          this.docServer.setDocLoadComplete();
          return;
        }
        // 确定文档最外层节点显示，并且文档dom绑定ID成功
        await this.$nextTick();

        // 初始化文档最外层节点大小
        this.resize();

        const { width, height } = this.docViewRect;
        await this.docServer.recover({
          width,
          height,
          bindCidFun: async cid => {
            await this.$nextTick();
          }
        });
      },

      // 翻页
      handlePage(type) {
        if (!this.docServer.state.currentCid || this.docServer.state.currentCid === 'board') {
          return;
        }
        if (type === 'prev') {
          if (this.docServer.state.pageNum > 1) {
            this.docServer.prevStep();
          }
        } else if (type === 'next') {
          if (this.docServer.state.pageNum < this.docServer.state.pageTotal) {
            this.docServer.nextStep();
          }
        }
      }
    }
  };
</script>
<style lang="less">
  .vmp-doc-wap {
    width: 100%;
    height: 100%;
    min-height: 400px;
    display: flex;
    flex-direction: column;
    background-color: #f2f2f2;
    color: #fff;

    .vmp-doc-une__content {
      flex: 1;
      position: relative;

      .vmp-doc-inner {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        overflow: hidden;

        .doc-box {
          top: 0;
          left: 50%;
          position: absolute;
          transform: translateX(-50%);
          overflow: visible !important;
        }
      }
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
        // background: #2d2d2d;
        flex-direction: column;
        padding-top: 2.13rem;
        i {
          color: #7c7c7c;
          font-size: 2rem;
          margin-bottom: 0.4rem;
        }
        span {
          color: #6f6f6f;
          font-size: 100%;
          font-weight: normal;
        }
      }
    }

    .btn-doc-fullscreen {
      position: absolute;
      cursor: pointer;
      top: 0.4rem;
      left: 0.4rem;
      width: 0.8rem;
      height: 0.8rem;
      border-radius: 50%;
      background-color: rgba(0, 0, 0, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9;
    }

    .btn-doc-restore {
      position: absolute;
      cursor: pointer;
      top: 0.4rem;
      left: 1.4rem;
      width: 0.8rem;
      height: 0.8rem;
      border-radius: 50%;
      background-color: rgba(0, 0, 0, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9;
    }

    .btn-pager {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      background-color: #000;
      width: 64px;
      height: 64px;
      border-radius: 100px;
      display: flex;
      justify-content: center;
      align-items: center;

      &--prev {
        left: 0;
      }
      &--next {
        right: 0;
      }
    }

    // 全屏模式下
    &.vmp-doc-wap--fullscreen {
      background-color: rgba(0, 0, 0, 0.9);

      z-index: 1000000;
      .vmp-doc-une__content {
        .vmp-doc-inner {
          .doc-box {
            top: 50%;
            left: 50%;
            position: absolute;
            transform: translate(-50%, -50%);
            overflow: visible !important;
          }
        }
      }
    }
  }
</style>

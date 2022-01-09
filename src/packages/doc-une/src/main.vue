<template>
  <div class="vmp-doc-une" :class="{ 'vmp-doc-une--fullscreen': isFullscreen }" ref="docWrapper">
    <!-- 这里配置的是文档工具栏 -->
    <div class="vmp-doc-une__hd">
      <vmp-air-container :cuid="cuid"></vmp-air-container>
    </div>

    <!-- 文档白板内容区 -->
    <div ref="docContent" class="vmp-doc-une__content">
      <div class="vmp-doc-inner">
        <div style="width: 0; height: 0">
          <!-- display:none|block 会影响父级元素和iframe的通信，会导致通信时长延长5s左右，故采用visible -->
          <div
            v-for="item of fileOrboardList"
            :id="item.cid"
            :key="item.cid"
            class="doc-box"
            :style="{ visibility: item.cid == selectDoc.cid ? 'visible' : 'hidden' }"
          ></div>
        </div>
      </div>

      <!-- 没有文档时的占位组件 -->
      <div class="vmp-doc-placeholder" v-show="!selectDoc.cid">
        <div class="vmp-doc-placeholder__inner">
          <i class="iconfont iconzanwuwendang"></i>
          <span>暂未分享任何文档</span>
        </div>
      </div>

      <!-- 文档操作栏: 翻页、放大、缩小、还原、拖拽 -->
      <ul class="vmp-doc-pagebar" v-show="showPagebar">
        <li
          data-value="zoomReset"
          title="上一步"
          class="doc-pagebar__opt iconfont iconzuofanye"
        ></li>
        <li class="page-number">
          <span class="page-index">7</span>
          <span class="page-split">/</span>
          <span class="page-total">10</span>
        </li>
        <li
          data-value="zoomReset"
          title="下一步"
          class="doc-pagebar__opt iconfont iconyoufanye"
        ></li>
        <li data-value="zoomReset" title="放大" class="doc-pagebar__opt iconfont iconfangda"></li>
        <li data-value="zoomReset" title="缩小" class="page-tool iconfont iconsuoxiao"></li>
        <li data-value="zoomReset" title="还原" class="page-tool iconfont iconhuanyuan"></li>
        <li data-value="move" title="移动" class="page-tool iconfont iconyidong"></li>
      </ul>
    </div>
  </div>
</template>
<script>
  import screenfull from 'screenfull';
  import { contextServer } from 'middleDomain';
  export default {
    name: 'VmpDocUne',
    provide() {
      return {
        fullscreen: this.fullscreen,
        openDocDlglist: this.openDocDlglist
      };
    },
    data() {
      return {
        allComplete: false,
        isFullscreen: false, //是否全屏
        selectDoc: {}, // 当前操作的文档
        fileOrboardList: [] // 从服务器获取的文档列表
      };
    },
    computed: {
      showPagebar() {
        console.log('-----计算 this.selectDoc:', this.selectDoc);
        return this.selectDoc.cid && this.selectDoc.is_board == 1 && !this.isFullscreen;
      }
    },
    beforeCreate() {
      this.docServer = contextServer.get('docServer');
    },
    created() {
      this.initEvents();
    },
    methods: {
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
        this.docViewRect = { width: w, height: h };
        // this.$refs.docBoxEl.style.height = `${h}px`;
        // this.$refs.docBoxEl.style.width = `${w}px`;
        if (this.docServer) this.docServer.setSize(w, h);
      },
      /**
       * 初始化各种事件
       */
      initEvents() {
        window.addEventListener('resize', this.resize);

        // 全屏/退出全屏事件
        screenfull.onchange(() => {
          console.log('screenfull.isFullscreen:', screenfull.isFullscreen);
          this.isFullscreen = screenfull.isFullscreen;
        });

        if (!this.docServer) return;
        // PaaS提供的文档事件
        this.docServer.on(window.VHDocSDK.Event.ALL_COMPLETE, () => {
          if (process.env.NODE_ENV !== 'production') console.debug('所有文档加载完成');
          // const list = this.$doc.getLiveAllCids();
          // if (list.includes(this.previewInfo.elId)) this.previewInfo.canOperate = true;

          console.log('this.selectDoc:', this.selectDoc);
          console.log('this.isFullscreen :', this.isFullscreen);
          this.allComplete = true;
        });
      },
      /**
       * 添加文档或者白板
       * @param item 配置信息
       * @param is_board  1文档  2白板
       */
      async addNewFile(item, is_board = 1) {
        console.log('-------addNewFile-----item:');
        this.allComplete = false;
        const { width, height } = this.docViewRect;
        const elId = this.docServer.createUUID(Number(is_board) === 1 ? 'document' : 'board');
        let options = {
          docId: item.docId,
          elId,
          id: elId,
          width,
          height
        };
        item.cid = elId;
        item.is_board = is_board;
        console.log('--item--', item);
        console.log('--selectDoc--', this.selectDoc);
        this.fileOrboardList.push({ ...item });
        await this.$forceUpdate();
        await this.$nextTick();

        // 创建
        if (Number(is_board) === 1) {
          console.log('--创建文档--');
          try {
            this.docServer.createDocument(options);
            this.docServer.selectContainer({ id: elId });
            const {
              status,
              status_jpeg,
              slideIndex,
              slidesTotal,
              converted_page,
              converted_page_jpeg
            } = await this.docServer.loadDoc({
              docId: item.docId,
              id: elId,
              docType: item.type
            });
            let temp = {};
            if (Number(status) === 200) {
              temp = { slideIndex, slidesTotal };
            } else if (Number(status_jpeg) === 200) {
              temp = { slideIndex: converted_page, slidesTotal: converted_page_jpeg };
            }
            console.log('显示文档');
            this.selectDoc = {
              cid: elId,
              is_board: 1,
              ...temp
            };
          } catch (e) {
            // 移除失败的容器fileOrboardList
            this.fileOrboardList = this.fileOrboardList.filter(item => item.elId === elId);
            console.error(e);
            // roomApi.report(this.$store.getters.roomId, e)
          }
        } else {
          console.log('-------创建白板-------');
          try {
            await this.docServer.createBoard({
              ...options,
              backgroundColor: '#fff',
              option: {
                graphicType: window.VHDocSDK.GRAPHIC.PEN,
                stroke: '#FD2C0A',
                strokeWidth: 7
              }
            });
            this.docServer.selectContainer({ id: elId });
            this.selectDoc = {
              cid: elId,
              is_board: 2
            };
          } catch (e) {
            // 移除失败的容器
            this.fileOrboardList = this.fileOrboardList.filter(item => item.elId === elId);
            console.error(e);
            // roomApi.report(this.$store.getters.roomId, e)
          }
        }
      },
      /**
       * 创建文档或白板
       */
      async createDocumentOrBorad(item) {
        this.allComplete = false;
        let { cid, active, docId, is_board } = item;
        const { width, height } = this.docViewRect;
        // 需要找到激活的文档
        if (Number(is_board) === 1) {
          if (!width || !height) console.error('创建文档容器错误', cid, docId, width, height);
          await this.docServer.createDocument({
            elId: cid,
            docId: docId,
            width: width,
            height: height,
            noDispatch: true
          });
        } else {
          await this.docServer.createBoard({
            elId: cid,
            width: width,
            height: height,
            backgroundColor: item.backgroundColor || '#fff',
            noDispatch: true
          });
        }
        if (active != 0) {
          // this.$store.commit('setSideActive', item.is_board == 1 ? 'file' : 'board');
          console.log('-------恢复文档item:', item);
          this.selectDoc = item;
          this.docServer.selectContainer({ id: item.cid, noDispatch: false });

          window.$middleEventSdk?.event?.send({
            cuid: this.cuid,
            method: 'emitSwitchTo',
            params: [item.is_board === 1 ? 'document' : 'board']
          });
        }
      },
      /**
       *  刷新或者退出重进恢复上次的文档
       */
      recoverLastDocs: async function () {
        // 获取远端所有所有容器列表
        const { list } = await this.docServer.getContainerInfo();
        this.fileOrboardList = list;
        // 执行nextTick让div的id绑定完成
        await this.$nextTick();
        list.forEach(item => {
          this.createDocumentOrBorad(item);
        });
        this.docServer.state.docInstance.instance.setRemoteData2(list);
      },
      /**
       * 切换到 文档还是白板
       * @param type:文档：document， 白板：board
       */
      async switchTo(type = 'document') {
        if (type === 'board') {
          // 切换到白板
          const item = this.fileOrboardList.find(item => {
            return item.is_board === 2;
          });
          if (item) {
            await this.docServer.selectContainer({ id: item.cid, noDispatch: false });
            this.selectDoc = item;
          } else {
            this.addNewFile({}, 2);
          }
        } else if (type === 'document') {
          // 切换到文档
          const item = this.fileOrboardList.find(item => {
            return item.is_board === 1;
          });
          console.log('切换到文档 item:', item);
          if (item) {
            console.log('选中文档');
            await this.docServer.selectContainer({
              id: item.cid,
              noDispatch: false
            });
            this.selectDoc = item;
          } else {
            this.docServer.selectContainer({
              id: '',
              noDispatch: false
            });
            this.selectDoc = {
              is_board: 1
            };
          }
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
       * @param type 演示类型：1：静态文档（jpg） 2：动态文档(PPT)
       */
      demonstrate(docId, type) {
        console.log('演示文档:', docId, ';type=', type);
        // 保留白板删除其它的文档
        const board = this.fileOrboardList.find(item => {
          return item.is_board === 2;
        });
        for (let item of this.fileOrboardList) {
          if (item.is_board === 1) {
            this.docServer.destroyContainer({ id: item.cid });
          }
        }
        this.fileOrboardList = board ? [board] : [];
        this.addNewFile({ docId, type }, 1);
      },
      handlePage(type) {
        if (!this.selectDoc.cid || this.is_board === 2) {
          return;
        }
        if (!this.allComplete) {
          return this.$message.warning('请文档加载完成以后再操作');
        }
        switch (type) {
          // 还原
          case 'zoomReset':
            this.docServer.zoomReset({ id: this.selectDoc.cid });
            break;
          // 移动
          case 'move':
            this.docServer.move({ id: this.selectDoc.cid });
            break;
        }
      }
    },
    mounted() {
      this.resize();

      // 清空
      // this.docServer.resetContainer();
      // 恢复上一次的文档数据
      this.recoverLastDocs();
    },
    beforeDestroy() {
      window.removeEventListener('resize', this.onResize);
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
      .page-tool {
        padding: 7px 10px;
      }
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

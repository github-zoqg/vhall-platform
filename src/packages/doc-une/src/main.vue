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
            :style="{ visibility: item.cid == cid ? 'visible' : 'hidden' }"
          ></div>
        </div>
      </div>

      <!-- 没有文档时的占位组件 -->
      <div class="vmp-doc-placeholder" v-show="!cid">
        <div class="vmp-doc-placeholder__inner">
          <i class="iconfont iconzanwuwendang"></i>
          <span>暂未分享任何文档</span>
        </div>
      </div>

      <!-- 文档操作栏: 翻页、放大、缩小、还原、拖拽 -->
      <ul class="vmp-doc-pagebar" @click="handlePage" v-show="showPagebar">
        <li
          data-value="prevStep"
          title="上一步"
          class="doc-pagebar__opt iconfont iconzuofanye"
        ></li>
        <li class="page-number">
          <span class="page-index">{{ pageNum }}</span>
          <span class="page-split">/</span>
          <span class="page-total">{{ pageTotal }}</span>
        </li>
        <li
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
          v-for="(item, index) in thumbnailList"
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
  import screenfull from 'screenfull';
  import { useDocServer } from 'middleDomain';
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
        thumbnailShow: false, // 文档缩略是否显示
        // 从服务器获取的文档列表
        fileOrboardList: [],
        // 缩略图列表
        thumbnailList: [],

        // 当前文档或白板的信息start (为什么不用一个对象？有的时候不触发数据变化，暂时不知道原因)
        is_board: 1, // 1:文档，2白板 。 默认文档
        cid: null, //容器id
        slideIndex: 0,
        slidesTotal: 1
        // 当前文档或白板的信息end
      };
    },
    computed: {
      showPagebar() {
        return this.cid && this.is_board == 1 && !this.isFullscreen;
      },
      pageTotal() {
        return this.slidesTotal || 1;
      },
      pageNum() {
        return Number(this.slideIndex || 0) + 1;
      }
    },
    beforeCreate() {
      this.docServer = useDocServer();
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
       * 缩略图切换
       */
      onThumbnailToggle() {
        this.thumbnailShow = !this.thumbnailShow;
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

        // 所有文档加载完成事件
        this.docServer.on(window.VHDocSDK.Event.ALL_COMPLETE, () => {
          if (process.env.NODE_ENV !== 'production') console.debug('所有文档加载完成');
          // const list = this.$doc.getLiveAllCids();
          // if (list.includes(this.previewInfo.elId)) this.previewInfo.canOperate = true;
          // console.log('this.cid:', this.cid);
          // console.log('this.isFullscreen :', this.isFullscreen);
          this.allComplete = true;
        });
        this.docServer.on(VHDocSDK.Event.DOCUMENT_LOAD_COMPLETE, data => {
          console.log('===================文档加载完成===================');
          // this.isPageShow = true
          this.slidesTotal = data.info.slidesTotal;
          this.slideIndex = data.info.slideIndex;
          const res = this.docServer.getThumbnailList();
          // console.log('---res----:', res);
          this.thumbnailList = res && res[0] ? res[0].list : [];
        });
        // 文档翻页事件
        this.docServer.on(VHDocSDK.Event.PAGE_CHANGE, data => {
          console.log('===================文档翻页====================');
          this.slidesTotal = data.info.slidesTotal;
          this.slideIndex = data.info.slideIndex;
        });

        this.docServer.on(VHDocSDK.Event.SWITCH_CHANGE, status => {
          // if (this.hasDocPermission) return;
          console.log('==========控制文档开关=============', status);
        });

        this.docServer.on(VHDocSDK.Event.CREATE_CONTAINER, data => {
          // if ((this.roleName != 1 && this.liveStatus != 1) || this.cids.includes(data.id)) {
          //   return;
          // }
          console.log('===================创建容器====================', data);
          // this.docInfo.docContainerShow = true;
          // this.docInfo.docShowType = data.type;
          // this.cids.push(data.id);
          // this.$nextTick(() => {
          //   this.initWidth(data.type);
          //   this.initContainer(data.type, data.id, '');
          // });
        });

        this.docServer.on(VHDocSDK.Event.DELETE_CONTAINER, data => {
          // if (this.roleName != 1 && this.liveStatus != 1) {
          //   return;
          // }
          console.log('===============删除容器=======================', data);
          // const index = this.cids.indexOf(data.id);
          // if (index > -1) {
          //   this.cids.splice(index, 1);
          //   this.docServer.destroyContainer({ id: data.id });
          // }
          // if (this.currentCid == data.id) {
          //   this.currentCid = '';
          //   this.docInfo.docShowType = '';
          // }
        });

        this.docServer.on(VHDocSDK.Event.SELECT_CONTAINER, async data => {
          // if (this.currentCid == data.id || (this.roleName != 1 && this.liveStatus != 1)) {
          //   return;
          // }
          console.log('===============选择容器=======================', data);
          // this.docInfo.docShowType = data.id.split('-')[0];
          // this.currentCid = data.id;
          // // 判断容器是否存在
          // if (this.cids.indexOf(data.id) > -1) {
          //   this.activeContainer(data.id);
          // } else {
          //   this.cids.push(data.id);
          //   await this.$nextTick();
          //   this.initWidth(data.type);
          //   this.initContainer(data.type, data.id, '');
          //   this.activeContainer(data.id);
          // }
          // EventBus.$emit('docInfo', this.docInfo);
          // console.log('a9');

          // this.docServer.setControlStyle(this.styleOpts);
        });

        this.docServer.on(VHDocSDK.Event.DOCUMENT_NOT_EXIT, ({ cid, docId }) => {
          console.log('====================文档不存在或已删除=================', cid, docId);
          // if (cid == this.currentCid) {
          //   this.$message({
          //     type: 'error',
          //     message: '文档不存在或已删除'
          //   });
          //   this.deleteTimer = setTimeout(() => {
          //     this.docId = '';
          //     const index = this.cids.indexOf(cid);
          //     this.cids.splice(index, 1);
          //     this.docServer.destroyContainer({ id: this.currentCid });
          //     this.currentCid = '';
          //     this.docInfo.docShowType = '';
          //   }, 3000); // 其他地方调用回将值重新传入
          // }
        });
      },
      /**
       * 添加文档或者白板
       * @param item 配置信息
       * @param is_board  1文档  2白板
       */
      async addNewFile(item, is_board = 1) {
        console.log('-------addNewFile-----');
        this.allComplete = false;
        const { width, height } = this.docViewRect;
        const elId = this.docServer.createUUID(Number(is_board) === 1 ? 'document' : 'board');
        let options = {
          docId: item.docId,
          elId,
          id: elId,
          width,
          height,
          option: {
            // 初始画笔
            graphicType: window.VHDocSDK.GRAPHIC.PEN,
            stroke: '#FD2C0A',
            strokeWidth: 7
          }
        };
        item.cid = elId;
        item.is_board = is_board;
        this.fileOrboardList.push({ ...item });
        await this.$forceUpdate();
        await this.$nextTick();

        // 创建
        if (Number(is_board) === 1) {
          try {
            await this.docServer.createDocument(options);
            await this.docServer.selectContainer({ id: elId });
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

            if (Number(status) === 200) {
              this.slideIndex = slideIndex;
              this.slidesTotal = slidesTotal;
            } else if (Number(status_jpeg) === 200) {
              this.slideIndex = converted_page;
              this.slidesTotal = converted_page_jpeg;
            }

            this.cid = elId;
            this.is_board = 1;
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
              backgroundColor: '#fff'
            });
            await this.docServer.selectContainer({ id: elId });
            this.cid = elId;
            this.is_board = 2;
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
        if (!width || !height) console.error('创建文档容器错误', cid, docId, width, height);
        const options = {
          elId: cid,
          docId: docId,
          width: width,
          height: height,
          noDispatch: false,
          option: {
            graphicType: window.VHDocSDK.GRAPHIC.PEN,
            stroke: '#FD2C0A',
            strokeWidth: 7
          }
        };

        if (Number(is_board) === 1) {
          await this.docServer.createDocument(options);
        } else {
          await this.docServer.createBoard({
            ...options,
            backgroundColor: item.backgroundColor || '#fff'
          });
        }
        if (active != 0) {
          this.cid = cid;
          this.is_board = Number(is_board);
          await this.docServer.selectContainer({ id: this.cid, noDispatch: false });

          window.$middleEventSdk?.event?.send({
            cuid: this.cuid,
            method: 'emitSwitchTo',
            params: [is_board === 1 ? 'document' : 'board']
          });
        }
      },
      /**
       *  刷新或者退出重进恢复上次的文档
       */
      recoverLastDocs: async function () {
        console.log('刷新或者退出重进恢复上次的文档');
        // 获取远端所有所有容器列表
        const { list } = await this.docServer.getContainerInfo();
        this.fileOrboardList = list;
        // 执行nextTick让div的id绑定完成
        await this.$nextTick();
        if (list.length === 0) {
          window.$middleEventSdk?.event?.send({
            cuid: this.cuid,
            method: 'emitDefault'
          });
          return;
        }
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
        console.log('doc-une 切换到。。。:', type);

        // 缩略图栏隐藏
        this.thumbnailShow = false;
        // 文档：is_board=1 ，白板 文档：is_board=2
        const is_board = type === 'board' ? 2 : type === 'document' ? 1 : null;
        if (!is_board) return;
        this.id_board = is_board;

        // 查找当前列表是否存在文档或白板
        const item = this.fileOrboardList.find(item => {
          return Number(item.is_board) === is_board;
        });
        if (item) {
          // 如果存在，设置当文档或白板
          await this.docServer.selectContainer({
            id: item.cid,
            noDispatch: false
          });
          this.cid = item.cid;
          return;
        }

        // 如果不存在
        if (is_board === 1) {
          this.cid = '';
        } else if (is_board === 2) {
          this.addNewFile({}, 2);
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
      /**
       * 页面操作工具
       * @param {*} e
       */
      handlePage(e) {
        if (!this.cid || this.is_board === 2) {
          return;
        }
        if (e.target.nodeName === 'UL') return;
        const type =
          e.target.dataset.value ||
          e.target.parentNode.dataset.value ||
          e.target.parentNode.parentNode.dataset.value ||
          null;
        if (!type) return;
        if (!this.allComplete) {
          return this.$message.warning('请文档加载完成以后再操作');
        }
        switch (type) {
          case 'prevStep':
            if (this.slideIndex > 0) {
              this.docServer.prevStep({ id: this.cid });
            }
            break;
          case 'nextStep':
            if (this.slideIndex < this.slidesTotal - 1) {
              this.docServer.nextStep({ id: this.cid });
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
            this.docServer.zoomReset({ id: this.cid });
            break;
          // 移动
          case 'move':
            this.docServer.move({ id: this.cid });
            break;
        }
      },

      /**
       * 缩略图点击
       */
      handleThumbnail(e) {
        if (!this.cid || this.is_board === 2) {
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
        this.docServer.gotoPage({ id: this.cid, page });
        this.slideIndex = page - 1;
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

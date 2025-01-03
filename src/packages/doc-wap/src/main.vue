<template>
  <div
    @click.stop
    id="docWrapper"
    class="vmp-doc-wap"
    :class="[
      `vmp-doc-wap--${!isDocStickTop ? displayMode : 'normal'}`,
      `${isPortrait && !isDocStickTop ? 'doc-portrait' : 'doc-landscape'}`,
      `${rotateNum ? 'rotate' + rotateNum : ''}`,
      wapDocClass,
      `${isDocMainScreen && !isDocStickTop ? 'vmp-doc-wap-main-screen' : ''}`,
      isPortraitLive ? 'isPortraitLive' : ''
    ]"
    :style="{
      height:
        docViewRect.height > 0 && displayMode !== 'fullscreen' ? docViewRect.height + 'px' : '100%',
      minHeight:
        docViewRect.height > 0 && displayMode !== 'fullscreen' ? docViewRect.height + 'px' : '100%'
    }"
    v-show="switchStatus"
    ref="docWrapper"
  >
    <!-- 文档白板内容区 -->
    <div ref="docContent" class="vmp-doc-une__content">
      <div ref="docInner" class="vmp-doc-inner">
        <div>
          <div
            v-for="item of docServer.state.containerList"
            :id="item.cid"
            :key="item.cid"
            class="doc-box"
            v-show="currentCid == item.cid"
          ></div>
        </div>
      </div>

      <!-- 没有文档时的占位组件 -->
      <div class="vmp-doc-placeholder" v-show="docLoadComplete && !currentCid">
        <div class="vmp-doc-placeholder__inner">
          <img src="./img/doc_empty.png" />
          <span>主讲人未添加文档，请稍等...</span>
        </div>
      </div>

      <!--上一页按钮 -->
      <div
        v-show="
          hasPager &&
          pageNum > 1 &&
          (!isPortraitLive || (!isWapBodyDocSwitchFullScreen && isPortraitLive)) &&
          (isPortraitLive ? showTools : true)
        "
        @click="handlePage('prev')"
        class="btn-pager btn-pager--prev"
      >
        <i class="vh-iconfont vh-line-arrow-left"></i>
      </div>

      <!-- 下一页按钮 -->
      <div
        v-show="
          hasPager &&
          pageNum < pageTotal &&
          (!isPortraitLive || (!isWapBodyDocSwitchFullScreen && isPortraitLive)) &&
          (isPortraitLive ? showTools : true)
        "
        @click="handlePage('next')"
        class="btn-pager btn-pager--next"
      >
        <i class="vh-iconfont vh-line-arrow-right"></i>
      </div>
    </div>

    <div
      class="pageGroup"
      v-show="isPortraitLive ? showTools : true"
      v-if="
        !!currentCid &&
        !currentCid.startsWith('board') &&
        (!isPortraitLive || (!isWapBodyDocSwitchFullScreen && isPortraitLive))
      "
    >
      {{ pageNum }}/{{ pageTotal }}
    </div>
    <div
      class="tools"
      v-show="
        (this.displayMode == 'normal' && (isDocMainScreen || isPortraitLive) ? showTools : true) ||
        isShowTransBtn
      "
    >
      <!-- 文档横屏 -->
      <div
        v-show="!!currentCid && displayMode == 'fullscreen'"
        @click="doRotate"
        class="btn-doc-rotate"
      >
        <i class="vh-iconfont vh-line-landscape" v-if="isPortrait && !!!rotateNum"></i>
        <i class="vh-iconfont vh-line-vertical-screen" v-else></i>
      </div>
      <!-- 全屏切换 -->
      <div v-show="!!currentCid" @click="fullscreen" class="btn-doc-fullscreen">
        <i v-if="displayMode === 'fullscreen'" class="vh-iconfont vh-a-line-exitfullscreen"></i>
        <i v-else class="vh-iconfont vh-a-line-fullscreen"></i>
      </div>
      <!-- 文档拖动后还原 -->
      <div v-show="!!currentCid" @click="restore" class="btn-doc-restore">
        <i class="vh-iconfont vh-line-c-scale-to-original"></i>
      </div>

      <!-- 文档播放器位置互换 -->
      <div
        v-if="!isDocMainScreen"
        v-show="isShowTransBtn"
        @click="transposition"
        class="btn-doc-transposition"
        :class="isPortraitLive ? 'btn-doc-transposition__portrait' : ''"
      >
        <i class="vh-iconfont vh-line-sort1"></i>
      </div>
    </div>
  </div>
</template>
<script>
  import {
    useRoomBaseServer,
    useDocServer,
    useMsgServer,
    usePlayerServer,
    useRebroadcastServer,
    useGroupServer
  } from 'middle-domain';
  import { boxEventOpitons } from '@/app-shared/utils/tool.js';
  import { debounce } from 'lodash';
  import { getBrowserType } from '@/app-shared/utils/getBrowserType.js';

  export default {
    name: 'VmpDocWap',

    data() {
      return {
        //文档展示模式： normal-正常; fullscreen-全屏
        displayMode: 'normal',
        //文档宽高
        docViewRect: {
          width: 0,
          height: 0
        },
        rebroadcastStartTimer: null,
        rebroadcastStopTimer: null,
        rotateNum: 0, //旋转角度
        isPortrait: true, // 是否是竖屏  设备
        isNotSupportTrans: ['UCBrowser', 'Quark'].includes(getBrowserType()?.shell),
        timmer: null,
        showTools: false,
        isDocBeCovered: false,
        isDocStickTop: false,
        chatSendBox: false
      };
    },
    computed: {
      isShowTransBtn() {
        const result = this.displayMode != 'fullscreen' && !this.isNotSupportTrans;

        return !this.isPortraitLive ? result : this.isWapBodyDocSwitchFullScreen && result;
      },
      // 竖屏直播，文档播放器位置切换的状态
      isWapBodyDocSwitchFullScreen() {
        return this.$domainStore.state.roomBaseServer.isWapBodyDocSwitchFullScreen;
      },
      wapDocClass() {
        if (this.showHeader && this.isWapBodyDocSwitch) {
          return 'vmp-doc-wap__top';
        }
        if (!this.showHeader && this.isWapBodyDocSwitch) {
          return 'vmp-doc-wap__top-noheader';
        }
        return '';
      },
      /**
       * 是否显示头部
       */
      showHeader() {
        if (this.embedObj.embed || (this.webinarTag && this.webinarTag.organizers_status == 0)) {
          return false;
        } else {
          return true;
        }
      },
      // 是否为嵌入页
      embedObj() {
        return this.$domainStore.state.roomBaseServer.embedObj;
      },
      // 主办方配置
      webinarTag() {
        return this.$domainStore.state.roomBaseServer.webinarTag;
      },
      // wap-body和文档是否切换位置
      isWapBodyDocSwitch() {
        return this.$domainStore.state.roomBaseServer.isWapBodyDocSwitch;
      },
      // 活动状态（2-预约 1-直播 3-结束 4-点播 5-回放）
      webinarType() {
        return Number(this.roomBaseServer.state.watchInitData.webinar.type);
      },
      // 文档是否加载完成
      docLoadComplete() {
        return this.docServer.state.docLoadComplete;
      },
      // 当前文档白板容器id
      currentCid() {
        return this.docServer.state.currentCid;
      },
      // 是否观众可见
      switchStatus() {
        return this.docServer.state.switchStatus;
      },
      // 页码
      pageNum() {
        return this.docServer.state.pageNum;
      },
      // 总页数
      pageTotal() {
        return this.docServer.state.pageTotal;
      },
      // 当前资料类型是文档还是白板
      currentType() {
        return this.docServer.state.currentCid.split('-')[0];
      },
      // 是否有翻页按钮
      hasPager() {
        // 直播中 && 开启了文档显示 && 当前展示的是文档
        return (
          this.webinarType === 1 &&
          !!this.roomBaseServer.state.interactToolStatus.is_adi_watch_doc &&
          this.currentType === 'document'
        );
      },
      // 是否开启文档云渲染
      isDocMainScreen() {
        return (
          this.$domainStore.state.docServer.switchStatus &&
          this.$domainStore.state.interactiveServer.isInstanceInit &&
          this.webinarType == 1 &&
          !!this.$domainStore.state.docServer.currentCid &&
          this.$domainStore.state.roomBaseServer.interactToolStatus.speakerAndShowLayout == 1
        );
      },
      // 竖屏直播
      isPortraitLive() {
        return (
          this.$domainStore.state.roomBaseServer.watchInitData?.webinar?.webinar_show_type == 0
        );
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
            // 恢复上一次的文档数据;
            this.recoverLastDocs();
          }
        }
      },
      rotateNum() {
        // this.docServer.zoomReset();
        this.resize();
        this.docServer.rotate(this.rotateNum);
        this.docServer.zoomReset();
        // 派发事件：播放器旋转docResize
        window.$middleEventSdk?.event?.send(
          boxEventOpitons(this.cuid, 'emitDocRotate', [this.rotateNum])
        );
      },
      currentCid(newval) {
        //TODO：SDK的zoomreset未生效，这里延迟刷新下各个文档状态
        if (newval && this.docServer.singleLoadComplete()) {
          setTimeout(() => {
            this.docServer.zoomReset();
          }, 50);
        }
      },
      isDocMainScreen() {
        this.$nextTick(() => {
          this.resize();
        });
      },
      switchStatus: {
        handler(val) {
          if (!this.isPortraitLive) return;
          // 开启文档
          if (val && !this.isDocBeCovered) {
            this.roomBaseServer.state.isWapBodyDocSwitchFullScreen = false;
          } else {
            this.roomBaseServer.state.isWapBodyDocSwitchFullScreen = true;
          }
        },
        immediate: true
      },
      displayMode(val) {
        // 派发事件：播放器隐藏控制栏
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitDocScreen', [val]));
      }
    },
    beforeCreate() {
      this.roomBaseServer = useRoomBaseServer();
      this.docServer = useDocServer();
      this.msgServer = useMsgServer();
      this.groupServer = useGroupServer();
    },
    mounted() {
      console.log('[doc] wap mounted');
      // 初始化文档server的getDocViewRect方法
      this.docServer.getDocViewRect = this.getDocViewRect.bind(this);

      // 初始计算一次文档区域
      this.getDocViewRect();

      this.initEvents();

      if (this.roomBaseServer.state.watchInitData.webinar.type == 1) {
        // 直播中才执行,恢复上一次的文档数据;
        this.$nextTick(() => {
          this.recoverLastDocs();
        });
      }
      this.clickDocShowTool();
      //this.resizeDoc();
      window.addEventListener('resize', this.resizeDoc);
    },
    methods: {
      /**
       * 全屏切换
       * 这里使用的是样式模拟全屏，不用真实全屏事件，是因为在iphone手机上存在兼容性问题
       */
      fullscreen() {
        this.displayMode = this.displayMode === 'fullscreen' ? 'normal' : 'fullscreen';
        // 切换后还原位置
        this.docServer.zoomReset();
        this.resize();
        this.rotateNum = 0;

        if (!this.isPortrait) {
          this.$toast(this.$t('message.message_1035'));
          // For better watching experience, please use landscape mode
        }
      },
      // 点击文档显示操作工具（3s）
      clickDocShowTool() {
        this.$nextTick(() => {
          document.getElementById('docWrapper').addEventListener('click', e => {
            if (!this.clickDocShowTool) return;
            this.timmer && clearTimeout(this.timmer);
            if (this.$parent.showPlayIcon) return; //播放中
            this.showTools = true;
            this.timmer = setTimeout(() => {
              this.showTools = false;
              this.timmer = null;
            }, 3000);
          });
        });
      },
      // 消缩放、移动模式。
      cancelZoom() {
        if (this.currentCid) {
          this.restore();
          this.docServer.cancelZoom();
        }
      },
      // 文档移动后还原
      restore() {
        this.docServer.zoomReset();
      },

      // 文档播放器互换位置
      transposition() {
        if (this.isPortraitLive) {
          this.roomBaseServer.state.isWapBodyDocSwitchFullScreen =
            !this.roomBaseServer.state.isWapBodyDocSwitchFullScreen;
        } else {
          this.roomBaseServer.state.isWapBodyDocSwitch = !this.isWapBodyDocSwitch;
        }
      },

      // 初始化事件
      initEvents() {
        // 回放播放时间
        this.docServer.$on('dispatch_doc_vod_time_update', this.dispatchDocVodTimeUpdate);

        // 文档不存在或已删除
        this.docServer.$on('dispatch_doc_not_exit', this.dispatchDocNotExit);

        // 点播或回放播放器播放完成
        usePlayerServer().$on(VhallPlayer.ENDED, () => {
          console.log('[doc] VhallPlayer.ENDED');
          // 4-点播， 5-回放
          if ([4, 5].includes(this.webinarType)) {
            this.docServer.state.switchStatus = false;
            window.$middleEventSdk?.event?.send(
              boxEventOpitons(this.cuid, 'emitShowMenuTab', [false])
            );
          }
        });

        const reBroadcastServer = useRebroadcastServer();
        // 转播开始事件
        reBroadcastServer.$on('live_broadcast_start', () => {
          // 文档角色设置成观众，实际上wap端只能是观众
          this.docServer.setRole(VHDocSDK.RoleType.SPECTATOR);
          // 设置转播中
          this.docServer.setRelay(true);
          // 清除存在的定时器
          if (this.rebroadcastStartTimer) {
            clearTimeout(this.rebroadcastStartTimer);
            this.rebroadcastStartTimer = null;
          }
          this.rebroadcastStartTimer = setTimeout(() => {
            // 设置播放流模式为FLV模式
            this.docServer.setPlayMode(VHDocSDK.PlayMode.FLV);
            this.recoverLastDocs();
            clearTimeout(this.rebroadcastStartTimer);
            this.rebroadcastStartTimer = null;
          }, 1000);
        });
        // 转播结束事件
        reBroadcastServer.$on('live_broadcast_stop', () => {
          // 设置非转播
          this.docServer.setRelay(false);
          if (this.rebroadcastStopTimer) {
            clearTimeout(this.rebroadcastStopTimer);
            this.rebroadcastStopTimer = null;
          }
          this.rebroadcastStopTimer = setTimeout(() => {
            // 重置状态
            this.docServer.resetState();
            this.docServer.setPlayMode(VHDocSDK.PlayMode.INTERACT);
            this.recoverLastDocs();
          }, 1000);
        });

        // 设置观看端文档是否可见
        this.docServer.$on('dispatch_doc_switch_change', val => {
          console.log('dispatch_doc_switch_change', val);
          this.setRight();
        });

        this.groupServer.$on('ROOM_CHANNEL_CHANGE', () => {
          this.roomBaseServer.state.isWapBodyDocSwitch = false;
        });

        // 所有文档加载完成
        this.docServer.$on('dispatch_doc_all_complete', val => {
          console.log('dispatch_doc_all_complete', val);
          this.setRight();
        });

        // 当前文档加载完成
        this.docServer.$on('dispatch_doc_load_complete', val => {
          console.log('dispatch_doc_load_complete', val);
          this.setRight();
        });

        // 文档切换
        this.docServer.$on('dispatch_doc_select_container', val => {
          console.log('dispatch_doc_select_container', val);
          this.setRight();
        });
      },

      setRight: debounce(function (e) {
        //如果是更换文档，判断是否需要纠正旋转
        if (this.displayMode === 'fullscreen') {
          //  this.docServer.zoomReset();
          this.resize();
          this.docServer.rotate(this.rotateNum);

          //TODO：SDK的zoomreset未生效，这里延迟刷新下各个文档状态
          setTimeout(() => {
            this.docServer.zoomReset();
          }, 50);
        }
      }, 300),

      /**
       * 屏幕缩放，文档在wap端实际上用的屏幕的宽度
       */
      async resize() {
        await this.$nextTick();
        const { width, height } = this.getDocViewRect();
        if (!width || !height) return;
        if (
          document.getElementById(this.docServer.state.docCid) ||
          document.getElementById(this.docServer.state.boardCid)
        ) {
          this.docServer.setSize(width, height);
        }
      },

      /**
       * 获取文档白板容器大小
       */
      getDocViewRect() {
        let w = 0;
        let h = 0;
        //是否竖屏
        if (this.isPortrait) {
          //竖屏 90°  即 锁屏下旋转按钮触发
          if (this.rotateNum == 90) {
            h = window.innerWidth;
            w = (16 * h) / 9;
          } else {
            if (this.isPortraitLive) {
              // 如果是竖屏直播，文档高度根据宽度计算
              w = this.$refs.docWrapper.parentElement.offsetWidth;
              h = (9 * w) / 16;
            } else if (!this.isDocMainScreen || this.displayMode === 'fullscreen') {
              //竖屏的 正常显示
              w = window.innerWidth;
              h = (9 * w) / 16;
            } else {
              //竖屏的 主画面显示
              h = this.$refs.docWrapper.offsetHeight;
              w = (16 / 9) * h;
            }
          }
        } else {
          // 未锁屏，设备横向
          h = window.innerHeight;
          w = (16 * h) / 9;
        }
        this.docViewRect = { width: w, height: h };
        console.log('[doc] ', this.docViewRect);
        return { width: w, height: h };
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
        const { width, height } = this.getDocViewRect();
        await this.docServer.recover({
          width,
          height
        });
      },

      // 翻页
      handlePage(type) {
        if (!this.currentCid || this.currentCid.startsWith('board')) {
          return;
        }
        if (type === 'prev') {
          if (this.pageNum > 1) {
            this.docServer.prevStep();
          }
        } else if (type === 'next') {
          if (this.pageNum < this.pageTotal) {
            this.docServer.nextStep();
          }
        }
      },
      // 文档不存在或已删除
      dispatchDocNotExit() {
        this.$message({
          type: 'error',
          message: '文档不存在或已删除'
        });
      },
      // 回放视频播放更新事件
      dispatchDocVodTimeUpdate({ isChange }) {
        if (isChange) {
          window.$middleEventSdk?.event?.send(
            boxEventOpitons(this.cuid, 'emitShowMenuTab', [this.docServer.state.switchStatus])
          );
        }
      },
      //监听系统横竖屏
      resizeDoc(e) {
        // 输入框获焦 部分小机型会误将输入框获焦，响应resize导致判断屏幕横屏
        if (!this.chatSendBox) {
          window.setTimeout(() => {
            const newOir = window.innerWidth < window.innerHeight;
            console.log(
              '【resizeDoc】:',
              'window.innerHeight: ' + window.innerHeight,
              'window.innerWidth: ' + window.innerWidth,
              '变化前---设备竖屏 isPortrait:' + this.isPortrait,
              '变化后---当前设备竖屏:' + newOir
            );
            if (newOir != this.isPortrait) {
              //方向发生了变化就重新计算文档大小
              this.isPortrait = newOir;
              this.rotateNum = 0;
              this.resize();
              this.docServer.zoomReset();
            }
          }, 50);
        }
      },
      //自定义横竖屏
      doRotate() {
        if (this.isPortrait) {
          this.rotateNum = this.rotateNum === 0 ? 90 : 0;
          //  console.log('screen.orientation-> ', window.screen.orientation);
        } else {
          //设备横向 旋转即退出全屏
          this.fullscreen();
        }
      },
      // 设置文档容器是否隐藏
      setDocContainerCovered(val) {
        this.isDocBeCovered = val;
      },
      // 设置文档容器是否置顶
      setDocContainerStickTop(val) {
        if (val) {
          this.restore();
        }
        this.isDocStickTop = val;
      },
      // 输入框控件响应
      changeChatSendBox(val) {
        this.chatSendBox = val;
      }
    },
    beforeDestroy() {
      this.docServer.$off('dispatch_doc_not_exit', this.dispatchDocNotExit);
      this.docServer.$off('dispatch_doc_vod_time_update', this.dispatchDocVodTimeUpdate);
      window.removeEventListener('resize', this.resizeDoc);
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
    // background-color: #f2f2f2;
    color: #fff;
    position: relative;
    &__top {
      position: fixed;
      top: 71px;
      left: 0;
      .pageGroup {
        margin-top: -80px !important;
      }
      .tools {
        margin-top: -88px !important;
      }
    }

    &__top-noheader {
      position: fixed;
      top: 0;
      left: 0;
      .pageGroup {
        margin-top: -80px !important;
      }
      .tools {
        margin-top: -88px !important;
      }
    }

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
        // 解决文档点击事件无效的问题
        .upper-canvas {
          pointer-events: none;
        }

        .doc-box {
          top: 0;
          left: 50%;
          position: absolute;
          transform: translateX(-50%);
          overflow: visible !important;
          > div {
            overflow: visible !important;
          }
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
        flex-direction: column;
        justify-content: center;
        img {
          width: 160px;
          margin-bottom: 24px;
        }
        span {
          color: #8c8c8c;
          font-size: 28px;
          line-height: 39px;
        }
      }
    }

    .pageGroup {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      top: 100%;
      margin-top: 40px;
      min-width: 90px;
      height: 40px;
      padding: 0 24px;
      border-radius: 100px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: rgba(0, 0, 0, 0.4);
      font-size: 28px;
    }
    .tools {
      position: absolute;
      right: 0;
      top: 100%;
      display: flex;
      align-items: center;
      margin-top: 32px;
      height: 56px;
      > div {
        margin-right: 24px;
        width: 56px;
        height: 56px;
        border-radius: 50%;
        color: #fff;
        background-color: rgba(0, 0, 0, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        z-index: 7;
        &:nth-last-child(1) {
          margin-right: 32px;
        }
        &.btn-doc-transposition__portrait {
          margin-right: 12px;
          margin-top: 8px;
        }
      }

      .vh-iconfont {
        font-size: 30px;
      }
      .btn-doc-fullscreen {
        .vh-iconfont {
          margin-top: 2px;
        }
      }
    }

    .btn-pager {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      background-color: rgba(0, 0, 0, 0.4);
      width: 56px;
      height: 56px;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 6;

      .vh-iconfont {
        font-size: 30px;
      }
      &--prev {
        left: 32px;
        .vh-iconfont {
          margin-right: 6px;
        }
      }
      &--next {
        right: 32px;
        .vh-iconfont {
          margin-left: 6px;
        }
      }
    }

    &.isPortraitLive {
      .pageGroup {
        margin-top: -64px;
      }
      .tools {
        margin-top: -72px;
      }
    }

    // 开启文档云融屏，文档为主画面
    &.vmp-doc-wap-main-screen {
      width: (422-85) * 16/9px !important;
      height: calc(422px - 85px) !important;
      min-height: calc(422px - 85px) !important;
      .pageGroup {
        margin-top: -50px !important;
      }
      .tools {
        margin-top: -60px !important;
      }
    }
    // 全屏模式下
    &.vmp-doc-wap--fullscreen {
      position: fixed;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      width: 100% !important;
      height: 100% !important;
      background-color: rgba(0, 0, 0, 0.9);
      // 播放器的层级是1-12
      //聊天框层级22, 礼物飘窗100 礼物全屏特效300
      z-index: 301;

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

      .tools {
        right: 0;
        bottom: 32px;
        top: auto;
        > div:nth-last-child(2) {
          margin-right: 32px;
        }
        .btn-doc-fullscreen {
        }
        .btn-doc-restore {
        }
        .btn-doc-rotate {
        }
      }
      .pageGroup {
        bottom: 40px;
        top: auto;
      }
      &.doc-landscape {
        .tools {
          right: 0;
          bottom: 16px;
          top: auto;
          margin-top: 0;
          height: 28px;
          > div {
            margin-right: 12px;
            width: 28px;
            height: 28px;
            &:nth-last-child(1) {
              margin-right: 16px;
            }
          }
          .vh-iconfont {
            font-size: 15px;
          }
        }
        .pageGroup {
          right: 50%;
          bottom: 20px;
          top: auto;
          font-size: 14px;
          height: 20px;
          min-width: 45px;
        }
        .btn-pager {
          width: 28px;
          height: 28px;
          .vh-iconfont {
            font-size: 15px;
          }
          &--prev {
            .vh-iconfont {
              margin-right: 2px;
            }
          }
          &--next {
            .vh-iconfont {
              margin-left: 2px;
            }
          }
        }
      }
      &.rotate90 {
        .tools {
          left: 32px;
          bottom: 248px;
          top: auto;
          right: auto;
          margin-top: 0;
          height: 56px;
          transform-origin: left bottom;
          transform: rotate(90deg) !important;
          > div {
            margin-right: 24px;
            width: 56px;
            height: 56px;
          }
          .btn-doc-fullscreen {
          }
          .btn-doc-restore {
          }
          .btn-doc-rotate {
          }
        }
        .btn-pager {
          transform: rotate(90deg) !important ;
          left: calc(50% - 32px);
          right: auto;
          &--prev {
            top: 32px;
            bottom: auto;
          }
          &--next {
            top: auto;
            bottom: 32px;
          }
        }
        .pageGroup {
          transform-origin: center;
          transform: translateY(-50%) rotate(90deg) !important;
          bottom: auto;
          top: 50%;
          left: 12px;
          right: auto;
          margin-top: 0;
        }
      }
    }
  }
  // 回放有文档时自动生成的div，用于文档sdk存储回放数据
  #myVodNode {
    height: 0 !important;
  }
</style>

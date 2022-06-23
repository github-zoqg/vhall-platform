<template>
  <div
    id="docWrapper"
    class="vmp-doc-wap"
    :class="[
      `vmp-doc-wap--${displayMode}`,
      `${isPortrait ? 'doc-portrait' : 'doc-landscape'}`,
      `${rotateNum ? 'rotate' + rotateNum : ''}`,
      wapDocClass
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
          <img src="./img/doc_empty.png" style="width: 100px; margin-bottom: 20px" />
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

    <div class="pageGroup" v-if="!!currentCid && !currentCid.startsWith('board')">
      {{ pageNum }}/{{ pageTotal }}
    </div>
    <div class="tools">
      <!-- 文档横屏 -->
      <div
        v-show="!!currentCid && displayMode == 'fullscreen'"
        @click="doRotate"
        class="btn-doc-rotate"
      >
        <i class="vh-iconfont vh-line-sponsor" v-if="isPortrait && !!!rotateNum"></i>
        <i class="vh-iconfont vh-line-send" v-else></i>
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
        v-show="!!currentCid && displayMode != 'fullscreen'"
        @click="transposition"
        class="btn-doc-transposition"
      >
        <i class="vh-saas-iconfont vh-saas-a-line-Documenttonarrow"></i>
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
  import { boxEventOpitons } from '@/packages/app-shared/utils/tool.js';

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
        isPortrait: true // 是否是竖屏  设备
      };
    },
    computed: {
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
      this.docServer.getDocViewRect = this.getDocViewRect;

      // 初始计算一次文档区域
      this.getDocViewRect();

      this.initEvents();

      if (this.roomBaseServer.state.watchInitData.webinar.type == 1) {
        // 直播中才执行,恢复上一次的文档数据;
        this.$nextTick(() => {
          this.recoverLastDocs();
        });
      }
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

      // 文档移动后还原
      restore() {
        this.docServer.zoomReset();
      },

      // 文档播放器互换位置
      transposition() {
        this.roomBaseServer.state.isWapBodyDocSwitch = !this.isWapBodyDocSwitch;
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
        // 文档切换
        this.docServer.$on('dispatch_doc_select_container', val => {
          console.log('dispatch_doc_select_container', val);
          this.setRight();
        });
      },

      setRight() {
        //如果是更换文档，判断是否需要旋转90°
        if (this.isPortrait && this.displayMode === 'fullscreen' && this.rotateNum == 90) {
          //  this.docServer.zoomReset();
          this.resize();
          this.docServer.rotate(this.rotateNum);

          setTimeout(() => {
            this.docServer.zoomReset();
          }, 50);
        }
      },

      /**
       * 屏幕缩放，文档在wap端实际上用的屏幕的宽度
       */
      resize() {
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
            //竖屏的 正常显示
            w = window.innerWidth;
            h = (9 * w) / 16;
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
    background-color: #f2f2f2;
    color: #fff;
    position: relative;
    &__top {
      position: fixed;
      top: 71px;
      left: 0;
      .pageGroup {
        margin-top: -72px !important;
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
        margin-top: -72px !important;
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
        flex-direction: column;
        justify-content: center;
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

    .pageGroup {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      top: 100%;
      margin-top: 48px;
      color: #fff;
      min-width: 90px;
      height: 40px;
      padding: 2px 24px;
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
        z-index: 9;
        &:nth-last-child(1) {
          margin-right: 32px;
        }
      }
      .vh-iconfont {
        font-size: 30px;
      }
      .btn-doc-fullscreen {
      }

      .btn-doc-restore {
      }

      .btn-doc-rotate {
      }
    }

    .btn-pager {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      background-color: rgba(0, 0, 0, 0.4);
      width: 56px;
      height: 56px;
      border-radius: 100px;
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10;

      .vh-iconfont {
        font-size: 30px;
      }
      &--prev {
        left: 32px;
      }
      &--next {
        right: 32px;
      }
    }

    // 全屏模式下
    &.vmp-doc-wap--fullscreen {
      position: fixed;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
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
        bottom: 32px;
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
          bottom: 16px;
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
          left: 10px;
          right: auto;
          margin-top: 0;
        }
      }
    }
  }
</style>

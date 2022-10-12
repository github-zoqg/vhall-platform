<template>
  <!-- 文档组件， 适用于 PC发起端和观看端。 -->
  <div
    id="docWrapper"
    class="vmp-doc-une"
    :class="[
      { 'is-watch': isWatch },
      `vmp-doc-une--${displayMode}`,
      { 'vmp-doc-une--embed': isEmbed },
      { 'has-stream-list': hasStreamList },
      { 'no-delay-layout': isUseNoDelayLayout }
    ]"
    @mouseenter="mouseEnterDoc(true)"
    @mouseleave="mouseEnterDoc(false)"
    v-show="show"
    ref="docWrapper"
  >
    <!-- 这里配置的是文档工具栏 -->
    <VmpDocToolbar ref="docToolbar" v-show="showToolbar" @changeBrush="changeBrush"></VmpDocToolbar>

    <!-- 结束演示按钮 -->
    <el-button
      round
      size="mini"
      v-if="displayMode === 'normal' && renderEndDemonstrateBtn"
      @click="handleEndDemonstrate"
      class="end-demonstrate"
    >
      结束演示
    </el-button>

    <!-- 文档白板内容区 -->
    <div ref="docContent" class="vmp-doc-une__content">
      <div ref="docInner" class="vmp-doc-inner">
        <div style="border: none">
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
          <img src="./img/doc_null.png" style="width: 140px; margin-bottom: 20px" />
          <span
            v-if="
              hasDocPermission ||
              [3, 4].includes(roleName) ||
              (!isInGroup && roleName == 1 && doc_permission != userId)
            "
          >
            {{ webinarType == 1 ? $t('doc.doc_1011') : $t('doc.doc_1029') }}
          </span>
          <span v-else>{{ $t('doc.doc_1003') }}</span>
        </div>
      </div>

      <!-- 文档操作栏: 翻页、放大、缩小、还原、拖拽 -->
      <ul class="vmp-doc-pagebar" @click="handlePage" v-show="showPagebar">
        <li
          v-if="hasPager"
          data-value="prevStep"
          :title="$t('account.account_1077')"
          class="doc-pagebar__opt vh-iconfont vh-line-arrow-left"
        ></li>
        <li v-if="hasPager || webinarMode == 5" class="page-number">
          <span class="page-index">{{ docServer.state.pageNum }}</span>
          <span class="page-split">/</span>
          <span class="page-total">{{ docServer.state.pageTotal }}</span>
        </li>
        <li
          v-if="hasPager"
          data-value="nextStep"
          :title="$t('account.account_1036')"
          class="doc-pagebar__opt vh-iconfont vh-line-arrow-right"
        ></li>
        <li
          data-value="zoomIn"
          :title="$t('doc.doc_1005')"
          class="doc-pagebar__opt vh-iconfont vh-line-zoom-in"
        ></li>
        <li
          data-value="zoomOut"
          :title="$t('doc.doc_1006')"
          class="doc-pagebar__opt vh-iconfont vh-line-zoom-out"
        ></li>
        <li
          data-value="zoomReset"
          :title="$t('doc.doc_1008')"
          class="doc-pagebar__opt vh-saas-iconfont vh-saas-a-line-11"
        ></li>
        <li
          data-value="move"
          :title="canMove ? $t('doc.doc_1028') : $t('doc.doc_1007')"
          class="doc-pagebar__opt vh-saas-iconfont vh-saas-line-drag doc-pagebar__opt--move"
          :class="{ selected: canMove }"
        ></li>
        <li
          v-if="isWatch && displayMode === 'normal'"
          data-value="fullscreen"
          :title="$t('doc.doc_1010')"
          class="doc-pagebar__opt vh-iconfont vh-a-line-fullscreen"
        ></li>
        <li
          v-if="isWatch && displayMode === 'fullscreen'"
          data-value="fullscreen"
          :title="$t('doc.doc_1009')"
          class="doc-pagebar__opt vh-iconfont vh-a-line-exitfullscreen"
        ></li>
      </ul>

      <!-- 文档缩略图 -->
      <transition name="el-fade-in-linear">
        <ul
          class="vmp-doc-thumbnailbar"
          @click="handleThumbnail"
          v-show="currentType !== 'board' && webinarMode != 5 && thumbnailShow"
        >
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
      </transition>
    </div>

    <!-- 文档加载时的遮罩和进度,观看端才用 -->
    <div v-show="isWatch && !docLoadComplete" class="el-loading-mask vmp-doc-mask">
      <div class="el-loading-spinner">
        <svg viewBox="25 25 50 50" class="circular">
          <circle cx="50" cy="50" r="20" fill="none" class="path"></circle>
        </svg>
        <p class="el-loading-text">{{ $t('doc.doc_1001') }}</p>
      </div>
    </div>
  </div>
</template>
<script>
  import VmpDocToolbar from './toolbar/main.vue';
  import screenfull from 'screenfull';
  import { throttle } from 'lodash';
  import elementResizeDetectorMaker from 'element-resize-detector';
  import {
    useRoomBaseServer,
    useDocServer,
    useGroupServer,
    useInteractiveServer,
    useMemberServer,
    useRebroadcastServer,
    useDesktopShareServer,
    usePlayerServer,
    useMicServer,
    useSplitScreenServer
  } from 'middle-domain';
  import { boxEventOpitons } from '@/app-shared/utils/tool';
  import {
    cl_handleScreen,
    cl_setDocMenu,
    cl_moveToDoc,
    cl_docComplete
  } from '@/app-shared/client/client-methods.js';
  import clientMsgApi from '@/app-shared/utils/clientMsgApi';
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
        displayMode: 'normal', // normal: 正常; mini: 小屏 fullscreen:全屏
        keepAspectRatio: true, //保持纵横比
        thumbnailShow: false, // 文档缩略是否显示
        hasStreamList: false, // 是否展示流列表
        canMove: false, //文档能否拖拽
        rebroadcastStartTimer: null,
        rebroadcastStopTimer: null
      };
    },
    computed: {
      // 是不是单视频嵌入
      isEmbedVideo() {
        return this.$domainStore.state.roomBaseServer.embedObj.embedVideo;
      },
      // 是不是嵌入页
      isEmbed() {
        return this.$domainStore.state.roomBaseServer.embedObj.embed;
      },
      watchInitData() {
        return this.roomBaseServer.state.watchInitData;
      },
      groupInitData() {
        return this.groupServer.state.groupInitData;
      },
      // 直播模式：1-音频直播、2-视频直播、3-互动直播 6-分组直播 5 定时直播
      webinarMode() {
        return this.roomBaseServer.state.watchInitData.webinar.mode;
      },
      // 文档是否加载完成
      docLoadComplete() {
        return this.docServer.state.docLoadComplete;
      },
      // 当前文档或白板容器的Id
      currentCid() {
        return this.docServer.state.currentCid;
      },
      // 当前页码（从1开始）
      pageNum() {
        return this.docServer.state.pageNum;
      },
      // 是否在小组中
      isInGroup() {
        return !!this.groupServer.state.groupInitData?.isInGroup;
      },
      // 是否显示文档白板操作栏(翻页、放大、缩小、还原、拖拽)
      showPagebar() {
        if (this.isWatch) {
          // 观看端，普通模式或全屏模式下，打开了文档或白板
          return this.currentCid && ['normal', 'fullscreen'].includes(this.displayMode);
        } else {
          // 发起端，打开了文档，普通模式，助理或者有演示权限 或者“不在分组内，是主持人角色但是主讲人不是自己”,非转播状态
          return (
            this.currentType === 'document' &&
            this.displayMode === 'normal' &&
            (this.roleName == 3 ||
              this.hasDocPermission ||
              (!this.isInGroup && this.roleName == 1 && this.doc_permission != this.userId)) &&
            !this.watchInitData.rebroadcast?.isRebroadcasting
          );
        }
      },
      // 当前用户Id
      userId() {
        return this.roomBaseServer.state.watchInitData.join_info.third_party_user_id;
      },
      // 当前的演示者Id
      presenterId() {
        return this.isInGroup
          ? this.groupServer.state.groupInitData.presentation_screen
          : this.roomBaseServer.state.interactToolStatus.presentation_screen;
      },
      // 主讲人权限
      doc_permission() {
        if (this.isInGroup) {
          return this.groupServer.state.groupInitData.doc_permission;
        } else {
          return this.roomBaseServer.state.interactToolStatus.doc_permission;
        }
      },
      // 是否观看端
      isWatch() {
        return !['send', 'record', 'clientEmbed'].includes(this.roomBaseServer.state.clientType);
      },
      // 活动状态（2-预约 1-直播 3-结束 4-点播 5-回放）
      webinarType() {
        return Number(this.roomBaseServer.state.watchInitData.webinar.type);
      },
      // 当前用户角色 1-主持人 2-观众(发起端没有观众) 3-助理；4-嘉宾（互动直播才有嘉宾）
      roleName() {
        return Number(this.roomBaseServer.state.watchInitData.join_info.role_name);
      },
      // 是否在屏幕共享
      isShareScreen() {
        return this.$domainStore.state.desktopShareServer.localDesktopStreamId;
      },
      // 文档是否可见
      show() {
        // 1、发起端没有开启桌面共享时展示
        // 2、主持人开启桌面共享时，如果开了文档，助理端优先展示文档
        // 3、观看端，主持人开启了观众可见或者在小组中或者有演示权限,不能是单视频嵌入页
        // 4. 未上麦的观众 | 未出实话互动 | 合并模式不显示文档
        if (this.isWatch) {
          if (!this.isEmbedVideo) {
            if (this.hasDocPermission) {
              return true;
            } else {
              if (this.micServer.state.isSpeakOn && this.isShareScreen) {
                return false;
              } else {
                if (
                  !this.$domainStore.state.interactiveServer.isInstanceInit &&
                  this.roomBaseServer.state.interactToolStatus.speakerAndShowLayout == 1
                ) {
                  return false;
                } else {
                  return this.docServer.state.switchStatus || this.groupServer.state.isInGroup;
                }
              }
            }
          } else {
            return false;
          }
        } else {
          if (this.isShareScreen) {
            return this.roleName == 3 && this.currentCid;
          } else {
            return true;
          }
        }
      },
      // 是否文档演示权限
      hasDocPermission() {
        if (this.isWatch && [4, 5].includes(this.webinarType)) {
          // 对于观看端 && 点播和回放，所有人都没有文档演示权限
          return false;
        }
        // 当前用户是否演示者
        return this.presenterId == this.userId;
      },
      // 是否显示文档白板工具栏
      showToolbar() {
        // 非定时直播，有演示权限或者是助理角色角色 或者“不在分组内，是主持人角色但是主讲人不是自己”，在普通或全屏模式下,非转播状态，显示工具栏
        return (
          this.webinarMode != 5 &&
          (this.hasDocPermission ||
            [3].includes(this.roleName) ||
            (!this.isInGroup && this.roleName == 1 && this.doc_permission != this.userId)) &&
          ['normal', 'fullscreen'].includes(this.displayMode) &&
          !this.watchInitData.rebroadcast?.isRebroadcasting
        );
      },
      /**
       * @description 是否显示结束演示按钮
       * 1.分组活动下没有嘉宾
       * 2.助理在主房间和小组都只是禁言踢人相关操作
       * 3.主直播间可以邀请演示
       * 4.小组可以邀请自己和别人演示
       * 5.主直播间主持人不结束自己演示,都是结束别人演示
       * 6.小组内主持人结束自己
       * 7.助理不能邀请演示和结束演示(分组没嘉宾)
       */
      renderEndDemonstrateBtn() {
        // 非开播状态不渲染
        if (this.webinarType !== 1) return false;
        // 非分组活动不渲染
        if (this.watchInitData.webinar.mode != 6) return false;
        // 助理不显示
        if (this.watchInitData.join_info.role_name == 3) return false;
        if (this.isInGroup) {
          // 在小组内
          if (
            this.groupInitData.join_role == 1 &&
            this.presenterId != this.groupInitData.doc_permission
          ) {
            return true; // 对于主持人，演示者不是组长的时候显示
          } else if (
            this.groupInitData.join_role == 20 &&
            this.presenterId != this.userId &&
            this.presenterId != this.watchInitData.webinar.userinfo.user_id
          ) {
            return true; // 对于组长，演示者不是自己,也不是主持人的时候显示
          } else if (this.groupInitData.join_role == 2 && this.presenterId == this.userId) {
            return true; // 对于观众，演示者是自己的时候显示
          }
          return false;
        } else {
          // 在主直播间内
          // 如果是主持人，演示人不是自己，说明有人在演示
          if (this.roleName == 1 && this.presenterId != this.userId) {
            return true;
          }
          // 如果不是主持人, 演示者是自己,显示
          if (this.roleName != 1 && this.presenterId == this.userId) {
            return true;
          }
          return false;
        }
      },
      // 是否有翻页操作权限
      hasPager() {
        // 不是文档，不展示翻页操作按钮
        if (this.currentType !== 'document') return false;
        // 定时直播所有人都没有翻页权限
        if (this.webinarMode == 5) return false;
        // 有演示权限，或者助理配有翻页权限 或者 “不在分组内，是主持人角色但是主讲人不是自己“，或者活动设置了有翻页权限(开发状态下)
        return (
          this.hasDocPermission ||
          (this.roleName == 3 && !this.roomBaseServer.state.configList.close_assistant_flip_doc) ||
          (!this.isInGroup && this.roleName == 1 && this.doc_permission != this.userId) ||
          (this.webinarType === 1 && this.roomBaseServer.state.interactToolStatus.is_adi_watch_doc)
        );
      },
      // 当前资料类型是文档还是白板
      currentType() {
        return this.docServer.state.currentCid.split('-')[0];
      },
      // 当前用户的上麦信息
      localSpeaker() {
        return (
          this.$domainStore.state.micServer.speakerList.find(
            item => item.accountId == this.userId
          ) || {}
        );
      },
      // 1：无延迟直播
      isNoDelay() {
        return this.$domainStore.state.roomBaseServer.watchInitData.webinar.no_delay_webinar;
      },
      // 互动无延迟 未上麦观众是否使用类似旁路布局
      isUseNoDelayLayout() {
        return !this.localSpeaker.accountId && this.webinarMode == 3 && this.isNoDelay == 1;
      },
      isHostPermission() {
        const { watchInitData, interactToolStatus } = this.$domainStore.state.roomBaseServer;
        return (
          watchInitData.join_info.role_name == 1 ||
          interactToolStatus.doc_permission == watchInitData.join_info.third_party_user_id
        );
      },
      isGroupLeader() {
        const { groupInitData } = this.$domainStore.state.groupServer;
        return (
          groupInitData.isInGroup &&
          this.watchInitData.join_info.third_party_user_id == groupInitData.doc_permission
        );
      },
      isOpenSplitScreen() {
        return this.$domainStore.state.splitScreenServer.isOpenSplitScreen;
      },
      // 是否开启文档云融屏功能
      isOpenDocStream() {
        /**
         * 开启文档融屏需同时满足一下条件
         * 1.主持人/嘉宾，分组中的组长
         * 2.开启观众可见
         * 3.互动实例初始化成功 || 开启分屏
         * 4.直播中
         * 5.演示文档/白板加载完成（主讲人自己/演示者演示文档）
         * 6.存在文档id
         * 7.开启文档融屏功能
         */
        const docStatus = this.$domainStore.state.docServer.switchStatus && this.docLoadComplete;
        const precondition =
          (this.isHostPermission || this.isGroupLeader) &&
          (this.$domainStore.state.interactiveServer.isInstanceInit || this.isOpenSplitScreen) &&
          this.webinarType == 1 &&
          !!this.watchInitData.interact.channel_id &&
          !!this.$domainStore.state.docServer.currentCid &&
          this.roomBaseServer.state.interactToolStatus.speakerAndShowLayout == 1;

        console.table({
          docStatus,
          precondition,
          isHostPermission: this.isHostPermission,
          isGroupLeader: this.isGroupLeader,
          switchStatus: this.$domainStore.state.docServer.switchStatus,
          isInstanceInit: this.$domainStore.state.interactiveServer.isInstanceInit,
          isOpenSplitScreen: this.isOpenSplitScreen,
          liveStatus: this.webinarType,
          docLoadComplete: this.docLoadComplete,
          channelId: this.watchInitData.interact.channel_id,
          currentCid: this.$domainStore.state.docServer.currentCid,
          speakerAndShowLayout: this.roomBaseServer.state.interactToolStatus.speakerAndShowLayout
        });

        return {
          docStatus,
          precondition
        };
      }
    },
    watch: {
      // 回放的时候
      ['docServer.state.switchStatus'](newval) {
        if (this.isWatch && [4, 5].includes(this.webinarType)) {
          // 如果是回放会点播,文档显示与不显示是切换处理
          if (newval) {
            useRoomBaseServer().setChangeElement('player');
          } else {
            // 文档不可见设置小屏''
            useRoomBaseServer().setChangeElement('');
          }
        }
        if (this.$route?.query.assistantType) {
          cl_docComplete({
            doc_loaded: this.docLoadComplete,
            switch: this.docServer.state.switchStatus
          });
        }
      },
      // 通道变更
      ['docServer.state.isChannelChanged'](newval) {
        console.log('-[doc]---watch频道变更', newval);
        if (newval) {
          if (this.webinarType == 1) {
            this.docServer.state.isChannelChanged = false;
            // 初始化事件
            this.initEvents();
            // 恢复上一次的文档数据;
            this.recoverLastDocs();
          }
        }
      },
      // 大小屏变化
      ['roomBaseServer.state.miniElement'](newval) {
        console.log('-[doc]--大小屏变更miniElement：', newval); // newval 取值 doc, stream-list
        console.log('-[doc]--old displayMode：', this.displayMode);
        const mode = newval === 'doc' ? 'mini' : 'normal';
        this.setDisplayMode(mode);
      },
      // 监听流列表高度变
      ['interactiveServer.state.streamListHeightInWatch']: {
        handler(newval) {
          this.hasStreamList = newval < 1 ? false : true;
        },
        immediate: true
      },
      // 演示者变更时,隐藏缩列图列表
      presenterId() {
        this.thumbnailShow = false;
      },
      // 开启文档云融屏
      isOpenDocStream: {
        handler(newval) {
          // 开启融屏的前置条件是否满足
          if (!newval.precondition) return;
          if (newval.docStatus) {
            console.log('open-doc-yun-stream');
            this.openDocYunStream();
          } else {
            console.log('close-doc-yun-stream');
            this.closeDocYunStream();
          }
        },
        immediate: true
      }
    },
    beforeCreate() {
      this.desktopShareServer = useDesktopShareServer();
      this.roomBaseServer = useRoomBaseServer();
      this.docServer = useDocServer();
      this.groupServer = useGroupServer();
      this.interactiveServer = useInteractiveServer();
      this.memberServer = useMemberServer();
      this.micServer = useMicServer();
      this.splitScreenServer = useSplitScreenServer();
    },
    created() {
      window.addEventListener('keydown', this.listenKeydown);
    },
    methods: {
      // 开启文档云融屏
      openDocYunStream() {
        if (this.isOpenSplitScreen) {
          this.splitScreenServer.openDocCloudStreamEvent();
        } else {
          this.interactiveServer.openDocCloudStream();
        }
      },
      closeDocYunStream() {
        if (this.isOpenSplitScreen) {
          this.splitScreenServer.closeDocCloudStreamEvent();
        } else {
          this.interactiveServer.closeDocCloudStream();
        }
      },
      /**
       * 全屏切换
       */
      fullscreen() {
        if (this.$route?.query.assistantType) {
          this.displayMode = this.displayMode == 'fullscreen' ? 'normal' : 'fullscreen';
          cl_handleScreen(this.displayMode);
        } else {
          screenfull.toggle(this.$refs.docWrapper);
        }
      },
      /**
       * 缩略图列表展开与折叠
       */
      toggleThumbnail() {
        if (this.thumbnailShow) {
          this.thumbnailShow = false;
        } else {
          if (this.currentCid == this.docServer.state.docCid && this.docServer.state.docCid) {
            this.thumbnailShow = true;
            this.docServer.getCurrentThumbnailList();
          }
        }
      },
      /**
       * 设置文档的展示模式
       * @param {String} mode
       * normal-常规模式, mini-小屏模式, fullscreen-全屏模式
       */
      async setDisplayMode(mode) {
        console.log('[doc] setDisplayMode:', mode);
        if (!['normal', 'mini', 'fullscreen'].includes(mode)) {
          console.error('展示模式必须是normal, mini, fullscreen中的一个');
          return;
        }
        if (this.displayMode === mode) {
          console.log(`[doc] 当前已经是${mode}模式，无需设置`);
          return;
        }
        //缩略图列表隐藏
        this.thumbnailShow = false;

        if (this.displayMode === 'fullscreen') {
          // 全屏模式转其它模式
          this.fullscreen();
          screenfull.targetMode = mode;
        } else if (mode === 'fullscreen') {
          // 其它模式转全屏模式
          this.fullscreen();
        } else {
          // 非全屏模式互转
          this.displayMode = mode;
        }
        await this.$nextTick();
        // PC端文档大小的改变，会自动触发 erd.listenTo 事件;
        this.resize();
      },
      /**
       * 屏幕缩放
       */
      resize() {
        let { width, height } = this.getDocViewRect();
        if (!width || !height) {
          console.error(`[doc] resize 获取容器宽高异常width=${width},height=${height}`);
          return;
        }
        if (
          (document.getElementById(this.docServer.state.docCid) &&
            document.getElementById(this.docServer.state.docCid).childNodes.length) ||
          (document.getElementById(this.docServer.state.boardCid) &&
            document.getElementById(this.docServer.state.boardCid).childNodes.length)
        ) {
          try {
            this.docServer.setSize(width, height);
          } catch (ex) {
            console.error('[doc] setSize:', ex);
          }
        }
      },
      getDocViewRect() {
        let rect = { width: 0, height: 0 };
        if (this.isWatch) {
          // 观看端
          if (this.displayMode === 'mini') {
            // 小屏
            rect = {
              width: 360,
              height: 204
            };
          } else {
            // 大屏
            rect = this.$refs.docWrapper?.getBoundingClientRect();
          }
        } else {
          // 发起端
          if (this.displayMode === 'mini') {
            // 小屏
            rect = {
              width: 309,
              height: 240
            };
          } else {
            // 大屏
            rect =
              this.displayMode === 'fullscreen'
                ? this.$refs.docWrapper?.getBoundingClientRect()
                : this.$refs.docContent?.getBoundingClientRect();
          }
        }
        if (rect.width === 0) {
          const parentNode = this.$refs.docWrapper.parentNode;
          if (parentNode) {
            const cWidth = parseFloat(window.getComputedStyle(parentNode).width);
            rect = {
              width: cWidth,
              height: (cWidth / 16) * 9
            };
          }
        }
        if (!rect.width || !rect.height) return rect;
        const { width, height } = rect;
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
        return { width: w, height: h };
      },
      /**
       * 初始化各种事件
       */
      initEvents() {
        if (this.isWatch) {
          // 观看端事件
          // 点播或回放播放器播放完成
          usePlayerServer().$on(VhallPlayer.ENDED, () => {
            console.log('[doc] VhallPlayer.ENDED');
            // 4-点播， 5-回放
            if ([4, 5].includes(this.webinarType)) {
              // 设置文档不可见
              this.docServer.state.switchStatus = false;
            }
          });
        }
        // 直播开始
        this.docServer.$on('live_start', this.liveStart);
        // 直播结束
        this.docServer.$on('live_over', this.liveOver);

        const reBroadcastServer = useRebroadcastServer();
        // 转播开始事件
        reBroadcastServer.$on('live_broadcast_start', () => {
          // 文档角色设置成观众
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
            // 设置文档角色 （观众不需要设置，观众的文档角色没有变化）
            if (this.hasDocPermission) {
              // 如果当前人拥有直播间文档操作权限，设为 HOST 角色
              this.docServer.setRole(VHDocSDK.RoleType.HOST);
            } else if (this.roleName == 3) {
              // 助理
              this.docServer.setRole(VHDocSDK.RoleType.ASSISTANT);
            } else if (this.roleName == 4) {
              // 嘉宾
              this.docServer.setRole(VHDocSDK.RoleType.GUEST);
            }
            this.docServer.setPlayMode(VHDocSDK.PlayMode.INTERACT);
            this.recoverLastDocs();
          }, 1000);
        });

        // 监控文档区域大小改变事件
        let erd = elementResizeDetectorMaker();
        erd.listenTo(this.$refs.docWrapper, throttle(this.resize, 200));

        // 全屏/退出全屏事件
        screenfull.onchange(ev => {
          // console.log('[doc] screenfull.isFullscreen:', screenfull);
          if (ev.target.id !== 'docWrapper') return;
          if (screenfull.isFullscreen) {
            this.thumbnailShow = false;
            this.displayMode = 'fullscreen';
          } else {
            this.displayMode = screenfull.targetMode || 'normal';
          }
        });

        this.docServer.$on('dispatch_doc_page_change', this.dispatchDocPageChange);

        // 文档不存在或已删除
        this.docServer.$on('dispatch_doc_not_exit', this.dispatchDocNotExit);

        if (this.$route?.query.assistantType) {
          // 当前文档加载完成
          this.docServer.$on('dispatch_doc_load_complete', () => {
            cl_docComplete({
              doc_loaded: this.docLoadComplete,
              switch: this.docServer.state.switchStatus
            });
          });

          clientMsgApi.onQtCallFunctionPage(msg => {
            // 客户端请求获取文档云渲染相关参数事件
            if (msg === 1 || msg === 2 || msg === 15) {
              cl_docComplete({
                doc_loaded: this.docLoadComplete,
                switch: this.docServer.state.switchStatus
              });
            }
          });
        }
      },

      listenKeydown(e) {
        if (!this.hasPager) return;
        if ([33, 37, 38].includes(e.keyCode)) {
          // 向上翻页
          this.handlePage('prevStep');
        } else if ([34, 39, 40].includes(e.keyCode)) {
          // 向下翻页
          this.handlePage('nextStep');
        }
      },
      /**
       *  刷新或者退出重进恢复上次的文档
       */
      recoverLastDocs: async function () {
        console.log('[doc] 刷新或者退出重进恢复上次的文档');
        if (!this.docLoadComplete) return;
        this.docServer.setDocLoadComplete(false);
        try {
          // 获取容器列表
          await this.docServer.getContainerList();
        } catch (ex) {
          console.error('获取容器列表数据失败：', ex);
          this.docServer.setDocLoadComplete();
        }
        console.log('[doc] recoverLastDocs containerList:', this.docServer.state.containerList);
        if (this.docServer.state.containerList.length === 0) {
          // 没有文档
          this.docServer.setDocLoadComplete();
          // 通知默认菜单和工具栏默认为文档
          window.$middleEventSdk?.event?.send(
            boxEventOpitons(this.cuid, 'emitSwitchTo', ['document'])
          );
          return;
        }
        // 确定文档最外层节点显示，并且文档dom绑定ID成功
        await this.$nextTick();
        // 初始化文档最外层节点大小
        const { width, height } = this.getDocViewRect();
        if (!width || !height) {
          console.error(`[doc] recoverLastDocs 获取容器宽高异常width=${width},height=${height}`);
          this.docServer.setDocLoadComplete();
          return;
        }
        await this.docServer.recover({
          width,
          height
        });

        if (this.roomBaseServer.state.watchInitData.join_info.role_name != 2) {
          const fileType = this.currentType || 'document';
          if (this.$route.query.assistantType) {
            cl_setDocMenu(fileType == 'document' ? 1 : 0);
          } else {
            window.$middleEventSdk?.event?.send(
              boxEventOpitons(this.cuid, 'emitSwitchTo', [fileType])
            );
          }
        }
      },
      /**
       * 切换到 文档还是白板
       * @param fileType:文档：document， 白板：board
       */
      async switchTo(fileType) {
        console.log('[doc] doc-une 切换到。。。:', fileType);
        this.docServer.setDocLoadComplete(true);
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
            // 白板不存在
            if (this.isInGroup) {
              // 小组中演示白板，需要调一下设置观众可见，否则生成的小组回放视频看不见白板
              this.docServer.setSwitchStatus(true);
            }
            // 自动新建一个
            this.docServer.addNewFile({ fileType: 'board' });
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
        console.log(`[doc] 演示文档:docId=${docId};docType=${docType};switchStatu:${switchStatus}`);
        this.docServer.setDocLoadComplete(false);
        this.docServer.setSwitchStatus(switchStatus);

        for (const item of this.docServer.state.containerList) {
          if (String.prototype.startsWith.call(item.cid, 'document')) {
            // 文档容器删除
            console.log('[doc] 删除文档容器：', item.cid);
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
        await this.docServer.addNewFile({ fileType: 'document', docId, docType });
      },
      /**
       * 页面操作工具
       * @param {*} e
       */
      handlePage(e) {
        if (!this.docServer.state.currentCid || this.docServer.state.currentCid === 'board') {
          return;
        }
        let type;
        if (e === 'prevStep' || e === 'nextStep') {
          // 键盘翻页调用
          type = e;
        } else {
          if (e.target.nodeName === 'UL') return;
          type =
            e.target.dataset.value ||
            e.target.parentNode.dataset.value ||
            e.target.parentNode.parentNode.dataset.value ||
            null;
        }
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
          // 放大、缩小、还原操作会自动开启可移动功能（sdk逻辑）
          // 放大
          case 'zoomIn':
            this.docServer.zoomIn();
            this.$refs.docToolbar.setBrush('move');
            this.canMove = true;
            break;
          // 缩小
          case 'zoomOut':
            this.docServer.zoomOut();
            this.$refs.docToolbar.setBrush('move');
            this.canMove = true;
            break;
          // 还原
          case 'zoomReset':
            this.docServer.zoomReset();
            this.$refs.docToolbar.setBrush('move');
            this.canMove = true;
            break;
          // 移动
          case 'move':
            if (this.canMove) {
              if (this.hasDocPermission) {
                this.$refs.docToolbar.changeTool(this.$refs.docToolbar.lastEditBrush);
              } else {
                this.$refs.docToolbar.changeTool('');
              }
            } else {
              this.$refs.docToolbar.changeTool('move');
            }
            break;
          // 全屏
          case 'fullscreen':
            this.fullscreen();
            break;
        }
      },

      /**
       * 画笔工具变更
       * @param {*} brush
       */
      changeBrush(brush) {
        this.canMove = brush === 'move';
      },

      /**
       * 重新设置当前画笔
       */
      resetCurrentBrush() {
        this.$refs.docToolbar.resetCurrentBrush();
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
      },

      /**
       * 结束演示
       * 1.观众演示时，组长和主持人都可以结束演示
       * 2.主持人在小组中自己演示时，只有自己可以结束演示
       */
      async handleEndDemonstrate() {
        // 在主直播间
        let confirmTip = '结束演示?';
        if (this.presenterId == this.userId) {
          // 如果演示者是自己，自己结束自己的演示
          confirmTip = '结束演示后将不能再使用白板、文档、桌面共享功能， 确认结束演示？';
        } else if (this.isInGroup && this.groupServer.state.groupInitData.join_role == 20) {
          // 如果是组长结束观众的演示
          confirmTip = '是否结束演示?';
        }
        try {
          await this.$confirm(confirmTip, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            customClass: 'zdy-message-box',
            cancelButtonClass: 'zdy-confirm-cancel'
          });
          if (this.hasDocPermission) {
            console.log('结束自己的演示');
            // 结束自己的演示
            const result = await this.memberServer.userEndPresentation({
              room_id: this.roomBaseServer.state.watchInitData.interact.room_id
            });
            if (result && result.code == 200) {
              const isGroupMember = this.groupServer.state.groupInitData.join_role == 2;
              const isShowMessageOnGroup = this.isInGroup && isGroupMember;

              const isMainMember = this.roleName == 2;
              const isShowMessageOnMain = !this.isInGroup && isMainMember;
              if (isShowMessageOnGroup || isShowMessageOnMain) {
                // 如果是观众结束了自己的演示
                this.$message({
                  message: '结束演示',
                  showClose: true,
                  type: 'success',
                  customClass: 'zdy-info-box'
                });
              }
            }
          } else {
            // 结束他人的演示
            console.log('结束他人的演示');
            const result = await this.memberServer.endUserPresentation({
              room_id: this.roomBaseServer.state.watchInitData.interact.room_id,
              receive_account_id: this.isInGroup
                ? this.groupServer.state.groupInitData.presentation_screen
                : this.roomBaseServer.state.interactToolStatus.presentation_screen
            });
            if (result && result.code == 200) {
              if (this.groupServer.state.groupInitData.join_role == 20 && this.isInGroup) {
                // 如果是组长结束了观众的演示
                this.$message({
                  message: '结束演示',
                  showClose: true,
                  type: 'success',
                  customClass: 'zdy-info-box'
                });
              }
            }
          }
        } catch (ex) {
          return;
        }
      },
      // 翻页
      dispatchDocPageChange() {
        if (!this.isWatch) {
          if (this.$refs.docToolbar.currentBrush === 'eraser') {
            // 翻页后sdk会会变橡皮擦设置成move,这个延迟1s重置当前笔刷
            setTimeout(() => {
              this.resetCurrentBrush();
            }, 1000);
          }
        }
      },
      // 文档不存在或已删除
      dispatchDocNotExit() {
        this.$message({ type: 'error', message: '文档不存在或已删除' });
      },

      // 直播开始
      liveStart() {
        // 3-助理，4-嘉宾
        if ([3, 4].includes(this.roleName)) {
          this.recoverLastDocs();
        }
      },

      // 直播结束
      liveOver() {
        if (this.isWatch) {
          useRoomBaseServer().setChangeElement('doc');
        } else {
          if (this.$route.query.assistantType) {
            return;
          }
          this.setDisplayMode('normal');
          // 通知默认菜单和工具栏默认为文档
          window.$middleEventSdk?.event?.send(
            boxEventOpitons(this.cuid, 'emitSwitchTo', ['document'])
          );
        }
        this.hasStreamList = false;
      },

      mouseEnterDoc(status) {
        if (this.$route.query.assistantType) {
          cl_moveToDoc(status);
        }
      }
    },
    mounted() {
      console.log('[doc] doc mounted');
      // 初始化文档server的getDocViewRect方法
      this.docServer.getDocViewRect = this.getDocViewRect;

      // 初始化事件
      this.initEvents();

      if (this.webinarType == 1 || !this.isWatch) {
        // 发起端和直播中的观看端执行,恢复上一次的文档数据;
        this.$nextTick(() => {
          this.recoverLastDocs();
        });
      } else {
        // 非直播状态，主持人默认选中文档
        if (this.roleName == 1) {
          window.$middleEventSdk?.event?.send(
            boxEventOpitons(this.cuid, 'emitSwitchTo', ['document'])
          );
        }
      }
    },
    beforeDestroy() {
      this.docServer.$off('dispatch_doc_page_change', this.dispatchDocPageChange);
      this.docServer.$off('dispatch_doc_not_exit', this.dispatchDocNotExit);
      this.docServer.$off('live_start', this.liveStart);
      this.docServer.$off('live_over', this.liveOver);
      window.removeEventListener('keydown', this.listenKeydown);
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
      background-color: #292929;
    }

    // 发起端结束演示按钮
    .end-demonstrate {
      position: absolute;
      z-index: 3;
      top: 10px;
      right: 20px;
      background: transparent;
      border-radius: 97px;
      border: 1px solid #dadada;
      color: #fff;
      cursor: pointer;
      &:hover {
        background: #fb3a32;
        border-color: #fb3a32;
        color: #fff;
      }
      &:focus {
        color: #fff;
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

        // 不显示图片还未加载时的白边（设置border无效）
        img[src=''],
        img:not([src]) {
          opacity: 0;
        }
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
          color: #fb3a32;
        }
      }
      .doc-pagebar__opt {
        padding: 7px 10px;
        &:hover {
          color: #fb3a32;
          cursor: pointer;
        }

        &.selected {
          color: #fb3a32;
          cursor: pointer;
        }
      }
    }

    .vmp-doc-thumbnailbar {
      position: absolute;
      top: 0;
      bottom: 0;
      right: 0;
      width: 144px;
      background-color: rgba(0, 0, 0, 0.8);
      display: flex;
      flex-direction: column;
      align-items: center;
      overflow-y: auto;

      &::-webkit-scrollbar {
        width: 6px;
        height: 6px;
        border-radius: 0;
        background-color: transparent;
      }
      &::-webkit-scrollbar-track {
        background-color: transparent;
      }

      &::-webkit-scrollbar-thumb {
        height: 60px;
        border-radius: 10px;
        border: 1px solid #666;
        background: #666 !important;
      }

      li.doc-thumbnailbar__opt {
        height: 63px;
        width: 110px;
        margin-top: 15px;
        position: relative;

        &.selected {
          box-shadow: 0 0 0 2px #fb3a32;
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
      position: absolute;
      bottom: 50px;
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

      .vmp-brush-popup {
        position: absolute;
        top: auto;
        left: 0;
        bottom: 37px;
        padding-top: 4px;
      }
    }
    .vmp-icon-item--exitFullscreen {
      display: block;
    }
  }

  // 作为观看端时的样式
  .vmp-doc-une.is-watch {
    background-color: #2d2d2d;
    // 普通模式
    &.vmp-doc-une--normal {
      position: absolute;
      top: 0;
      bottom: 56px;
      width: calc(100% - 380px);
      height: auto;
      min-height: auto;
      &.vmp-doc-une--embed {
        width: calc(100% - 360px);
      }
    }
    // 观看端结束演示按钮
    .end-demonstrate {
      position: absolute;
      z-index: 3;
      top: 27px;
      right: 20px;
      background: rgba(0, 0, 0, 0.6);
      border-radius: 97px;
      border: 1px solid #666;
      color: #fff;
      cursor: pointer;
      &:hover {
        background: #fb3a32;
        border-color: #fb3a32;
        color: #fff;
      }
    }

    &.vmp-doc-une--normal.has-stream-list {
      top: 80px;
    }
    &.vmp-doc-une--normal.no-delay-layout {
      top: 0px;
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

  // 回放有文档时自动生成的div，用于文档sdk存储回放数据
  #myVodNode {
    height: 0 !important;
  }
</style>

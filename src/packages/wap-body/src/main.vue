<template>
  <div
    class="vmp-wap-body"
    :class="[
      wapBodyClass,
      isShowWapBody ? '' : 'vmp-wap-body__hide',
      isPortraitLive ? 'isPortraitLive' : '',
      isStreamContainerStickTop ? 'vmp-wap-body-container-sticktop' : '',
      isPortraitLive && !isWapBodyDocSwitchFullScreen && !embedVideo ? 'isMini' : ''
    ]"
  >
    <!-- 直播结束 -->
    <div
      v-if="isLivingEnd && !isPortraitLive && !embedVideo"
      :class="`vmp-wap-body-ending ending_bg_${imageCropperMode}`"
      :style="`backgroundImage: url('${webinarsBgImg}')`"
    >
      <div class="vmp-wap-body-ending-box">
        <div class="vmp-wap-body-ending-box-img">
          <img src="./img/livingEnd@2x.png" alt="" />
        </div>
        <h1 class="vmp-wap-body-ending-box-text">
          {{ isRehearsal ? $t('player.player_1027') : $t('player.player_1017') }}
        </h1>
      </div>
    </div>
    <div
      :class="[
        (mini || (isPortraitLive && !isWapBodyDocSwitchFullScreen)) && !embedVideo
          ? 'vmp-wap-body-mini'
          : 'vmp-wap-body-nomarl',
        (isShareScreen || (isOpenInsertFile && !isAudio)) && !isMergeMode
          ? 'vmp-wap-body-special__show'
          : '',
        isStreamContainerStickTop ? 'vmp-wap-body-sticktop' : '',
        isStreamContainerStickTop && !isWapBodyDocSwitchFullScreen
          ? 'vmp-wap-body-sticktop__hide'
          : '',
        `${rotateNum ? 'rotate' + rotateNum : ''}`
      ]"
      v-if="!(isLivingEnd && isPortraitLive)"
      v-drag="{ close: !(mini || !isWapBodyDocSwitchFullScreen) }"
      :style="{
        'z-index':
          isStreamContainerStickTop && !isWapBodyDocSwitchFullScreen
            ? -1
            : isStreamContainerStickTop
            ? playerZIndex
            : mini && !isPortraitLive
            ? 5000
            : mini || (isPortraitLive && !isWapBodyDocSwitchFullScreen)
            ? 302
            : 'auto'
      }"
    >
      <!-- 播放器 -->
      <vmp-air-container
        :cuid="childrenComp[0]"
        :oneself="true"
        v-if="!isShowContainer && !isLivingEnd"
      ></vmp-air-container>

      <!-- 流列表 -->
      <vmp-air-container
        v-show="isShowContainer && !isLivingEnd"
        :cuid="childrenComp[1]"
        :oneself="true"
      ></vmp-air-container>

      <!-- wap端订阅桌面共享的容器 -->
      <vmp-air-container :cuid="childrenComp[2]" :oneself="true" v-show="!isLivingEnd" />

      <!-- wap端订阅插播的容器 -->
      <vmp-air-container :cuid="childrenComp[3]" :oneself="true" v-show="!isLivingEnd" />

      <!-- wap 合并模式下的融屏文档 -->
      <div
        v-if="isMergeMode"
        v-show="isDocMainScreen"
        class="vmp-wap-doc-main-screen"
        :class="{
          'doc-hidden': isShareScreen || (isOpenInsertFile && !isAudio) || mini,
          'vmp-wap-doc-main-screen-top': !this.isSpeakOn
        }"
      >
        <vmp-air-container :oneself="true" :cuid="childrenComp[4]"></vmp-air-container>
      </div>
      <!--
        注意：
          由于互动组件监听的互动的各种消息，包含同意上麦，监听后进行上麦操作
            此处不能用v-if
       -->
      <!-- h5连麦，大窗情况下，在麦上 + 未展示过滑动提示，展示遮罩层-->
      <masksliding v-if="!mini"></masksliding>
    </div>
    <!-- 弹出直播提醒 -->
    <alertBox
      v-if="isShowLiveStartNotice"
      :title="''"
      :isShowClose="false"
      :titleBtn="$t('player.player_1013')"
      @authClose="startWatch"
      @authSubmit="startWatch"
    >
      <div slot="content" class="vmp-wap-body_living">
        <span class="living-img">
          <img src="./img/live_start.png" alt="" />
        </span>
        <p class="living-text">{{ $t('appointment.appointment_1033') }}</p>
      </div>
    </alertBox>
  </div>
</template>
<script>
  import {
    useMsgServer,
    useGroupServer,
    useRoomBaseServer,
    useMediaCheckServer,
    useMicServer,
    useInteractiveServer,
    useMenuServer,
    useZIndexServer
  } from 'middle-domain';
  import move from './js/move';
  import masksliding from './components/mask.vue';
  import { boxEventOpitons, parseImgOssQueryString } from '@/app-shared/utils/tool.js';
  import { cropperImage } from '@/app-shared/utils/common';
  import alertBox from '@/app-shared/components/confirm.vue';
  export default {
    name: 'VmpWapBody',
    components: {
      alertBox,
      masksliding
    },
    mixins: [move],
    data() {
      return {
        childrenComp: [],
        imageCropperMode: 1,
        isLivingEnd: false,
        mini: false,
        isShowLiveStartNotice: false,
        isStreamContainerStickTop: false, // 视频流容器是否吸顶（问卷弹窗的时候）
        rotateNum: 0,
        playerZIndex: 302 // 默认问卷推送时，播放器吸顶的index
      };
    },
    computed: {
      // 是否是彩排
      isRehearsal() {
        return this.$domainStore.state.roomBaseServer.watchInitData.live_type == 2;
      },
      // 选中的自定义菜单的 type
      menuSelectedType() {
        return this.$domainStore.state.menuServer.selectedType;
      },
      isOpenInsertFile() {
        return this.$domainStore.state.insertFileServer.insertStreamInfo.streamId;
      },
      // 是否是音频插播
      isAudio() {
        return !this.$domainStore.state.insertFileServer.insertStreamInfo.has_video;
      },
      isShareScreen() {
        return this.$domainStore.state.desktopShareServer.localDesktopStreamId;
      },
      isShowWapBody() {
        // 如果播放器储与mini状态，必显示
        if (this.mini) return true;
        // 如果文档和播放器切换并且自定义菜单选中的不是文档
        if (this.isWapBodyDocSwitch) {
          return this.menuSelectedType == 2;
        }
        return true;
      },
      isSmallPlayer() {
        return this.$domainStore.state.playerServer.isSmallPlayer;
      },
      wapBodyClass() {
        let className = '';
        // showHeader: 是否展示顶部header组件，控制台配置
        // isWapBodyDocSwitch: wapBody 和 文档组件是否切换位置
        // isSmallPlayer: 音频播放器是否缩小
        // mini: 播放器是否是mini状态（打开问卷）
        if (this.mini) return '';
        if (this.showHeader && this.isWapBodyDocSwitch) {
          className = 'vmp-wap-body__bottom';
          if (this.isSmallPlayer) {
            className += ' vmp-wap-body__bottom__small';
          }
          return className;
        }
        if (!this.showHeader && this.isWapBodyDocSwitch) {
          className = 'vmp-wap-body__bottom-noheader';
          if (this.isSmallPlayer) {
            className += ' vmp-wap-body__bottom-noheader__small';
          }
          return className;
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
      // 竖屏直播下 文档和播放器是否互换位置。 默认 文档主画面，播放器小屏 false
      isWapBodyDocSwitchFullScreen() {
        return this.$domainStore.state.roomBaseServer.isWapBodyDocSwitchFullScreen;
      },
      isInGroup() {
        // 在小组中
        return this.$domainStore.state.groupServer.groupInitData?.isInGroup;
      },
      isShowContainer() {
        return (
          !this.$domainStore.state.interactiveServer.initInteractiveFailed &&
          (this.$domainStore.state.roomBaseServer.watchInitData.webinar.no_delay_webinar == 1 ||
            this.$domainStore.state.micServer.isSpeakOn) &&
          this.$domainStore.state.roomBaseServer.watchInitData.webinar.type == 1
        );
      },
      webinarsBgImg() {
        const cover = 'https://cnstatic01.e.vhall.com/static/img/mobile/video_default_nologo.png';
        const img_url = this.$domainStore.state.roomBaseServer.watchInitData.webinar.img_url;
        if (img_url) {
          if (cropperImage(img_url)) {
            this.handlerImageInfo(img_url);
            return img_url;
          } else {
            return `${img_url}?x-oss-process=image/resize,m_fill,w_828,h_466`;
          }
        } else {
          return cover;
        }
      },
      // 主持人ID 分组期间使用
      userinfoId() {
        return this.$domainStore.state.roomBaseServer.watchInitData?.webinar?.userinfo.user_id;
      },
      // 活动状态（2-预约 1-直播 3-结束 4-点播 5-回放）
      webinarType() {
        return Number(this.roomBaseServer.state.watchInitData.webinar.type);
      },
      isSpeakOn() {
        return this.$domainStore.state.micServer.isSpeakOn;
      },
      isMergeMode() {
        return this.$domainStore.state.roomBaseServer.interactToolStatus.speakerAndShowLayout == 1;
      },
      // 是否开启文档主画面
      isDocMainScreen() {
        return (
          this.$domainStore.state.docServer.switchStatus &&
          this.$domainStore.state.interactiveServer.isInstanceInit &&
          this.webinarType == 1 &&
          !!this.$domainStore.state.docServer.currentCid &&
          this.isMergeMode
        );
      },
      // 竖屏直播
      isPortraitLive() {
        return (
          this.$domainStore.state.roomBaseServer.watchInitData?.webinar?.webinar_show_type == 0
        );
      },
      // 是不是单视频嵌入页
      embedVideo() {
        return this.$domainStore.state.roomBaseServer.embedObj.embedVideo;
      }
    },
    watch: {
      webinarsBgImg: {
        handler(val) {
          this.$nextTick(() => {
            window.$middleEventSdk?.event?.send(
              boxEventOpitons(this.cuid, 'emitPlayerWebinarsBgImg', [val])
            );
          });
        },
        immediate: true
      },
      isLivingEnd: {
        handler(val) {
          this.$nextTick(() => {
            window.$middleEventSdk?.event?.send(
              boxEventOpitons(this.cuid, 'emitPlayerLivingEnd', [val])
            );
          });
        },
        immediate: true
      }
    },
    beforeCreate() {
      this.msgServer = useMsgServer();
      this.groupServer = useGroupServer();
      this.roomBaseServer = useRoomBaseServer();
      this.interactiveServer = useInteractiveServer();
      this.menuServer = useMenuServer();
      this.zIndexServer = useZIndexServer();
    },
    async created() {
      if (this.$domainStore.state.roomBaseServer.watchInitData.webinar.type == 3) {
        this.isLivingEnd = true;
      }
      if (
        this.$domainStore.state.interactiveServer.mobileOnWheat &&
        this.$domainStore.state.roomBaseServer.watchInitData.webinar.type == 1
      ) {
        await this.$dialog.alert({
          title: this.$t('account.account_1061'),
          confirmButtonText: this.$t('common.common_1010'),
          message: this.$t('other.other_1009')
        });
        await this.checkMediaPermission('isUseMic');
      }
      if (this.isInGroup && this.webinarType == 1) {
        let report_data = this.roomBaseServer.state.watchInitData.report_data.vid;
        this.gobackHome(1, this.groupServer.state.groupInitData.name, { sender_id: report_data });
      }
      this.childrenComp = window.$serverConfig[this.cuid].children;
    },
    mounted() {
      this.listenEvents();
    },
    methods: {
      startWatch() {
        location.reload();
      },
      questionnaireVisible(flag) {
        if (this.isPortraitLive) {
          this.isStreamContainerStickTop = flag;
          if (flag) {
            this.playerZIndex = this.zIndexServer.state.zIndexMap['questionnaire'] || 302;
          }
        } else {
          this.mini = flag;
        }
      },
      examVisible(flag, indexKey) {
        if (this.isPortraitLive) {
          this.isStreamContainerStickTop = flag;
          if (flag) {
            this.playerZIndex = this.zIndexServer.state.zIndexMap[indexKey] || 302;
          }
        } else {
          // this.mini = flag;
        }
      },
      listenEvents() {
        // 开启分组讨论
        this.groupServer.$on('GROUP_SWITCH_START', msg => {
          if (this.isInGroup) {
            // 如果问卷在展开中了，并且进入分组中 mini置为false
            this.mini = false;
            this.gobackHome(1, this.groupServer.state.groupInitData.name, msg);
          }
        });

        // 切换小组,小组人员变动
        this.groupServer.$on('GROUP_JOIN_CHANGE', (msg, changeInfo) => {
          if (changeInfo.isNeedCare && this.isInGroup) {
            this.gobackHome(2, this.groupServer.state.groupInitData.name, msg);
          }
        });

        // 结束分组讨论     groupToast为开发自行增加，为true代表是走到 不提醒 的处理
        this.groupServer.$on('GROUP_SWITCH_END', msg => {
          if (!msg.data.groupToast) {
            this.gobackHome(3, this.groupServer.state.groupInitData.name, msg);
          }
        });

        // 小组解散
        this.groupServer.$on('GROUP_DISBAND', msg => {
          this.gobackHome(4, '', msg);
        });

        // 本人被踢出来
        this.groupServer.$on('ROOM_GROUP_KICKOUT', msg => {
          const { watchInitData } = useRoomBaseServer().state;
          // 如果已经开启了讨论，而且被踢出的人是自己
          if (
            this.groupServer.state.groupInitData.switch_status == 1 &&
            msg.data.target_id === watchInitData.join_info.third_party_user_id
          ) {
            this.gobackHome(5, this.groupServer.state.groupInitData.name, msg);
          }
        });

        // 组长变更
        this.groupServer.$on('GROUP_LEADER_CHANGE', msg => {
          if (this.isInGroup && msg.data.original_account_id) {
            this.gobackHome(7, '', msg);
          }
        });

        // 监听消息移动
        this.msgServer.$onMsg('ROOM_MSG', msg => {
          // live_start 开始直播
          if (msg.data.type == 'live_start' && this.isRehearsal) {
            this.isShowLiveStartNotice = true;
          }
          // live_over 结束直播
          if (msg.data.type == 'live_over') {
            this.isLivingEnd = true;
            this.mini = false;
            // this.$domainStore.state.roomBaseServer.isWapBodyDocSwitchFullScreen = true;
          }
          // 分组直播 没有结束讨论 直接结束直播
          if (msg.data.type == 'group_switch_end') {
            if (msg.data.over_type) {
              this.isLivingEnd = true;
            }
          }
        });
      },
      // isUseMic：是否调用上麦接口[ 只有在刷新时，才会执行上麦 ]
      async checkMediaPermission(isUseMic) {
        let _flag = await useMediaCheckServer().getMediaInputPermission({ isNeedBroadcast: false });
        if (_flag) {
          if (isUseMic) {
            let res = await useMicServer().userSpeakOn();
            if (res.code == 200) {
              await this.resetInteractive();
            }
          } else {
            await this.resetInteractive();
          }
        } else {
          this.$toast(this.$t('interact.interact_1040'));
        }
      },
      // 解析图片地址
      handlerImageInfo(url) {
        let obj = parseImgOssQueryString(url);
        this.imageCropperMode = Number(obj.mode);
        this.$nextTick(() => {
          window.$middleEventSdk?.event?.send(
            boxEventOpitons(this.cuid, 'emitPlayerImageCropperMode', [this.imageCropperMode])
          );
        });
      },
      // 重置互动SDK实例
      async resetInteractive() {
        await this.interactiveServer.destroy();
        await this.interactiveServer.init({ role: VhallRTC.ROLE_HOST });
      },
      // 返回主房间提示
      async gobackHome(index, name, msg) {
        // 1 主持人    3 助理
        const who = msg.sender_id == this.userinfoId ? this.$getRoleName(1) : this.$getRoleName(3);
        const isSwitchEnd = msg.data?.type == 'group_switch_end';
        let title = '';
        switch (index) {
          case 1:
            title = who + '开启了分组讨论，您将进入' + name + '组参与讨论';
            break;
          case 2:
            title = who + '已将您分配至' + name + '组';
            break;
          case 3:
            title = `${who}${isSwitchEnd ? '结束' : '暂停'}了分组讨论，您将返回主直播间`;
            break;
          case 4:
            title = who + '解散了分组，您将返回主直播间';
            break;
          case 5:
            title = '您已被踢出该小组';
            break;
          case 7:
            title = '组长身份已变更';
            break;
        }
        if (index == 5 || index == 7) {
          this.$toast(title);
        } else {
          await this.$dialog.alert({
            title: this.$t('account.account_1061'),
            confirmButtonText: this.$t('common.common_1010'),
            message: title
          });
        }
        // 分组内的小组切换 -> 会自动重置互动初始化 -> 查看当前是否需要自动上麦 ====> 仅需判断可获取权限+未检测设备
        if (
          this.$domainStore.state.interactiveServer.mobileOnWheat &&
          useMediaCheckServer().state.deviceInfo.device_status == 0 &&
          index != 7
        ) {
          // 此时调用完，设备状态要么是1  要么是2
          await this.checkMediaPermission();
        }
      },
      // 竖屏旋转播放器
      rotatePlayer(deg) {
        if (this.isPortraitLive) {
          this.rotateNum = deg;
        }
      }
    }
  };
</script>
<style lang="less">
  @desk-w: 597px;
  @desk-h: 337px;
  .vmp-wap-body {
    position: relative;
    height: 100%;
    &__bottom {
      position: fixed;
      left: 0;
      top: 573px;
      width: 100%;
      height: 422px;
      z-index: 1;
      overflow: hidden;
      &__small {
        height: 130px;
      }
    }
    &__bottom-noheader {
      position: fixed;
      left: 0;
      top: 502px;
      width: 100%;
      height: 422px;
      z-index: 1;
      overflow: hidden;
      &__small {
        height: 130px;
      }
    }
    &__hide {
      z-index: -1;
      opacity: 0;
    }
    &-ending {
      background-repeat: no-repeat;
      background-size: 100% 100%;
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
      z-index: 20;
      &.ending_bg_2 {
        background-size: cover;
        background-position: left top;
      }
      &.ending_bg_3 {
        background-size: contain;
      }
      &-box {
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.6);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        &-img {
          width: 141px;
          height: 104px;
          img {
            width: 100%;
            height: 100%;
            object-fit: scale-down;
          }
        }
        &-text {
          font-size: 28px;
          line-height: 50px;
          height: 50px;
          color: #fff;
          padding-left: 25px;
          font-weight: 400;
          padding-top: 30px;
        }
      }
    }
    &-nomarl {
      height: 100%;
      width: 100%;
    }
    &-special__show {
      .vmp-stream-list {
        height: 0px;
        overflow: hidden;
      }
    }
    &-mini {
      position: fixed;
      height: 168px;
      left: 55%;
      top: 70%;
      width: 300px;
      z-index: 302;
      overflow: hidden;
      .vmp-wap-player-header,
      .vmp-wap-player-footer {
        display: none;
      }
      // 小屏后互动样式
      .vmp-wap-stream-wrap {
        height: 100%;
        .vmp-stream-list {
          height: 100%;
          width: 100%;
        }
        .vmp-stream-list__mini-window__main-screen {
          position: absolute;
          top: 0;
          left: 0 !important; // 由于小屏后，和产品沟通，只展示主画面
          width: 100%;
          height: 100%;
          z-index: 7;
          .vmp-stream-remote-exitscreen {
            display: none;
          }
        }
        &-group {
          top: 0;
          height: 100%;
        }
      }
      .vmp-wap-insert-file-main-screen,
      .vmp-wap-desktop-screen {
        display: none;
      }
      .vmp-wap-stream-wrap-mask > .vmp-wap-stream-wrap-mask-heat,
      .vmp-wap-stream-wrap-mask-screen {
        display: none;
      }
    }
    &_living {
      width: 100%;
      background: #ffffff;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      .living-img {
        display: inline-block;
        width: 160px;
        height: 160px;
        img {
          width: 100%;
          height: 100%;
          object-fit: scale-down;
        }
      }
      .living-text {
        padding-top: 20px;
        color: #262626;
        font-size: 28px;
        line-height: 40px;
      }
    }
    .vmp-wap-doc-main-screen {
      position: absolute;
      width: @desk-w;
      height: @desk-h;
      left: calc((100% - @desk-w) / 2);
      top: 85px;
      &-top {
        top: 0;
      }
      &.doc-hidden {
        visibility: hidden;
      }
    }
    &.isPortraitLive {
      width: 100%;
      height: 100%;
      position: fixed;
      top: 0;
      left: 0;
      &.vmp-wap-body-container-sticktop {
        position: relative;
      }
      &.isMini {
        z-index: 300; //互动工具层级＞文档全屏＞小窗层级＞自定义菜单
        width: 0;
        height: 0;
        right: 16px;
        top: 16px;
        left: auto;
        position: relative;
      }
      .vmp-wap-body-mini {
        top: 16px;
        right: 16px;
        left: auto;
        width: 160px;
        height: 284px;
        border-radius: 8px;
        .vmp-wap-player video,
        .vmp-stream-list video {
          border-radius: 8px;
        }
        &.rotate90 {
          transform-origin: center;
          transform: rotate(90deg) !important;
        }
      }
      // 吸顶的样式
      .vmp-wap-body-sticktop {
        width: 100%;
        height: 5.62667rem;
        position: fixed;
        left: 0 !important;
        top: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        z-index: 302;
        overflow: hidden;
        background-color: #000;
        &__hide {
          z-index: -1;
          opacity: 0;
        }
        .vmp-wap-player {
          video {
            object-fit: contain;
            background: #000;
          }
          .vmp-wap-player-audie {
            display: block !important;
          }
        }
        .vmp-stream-remote .vmp-stream-remote__container__audio {
          display: block !important;
        }
        .vmp-wap-stream-wrap {
          .licode_stream {
            object-fit: contain;
          }
        }
      }
    }
  }
</style>

<template>
  <div
    class="vmp-wap-stream-wrap"
    :class="{
      'vmp-wap-stream-wrap__portrait': isPortraitLive,
      'vmp-wap-stream-wrap__portrait-app': isAppStartType
    }"
    ref="vmp-wap-stream-wrap"
    :style="{ background: mainBackground }"
    @click.stop.prevent="videoShowIcon"
  >
    <div
      id="vmp-stream-list"
      class="vmp-stream-list"
      :class="{
        'vmp-stream-list-h0': isStreamListH0,
        'vmp-stream-list-h-all': isStreamListHAll,
        'vmp-stream-list-no-speack': !micServer.state.isSpeakOn,
        'vmp-stream-list-stream-center':
          speakerAndShowLayout == 1 && isCenterStream && micServer.state.isSpeakOn
      }"
      ref="vmp_stream_list"
    >
      <div
        class="vmp-stream-list__local-container"
        :class="{
          'vmp-stream-list__main-screen':
            !isDocMainScreen && joinInfo.third_party_user_id == mainScreen,
          'vmp-stream-list__mini-window__main-screen': joinInfo.third_party_user_id == mainScreen // 播放器是mini状态的主屏class
        }"
        v-show="micServer.state.isSpeakOn"
      >
        <div class="vmp-stream-list__remote-container-h">
          <vmp-air-container :oneself="true" :cuid="childrenCom[0]"></vmp-air-container>
        </div>
      </div>
      <template v-if="remoteSpeakers.length">
        <div
          v-for="speaker in remoteSpeakers"
          :key="speaker.accountId"
          class="vmp-stream-list__remote-container"
          :class="{
            'vmp-stream-list__mini-window__main-screen': speaker.accountId == mainScreen, // 播放器是mini状态的主屏class
            'vmp-stream-list__main-screen':
              speaker.accountId == mainScreen &&
              !isDocMainScreen &&
              (speakerAndShowLayout == 1
                ? !isShareScreen && !isOpenInsertFile && !isInsertAudio
                : true),
            'vmp-stream-list__main-screen-doubleRow':
              speaker.accountId == mainScreen && remoteSpeakers.length > 6,
            'vmp-stream-list__main-screen-threeRow':
              speaker.accountId == mainScreen && remoteSpeakers.length > 11
          }"
        >
          <div class="vmp-stream-list__remote-container-h">
            <vmp-wap-stream-remote :stream="streamInfo(speaker)"></vmp-wap-stream-remote>
          </div>
        </div>
      </template>
    </div>
    <!-- wap 蒙层显示信息 -->
    <div class="vmp-wap-stream-wrap-mask" @click="clearScreen">
      <!-- 热度 -->
      <div
        class="vmp-wap-stream-wrap-mask-heat"
        v-if="
          roomBaseServer.state.watchInitData.pv.show &&
          !isInGroup &&
          !(isConcise || this.isPortraitLive)
        "
        :class="[iconShow ? 'opcity-true' : 'opcity-flase']"
      >
        <p>
          <i class="vh-saas-iconfont vh-saas-line-heat"></i>
          <span>{{ hotNum | formatHotNum }}</span>
        </p>
      </div>
      <!-- 播放 -->
      <div class="vmp-wap-stream-wrap-mask-pause" v-show="showPlayIcon">
        <img :src="coverImgUrl" alt />
        <p class="preventClick" v-if="!isPortraitLive" @click.stop="replayPlay">
          <i class="vh-iconfont vh-line-video-play"></i>
        </p>
      </div>
      <!-- 多语言入口 -->
      <div
        class="vmp-wap-stream-wrap-mask-lang"
        v-if="languageList.length > 1 && !isInGroup && !this.isPortraitLive"
        :class="[iconShow ? 'opcity-true' : 'opcity-flase']"
      >
        <span @click.stop.prevent="openLanguage">
          {{ lang.key == 1 ? '中文' : 'EN' }}
        </span>
      </div>
      <!-- 进入全屏 -->
      <div
        v-if="!isDocMainScreen & !this.isPortraitLive"
        class="vmp-wap-stream-wrap-mask-screen"
        :class="[iconShow && mainScreenStream.streamId ? 'opcity-true' : 'opcity-flase']"
        @click.stop="setFullScreen"
      >
        <i class="vh-iconfont vh-a-line-fullscreen"></i>
      </div>
      <!-- 文档播放器切换位置 -->
      <div
        v-if="isPortraitLive && !isWapBodyDocSwitchFullScreen"
        class="vmp-wap-stream-wrap-mask-trans"
        @click.stop="transposition"
      >
        <i class="vh-iconfont vh-line-sort1"></i>
      </div>
      <div class="vmp-wap-stream-wrap-mask-background" v-show="defaultBg">
        <van-loading color="#ffffff" />
      </div>
    </div>
    <!-- 小组协作中 -->
    <div class="vmp-wap-stream-wrap-group" v-show="showGroupMask">
      <i class="vh-saas-iconfont vh-saas-a-line-Requestassistance"></i>
      小组协作中
    </div>
    <van-popup
      v-model="isOpenlang"
      :overlay="false"
      position="right"
      style="z-index: 12"
      class="vmp-wap-stream-popup"
    >
      <ul>
        <li
          v-for="(item, index) in languageList"
          :key="index"
          :class="{ 'popup-active': item.key == lang.key }"
          @click.stop="changeLang(item.key)"
        >
          {{ item.label }}
        </li>
      </ul>
    </van-popup>
  </div>
</template>

<script>
  import {
    useInteractiveServer,
    useMicServer,
    useRoomBaseServer,
    useMediaCheckServer,
    useGroupServer
  } from 'middle-domain';
  import { debounce } from 'lodash';
  import BScroll from '@better-scroll/core';
  import { streamInfo } from '@/app-shared/utils/stream-utils';
  import { boxEventOpitons } from '@/app-shared/utils/tool.js';
  export default {
    name: 'VmpWapStreamList',

    data() {
      return {
        childrenCom: [],
        playAbort: [], // 自动播放禁止的stream列表
        showPlayIcon: false, // 是否展示播放按钮
        scroll: null, // BScroll 插件
        mainScreenDom: null, // 主屏Dom
        iconShow: false, // 5 秒的icon展示
        isOpenlang: false,
        lang: {},
        languageList: [],
        streamInfo,
        timmer: null,
        isConcise: false
      };
    },
    computed: {
      // 是否是app或移动sdk发起
      isAppStartType() {
        const startType = this.$domainStore.state.roomBaseServer.watchInitData?.switch?.start_type;
        return (startType == 2 || startType == 3) && this.isPortraitLive;
      },
      // 竖屏直播，文档播放器位置切换的状态
      isWapBodyDocSwitchFullScreen() {
        return this.$domainStore.state.roomBaseServer.isWapBodyDocSwitchFullScreen;
      },
      // 是否观众可见
      switchStatus() {
        return this.$domainStore.state.docServer.switchStatus;
      },
      // 活动状态（2-预约 1-直播 3-结束 4-点播 5-回放）
      webinarType() {
        return Number(this.roomBaseServer.state.watchInitData.webinar.type);
      },
      isInGroup() {
        // 在小组中
        return this.$domainStore.state.groupServer.groupInitData?.isInGroup;
      },
      // 主屏ID
      mainScreen() {
        if (this.isInGroup) {
          return this.$domainStore.state.groupServer.groupInitData.main_screen;
        } else {
          return this.$domainStore.state.roomBaseServer.interactToolStatus.main_screen;
        }
      },
      // 封面图
      coverImgUrl() {
        return this.$domainStore.state.roomBaseServer.watchInitData.webinar?.img_url;
      },
      localSpeaker() {
        return (
          this.$domainStore.state.micServer.speakerList.find(
            item => item.accountId == this.joinInfo.third_party_user_id
          ) || {}
        );
      },
      remoteSpeakers() {
        if (
          this.micServer.state.isSpeakOn &&
          useMediaCheckServer().state.deviceInfo.device_status != 2
        ) {
          // 远端流个数改变且 在推流 才进行初始化BScroll
          this.createBScroll();
        }
        return (
          this.$domainStore.state.micServer.speakerList.filter(
            item => item.accountId != this.joinInfo.third_party_user_id
          ) || []
        );
      },
      speakerList() {
        return this.$domainStore.state.micServer.speakerList;
      },
      joinInfo() {
        return this.$domainStore.state.roomBaseServer.watchInitData.join_info;
      },
      isStreamListH0() {
        /**
         * 计算方式:
         * 1. 远端流列表长度为 0
         *    1) 如果存在本地流并且不是主屏,高度不为 0,返回 false
         *    2) 如果存在本地流并且是主屏,高度为 0,返回 true
         * 2. 远端流列表长度为 1
         *    1) 如果不存在本地流并且远端流是主屏,高度为 0,返回 true
         *    2) 如果不存在本地流并且远端流不是主屏,高度不为 0,返回 false
         *    3) 如果存在本地流,高度不为 0,返回 false
         * 3. 远端流列表长度大于 1
         *    高度不为 0,返回 false
         * 4. 没有互动实例的时候高度为0
         */
        if (!this.$domainStore.state.interactiveServer.isInstanceInit) {
          return true;
        }
        if (!this.remoteSpeakers.length) {
          if (this.localSpeaker.accountId && this.joinInfo.third_party_user_id != this.mainScreen) {
            return false;
          } else {
            return true;
          }
        } else if (this.remoteSpeakers.length == 1) {
          if (!this.localSpeaker.accountId) {
            return this.remoteSpeakers[0].accountId == this.mainScreen;
          } else {
            return false;
          }
        } else {
          return false;
        }
      },
      // 只存在订阅一路流的情况下进行铺满
      isStreamListHAll() {
        return (
          this.remoteSpeakers.length == 1 &&
          this.remoteSpeakers[0].accountId == this.mainScreen &&
          !this.$domainStore.state.interactiveServer.localStream.streamId
        );
      },
      // 主持人是否在小组中
      is_host_in_group() {
        return this.$domainStore.state.roomBaseServer.interactToolStatus?.is_host_in_group == 1;
      },
      // 主屏流   和产品佳佳沟通：显示全屏按钮条件：存在视频流  条件：先判断远端流内是否存在主屏 || 本地流是否是主屏 || {}
      mainScreenStream() {
        let _stream =
          this.remoteSpeakers.find(ele => {
            ele.streamSource = 'remote';
            return ele.accountId == this.mainScreen;
          }) || {};
        if (this.localSpeaker.accountId == this.mainScreen) {
          _stream = this.localSpeaker;
          _stream.streamSource = 'local';
        }
        return _stream;
      },
      isShareScreen() {
        return this.$domainStore.state.desktopShareServer.localDesktopStreamId;
      },
      isOpenInsertFile() {
        return this.$domainStore.state.insertFileServer.insertStreamInfo.streamId;
      },
      // 是否是音频插播
      isInsertAudio() {
        return !this.$domainStore.state.insertFileServer.insertStreamInfo.has_video;
      },
      // 小组协作中
      showGroupMask() {
        // 分组活动 + 自己不在小组 + 主持人不在小组 + 不存在主画面 + 不存在桌面共享
        return (
          !this.isInGroup &&
          this.is_host_in_group &&
          this.roomBaseServer.state.watchInitData.webinar.mode == 6 &&
          !this.mainScreenStream.accountId &&
          !this.isShareScreen
        );
      },
      // 热度
      hotNum() {
        return (
          Number(this.$domainStore.state.virtualAudienceServer.uvHot) +
          Number(this.$domainStore.state.virtualAudienceServer.virtualHot) +
          1
        );
      },
      // 开始推流到成功期间展示默认图
      defaultBg() {
        return this.interactiveServer.state.defaultStreamBg;
      },
      // 权限list
      configList() {
        return this.$domainStore.state.roomBaseServer.configList;
      },
      // 是不是嵌入页
      isEmbed() {
        return this.$domainStore.state.roomBaseServer.embedObj.embed;
      },
      // 隐藏部分文案及选项(安利定制)
      hideItem() {
        return this.configList['watch_embed_close_entrance'] && this.isEmbed;
      },
      mainBackground() {
        let skinInfo = this.$domainStore.state.roomBaseServer.skinInfo;
        let skinJsonWap = {};
        if (skinInfo?.skin_json_wap && skinInfo.skin_json_wap != 'null') {
          skinJsonWap = skinInfo.skin_json_wap;
        }
        return skinJsonWap?.videoBackGroundColor || '#000';
      },
      speakerAndShowLayout() {
        return this.$domainStore.state.roomBaseServer.interactToolStatus.speakerAndShowLayout;
      },
      // 是否开启文档主画面
      isDocMainScreen() {
        return (
          this.$domainStore.state.docServer.switchStatus &&
          this.$domainStore.state.interactiveServer.isInstanceInit &&
          this.webinarType == 1 &&
          !!this.$domainStore.state.docServer.currentCid &&
          this.speakerAndShowLayout == 1
        );
      },
      // 远端流总宽度是否超过桌面宽度
      isCenterStream() {
        let num = this.remoteSpeakers.length;
        if (this.isDocMainScreen) {
          num = num + 1;
        }
        console.log('w-w', num);
        return num < 6;
      },
      // 竖屏直播
      isPortraitLive() {
        return (
          this.$domainStore.state.roomBaseServer.watchInitData?.webinar?.webinar_show_type == 0
        );
      },
      // 是否是无延迟活动
      noDelayWebinar() {
        return this.$domainStore.state.roomBaseServer.watchInitData.webinar.no_delay_webinar === 1;
      },
      //判断是否是音频直播模式
      isAudio() {
        return this.$domainStore.state.roomBaseServer.watchInitData.webinar.mode == 1;
      }
    },
    watch: {
      showPlayIcon: {
        handler() {
          // 防止页面初始化报错故添加timeout：目标组件不存在
          setTimeout(() => {
            if (
              this.isPortraitLive &&
              this.noDelayWebinar &&
              this.$domainStore.state.interactiveServer.isInstanceInit
            ) {
              if (this.showPlayIcon) {
                this.$domainStore.state.roomBaseServer.isWapBodyDocSwitchFullScreen = true;
              }
              window.$middleEventSdk?.event?.send(
                boxEventOpitons(this.cuid, 'emitStreamListPoster', [this.showPlayIcon])
              );
              // 音频模式或者画质为音频
              if (this.isAudio) {
                this.$nextTick(() => {
                  window.$middleEventSdk?.event?.send(
                    boxEventOpitons(this.cuid, 'emitPlayerPosterAudio', [this.showPlayIcon])
                  );
                });
              }
              // console.log('setStreamFullscreen');
              // window.$middleEventSdk?.event?.send(
              //   boxEventOpitons(this.cuid, 'emitStreamShowPlayIcon', [!this.showPlayIcon])
              // );
            }
          });
        },
        immediate: true
      },
      // 设置主画面背景色
      mainBackground: {
        handler(val) {
          console.log('mainBackground---', val);
          this.$nextTick(() => {
            const dom = document.getElementById('vmp-stream-list');
            dom.setAttribute('style', `--main-bg-color:${val}`);
          });
        },
        immediate: true
      },
      isDocMainScreen: {
        handler(val) {
          this.createBScroll();
        }
      },
      isCenterStream: {
        handler(val) {
          if (val && this.scroll && this.scroll.scrollX != 0) {
            window.sc = this.scroll;
            this.scroll.scrollTo(0);
            this.scroll.destroy();
            this.scroll = null;
          }
        }
      }
    },
    beforeCreate() {
      this.interactiveServer = useInteractiveServer();
      this.roomBaseServer = useRoomBaseServer();
      this.micServer = useMicServer();
    },

    async created() {
      await useMediaCheckServer().checkSystemRequirements();
      this.childrenCom = window.$serverConfig[this.cuid].children;
      this.languageList = this.roomBaseServer.state.languages.langList;
      this.lang = this.roomBaseServer.state.languages.lang;

      // 检测是否支持连麦&&互动或分组&&直播状态，不支持直接进行提示
      if (
        useMediaCheckServer().state.isBrowserNotSupport &&
        (this.roomBaseServer.state.watchInitData.webinar.mode == 3 ||
          this.roomBaseServer.state.watchInitData.webinar.mode == 6) &&
        this.webinarType == 1 &&
        !this.hideItem
      ) {
        return this.$toast(this.$t('other.other_1010'));
      }
      this.replayPlay = debounce(this.replayPlay, 500);
    },

    mounted() {
      // 在麦上 才存在滑动情况
      if (this.micServer.getSpeakerStatus()) {
        if (useMediaCheckServer().state.deviceInfo.device_status != 2) {
          this.createBScroll();
        }
      }

      this.addSDKEvents();
      this.fiveDown();
      this.getIsConcise();
    },
    beforeDestroy() {
      if (this.scroll) {
        this.scroll.destroy();
      }
    },

    methods: {
      clearScreen(e) {
        if (this.isPortraitLive) {
          this.roomBaseServer.state.isClearScreen = !this.roomBaseServer.state.isClearScreen;
        }
      },
      transposition() {
        if (this.isPortraitLive) {
          this.roomBaseServer.state.isWapBodyDocSwitchFullScreen =
            !this.roomBaseServer.state.isWapBodyDocSwitchFullScreen;
        }
      },
      getIsConcise() {
        let skin_json_wap = {
          style: 1
        };
        const skinInfo = this.roomBaseServer.state.skinInfo;
        if (skinInfo?.skin_json_wap && skinInfo.skin_json_wap != 'null') {
          skin_json_wap = skinInfo.skin_json_wap;
        }
        if (skin_json_wap?.style == 3) {
          this.isConcise = true;
        } else {
          this.isConcise = false;
        }
      },
      // 设置主画面   补充：设置主画面时，需要实时更改主画面的位置，不然会出现界面混乱等问题
      setBigScreen(msg) {
        this.$nextTick(() => {
          this.mainScreenDom = document.querySelector('.vmp-stream-list__main-screen');
          if (this.mainScreenDom && this.micServer.state.isSpeakOn) {
            this.mainScreenDom.style.left = `${1.02667}rem`;
            this.mainScreenDom.style.pointerEvents = 'auto';
          }
        });
        const str =
          msg.data.type == 'vrtc_speaker_switch'
            ? this.$t('interact.interact_1034')
            : this.$t('interact.interact_1033');
        this.$toast(this.$t('interact.interact_1012', { n: msg.data.nick_name, m: str }));
      },
      // 事件监听
      addSDKEvents() {
        // 监听到自动播放
        this.interactiveServer.$on('EVENT_STREAM_PLAYABORT', e => {
          console.warn('自动播放失败------', e);
          this.playAbort.push(e.data);
          this.showPlayIcon = true;
          // 竖屏直播，并且有文档展示的时候，需要将视频置为大屏
          if (this.switchStatus && this.isPortraitLive) {
            this.roomBaseServer.state.isWapBodyDocSwitchFullScreen = true;
          }
        });

        // 接收设为主画面消息  主直播间
        this.micServer.$on('vrtc_big_screen_set', msg => {
          this.joinInfo.role_name != 2 && this.setBigScreen(msg);
        });

        // 接收设为主画面消息   组内
        useGroupServer().$on('VRTC_BIG_SCREEN_SET', msg => {
          this.setBigScreen(msg);
        });

        // 接收设为主讲人消息
        this.micServer.$on('vrtc_speaker_switch', msg => {
          this.joinInfo.role_name != 2 && this.setBigScreen(msg);
        });

        // 下麦成功 - 移除BScroll
        this.micServer.$on('vrtc_disconnect_success', async () => {
          if (this.scroll && this.scroll.scrollX != 0) {
            window.sc = this.scroll;
            this.scroll.scrollTo(0);
            this.scroll.destroy();
            this.scroll = null;
            if (this.mainScreenDom) {
              this.mainScreenDom.style.pointerEvents = 'auto';
            }
          }
        });

        // 监听全屏变化
        window.addEventListener(
          'fullscreenchange',
          () => {
            if (!document.fullscreenElement) {
              this.interactiveServer.state.fullScreenType = false;
            }
          },
          true
        );
      },

      // 创建betterScroll
      createBScroll() {
        this.$nextTick(() => {
          if (this.scroll) {
            this.scroll.refresh();
          } else {
            this.scroll = new BScroll(this.$refs['vmp-wap-stream-wrap'], {
              scrollX: true,
              click: true,
              probeType: 3, // listening scroll event
              preventDefaultException: {
                className: /(^|\s)preventClick(\s|$)/
              }
            });
          }
          // 在创建时，需获取主屏Dom并设置left值，防止出现布局混乱
          this.mainScreenDom = document.querySelector('.vmp-stream-list__main-screen');
          if (this.mainScreenDom) {
            this.mainScreenDom.style.left = `${1.02667}rem`;
          }
          this.scroll.on('scroll', ({ x }) => {
            // 更改禁止方案
            if (this.mainScreenDom) {
              this.mainScreenDom.style.left = `${30 + -x}px`;
            }
          });
        });
      },

      // 恢复播放
      replayPlay() {
        if (this.isPortraitLive && this.isWapBodyDocSwitchFullScreen && this.switchStatus) {
          this.roomBaseServer.state.isWapBodyDocSwitchFullScreen = false;
        }
        console.log('点击了恢复播放------', this.playAbort);
        this.playAbort.forEach(stream => {
          this.interactiveServer
            .setPlay({ streamId: stream.streamId })
            .then(() => {
              this.showPlayIcon = false;
            })
            .catch(e => {
              console.error('恢复播放失败----', e);
            });
        });
        this.playAbort = [];
      },

      // 全屏
      setFullScreen() {
        /*
         * 布局原因：wap进入全屏仅全屏主屏流， 本地流和远端流都存在被设置为主屏情况
         *    进入全屏在list内，退出全屏在remote/local内进行退出
         */
        this.interactiveServer
          .setStreamFullscreen({
            streamId: this.mainScreenStream.streamId,
            vNode:
              this.mainScreenStream.streamSource == 'remote'
                ? `vmp-stream-remote__${this.mainScreenStream.streamId}`
                : `vmp-stream-local__${this.mainScreenStream.accountId}`
          })
          .then(() => {
            this.setFullScreenStatus();
          });
      },
      setFullScreenStatus() {
        // 参考player组件内的brower内的ios判断条件
        if (!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)) {
          this.interactiveServer.state.fullScreenType = true;
        }
      },

      videoShowIcon() {
        this.iconShow = true;
        this.isOpenlang = false;
        this.fiveDown();
      },
      // 切换多语言
      changeLang(key) {
        this.isOpenlang = false;
        localStorage.setItem('lang', key);
        const params = this.$route.query;
        // 如果地址栏中有语言类型，当切换语言时，对应的地址栏参数要改变
        if (params.lang) {
          params.lang = key;
          let sourceUrl =
            window.location.origin + process.env.VUE_APP_ROUTER_BASE_URL + this.$route.path;
          let queryKeys = '';
          for (const k in params) {
            queryKeys += k + '=' + params[k] + '&';
          }
          queryKeys = queryKeys.substring(0, queryKeys.length - 1);
          sourceUrl = sourceUrl + '?' + queryKeys;
          window.location.href = sourceUrl;
        } else {
          window.location.reload();
        }
      },
      openLanguage() {
        this.iconShow = true;
        this.isOpenlang = true;
      },
      // 5秒后消失
      fiveDown() {
        clearTimeout(this.setIconTime);
        this.setIconTime = setTimeout(() => {
          this.iconShow = false;
          this.isOpenlang = false;
        }, 5000);
      }
    }
  };
</script>

<style lang="less">
  .vmp-wap-stream-wrap {
    white-space: nowrap;
    height: 422px;
    width: 100%;
    position: relative;
    // 竖屏直播样式
    &__portrait {
      height: 100%;
      // app发起的竖屏直播
      &-app {
        .vmp-stream-list {
          &__remote-container {
            // 无延迟竖屏直播，画面铺满屏幕
            .licode_stream {
              object-fit: cover;
            }
          }
        }
      }
      .vmp-stream-list {
        &__remote-container {
          .vmp-stream-local__bottom {
            display: none;
          }
        }
      }
    }
    // 小组协作中
    &-group {
      position: absolute;
      top: 100px;
      display: flex;
      width: 100%;
      height: 50%;
      flex-direction: column;
      justify-content: center;
      color: #999;
      background: #000;
      text-align: center;
      font-size: 28px;
      z-index: 1;
      i {
        display: block;
        font-size: 70px;
        margin-bottom: 14px;
      }
    }
    // 蒙层
    &-mask {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: flex-start;
      &-heat {
        top: 24px;
        left: 24px;
        padding: 0 24px;
        color: #fff;
        position: absolute;
        font-size: 28px;
        z-index: 5;
        p {
          border-radius: 44px;
          height: 48px;
          line-height: 48px;
          padding: 0 16px;
          text-align: center;
          background: rgba(0, 0, 0, 0.5);
          i {
            vertical-align: bottom;
            font-size: 28px;
            margin-right: 4px;
          }
        }
      }
      &-pause {
        height: 100%;
        width: 100%;
        position: absolute;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 7;
        background: transparent;
        transform: translateZ(10px);
        img {
          width: 100%;
          height: 100%;
        }
        p {
          width: 108px;
          height: 108px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          position: absolute;
          i {
            font-size: 46px;
            color: #f5f5f5;
          }
        }
      }
      &-lang {
        top: 150px;
        right: 32px;
        padding: 0 24px;
        color: #fff;
        position: absolute;
        z-index: 5;
        span {
          display: block;
          height: 48px;
          width: 88px;
          border-radius: 24px;
          background: rgba(0, 0, 0, 0.5);
          text-align: center;
          line-height: 48px;
          font-size: 24px;
          font-family: PingFangSC-Medium, PingFang SC;
          color: #fff;
        }
      }
      &-screen {
        width: 64px;
        height: 64px;
        line-height: 64px;
        z-index: 4;
        background: rgba(0, 0, 0, 0.4);
        position: absolute;
        left: 50%;
        top: 50%;
        text-align: center;
        transform: translate3d(-32px, -32px, 10px);
        border-radius: 50%;
      }
      &-trans {
        position: absolute;
        bottom: 12px;
        right: 12px;
        width: 56px;
        height: 56px;
        border-radius: 50%;
        color: #fff;
        background-color: rgba(0, 0, 0, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 7;
        cursor: pointer;
        .vh-iconfont {
          font-size: 30px;
        }
      }
      &-background {
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1;
        background: #000;
        img {
          width: 66px;
          height: 66px;
        }
      }
      .opcity-flase {
        display: none;
        transition: all 1s;
        -webkit-transition: all 1s;
      }
      .opcity-true {
        opacity: 1;
        transition: all 1s;
        z-index: 6;
        -webkit-transition: all 1s;
        i {
          color: #fff;
        }
      }
    }
    .vmp-wap-stream-popup {
      width: 200px;
      position: absolute;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      ul {
        display: flex;
        width: 100%;
        height: 100%;
        flex-direction: column;
        justify-content: center;
        flex-wrap: wrap;
        padding: 30px 0;
        li {
          width: 100%;
          height: 60px;
          line-height: 60px;
          font-size: 28px;
          font-family: PingFangSC-Regular, PingFang SC;
          font-weight: 400;
          color: rgba(255, 255, 255, 1);
          text-align: center;
          &.popup-active {
            color: #fb2626;
          }
        }
      }
    }
  }
  .vmp-stream-list {
    height: 83px;
    display: inline-block;
    --main-bg-color: #000;
    .vmp-stream-list__main-screen div.licode_player {
      background-color: var(--main-bg-color) !important;
    }
    &__local-container {
      width: 148px;
      height: 100%;
      display: inline-block;
    }
    &__remote-container {
      width: 148px;
      height: 100%;
      display: inline-block;
      &-h {
        height: 100%;
      }
    }

    // 流列表高度不为0
    &__main-screen {
      position: absolute;
      top: 83px;
      left: calc((100vw - 597px) / 2);
      width: 597px;
      height: 337px;
      display: inline-block;
      .vmp-stream-list__remote-container {
        &-h {
          padding-top: 56.25%;
        }
      }
      // 为了保持16:9的比例，这里需要重写一下stream的样式
      .vmp-stream-remote {
        position: absolute;
        top: 0;
      }
      .vmp-stream-local {
        position: absolute;
        top: 0;
      }
      // 主屏下的 后续nick_name 应为全显示
      .vmp-stream-local__bottom {
        // 此处不能使用&去代替  由于父级无样式，直接使用&会导致class优先级降低
        .vmp-stream-local__bottom-nickname {
          width: 160px;
        }
      }
      .vmp-stream-list__remote-container-h .vmp-stream-remote__container__net-error {
        .net-error-img {
          width: 90px;
          height: 75px;
        }
      }
    }

    // 流列表高度为0
    &-h0 {
      height: 0;
      .vmp-stream-list__main-screen {
        top: 0;
      }
    }
    &-stream-center {
      display: flex;
      justify-content: center;
    }

    // 未上麦样式进行覆盖
    &-no-speack {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-end;
      align-content: flex-end;
      height: 422px;
      .vmp-stream-list__remote-container {
        // align-items: center;
        width: 150px;
        height: 85px;
      }
      .vmp-stream-list__local-container {
        width: 150px;
        height: 85px;
      }
      .vmp-stream-list__main-screen {
        position: absolute;
        left: 0 !important;
        top: 0;
        width: 100%;
        height: calc(100% - 85px);
      }
      // 未上麦执行旁路布局模式，会根据上麦人数进行修改主屏的高度
      .vmp-stream-list__main-screen-doubleRow {
        height: calc(100% - 170px);
      }
      .vmp-stream-list__main-screen-threeRow {
        height: calc(100% - 255px);
      }
    }
    // 铺满全屏
    &-h-all {
      width: 100%;
      top: 0;
      .vmp-stream-list__main-screen {
        top: 0;
        width: 100%;
        height: 100%;
      }
    }
  }
  .isPortraitLive {
    .vmp-wap-stream-wrap-mask-pause img {
      object-fit: contain;
    }
  }
</style>

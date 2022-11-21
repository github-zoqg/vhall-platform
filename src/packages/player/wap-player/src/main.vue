<template>
  <div
    class="vmp-wap-player"
    :class="[
      isAppStartType ? 'vmp-wap-player__app' : '',
      !isLiving ? 'isVod' : '',
      isAudio ? 'isAudio' : ''
    ]"
    @click="clearScreen"
  >
    <template v-if="encrypt">
      <!-- <div class="vmp-wap-player-prompt">
        <van-loading color="#fb2626" />
        <span class="vmp-wap-player-prompt-text">{{ prompt }}</span>
      </div> -->
      <div id="videoWapBox" class="vmp-wap-player-video">
        <!-- 播放器背景图片 -->
        <div class="vmp-wap-player-prompt" v-if="isShowPoster && !isSmallPlayer">
          <img
            :class="`vmp-wap-player-prompt-poster player_bg_${imageCropperMode}`"
            :src="webinarsBgImg"
            v-show="!(isVodEnd && !isPlaying && isPortraitLive)"
          />
        </div>
        <!-- 播放 按钮 -->
        <div
          v-show="
            !isPlaying &&
            !isVodEnd &&
            !isSmallPlayer &&
            (!isPortraitLive ||
              (!isWapBodyDocSwitchFullScreen &&
                isPortraitLive &&
                isShowPoster &&
                webinarType != 5) ||
              (embedVideo && isPortraitLive) ||
              (isSubscribe && isPortraitLive))
          "
          class="vmp-wap-player-pause"
        >
          <p @click.stop="startPlay">
            <i class="vh-iconfont vh-line-video-play"></i>
          </p>
        </div>
        <!-- 文档播放器互换位置按钮 -->
        <div
          key="vmp-wap-player-trans"
          v-if="isPortraitLive && !isWapBodyDocSwitchFullScreen && !embedVideo && !isSubscribe"
          class="vmp-wap-player-trans"
          @click.stop="transposition"
        >
          <i class="vh-iconfont vh-line-sort1"></i>
        </div>
        <div
          key="vmp-wap-player-container"
          :id="
            warmUpVideoList.length < 2
              ? 'vmp-wap-player'
              : `vmp-wap-player-vod_${this.warmUpVideoList[this.initIndex]}`
          "
          style="width: 100%; height: 100%"
          class="playerBox"
          @click.stop.prevent="videoShowIcon"
          @click.stop="clearScreen"
        >
          <!-- 视频容器 -->
        </div>
        <!-- 直播结束 -->
        <div
          class="vmp-wap-player-audie"
          v-show="
            !isPortraitLive ||
            (!isWapBodyDocSwitchFullScreen && isPortraitLive) ||
            (embedVideo && isPortraitLive) ||
            (isSubscribe && isPortraitLive)
          "
          v-if="isAudio || audioStatus"
        >
          <p v-show="!(!isWapBodyDocSwitchFullScreen && isPortraitLive)">
            {{ $t('player.player_1014') }}
          </p>
        </div>
        <!-- 回放结束（正常回放和试看回放结束） -->
        <div
          v-show="
            isVodEnd &&
            !isPlaying &&
            (!isPortraitLive || (embedVideo && isPortraitLive) || (isSubscribe && isPortraitLive))
          "
          :class="`vmp-wap-player-ending ending_bg_${imageCropperMode}`"
          :style="`backgroundImage: url('${webinarsBgImg}')`"
        >
          <!-- 试看播放结束 和线上保持一致 -->
          <!-- <div class="vmp-wap-player-ending-box" v-if="isTryPreview">
          <p class="vmp-wap-player-ending-box-title">{{ $t('appointment.appointment_1013') }}</p>
          <div class="vmp-wap-player-ending-box-try">
            <p v-if="authText == 6">
              <span class="vmp-wap-player-ending-box-try-pay" @click="handleAuth(3)">
                {{ $t('appointment.appointment_1010') }}
              </span>
              <span @click="handleAuth(4)">{{ $t('appointment.appointment_1011') }}</span>
            </p>
            <span v-else class="vmp-wap-player-ending-box-try-see" @click="handleAuth">
              {{ authText }}
            </span>
          </div>
          <p class="vmp-wap-player-ending-box-title" @click="startPlay">
            <i class="vh-iconfont vh-line-refresh-left"></i>
            {{ $t('appointment.appointment_1014') }}
          </p>
        </div> -->
          <!-- 回放播放结束 -->
          <div class="vmp-wap-player-ending-box" @click.stop="startPlay">
            <p class="vmp-wap-player-ending-box-noraml">
              <i class="vh-iconfont vh-line-refresh-left"></i>
            </p>
            <p class="vmp-wap-player-ending-box-reset">{{ $t('player.player_1016') }}</p>
          </div>
        </div>
        <div
          class="vmp-wap-player-header"
          v-show="
            roomBaseState.watchInitData.pv.show &&
            isPlaying &&
            !isSmallPlayer &&
            (!isPortraitLive || (embedVideo && isPortraitLive) || (isSubscribe && isPortraitLive))
          "
          :class="[iconShow ? 'opcity-flase' : 'opcity-true']"
        >
          <!-- 播放器缩小按钮 -->
          <template v-if="isAudio">
            <span v-if="!isConcise" @click.stop="changePlayerSize(true)">
              <i class="vh-iconfont vh-line-arrow-left"></i>
            </span>
            <span>
              <span class="hot_num hot_num_display">
                <i class="vh-saas-iconfont vh-saas-line-heat"></i>
                {{ hotNum | formatHotNum }}
              </span>
              <span
                @click.stop="openLanguage"
                v-if="languageList.length > 1"
                class="hot_num language_btn"
              >
                {{ lang.key == 1 ? 'CN' : 'EN' }}
                <i class="vh-iconfont vh-line-arrow-down"></i>
              </span>
            </span>
          </template>
          <template v-else>
            <span v-if="isWarnPreview"></span>
            <span class="hot_num hot_num_display" v-else>
              <i class="vh-saas-iconfont vh-saas-line-heat"></i>
              {{ hotNum | formatHotNum }}
            </span>
            <span
              @click.stop="openLanguage"
              v-if="languageList.length > 1"
              class="hot_num language_btn"
            >
              {{ lang.key == 1 ? 'CN' : 'EN' }}
              <i class="vh-iconfont vh-line-arrow-down"></i>
            </span>
          </template>
        </div>
        <!-- 倍速、清晰度切换 -->
        <div
          class="vmp-wap-player-tips"
          v-if="
            (isSetSpeed || isSetQuality) &&
            (!isPortraitLive || (embedVideo && isPortraitLive) || (isSubscribe && isPortraitLive))
          "
        >
          <span v-if="isSetQuality">
            {{ $t('player.player_1009') }}
            <span class="red">{{ formatQualityText(currentQualitys.def) }}</span>
          </span>
          <span v-if="isSetSpeed">
            <i18n path="player.player_1015" style="color: #fff">
              <span place="n" class="red">
                {{ currentSpeed == 1 ? $t('player.player_1025') : currentSpeed }}
              </span>
            </i18n>
          </span>
        </div>
        <!-- 底部操作栏  点击 暂停 全屏 播放条  -->
        <div
          class="vmp-wap-player-footer"
          v-show="
            (isPlaying || (isPortraitLive && !isPlaying && isShowPoster)) &&
            !isSmallPlayer &&
            (!isPortraitLive ||
              (isPortraitLive && !isLiving) ||
              (embedVideo && isPortraitLive) ||
              (isSubscribe && isPortraitLive))
          "
          :class="[
            iconShow ? 'vmp-wap-player-opcity-flase' : 'vmp-wap-player-opcity-true',
            docScreen == 'fullscreen' || chatSendBoxVisible || qaVisible ? 'hide' : '',
            hasIosSafeArea ? 'hasIosSafeArea' : ''
          ]"
        >
          <div class="vmp-wap-player-control" v-show="docScreen != 'fullscreen'">
            <!-- 试看逻辑不加 按照线上 -->
            <!-- <div class="vmp-wap-player-control-preview" v-if="vodType === 'shikan' && isTryPreview">
            <i18n path="appointment.appointment_1012">
              <span class="vmp-wap-player-control-preview-red" place="n">{{ recordTime }}</span>
            </i18n>
            <span v-if="authText == 6">
              <b class="vmp-wap-player-control-preview-red" @click="handleAuth(3)">
                {{ $t('appointment.appointment_1010') }}
              </b>
              或
              <b class="vmp-wap-player-control-preview-red" @click="handleAuth(4)">
                {{ $t('appointment.appointment_1011') }}
              </b>
            </span>
            <span v-else class="vmp-wap-player-control-preview-red" @click="handleAuth">
              {{ authText }}
            </span>
            <i class="vh-iconfont vh-line-close" @click="vodType === ''"></i>
          </div> -->
            <div class="vmp-wap-player-control-preview" v-if="isPickupVideo && currentTime > 0">
              <i18n path="player.player_1012">
                <span place="n" class="red">{{ currentTime | secondToDate }}</span>
              </i18n>
              <i class="vh-iconfont vh-line-close" @click.stop="isPickupVideo = false"></i>
            </div>
            <div class="vmp-wap-player-control-slider">
              <div
                v-if="eventPointList.length && totalTime && !isWarnPreview"
                ref="vhTailoringWrap"
              >
                <controlEventPoint
                  v-for="(item, index) in eventPointList"
                  :key="'controlEventPoint' + index"
                  :eventTime="item.timePoint"
                  :eventLabel="item.msg"
                  :videoTime="totalTime"
                  @showLabel="showLabelFun"
                ></controlEventPoint>
              </div>
              <van-slider
                v-if="!isLiving && playerOtherOptions.progress_bar && !isWarnPreview"
                v-model="sliderVal"
                active-color="#fb2626"
                bar-height="4px"
                button-size="26px"
                inactive-color="rgba(255,255,255,.3)"
                @input="changeSlider"
              >
                <div slot="button">
                  <img src="./img/player.png" alt />
                </div>
              </van-slider>
              <div class="vmp-wap-player-control-icons">
                <span class="vmp-wap-player-control-icons-left">
                  <i
                    @click.stop="startPlay"
                    :class="[
                      'vh-iconfont',
                      isPlaying ? 'vh-a-line-videopause' : 'vh-line-video-play',
                      { 'vh-line-left-vod': !isLiving }
                    ]"
                  ></i>
                  <i
                    class="vh-iconfont vh-line-refresh-left"
                    @click.stop="refresh"
                    v-if="isLiving"
                  ></i>
                  <span
                    class="vmp-wap-player-control-icons-left-time"
                    v-if="!isLiving && !isWarnPreview"
                  >
                    <template v-if="totalTime > 0">
                      {{ currentTime | secondToDate }}/{{ totalTime | secondToDate }}
                    </template>
                    <template v-else>--:--/--:--</template>
                  </span>
                </span>
                <!-- 右侧icon集合 倍速和画质 -->
                <div class="vmp-wap-player-control-icons-right">
                  <span
                    @click.stop="updateLang"
                    v-if="languageList.length > 1"
                    class="box language_btn"
                  >
                    {{ ['', 'EN', 'CN'][lang.key] }}
                  </span>
                  <span
                    class="box icons-quality icons-speed"
                    @click.stop="openSpeed"
                    v-if="!isLiving && playerOtherOptions.speed && !isWarnPreview"
                  >
                    {{currentSpeed == 1 ? $t('player.player_1007') : currentSpeed.toString().length &lt; 3 ? `${currentSpeed.toFixed(1)}X` : `${currentSpeed}X`}}
                  </span>
                  <span @click.stop="openQuality" v-if="!isWarnPreview" class="box icons-quality">
                    {{ formatQualityText(currentQualitys.def) }}
                  </span>

                  <span
                    class="barrageSpan"
                    @click.stop="openBarrage"
                    v-if="
                      playerOtherOptions.barrage_button &&
                      !isWarnPreview &&
                      !isTryPreview &&
                      (!isPortraitLive ||
                        (embedVideo && isPortraitLive) ||
                        (isSubscribe && isPortraitLive))
                    "
                  >
                    <i
                      :class="`barrage vh-iconfont ${
                        danmuIsOpen ? 'vh-line-barrage-on' : 'vh-line-barrage-off'
                      }`"
                    ></i>
                  </span>
                  <span
                    v-if="
                      !isAudio &&
                      !isWarnPreview &&
                      (!isPortraitLive ||
                        (embedVideo && isPortraitLive) ||
                        (isSubscribe && isPortraitLive))
                    "
                    @click.stop="enterFullscreen"
                  >
                    <i
                      :class="`vh-iconfont ${
                        isFullscreen ? 'vh-a-line-exitfullscreen' : 'vh-a-line-fullscreen'
                      }`"
                    ></i>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 小屏控制按钮 -->
        <div v-show="isSmallPlayer" class="foot_control">
          <div class="control_left">
            <span class="pos" @click.stop="startPlay">
              <van-circle
                v-model="circleSliderVal"
                :rate="parseInt(totalTime)"
                size="32px"
                :stroke-width="100"
                :color="currentTime <= 0 ? 'transparent' : '#fb3a32'"
                layer-color="rgba(255, 255, 255, 0.2)"
              >
                <i
                  class="vh-iconfont"
                  :class="isPlaying ? 'vh-a-line-videopause' : 'vh-line-video-play'"
                ></i>
              </van-circle>
            </span>
            <span class="control_center">
              <div :class="isLiving ? 'status_tip' : ''">{{ $t('player.player_1014') }}</div>

              <div class="player_time" v-if="!isLiving">
                {{ currentTime | secondToDate }}/{{ totalTime | secondToDate }}
              </div>
            </span>
          </div>
          <div class="control_right">
            <span class="set_center" @click.stop="refresh" v-if="isLiving">
              <i class="vh-iconfont vh-line-refresh-left"></i>
            </span>
            <span @click.stop="changePlayerSize(false)">
              <i class="vh-iconfont vh-line-arrow-right"></i>
            </span>
          </div>
        </div>

        <van-popup
          v-model="isOpenSpeed"
          position="right"
          :overlay="false"
          class="vmp-wap-player-popup_other"
        >
          <ul>
            <li
              v-for="item in UsableSpeed"
              :key="item"
              :class="{ 'popup-active': currentSpeed == item }"
              @click.stop="changeSpeed(item)"
            >
              {{item.toString().length &lt; 3 ? `${item.toFixed(1)}X` : `${item}X`}}
            </li>
          </ul>
        </van-popup>
        <van-popup
          v-model="isOpenQuality"
          :overlay="false"
          position="right"
          class="vmp-wap-player-popup_other"
        >
          <ul>
            <li
              v-for="item in qualitysList"
              :key="item.def"
              :class="{ 'popup-active': currentQualitys.def == item.def }"
              @click.stop="changeQualitys(item)"
            >
              {{ formatQualityText(item.def) }}
            </li>
          </ul>
        </van-popup>
        <van-popup v-model="isOpenlang" position="bottom" round class="vmp-wap-player-popup">
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
        <van-popup
          class="quality-van-popup"
          v-model="showQualityCard"
          safe-area-inset-bottom
          round
          position="bottom"
          :closeable="false"
        >
          <div class="quality-content">
            <div class="list">
              <div
                class="item"
                v-for="item in qualitysList"
                :key="item.def"
                :class="{ active: currentQualitys.def == item.def }"
                @click.stop="changePreQualitys(item)"
              >
                {{ formatQualityText(item.def) }}
              </div>
            </div>
          </div>
        </van-popup>
        <van-popup
          class="quality-van-popup speed-van-popup"
          v-model="showSpeedCard"
          safe-area-inset-bottom
          round
          position="bottom"
          :closeable="false"
        >
          <div class="quality-content speed-content">
            <div class="list">
              <div
                class="item"
                v-for="item in UsableSpeed"
                :key="item.def"
                :class="{ active: currentSpeed == item }"
                @click.stop="changePreSpeeds(item)"
              >
                {{item.toString().length &lt; 3 ? `${item.toFixed(1)}X` : `${item}X`}}
              </div>
            </div>
          </div>
        </van-popup>
      </div>
    </template>
    <template v-else>
      <div class="player-encrypt">
        <div class="player-encrypt_box"></div>
        <img src="./img/jiami.png" alt="" class="player-encrypt_img" />
        <div class="player-encrypt_tip">
          <div>{{ $t('message.message_1018') }}</div>
          <div class="pt10">{{ $t('message.message_1019') }}</div>
        </div>
      </div>
    </template>
  </div>
</template>
<script>
  import {
    boxEventOpitons,
    parseImgOssQueryString,
    getIosSafeArea
  } from '@/app-shared/utils/tool.js';
  import { isMse } from '@/app-shared/utils/isMse';
  import controlEventPoint from './components/control-event-point.vue';
  import { useRoomBaseServer, usePlayerServer, useSubscribeServer } from 'middle-domain';
  import playerMixins from './js/mixins';
  import { cropperImage } from '@/app-shared/utils/common';
  const ossimg = '?x-oss-process=image/resize,m_fill,w_828,h_466';
  export default {
    name: 'VmpWapPlayer',
    mixins: [playerMixins],
    components: {
      controlEventPoint
    },
    computed: {
      // 是否是app或移动sdk发起
      isAppStartType() {
        const startType = this.$domainStore.state.roomBaseServer.watchInitData?.switch?.start_type;
        return startType == 2 || startType == 3;
      },
      //判断是否是音频直播模式
      isAudio() {
        return this.$domainStore.state.roomBaseServer.watchInitData.webinar.mode == 1;
      },
      // 背景图片
      webinarsBgImg() {
        const cover = '//cnstatic01.e.vhall.com/static/img/mobile/video_default_nologo.png';
        const { warmup, webinar } = this.roomBaseServer.state.watchInitData;
        let webinarUrl = cover;
        if (webinar.img_url) {
          if (cropperImage(webinar.img_url)) {
            webinarUrl = webinar.img_url;
            this.handlerImageInfo(webinar.img_url);
          } else {
            webinarUrl = webinar.img_url + ossimg;
          }
        }
        if (this.warmUpVideoList.length) {
          if (warmup.warmup_img_url) {
            if (cropperImage(warmup.warmup_img_url)) {
              this.handlerImageInfo(warmup.warmup_img_url);
              webinarUrl = warmup.warmup_img_url;
            } else {
              webinarUrl = warmup.warmup_img_url + ossimg;
            }
          }
        }
        console.log('this.cuid', this.cuid, webinarUrl);
        return webinarUrl;
      },
      // 初始化了第几个
      initPlayerIndex() {
        return this.$domainStore.state.subscribeServer.initIndex;
      },
      // 播放第几个
      playIndex() {
        return this.$domainStore.state.subscribeServer.playIndex;
      },
      warmUpVideoList() {
        return this.$domainStore.state.roomBaseServer.warmUpVideo.warmup_paas_record_id;
      },
      subscribeWarmList() {
        return this.$domainStore.state.subscribeServer.subscribeWarmList;
      },
      // 暖场视频播放模式
      warmPlayMode() {
        return this.$domainStore.state.roomBaseServer.warmUpVideo.warmup_player_type;
      },
      // 是否是预约页
      isSubscribe() {
        return this.$domainStore.state.roomBaseServer.watchInitData.status === 'subscribe';
      },
      // 是否正在直播
      isLiving() {
        return this.$domainStore.state.roomBaseServer.watchInitData.webinar.type == 1;
      },
      hotNum() {
        return (
          Number(this.$domainStore.state.virtualAudienceServer.uvHot) +
          Number(this.$domainStore.state.virtualAudienceServer.virtualHot) +
          1
        );
      },
      // 是不是嵌入页
      isEmbed() {
        return this.$domainStore.state.roomBaseServer.embedObj.embed;
      },
      // 是不是单视频嵌入页
      embedVideo() {
        return this.$domainStore.state.roomBaseServer.embedObj.embedVideo;
      },
      // wap-body和文档是否切换位置
      isWapBodyDocSwitch() {
        return this.$domainStore.state.roomBaseServer.isWapBodyDocSwitch;
      },
      // 竖屏直播
      isPortraitLive() {
        return (
          this.$domainStore.state.roomBaseServer.watchInitData?.webinar?.webinar_show_type == 0
        );
      },
      // 竖屏直播 wap-body和文档是否切换位置 默认 文档主画面，播放器小屏 false
      isWapBodyDocSwitchFullScreen() {
        return this.$domainStore.state.roomBaseServer.isWapBodyDocSwitchFullScreen;
      },
      // 活动状态（2-预约 1-直播 3-结束 4-点播 5-回放）
      webinarType() {
        return Number(this.roomBaseServer.state.watchInitData.webinar.type);
      },
      // 是否是无延迟活动
      noDelayWebinar() {
        return this.$domainStore.state.roomBaseServer.watchInitData.webinar.no_delay_webinar === 1;
      },
      // 播放状态
      isPlaying() {
        return this.$domainStore.state.playerServer.isPlaying;
      },
      isInstanceInit() {
        return this.$domainStore.state.interactiveServer.isInstanceInit;
      }
    },
    data() {
      const initIndex = this.subscribeServer.state.initIndex;
      return {
        asd: 1,
        // isNoBuffer: false,
        // promptFlag: false,
        isOpenSpeed: false,
        isOpenQuality: false,
        isOpenlang: false, // 是否打开多语言弹窗
        iconShow: false, // 5秒后操作栏icon消失
        prompt: this.$t('player.player_1010'), // 刚开始点击时展示文案
        loadingFlag: false,
        isShowPoster: true, //是否展示活动图片背景
        // isPlaying: false, // 是否是播放状态
        liveOption: {}, //直播时播放器liveOption参数
        vodOption: {}, //回放时回放id
        vodType: '', //回放的类型 暖场视频还是还是试看
        authText: '',
        recordTime: '', //试看的时间
        isTryPreview: false, // 是否是试看
        isWarnPreview: false, // 是否是暖场视频
        currentTime: 0, // 视频当前播放时长
        voice: 60, //声音
        sliderVal: 0, //进度条显示
        totalTime: 0, // 视频总时长
        currentQualitys: {
          def: 'same'
        }, // 当前清晰度
        definitionConfig: '360p', //默认清晰度
        qualitysList: [], // 清晰度列表
        currentSpeed: 1, // 当前倍速
        UsableSpeed: [], // 视频倍速列表
        audioStatus: false, // 选中清晰度是否是音频模式
        danmuIsOpen: false, // 弹幕是否开启
        isFullscreen: false, // 是否是全屏
        isSetSpeed: false, // 是否切换倍速
        isSetQuality: false, // 是否切换清晰度
        isPickupVideo: false, // 是否是断点续播
        recordHistoryTime: '', // 记录播放的时间
        endTime: '', // 播放到结束时刷新页面
        eventPointList: [], //
        isVodEnd: false, // 回放结束
        isAutoPlay: false, // 记录下麦后自动播放
        marquee: {}, // 跑马灯
        water: {}, //水印
        playerOtherOptions: {
          barrage_button: 0,
          progress_bar: 0,
          speed: 0,
          autoplay: false
        },
        encrypt: true,
        isOrientation: false,
        lang: {},
        languageList: [],
        isSmallPlayer: false,
        imageCropperMode: 1,
        circleSliderVal: 0,
        initIndex,
        isConcise: false, //判断是否是极简模式
        showQualityCard: false,
        showSpeedCard: false,
        docScreen: '', //文档全屏
        chatSendBoxVisible: false,
        qaVisible: false,
        hasIosSafeArea: getIosSafeArea()
      };
    },
    watch: {
      // 监听播放器大小
      isSmallPlayer: {
        handler: function (val) {
          if (val && !this.isWapBodyDocSwitch) {
            document.querySelector('.vmp-basic-bd').classList.add('small_player');
          } else {
            document.querySelector('.vmp-basic-bd').classList.remove('small_player');
          }
          this.setSetingHeight();
          this.$nextTick(() => {
            window.$middleEventSdk?.event?.send(
              boxEventOpitons(this.cuid, 'emitPlayerIsSmallPlayer', [val])
            );
          });
        }
      },
      currentSpeed(val) {
        window.$middleEventSdk?.event?.send(
          boxEventOpitons(this.cuid, 'emitPlayerSpeed', [this.currentSpeed, this.UsableSpeed])
        );
      },
      currentQualitys(val) {
        window.$middleEventSdk?.event?.send(
          boxEventOpitons(this.cuid, 'emitPlayerQuality', [this.currentQualitys, this.qualitysList])
        );
      },
      sliderVal(val) {
        this.circleSliderVal = val;
      },
      isWapBodyDocSwitch() {
        if (this.isSmallPlayer && !this.isWapBodyDocSwitch) {
          document.querySelector('.vmp-basic-bd').classList.add('small_player');
        } else {
          document.querySelector('.vmp-basic-bd').classList.remove('small_player');
        }
        this.setSetingHeight();
      },
      playIndex() {
        if (!this.isWarnPreview) return;
        // 多个视频持续播放 暖场视频播放模式
        if (this.warmUpVideoList.length > 1) {
          // 如果是循环播放，播完最后一个，自动播第一个
          if (
            this.warmPlayMode == 2 &&
            this.warmUpVideoList[this.initIndex] === this.warmUpVideoList[this.playIndex]
          ) {
            this.playerServer.play();
          }
          // 如果是单次播放，播完第一个，自动播放第二个
          if (
            this.warmPlayMode == 1 &&
            this.warmUpVideoList[this.initIndex] === this.warmUpVideoList[this.playIndex] &&
            this.playIndex > 0
          ) {
            this.playerServer.play();
          }
        }
      },
      // isPlaying() {
      //   console.log('wap-plyer');
      //   window.$middleEventSdk?.event?.send(
      //     boxEventOpitons(this.cuid, 'emitPlayerStatus', [this.isPlaying])
      //   );
      // },
      isShowPoster: {
        handler(val) {
          if (
            !this.isPortraitLive ||
            (this.embedVideo && this.isPortraitLive) ||
            (this.isSubscribe && this.isPortraitLive)
          ) {
            return;
          }
          if (
            this.isShowPoster &&
            (!this.noDelayWebinar || (!this.isInstanceInit && this.noDelayWebinar))
          ) {
            this.$domainStore.state.roomBaseServer.isWapBodyDocSwitchFullScreen = true;
          }
          if (!this.noDelayWebinar || (!this.isInstanceInit && this.noDelayWebinar)) {
            this.$nextTick(() => {
              window.$middleEventSdk?.event?.send(
                boxEventOpitons(this.cuid, 'emitPlayerPoster', [this.isShowPoster])
              );
            });
          }
          // 音频模式或者画质为音频
          if (this.isAudio || this.audioStatus) {
            this.$nextTick(() => {
              window.$middleEventSdk?.event?.send(
                boxEventOpitons(this.cuid, 'emitPlayerPosterAudio', [this.isShowPoster])
              );
            });
          }
        },
        immediate: true
      },
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
      isVodEnd(val) {
        this.$nextTick(() => {
          window.$middleEventSdk?.event?.send(
            boxEventOpitons(this.cuid, 'emitPlayerVodEnd', [val])
          );
        });
      },
      audioStatus: {
        handler(val) {
          this.$nextTick(() => {
            window.$middleEventSdk?.event?.send(
              boxEventOpitons(this.cuid, 'emitPlayerAudioStatus', [val])
            );
            window.$middleEventSdk?.event?.send(
              boxEventOpitons(this.cuid, 'emitPlayerPosterAudio', [this.isShowPoster])
            );
          });
        },
        immediate: true
      }
      // isAudio(val) {
      //   this.$nextTick(() => {
      //     window.$middleEventSdk?.event?.send(
      //       boxEventOpitons(this.cuid, 'emitPlayerIsAudio', [val])
      //     );
      //   });
      // }
    },
    beforeCreate() {
      this.roomBaseServer = useRoomBaseServer();
      // this.playerServer = usePlayerServer({ extra: true });
      this.subscribeServer = useSubscribeServer();
    },
    beforeDestroy() {
      this.playerState.isPlaying = false;
      this.playerServer.destroy();
    },
    async created() {
      this.playerServer = usePlayerServer({
        extra: this.warmUpVideoList.length > 1
      });
      this.roomBaseState = this.roomBaseServer.state;
      this.playerState = this.playerServer.state;
      this.embedObj = this.roomBaseState.embedObj;
      this.languageList = this.roomBaseServer.state.languages.langList;
      this.lang = this.roomBaseServer.state.languages.lang;
    },
    mounted() {
      let isMES = false;
      VhallPlayer.probe({}, data => {
        isMES = data.MediaSourceExtensions;
      });
      const { record } = this.roomBaseState.watchInitData;
      // 判断是否支持加密视频播放
      if (record && record.paas_record_id && record.encrypt_status == 2 && !isMES) {
        this.encrypt = false;
        return false;
      }
      this.getWebinerStatus();
      window.addEventListener(
        'fullscreenchange',
        () => {
          if (!document.fullscreenElement) {
            this.isFullscreen = false;
          }
        },
        true
      );
      // if (window.orientation == 90 || window.orientation == -90) {
      //   this.isOrientation = true;
      //   this.setFullscreen();
      // } else {
      //   this.isOrientation = false;
      // }
      // 直播结束音频直播改变播放器大小
      this.playerServer.$on('live_over', e => {
        if (this.isAudio) {
          console.log(e, '直播结束音频直播改变播放器大小');
          this.changePlayerSize(false);
          document.querySelector('.vmp-basic-bd').classList.remove('small_player');
        }
      });
      this.getIsConcise();
      this.setSetingHeight();

      if (this.isPortraitLive && !this.isLiving) {
        document.querySelector('.vmp-wap-player-footer').addEventListener('touchstart', e => {
          e.stopPropagation();
        });
        document.querySelector('.vmp-wap-player-footer').addEventListener('touchmove', e => {
          e.stopPropagation();
        });
        document.querySelector('.vmp-wap-player-footer').addEventListener('touchend', e => {
          e.stopPropagation();
        });
      }
    },
    methods: {
      clearScreen() {
        if (this.isPortraitLive && !this.embedVideo && !this.isSubscribe) {
          this.roomBaseServer.state.isClearScreen = !this.roomBaseServer.state.isClearScreen;
        }
      },
      // 文档播放器互换位置
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
        const skinInfo = this.roomBaseState.skinInfo;
        if (skinInfo?.skin_json_wap && skinInfo.skin_json_wap != 'null') {
          skin_json_wap = skinInfo.skin_json_wap;
        }
        if (skin_json_wap?.style == 3) {
          this.isConcise = true;
        } else {
          this.isConcise = false;
        }
      },
      /**
       * 计算 设置tab-content高度
       */
      setSetingHeight() {
        if (this.isSubscribe || this.isConcise || this.isPortraitLive) return;
        let htmlFontSize = document.getElementsByTagName('html')[0].style.fontSize;
        // postcss 换算基数为75 头部+播放器区域高为 522px
        let playerHeight = this.isSmallPlayer == true && !this.isWapBodyDocSwitch ? 130 : 422;
        let baseHeight = playerHeight + 71 + 90;
        let classname = '.tab-content';
        if (this.isEmbed) {
          baseHeight = playerHeight;
          classname = '.tab-content-embed';
        }
        const tabDom = document.querySelector(classname);
        if (tabDom) {
          const popHeight =
            document.body.clientHeight - (baseHeight / 75) * parseFloat(htmlFontSize) + 'px';
          tabDom.style.height = popHeight;
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
        console.log(this.imageCropperMode, '???mode');
      },
      startPlay() {
        this.isPlaying ? this.pause() : this.play();
      },
      // 播放
      play() {
        if (
          !this.isPortraitLive ||
          (this.embedVideo && this.isPortraitLive) ||
          (this.isSubscribe && this.isPortraitLive)
        ) {
          this.iconShow = false;
          this.fiveDown();
        }
        // 为了防止 播放器初始化还没完成，就点击了播放器按钮播放
        try {
          this.playerServer && this.playerServer.play();
        } catch (error) {
          console.log(error);
        }
      },
      // 暂停
      pause() {
        this.playerServer && this.playerServer.pause();
      },
      // 判断是直播还是回放 活动状态
      getWebinerStatus(info) {
        if (info && info.autoPlay) {
          this.isAutoPlay = info.autoPlay;
        }
        const { webinar, warmup, record } = this.roomBaseState.watchInitData;
        if (this.roomBaseState.watchInitData.status === 'live') {
          if (webinar.type === 1) {
            // 直播
            this.isLive = true;
            this.optionTypeInfo('live');
          } else if (webinar.type === 5 || webinar.type === 4) {
            // 回放
            this.optionTypeInfo('vod', this.roomBaseState.watchInitData.paas_record_id);
            this.recordHistoryTime = sessionStorage.getItem(
              this.roomBaseState.watchInitData.paas_record_id
            )
              ? Number(sessionStorage.getItem(this.roomBaseState.watchInitData.paas_record_id))
              : 0;
          }
        } else {
          if (webinar.type === 3) return; //结束状态
          // 1-直播中，2-预约，3-结束，4-点播，5-回放
          // 点播回放没有暖场，但是可能有试看
          if (webinar.type === 5 || webinar.type === 4) {
            // 试看
            this.vodType = 'shikan';
            this.isTryPreview = true;
            this.getShiPreview();
            this.optionTypeInfo('vod', record.preview_paas_record_id);
          } else {
            if (this.warmUpVideoList.length) {
              this.vodType = 'warm';
              this.isWarnPreview = true;
              this.optionTypeInfo('vod', this.warmUpVideoList[this.initIndex]);
            }
          }
        }
      },
      optionTypeInfo(type, id) {
        this.playerServer.setType(type);
        if (type === 'live') {
          this.vodOption = {};
          this.liveOption = {
            type: 'hls',
            roomId: this.roomBaseState.watchInitData.interact.room_id,
            forceMSE: isMse().supportMSE
          };
        } else {
          this.vodOption.recordId = id;
          this.liveOption = {};
        }
        if (this.isWarnPreview) {
          this.initPlayer();
        } else {
          this.initPlayerOtherInfo();
        }
      },
      // 初始化播放器配置项
      initConfig() {
        let params = {
          videoNode:
            this.warmUpVideoList.length < 2
              ? 'vmp-wap-player'
              : `vmp-wap-player-vod_${this.warmUpVideoList[this.initIndex]}`
        };
        if (this.playerState.type == 'live') {
          params = Object.assign(params, {
            liveOption: this.liveOption
          });
        } else if (this.playerState.type === 'vod') {
          params = Object.assign(params, {
            vodOption: this.vodOption
          });
          params.pursueOption = { enable: true };
        } else {
          throw new Error('参数异常--2');
        }
        if (!this.isWarnPreview) {
          params = Object.assign({}, params, this.getPlayerInfo());
        }
        return params;
      },
      // 初始化播放器
      async initPlayer() {
        const defineQuality = this.setDefaultQuality();
        if (this.playerState.type == 'live') {
          this.liveOption.defaultDefinition = defineQuality || '';
        } else if (this.playerState.type == 'vod') {
          this.vodOption.defaultDefinition = defineQuality || '';
        }
        const params = await this.initConfig();
        return this.playerServer.init(params).then(() => {
          console.log(params, '播放器wap初始化成功123');
          this.playerServer.openControls(false);
          this.playerServer.openUI(false);
          this.getQualitys(); // 获取清晰度列表和当前清晰度
          this.listenEvents(); // 监听断点续播事件
          this.getListenPlayer(); // 监听播放器播放、暂停等事件
          if (this.playerState.type == 'vod') {
            this.eventPointList = this.playerServer.state.markPoints;
            this.getRecordTotalTime(); // 获取视频总时长
            if (!this.isWarnPreview) {
              this.initSlider(); // 初始化播放进度条
              this.getInitSpeed(); // 获取倍速列表和当前倍速
            }
            if (this.playerOtherOptions.autoplay == 1 && !this.isWarnPreview) {
              this.play();
            }
          } else {
            if (this.isAutoPlay || this.playerOtherOptions.autoplay == 1) {
              this.play();
            }
          }
          window.$middleEventSdk?.event?.send(
            boxEventOpitons(this.cuid, 'emitPlayerQuality', [
              this.currentQualitys,
              this.qualitysList
            ])
          );
          window.$middleEventSdk?.event?.send(
            boxEventOpitons(this.cuid, 'emitPlayerSpeed', [this.currentSpeed, this.UsableSpeed])
          );
          // this.$nextTick(() => {
          //   if (this.water && this.water.watermark_open == 1 && !this.isWarnPreview) {
          //     const watermarkContainer = document.getElementById('vh-watermark-container');
          //     watermarkContainer && (watermarkContainer.style.width = '80px');
          //     const waterMark = document.getElementById('vh-watermark');
          //     waterMark && (waterMark.style.height = '35px');
          //   }
          // });
          try {
            document.getElementsByTagName('video')[0].setAttribute('x5-video-player-type', 'h5');
          } catch (e) {
            console.log(e);
          }
        });
      },
      initPlayerOtherInfo() {
        const unionConfig = this.roomBaseServer.state.unionConfig;
        this.definitionConfig = unionConfig.definition.data.default_definition;
        this.marquee = unionConfig['screen-config'] && unionConfig['screen-config'].data;
        this.water = unionConfig['water-mark'] && unionConfig['water-mark'].data;
        this.playerOtherOptions = unionConfig['basic-config'] && unionConfig['basic-config'].data;
        window.$middleEventSdk?.event?.send(
          boxEventOpitons(this.cuid, 'emitPlayerOtherOptions', [this.playerOtherOptions])
        );
        this.initPlayer();
        // const { webinar } = this.roomBaseState.watchInitData;
        // this.playerServer
        //   .getPlayerConfig({
        //     webinar_id: webinar.id,
        //     tags: ['basic-config', 'definition', 'screen-config', 'water-mark']
        //   })
        //   .then(res => {
        //     if (res.code == 200) {
        //       this.definitionConfig = res.data.definition.data.default_definition;
        //       this.marquee = res.data['screen-config'] && res.data['screen-config'].data;
        //       this.water = res.data['water-mark'] && res.data['water-mark'].data;
        //       this.playerOtherOptions = res.data['basic-config'] && res.data['basic-config'].data;
        //       this.initPlayer();
        //     }
        //   });
      },
      // 获取跑马灯、水印等播放器配置
      getPlayerInfo() {
        const { join_info } = this.roomBaseState.watchInitData;
        let playerParams = {
          marqueeOption: {
            text: '',
            enable: false
          },
          watermarkOption: {
            enable: false
          }
        };
        // 跑马灯
        if (
          this.marquee &&
          this.marquee.scrolling_open == 1 &&
          (!this.isPortraitLive || (this.embedVideo && this.isPortraitLive))
        ) {
          let marqueeText = '';
          if (this.marquee.text_type == 1) {
            marqueeText = this.marquee.text;
          } else {
            let text = '';
            if (join_info.join_id) {
              text = `${join_info.join_id}-${join_info.nickname}`;
            } else {
              let userInfo = localStorage.getItem('userInfo');
              if (userInfo) {
                try {
                  userInfo = JSON.parse(localStorage.getItem('userInfo'));
                  text = `${userInfo?.user_id}-${userInfo?.nick_name}`;
                } catch (err) {
                  console.log(err);
                }
              } else {
                text = '';
              }
            }
            marqueeText = `${text}`;
          }
          playerParams.marqueeOption = {
            enable: Boolean(marqueeText),
            text: marqueeText, // 跑马灯的文字
            alpha: this.marquee.alpha, // 透明度,100完全显示,0 隐藏
            size: this.marquee.size, // 文字大小
            color: this.marquee.color, // 文字颜色
            interval: this.marquee.scroll_type == 1 ? this.marquee.interval : 1, // 下次跑马灯开始与本次结束的时间间隔 ， 秒为单位
            speed: this.marquee.speed || 6000, // 跑马灯移动速度:3000快,6000中,10000慢
            displayType: this.marquee.scroll_type == 1 ? 0 : 1,
            position: this.marquee.position // 跑马灯位置 , 1 随机 2上,3中 4下
          };
        }
        // 水印
        if (
          this.water &&
          this.water.watermark_open == 1 &&
          (!this.isPortraitLive || (this.embedVideo && this.isPortraitLive))
        ) {
          const alianMap = new Map([
            [1, 'tl'],
            [2, 'tr'],
            [3, 'br'],
            [4, 'bl']
          ]);
          const align = alianMap.get(parseInt(this.water.img_position));

          playerParams.watermarkOption = {
            enable: true,
            url: this.water.img_url, // 水印图片的路径
            align, // 图片的对其方式， tl | tr | bl | br 分别对应：左上，右上，左下，右下
            position: ['20px', '20px'], // 对应的横纵位置，支持px,vh,vw,%
            size: ['8%'], // 水印大小，支持px,vh,vw,%
            alpha: this.water.img_alpha
          };
        }
        return playerParams;
      },
      getDuanxuPreview() {
        let endTime;
        const parsedTotalTime = parseInt(this.totalTime);
        if (this.recordHistoryTime != '') {
          endTime = parseFloat(this.recordHistoryTime);
          const parsedEndTime = parseInt(this.recordHistoryTime);
          if (endTime && endTime != 'undefined' && parsedTotalTime != parsedEndTime) {
            const seekTime = endTime < 6 ? 0 : endTime - 5;
            if (seekTime) {
              this.isPickupVideo = true;
              setTimeout(() => {
                this.isPickupVideo = false;
              }, 5000);
            }
            this.setVideoCurrentTime(seekTime);
          }
        } else {
          endTime = this.isWarnPreview
            ? window.sessionStorage.getItem(sessionStorage.getItem('warm_recordId'))
            : window.sessionStorage.getItem(this.vodOption.recordId);
          const parsedEndTime = parseInt(endTime);
          if (endTime && endTime != 'undefined' && parsedTotalTime != parsedEndTime) {
            const seekTime = endTime < 6 ? 0 : endTime - 5;
            this.setVideoCurrentTime(seekTime);
          }
        }
      },
      refresh() {
        window.location.reload();
      },
      handleAuth(type) {
        let params = {
          type: this.authText == 6 ? type : this.roomBaseServer.state.watchInitData.webinar.verify
        };
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitCheckAuth', params));
      },
      openSpeed() {
        if (this.isPortraitLive && !this.isLiving && !this.embedVideo && !this.isSubscribe) {
          if (this.isWapBodyDocSwitchFullScreen) {
            window.$middleEventSdk?.event?.send(
              boxEventOpitons(this.cuid, 'emitPlayerOpenSpeed', [true])
            );
          } else {
            this.showSpeedCard = true;
          }
        } else {
          this.iconShow = true;
          this.isOpenSpeed = true;
        }
      },
      openQuality() {
        // 竖屏直播-回放
        if (this.isPortraitLive && !this.isLiving && !this.embedVideo && !this.isSubscribe) {
          if (this.isWapBodyDocSwitchFullScreen) {
            window.$middleEventSdk?.event?.send(
              boxEventOpitons(this.cuid, 'emitPlayerOpenQuality', [true])
            );
          } else {
            this.showQualityCard = true;
          }
        } else {
          this.isOpenQuality = true;
          this.iconShow = true;
        }
      },
      videoShowIcon() {
        if (
          !this.isPortraitLive ||
          (this.embedVideo && this.isPortraitLive) ||
          (this.isSubscribe && this.isPortraitLive)
        ) {
          this.iconShow = false;
          this.isOpenQuality = false;
          this.isOpenSpeed = false;
          this.isOpenlang = false;
          this.fiveDown();
        }
      },
      fiveDown() {
        // 5秒后消失
        clearTimeout(this.setIconTime);
        this.setIconTime = setTimeout(() => {
          this.iconShow = true;
        }, 5000);
      },
      // 切换多语言
      changeLang(key) {
        this.isOpenlang = false;
        this.saveLang(key);
      },
      openLanguage() {
        this.iconShow = true;
        this.isOpenlang = true;
      },
      showLabelFun(eventTime) {
        this.sliderVal = (eventTime / this.totalTime) * 100;
        this.playerServer.setCurrentTime(eventTime, () => {
          this.$toast('调整播放时间失败');
        });
        this.playerServer.play();
      },
      replay() {
        this.isVodEnd = false;
        this.startPlay();
      },
      // 改变播放器大小
      changePlayerSize(data) {
        console.log(data, 'data');
        this.isSmallPlayer = data;
        this.playerServer.setPlayerSize(data);
        window.$middleEventSdk?.event?.send(
          boxEventOpitons(this.cuid, 'emitChangeChatHeight', [data])
        );
      },
      // 修改多语言
      updateLang() {
        const newLang = this.languageList[this.lang.key == 1 ? 1 : 0];
        this.saveLang(newLang.key);
      },
      // 储存多语言
      saveLang(key) {
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
      changePreQualitys(item) {
        this.showQualityCard = false;
        this.changeQualitys(item);
      },
      changePreSpeeds(item) {
        this.showSpeedCard = false;
        this.changeSpeed(item);
      },
      getDocScreen(val) {
        this.docScreen = val;
      },
      changeChatSendBox(val) {
        this.chatSendBoxVisible = val;
      },
      changeQaVisible(val) {
        this.qaVisible = val;
      }
    }
  };
</script>
<style lang="less">
  @import url(./skins/wap-player.concise.less);
  .vmp-wap-player {
    height: 100%;
    width: 100%;
    &-video {
      height: 100%;
      width: 100%;
      position: relative;
      .foot_control {
        position: absolute;
        width: 100%;
        height: 100%;
        bottom: 0%;
        color: #fff;
        display: flex;
        justify-content: space-between;
        align-items: center;
        z-index: 11;
        padding-left: 24px;
        top: 52%;
        transform: translate(0, -50%);
        background: url('./img/smallPlayer.png');
        background-size: 100% 100%;
        .control_left {
          display: flex;
          .pos {
            position: relative;
            .vh-iconfont {
              position: absolute;
              font-size: 32px;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
            }
          }
          .control_center {
            padding-left: 16px;
            padding-top: 4px;
            font-size: 24px;
            .status_tip {
              position: absolute;
              top: 50%;
              transform: translate(0, -50%);
            }
            .player_time {
              position: relative;
              top: 8px;
            }
          }
        }
        .control_right {
          padding-right: 24px;
          .set_center {
            padding-right: 32px;
          }
        }
      }
    }
    .player-encrypt {
      width: 100%;
      height: 100%;
      background-repeat: no-repeat;
      background-size: 100% 100%;
      &_box {
        height: 100%;
        width: 100%;
        background: rgba(0, 0, 0, 0.8);
      }
      &_img {
        position: absolute;
        width: 250px;
        top: 45%;
        left: 50%;
        transform: translate(-50%, -50%);
      }
      &_tip {
        text-align: center;
        position: absolute;
        width: 100%;
        top: 280px;
        color: #fff;
      }
    }
    &-opcity-flase {
      // opacity: 0;
      display: none;
      transition: all 1s;
      -webkit-transition: all 1s;
    }
    .vhallPlayerh5-shadow,
    .vh-playBtnContainer {
      display: none !important;
    }
    #vh-watermark-container {
      width: 80px !important;
    }
    #vh-watermark {
      height: 35px !important;
    }
    &-opcity-true {
      opacity: 1;
      transition: all 1s;
      z-index: 6;
      -webkit-transition: all 1s;
    }
    &-prompt {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      background: rgb(0, 0, 0);
      font-size: 28px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: rgba(255, 255, 255, 1);
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      z-index: 5;
      // &-text {
      //   margin-top: 20px;
      // }
      &-poster {
        width: 100%;
        height: 100%;
        object-fit: fill;
        z-index: 3;
        &.player_bg_2 {
          object-fit: cover;
          object-position: left top;
        }
        &.player_bg_3 {
          object-fit: contain;
          object-position: center;
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
      z-index: 12;
      background: transparent;
      p {
        width: 108px;
        height: 108px;
        border-radius: 50%;
        background: rgba(0, 0, 0, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        i {
          font-size: 46px;
          color: #f5f5f5;
        }
      }
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
      z-index: 4;
      cursor: pointer;
      .vh-iconfont {
        font-size: 30px;
      }
    }
    &-ending {
      background-repeat: no-repeat;
      background-size: 100% 100%;
      background-position: center;
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
      z-index: 10;
      &.ending_bg_3 {
        background-size: contain;
      }
      &.ending_bg_2 {
        background-size: cover;
        background-position: left top;
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
          padding-top: 18px;
        }
        &-noraml {
          background: rgba(0, 0, 0, 0.6);
          border-radius: 50%;
          width: 80px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
          cursor: pointer;
          i {
            font-size: 34px;
            color: #fff;
          }
        }
        &-reset {
          width: 200px;
          height: 64px;
          line-height: 64px;
          text-align: center;
          color: #fff;
          border-radius: 32px;
          background: #fb3a32;
        }
        &-title {
          color: #fff;
          font-size: 28px;
        }
        &-try {
          padding: 24px 0;
          span {
            display: inline-block;
            background: #fb3a32;
            color: #fff;
            height: 56px;
            line-height: 56px;
            font-size: 24px;
            border-radius: 32px;
            text-align: center;
            b {
              font-weight: normal;
            }
          }
          p {
            span {
              width: 140px;
            }
          }
          &-pay {
            margin-right: 12px;
          }
          &-see {
            font-size: 24px;
            padding: 0 24px;
            color: #fff;
            margin: 20px 0;
          }
        }
      }
    }
    &-header {
      top: 24px;
      display: flex;
      justify-content: space-between;
      padding: 0 24px;
      color: #fff;
      width: 100%;
      position: absolute;
      font-size: 28px;
      z-index: 5;
      .hot_num {
        border-radius: 44px;
        height: 36px;
        line-height: 36px;
        padding: 0 16px;
        text-align: center;
        margin-left: 20px;
        background: rgba(0, 0, 0, 0.5);
        i {
          vertical-align: bottom;
          font-size: 28px;
          margin-right: 4px;
        }
      }
      .language_btn {
        padding: 0 14px;
        i {
          font-size: 24px;
        }
      }
      &.opcity-flase {
        // opacity: 0;
        display: none;
        transition: all 1s;
        -webkit-transition: all 1s;
      }
      &.opcity-true {
        opacity: 1;
        transition: all 1s;
        z-index: 6;
        -webkit-transition: all 1s;
      }
      .vh-line-arrow-left {
        font-size: 32px;
        line-height: 48px;
      }
    }
    &-tips {
      padding: 24px;
      background: rgba(0, 0, 0, 0.7);
      border-radius: 100px;
      position: absolute;
      left: 50%;
      bottom: 75px;
      font-size: 28px;
      font-weight: 400;
      color: #fff;
      text-align: center;
      z-index: 2;
      transform: translateX(-50%);
      span {
        color: #fff;
        padding-left: 5px;
      }
      .red {
        color: #fb2626;
      }
    }
    &-audie {
      position: absolute;
      top: 0;
      width: 100%;
      height: 100%;
      background: url('./img/video.gif') no-repeat;
      background-size: 100% 100%;
      p {
        font-size: 28px;
        color: #fff;
        margin-top: 40%;
        text-align: center;
      }
    }
    &-control {
      bottom: -1px;
      background: linear-gradient(180deg, rgba(56, 56, 56, 0) 0%, #1a1a1a 100%);
      height: 80px;
      color: #fff;
      font-size: 28px;
      width: 100%;
      position: absolute;
      z-index: 7;
      padding: 0 32px;
      &-preview {
        // height: 64px;
        color: #fff;
        line-height: 36px;
        font-size: 24px;
        position: absolute;
        bottom: 100px;
        left: 32px;
        z-index: 5;
        background: rgba(0, 0, 0, 0.7);
        box-shadow: 0px 4px 8px 0px rgba(118, 118, 118, 0.2);
        border-radius: 32px 32px 32px 0px;
        padding: 5px 24px;
        &-red {
          color: #fb2626;
          margin: 0px 4px;
        }
        i {
          font-size: 18px;
          color: #fff;
          padding-left: 14px;
          cursor: pointer;
        }
      }
      &-slider {
        width: 100%;
        margin-top: 10px;
        border-radius: 2px;
        .van-slider__button-wrapper {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: block;
          img {
            position: absolute;
            left: 0%;
            top: 0%;
            width: 100%;
          }
        }
      }
      &-icons {
        font-size: 24px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: 15px;
        .vh-iconfont {
          font-size: 32px;
        }
        &-left {
          // vertical-align: middle;
          .vh-line-left-vod {
            vertical-align: text-top;
          }
          .vh-line-refresh-left,
          &-time {
            padding-left: 15px;
          }
          .vh-line-refresh-left {
            font-size: 28px;
            // vertical-align: bottom;
          }
        }
        &-right {
          display: flex;
          align-items: center;
          span {
            margin-left: 34px;
            vertical-align: middle;
          }
          .language_btn {
            display: none;
          }
          .icons-quality {
            padding: 0 12px;
            border: 3px solid #fff;
            border-radius: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 32px;
            font-size: 20px;
          }
          .barrage {
            font-size: 34px;
            position: relative;
            top: 2px;
          }
        }
        // .icon-zanting_icon{
        //   font-size: 34px;
        //   vertical-align: middle;
        // }
      }
    }
    &-popup {
      &.van-popup {
        padding-bottom: 30px;
      }
      ul {
        display: flex;
        width: 100%;
        height: 100%;
        flex-direction: column;
        justify-content: center;
        flex-wrap: wrap;
        // padding: 30px 0;
        li {
          width: 100%;
          height: 100px;
          line-height: 100px;
          font-size: 28px;
          font-family: PingFangSC-Regular, PingFang SC;
          font-weight: 400;
          color: #262626;
          text-align: center;
          &.popup-active {
            color: #fb2626;
          }
        }
      }
    }
    &-popup_other {
      width: 200px;
      position: absolute !important;
      // transform: none;
      height: 100%;
      // top: 0;
      background: rgba(0, 0, 0, 0.7) !important;
      ul {
        display: flex;
        width: 100%;
        height: 100%;
        flex-direction: column;
        justify-content: center;
        flex-wrap: wrap;
        /* padding: 30px 0; */
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
    &.isAudio {
      .playerBox video {
        visibility: hidden;
      }
    }
  }

  // js动态添加播放器收起样式
  .vmp-basic-container {
    .small_player {
      height: 130px !important;
    }
  }

  .vmp-wap-body-mini .vmp-wap-player-pause p {
    width: 54px;
    height: 54px;
    i {
      font-size: 24px;
    }
  }

  .isPortraitLive {
    .vmp-wap-player-prompt-poster {
      object-fit: contain;
    }
    .isVod {
      .vmp-wap-player-footer {
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 100px;
        display: block !important;
        z-index: 99;
        &.hide {
          display: none !important;
        }
        &.hasIosSafeArea {
          .vmp-wap-player-control {
            height: calc(100px + constant(safe-area-inset-bottom));
            height: calc(100px + env(safe-area-inset-bottom));
          }
        }
        .vmp-wap-player-control {
          height: 85px;
        }
        .vmp-wap-player-control-icons {
          padding-top: 22px;
        }
        .vmp-wap-player-control-slider {
          margin-top: 0;
        }

        .vmp-wap-player-control-icons-right {
          display: flex;
          align-items: center;
          span {
            margin-left: 32px;
            vertical-align: middle;
          }
          .box {
            border: 3px solid #fff;
            border-radius: 24px;
            display: flex;
            align-items: center;
            height: 32px;
            min-width: 63px;
            justify-content: center;
            padding: 0;
            font-size: 20px;
          }
          .language_btn {
          }
          .icons-quality {
            font-size: 20px;
          }
          .barrage {
            font-size: 36px;
          }
        }
      }
    }
    .vmp-wap-player__app {
      .playerBox video {
        object-fit: cover;
      }
    }

    .vmp-wap-player-video > .vmp-wap-player-ending {
      background: none !important;
      &-box {
        background: none !important;
      }
    }
  }
</style>

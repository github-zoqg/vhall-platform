<template>
  <div
    v-if="!isShowContainer"
    :class="[
      'vmp-player',
      {
        'is-watch': isWatch,
        'vmp-player-embed': isEmbedVideo,
        'vmp-player-embedFull': isEmbed && !isEmbedVideo
      },
      isSubscribe ? '' : `vmp-player--${displayMode}`
    ]"
    @mousemove="wrapEnter"
    @mouseleave="wrapLeave"
  >
    <div
      :id="
        warmUpVideoList.length < 2 ? 'vmp-player' : `vmp-player-vod_${warmUpVideoList[initIndex]}`
      "
      class="vmp-player-watch"
      ref="playerWatch"
    >
      <template class="vmp-player-living">
        <!-- 背景图片 -->
        <div
          v-if="isShowPoster"
          class="vmp-player-living-background"
          v-parseImgOss="{ type: 'bg', url: webinarsBgImg }"
          :style="`backgroundImage: url('${webinarsBgImg}')`"
        ></div>
        <!-- 暖场视频播放按钮 -->
        <div
          v-if="isEmbed && isSubscribe && isWarnPreview && !isPlaying"
          class="vmp-player-living-play"
        >
          <div class="vmp-player-living-play-normal" @click="startPlay">
            <i class="vh-iconfont vh-line-video-play"></i>
          </div>
        </div>
        <!-- 直播、回放播放按钮 -->
        <template v-else>
          <div class="vmp-player-living-btn" v-if="!isPlaying && !isVodEnd">
            <div
              :class="
                displayMode == 'mini'
                  ? 'vmp-player-living-btn-mini'
                  : 'vmp-player-living-btn-normal'
              "
              @click="startPlay"
            >
              <i class="vh-iconfont vh-line-video-play"></i>
            </div>
          </div>
        </template>

        <div class="vmp-player-living-vodend" v-if="isVodEnd">
          <div class="vmp-player-living-vodend-try" v-if="isTryPreview">
            <h3>{{ $t('appointment.appointment_1013') }}</h3>
            <div>
              <p v-if="authText == 6">
                <span @click="authTryWatch(3)">
                  {{ $t('appointment.appointment_1010') }}
                </span>
                {{ $t('interact.interact_1020') }}
                <span style="margin-left: 10px" @click="authTryWatch(4)">
                  {{ $t('appointment.appointment_1011') }}
                </span>
              </p>
              <span v-else @click="authTryWatch">{{ authText }}</span>
            </div>
            <p class="replay-try" @click="replayPlay">
              <i class="vh-iconfont vh-line-refresh-left">
                {{ $t('appointment.appointment_1014') }}
              </i>
            </p>
          </div>
          <div class="vmp-player-living-vodend-isNoTry" v-else>
            <div
              :class="
                displayMode == 'mini'
                  ? 'vmp-player-living-vodend-mini'
                  : 'vmp-player-living-vodend-normal '
              "
            >
              <i class="vh-iconfont vh-line-refresh-left"></i>
            </div>
            <span
              :class="displayMode == 'mini' ? 'repay--mini' : 'repay--normal'"
              @click="replayPlay"
            >
              {{ $t('player.player_1016') }}
            </span>
          </div>
        </div>
        <div class="vmp-player-living-audio" v-if="isAudio || audioStatus">
          <div>{{ $t('player.player_1014') }}</div>
        </div>
        <div
          class="vmp-player-living-exchange"
          @click="exchangeVideoDocs"
          v-if="isVisibleMiniElement && hoveVideo && !isVodEnd && !isEmbedVideo"
        >
          <p>
            <el-tooltip :content="$t('player.player_1008')" placement="top">
              <i class="vh-saas-iconfont vh-saas-line-switch"></i>
            </el-tooltip>
          </p>
        </div>
      </template>
      <!-- 控制条 进度条、弹幕、全屏、时间等 -->
      <div
        v-show="isPlaying"
        :class="[
          { 'active-control': hoveVideo, 'previre-control': isTryPreview },
          displayMode == 'mini' ? 'vmp-player-controllerMini' : 'vmp-player-controller'
        ]"
        @mouseenter="controllerMouseEnter"
        @mouseleave="controllerMouseLeave"
      >
        <!-- 进度条 -->
        <div
          class="controller_slider"
          v-if="!isLiving && playerOtherOptions.progress_bar && !isWarnPreview"
        >
          <el-slider
            ref="controllerRef"
            class="slider_controller"
            v-model="sliderVal"
            :show-tooltip="false"
            :step="1 / Math.floor(totalTime)"
            @change="changeVideo"
            @mousedown.native="handleSliderMouseDown"
          ></el-slider>
        </div>
        <div
          v-if="totalTime && eventPointList.length && !isWarnPreview"
          ref="vhTailoringWrap"
          class="vmp-player-controller-points"
        >
          <controlEventPoint
            v-for="(item, index) in eventPointList"
            :key="'controlEventPoint' + index"
            :event-time="item.timePoint"
            :event-label="item.msg"
            :video-time="totalTime"
            :isMini="displayMode == 'mini'"
            @showLabel="showLabelFun"
          ></controlEventPoint>
        </div>
        <div class="controller-tools">
          <div class="controller-tools-left">
            <div class="controller-tools-left-start" @click="startPlay">
              <i
                :class="`vh-iconfont ${isPlaying ? 'vh-a-line-videopause' : 'vh-line-video-play'}`"
              ></i>
            </div>
            <div class="controller-tools-left-time" v-if="!isLiving && !isWarnPreview">
              <template v-if="totalTime > 0">
                <span class="controller-tools-left-time-current">
                  {{ currentTime | secondToDate }}
                </span>
                <span>/</span>
                <span class="controller-tools-left-time-total">{{ totalTime | secondToDate }}</span>
              </template>
              <template v-else>
                <span>--:--/--:--</span>
              </template>
            </div>
          </div>
          <div class="controller-tools-right">
            <div
              class="controller-tools-right-lang"
              v-if="isEmbedVideo && languageList.length > 1 && !isSubscribe"
            >
              <span>{{ lang.label }}</span>
              <ul class="controller-tools-right-list controller-lang">
                <li
                  v-for="(item, index) in languageList"
                  :class="{ 'vmp-player-li-active': item.key == lang.key }"
                  @click="changeLanguage(item.key)"
                  :key="index"
                >
                  {{ item.label }}
                </li>
              </ul>
            </div>
            <div class="controller-tools-right-quality" v-if="!isWarnPreview && !isTryPreview">
              <span>{{ formatQualityText(currentQualitys.def) }}</span>
              <ul class="controller-tools-right-list">
                <li
                  v-for="(item, index) in qualitysList"
                  :class="{ 'vmp-player-li-active': currentQualitys.def == item.def }"
                  @click="changeQualitys(item)"
                  :key="index"
                >
                  {{ formatQualityText(item.def) }}
                </li>
              </ul>
            </div>
            <div
              class="controller-tools-right-speed"
              v-if="!isLiving && !isWarnPreview && playerOtherOptions.speed"
            >
              <span>
                {{currentSpeed == 1 ? $t('player.player_1007') : currentSpeed.toString().length &lt; 3 ? `${currentSpeed.toFixed(1)}X` : `${currentSpeed}X`}}
              </span>
              <ul class="controller-tools-right-list">
                <li
                  v-for="(val, index) in UsableSpeed"
                  :class="{ 'vmp-player-li-active': currentSpeed == val }"
                  @click="changeSpeed(val)"
                  :key="index"
                >
                  {{val.toString().length &lt; 3 ? `${val.toFixed(1)}X` : `${val}X`}}
                </li>
              </ul>
            </div>
            <div class="controller-tools-right-volume">
              <i
                :class="`vh-iconfont ${voice > 0 ? 'vh-line-voice' : 'vh-line-mute'}`"
                @click="jingYin"
              ></i>
              <div class="controller-tools-right-volume-slider">
                <el-slider v-model="voice" vertical height="100px" :show-tooltip="true"></el-slider>
              </div>
            </div>
            <div
              class="controller-tools-right-danmuis"
              v-if="!isWarnPreview && playerOtherOptions.barrage_button"
            >
              <i
                :class="`vh-iconfont ${danmuIsOpen ? 'vh-line-barrage-on' : 'vh-line-barrage-off'}`"
                @click="openBarrage"
              ></i>
            </div>
            <div class="controller-tools-right-fullscroll" v-if="!isWarnPreview">
              <i
                :class="`vh-iconfont ${
                  isFullscreen ? 'vh-a-line-exitfullscreen' : 'vh-a-line-fullscreen'
                }`"
                @click="enterFullscreen"
              ></i>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="vmp-player-tips">
      <div class="vmp-player-tips-box" v-if="isSetQuality || isSetSpeed">
        <!-- 切换清晰度 -->
        <div v-if="isSetQuality">
          {{ $t('player.player_1009') }}
          <span>{{ formatQualityText(currentQualitys.def) }}</span>
        </div>
        <!-- 切换倍速 -->
        <div v-if="isSetSpeed">
          <i18n path="player.player_1015" style="color: #fff">
            <span place="n">
              {{ currentSpeed == 1 ? $t('player.player_1025') : currentSpeed }}
            </span>
          </i18n>
        </div>
      </div>
      <!-- 试看和断点续播提示 -->
      <div class="vmp-player-tips-prew" v-if="displayMode != 'mini' && isPlaying">
        <!-- 试看 -->
        <div v-if="vodType === 'shikan' && isTryPreview">
          <i18n path="appointment.appointment_1012">
            <span class="red" place="n">{{ recordTime }}</span>
          </i18n>
          <span v-if="authText == 6">
            <b @click="authTryWatch(3)">{{ $t('appointment.appointment_1010') }}</b>
            <i style="color: #fff">{{ $t('interact.interact_1020') }}</i>
            <b @click="authTryWatch(4)">{{ $t('appointment.appointment_1011') }}</b>
          </span>
          <span v-else class="red" @click="authTryWatch()">{{ authText }}</span>
          <i class="vh-iconfont vh-line-close" @click="vodType = ''"></i>
        </div>
        <!-- 断点续播 -->
        <div v-if="isPickupVideo && currentTime > 0">
          <i18n path="player.player_1012">
            <span place="n" class="red">{{ currentTime | secondToDate }}</span>
          </i18n>
          <i class="vh-iconfont vh-line-close" @click="isPickupVideo = false"></i>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  import { useRoomBaseServer, usePlayerServer, useSubscribeServer } from 'middle-domain';
  import { computeRecordTime, windowVersion } from './js/utils';
  import playerMixins from './js/mixins';
  import controlEventPoint from '../src/components/control-event-point.vue';
  import { boxEventOpitons, isIE } from '@/app-shared/utils/tool.js';
  import { cropperImage } from '@/app-shared/utils/common';
  import swfList from './js/swf-list.js';
  const ossimg = '?x-oss-process=image/resize,m_fill,w_1920,h_1080';
  export default {
    name: 'VmpPcPlayer',
    mixins: [playerMixins],
    components: {
      controlEventPoint
    },
    data() {
      const initIndex = this.subscribeServer.state.initIndex;
      return {
        displayMode: 'normal', // normal: 正常; mini: 小屏; fullscreen:全屏
        // isPlaying: false, // 是否是播放状态
        isShowPoster: true, //是否展示活动图片背景
        vodType: '', //回放的类型 暖场视频还是还是试看
        liveOption: {}, //直播时播放器liveOption参数
        vodOption: {}, //回放时回放id
        voice: 60, //声音
        sliderVal: 0, //进度条显示
        totalTime: 0, // 视频总时长
        currentSpeed: 1, // 当前倍速
        currentQualitys: {
          def: 'same'
        }, // 当前清晰度
        currentTime: 0, // 视频当前播放时长
        definitionConfig: '360p', //默认清晰度
        audioStatus: false, // 选中清晰度是否是音频模式
        qualitysList: [], //清晰度列表
        UsableSpeed: [], // 视频倍速列表
        danmuIsOpen: false, // 弹幕是否开启
        isFullscreen: false, // 是否是全屏
        isSetSpeed: false, // 是否切换倍速
        isSetQuality: false, // 是否切换清晰度
        recordTime: 0, // 试看的时间
        isTryPreview: false, // 是否是试看
        authText: '', // 试看的权限判断
        isWarnPreview: false, // 是否是暖场视频
        isPickupVideo: false, // 是否是断点续播
        recordHistoryTime: '', // 记录播放的时间
        endTime: '', // 播放到结束时刷新页面
        eventPointList: [], //
        hoveVideo: true, //显示控制条
        isLivingEnd: false, // 直播结束
        isVodEnd: false, // 回放结束
        isAutoPlay: false,
        lang: {},
        languageList: [],
        marquee: {}, // 跑马灯
        water: {}, //水印
        agreement: false,
        playerOtherOptions: {
          barrage_button: 0,
          progress_bar: 0,
          speed: 0,
          autoplay: false
        }, //播放器配置
        initIndex
      };
    },
    beforeCreate() {
      this.roomBaseServer = useRoomBaseServer();
      this.subscribeServer = useSubscribeServer();
    },
    beforeDestroy() {
      this.playerState.isPlaying = false;
      this.playerServer.destroy();
    },
    computed: {
      // 是否观看端
      isWatch() {
        return !['send', 'record'].includes(this.roomBaseServer.state.clientType);
      },
      //判断是否是音频直播模式
      isAudio() {
        return this.roomBaseServer.state.watchInitData.webinar.mode == 1;
      },
      // 是否正在直播
      isLiving() {
        return this.$domainStore.state.roomBaseServer.watchInitData.webinar.type == 1;
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
      // 背景图片
      webinarsBgImg() {
        const cover = '//cnstatic01.e.vhall.com/static/images/mobile/video_default_nologo.png';
        const { warmup, webinar } = this.roomBaseServer.state.watchInitData;
        let webinarUrl = cover;
        if (webinar.img_url) {
          if (cropperImage(webinar.img_url)) {
            webinarUrl = webinar.img_url;
          } else {
            webinarUrl = webinar.img_url + ossimg;
          }
        }
        if (this.warmUpVideoList.length) {
          if (warmup.warmup_img_url) {
            if (cropperImage(warmup.warmup_img_url)) {
              return warmup.warmup_img_url;
            } else {
              return warmup.warmup_img_url + ossimg;
            }
          } else {
            return webinarUrl;
          }
        } else {
          return webinarUrl;
        }
      },
      isShowContainer() {
        if (this.isSubscribe && this.warmUpVideoList.length > 0) {
          // 预约页，有暖场视频，一定初始化播放器； 解决无延迟直播开播之后，没有通过观看限制，暖场视频看不了的问题
          return false;
        } else {
          return (
            !this.$domainStore.state.interactiveServer.initInteractiveFailed &&
            (this.$domainStore.state.roomBaseServer.watchInitData.webinar.no_delay_webinar == 1 ||
              this.$domainStore.state.micServer.isSpeakOn ||
              this.isLivingEnd) &&
            this.$domainStore.state.roomBaseServer.watchInitData.webinar.type == 1
          );
        }
      },
      isVisibleMiniElement() {
        // 添加插播桌面共享后，再添加插播桌面共享场景的处理
        return (
          this.$domainStore.state.docServer.switchStatus &&
          this.$domainStore.state.roomBaseServer.interactToolStatus.speakerAndShowLayout != 1
        );
      },
      isSubscribe() {
        return (
          this.$domainStore.state.roomBaseServer.watchInitData.status == 'subscribe' &&
          !this.$domainStore.state.roomBaseServer.watchInitData.record.preview_paas_record_id
        );
      },
      // 是否是嵌入
      isEmbed() {
        return this.$domainStore.state.roomBaseServer.embedObj.embed;
      },
      isEmbedVideo() {
        // 是不是单视频嵌入
        return this.$domainStore.state.roomBaseServer.embedObj.embedVideo;
      },
      // 播放状态
      isPlaying() {
        return this.$domainStore.state.playerServer.isPlaying;
      }
    },
    watch: {
      voice(newVal) {
        this.playerServer.setVolume(newVal, () => {
          console.log('设置音量失败');
        });
      },
      hoveVideo(newValue) {
        if (newValue) {
          clearTimeout(this.hoverVideoTimer);
          this.hoverVideoTimer = setTimeout(() => {
            this.hoveVideo = false;
          }, 3000);
        }
      },
      ['roomBaseServer.state.miniElement'](newval) {
        if (!this.isEmbedVideo) {
          this.displayMode = newval === 'player' ? 'mini' : 'normal';
        }
      },
      playIndex() {
        // 暖场视频才监听播放的顺序
        if (!this.isWarnPreview) return;
        // 如果上一个视频音量进行修改，下一个视频，音量不变
        this.voice = this.subscribeServer.state.warmVideo;
        this.playerServer.setVolume(this.voice, () => {
          console.log('设置音量失败');
        });
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
      }
    },
    created() {
      // 如果暖场视频的长度大于1，就用多例。否则就用单例
      this.playerServer = usePlayerServer({
        extra: this.warmUpVideoList.length > 1
      });
      if (this.isShowContainer) return;
      this.getWebinerStatus();
      const { agreement } = this.roomBaseServer.state.watchInitData;
      this.agreement = agreement.is_open && !agreement.is_agree ? true : false;
      if (this.isEmbedVideo) {
        this.languageList = this.roomBaseServer.state.languages.langList;
        this.lang = this.roomBaseServer.state.languages.lang;
      }
    },
    mounted() {
      if (this.isEmbedVideo && !this.isWarnPreview) {
        const centerDom = document.querySelector('.vmp-basic-center');
        centerDom.style.width = '100%';
      }
    },
    methods: {
      // 初始化播放器配置项
      initConfig() {
        const { join_info } = this.roomBaseServer.state.watchInitData;

        let params = {
          videoNode:
            this.warmUpVideoList.length < 2
              ? 'vmp-player'
              : `vmp-player-vod_${this.warmUpVideoList[this.initIndex]}`
        };
        if (this.playerServer.state.type == 'live') {
          params = Object.assign(params, {
            liveOption: this.liveOption
          });
        } else if (this.playerServer.state.type === 'vod') {
          params = Object.assign(params, {
            vodOption: this.vodOption
          });
          params.pursueOption = { enable: true };
        } else {
          throw new Error('参数异常--2');
        }
        // 获取跑马灯、水印等播放器配置 不等于暖场视频
        if (!this.isWarnPreview) {
          // 跑马灯
          if (this.marquee && this.marquee.scrolling_open == 1) {
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
            params.marqueeOption = {
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
          // 水印  播放器
          if (this.water && this.water.watermark_open == 1) {
            const alianMap = new Map([
              [1, 'tl'],
              [2, 'tr'],
              [3, 'br'],
              [4, 'bl']
            ]);
            const align = alianMap.get(parseInt(this.water.img_position));

            params.watermarkOption = {
              enable: true,
              url: this.water.img_url, // 水印图片的路径
              align, // 图片的对其方式， tl | tr | bl | br 分别对应：左上，右上，左下，右下
              position: ['20px', '20px'], // 对应的横纵位置，支持px,vh,vw,%
              size: ['8%'], // 水印大小，支持px,vh,vw,%
              alpha: this.water.img_alpha
            };
          }
        }
        return params;
      },
      // 初始化播放器
      async initPlayer() {
        const defineQuality = this.setDefaultQuality();
        if (this.playerServer.state.type == 'live') {
          this.liveOption.defaultDefinition = defineQuality || '';
        } else if (this.playerServer.state.type == 'vod') {
          this.vodOption.defaultDefinition = defineQuality || '';
        }
        const params = await this.initConfig();
        return this.playerServer.init(params).then(() => {
          console.log(params, '播放器初始化成功123');
          this.playerServer.openControls(false);
          this.playerServer.openUI(false);
          window[`player${this.initIndex}`] = this.playerServer;
          this.getQualitys(); // 获取清晰度列表和当前清晰度
          this.listenEvents();
          this.getListenPlayer();
          if (this.playerServer.state.type === 'vod') {
            this.eventPointList = this.playerServer.state.markPoints;
            this.getRecordTotalTime(); // 获取视频总时长
            this.initSlider(); // 初始化播放进度条
            this.getInitSpeed(); // 获取倍速列表和当前倍速
            if (!this.isWarnPreview && this.playerOtherOptions.autoplay == 1) {
              this.playerServer && this.play();
            }
          } else {
            if (this.isAutoPlay || this.playerOtherOptions.autoplay == 1) {
              this.play();
            }
          }
        });
      },
      authTryWatch(type) {
        let params = {
          type: this.authText == 6 ? type : this.roomBaseServer.state.watchInitData.webinar.verify
        };
        if (this.agreement) {
          this.roomBaseServer.$emit('POPUP_AGREEMENT');
        } else {
          this.feeAuth(params);
        }
      },
      feeAuth(params) {
        let data = {
          webinar_id: this.roomBaseServer.state.watchInitData.webinar.id,
          visitor_id: this.roomBaseServer.state.watchInitData.visitor_id,
          ...this.$route.query,
          ...params
        };
        if (this.isEmbed) {
          // 消息通知 - 添加参数字段
          data.clientType = 'embed';
          data.embed_type = this.isEmbedVideo ? 'video' : 'full';
        }
        this.subscribeServer.watchAuth(data).then(res => {
          if (res.code == 200) {
            if (res.data.status == 'live') {
              window.location.href =
                window.location.origin +
                process.env.VUE_APP_ROUTER_BASE_URL +
                `/lives/watch/${this.roomBaseServer.state.watchInitData.webinar.id}${window.location.search}`;
            } else {
              setTimeout(() => {
                window.location.reload();
              }, 1000);
            }
          } else {
            this.handleAuthErrorCode(res.code, res.msg);
          }
        });
      },
      handleAuthErrorCode(code, msg) {
        let placeHolderInfo = {
          placeHolder: '',
          webinarId: '',
          isSubject: false,
          isWhiteCheck: false // 是否开启了白名单验证
        };
        switch (code) {
          case 510008: // 未登录
            window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitClickLogin'));
            break;
          case 512525: // 填写表单emitClickOpenSignUpForm
            window.$middleEventSdk?.event?.send(
              boxEventOpitons(this.cuid, 'emitClickOpenSignUpForm')
            );
            break;
          case 512002:
          case 512522:
            setTimeout(() => {
              window.location.reload();
            }, 1500);
            break;
          case 512531:
            // 邀请码
            placeHolderInfo.placeHolder =
              this.roomBaseServer.state.watchInitData.webinar.verify_tip ||
              this.$t('appointment.appointment_1024');
            window.$middleEventSdk?.event?.send(
              boxEventOpitons(this.cuid, 'emitClickAuth', placeHolderInfo)
            );
            break;
          case 512528:
            // 密码
            placeHolderInfo.placeHolder = this.authText || this.$t('appointment.appointment_1022');
            window.$middleEventSdk?.event?.send(
              boxEventOpitons(this.cuid, 'emitClickAuth', placeHolderInfo)
            );
            break;
          case 512532:
            //白名单
            placeHolderInfo.placeHolder = this.authText || this.$t('common.common_1006');
            placeHolderInfo.isWhiteCheck = true;
            window.$middleEventSdk?.event?.send(
              boxEventOpitons(this.cuid, 'emitClickAuth', placeHolderInfo)
            );
            break;
          case 512523:
            // 付费
            window.$middleEventSdk?.event?.send(
              boxEventOpitons(this.cuid, 'emitClickPay', { flag: true })
            );
            break;
          default:
            this.$message({
              message: this.$tec(code) || msg,
              showClose: true,
              // duration: 0,
              type: 'warning',
              customClass: 'zdy-info-box'
            });
            break;
        }
      },
      handleAgreeWitthTerms() {
        this.agreement = false;
        this.getShiPreview();
        const verify = this.roomBaseServer.state.watchInitData.webinar.verify;
        const type = verify === 6 ? 4 : verify;
        this.authTryWatch(type);
      },
      // handleAuthCheck() {
      //   let type = this.subOption.verify == 6 ? 4 : this.subOption.verify;
      //   this.feeAuth({ type: type });
      // },
      closePayFee() {
        window.$middleEventSdk?.event?.send(
          boxEventOpitons(this.cuid, 'emitClickPay', { flag: false })
        );
      },
      startPlay() {
        this.isPlaying ? this.pause() : this.play();
      },
      // 播放
      play() {
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
      // 重新播放
      replayPlay() {
        this.isVodEnd = false;
        this.startPlay();
      },
      initPlayerOtherInfo() {
        const unionConfig = this.roomBaseServer.state.unionConfig;
        console.log(unionConfig, '????12342355466756---pc');
        this.definitionConfig = unionConfig.definition.data.default_definition;
        this.marquee = unionConfig['screen-config'] && unionConfig['screen-config'].data;
        this.water = unionConfig['water-mark'] && unionConfig['water-mark'].data;
        this.playerOtherOptions = unionConfig['basic-config'] && unionConfig['basic-config'].data;
        this.initPlayer();
        // const { webinar } = this.roomBaseServer.state.watchInitData;
        // this.playerServer
        //   .getPlayerConfig({
        //     webinar_id: webinar.id,
        //     tags: ['basic-config', 'definition', 'screen-config', 'water-mark']
        //   })
        //   .then(res => {
        //     if (res.code === 200) {
        //       this.definitionConfig = res.data.definition.data.default_definition;
        //       this.marquee = res.data['screen-config'] && res.data['screen-config'].data;
        //       this.water = res.data['water-mark'] && res.data['water-mark'].data;
        //       this.playerOtherOptions = res.data['basic-config'] && res.data['basic-config'].data;
        //       this.initPlayer();
        //     }
        //   });
      },
      handleSliderMouseDown() {
        // 鼠标拖动的时候，阻止slider值更新
        if (!this._isSetingCurrentTime) {
          this._isSetingCurrentTime = true;
        }
      },
      changeVideo() {
        const time = (this.sliderVal / 100) * this.totalTime; // 快进
        this.setVideoCurrentTime(time);
        this.play();
      },
      // 切换多语言
      changeLanguage(key) {
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
      // 判断是直播还是回放 活动状态
      getWebinerStatus(info) {
        if (info && info.autoPlay) {
          this.isAutoPlay = info.autoPlay;
        }
        const { webinar, warmup, record } = this.roomBaseServer.state.watchInitData;
        if (this.roomBaseServer.state.watchInitData.status === 'live') {
          if (webinar.type === 1) {
            // 直播
            this.optionTypeInfo('live');
          } else if (webinar.type === 5 || webinar.type === 4) {
            // 回放
            this.optionTypeInfo('vod', this.roomBaseServer.state.watchInitData.paas_record_id);
            this.recordHistoryTime = sessionStorage.getItem(
              this.roomBaseServer.state.watchInitData.paas_record_id
            )
              ? Number(
                  sessionStorage.getItem(this.roomBaseServer.state.watchInitData.paas_record_id)
                )
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
          // let _id = warmup.warmup_paas_record_id
          //   ? warmup.warmup_paas_record_id
          //   : record.preview_paas_record_id;
          // this.vodType = warmup.warmup_paas_record_id ? 'warm' : 'shikan';
          // if (this.vodType === 'shikan') {
          //   this.isTryPreview = true;
          //   this.getShiPreview();
          // } else if (this.vodType === 'warm') {
          //   this.isWarnPreview = true;
          // }
          // // 暖场视频或者试看
          // this.optionTypeInfo('vod', _id);
        }
      },
      optionTypeInfo(type, id) {
        // 暖场视频或者试看
        const winVersion = windowVersion();
        const ua = window.navigator.userAgent;
        const swf = swfList.some(item => {
          return ua.includes(item);
        });
        // 直播
        this.playerServer.setType(type);
        if (type === 'live') {
          this.vodOption = {};
          this.liveOption = {
            type:
              this.roomBaseServer.state.configList['media_server.watch.rtmp_pc_to_hls'] == 1 ||
              isIE()
                ? 'hls'
                : 'flv',
            roomId: this.roomBaseServer.state.watchInitData.interact.room_id
          };
          if (isIE() && winVersion == 'win10') {
            this.liveOption.useSWF = false;
          } else if ((isIE() && winVersion == 'win7') || swf) {
            this.liveOption.useSWF = true;
            this.vodOption.useSWF = true;
          }
        } else {
          this.vodOption.recordId = id;
          this.liveOption = {};
          if (isIE() && winVersion == 'win10') {
            this.liveOption.useSWF = false;
          } else if ((isIE() && winVersion == 'win7') || swf) {
            this.liveOption.useSWF = true;
            this.vodOption.useSWF = true;
          }
        }
        if (this.isWarnPreview) {
          this.initPlayer();
        } else {
          this.initPlayerOtherInfo();
        }
      },
      exchangeVideoDocs() {
        if (this.displayMode == 'mini') {
          this.roomBaseServer.setChangeElement('doc');
          this.displayMode = 'normal';
        } else {
          this.roomBaseServer.setChangeElement('player');
          this.displayMode = 'mini';
        }
      },
      // 获取回放总时长
      getRecordTotalTime() {
        let getRecordTotalTimer = null;
        // 回放时间异步获取 需要通过定时器获取
        getRecordTotalTimer = setInterval(() => {
          try {
            this.totalTime =
              (this.playerServer &&
                this.playerServer.getDuration(() => {
                  console.log('获取视频总时长失败');
                })) ||
              0;
            this.totalTime > 0 && clearInterval(getRecordTotalTimer);
          } catch (error) {
            console.log(error);
          }

          if (this.isTryPreview && this.totalTime) {
            this.recordTime = computeRecordTime(this.totalTime);
            if (this.recordTime === 0) {
              this.recordTime = 1;
            }
            console.log(this.isTryPreview, '???1323');
          } else {
            if (this.subscribeServer.state.isChangeOrder && this.isWarnPreview) return;
            if (this.isWarnPreview) {
              if (this.warmUpVideoList[this.initIndex] == sessionStorage.getItem('warm_recordId')) {
                this.getDuanxuPreview(); //断点续播逻辑
              }
            } else {
              this.getDuanxuPreview(); //断点续播逻辑
            }
          }
        }, 50);
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
            ? sessionStorage.getItem(sessionStorage.getItem('warm_recordId'))
            : sessionStorage.getItem(this.vodOption.recordId);
          const parsedEndTime = parseInt(endTime);
          if (endTime && endTime != 'undefined' && parsedTotalTime != parsedEndTime) {
            const seekTime = endTime < 6 ? 0 : endTime - 5;
            this.setVideoCurrentTime(seekTime);
          }
        }
      },
      showLabelFun(eventTime) {
        this.sliderVal = (eventTime / this.totalTime) * 100;
        this.playerServer.setCurrentTime(eventTime, () => {
          this.$toast('调整播放时间失败');
        });
        this.playerServer.play();
      }
    }
  };
</script>
<style lang="less">
  .vmp-player {
    width: 100%;
    height: 100%;
    position: relative;
    overflow: hidden;
    background: #1a1a1a;
    z-index: 2;
    #vmp-player {
      background: #1a1a1a;
    }
    &-watch {
      height: 100%;
      width: 100%;
      border-radius: 4px;
    }
    #vh-watermark-container {
      width: 90px;
      height: 30px;
      z-index: 1;
      img {
        width: 100% !important;
        height: 100% !important;
        object-fit: scale-down !important;
      }
    }
    #vhy-danmaku-wrapbox {
      z-index: 1;
    }
    .vhallPlayer-container {
      display: none !important;
    }
    // .el-loading-spinner .el-loading-text {
    //   color: #fff;
    // }
    // .el-loading-spinner .path {
    //   stroke: #fb3a32;
    // }
    // .el-loading-mask {
    //   z-index: 7;
    // }
    &-living {
      &-background {
        height: 100%;
        width: 100%;
        position: absolute;
        top: 0;
        left: 0;
        background-position: center;
        background-repeat: no-repeat;
        background-color: #1a1a1a;
        z-index: 8;
      }
      &-btn {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: transparent;
        background-size: cover;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 8;
        div {
          background: rgba(0, 0, 0, 0.4);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          i {
            color: #e6e6e6;
            opacity: 1;
          }
        }
        &-normal {
          width: 88px;
          height: 88px;

          i {
            font-size: 34px;
          }
        }
        &-mini {
          width: 50px;
          height: 50px;
          i {
            font-size: 18px;
          }
        }
      }
      &-play {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: transparent;
        background-size: cover;
        display: flex;
        // align-items: center;
        justify-content: center;
        z-index: 8;
        div {
          margin-top: 28vh;
          background: rgba(0, 0, 0, 0.4);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          i {
            color: #e6e6e6;
            opacity: 1;
          }
        }
        &-normal {
          width: 72px;
          height: 72px;

          i {
            font-size: 34px;
          }
        }
      }
      &-end {
        z-index: 9;
        height: 100%;
        width: 100%;
        position: absolute;
        top: 0;
        left: 0;
        background: rgba(0, 0, 0, 0.6);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;

        &-img {
          width: 164px;
          height: 120px;

          img {
            width: 100%;
            height: 100%;
            object-fit: scale-down;
          }
        }
        &-mini {
          width: 120px;
          height: 80px;

          img {
            width: 100%;
            height: 100%;
            object-fit: scale-down;
          }
        }

        h1 {
          font-size: 16px;
          line-height: 50px;
          height: 50px;
          color: #999;
          padding-left: 38px;
          font-weight: 400;
        }
      }
      &-vodend {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.6);
        background-size: cover;
        z-index: 9;
        > div {
          display: flex;
          align-items: center;
          flex-direction: column;
          justify-content: center;
          height: 100%;
          width: 100%;
        }
        &-try {
          height: 100%;
          h3 {
            color: #999;
            font-size: 16px;
            line-height: 30px;
            font-weight: normal;
          }
          .replay-try {
            margin-top: 30px;
            color: #fff;
            cursor: pointer;
            b {
              font-weight: normal;
              margin-left: 5px;
            }
          }
          span {
            margin-top: 5px;
            text-align: center;
            color: #fff;
            cursor: pointer;
            border-radius: 20px;
            background: #fb3a32;
            display: inline-block;
            height: 40px;
            padding: 0 10px;
            line-height: 40px;
          }
          p {
            span {
              width: 90px;
              height: 40px;
              line-height: 40px;
            }
          }
        }
        &-isNoTry {
          div {
            background: rgba(0, 0, 0, 0.4);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            i {
              color: #e6e6e6;
              opacity: 1;
            }
          }
          span {
            margin-top: 5px;
            text-align: center;
            color: #fff;
            cursor: pointer;
            border-radius: 20px;
            background: #fb3a32;
            display: inline-block;
            &.repay--normal {
              width: 160px;
              height: 40px;
              line-height: 40px;
            }
            &.repay--mini {
              width: 90px;
              height: 30px;
              font-size: 12px;
              line-height: 30px;
            }
          }
        }
        &-normal {
          width: 88px;
          height: 88px;

          i {
            font-size: 34px;
          }
        }
        &-mini {
          width: 50px;
          height: 50px;
          i {
            font-size: 18px;
          }
        }
      }
      &-audio {
        z-index: 5;
        height: 100%;
        width: 100%;
        position: absolute;
        top: 0;
        left: 0;
        background-image: url('../src/img/video.gif');
        background-size: 100% 100%;
        div {
          text-align: center;
          color: @font-error-low;
          font-size: 16px;
          margin-top: 42%;
        }
      }
      &-exchange {
        position: absolute;
        top: 10px;
        z-index: 9;
        right: 8px;
        width: 32px;
        height: 32px;
        background: transparent;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.8s;
        background: rgba(0, 0, 0, 0.7);
        border-radius: 50%;
        cursor: pointer;
        p {
          text-align: center;
        }
        span {
          display: inline-block;
          text-align: right;
          font-size: 14px;
        }
        i {
          font-size: 16px;
          color: #e6e6e6;
          opacity: 1;
          cursor: pointer;
          &:hover {
            color: #fb3a32;
          }
        }
      }
    }
    &-controller {
      position: absolute;
      // bottom: 0;
      bottom: -48px;
      z-index: 8;
      width: 100%;
      height: 38px;
      box-sizing: border-box;
      background: rgba(0, 0, 0, 0.7);
      transition: all 0.8s;
      &.active-control {
        bottom: 0px;
      }
      &.previre-control {
        bottom: 0px;
      }
      .controller_slider {
        position: absolute;
        top: -4px;
        width: 100%;
        left: 0;
        .el-slider__runway {
          margin: 0;
          height: 4px;
          background-color: rgba(255, 255, 255, 0.3);
        }
        .el-slider__bar {
          height: 4px;
          background-color: @bg-error-light;
        }
        .el-slider__button {
          width: 9px;
          height: 9px;
          border: 0;
          position: absolute;
          top: 13px;
          left: 16px;
          background-color: @bg-error-light;
          box-shadow: 0 0 10px @bg-error-light;
        }
        &:hover {
          // .el-slider__bar {
          //   height: 9px;
          // }
          // .el-slider__runway {
          //   background: transparent;
          // }
          .el-slider__button {
            width: 13px;
            height: 13px;
            top: 11px;
            transform: scale(1) !important;
          }
        }
      }
      .controller-tools {
        height: 38px;
        display: flex;
        line-height: 38px;
        justify-content: space-between;
        font-size: 14px;
        .vh-iconfont {
          font-size: 20px;
          color: @font-error-low;
          cursor: pointer;
          &:hover {
            color: @font-error-low;
          }
        }
        &-left {
          padding-left: 20px;
          display: flex;
          color: @font-error-low;
          > div {
            padding-right: 5px;
          }
          &-time {
            color: @font-error-low;
            &-current {
              display: inline-block;
              min-width: 40px;
              height: 40px;
              max-width: 56px;
              line-height: 40px;
            }
            &-total {
              color: @font-light-low;
            }
          }
        }
        &-right {
          display: flex;
          z-index: 1002;
          > div {
            padding-right: 20px;
            position: relative;
            color: @font-error-low;
          }
          .vh-iconfont {
            font-size: 18px;
            &:hover {
              color: @font-error;
            }
          }
          span {
            &:hover {
              cursor: pointer;
              color: @font-error;
            }
          }
          &-lang,
          &-quality,
          &-speed {
            &:hover {
              .controller-tools-right-list {
                display: block;
              }
            }
          }
          &-list {
            list-style: none;
            position: absolute;
            bottom: 100%;
            left: -45%;
            width: 70px;
            padding: 10px 0;
            background-color: rgba(0, 0, 0, 0.7);
            border-radius: 4px;
            line-height: 30px;
            display: none;
            li {
              text-align: center;
              cursor: pointer;
              &:hover {
                color: @font-error;
              }
            }
            .vmp-player-li-active {
              color: @font-error;
            }
            &.controller-lang {
              left: -16%;
            }
          }
          &-volume {
            position: relative;
            cursor: pointer;
            &:hover {
              .controller-tools-right-volume-slider {
                display: block;
              }
            }
            &-slider {
              width: 30px;
              position: absolute;
              bottom: 100%;
              left: -20%;
              background-color: rgba(0, 0, 0, 0.7);
              display: none;
              border-radius: 4px;
              .is-vertical .el-slider__runway {
                margin: 10px auto 10px;
                background-color: rgba(255, 255, 255, 0.3);
              }
              .el-slider__bar {
                background-color: @bg-error-light;
              }
              .el-slider__button {
                position: absolute;
                width: 12px;
                height: 12px;
                top: 10px;
                left: 12px;
                border: 0;
                background-color: @bg-error-light;
                box-shadow: 0 0 10px @bg-error-light;
              }
            }
          }
        }
      }
    }
    &-controllerMini {
      position: absolute;
      bottom: -48px;
      z-index: 8;
      width: 100%;
      height: 38px;
      box-sizing: border-box;
      background: rgba(0, 0, 0, 0.7);
      transition: all 0.8s;
      &.active-control {
        bottom: 0px;
      }
      &.previre-control {
        bottom: 0px;
      }
      .controller_slider {
        position: absolute;
        top: -4px;
        width: 100%;
        left: 0;
        .el-slider__runway {
          margin: 0;
          height: 2px;
          background-color: rgba(255, 255, 255, 0.3);
        }
        .el-slider__bar {
          height: 2px;
          background-color: @bg-error-light;
        }
        .el-slider__button {
          width: 5px;
          height: 5px;
          border: 0;
          position: absolute;
          top: 13px;
          left: 16px;
          background-color: @bg-error-light;
          box-shadow: 0 0 10px @bg-error-light;
        }
        &:hover {
          // .el-slider__runway,
          // .el-slider__bar {
          //   height: 5px;
          // }
          .el-slider__button {
            width: 10px;
            height: 10px;
            // top: -2px;
            transform: scale(1) !important;
          }
        }
      }
      .controller-tools {
        height: 38px;
        display: flex;
        line-height: 38px;
        justify-content: space-between;
        font-size: 14px;
        .vh-iconfont {
          font-size: 14px;
          color: @font-error-low;
          cursor: pointer;
          &:hover {
            color: @font-error-low;
          }
        }
        &-left {
          padding-left: 12px;
          display: flex;
          color: @font-error-low;
          > div {
            padding-right: 5px;
          }
          &-time {
            color: @font-error-low;
            &-current {
              display: inline-block;
              min-width: 40px;
              height: 40px;
              max-width: 56px;
              line-height: 40px;
              font-size: 12px;
            }
            &-total {
              color: @font-light-low;
              font-size: 12px;
            }
          }
        }
        &-right {
          display: flex;
          z-index: 1002;
          > div {
            padding-right: 12px;
            position: relative;
            color: @font-error-low;
            font-size: 12px;
          }
          .vh-iconfont {
            font-size: 14px;
            &:hover {
              color: @font-error;
            }
          }
          span {
            &:hover {
              cursor: pointer;
              color: @font-error;
            }
          }
          &-quality,
          &-speed {
            &:hover {
              .controller-tools-right-list {
                display: block;
              }
            }
          }
          &-list {
            list-style: none;
            position: absolute;
            bottom: 100%;
            left: -45%;
            width: 55px;
            padding: 5px 0;
            background-color: rgba(0, 0, 0, 0.7);
            border-radius: 4px;
            line-height: 25px;
            font-size: 12px;
            display: none;
            li {
              text-align: center;
              cursor: pointer;
              &:hover {
                color: @font-error;
              }
            }
            .vmp-player-li-active {
              color: @font-error;
            }
          }
          &-volume {
            position: relative;
            cursor: pointer;
            &:hover {
              .controller-tools-right-volume-slider {
                display: block;
              }
            }
            &-slider {
              width: 30px;
              position: absolute;
              bottom: 100%;
              left: -20%;
              background-color: rgba(0, 0, 0, 0.7);
              display: none;
              border-radius: 4px;
              .is-vertical .el-slider__runway {
                margin: 10px auto 10px;
                width: 4px;
                background-color: rgba(255, 255, 255, 0.3);
              }
              .el-slider__bar {
                width: 4px;
                background-color: @bg-error-light;
              }
              .el-slider__button {
                position: absolute;
                width: 8px;
                height: 8px;
                top: 10px;
                left: 13px;
                border: 0;
                background-color: @bg-error-light;
                box-shadow: 0 0 10px @bg-error-light;
              }
            }
          }
        }
      }
    }
    &-tips {
      z-index: 5;
      &-box {
        height: 40px;
        font-size: 14px;
        line-height: 40px;
        color: #f7f7f7;
        background: @bg-dark-normal;
        border-radius: 20px;
        position: absolute;
        bottom: 60px;
        left: 45%;
        z-index: 6;
        > div {
          padding: 0 16px;
        }
        span {
          color: @font-error;
        }
      }
      &-prew {
        height: 40px;
        font-size: 14px;
        line-height: 40px;
        color: #f7f7f7;
        background: @bg-dark-normal;
        border-radius: 20px;
        position: absolute;
        bottom: 60px;
        left: 10px;
        z-index: 6;
        > div {
          padding: 0 12px;
        }
        b {
          font-weight: normal;
          color: @font-error;
          padding: 5px;
        }
        .red {
          color: @font-error;
          padding: 0 3px;
        }
        i {
          font-style: normal;
        }
        span {
          color: #f7f7f7;
          cursor: pointer;
        }
        .vh-iconfont {
          font-size: 14px;
          padding-left: 12px;
          vertical-align: middle;
          cursor: pointer;
        }
      }
    }
  }

  // 作为观看端时的样式
  .vmp-player.is-watch {
    // 普通模式
    &.vmp-player--normal {
      position: absolute;
      top: 0;
      bottom: 56px;
      width: calc(100% - 380px);
      height: auto;
      min-height: auto;
      &.vmp-player-embed {
        width: 100%;
        height: 100%;
      }
      &.vmp-player-embedFull {
        width: calc(100% - 360px);
      }
    }

    &.vmp-player--mini {
      position: absolute;
      width: 360px;
      height: 204px;
      min-height: 204px;
      top: 0;
      right: 0;
      z-index: 10;
    }
  }
</style>

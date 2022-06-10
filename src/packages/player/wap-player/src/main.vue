<template>
  <div class="vmp-wap-player">
    <template v-if="encrypt">
      <div v-show="isNoBuffer" class="vmp-wap-player-prompt">
        <van-loading color="#fb2626" />
        <!-- <img class="vmp-wap-player-prompt-load" src="./img/load.gif" /> -->
        <span class="vmp-wap-player-prompt-text">{{ prompt }}</span>
      </div>
      <div v-show="!isNoBuffer" id="videoWapBox" class="vmp-wap-player-video">
        <!-- 播放器背景图片 -->
        <div class="vmp-wap-player-prompt" v-if="isShowPoster && !isSmallPlayer">
          <img class="vmp-wap-player-prompt-poster" :src="webinarsBgImg" />
        </div>
        <!-- 播放 按钮 -->
        <div v-show="!isPlayering && !isVodEnd && !isSmallPlayer" class="vmp-wap-player-pause">
          <p @click="startPlay">
            <i class="vh-iconfont vh-line-video-play"></i>
          </p>
        </div>
        <div
          id="vmp-wap-player"
          style="width: 100%; height: 100%"
          @click.stop.prevent="videoShowIcon"
        >
          <!-- 视频容器 -->
        </div>
        <!-- 直播结束 -->
        <div class="vmp-wap-player-audie" v-if="isAudio || audioStatus">
          <p>{{ $t('player.player_1014') }}</p>
        </div>
        <!-- 回放结束（正常回放和试看回放结束） -->
        <div
          v-show="isVodEnd && !isPlayering"
          class="vmp-wap-player-ending"
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
          <div class="vmp-wap-player-ending-box" @click="startPlay">
            <p class="vmp-wap-player-ending-box-noraml">
              <i class="vh-iconfont vh-line-refresh-left"></i>
            </p>
            <p class="vmp-wap-player-ending-box-reset">{{ $t('player.player_1016') }}</p>
          </div>
        </div>
        <!-- 观看次数  -->
        <div
          class="vmp-wap-player-header"
          v-show="
            roomBaseState.watchInitData.pv.show && isPlayering && !isWarnPreview && !isSmallPlayer
          "
          :class="[iconShow ? 'opcity-flase' : 'opcity-true']"
        >
          <!-- 播放器缩小按钮 -->
          <span @click="changePlayerSize(true)" v-if="isAudio">
            <i class="vh-iconfont vh-line-arrow-left"></i>
          </span>
          <span v-else></span>
          <span>
            <span class="hot_num">
              <i class="vh-saas-iconfont vh-saas-line-heat"></i>
              {{ hotNum | formatHotNum }}
            </span>
            <span @click="openLanguage" v-if="languageList.length > 1" class="hot_num">
              {{ lang.key == 1 ? '中文' : 'EN' }}
            </span>
          </span>
        </div>
        <!-- 倍速、清晰度切换 -->
        <div class="vmp-wap-player-tips" v-if="isSetSpeed || isSetQuality">
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
          v-show="isPlayering && !isSmallPlayer"
          :class="[iconShow ? 'vmp-wap-player-opcity-flase' : 'vmp-wap-player-opcity-true']"
        >
          <!-- 倍速和画质合并 -->
          <div class="vmp-wap-player-speed">
            <span @click="openLanguage" v-if="languageList.length > 1">
              {{ lang.key == 1 ? 'CN' : 'EN' }}
              <i class="vh-iconfont vh-line-arrow-down"></i>
            </span>
            <!-- <span @click="openSpeed" v-if="!isLiving && playerOtherOptions.speed && !isWarnPreview">
              {{currentSpeed == 1 ? $t('player.player_1007') : currentSpeed.toString().length &lt; 3 ? `${currentSpeed.toFixed(1)}X` : `${currentSpeed}X`}}
            </span>
            <span @click="openQuality" v-if="!isWarnPreview">
              {{ formatQualityText(currentQualitys.def) }}
            </span> -->
          </div>
          <div class="vmp-wap-player-control">
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
              <i class="vh-iconfont vh-line-close" @click="isPickupVideo = false"></i>
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
                v-if="(!isLiving && playerOtherOptions.progress_bar) || isWarnPreview"
                v-model="sliderVal"
                active-color="#fb2626"
                inactive-color="rgba(255,255,255,.3)"
                @change="changeSlider"
              >
                <div slot="button">
                  <img src="./img/player.png" alt />
                </div>
              </van-slider>
              <div class="vmp-wap-player-control-icons">
                <span class="vmp-wap-player-control-icons-left">
                  <i
                    @click="startPlay"
                    :class="[
                      'vh-iconfont',
                      isPlayering ? 'vh-a-line-videopause' : 'vh-line-video-play',
                      { 'vh-line-left-vod': !isLiving }
                    ]"
                  ></i>
                  <i
                    class="vh-iconfont vh-line-refresh-left"
                    @click.stop="refresh"
                    v-if="isLiving"
                  ></i>
                  <span class="vmp-wap-player-control-icons-left-time" v-if="!isLiving">
                    {{ currentTime | secondToDate }}/{{ totalTime | secondToDate }}
                  </span>
                </span>
                <!-- 右侧icon集合 -->
                <div class="vmp-wap-player-control-icons-right">
                  <span
                    class="icons-quality icons-speed"
                    @click="openSpeed"
                    v-if="!isLiving && playerOtherOptions.speed && !isWarnPreview"
                  >
                    {{currentSpeed == 1 ? $t('player.player_1007') : currentSpeed.toString().length &lt; 3 ? `${currentSpeed.toFixed(1)}X` : `${currentSpeed}X`}}
                  </span>
                  <span @click="openQuality" v-if="!isWarnPreview" class="icons-quality">
                    {{ formatQualityText(currentQualitys.def) }}
                  </span>

                  <span
                    class="barrageSpan"
                    @click="openBarrage"
                    v-if="playerOtherOptions.barrage_button && !isWarnPreview && !isTryPreview"
                  >
                    <i
                      :class="`barrage vh-iconfont ${
                        danmuIsOpen ? 'vh-line-barrage-on' : 'vh-line-barrage-off'
                      }`"
                    ></i>
                  </span>
                  <span v-if="!isAudio" @click="enterFullscreen">
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
            <span class="pos" @click="startPlay">
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
                  :class="isPlayering ? 'vh-a-line-videopause' : 'vh-line-video-play'"
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
            <span @click="changePlayerSize(false)">
              <i class="vh-iconfont vh-line-arrow-right"></i>
            </span>
          </div>
        </div>

        <van-popup v-model="isOpenSpeed" position="bottom" round class="vmp-wap-player-popup">
          <ul>
            <li
              v-for="item in UsableSpeed"
              :key="item"
              :class="{ 'popup-active': currentSpeed == item }"
              @click="changeSpeed(item)"
            >
              {{item.toString().length &lt; 3 ? `${item.toFixed(1)}X` : `${item}X`}}
            </li>
          </ul>
        </van-popup>
        <van-popup v-model="isOpenQuality" position="bottom" round class="vmp-wap-player-popup">
          <ul>
            <li
              v-for="item in qualitysList"
              :key="item.def"
              :class="{ 'popup-active': currentQualitys.def == item.def }"
              @click="changeQualitys(item)"
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
              @click="changeLang(item.key)"
            >
              {{ item.label }}
            </li>
          </ul>
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
  import { isMse } from './js/utils';
  import controlEventPoint from './components/control-event-point.vue';
  import { useRoomBaseServer, usePlayerServer } from 'middle-domain';
  import playerMixins from './js/mixins';
  import { boxEventOpitons } from '@/packages/app-shared/utils/tool.js';
  export default {
    name: 'VmpWapPlayer',
    mixins: [playerMixins],
    components: {
      controlEventPoint
    },
    computed: {
      //判断是否是音频直播模式
      isAudio() {
        return this.roomBaseState.watchInitData.webinar.mode == 1;
      },
      // 背景图片
      webinarsBgImg() {
        const cover = '//cnstatic01.e.vhall.com/static/img/mobile/video_default_nologo.png';
        const { warmup, webinar, join_info } = this.roomBaseState.watchInitData;
        if (warmup && warmup.warmup_paas_record_id && join_info.is_subscribe == 1) {
          return warmup.warmup_img_url
            ? warmup.warmup_img_url
            : webinar.img_url
            ? webinar.img_url
            : cover;
        } else {
          return webinar.img_url || cover;
        }
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
      }
    },
    data() {
      return {
        asd: 1,
        isNoBuffer: false,
        // promptFlag: false,
        isOpenSpeed: false,
        isOpenQuality: false,
        isOpenlang: false, // 是否打开多语言弹窗
        iconShow: false, // 5秒后操作栏icon消失
        prompt: this.$t('player.player_1010'), // 刚开始点击时展示文案
        loadingFlag: false,
        isShowPoster: true, //是否展示活动图片背景
        isPlayering: false, // 是否是播放状态
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
        circleSliderVal: 0
      };
    },
    watch: {
      // 监听播放器大小
      isSmallPlayer: {
        handler: function (val) {
          if (val) {
            document.querySelector('.vmp-basic-bd').classList.add('small_player');
          } else {
            document.querySelector('.vmp-basic-bd').classList.remove('small_player');
          }
          this.setSetingHeight();
        }
      },
      sliderVal(val) {
        this.circleSliderVal = val;
      }
    },
    beforeCreate() {
      this.roomBaseServer = useRoomBaseServer();
      this.playerServer = usePlayerServer();
      // window.playerServer = this.playerServer;
    },
    beforeDestroy() {
      this.playerServer.destroy();
    },
    async created() {
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
      this.setSetingHeight();
    },
    methods: {
      /**
       * 计算 设置tab-content高度
       */
      setSetingHeight() {
        let htmlFontSize = document.getElementsByTagName('html')[0].style.fontSize;
        // postcss 换算基数为75 头部+播放器区域高为 522px
        let playerHeight = this.isSmallPlayer == true ? 130 : 422;
        let baseHeight = playerHeight + 71 + 90;
        let calssname = '.tab-content';
        if (this.isEmbed) {
          baseHeight = playerHeight;
          calssname = '.tab-content-embed';
        }
        let popHeight =
          document.body.clientHeight - (baseHeight / 75) * parseFloat(htmlFontSize) + 'px';
        document.querySelector(calssname).style.height = popHeight;
      },
      startPlay() {
        this.isPlayering ? this.pause() : this.play();
      },
      // 播放
      play() {
        this.iconShow = false;
        this.fiveDown();
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
          let _id = warmup.warmup_paas_record_id
            ? warmup.warmup_paas_record_id
            : record.preview_paas_record_id;
          this.vodType = warmup.warmup_paas_record_id ? 'warm' : 'shikan';
          if (this.vodType === 'shikan') {
            this.isTryPreview = true;
          } else if (this.vodType === 'warm') {
            this.isWarnPreview = true;
          }
          this.optionTypeInfo('vod', _id);
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
        this.initPlayerOtherInfo();
      },
      // 初始化播放器配置项
      initConfig() {
        let params = {
          videoNode: 'vmp-wap-player'
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
          this.getQualitys(); // 获取清晰度列表和当前清晰度
          this.listenEvents(); // 监听断点续播事件
          this.getListenPlayer(); // 监听播放器播放、暂停等事件
          if (this.playerState.type == 'vod') {
            this.eventPointList = this.playerServer.state.markPoints;
            this.getRecordTotalTime(); // 获取视频总时长
            this.initSlider(); // 初始化播放进度条
            this.getInitSpeed(); // 获取倍速列表和当前倍速
          } else {
            if (this.isAutoPlay) {
              this.play();
            }
          }
          this.playerServer.openControls(false);
          this.playerServer.openUI(false);
          this.$nextTick(() => {
            if (this.water && this.water.watermark_open == 1) {
              const watermarkContainer = document.getElementById('vh-watermark-container');
              watermarkContainer && (watermarkContainer.style.width = '80px');
              const waterMark = document.getElementById('vh-watermark');
              waterMark && (waterMark.style.height = '35px');
            }
          });
          try {
            document.getElementsByTagName('video')[0].setAttribute('x5-video-player-type', 'h5');
          } catch (e) {
            console.log(e);
          }
        });
      },
      initPlayerOtherInfo() {
        const { webinar } = this.roomBaseState.watchInitData;
        this.playerServer
          .getPlayerConfig({
            webinar_id: webinar.id,
            tags: ['basic-config', 'definition', 'screen-config', 'water-mark']
          })
          .then(res => {
            if (res.code == 200) {
              this.definitionConfig = res.data.definition.data.default_definition;
              this.marquee = res.data['screen-config'] && res.data['screen-config'].data;
              this.water = res.data['water-mark'] && res.data['water-mark'].data;
              this.playerOtherOptions = res.data['basic-config'] && res.data['basic-config'].data;
              this.initPlayer();
            }
          });
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
        if (this.marquee && this.marquee.scrolling_open == 1) {
          let marqueeText = '';
          if (this.marquee.text_type == 1) {
            marqueeText = this.marquee.text;
          } else {
            let text = '';
            if (join_info.join_id) {
              text = `${join_info.join_id}-${join_info.nickname}`;
            } else {
              if (localStorage.getItem('userInfo')) {
                text = localStorage.getItem('userInfo').nick_name;
              } else {
                text = '';
              }
            }
            marqueeText = `${this.marquee.text}-${text}`;
          }
          playerParams.marqueeOption = {
            enable: true,
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
        if (this.water && this.water.watermark_open == 1) {
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
          endTime = sessionStorage.getItem(this.vodOption.recordId);
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
        this.iconShow = true;
        this.isOpenSpeed = true;
      },
      openQuality() {
        this.isOpenQuality = true;
        this.iconShow = true;
      },
      videoShowIcon() {
        this.iconShow = false;
        this.isOpenQuality = false;
        this.isOpenSpeed = false;
        this.isOpenlang = false;
        this.fiveDown();
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
      }
    }
  };
</script>
<style lang="less">
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
      &-text {
        margin-top: 20px;
      }
      &-poster {
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
        z-index: 3;
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
    &-ending {
      background-repeat: no-repeat;
      background-size: 100% 100%;
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
      z-index: 10;
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
    &-speed {
      position: absolute;
      right: 32px;
      top: 24px;
      width: 80px;
      z-index: 6;

      span {
        width: 100%;
        display: block;
        height: 36px;
        padding: 0 16px;
        border-radius: 24px;
        background: rgba(0, 0, 0, 0.5);
        text-align: center;
        line-height: 36px;
        font-size: 24px;
        font-family: PingFangSC-Medium, PingFang SC;
        color: #fff;
        i {
          font-size: 18px;
        }
        // &:nth-child(2) {
        //   margin: 40px 0;
        // }
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
  }

  // js动态添加播放器收起样式
  .vmp-basic-container {
    .small_player {
      height: 130px !important;
    }
  }
</style>

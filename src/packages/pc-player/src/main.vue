<template>
  <div class="vmp-player">
    <div class="vmp-player-box">
      <div class="vmp-player-container">
        <div id="vmp-player" class="vmp-player-watch">
          <!-- 控制条 进度条、弹幕、全屏、时间等 -->
          <div class="vmp-player-controller">
            <!-- 进度条 -->
            <div class="vmp-player-controller-slider" v-if="!isLive">
              <el-slider
                ref="controllerRef"
                v-model="sliderVal"
                :show-tooltip="false"
                @change="setVideo"
              ></el-slider>
            </div>
            <div class="vmp-player-controller-tools">
              <div class="vmp-player-controller-tools-left">
                <div class="vmp-player-controller-tools-left-start" @click="play">
                  <i :class="`iconfont ${isLiving ? 'iconzanting_icon' : 'iconbofang_icon'}`"></i>
                </div>
                <div class="vmp-player-controller-tools-left-time" v-if="!isLive">
                  <span class="vmp-player-controller-tools-left-time-current">
                    {{ secondToDate(currentTime) }}
                  </span>
                  <span>/</span>
                  <span class="vmp-player-controller-tools-left-time-total">
                    {{ secondToDate(totalTime) }}
                  </span>
                </div>
              </div>
              <div class="vmp-player-controller-tools-right">
                <div class="vmp-player-controller-tools-right-quality">
                  <span>{{ formatQualityText(currentQualitys.def) }}</span>
                  <ul class="vmp-player-controller-tools-right-list">
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
                <div class="vmp-player-controller-tools-right-speed">
                  <span>
                    {{currentSpeed == 1 ? '倍速': currentSpeed.toString().length &lt; 3 ? `${currentSpeed.toFixed(1)}X` : `${currentSpeed}X`}}
                  </span>
                  <ul class="vmp-player-controller-tools-right-list">
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
                <div class="vmp-player-controller-tools-right-volume">
                  <i
                    :class="`iconfont ${
                      voice > 0 ? 'iconyinliang_icon' : 'iconyinliangguanbi_icon'
                    }`"
                    @click="jingYin"
                  ></i>
                  <div class="vmp-player-controller-tools-right-volume-slider">
                    <el-slider
                      v-model="voice"
                      vertical
                      height="100px"
                      :show-tooltip="true"
                    ></el-slider>
                  </div>
                </div>
                <div class="vmp-player-controller-tools-right-danmuis">
                  <i
                    :class="`iconfont ${
                      danmuIsOpen ? 'iconicon-pcdanmukaiqi-011' : 'iconicon-pcdanmuguanbi'
                    }`"
                    @click="openBarrage"
                  ></i>
                </div>
                <div class="vmp-player-controller-tools-right-fullscroll">
                  <i
                    :class="`iconfont ${
                      isFullscreen ? 'iconicon_quxiaoquanping' : 'iconicon_quanping'
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
              已为您切换到
              <span>{{ formatQualityText(currentQualitys.def) }}</span>
            </div>
            <!-- 切换倍速 -->
            <div v-if="isSetSpeed">
              已为您切换到
              <span>{{ currentSpeed == 1 ? '正常' : currentSpeed }}</span>
              倍速
            </div>
          </div>
          <!-- 试看和断点续播提示 -->
          <div class="vmp-player-tips-prew">
            <!-- 试看 -->
            <div v-if="vodType === 'shikan' && isTryPreview">
              试看
              <b>{{ recordTime }}</b>
              分钟，观看完整视频请
              <span v-if="authText == 6">
                <b>付费</b>
                或
                <b>邀请码</b>
              </span>
              <span v-else>{{ authText }}</span>
              <i class="iconfont iconguanbichabo_icon" @click="vodType = ''"></i>
            </div>
            <!-- 断点续播 -->
            <div v-if="isPickupVideo">
              上次观看至
              <b>{{ secondToDate(currentTime) }}</b>
              ，已为您自动续播
              <i class="iconfont iconguanbichabo_icon" @click="isPickupVideo = false"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  import { usePlayerServer, contextServer } from 'vhall-sass-domain';
  import { computeRecordTime, secondToDateZH, isIE, windowVersion } from './js/utils';
  import playerMixins from './js/mixins';
  export default {
    name: 'VmpPcPlayer',
    mixins: [playerMixins],
    data() {
      const { state: playerState } = this.playerServer;
      return {
        playerState,
        roomBaseState: null,
        isLiving: false, // 是否是播放状态
        isLive: false, // 是否是直播
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
        authText: '', // 试看的权限判断
        recordTime: 0, // 试看的时间
        isTryPreview: false, // 是否是试看
        isWarnPreview: false, // 是否是暖场视频
        isPickupVideo: false, // 是否是断点续播
        recordHistoryTime: '', // 记录播放的时间
        endTime: '', // 播放到结束时刷新页面
        marquee: {}, // 跑马灯
        water: {}, //水印
        playerOtherOptions: {
          barrage_button: 0,
          progress_bar: 0,
          speed: 0,
          autoplay: false
        } //播放器配置
      };
    },
    beforeCreate() {
      this.playerServer = usePlayerServer();
    },
    computed: {
      //判断是否是音频直播模式
      isAudio() {
        return this.watchInitData.webinar.mode == 1;
      }
    },
    watch: {
      sliderVal(val) {
        if (this.onmousedownControl) {
          this.hoverTime = (val / 100) * this.totalTime;
          this.hoverLeft = (val / 100) * this.ContorlWidth;
        }
      }
    },
    created() {
      this.roomBaseServer = contextServer.get('roomBaseServer');
      this.roomBaseState = this.roomBaseServer.state;
      // this.playerServer.getPlayerConfig({
      //   webinar_id: '876395481',
      //   tags: ['basic-config', 'definition', 'screen-config', 'water-mark']
      // });
    },
    mounted() {
      setTimeout(() => {
        this.watchInitData = this.roomBaseServer.state.watchInitData;
        this.configList = this.roomBaseServer.state.configList;
        console.warn(this.watchInitData, '???=====zhangxiao======');
        this.getWebinerStatus();
        this.listenEvents();
        this.initPlayer();
      }, 1000);
    },
    methods: {
      listenEvents() {
        // 退出页面时记录历史时间 TODO 配置是否支持断点续播的逻辑
        if (this.playerState.type === 'vod') {
          window.addEventListener('beforeunload', () => {
            this.endTime = this.playerServer.getCurrentTime(() => {
              console.log('获取当前视频播放时间失败----------');
            });

            this.totalTime = this.playerServer.getDuration(() => {
              console.log('获取视频总时长失败');
            });
            const curLocalHistoryTime = window.sessionStorage.getItem(
              this.watchInitData.paas_record_id
            );
            if (!curLocalHistoryTime && this.recordHistoryTime) {
              return;
            }
            window.sessionStorage.setItem(this.vodOption.recordId, this.endTime);
          });
        }
        // 全屏事件
        const setFullscreen = () => {
          const fullscreenElement =
            document.fullscreenElement ||
            document.webkitFullscreenElement ||
            document.mozFullscreenElement ||
            document.msFullscreenElement;
          if (
            fullscreenElement &&
            fullscreenElement.className &&
            fullscreenElement.className.indexOf('vmp-player-watch') != -1
          ) {
            this.isFullscreen = true;
          } else {
            this.isFullscreen = false;
          }
        };
        window.addEventListener('fullscreenchange', setFullscreen);
        window.addEventListener('webkitfullscreenchange', setFullscreen);
        window.addEventListener('mozfullscreenchange', setFullscreen);
        window.addEventListener('msfullscreenchange', setFullscreen);
        window.addEventListener('MSFullscreenChange', setFullscreen);
      },
      // 初始化播放器配置项
      initConfig() {
        let params = {
          appId: this.watchInitData.interact.paas_app_id || '', // 应用ID，必填
          accountId: this.watchInitData.join_info.third_party_user_id || '', // 第三方用户ID，必填
          token: this.watchInitData.interact.paas_access_token || '', // access_token，必填
          videoNode: 'vmp-player',
          type: this.playerState.type, // live 直播  vod 点播  必填
          poster: '',
          autoplay: false,
          forceMSE: false,
          subtitleOption: {
            enable: true
          },
          // 强制卡顿切线
          thornOption: {
            enable: true
          },
          barrageSetting: {
            positionRange: [0, 1],
            speed: 15000,
            style: {
              fontSize: 16
            }
          },
          peer5Option: {
            open: this.configList['ui.browser_peer5'] == '1',
            customerId: 'ds6mupmtq5gnwa4qmtqf',
            fallback: true
          }
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
      async initSDK() {
        const defineQuality = this.setDefaultQuality();
        console.log(defineQuality, '====<<1111111');
        if (this.playerState.type == 'live') {
          this.liveOption.defaultDefinition = defineQuality || '';
        } else if (this.playerState.type == 'vod') {
          this.vodOption.defaultDefinition = defineQuality || '';
        }
        const params = this.initConfig();
        return new Promise(resolve => {
          this.playerServer.init(params).then(() => {
            // this.eventPointList = this.playerServer.state.markPoints;

            this.playerServer.openControls(false);
            this.playerServer.openUI(false);
            if (this.isLive) {
              resolve();
            } else {
              this.playerServer.on(VhallPlayer.LOADED, () => {
                resolve();
              });
            }
          });
        });
      },
      // 初始化播放器
      initPlayer() {
        this.initSDK().then(() => {
          this.getQualitys(); // 获取清晰度列表和当前清晰度
          this.getInitSpeed(); // 获取倍速列表和当前倍速
          // this.playerServer.on(VhallPlayer.PLAY, () => {
          //   console.warn('PLAY');
          // });
          setTimeout(() => {
            if (this.playerState.type === 'vod') {
              this.getRecordTotalTime(); // 获取视频总时长
              this.initSlider(); // 初始化播放进度条
            }
          }, 300);
          if (this.isLive) {
            console.log('直播了');
            //  直播开始
            this.playerServer.on(VhallPlayer.PLAY, () => {
              // 监听播放状态
              // this.statePlay = true;
              console.warn('PLAY');
            });
            this.playerServer.on(VhallPlayer.PAUSE, () => {
              // 监听暂停状态
              // console.log('暂停');
              console.warn('PAUSE');

              // this.statePlay = false;
            });
            // 视频清晰度发生改变----卡顿切换清晰度时触发
            this.playerServer.on(VhallPlayer.DEFINITION_CHANGE, e => {
              console.warn('DEFINITION_CHANGE');
              this.loading = true;
            });
            this.playerServer.on(VhallPlayer.LOADEDMETADATA, e => {
              console.warn('LOADEDMETADATA');
            });
            this.playerServer.on(VhallPlayer.LAG_REPORT, e => {
              console.warn('LAG_REPORT');
              this.loading = false;
            });
            this.playerServer.on(VhallPlayer.LOADED, () => {
              this.loading = false;
            });
            this.playerServer.on(VhallPlayer.ERROR, e => {
              this.loading = false;
              console.log('播放器sdk VhallPlayer.ERROR事件', e);
            });
          } else {
            console.log('点播了');
            this.playerServer.on(VhallPlayer.PLAY, () => {
              // 监听播放状态
              console.warn('播放');
              this.statePlay = true;
              this.BackEnd = false;
              this.posterShowFlag = false;
              // this.statePlay?this.seizeImageShow = false:this.seizeImageShow = true;
            });
            this.playerServer.on(VhallPlayer.PAUSE, () => {
              // 监听暂停状态
              console.log('暂停');
              this.statePlay = false;
            });
            this.playerServer.on(VhallPlayer.ENDED, () => {
              // 监听暂停状态
              console.log('播放完毕');
              this.BackEnd = true;
              if (this.isPreviewOrWarn === 'shikan') {
                this.isShiKanVideo = false;
              }
              this.$emit('BackEnd', true); // 暖场视频需要参数
            });
            this.playerServer.on(VhallPlayer.LOADEDMETADATA, e => {
              console.warn('LOADEDMETADATA');
            });
          }
        });
      },
      // 获取跑马灯、水印等播放器配置
      getPlayerInfo() {
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
            if (this.watchInitData.join_info.join_id) {
              text = `${this.watchInitData.join_info.join_id}-${this.watchInitData.join_info.nickname}`;
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
      // 播放
      play() {
        this.isLiving = !this.isLiving;
        this.isLiving
          ? this.playerServer && this.playerServer.play()
          : this.playerServer && this.playerServer.pause();
      },
      // 暂停
      pause() {
        this.isLiving = false;
        this.playerServer && this.playerServer.pause();
      },
      setVideo() {
        const time = (this.sliderVal / 100) * this.totalTime; // 快进
        this.setVideoCurrentTime(time);

        this.play();
      },
      // 判断是直播还是回放 活动状态
      getWebinerStatus() {
        if (this.watchInitData.status === 'live') {
          if (this.watchInitData.webinar.type === 1) {
            // 直播
            this.isLive = true;
            this.optionTypeInfo('live');
          } else if (this.watchInitData.webinar.type === 5) {
            // 回放
            this.optionTypeInfo('vod', this.watchInitData.paas_record_id);
            this.recordHistoryTime = window.sessionStorage.getItem(
              this.watchInitData.paas_record_id
            )
              ? Number(window.sessionStorage.getItem(this.watchInitData.paas_record_id))
              : 0;
          }
        } else {
          if (this.watchInitData.webinar.type === 3) return; //结束状态
          let _id = this.watchInitData.warmup.warmup_paas_record_id
            ? this.watchInitData.warmup.warmup_paas_record_id
            : this.watchInitData.record.preview_paas_record_id;
          this.vodType = this.watchInitData.warmup.warmup_paas_record_id ? 'warm' : 'shikan';
          if (this.vodType === 'shikan') {
            this.isTryPreview = true;
          } else if (this.vodType === 'warm') {
            this.isWarnPreview = true;
          }
          // 暖场视频或者试看
          this.optionTypeInfo('vod', _id);
        }
      },
      optionTypeInfo(type, id) {
        const winVersion = windowVersion();
        // 直播
        this.playerServer.setType(type);
        if (type === 'live') {
          this.vodOption = {};
          this.liveOption = {
            type:
              this.configList['media_server.watch.rtmp_pc_to_hls'] === '1' || isIE()
                ? 'hls'
                : 'flv',
            roomId: this.watchInitData.interact.room_id
          };
          if (isIE() && winVersion == 'win10') {
            this.liveOption.useSWF = false;
          } else if (isIE() && winVersion == 'win7') {
            this.liveOption.useSWF = true;
          }
        } else {
          this.vodOption.recordId = id;
          this.liveOption = {};
          if (isIE() && winVersion == 'win10') {
            this.liveOption.useSWF = false;
          } else if (isIE() && winVersion == 'win7') {
            this.liveOption.useSWF = true;
          }
        }
      },
      // 获取回放总时长
      getRecordTotalTime() {
        let getRecordTotalTimer = null;
        // 回放时间异步获取 需要通过定时器获取
        getRecordTotalTimer = setInterval(() => {
          this.totalTime =
            this.playerServer &&
            this.playerServer.getDuration(() => {
              console.log('获取视频总时长失败');
            });
          if (this.isTryPreview && this.totalTime > 0) {
            this.recordTime = computeRecordTime(this.totalTime);
            if (this.recordTime === 0) {
              this.recordTime = 1;
            }
            this.authText = this.getShiPreview();
          }
          this.getDuanxuPreview(); //断点续播逻辑
          this.totalTime > 0 && clearInterval(getRecordTotalTimer);
        }, 50);
      },
      getDuanxuPreview() {
        let endTime;
        const parsedTotalTime = parseInt(this.totalTime);
        console.log(window.sessionStorage.getItem(this.vodOption.recordId), '?????111111111');
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
          endTime = window.sessionStorage.getItem(this.vodOption.recordId);
          const parsedEndTime = parseInt(endTime);
          if (endTime && endTime != 'undefined' && parsedTotalTime != parsedEndTime) {
            const seekTime = endTime < 6 ? 0 : endTime - 5;
            this.setVideoCurrentTime(seekTime);
          }
        }
      },
      secondToDate(val) {
        return secondToDateZH(val);
      }
    }
  };
</script>
<style lang="less">
  .vmp-player {
    width: 100%;
    position: relative;
    &-box {
      padding-top: 56.25%;
    }
    &-container {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
    &-watch {
      height: 100%;
      width: 100%;
      border-radius: 4px;
    }
    &-controller {
      position: absolute;
      // bottom: -48px;
      bottom: 5px;
      z-index: 6;
      width: 100%;
      height: 38px;
      box-sizing: border-box;
      background: rgba(0, 0, 0, 0.7);
      transition: all 0.8s;
      &-slider {
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
          .el-slider__runway,
          .el-slider__bar {
            height: 10px;
          }
          .el-slider__button {
            width: 14px;
            height: 14px;
            transform: scale(1) !important;
          }
        }
      }
      &-tools {
        height: 38px;
        display: flex;
        line-height: 38px;
        justify-content: space-between;
        font-size: 14px;
        .iconfont {
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
          > div {
            padding-right: 20px;
            position: relative;
            color: @font-error-low;
          }
          .iconfont {
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
          &-quality,
          &-speed {
            &:hover {
              .vmp-player-controller-tools-right-list {
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
          }
          &-volume {
            position: relative;
            cursor: pointer;
            &:hover {
              .vmp-player-controller-tools-right-volume-slider {
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
    &-tips {
      z-index: 6;
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
        }
        span {
          color: @font-error;
          cursor: pointer;
        }
        .iconfont {
          font-size: 20px;
          padding-left: 12px;
          vertical-align: middle;
          cursor: pointer;
        }
      }
    }
  }
</style>

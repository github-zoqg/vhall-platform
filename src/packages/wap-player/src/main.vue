<template>
  <div class="vmp-wap-player">
    <p v-show="isNoBuffer" class="vmp-wap-player-prompt">
      <span>{{ prompt }}</span>
    </p>
    <div v-show="!isNoBuffer" id="videoWapBox" class="vmp-wap-player-video">
      <!-- 背景图片 -->
      <div class="vmp-wap-player-prompt">
        <span v-if="!isAudio && promptFlag">{{ prompt }}</span>
        <img
          v-if="loadingFlag && !isAudio"
          class="vmp-wap-player-prompt-load"
          src="./images/load.gif"
        />
        <img v-if="isShowPoster" class="vmp-wap-player-prompt-poster" :src="webinarsBgImg" />
      </div>
      <!-- 播放 按钮 -->
      <div v-if="!isPlayering" class="vmp-wap-player-pause">
        <p @click="startPlay">
          <i class="vh-iconfont vh-line-video-play"></i>
        </p>
      </div>
      <div id="vmp-player" @click.stop="videoShowIcon">
        <!-- 视频容器 -->
      </div>
      <!-- 直播结束 -->
      <div
        v-if="false"
        class="vmp-wap-player-ending"
        :style="`backgroundImage: url('${webinarsBgImg}')`"
      >
        <div class="vmp-wap-player-ending-box">
          <div class="vmp-wap-player-ending-box-img">
            <img src="./images/livingEnd@2x.png" alt="" />
          </div>
          <h1 class="vmp-wap-player-ending-box-text">直播已结束</h1>
        </div>
      </div>
      <!-- 回放结束（正常回放和试看回放结束） -->
      <div
        v-if="false"
        class="vmp-wap-player-ending"
        :style="`backgroundImage: url('${videoCover}')`"
      >
        <!-- 试看播放结束 -->
        <div class="vmp-wap-player-ending-box">
          <p class="vmp-wap-player-ending-box-title">试看结束，观看完整视频</p>
          <div class="vmp-wap-player-ending-box-try">
            <p v-if="authText == 6">
              <span class="vmp-wap-player-ending-box-try-pay" @click="handleAuth(3)">付费</span>
              <span @click="handleAuth(4)">邀请码</span>
            </p>
            <span v-else class="vmp-wap-player-ending-box-try-see" @click="handleAuth">
              {{ authText }}
            </span>
          </div>
          <p class="tryKan" @click="replay">
            <i class="vh-iconfont vh-a-line-counterclockwiserotation"></i>
            重新试看
          </p>
        </div>
        <!-- 回放播放结束 -->
        <div class="vmp-wap-player-ending-box" @click="replay">
          <p class="vmp-wap-player-ending-box-noraml">
            <i class="vh-iconfont vh-a-line-counterclockwiserotation"></i>
          </p>
          <p class="vmp-wap-player-ending-box-reset">重新播放</p>
        </div>
      </div>
      <!-- 观看次数  -->
      <div
        class="vmp-wap-player-header"
        v-show="roomBaseState.watchInitData.pv.show && isPlayering"
        :class="[iconShow ? 'opcity-flase' : 'opcity-true']"
      >
        <p>
          <i class="vh-saas-iconfont vh-saas-line-heat"></i>
          &nbsp;{{ hotNum | formatHotNum }}
        </p>
      </div>
      <!-- 倍速、清晰度切换 -->
      <div class="vmp-wap-player-tips" v-if="isSetSpeed || isSetQuality">
        已为您切换到
        <span v-if="isSetQuality">{{ formatQualityText(currentQualitys.def) }}</span>
        <span v-if="isSetSpeed">{{ currentSpeed == 1 ? '正常' : currentSpeed }}倍速</span>
      </div>
      <!-- 底部操作栏  点击 暂停 全屏 播放条 -->
      <div
        :class="[iconShow ? 'vmp-wap-player-opcity-flase' : 'vmp-wap-player-opcity-true']"
        v-show="isPlayering"
      >
        <!-- 倍速和画质合并 -->
        <div class="vmp-wap-player-speed">
          <span @click="openSpeed" v-if="!isLiving">
            {{currentSpeed == 1 ? '倍速': currentSpeed.toString().length &lt; 3 ? `${currentSpeed.toFixed(1)}X` : `${currentSpeed}X`}}
          </span>
          <span @click="openQuality">{{ formatQualityText(currentQualitys.def) }}</span>
        </div>
        <div class="vmp-wap-player-control">
          <div class="vmp-wap-player-control-preview" v-if="false">
            试看
            <span class="vmp-wap-player-control-preview-red">{{ recordTime }}</span>
            分钟, 观看完整视频请
            <span v-if="authText == 6">
              <b class="vmp-wap-player-control-preview-red" @click="handleAuth(3)">付费</b>
              或
              <b class="vmp-wap-player-control-preview-red" @click="handleAuth(4)">邀请码</b>
            </span>
            <span v-else class="vmp-wap-player-control-preview-red" @click="handleAuth">
              {{ authText }}
            </span>
            <i class="vh-iconfont vh-line-close" @click="isShiKanVideo = false"></i>
          </div>
          <div class="vmp-wap-player-control-preview" v-if="false">
            上次观看至
            <!-- {{ currentTime | secondToDate }} -->
            <span class="red">11111</span>
            , 已为您自动续播
            <i class="vh-iconfont vh-line-close" @click="isShowDuanXuboVideo = false"></i>
          </div>
          <div class="vmp-wap-player-control-slider">
            <div v-if="eventPointList.length" ref="vhTailoringWrap">
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
              v-model="sliderVal"
              active-color="rgba(252,86,89,.7)"
              inactive-color="rgba(255,255,255,.3)"
              @change="changeSlider"
            >
              <div slot="button">
                <img src="./images/player.png" alt />
              </div>
            </van-slider>
            <div class="vmp-wap-player-control-icons">
              <span class="vmp-wap-player-control-icons-left">
                <i
                  @click="startPlay"
                  :class="`vh-iconfont ${
                    isPlayering ? 'vh-a-line-videopause' : 'vh-line-video-play'
                  }`"
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
              <!-- 右侧icon集合 v-if="playerOtherOptions.barrage_button" -->
              <p class="vmp-wap-player-control-icons-right">
                <span @click="openBarrage" v-if="isLiving">
                  <i
                    :class="`vh-iconfont ${
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
              </p>
            </div>
          </div>
        </div>
      </div>
      <van-popup
        v-model="isOpenSpeed"
        :overlay="false"
        position="right"
        style="z-index: 12"
        class="vmp-wap-player-popup"
      >
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
      <van-popup
        v-model="isOpenQuality"
        :overlay="false"
        position="right"
        style="z-index: 12"
        class="vmp-wap-player-popup"
      >
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
    </div>
  </div>
</template>
<script>
  import { secondToDateZH, isMse } from './js/utils';
  import controlEventPoint from './components/control-event-point.vue';
  import { useRoomBaseServer, usePlayerServer, useVirtualAudienceServer } from 'middle-domain';
  import playerMixins from './js/mixins';
  export default {
    name: 'VmpWapPlayer',
    mixins: [playerMixins],
    filters: {
      secondToDate(val) {
        return secondToDateZH(val);
      },
      formatHotNum(value) {
        value = parseInt(value);
        let unit = '';
        const k = 99999;
        const sizes = ['', '万', '亿', '万亿'];
        let i;
        if (value > k) {
          i = Math.floor(Math.log(value) / Math.log(k));
          value = (value / Math.pow(k / 10, i)).toFixed(1);
          unit = sizes[i];
        }
        return value + unit;
      }
    },
    components: {
      controlEventPoint
    },
    computed: {
      isNotEmbed() {
        return this.embedObj
          ? !!(this.embedObj.embed == false && this.embedObj.embedVideo == false)
          : true;
      },
      //判断是否是音频直播模式
      isAudio() {
        return this.roomBaseState.watchInitData.webinar.mode == 1;
      },
      // 背景图片
      webinarsBgImg() {
        const cover = '//cnstatic01.e.vhall.com/static/images/mobile/video_default_nologo.png';
        const { warmup, webinar } = this.roomBaseState.watchInitData;
        if (warmup && warmup.warmup_paas_record_id) {
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
        return this.roomBaseState.watchInitData.webinar.type == 1;
      },
      hotNum() {
        return Number(this.onlineState.uvHot) + Number(this.onlineState.virtualHot) + 1;
      }
    },
    data() {
      const { state: playerState } = this.playerServer;
      return {
        playerState,
        isNoBuffer: false,
        promptFlag: false,
        isOpenSpeed: false,
        isOpenQuality: false,
        iconShow: false, // 5秒后操作栏icon消失
        prompt: '内容即将呈现...', // 刚开始点击时展示文案
        loadingFlag: false,
        isShowPoster: true, //是否展示活动图片背景
        isPlayering: false, // 是否是播放状态
        liveOption: {}, //直播时播放器liveOption参数
        vodOption: {}, //回放时回放id
        vodType: '', //回放的类型 暖场视频还是还是试看
        authText: '',
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
        marquee: {}, // 跑马灯
        water: {}, //水印
        playerOtherOptions: {
          barrage_button: 0,
          progress_bar: 0,
          speed: 0,
          autoplay: false
        }
      };
    },
    beforeCreate() {
      this.roomBaseServer = useRoomBaseServer();
      this.playerServer = usePlayerServer();
      this.virtualClientStartServer = useVirtualAudienceServer();
    },
    async created() {
      this.roomBaseState = this.roomBaseServer.state;
      this.onlineState = this.virtualClientStartServer.state;
      this.embedObj = this.roomBaseState.embedObj;
      this.getWebinerStatus();
      this.listenEvents();
    },
    methods: {
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
        this.initPlayer();
      },
      refresh() {
        console.log('11woshi我是刷新');
      },
      initSlider() {
        this.playerServer.$on(VhallPlayer.TIMEUPDATE, () => {
          this.currentTime = this.playerServer.getCurrentTime(() => {
            console.log('获取当前视频播放时间失败----------');
          });
          this.sliderVal = (this.currentTime / this.totalTime) * 100;
          // 派发播放器时间更新事件，通知章节当前播放的时间节点
          // this.$VhallEventBus.$emit(this.$VhallEventType.Chapter.PLAYER_TIME_UPDATE, this.currentTime);
        });
      },
      changeSlider(value) {
        this.currentTime = (value / 100) * this.totalTime;
        this.playerServer.setCurrentTime(this.currentTime, () => {
          this.$toast('调整播放时间失败');
        });
      },
      // 全屏
      enterFullscreen() {
        if (this.isFullscreen) {
          this.isFullscreen = false;
          if (
            !(
              document.exitFullscreen ||
              document.mozCancelFullScreen ||
              document.webkitExitFullscreen ||
              document.msExitFullscreen
            )
          ) {
            this.playerServer.exitFullScreen(event => {});
          }
          if (document.exitFullscreen) document.exitFullscreen();
          else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
          else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
          else if (document.msExitFullscreen) document.msExitFullscreen();
        } else {
          this.isFullscreen = true;
          const element = document.getElementById('videoWapBox');
          if (
            !(
              element.requestFullscreen ||
              element.mozRequestFullScreen ||
              element.webkitRequestFullscreen ||
              element.msRequestFullscreen
            )
          ) {
            this.playerServer.enterFullScreen(event => {});
          }
          if (element.requestFullscreen) element.requestFullscreen();
          else if (element.mozRequestFullScreen) element.mozRequestFullScreen();
          else if (element.webkitRequestFullscreen) element.webkitRequestFullscreen();
          else if (element.msRequestFullscreen) element.msRequestFullscreen();
        }
      },
      handleAuth() {
        console.log('shikan试看权限');
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
        this.fiveDown();
      },
      fiveDown() {
        // 5秒后消失
        clearTimeout(this.setIconTime);
        this.setIconTime = setTimeout(() => {
          this.iconShow = true;
        }, 5000);
      },
      replay() {
        console.log('回放');
      }
    }
  };
</script>
<style lang="less">
  .vmp-wap-player {
    height: 422px;
    width: 100%;
    position: relative;
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
      text-align: center;
      line-height: 422px;
      background: rgb(0, 0, 0);
      font-size: 28px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: rgba(255, 255, 255, 1);
      &-load {
        width: 60px;
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
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
      z-index: 4;
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
          padding-top: 24px;
          span {
            display: inline-block;
            background: #fb3a32;
            color: #fff;
            height: 64px;
            line-height: 64px;
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
            color: #fff;
            padding-top: 40px;
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
        color: #fb2626;
        padding-left: 5px;
      }
    }
    &-speed {
      position: absolute;
      right: 32px;
      top: 50%;
      width: 88px;
      transform: translateY(-60%);
      z-index: 6;
      span {
        width: 100%;
        display: block;
        height: 48px;
        border-radius: 24px;
        background: rgba(0, 0, 0, 0.5);
        text-align: center;
        line-height: 48px;
        font-size: 24px;
        font-family: PingFangSC-Medium, PingFang SC;
        color: #fff;
        &:nth-child(1) {
          margin-bottom: 40px;
        }
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
      z-index: 3;
      padding: 0 32px;
      &-preview {
        height: 64px;
        color: #fff;
        line-height: 64px;
        font-size: 24px;
        position: absolute;
        bottom: 100px;
        left: 32px;
        z-index: 5;
        background: rgba(0, 0, 0, 0.7);
        box-shadow: 0px 4px 8px 0px rgba(118, 118, 118, 0.2);
        border-radius: 32px 32px 32px 0px;
        padding: 0 24px;
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
        &-left {
          .vh-line-refresh-left,
          &-time {
            padding-left: 15px;
            vertical-align: middle;
          }
        }
        &-right {
          i {
            padding-left: 15px;
          }
        }
        .vh-iconfont {
          font-size: 30px;
        }
        // .icon-zanting_icon{
        //   font-size: 34px;
        //   vertical-align: middle;
        // }
      }
    }
    &-popup {
      width: 200px;
      position: absolute;
      // transform: none;
      height: 100%;
      // top: 0;
      background: rgba(0, 0, 0, 0.7);
      ul {
        display: flex;
        width: 100%;
        height: 100%;
        flex-direction: column;
        justify-content: space-around;
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
</style>

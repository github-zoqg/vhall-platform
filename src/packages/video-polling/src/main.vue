<template>
  <div class="vmp-video-polling" ref="videoPolling" id="videoPollingWrap">
    <!-- 头部悬浮区 -->
    <div class="vmp-video-polling__tip">
      <span class="vmp-video-polling__tip-txt">视频轮巡视频墙</span>
      <div class="vmp-video-polling__tip-wrap">
        <span class="vmp-video-polling__tip-auto" v-if="isAutoPolling">
          距离展示下一组 {{ zeroPadding(minute) }}: {{ zeroPadding(second) }}
          <el-button type="primary" size="medium" round @click="autoPolling">
            {{ isPausedPolling ? '继续轮巡' : '暂停轮巡' }}
          </el-button>
        </span>
        <span v-else class="vmp-video-polling__tip-next" @click="nextPolling">下一组</span>
        <el-tooltip content="全屏" placement="bottom">
          <span
            class="vmp-video-polling__tip-btn vh-iconfont"
            :class="isFullscreen ? 'vh-line-narrow' : 'vh-line-amplification'"
            @click="enterFullScreen"
          ></span>
        </el-tooltip>
        <el-tooltip content="退出轮巡" placement="bottom">
          <span
            class="vmp-video-polling__tip-btn vh-iconfont vh-line-switch-button"
            @click="exitVideoPolling"
          ></span>
        </el-tooltip>
      </div>
    </div>
    <!-- body -->
    <div class="vmp-video-polling__body">
      <!-- 左侧视频订阅区域 -->
      <div class="vmp-video-polling__body-stream-box">
        <div class="vmp-video-polling__body-stream">
          <div
            class="vmp-video-polling__stream-list"
            :class="`vmp-video-polling__stream-list__${layoutLevel}`"
            v-if="pollingList.length"
          >
            <div
              class="vmp-video-polling__stream-container"
              v-for="speaker in pollingList"
              :key="speaker.accountId"
            >
              <div class="vmp-video-polling__stream-container-box">
                <vmp-stream-polling-remote :stream="speaker"></vmp-stream-polling-remote>
              </div>
            </div>
          </div>
          <div v-else class="vmp-video-polling__stream-null">
            <div class="polling-null">
              <span class="polling_img"><img src="./img/polling_null@2x.png" alt="" /></span>
              <p class="polling_text">暂无人轮巡</p>
            </div>
          </div>
        </div>
      </div>
      <!-- 右侧用户列表 -->
      <div class="vmp-video-polling__body-user">
        <vmp-video-polling-member-list></vmp-video-polling-member-list>
      </div>
    </div>
  </div>
</template>

<script>
  import { useVideoPollingServer, useInteractiveServer, useRoomBaseServer } from 'middle-domain';
  import screenfull from 'screenfull';
  import VmpVideoPollingMemberList from '@/packages/video-polling-member-list/src/main';
  import clientMsgApi from '@/packages/app-shared/utils/clientMsgApi';
  export default {
    name: 'VmpVideoPolling',
    components: {
      VmpVideoPollingMemberList
    },
    data() {
      return {
        childrenCom: [], // 编排子组件
        isFullscreen: false, // 是否进入全屏
        layoutLevel: 1, // 布局级别
        nextTime: 10, // 手动下一组倒计时的时间
        isPausedPolling: false, // 是否暂停轮巡
        countTimer: null, // 自动下一组的计时器
        minute: '10', // 自动下一组的计时时间
        second: '00' // 自动下一组的计时时间q
      };
    },
    computed: {
      // 轮询列表
      pollingList() {
        return this.$domainStore.state.videoPollingServer.pollingList;
      },
      // 是否是自动轮巡
      isAutoPolling() {
        return this.$domainStore.state.videoPollingServer.isAutoPolling;
      },
      // 轮巡时间
      downTime() {
        return this.$domainStore.state.videoPollingServer.downTime;
      }
    },
    watch: {
      'pollingList.length': {
        immediate: true,
        handler(newVal) {
          if (newVal == 1) {
            this.layoutLevel = 1;
          } else if (newVal <= 4) {
            this.layoutLevel = 2;
          } else if (newVal <= 9) {
            this.layoutLevel = 3;
          }
        }
      }
    },
    beforeCreate() {
      this.videoPollingServer = useVideoPollingServer();
      this.interactiveServer = useInteractiveServer();
      this.roomBaseServer = useRoomBaseServer();
    },
    created() {
      // 是否是客户端嵌入页面的标识
      this._isClientEmbed = this.$route.query.embed === 'client';
      this._isExitPolling = false;
      // 进入时，重置为0
      localStorage.setItem(`isVideoPolling_${this.$route.params.id}`, 0);
      if (this.isAutoPolling) {
        this.changeTime();
      }
    },
    beforeDestroy() {
      this.countTimer && clearInterval(this.countTimer);
      this.nextTimer && clearInterval(this.nextTimer);
    },
    mounted() {
      this.addEventListeners();
    },
    methods: {
      addEventListeners() {
        // 全屏/退出全屏事件
        screenfull.onchange(ev => {
          if (ev.target.id !== 'videoPollingWrap') return;

          this.isFullscreen = screenfull.isFullscreen;
          // 通知客户端全屏和退出全屏事件
          if (this.isFullscreen) {
            // 网页进入全屏
            clientMsgApi.JsCallQtMsg({ type: 'videoRoundFull' });
          } else {
            // 网页退出全屏
            clientMsgApi.JsCallQtMsg({ type: 'videoRoundExitFull' });
          }
        });
        window.addEventListener('beforeunload', () => {
          // 如果是主动退出视频轮巡，就不存 当前轮巡页面的状态
          if (this._isExitPolling) {
            return;
          }

          localStorage.setItem(`isVideoPolling_${this.$route.params.id}`, 1);
        });
        clientMsgApi.onQtCallFunctionPage(msg => {
          // 客户端关闭全屏事件
          if (msg === 13) {
            // 退出全屏
            this.enterFullScreen();
          }
        });

        // 客户端嵌入页面，需要将 esc 事件通知给客户端，客户端自己监听不到这个按键
        if (this._isClientEmbed) {
          window.addEventListener('keydown', e => {
            if (e.keyCode == 27 && this.isFullscreen) {
              this.enterFullScreen();
            }
          });
        }
        // 订阅流播放失败    监听到播放失败, 然后展示按钮
        this.interactiveServer.$on('EVENT_STREAM_PLAYABORT', () => {
          this.playboartCount ? ++this.playboartCount : (this.playboartCount = 1);
          if (this.playboartCount > 1) {
            return;
          }
          this.$alert('您已进入直播房间，马上开始互动吧', '', {
            title: '提示',
            confirmButtonText: '立即开始',
            customClass: 'zdy-message-box',
            cancelButtonClass: 'zdy-confirm-cancel',
            callback: () => {
              this.interactiveServer.playAbortStreams();
            }
          });
        });
        // 直播结束
        this.videoPollingServer.$on('VIDEO_POLLING_OVER', () => {
          localStorage.removeItem(`isVideoPolling_${this.$route.params.id}`);
          // 在其他页面通过js脚本打开的标签页，直接 close 是关不掉的
          window.open(location, '_self').close();
        });
      },
      // 下一组
      nextPolling() {
        if (this.nextTime < 10) {
          this.$message.error('请勿频繁操作');
          return;
        } else {
          this.videoPollingServer
            .getVideoRoundUsers({
              is_next: 1
            })
            .then(res => {
              if (res.code == 513343) {
                this.setPollingAlert('视频论巡未开启！');
                return;
              }
              if (
                res.data.account_id !=
                this.roomBaseServer.state.watchInitData.join_info.third_party_user_id
              ) {
                // 当前已经有人开始视频轮询了
                const title = `${this.$getRoleName(res.data.role_name)}已开启了视频轮巡功能`;
                if (this._isClientEmbed) {
                  // 如果下一组报错了，报给客户端
                  clientMsgApi.JsCallQtMsg({ type: 'videoRoundErr', msg: title });
                  return;
                }
                this.setPollingAlert(title);
              }
            })
            .catch(() => {
              // 当前已经有人开始视频轮询了
              const msg = '网络异常导致互动房间连接失败';
              if (this._isClientEmbed) {
                // 如果下一组报错了，报给客户端
                clientMsgApi.JsCallQtMsg({ type: 'videoRoundErr', msg });
                return;
              }
              this.setPollingAlert(msg);
            });
        }
        this.nextTimer = setInterval(() => {
          this.nextTime--;
          if (this.nextTime <= 0) {
            this.nextTime = 10;
            clearInterval(this.nextTimer);
            return false;
          }
        }, 1000);
      },
      changeTime() {
        this.minute = (((this.downTime / 60) % 60 >> 0) + '').padStart(2, 0);
        this.second = ((this.downTime % 60 >> 0) + '').padStart(2, 0);
        this.counterTime(this.minute, this.second);
      },
      autoPolling() {
        this.isPausedPolling = !this.isPausedPolling;
        if (this.isPausedPolling) {
          clearInterval(this.countTimer);
        } else {
          if (this.minute == 0 && this.second == 0) {
            this.changeTime();
          } else {
            this.counterTime(this.minute, this.second);
          }
        }
      },
      counterTime(minute, second) {
        this.countTimer = setInterval(() => {
          second--;
          if (second < 0) {
            minute--;
            second = 59;
          }
          if (minute == 0 && second == 0) {
            clearInterval(this.countTimer);
            this.videoPollingServer
              .getVideoRoundUsers({
                is_next: 1
              })
              .then(res => {
                if (res.code === 200) {
                  this.changeTime();
                } else {
                  clearInterval(this.countTimer);
                }
              });
          }
          this.minute = minute;
          this.second = second;
        }, 1000);
      },
      zeroPadding(num) {
        num = Number(num);
        if (isNaN(num)) return num;
        if (num >= 0 && num < 10) {
          return `0${num}`;
        }
        return num;
      },
      // 退出视频轮询
      exitVideoPolling() {
        // 通知客户端关闭视频轮询页面
        if (this._isClientEmbed) {
          clientMsgApi.JsCallQtMsg({ type: 'closeVideoRound' });
          return;
        }

        this.$confirm('关闭后将结束视频轮巡功能', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          customClass: 'zdy-message-box',
          lockScroll: false,
          cancelButtonClass: 'zdy-confirm-cancel'
        }).then(() => {
          this.videoPollingServer.videoRoundEnd().then(res => {
            if (res.code === 200) {
              this._isExitPolling = true;
              // this.$message.success('退出成功');
              localStorage.removeItem(`isVideoPolling_${this.$route.params.id}`);
              window.open(location, '_self').close();
            } else {
              this.$message.error(res.msg);
            }
          });
        });
      },
      // 切换全屏
      enterFullScreen() {
        screenfull.toggle(this.$refs.videoPolling);
      },
      // 已经有其他人开启了轮巡
      setPollingAlert(title) {
        this.$alert(title, '', {
          title: '提示',
          confirmButtonText: '知道了',
          customClass: 'zdy-message-box',
          cancelButtonClass: 'zdy-confirm-cancel',
          callback: () => {
            window.open(location, '_self').close();
          }
        });
      }
    }
  };
</script>

<style lang="less">
  .vmp-video-polling {
    width: 100%;
    height: 100%;
    background-color: #2d2d2d;
    display: flex;
    flex-direction: column;
    &__tip {
      display: flex;
      width: 100%;
      height: 48px;
      line-height: 48px;
      background-color: #434343;
      align-items: center;
      justify-content: space-between;
      &-txt {
        font-size: 18px;
        font-weight: 400;
        color: #e6e6e6;
        line-height: 24px;
        margin-left: 20px;
      }
      &-wrap {
        padding-right: 8px;
      }
      &-auto {
        color: #fff;
        line-height: 20px;
        font-size: 14px;
        margin-right: 32px;
        .el-button.el-button--medium {
          padding: 3px 23px;
          margin-left: 16px;
        }
      }
      &-next {
        margin-right: 32px;
        display: inline-block;
        width: 88px;
        height: 32px;
        text-align: center;
        line-height: 32px;
        border: 1px solid #979797;
        border-radius: 20px;
        color: #fff;
        font-size: 14px;
        cursor: pointer;
        &:hover {
          border: 1px solid #fb3a32;
          color: #fb3a32;
        }
      }
      &-btn {
        cursor: pointer;
        display: inline-block;
        width: 32px;
        height: 32px;
        border-radius: 100%;
        background: #e2e2e2;
        background-color: rgba(226, 226, 226, 0.15);
        line-height: 32px;
        text-align: center;
        font-size: 18px;
        color: #cccccc;
        margin-right: 16px;
        &:hover {
          background: #e2e2e2;
          background-color: rgba(226, 226, 226, 0.3);
        }
      }
    }
    &__body {
      display: flex;
      height: calc(100% - 48px);
      &-stream-box {
        flex: 1;
        height: 100%;
        overflow: auto;
      }
      .vmp-video-polling__stream-null {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        .polling-null {
          .polling_img {
            display: inline-block;
            width: 220px;
            height: 100px;
            img {
              width: 100%;
              height: 100%;
              object-fit: scale-down;
            }
          }
          .polling_text {
            text-align: center;
            margin-top: 20px;
            line-height: 22px;
            font-size: 16px;
            color: #999;
          }
        }
      }
      .vmp-video-polling__body-stream {
        flex: 1;
        display: flex;
        height: 100%;
        align-items: center;
        background-color: #000;
        .vmp-video-polling__stream-list {
          width: 100%;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          .vmp-video-polling__stream-container {
            box-sizing: border-box;
            border: 1px solid #000;
            &-box {
              padding-top: 56.25%;
              position: relative;
              .vmp-polling-stream-remote {
                position: absolute;
                top: 0;
                left: 0;
              }
            }
          }
          &__1 {
            .vmp-video-polling__stream-container {
              width: 100%;
              border: none;
            }
          }
          &__2 {
            .vmp-video-polling__stream-container {
              width: 50%;
            }
          }
          &__3 {
            .vmp-video-polling__stream-container {
              width: 33.3%;
            }
          }
        }
      }
      &-user {
        width: 360px;
        height: 100%;
        background-color: #2a2a2a;
      }
    }
  }
</style>

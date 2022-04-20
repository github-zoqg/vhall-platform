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
        <span
          class="vmp-video-polling__tip-btn vh-iconfont"
          :class="isFullscreen ? 'vh-line-narrow' : 'vh-line-amplification'"
          @click="enterFullScreen"
          title="全屏"
        ></span>
        <span
          class="vmp-video-polling__tip-btn vh-iconfont vh-line-switch-button"
          @click="exitVideoPolling"
          title="退出轮巡"
        ></span>
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
  import { useVideoPollingServer, useInteractiveServer } from 'middle-domain';
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
        childrenCom: [],
        isFullscreen: false, // 是否进入全屏
        layoutLevel: 1,
        nextTime: 10,
        isPausedPolling: false,
        countTimer: null,
        minute: '10',
        second: '00'
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
    },
    created() {
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
      if (this.$route.query.embed === 'client') {
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
    },
    methods: {
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
              if (res.code !== 200) {
                // 如果下一组报错了，报给客户端
                // TODO: 后端可能需要给出一个特定的code码，告诉前端当前已经有人开始视频轮询了，如果提供，直接改成该 code 码即可
                clientMsgApi.JsCallQtMsg({ type: 'videoRoundErr', msg: res });
              }
            });
        }
        this.nextTimer = setInterval(() => {
          this.nextTime--;
          if (this.nextTime == 0) {
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
          this.counterTime(this.minute, this.second);
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
        if (this.$route.query.embed === 'client') {
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
            background-color: skyblue;
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

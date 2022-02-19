<template>
  <section>
    <van-popup
      get-container="#otherPopupContainer"
      v-model="showConnectMic"
      position="bottom"
      :overlay="true"
      :round="true"
    >
      <div class="handsup-box">
        <div class="link-btn mic-btns" v-if="isSpeakOn">
          <!-- 摄像头按钮 -->
          <button class="btn" @click="handleClickMuteDevice('video')">
            <i
              class="vh-iconfont iconfont-bottom vh-line-turn-off-video-camera"
              v-show="!localStream.videoMuted"
            ></i>
            <i
              class="vh-iconfont iconfont-bottom vh-line-video-camera"
              v-show="localStream.videoMuted"
            ></i>
            <div class="btn-text">{{ localStream.videoMuted }}{{ $t('setting.setting_1003') }}</div>
          </button>
          <!-- 麦克风按钮 -->
          <button class="btn" @click="handleClickMuteDevice('audio')">
            <i
              class="vh-iconfont iconfont-bottom vh-line-turn-off-microphone"
              v-show="!localStream.audioMuted"
            ></i>
            <i
              class="vh-iconfont iconfont-bottom vh-line-microphone"
              v-show="localStream.audioMuted"
            ></i>
            <div class="btn-text">{{ $t('setting.setting_1004') }}</div>
          </button>
          <button class="btn" @click="offConnect">
            <i class="vh-iconfont iconfont-bottom vh-a-line-handsdown"></i>
            <div class="btn-text">{{ handText }}</div>
          </button>
        </div>
        <button class="btn btn-handsup" v-if="!isSpeakOn" @click="handsUpToConnect">
          <i
            v-if="handText.search('等待...') != -1"
            class="vh-iconfont iconfont-bottom vh-a-line-handsup"
          ></i>
          <div class="btn-text">{{ handText }}</div>
        </button>
        <button class="btn" @click="closeConnectPop">{{ $t('account.account_1063') }}</button>
      </div>
    </van-popup>
  </section>
</template>
<script>
  import { useMicServer, useInteractiveServer } from 'middle-domain';
  export default {
    name: 'Handup',
    data() {
      return {
        handText: this.$t('interact.interact_1001'),
        lowerWheat: false, // 用户自己主动上麦等待时间展示
        lowerWheatFun: null,
        showConnectMic: false, // 连麦弹框
        isWaitting: false
      };
    },
    computed: {
      localStream() {
        const status = this.$domainStore.state.interactiveServer.localStream;
        console.log('麦克风状态------------status', status);
        return status;
      },
      joinInfo() {
        return this.$domainStore.state.roomBaseServer.watchInitData.join_info;
      },
      // 是否是上麦状态
      isSpeakOn() {
        return this.$domainStore.state.micServer.isSpeakOn;
      }
    },
    watch: {
      isSpeakOn: {
        handler(val) {
          if (val) {
            this.handText = this.$t('interact.interact_1007');
          } else {
            this.handText = this.$t('interact.interact_1001');
          }
        }
      }
    },
    created() {
      // 用户成功上麦
      useMicServer().$on('vrtc_connect_success', msg => {
        if (this.joinInfo.third_party_user_id == msg.data.room_join_id) {
          clearInterval(this.lowerWheatFun);
          this.lowerWheatFun = null;
          this.isWaitting = false;
          this.handText = this.$t('interact.interact_1001');
        }
      });
    },
    methods: {
      // 下麦操作
      offConnect() {
        useMicServer().speakOff();
      },
      // / 举手上麦
      handsUpToConnect() {
        if (this.lowerWheatFun) {
          return;
        }
        this.applyMic();
      },
      // 打开连麦弹框
      openConnectPop() {
        this.showConnectMic = true;
      },
      // 关闭弹窗
      closeConnectPop() {
        this.showConnectMic = false;
      },
      // 主动上麦方法
      applyMic() {
        useMicServer()
          .userApply()
          .then(res => {
            if (res.code != 200) {
              // TODO 根据code码提示 this.$tes(res.code) || res.msg
              this.$toast(res.msg);
              return;
            }
            /*
              1、更新文案，为倒计时，倒计时结束，主持人拒绝，提示拒绝上麦
              */
            this.lowerWheatTimer = 30;
            this.handText = `${this.$t('interact.interact_1004')}...(${this.lowerWheatTimer}s)`;
            this.$emit('handupLoading', true);
            this.lowerWheatFun = setInterval(() => {
              this.lowerWheatTimer--;
              this.handText = `${this.$t('interact.interact_1004')}...(${this.lowerWheatTimer}s)`;
              this.isWaitting = true;
              if (this.lowerWheatTimer <= 0) {
                clearInterval(this.lowerWheatFun);
                this.lowerWheatFun = null;
                this.isWaitting = false;
                this.handText = this.$t('interact.interact_1001');
                this.$emit('handupLoading', false);
                this.closeConnectPop();
                useMicServer().userCancelApply();
              }
            }, 1000);
          });
      },
      handleClickMuteDevice(deviceType) {
        const status = useInteractiveServer().state.localStream[`${deviceType}Muted`] ? 1 : 0;
        useInteractiveServer().setDeviceStatus({
          device: deviceType == 'video' ? 2 : 1,
          status,
          receive_account_id: this.joinInfo.third_party_user_id
        });
      }
    }
  };
</script>
<style scoped lang="less">
  .connect-mic-popup {
    font-size: 28px;
    font-weight: 400;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border-radius: 20px 20px 0px 0px;
    background: #fff;
  }
  .handsup-box {
    width: 100%;
    .btn {
      font-size: 30px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: #fff;
      padding: 30px 0;
      width: 100%;
    }
    .btn-handsup {
      width: 100%;
      border-bottom: 1px solid #e3e3e3;
      padding: 45px 0;
    }
  }
  .btn-link {
    height: 100px;
    width: 100px;
  }
  .mic-btns {
    display: flex;
    width: 100%;
    height: 224px;
    justify-content: space-evenly;
    align-items: center;
    border-bottom: 1px solid #e3e3e3;
  }
  .iconfont {
    font-size: 48px;
  }
  .iconfont-bottom {
    font-size: 50px;
    border-radius: 50%;
    padding: 25px;
    background-color: #f7f7f7;
  }

  .btn-text {
    font-size: 30px;
    margin-top: 12px;
  }
  .invite-box {
    width: 100%;
    text-align: center;
    font-size: 28px;
    .btn {
      background: #fff;
      padding: 30px 0;
    }
    .invite-desc {
      font-weight: 400;
      color: #262626;
      padding: 36px 0;
    }
    .invite-btn-box {
      border-top: 1px solid #e3e3e3;
      .btn {
        width: 50%;
      }
      .btn-agree {
        color: #ff3030;
        border-right: 1px solid #e3e3e3;
      }
      .btn-refuse {
        color: #595959;
      }
    }
  }
  .connect-icon-box {
    position: relative;
  }
  .red-dot {
    position: absolute;
    right: 0;
    top: 0;
    width: 10px;
    height: 10px;
    background-color: #ff3030;
    border-radius: 10px;
  }
</style>

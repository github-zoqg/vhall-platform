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
              v-show="localSpeaker.videoMuted"
            ></i>
            <i
              class="vh-iconfont iconfont-bottom vh-line-video-camera"
              v-show="!localSpeaker.videoMuted"
            ></i>
            <div class="btn-text">{{ $t('setting.setting_1003') }}</div>
          </button>
          <!-- 麦克风按钮 -->
          <button class="btn" @click="handleClickMuteDevice('audio')">
            <i
              class="vh-iconfont iconfont-bottom vh-line-microphone"
              v-show="!localSpeaker.audioMuted"
            ></i>
            <i
              class="vh-iconfont iconfont-bottom vh-line-turn-off-microphone"
              v-show="localSpeaker.audioMuted"
            ></i>
            <div class="btn-text">{{ $t('setting.setting_1004') }}</div>
          </button>
          <button class="btn" @click="offConnect">
            <i class="vh-iconfont iconfont-bottom vh-a-line-handsdown"></i>
            <div class="btn-text">{{ $t('interact.interact_1007') }}</div>
          </button>
        </div>
        <button
          class="btn btn-handsup"
          v-if="!isSpeakOn"
          :disabled="btnDisabled"
          @click="handsUpToConnect"
        >
          <i
            v-if="handText.search(`${$t('interact.interact_1004')}...`) != -1"
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
  import {
    useMicServer,
    useInteractiveServer,
    useMsgServer,
    useMediaCheckServer
  } from 'middle-domain';
  export default {
    name: 'Handup',
    data() {
      return {
        handText: this.$t('interact.interact_1041'),
        lowerWheat: false, // 用户自己主动上麦等待时间展示
        lowerWheatFun: null,
        showConnectMic: false, // 连麦弹框
        isWaitting: false,
        btnDisabled: false
      };
    },
    computed: {
      localSpeaker() {
        return (
          this.$domainStore.state.micServer.speakerList.find(
            item => item.accountId == this.joinInfo.third_party_user_id
          ) || {}
        );
      },
      localStream() {
        return this.$domainStore.state.interactiveServer.localStream;
      },
      joinInfo() {
        return this.$domainStore.state.roomBaseServer.watchInitData.join_info;
      },
      // 是否是上麦状态
      isSpeakOn() {
        return this.$domainStore.state.micServer.isSpeakOn;
      },
      isInGroup() {
        return this.$domainStore.state.groupServer.groupInitData.isInGroup;
      }
    },
    watch: {
      isSpeakOn: {
        handler(val) {
          if (val) {
            this.handText = this.$t('interact.interact_1007');
          } else {
            this.handText = this.$t('interact.interact_1041');
          }
        }
      }
    },
    created() {
      // 用户成功上麦
      useMicServer().$on('vrtc_connect_success', msg => {
        this.closeConnectPop();
        this.$emit('handupLoading', false);
        if (this.joinInfo.third_party_user_id == msg.data.room_join_id) {
          clearInterval(this.lowerWheatFun);
          this.lowerWheatFun = null;
          this.isWaitting = false;
          this.handText = this.$t('interact.interact_1007');
        }
      });

      // 用户成功下麦
      useMicServer().$on('vrtc_disconnect_success', msg => {
        // this.$toast(this.$t('interact.interact_1028'));
      });
      // 用户申请被拒绝（客户端有拒绝用户上麦的操作）
      useMsgServer().$onMsg('ROOM_MSG', msg => {
        let temp = Object.assign({}, msg);
        if (Object.prototype.toString.call(temp.data) !== '[object Object]') {
          temp.data = JSON.parse(temp.data);
        }
        const { type = '' } = temp.data || {};
        if (type === 'vrtc_connect_refused') {
          if (this.joinInfo.third_party_user_id != temp.data.room_join_id) return;
          this.lowerWheatFun && clearInterval(this.lowerWheatFun);
          this.lowerWheatFun = null;
          this.isWaitting = false;
          this.handText = this.$t('interact.interact_1041');
          this.showConnectMic = false;
          this.$emit('handupLoading', false);
          this.closeConnectPop();
          window.vhallReportForProduct.toResultsReporting(170008, {
            event_type: 'meassage',
            failed_reason: msg
          });
        }
      });
    },
    methods: {
      // 下麦操作
      offConnect() {
        this.$dialog
          .confirm({
            title: this.$t('account.account_1061'),
            message: this.$t('interact.interact_1043'),
            confirmButtonText: this.$t('account.account_1062'),
            cancelButtonText: this.$t('account.account_1063'),
            confirmButtonColor: '#fb3a32',
            cancelButtonClass: 'zdy-confirm-cancel'
          })
          .then(() => {
            this.$emit('handupLoading', false);
            this.closeConnectPop();
            window.vhallReportForProduct.toStartReporting(170002, [170003, 170033, 110193, 110185]);
            useMicServer()
              .speakOff()
              .then(res => {
                window.vhallReportForProduct.toResultsReporting(170003, {
                  event_type: 'interface',
                  failed_reason: res,
                  request_id: res.request_id
                });
              });
          });
      },
      // 举手上麦
      handsUpToConnect() {
        if (this.lowerWheatFun) {
          return;
        }
        this.mediaCheckClick();
      },
      // 打开连麦弹框
      openConnectPop() {
        this.showConnectMic = true;
      },
      // 关闭弹窗
      closeConnectPop() {
        this.showConnectMic = false;
      },
      // 上麦前进行媒体检测  device_status 0未检测 1 设备OK   2设备不支持
      async mediaCheckClick() {
        const device_status = useMediaCheckServer().state.deviceInfo.device_status;

        if (device_status == 1) {
          this.applyMic();
        } else if (device_status == 0) {
          useMediaCheckServer()
            .getMediaInputPermission({ isNeedBroadcast: false })
            .then(flag => {
              if (flag) {
                this.applyMic();
              } else {
                const _tipMsg = this.$t('interact.interact_1040');
                this.$toast(_tipMsg);
                this.closeConnectPop();
              }
            });
        } else {
          this.$toast(this.$t('interact.interact_1040'));
          this.closeConnectPop();
        }
      },
      // 主动上麦方法
      applyMic() {
        this.btnDisabled = true;
        // 申请连麦
        window?.vhallReportForProduct.toStartReporting(170004, [170005, 170032, 110187, 110183]);

        useMicServer()
          .userApply()
          .then(res => {
            this.btnDisabled = false;
            if (res.code != 200) {
              // TODO 根据code码提示 this.$tec(res.code) || res.msg
              if (res.code == 513025) {
                this.$message.error(
                  this.$t('interact.interact_1029', { n: res.data.replace_data[0] })
                );
              }
              // 数据上报，场景：申请连麦接口 返回失败
              window.vhallReportForProduct.toResultsReporting(170005, {
                event_type: 'interface',
                waiting_time: this.lowerWheatTimer,
                failed_reason: res,
                request_id: res.request_id
              });
              return;
            }
            /*
                1、更新文案，为倒计时，倒计时结束，主持人拒绝，提示拒绝上麦
                */
            this.lowerWheatTimer = 30;
            this.handText = `${this.$t('interact.interact_1004')}...(${this.lowerWheatTimer}s)`;
            this.$emit('handupLoading', true);
            // 数据上报，场景：申请连麦接口 返回成功
            window.vhallReportForProduct.toResultsReporting(170005, {
              event_type: 'interface',
              failed_reason: res,
              waiting_time: this.lowerWheatTimer,
              request_id: res.request_id
            });
            this.lowerWheatFun = setInterval(() => {
              this.lowerWheatTimer--;
              this.handText = `${this.$t('interact.interact_1004')}...(${this.lowerWheatTimer}s)`;
              this.isWaitting = true;
              if (this.lowerWheatTimer <= 0) {
                clearInterval(this.lowerWheatFun);
                this.lowerWheatFun = null;
                this.isWaitting = false;
                this.handText = this.$t('interact.interact_1041');
                this.$emit('handupLoading', false);
                let tip = '';
                if (this.isInGroup) {
                  tip = '组长拒绝了您的上麦请求';
                } else {
                  tip = this.$t('other.other_1006');
                }
                this.$toast(tip);
                // 数据上报，响应场景：申请连麦拒绝
                window.vhallReportForProduct.toResultsReporting(170005, {
                  failed_reason: tip,
                  waiting_time: this.lowerWheatTimer
                });
                this.closeConnectPop();
                useMicServer().userCancelApply();
              }
            }, 1000);
          })
          .catch(err => {
            this.btnDisabled = false;
            // 数据上报，场景：申请连麦接口异常
            window.vhallReportForProduct.toResultsReporting(170005, {
              event_type: 'interface',
              failed_reason: err,
              waiting_time: this.lowerWheatTimer,
              request_id: err.request_id
            });
          });
      },
      async handleClickMuteDevice(deviceType) {
        // 1 为打开 [不禁止画面]         0 关闭 [禁止画面]
        const status = this.localSpeaker[`${deviceType}Muted`] ? 1 : 0;
        await useInteractiveServer().setDeviceStatus({
          device: deviceType == 'video' ? 2 : 1,
          status,
          receive_account_id: this.joinInfo.third_party_user_id
        });
        // 110136关闭    110137 开启
        if (deviceType == 'video') {
          window.vhallReportForProduct?.report(status == 1 ? 110137 : 110136);
        } else {
          // 110138 关闭    110139 开启
          window.vhallReportForProduct?.report(status == 1 ? 110139 : 110138);
        }
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

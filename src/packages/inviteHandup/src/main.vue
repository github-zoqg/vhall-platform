<template>
  <section>
    <!-- 邀请上麦弹窗 -->
    <van-popup
      v-model="showInviteConnectMic"
      :close-on-click-overlay="false"
      position="bottom"
      class="connect-mic-popup"
      get-container="#connectMicPopupContainer"
    >
      <div class="invite-box">
        <p class="invite-desc">{{ $t('interact.interact_1031', { n: roleName }) }}</p>
        <div class="invite-btn-box">
          <button class="btn btn-agree" :disabled="btnDisabled" @click="mediaCheckClick">
            {{ $t('interact.interact_1009') }}
          </button>
          <!-- 拒绝上麦 -->
          <button class="btn" :disabled="btnDisabled" @click="refuseInviteConnect">
            {{ refusedText }}
          </button>
        </div>
      </div>
    </van-popup>
  </section>
</template>
<script>
  import {
    useMsgServer,
    useChatServer,
    useRoomBaseServer,
    useMicServer,
    useMediaCheckServer
  } from 'middle-domain';
  import { boxEventOpitons } from '@/app-shared/utils/tool';
  export default {
    name: 'VmpInviteHandup',
    data() {
      return {
        refusedText: this.$t('interact.interact_1010'),
        showInviteConnectMic: false, // 邀请上麦弹框展示
        inviteFun: null,
        roleName: this.$getRoleName(1),
        isWaitting: false,
        inviteTime: 30,
        senderId: '',
        btnDisabled: false
      };
    },
    computed: {
      join_info() {
        return this.$domainStore.state.roomBaseServer.watchInitData.join_info;
      },
      roomBaseState() {
        return useRoomBaseServer().state;
      },
      isInGroup() {
        return this.$domainStore.state.groupServer.groupInitData.isInGroup;
      }
    },
    mounted() {
      //房间消息
      if (this.inviteFun) {
        clearInterval(this.inviteFun);
      }
      useMsgServer().$onMsg('ROOM_MSG', rawMsg => {
        let temp = Object.assign({}, rawMsg);
        if (Object.prototype.toString.call(temp.data) !== '[object Object]') {
          temp.data = JSON.parse(temp.data);
          temp.context = JSON.parse(temp.context);
        }
        const { type = '' } = temp.data || {};
        this.roleName =
          temp.data.room_role == 20 ? this.$t('chat.chat_1064') : this.$getRoleName(1);
        this.roleName = temp.data.inviter_role_name
          ? this.$getRoleName(+temp.data.inviter_role_name)
          : this.$getRoleName(1);
        if (type === 'vrtc_connect_invite') {
          // 是本人的时候，弹出邀请弹框
          if (this.join_info.third_party_user_id !== temp.data.room_join_id) {
            return;
          }
          this.senderId = temp.sender_id;
          this.showInviteConnectMic = true;
          this.inviteTime = 30;
          clearInterval(this.inviteFun);
          this.refusedText = `${this.$t('interact.interact_1010')}(${this.inviteTime}s)`;
          let st = Date.now();
          let i = 0;
          this.inviteFun = setInterval(() => {
            i = ~~((Date.now() - st) / 1000);
            this.inviteTime = 30 - i;
            this.refusedText = `${this.$t('interact.interact_1010')}(${this.inviteTime}s)`;
            if (this.inviteTime <= 0) {
              // 7.7.4 优化后不再提示
              // this.$toast(this.$t('interact.interact_1025'));
              clearInterval(this.inviteFun);
              this.refusedText = `${this.$t('interact.interact_1010')}`;
              this.showInviteConnectMic = false;
              this.toResultsReporting(
                170010,
                encodeURIComponent(this.$t('interact.interact_1025')),
                {
                  event_type: 'message'
                }
              );
            }
          }, 1000);
        }
      });

      //监听禁言通知
      useChatServer().$on('banned', res => {
        this.showInviteConnectMic && this.clearTime();
      });
      //监听全体禁言通知
      useChatServer().$on('allBanned', res => {
        this.showInviteConnectMic && this.clearTime();
      });
    },
    methods: {
      clearTime() {
        this.inviteFun && clearInterval(this.inviteFun);
        this.refusedText = this.$t('interact.interact_1010');
        this.showInviteConnectMic = false;
        this.inviteTime = 30;
      },
      // 关闭邀请连麦弹框
      closeInviteConnectPop() {
        this.showInviteConnectMic = false;
      },
      // 上麦前进行媒体检测  device_status 0未检测 1 设备OK   2设备不支持
      async mediaCheckClick() {
        const device_status = useMediaCheckServer().state.deviceInfo.device_status;
        if (device_status == 1) {
          this.customAgreeConnect();
        } else if (device_status == 0) {
          useMediaCheckServer()
            .getMediaInputPermission({ isNeedBroadcast: false })
            .then(flag => {
              if (flag) {
                this.customAgreeConnect();
              } else {
                this.$toast(this.$t('interact.interact_1040'));
                this.refuseInviteConnect();
              }
            });
        } else {
          this.$toast(this.$t('interact.interact_1040'));
          this.refuseInviteConnect();
        }
      },
      // 同意邀请上麦
      customAgreeConnect() {
        this.btnDisabled = true;
        window?.vhallReportForProduct.toStartReporting(170009, [170010, 170032, 110187, 110183], {
          waiting_time: this.inviteTime
        });
        useMicServer()
          .userAgreeInvite({
            room_id: this.roomBaseState.watchInitData.interact.room_id,
            type: 0, // 0=邀请上麦|1=邀请演示
            extra_params: this.senderId
          })
          .then(res => {
            this.btnDisabled = false;
            if (res.code !== 200) {
              if (res.code == 513345) {
                this.$message.warning(this.$t('interact.interact_1037'));
              } else {
                this.$message.error(res.msg);
              }
            } else {
              window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitAgreeInvite'));
              useMicServer().userSpeakOn();
            }
            this.toResultsReporting(170010, res, {
              event_type: 'interface',
              waiting_time: `wait-for ${30 - this.inviteTime}s`
            });
            clearInterval(this.inviteFun);
            this.inviteTime = 30;
            this.refusedText = this.$t('interact.interact_1010');
            this.closeInviteConnectPop();
          })
          .catch(err => {
            this.btnDisabled = false;
            this.toResultsReporting(170010, err, {
              event_type: 'interface'
            });
          });
      },
      // 拒绝上麦
      refuseInviteConnect() {
        this.btnDisabled = true;
        window?.vhallReportForProduct.toStartReporting(170011, 170012, {
          waiting_time: this.inviteTime,
          rejection_method: '点击了按钮或关闭弹窗'
        });
        useMicServer()
          .userRejectInvite({
            room_id: this.roomBaseState.watchInitData.interact.room_id,
            type: 0, // 0=邀请上麦|1=邀请演示
            extra_params: this.senderId
          })
          .then(res => {
            this.toResultsReporting(170012, {
              event_type: 'interface',
              waiting_time: this.inviteTime,
              rejection_method: res,
              request_id: res?.request_id
            });
            this.btnDisabled = false;
            clearInterval(this.inviteFun);
            this.inviteTime = 30;
            this.refusedText = this.$t('interact.interact_1010');
            this.isConfirmVisible = false;
            this.closeInviteConnectPop();
          })
          .catch(err => {
            // 拒绝失败
            console.log(err);
            this.toResultsReporting(170012, {
              event_type: 'interface',
              waiting_time: this.inviteTime,
              rejection_method: err
            });
            this.btnDisabled = false;
          });
      },
      // 上报_结果
      toResultsReporting(eventId, res, options = {}) {
        window.vhallReportForProduct.toResultsReporting(
          eventId,
          {
            ...{ event_type: 'interface', failed_reason: res },
            ...options
          }
          // 返回的key值
          // todo keyCode
        );
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

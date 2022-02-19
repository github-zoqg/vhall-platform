<template>
  <section>
    <!-- 邀请上麦弹窗 -->
    <van-popup
      v-model="showInviteConnectMic"
      position="bottom"
      class="connect-mic-popup"
      get-container="#connectMicPopupContainer"
    >
      <div class="invite-box">
        <p class="invite-desc">是否接受上麦邀请，请确认？</p>
        <div class="invite-btn-box">
          <button class="btn btn-agree" @click="customAgreeConnect">
            {{ $t('interact.interact_1009') }}
          </button>
          <!-- 拒绝上麦 -->
          <button class="btn" @click="refuseInviteConnect">{{ refusedText }}</button>
        </div>
      </div>
    </van-popup>
  </section>
</template>
<script>
  import { useMsgServer, useMicServer } from 'middle-domain';
  export default {
    name: 'InviteHandup',
    data() {
      return {
        refusedText: this.$t('interact.interact_1010'),
        showInviteConnectMic: false, // 邀请上麦弹框展示
        inviteFun: null,
        isWaitting: false,
        inviteTime: 30
      };
    },

    props: {
      roomBaseState: {
        type: Object,
        required: true
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
        if (type === 'vrtc_connect_invite') {
          this.showInviteConnectMic = true;
          this.inviteTime = 30;
          clearInterval(this.inviteFun);
          this.refusedText = `${this.$t('interact.interact_1010')}(${this.inviteTime}s)`;
          this.inviteFun = setInterval(() => {
            this.inviteTime--;
            this.refusedText = `${this.$t('interact.interact_1010')}(${this.inviteTime}s)`;
            if (this.inviteTime <= 0) {
              clearInterval(this.inviteFun);
              this.refusedText = `${this.$t('interact.interact_1010')}`;
              this.showInviteConnectMic = false;
            }
          }, 1000);
        }
      });
    },
    methods: {
      // 关闭邀请连麦弹框
      closeInviteConnectPop() {
        this.showInviteConnectMic = false;
      },
      // 同意邀请上麦
      customAgreeConnect() {
        useMicServer()
          .userAgreeInvite({
            room_id: this.roomBaseState.watchInitData.interact.room_id,
            type: 0 // 0=邀请上麦|1=邀请演示
          })
          .then(res => {
            useMicServer().userSpeakOn();
            clearInterval(this.inviteFun);
            this.inviteTime = 30;
            this.refusedText = this.$t('interact.interact_1010');
            this.closeInviteConnectPop();
          });
      },
      // 拒绝上麦
      refuseInviteConnect() {
        useMicServer()
          .userRejectInvite({
            room_id: this.roomBaseState.watchInitData.interact.room_id,
            type: 0 // 0=邀请上麦|1=邀请演示
          })
          .then(res => {
            clearInterval(this.inviteFun);
            this.inviteTime = 30;
            this.refusedText = this.$t('interact.interact_1010');
            this.isConfirmVisible = false;
            this.closeInviteConnectPop();
          })
          .catch(err => {
            // 拒绝失败
            console.log(err);
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

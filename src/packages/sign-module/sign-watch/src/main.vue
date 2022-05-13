<template>
  <div class="vmp-sign-watch">
    <div v-show="isShowCircle" class="vmp-sign-watch_icon" @click="reShowSignBox">
      <i class="sign-circle"></i>
      <img src="./img/icon@2x.png" alt="" />
    </div>
    <div
      v-show="showSign"
      class="vmp-sign-watch_sign"
      :style="{ zIndex: zIndexServerState.zIndexMap.signIn }"
    >
      <div :class="['sign_container', isEmbed ? 'sign_embed_container' : '']">
        <div class="sign_content">
          <p class="sign_title">{{ title }}</p>
          <CountDown :duration="duration" :consume="sign_time" class="sign_counter"></CountDown>
          <el-button type="danger" class="sign_btn" @click="signLogin">
            {{ $t('interact_tools.interact_tools_1026') }}
          </el-button>
        </div>
        <div class="sign_close" @click="closeSign">
          <i class="vh-iconfont vh-line-circle-close"></i>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  import CountDown from './components/countDown';
  import {
    useSignServer,
    useChatServer,
    useGroupServer,
    useZIndexServer,
    useRoomBaseServer
  } from 'middle-domain';
  export default {
    name: 'VmpSignWatch',
    components: {
      CountDown
    },
    data() {
      const zIndexServerState = this.zIndexServer.state;
      return {
        zIndexServerState,
        showSign: false,
        sign_id: '',
        sign_time: 0,
        duration: 30,
        isShowCircle: false,
        title: this.$t('interact_tools.interact_tools_1025'),
        secFlag: true
      };
    },
    beforeCreate() {
      this.zIndexServer = useZIndexServer();
      this.signServer = useSignServer();
      this.groupServer = useGroupServer();
      this.roomBaseServer = useRoomBaseServer();
    },
    mounted() {
      this.signServer.$off('sign_in_push');
      this.signServer.$off('sign_end');
      // 初始化有签到信息
      if (this.signInfo && !this.signInfo.is_signed && this.signInfo.id) {
        this.getHistorySignInfo();
      }
      //  结束讨论 / 踢出小组等
      this.groupServer.$on('ROOM_CHANNEL_CHANGE', () => {
        if (!this.isInGroup && !this.signInfo.is_signed && this.signInfo.id) {
          this.getHistorySignInfo();
        }
      });
      // 收到开始签到的消息
      this.signServer.$on('sign_in_push', e => {
        this.sign_id = e.data.sign_id;
        this.reShowSignBox();
        this.title = this.$tdefault(e.data.title);
        this.sign_time = Number(e.data.sign_show_time);
        this.duration = Number(e.data.sign_show_time);
        this.countDownTime();

        const data = {
          roleName: e.data.role_name,
          nickname: e.data.sign_creator_nickname,
          avatar: '//cnstatic01.e.vhall.com/static/images/watch/system.png',
          content: {
            text_content: `${this.$t('chat.chat_1027')}`
          },
          type: e.data.type,
          interactStatus: true
        };
        useChatServer().addChatToList(data);
      });
      // 收到结束签到的消息
      this.signServer.$on('sign_end', e => {
        this.showSign = false;
        this.isShowCircle = false;

        const data = {
          roleName: e.data.role_name,
          nickname: e.data.sign_creator_nickname,
          avatar: '//cnstatic01.e.vhall.com/static/images/watch/system.png',
          content: {
            text_content: `${this.$t('chat.chat_1028')}`
          },
          type: e.data.type,
          interactStatus: true
        };
        useChatServer().addChatToList(data);
        if (this.timer) {
          clearInterval(this.timer);
        }
      });
      // 收到结束签到的消息
      this.signServer.$on('live_over', e => {
        this.showSign = false;
        this.isShowCircle = false;
        if (this.timer) {
          clearInterval(this.timer);
        }
      });
    },
    computed: {
      roomId() {
        return this.roomBaseServer.state.watchInitData.interact.room_id;
      },
      // 签到信息
      signInfo() {
        return this.roomBaseServer.state.signInfo;
      },
      isInGroup() {
        return this.$domainStore.state.groupServer.groupInitData.isInGroup;
      },
      isEmbed() {
        // 判断完全嵌入，解决签到在特殊高度下 无法完全展示签到弹窗问题
        const { embedObj } = this.roomBaseServer.state;
        return embedObj.embed && !embedObj.embedVideo;
      }
    },
    methods: {
      // 签到
      signLogin() {
        this.signServer
          .sign({
            room_id: this.roomId,
            sign_id: this.sign_id
          })
          .then(res => {
            if (res.code == 200) {
              clearInterval(this.timer);
              this.showSign = false;
              this.isShowCircle = false;
              this.sign_time = 0;
              this.$message({
                type: 'success',
                message: this.$t('interact_tools.interact_tools_1027')
              });
            } else {
              this.showSign = false;
              this.$message({
                type: 'error',
                message:
                  res.code == 505
                    ? this.$t('webinar.webinar_1012')
                    : this.$t('interact_tools.interact_tools_1028')
              });
            }
          })
          .catch(error => {
            this.$message({
              message: error.msg,
              showClose: true,
              // duration: 0,
              type: 'error',
              customClass: 'zdy-info-box'
            });
          });
      },
      // 关闭签到
      closeSign() {
        this.showSign = false;
        this.isShowCircle = true;
      },
      reShowSignBox() {
        this.zIndexServer.setDialogZIndex('signIn');
        this.showSign = true;
      },
      // 获取签到信息
      getHistorySignInfo() {
        this.sign_id = this.signInfo.id;
        this.title = this.$tdefault(this.signInfo.sign_tips);
        const sign_time =
          this.signInfo.is_auto_sign == 1
            ? this.signInfo.auto_sign_time_ttl
            : this.signInfo.sign_time_ttl;
        this.sign_time = Number(sign_time);
        if (this.sign_time > 0) {
          this.isShowCircle = true;
        }
        this.duration = Number(this.signInfo.show_time);
        this.countDownTime();
      },
      // 签到倒计时
      countDownTime() {
        this.timer = setInterval(() => {
          if (this.sign_time <= 1) {
            clearInterval(this.timer);
            this.showSign = false;
            this.isShowCircle = false;
            return;
          }
          this.sign_time--;
        }, 1000);
      }
    }
  };
</script>
<style lang="less">
  .vmp-sign-watch {
    &_icon {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      cursor: pointer;
      position: relative;
      margin-left: 16px;
      line-height: 32px;
      .sign-circle {
        position: absolute;
        top: -2px;
        right: -2px;
        display: inline-block;
        width: 7px;
        height: 7px;
        background: #fb3a32;
        border-radius: 50%;
        border: 1px solid #2a2a2a;
      }
      img {
        width: 100%;
        height: 100%;
        object-fit: scale-down;
      }
    }
    &_sign {
      position: fixed;
      top: 0;
      left: 0;
      background: rgba(0, 0, 0, 0.6);
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      z-index: 28;
      .sign_container {
        width: 399px;
        height: 464px;
        margin-top: 10vh;
        background-image: url('./img/sign@2x.png');
        background-size: 100% 100%;
        position: relative;
      }
      .sign_counter {
        margin: 0 auto;
      }
      .sign_content {
        text-align: center;
        padding-top: 180px;
        margin: 0 auto;
        .sign_title {
          font-size: 14px;
          color: @font-light-normal;
          line-height: 20px;
          margin-bottom: 20px;
        }
        .sign_btn {
          width: 160px;
          font-size: 14px;
          color: #fff;
          background-color: #fb3a32;
          border-color: #fb3a32;
          margin-top: 20px;
          border-radius: 20px;
        }
      }
      .sign_close {
        position: absolute;
        left: 47%;
        bottom: -35px;
        cursor: pointer;
        i {
          font-size: 24px;
          color: #fff;
        }
      }
    }
  }
  @media screen and (max-height: 580px) {
    .sign_embed_container {
      margin-top: 0px !important;
    }
  }
</style>

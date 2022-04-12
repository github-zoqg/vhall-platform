<template>
  <div class="vhall-dialog-wrap">
    <van-popup
      v-model="signInVisible"
      position="bottom"
      :overlay="false"
      :style="{ height: popHeight }"
    >
      <div class="header">
        <!-- 签到 -->
        {{ $t('interact_tools.interact_tools_1024') }}
        <i class="vh-iconfont vh-line-close" @click="closeSignIn"></i>
      </div>

      <div class="wrap">
        <div class="center">
          <CountDown :duration="duration" :consume="seconds" class="countdown"></CountDown>
          <!-- TODO -->
          <div class="title">{{ title }}</div>
          <van-Button type="danger" class="red-btn" @click="signin">
            <!-- 立即签到 -->
            {{ $t('interact_tools.interact_tools_1026') }}
          </van-Button>
        </div>
      </div>
    </van-popup>
  </div>
</template>
<script>
  import { useSignServer, useChatServer, useGroupServer, useRoomBaseServer } from 'middle-domain';
  import { boxEventOpitons } from '@/packages/app-shared/utils/tool.js';
  // import EventBus from '../../utils/Events';
  import CountDown from './countDown.vue';
  export default {
    name: 'VmpSignWap',
    components: { CountDown },
    data() {
      return {
        signInVisible: false,
        seconds: 60,
        sign_id: '',
        clock: null,
        duration: 30,
        title: '',
        // signinInfo: {},
        popHeight: ''
      };
    },
    watch: {
      // signinInfo: {
      //   immediate: true,
      //   deep: true,
      //   handler: function () {
      //     this.init();
      //   }
      // },
      // signInVisible(newValue) {
      //   // EventBus.$emit('signShow', newValue);
      // },
      isInGroup: {
        handler: function (val) {
          if (val) {
            this.closeSignIn();
          }
        }
      }
    },
    computed: {
      isInGroup() {
        return this.$domainStore.state.groupServer.groupInitData.isInGroup;
      },
      signinInfo() {
        return this.roomBaseServer.state.signInfo;
      }
    },
    beforeCreate() {
      this.signServer = useSignServer();
      this.groupServer = useGroupServer();
      this.roomBaseServer = useRoomBaseServer();
    },
    async created() {
      this.init();
      let htmlFontSize = document.getElementsByTagName('html')[0].style.fontSize;
      // postcss 换算基数为75 头部+播放器区域高为 522px
      this.popHeight = document.body.clientHeight - (522 / 75) * parseFloat(htmlFontSize) + 'px';
      // 结束讨论
      this.groupServer.$on('ROOM_CHANNEL_CHANGE', () => {
        const { groupInitData } = this.groupServer.state;
        if (!groupInitData.isInGroup && !this.signinInfo.is_signed && this.signinInfo.id) {
          this.init();
        }
      });
      // 发起签到
      this.signServer.$on('sign_in_push', e => {
        window.$middleEventSdk?.event?.send(
          boxEventOpitons(this.cuid, 'emitOpenSignIcon', ['showSign', true])
        );
        console.log('sign_in_push', e);
        this.signInVisible = true;
        this.duration = Number(e.data.sign_show_time);
        this.openSignIn(e.data.sign_id, e.data.sign_show_time);
        this.title = this.$tdefault(e.data.title);
        const data = {
          roleName: e.data.role_name,
          nickname: e.data.sign_creator_nickname,
          avatar: '//cnstatic01.e.vhall.com/static/images/watch/system.png',
          content: {
            // text_content: `${this.$getRoleName(e.data.role_name)}${this.$t('chat.chat_1027')}`
            text_content: `${e.data.sign_creator_nickname}${this.$t('chat.chat_1027')}`
          },
          type: e.data.type
        };
        // console.log(useChatServer(), data, '1323');
        useChatServer().addChatToList(data);
      });
      // 签到结束
      this.signServer.$on('sign_end', e => {
        window.$middleEventSdk?.event?.send(
          boxEventOpitons(this.cuid, 'emitOpenSignIcon', ['showSign', false])
        );
        // this.iconShow = false;

        const data = {
          roleName: e.data.role_name,
          nickname: e.data.sign_creator_nickname,
          avatar: '//cnstatic01.e.vhall.com/static/images/watch/system.png',
          content: {
            text_content: this.$t('chat.chat_1028')
          },
          type: e.data.type
        };
        // console.log(useChatServer(), data, '1323');
        useChatServer().addChatToList(data);

        this.duration = 30;
        this.signInVisible = false;
        if (this.seconds) {
          clearInterval(this.seconds);
        }
      });
      // 签到关闭
      this.signServer.$on('live_over', e => {
        window.$middleEventSdk?.event?.send(
          boxEventOpitons(this.cuid, 'emitOpenSignIcon', ['showSign', false])
        );
        // this.iconShow = false;
        this.duration = 30;
        this.signInVisible = false;
        if (this.seconds) {
          clearInterval(this.seconds);
        }
      });
    },
    methods: {
      // 初次进入已存在签到计时器
      init() {
        if (this.signinInfo && !this.signinInfo.is_signed && this.signinInfo.id) {
          // this.iconShow = true;
          this.signInVisible = false;
          this.getHistorySignInfo();
        }
      },
      /**
       *@param {string} sign_id -签到id
       */
      // 开始计时
      openSignIn(sign_id, time) {
        // 发起端/观看端开启关闭签到窗口,观看端消息触发该方法并传sign_id，倒计时结束后自动关闭
        this.sign_id = sign_id;
        if (sign_id) {
          this.seconds = time;
          if (this.clock) {
            window.clearInterval(this.clock);
          }
          this.clock = window.setInterval(() => {
            if (this.seconds <= 0) {
              window.clearInterval(this.clock);
              this.signInVisible = false;
              window.$middleEventSdk?.event?.send(
                boxEventOpitons(this.cuid, 'emitOpenSignIcon', ['showSign', false])
              );
            }
            this.seconds--;
          }, 1000);
        }
      },
      closeSignIn() {
        this.signInVisible = false;
      },
      openSign() {
        this.signInVisible = true;
      },
      // 签到
      signin() {
        this.signServer
          .sign({
            room_id: this.roomBaseServer.state.watchInitData.interact.room_id,
            sign_id: this.sign_id
          })
          .then(res => {
            if (res.code == 200) {
              clearInterval(this.clock);
              this.closeSignIn();
              window.$middleEventSdk?.event?.send(
                boxEventOpitons(this.cuid, 'emitOpenSignIcon', ['showSign', false])
              );
              // this.iconShow = false;
              this.seconds = 0;
              // this.$toast.sucess('签到成功！');
              this.$toast.success(this.$t('interact_tools.interact_tools_1027'));
            } else {
              window.$middleEventSdk?.event?.send(
                boxEventOpitons(this.cuid, 'emitOpenSignIcon', ['showSign', false])
              );
              // this.iconShow = false;
              // this.$toast.fail(res.code == 505 ? '重复签到' : '签到失败');
              this.$toast.fail(
                res.code == 505
                  ? this.$t('webinar.webinar_1012')
                  : this.$t('interact_tools.interact_tools_1028')
              );
            }
          });
        // this.$toast('签到成功！')
      },
      getHistorySignInfo() {
        this.title = this.$tdefault(this.signinInfo.sign_tips);
        this.duration = Number(this.signinInfo.show_time);
        const sign_time =
          this.signinInfo.is_auto_sign == 1
            ? this.signinInfo.auto_sign_time_ttl
            : this.signinInfo.sign_time_ttl;
        if (sign_time > 0) {
          window.$middleEventSdk?.event?.send(
            boxEventOpitons(this.cuid, 'emitOpenSignIcon', ['showSign', true])
          );
        }
        console.log(this.signinInfo, 'this.signinInfo');
        this.openSignIn(this.signinInfo.id, Number(sign_time));
      }
    }
  };
</script>
<style lang="less" scoped>
  .vhall-dialog-wrap {
    .icon-wrap {
      margin-bottom: 10px;
      width: 84px;
      height: 84px;
      position: relative;
      background-color: transparent;
      &:before {
        position: absolute;
        top: 2px;
        right: 2px;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background-color: #ff0005;
        content: '';
      }
      img {
        width: 84px;
        height: 84px;
      }
    }
    .header {
      height: 90px;
      border-bottom: 1px solid #d4d4d4;
      // @include border(bottom);
      text-align: center;
      line-height: 90px;
      position: relative;
      font-size: 32px;
      font-weight: 500;
      color: rgba(68, 68, 68, 1);
      .vh-line-close {
        position: absolute;
        right: 33px;
      }
    }
    .wrap {
      height: calc(100% - 1000px);
      text-align: center;
      display: flex;
      align-items: center;
      flex-direction: column;
      // justify-content: center;
      .title {
        height: 42px;
        font-size: 30px;
        font-weight: bold;
        color: rgba(68, 68, 68, 1);
        line-height: 42px;
        margin-top: 30px;
        margin-bottom: 95px;
      }
      .secend {
        margin: 40px;
        font-size: 30px;
        font-weight: 400;
        color: rgba(68, 68, 68, 1);
        line-height: 42px;
      }
      .sigin {
        display: inline-block;
        width: 240px;
        height: 240px;
        border: 1px solid rgba(252, 84, 89, 1); /* no*/
        border-radius: 50%;
        box-sizing: border-box;
        display: flex;
        justify-content: center;
        align-items: center;
        span {
          width: 220px;
          height: 220px;

          border-radius: 50%;
          background: rgba(252, 84, 89, 1);
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 40px;
          font-weight: 500;
          color: rgba(255, 255, 255, 1);
        }
      }
      // .sigin-anima {
      // animation: rotate 3s linear infinite;
      // }
      @keyframes rotate {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(359deg);
        }
      }
    }
  }
  .vanpop {
    height: 100%;
    .wrap {
      height: 100%;
    }
  }
  .countdown {
    margin: 64px auto 0;
  }
  .red-btn {
    width: 364px;
    background-color: #fb3a32;
  }
</style>

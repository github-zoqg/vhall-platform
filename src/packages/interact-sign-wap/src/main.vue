<template>
  <div>
    <van-popup
      v-model="signInVisible"
      position="bottom"
      round
      :closeable="true"
      class="vhall-dialog-wrap"
      overlay-class="vmp-sign-popup-overlay"
      :overlay-style="{ zIndex: zIndexServerState.zIndexMap.signIn }"
      :style="{ zIndex: zIndexServerState.zIndexMap.signIn }"
    >
      <!-- <div class="header">
        {{ $t('interact_tools.interact_tools_1024') }}
        <i class="vh-iconfont vh-line-close" @click="closeSignIn"></i>
      </div> -->

      <div class="wrap">
        <div class="wrap_center">
          <div class="title">{{ title }}</div>
          <CountDown :duration="duration" :consume="seconds" class="countdown"></CountDown>
          <van-Button type="danger" class="red-btn" @click="signin">
            {{ $t('interact_tools.interact_tools_1026') }}
          </van-Button>
        </div>
      </div>
    </van-popup>
  </div>
</template>
<script>
  import {
    useSignServer,
    useChatServer,
    useGroupServer,
    useRoomBaseServer,
    useZIndexServer
  } from 'middle-domain';
  import { boxEventOpitons } from '@/app-shared/utils/tool.js';
  // import EventBus from '../../utils/Events';
  import CountDown from './countDown.vue';
  export default {
    name: 'VmpSignWap',
    components: { CountDown },
    data() {
      const zIndexServerState = this.zIndexServer.state;
      return {
        zIndexServerState,
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
      // }
      // isSmallPlayer() {
      //   this.setSetingHeight();
      // },
      isInGroup: {
        handler: function (val) {
          if (val) {
            this.closeSignIn();
          }
        }
      },
      // :overlay-style="{ zIndex: zIndexServerState.zIndexMap.redPacket }"
      // 无法动态更改zIndex
      'zIndexServerState.zIndexMap.signIn': {
        handler(val) {
          if (document.querySelector('.vmp-sign-popup-overlay')) {
            this.$nextTick(() => {
              document.querySelector('.vmp-sign-popup-overlay').style.zIndex = val;
            });
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
      },
      isSmallPlayer() {
        return this.$domainStore.state.playerServer.isSmallPlayer;
      }
    },
    beforeCreate() {
      this.signServer = useSignServer();
      this.groupServer = useGroupServer();
      this.roomBaseServer = useRoomBaseServer();
      this.zIndexServer = useZIndexServer();
    },
    async created() {
      this.init();
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
        this.changeIconShowNum(true);
        console.log('sign_in_push', e);
        this.signInVisible = true;
        this.zIndexServer.setDialogZIndex('signIn');
        this.duration = Number(e.data.sign_show_time);
        this.openSignIn(e.data.sign_id, e.data.sign_show_time);
        this.title = this.$tdefault(e.data.title);
        const data = {
          roleName: e.data.role_name,
          nickname: e.data.sign_creator_nickname,
          avatar: '//cnstatic01.e.vhall.com/static/images/watch/system.png',
          content: {
            // text_content: `${this.$getRoleName(e.data.role_name)}${this.$t('chat.chat_1027')}`
            text_content: `${this.$t('chat.chat_1027')}`
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
        this.changeIconShowNum(false);
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
        this.changeIconShowNum(false);
        // this.iconShow = false;
        this.duration = 30;
        this.signInVisible = false;
        if (this.seconds) {
          clearInterval(this.seconds);
        }
      });
    },
    methods: {
      //  * 计算 设置的弹层高度
      setSetingHeight() {
        let htmlFontSize = document.getElementsByTagName('html')[0].style.fontSize;
        // postcss 换算基数为75 头部+播放器区域高为 522px
        let playerHeight = this.isSmallPlayer == true ? 130 : 422;
        let baseHeight = playerHeight + 71;
        this.popHeight =
          document.body.clientHeight - (baseHeight / 75) * parseFloat(htmlFontSize) + 'px';
      },
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
              this.changeIconShowNum(false);
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
        this.zIndexServer.setDialogZIndex('signIn');
      },
      // 签到
      signin() {
        // 数据埋点
        window.vhallReportForWatch?.report(170024, {
          sign_id: this.sign_id
        });
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
              this.changeIconShowNum(false);
              // this.iconShow = false;
              this.seconds = 0;
              // this.$toast.sucess('签到成功！');
              this.$toast.success(this.$t('interact_tools.interact_tools_1027'));
            } else {
              window.$middleEventSdk?.event?.send(
                boxEventOpitons(this.cuid, 'emitOpenSignIcon', ['showSign', false])
              );
              this.changeIconShowNum(false);
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
          this.changeIconShowNum(true);
        }
        console.log(this.signinInfo, 'this.signinInfo');
        this.openSignIn(this.signinInfo.id, Number(sign_time));
      },
      // change icon显示数量
      changeIconShowNum(status) {
        this.roomBaseServer.setShowIconNum(status);
      }
    }
  };
</script>
<style lang="less" scoped>
  .vhall-dialog-wrap {
    height: 596px;
    width: 100%;
    background: linear-gradient(55.94deg, #fdf1ed 9.51%, #f3f2ff 102.75%);
    box-shadow: 0px -2px 10px rgba(0, 0, 0, 0.1);
    .wrap {
      text-align: center;
      display: flex;
      align-items: center;
      flex-direction: column;
      &_center {
        margin-top: 90px;
        .title {
          font-size: 30px;
          font-weight: bold;
          color: rgba(68, 68, 68, 1);
        }
        .countdown {
          margin: 50px auto;
        }
        .red-btn {
          width: 360px;
          background-color: #fb3a32;
          border-radius: 50px;
        }
      }
    }
  }
</style>

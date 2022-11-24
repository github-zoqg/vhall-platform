<!-- 观看页-红包组件（颤动 + 弹出层） -->
<template>
  <div class="vhsaas-red-packet" v-if="dialogVisible">
    <div class="vhsaas-interact-mask" :style="{ zIndex: zIndexServerState.zIndexMap.redPacket }">
      <components
        :is="componentsView"
        :red_code="redPacketServerState.red_code"
        :is_luck="redPacketServerState.is_luck"
        :red-packet-info="redPacketServerState.info"
        @navTo="navTo"
        @needLogin="handleGoLogin"
      >
        <!-- close按钮 -->
        <i class="vhsaas-red-packet-close-btn vh-iconfont vh-line-circle-close" @click="close"></i>
      </components>
    </div>
  </div>
</template>
<script>
  import {
    useCodeRedPacketServer,
    useZIndexServer,
    useChatServer,
    useMsgServer
  } from 'middle-domain';
  import { boxEventOpitons } from '@/app-shared/utils/tool.js';
  const PWD_RED_ENVELOPE_OK = 'pwd_red_envelope_ok'; // 支付成功消息
  export default {
    name: 'VmpRedPacketCommandWatch',
    components: {
      RedPacketAccept: () => import('./components/red-packet-accept.vue'),
      RedPacketSuccess: () => import('./components/red-packet-success.vue'),
      RedPacketWinners: () => import('./components/red-packet-winners.vue')
    },
    provide() {
      return {
        redPacketServer: this.redPacketServer
      };
    },
    data() {
      const redPacketServerState = this.redPacketServer.state;
      const zIndexServerState = this.zIndexServer.state;
      return {
        zIndexServerState,
        redPacketServerState,
        dialogVisible: false, // 组件显示
        componentsView: ''
      };
    },
    computed: {
      isEmbed() {
        return this.$domainStore.state.roomBaseServer.embedObj.embed;
      }
    },
    beforeCreate() {
      this.redPacketServer = useCodeRedPacketServer({
        mode: 'watch'
      });
      this.zIndexServer = useZIndexServer();
      this.msgServer = useMsgServer();
    },
    created() {
      this.initEvent();
    },
    methods: {
      // 开启红包弹窗
      open(uuid) {
        if (!uuid) uuid = this.redPacketServer.getLastUUid();
        this.redPacketServer.getCodeRedPacketInfo(uuid).then(res => {
          const data = res.data;
          //is_luck  0：打开没抢到     1:抢到了     2：没打开红包
          if (data.is_luck != 2) {
            this.componentsView = 'RedPacketSuccess';
          } else {
            this.componentsView = 'RedPacketAccept';
          }
          this.dialogVisible = true;
          this.zIndexServer.setDialogZIndex('redPacket');
        });
      },
      openRedPacket(uuid) {
        this.dialogVisible = true;
        this.zIndexServer.setDialogZIndex('redPacket');
        this.open(uuid);
      },
      handleGoLogin() {
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitClickLogin'));
      },
      initEvent() {
        this.redPacketServer.$on(PWD_RED_ENVELOPE_OK, data => {
          if (this.isEmbed) {
            console.log('嵌入页不支持口令红包');
            return;
          }
          useChatServer().addChatToList({
            avatar: '//cnstatic01.e.vhall.com/static/images/watch/system.png',
            content: {
              text_content: this.$t('chat.chat_1038')
            },
            type: data.type,
            interactStatus: true,
            Show: true
          });
          // const uuid = data.red_packet_uuid;
          // this.open(uuid);
          this.redPacketServer.setUUid(data.red_packet_uuid);
          this.componentsView = 'RedPacketAccept';
          this.dialogVisible = true;
          this.zIndexServer.setDialogZIndex('redPacket');
        });
        // 直播结束关闭弹窗
        this.msgServer.$on('live_over', () => {
          this.dialogVisible = false;
        });
      },
      close() {
        this.dialogVisible = false;
      },
      navTo(view) {
        this.componentsView = view;
      }
    }
  };
</script>
<style lang="less" scoped>
  .vhsaas-red-packet {
    position: relative;
  }
  /* 弹出框自定义弹层 */
  .vhsaas-interact-mask {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6);
    z-index: 22;
  }
  .vhsaas-red-packet-close-btn {
    position: absolute;
    bottom: -46px;
    font-size: 30px;
    color: #ffffff;
    cursor: pointer;
    z-index: 28;
  }
</style>

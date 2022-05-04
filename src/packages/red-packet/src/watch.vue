<!-- 观看页-红包组件（颤动 + 弹出层） -->
<template>
  <div class="vhsaas-red-packet" v-if="dialogVisible">
    <div class="vhsaas-interact-mask" :style="{ zIndex: zIndexServerState.zIndexMap.redPacket }">
      <components
        :is="componentsView"
        :amount="redPacketServerState.amount * 1"
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
  import { useRedPacketServer, useZIndexServer, useChatServer, useMsgServer } from 'middle-domain';
  import { boxEventOpitons } from '@/packages/app-shared/utils/tool.js';
  const RED_ENVELOPE_OK = 'red_envelope_ok'; // 支付成功消息
  export default {
    name: 'VmpRedPacketWatch',
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
        componentsView: 'RedPacketAccept'
      };
    },
    computed: {
      isEmbed() {
        return this.$domainStore.state.roomBaseServer.embedObj.embed;
      }
    },
    beforeCreate() {
      this.redPacketServer = useRedPacketServer({
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
        this.redPacketServer.getRedPacketInfo(uuid).then(res => {
          const data = res.data;
          if (data.status == 1 || data.red_packet.number == data.red_packet.get_user_count) {
            // 本人已经抢到, 或者被强光
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
        this.redPacketServer.$on(RED_ENVELOPE_OK, data => {
          if (this.isEmbed) {
            console.log('嵌入页不支持红包');
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
          const uuid = data.red_packet_uuid;
          this.open(uuid);
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
    bottom: -18px;
    font-size: 30px;
    color: #ffffff;
    cursor: pointer;
    z-index: 28;
  }
</style>

<!-- 观看页-红包组件（颤动 + 弹出层） -->
<template>
  <van-popup
    class="vmp-red-packet-wap"
    v-model="dialogVisible"
    overlay-class="vmp-red-packet-popup-overlay"
    :overlay-style="{ zIndex: zIndexServerState.zIndexMap.redPacket }"
    :style="{ zIndex: zIndexServerState.zIndexMap.redPacket }"
  >
    <!-- <div class="vhsaas-red-packet" v-if="dialogVisible"> -->
    <div class="vmp-red-packet-wap__container">
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
    <!-- </div> -->
  </van-popup>
</template>
<script>
  import {
    useCodeRedPacketServer,
    useChatServer,
    useMsgServer,
    useZIndexServer
  } from 'middle-domain';
  import { boxEventOpitons } from '@/app-shared/utils/tool.js';
  const PWD_RED_ENVELOPE_OK = 'pwd_red_envelope_ok'; // 支付成功消息
  export default {
    name: 'VmpRedPacketCommandWap',
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
        redPacketServerState,
        zIndexServerState,
        dialogVisible: false, // 组件显示
        componentsView: ''
      };
    },
    computed: {
      isEmbed() {
        return this.$domainStore.state.roomBaseServer.embedObj.embed;
      }
    },
    watch: {
      // :overlay-style="{ zIndex: zIndexServerState.zIndexMap.redPacket }"
      // 无法动态更改zIndex
      'zIndexServerState.zIndexMap.redPacket': {
        handler(val) {
          if (document.querySelector('.vmp-red-packet-popup-overlay')) {
            this.$nextTick(() => {
              document.querySelector('.vmp-red-packet-popup-overlay').style.zIndex = val;
            });
          }
        }
      }
    },
    beforeCreate() {
      this.redPacketServer = useCodeRedPacketServer({
        mode: 'watch'
      });
      this.msgServer = useMsgServer();
      this.zIndexServer = useZIndexServer();
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
          console.log('----红包---', data);
          // this.open(uuid);
          this.redPacketServer.setUUid(data.red_packet_uuid);
          this.componentsView = 'RedPacketAccept';
          this.dialogVisible = true;
          this.zIndexServer.setDialogZIndex('redPacket');
        });
        // 直播结束关闭弹窗
        this.msgServer.$on('live_over', () => {
          this.popupVisible = false;
        });
      },
      openRedPacket(uuid) {
        this.dialogVisible = true;
        this.open(uuid);
        this.zIndexServer.setDialogZIndex('redPacket');
      },
      handleGoLogin() {
        this.dialogVisible = false;
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitClickLogin'));
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
<style lang="less">
  .vmp-red-packet-wap {
    background-color: transparent !important; // 默认白色
    overflow: visible; // 显示关闭图标
  }
  .vmp-red-packet-wap__container {
    height: 100%;
  }
  .vhsaas-red-packet {
    position: relative;
  }
  .vhsaas-red-packet-close-btn {
    position: absolute;
    bottom: -76px;
    font-size: 54px;
    color: #ffffff;
    cursor: pointer;
    z-index: 28;
  }
  .van-overlay {
    background-color: rgba(0, 0, 0, 0.7);
  }
</style>

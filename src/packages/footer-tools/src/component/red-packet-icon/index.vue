<template>
  <div class="vmp-red-packet-icon" v-if="showIcon" @click="checkRedPacketIcon">
    <img src="./images/icon-red-packet.png" alt="" />
    <i class="vmp-dot" v-if="showDot" />
  </div>
</template>
<script>
  /**
   * @description 红包的图标 + 小红点
   */
  import { useRedPacketServer } from 'middle-domain';
  import { boxEventOpitons } from '@/packages/app-shared/utils/tool.js';
  const RED_ENVELOPE_OK = 'red_envelope_ok'; // 支付成功消息
  export default {
    name: 'RedPacketIcon',
    data() {
      return {
        showIcon: false, //显示图标
        showDot: false, // 显示小红点
        lastRedPacketUUID: '' // 最后一个红包的uuid
      };
    },
    beforeCreate() {
      this.redPacketServer = useRedPacketServer();
    },
    created() {
      this.redPacketServer.$on(this.redPacketServer, this.handleNewRedPacket);
    },
    destroyed() {
      this.redPacketServer.$off(this.redPacketServer, this.handleNewRedPacket);
    },
    methods: {
      checkRedPacketIcon() {
        if (!this.lastRedPacketUUID) return;
        this.showDot = false;
        window.$middleEventSdk?.event?.send(
          boxEventOpitons(this.cuid, 'emitClickRedPacket', [this.lastRedPacketUUID])
        );
      },
      handleNewRedPacket() {
        this.showIcon = true;
        this.showDot = true;
      }
    }
  };
</script>
<style lang="less" scoped>
  .vmp-red-packet-icon {
    color: #fff;
    margin-left: 16px;
    position: relative;
    .vmp-dot {
      position: absolute;
      display: inline-block;
      width: 8px;
      height: 8px;
      background: #fb3a32;
      border: 1px solid #2a2a2a;
      border-radius: 50%;
      top: 10px;
      right: -3px;
      position: absolute;
    }
    img {
      width: 32px;
      height: 32px;
      cursor: pointer;
    }
  }
</style>

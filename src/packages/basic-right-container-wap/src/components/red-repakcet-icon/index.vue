<template>
  <div class="icon-wrap" v-if="showIcon" @click="checkRedPacketIcon">
    <img src="./images/redPacket.png" alt="" />
    <i class="dot" v-if="showDot" />
  </div>
</template>
<script>
  /**
   * @description 红包的图标 + 小红点
   */
  import { useRedPacketServer } from 'middle-domain';
  const RED_ENVELOPE_OK = 'red_envelope_ok'; // 支付成功消息
  export default {
    name: 'RedRepacketIcon',
    data() {
      return {
        showIcon: false, //显示图标
        showDot: false // 显示小红点
      };
    },
    beforeCreate() {
      this.redPacketServer = useRedPacketServer({ mode: 'watch' });
    },
    created() {
      // TODO 消息监听 需要去显示icon
      console.log(this.$domainStore.state.roomBaseServer.redPacket, '红包红包1111');
      this.showIcon = this.$domainStore.state.roomBaseServer.redPacket.status == '1' ? true : false;
      this.showDot = this.$domainStore.state.roomBaseServer.redPacket.status == '1' ? true : false;
      this.redPacketServer.$on(RED_ENVELOPE_OK, this.handleNewRedPacket);
    },
    destroyed() {
      this.redPacketServer.$off(RED_ENVELOPE_OK, this.handleNewRedPacket);
    },
    methods: {
      checkRedPacketIcon() {
        // if (!this.lastRedPacketUUID) return;
        // this.showDot = false;
        this.$emit('clickIcon');
        // window.$middleEventSdk?.event?.send(
        //   boxEventOpitons(this.cuid, 'emitClickRedPacket', [this.lastRedPacketUUID])
        // );
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
  .icon-wrap {
    margin-bottom: 10px;
    width: 84px;
    height: 84px;
    position: relative;
    background-color: transparent;
    img {
      width: 84px;
      height: 84px;
    }
    .dot {
      position: absolute;
      top: 2px;
      right: 2px;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background-color: #ff0005;
      content: '';
    }
  }
</style>

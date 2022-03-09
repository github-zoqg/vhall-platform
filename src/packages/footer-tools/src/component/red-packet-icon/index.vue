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
  const RED_ENVELOPE_OK = 'red_envelope_ok'; // 支付成功消息
  export default {
    name: 'RedPacketIcon',
    data() {
      return {
        showIcon: false, //显示图标
        showDot: false, // 显示小红点
        lastUUID: ''
      };
    },
    beforeCreate() {
      this.redPacketServer = useRedPacketServer({
        mode: 'watch'
      });
    },
    created() {
      this.initStatus();
      this.redPacketServer.$on(RED_ENVELOPE_OK, this.handleNewRedPacket);
    },
    destroyed() {
      this.redPacketServer.$off(RED_ENVELOPE_OK, this.handleNewRedPacket);
    },
    methods: {
      initStatus() {
        const redPacketInfo = this.$domainStore.state.roomBaseServer.redPacket;
        if (redPacketInfo.number * 1 == redPacketInfo.get_user_count * 1) {
          this.redPacketServer.setAvailable(false);
        } else {
          this.redPacketServer.setAvailable(true);
        }
        console.log(this.$domainStore.state.roomBaseServer, 'available');
        if (redPacketInfo.red_packet_uuid) {
          this.redPacketServer.setUUid(redPacketInfo.red_packet_uuid);
          this.lastUUID = redPacketInfo.red_packet_uuid;
        }
        if (redPacketInfo.status === '1') {
          this.showIcon = true;
          this.showDot = true;
        }
      },
      checkRedPacketIcon() {
        this.$emit('clickIcon', this.lastUUID);
        this.showDot = false;
      },
      handleNewRedPacket(msg) {
        this.lastUUID = msg.red_packet_uuid;
        this.showIcon = true;
        this.showDot = true;
      }
    }
  };
</script>
<style lang="less" scoped>
  .vmp-red-packet-icon {
    color: #fff;
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

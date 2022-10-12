<template>
  <div class="icon-wrap" v-if="redPacketServerState.iconVisible" @click="checkRedPacketIcon">
    <img src="./images/redPacket_no.png" alt="" v-if="redPacketServerState.dotVisible" />
    <img src="./images/redPacket.png" alt="" v-else />
    <!-- <i class="dot" v-if="redPacketServerState.dotVisible" /> -->
  </div>
</template>
<script>
  /**
   * @description 红包的图标 + 小红点
   */
  import { useCodeRedPacketServer } from 'middle-domain';
  export default {
    name: 'RedRepacketIcon',

    data() {
      const redPacketServerState = this.redPacketServer.state;
      return {
        redPacketServerState
      };
    },
    beforeCreate() {
      this.redPacketServer = useCodeRedPacketServer({ mode: 'watch' });
    },
    created() {
      console.log('initIconStatus created-口令红包');
      this.redPacketServer.initIconStatus(); //口令红包暂时代替红包
    },
    methods: {
      checkRedPacketIcon() {
        this.$emit('clickIcon');
        this.redPacketServer.setDotVisible(false);
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
      background: #fb2626;
      border: 1px solid #fb2626;
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
    // margin-bottom: 10px;
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

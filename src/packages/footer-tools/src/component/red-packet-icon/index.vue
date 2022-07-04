<template>
  <div
    class="vmp-red-packet-icon"
    v-if="redPacketServerState.iconVisible"
    @click="checkRedPacketIcon"
  >
    <img src="./images/icon-red-packet.png" alt="" class="show_img" />
    <i class="vmp-dot" v-if="redPacketServerState.dotVisible" />
  </div>
</template>
<script>
  /**
   * @description 红包的图标 + 小红点
   */
  import { useCodeRedPacketServer } from 'middle-domain';
  export default {
    name: 'RedPacketIcon',
    data() {
      const redPacketServerState = this.redPacketServer.state;
      return {
        redPacketServerState
      };
    },
    beforeCreate() {
      this.redPacketServer = useCodeRedPacketServer({
        mode: 'watch'
      });
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
    position: relative;
    width: 32px;
    height: 32px;
    line-height: 32px;
    background: linear-gradient(180deg, #ff765a 0%, #f6261d 100%);
    border-radius: 16px;
    cursor: pointer;
    margin-left: 16px;
    img.show_img {
      width: 32px;
      height: 32px;
      -webkit-transform-origin: left center;
      transform-origin: left center;
      margin: -1px 0 0 0;
    }
    .vmp-dot {
      position: absolute;
      display: inline-block;
      width: 8px;
      height: 8px;
      background: #fb3a32;
      border: 1px solid #2a2a2a;
      border-radius: 50%;
      right: -3px;
      position: absolute;
    }
  }
</style>

<template>
  <div class="vmp-footer-tools">
    <div class="vmp-footer-tools-left">
      <div class="vmp-footer-tools-left-setting">
        <i class="iconfont iconmeitishezhi"></i>
        设置
      </div>
      <div class="vmp-footer-tools-left-online" v-if="roomBaseState.watchInitData.online.show">
        <i class="iconfont iconzaixianrenshu"></i>
        {{ onlineNum | formatHotNum }}
      </div>
      <div class="vmp-footer-tools-left-hot" v-if="roomBaseState.watchInitData.pv.show">
        <i class="iconfont iconzaixianrenshu"></i>
        {{ hotNum | formatHotNum }}
      </div>
    </div>
    <div class="vmp-footer-tools-right">
      <div class="vmp-footer-tools-right-like">点赞</div>
    </div>
  </div>
</template>
<script>
  import { useMsgServer, useRoomBaseServer } from 'middleDomain';
  import onlineMixin from './js/mixins';
  export default {
    name: 'VmpFooterTools',
    mixins: [onlineMixin],
    data() {
      return {
        roomBaseState: null
      };
    },
    beforeCreate() {
      this.msgServer = useMsgServer();
      this.roomBaseServer = useRoomBaseServer();
    },
    created() {
      this.roomBaseState = this.roomBaseServer.state;
    }
  };
</script>
<style lang="less">
  .vmp-footer-tools {
    height: 56px;
    background: @bg-dark-section;
    line-height: 56px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 24px;
    &-left {
      display: flex;
      align-items: center;
      color: @font-dark-normal;
      font-size: 14px;
      > div {
        margin-right: 16px;
        .iconfont {
          vertical-align: bottom;
        }
      }
    }
    &-right {
      display: flex;
      align-items: center;
      color: @font-dark-normal;
      font-size: 14px;
      > div {
        margin-left: 16px;
      }
    }
  }
</style>

<template>
  <div class="vmp-footer-tools">
    <div class="vmp-footer-tools__left">
      <div class="vmp-footer-tools-left-setting" v-if="isInteractLive" @click="settingShow">
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
    <div class="vmp-footer-tools__center">
      <handup></handup>
    </div>
    <div class="vmp-footer-tools__right">
      <vmp-air-container :cuid="cuid"></vmp-air-container>
    </div>
  </div>
</template>
<script>
  import { useMsgServer, useRoomBaseServer } from 'middle-domain';
  import onlineMixin from './js/mixins';
  import handup from './handup.vue';
  export default {
    name: 'VmpFooterTools',
    mixins: [onlineMixin],
    data() {
      return {
        roomBaseState: null
      };
    },
    components: {
      handup
    },
    computed: {
      isInteractLive() {
        const { watchInitData } = this.roomBaseState;
        return (
          (watchInitData.webinar.mode == 3 || watchInitData.webinar.mode == 6) &&
          watchInitData.webinar.type == 1
        );
      }
    },
    beforeCreate() {
      this.msgServer = useMsgServer();
      this.roomBaseServer = useRoomBaseServer();
    },
    created() {
      this.roomBaseState = this.roomBaseServer.state;
    },
    methods: {
      settingShow() {
        window.$middleEventSdk?.event?.send({
          cuid: this.cuid,
          method: 'emitClickMediaCheck' // TODO 设置媒体的弹窗方法
        });
      }
    }
  };
</script>
<style lang="less">
  .vmp-footer-tools {
    width: 100%;
    height: 56px;
    background: #2d2d2d;
    border-radius: 0 0 4px 4px;
    margin-top: auto;
    display: flex;
    justify-content: space-between;
    align-items: center;

    &__left {
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
      &-setting {
        cursor: pointer;
      }
    }
    &__right {
      display: flex;
      align-items: center;
      color: @font-dark-normal;
      font-size: 14px;
      > div {
        margin-left: 16px;
      }
    }
    &__center {
      flex: 1;
    }
  }
</style>

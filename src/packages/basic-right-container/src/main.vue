<template>
  <div class="vmp-basic-right-container">
    <template v-if="isTryWatch">
      <div class="vmp-try-watch">
        <img src="./img/try@2x.png" alt="" />
        <p>{{ $t('appointment.appointment_1030') }}</p>
      </div>
    </template>
    <template v-else>
      <section v-show="isVisibleMiniElement" class="vmp-basic-right-hd"></section>
      <section class="vmp-basic-right-bd vmp-basic-bd-relative">
        <vmp-air-container :cuid="cuid"></vmp-air-container>
      </section>
    </template>
  </div>
</template>

<script>
  import { useDesktopShareServer } from 'middle-domain';
  export default {
    name: 'VmpBasicRightContainer',
    data() {
      return {
        childrenComp: []
      };
    },
    computed: {
      miniElement() {
        return this.$domainStore.state.roomBaseServer.miniElement;
      },
      webinarType() {
        return Number(this.$domainStore.state.roomBaseServer.watchInitData.webinar.type);
      },
      isVisibleMiniElement() {
        // TODO:后续添加插播桌面共享后，再添加插播桌面共享场景的处理
        return (
          (this.$domainStore.state.docServer.switchStatus || this.miniElement) &&
          [1, 4, 5].includes(this.webinarType)
        );
      },
      isTryWatch() {
        return (
          this.$domainStore.state.roomBaseServer.watchInitData.status == 'subscribe' &&
          this.$domainStore.state.roomBaseServer.watchInitData.record.preview_paas_record_id
        );
      }
    },
    beforeCreate() {
      this.desktopShareServer = useDesktopShareServer();
    },
    created() {
      // TODO试看逻辑在这里写判断
      // this.childrenComp = window.$serverConfig[this.cuid].children;
    },
    mounted() {},
    methods: {}
  };
</script>

<style lang="less">
  .vmp-basic-right-container {
    width: 360px;
    box-sizing: border-box;
    position: absolute;
    right: 0;
    display: flex;
    height: 100%;
    flex-direction: column;
    justify-content: flex-start;
    // z-index: 1;

    .vmp-basic-right-hd {
      padding-top: 56.25%;
    }
    .vmp-basic-right-bd {
      background: #2a2a2a;
      flex: 1;
      height: 1px;
    }
    .vmp-basic-bd-relative {
      position: relative;
    }
    .vmp-try-watch {
      display: flex;
      height: 100%;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      background: #2a2a2a;
      img {
        width: 111px;
        height: 70px;
      }
      p {
        font-size: 16px;
        color: #999;
        line-height: 30px;
      }
    }
  }
</style>

<template>
  <div class="vmp-header-left">
    <div :title="webinarInfo.subject" class="vhall-room-name" :class="{ role_doc: roleName == 1 }">
      {{ webinarInfo.subject || '房间名称' }}
    </div>
    <div class="vhall-room-id-container">
      <div class="vhall-room-id-icon">ID</div>
      <div id="vhall-room-id-copy-val" class="vhall-room-id">{{ webinarInfo.id }}</div>
      <div class="vhall-room-id-copy" :data-clipboard-text="webinarInfo.id" @click="handleCopy">
        <i class="vh-iconfont vh-line-copy"></i>
      </div>
    </div>
    <!-- 定时直播 -->
    <div v-if="webinarInfo.mode == 5" class="auto-live-start">定时直播</div>
    <!--无延迟-->
    <div class="nopdelay-icon" v-if="webinarInfo.no_delay_webinar == 1 && webinarInfo.mode != 6">
      <img
        src="//cnstatic01.e.vhall.com/common-static/images/nodelay-icon/v1.0.0/pc/delay-icon_zh-CN.png"
        alt=""
      />
    </div>
  </div>
</template>
<script>
  import Clipboard from 'clipboard';
  import { useRoomBaseServer } from 'middle-domain';
  export default {
    name: 'VmpHeaderLeft',
    data() {
      return {
        className: '',
        selected: false,
        disable: false,
        kind: '',
        icon: '',
        text: '',
        webinarInfo: {}
      };
    },
    computed: {
      roleName() {
        return this.$domainStore.state.roomBaseServer.watchInitData.join_info.role_name;
      }
    },
    created() {
      const { watchInitData } = useRoomBaseServer().state;
      this.webinarInfo = watchInitData.webinar;
    },
    methods: {
      // 负责roomId
      handleCopy() {
        window.vhallReportForProduct.report(110000);
        const clipboard = new Clipboard('.vhall-room-id-copy');
        clipboard.on('success', () => {
          this.$message({
            message: this.$t('nav.nav_1024'),
            showClose: true,
            type: 'success',
            customClass: 'zdy-info-box'
          });
          clipboard.destroy();
        });
        clipboard.on('error', () => {
          this.$message({
            message: this.$t('nav.nav_1052'),
            showClose: true,
            type: 'error',
            customClass: 'zdy-info-box'
          });
          clipboard.destroy();
        });
      }
    }
  };
</script>
<style lang="less">
  .vmp-header-left {
    display: flex;
    height: 100%;
    margin-left: 20px;
    justify-content: flex-start;
    align-items: center;

    .vhall-room-name {
      font-size: 16px;
      color: #fff;
      line-height: 22px;
      max-width: 720px;
      margin-right: 10px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .role_doc {
      width: 500px;
    }
    .vhall-room-id-container {
      height: 20px;
      border-radius: 2px;
      border: 1px solid #979797;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      padding-right: 3px;
    }

    .vhall-room-id-icon {
      width: 22px;
      height: 20px;
      background: #979797;
      font-size: 12px;
      color: #fff;
      line-height: 19px;
      text-align: center;
    }
    .vhall-room-id {
      width: 100%;
      height: 20px;
      font-size: 12px;
      font-weight: 400;
      color: #999;
      line-height: 20px;
      padding-left: 2px;
      text-align: center;
    }
    .vhall-room-id-copy {
      width: 19px;
      height: 19px;
      color: #999;
      line-height: 20px;
      text-align: center;
      cursor: pointer;
    }
    .auto-live-start {
      display: inline-block;
      margin-left: 8px;
      background: #fb3a32;
      border-radius: 10px;
      height: 16px;
      padding: 2px 8px;
      font-size: 12px;
      font-weight: 400;
      color: #ffffff;
      line-height: 16px;
    }
    .nopdelay-icon {
      line-height: 34px;
      margin-left: 4px;

      img {
        display: inline-block;
        width: 100%;
        height: 28px;
      }
    }
  }
</style>

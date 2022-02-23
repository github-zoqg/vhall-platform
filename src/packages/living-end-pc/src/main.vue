<template>
  <div
    class="vmp-living-end"
    v-if="isLivingEnd"
    :style="`backgroundImage: url('${webinarsBgImg}')`"
  >
    <div>
      <div class="vmp-player-living-end-img">
        <img src="../src/img/liveEnd.png" alt="" />
      </div>
      <h1>直播已结束</h1>
    </div>
  </div>
</template>
<script>
  import { useRoomBaseServer, useMsgServer } from 'middle-domain';
  export default {
    name: 'VmpLivingEnd',
    computed: {
      webinarsBgImg() {
        const cover = '//cnstatic01.e.vhall.com/static/images/mobile/video_default_nologo.png';
        const { webinar } = this.roomBaseServer.state.watchInitData;
        return webinar.img_url || cover;
      }
    },
    data() {
      return {
        isLivingEnd: false
      };
    },
    beforeCreate() {
      this.roomBaseServer = useRoomBaseServer();
      this.msgServer = useMsgServer();
    },
    mounted() {
      this.msgServer.$onMsg('ROOM_MSG', msg => {
        // live_over 结束直播
        if (msg.data.type == 'live_over') {
          this.isLivingEnd = true;
        }
        if (msg.data.type == 'group_switch_end') {
          if (msg.data.over_live) {
            this.isLivingEnd = true;
          }
        }
      });
    }
  };
</script>
<style lang="less">
  .vmp-living-end {
    position: absolute;
    top: 0;
    bottom: 56px;
    width: calc(100% - 380px);
    height: calc(100% - 56px);
    z-index: 100;
    background-size: 100% 100%;
    background-repeat: no-repeat;
    > div {
      height: 100%;
      width: 100%;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }

    &-img {
      width: 164px;
      height: 120px;

      img {
        width: 100%;
        height: 100%;
        object-fit: scale-down;
      }
    }
    h1 {
      font-size: 16px;
      line-height: 50px;
      height: 50px;
      color: #999;
      padding-left: 38px;
      font-weight: 400;
    }
  }
</style>

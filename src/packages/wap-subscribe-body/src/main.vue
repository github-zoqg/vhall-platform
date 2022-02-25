<template>
  <div class="vmp-wap-body">
    <div class="vmp-wap-body-container">
      <div class="subscribe-bg" v-if="!showVideo">
        <img :src="webinarsBgImg" alt="" />
      </div>
      <div class="" v-if="showVideo">
        <vmp-air-container :cuid="comWapPlayer" :oneself="true"></vmp-air-container>
      </div>
      <div class="subscribe-time">
        {{ countDownTime }}
        <!-- v-if="countDownTime && webinarType == 2" -->
      </div>
    </div>
  </div>
</template>
<script>
  import { useRoomBaseServer, useSubscribeServer, usePlayerServer } from 'middle-domain';
  // import { boxEventOpitons } from '@/packages/app-shared/utils/tool.js';
  export default {
    name: 'VmpSubscribeBody',
    data() {
      return {
        showVideo: false, // 显示暖场视频
        countDownTime: true,
        subOption: {
          startTime: '',
          type: 0,
          verify: 0,
          fee: 0,
          verified: 0,
          is_subscribe: 0,
          actual_start_time: '',
          show: 1,
          num: 0
        }
      };
    },
    computed: {
      // 背景图片
      webinarsBgImg() {
        const cover = '//cnstatic01.e.vhall.com/static/images/mobile/video_default_nologo.png';
        const { webinar } = this.roomBaseServer.state.watchInitData;
        return webinar.img_url || cover;
      },
      isWarmVideo() {
        return this.roomBaseServer.state.watchInitData.warmup.warmup_paas_record_id;
      },
      userInfo() {
        return this.$domainStore.state.userServer.userInfo;
      },
      webinarId() {
        return this.roomBaseServer.state.watchInitData.webinar.id;
      },
      webinarType() {
        return this.roomBaseServer.state.watchInitData.webinar.type;
      }
    },
    beforeCreate() {
      this.roomBaseServer = useRoomBaseServer();
      this.subscribeServer = useSubscribeServer();
      this.playerServer = usePlayerServer();
    },
    created() {
      this.handlerInitInfo();
      this.subscribeServer.listenMsg();
    },
    mounted() {
      this.listenEvents();
    },
    methods: {
      listenEvents() {
        this.subscribeServer.$on('live_start', data => {
          console.log(data, '???zhangxiao');
          this.subOption.type = 1;
          this.isLiving = true;
          // this.$refs.bottomTab && this.$refs.bottomTab.changeTime();
        });

        this.subscribeServer.$on('pay_success', data => {
          if (data.target_id == this.userInfo.user_id) {
            this.$message({
              message: this.$t('common.common_1005'),
              showClose: true,
              type: 'success',
              customClass: 'zdy-info-box'
            });
            // this.fetchAuth({ type: 3 });
            // window.$middleEventSdk?.event?.send(
            //   boxEventOpitons(this.cuid, 'emitClickPay', { flag: true })
            // );
          }
        });

        this.subscribeServer.$on('live_over', data => {
          this.subOption.type = 3;
          console.log(data);
        });
        // this.playerServer.$on(VhallPlayer.PLAY, () => {
        //   this.showBottom = false;
        // });
        // this.playerServer.$on(VhallPlayer.ENDED, () => {
        //   this.showBottom = true;
        // });
      },
      handlerInitInfo() {
        const { webinar, subscribe, join_info, warmup } = this.roomBaseServer.state.watchInitData;
        this.subOption.type = webinar.type;
        this.subOption.startTime = webinar.start_time;
        this.subOption.verify = webinar.verify;
        this.subOption.fee = webinar.fee || 0;
        this.subOption.verified = join_info.verified;
        this.subOption.is_subscribe = join_info.is_subscribe;
        this.subOption.actual_start_time = webinar.actual_start_time;
        this.subOption.show = subscribe.show;
        this.subOption.num = subscribe.num;
        // 自定义placeholder&&预约按钮是否展示
        this.subOption.verify_tip = webinar.verify_tip;
        this.subOption.hide_subscribe = webinar.hide_subscribe;
        if (join_info.is_subscribe == 1 && warmup.warmup_paas_record_id && webinar.type == 2) {
          this.showVideo = true;
        }
      }
    }
  };
</script>
<style lang="less">
  .vmp-wap-body {
    height: 422px;
    width: 100%;
    position: relative;
    z-index: 1;
    &-container {
      height: 100%;
      width: 100%;
      .subscribe-bg {
        width: 100%;
        height: 100%;
        img {
          width: 100%;
          height: 100%;
          object-fit: fill;
        }
      }
      .subscribe-time {
        position: absolute;
        bottom: 0;
        height: 80px;
        background: rgba(0, 0, 0, 0.7);
        font-size: 28px;
        color: #fff;
        text-align: center;
        line-height: 80px;
        width: 100%;
      }
    }
  }
</style>

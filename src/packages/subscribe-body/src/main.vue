<template>
  <div class="vmp-subscribe-body">
    <div class="vmp-subscribe-body-intro">
      <div class="subscribe-img">
        <div class="subscribe-img-box">
          <!-- 背景图片 未完成验证-->
          <img :src="webinarsBgImg" />
        </div>
        <div v-if="showVideo">
          <!-- 完成验证、并且有暖场视频 加载播放器 -->
          <vmp-air-container cuid="comPcPlayer" :oneself="true"></vmp-air-container>
        </div>
      </div>
      <!--活动时间信息-->
      <div class="subscribe-img-bottom">
        <bottom-tab
          v-if="showBottom"
          ref="bottomTab"
          :sub-option="subOption"
          @payMore="feeAuth"
          @authFetch="handleAuthCheck"
        ></bottom-tab>
      </div>
    </div>
    <div class="vmp-subscribe-body-tab">
      <vmp-air-container cuid="comTabMenu" :oneself="true"></vmp-air-container>
    </div>
  </div>
</template>
<script>
  import { useRoomBaseServer, useSubscribeServer } from 'middle-domain';
  import BottomTab from './components/bottomTab';
  import { boxEventOpitons } from '@/packages/app-shared/utils/tool.js';
  export default {
    name: 'VmpSubscribeBody',
    data() {
      return {
        showBottom: true,
        showVideo: false, // 显示暖场视频
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
    components: {
      BottomTab
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
      }
    },
    beforeCreate() {
      this.roomBaseServer = useRoomBaseServer();
      this.subscribeServer = useSubscribeServer();
    },
    created() {
      this.handlerInitInfo();
    },
    methods: {
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
      },
      feeAuth(params) {
        const { webinar } = this.roomBaseServer.state.watchInitData;
        let data = {
          webinar_id: webinar.id,
          refer: this.$route.query.refer,
          record_id: this.$route.query.record_id,
          visitor_id: this.roomBaseServer.state.watchInitData.visitor_id,
          ...params
        };
        this.subscribeServer.watchAuth(data).then(res => {
          if (res.code == 510008) {
            window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitClickLogin'));
          }
        });
      },
      handleAuthCheck() {
        this.feeAuth({ type: this.subOption.verify });
      }
    }
  };
</script>
<style lang="less">
  .vmp-subscribe-body {
    height: 100%;
    width: 100%;
    &-intro {
      position: relative;
      .subscribe-img {
        padding-top: 56.25%;
        &-box {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: 4px;
        }
        img {
          width: 100%;
          height: 100%;
          object-fit: fill;
          border-radius: 4px 4px 0 0;
        }
      }
    }
    &-tab {
      background: #2a2a2a;
      margin: 0px auto;
    }
  }
  @media screen and (max-width: 1366px) {
    .vmp-subscribe-body-intro,
    .vmp-subscribe-body-tab {
      width: 828px;
      margin: 0 auto;
    }
  }

  @media screen and (min-width: 1367px) and (max-width: 1600px) {
    .vmp-subscribe-body-intro,
    .vmp-subscribe-body-tab {
      width: 980px;
      margin: 0 auto;
    }
  }
  @media screen and (min-width: 1601px) and (max-width: 1920px) {
    .vmp-subscribe-body-intro,
    .vmp-subscribe-body-tab {
      width: 1528px;
      margin: 0 auto;
    }
  }
  @media screen and (min-width: 1921px) {
    .vmp-subscribe-body-intro,
    .vmp-subscribe-body-tab {
      width: 1528px;
      margin: 0 auto;
    }
  }
</style>

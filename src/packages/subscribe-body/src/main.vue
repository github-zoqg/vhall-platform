<template>
  <div class="vmp-subscribe-body">
    <div class="vmp-subscribe-body-intro">
      <div class="subscribe-img">
        <div>
          <!-- 背景图片 未完成验证-->
          <img :src="webinarsBgImg" />
        </div>
        <div>
          <!-- 完成验证、并且有暖场视频 加载播放器 -->
        </div>
        <!--活动时间信息-->
        <bottom-tab
          v-if="showBottom"
          ref="bottomTab"
          :sub-option="subOption"
          @payMore="feeAuth"
          @authFetch="handleAuthCheck"
        ></bottom-tab>
      </div>
    </div>
    <div class="vmp-subscribe-body-tab"></div>
  </div>
</template>
<script>
  import { useRoomBaseServer } from 'middle-domain';
  import BottomTab from './components/bottomTab';
  export default {
    name: 'VmpSubscribeBody',
    data() {
      return {
        showBottom: true,
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
    },
    created() {
      this.handlerInitInfo();
    },
    methods: {
      handlerInitInfo() {
        const { webinar, subscribe } = this.roomBaseServer.state.watchInitData;
        this.subOption.type = webinar.type;
        this.subOption.startTime = webinar.start_time;
        this.subOption.verify = webinar.verify;
        this.subOption.fee = webinar.fee || 0;
        this.subOption.verified = this.roomBaseServer.state.watchInitData.verified;
        this.subOption.is_subscribe = this.roomBaseServer.state.watchInitData.is_subscribe;
        this.subOption.actual_start_time = webinar.actual_start_time;
        this.subOption.show = subscribe.show;
        this.subOption.num = subscribe.num;
        // 自定义placeholder&&预约按钮是否展示
        this.subOption.verify_tip = webinar.verify_tip;
        this.subOption.hide_subscribe = webinar.hide_subscribe;
        // if (
        //   this.roomBaseServer.state.watchInitData.is_subscribe == 1 &&
        //   warmup.warmup_paas_record_id &&
        //   webinar.type == 2
        // ) {
        //   this.showVideo = true;
        // }
      }
    }
  };
</script>
<style lang="less">
  .vmp-subscribe-body {
    position: relative;
    &-intro {
      padding-top: 56.25%;
      .subscribe-img {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
    }
    &-tab {
      background: #1a1a1a;
      margin: 0px auto;
    }
  }
  @media screen and (max-width: 1366px) {
    .vmp-subscribe-body-intro,
    .vmp-subscribe-body-tab {
      width: 828px;
    }
  }

  @media screen and (min-width: 1367px) and (max-width: 1600px) {
    .vmp-subscribe-body-intro,
    .vmp-subscribe-body-tab {
      width: 980px;
    }
  }
  @media screen and (min-width: 1601px) and (max-width: 1920px) {
    .vmp-subscribe-body-intro,
    .vmp-subscribe-body-tab {
      width: 1528px;
    }
  }
  @media screen and (min-width: 1921px) {
    .vmp-subscribe-body-intro,
    .vmp-subscribe-body-tab {
      width: 1528px;
    }
  }
</style>

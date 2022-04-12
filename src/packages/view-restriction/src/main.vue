<template>
  <div
    v-if="showRestriction && restrictionOpts"
    :class="['vmp-view-restriction', { 'force-agree': !restrictionOpts.rule }]"
  >
    <div class="vmp-view-restriction-wrap">
      <div class="restriction-title">
        {{ restrictionOpts.title }}
      </div>
      <div
        :class="['restriction-content', { 'more-content': restrictionOpts.rule == 1 }]"
        v-html="restrictionOpts.content"
      ></div>
      <div class="restriction-law" v-html="restrictionOpts.statement_content"></div>
      <div v-if="restrictionOpts.statement_status" class="restriction-control">
        <template v-if="!restrictionOpts.rule">
          <span @click.stop="close(0)">{{ $t('webinar.webinar_1044') }}</span>
          <span @click.stop="close(-1)">{{ $t('webinar.webinar_1045') }}</span>
        </template>
        <span v-else @click.stop="close(1)">{{ $t('webinar.webinar_1046') }}</span>
      </div>
    </div>
  </div>
</template>
<script>
  import { useRoomBaseServer } from 'middle-domain';

  export default {
    name: 'VmpViewRestriction',
    data() {
      return {
        showRestriction: true,
        restrictionOpts: {
          rule: 0, // rule: 0 强制同意  rule: 1 非强制同意
          statement_status: 1, // 是否开启观看限制
          title: '微吼直播观看协议', // 限制标题
          content:
            '3月25日，有网友称海南航空HU7350因机械故障出现延误。同日15时许，海航工作人员向记者表示，HU7350航班出现飞机故障并因此延误，目前已离港。 海南航空公司通报称，3月25日，海航HU7350重庆—三亚航班在起飞前因临时故障原因导致延误。为减少旅客等待时间，公司决策更换飞机。目前，该航班已于当日16时52分安全抵达三亚凤凰国际机场。 <img src="https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fup.enterdesk.com%2F2021%2Fedpic_360_360%2Ffe%2F24%2F6a%2Ffe246a72021e3dafc1afdce09bb25fed_1.jpg&refer=http%3A%2F%2Fup.enterdesk.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1652003401&t=2ffea4999a056a78b40b4f526c451df1" />3月25日，有网友称海南航空HU7350因机械故障出现延误。同日15时许，海航工作人员向记者表示，HU7350航班出现飞机故障并因此延误，目前已离港。 海南航空公司通报称，3月25日，海航HU7350重庆—三亚航班在起飞前因临时故障原因导致延误。为减少旅客等待时间，公司决策更换飞机。目前，该航班已于当日16时52分安全抵达三亚凤凰国际机场。', // 限制内容
          is_open: 1, // 是否开启观看限制
          statement_content: '你可以阅读《观看协议》了解详细信息',
          statement_info: [
            { title: '协议', link: 'http://www.baidu.com' },
            { title: '观看', link: 'http://www.baidu.com' }
          ]
        } // 活动下观看限制信息
      };
    },
    created() {
      const roomServer = useRoomBaseServer();
      this.restrictionOpts = roomServer.state.agreementInfo;
      const { is_open, rule, statement_content, statement_info } = this.restrictionOpts;
      const storeOpts = sessionStorage.getItem('restrictionStore')
        ? JSON.parse(sessionStorage.getItem('restrictionStore'))
        : [];
      if (statement_info.length > 0) {
        statement_info.forEach(state => {
          const index = statement_content.indexOf(state.title);
          console.log(
            1111,
            index,
            statement_content.substring(0, index),
            statement_content.substring(index + state.title.length),
            statement_content
          );
          this.restrictionOpts.statement_content =
            statement_content.substring(0, index) +
            `<a class="law-link" href=${state.link}>${state.title}</a>` +
            statement_content.substring(index + state.title.length);
        });
      }

      /**
       * 观看限制弹窗展示逻辑
       * 1.开启观看限制 is_open = 1
       * 2.rule = 1 阅读后进入必弹 || rule = 0 需同意但未同意必弹
       */
      if (is_open == 1) {
        if (!rule) {
          if (storeOpts.length > 0 && storeOpts.includes(this.$route.params.id)) {
            this.showRestriction = false;
          } else {
            this.showRestriction = true;
          }
        } else {
          this.showRestriction = true;
        }
      } else {
        this.showRestriction = false;
      }
    },
    methods: {
      close(rule) {
        const session = sessionStorage.getItem('restrictionStore')
          ? JSON.parse(sessionStorage.getItem('restrictionStore'))
          : [];
        const webinarId = this.$route.params.id;
        const bool = session.length > 0 ? session.includes(webinarId) : false;
        if (rule < 0) {
          // 时间派发 展示错误页面
          const roomServer = useRoomBaseServer();
          roomServer.$emit('VIEW_RESTRICTION_ERROR_PAGE');
          return;
        } else if (!rule) {
          if (!bool) {
            session.push(webinarId);
          }
          console.log(991, session, typeof session);
          sessionStorage.setItem('restrictionStore', JSON.stringify(session));
        }
        this.showRestriction = false;
      }
    }
  };
</script>
<style lang="less">
  .vmp-view-restriction {
    width: 100%;
    height: 100%;
    position: fixed;
    top: 0px;
    left: 0px;
    background: rgba(0, 0, 0, 0.6);
    z-index: 10000;
    font-family: PingFangSC-Medium, PingFang SC;
  }
  .vmp-view-restriction-wrap {
    width: 600px;
    height: 360px;
    background: #ffffff;
    box-shadow: 0px 8px 16px 0px rgba(51, 51, 51, 0.24), 0px 2px 4px 0px rgba(0, 0, 0, 0.05);
    border-radius: 4px;
    box-sizing: border-box;
    padding: 24px 32px 0px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    .restriction-title {
      width: 100%;
      height: 28px;
      font-size: 20px;
      font-weight: 500;
      color: #1a1a1a;
      line-height: 28px;
      margin-bottom: 24px;
    }
    .restriction-content {
      width: 100%;
      height: auto;
      max-height: 120px;
      margin-bottom: 10px;
      font-size: 14px;
      font-weight: 400;
      color: #1a1a1a;
      line-height: 20px;
      overflow-y: scroll;
      img {
        display: block;
        object-fit: scale-down;
        margin: 10px 0px;
      }
    }
    .more-content {
      max-height: 188px;
    }
    .restriction-law {
      width: 100%;
      font-size: 14px;
      font-weight: 400;
      color: #666666;
      line-height: 20px;
      .law-link {
        color: #3562fa;
        &:hover {
          cursor: pointer;
        }
      }
    }
    .restriction-control {
      width: 100%;
      min-height: 40px;
      position: absolute;
      bottom: 0px;
      left: 0px;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding-bottom: 24px;
      & > span {
        display: inline-block;
        width: 152px;
        height: 40px;
        text-align: center;
        background: #fb3a32;
        border-radius: 20px;
        border: none;
        font-weight: 400;
        color: #ffffff;
        line-height: 40px;
        font-size: 14px;
        &:hover {
          cursor: pointer;
        }
      }
      & > span:nth-child(2) {
        margin-top: 10px;
        background: #fff;
        color: #1a1a1a;
        &:hover {
          color: #fb3a32;
        }
      }
    }
  }
  .force-agree {
    background: rgba(0, 0, 0, 1);
  }
</style>

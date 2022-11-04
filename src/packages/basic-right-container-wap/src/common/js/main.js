import { useMenuServer } from 'middle-domain';
import { boxEventOpitons } from '@/app-shared/utils/tool.js';
import lotteryIcon from '../components/lottery-icon/index.vue';
import redPacketIcon from '../components/red-repakcet-icon/index.vue';
import questionnaireIcon from '../components/questionnaire-icon/index.vue';
import noticeList from '../components/noticeList/index.vue';
export default {
  name: 'VmpContainerRightWap',
  components: {
    lotteryIcon,
    redPacketIcon,
    questionnaireIcon,
    noticeList
  },
  props: {
    iconStyle: {
      default: 1,
      type: Number,
      required: false
    } // 1为传统风格icon，2为新版icon
  },
  data() {
    return {
      showTimer: false,
      timerVisible: true,
      showSign: false,
      showIcon: true
    };
  },
  computed: {
    isInGroup() {
      return this.$domainStore.state.groupServer.groupInitData.isInGroup;
    },
    isEmbed() {
      return this.$domainStore.state.roomBaseServer.embedObj.embed;
    },
    // 直播类型
    webinarType() {
      return this.$domainStore.state.roomBaseServer.watchInitData.webinar.type;
    },
    isVod() {
      return this.$domainStore.state.roomBaseServer.watchInitData.webinar.type == 5;
    },
    // 是否是手机端 - 简洁模式
    isConcise() {
      let skin_json_wap = {
        style: 1
      };
      const skinInfo = this.$domainStore.state.roomBaseServer.skinInfo;
      if (skinInfo?.skin_json_wap && skinInfo.skin_json_wap != 'null') {
        skin_json_wap = skinInfo.skin_json_wap;
      }
      return !!(skin_json_wap?.style == 3);
    },
    // 竖屏直播
    isPortraitLive() {
      return this.$domainStore.state.roomBaseServer.watchInitData.webinar_show_type == 0;
    }
  },
  watch: {
    isInGroup: {
      handler: function (val) {
        if (val) {
          this.$domainStore.state.roomBaseServer.timerInfo = {};
        }
      }
    }
  },
  mounted() {
    useMenuServer().$on('tab-switched', async data => {
      // 需要展示icon tab
      // console.log(data.cuid, 'data.cuid');
      if (!this.isConcise || !this.isPortraitLive) {
        if (['comChatWap', 'comIntroWap'].includes(data.cuid)) {
          this.showIcon = true;
        } else {
          this.showIcon = false;
        }
      }
    });
  },
  methods: {
    changeStatus(data, status) {
      // console.log(data, status, 'data, status');
      this[data] = status;
    },
    handleTimer() {
      if (!this.timerVisible) {
        this.timerVisible = true;
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitOpenTimer'));
      }
    },
    handleSign() {
      window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitOpenSign'));
    },
    handleRedPacket() {
      window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitOpenRedPacket'));
    },
    checkLotteryIcon() {
      window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitClickLotteryIcon'));
    },
    checkQuestionnaireIcon(questionnaireId) {
      console.log(questionnaireId);
      window.$middleEventSdk?.event?.send(
        boxEventOpitons(this.cuid, 'emitClickQuestionnaireIcon', [questionnaireId])
      );
    }
  }
};

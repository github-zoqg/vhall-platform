export default {
  props: {
    fitment: {
      // 皮肤门厅
      type: Object,
      required: true
    },
    winnerList: {
      type: Array,
      required: true,
      default() {
        return [];
      }
    },
    lotteryId: {
      type: [String, Number],
      required: true
    },
    showWinnerList: {
      type: Boolean,
      default() {
        return false;
      }
    },
    prizeInfo: {
      type: Object,
      default() {
        return {};
      }
    },
    lotteryInfo: {
      type: Object,
      default() {
        return {};
      }
    },
    needTakeAward: {
      type: Boolean,
      default() {
        return true;
      }
    }
  },
  data() {
    return {
      defaultLotteryImg: require('../img/win.png')
    };
  }
};

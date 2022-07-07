// import { fboxEventOpitons } from '@/app-shared/utils/tool.js';
import {
  useRoomBaseServer,
  useWatchRewardServer,
  useChatServer,
  useZIndexServer
} from 'middle-domain';
import QRcode from 'qrcode';
// import { mapMutations } from 'vuex';
export default {
  name: 'reward',
  data() {
    let { watchInitData } = useRoomBaseServer().state;
    const zIndexServerState = this.zIndexServer.state;
    return {
      watchInitData,
      zIndexServerState,
      showRewardDialog: false,
      showGiveMoneyQr: false,
      giveMoneyUrl: '',
      activeItem: 0,
      customRewardInfo: {
        money: '',
        desc: ''
      },
      payMode: 0,
      defaultPayNumList: [1.88, 8.88, 88.88],
      qrLoaded: true
    };
  },
  watch: {
    // showRewardDialog: function (tag) {
    //   this.setToolsCount(tag);
    // }
  },
  beforeCreate() {
    this.zIndexServer = useZIndexServer();
    this.watchRewardServer = useWatchRewardServer();
  },
  created() {
    this.chatServer = useChatServer();
    this.listenEvent();
  },
  computed: {
    userId() {
      return this.watchInitData.join_info.third_party_user_id;
    }
  },
  methods: {
    // ...mapMutations('watchBase', ['setDialogZIndexQueue', 'setToolsCount']),
    listenEvent() {
      // 改为飘屏组件监听
      this.watchRewardServer.$on('reward_pay_ok', rawMsg => {
        if (this.watchInitData.join_info.third_party_user_id == rawMsg.data.rewarder_id) {
          this.closeDialog();
        }
      });
    },
    /**
     * 价格格式限制
     * 只能输入数字和小数点；
     * 小数点只能有1个
     * 第一位不能是小数点
     * 第一位如果输入0，且第二位不是小数点，则去掉第一位的0
     * 小数点后保留2位
     */
    handleInput(value) {
      if (value != '') {
        // this.editParams.price = value.replace(/^[0-9]*$/,'')
        // this.editParams.price = value.replace(/[^\d]/g,'')
        let str = value;
        const len1 = str.substr(0, 1);
        const len2 = str.substr(1, 1);
        // 如果第一位是0，第二位不是点，就用数字把点替换掉
        if (str.length > 1 && len1 == 0 && len2 != '.') {
          str = str.substr(1, 1);
        }
        // 第一位不能是.
        if (len1 == '.') {
          str = '';
        }
        // 限制只能输入一个小数点
        if (str.indexOf('.') != -1) {
          const str_ = str.substr(str.indexOf('.') + 1);
          if (str_.indexOf('.') != -1) {
            str = str.substr(0, str.indexOf('.') + str_.indexOf('.') + 1);
          }
        }
        // 正则替换，保留数字和小数点
        // eslint-disable-next-line no-useless-escape
        str = str.replace(/[^\d^\.]+/g, '');
        // 如果需要保留小数点后两位，则用下面公式
        if (str.indexOf('.') > -1 && str.length - str.indexOf('.') > 3) {
          str = str.slice(0, str.indexOf('.') + 3);
          this.$message({
            message: this.$t('cash.cash_1034'),
            showClose: true,
            // duration: 0,
            type: 'warning',
            customClass: 'zdy-info-box'
          });
        }
        this.customRewardInfo.money = str;
        this.activeItem = 3;
      } else {
        this.activeItem = 0;
      }
    },
    // open支付金额设置弹框
    onClickReward() {
      this.zIndexServer.setDialogZIndex('reward');
      this.showRewardDialog = true;
    },
    // 选择支付金额
    onClickRewardItem(index) {
      this.activeItem = index;
      this.customRewardInfo = {
        money: '',
        desc: ''
      };
    },
    // 关闭支付相关弹框
    closeDialog() {
      this.showGiveMoneyQr = false;
      this.giveMoneyUrl = '';
      this.activeItem = 0;
      this.customRewardInfo = {
        money: '',
        desc: ''
      };
      this.payMode = 0;
      this.showRewardDialog = false;
    },
    // 选择支付模式
    changePayMode(type) {
      this.payMode = type;
      this.handleGiveMoney();
    },
    // 金额校验
    checkoutGiveMoney(val) {
      const isNum = /^(([1-9][0-9]*)|(([0]\.\d{1,2}|[1-9][0-9]*\.\d{1,2})))$/;
      if (isNum.test(Number(val))) {
        return true;
      } else {
        this.$message({
          message: this.$t('interact_tools.interact_tools_1070'),
          showClose: true,
          // duration: 0,
          type: 'error',
          customClass: 'zdy-info-box'
        });
        return false;
      }
    },
    // 确认支付
    handleGiveMoney() {
      let money = 0;
      if (this.customRewardInfo.money) {
        if (!this.checkoutGiveMoney(Number(this.customRewardInfo.money).toFixed(2))) return;
        money = Number(this.customRewardInfo.money).toFixed(2);
      } else {
        money = Number(this.defaultPayNumList[this.activeItem]);
      }
      this.watchRewardServer
        .createReward({
          room_id: this.watchInitData.interact.room_id,
          reward_amount: money,
          channel: this.payMode == 0 ? 'WEIXIN' : 'ALIPAY',
          service_code: 'QR_PAY',
          describe: this.customRewardInfo.desc
            ? this.customRewardInfo.desc
            : this.$t('chat.chat_1037')
        })
        .then(res => {
          if (res.code == 200 && res.data.pay_data) {
            QRcode.toDataURL(res.data.pay_data, (err, url) => {
              if (err) return;
              this.showGiveMoneyQr = true;
              this.giveMoneyUrl = url;
              this.qrLoaded = false;
            });
          } else {
            // code为 513548 超出打赏金额限制。其它情况下，后端异常
            return this.$message({
              message: this.$tec(res.code) || res.msg,
              showClose: true,
              // duration: 0,
              type: 'error',
              customClass: 'zdy-info-box'
            });
          }
        });
    },
    // 付款码上添加遮罩
    onLoaded() {
      this.qrLoaded = true;
    }
  }
};

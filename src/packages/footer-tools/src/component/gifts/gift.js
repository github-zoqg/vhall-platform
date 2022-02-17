import { useGiftsServer, useRoomBaseServer } from 'middle-domain';
// import { mapState, mapMutations } from 'vuex';
export default {
  name: 'VhGifts',
  data() {
    let { watchInitData, configList } = useRoomBaseServer().state;
    return {
      watchInitData,
      configList,
      list: null,
      moreList: [],
      giftInfo: {},
      showGiftInfo: false,
      moreClassName: '',
      timer: null,
      selectPage: 0,
      counter: 5,
      btnDisabled: false
    };
  },
  props: {
    roomId: {
      type: [String, Number],
      require: true
    },
    source: {
      type: String,
      default: 'watch'
    },
    showGiftCount: {
      type: Number
    }
  },
  beforeDestroy() {
    this.list = [];
    this.moreList = [];
    this.giftInfo = {};
    this.showGiftInfo = false;
    this.moreClassName = '';
    if (this.timer) clearTimeout(this.timer);
    this.selectPage = 0;
  },
  computed: {
    // ...mapState('watchBase', ['watchInitData', 'configList'])
  },
  watch: {
    showGiftCount: {
      handler: function (newVal) {
        // 如果开启聊天高并发配置项，只有第一次点击礼物的时候会调一次礼物列表接口，否则，每次点开都会调一次
        if (newVal == 1 || this.configList['ui.hide_chat_history'] != '1') {
          this.queryAllGift();
        }
      }
    }
  },
  beforeCreate() {
    this.giftsServer = useGiftsServer();
  },
  mounted() {
    console.log(useRoomBaseServer().state, 'this.roomId');
    // 赠送礼物成功
    if (this.configList['ui.hide_chat_history'] == '1') {
      this.$VhallEventBus.$on(this.$VhallEventType.InteractTools.ROOM_GIFT_SEND_SUCCESS, msg => {
        if (msg.sender_id != this.watchInitData.join_info.third_party_user_id) return;
        this.btnDisabled = true;
        // 开始限频倒计时
        this._handlerTimer = setInterval(() => {
          if (this.counter <= 0) {
            clearInterval(this._handlerTimer);
            this._handlerTimer = null;
            this.counter = 5;
            this.btnDisabled = false;
            return;
          }
          this.counter--;
        }, 1000);
      });
    }
  },
  methods: {
    // ...mapMutations('watchBase', ['setDialogZIndexQueue', 'setToolsCount']),
    queryAllGift() {
      this.giftsServer
        .queryGiftsList({
          room_id: this.roomId
        })
        .then(res => {
          if (res.code == 200 && res.data && res.data.list) {
            const data = res.data.list;
            let arr = [];
            if (this.source == 'embed') {
              if (data.length > 0) {
                arr = data.filter(item => {
                  return item.price == 0;
                });
              } else {
                arr = [];
              }
            } else {
              arr = data;
            }
            this.list = [];
            this.moreList = [];
            if (arr.length > 5) {
              const len = arr.length;
              const remain = Math.ceil(len / 8);
              for (let i = 0; i < remain; i++) {
                const cut = arr.splice(0, 8);
                this.moreList.push(cut);
              }
            } else {
              this.list = arr;
            }
          }
        });
    },
    sendGift() {
      // this.$VhallEventBus.$emit(this.$VhallEventType.InteractTools.ROOM_GIFT_SEND, this.giftInfo);
      // this.setDialogZIndexQueue('giftPay');
      this.giftsServer
        .sendGift({
          gift_id: this.giftInfo.id,
          channel: 'WEIXIN',
          service_code: 'QR_PAY', //TODO:两种支付方式 - 'ALIPAY'
          room_id: this.watchInitData.interact.room_id
        })
        .then(res => {
          if (res.code == 200 && res.data) {
            if (this.giftInfo.price == 0) {
              this.showGift = false;
              return;
            }
            const link = encodeURIComponent(res.data.data.pay_data.qr_code);
            const img = `https://aliqr.e.vhall.com/qr.png?t=${link}`;
            this.wxQr = img;
            this.showPay = true;
            this.showGift = false;
          }
        })
        .catch(e => {
          this.$message({
            message: e.msg,
            showClose: true,
            // duration: 0,
            type: 'error',
            customClass: 'zdy-info-box'
          });
        });
    },
    handleChangePage(page) {
      this.selectPage = page;
    },
    handleMouseover(data, i) {
      if (this.timer) clearTimeout(this.timer);
      this.showGiftInfo = true;
      if (this.moreList.length > 0) {
        // 更多展示
        this.moreClassName = `more-info-${i}`;
        const img = this.changeHoverImg(data);
        if (this.moreList[this.selectPage] && this.moreList[this.selectPage][i]) {
          this.moreList[this.selectPage][i].hoverImg = img;
        }
      } else {
        // 最多四个展示
        this.moreClassName = `less-info-${i}`;
        const img = this.changeHoverImg(data);
        if (this.list[i]) {
          this.list[i].hoverImg = img;
        }
      }
      this.giftInfo = data;
    },
    changeHoverImg(data) {
      if (data.source_status == 1) return '';
      if (data.name == '鲜花') {
        return require('./img/rose-move.gif');
      } else if (data.name == '咖啡') {
        return require('./img/coffee-move.gif');
      } else if (data.name == '鼓掌') {
        return require('./img/hand-move.gif');
      } else if (data.name == '赞') {
        return require('./img/favor-move.gif');
      } else if (data.name == '666') {
        return require('./img/666-move.gif');
      }
    },
    handleClearTime() {
      if (this.timer) clearTimeout(this.timer);
    },
    handleMouseout(i) {
      if (this.timer) clearTimeout(this.timer);
      if (
        i >= 0 &&
        this.moreList.length > 0 &&
        this.moreList[this.selectPage][i] &&
        this.moreList[this.selectPage][i].hoverImg
      ) {
        this.moreList[this.selectPage][i].hoverImg = '';
      }
      if (i >= 0 && this.list.length > 0 && this.list[i] && this.list[i].hoverImg) {
        this.list[i].hoverImg = '';
      }
      this.timer = setTimeout(() => {
        this.showGiftInfo = false;
        this.moreClassName = '';
        this.giftInfo = {};
      }, 300);
    }
  }
};

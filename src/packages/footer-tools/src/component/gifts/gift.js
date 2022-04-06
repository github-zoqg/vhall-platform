import { useGiftsServer, useRoomBaseServer, useMsgServer } from 'middle-domain';
// import { boxEventOpitons } from '@/packages/app-shared/utils/tool.js';
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
    source() {
      return this.$domainStore.state.roomBaseServer.embedObj.embed;
    }
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
    this.msgServer = useMsgServer();
  },
  mounted() {
    console.log(
      this.$domainStore.state,
      this.configList['ui.hide_chat_history'] == '1',
      'this.roomId'
    );
    // 赠送礼物成功

    this.giftsServer.$on('gift_send_success', msg => {
      // 关闭支付弹框
      if (msg.sender_id != this.watchInitData.join_info.third_party_user_id) return;
      this.$emit('changeShowGift', 'showPay', false);
      if (this.configList['ui.hide_chat_history'] == '1') {
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
      }
    });
  },
  methods: {
    // ...mapMutations('watchBase', ['setDialogZIndexQueue', 'setToolsCount']),
    // 获取礼物列表
    queryAllGift() {
      this.giftsServer
        .queryGiftsList({
          room_id: this.roomId
        })
        .then(res => {
          if (res.code == 200 && res.data && res.data.list) {
            const data = res.data.list;
            let arr = [];
            if (this.source) {
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
    // payType: 支付方式
    sendGift(payType) {
      // this.$VhallEventBus.$emit(this.$VhallEventType.InteractTools.ROOM_GIFT_SEND, this.giftInfo);
      // this.setDialogZIndexQueue('giftPay');
      // 未登录且礼物金额不为0
      if (this.giftInfo.price != 0 && this.watchInitData.join_info.user_id == 0) {
        this.$emit('needLogin');
        // window.$middleEventSdk?.event?.send(boxEventOpitons('comFooterTools', 'emitNeedLogin'));
        return;
      }
      // 关闭礼物面板
      this.$emit('changeShowGift', 'showGift', false);
      // 开启聊天高并发配置项之后，免费礼物使用聊天消息发送，否则调共享服务
      if (this.giftInfo.price == 0 && this.configList['ui.hide_chat_history'] == '1') {
        const msgData = {
          type: 'permit',
          event_type: 'free_gift_send',
          gift_user_avatar: this.watchInitData.join_info.avatar,
          barrageTxt: '',
          text_content: '',
          gift_user_nickname: this.watchInitData.join_info.nickname,
          role_name: 2,
          gift_name: this.giftInfo.name,
          gift_image_url: this.giftInfo.image_url,
          source_status: this.giftInfo.source_status
        };
        const context = {
          avatar: this.watchInitData.join_info.avatar,
          nickname: this.watchInitData.join_info.nickname
        };
        if (this.msgServer) {
          this.msgServer.sendChatMsg(msgData, context);
        }
        this.showGift = false;
        return false;
      }

      // 获取支付宝支付码
      if (this.giftInfo.price != 0) {
        // 微信支付二维码, 组件传递过来的
        this.apiGetPayQrCode(payType, res => {
          this.noFreeGiftCallback(payType, res);
        });

        //支付宝支付二维码
        setTimeout(() => {
          this.apiGetPayQrCode('ALIPAY', res => {
            this.noFreeGiftCallback('ALIPAY', res);
          });
        }, 300);
      } else {
        this.apiGetPayQrCode('WEIXIN', () => {
          this.freeGiftCallback();
        });
      }
    },
    /**
     *获取支付宝支付码
     * @param {*} payType 支付类型
     * @param {*} callback 回调函数
     */
    apiGetPayQrCode(payType, callback) {
      this.giftsServer
        .sendGift(
          {
            gift_id: this.giftInfo.id,
            channel: payType || 'WEIXIN',
            service_code: 'QR_PAY', //两种支付方式 - 'ALIPAY'
            room_id: this.watchInitData.interact.room_id
          },
          this.giftInfo
        )
        .then(res => {
          if (res.code == 200 && res.data) {
            callback(res);
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
    /**
     * 免费礼物回调
     */
    freeGiftCallback() {
      this.$emit('changeShowGift', 'showGift', false);
    },
    /**
     *  收费礼物回调
     * @param {*} payType 支付方式
     * @param {*} res 接口响应数据
     */
    noFreeGiftCallback(payType, res) {
      this.$emit('changeShowGift', 'showGift', false);
      const link = encodeURIComponent(res.data.data.pay_data.qr_code);
      const img = `https://aliqr.e.vhall.com/qr.png?t=${link}`;
      if (payType == 'ALIPAY') {
        this.$emit('acceptPay', 'zfQr', img);
      } else {
        this.$emit('acceptPay', 'wxQr', img);
      }
    },
    /**
     * 换页
     * @param {*} page
     */
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

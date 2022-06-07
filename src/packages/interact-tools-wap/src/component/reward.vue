<template>
  <section>
    <van-popup
      get-container="#app"
      v-model="showRewardCard"
      class="reward-van-popup"
      position="bottom"
      round
      closeable
    >
      <div class="reward-wrap">
        <ul>
          <li
            v-for="(item, index) in moneyList"
            :key="index"
            :class="{ active: item.active }"
            @click="chooseMoney(index, item)"
          >
            <span>
              <span class="item">￥</span>
              <span v-html="item.value"></span>
            </span>
          </li>
        </ul>
        <div class="otherMoney">
          <van-field
            v-model.trim="money"
            :label="$t('interact_tools.interact_tools_1046')"
            type="number"
            :placeholder="`￥0.00`"
            input-align="right"
            @blur="textBlur"
            @focus="clearMoney()"
          />
        </div>
        <div class="notes">
          <van-field
            type="text"
            v-model="note"
            maxlength="15"
            :placeholder="`${$t('interact_tools.interact_tools_1047')}!`"
            @blur="textBlur"
          >
            <div slot="extra">
              <span class="text-limit">
                <span :class="note.length > 0 ? (note.length >= 15 ? 'text-ful' : 'text-can') : ''">
                  {{ note.length }}
                </span>
                /15
              </span>
            </div>
          </van-field>
        </div>
        <button class="btn" @click="submit">{{ btnTxt }}</button>
      </div>
    </van-popup>
  </section>
</template>

<script>
  // import EventBus from '@/utils/Events';
  import { useWatchRewardServer, useChatServer } from 'middle-domain';
  import { authWeixinAjax, buildPayUrl } from '@/packages/app-shared/utils/wechat';
  import { boxEventOpitons, isWechat, isWechatCom } from '@/packages/app-shared/utils/tool.js';
  export default {
    name: 'reward',
    props: {
      webinarData: {
        default: () => ({})
      },
      localRoomInfo: {
        required: false
      },
      cuid: {
        required: true
      }
    },
    data() {
      return {
        moneyList: [
          { value: 1.88, active: true },
          { value: 8.88, active: false },
          { value: 88.88, active: false }
        ],
        showRewardCard: false,
        money: '',
        btnMoney: '', // 选中按钮上面的金额
        note: ''
      };
    },
    computed: {
      // 支付按钮文案
      btnTxt() {
        if (isWechat() || isWechatCom()) {
          return this.$t('interact_tools.interact_tools_1049');
        } else {
          return this.$t('interact_tools.interact_tools_1069');
        }
      },
      isSmallPlayer() {
        return this.$domainStore.state.playerServer.isSmallPlayer;
      }
    },
    // watch: {
    //   isSmallPlayer() {
    //     this.setSetingHeight();
    //   }
    // },
    mounted() {
      this.chatServer = useChatServer();
      this.rewardServer = useWatchRewardServer();
      this.rewardServer.$on('reward_pay_ok', msg => {
        this.rewardFn(msg);
      });
    },
    beforeDestroy() {
      // EventBus.$off('reward_pay_ok', this.rewardFn);
    },
    methods: {
      // 打赏成功消息
      rewardFn(msg) {
        console.log('收到打赏成功消息', msg, this.webinarData.join_info.third_party_user_id);
        const data = {
          avatar: msg.data.rewarder_avatar,
          nickName:
            msg.data.rewarder_nickname.length > 8
              ? msg.data.rewarder_nickname.substr(0, 8) + '...'
              : msg.data.rewarder_nickname,
          type: 'reward_pay_ok',
          content: {
            text_content: msg.data.reward_describe
              ? msg.data.reward_describe
              : this.$t('chat.chat_1037'),
            num: msg.data.reward_amount
          },
          sendId: this.webinarData.join_info.third_party_user_id,
          // roleName: this.roleName,
          interactToolsStatus: true
        };
        this.chatServer.addChatToList(data);
        if (msg.rewarder_id == this.webinarData.join_info.third_party_user_id) {
          console.log('收到打上成功消息，关闭弹窗');
          this.close();
        }
      },
      // 金额选择
      chooseMoney(index, item) {
        for (const iterator of this.moneyList) {
          iterator.active = false;
        }
        this.money = '';
        this.moneyList[index].active = true;
        this.btnMoney = item.value;
        // this.rewardPay(item.value)
      },
      // 清楚默认选择金额
      clearMoney() {
        for (const iterator of this.moneyList) {
          iterator.active = false;
        }
        this.btnMoney = '';
      },
      textBlur() {},
      // 输入金额校验
      handleInput(e) {
        let targetValue = e.target.value;
        if (targetValue != '') {
          let str = targetValue;
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
            this.$toast(this.$t('cash.cash_1034'));
          }
          this.money = str;
          this.clearMoney();
        } else {
          this.moneyList[0].active = true;
          this.btnMoney = this.moneyList[0].value;
        }
      },
      // 金额校验
      checkoutGiveMoney(val) {
        const isNum = /^(([1-9][0-9]*)|(([0]\.\d{1,2}|[1-9][0-9]*\.\d{1,2})))$/;
        if (isNum.test(Number(val))) {
          return true;
        } else {
          this.$toast(this.$t('interact_tools.interact_tools_1070'));
          return false;
        }
      },
      submit() {
        let _money = 0;
        if (this.money) {
          if (!this.checkoutGiveMoney(Number(this.money).toFixed(2))) return;
          _money = Number(this.money).toFixed(2);
        } else {
          const selectBtn = this.moneyList.find(item => item.active);
          _money = Number(selectBtn.value);
        }
        this.rewardPay(_money);
      },
      /**
       * @param {Number} type-1微信 2支付宝
       * @return 返回 code：200，
       * data：{  下面两个参数必有且只存在其一，jsApiParameters代表本页面唤起微信支付，前提是页面做了微信授权，url代表需要跳转页面支付
       * jsApiParameters:{}
       * url:''
         }
      */
      rewardPay(money) {
        const open_id = sessionStorage.getItem('open_id');
        let params = {};
        let payAuthStatus = 0; //默认支付流程为非授权或授权后
        if (isWechat()) {
          // 微信正常授权过
          if (open_id) {
            params = {
              room_id: this.localRoomInfo.roomId,
              channel: 'WEIXIN',
              reward_amount: money,
              service_code: 'JSAPI',
              describe: this.note
                ? this.note
                : `${this.$t('interact_tools.interact_tools_1047')}～～`,
              open_id: open_id
            };
          } else {
            //重新授权
            payAuthStatus = 1;
            const payUrl = buildPayUrl(this.$route);
            authWeixinAjax(this.$route, payUrl, () => {});
          }
        } else {
          //如果是企业微信环境,需要启动微信h5支付相关参数
          if (isWechatCom()) {
            params = {
              channel: 'WEIXIN',
              reward_amount: money,
              service_code: 'H5_PAY',
              describe: this.note
                ? this.note
                : `${this.$t('interact_tools.interact_tools_1047')}～～`,
              room_id: this.localRoomInfo.roomId
            };
          } else {
            // 正常的h5支付, 支付宝
            params = {
              channel: 'ALIPAY',
              reward_amount: money,
              service_code: 'H5_PAY',
              describe: this.note
                ? this.note
                : `${this.$t('interact_tools.interact_tools_1047')}～～`,
              room_id: this.localRoomInfo.roomId
            };
          }
        }

        if (payAuthStatus == 0) {
          this.payProcess(params);
        }
      },
      // 确认支付
      payProcess(params) {
        const that = this;
        this.rewardServer
          .createReward({ ...params })
          .then(res => {
            if (res.code == 200) {
              if (isWechat()) {
                WeixinJSBridge.invoke(
                  'getBrandWCPayRequest',
                  {
                    appId: res.data.pay_data.appId,
                    timeStamp: String(res.data.pay_data.timeStamp), // 支付签名时间戳，注意微信jssdk中的所有使用timestamp字段均为小写。但最新版的支付后台生成签名使用的timeStamp字段名需大写其中的S字符
                    nonceStr: res.data.pay_data.nonceStr, // 支付签名随机串，不长于 32 位
                    package: res.data.pay_data.package, // 统一支付接口返回的prepay_id参数值，提交格式如：prepay_id=\*\*\*）
                    signType: res.data.pay_data.signType, // 签名方式，默认为'SHA1'，使用新版支付需传入'MD5'
                    paySign: res.data.pay_data.paySign // 支付签名
                  },
                  function (res) {
                    if (res.err_msg == 'get_brand_wcpay_request:ok') {
                      that.$toast(`${that.$t('common.common_1005')}`);
                      that.close();
                      // setTimeout(() => {
                      //   window.location.href =
                      //     window.location.protocol +
                      //     process.env.VUE_APP_WAP_WATCH +
                      //     process.env.VUE_APP_WEB_KEY +
                      //     `/lives/watch/${that.$route.params.id}`;
                      // }, 1500);
                    }
                  }
                );
              } else {
                window.location.href = res.data.pay_data;
              }
            } else {
              that.$toast(`${that.$tec(res.code) || res.msg}`);
            }
          })
          .catch(res => {
            console.log('reward 获取支付信息失败---------->', res);
            that.$toast(`${that.$tec(res.code) || res.msg}`);
          });
      },
      close() {
        this.showRewardCard = false;
        this.note = '';
        this.money = '';
      },
      // 打开打赏弹框
      showReward() {
        if (!this.localRoomInfo.isLogin) {
          window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitNeedLogin'));
          return;
        }
        this.chooseMoney(0, this.moneyList[0]);
        this.note = '';
        this.showRewardCard = true;
      },
      handleBlur() {
        if (!this.money) {
          this.moneyList[0].active = true;
          this.btnMoney = this.moneyList[0].value;
        }
      }
    }
  };
</script>

<style lang="less">
  .reward-van-popup {
    padding-bottom: 0 !important;
  }
  .reward-wrap {
    height: 100%;
    background: linear-gradient(55.05deg, #fdf1ed 9.38%, #f3f2ff 101.37%);
    box-shadow: 0px -2px 10px rgba(0, 0, 0, 0.1);
    padding: 90px 32px 40px;

    @supports (bottom: constant(safe-area-inset-bottom)) or (bottom: env(safe-area-inset-bottom)) {
      padding-bottom: calc(env(safe-area-inset-bottom) + 40px) !important;
    }

    .van-field {
      border-radius: 8px;
    }

    ul {
      display: flex;
      align-items: center;
      justify-content: space-between;
      li {
        width: 218px;
        height: 132px;
        display: flex;
        justify-content: center;
        align-items: center;
        color: #1a1a1a;
        border-radius: 8px;
        background-color: rgba(255, 255, 255, 0.8);
        border: 1px solid rgba(255, 255, 255, 0.8);
        font-size: 40px;
        font-weight: 500;
        &.active {
          background: rgba(255, 209, 201, 0.2);
          border: 4px solid #fb2626;
        }
        .item {
          font-size: 24px;
          font-weight: 400;
        }
      }
    }

    .otherMoney,
    .notes {
      margin: 24px 0;
      height: 80px;
      display: flex;
      color: #8c8c8c;
      border-radius: 8px;
      font-size: 28px;
      input {
        color: #262626;
      }
    }

    .notes {
      input {
        padding-right: 100px;
      }
      .text-limit {
        position: absolute;
        line-height: 80px;
        top: 0px;
        right: 20px;
        font-size: 28px;
        color: rgba(89, 89, 89, 0.8);
        .text-ful {
          color: rgba(251, 38, 38, 0.8);
        }
        .text-can {
          color: rgba(59, 153, 247, 0.8);
        }
      }
    }
    .btn {
      width: 100%;
      height: 80px;
      background: #fb2626;
      border-radius: 50px;
      font-weight: 500;
      font-size: 28px;
      display: flex;
      justify-content: center;
      align-items: center;
      color: #fff;
      margin-top: 60px;
    }
  }
</style>

<template>
  <section>
    <van-popup
      get-container="#otherPopupContainer"
      v-model="showRewardCard"
      position="bottom"
      :overlay="false"
      :style="{ height: popHeight }"
    >
      <div class="reward-wrap">
        <header>
          {{ $t('interact_tools.interact_tools_1044') }}
          <i class="vh-iconfont vh-line-close" @click="close"></i>
        </header>
        <p class="title">{{ $t('interact_tools.interact_tools_1045') }}</p>
        <ul>
          <li
            v-for="(item, index) in moneyList"
            :key="index"
            :class="{ active: item.active }"
            @click="chooseMoney(index, item)"
          >
            {{ item.value }}
          </li>
        </ul>
        <div class="otherMoney">
          <div>
            <input
              type="number"
              @focus="clearMoney()"
              v-model.trim="money"
              :placeholder="`￥${$t('interact_tools.interact_tools_1046')}`"
              @blur="textBlur"
            />
          </div>
        </div>
        <div class="notes">
          <div>
            <input
              type="text"
              v-model="note"
              @input="changeDes"
              maxlength="15"
              :placeholder="`${$t('interact_tools.interact_tools_1047')}!`"
              @blur="textBlur"
            />
            <span class="text-limit">{{ note.length }}/15</span>
          </div>
        </div>
        <footer>
          <button @click="submit">{{ btnTxt }}</button>
        </footer>
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
          { value: 1.88, active: false },
          { value: 8.88, active: false },
          { value: 88.88, active: false }
        ],
        showRewardCard: false,
        popHeight: '60%',
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
      }
    },
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
      // 长度判断修改
      changeDes(e) {
        const val = e.target.value;
        if (val.length > 20) {
          this.note = val.substr(0, 20);
        } else {
          this.note = val;
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
      // 金额校验
      submit() {
        const reg = /(^[1-9]\d*(.\d{1,2})?)|(^0\.[1-9][0-9]?)|(^0\.[0-9][1-9])/;
        const fee = this.money || this.btnMoney;
        if (reg.test(fee)) {
          this.rewardPay(fee);
        } else {
          this.$toast(this.$t('interact_tools.interact_tools_1070'));
        }
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
      //  * 计算 设置的弹层高度
      setSetingHeight() {
        let htmlFontSize = document.getElementsByTagName('html')[0].style.fontSize;
        // postcss 换算基数为75 头部+播放器区域高为 522px
        this.popHeight = document.body.clientHeight - (522 / 75) * parseFloat(htmlFontSize) + 'px';
      },
      // 打开打赏弹框
      showReward() {
        // console.log(123123, this.localRoomInfo);
        if (!this.localRoomInfo.isLogin) {
          window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitNeedLogin'));
          return;
        }
        this.setSetingHeight();
        this.showRewardCard = true;
      },
      textBlur() {
        // window.scroll(0, 0)
      }
    }
  };
</script>

<style lang="less">
  .reward-wrap {
    header {
      position: relative;
      font-size: 32px;
      font-weight: 500;
      color: rgba(68, 68, 68, 1);
      letter-spacing: 3px;
      text-align: center;
      height: 90px;
      line-height: 90px;
      border-bottom: 1px solid rgba(212, 212, 212, 1);
      i {
        position: absolute;
        top: 50%;
        left: 94%;
        transform: translate(-50%, -50%);
        font-size: 27px;
      }
    }
    .title {
      text-align: center;
      font-size: 30px;
      color: rgba(68, 68, 68, 1);
      margin: 30px 0px;
    }
    ul {
      display: flex;
      box-sizing: border-box;
      padding: 0 30px;
      justify-content: space-between;
      li {
        width: 30%;
        text-align: center;
        display: inline-block;
        height: 80px;
        line-height: 78px;
        color: #444444;
        border-radius: 8px;
        border: 1px solid #d4d4d4;
        font-size: 36px;
        &.active {
          color: white;
          border-radius: 8px;
          background-color: #fc5459;
          border: 1px solid #fc5459;
        }
      }
    }

    .otherMoney,
    .notes {
      margin: 30px;
      padding: 0 30px;
      height: 90px;
      display: flex;
      color: rgba(68, 68, 68, 1);
      justify-content: space-between;
      border-radius: 8px;
      border: 1px solid #d4d4d4;
      font-size: 30px;
      > div {
        input {
          width: 100%;
          height: 100%;
          line-height: normal;
        }
        input[type='number']::-webkit-input-placeholder,
        input[type='text']::-webkit-input-placeholder {
          color: #a0a0a0;
          font-size: 30px;
        }
      }
    }

    .otherMoney {
      > div {
        height: 100%;
        flex-grow: 1;
      }
    }
    .notes {
      margin-bottom: 170px;
      > div {
        height: 100%;
        width: 100%;
        position: relative;
        input {
          padding-right: 120px;
        }
        .text-limit {
          position: absolute;
          line-height: 88px;
          top: 0px;
          right: 20px;
          font-size: 30px;
        }
      }
      .van-cell__value::v-deep {
        padding-top: 4px;
        background: #f5f5f5;
        height: 100%;
        .van-field__body {
          height: 100%;
        }
        .van-field__word-limit {
          margin-top: -24px;
        }
      }
    }
    footer {
      width: 100%;
      position: fixed;
      bottom: 40px;
      padding: 0 30px;
      background: white;
      margin-top: 30px;
      z-index: 99;
      button {
        width: 100%;
        height: 94px;
        background: rgba(252, 84, 89, 1);
        border-radius: 10px;
        font-size: 36px;
        font-family: PingFangSC;
        font-weight: 500;
        color: rgba(255, 255, 255, 1);
        line-height: 94px;
        text-align: center;
      }
    }
  }
</style>

<template>
  <section>
    <van-popup
      class="gift-van-popup"
      v-model="showgiftCard"
      get-container="#app"
      round
      position="bottom"
      closeable
    >
      <div class="gift-wrap">
        <div class="swiper-box">
          <div class="van-swipe-item">
            <div
              v-for="(secItem, secIndex) in filterGift"
              :key="secIndex"
              class="gift-box"
              :class="{ active: secItem.active, disabledColor: btnDisabled || !currentGift.id }"
            >
              <div class="info">
                <div class="border-1px gift-img" @click="chooseGift(secIndex, secItem)">
                  <img
                    v-if="
                      secItem.source_status == 1 ||
                      (secItem.source_status == 0 &&
                        ['赞', '鼓掌', '掌声', '鲜花'].includes(secItem.name))
                    "
                    :src="`${secItem.image_url}`"
                    alt
                  />
                  <img
                    v-else
                    :src="require('@/app-shared/assets/img/wap/chat/assetsMap')(secItem.name)"
                    alt
                  />
                </div>
                <p class="title" v-show="!secItem.active">{{ $tdefault(secItem.name) }}</p>
                <p class="money" :class="{ free: secItem.price == 0 }">
                  <!-- TODO:支付牌照问题 -->
                  <!-- {{
                    secItem.price == 0
                      ? $t('interact_tools.interact_tools_1058')
                      : `￥${secItem.price}`
                  }} -->
                </p>
              </div>
              <div v-show="secItem.active" @click="giveGiftSubmit" class="btn">
                {{ $t('interact_tools.interact_tools_1030') }}
                <span v-if="btnDisabled">{{ `${timer}s` }}</span>
              </div>
            </div>
            <div class="block" v-if="filterGift.length > 8"></div>
          </div>
        </div>
      </div>
    </van-popup>
  </section>
</template>

<script>
  import { useGiftsServer, useMsgServer, useChatServer } from 'middle-domain';
  export default {
    name: 'gift',
    data() {
      return {
        giftList: [],
        currentGift: {},
        showgiftCard: false,
        popHeight: '67.8%',
        btnDisabled: false,
        timer: 3,
        handlerTimer: null,
        selectTimer: null, //发送礼物用来防抖的定时器
        queryGiftsFlag: false
      };
    },
    props: {
      joinInfoInGift: {
        required: false
      },
      isEmbed: {
        require: false
      },
      localRoomInfo: {
        required: false
      }
    },
    computed: {
      filterGift: function () {
        let source = this.giftList;
        if (this.isEmbed) {
          source = source.filter(item => item.price === '0');
        }
        return source;
      },
      isSmallPlayer() {
        return this.$domainStore.state.playerServer.isSmallPlayer;
      },
      watchInitData() {
        return this.$domainStore.state.roomBaseServer.watchInitData;
      }
    },
    // watch: {
    //   isSmallPlayer() {
    //     this.setSetingHeight();
    //   }
    // },
    beforeCreate() {
      this.giftsServer = useGiftsServer();
      this.msgServer = useMsgServer();
      this.chatServer = useChatServer();
    },
    beforeDestroy() {
      this.timer = 3;
      this.handlerTimer = null;
    },
    mounted() {
      // this.showgift();
      this.giftsServer.$on('gift_send_success', msg => {
        console.log('VmpWapRewardEffect-------->', JSON.stringify(msg));
        const nickname = msg.data.gift_user_nickname || msg.data.nickname;
        const data = {
          nickname: nickname.length > 8 ? nickname.substr(0, 8) + '...' : nickname,
          avatar: msg.data.avatar,
          content: {
            gift_name: msg.data.gift_name,
            gift_url: `${msg.data.gift_image_url || msg.data.gift_url}`,
            source_status: msg.data.source_status
          },
          roleName: 2,
          type: 'gift_send_success',
          interactToolsStatus: true
        };
        this.chatServer.addChatToList(data);
      });
    },
    methods: {
      // 获取礼物列表
      getList() {
        this.giftsServer
          .queryGiftsList({
            room_id: this.localRoomInfo.roomId
          })
          .then(res => {
            if (res.data && res.data.list) {
              for (const iterator of res.data.list) {
                iterator.active = false;
              }
              this.giftList = res.data.list;
              this.queryGiftsFlag = true;
            }
          });
      },
      swiperChange() {
        this.filterGift.forEach(ele => {
          ele.forEach(item => {
            item.active = false;
          });
        });
      },
      // 选择礼物
      chooseGift(index, currentItem) {
        this.currentGift = currentItem;
        for (const iterator of this.filterGift) {
          iterator.active = false;
        }
        currentItem.active = true;
        console.log(this.currentGift);
      },
      /**
       * @param {Number} pay_type- 1位支付宝 3微信
       * @return 返回 code：200，
       * data：{  下面两个参数必有且只存在其一，jsApiParameters代表本页面唤起微信支付，前提是页面做了微信授权，url代表需要跳转页面支付
       * jsApiParameters:{}
       * url:''}
       */
      // 支付接口
      // payProcess(params) {
      //   const that = this;
      //   this.giftsServer.sendGift({ ...params }, this.currentGift).then(res => {
      //     if (res.data && res.code == 200) {
      //       if (res.data.price == 0) {
      //         this.$toast(this.$t('interact_tools.interact_tools_1063'));
      //         this.close();
      //         return;
      //       }
      //       if (isWechat()) {
      //         WeixinJSBridge.invoke(
      //           'getBrandWCPayRequest',
      //           {
      //             appId: res.data.data.pay_data.appId,
      //             timeStamp: String(res.data.data.pay_data.timeStamp), // 支付签名时间戳，注意微信jssdk中的所有使用timestamp字段均为小写。但最新版的支付后台生成签名使用的timeStamp字段名需大写其中的S字符
      //             nonceStr: res.data.data.pay_data.nonceStr, // 支付签名随机串，不长于 32 位
      //             package: res.data.data.pay_data.package, // 统一支付接口返回的prepay_id参数值，提交格式如：prepay_id=\*\*\*）
      //             signType: res.data.data.pay_data.signType, // 签名方式，默认为'SHA1'，使用新版支付需传入'MD5'
      //             paySign: res.data.data.pay_data.paySign // 支付签名
      //           },
      //           function (res) {
      //             console.log(res, 'getBrandWCPayRequest');
      //             if (res.err_msg == 'get_brand_wcpay_request:ok') {
      //               that.$toast(this.$t('common.common_1005'));
      //               that.btnDisabled = true;
      //               that.close();
      //               if (that.handlerTimer) clearInterval(that.handlerTimer);
      //               that.handlerTimer = setInterval(() => {
      //                 if (that.timer <= 0) {
      //                   clearInterval(that.handlerTimer);
      //                   that.handlerTimer = null;
      //                   that.timer = 3;
      //                   that.btnDisabled = false;
      //                   return;
      //                 }
      //                 that.timer--;
      //               }, 1000);
      //             }
      //           }
      //         );
      //       } else {
      //         window.location.href = res.data.data.pay_data.url;
      //       }
      //     }
      //   });
      // },
      /**
       * 赠送礼物
       */
      giveGiftSubmit() {
        if (this.btnDisabled || !this.currentGift.id) {
          return;
        }
        this.close();
        // 免费礼物不需要登录，付费礼物需要
        if (!this.localRoomInfo.isLogin && Number(this.currentGift.price) > 0) {
          this.$emit('showLogin');
          // EventBus.$emit('showChatLogin');
          return;
        }

        if (!this.currentGift.id) {
          this.$toast(this.$t('interact_tools.interact_tools_1064'));
          return;
        }
        // 如果开启手动加载历史聊天的配置项，并且是嵌入页面，就不会展示付费礼物，并且免费礼物通过聊天消息发送
        // const open_id = sessionStorage.getItem('open_id');
        // let payAuthStatus = 0; //默认支付流程为非授权或授权后
        let params = {
          gift_id: this.currentGift.id,
          channel: 'WEIXIN',
          service_code: 'H5_PAY',
          room_id: this.localRoomInfo.roomId,
          nickname: this.watchInitData.join_info.nickname
        };

        // if (isWechat()) {
        //   if (open_id) {
        //     // 微信正常授权过
        //     params = {
        //       gift_id: this.currentGift.id,
        //       channel: 'WEIXIN',
        //       service_code: 'JSAPI',
        //       room_id: this.localRoomInfo.roomId,
        //       open_id: open_id
        //     };
        //   } else {
        //     // 嵌入页不需要授权
        //     if (
        //       !this.isEmbed &&
        //       this.$domainStore.state.roomBaseServer.configList['ui.hide_wechat'] == 0
        //     ) {
        //       //重新授权
        //       payAuthStatus = 1;
        //       const payUrl = buildPayUrl(this.$route);
        //       authWeixinAjax(this.$route, payUrl, () => {});
        //     } else {
        //       params = {
        //         gift_id: this.currentGift.id,
        //         channel: 'WEIXIN',
        //         service_code: 'H5_PAY',
        //         room_id: this.localRoomInfo.roomId
        //       };
        //     }
        //   }
        // } else {
        //   //如果是企业微信环境,需要启动微信h5支付相关参数
        //   if (isWechatCom()) {
        //     params = {
        //       gift_id: this.currentGift.id,
        //       channel: 'WEIXIN',
        //       service_code: 'H5_PAY',
        //       room_id: this.localRoomInfo.roomId
        //     };
        //   } else {
        //     // 正常的h5支付, 支付宝
        //     params = {
        //       gift_id: this.currentGift.id,
        //       channel: 'ALIPAY',
        //       service_code: 'H5_PAY',
        //       room_id: this.localRoomInfo.roomId
        //     };
        //   }
        // }

        // 如果不需要经过微信授权
        // if (payAuthStatus == 0) {
        if (Number(this.currentGift.price) <= 0) {
          //发送免费礼物
          this.payFree(params);
          // } else {
          //   发送收费礼物
          //   this.payProcess(params);
        }
        // }
      },
      /**
       * 关闭礼物弹框
       */
      close() {
        this.showgiftCard = false;
      },
      /**
       * 计算 设置的弹层高度
       */
      setSetingHeight() {
        let htmlFontSize = document.getElementsByTagName('html')[0].style.fontSize;
        // postcss 换算基数为75 头部+播放器区域高为 522px
        let playerHeight = this.isSmallPlayer == true ? 130 : 422;
        let baseHeight = playerHeight + 71;
        if (this.isEmbed) {
          baseHeight = playerHeight;
        }
        console.log(
          this.$domainStore.state.playerServer.isSmallPlayer,
          this.isSmallPlayer,
          'setPlayerSize'
        );
        this.popHeight =
          document.body.clientHeight - (baseHeight / 75) * parseFloat(htmlFontSize) + 'px';
        // const headerDom = document.getElementById('header');
        // const interactDoc = document.getElementById('interactBox');
        // if (headerDom) {
        //   if (interactDoc) {
        //     this.popHeight =
        //       document.body.clientHeight -
        //       document.getElementById('interactBox').offsetHeight -
        //       headerDom.offsetHeight +
        //       'px';
        //   } else {
        //     this.popHeight =
        //       document.body.clientHeight -
        //       document.getElementById('videoBox').offsetHeight -
        //       headerDom.offsetHeight +
        //       'px';
        //   }
        // } else {
        //   if (interactDoc) {
        //     this.popHeight =
        //       document.body.clientHeight -
        //       document.getElementById('interactBox').offsetHeight +
        //       'px';
        //   } else {
        //     this.popHeight =
        //       document.body.clientHeight - document.getElementById('videoBox').offsetHeight + 'px';
        //   }
        // }
      },
      // open礼物弹框
      showgift() {
        // this.setSetingHeight();
        this.showgiftCard = true;
        // 每次点开礼物弹框的时候，默认礼物图标未选中
        if (this.currentGift) {
          this.currentGift.active = false;
          this.currentGift = {};
        }
        // 如果开启聊天高并发配置项，礼物列表只加载一次。若当前是嵌入页，支持免费礼物，也只加载一次
        if (this.joinInfoInGift.hideChatHistory && this._isNotFirstGetList) {
          return false;
        }
        // 如果礼物列表接口从未调用过
        if (!this.queryGiftsFlag) {
          this.getList();
        }
        this._isNotFirstGetList = true;
      },
      // 免费礼物
      payFree(params) {
        // 如果开启聊天高并发配置项，免费礼物通过聊天消息发送
        if (this.joinInfoInGift.hideChatHistory) {
          const msgData = {
            type: 'permit',
            event_type: 'free_gift_send',
            gift_user_avatar: this.joinInfoInGift.avatar,
            barrageTxt: '',
            text_content: '',
            gift_user_nickname: this.joinInfoInGift.nickname,
            role_name: 2,
            gift_name: this.currentGift.name,
            gift_image_url: this.currentGift.image_url,
            source_status: this.currentGift.source_status
          };
          const context = {
            avatar: this.joinInfoInGift.avatar,
            nickname: this.joinInfoInGift.nickname
          };
          if (this.msgServer) {
            this.msgServer.sendChatMsg(msgData, context);
            //  this.$toast(this.$t('interact_tools.interact_tools_1031'));
            this.close();
            this.btnDisabled = true;
            this.handlerTimer = setInterval(() => {
              if (this.timer <= 0) {
                clearInterval(this.handlerTimer);
                this.handlerTimer = null;
                this.timer = 3;
                this.btnDisabled = false;
                return;
              }
              this.timer--;
            }, 1000);
          }
          return false;
        }
        this.giftsServer.sendGift({ ...params }, this.currentGift).then(res => {
          if (res.code == 200) {
            // this.$toast(this.$t('interact_tools.interact_tools_1031'));
            this.close();
            this.btnDisabled = true;
            this.handlerTimer = setInterval(() => {
              if (this.timer <= 0) {
                clearInterval(this.handlerTimer);
                this.handlerTimer = null;
                this.timer = 3;
                this.btnDisabled = false;
                return;
              }
              this.timer--;
            }, 1000);
          }
        });
      }
    }
  };
</script>
<style lang="less">
  .gift-wrap {
    height: 100%;
    background: linear-gradient(55.94deg, #fdf1ed 9.51%, #f3f2ff 102.75%);
    box-shadow: 0px -2px 10px rgba(0, 0, 0, 0.1);
    padding-top: 70px;
    padding-bottom: 88px;
    .swiper-box {
      max-height: 610px;
      padding: 0 32px;
      overflow-y: auto;
      .van-swipe-item {
        display: grid;
        justify-content: flex-start;
        grid-template-columns: repeat(4, 160px);
        grid-gap: 16px;
      }
      .block {
        height: 270px;
      }
    }
    .gift-box {
      width: 160px;
      height: 220px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      .info {
        margin: 0 auto;
        padding-top: 15px;
        display: flex;
        align-items: center;
        flex-direction: column;
        .gift-img {
          width: 120px;
          height: 120px;
          img {
            width: 100%;
            height: 100%;
            object-fit: scale-down;
          }
        }

        > p {
          text-align: center;
        }
        .title {
          font-size: 24px;
          font-family: PingFangSC;
          font-weight: 400;
          line-height: 24px;
          color: #262626;
          width: 144px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          margin-top: 5px;
        }
        .money {
          font-size: 18px;
          line-height: 24px;
          font-family: PingFangSC;
          font-weight: 400;
          color: #8c8c8c;
          margin-top: 12px;
        }
      }

      &.active {
        border: 2px solid #fb3a32;
        border-radius: 12px;

        &.disabledColor {
          border: 2px solid rgba(251, 58, 50, 0.6);
          .btn {
            background: rgba(251, 38, 38, 0.6);
          }
        }
        .btn {
          width: 100%;
          height: 54px;
          min-height: 54px;
          background: #fb3a32;
          border-radius: 0 0 10px 10px;
          font-size: 28px;
          color: #ffffff;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .money {
          margin-top: 0;
        }
      }
    }
  }
  .gift-van-popup {
    padding-bottom: 0 !important;
  }
</style>

<template>
  <div class="vmp-subscribe-body">
    <div class="vmp-subscribe-body-container">
      <template v-if="isTryVideo">
        <vmp-air-container :cuid="cuid"></vmp-air-container>
      </template>
      <template v-else>
        <template v-if="!showVideo">
          <div class="subscribe-bg">
            <img :src="webinarsBgImg" alt="" />
          </div>
        </template>
        <template v-if="showVideo">
          <vmp-air-container :cuid="cuid"></vmp-air-container>
        </template>
        <template v-if="!showVideo">
          <div class="subscribe-time" v-if="countDownTime && webinarType == 2">
            {{ countDownTime }}
          </div>
          <div class="subscribe-time" v-if="webinarType == 1">{{ $t('webinar.webinar_1017') }}</div>
          <div
            class="subscribe-status"
            :class="`subscribe-status-${webinarType}`"
            v-if="!roomBaseServer.state.embedObj.embedVideo"
          >
            {{
              webinarType == 1
                ? $t('webinar.webinar_1018')
                : webinarType == 2
                ? $t('common.common_1019')
                : webinarType == 3
                ? $t('common.common_1020')
                : webinarType == 4
                ? $t('common.common_1024')
                : $t('common.common_1021')
            }}
          </div>
          <div class="subscribe-language" v-if="languageList.length > 1" @click="openLanguage">
            <span>{{ lang.key == 1 ? '中文' : 'EN' }}</span>
          </div>
        </template>
      </template>
    </div>
    <template v-if="showBottomBtn && subOption.hide_subscribe == 1">
      <div class="vmp-subscribe-body-auth">
        <div
          class="vmp-subscribe-body-auth-two"
          v-if="subOption.verify == 6 && !subOption.is_subscribe && webinarType != 3"
        >
          <span @click="authCheck(4)">{{ $t('appointment.appointment_1011') }}</span>
          ｜
          <span @click="authCheck(3)">{{ $t('webinar.webinar_1024') }} ¥ {{ subOption.fee }}</span>
        </div>
        <div v-else @click="authCheck(subOption.verify)">
          <span>{{ subscribeText }}</span>
        </div>
      </div>
    </template>
    <authBox
      v-if="isSubscribeShow"
      :optionInfo="authInfo"
      @authSubmit="authSubmit"
      @authClose="authClose"
    ></authBox>
    <!-- 弹出直播提醒 -->
    <van-dialog
      use-slot
      v-model="popupLivingStart"
      :title="$t('webinar.webinar_1019')"
      :confirmButtonText="$t('common.common_1010')"
      class="vmp-subscribe-body-dialog"
      @confirm="livingStartConfirm"
      @close="livingCloseConfirm"
    >
      <p>{{ $t('player.player_1018') }}</p>
    </van-dialog>
    <!-- 弹出语言弹窗 -->
    <van-popup v-model="isOpenlang" round position="bottom" class="vmp-subscribe-body-popup">
      <ul>
        <li
          v-for="(item, index) in languageList"
          :key="index"
          class="language-item"
          :class="{ 'popup-active': item.key == lang.key }"
          @click="changeLang(item.key)"
        >
          {{ item.label }}
        </li>
      </ul>
      <p class="language-item" @click="isOpenlang = false">{{ $t('account.account_1063') }}</p>
    </van-popup>

    <!-- 邀请卡浮动按钮 -->
    <button v-if="showInvite && !isEmbed" class="vmp-subscribe-body-invite" @click="gotoInvitePage">
      {{ $t('nav.nav_1015') }}
    </button>
  </div>
</template>
<script>
  import { useRoomBaseServer, useSubscribeServer, usePlayerServer } from 'middle-domain';
  import { boxEventOpitons, isWechat } from '@/packages/app-shared/utils/tool.js';
  import authBox from './components/confirm.vue';
  export default {
    name: 'VmpSubscribeBody',
    data() {
      return {
        showVideo: false, // 显示暖场视频
        isSubscribeShow: false,
        popupLivingStart: false, // 开播提醒
        countDownTime: '',
        subscribeText: '',
        showBottomBtn: true,
        authInfo: {},
        subOption: {
          startTime: '',
          type: 0,
          verify: 0,
          fee: 0,
          verified: 0,
          is_subscribe: 0,
          actual_start_time: '',
          show: 1,
          num: 0,
          hide_subscribe: 1
        },
        isOpenlang: false, // 是否打开多语言弹窗
        lang: {},
        languageList: []
      };
    },
    components: {
      authBox
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
      },
      userInfo() {
        return this.$domainStore.state.userServer.userInfo;
      },
      webinarId() {
        return this.roomBaseServer.state.watchInitData.webinar.id;
      },
      webinarType() {
        return this.roomBaseServer.state.watchInitData.webinar.type;
      },
      // 是否为嵌入页
      isEmbed() {
        return this.$domainStore.state.roomBaseServer.embedObj.embed;
      },
      isTryVideo() {
        return (
          this.roomBaseServer.state.watchInitData.record.preview_paas_record_id &&
          this.$domainStore.state.roomBaseServer.watchInitData.status == 'subscribe'
        );
      },
      /**
       * 展示邀请卡入口（无需区分是否预约成功，只要开启邀请卡即在预约页展示该浮动按钮）
       */
      showInvite() {
        return this.$domainStore.state.roomBaseServer.inviteCard.status == 1;
      }
    },
    beforeCreate() {
      this.roomBaseServer = useRoomBaseServer();
      this.subscribeServer = useSubscribeServer();
      this.playerServer = usePlayerServer();
    },
    created() {
      this.languageList = this.roomBaseServer.state.languages.langList;
      this.lang = this.roomBaseServer.state.languages.lang;
    },
    mounted() {
      this.initPage();
      this.listenEvents();
    },
    methods: {
      listenEvents() {
        this.subscribeServer.$on('live_start', () => {
          this.subOption.type = 1;
          if (this.countDowntimer) clearInterval(this.countDowntimer);
          this.countDownTime = '';
          this.popupLivingStart = true;
          this.subscribeText = this.$t('player.player_1013');
        });

        this.subscribeServer.$on('pay_success', data => {
          if (data.target_id == this.userInfo.user_id) {
            this.$toast(this.$t('common.common_1005'));
            this.livingStartConfirm();
          }
        });

        this.subscribeServer.$on('live_over', () => {
          this.subOption.type = 3;
          this.subscribeText = this.$t('player.player_1017');
        });
      },
      handlerInitInfo() {
        const { webinar, join_info, warmup } = this.roomBaseServer.state.watchInitData;
        this.subOption.type = webinar.type;
        this.subOption.verify = webinar.verify;
        this.subOption.fee = webinar.fee || 0;
        this.subOption.verified = join_info.verified;
        this.subOption.is_subscribe = join_info.is_subscribe;
        this.subOption.reg_form = webinar.reg_form; // 是否开启报名表单
        // 自定义placeholder&&预约按钮是否展示
        this.subOption.verify_tip = webinar.verify_tip;
        this.subOption.hide_subscribe = webinar.hide_subscribe;
        if (webinar.type == 2) {
          // 嵌入页没有预约页
          if (this.isEmbed) {
            this.showBottomBtn = false;
            return;
          }
          if (join_info.is_subscribe == 1) {
            this.subscribeText = this.$t('appointment.appointment_1006');
          } else {
            if (webinar.verify == 3) {
              this.subscribeText = this.$t('webinar.webinar_1040', {
                n: `￥${this.subOption.fee}`
              });
            } else {
              this.subscribeText = this.$t('appointment.appointment_1017');
            }
          }
        } else {
          if (webinar.verify == 3) {
            this.subscribeText = this.$t('webinar.webinar_1041', { n: `￥${this.subOption.fee}` });
          } else {
            this.subscribeText = this.$t('player.player_1013');
          }
        }
        if (join_info.is_subscribe == 1 && warmup.warmup_paas_record_id && webinar.type == 2) {
          this.showVideo = true;
        }
      },
      playerAuthCheck(info) {
        this.authCheck(info.type);
      },
      authCheck(type) {
        if (this.webinarType == 2 && this.subOption.is_subscribe == 1) {
          return false;
        }
        let params = {
          type: type,
          webinar_id: this.webinarId,
          refer: this.$route.query.refer,
          record_id: this.$route.query.record_id,
          visitor_id: this.roomBaseServer.state.watchInitData.visitor_id
        };
        this.subscribeServer.watchAuth(params).then(res => {
          if (res.code == 200) {
            if (res.data.status == 'live') {
              let pageUrl = '';
              if (location.pathname.indexOf('embedclient') != -1) {
                pageUrl = '/embedclient';
              }
              window.location.href =
                window.location.origin +
                process.env.VUE_APP_ROUTER_BASE_URL +
                `/lives${pageUrl}/watch/${this.webinarId}${window.location.search}`;
            } else {
              setTimeout(() => {
                window.location.reload();
              }, 1000);
            }
          } else {
            this.handleAuthErrorCode(res.code, res.msg);
          }
        });
      },
      handleAuthErrorCode(code, msg) {
        let params = {};
        let queryString = '';
        let open_id = '';
        let userId = '';
        switch (code) {
          case 510008: // 未登录
            window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitClickLogin'));
            break;
          case 512525: // 填写表单
            queryString = this.$route.query.refer
              ? `?refer=${this.$route.query.refer}&isIndependent=0`
              : '?isIndependent=0';
            queryString += this.$route.query.invite ? `&invite=${this.$route.query.invite}` : '';
            window.location.href = `${window.location.origin}${process.env.VUE_APP_ROUTER_BASE_URL}/lives/entryform/${this.$route.params.id}${queryString}`;
            break;
          case 512002:
          case 512522:
            setTimeout(() => {
              window.location.reload();
            }, 1500);
            break;
          case 512531:
            // 邀请码
            this.authInfo.title = this.$t('appointment.appointment_1011');
            this.authInfo.placeHolder =
              this.subOption.verify_tip || this.$t('appointment.appointment_1024');
            this.isSubscribeShow = true;
            break;
          case 512528:
            // 密码
            this.authInfo.title = this.$t('form.form_1079');
            this.authInfo.placeHolder =
              this.subOption.verify_tip || this.$t('appointment.appointment_1022');
            this.isSubscribeShow = true;
            break;
          case 512532:
            //白名单
            this.authInfo.title = this.$t('appointment.appointment_1032');
            this.authInfo.placeHolder = this.subOption.verify_tip || this.$t('common.common_1006');
            this.isSubscribeShow = true;
            break;
          case 512523:
            open_id = sessionStorage.getItem('open_id') || '';
            userId = this.userInfo ? this.userInfo.user_id : '';
            if (!open_id && !userId) {
              window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitClickLogin'));
              return;
            }
            if (isWechat() && open_id) {
              // 如果没有open_id 参考wap礼物组件 authWeixinAjax方法 重新获取
              // const open_id = sessionStorage.getItem('open_id');
              params = {
                webinar_id: this.webinarId,
                type: 2,
                service_code: 'JSAPI',
                code: open_id
              };
              this.handlePay(params, 1);
            } else {
              params = {
                webinar_id: this.webinarId,
                type: 1,
                service_code: 'H5_PAY',
                user_id: userId,
                show_url:
                  window.location.origin +
                  process.env.VUE_APP_ROUTER_BASE_URL +
                  `/lives/watch/${this.webinarId}`
              };
              this.handlePay(params, 2);
            }
            break;
          default:
            this.$toast(this.$tec(code) || msg);
            break;
        }
      },
      handlePay(params, flag) {
        this.subscribeServer
          .payWay({ ...params })
          .then(res => {
            if (res.data) {
              if (isWechat() && flag == 1) {
                WeixinJSBridge.invoke(
                  'getBrandWCPayRequest',
                  {
                    appId: res.data.appId,
                    timeStamp: String(res.data.timeStamp), // 支付签名时间戳，注意微信jssdk中的所有使用timestamp字段均为小写。但最新版的支付后台生成签名使用的timeStamp字段名需大写其中的S字符
                    nonceStr: res.data.nonceStr, // 支付签名随机串，不长于 32 位
                    package: res.data.package, // 统一支付接口返回的prepay_id参数值，提交格式如：prepay_id=\*\*\*）
                    signType: res.data.signType, // 签名方式，默认为'SHA1'，使用新版支付需传入'MD5'
                    paySign: res.data.paySign // 支付签名
                  },
                  function (res) {
                    if (res.err_msg == 'get_brand_wcpay_request:ok') {
                      window.location.reload();
                    }
                  }
                );
              } else {
                window.location.href = res.data.link;
              }
            }
          })
          .catch(e => {
            console.log(e, '获取支付信息失败');
          });
      },
      authSubmit(value) {
        let queryString = '';
        let type = this.subOption.verify == 6 ? 4 : this.subOption.verify;
        let params = {
          type: type,
          webinar_id: this.webinarId,
          verify_value: value,
          refer: this.$route.query.refer,
          record_id: this.$route.query.record_id,
          visitor_id: this.roomBaseServer.state.watchInitData.visitor_id
        };
        this.subscribeServer.watchAuth(params).then(res => {
          if (res.code == 200) {
            if (res.data.status == 'live') {
              let pageUrl = '';
              if (location.pathname.indexOf('embedclient') != -1) {
                pageUrl = '/embedclient';
              }
              window.location.href =
                window.location.origin +
                process.env.VUE_APP_ROUTER_BASE_URL +
                `/lives${pageUrl}/watch/${this.webinarId}${window.location.search}`;
            } else {
              setTimeout(() => {
                window.location.reload();
              }, 1000);
            }
          } else if (res.code === 512525) {
            // 填写报名表单
            queryString = this.$route.query.refer
              ? `?refer=${this.$route.query.refer}&isIndependent=0`
              : '?isIndependent=0';
            queryString += this.$route.query.invite ? `&invite=${this.$route.query.invite}` : '';
            window.location.href = `${window.location.origin}${process.env.VUE_APP_ROUTER_BASE_URL}/lives/entryform/${this.$route.params.id}${queryString}`;
          } else {
            this.$toast(this.$tec(res.code) || res.msg);
          }
        });
      },
      authClose() {
        this.isSubscribeShow = false;
      },
      openLanguage() {
        this.isOpenlang = true;
      },
      // 切换多语言
      changeLang(key) {
        this.isOpenlang = false;
        localStorage.setItem('lang', key);
        const params = this.$route.query;
        // 如果地址栏中有语言类型，当切换语言时，对应的地址栏参数要改变
        if (params.lang) {
          params.lang = key;
          let sourceUrl =
            window.location.origin + process.env.VUE_APP_ROUTER_BASE_URL + this.$route.path;
          let queryKeys = '';
          for (const k in params) {
            queryKeys += k + '=' + params[k] + '&';
          }
          queryKeys = queryKeys.substring(0, queryKeys.length - 1);
          sourceUrl = sourceUrl + '?' + queryKeys;
          window.location.href = sourceUrl;
        } else {
          window.location.reload();
        }
      },
      filterText(verify, status) {
        switch (verify) {
          case 0:
            // 免费
            this.subscribeText = status
              ? this.$t('appointment.appointment_1006')
              : this.$t('appointment.appointment_1017');
            break;
          case 1:
            // 密码
            this.subscribeText = status
              ? this.$t('appointment.appointment_1006')
              : this.$t('appointment.appointment_1025');
            break;
          case 2:
            // 白名单
            this.subscribeText = status
              ? this.$t('appointment.appointment_1006')
              : this.$t('appointment.appointment_1025');
            break;
          case 3:
            // 付费
            this.subscribeText = status
              ? this.$t('appointment.appointment_1006')
              : this.$t('webinar.webinar_1024') + '¥' + this.subOption.fee;
            break;
          case 4:
            // 邀请码
            this.subscribeText = status
              ? this.$t('appointment.appointment_1006')
              : this.$t('appointment.appointment_1025');
            break;
        }
      },
      initPage() {
        if (this.webinarType == 3) {
          this.showBottomBtn = false;
          this.countDownTime = 0;
        } else {
          // 不是 活动结束 - 就启动倒计时
          this.sureCountDown();
          this.handlerInitInfo();
        }
      },
      livingStartConfirm() {
        setTimeout(() => {
          window.location.reload();
        }, 300);
      },
      livingCloseConfirm() {
        this.popupLivingStart = false;
        setTimeout(() => {
          window.location.reload();
        }, 300);
      },
      /**
       * 前往邀请卡页面
       */
      gotoInvitePage() {
        const activeId = this.$route.params.id;
        const { join_info } = this.roomBaseServer.state.watchInitData;
        const joinId = join_info.join_id;

        const inviteUrl = `/lives/invite/${activeId}?invite_id=${joinId}`;

        const location = window.location.origin + process.env.VUE_APP_ROUTER_BASE_URL;

        const url = `${location}${inviteUrl}`;

        window.location.href = url;
      },
      /**
       * 倒计时是否开启
       */
      sureCountDown() {
        const { webinar } = this.roomBaseServer.state.watchInitData;
        this.countDowntimer && clearInterval(this.countDowntimer);
        this.countDownTime = '';
        let countDownTime = '';
        if (new Date(webinar.start_time.replace(/-/g, '/')).getTime() - new Date().getTime() > 0) {
          countDownTime = Math.floor(
            (new Date(webinar.start_time.replace(/-/g, '/')).getTime() - new Date().getTime()) /
              1000
          );
        } else {
          countDownTime = 0;
        }
        if (countDownTime) {
          this.countDown(countDownTime);
        }
      },
      /**
       * 倒计时函数
       */
      countDown(times) {
        this.countDowntimer = setInterval(() => {
          let day = 0;
          let hour = 0;
          let minute = 0;
          let second = 0;
          // 时间默认值
          if (times > 0) {
            day = String(Math.floor(times / (60 * 60 * 24))).padStart(2, '0');
            hour = String(Math.floor(times / (60 * 60)) - day * 24).padStart(2, '0');
            minute = String(Math.floor(times / 60) - day * 24 * 60 - hour * 60).padStart(2, '0');
            second = String(
              Math.floor(times) - day * 24 * 60 * 60 - hour * 60 * 60 - minute * 60
            ).padStart(2, '0');
          }
          this.countDownTime =
            day +
            this.$t('appointment.appointment_1026') +
            hour +
            this.$t('appointment.appointment_1027') +
            minute +
            this.$t('appointment.appointment_1028') +
            second +
            this.$t('appointment.appointment_1029');
          times--;
        }, 1000);
        if (times <= 0) {
          clearInterval(this.countDowntimer);
          this.countDownTime = '';
        }
      }
    }
  };
</script>
<style lang="less">
  .vmp-subscribe-body {
    height: 422px;
    width: 100%;
    position: relative;
    z-index: 2;
    &-container {
      height: 100%;
      width: 100%;
      .subscribe-bg {
        width: 100%;
        height: 100%;
        img {
          width: 100%;
          height: 100%;
          object-fit: fill;
        }
      }
      .subscribe-time {
        position: absolute;
        bottom: 0;
        height: 80px;
        background: rgba(0, 0, 0, 0.7);
        font-size: 28px;
        color: #fff;
        text-align: center;
        line-height: 80px;
        width: 100%;
      }
      .subscribe-status {
        position: absolute;
        bottom: -0.293333rem;
        left: 0.4rem;
        padding: 0 0.2rem;
        height: 0.56rem;
        background: #5ea6ec;
        border-radius: 0.053333rem;
        text-align: center;
        font-size: 0.373333rem;
        font-weight: 400;
        color: #fff;
        line-height: 0.56rem;
        font-style: normal;
        &-1 {
          background: #ff3333;
        }
        &-2 {
          background: #1087dc;
        }
        &-3 {
          background: #757575;
        }
        &-4,
        &-5 {
          background: #2ab804;
        }
      }
      .subscribe-language {
        position: absolute;
        bottom: 25px;
        right: 20px;
        z-index: 10;
        color: #fff;
        font-size: 28px;
        cursor: pointer;
      }
    }
    &-auth {
      position: fixed;
      bottom: 0;
      width: 100%;
      height: 100px;
      font-size: 36px;
      font-weight: 500;
      color: #fff;
      line-height: 100px;
      background: #fb3a32;
      text-align: center;
      margin-bottom: env(safe-area-inset-bottom);
      div {
        padding: 0 32px;
      }
      &-two {
        width: 100%;
        display: flex;
        justify-content: space-around;
        align-items: center;
      }
    }
    &-dialog {
      min-height: 360px;
      border-radius: 14px;
      .van-dialog__header {
        font-size: 36px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: rgba(0, 0, 0, 1);
        line-height: 40px;
        padding-top: 40px;
        font-weight: bolder;
      }
      .van-dialog__content {
        height: 184px;
        font-size: 32px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        padding: 68px 0 70px;
        color: #333;
        p {
          text-align: center;
        }
      }
      .van-dialog__confirm {
        font-size: 36px;
        color: #fb3a32;
      }
    }
    &-popup {
      ul {
        display: flex;
        flex-direction: column;
        justify-content: center;
        font-size: 28px;
      }
      .language-item {
        text-align: center;
        height: 100px;
        line-height: 100px;
        width: 100%;
        background: #fff;
        color: #333;
        &.popup-active {
          color: #fb2626;
        }
      }
    }
    &-invite {
      position: fixed;
      z-index: 10;
      display: block;
      right: 0;
      top: 140px;
      width: 152px;
      height: 62px;
      background: linear-gradient(121deg, rgba(246, 208, 63, 1) 0%, rgba(209, 110, 53, 1) 100%);
      box-shadow: 0px 5px 3px 0px rgba(0, 0, 0, 0.5);
      border-radius: 35px 0px 0px 35px;
      font-size: 28px;
      font-weight: 400;
      color: rgba(255, 255, 255, 1);
      line-height: 62px;
      text-align: center;
      animation-fill-mode: forwards;
    }
  }
</style>

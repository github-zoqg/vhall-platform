<template>
  <div class="vmp-subscribe-body">
    <div class="vmp-subscribe-body-container">
      <template v-if="isTryVideo">
        <div class="subscribe-bg">
          <vmp-air-container :cuid="childrenCom[0]" :oneself="true"></vmp-air-container>
        </div>
      </template>
      <template v-else>
        <template v-if="!showVideo">
          <div class="subscribe-bg">
            <img :src="webinarsBgImg" alt="" />
            <div class="living_end" v-if="isLiveEnd">
              <div class="living_end_img">
                <img src="./img/livingEnd@2x.png" alt="" />
              </div>
              <h1 class="living_end_text">{{ $t('player.player_1017') }}</h1>
              <div class="living_end_people" v-if="webinarType != 3">
                <i18n path="appointment.appointment_1018">
                  <span place="n">{{ subOption.num }}</span>
                </i18n>
              </div>
            </div>
            <span class="subscribe-type">
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
            </span>
            <span class="subscribe-language" @click="openLanguage" v-if="languageList.length > 1">
              {{ lang.key == 1 ? 'CN' : 'EN' }}
              <i class="vh-iconfont vh-line-arrow-down"></i>
            </span>
          </div>
        </template>
        <template v-if="showVideo">
          <vmp-air-container :cuid="childrenCom[0]" :oneself="true"></vmp-air-container>
        </template>
      </template>
    </div>
    <div
      class="vmp-subscribe-body-info"
      :class="isEmbed || subOption.hide_subscribe == 1 ? 'vmp-subscribe-body_embed' : ''"
    >
      <div class="subscribe_into" v-if="!isLiveEnd">
        <template v-if="webinarType == 1 || webinarType == 2">
          <time-down ref="timeDowner"></time-down>
        </template>
        <template v-else>
          <p class="vod_title">直播回放中</p>
        </template>
        <div class="subscribe_into_container" v-if="subOption.hide_subscribe == 1">
          <div class="subscribe_into_other" v-if="showSubscribeBtn">
            <span @click="authCheck(4)">{{ $t('appointment.appointment_1011') }}</span>
            <span @click="authCheck(3)">
              {{ $t('webinar.webinar_1024') }} ¥ {{ subOption.fee }}
            </span>
          </div>
          <div
            class="subscribe_into_person"
            v-else-if="subOption.needAgreement"
            @click="showAgreement"
          >
            <span class="subscribe_btn">{{ $t('appointment.appointment_1025') }}</span>
          </div>
          <div
            v-else
            :class="[
              'subscribe_into_person',
              {
                isSubscribe: subOption.is_subscribe == 1
              }
            ]"
            @click="authCheck(subOption.verify)"
          >
            <span class="subscribe_btn">
              {{ subscribeText }}
            </span>
          </div>
        </div>
      </div>
      <div :class="isScorllTab ? 'subscribe_tabs' : ''">
        <vmp-air-container :cuid="childrenCom[1]" :oneself="true"></vmp-air-container>
      </div>
    </div>
    <template v-if="showBottomBtn && subOption.hide_subscribe == 1">
      <div class="vmp-subscribe-body-auth">
        <div class="subscribe_into_other" v-if="showSubscribeBtn">
          <span @click="authCheck(4)">{{ $t('appointment.appointment_1011') }}</span>
          <span @click="authCheck(3)">{{ $t('webinar.webinar_1024') }} ¥ {{ subOption.fee }}</span>
        </div>
        <div
          class="subscribe_into_person"
          v-else-if="subOption.needAgreement"
          @click="showAgreement"
        >
          <span class="subscribe_btn">{{ $t('appointment.appointment_1025') }}</span>
        </div>
        <div
          v-else
          :class="[
            'subscribe_into_person',
            {
              isSubscribe: subOption.is_subscribe == 1
            }
          ]"
          @click="authCheck(subOption.verify)"
        >
          <span class="subscribe_btn">
            {{ subscribeText }}
          </span>
        </div>
      </div>
    </template>
    <alertBox
      v-if="isSubscribeShow"
      :title="$t('appointment.appointment_1020')"
      :width="'100%'"
      @authSubmit="authSubmit"
      @authClose="authClose"
    >
      <div slot="content" class="vmp-subscribe-body_input">
        <input
          :type="`${isHidden ? 'password' : 'text'}`"
          v-model="textAuth"
          :placeHolder="authInfo.placeHolder"
        />
        <i
          :class="`vh-iconfont ${isHidden ? 'vh-line-hidden' : 'vh-line-view'}`"
          @click="isHidden = !isHidden"
        ></i>
      </div>
    </alertBox>
    <!-- 弹出直播提醒 -->
    <alertBox
      v-if="popupLivingStart"
      :title="''"
      :titleBtn="$t('player.player_1013')"
      @authClose="livingCloseConfirm"
      @authSubmit="livingStartConfirm"
    >
      <div slot="content" class="vmp-subscribe-body_living">
        <span class="living-img">
          <img src="./img/live_start.png" alt="" />
        </span>
        <p class="living-text">{{ $t('player.player_1018') }}</p>
      </div>
    </alertBox>
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
      <!-- <p class="language-item" @click="isOpenlang = false">{{ $t('account.account_1063') }}</p> -->
    </van-popup>

    <!-- 邀请卡浮动按钮 -->
    <button v-if="showInvite && !isEmbed" class="vmp-subscribe-body-invite" @click="gotoInvitePage">
      {{ $t('nav.nav_1015') }}
    </button>
  </div>
</template>
<script>
  import { useRoomBaseServer, useSubscribeServer, usePlayerServer } from 'middle-domain';
  import {
    boxEventOpitons,
    isWechat,
    isWechatCom,
    getQueryString
  } from '@/packages/app-shared/utils/tool.js';
  import { authWeixinAjax, buildPayUrl } from '@/packages/app-shared/utils/wechat';
  import TimeDown from './components/timeDown.vue';
  import alertBox from '@/saas-wap/views/components/confirm.vue';
  export default {
    name: 'VmpSubscribeBody',
    data() {
      return {
        showVideo: false, // 显示暖场视频
        isSubscribeShow: false,
        popupLivingStart: false, // 开播提醒
        subscribeText: '',
        showBottomBtn: false,
        isScorllTab: false,
        authInfo: {},
        textAuth: '',
        isHidden: true,
        isLiveEnd: false,
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
          hide_subscribe: 0,
          needAgreement: false
        },
        isOpenlang: false, // 是否打开多语言弹窗
        lang: {},
        languageList: []
      };
    },
    components: {
      TimeDown,
      alertBox
    },
    computed: {
      /**
       * 观看协议展示条件
       * 非单视频嵌入
       * 直播 type == 1
       */
      showViewRestriction() {
        const agreement = this.subOption.needAgreement;
        const isEmbed = this.roomBaseServer.state.embedObj.embedVideo;
        const isLive = this.webinarType == 1 || this.webinarType == 5;
        if (agreement && !isEmbed && isLive) {
          return true;
        } else {
          return false;
        }
      },
      showSubscribeBtn() {
        if (this.subOption.verify == 6 && !this.subOption.is_subscribe && this.webinarType != 3) {
          return true;
        } else {
          return false;
        }
      },
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
      // 是否为完全嵌入页
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
      this.childrenCom = window.$serverConfig[this.cuid].children;
      this.languageList = this.roomBaseServer.state.languages.langList;
      this.lang = this.roomBaseServer.state.languages.lang;
    },
    mounted() {
      this.initPage();
      this.listenEvents();
      this.handleScroll();
    },
    methods: {
      handleScroll() {
        let dom = document.querySelector('.vmp-subscribe-body-info');
        dom.addEventListener('scroll', e => {
          let scrollTop = e.target.scrollTop;
          // console.log(scrollTop);
          if (this.subOption.hide_subscribe == 0) {
            this.isScorllTab = scrollTop >= 85 ? true : false;
          } else {
            this.showBottomBtn = scrollTop >= 100 ? true : false;
            this.isScorllTab = scrollTop >= 150 ? true : false;
          }
        });
      },
      listenEvents() {
        this.subscribeServer.$on('live_start', () => {
          this.subOption.type = 1;
          this.popupLivingStart = true;
          this.$refs.timeDowner.changeTime();
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
          this.showBottomBtn = false;
          this.$refs.timeDowner.clearTimer();
          this.subscribeText = this.$t('player.player_1017');
        });
      },
      handlerInitInfo() {
        const { webinar, join_info, warmup, agreement, subscribe } =
          this.roomBaseServer.state.watchInitData;
        this.subOption.type = webinar.type;
        this.subOption.verify = webinar.verify;
        this.subOption.fee = webinar.fee || 0;
        this.subOption.verified = join_info.verified;
        this.subOption.is_subscribe = join_info.is_subscribe;
        this.subOption.reg_form = webinar.reg_form; // 是否开启报名表单
        // 自定义placeholder&&预约按钮是否展示
        this.subOption.verify_tip = webinar.verify_tip;
        // this.subOption.hide_subscribe = webinar.hide_subscribe;
        if (webinar.type == 2 && subscribe.show == 1) {
          this.subOption.num = subscribe.num;
        }
        if (
          agreement &&
          agreement.is_open === 1 &&
          agreement.is_agree !== 1 &&
          webinar.type !== 2 &&
          webinar.type !== 3 &&
          !this.roomBaseServer.state?.embedObj?.embedVideo
        ) {
          // 预约和结束状态不显示,视频嵌入页不显示
          // 当开启观看协议且没有通过时,需要显示观看验证(观看协议)
          this.subOption.needAgreement = true;
        }
        // 如果是嵌入页并且没有开播，预约按钮不显示
        if (this.isEmbed && this.webinarType == 2) {
          this.subOption.hide_subscribe == 0;
          this.showBottomBtn = false;
          return;
        } else {
          this.subOption.hide_subscribe = webinar.hide_subscribe;
        }
        if (webinar.type == 2) {
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
        if (
          (this.webinarType == 2 && this.subOption.is_subscribe == 1) ||
          this.subOption.type == 3
        ) {
          return false;
        }
        let params = {
          type: type,
          webinar_id: this.webinarId,
          visitor_id: this.roomBaseServer.state.watchInitData.visitor_id,
          ...this.$route.query
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
        let shareId = getQueryString('shareId');
        let share_id = getQueryString('share_id');
        switch (code) {
          case 510008: // 未登录
            window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitClickLogin'));
            break;
          case 512525: // 填写表单
            queryString = this.$route.query.refer
              ? `?refer=${this.$route.query.refer}&isIndependent=0`
              : '?isIndependent=0';
            //  微博分享时携带的入参 - 优化设置了报名表单但是未参会时，调用接口无效,shareId未携带问题。
            if (queryString.indexOf('?') != -1) {
              queryString += share_id ? `&share_id=${share_id}` : '';
              queryString += shareId ? `&shareId=${shareId}` : '';
            } else if (queryString.indexOf('?') == -1 && share_id) {
              queryString += share_id ? `?share_id=${share_id}` : '';
            } else if (queryString.indexOf('?') == -1 && shareId) {
              queryString += shareId ? `?shareId=${shareId}` : '';
            }
            // 邀请卡分享
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
            // this.authInfo.title = this.$t('appointment.appointment_1011');
            this.authInfo.placeHolder =
              this.subOption.verify_tip || this.$t('appointment.appointment_1024');
            this.isSubscribeShow = true;
            break;
          case 512528:
            // 密码
            // this.authInfo.title = this.$t('form.form_1079');
            this.authInfo.placeHolder =
              this.subOption.verify_tip || this.$t('appointment.appointment_1022');
            this.isSubscribeShow = true;
            break;
          case 512532:
            //白名单
            // this.authInfo.title = this.$t('appointment.appointment_1032');
            this.authInfo.placeHolder = this.subOption.verify_tip || this.$t('common.common_1006');
            this.isSubscribeShow = true;
            break;
          case 512523:
            this.webinarPayAuth();
            break;
          default:
            this.$toast(this.$tec(code) || msg);
            break;
        }
      },
      webinarPayAuth() {
        const open_id = sessionStorage.getItem('open_id');
        let params = {};
        let payAuthStatus = 0; //默认支付流程为非授权或授权后
        const userId = this.userInfo ? this.userInfo.user_id : '';
        if (!open_id && !userId) {
          window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitClickLogin'));
          return;
        }

        if (isWechat()) {
          // 微信正常授权过
          if (open_id) {
            params = {
              webinar_id: this.webinarId,
              type: 2, // 1-支付宝，2-微信
              service_code: 'JSAPI',
              code: open_id
            };
          } else {
            //重新授权
            payAuthStatus = 1;
            const payUrl = buildPayUrl(this.$route);
            authWeixinAjax(this.$route, payUrl, () => {});
          }
        } else {
          //如果是企业微信环境
          if (isWechatCom()) {
            params = {
              webinar_id: this.webinarId,
              type: 2, //1-支付宝，2-微信
              service_code: 'H5_PAY', //支付方式 H5_PAY JSAPI
              user_id: userId,
              show_url:
                window.location.origin +
                process.env.VUE_APP_ROUTER_BASE_URL +
                `/lives/watch/${this.webinarId}`
            };
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
          }
        }

        if (payAuthStatus == 0) {
          this.newHandlePay(params);
        }
      },
      newHandlePay(params) {
        const that = this;
        this.subscribeServer
          .payWay({ ...params })
          .then(res => {
            if (res.code == 200) {
              if (isWechat()) {
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
            } else {
              that.$toast(`${that.$tec(res.code) || res.msg}`);
            }
          })
          .catch(e => {
            console.log(e, '获取支付信息失败');
            that.$toast(`${that.$tec(e.code) || e.msg}`);
          });
      },
      authSubmit() {
        let queryString = '';
        let type = this.subOption.verify == 6 ? 4 : this.subOption.verify;
        let share_id = getQueryString('share_id');
        let shareId = getQueryString('share_id');
        let params = {
          type: type,
          webinar_id: this.webinarId,
          verify_value: this.textAuth,
          visitor_id: this.roomBaseServer.state.watchInitData.visitor_id,
          ...this.$route.query
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
            // 开启了报名表单的时候，需要跳转至报名表单界面，这个时候还没有参会
            queryString = this.$route.query.refer
              ? `?refer=${this.$route.query.refer}&isIndependent=0`
              : '?isIndependent=0';
            //  微博分享时携带的入参 - 优化设置了报名表单但是未参会时，调用接口无效,shareId未携带问题。
            if (queryString.indexOf('?') != -1) {
              queryString += share_id ? `&share_id=${share_id}` : '';
              queryString += shareId ? `&shareId=${shareId}` : '';
            } else if (queryString.indexOf('?') == -1 && share_id) {
              queryString += share_id ? `?share_id=${share_id}` : '';
            } else if (queryString.indexOf('?') == -1 && shareId) {
              queryString += shareId ? `?shareId=${shareId}` : '';
            }
            // 邀请卡
            queryString += this.$route.query.invite ? `&invite=${this.$route.query.invite}` : '';
            window.location.href = `${window.location.origin}${process.env.VUE_APP_ROUTER_BASE_URL}/lives/entryform/${this.$route.params.id}${queryString}`;
          } else {
            this.$toast(this.$tec(res.code) || res.msg);
          }
        });
      },
      authClose() {
        this.isSubscribeShow = false;
        this.textAuth = '';
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
      initPage() {
        if (this.webinarType == 3) {
          this.showBottomBtn = false;
          this.isLiveEnd = true;
        } else {
          //  活动信息
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
      showAgreement() {
        this.roomBaseServer.$emit('POPUP_AGREEMENT');
      },
      // 同意观看协议后回调
      handleAgreeWitthTerms() {
        this.subOption.needAgreement = false;
        const type = this.subOption.verify == 6 ? 4 : this.subOption.verify;
        this.authCheck(type);
      }
    }
  };
</script>
<style lang="less">
  .vmp-subscribe-body {
    height: 100%;
    width: 100%;
    position: relative;
    z-index: 2;
    &-container {
      height: 422px;
      width: 100%;
      position: relative;
      .subscribe-bg {
        width: 100%;
        height: 100%;
        img {
          width: 100%;
          height: 100%;
          object-fit: fill;
        }
        .subscribe-type {
          position: absolute;
          top: 28px;
          left: 32px;
          display: inline-block;
          padding: 8px 15px;
          text-align: center;
          color: #fff;
          background: rgba(0, 0, 0, 0.5);
          border-radius: 30px;
          font-size: 24px;
        }
        .subscribe-language {
          position: absolute;
          right: 32px;
          top: 28px;
          width: 80px;
          cursor: pointer;
          display: block;
          height: 36px;
          padding: 0 5px;
          border-radius: 24px;
          background: rgba(0, 0, 0, 0.5);
          text-align: center;
          line-height: 36px;
          font-size: 24px;
          font-family: PingFangSC-Medium, PingFang SC;
          color: #fff;
          i {
            font-size: 10px;
          }
        }
        .living_end {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          width: 100%;
          height: 100%;
          position: absolute;
          top: 0;
          left: 0;
          &_img {
            width: 141px;
            height: 104px;
            margin-bottom: 15px;
            img {
              width: 100%;
              height: 100%;
              object-fit: scale-down;
            }
          }
          &_text,
          &_people {
            font-size: 28px;
            line-height: 50px;
            height: 50px;
            color: #fff;
            padding-left: 25px;
            font-weight: 400;
          }
          &_people {
            font-size: 22px;
            line-height: 28px;
          }
        }
      }
    }
    &-info {
      height: 100%;
      overflow-y: auto;
      width: 100%;
      &.vmp-subscribe-body_embed {
        height: calc(100% - 422px);
      }
      background: #f2f2f2;
      .subscribe_into {
        background: #fff;
        padding: 40px 0;
        margin-bottom: 16px;
        .vod_title {
          width: 100%;
          text-align: center;
          margin-bottom: 32px;
          font-weight: 500;
          color: #262626;
          font-size: 36px;
        }
      }
      .subscribe_tabs {
        height: 100%;
      }
    }
    .subscribe_into_person {
      width: 520px;
      margin: 0 auto;
      margin-top: 32px;
      height: 90px;
      background: #fb3a32;
      border-radius: 50px;
      color: #fff;
      text-align: center;
      .subscribe_btn {
        line-height: 90px;
        font-size: 32px;
      }
      &.isSubscribe {
        background: #fff;
        border: 1px solid #fb3a32;
        color: #fb3a32;
      }
    }
    .subscribe_into_other {
      border-radius: 50px;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding: 0 85px;
      span {
        display: inline-block;
        width: 280px;
        height: 90px;
        line-height: 90px;
        text-align: center;
        border-radius: 50px;
        background: #fb3a32;
      }
    }
    &-auth {
      position: fixed;
      bottom: 32px;
      width: 100%;
      height: 90px;
      z-index: 20;
      margin-bottom: env(safe-area-inset-bottom);
    }
    &_input {
      width: 100%;
      border: 2px solid #d9d9d9;
      border-radius: 8px;
      height: 80px;
      font-size: 28px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      input {
        width: 92%;
        padding: 0 12px;
        font-size: 28px;
        &::-webkit-input-placeholder {
          color: #bfbfbf;
        }
      }
      .vh-iconfont {
        display: inline-block;
        width: 8%;
        font-size: 28px;
        color: #8c8c8c;
      }
    }
    &_living {
      width: 100%;
      background: #ffffff;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      .living-img {
        display: inline-block;
        width: 160px;
        height: 160px;
        img {
          width: 100%;
          height: 100%;
          object-fit: scale-down;
        }
      }
      .living-text {
        padding-top: 20px;
        color: #262626;
        font-size: 28px;
        line-height: 40px;
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
      z-index: 13;
      display: block;
      right: 0;
      top: 180px;
      width: 115px;
      height: 56px;
      background: linear-gradient(139.05deg, #8f66ff 8.09%, rgba(249, 51, 249, 0.8) 95.91%);
      box-shadow: 0px 5px 3px 0px rgba(0, 0, 0, 0.5);
      border-radius: 35px 0px 0px 35px;
      font-size: 28px;
      font-weight: 400;
      color: rgba(255, 255, 255, 1);
      line-height: 56px;
      text-align: center;
      animation-fill-mode: forwards;
    }
  }
</style>

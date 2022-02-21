<template>
  <div class="vmp-header-watch">
    <div class="vmp-header-watch-left">
      <!-- 品牌设置-标识图片 -->
      <div
        class="vmp-header-watch-left-logo"
        v-if="webinarTag && webinarTag.view_status == 1"
        @click="goLogoUrl"
      >
        <img
          :src="webinarTag && webinarTag.logo_url ? webinarTag.logo_url : defaultLogoUrl"
          alt=""
        />
      </div>
    </div>
    <div class="vmp-header-watch-center">
      <div class="vmp-header-watch-center-title">
        {{ webinarInfo.subject | splitLenStr(40) }}
        <span
          v-if="webinarInfo.type != 6"
          :class="
            'vmp-header-watch-center-title-tags vmp-header-watch-center-title-tags_' +
            webinarInfo.type
          "
        >
          <img v-if="webinarInfo.type == 1" src="./images/live-white.gif" alt="" />
          <label>{{ webinarInfo.type | webinarFilter }}</label>
        </span>
        <span
          v-if="webinarInfo.type != 6 && webinarInfo.no_delay_webinar == 1"
          class="vmp-header-watch-center-title-delay"
        >
          <img :src="noDelayIconUrl" alt="" />
        </span>
      </div>
      <div class="vmp-header-watch-center-host">
        <a
          :href="create_user_url"
          v-if="webinarTag && webinarTag.organizers_status == 1"
          :target="create_user_url == 'javascript:void(0);' ? '_self' : '_blank'"
        >
          {{ $t('nav.nav_1001') }}：{{ webinarInfo.userinfo.nickname }}
        </a>
        <span>{{ webinarInfo.start_time }}</span>
      </div>
    </div>
    <div class="vmp-header-watch-right">
      <!-- 多语言 -->
      <vmp-air-container :cuid="childrenComp[0]" :oneself="true"></vmp-air-container>

      <!-- 公众号 -->
      <div class="vmp-header-watch-right-officical" v-if="officialImg">
        <div
          :class="'vmp-header-watch-right-officical-icon ' + themeClass.iconClass"
          :style="{ color: themeClass.pageBg }"
          @click="goOfficical"
        >
          <i class="vh-saas-iconfont vh-saas-line-public"></i>
          <p>{{ $t('nav.nav_1002') }}</p>
        </div>
      </div>

      <!-- 关注 -->
      <div
        class="vmp-header-watch-right-attention"
        v-if="webinarTag && webinarTag.organizers_status == 1 && webinarInfo.type != 6"
      >
        <div
          :class="'vmp-header-watch-right-attention-icon ' + themeClass.iconClass"
          :style="{ color: themeClass.pageBg }"
          @click="attentionHandler"
        >
          <i
            :class="`vh-iconfont ${
              isAttention ? 'vh-a-line-collectionsuccess' : 'vh-line-collection'
            }`"
          ></i>
          <!-- <i class="vh-iconfont vh-line-collection vh-a-line-collectionsuccess"></i> -->
          <p>{{ isAttention ? $t('nav.nav_1003') : $t('nav.nav_1004') }}</p>
        </div>
      </div>
      <!-- <vmp-air-container :cuid="childrenComp[1]" :oneself="true"></vmp-air-container> -->

      <!-- 分享 -->
      <div class="vmp-header-watch-right-share">
        <div
          :class="'vmp-header-watch-right-share-icon ' + themeClass.iconClass"
          :style="{ color: themeClass.pageBg }"
          @click="goShare"
        >
          <i class="vh-iconfont vh-line-share"></i>
          <p>{{ $t('nav.nav_1013') }}</p>
        </div>
      </div>

      <officaial-dialog
        ref="officaialDialog"
        :officicalInfo="officicalInfo"
        :screenPosterInfo="screenPosterInfo"
        v-if="officialImg"
      ></officaial-dialog>
      <!-- 登录、基础信息 -->
      <div class="vmp-header-watch-right-login">
        <div class="vmp-header-watch-right-login-unuser" @click="goLogin" v-if="!isLogin">
          <p><img src="./images/my-dark@2x.png" alt="" /></p>
          <span>{{ $t('nav.nav_1005') }}</span>
        </div>
        <div class="vmp-header-watch-right-login-user" v-else>
          <div class="vmp-header-watch-right-login-user-dropdown">
            <p>
              <img v-if="userInfo.avatar" :src="userInfo.avatar" alt="" />
              <img v-else src="./images/my-dark@2x.png" alt="" />
            </p>
            <span>{{ userInfo.nick_name | splitLenStr(8) }}</span>
            <div class="vmp-header-watch-right-login-user-list">
              <ul>
                <li @click="goUserInfo">
                  <i class="vh-iconfont vh-line-account"></i>
                  {{ $t('account.account_1001') }}
                </li>
                <li @click="goCashInfo">
                  <i class="vh-iconfont vh-a-line-financialcenter"></i>
                  {{ $t('nav.nav_1028') }}
                </li>
                <li @click="exitLogin">
                  <i class="vh-iconfont vh-line-exit"></i>
                  {{ $t('nav.nav_1011') }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  import { useRoomBaseServer, useAttentionServer, useUserServer } from 'middle-domain';
  import { boxEventOpitons } from '@/packages/app-shared/utils/tool.js';
  import officaialDialog from './components/officalDialog.vue';
  export default {
    name: 'VmpHeaderWatch',
    data() {
      return {
        noDelayIconUrl:
          '//cnstatic01.e.vhall.com/saas-v3/static/common/img/nodelay-icon/v1.0.0/pc/delay-icon_zh-CN.png',
        defaultLogoUrl: require('./images/logo-red@2x.png'),
        webinarInfo: {}, //活动的信息
        skinInfo: {}, //皮肤的信息
        webinarTag: {}, // 活动标识
        screenPosterInfo: {}, // 开屏海报
        officicalInfo: {}, //公众号
        officialImg: '',
        // userInfo: JSON.parse(window.localStorage.getItem('userInfo')) || {}, // 用户登录之后的信息
        themeClass: {
          bgColor: 'light',
          pageBg: '#cccccc',
          iconClass: 'icon-default' // icon默认色
        },
        isAttention: false,
        isLogin: Boolean(window.localStorage.getItem('token'))
      };
    },
    filters: {
      webinarFilter(val) {
        // const webinarArr = [
        //   this.$t('common.common_1018'),
        //   this.$t('common.common_1019'),
        //   this.$t('common.common_1020'),
        //   this.$t('common.common_1024'),
        //   this.$t('common.common_1021')
        // ];
        const webinarArr = ['直播', '预告', '结束', '点播', '回放'];
        return webinarArr[val - 1];
      },
      splitLenStr(name, len) {
        return name && name.length > len ? name.substring(0, len) + '...' : name;
      }
    },
    components: {
      officaialDialog
    },
    computed: {
      create_user_url() {
        const { watchInitData } = this.roomBaseState;
        if (watchInitData && watchInitData.urls && this.webinarInfo) {
          const url = watchInitData.urls.web_url || '';
          if (url.split('')[url.length - 1] == '/') {
            return watchInitData.urls.web_url + 'user/home/' + this.webinarInfo.userinfo.user_id;
          } else {
            return watchInitData.urls.web_url + '/user/home/' + this.webinarInfo.userinfo.user_id;
          }
        } else {
          return 'javascript:void(0);';
        }
      },
      isNotEmbed() {
        return this.embedObj
          ? !!(this.embedObj.embed == false && this.embedObj.embedVideo == false)
          : true;
      },
      userInfo() {
        return this.$domainStore.state.userServer.userInfo;
      }
    },
    beforeCreate() {
      this.roomBaseServer = useRoomBaseServer();
      this.attentionServer = useAttentionServer();
      this.userServer = useUserServer();
    },
    async created() {
      this.childrenComp = window.$serverConfig[this.cuid].children;
      this.roomBaseState = this.roomBaseServer.state;
      this.embedObj = this.roomBaseState.embedObj;
      if (this.isLogin && this.isNotEmbed) {
        // 通过活动ID，获取关注信息
        await this.attentionStatus();
      }
      this.getWebinarInfo();
    },
    methods: {
      getWebinarInfo() {
        const { webinar } = this.roomBaseState.watchInitData;
        this.webinarInfo = webinar || {};
        this.skinInfo = this.roomBaseState.skinInfo || {};
        this.webinarTag = this.roomBaseState.webinarTag || {};
        this.officicalInfo = this.roomBaseState.officicalInfo || {};
        this.screenPosterInfo = this.roomBaseState.screenPosterInfo || {};
        this.setOfficicalInfo(this.officicalInfo);
        this.setSkinInfo(this.skinInfo);
      },
      // 关注状态
      attentionStatus() {
        let params = {
          at_id: this.userInfo.user_id,
          type: 1 // 关注人
        };
        this.attentionServer.getAttentionStatus(params).then(res => {
          this.isAttention = Boolean(res.data.result);
        });
      },
      attentionHandler() {
        if (!this.isLogin) {
          this.goLogin();
          return;
        }
        if (this.timer) clearTimeout(this.timer);
        this.timer = setTimeout(() => {
          if (this.isAttention) {
            this.attentionServer
              .cancelAttention({
                at_id: this.userInfo.user_id, // 被关注ID
                type: 1
              })
              .then(res => {
                if (res.code == 200) {
                  this.$message({
                    message: this.$t('nav.nav_1029'),
                    showClose: true,
                    // duration: 0,
                    type: 'success',
                    customClass: 'zdy-info-box'
                  });
                  this.isAttention = false;
                }
              })
              .catch(e => {
                this.$message({
                  message: e.msg,
                  showClose: true,
                  // duration: 0,
                  type: 'success',
                  customClass: 'zdy-info-box'
                });
              });
          } else {
            this.attentionServer
              .attention({
                at_id: this.userInfo.user_id, // 被取消关注ID
                type: 1
              })
              .then(res => {
                if (res.code == 200) {
                  this.$message({
                    message: this.$t('nav.nav_1030'),
                    showClose: true,
                    // duration: 0,
                    type: 'success',
                    customClass: 'zdy-info-box'
                  });
                  this.isAttention = true;
                }
              })
              .catch(e => {
                this.$message({
                  message: e.msg,
                  showClose: true,
                  // duration: 0,
                  type: 'success',
                  customClass: 'zdy-info-box'
                });
              });
          }
        }, 300);
      },
      setOfficicalInfo(info) {
        if (info && info.status == 0 && info.img) {
          this.officialImg = info.img;
        }
      },
      setSkinInfo(skin) {
        if (skin && skin.skin_json_pc && skin.status == 1) {
          this.$nextTick(() => {
            const { bgColor, pageStyle, background } = JSON.parse(skin.skin_json_pc) || '';
            this.themeClass.iconClass = pageStyle == '#FB3A32' ? 'icon-revert' : 'icon-default';
            this.themeClass.pageBg = pageStyle;
            this.themeClass.bgColor =
              bgColor == '#1a1a1a' ? 'dark' : bgColor == '#F2F2F2' ? 'gray' : 'white';
            const bottomContent = document.querySelector('.vmp-basic-container');
            if (bottomContent && background) {
              bottomContent.style.background = `url(${background}) no-repeat`;
              bottomContent.style.backgroundSize = '100% 100%';
              bottomContent.style.backgroundPosition = 'center';
            } else if (bottomContent && bgColor) {
              bottomContent.style.background = `${bgColor}`;
            } else {
              bottomContent.style.background = '#1a1a1a';
            }
          });
        } else {
          this.$nextTick(() => {
            // 默认皮肤
            this.themeClass.pageBg = '#cccccc';
            this.themeClass.iconClass = 'icon-default';
          });
        }
      },
      goLogoUrl() {
        let logoUrl =
          this.webinarTag && this.webinarTag.skip_url
            ? this.webinarTag.skip_url
            : 'https://www.vhall.com/';
        window.open(logoUrl, '_blank');
      },
      //登录
      goLogin() {
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitClickLogin'));
      },
      //公众号
      goOfficical() {
        this.officialImg = this.officicalInfo.img;
        this.$refs.officaialDialog.officialVisible = true;
      },
      //分享
      goShare() {
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitOpenShare'));
      },
      exitLogin() {
        this.userServer.loginOut().then(res => {
          if (res.code == 200) {
            this.isLogin = false;
            this.isAttention = false;
            window.localStorage.clear();
            window.sessionStorage.clear();
            this.$nextTick(() => {
              window.location.reload();
            });
          }
        });
      },
      // 个人资料弹窗
      goUserInfo() {
        console.log('个人资料');
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitOpenUserAccount'));
      },
      // 提现管理弹窗
      goCashInfo() {
        console.log('提现管理');
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitOpenCash'));
      }
    }
  };
</script>
<style lang="less">
  .vmp-header-watch {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 72px;
    width: 100%;
    margin: 0 32px 0 8px;
    &-left {
      margin-right: 7px;
      &-logo {
        width: 120px;
        height: 44px;
        margin: 14px 0;
        cursor: pointer;
        img {
          width: 100%;
          height: 100%;
          object-fit: scale-down;
        }
      }
    }
    &-center {
      text-align: left;
      flex: 1;
      color: @font-dark-normal;
      &-title {
        font-size: 18px;
        &-tags {
          padding: 0 8px;
          height: 20px;
          border-radius: 10px;
          display: inline-block;
          line-height: 18px;
          margin: 2px auto;
          img {
            width: 8px;
            height: 8px;
            display: inline-block;
            vertical-align: top;
            margin: 6px 2px 6px 0;
          }
          label {
            display: inline-block;
            vertical-align: top;
            height: 16px;
            font-size: 12px;
            font-weight: normal;
            color: @font-error-low;
            line-height: 16px;
            margin: 2px 0 2px 0;
          }
        }
        &-tags_1 {
          background: @bg-error-light;
        }
        &-tags_2 {
          background: @bg-subscribe-normal;
        }
        &-tags_3 {
          background: @bg-end-normal;
        }
        &-tags_4 {
          background: @bg-demand-normal;
        }
        &-tags_5 {
          background: @bg-playback-normal;
        }
        &-delay {
          display: inline-block;
          width: 66px;
          height: 28px;
          margin-left: 8px;
          vertical-align: middle;
          img {
            height: 100%;
            width: 100%;
            object-fit: scale-down;
          }
        }
      }
      &-host {
        font-size: 14px;
        color: @font-dark-low;
        a {
          color: @font-dark-low;
          &:hover {
            color: @font-link;
          }
        }
        span {
          padding-left: 8px;
        }
      }
    }
    &-right {
      display: flex;
      padding-right: 32px;
      align-items: center;
      justify-content: center;
      &-officical,
      &-attention,
      &-share {
        padding-right: 24px;
        &-icon {
          text-align: center;
          cursor: pointer;
          i {
            font-size: 16px;
          }
          p {
            font-size: 14px;
            line-height: 14px;
            padding-top: 5px;
          }
        }
        .icon-default {
          &:hover {
            cursor: pointer;
            i,
            p {
              cursor: pointer;
              color: @font-high-light-normal !important;
            }
          }
        }
        .icon-revert {
          &:hover {
            cursor: pointer;
            i,
            p {
              cursor: pointer;
              color: @font-dark-second !important;
            }
          }
        }
      }
      &-login {
        &-unuser {
          text-align: center;
          display: flex;
          cursor: pointer;
          align-items: center;
          justify-content: center;
          p {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            margin-right: 8px;
            img {
              width: 100%;
              height: 100%;
              object-fit: scale-down;
            }
          }
          span {
            font-size: 14px;
            font-weight: 400;
            color: #ccc;
            line-height: 32px;
          }
        }
        &-user {
          position: relative;
          height: 100%;
          &-dropdown {
            text-align: center;
            display: flex;
            cursor: pointer;
            align-items: center;
            justify-content: center;
            p {
              width: 36px;
              height: 36px;

              margin-right: 8px;
              overflow: hidden;
              padding: 5px 0;
              img {
                width: 100%;
                height: 100%;
                border-radius: 50%;
                object-fit: cover;
              }
            }
            span {
              font-size: 14px;
              font-weight: 400;
              color: #ccc;
              line-height: 32px;
            }
            &:hover {
              .vmp-header-watch-right-login-user-list {
                display: block;
              }
            }
          }
          &-list {
            width: 160px;
            position: absolute;
            top: 38px;
            right: -6px;
            z-index: 11;
            border-radius: 4px;
            padding: 4px 0;
            background: #383838;
            display: none;
            ul {
              list-style: none;
              li {
                height: 40px;
                line-height: 40px;
                text-align: left;
                color: @font-dark-normal;
                font-size: 14px;
                cursor: pointer;
                &:hover {
                  background: #444;
                }
                .vh-iconfont {
                  font-size: 18px;
                  margin-left: 10px;
                  margin-right: 6px;
                  color: @font-dark-normal;
                  display: inline-block;
                  vertical-align: top;
                }
              }
            }
          }
        }
      }
    }
  }
</style>

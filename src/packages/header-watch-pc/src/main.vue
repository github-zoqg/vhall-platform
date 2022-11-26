<template>
  <!-- 观看端头部信息 -->
  <div
    class="vmp-header-watch"
    :class="embedObj.embed ? 'vmp-basic-hd' : ''"
    v-if="!embedObj.embed"
  >
    <div class="vmp-header-watch_left">
      <!-- 品牌设置-标识图片 -->
      <div class="left_logo" v-if="webinarTag && webinarTag.view_status == 1" @click="goLogoUrl">
        <img :src="webinarTag && webinarTag.logo_url ? webinarTag.logo_url : defaultLogo" alt="" />
      </div>
    </div>
    <div class="vmp-header-watch_center">
      <div class="center_title">
        {{ languagesInfo.subject | overHidden(40) }}
        <span :class="'tags tags_' + webinarInfo.type">
          <img v-if="webinarInfo.type == 1" src="./img/live-white.gif" alt="" />
          <label>{{ formatType(webinarInfo.type) }}</label>
        </span>
        <span v-if="webinarInfo.mode != 6 && webinarInfo.no_delay_webinar == 1" class="delay">
          <img :src="noDelayIconUrl" alt="" />
        </span>
      </div>
      <div class="center_host" v-if="webinarTag && webinarTag.organizers_status == 1">
        <span class="host_status" @click="goUser">
          {{ $t('nav.nav_1001') }}：{{ webinarInfo.userinfo.nickname }}
        </span>
        <!-- <a
          :href="create_user_url"
          v-if="webinarTag && webinarTag.organizers_status == 1"
          :target="create_user_url == 'javascript:void(0);' ? '_self' : '_blank'"
        >
          {{ $t('nav.nav_1001') }}：{{ webinarInfo.userinfo.nickname }}
        </a> -->
        <span class="host_time">
          {{ webinarInfo.start_time && webinarInfo.start_time.slice(0, -3) }}
        </span>
      </div>
    </div>
    <div class="vmp-header-watch_right">
      <div class="rehearsalStatus" v-if="isRehearsal && isLiving">
        <i class="dot"></i>
        {{ $t('nav.nav_1055') }}
      </div>
      <!-- 多语言 -->
      <vmp-air-container :cuid="cuid"></vmp-air-container>

      <!-- 公众号 -->
      <div class="right_officical" v-if="officialImg">
        <div :class="'right_officical_icon ' + themeClass.iconClass" @click="goOfficical">
          <i class="vh-saas-iconfont vh-saas-line-public"></i>
          <p>{{ $t('nav.nav_1002') }}</p>
        </div>
      </div>

      <!-- 关注 -->
      <div
        class="right_attention"
        v-if="webinarTag && webinarTag.organizers_status == 1 && webinarInfo.mode != 6"
      >
        <div :class="'right_attention_icon ' + themeClass.iconClass" @click="attentionHandler">
          <i
            :class="`vh-iconfont ${
              isAttention ? 'vh-a-line-collectionsuccess' : 'vh-line-collection'
            }`"
          ></i>
          <p>{{ isAttention ? $t('nav.nav_1003') : $t('nav.nav_1004') }}</p>
        </div>
      </div>

      <!-- 分享 -->
      <div class="right_share" v-if="isShowShare">
        <div :class="'right_share_icon ' + themeClass.iconClass" @click="goShare">
          <i class="vh-iconfont vh-line-share"></i>
          <p>{{ $t('nav.nav_1013') }}</p>
        </div>
      </div>

      <!-- 登录、基础信息 -->
      <div class="right_login">
        <div class="right_login_unuser" @click="goLogin" v-if="!isLogin">
          <p><img :src="defaultAvatar" alt="" /></p>
          <span>{{ $t('nav.nav_1005') }}</span>
        </div>
        <div class="right_login_user" v-else>
          <div class="right_login_user_dropdown">
            <p>
              <img :src="userInfo.avatar || defaultAvatar" alt="" />
            </p>
            <span>{{ userInfo.nick_name | overHidden(8) }}</span>
            <div class="right_login_user_list">
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
  import { boxEventOpitons } from '@/app-shared/utils/tool.js';
  import { defaultAvatar, defaultLogo } from '@/app-shared/utils/ossImgConfig';
  export default {
    name: 'VmpHeaderWatch',
    data() {
      return {
        defaultLogo: defaultLogo,
        webinarInfo: {
          userinfo: {
            nickname: ''
          }
        }, //活动的信息
        skinInfo: {}, //皮肤的信息
        webinarTag: {}, // 活动标识
        officialImg: '',
        themeClass: {
          bgColor: 'light',
          pageBg: '#cccccc',
          iconClass: 'icon-default' // icon默认色
        },
        isAttention: false,
        isLogin: Boolean(window.localStorage.getItem('token')),
        defaultAvatar
      };
    },
    computed: {
      // 直播中
      isLiving() {
        return this.$domainStore.state.roomBaseServer.watchInitData.webinar.type == 1;
      },
      // 是否是彩排
      isRehearsal() {
        return this.$domainStore.state.roomBaseServer.watchInitData.live_type == 2;
      },
      // 主办方跳转地址
      // create_user_url() {
      //   const { watchInitData } = this.roomBaseServer.state;
      //   if (watchInitData && watchInitData.urls && this.webinarInfo) {
      //     const url = watchInitData.urls.web_url || '';
      //     if (url.split('')[url.length - 1] == '/') {
      //       return watchInitData.urls.web_url + 'user/home/' + this.webinarInfo.userinfo.user_id;
      //     } else {
      //       return watchInitData.urls.web_url + '/user/home/' + this.webinarInfo.userinfo.user_id;
      //     }
      //   } else {
      //     return 'javascript:void(0);';
      //   }
      // },
      // 获取嵌入方式
      embedObj() {
        return this.$domainStore.state.roomBaseServer.embedObj;
      },
      // 获取用户信息
      userInfo() {
        return this.$domainStore.state.userServer.userInfo;
      },
      // 是否展示分享
      isShowShare() {
        return this.$domainStore.state.roomBaseServer.configList['ui.watch_hide_share'];
      },
      // 当前语言
      languagesInfo() {
        return this.$domainStore.state.roomBaseServer.languages.curLang;
      },
      // 无延迟图片地址
      noDelayIconUrl() {
        const langArr = ['zh-CN', 'en'];
        const langer = localStorage.getItem('lang') || this.languagesInfo.language_type;
        const lang = langArr[langer - 1] || 'zh-CN';
        return `${process.env.VUE_APP_STATIC_BASE}/common-static/images/nodelay-icon/v1.0.0/pc/delay-icon_${lang}.png`;
      }
    },
    beforeCreate() {
      this.roomBaseServer = useRoomBaseServer();
      this.attentionServer = useAttentionServer();
      this.userServer = useUserServer();
    },
    async created() {
      if (this.isLogin && !this.embedObj.embed) {
        // 通过活动ID，获取关注信息
        await this.attentionStatus();
      }
      // 获取活动信息
      this.getWebinarInfo();
    },
    methods: {
      getWebinarInfo() {
        const { watchInitData, skinInfo, webinarTag, officicalInfo } = this.roomBaseServer.state;
        this.webinarInfo = watchInitData.webinar || {}; //活动基本信息
        this.skinInfo = skinInfo || {}; // 皮肤信息
        this.webinarTag = webinarTag || {}; // 活动标签
        this.setOfficicalInfo(officicalInfo);
        // this.setSkinInfo(this.skinInfo);
      },
      // 关注状态 从接口拿到是否关注
      attentionStatus() {
        let params = {
          at_id: this.userInfo.user_id,
          type: 1 // 关注人
        };
        this.attentionServer.getAttentionStatus(params).then(res => {
          this.isAttention = Boolean(res.data.result);
        });
      },
      // 关注 or 取消关注
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
                  window.vhallReportForWatch?.report(170019); // 上报关注成功
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
      // 设置关注号信息
      setOfficicalInfo(info) {
        if (info && info.status == 0 && info.img) {
          this.officialImg = info.img;
        }
      },
      // 设置观看端皮肤样式
      setSkinInfo(skin) {
        if (skin && skin.skin_json_pc && skin.status == 1) {
          this.$nextTick(() => {
            const { bgColor, pageStyle, background } = skin.skin_json_pc || '';
            this.themeClass.iconClass = pageStyle == '#FB3A32' ? 'icon-revert' : 'icon-default';
            this.themeClass.pageBg = pageStyle; // 观看端风格/颜色
            this.themeClass.bgColor =
              bgColor == '#1a1a1a' ? 'dark' : bgColor == '#F2F2F2' ? 'gray' : 'white';
            const bottomContent = document.querySelector('.vmp-basic-container');
            if (!bottomContent) return;
            // 观看端背景颜色
            if (bottomContent && background) {
              bottomContent.style.background = `url(${background}?x-oss-process=image/resize,m_fill,w_1528,h_860) no-repeat`;
              bottomContent.style.backgroundSize = 'cover';
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
      // 主办方跳转地址
      goUser() {
        const href = `${window.location.origin}${process.env.VUE_APP_ROUTER_BASE_URL}/user/home/${this.webinarInfo.userinfo.user_id}`;
        window.open(href, '_blank');
      },
      // logo跳转
      goLogoUrl() {
        let logoUrl =
          this.webinarTag && this.webinarTag.skip_url
            ? this.webinarTag.skip_url
            : 'https://www.vhall.com/';
        window.open(logoUrl, '_blank');
      },
      formatType(val) {
        let text;
        switch (parseInt(val)) {
          case 1:
            text = this.$t('common.common_1018');
            break;
          case 2:
            text = this.$t('common.common_1019');
            break;
          case 3:
            text = this.$t('common.common_1020');
            break;
          case 4:
            text = this.$t('common.common_1024');
            break;
          case 5:
            text = this.$t('common.common_1021');
            break;
          default:
            text = this.$t('common.common_1018');
        }
        return text;
      },
      //登录
      goLogin() {
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitClickLogin'));
      },
      //公众号
      goOfficical() {
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitOpenOfficical'));
        // this.officialImg = this.officicalInfo.img;
        // this.$refs.officaialDialog.officialVisible = true;
      },
      //分享
      goShare() {
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitOpenShare'));
      },
      // 退出登录
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
    margin-bottom: 20px;
    background: var(--header-background-color-base);
    &.vmp-basic-hd {
      display: none;
    }
    &_left {
      margin-right: 7px;
      padding-left: 8px;
      .left_logo {
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
    &_center {
      text-align: left;
      flex: 1;
      color: var(--header-font-color-primary);
      .center_title {
        font-size: 18px;
        color: var(--header-font-color-main);
        .tags {
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
        .tags_1 {
          background: @bg-error-light;
        }
        .tags_2 {
          background: @bg-subscribe-normal;
        }
        .tags_3 {
          background: @bg-end-normal;
        }
        .tags_4 {
          background: @bg-demand-normal;
        }
        .tags_5 {
          background: @bg-playback-normal;
        }
        .delay {
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
      .center_host {
        font-size: 14px;
        color: var(--header-font-color-regular);
        .host_status {
          color: var(--header-font-color-regular);
          cursor: pointer;
          &:hover {
            color: var(--header-font-color-link);
          }
        }
        .host_time {
          padding-left: 8px;
        }
      }
    }
    &_right {
      display: flex;
      padding-right: 32px;
      align-items: center;
      justify-content: center;
      .rehearsalStatus {
        color: var(--header-font-color-rehearsal);
        font-weight: 400;
        font-size: 14px;
        line-height: 20px;
        margin-right: 19px;
        position: relative;
        .dot {
          position: absolute;
          top: 6px;
          left: -12px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: var(--header-font-color-rehearsal);
          content: '';
        }
      }
      .right_officical,
      .right_attention,
      .right_share {
        padding-right: 24px;
        &_icon {
          color: var(--header-font-color-regular);
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
              color: var(--header-tab-item-font-color) !important;
            }
          }
        }
        // .icon-revert {
        //   &:hover {
        //     cursor: pointer;
        //     i,
        //     p {
        //       cursor: pointer;
        //       color: @font-dark-second !important;
        //     }
        //   }
        // }
      }
      .right_login {
        &_unuser {
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
            color: var(--header-font-color-regular);
            line-height: 32px;
          }
        }
        &_user {
          position: relative;
          height: 100%;
          &_dropdown {
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
              color: var(--header-font-color-regular);
              line-height: 32px;
            }
            &:hover {
              .right_login_user_list {
                display: block;
              }
            }
          }
          &_list {
            width: 160px;
            position: absolute;
            top: 42px;
            right: -6px;
            z-index: 11;
            border-radius: 4px;
            padding: 4px 0;
            background: var(--header-tab-item-dropdown-bg);
            display: none;
            ul {
              list-style: none;
              li {
                height: 40px;
                line-height: 40px;
                text-align: left;
                color: var(--header-tab-item-dropdown-font);
                font-size: 14px;
                cursor: pointer;
                &:hover {
                  background: var(--header-tab-bg-color-hover);
                  color: var(--header-tab-font-color-hover);
                }
                .vh-iconfont {
                  font-size: 18px;
                  margin-left: 10px;
                  margin-right: 6px;
                  color: var(--header-font-color-regular);
                  display: inline-block;
                  vertical-align: top;
                }
              }
            }
          }
        }
      }
      .el-dropdown,
      .vmp-language-choice {
        color: var(--header-font-color-regular);
      }
    }
  }
  .el-dropdown-menu {
    background-color: var(--header-tab-item-dropdown-color) !important;
    > .el-dropdown-menu__item:hover {
      background-color: var(--header-tab-bg-color-hover) !important;
      span {
        color: var(--header-tab-font-color-hover) !important;
      }
    }
  }
</style>

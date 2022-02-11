<template>
  <div class="vmp-header-watch">
    <div class="vmp-header-watch-left">
      <!-- 品牌设置-标识图片 -->
      <div class="vmp-header-watch-left-logo">
        <img src="./images/logo-red@2x.png" alt="" />
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
        <a href="">{{ $t('nav.nav_1001') }}：{{ webinarInfo.userinfo.nickname }}</a>
        <span>{{ webinarInfo.start_time }}</span>
      </div>
    </div>
    <div class="vmp-header-watch-right">
      <!-- 多语言 -->
      <vmp-air-container :cuid="childrenComp[0]" :oneself="true"></vmp-air-container>

      <!-- 公众号 -->
      <div class="vmp-header-watch-right-officical">
        <div
          class="vmp-header-watch-right-officical-icon"
          :style="{ color: themeClass.pageBg }"
          @click="goOfficical"
        >
          <i class="vh-saas-iconfont vh-saas-line-speaker"></i>
          <p>{{ $t('nav.nav_1002') }}</p>
        </div>
      </div>

      <!-- 关注 -->
      <vmp-air-container :cuid="childrenComp[1]" :oneself="true"></vmp-air-container>

      <!-- 分享 -->
      <div class="vmp-header-watch-right-share">
        <div
          class="vmp-header-watch-right-share-icon"
          :style="{ color: themeClass.pageBg }"
          @click="goShare"
        >
          <i class="vh-iconfont vh-line-share"></i>
          <p>{{ $t('nav.nav_1013') }}</p>
        </div>
      </div>

      <!-- 登录、基础信息 -->
      <div class="vmp-header-watch-right-login">
        <div class="vmp-header-watch-right-login-unuser" @click="goLogin" v-if="isLogin">
          <p><img src="./images/my-dark@2x.png" alt="" /></p>
          <span>{{ $t('nav.nav_1005') }}</span>
        </div>
        <div class="vmp-header-watch-right-login-user" v-else>
          <div class="vmp-header-watch-right-login-user-dropdown">
            <p>
              <img v-if="userInfo.avatar" :src="userInfo.avatar" alt="" />
              <img v-else src="./images/my-dark@2x.png" alt="" />
            </p>
            <span>{{ userInfo.nickname | splitLenStr(8) }}</span>
          </div>
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
      <!-- <vmp-air-container :cuid="cuid"></vmp-air-container> -->
    </div>
  </div>
</template>
<script>
  import { useRoomBaseServer } from 'middle-domain';
  import { boxEventOpitons } from '@/packages/app-shared/utils/tool.js';
  export default {
    name: 'VmpHeaderWatch',
    data() {
      return {
        noDelayIconUrl:
          '//cnstatic01.e.vhall.com/saas-v3/static/common/img/nodelay-icon/v1.0.0/pc/delay-icon_zh-CN.png',
        webinarInfo: {}, //活动的信息
        userInfo: {
          avatar:
            'https://t-alistatic01.e.vhall.com/upload/users/face-imgs/9c/e9/9ce963aaaa11f3bf9650f01fc62c3514.jpg',
          nickname: '测试==测试==测试==测试==测试==测试==测试==测试'
        }, // 用户登录之后的信息
        themeClass: {
          pageBg: '#3562fa'
        },
        isLogin: false
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
    beforeCreate() {
      this.roomBaseServer = useRoomBaseServer();
    },
    created() {
      this.childrenComp = window.$serverConfig[this.cuid].children;
      this.roomBaseState = this.roomBaseServer.state;
      this.getWebinarInfo();
    },
    methods: {
      getWebinarInfo() {
        const { webinar } = this.roomBaseState.watchInitData;
        this.webinarInfo = webinar;
        console.log(this.webinarInfo, '11111===zhangxiao===???');
      },
      exitLogin() {
        this.isLogin = false;
        console.log('退出登录');
      },
      //登录
      goLogin() {
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitClickLogin'));
      },
      //公众号
      goOfficical() {
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitOpenOfficical'));
      },
      //分享
      goShare() {
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitOpenShare'));
      },
      // 个人资料弹窗
      goUserInfo() {
        console.log('个人资料');
      },
      // 提现管理弹窗
      goCashInfo() {
        console.log('提现管理');
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
          &:hover {
            i,
            p {
              cursor: pointer;
              color: @font-high-light-normal !important;
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
          &-dropdown {
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
              overflow: hidden;
              img {
                width: 100%;
                height: 100%;
                object-fit: cover;
              }
            }
            span {
              font-size: 14px;
              font-weight: 400;
              color: #ccc;
              line-height: 32px;
            }
          }
          &:hover {
            .vmp-header-watch-right-login-user-list {
              display: block;
            }
          }
          &-list {
            width: 160px;
            position: absolute;
            top: 40px;
            left: 0;
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

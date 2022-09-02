<template>
  <div id="header" class="vh-concise-header-box">
    <span class="rehearsalStatus" v-if="isRehearsal && isLiving">
      <span class="dot"></span>
      {{ $t('nav.nav_1055') }}
    </span>
    <section class="vh-concise-header-box__1" v-if="showHeader">
      <section class="host-user-info">
        <!-- 头像 -->
        <img class="img-box" :src="hostAvatar" @click="skipAction" srcset />
        <div class="host-user-info__middle">
          <!-- 昵称 -->
          <p class="host-user-info__middle-nickname">
            {{ watchInitData.webinar.userinfo.nickname | overHidden(8) }}
          </p>
          <!-- 在线人数\热度 -->
          <div
            class="host-user-info__middle-num"
            v-show="(watchInitData.online.show || watchInitData.pv.show) && !isInGroup"
          >
            <!-- 直播中才展示在线人数 但是直播中没通过权限验证 也是不显示的 -->
            <p class="host-user-info__middle-num__online" v-if="watchInitData.online.show">
              <i class="vh-iconfont vh-line-user"></i>
              <span>{{ personCount | formatHotNum }}</span>
            </p>
            <p class="host-user-info__middle-num__hot" v-if="watchInitData.pv.show">
              <i class="vh-saas-iconfont vh-saas-line-heat"></i>
              <span>{{ hotNum | formatHotNum }}</span>
            </p>
          </div>
        </div>
        <!-- 关注 -->
        <span
          v-if="groupInitData && !groupInitData.isInGroup && watchInitData.webinar.mode != 6"
          @click="attentionApi"
          class="host-user-info__attention"
        >
          {{ attentionStatus == 0 ? $t('nav.nav_1004') : $t('nav.nav_1003') }}
        </span>
      </section>
      <section class="vh-concise-header-box__tool-box">
        <!-- 主页 -->
        <span class="vh-concise-header-box__tool-box__btn">
          <i class="vh-iconfont vh-line-house" @click="goUser"></i>
        </span>
        <!-- 公众号 -->
        <span
          class="vh-concise-header-box__tool-box__btn"
          v-if="officicalInfo.status == 0 && officicalInfo.img != ''"
        >
          <i class="vh-saas-iconfont vh-saas-line-public1" @click="showPublic"></i>
        </span>
      </section>
    </section>
    <!-- 不显示头部，只显示在线人数和热度的情况 -->
    <section class="vh-concise-header-box__2" v-else>
      <!-- 在线人数\热度 -->
      <div
        class="host-user-info__middle-num"
        v-if="(watchInitData.online.show || watchInitData.pv.show) && !isInGroup"
      >
        <!-- 直播中才展示在线人数 但是直播中没通过权限验证 也是不显示的 -->
        <p class="host-user-info__middle-num__online" v-if="watchInitData.online.show">
          <i class="vh-iconfont vh-line-user"></i>
          <span>{{ personCount | formatHotNum }}</span>
        </p>
        <p class="host-user-info__middle-num__hot" v-if="watchInitData.pv.show">
          <i class="vh-saas-iconfont vh-saas-line-heat"></i>
          <span>{{ hotNum | formatHotNum }}</span>
        </p>
      </div>
    </section>
  </div>
</template>

<script>
  import { useAttentionServer } from 'middle-domain';
  import { boxEventOpitons } from '@/app-shared/utils/tool.js';
  import defaultAvatar from '@/app-shared/assets/img/default_avatar.png';

  export default {
    name: 'VmpConciseHeaderWatchWap',
    data() {
      return {
        isLogin: false,
        attentionStatus: 0, // 关注状态
        // headInfo: null,
        // showSponsor: true,
        userInfo: {},
        themeClass: {
          bgColor: 'light',
          background: '#cccccc',
          pageStyle: '' // icon默认色
        }
      };
    },
    mounted() {
      // 关注的domain服务
      this.attentionServer = useAttentionServer();
      this.initUserLoginStatus();

      //设置品牌皮肤
      this.setSkinInfo(this.skinInfo);
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
      // 是否在小组中
      isInGroup() {
        return this.$domainStore.state.groupServer.groupInitData.isInGroup;
      },
      // 热度
      hotNum() {
        return (
          Number(this.$domainStore.state.virtualAudienceServer.uvHot) +
          Number(this.$domainStore.state.virtualAudienceServer.virtualHot) +
          1
        );
      },
      // 在线人数或订阅人数 Type:String
      personCount() {
        return (
          Number(this.$domainStore.state.virtualAudienceServer.uvOnline) +
          Number(this.$domainStore.state.virtualAudienceServer.virtualOnline)
        );
      },
      /**
       * 是否显示头部
       */
      showHeader() {
        if (this.embedObj.embed || (this.webinarTag && this.webinarTag.organizers_status == 0)) {
          return false;
        } else {
          return true;
        }
      },
      /**
       * 公众号信息
       */
      officicalInfo() {
        return this.$domainStore.state.roomBaseServer.officicalInfo;
      },
      /**
       * 皮肤信息
       */
      skinInfo() {
        return this.$domainStore.state.roomBaseServer.skinInfo;
      },
      // 主办方配置
      webinarTag() {
        return this.$domainStore.state.roomBaseServer.webinarTag;
      },
      // 参会信息
      watchInitData() {
        return this.$domainStore.state.roomBaseServer.watchInitData;
      },
      groupInitData() {
        return this.$domainStore.state.groupServer.groupInitData;
      },
      // isInGroup() {
      //   return this.$domainStore.state.groupServer.groupInitData.isInGroup;
      // },
      // 用户头像
      hostAvatar() {
        let avatar = '';
        if (this.watchInitData.webinar && this.watchInitData.webinar.userinfo.avatar) {
          avatar = this.watchInitData.webinar.userinfo.avatar;
        } else {
          avatar = defaultAvatar;
        }
        return avatar;
      },
      // 是否为嵌入页
      embedObj() {
        return this.$domainStore.state.roomBaseServer.embedObj;
      }
    },
    methods: {
      /**
       * 设置品牌设置信息
       */
      setSkinInfo(skin) {
        if (skin && skin.skin_json_wap && skin.status == 1) {
          const { bgColor, pageStyle, background } = JSON.parse(skin.skin_json_wap) || '';
          this.themeClass.pageStyle = pageStyle;
          this.themeClass.background = background;
          this.themeClass.bgColor = bgColor;
        }
      },
      /**
       * 初始化登录信息
       */
      initUserLoginStatus() {
        const userInfo = localStorage.getItem('userInfo')
          ? JSON.parse(localStorage.getItem('userInfo'))
          : '';
        console.log('用户信息-------->', userInfo);
        if (userInfo) {
          this.isLogin = true;
          this.userInfo = userInfo;
          this.getAttentionStatus(userInfo);
        }
      },
      skipAction() {
        if (this.webinarTag.skip_url) {
          window.location.href = this.webinarTag.skip_url;
        }
      },
      /**
       * 获取关注状态
       */
      getAttentionStatus(userInfo) {
        this.attentionServer
          .getAttentionStatus({
            at_id: userInfo.user_id,
            type: 1 // 关注人
          })
          .then(res => {
            console.log('getAttentionStatus-------->', res);
            this.attentionStatus = res.data.result;
          });
      },
      goUser() {
        window.location.href = `//${process.env.VUE_APP_WEB_BASE}${process.env.VUE_APP_ROUTER_BASE_URL}/user/home/${this.watchInitData.webinar.userinfo.user_id}`;
      },
      showPublic() {
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitOpenOfficical'));
      },
      /**
       * 关注方法
       */
      attentionApi() {
        console.log('this.isLogin------->', this.isLogin);
        if (!this.isLogin) {
          window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitClickLogin'));
          return;
        }
        // 取消关注
        if (this.attentionStatus == 1) {
          this.attentionServer
            .cancelAttention({
              at_id: this.$domainStore.state.userServer.userInfo.user_id,
              type: 1
            })
            .then(res => {
              console.log('cancelAttention-------->', res);
              this.$toast(this.$t('nav.nav_1029'));
              this.attentionStatus = 0;
            });
        } else {
          this.attentionServer
            .attention({
              at_id: this.$domainStore.state.userServer.userInfo.user_id,
              type: 1
            })
            .then(res => {
              console.log('attention-------->', res);
              this.$toast(this.$t('nav.nav_1030'));
              this.attentionStatus = 1;
            });
        }
      }
    }
  };
</script>

<style lang="less">
  .vh-concise-header-box {
    padding: 16px 24px 0 24px;
    position: relative;
    &__1 {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .host-user-info {
      height: 68px;
      border-radius: 34px;
      padding: 6px 8px;
      background: rgba(0, 0, 0, 0.3);
      display: inline-flex;
      align-items: center;
      .img-box {
        width: 56px;
        height: 56px;
        border-radius: 28px;
        overflow: hidden;
      }
      .host-user-info__middle {
        margin-left: 12px;
        &-nickname {
          font-size: 24px;
          line-height: 28px;
          color: #fff;
        }
      }
      &__attention {
        margin-left: 12px;
        padding: 8px 16px;
        border-radius: 30px;
        color: var(--theme-header-attention-color);
        font-size: 24px;
        line-height: 28px;
        background: var(--theme-header-attention-bg);
      }
    }
    .host-user-info__middle-num {
      display: flex;
      line-height: 20px;
      font-size: 20px;
      color: #fff;
      margin-top: 8px;
      &__online {
        margin-right: 12px;
      }
      .vh-line-user {
        font-size: 20px;
      }
      .vh-saas-line-heat {
        font-size: 20px;
      }
      p span {
        margin-left: 6px;
      }
    }
    .rehearsalStatus {
      color: #fb2626;
      font-weight: 400;
      font-size: 24px;
      line-height: 24px;
      margin-right: -8px;
      position: absolute;
      right: 32px;
      bottom: -34px;
      .dot {
        position: absolute;
        top: 6px;
        left: -18px;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background-color: #fb2626;
        content: '';
      }
    }
    &__tool-box {
      display: flex;
      &__btn {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 60px;
        height: 60px;
        border-radius: 30px;
        background: rgba(0, 0, 0, 0.3);
        border-radius: 57px;
        margin-left: 24px;
        i {
          color: #fff;
        }
      }
    }
    &__2 {
      display: inline-flex;
      align-items: center;
      padding: 6px 16px;
      font-size: 20px;
      line-height: 20px;
      background: rgba(0, 0, 0, 0.3);
      border-radius: 40px;
      margin-left: 24px;
      margin-top: 16px;
      .host-user-info__middle-num {
        margin-top: 0;
      }
    }
  }
</style>

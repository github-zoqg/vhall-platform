<template>
  <div id="header" class="vh-header-box" v-if="showHeader">
    <span class="host-user-info">
      <img class="img-box" :src="hostAvatar" @click="skipAction" srcset />
      {{ watchInitData.webinar.userinfo.nickname | overHidden(8) }}
    </span>
    <span class="tool-box">
      <span class="rehearsalStatus" v-if="isRehearsal && isLiving">
        <span class="dot"></span>
        {{ $t('nav.nav_1055') }}
      </span>
      <i class="vh-iconfont vh-line-house" @click="goUser"></i>
      <i
        class="vh-saas-iconfont vh-saas-line-public1"
        @click="showPublic"
        v-if="officicalInfo.status == 0 && officicalInfo.img != ''"
      ></i>
      <i
        class="attention"
        :class="{
          'vh-iconfont vh-line-collection': attentionStatus == 0,
          'vh-iconfont vh-a-line-collectionsuccess': attentionStatus == 1
        }"
        v-if="groupInitData && !groupInitData.isInGroup && watchInitData.webinar.mode != 6"
        @click="attentionApi"
      ></i>
    </span>
  </div>
</template>

<script>
  import { useAttentionServer } from 'middle-domain';
  import { boxEventOpitons } from '@/app-shared/utils/tool.js';
  import { defaultAvatar } from '@/app-shared/utils/ossImgConfig';

  export default {
    name: 'VmpHeaderWatchWap',
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
      // this.setSkinInfo(this.skinInfo);
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
          const { bgColor, pageStyle, background } = skin.skin_json_wap || '';
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
        window.location.href = `${window.location.origin}${process.env.VUE_APP_ROUTER_BASE_URL}/user/home/${this.watchInitData.webinar.userinfo.user_id}`;
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
              window.vhallReportForWatch?.report(170019);
            });
        }
      }
    }
  };
</script>

<style lang="less">
  .vh-header-box {
    height: 71px;
    background: var(--theme-header-bg);
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 30px;

    .host-user-info {
      color: var(--theme-header-font-color);
      .ellipsis();
      font-size: 28px;
      line-height: 71px;
      width: 350px;
      .img-box {
        display: inline-block;
        border-radius: 50%;
        width: 48px;
        height: 48px;
        // border: 2px solid #e3e3e3;
        vertical-align: middle;
        margin-right: 10px;
      }
      img {
        width: 60px;
      }
    }
    .tool-box {
      display: flex;
      justify-content: space-between;
      color: var(--theme-header-icon-color);
      i {
        margin-left: 37px;
        font-size: 30px;
      }
      .rehearsalStatus {
        color: var(--theme-header-icon-rehearsal-color);
        font-weight: 400;
        font-size: 24px;
        line-height: 24px;
        margin-right: -8px;
        display: flex;
        align-items: center;
        .dot {
          margin-right: 6px;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background-color: var(--theme-header-icon-rehearsal-color);
          content: '';
        }
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
  }
</style>

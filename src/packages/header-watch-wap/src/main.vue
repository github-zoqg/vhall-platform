<template>
  <div id="header" class="vh-header-box">
    <span class="host-user-info">
      <img
        v-if="webinarTag && webinarTag.organizers_status == 1"
        class="img-box"
        :src="hostAvatar"
        @click="skipAction"
        srcset
      />
      {{ watchInitData.webinar.userinfo.nickname | splitLenStr(8) }}
    </span>
    <span class="tool-box">
      <i class="vh-iconfont vh-line-house" :style="{ color: themeColor }" @click="goUser"></i>
      <i
        class="attention"
        :class="{
          'vh-iconfont vh-line-collection': attentionStatus == 0,
          'vh-iconfont vh-a-line-collectionsuccess': attentionStatus == 1
        }"
        v-if="groupInitData && !groupInitData.isInGroup && watchInitData.webinar.mode != 6"
        :style="{ color: themeColor }"
        @click="attentionApi"
      ></i>
      <i
        class="vh-saas-iconfont vh-saas-a-color-officialaccount"
        :style="{ color: themeColor }"
        @click="showPublic"
        v-if="officicalInfo.status == 0 && officicalInfo.img != ''"
      ></i>
    </span>
  </div>
</template>

<script>
  import { useAttentionServer } from 'middle-domain';
  import { boxEventOpitons } from '@/packages/app-shared/utils/tool.js';

  export default {
    name: 'VmpHeaderWatchWap',
    data() {
      return {
        isLogin: false,
        attentionStatus: 0, // 关注状态
        // headInfo: null,
        // showSponsor: true,
        userInfo: {}
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
    mounted() {
      // 关注的domain服务
      this.attentionServer = useAttentionServer();
      this.initUserLoginStatus();
      this.autoShowPublic();
    },
    computed: {
      /**
       * 公众号信息
       */
      officicalInfo() {
        return this.$domainStore.state.roomBaseServer.officicalInfo;
      },
      /**
       * 主题颜色
       */
      themeColor() {
        if (this.skinInfo && this.skinInfo.pageStyle) {
          return this.skinInfo.pageStyle;
        } else {
          return '#333';
        }
      },
      /**
       * 皮肤信息
       */
      skinInfo() {
        return this.$domainStore.state.roomBaseServer.skinInfo;
      },
      // 签名信息
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
          avatar = require('./images/default_avatar.png');
        }
        return avatar;
      }
    },
    methods: {
      /**
       * 自动弹出公众号
       */
      autoShowPublic() {
        console.log('header officicalInfo---->', this.officicalInfo);
        if (
          this.officicalInfo &&
          this.officicalInfo.alert_type == 0 &&
          this.officicalInfo.status == 0
        ) {
          this.showPublic();
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
        this.$router.push({ path: `/user/home/${this.watchInitData.webinar.userinfo.user_id}` });
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
              at_id: this.watchInitData.webinar.userinfo.user_id,
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
              at_id: this.watchInitData.webinar.userinfo.user_id,
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
  .vh-header-box {
    height: 100px;
    background: rgba(255, 255, 255, 1);
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 30px;
    .host-user-info {
      .ellipsis();
      font-size: 30px;
      line-height: 100px;
      width: 350px;
      .img-box {
        display: inline-block;
        border-radius: 50%;
        width: 60px;
        height: 60px;
        border: 2px solid #e3e3e3;
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
      i {
        margin-left: 37px;
        font-size: 38px;
      }
    }
  }
</style>

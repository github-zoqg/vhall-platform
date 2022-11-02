<template>
  <div id="header" class="vh-concise-header-box" :class="isPortraitLive ? 'isPortraitLive' : ''">
    <section class="vh-concise-header-box__rehearsal" v-if="isRehearsal && isLiving">
      <span class="dot"></span>
      {{ $t('nav.nav_1055') }}
    </section>
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
        <!-- 更多 -->
        <span class="vh-concise-header-box__tool-box__btn more" v-if="isPortraitLive">
          <i class="vh-iconfont vh-full-more" @click="openMore"></i>
        </span>
      </section>
    </section>
    <!-- 不显示头部，只显示在线人数和热度的情况 -->
    <section class="vh-concise-header-box__2" v-else>
      <section class="host-user-info">
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
      <section class="vh-concise-header-box__tool-box more" v-if="isPortraitLive">
        <!-- 更多 -->
        <span class="vh-concise-header-box__tool-box__btn">
          <i class="vh-iconfont vh-full-more" @click="openMore"></i>
        </span>
      </section>
    </section>
    <van-popup
      class="more-van-popup"
      v-model="showMoreCard"
      get-container="#app"
      safe-area-inset-bottom
      round
      position="bottom"
      :closeable="false"
    >
      <div class="more-content">
        <div class="list">
          <div class="item" v-if="playerOtherOptions.barrage_button">
            <div class="iconGroup" @click="updateBarrage">
              <span
                :class="`vh-iconfont ${danmuIsOpen ? 'vh-line-barrage-on' : 'vh-line-barrage-off'}`"
              ></span>
            </div>
            <div class="text">{{ danmuIsOpen ? $t('nav.nav_1057') : $t('nav.nav_1058') }}</div>
          </div>
          <div class="item" v-if="languageList.length > 1">
            <div class="iconGroup" @click="updateLang">
              <span :class="`vh-iconfont ${lang.key == 1 ? 'vh-line_en' : 'vh-line_cn'}`"></span>
            </div>
            <div class="text">{{ languageList[lang.key == 1 ? 1 : 0].label }}</div>
          </div>
          <div class="item">
            <div
              class="iconGroup"
              @click="
                showQualityCard = true;
                showMoreCard = false;
              "
            >
              <span class="vh-iconfont vh-line_hd"></span>
            </div>
            <div class="text">{{ formatQualityText(currentQualitys.def) }}</div>
          </div>
        </div>
        <div class="cancel" @click="showMoreCard = false">{{ $t('account.account_1063') }}</div>
      </div>
    </van-popup>
    <van-popup
      class="quality-van-popup"
      v-model="showQualityCard"
      get-container="#app"
      safe-area-inset-bottom
      round
      position="bottom"
      :closeable="false"
    >
      <div class="quality-content">
        <div class="list">
          <div
            class="item"
            v-for="item in qualitysList"
            :key="item.def"
            :class="{ active: currentQualitys.def == item.def }"
            @click="changeQualitys(item)"
          >
            {{ formatQualityText(item.def) }}
          </div>
        </div>
      </div>
    </van-popup>
    <van-popup
      class="quality-van-popup speed-van-popup"
      v-model="showSpeedCard"
      safe-area-inset-bottom
      get-container="#app"
      round
      position="bottom"
      :closeable="false"
    >
      <div class="quality-content speed-content">
        <div class="list">
          <div
            class="item"
            v-for="item in UsableSpeed"
            :key="item.def"
            :class="{ active: currentSpeed == item }"
            @click.stop="changeSpeed(item)"
          >
            {{item.toString().length &lt; 3 ? `${item.toFixed(1)}X` : `${item}X`}}
          </div>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script>
  import { useAttentionServer } from 'middle-domain';
  import { boxEventOpitons } from '@/app-shared/utils/tool.js';
  import { defaultAvatar } from '@/app-shared/utils/ossImgConfig';

  export default {
    name: 'VmpConciseHeaderWatchWap',
    data() {
      return {
        isLogin: false,
        attentionStatus: 0, // 关注状态
        // headInfo: null,
        // showSponsor: true,
        userInfo: {},
        showMoreCard: false,
        danmuIsOpen: false, // 弹幕是否开启
        lang: {
          key: 1,
          label: '简体中文',
          type: 'zh'
        },
        // langs: [
        //   {
        //     key: 1,
        //     label: '简体中文',
        //     type: 'zh'
        //   },
        //   {
        //     key: 2,
        //     label: 'English',
        //     type: 'en'
        //   }
        // ],
        currentQualitys: {
          def: 'same'
        }, // 当前清晰度
        qualitysList: [], // 清晰度列表
        showQualityCard: false,
        languageList: [],
        playerOtherOptions: {
          barrage_button: 0,
          progress_bar: 0,
          speed: 0,
          autoplay: false
        },
        currentSpeed: 1, // 当前倍速
        UsableSpeed: [], // 视频倍速列表
        showSpeedCard: false
      };
    },
    mounted() {
      // 关注的domain服务
      this.attentionServer = useAttentionServer();
      this.initUserLoginStatus();
      this.lang = this.$domainStore.state.roomBaseServer.languages.lang;
      this.languageList = this.$domainStore.state.roomBaseServer.languages.langList;
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
      },
      // 竖屏直播
      isPortraitLive() {
        return this.$domainStore.state.roomBaseServer.watchInitData.webinar_show_type == 0;
      }
    },
    methods: {
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
      },
      // 打开更多
      openMore() {
        this.showMoreCard = true;
      },
      // 开启/关闭弹幕
      updateBarrage() {
        this.danmuIsOpen = !this.danmuIsOpen;
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitPlayerDoBarrage'));
      },
      // 修改多语言
      updateLang() {
        const newLang = this.languageList[this.lang.key == 1 ? 1 : 0];
        localStorage.setItem('lang', newLang.key);
        const params = this.$route.query;
        // 如果地址栏中有语言类型，当切换语言时，对应的地址栏参数要改变
        if (params.lang) {
          params.lang = newLang.key;
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
      formatQualityText(val) {
        let text;
        switch (val) {
          case 'same':
            text = this.$t('player.player_1002');
            break;
          case '720p':
            text = this.$t('player.player_1005');
            break;
          case '480p':
            text = this.$t('player.player_1003');
            break;
          case 'a':
            text = this.$t('player.player_1006');
            break;
          case '360p':
            text = this.$t('player.player_1004');
            break;
          default:
            text = this.$t('player.player_1004');
        }
        return text;
      },
      getQualitys(currentQualitys, qualitysList) {
        this.currentQualitys = currentQualitys;
        this.qualitysList = qualitysList;
      },
      // 修改视频清晰度
      changeQualitys(item) {
        this.showQualityCard = false;
        window.$middleEventSdk?.event?.send(
          boxEventOpitons(this.cuid, 'emitPlayerUpdateQuality', [item])
        );
      },
      // 获取跑马灯、水印等播放器配置
      getPlayerOtherOptions(options) {
        this.playerOtherOptions = options;
        console.log('【playerOtherOptions】', this.playerOtherOptions);
      },
      openQualityCard(val) {
        this.showQualityCard = val;
      },
      getSpeeds(currentSpeed, speedsList) {
        this.currentSpeed = currentSpeed;
        this.UsableSpeed = speedsList;
      },
      openSpeedCard(val) {
        this.showSpeedCard = val;
      },
      // 修改视频倍速
      changeSpeed(item) {
        this.showSpeedCard = false;
        window.$middleEventSdk?.event?.send(
          boxEventOpitons(this.cuid, 'emitPlayerUpdateSpeed', [item])
        );
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
        padding: 11px 16px;
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
    &__rehearsal {
      position: absolute;
      width: 122px;
      height: 42px;
      background: rgba(0, 0, 0, 0.3);
      border-radius: 100px;
      right: 24px;
      bottom: -58px;
      color: var(--theme-header-icon-rehearsal-color);
      font-weight: 400;
      font-size: 24px;
      line-height: 34px;
      display: flex;
      align-items: center;
      .dot {
        display: block;
        margin-left: 16px;
        margin-right: 6px;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background-color: var(--theme-header-icon-rehearsal-color);
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
      display: flex;
      justify-content: space-between;
      align-items: center;
      .host-user-info {
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
    &.isPortraitLive {
      .vh-concise-header-box__2 .host-user-info {
        margin: 0;
        padding: 18px 0;
        background: none;
        border-radius: 0;
        p {
          margin-right: 12px;
          background: rgba(0, 0, 0, 0.3);
          padding: 7px 16px;
          border-radius: 40px;
        }
      }
    }
  }
  .more-van-popup {
    .more-content {
      padding: 67px 0 0;
      .list {
        display: flex;
        align-items: center;
        justify-content: center;
        .item {
          margin: 0 44px;
          display: flex;
          align-items: center;
          flex-direction: column;
          .iconGroup {
            width: 72px;
            height: 72px;
            background: rgba(0, 0, 0, 0.06);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 30px;
          }
          .text {
            font-weight: 400;
            font-size: 24px;
            margin-top: 8px;
            text-align: center;
          }
        }
      }
      .cancel {
        margin-top: 32px;
        padding: 39px 0;
        font-weight: 400;
        font-size: 32px;
        text-align: center;
      }
    }
  }
  .quality-van-popup {
    .quality-content {
      .list {
        .item {
          width: 100%;
          height: 100px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 400;
          font-size: 32px;
          color: #262626;
          &.active {
            color: #fb2626;
          }
        }
      }
    }
  }
</style>

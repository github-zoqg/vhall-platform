<template>
  <div class="rank-wrapbox" :class="{ 'rank-preview-box': isSubscribe }">
    <div v-if="info.inSwitch == 1 || info.rewardSwitch == 1" class="rank-previewbox">
      <!-- 顶部区域 -->
      <header class="ranking-title">
        <div class="rank-menu">
          <span
            v-if="info.inSwitch == 1"
            :class="{ active: activeTab === 'invite' }"
            @click="changeTab('invite')"
          >
            {{ $t('nav.nav_1032') }}
          </span>
          <span
            v-if="info.rewardSwitch == 1"
            :class="{ active: activeTab === 'award' }"
            @click="changeTab('award')"
          >
            {{ $t('nav.nav_1033') }}
          </span>
        </div>
        <div class="rank-rule" @click="changeRulesShow">
          {{ activeTab == 'invite' ? $t('nav.nav_1034') : $t('nav.nav_1035') }}
          <span
            class="vh-iconfont rank-icon"
            :class="[showRules ? 'vh-line-arrow-up' : 'vh-line-arrow-down']"
          ></span>
        </div>
      </header>

      <!-- 规则浮窗 -->
      <section v-show="showRules" class="ranking-box watch-area">
        <div v-show="activeTab === 'invite'" class="rank-con" v-html="info.inContent"></div>
        <div v-show="activeTab === 'invite' && !info.inContent" class="rank-con center">
          {{ $t('nav.nav_1036') }}
        </div>
        <div
          v-show="activeTab === 'award' && info.rewardContent"
          class="rank-con"
          v-html="info.rewardContent"
        ></div>
        <div v-show="activeTab === 'award' && !info.rewardContent" class="rank-con center">
          {{ $t('nav.nav_1036') }}
        </div>
      </section>

      <!-- 正文区域 -->
      <main
        class="rank-band"
        v-loading="loading"
        element-loading-text="加载中"
        element-loading-background="rgba(0,0,0,0)"
      >
        <!-- 邀请榜 -->
        <section v-show="activeTab === 'invite'" class="band-list">
          <template v-if="inviteRankList.length > 0">
            <div v-for="(item, index) in inviteRankList" :key="index" class="rank-item">
              <img
                v-if="index < 3"
                class="rank-num"
                :src="index == 0 ? bangdan1 : index == 1 ? bangdan2 : bangdan3"
                alt=""
              />
              <span v-else class="rank-num">{{ index + 1 }}</span>
              <div v-if="index < 3" :class="['top-three', `top-three-${index + 1}`]">
                <div class="rank-num-wrap">
                  <img :src="item.img_url" alt="" />
                </div>
              </div>
              <img v-else class="avatar" :src="item.img_url" alt="" />
              <span class="nickname">{{ item.nick_name | overHidden(8) }}</span>
              <span class="num">
                <i18n path="nav.nav_1037">
                  <span class="n" place="n">
                    &nbsp;{{ item.invites | filterInvitePeople }}&nbsp;
                  </span>
                </i18n>
                <!-- 邀请
                <span style="color: #fb3a32">
                  &nbsp;{{ item.invites | filterInvitePeople }}&nbsp;
                </span>
                人 -->
              </span>
            </div>
            <div
              v-if="showBottom && inviteRankList.length >= invitePage.total"
              class="loading-bottom"
            >
              <span class="load-icon"></span>
              {{ bottomText }}
            </div>
          </template>
          <template v-else-if="!loading">
            <img class="default-icon" src="../assets/imgs/empty-pay.png" alt="" />
            <span class="default-tip">{{ $t('nav.nav_1038') }}</span>
          </template>
        </section>

        <!-- 打赏榜 -->
        <section v-show="activeTab == 'award'" class="band-list">
          <template v-if="awardRankList.length > 0">
            <div v-for="(item, index) in awardRankList" :key="index" class="rank-item">
              <img
                v-if="index < 3"
                class="rank-num"
                :src="index == 0 ? bangdan1 : index == 1 ? bangdan2 : bangdan3"
                alt=""
              />
              <span v-else class="rank-num">{{ index + 1 }}</span>
              <div v-if="index < 3" :class="['top-three', `top-three-${index + 1}`]">
                <div class="rank-num-wrap">
                  <img :src="item.avatar" alt="" />
                </div>
              </div>
              <img v-else class="avatar" :src="item.avatar" alt="" />
              <span class="nickname">{{ item.nickname | overHidden(8) }}</span>
              <span class="num">
                <i18n path="interact_tools.interact_tools_1073">
                  <span class="n" place="n">¥{{ item.reward_amount | filterAmount }}</span>
                </i18n>
                <!-- 打赏
                <span style="color: #fc5659">{{ item.reward_amount | filterAmount }}</span>
                元 -->
              </span>
            </div>
            <div
              v-if="showBottom && awardRankList.length >= awardPage.total"
              class="loading-bottom"
            >
              <span class="load-icon"></span>
              {{ bottomText }}
            </div>
          </template>
          <template v-else-if="!loading">
            <img class="default-icon" src="../assets/imgs/empty-reward.png" alt />
            <span class="default-tip">{{ $t('nav.nav_1041') }}</span>
          </template>
        </section>
      </main>

      <!-- 邀请观看 -->
      <aside v-if="isInviteCardMode && !isEmbed" class="invite-friends">
        <span @click="showInviteFriends">{{ $t('nav.nav_1042') }}</span>
      </aside>
    </div>
  </div>
</template>

<script>
  import { useCustomMenuServer } from 'middle-domain';

  export default {
    name: 'component-rank',
    props: {
      info: {
        required: false
      }
    },
    data() {
      return {
        bangdan1: require('../assets/imgs/bangdan-1.png'),
        bangdan2: require('../assets/imgs/bangdan-2.png'),
        bangdan3: require('../assets/imgs/bangdan-3.png'),
        avatar: require('../assets/imgs/avatar.png'),

        loading: false,
        pageLock: false,
        scrollLock: false,
        showBottom: false,
        showRules: false,
        bottomText: '',
        activeTab: 'invite',
        inviteRankList: [],
        awardRankList: [],
        invitePage: {
          pos: 0,
          limit: 10,
          total: 0
        },
        awardPage: {
          pos: 0,
          limit: 10,
          total: 0
        }
      };
    },
    computed: {
      isSubscribe() {
        return this.$domainStore.state.roomBaseServer.watchInitData.status == 'subscribe';
      },
      isInviteCardMode() {
        return this.$domainStore.state.roomBaseServer.inviteCard.status == '1';
      },
      isEmbed() {
        return this.$domainStore.state.roomBaseServer.embedObj.embed;
      },
      watchInitData() {
        return this.$domainStore.state.roomBaseServer.watchInitData;
      },
      joinInfo() {
        return this.$domainStore.state.roomBaseServer.join_info;
      }
    },
    watch: {
      info: function (newVal) {
        if (newVal.inSwitch == 0 && this.activeTab === 'invite') {
          this.activeTab = 'award';
        } else if (newVal.rewardSwitch == 1 && this.activeTab === 'award') {
          this.activeTab = 'invite';
        }
      }
    },
    beforeCreate() {
      this.customMenuServer = useCustomMenuServer();
    },
    mounted() {
      if (this.info.inSwitch == 1) {
        this.activeTab = 'invite';
        this.getInviteRankList();
      } else if (this.info.rewardSwitch == 1) {
        this.activeTab = 'award';
        this.getAwardRankList();
      }
      this.listenEvents();
    },
    methods: {
      async listenEvents() {
        await this.$nextTick();
        const wrap = document.querySelector('.rank-band');
        if (!wrap) return;
        wrap.addEventListener('scroll', e => {
          if (this.scrollLock) return;
          const clientHeight = e.target.clientHeight;
          const scrollHeight = e.target.scrollHeight;
          const scrollTop = e.target.scrollTop;
          if (clientHeight + scrollTop >= scrollHeight) {
            if (this.pageTimer) {
              clearTimeout(this.pageTimer);
              this.pageTimer = null;
            }
            this.scrollLock = true;
            this.pageTimer = setTimeout(() => {
              if (this.activeTab === 'invite') {
                // 邀请排行
                if (this.invitePage.pos >= this.invitePage.total) return;
                this.getInviteRankList();
              } else {
                if (this.awardPage.pos >= this.awardPage.total) return;
                this.getAwardRankList();
              }
            }, 300);
          }
        });
      },
      async changeTab(tab = 'invite') {
        this.loading = true;
        this.activeTab = tab;

        this.pageLock = false;
        this.showBottom = false;
        this.scrollLock = false;

        if (tab === 'invite') {
          this.invitePage = {
            pos: 0,
            limit: 10,
            total: 0
          };
          this.inviteRankList = [];
          await this.getInviteRankList();
        }

        if (tab === 'award') {
          this.awardPage = {
            pos: 0,
            limit: 10,
            total: 0
          };
          this.awardRankList = [];
          await this.getAwardRankList();
        }

        this.loading = false;
      },
      /**
       * 获取邀请列表
       */
      async getInviteRankList() {
        if (this.pageLock) return;
        this.pageLock = true;
        this.showBottom = true;
        this.bottomText = this.$t('common.common_1001');

        const res = await this.customMenuServer.getInviteTopList({
          webinar_id: this.watchInitData.webinar.id,
          join_id: this.watchInitData.join_info.join_id,
          pos: parseInt(this.invitePage.pos),
          limit: 10
        });

        if (res.code == 200 && res.data && res.data.list.length > 0) {
          const list = res.data.list.map(item => {
            if (!item.img_url) {
              item.img_url = this.avatar;
            }
            return item;
          });

          const data = this.inviteRankList;
          this.inviteRankList = data.concat(list);
          this.invitePage = {
            pos: res.data.pos + 10,
            limit: 10,
            total: res.data.total
          };
        }
        this.scrollLock = false;

        this.clearBottomInfo();

        return true;
      },
      /**
       * 获取打赏列表
       */
      async getAwardRankList() {
        if (this.pageLock) return;
        this.pageLock = true;
        this.showBottom = true;
        this.bottomText = '加载中...';

        const res = await this.customMenuServer.getAwardList({
          room_id: this.watchInitData.interact.room_id,
          offset: parseInt(this.awardPage.pos),
          limit: 10
        });

        if (res.code == 200 && res.data) {
          const list = res.data.list.map(item => {
            if (!item.avatar) {
              item.avatar = this.avatar;
            }
            return item;
          });
          const data = this.awardRankList;
          this.awardPage = {
            pos: res.data.offset + 10,
            limit: 10,
            total: res.data.total
          };
          this.awardRankList = data.concat(list);
        }
        this.scrollLock = false;

        this.clearBottomInfo();

        return true;
      },
      showInviteFriends() {
        this.$emit('send', 'emitOpenShareDialog', 4); // 呼出分享弹窗(4-邀请卡)
      },

      changeRulesShow() {
        this.showRules = !this.showRules;
      },

      clearBottomInfo() {
        this.pageLock = false;
        const inviteOver = this.invitePage.pos + this.invitePage.limit >= this.invitePage.total;
        const awardOver = this.awardPage.pos + this.awardPage.limit >= this.awardPage.total;

        if (inviteOver || awardOver) {
          this.bottomText = this.$t('nav.nav_1043');
          this.showBottom = true;
        } else {
          this.bottomText = '';
          this.showBottom = false;
        }
      }
    }
  };
</script>

<style lang="less" scoped>
  .rank-wrapbox {
    width: 100%;
    position: relative;
    box-sizing: border-box;
    padding: 0px 24px 16px 24px;
  }
  .rank-preview-box {
    width: 480px;
    margin: 0px auto 20px;
    border-radius: 4px;
    border: 1px solid #444444;
    box-sizing: border-box;
    padding: 18px 24px;
    .rank-previewbox .ranking-box {
      top: 44px;
    }
  }
  .rank-previewbox {
    .ranking-title {
      font-size: 14px;
      color: var(--theme-tab-content-rank-title-font);
      line-height: 20px;
      height: 20px;
      // margin: 0 10px;
      position: relative;
      // margin-bottom: 10px;
      .rank-menu {
        text-align: left;
        span {
          display: inline-block;
          height: 20px;
          line-height: 20px;
        }
      }
      span {
        margin-right: 10px;
        // opacity: 0.8;
        color: @font-dark-low;
        &:hover {
          // opacity: 1;
          cursor: pointer;
        }
        &.active {
          // width: 42px;
          // height: 16px;
          font-size: 14px;
          font-family: PingFangSC-Regular, PingFang SC;
          font-weight: 400;
          color: #fb3a32;
          // line-height: 16px;
          // opacity: 1;
        }
      }
      .rank-rule {
        position: absolute;
        right: -10px;
        top: 0;
        font-size: 12px;
        color: var(--theme-tab-content-rank-rule-font);
        &:hover {
          cursor: pointer;
        }
        .rank-icon:before {
          display: inline-block;
          width: 12px !important;
          height: 12px !important;
          font-size: 12px;
        }
      }
    }

    .rank-band {
      text-align: center;
      height: 570px;
      overflow-y: auto;

      &::-webkit-scrollbar {
        width: 0px;
        height: 0px;
        border-radius: 0;
        background-color: rgba(0, 0, 0, 0) !important;
      }
      &::-webkit-scrollbar-track {
        background-color: transparent;
      }

      &::-webkit-scrollbar-thumb {
        height: 60px;
        border-radius: 10px;
        border: 1px solid rgba(0, 0, 0, 0);
        background-color: rgba(0, 0, 0, 0) !important;
      }

      .loading-bottom {
        width: 100%;
        height: 20px;
        text-align: center;
        font-size: 14px;
        font-weight: 400;
        color: var(--theme-tab-content-rank-finish-font);
        line-height: 20px;
        margin-top: 10px;
      }
      img {
        width: 90%;
      }
      .band-list {
        width: 100%;
        height: 100%;
        padding-bottom: 20px;
      }
      .rank-item {
        width: 100%;
        height: 54px;
        box-sizing: border-box;
        line-height: 54px;
        font-size: 14px;
        color: #e6e6e6;
        text-align: left;
        border-bottom: 1px solid var(--theme-tab-content-rank-split-bg);
        position: relative;
        &:after {
          clear: both;
        }
        .rank-num {
          display: inline-block;
          width: 20px;
          height: 24px;
          margin-right: 6px;
          margin-top: 15px;
          line-height: 24px;
          text-align: center;
          vertical-align: top;
          position: relative;
        }

        .avatar {
          display: inline-block;
          width: 28px;
          height: 28px;
          margin-right: 10px;
          border-radius: 50%;
        }
        .top-three {
          width: 37px;
          height: 42px;
          position: relative;
          margin-right: 10px;
          margin-top: 6px;
          display: inline-block;
          .rank-num-wrap {
            position: absolute;
            top: 26%;
            left: 8%;
            width: 28px;
            height: 28px;
            border-radius: 100%;
            overflow: hidden;
            img {
              width: 100%;
              height: 100%;
              // border-radius: 50%;
              object-fit: cover;
              vertical-align: top;
            }
          }
        }
        .top-three-1 {
          background: url('../assets/imgs/list1.png') no-repeat;
          background-size: 37px 42px;
          background-position: center;
        }
        .top-three-2 {
          background: url('../assets/imgs/list2.png') no-repeat;
          background-size: 37px 42px;
          background-position: center;
        }
        .top-three-3 {
          background: url('../assets/imgs/list4.png') no-repeat;
          background-size: 35px 41px;
          background-position: 10% 5%;
        }
        .top-three-3 {
          width: 36px;
          height: 41px;
          img {
            top: 24%;
          }
        }
        .nickname {
          display: inline-block;
          width: 60%;
          text-align: left;
          vertical-align: top;
          color: var(--theme-tab-content-rank-content-font);
        }
        .num {
          // float: right;
          position: absolute;
          right: 0px;
          color: var(--theme-tab-content-rank-content-invite-font);
          .n {
            color: var(--theme-color);
          }
        }
      }
      .default-icon {
        width: 121px;
        height: 84px;
        display: inline-block;
        margin: 200px auto 0px;
      }
      .default-tip {
        font-size: 12px;
        color: var(--theme-tab-content-rank-noData-font);
        display: inline-block;
        width: 100%;
        text-align: center;
        margin-top: 10px;
      }
    }
    .invite-friends {
      width: 100%;
      height: 30px;
      line-height: 30px;
      text-align: center;
      text-align: center;
      font-size: 14px;
      padding: 5px 0px;
      border-radius: 20px;
      border: 1px solid var(--theme-tab-content-rank-content-invite-btn-border);
      margin: 8px 0px;
      &:hover {
        background-color: var(--theme-color);
        color: var(--theme-tab-content-rank-content-invite-btn-font);
        border: 1px solid var(--theme-tab-content-rank-content-invite-btn-font);
      }
      span {
        display: inline-block;
        width: 60%;
        height: 100%;
        font-size: 14px;
        font-weight: 400;
        color: #e6e6e6;
        line-height: 20px;
        &:hover {
          cursor: pointer;
        }
      }
    }
    .ranking-box {
      position: absolute;
      top: 26px;
      left: 0px;
      width: 100%;
      height: 184px;
      background: var(--theme-tab-content-rank-rule-content-bg);
      padding: 12px 24px;
      box-sizing: border-box;
      overflow-y: scroll;
      word-break: break-all;
      font-size: 12px;
      font-weight: 400;
      color: @font-dark-normal;
      line-height: 20px;
      text-align: left;
      overflow-y: scroll;
      z-index: 10;
      box-shadow: 0px 6px 10px 0px rgba(0, 0, 0, 0.05), 0px 2px 4px 0px rgba(0, 0, 0, 0.05);
      ::v-deep > p {
        width: 100%;
        height: 100%;
      }
      .rank-con {
        color: var(--theme-tab-content-rank-rule-content-font);
        width: 100%;
      }
      .center {
        text-align: center;
        line-height: 184px;
      }
    }
    .watch-area {
      width: 360px;
    }
  }
  .rank-preview-box {
    width: 480px;
    .ranking-box {
      width: 100%;
      left: 0px;
    }
  }
</style>

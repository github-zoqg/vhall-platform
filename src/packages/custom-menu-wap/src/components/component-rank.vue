<template>
  <section v-if="showInviteList || showAwardsList" class="rank-list">
    <nav>
      <p class="tab">
        <span
          v-if="showInviteList"
          class="title"
          :class="{ active: currentTab == 1 }"
          @click="showAwardsList ? (currentTab = 1) : null"
        >
          {{ $t('nav.nav_1032') }}
        </span>
        <span v-if="showInviteList && showAwardsList" class="line"></span>
        <span
          v-if="showAwardsList"
          :class="{ active: currentTab == 2 }"
          @click="showInviteList ? (currentTab = 2) : null"
        >
          {{ $t('nav.nav_1033') }}
        </span>
      </p>
      <p class="rule-icon" :class="{ active: showRule }" @click="showRule = !showRule">
        {{ $t('nav.nav_1034') }}
        <i class="vh-iconfont vh-line-arrow-down" v-show="!showRule"></i>
        <i class="vh-iconfont vh-line-arrow-up" v-show="showRule"></i>
      </p>
    </nav>
    <div
      class="rule-content"
      v-show="showRule"
      v-html="currentTab == 1 ? info.inContent : info.rewardContent"
    ></div>
    <inviteList v-if="showInviteList && currentTab == 1" :list="inviteListData" />
    <awardsList v-if="showAwardsList && currentTab == 2" :list="awardsListData" />
  </section>
</template>

<script>
  import { useCustomMenuServer } from 'middle-domain';

  export default {
    name: 'component-rank',
    props: {
      info: {
        type: Object,
        default: () => ({})
      },
      roomId: {
        type: String
      }
    },
    data() {
      return {
        showInviteList: this.info.inSwitch == 1,
        showAwardsList: this.info.rewardSwitch == 1,
        inviteListData: [],
        awardsListData: [],
        showRule: false,
        currentTab: 1
      };
    },
    computed: {
      watchInitData() {
        return this.$domainStore.state.roomBaseServer.watchInitData;
      },
      joinInfo() {
        return this.$domainStore.state.roomBaseServer.join_info;
      }
    },
    beforeCreate() {
      this.customMenuServer = useCustomMenuServer();
    },
    mounted() {
      if (this.showInviteList) {
        this.getInviteList();
      }
      if (this.showAwardsList) {
        this.getAwardsList();
      }
      if (this.showAwardsList && !this.showInviteList) {
        this.currentTab = 2;
      }
    },
    components: {
      inviteList: () => import('./invite-list'),
      awardsList: () => import('./awards-list')
    },
    methods: {
      async getInviteList() {
        const res = await this.customMenuServer.getInviteTopList({
          webinar_id: this.watchInitData.webinar.id,
          join_id: this.watchInitData.join_info.join_id
        });

        if (res.code == 200 && res.data) {
          this.inviteListData = res.data.list;
        }
      },
      async getAwardsList() {
        const res = await this.customMenuServer.getAwardList({
          room_id: this.watchInitData.interact.room_id
        });

        if (res.code == 200 && res.data) {
          this.awardsListData = res.data.list;
        }
      }
    }
  };
</script>

<style lang="less" scoped>
  .rank-list {
    // background: url('./img/rank-bg.png') no-repeat;
    background-size: 100% 100%;
    background-position: cover;
    padding-bottom: 30px;
    .title {
      color: var(--theme-tab-content-rank-title-font);
    }
  }
  header {
    position: relative;
    font-size: 32px;
    font-weight: 500;
    color: rgba(68, 68, 68, 1);
    letter-spacing: 3px;
    text-align: center;
    height: 90px;
    line-height: 90px;
    // @include border(bottom);
    // border-bottom: 1px solid rgba(212, 212, 212, 1);
    i {
      position: absolute;
      top: 50%;
      left: 94%;
      transform: translate(-50%, -50%);
      font-size: 27px;
    }
  }
  nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-sizing: border-box;
    padding: 10px 0px 10px;
    width: 94%;
    margin: 0px auto;
    .tab {
      & > span {
        display: inline-block;
        font-size: 34px;
        line-height: 48px;
        color: #444444;
        &.active {
          color: #fb3a32;
        }
      }
      .line {
        position: relative;
        margin: 0 16px;
        height: 27px;
        border-left: 1px solid #444;
      }
    }
    .rule-icon {
      line-height: 36px;
      font-size: 26px;
      color: var(--theme-tab-content-rank-rule-font);
      &.active {
        color: var(--theme-tab-content-rank-rule-active-font);
      }
      i {
        color: #666666;
        font-size: 14px !important;
        margin-left: 12px;
      }
    }
  }
  .rule-content {
    font-size: 26px;
    width: 94%;
    margin: 0px auto 40px auto;
    word-break: break-all;
    padding: 8px 30px 12px;
    line-height: 1.4;
    color: var(--theme-tab-content-rank-rule-content-font);
    background: var(--theme-tab-content-rank-rule-content-bg);
    min-height: 30px;
    border-radius: 4px;
  }
</style>

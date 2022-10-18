<template>
  <section v-if="showInviteList || showAwardsList" class="rank-list">
    <nav :class="showRule ? 'min_padding' : ''">
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
      :class="['rule-content', isConcise ? 'rule-content__concise' : '']"
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
      },
      isConcise() {
        let skin_json_wap = {
          style: 1
        };
        const skinInfo = this.$domainStore.state.roomBaseServer.skinInfo;
        if (skinInfo?.skin_json_wap && skinInfo.skin_json_wap != 'null') {
          skin_json_wap = skinInfo.skin_json_wap;
        }
        return skin_json_wap?.style == 3;
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
    position: relative;
    min-height: 488px;
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
    padding: 24px 24px;
    width: 100%;
    margin: 0px auto;
    &.min_padding {
      padding: 24px 24px 11px 24px;
    }
    .tab {
      height: 40px;
      line-height: 40px;
      & > span {
        display: inline-block;
        font-style: normal;
        font-weight: 400;
        font-size: 28px;
        color: var(--theme-tab-content-rank-title-font);
      }
      .line {
        position: relative;
        margin: 0 16px;
        height: 27px;
        border-left: 1px solid #444;
      }
    }
    .rule-icon {
      font-style: normal;
      font-weight: 400;
      font-size: 28px;
      height: 40px;
      line-height: 40px;
      color: var(--theme-tab-content-rank-rule-active-font);
      i {
        color: #666666;
        font-size: 14px !important;
        margin-left: 12px;
      }
    }
  }
  .rule-content {
    word-break: break-all;
    color: var(--theme-tab-content-rank-rule-content-font);
    background-color: var(--theme-tab-content-rank-rule-content-bg);
    box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.05), 0px 6px 10px rgba(0, 0, 0, 0.05);
    border-radius: 4px;
    // min-height: 30px;
    height: 400px;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 24px 24px;
    text-align: left; /* 外部有个样式影响到所有文字对齐方式了 */
    position: absolute;
    top: 75px;
    left: 0;
    z-index: 3;
    -ms-overflow-style: none;
    overflow: -moz-scrollbars-none;
    width: 100%;
    &::-webkit-scrollbar {
      width: 0;
    }
    &__concise {
      background-image: url(../assets/imgs/rank-content-bg.png);
      background-repeat: no-repeat;
      background-size: 100% 100%;
    }
  }
</style>

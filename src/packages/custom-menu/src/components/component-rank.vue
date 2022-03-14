<template>
  <div class="rank-wrapbox" :class="{ 'rank-preview-box': pagetype == 'subscribe' }">
    <div v-if="info.inSwitch == 1 || info.rewardSwitch == 1" class="rank-previewbox">
      <header class="ranking-title">
        <div class="rank-menu">
          <span
            v-if="info.inSwitch == 1"
            :class="{ active: activeTab === 'invite' }"
            @click="changeTab('invite')"
          >
            邀请榜
          </span>
          <span
            v-if="info.rewardSwitch == 1"
            :class="{ active: activeTab === 'award' }"
            @click="changeTab('award')"
          >
            打赏榜
          </span>
        </div>
        <div class="rank-rule" @click="changeRulesShow">
          {{ activeTab == 'invite' ? '邀请榜' : '打赏榜' }}规则
          <span
            class="iconfont rank-icon"
            :class="{ iconjiantou_shouqi: !showRules, iconjiantou_zhankai: showRules }"
          ></span>
        </div>
      </header>

      <div v-show="showRules" class="ranking-box watch-area">
        <div v-show="activeTab === 'invite'" class="rank-con" v-html="info.inContent"></div>
        <div v-show="activeTab === 'invite' && !info.inContent" class="rank-con center">
          什么规则都没有
        </div>
        <div
          v-show="activeTab === 'award' && info.rewardContent"
          class="rank-con"
          v-html="info.rewardContent"
        ></div>
        <div v-show="activeTab === 'award' && !info.rewardContent" class="rank-con center">
          什么规则都没有
        </div>
      </div>

      <div class="rank-band">
        <div v-show="activeTab === 'invite'" class="band-list">
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
              <span class="nickname">{{ item.nick_name | filterNickname }}</span>
              <span class="num">
                邀请
                <span style="color: #fb3a32">
                  &nbsp;{{ item.invites | filterInvitePeople }}&nbsp;
                </span>
                人
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
          <template v-else>
            <img class="default-icon" src="../assets/imgs/empty-pay.png" alt="" />
            <span class="default-tip">您还未邀请,快去抢沙发吧~</span>
          </template>
        </div>
        <div v-show="activeTab == 'award'" class="band-list">
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
              <span class="nickname">{{ item.nickname | filterNickname }}</span>
              <span class="num">
                打赏
                <span style="color: #fc5659">{{ item.reward_amount | filterAmount }}</span>
                元
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
          <template v-else>
            <img class="default-icon" src="../assets/imgs/empty-reward.png" alt />
            <span class="default-tip">土豪,求打赏!</span>
          </template>
        </div>
      </div>

      <div v-if="open == 1" class="invite-friends">
        <span @click="showInviteFriends">邀请好友观看</span>
      </div>
    </div>
  </div>
</template>

<script>
  import { useCustomMenuServer } from 'middle-domain';

  export default {
    name: 'component-rank',
    filters: {
      filterNickname(val) {
        if (val.length > 8) {
          return val.substr(0, 8) + '...';
        } else {
          return val;
        }
      },
      filterInvitePeople(val) {
        const num = Number(val);
        if (num > 10000) {
          return (num / 10000).toFixed(2) + '万';
        }
        return parseInt(num);
      },
      filterAmount(val) {
        const num = Number(val);
        if (num > 10000) {
          return (num / 10000).toFixed(2) + '万';
        }
        return num.toFixed(2);
      }
    },
    props: {
      info: {
        required: false
      },
      open: {
        type: String,
        default: '0',
        required: false
      },
      pagetype: {
        type: String,
        default: 'watch'
      }
    },
    data() {
      return {
        bangdan1: require('../assets/imgs/bangdan-1.png'),
        bangdan2: require('../assets/imgs/bangdan-2.png'),
        bangdan3: require('../assets/imgs/bangdan-3.png'),
        avatar: require('../assets/imgs/avatar.png'),

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
      changeTab(tab = 'invite') {
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
          this.getInviteRankList();
        }

        if (tab === 'award') {
          this.awardPage = {
            pos: 0,
            limit: 10,
            total: 0
          };
          this.awardRankList = [];
          this.getAwardRankList();
        }
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
      },
      showInviteFriends() {
        this.$VhallEventBus.$emit(this.$VhallEventType.InteractTools.ROOM_OPEN_INVITE_FRIENDS_QR);
      },

      changeRulesShow() {
        this.showRules = !this.showRules;
      },

      clearBottomInfo() {
        this.pageLock = false;
        const inviteOver = this.invitePage.pos + this.invitePage.limit >= this.invitePage.total;
        const awardOver = this.awardPage.pos + this.awardPage.limit >= this.awardPage.total;

        if (inviteOver || awardOver) {
          this.bottomText = '已经到底啦~';
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
  .rank-list {
    // background: url('./img/rank-bg.png') no-repeat;
    background-size: 100% 100%;
    background-position: cover;
    padding-bottom: 30px;
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
    border-bottom: 1px solid #444;
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
        font-size: 34px;
        line-height: 48px;
        color: #444444;
        &.active {
          color: #fc5659;
        }
      }
      .line {
        position: relative;
        margin: 0 30px;
        height: 27px;
        border-left: 1px solid #444;
      }
    }
    .rule-icon {
      line-height: 36px;
      color: #666666;
      font-size: 26px;
      i {
        color: #666666;
        font-size: 14px !important;
        margin-left: 12px;
      }
    }
  }
  .rule-content {
    width: 94%;
    margin: 0px auto 40px auto;
    word-break: break-all;
    padding: 0 30px;
    line-height: 1.4;
    color: rgba(68, 68, 68, 1);
    background: #fff;
    min-height: 30px;
    border-radius: 4px;
  }
</style>

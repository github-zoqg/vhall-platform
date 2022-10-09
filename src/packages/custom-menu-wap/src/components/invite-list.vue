<template>
  <section class="invite-wrap">
    <noData v-if="!list.length" :showType="1" />
    <ul v-else>
      <li
        class="invite-list"
        v-for="(item, index) in list"
        :key="index"
        :class="{ zero: index == 0, one: index == 1, two: index == 2 }"
      >
        <div class="invite-item">
          <img
            class="rank-icon"
            v-if="index <= 2"
            :src="index == 0 ? bangdan1 : index == 1 ? bangdan2 : bangdan3"
            alt=""
          />
          <span v-else class="rank-num">{{ index + 1 }}</span>
          <span class="avatar">
            <img :src="item.img_url ? item.img_url : defaultAvatar" />
          </span>
          <span class="name">{{ item.nick_name }}</span>
        </div>
        <!-- <div>
          邀请 &nbsp; <span>{{ item.invites }}</span>&nbsp; 人
        </div> -->
        <div class="invite-info">
          <i18n path="nav.nav_1037">
            <span place="n" class="invite_num_color">
              {{ item.invites }}
            </span>
          </i18n>
        </div>
      </li>
    </ul>
  </section>
</template>

<script>
  import defaultAvatar from '../assets/imgs/avatar.png';
  export default {
    name: 'inviteList',
    props: {
      list: {
        type: Array,
        default: () => {
          return {};
        }
      }
    },
    data() {
      return {
        defaultAvatar,
        bangdan1: require('../assets/imgs/bangdan-1.png'),
        bangdan2: require('../assets/imgs/bangdan-2.png'),
        bangdan3: require('../assets/imgs/bangdan-3.png')
      };
    },
    components: {
      noData: () => import('./no-data')
    }
  };
</script>

<style lang="less" scoped>
  @import '../styles/list.less';
  .invite-wrap {
    background: var(--theme-tab-content-rank-bg-font);
    width: 100%;
    padding: 0 24px;
    height: 90%;
    margin: 0px auto;
  }
  .invite-list {
    background: var(--theme-tab-content-rank-bg-font);
    .invite-item {
      display: flex;
      align-items: center;
      font-style: normal;
      font-weight: 400;
      font-size: 28px;
      line-height: 40px;
      .name {
        color: var(--theme-tab-content-rank-title-font);
        margin-left: 12px;
        text-align: left;
      }
    }
    .rank-icon,
    .rank-num {
      display: inline-block;
      width: 38px;
      height: 46px;
      margin-right: 16px;
      text-align: center;
      line-height: 48px !important;
    }
    .avatar {
      display: inline-block;
      vertical-align: middle;
    }
    .invite-info {
      color: var(--theme-tab-content-rank-content-font);
      .invite_num_color {
        color: var(--theme-tab-content-rank-li-num-color);
      }
    }
  }
</style>

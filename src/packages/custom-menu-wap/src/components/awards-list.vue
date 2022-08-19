<template>
  <section class="award-wrap">
    <noData v-if="!list.length" :showType="0" />
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
            <img :src="item.avatar ? item.avatar : defaultAvatar" />
          </span>
          <span>{{ item.nickname }}</span>
        </div>
        <div>
          {{ $t('interact_tools.interact_tools_1044') }} &nbsp;
          <span>￥ {{ item.reward_amount | filterAmount }}</span>
        </div>
      </li>
    </ul>
  </section>
</template>

<script>
  import defaultAvatar from '@/app-shared/utils/avatar';

  export default {
    name: 'awardsList',
    props: {
      list: {
        type: Array,
        default: () => {
          return [];
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
  .award-wrap {
    background: #fff;
    width: 94%;
    height: 90%;
    margin: 0px auto;
  }
  .invite-list {
    .invite-item {
      display: flex;
      align-items: center;
      .avatar img {
        border: none !important;
      }
    }
    .rank-icon,
    .rank-num {
      display: inline-block;
      width: 36px !important;
      height: 48px !important;
      margin-right: 20px;
      text-align: center;
      line-height: 48px !important;
    }
  }
</style>

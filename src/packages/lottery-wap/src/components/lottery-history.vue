<template>
  <div class="vmp-lottery-history">
    <lottery-title :title="$t('interact_tools.interact_tools_1076')" />
    <div class="vmp-lottery-wrap-container">
      <ul class="vmp-lottery-wrap">
        <li v-for="(lottery, index) in winLotteryHistory" :key="index" class="vmp-win-lottery">
          <div class="vmp-lottery-item">
            <img
              class="vmp-lottery-item__img"
              :src="lottery.award_snapshoot.icon || defaultLotteryImg"
            />
            <div class="vmp-lottery-item__content">
              <p class="vmp-award-name">
                {{ filterAwardName(lottery.award_snapshoot) }}
              </p>
              <p class="vmp-award-time">
                {{ lottery.created_at | fmtTimeByExp('MM-DD HH:mm') }}
              </p>
            </div>
            <div class="vmp-lottery-item__status">
              <van-button
                v-if="available(lottery)"
                type="danger"
                size="mini"
                round
                @click="takeAward(lottery)"
              >
                {{ filterAwardStatus(lottery) }}
              </van-button>
              <template v-else>
                {{ filterAwardStatus(lottery) }}
              </template>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>
<script>
  import LotteryTitle from './lottery-title.vue';
  import props from './props';
  export default {
    name: 'LotteryHistory',
    mixins: [props],
    components: {
      LotteryTitle
    },
    props: {
      winLotteryHistory: {
        type: Array,
        default() {
          return [];
        }
      }
    },
    methods: {
      // 去领奖
      takeAward(lottery) {
        this.$emit('takeAward', lottery);
      },
      close() {
        this.$emit('close');
      },
      // 符合领奖条件
      available(lottery) {
        return lottery.take_award === 0 && lottery.need_take_award === 1;
      },
      filterAwardName(award) {
        if (!award) return this.$t('interact_tools.interact_tools_1009');
        return award?.award_name || this.$t('interact_tools.interact_tools_1009');
      },
      filterAwardStatus(lottery) {
        if (lottery.take_award === 1) {
          return this.$t('interact_tools.interact_tools_1078');
        } else if (lottery.need_take_award === 0) {
          return this.$t('interact_tools.interact_tools_1079');
        } else {
          return this.$t('interact_tools.interact_tools_1077');
        }
      }
    }
  };
</script>
<style lang="less">
  .vmp-lottery-history {
    position: relative;
    padding: 0 32px 60px;
    box-shadow: 0px -2px 10px rgba(0, 0, 0, 0.1);
    background: linear-gradient(180deg, #ffebd9 0%, #fcf1e7 100%);
    border-radius: 20px 20px 0px 0px;
    .vmp-title-container {
      display: flex;
      flex-direction: row;
      justify-content: center;
      margin-bottom: 50px;
    }
    .vmp-lottery-wrap-container {
      padding-right: 2px; // 滚动条效果距离
    }
    .vmp-lottery-wrap {
      min-height: 128px;
      max-height: 432px;
      overflow: auto;
    }
    .vmp-win-lottery {
      &:last-child .vmp-lottery-content-wrap {
        padding-bottom: 0;
      }
    }
    .vmp-lottery-item {
      display: flex;
      flex-direction: row;
      align-items: center;
      padding: 28px 32px;
      height: 144px;
      background: #fff;
      border-radius: 12px;
      margin-bottom: 12px;

      &__img {
        width: 80px;
        height: 80px;
        border-radius: 12px;
      }
      &__content {
        flex: 1;
        margin-left: 15px;
        height: 78px;
      }
      &__status {
        width: 120px;
        text-align: center;
        font-size: 24px;
        color: #bfbfbf;
      }
      .vmp-award-name {
        font-weight: 500;
        font-size: 30px;
        height: 42px;
        line-height: 42px;
        color: #262626;
      }
      .vmp-award-time {
        font-size: 24px;
        height: 32px;
        line-height: 32px;
        color: #8c8c8c;
      }
    }

    ::-webkit-scrollbar {
      width: 8px;
    }
    ::-webkit-scrollbar-thumb {
      //滚动条的设置
      background-color: #ccc;
      background-clip: padding-box;
      border-radius: 4px;
    }
  }
</style>

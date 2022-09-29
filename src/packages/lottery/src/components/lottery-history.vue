<template>
  <div class="lottery-box vmp-lottery-history">
    <lottery-title :title="$t('interact_tools.interact_tools_1076')" />
    <div class="vmp-lottery-wrap-container">
      <ul class="vmp-lottery-wrap">
        <li v-for="(lottery, index) in winLotteryHistory" :key="index" class="vmp-win-lottery">
          <div class="vmp-lottery-item">
            <img
              class="vmp-lottery-item__img"
              :src="
                (lottery.award_snapshoot && lottery.award_snapshoot.image_url) || defaultLotteryImg
              "
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
              <el-button
                class="tak-award-btn"
                v-if="available(lottery)"
                type="danger"
                size="mini"
                round
                @click="takeAward(lottery)"
              >
                {{ filterAwardStatus(lottery) }}
              </el-button>
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
    .vmp-title-container {
      display: flex;
      flex-direction: row;
      justify-content: center;
      margin-bottom: 20px;
    }
    .vmp-lottery-wrap-container {
      padding-right: 2px; // 滚动条效果距离
    }
    .vmp-lottery-wrap {
      min-height: 128px;
      max-height: 228px;
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
      padding: 0 12px;
      height: 72px;
      background: #fff;
      border-radius: 4px;
      margin-bottom: 4px;

      &__img {
        width: 50px;
        height: 50px;
        border-radius: 4px;
      }
      &__content {
        flex: 1;
        margin-left: 15px;
        height: 46px;
        text-align: left;
      }
      &__status {
        width: 66px;
        text-align: center;
        font-size: 14px;
        color: #bfbfbf;
      }
      .vmp-award-name {
        font-weight: 500;
        font-size: 16px;
        height: 24px;
        line-height: 24px;
        color: #262626;
      }
      .vmp-award-time {
        font-size: 12px;
        height: 20px;
        line-height: 20px;
        color: #8c8c8c;
      }
      .tak-award-btn {
        border: 0;
        color: #fff;
      }
    }

    ::-webkit-scrollbar {
      width: 4px;
    }
    ::-webkit-scrollbar-thumb {
      //滚动条的设置
      background-color: #ccc;
      background-clip: padding-box;
      border-radius: 2px;
    }
  }
</style>

<template>
  <div class="vmp-lottery-history">
    <header class="vmp-title-container">
      <div class="vmp-title-warp">
        <h1 class="vmp-lottery-title">中奖记录</h1>
        <div class="line"></div>
      </div>
    </header>
    <i class="vh-iconfont vh-line-close close-btn" @click="close"></i>
    <ul class="vmp-lottery-wrap">
      <li
        v-for="(lottery, index) in winLotteryHistory"
        :key="index"
        :class="[available(lottery) ? 'unclaimed' : '', 'vmp-win-lottery']"
      >
        <section class="vmp-lottery-content" @click="takeAward(lottery)">
          <div class="vmp-lottery-content__top">
            <span class="vmp-award-name">
              {{ lottery.award_snapshoot | awardName }}
            </span>
            <span class="vmp-award-status">
              {{ lottery | awardStatus }}
            </span>
          </div>
          <div class="vmp-lottery-content__bottom">
            {{ lottery.created_at | fmtTimeByExp('MM-dd hh:mm') }}
          </div>
        </section>
      </li>
    </ul>
  </div>
</template>
<script>
  export default {
    name: 'LotteryHistory',
    props: {
      winLotteryHistory: {
        type: Array,
        default() {
          return [];
        }
      }
    },
    filters: {
      awardName(award) {
        if (!award) return '奖品';
        return award?.award_name || '奖品';
      },
      awardStatus(lottery) {
        if (lottery.take_award === 1) {
          return '已领取';
        } else if (lottery.need_take_award === 0) {
          return '已中奖';
        } else {
          return '领取';
        }
      }
    },
    data() {
      return {};
    },
    methods: {
      // 去领奖
      takeAward(lottery) {
        if (!this.available(lottery)) return; // 二次拦截
        this.$emit('takeAward', lottery);
      },
      close() {
        this.$emit('close');
      },
      // 符合领奖条件
      available(lottery) {
        return lottery.take_award === 0 && lottery.need_take_award === 1;
      }
    }
  };
</script>
<style lang="less">
  .vmp-lottery-history {
    width: 386px;
    height: 298px;
    padding: 20px 0 30px;
    position: relative;
    background: linear-gradient(53.08deg, #fdf1ed 9.69%, #f3f2ff 105.87%);
    box-shadow: 0px -2px 10px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    .vmp-title-container {
      display: flex;
      flex-direction: row;
      justify-content: center;
    }
    .vmp-title-warp {
      display: inline-block;
      position: relative;
      .line {
        width: 88px;
        height: 10px;
        border-radius: 5px;
        background: #f3c9c8;
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        // bottom: -2px;
        z-index: 1;
      }
    }
    .vmp-lottery-title {
      position: relative;
      width: 80px;
      color: #000;
      font-size: 20px;
      font-weight: 500;
      font-family: 'PingFang SC';
      font-style: normal;
      -webkit-text-stroke: 1px #fff;
      z-index: 2;
    }
    .close-btn {
      position: absolute;
      top: 27px;
      right: 34px;
      color: #666;
      cursor: pointer;
    }
    .vmp-lottery-wrap {
      max-height: 220px;
      overflow: auto;
    }
    .vmp-win-lottery {
      &.unclaimed {
        .vmp-award-status {
          color: #0a7ff5;
        }
        .vmp-lottery-content {
          cursor: pointer;
        }
      }
    }
    .vmp-lottery-content {
      width: 297px;
      height: 64px;
      box-sizing: border-box;
      margin-bottom: 12px;
      padding: 15px 12px;
      background: #fff;
      border-radius: 4px;

      line-height: 1;
      &__top {
        font-size: 14px;
        margin-bottom: 5px;
        :after {
          clear: both;
        }
      }
      .vmp-award-name {
        color: #1a1a1a;
      }
      .vmp-award-status {
        float: right;
        color: #fc9600;
      }
      &__bottom {
        font-size: 12px;
        color: #8c8c8c;
      }
    }
  }
</style>

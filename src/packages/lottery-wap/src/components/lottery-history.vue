<template>
  <div class="vmp-lottery-history">
    <header class="vmp-title-container">
      <div class="vmp-title-warp">
        <span class="star star-1"></span>
        <span class="star star-2"></span>
        <span class="star star-3"></span>
        <h1 class="vmp-lottery-title">{{ $t('interact_tools.interact_tools_1076') }}</h1>
        <div class="line"></div>
      </div>
    </header>
    <div class="vmp-lottery-wrap-container">
      <ul class="vmp-lottery-wrap">
        <li v-for="(lottery, index) in winLotteryHistory" :key="index" class="vmp-win-lottery">
          <div :class="[available(lottery) ? 'unclaimed' : '', 'vmp-lottery-content-wrap']">
            <span class="circle">
              <span class="dot"></span>
            </span>
            <section class="vmp-lottery-content" @click="takeAward(lottery)">
              <div class="vmp-lottery-content__top">
                <span class="vmp-award-name">
                  {{ filterAwardName(lottery.award_snapshoot) }}
                </span>
                <span class="vmp-award-status">
                  {{ filterAwardStatus(lottery) }}
                </span>
              </div>
              <div class="vmp-lottery-content__bottom">
                {{ lottery.created_at | fmtTimeByExp('MM-dd hh:mm') }}
              </div>
            </section>
          </div>
        </li>
      </ul>
    </div>
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
    padding: 40px 0 60px;
    position: relative;
    background: linear-gradient(45.97deg, #fdf1ed 13.37%, #f3f2ff 92.84%);
    box-shadow: 0px -2px 10px rgba(0, 0, 0, 0.1);
    .vmp-title-container {
      display: flex;
      flex-direction: row;
      justify-content: center;
      margin-bottom: 50px;
    }
    .vmp-title-warp {
      display: inline-block;
      position: relative;
      .line {
        width: calc(100% + 16px);
        height: 20px;
        border-radius: 10px;
        background: #f3c9c8;
        position: absolute;
        left: 50%;
        bottom: 0;
        transform: translateX(-50%);
        z-index: 1;
      }
      .star {
        position: absolute;
        display: inline-block;
        background-size: 100%;
        background-repeat: no-repeat;
        &-1 {
          width: 25.6px;
          height: 27.1px;
          top: 26px;
          left: -42px;
          background-image: url('../img/star-1.png');
        }
        &-2 {
          width: 26px;
          height: 32px;
          top: -4px;
          right: -32px;
          background-image: url('../img/star-2.png');
        }
        &-3 {
          width: 16px;
          height: 20px;
          top: 20px;
          right: -42px;
          background-image: url('../img/star-3.png');
        }
      }
    }
    .vmp-lottery-title {
      position: relative;
      min-width: 160px;
      color: #000;
      font-size: 40px;
      font-weight: 500;
      text-shadow: 0 4px 0 #fff;
      z-index: 2;
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
      margin-left: 70px;
      &:last-child .vmp-lottery-content-wrap {
        padding-bottom: 0;
      }
    }
    .vmp-lottery-content-wrap {
      padding-left: 30px;
      padding-bottom: 24px;
      border-left: 1px dashed #d3cecf;
      position: relative;
      .circle {
        display: inline-block;
        width: 22px;
        height: 22px;
        position: absolute;
        top: 32px;
        left: -12px;
        border-radius: 50%;
        background: #fff4f4;
        border: 1px solid;
        border-color: #d3cecf;
      }
      .dot {
        display: inline-block;
        width: 14px;
        height: 14px;
        border-radius: 50%;
        position: absolute;
        top: 2px;
        left: 2px;
        background: #d3cecf;
      }
      &.unclaimed {
        .vmp-award-status {
          color: #0a7ff5;
        }
        .circle {
          border-color: #fb3a32;
        }
        .dot {
          background: #fb3a32;
        }
      }
    }
    .vmp-lottery-content {
      width: 594px;
      height: 128px;
      box-sizing: border-box;
      padding: 30px 24px;
      background: #fff;
      border-radius: 8px;
      line-height: 1;
      &__top {
        font-size: 28px;
        margin-bottom: 10px;
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
        font-size: 24px;
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

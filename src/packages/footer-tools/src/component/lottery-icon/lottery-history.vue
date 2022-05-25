<template>
  <div class="vmp-lottery-history">
    <header class="vmp-title-container">
      <div class="vmp-title-warp">
        <span class="star star-1"></span>
        <span class="star star-2"></span>
        <span class="star star-3"></span>
        <h1 class="vmp-lottery-title">中奖记录</h1>
        <div class="line"></div>
      </div>
    </header>
    <i class="vh-iconfont vh-line-close close-btn" @click="close"></i>
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
    padding: 20px 0 30px;
    position: relative;
    background: linear-gradient(53.08deg, #fdf1ed 9.69%, #f3f2ff 105.87%);
    box-shadow: 0px -2px 10px rgba(0, 0, 0, 0.1);
    border-radius: 8px;

    .vmp-title-container {
      display: flex;
      flex-direction: row;
      justify-content: center;
      margin-bottom: 25px;
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
          width: 12.8px;
          height: 13.55px;
          top: 13px;
          left: -21px;
          background-image: url('./images/star-1.png');
        }
        &-2 {
          width: 13px;
          height: 16px;
          top: -2px;
          right: -16px;
          background-image: url('./images/star-2.png');
        }
        &-3 {
          width: 8px;
          height: 10px;
          top: 10px;
          right: -21px;
          background-image: url('./images/star-3.png');
        }
      }
    }
    .vmp-lottery-title {
      position: relative;
      width: 80px;
      color: #000;
      font-size: 20px;
      font-weight: 500;
      text-shadow: 0 2px 0 #fff;
      z-index: 2;
    }
    .close-btn {
      position: absolute;
      top: 27px;
      right: 34px;
      color: #666;
      cursor: pointer;
    }
    .vmp-lottery-wrap-container {
      padding-right: 2px; // 滚动条效果距离
    }
    .vmp-lottery-wrap {
      min-height: 64px;
      max-height: 216px;
      overflow: auto;
    }
    .vmp-win-lottery {
      margin-left: 35px;

      &:last-child .vmp-lottery-content-wrap {
        padding-bottom: 0;
      }
    }
    .vmp-lottery-content-wrap {
      padding-left: 15px;
      padding-bottom: 12px;
      border-left: 1px dashed #d3cecf;
      position: relative;
      .circle {
        display: inline-block;
        width: 11px;
        height: 11px;
        position: absolute;
        top: 16px;
        left: -7px;
        border-radius: 50%;
        background: #fff4f4;
        border: 1px solid;
        border-color: #d3cecf;
      }
      .dot {
        display: inline-block;
        width: 7px;
        height: 7px;
        border-radius: 50%;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
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
        .vmp-lottery-content {
          cursor: pointer;
        }
      }
    }
    .vmp-lottery-content {
      width: 297px;
      height: 64px;
      box-sizing: border-box;
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

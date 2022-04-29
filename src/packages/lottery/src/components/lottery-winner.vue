<template>
  <div class="winner-list">
    <div
      class="custom-lottery-box"
      :class="prizeInfo && !prizeInfo.award_name ? 'custom-lottery-box-default' : ''"
    >
      <div class="custom-lottery">
        <img :src="(prizeInfo && prizeInfo.image_url) || defaultLotteryImg" alt="" />
      </div>
      <p
        class="custom-lottery__name"
        :class="prizeInfo && !prizeInfo.award_name ? 'custom-lottery__name-default' : ''"
      >
        {{ (prizeInfo && prizeInfo.award_name) || $t('interact_tools.interact_tools_1009') }}
      </p>
    </div>
    <!-- 列表 -->
    <div class="lottery-winner-list">
      <div class="lottery-winner-list__header" :class="{ 'is-scroll': isScroll }">
        {{ $t('interact_tools.interact_tools_1020') }}
      </div>
      <ul class="lottery-winner-list__body" @scroll="handleScroll">
        <li
          v-for="item in winnerList"
          :key="item.lottery_user_id"
          class="lottery-winner-list__item"
        >
          <p class="winner-avatar">
            <img
              class="winner-avatar-img"
              :src="item.lottery_user_avatar || defaultAvatarImg"
              alt=""
            />
          </p>
          <p class="winner-name">{{ item.lottery_user_nickname }}</p>
        </li>
      </ul>
    </div>
    <span v-if="mode === 'live'" @click="reStart" class="continue-btn-box">
      <i class="continue-btn">继续抽奖</i>
    </span>
    <!-- 关闭按钮 -->
    <i class="winner-list__close-btn vh-iconfont vh-line-circle-close" @click="close"></i>
  </div>
</template>
<script>
  /**
   * @description 中奖列表(发起端)
   */
  export default {
    name: 'LotteryWinner',
    inject: ['lotteryServer'],
    props: {
      mode: {
        type: String
      },
      winnerList: {
        type: Array,
        required: true,
        default() {
          return [];
        }
      },
      // 奖品信息
      prizeInfo: {
        type: Object,
        default() {
          return {};
        }
      }
    },
    data() {
      return {
        // prizeInfo: {}, // 奖品信息
        isScroll: false,
        defaultAvatarImg: require('../img/avatar.png'),
        defaultLotteryImg: require('../img/default-lottery.png')
      };
    },
    mounted() {},
    created() {
      console.log(this.winnerList, 'winnerList');
    },
    methods: {
      handleScroll(e) {
        // 滚动的像素+容器的高度>可滚动的总高度-100像素
        if (e.srcElement.scrollTop > 0) {
          this.isScroll = true;
        } else {
          this.isScroll = false;
        }
      },
      close() {
        this.$emit('close');
      },
      reStart() {
        this.$emit('reStart');
      }
    }
  };
</script>
<style lang="less" scoped>
  .winner-list {
    width: 424px;
    height: 469px;
    background: url(../img/bg-winner-list.png);
    position: fixed;
    left: 50%;
    margin-left: -212px;
    top: 50%;
    margin-top: -238px;
    border-radius: 6px;
    z-index: 777;
    .continue-btn-box {
      width: 142px;
      height: 42px;
      line-height: 40px;
      text-align: center;
      border-radius: 20px;
      position: absolute;
      left: 50%;
      top: 422px;
      margin-left: -71px;
      background-color: #ff6e07;
      background: linear-gradient(180deg, #ffe4cd 0%, #f3760d 100%);
      .continue-btn {
        position: absolute;
        left: 2px;
        top: 2px;
        width: 138px;
        height: 36px;
        line-height: 36px;
        border-radius: 18px;
        background: linear-gradient(180deg, #fdfbf7 0%, #fed092 100%);
        color: #e50000;
        font-weight: 500;
        font-size: 14px;
        font-style: normal;
        cursor: pointer;
      }
    }
    .custom-lottery-box {
      width: 106px;
      height: 106px;
      position: relative;
      margin-top: 30px;
      margin-left: 50%;
      transform: translate(-50%, 0);
      &-default {
        width: 120px;
      }
      .custom-lottery {
        width: 100px;
        height: 100px;
        border-radius: 60px;
        overflow: hidden;
        background-color: #ffc95e;
        border: 3px solid #ffc95e;
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
      .custom-lottery__name {
        position: absolute;
        top: 79px;
        background-color: #ff962e;
        border-radius: 16px;
        line-height: 30px;
        padding: 0 13px;
        white-space: nowrap;
        margin-left: 50%;
        transform: translate(-50%, 0);
        color: #ffffff;
        font-size: 16px;
        &-default {
          top: 88px;
        }
      }
    }
    .custom-lottery__default-name {
      position: absolute;
      top: 79px;
      background-color: #ff962e;
      border-radius: 16px;
      line-height: 30px;
      padding: 0 13px;
      white-space: nowrap;
      margin-left: 50%;
      transform: translate(-50%, 0);
      color: #ffffff;
      font-size: 16px;
    }
    .lottery-winner-list {
      height: 250px;
      width: 268px;
      background-color: rgba(255, 255, 255, 0.8);
      border-radius: 8px;
      position: absolute;
      bottom: 54px;
      left: 50%;
      transform: translateX(-134px);
      padding-right: 1px;
      ::-webkit-scrollbar {
        width: 6px; // 横向滚动条
        height: 6px; // 纵向滚动条 必写
      }
      // 滚动条的滑块
      ::-webkit-scrollbar-thumb {
        border-radius: 5px;
        transition: all 0.3s;
        cursor: pointer;
        display: none;
        background-color: #e0e0e0;
      }
      ::-webkit-scrollbar-track {
        background-color: transparent;
      }
      &:hover {
        ::-webkit-scrollbar-thumb {
          display: block;
        }
      }
      .lottery-winner-list__header {
        height: 26px;
        line-height: 28px;
        color: #666666;
        font-size: 12px;
        padding-left: 12px;
        &.is-scroll {
          box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.1);
        }
      }
      .lottery-winner-list__body {
        height: 215px;
        overflow-y: auto;
        overflow-x: hidden;
        .lottery-winner-list__item {
          height: 40px;
          padding-left: 17px;
          display: flex;
          align-items: center;
          .winner-avatar {
            &-img {
              width: 24px;
              height: 24px;
              border-radius: 50%;
              overflow: hidden;
              object-fit: cover;
            }
          }
          .winner-name {
            font-size: 14px;
            color: #1a1a1a;
            padding-left: 7px;
            max-width: 120px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            flex: 1;
          }
        }
      }
    }
    &__close-btn {
      position: absolute;
      bottom: -36px;
      left: 50%;
      transform: translateX(-15px);
      font-size: 30px;
      color: #ffffff;
      cursor: pointer;
    }
  }
</style>

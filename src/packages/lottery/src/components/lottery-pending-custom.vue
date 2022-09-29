<template>
  <div class="vmp-lottery-pending-custom">
    <!-- 标题 -->
    <!-- <p v-if="fitment.title" class="lottery-title">{{ fitment.title }}</p> -->
    <!-- 发送参与 -->
    <i18n v-if="needJoin" path="interact_tools.interact_tools_1065" tag="p">
      <span class="lottery-remark-custom" place="n">{{ command }}</span>
    </i18n>
    <p v-else class="lottery-remark-custom">
      {{ fitment.text || `${$t('interact_tools.interact_tools_1002')}....` }}
    </p>
    <div class="lottery-pending-wrap">
      <img class="lottery-pending-animation" :src="fitment.url" alt />
    </div>
    <button v-if="needJoin && mode === 'watch'" class="vmp-lottery-btn" @click="joinLottery">
      {{ $t('interact_tools.interact_tools_1008') }}
    </button>
  </div>
</template>
<script>
  export default {
    name: 'LotteryPendingCustom',
    props: {
      command: {
        type: String,
        default() {
          return '';
        }
      },
      needJoin: {
        required: true,
        type: Boolean
      },
      fitment: {
        required: true,
        type: Object,
        default() {
          return {};
        }
      },
      mode: {
        // 是否显示结束抽奖(发起端)
        type: String,
        default() {
          return 'watch';
        }
      }
    },
    methods: {
      // 发送口令
      joinLottery() {}
    }
  };
</script>
<style lang="less">
  .vmp-lottery-pending-custom {
    text-align: center;
    color: #ffebc9;
    text-shadow: 0px 1px 3px rgba(218, 111, 17, 0.6);
    .lottery-title {
      font-weight: 500;
      font-size: 16px;
      margin-bottom: 3px;
      line-height: 22px;
    }
    .lottery-remark-custom {
      position: static !important;
      font-size: 12px;
      line-height: 16px;
      text-align: center;
    }
    .lottery-pending-wrap {
      width: 400px;
      height: 380px;
      background-size: 100%;
      background-repeat: no-repeat;
      background-position: center;
      position: relative;
    }
    .lottery-pending-animation {
      position: absolute;
      width: 300px; // 默认的转轮
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  }
</style>

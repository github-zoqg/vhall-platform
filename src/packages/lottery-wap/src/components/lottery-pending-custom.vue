<template>
  <div class="vmp-lottery-pending-custom">
    <!-- 标题 -->
    <p v-if="fitment.title" class="lottery-title">{{ fitment.title }}</p>
    <!-- 发送参与 -->
    <i18n v-if="needJoin" path="interact_tools.interact_tools_1065" tag="p">
      <span class="lottery-remark" place="n">{{ command }}</span>
    </i18n>
    <p v-else class="lottery-remark">
      {{ fitment.text || `${$t('interact_tools.interact_tools_1002')}....` }}
    </p>
    <div class="lottery-pending-wrap">
      <img class="lottery-pending-animation" :src="fitment.url" alt />
    </div>
    <button v-if="needJoin" class="vmp-lottery-btn" @click="joinLottery">
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
    text-shadow: 0px 3px 6px rgba(218, 111, 17, 0.6);
    .lottery-title {
      font-weight: 500;
      font-size: 32px;
      margin-bottom: 6px;
      line-height: 44px;
    }
    .lottery-remark {
      font-size: 24px;
      line-height: 32px;
    }
    .lottery-pending-wrap {
      width: 700px;
      height: 550px;
      background-image: url('../img/lottery-pendding-bg.png');
      background-size: 100%;
      background-repeat: no-repeat;
      background-position: center;
      position: relative;
    }
    .lottery-pending-animation {
      position: absolute;
      width: 475px; // 默认的转轮
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  }
</style>

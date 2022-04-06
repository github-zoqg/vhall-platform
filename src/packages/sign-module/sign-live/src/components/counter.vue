<template>
  <div class="sign-live-counter" functional>
    <h3 :class="autoSign ? '' : 'autoNotSignTop'">{{ title || '主持人发起了签到' }}</h3>
    <p>{{ tip }}</p>
    <CountDown
      class="sign-live-counter-down"
      :duration="total"
      :consume="remaining"
      :redius="94"
    ></CountDown>
    <div class="sign-live-counter-end" v-if="autoSign">
      <el-button
        type="primary"
        round
        class="sign-live-counter-end-btn"
        @click="$emit('close-sign')"
      >
        结束签到
      </el-button>
      <p>设置自动签到，在控制台/当前活动/互动统计/签到查看数据</p>
    </div>
  </div>
</template>

<script>
  import CountDown from './countDown';
  export default {
    name: 'signinCounter',
    components: { CountDown },
    props: {
      total: {
        type: Number,
        default: 30
      },
      remaining: {
        type: Number,
        default: 0
      },
      autoSign: Boolean,
      title: String
    },
    computed: {
      tip() {
        return this.autoSign ? '正在签到中，距下一次签到还剩' : '正在签到中…';
      }
    }
  };
</script>

<style lang="less">
  .sign-live-counter {
    text-align: center;
    padding-top: 170px;
    &-down {
      margin: 0 auto;
    }
    > h3 {
      font-size: 14px;
      color: #1a1a1a;
      font-weight: 600;
      padding-bottom: 10px;
      &.autoNotSignTop {
        padding-top: 20px;
      }
    }
    > p {
      font-size: 14px;
      color: #666;
    }
    &-end {
      margin-top: 10px;
      &-btn {
        width: 160px;
        line-height: 20px;
        color: #fff;
      }
      > p {
        margin-top: 30px;
        font-size: 12px;
        color: #888;
      }
    }
  }
</style>

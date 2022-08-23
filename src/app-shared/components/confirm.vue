<template>
  <section class="subscribe-wap-auth" @click.self="close">
    <div>
      <div class="title-box">
        <p class="title">
          {{ title }}
        </p>
        <i class="vh-iconfont vh-line-close" v-if="isShowClose" @click="close"></i>
      </div>
      <div class="content">
        <slot name="content"></slot>
      </div>
      <div class="footer" :style="`width: ${width}`" @click="sure">
        {{ titleBtn || $t('account.account_1062') }}
      </div>
    </div>
  </section>
</template>
<script>
  export default {
    name: 'subscribeAlert',
    props: {
      title: {
        type: String,
        default: ''
      },
      titleBtn: {
        type: String,
        default: ''
      },
      isShowClose: {
        type: Boolean,
        default: true
      },
      width: {
        type: String,
        default: ''
      }
    },
    methods: {
      sure() {
        this.$emit('authSubmit');
      },
      close() {
        this.$emit('authClose');
      }
    }
  };
</script>
<style lang="less">
  .subscribe-wap-auth {
    position: fixed;
    top: 0;
    z-index: 100;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0 60px;
    font-family: PingFangSC;
    > div {
      width: 100%;
      background-color: #fff;
      border-radius: 32px;
      padding: 40px 60px;
      .title-box {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        .title {
          font-size: 32px;
          font-weight: 600;
          color: #262626;
          line-height: 45px;
        }
        .vh-iconfont {
          font-size: 28px;
          color: #8c8c8c;
        }
      }
      .content {
        width: 100%;
        margin: 32px 0;
        background: #ffffff;
        font-size: 28px;
        display: flex;
        line-height: 40px;
        color: #262626;
        align-items: center;
        justify-content: center;
      }
      .footer {
        width: 340px;
        height: 80px;
        font-size: 28px;
        font-family: Arial, Helvetica, sans-serif;
        font-weight: 400;
        color: #fff;
        line-height: 80px;
        background: #fb2626;
        border-radius: 40px;
        text-align: center;
        margin: 0 auto;
      }
    }
  }
</style>

<template>
  <section class="subscribe-wap-auth" @click.self="close">
    <div>
      <div class="title-box">
        <!-- 7.0.6迭代删除
        <p class="title">{{ optionInfo.title || '' }}</p> -->
        <p class="sub-title">{{ optionInfo.placeHolder || '' }}</p>
      </div>
      <div class="content">
        <input type="text" v-model="textAuth" />
      </div>
      <div class="footer" @click.stop="sure">{{ $t('account.account_1062') }}</div>
    </div>
  </section>
</template>
<script>
  export default {
    name: 'subscribeAuth',
    props: {
      optionInfo: {
        type: Object,
        default: () => {}
      }
    },
    data() {
      return {
        textAuth: ''
      };
    },
    methods: {
      sure() {
        this.$emit('authSubmit', this.textAuth);
      },
      close() {
        this.textAuth = '';
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
      border-radius: 14px;
      padding-top: 36px;
      .title-box {
        text-align: center;
        .title {
          font-size: 36px;
          font-weight: 400;
          color: rgba(0, 0, 0, 1);
          line-height: 30px;
        }
        .sub-title {
          margin-top: 18px;
          font-size: 30px;
          font-weight: 400;
          color: rgba(136, 136, 136, 1);
          line-height: 45px;
        }
      }
      .content {
        padding: 18px 40px;
        border-bottom: 1px solid rgba(221, 221, 221, 1);
        input {
          width: 100%;
          height: 72px;
          background: rgba(255, 255, 255, 1);
          border-radius: 16px;
          border: 2px solid rgba(221, 221, 221, 1);
          text-align: center;
          font-size: 30px;
        }
      }
      .footer {
        height: 100px;
        font-size: 36px;
        font-family: PingFangSC;
        font-weight: 400;
        color: rgba(252, 86, 89, 1);
        display: flex;
        justify-content: center;
        align-items: center;
      }
    }
  }
</style>

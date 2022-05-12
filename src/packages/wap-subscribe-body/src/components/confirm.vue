<template>
  <section class="subscribe-wap-auth" @click.self="close">
    <div>
      <div class="title-box">
        <p class="title" v-if="!isStartLiving">
          {{ optionInfo.title || '' }}
        </p>
        <p v-else></p>
        <i class="vh-iconfont vh-line-close" @click="close"></i>
      </div>
      <template v-if="isStartLiving">
        <div class="living-start">
          <span class="living-img">
            <img src="../img/live_start.png" alt="" />
          </span>
          <p class="living-text">{{ $t('player.player_1018') }}</p>
          <p class="footer" @click="startWatch">{{ $t('player.player_1013') }}</p>
        </div>
      </template>
      <template v-else>
        <div class="content">
          <input
            :type="`${isHidden ? 'password' : 'text'}`"
            v-model="textAuth"
            :placeHolder="optionInfo.placeHolder"
          />
          <i
            :class="`vh-iconfont ${isHidden ? 'vh-line-hidden' : 'vh-line-view'}`"
            @click="isHidden = !isHidden"
          ></i>
        </div>
        <div class="footer" @click.stop="sure">{{ $t('account.account_1062') }}</div>
      </template>
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
      },
      isStartLiving: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        isHidden: true,
        textAuth: ''
      };
    },
    methods: {
      sure() {
        this.$emit('authSubmit', this.textAuth);
      },
      startWatch() {
        this.$emit('startWatch');
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
      border-radius: 32px;
      padding: 50px 60px;
      .title-box {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        .title {
          font-size: 32px;
          font-weight: 500;
          color: #262626;
          line-height: 45px;
        }
        .vh-iconfont {
          font-size: 20px;
          color: #8c8c8c;
        }
      }
      .content {
        width: 100%;
        margin: 32px 0;
        background: #ffffff;
        border: 2px solid #d9d9d9;
        border-radius: 8px;
        height: 80px;
        font-size: 28px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        input {
          width: 92%;
          padding: 0 12px;
          font-size: 28px;
          &::-webkit-input-placeholder {
            color: #bfbfbf;
          }
        }
        .vh-iconfont {
          display: inline-block;
          width: 8%;
          font-size: 28px;
          color: #8c8c8c;
        }
      }
      .footer {
        height: 80px;
        font-size: 28px;
        font-family: PingFangSC;
        font-weight: 400;
        color: #fff;
        line-height: 80px;
        background: #fb2626;
        border-radius: 40px;
        text-align: center;
      }
      .living-start {
        width: 100%;
        margin-top: 32px;
        background: #ffffff;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
        .living-img {
          display: inline-block;
          width: 160px;
          height: 160px;
          img {
            width: 100%;
            height: 100%;
            object-fit: scale-down;
          }
        }
        .living-text {
          padding: 20px 0 40px;
          color: #262626;
          font-size: 28px;
          line-height: 40px;
        }
        .footer {
          width: 340px;
        }
      }
    }
  }
</style>

<template>
  <div class="lottery">
    <p class="tips" style="text-align: left; padding: 30px 0px">
      {{ $t('interact_tools.interact_tools_1018') }}
    </p>
    <ul v-if="winForm.length > 0">
      <li v-for="(item, index) in winForm" :key="index">
        <span class="must" style="color: red">
          {{ item.is_required == 1 ? '*' : '' }}
        </span>
        <div class="form-item">
          <input
            type="text"
            :placeholder="$tdefault(item.placeholder)"
            style="line-height: normal"
            autocomplete="off"
            v-model="item.field_value"
            @input="handleInput(index)"
            @blur="textBlur"
          />
          <span class="word-length">
            <i
              :style="{
                color: item.field_value.length >= item.maxLength ? '#fc5459' : '#333'
              }"
            >
              {{ item.field_value.length }}
            </i>
            /{{ item.maxLength }}
          </span>
        </div>
      </li>
    </ul>
    <ul v-else>
      <li>
        <div>
          <input
            type="text"
            :placeholder="$t('interact_tools.interact_tools_1005')"
            style="line-height: normal"
            autocomplete="off"
            v-model="name"
            @blur="textBlur"
          />
        </div>
      </li>
      <li>
        <div>
          <input
            type="tel"
            :placeholder="$t('account.account_1049')"
            style="line-height: normal"
            autocomplete="off"
            v-model.trim="phone"
            @blur="textBlur"
          />
        </div>
      </li>
    </ul>
    <button @click="submit" :class="['get-award', verified ? '' : 'disabled']">
      {{ $t('interact_tools.interact_tools_1019') }}
    </button>
  </div>
</template>

<script>
  import props from './props';
  export default {
    name: 'LotteryAccept',
    mixins: [props],
    inject: ['lotteryServer'],
    data() {
      return {
        name: '',
        phone: '',
        remarks: '',
        winForm: [], // 中奖信息表单
        verified: false
      };
    },
    async created() {
      await this.winFromInfo();
    },
    watch: {
      winForm: {
        deep: true,
        handler(forms) {
          this.verified = forms.every(form => {
            return form.is_required !== 1 || form.field_value.trim() !== '';
          });
        }
      }
    },
    methods: {
      handleInput(e) {
        const formItem = this.winForm[e];
        if (formItem.field_value.length > formItem.maxLength) {
          this.winForm[e].field_value = formItem.field_value.substr(0, formItem.maxLength);
        }
      },
      textBlur() {
        // window.scroll(0, 0)
      },
      async winFromInfo() {
        await this.lotteryServer.getDrawPrizeInfo().then(res => {
          if (res.data && res.data.length > 0) {
            res.data.map(item => {
              if (item.field_key == 'phone') {
                item.maxLength = 11;
              } else {
                item.maxLength = 200;
              }
              item.field_value = '';
              return item;
            });
            this.winForm = res.data;
          }
        });
      },
      submit() {
        if (this.winForm.length > 0) {
          const unCheck = this.winForm.find(item => {
            if ((item.is_required == 1) == 1 && item.field_value == '') {
              this.$toast(
                `${this.$t('interact_tools.interact_tools_1066')} ${
                  !item.field.includes('自定义') ? this.$t(item.field) : ''
                }`
              );
              return true;
            } else if (item.field_key == 'phone') {
              const phone = item.field_value.replace(/\s/g, '');
              const regs = /^1(3|4|5|6|7|8|9)\d{9}$/;
              if (!regs.test(phone)) {
                this.$toast(`手机号格式错误`);
                return true;
              } else {
                return false;
              }
            } else {
              return false;
            }
          });
          if (unCheck) return;
        }
        this.lotteryServer
          .acceptPrize({
            lottery_user_name: this.winForm[0].field_value,
            lottery_user_phone: this.winForm[1].field_value,
            lottery_user_remark: JSON.stringify(this.winForm),
            lottery_id: this.lotteryId
          })
          .then(() => {
            this.lotteryServer.$emit(this.lotteryServer.Events.LOTTERY_SUBMIT);
            this.lotteryServer.initIconStatus();
            this.$toast(this.$t('interact_tools.interact_tools_1067'));
            this.$nextTick(() => {
              this.$emit('navTo', 'LotterySuccess');
            });
          })
          .catch(e => {
            this.$toast(this.$t(e.msg));
          });
      }
    }
  };
</script>
<style lang="less" scoped>
  .lottery {
    p {
      padding: 0px !important;
      margin: 0px !important;
      text-indent: 30px;
    }
    ul > li {
      display: flex;
      flex-direction: row;
      align-items: center;
      margin-bottom: 32px;
    }
    .must {
      display: inline-block;
      width: 8px;
      height: 100%;
    }
    .form-item {
      width: 94%;
      margin-left: 16px;
      position: relative;
      img {
        width: 100%;
      }
      input {
        display: inline-block;
        width: 75%;
      }
      .word-length {
        display: inline-block;
        position: absolute;
        right: 0px;
        top: 0px;
        font-size: 14px;
        color: #333;
        padding-right: 10px;
      }
    }
    .get-award {
      display: block;
      width: 364px !important;
      height: 90px;
      background: #fb3a32;
      border-radius: 14px;
      color: #fff;
      margin: 56px auto 0px auto;
      &.disabled {
        opacity: 0.7;
        pointer-events: none;
      }
    }
  }
  .tips {
    font-size: 28px;
    font-family: PingFangSC;
    font-weight: 400;
    color: rgba(68, 68, 68, 1);
    margin: 20px 0;
    text-align: center;
  }
  ul {
    padding: 0 30px;
    li {
      margin-top: 30px;
      height: 86px;
      line-height: 86px;
      color: #444444;
      font-size: 36px;
      > div {
        width: 100%;
        // border: 1px solid #979797;
        position: relative;
        border-width: 0;
        input {
          background-color: transparent;
          position: relative;
          z-index: 1;
        }
        &::after {
          content: ' ';
          width: 200%;
          height: 200%;
          position: absolute;
          top: 0;
          left: 0;
          /* prettier-ignore */
          border: 1px solid #979797;
          transform: scale(0.5);
          transform-origin: 0 0;
          box-sizing: border-box;
          border-radius: 16px;
        }

        padding-left: 20px;
        height: 100%;
        display: block;
        input {
          font-size: 30px;
          display: block;
          width: 100%;
          font-weight: 400;
          color: #333;
          height: 100%;
          transform: translate3d(0, 0, 0);
        }
      }
      &.active {
        color: white;
        background-color: #fc5459;
        position: relative;
        border-width: 0;
        input {
          background-color: transparent;
          position: relative;
          z-index: 1;
        }
        &::after {
          content: ' ';
          width: 200%;
          height: 200%;
          position: absolute;
          top: 0;
          left: 0;
          /* prettier-ignore */
          border: 1px solid #fc5459;
          transform: scale(0.5);
          transform-origin: 0 0;
          box-sizing: border-box;
          border-radius: 16px;
        }
      }
    }
  }
</style>

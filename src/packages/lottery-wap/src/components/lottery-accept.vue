<template>
  <div class="lottery-accept">
    <header class="title">{{ title }}</header>
    <section class="form-wrap">
      <ul class="form">
        <li class="form-item" v-for="(item, index) in winForm" :key="index">
          <div :class="[item.is_required === 1 ? 'required' : '', 'form-item__input']">
            <div class="input-warp">
              <input
                class="form-inpput"
                v-model="item.field_value"
                type="text"
                :maxlength="item.maxLength"
                :placeholder="$tdefault(item.placeholder)"
                autocomplete="off"
              />
            </div>
          </div>
          <div class="form-item__error">
            <span v-if="item.error">
              {{ item.field_key | errorMsg }}
            </span>
          </div>
        </li>
      </ul>
      <div @click="submit" :class="['vmp-lottery-btn', 'submit-btn', verified ? '' : 'disabled']">
        {{ $t('interact_tools.interact_tools_1019') }}
      </div>
    </section>
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
        winForm: [], // 中奖信息表单
        verified: false
      };
    },
    computed: {
      title() {
        return this.fitment.title || this.$t('interact_tools.interact_tools_1003');
      }
    },
    filters: {
      errorMsg(fieldKey = '') {
        const map = {
          name: '姓名',
          address: '地址',
          phone: '手机号'
        };
        const field = map[fieldKey] || '';
        return `请输入正确的信息${field}`;
      }
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
    created() {
      this.initFromInfo();
    },
    methods: {
      initFromInfo() {
        this.lotteryServer.getDrawPrizeInfo().then(res => {
          if (res.data && res.data.length > 0) {
            res.data.map(item => {
              if (item.field_key == 'phone') {
                item.maxLength = 11;
              } else {
                item.maxLength = 200;
              }
              item.field_value = '';
              item.error = false;
            });
            this.winForm = res.data;
          }
        });
      },
      /**
       * @description 验证数据
       */
      verify() {
        let relt = true;
        this.winForm.map(item => {
          if (item.field_key == 'phone') {
            const phone = item.field_value.replace(/\s/g, '');
            const regs = /^1(3|4|5|6|7|8|9)\d{9}$/;
            if (!regs.test(phone)) {
              item.error = true;
              relt = false;
            }
          } else if ((item.is_required == 1) == 1 && item.field_value == '') {
            item.error = true;
            relt = false;
          } else {
            item.error = false;
          }
        });
        return relt;
      },
      submit() {
        if (!this.verify()) return false;
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
            if (this.showWinnerList) {
              this.$emit('navTo', 'LotterySuccess');
            } else {
              this.$toast(this.$t('interact_tools.interact_tools_1013'));
              this.$emit('close');
            }
          })
          .catch(e => {
            this.$toast(this.$t(e.msg));
          });
      }
    }
  };
</script>
<style lang="less">
  .lottery-accept {
    .title {
      height: 100px;
      font-weight: 500;
      font-size: 32px;
      color: #262626;
      text-align: center;
      line-height: 100px;
      border-bottom: 1px solid #f0f0f0;
    }
    .form-wrap {
      padding: 0 32px;
      margin: 50px 0 60px;
    }
    .form-item {
      &__input {
        position: relative;
        padding-left: 37px;
        border-bottom: 1px solid rgba(#c2c2c2, 0.5);
        &.required:before {
          display: inline-block;
          width: 12px;
          height: 12px;
          position: absolute;
          top: 10px;
          left: 12px;
          content: '*';
          font-size: 24px;
          color: #fb2626;
          display: inline-block;
        }
      }
      &__error {
        height: 40px;
        padding-top: 6px;
        padding-left: 37px;
        font-size: 28px;
        color: #fb2626;
      }
    }
    .input-warp {
      height: 40px;
      margin: 12px 0 25px;
    }
    .form-inpput {
      width: 100%;
      outline: 0;
      font-size: 28px;
      color: #262626;
      &::-webkit-input-placeholder {
        color: #bfbfbf;
      }
    }
    .submit-btn {
      width: 686px;
      &.disabled {
        pointer-events: none;
        opacity: 0.4;
      }
    }
  }
</style>

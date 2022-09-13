<template>
  <div class="lottery-accept">
    <header class="title">{{ title }}</header>
    <div class="form-wrap">
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
      <button @click="submit" :class="['submit-btn', verified ? '' : 'disabled']">
        {{ $t('interact_tools.interact_tools_1019') }}
      </button>
      <!-- 隐私合规（嵌入不展示） -->
      <vmp-privacy-compliance
        scene="lottery"
        clientType="mobile"
        compType="2"
      ></vmp-privacy-compliance>
    </div>
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
          if (item.field_key == 'phone' && (item.field_value !== '' || item.is_required === 1)) {
            // 当手机号为必填,或者有输入手机号才正则校验
            const phone = item.field_value.replace(/\s/g, '');
            const regs = /^1(3|4|5|6|7|8|9)\d{9}$/;
            if (!regs.test(phone)) {
              item.error = true;
              relt = false;
            }
          } else if (item.is_required === 1 && item.field_value == '') {
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
        const failure = err => {
          this.$toast(this.$t(err.msg));
        };
        this.lotteryServer
          .acceptPrize({
            lottery_user_name: this.winForm[0].field_value,
            lottery_user_phone: this.winForm[1].field_value,
            lottery_user_remark: JSON.stringify(this.winForm),
            lottery_id: this.lotteryId
          })
          .then(res => {
            if (res.code === 200) {
              this.lotteryServer.$emit(this.lotteryServer.Events.LOTTERY_SUBMIT);
              this.lotteryServer.initIconStatus();
              if (this.showWinnerList) {
                this.$emit('navTo', 'LotterySuccess');
              } else {
                this.$toast(this.$t('interact_tools.interact_tools_1013'));
                this.$emit('close');
              }
            } else {
              failure(res);
            }
          })
          .catch(err => {
            failure(err);
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
    }
    .form-wrap {
      padding: 0 8px; // 给滚动条样式留空间
      margin: 50px 0 60px;
    }
    .form {
      padding: 0 24px;
      max-height: 498px;
      overflow: auto;
    }
    .form-item {
      &__input {
        position: relative;
        padding-left: 37px;
        border-bottom: 1px solid rgba(#f0f0f0);
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
      height: 32px;
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
      display: block;
      width: 686px;
      height: 90px;
      margin: 0 auto;
      background: #fb2626;
      border-radius: 45px;
      line-height: 90px;
      text-align: center;
      font-size: 32px;
      color: #fff;
      &.disabled {
        pointer-events: none;
        opacity: 0.4;
      }
    }
    ::-webkit-scrollbar {
      width: 8px;
    }
    ::-webkit-scrollbar-thumb {
      //滚动条的设置
      background-color: #ccc;
      background-clip: padding-box;
      border-radius: 4px;
    }
  }
</style>

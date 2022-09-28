<template>
  <div class="lottery-box lottery-accept">
    <lotteryTitle title="提交信息" />
    <div class="form-wrap">
      <ul class="form">
        <li class="form-item" v-for="(item, index) in winForm" :key="index">
          <div :class="[item.is_required === 1 ? 'required' : '', 'form-item__input']">
            <input
              class="form-inpput"
              v-model="item.field_value"
              type="text"
              :maxlength="item.maxLength"
              :placeholder="$tdefault(item.placeholder)"
              autocomplete="off"
            />
          </div>
          <div class="form-item__error">
            <span v-if="item.error">
              {{ item.field_key | errorMsg }}
            </span>
          </div>
        </li>
      </ul>
      <button @click="submit" :class="['vmp-lottery-btn', verified ? '' : 'disabled']">
        {{ $t('interact_tools.interact_tools_1019') }}
      </button>
      <!-- 隐私合规（嵌入不展示） -->
      <vmp-privacy-compliance
        class="privacy"
        scene="lottery"
        clientType="pc"
        compType="2"
      ></vmp-privacy-compliance>
    </div>
  </div>
</template>

<script>
  import props from './props';
  import lotteryTitle from './lottery-title.vue';
  export default {
    name: 'LotteryAccept',
    components: {
      lotteryTitle
    },
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
            this.fillUserInfo();
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
      },
      // 用户信息预填
      fillUserInfo() {
        this.lotteryServer.getLotteryUserInfo().then(res => {
          const data = res.data;
          data &&
            this.winForm.map(item => {
              if (item.field_key == 'name') {
                // 当手机号为必填,或者有输入手机号才正则校验
                item.field_value = data.lottery_user_name;
                item.error = false;
              } else if (item.field_key == 'phone') {
                item.field_value = data.lottery_user_phone;
              } else if (item.field_key == 'address') {
                item.field_value = data.lottery_user_address;
              }
            });
        });
      }
    }
  };
</script>
<style lang="less">
  .lottery-accept {
    box-sizing: border-box;
    .title {
      height: 50px;
      font-weight: 500;
      font-size: 16px;
      color: #262626;
      text-align: center;
      line-height: 50px;
    }
    .form-wrap {
      // padding: 0 4px; // 给滚动条样式留空间
      // margin: 16px 0 0;
    }
    .form {
      // padding: 0 12px;
      max-height: 640px;
      overflow: auto;
    }
    .form-item {
      height: 44px;
      background: #ffffff;
      border-radius: 4px;
      overflow: hidden;
      &:not(:last-child) {
        margin-bottom: 8px;
      }
      &__input {
        line-height: 44px;
        position: relative;
        padding-left: 28px;
        outline: none;
        border: none;
        &.required:before {
          display: inline-block;
          width: 6px;
          height: 6px;
          position: absolute;
          top: 2px;
          left: 16px;
          content: '*';
          font-size: 12px;
          color: #fb2626;
          display: inline-block;
        }
      }
      &__error {
        height: 20px;
        padding-top: 3px;
        padding-left: 18px;
        font-size: 14px;
        color: #fb2626;
      }
    }
    .form-inpput {
      width: 100%;
      outline: 0;
      font-size: 14px;
      color: #262626;
      outline: none;
      border: 0;
      &::-webkit-input-placeholder {
        color: #bfbfbf;
      }
    }
    .vmp-lottery-btn {
      margin-top: 10px;
      &.disabled {
        pointer-events: none;
        opacity: 0.4;
      }
    }
    .privacy {
      margin-top: 12px;
    }
    ::-webkit-scrollbar {
      width: 4px;
    }
    ::-webkit-scrollbar-thumb {
      //滚动条的设置
      background-color: #ccc;
      background-clip: padding-box;
      border-radius: 2px;
    }
  }
</style>

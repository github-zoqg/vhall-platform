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
          <div v-if="item.error" class="form-item__error">
            {{ item.field_key | errorMsg }}
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
      fmtRemark() {
        const remark = [];
        this.winForm.map(item => {
          remark.push({
            field_value: item.field_value, // 前端的新增值,其余的
            field: item.field,
            field_key: item.field_key,
            is_required: item.is_required,
            is_system: item.is_system,
            placeholder: item.placeholder,
            rank: item.rank
          });
        });
        return JSON.stringify(remark);
      },
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
        let result = true;
        this.winForm.map(item => {
          if (item.field_key == 'phone' && (item.field_value !== '' || item.is_required === 1)) {
            // 当手机号为必填,或者有输入手机号才正则校验
            const phone = item.field_value.replace(/\s/g, '');
            const regs = /^1(3|4|5|6|7|8|9)\d{9}$/;
            if (!regs.test(phone)) {
              item.error = true;
              result = false;
            }
          } else if (item.is_required === 1 && item.field_value == '') {
            item.error = true;
            result = false;
          } else {
            item.error = false;
          }
        });
        return result;
      },
      submit() {
        if (!this.verify()) return false;
        const failure = err => {
          this.$message({
            message: err.msg,
            showClose: true,
            type: 'error',
            customClass: 'zdy-info-box'
          });
        };
        this.lotteryServer
          .acceptPrize({
            lottery_user_name: this.winForm[0].field_value,
            lottery_user_phone: this.winForm[1].field_value,
            lottery_user_remark: this.fmtRemark(this.winForm),
            lottery_id: this.lotteryId
          })
          .then(res => {
            if (res.code === 200) {
              this.lotteryServer.$emit(this.lotteryServer.Events.LOTTERY_SUBMIT);
              this.lotteryServer.initIconStatus();
              this.$emit('navTo', 'LotterySuccess');
              // if (this.showWinnerList) {
              // } else {
              // this.$toast(this.$t('interact_tools.interact_tools_1013'));
              //   this.$emit('close');
              // }
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
    .form {
      max-height: 180px;
      overflow: auto;
    }
    .form-item {
      position: relative;
      height: 44px;
      background: #ffffff;
      border-radius: 4px;
      // overflow: hidden;
      &:not(:last-child) {
        margin-bottom: 24px;
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
        position: absolute;
        top: 45px;
        height: 20px;
        font-size: 12px;
        line-height: 20px;
        color: #fb2626;
      }
    }
    .form-inpput {
      width: 100%;
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

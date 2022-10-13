<template>
  <div class="lottery-box lottery-accept">
    <lotteryTitle :title="$t('interact_tools.interact_tools_1091')" />
    <div class="form-wrap">
      <ul class="form">
        <li class="form-item" v-for="(item, index) in winForm" :key="index">
          <div :class="[item.is_required === 1 ? 'required' : '', 'form-item__input']">
            <input
              v-if="['phone', 'name'].includes(item.field_key)"
              class="form-inpput"
              v-model="item.field_value"
              type="text"
              :maxlength="item.maxLength"
              :placeholder="$tdefault(item.placeholder)"
              autocomplete="off"
            />
            <textarea
              v-else
              class="form-inpput-textarea"
              v-model="item.field_value"
              rows="2"
              :maxlength="item.maxLength"
              :placeholder="$tdefault(item.placeholder)"
              autocomplete="off"
            />
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
        const errorItem = this.winForm.find(item => {
          if (item.field_key == 'phone' && (item.field_value !== '' || item.is_required === 1)) {
            // 当手机号为必填,或者有输入手机号才正则校验
            const phone = item.field_value.replace(/\s/g, '');
            const regs = /^1(3|4|5|6|7|8|9)\d{9}$/;
            if (!regs.test(phone)) {
              return true;
            }
          } else if (item.is_required === 1 && item.field_value == '') {
            return true;
          }
          return false;
        });
        if (errorItem) {
          this.$message({
            message: `请输入正确的信息${errorItem.field}`, // 只会校验手机号
            showClose: true,
            type: 'error',
            customClass: 'zdy-info-box'
          });
          return false;
        } else {
          return true;
        }
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
      max-height: 275px;
      overflow: auto;
    }
    .form-item {
      position: relative;
      background: #ffffff;
      border-radius: 4px;
      &:not(:last-child) {
        margin-bottom: 16px;
      }
      &__input {
        position: relative;
        padding: 10px 0 10px 28px;
        outline: none;
        border: none;
        &.required:before {
          display: inline-block;
          width: 6px;
          height: 6px;
          position: absolute;
          top: 18px;
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
    .form-inpput,
    .form-inpput-textarea {
      width: 100%;
      line-height: 24px;
      height: 24px;
      font-size: 14px;
      color: #262626;
      outline: none;
      border: 0;
      &::-webkit-input-placeholder {
        color: #bfbfbf;
      }
    }
    // 2行文本域
    .form-inpput-textarea {
      height: 42px;
      line-height: 1.5;
    }
    .vmp-lottery-btn {
      margin-top: 24px;
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

<template>
  <section>
    <!-- 弹窗1 -->
    <el-dialog :visible="popAlertCheckVisible">
      <section>
        <span>为保证直播顺利进行，推荐在直播开始前进行设备检测</span>
        <footer class="btnsbox">
          <button class="confirm" @click="popAlertCheckSubmit">
            {{ '设备检测' || $t('message.confirmText') }}
          </button>
          <button class="cancel" @click="popAlertCheckClose">
            {{ '暂不检测' || $t('message.cancelText') }}
          </button>
        </footer>
      </section>
    </el-dialog>

    <!-- 弹窗2 -->
    <el-dialog :visible="popAlertCheckConfirmVisible">
      <section>
        <span>直播前取消设备检测，将会影响直播质量，确定不检测？</span>
        <footer class="btnsbox">
          <button class="confirm" @click="popAlertCheckConfirmClose">
            {{ '立即检测 ' || $t('message.confirmText') }}
          </button>
          <button class="cancel" @click="popAlertCheckConfirm">
            {{ '不检测' || $t('message.cancelText') }}
          </button>
        </footer>
      </section>
    </el-dialog>
  </section>
</template>

<script>
  export default {
    data() {
      return {
        popAlertCheckVisible: true,
        popAlertCheckConfirmVisible: false
      };
    },
    methods: {
      show() {
        this.popAlertCheckVisible = true;
      },
      popAlertCheckSubmit() {
        this.popAlertCheckVisible = false;
        this.$emit('show');
      },
      popAlertCheckClose() {
        this.popAlertCheckVisible = false;
        this.$nextTick(() => {
          this.popAlertCheckConfirmVisible = true;
        }, 1000);
      },
      popAlertCheckConfirm() {
        this.popAlertCheckConfirmVisible = false;
      },
      popAlertCheckConfirmClose() {
        this.popAlertCheckConfirmVisible = false;
        this.$emit('show');
      }
    }
  };
</script>

<style lang="less" scoped>
  .btnsbox {
    text-align: right;
    position: absolute;
    bottom: 24px;
    right: 32px;
    button {
      border: none;
      box-shadow: none;
      outline: none;
      display: inline-block;
      height: 36px;
      line-height: 36px;
      border-radius: 18px;
      display: inline-block;
      margin-bottom: 0;
      font-size: 14px;
      color: #666;
      font-weight: 400;
      text-align: center;
      padding: 0 24px;
      &.confirm {
        background: #fb3a32;
        color: #ffffff;
      }
      &.cancel {
        border: 1px solid #ccc;
        color: #666666;
        line-height: 34px;
        margin-left: 12px;
        &:hover {
          background: #fb3a32;
          border-color: #fb3a32;
          color: #ffffff;
        }
      }
    }
  }
</style>

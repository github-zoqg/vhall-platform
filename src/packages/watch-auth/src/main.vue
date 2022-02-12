<template>
  <div class="vmp-auth">
    <el-dialog
      title="权限验证"
      :visible.sync="authVisible"
      :close-on-click-modal="false"
      width="400px"
    >
      <div class="vmp-auth-wrap">
        <div class="vmp-auth-wrap-text">
          <el-input
            :type="isHideEye ? 'text' : 'password'"
            v-model="authTitle"
            :placeholder="placeholder"
          >
            <i
              slot="suffix"
              @click="hideEye"
              :class="`iconfont ${isHideEye ? 'iconguankancishu' : 'iconyincang'}`"
            ></i>
          </el-input>
        </div>
        <div class="vmp-auth-wrap-btn">
          <el-button type="primary" round>确定</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>
<script>
  export default {
    name: 'VmpWatchAuth',
    data() {
      return {
        authVisible: false,
        isHideEye: false,
        placeholder: '请输入姓名/工单',
        authTitle: ''
      };
    },
    methods: {
      openAuthDialog() {
        this.authVisible = true;
      },
      hideEye() {
        this.isHideEye = !this.isHideEye;
      }
    }
  };
</script>
<style lang="less">
  .vmp-auth {
    &-wrap {
      padding-top: 12px;
      &-text {
        padding-bottom: 24px;
        .el-input__suffix {
          line-height: 40px;
          padding: 0 5px;
          cursor: pointer;
          .iconfont {
            font-size: 14px;
          }
        }
        .el-input__inner {
          padding-right: 40px;
        }
      }
      &-btn {
        text-align: right;
      }
    }
  }
</style>

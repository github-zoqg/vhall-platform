<!-- 新增分组 -->
<template>
  <div class="vmp-group-add">
    <el-dialog
      :visible="dialogVisible"
      @open="handlOpen"
      :before-close="handleClose"
      :close-on-click-modal="false"
      width="400px"
      title="新增分组"
    >
      <el-form class="add-form">
        <el-form-item label="新增" label-width="40px">
          <el-input :placeholder="placeholder" v-model="count">
            <template slot="suffix">组</template>
          </el-input>
        </el-form-item>
      </el-form>

      <!-- 底部按钮 -->
      <div slot="footer" class="vmp-group-ft">
        <el-button type="primary" :round="true" @click="handleSubmit">发布</el-button>
        <el-button :round="true" @click="handleClose">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
  export default {
    name: 'VmpGroupAdd',
    props: {
      show: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        dialogVisible: this.show,
        placeholder: '最多新增36组',
        count: 1
      };
    },
    watch: {
      show: function (newVal) {
        if (newVal) {
          this.dialogVisible = true;
        }
      }
    },
    methods: {
      handleSubmit() {},
      handlOpen() {},
      handleClose() {
        this.dialogVisible = false;
        this.$emit('update:show', false);
      }
    }
  };
</script>
<style lang="less">
  .vmp-group-add {
    .el-dialog__body {
      min-height: 32px !important;
    }

    .add-form {
      .el-form-item {
        margin-bottom: 0px;
        .el-form-item__label {
          color: #1a1a1a;
          font-weight: 400;
        }
        .el-form-item__content {
          margin-left: 40px;

          .el-input__suffix-inner {
            color: #666;
            padding: 2px 8px;
          }
        }
      }
    }
  }
</style>

<template>
  <!-- 新增分组弹窗 -->
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
          <el-input
            :placeholder="placeholder"
            v-model.trim.number="count"
            onkeyup="this.value=this.value.replace(/[^\d]/g,'')"
          >
            <template slot="suffix">组</template>
          </el-input>
        </el-form-item>
      </el-form>

      <!-- 底部按钮 -->
      <div slot="footer" class="vmp-group-ft">
        <el-button type="primary" :round="true" @click="handleThrottleSubmit()">确定</el-button>
        <el-button :round="true" @click="handleClose">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
  import { useGroupServer, useRoomBaseServer } from 'middle-domain';
  import { throttle } from 'lodash';

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
        count: 1
      };
    },
    beforeCreate() {
      this.groupServer = useGroupServer();
      this.roomBaseServer = useRoomBaseServer();
    },
    computed: {
      placeholder() {
        return `最多新增${50 - this.groupServer.state.groupedUserList.length}组`;
      }
    },
    watch: {
      show: function (newVal) {
        this.dialogVisible = newVal;
      }
    },
    mounted() {
      this.handleThrottleSubmit = throttle(this.handleSubmit, 300, { trailing: false });
    },
    methods: {
      // 新增分组确定
      handleSubmit: async function () {
        const c = parseInt(this.count);
        if (isNaN(c) || c < 1) {
          this.$message.warning('参数错误');
          return false;
        }
        const { watchInitData = {} } = this.roomBaseServer.state;
        try {
          const result = await this.groupServer.groupCreate({
            number: c,
            way: 2,
            switch_id: watchInitData.switch.switch_id,
            webinar_id: watchInitData.webinar.id
          });
          if (result && result.code === 200) {
            this.count = 1;
            this.handleClose();
          } else {
            this.$message.warning(result.msg || '新增分组失败');
          }
        } catch (ex) {
          this.$message.warning(ex.messge || '新增分组出现异常');
        }
      },
      handlOpen() {
        // this.placeholder = `最多新增$组`,
      },
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

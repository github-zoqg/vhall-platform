<template>
  <!-- 选择小组弹窗 -->
  <div class="vmp-group-choose">
    <el-dialog
      :visible="dialogVisible"
      @open="handleOpen"
      :before-close="handleClose"
      :close-on-click-modal="false"
      width="400px"
      title="提示"
    >
      <el-form class="group-form">
        <el-form-item label="选择小组" label-width="70px">
          <el-select v-model="selectGroup" style="width: 100%" placeholder="请选择">
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>

      <!-- 底部按钮 -->
      <div slot="footer" class="vmp-group-ft">
        <el-button type="primary" :round="true" @click="handleSubmit">确定</el-button>
        <el-button :round="true" @click="handleClose">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
  import { useGroupServer } from 'middle-domain';
  export default {
    name: 'VmpGroupChoose',
    props: {
      show: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        dialogVisible: this.show,
        selectGroup: '',
        options: []
      };
    },
    beforeCreate() {
      this.groupServer = useGroupServer();
    },
    computed: {
      // 已分组人员列表
      groupedUserList() {
        return this.groupServer.state.groupedUserList;
      }
    },
    watch: {
      show: function (newVal) {
        this.dialogVisible = newVal;
      }
    },
    methods: {
      // 确认换组
      handleSubmit() {
        this.$emit('chooseGroupComplete', this.selectGroup);
      },
      // 对话框打开时，设置可选小组
      handleOpen() {
        this.selectGroup = '';
        this.options = this.groupedUserList.map(item => {
          return {
            value: item.id,
            label: item.name
          };
        });
      },
      handleClose() {
        this.dialogVisible = false;
        this.$emit('update:show', false);
      }
    }
  };
</script>
<style lang="less">
  .vmp-group-choose {
    .el-dialog__body {
      min-height: 32px !important;
    }

    .group-form {
      .el-form-item {
        margin-bottom: 0px;
        .el-form-item__label {
          color: #1a1a1a;
          font-weight: 400;
        }
        .el-form-item__content {
          margin-left: 70px;
        }
      }
    }
  }
</style>

<template>
  <!-- 小组公告弹窗 -->
  <div class="vmp-group-notice">
    <el-dialog
      :visible="dialogVisible"
      @open="handlOpen"
      :before-close="handleClose"
      :close-on-click-modal="false"
      width="500px"
    >
      <template slot="title">
        <span class="title">小组公告</span>
        <div class="help-icon">
          <i class="el-tooltip iconfont iconicon_help_m"></i>
          <div class="help-tooltip">
            <p>1.小组公告仅适用于小组讨论开始后，向各小组成员发送消息</p>
            <p>2.小组公告发送后，仅小组内成员可见</p>
          </div>
        </div>
      </template>

      <el-input
        type="textarea"
        :rows="10"
        placeholder="请输入小组公告内容"
        v-model="notice"
        maxlength="300"
        show-word-limit
      ></el-input>

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
    name: 'VmpGroupNotice',
    props: {
      show: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        dialogVisible: this.show,
        notice: ''
      };
    },
    watch: {
      show: function (newVal) {
        this.dialogVisible = newVal;
      }
    },
    methods: {
      handlOpen() {},
      handleSubmit() {},
      handleClose() {
        this.dialogVisible = false;
        this.$emit('update:show', false);
      }
    }
  };
</script>
<style lang="less">
  .vmp-group-notice {
    .el-dialog__header {
      color: #1a1a1a;
      .title {
        font-size: 20px;
      }
      .help-icon {
        margin-left: 5px;
        display: inline;
        position: relative;
      }
      .help-tooltip {
        position: absolute;
        font-size: 12px;
        z-index: 1;
        left: 24px;
        top: -15px;
        padding: 6px;
        border-radius: 4px;
        width: 340px;
        background-color: #333;
        color: #fff;
        transition: all 0.5s;
        visibility: hidden;
        opacity: 0;
      }
      .help-icon:hover {
        .help-tooltip {
          visibility: visible;
          opacity: 1;
        }
      }
    }
    .vmp-group-ft {
      text-align: right;
    }
  }
</style>

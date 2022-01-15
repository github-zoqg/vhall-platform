<template>
  <div class="vmp-live-private-chat">
    <el-dialog
      :title="title"
      :visible.sync="visible"
      width="500px"
      custom-class="vmp-live-private-chat"
    >
      测试------------------
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handleConfirm" size="medium" round>保 存</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: 'VmpLivePrivateChat',
    data() {
      return {
        //模态窗是否可见
        visible: false,
        //模态窗标题
        title: '私聊'
      };
    },
    beforeCreate() {},
    methods: {
      //打开模态窗
      openModal() {
        console.log('收到打开窗口的信令');
        this.visible = true;
      },
      //关闭模态窗
      handleClose() {
        this.visible = false;
      },
      //确认的处理方法
      handleConfirm() {
        this.handleClose();
      }
    }
  };
</script>

<style lang="less">
  .vmp-live-private-chat {
  }
</style>

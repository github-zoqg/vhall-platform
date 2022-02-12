<template>
  <el-dialog
    :title="title"
    :visible.sync="visible"
    width="500px"
    custom-class="vmp-reply-modal"
    append-to-body
  >
    <div class="vmp-reply-modal__main">
      <el-input
        type="textarea"
        :rows="4"
        placeholder="请输入回复信息"
        v-model="replyText"
        maxlength="140"
        show-word-limit
      ></el-input>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" @click="handleConfirm" size="medium" round>确 定</el-button>
      <el-button type="default" @click="handleClose" size="medium" round>取 消</el-button>
    </span>
  </el-dialog>
</template>

<script>
  export default {
    name: 'VmpChatAuthReplyModal',
    props: {},
    data() {
      return {
        //模态窗标题
        title: '通过并回复',
        //模态窗是否可见
        visible: false,
        //回复的信息
        replyText: ''
      };
    },
    methods: {
      //打开模态窗
      openModal() {
        this.visible = true;
      },
      //重置模态窗视图信息
      resetData() {
        this.replyText = '';
      },
      //处理确定
      handleConfirm() {
        //todo 待完善domain后接入
      },
      //关闭模态窗
      handleClose() {
        this.visible = false;
      }
    }
  };
</script>

<style lang="less">
  .vmp-reply-modal {
    .vmp-reply-modal__main {
    }
  }
</style>

<template>
  <el-dialog
    :title="title"
    :visible.sync="visible"
    :width="500"
    center
    custom-class="vmp-auto-setting-modal"
  >
    <div class="auto-chat-main">
      <p>
        <span class="switch-title">聊天严禁词：</span>
        <el-switch
          v-model="enableFilter"
          inactive-color="#ccc"
          :width="34"
          active-color="#FFD021"
        ></el-switch>
        <span class="switch-title">
          {{ enableFilter ? '已开启' : '已关闭' }}，包含严禁词的聊天将被自动阻止
        </span>
      </p>
      <p>
        <com-input
          type="textarea"
          :rows="4"
          v-model="filterWords"
          placeholder="输入禁止在本场聊天中出现的严禁词，逗号隔开，固定宽度换行"
        ></com-input>
      </p>
      <!--<p>-->
      <!--<button class="default-button s-button" @click="saveChatWords">保存严禁词</button> 添加后实时生效-->
      <!--</p>-->
      <div class="auto-radio">
        <span class="auto-radio-title">自动处理设置：未审核超过200条时批量处理规则</span>
        <div class="auto-radio-con">
          <span class="auto-radio-con-item">
            <el-radio v-model="enableAutoHandle" label="1">自动通过</el-radio>
          </span>
          <span class="auto-radio-con-item">
            <el-radio v-model="enableAutoHandle" label="2">自动阻止</el-radio>
          </span>
        </div>
      </div>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" @click="handleConfirm">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
  export default {
    name: 'VmpAutoSettingModal',
    data() {
      return {
        //模态窗标题
        title: '自动审核设置',
        //模态窗是否可见
        visible: false,
        //聊天严禁词打开状态
        enableFilter: false,
        //自动处理开关状态
        enableAutoHandle: false,
        //输入的严禁词
        filterWords: ''
      };
    },
    methods: {
      //打开模态窗
      openModal() {
        this.visible = true;
      },
      //模态窗关闭
      handleClose() {
        this.visible = false;
      },
      //保存
      handleConfirm() {
        this.handleClose();
      }
    }
  };
</script>

<style lang="less">
  .vmp-auto-setting-modal {
    .auto-chat-main {
      padding-top: 10px;
      margin: 0 10px;
      .switch-title {
        display: inline-block;
        vertical-align: middle;
      }
      p {
        padding: 10px 0;
        .com-input {
          width: 100%;
        }
      }
      .auto-radio {
        // border-top: solid 1px $color-bd;
        margin-top: 4px;
        padding: 10px 0 20px 0;
        .auto-radio-title {
          line-height: 30px;
        }
        .auto-radio-con {
          padding-left: 99px;
          .auto-radio-con-item {
            display: block;
            padding: 5px 0;
          }
        }
      }
    }
  }
</style>

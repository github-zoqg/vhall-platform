<!--
 * @Author: your name
 * @Date: 2022-01-01 15:30:12
 * @LastEditTime: 2022-01-02 11:44:48
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: /middle-platform/src/packages/setting-box/src/main.vue
-->
<template>
  <el-dialog
    :title="$t(title)"
    :visible.sync="dialogVisible"
    :before-close="handleClose"
    width="450px"
  >
    <div class="check-device-message">
      <div class="check-tip">
        <img
          src="//test-zhike.vhall.com/master/static/img/check-device.4165374.png"
          alt=""
          class="check-icon"
        />
        <div class="check-text">{{ $t(checkTipText) }}</div>
      </div>
      <div slot="footer" class="dialog-footer message-box__btns">
        <el-button @click="dialogVisible = false">{{ $t(cancelCheck) }}</el-button>
        <el-button type="primary" @click="dialogVisible = false">{{ $t(startCheck) }}</el-button>
      </div>
    </div>
  </el-dialog>
</template>
<script>
  export default {
    name: 'VmpCheckDevice',
    data() {
      return {
        dialogVisible: true,
        startCheck: '',
        cancelCheck: '',
        checkTipText: '',
        title: '',
        subject: '', // 直播名称
        id: '' // 房间id
      };
    },
    created() {},
    mounted() {
      this.initConfig();
    },
    methods: {
      // 初始化配置
      initConfig() {
        const widget = window.$serverConfig && window.$serverConfig[this.cuid];
        if (widget && widget.options) {
          Object.assign(this.$data, widget.options);
        }
      }
    }
  };
</script>
<style lang="less">
  .check-device-message {
    .check-tip {
      margin-top: 10px;
      margin-bottom: 30px;
      .check-icon {
        display: block;
        width: 80px;
        height: 71px;
        margin: 10px auto 20px;
      }
      .check-text {
        padding: 10px 20px 20px;
        font-size: 14px;
        text-align: left;
      }
    }
    .message-box__btns {
      text-align: right;
      padding: 10px 0;
    }
  }
</style>

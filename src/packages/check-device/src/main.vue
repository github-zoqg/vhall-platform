<template>
  <el-dialog
    :title="$t('check_device.check_device_1000')"
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
        <div class="check-text">{{ $t('check_device.check_device_1003') }}</div>
      </div>
      <div slot="footer" class="dialog-footer message-box__btns">
        <el-button @click="dialogVisible = false">
          {{ $t('check_device.check_device_1002') }}
        </el-button>
        <el-button type="primary" @click="dialogVisible = false">
          {{ $t('check_device.check_device_1001') }}
        </el-button>
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
      },
      showSetting() {
        this.dialogVisible = true;
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

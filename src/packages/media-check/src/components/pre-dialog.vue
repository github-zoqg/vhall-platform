<template>
  <section>
    <!-- 弹窗1 -->
    <saas-alert
      :visible="popAlertCheckVisible"
      :confirm="true"
      title="设备检测"
      confirmText="立即检测"
      :cancelText="firstVisit == 1 ? '暂不检测' : ''"
      :isShowClose="firstVisit == 1"
      @onClose="popAlertCheckClose"
      @onSubmit="popAlertCheckSubmit"
      @onCancel="popAlertCheckClose"
    >
      <div slot="content">
        <span>为保证直播顺利进行，推荐在直播开始前进行设备检测</span>
      </div>
    </saas-alert>

    <!-- 弹窗2 -->
    <saas-alert
      :visible="popAlertCheckConfirmVisible"
      :confirm="true"
      confirmText="立即检测"
      cancelText="不检测"
      @onClose="popAlertCheckConfirm"
      @onCancel="popAlertCheckConfirm"
      @onSubmit="popAlertCheckConfirmClose"
    >
      <div slot="content">
        <span>直播前取消设备检测，将会影响直播质量，确定不检测？</span>
      </div>
    </saas-alert>
  </section>
</template>

<script>
  import SaasAlert from '@/packages/pc-alert/src/alert.vue';
  import { useRoomBaseServer } from 'middle-domain';
  export default {
    components: {
      SaasAlert
    },
    data() {
      return {
        popAlertCheckVisible: true,
        popAlertCheckConfirmVisible: false,
        firstVisit: false //浏览器首次加载强制检测
      };
    },
    created() {
      this.setDefaultAlertVisible();
    },
    methods: {
      /**
       * 判断，并检查默认是否展示
       */
      setDefaultAlertVisible() {
        const { watchInitData } = useRoomBaseServer().state;
        this.liveType = watchInitData?.webinar?.type;

        //用户角色
        const roleName = watchInitData.join_info.role_name;

        // 助理不展示
        if (roleName == 3) {
          this.popAlertCheckVisible = false;
        }

        // 直播中
        if (this.liveType == 1) {
          this.popAlertCheckVisible = false;
        }
        this.firstVisit = localStorage.getItem('firstVisit') || '';
        // if (!this.firstVisit) {
        //   //浏览器首次加载强制检测
        //   localStorage.setItem('firstVisit', '1');
        // }
      },
      show() {
        this.popAlertCheckVisible = true;
      },
      popAlertCheckSubmit() {
        window.vhallReportForProduct?.report(110004); // 埋点:设备检测-立即检测
        this.popAlertCheckVisible = false;
        this.$emit('show');
      },
      async popAlertCheckClose() {
        window.vhallReportForProduct?.report(110005); // 埋点:设备检测-暂不检测
        this.popAlertCheckVisible = false;
        await this.$nextTick();
        this.$emit('closeTestEquDialog');
        // this.popAlertCheckConfirmVisible = true;
      },
      popAlertCheckConfirm() {
        this.popAlertCheckConfirmVisible = false;
      },
      popAlertCheckConfirmClose() {
        this.popAlertCheckConfirmVisible = false;
        this.$emit('show');
      }
    }
  };
</script>

<style lang="less" scoped>
  .btnsbox {
    text-align: right;
    position: absolute;
    bottom: 24px;
    right: 32px;
    button {
      border: none;
      box-shadow: none;
      outline: none;
      display: inline-block;
      height: 36px;
      line-height: 36px;
      border-radius: 18px;
      display: inline-block;
      margin-bottom: 0;
      font-size: 14px;
      color: #666;
      font-weight: 400;
      text-align: center;
      padding: 0 24px;
      &.confirm {
        background: #fb3a32;
        color: #ffffff;
      }
      &.cancel {
        border: 1px solid #ccc;
        color: #666666;
        line-height: 34px;
        margin-left: 12px;
        &:hover {
          background: #fb3a32;
          border-color: #fb3a32;
          color: #ffffff;
        }
      }
    }
  }
</style>

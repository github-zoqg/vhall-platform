<template>
  <section class="vmp-media-setting-container">
    <saas-dialog
      :visible="isShow"
      title="设置"
      width="480px"
      style="min-width: 480px"
      :showDefault="false"
      @onReturn="isShow = false"
      @onClose="isShow = false"
    >
      <media-setting
        v-if="isShow"
        @submit="isShow = false"
        @showConfirm="showConfirm"
      ></media-setting>
    </saas-dialog>

    <!-- 弹窗容器 -->
    <aside>
      <saas-alert
        :visible="isConfirmVisible"
        :confirm="true"
        confirmText="确认"
        cancelText="取消"
        @onSubmit="confirmSave"
        @onClose="closeConfirm"
        @onCancel="closeConfirm"
      >
        <main slot="content">{{ alertText }}</main>
      </saas-alert>
    </aside>
  </section>
</template>

<script>
  /**
   * 注：发起端有 基础设置、摄像头、麦克风、扬声器 四项
   * 而观看端 没有基础设置
   */
  import SaasAlert from '@/packages/pc-alert/src/alert.vue';
  import SaasDialog from '@/packages/pc-alert/src/dialog.vue';
  import MediaSetting from './media-setting.vue';

  export default {
    name: 'VmpPcMediaSetting',
    components: {
      SaasAlert,
      SaasDialog,
      MediaSetting
    },
    data() {
      return {
        isShow: true,
        isConfirmVisible: false,
        alertText: '修改设置后会导致重新推流，是否继续保存？',
        selectedItem: 'audio-in-setting'
      };
    },
    methods: {
      showConfirm(text) {
        this.alertText = text;
        this.isConfirmVisible = true;
      },
      closeConfirm() {
        this.alertText = '修改设置后会导致重新推流，是否继续保存？'; // reset default
        this.isConfirmVisible = false;
      },
      saveSetting() {
        // TODO: 开播才弹出对话框
        this.showConfirm(`修改设置后导致重新推流，是否继续保存?`);
      },
      confirmSave() {
        this.isConfirmVisible = false;
      }
    }
  };
</script>

<style lang="less">
  .vmp-media-setting-container {
  }
</style>

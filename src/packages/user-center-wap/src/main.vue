<template>
  <div class="vmp-user-center-wap">
    <van-popup v-model="show" position="bottom">
      <van-cell title="单元格" icon="location-o" />
      <van-cell title="单元格" icon="location-o" />
    </van-popup>
  </div>
</template>

<script>
  import { useUserServer } from 'middle-domain';
  export default {
    name: 'VmpUserCenterWap',
    data() {
      return {
        show: true
      };
    },
    created() {
      const obj = useUserServer();
      // obj.getUserInfo();
      console.log('+++++++++++++++++++++', obj);
    },
    methods: {
      openUserCenterWap() {
        this.show = true;
      },

      closeUserCenterWap() {
        this.show = false;
      }
    }
  };
</script>

<style lang="less"></style>

<template>
  <div class="vmp-handup">
    <div>
      <el-button
        @click="userApply"
        type="primary"
        size="medium"
        round
        v-if="isAllowhandup && !isSpeakOn"
      >
        举手上麦
      </el-button>
    </div>
    <div><el-button type="primary" size="medium" v-if="isSpeakOn" round>下麦</el-button></div>
  </div>
</template>
<script>
  import { useMicServer, useMsgServer } from 'middle-domain';
  export default {
    name: 'VmpHandup',
    data() {
      return {
        isAllowhandup: true, //是否允许上麦,
        isSpeakOn: false // 是否已经上麦
      };
    },
    beforeCreate() {
      this.micServer = useMicServer();
    },
    created() {
      // 主持人同意上麦申请
      this.micServer.$on('user_apply_host_agree', msg => {
        // 上麦推流
      });
      // 主持人拒绝上麦申请
      this.micServer.$on('user_apply_host_reject', msg => {
        // TODO:被拒绝的处理
      });
    },
    methods: {
      // 用户申请上麦
      userApply() {
        this.micServer.userApply();
      }
    }
  };
</script>

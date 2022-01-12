<template>
  <div class="vmp-handup">
    <div>
      <el-button
        @click="userApply"
        type="primary"
        size="medium"
        round
        v-if="isAllowhandup && !handupEnd"
      >
        举手上麦
      </el-button>
    </div>
    <div><el-button type="primary" size="medium" v-if="handupEnd" round>下麦</el-button></div>
  </div>
</template>
<script>
  import { useMicServer, useMsgServer } from 'middleDomain';
  export default {
    name: 'VmpHandup',
    data() {
      return {
        isAllowhandup: true, //是否允许上麦,
        handupEnd: false // 是否已经上麦
      };
    },
    beforeCreate() {
      this.micServer = useMicServer();
    },
    created() {
      this.micServer.$on('user_apply', msg => {
        this.$confirm(`${msg.data.nickname}申请上麦`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          customClass: 'zdy-message-box',
          cancelButtonClass: 'zdy-confirm-cancel'
        })
          .then(() => {
            // this.micServer.hostAgreeApply
          })
          .catch(() => {});
      });
    },
    methods: {
      // 用户申请上麦
      userApply() {
        useMsgServer().sendRoomMsg({
          aaa: 222
        });
        this.micServer.userApply();
      }
    }
  };
</script>

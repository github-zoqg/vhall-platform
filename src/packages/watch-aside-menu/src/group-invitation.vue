<template>
  <!-- 分组直播, 邀请演示对话框 -->
  <el-dialog
    :visible="dialogVisible"
    @open="handleOpen"
    :before-close="handleClose"
    :close-on-click-modal="false"
    custom-class="group-invitation-dlg"
    append-to-body
    width="400px"
    title="提示"
  >
    <div class="content">
      <span>{{ inviteName }}邀请你进行演示，是否同意?</span>
    </div>
    <div slot="footer">
      <el-button type="primary" round @click="handleSubmit">同意</el-button>
      <el-button round @click="handleClose">拒绝({{ second }})</el-button>
    </div>
  </el-dialog>
</template>
<script>
  import { useRoomBaseServer, useDocServer, useGroupServer, useMicServer } from 'middle-domain';
  export default {
    name: 'GroupInvitaion',
    props: {
      // 邀请人id
      senderId: {
        type: String,
        default: ''
      },
      // 邀请人身份
      inviteName: {
        type: String,
        default: ''
      },
      show: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        dialogVisible: this.show,
        second: 30,
        timer: 0
      };
    },
    watch: {
      show: function (newVal) {
        this.dialogVisible = newVal;
      }
    },
    beforeCreate() {
      this.roomBaseServer = useRoomBaseServer();
      this.docServer = useDocServer();
      this.groupServer = useGroupServer();
      this.micServer = useMicServer();
    },
    methods: {
      handleOpen() {
        this.second = 30;
        this.timer = setInterval(() => {
          this.second--;
          if (this.second <= 0) {
            clearInterval(this.timer);
            this.close();
          }
        }, 1000);
      },
      close() {
        this.dialogVisible = false;
        this.$emit('update:show', false);
      },
      // 拒绝邀请
      handleClose: async function () {
        clearInterval(this.timer);
        this.close();
        try {
          // 拒绝邀请上麦
          const res = await this.micServer.userRejectInvite({
            room_id: this.roomBaseServer.state.watchInitData.interact.room_id,
            type: 1, // 0-拒绝上麦 , 1-拒绝演示
            extra_params: this.senderId
          });
          if (res.code != 200) {
            this.$message({
              message: res.msg,
              showClose: true,
              type: 'warning',
              customClass: 'zdy-info-box'
            });
          }
        } catch (ex) {
          console.error('[group] 拒绝演示邀请-> 拒绝邀请上麦:', ex);
          return;
        }
      },
      // 同意邀请
      handleSubmit: async function () {
        try {
          // 同意邀请上麦
          const res = await this.micServer.userAgreeInvite({
            room_id: this.roomBaseServer.state.watchInitData.interact.room_id,
            type: 1,
            extra_params: this.senderId
          });
        } catch (ex) {
          console.error('[group] 同意邀请上麦:', ex);
          return;
        }
        // 设置主讲人
        try {
          await this.groupServer.presentation();
          this.timer && clearInterval(this.timer);
          this.timer = 0;
          this.second = 30;
          this.close();
        } catch (ex) {
          this.close;
          console.error('[group] 设置主讲人:', ex);
        }
      }
    }
  };
</script>
<style lang="less">
  .group-invitation-dlg {
    .el-dialog__body {
      min-height: 10px;
    }
  }
</style>

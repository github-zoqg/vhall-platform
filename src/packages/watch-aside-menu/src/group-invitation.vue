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
      // 被邀请时用户所在分组，默认在主直播间，为空
      inviteGroupId: {
        type: String,
        default: undefined
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
      // 打开对话框
      handleOpen() {
        this.second = 30;
        // 用户选择“同意”或“拒绝”，有30秒倒计时
        this.timer = setInterval(() => {
          this.second--;
          if (this.second <= 0) {
            this.close();
          }
        }, 1000);
      },
      // 关闭对话框
      close() {
        this.timer && clearInterval(this.timer);
        this.timer = 0;
        this.dialogVisible = false;
        this.$emit('update:show', false);
      },
      // 拒绝邀请演示
      handleClose: async function () {
        this.close();
        if (this.inviteGroupId != this.groupServer.state.groupInitData.group_id) {
          // 用户当前环境已改变
          return;
        }
        try {
          const res = await this.micServer.userRejectInvite({
            room_id: this.roomBaseServer.state.watchInitData.interact.room_id,
            type: 1, // 0-拒绝上麦 , 1-拒绝演示
            extra_params: this.senderId
          });

          // 513030:没有被邀请
          if (res.code !== 200 && res.code !== 513030) {
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
      // 同意邀请演示
      handleSubmit: async function () {
        this.close();
        if (this.inviteGroupId != this.groupServer.state.groupInitData.group_id) {
          // 用户当前环境已改变
          return;
        }
        try {
          // 同意邀请演示
          await this.micServer.userAgreeInvite({
            room_id: this.roomBaseServer.state.watchInitData.interact.room_id,
            type: 1, // 0-同意上麦 , 1-同意演示
            extra_params: this.senderId
          });
        } catch (ex) {
          console.error('[group] 同意邀请演示:', ex);
          return;
        }
        // 设置主讲人
        try {
          await this.groupServer.presentation();
        } catch (ex) {
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

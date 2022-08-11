<template>
  <!-- 用户被邀请上麦弹窗 -->
  <aside>
    <saas-alert
      :visible="isConfirmVisible"
      :confirm="true"
      :title="$t('account.account_1061')"
      :confirmText="$t('common.common_1010')"
      :cancelText="btnText"
      @onSubmit="mediaCheckClick"
      @onClose="closeConfirm"
      @onCancel="closeConfirm"
    >
      <main slot="content">{{ $t('interact.interact_1031', { n: roleName }) }}</main>
    </saas-alert>
  </aside>
</template>
<script>
  import {
    useMsgServer,
    useChatServer,
    useRoomBaseServer,
    useMicServer,
    useMediaCheckServer
  } from 'middle-domain';
  import SaasAlert from '@/packages/pc-alert/src/alert.vue';
  import { boxEventOpitons } from '@/app-shared/utils/tool';
  export default {
    name: 'VmpMicInvited',
    components: {
      SaasAlert
    },
    data() {
      return {
        isConfirmVisible: false,
        btnText: this.$t('interact.interact_1010'),
        waitTime: 30,
        roleName: this.$getRoleName(1),
        senderId: '',
        waitInterval: null
      };
    },
    computed: {
      roomBaseState() {
        return useRoomBaseServer().state;
      },
      join_info() {
        return this.$domainStore.state.roomBaseServer.watchInitData.join_info;
      },
      isInGroup() {
        return this.$domainStore.state.groupServer.groupInitData.isInGroup;
      }
    },
    mounted() {
      //房间消息
      if (this.waitInterval) {
        clearInterval(this.waitInterval);
      }
      useMsgServer().$onMsg('ROOM_MSG', rawMsg => {
        let temp = Object.assign({}, rawMsg);
        if (Object.prototype.toString.call(temp.data) !== '[object Object]') {
          temp.data = JSON.parse(temp.data);
          temp.context = JSON.parse(temp.context);
        }
        const { type = '' } = temp.data || {};
        this.roleName =
          temp.data.room_role == 20 ? this.$t('chat.chat_1064') : this.$getRoleName(1);
        this.roleName = temp.data.inviter_role_name
          ? this.$getRoleName(+temp.data.inviter_role_name)
          : this.$getRoleName(1);
        if (type === 'vrtc_connect_invite') {
          // 是本人的时候，弹出邀请弹框
          if (this.join_info.third_party_user_id !== temp.data.room_join_id) {
            return;
          }
          if (this.join_info.role_name == 4) {
            window.vhallReportForProduct?.report(110162);
          }

          this.senderId = temp.sender_id;
          this.isConfirmVisible = true;
          // 主持人邀请您上麦”弹窗曝光时触发上报
          window?.vhallReportForProduct.report(170007);
          this.waitTime = 30;
          clearInterval(this.waitInterval);
          this.btnText = `${this.$t('interact.interact_1010')}(${this.waitTime}s)`;
          this.waitInterval = setInterval(() => {
            this.waitTime--;
            this.btnText = `${this.$t('interact.interact_1010')}(${this.waitTime}s)`;
            if (this.waitTime <= 0) {
              if (this.join_info.role_name == 4) {
                window.vhallReportForProduct?.report(110167);
              }
              this.$message.warning(this.$t('interact.interact_1025'));
              clearInterval(this.waitInterval);
              this.btnText = this.$t('interact.interact_1010');
              this.isConfirmVisible = false;
            }
          }, 1000);
        }
      });

      //监听禁言通知
      useChatServer().$on('banned', res => {
        this.isConfirmVisible && this.clearTime();
      });
      //监听全体禁言通知
      useChatServer().$on('allBanned', res => {
        this.isConfirmVisible && this.clearTime();
      });
    },
    methods: {
      clearTime() {
        this.waitInterval && clearInterval(this.waitInterval);
        this.isConfirmVisible = false;
        this.btnText = this.$t('interact.interact_1010');
        this.waitTime = 30;
      },
      // 上麦前进行媒体检测函数别名  device_status 0未检测 1 设备OK   2设备不支持
      async mediaCheckClick() {
        const device_status = useMediaCheckServer().state.deviceInfo.device_status;
        if (device_status == 1) {
          this.confirmSave();
        } else if (device_status == 0) {
          useMediaCheckServer()
            .getMediaInputPermission({ isNeedBroadcast: false })
            .then(flag => {
              if (flag) {
                this.waitTime > 0 ? this.confirmSave() : '';
              } else {
                this.mediaCheckFail();
              }
            });
        } else {
          this.mediaCheckFail();
        }
      },
      // 上麦前进行媒体检测失败
      mediaCheckFail() {
        this.$message.warning(this.$t('interact.interact_1039'));
        this.isConfirmVisible = false;
        this.closeConfirm();
      },
      // 接受邀请
      confirmSave() {
        if (this.join_info.role_name == 4) {
          window.vhallReportForProduct?.report(110163);
        }
        useMicServer()
          .userAgreeInvite({
            room_id: this.roomBaseState.watchInitData.interact.room_id,
            type: 0, // 0=邀请上麦|1=邀请演示
            extra_params: this.senderId
          })
          .then(res => {
            if (this.join_info.role_name == 4) {
              window.vhallReportForProduct?.report(110164, {
                report_extra: res
              });
            }
            if (res.code !== 200) {
              if (res.code == 513345) {
                this.$message.warning(this.$t('interact.interact_1037'));
              } else {
                this.$message.error(res.msg);
              }
            } else {
              useMicServer().userSpeakOn();
              window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitAgreeInvite'));
            }
            // 接受连麦邀请上报
            window?.vhallReportForProduct.report(170009, {
              report_extra: {
                waiting_time: this.waitTime
              }
            });

            // 接受连麦邀请结果上报
            window?.vhallReportForProduct.report(170010, {
              report_extra: res
            });
            clearInterval(this.waitInterval);
            this.btnText = this.$t('interact.interact_1010');
            this.isConfirmVisible = false;
          });
      },
      // 拒绝邀请
      closeConfirm() {
        if (this.join_info.role_name == 4) {
          window.vhallReportForProduct?.report(110165);
        }
        useMicServer()
          .userRejectInvite({
            room_id: this.roomBaseState.watchInitData.interact.room_id,
            type: 0, // 0=邀请上麦|1=邀请演示
            extra_params: this.senderId
          })
          .then(res => {
            if (this.join_info.role_name == 4) {
              window.vhallReportForProduct?.report(110166, {
                report_extra: res
              });
            } else if (this.join_info.role_name == 2) {
              // 拒绝连麦邀请上报
              window?.vhallReportForProduct.report(170011, {
                report_extra: {
                  waiting_time: this.waitTime,
                  rejection_method: encodeURIComponent('点击了按钮或关闭弹窗')
                }
              });
              // 拒绝连麦邀请结果上报
              window?.vhallReportForProduct.report(170012, {
                report_extra: res
              });
            }
            clearInterval(this.waitInterval);
            this.btnText = this.$t('interact.interact_1010');
            this.isConfirmVisible = false;
          });
      }
    }
  };
</script>

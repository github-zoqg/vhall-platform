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
      <main slot="content" v-if="join_info.role_name != 4">
        {{ $t('interact.interact_1031', { n: roleName }) }}
      </main>
      <main slot="content" v-else>主持人邀请您上麦，上麦后会自动打开摄像头、麦克风。</main>
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

          window.vhallReportForProduct?.toResultsReporting(110162, {
            event_type: 'message',
            res: rawMsg
          });

          this.senderId = temp.sender_id;
          this.isConfirmVisible = true;

          this.waitTime = 30;
          clearInterval(this.waitInterval);
          this.btnText = `${this.$t('interact.interact_1010')}(${this.waitTime}s)`;
          this.waitInterval = setInterval(() => {
            this.waitTime--;
            this.btnText = `${this.$t('interact.interact_1010')}(${this.waitTime}s)`;
            if (this.waitTime <= 0) {
              // 7.7.4 优化后不再提示
              // this.$message.warning(this.$t('interact.interact_1025'));
              clearInterval(this.waitInterval);
              this.btnText = this.$t('interact.interact_1010');
              this.isConfirmVisible = false;
              // 拒绝连麦邀请上报【30s-30s倒计时结束自动拒绝连麦邀请】
              window.vhallReportForProduct.toResultsReporting(170012, {
                waiting_time: this.waitTime,
                event_type: 'message',
                rejection_method: this.$t('interact.interact_1025')
              });
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
        // 接受连麦邀请上报
        window.vhallReportForProduct.toStartReporting(170009, [170010, 170032, 110187, 110183], {
          waiting_time: this.waitTime
        });

        useMicServer()
          .userAgreeInvite({
            room_id: this.roomBaseState.watchInitData.interact.room_id,
            type: 0, // 0=邀请上麦|1=邀请演示
            extra_params: this.senderId
          })
          .then(res => {
            let reasonTxt = '';
            if (res.code !== 200) {
              if (res.code == 513345) {
                reasonTxt = this.$t('interact.interact_1037');
                this.$message.warning(reasonTxt);
              } else {
                reasonTxt = res.msg;
                this.$message.error(reasonTxt);
              }
            } else {
              useMicServer().userSpeakOn();
              window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitAgreeInvite'));
            }

            window.vhallReportForProduct.toResultsReporting(170010, {
              event_type: 'interface',
              request_id: res?.request_id,
              failed_reason: res,
              reasonTxt: reasonTxt
            });

            clearInterval(this.waitInterval);
            this.btnText = this.$t('interact.interact_1010');
            this.isConfirmVisible = false;
          });
      },
      // 拒绝邀请
      closeConfirm() {
        // 拒绝连麦邀请上报
        window.vhallReportForProduct.toStartReporting(170011, 170012, {
          waiting_time: this.waitTime,
          rejection_method: '点击了按钮或关闭弹窗'
        });

        useMicServer()
          .userRejectInvite({
            room_id: this.roomBaseState.watchInitData.interact.room_id,
            type: 0, // 0=邀请上麦|1=邀请演示
            extra_params: this.senderId
          })
          .then(res => {
            // 数据上报，场景：接受连麦邀请接口
            window.vhallReportForProduct.toResultsReporting(170012, {
              request_id: res?.request_id,
              waiting_time: this.waitTime,
              event_type: 'interface',
              rejection_method: res
            });

            clearInterval(this.waitInterval);
            this.btnText = this.$t('interact.interact_1010');
            this.isConfirmVisible = false;
          });
      }
    }
  };
</script>

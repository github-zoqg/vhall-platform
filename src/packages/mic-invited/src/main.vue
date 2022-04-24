<template>
  <!-- 用户被邀请上麦弹窗 -->
  <aside>
    <saas-alert
      :visible="isConfirmVisible"
      :confirm="true"
      :title="$t('account.account_1061')"
      :confirmText="$t('common.common_1010')"
      :cancelText="btnText"
      @onSubmit="confirmSave"
      @onClose="closeConfirm"
      @onCancel="closeConfirm"
    >
      <main slot="content">{{ $t('interact.interact_1031', { n: roleName }) }}</main>
    </saas-alert>
  </aside>
</template>
<script>
  import { useMsgServer, useChatServer, useRoomBaseServer, useMicServer } from 'middle-domain';
  import SaasAlert from '@/packages/pc-alert/src/alert.vue';
  import { boxEventOpitons } from '@/packages/app-shared/utils/tool';
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
        if (type === 'vrtc_connect_invite') {
          // 是本人的时候，弹出邀请弹框
          if (this.join_info.third_party_user_id !== temp.data.room_join_id) {
            return;
          }
          this.senderId = temp.sender_id;
          this.isConfirmVisible = true;
          this.waitTime = 30;
          clearInterval(this.waitInterval);
          this.btnText = `${this.$t('interact.interact_1010')}(${this.waitTime}s)`;
          this.waitInterval = setInterval(() => {
            this.waitTime--;
            this.btnText = `${this.$t('interact.interact_1010')}(${this.waitTime}s)`;
            if (this.waitTime <= 0) {
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
      // 接受邀请
      confirmSave() {
        useMicServer()
          .userAgreeInvite({
            room_id: this.roomBaseState.watchInitData.interact.room_id,
            type: 0, // 0=邀请上麦|1=邀请演示
            extra_params: this.senderId
          })
          .then(res => {
            if (res.code !== 200) {
              if (res.code == 513347) {
                this.$message.warning(this.$t('interact.interact_1037'));
              } else {
                this.$message.error(res.msg);
              }
            } else {
              useMicServer().userSpeakOn();
              window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitAgreeInvite'));
            }
            clearInterval(this.waitInterval);
            this.btnText = this.$t('interact.interact_1010');
            this.isConfirmVisible = false;
          });
      },
      // 拒绝邀请
      closeConfirm() {
        useMicServer()
          .userRejectInvite({
            room_id: this.roomBaseState.watchInitData.interact.room_id,
            type: 0, // 0=邀请上麦|1=邀请演示
            extra_params: this.senderId
          })
          .then(res => {
            clearInterval(this.waitInterval);
            this.btnText = this.$t('interact.interact_1010');
            this.isConfirmVisible = false;
          });
      }
    }
  };
</script>

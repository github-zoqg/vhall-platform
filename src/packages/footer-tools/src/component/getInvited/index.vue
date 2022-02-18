<template>
  <!-- 弹窗容器 -->
  <aside>
    <saas-alert
      :visible="isConfirmVisible"
      :confirm="true"
      :confirmText="btnText"
      cancelText="取消"
      @onSubmit="confirmSave"
      @onClose="closeConfirm"
      @onCancel="closeConfirm"
    >
      <main slot="content">是否接受上麦邀请，请确认？</main>
    </saas-alert>
  </aside>
</template>
<script>
  import { useMsgServer, useMicServer } from 'middle-domain';
  import SaasAlert from '@/packages/pc-alert/src/alert.vue';
  export default {
    name: 'GetInvited',
    components: {
      SaasAlert
    },
    data() {
      return {
        isConfirmVisible: false,
        btnText: '确认',
        waitTime: 30,
        roomInfo: {}
      };
    },
    props: {
      roomBaseState: {
        type: Object,
        required: true
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
        if (type === 'vrtc_connect_invite') {
          this.roomInfo = temp;
          this.isConfirmVisible = true;
          this.waitTime = 30;
          clearInterval(this.waitInterval);
          this.btnText = `确认(${this.waitTime}s)`;
          this.waitInterval = setInterval(() => {
            this.waitTime--;
            this.btnText = `确认(${this.waitTime}s)`;
            if (this.waitTime <= 0) {
              clearInterval(this.waitInterval);
              this.btnText = '确认';
              this.isConfirmVisible = false;
            }
          }, 1000);
        }
      });
    },
    methods: {
      // 接受邀请
      confirmSave() {
        useMicServer()
          .userAgreeInvite({
            room_id: this.roomBaseState.watchInitData.interact.room_id,
            type: 0 // 0=邀请上麦|1=邀请演示
          })
          .then(res => {
            useMicServer().userSpeakOn();
            clearInterval(this.waitInterval);
            this.btnText = '确认';
            this.isConfirmVisible = false;
          });
      },
      // 拒绝邀请
      closeConfirm() {
        useMicServer()
          .userRejectInvite({
            room_id: this.roomBaseState.watchInitData.interact.room_id,
            type: 0 // 0=邀请上麦|1=邀请演示
          })
          .then(res => {
            clearInterval(this.waitInterval);
            this.btnText = '确认';
            this.isConfirmVisible = false;
          });
      }
    }
  };
</script>

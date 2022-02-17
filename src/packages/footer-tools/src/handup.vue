<template>
  <div class="vmp-handup">
    <div>
      <el-button
        @click="handleHandClick"
        type="primary"
        size="medium"
        round
        v-if="isAllowhandup && !isSpeakOn"
      >
        {{ btnText }}
      </el-button>
    </div>
    <div>
      <el-button @click="userSpeakOff" type="primary" size="medium" v-if="isSpeakOn" round>
        下麦
      </el-button>
    </div>
  </div>
</template>
<script>
  import { useMicServer, useRoomBaseServer } from 'middle-domain';
  export default {
    name: 'VmpHandup',
    data() {
      return {
        btnText: '举手上麦',
        isApplyed: false, // 是否申请上麦
        waitTime: 30 // 等待倒计时时间
      };
    },
    computed: {
      joinInfo() {
        return this.$domainStore.state.roomBaseServer.watchInitData.join_info;
      },
      // 是否开启举手
      isAllowhandup() {
        return this.$domainStore.state.roomBaseServer.interactToolStatus.is_handsup;
      },
      // 是否已上麦
      isSpeakOn() {
        return this.$domainStore.state.micServer.isSpeakOn;
      },
      isInGroup() {
        return this.$domainStore.state.groupServer.groupInitData.isInGroup;
      }
    },
    beforeCreate() {
      this.micServer = useMicServer();
    },
    created() {
      const { join_info } = useRoomBaseServer().state.watchInitData;
      // 申请上麦
      this.micServer.$on('vrtc_connect_apply', msg => {
        console.log('---申请上麦消息---1', join_info);
        console.log(this.micServer);
        useMicServer().userApply();
      });
      // 用户成功上麦
      this.micServer.$on('vrtc_connect_success', msg => {
        if (this.joinInfo.third_party_user_id == msg.data.room_join_id) {
          clearInterval(this._waitInterval);
          this.isApplyed = false;
          this.btnText = '举手上麦';
        }
      });
      // 用户成功下麦
      this.micServer.$on('vrtc_disconnect_success', msg => {
        console.log('---申请下麦消息---', join_info);
      });
      // 主持人同意上麦申请
      this.micServer.$on('user_apply_host_agree', msg => {});
      // 主持人拒绝上麦申请
      this.micServer.$on('user_apply_host_reject', msg => {
        // TODO:被拒绝的处理
      });
    },
    methods: {
      // 下麦
      userSpeakOff() {
        this.micServer.userSpeakOff();
      },
      // 举手按钮点击事件
      handleHandClick() {
        if (this.isApplyed) {
          this.userCancelApply();
        } else {
          this.userApply();
        }
      },
      // 申请上麦
      userApply() {
        this.micServer.userApply().then(() => {
          this.isApplyed = true;
          this.waitTime = 30;
          this.btnText = `等待(${this.waitTime}s)`;
          this.startWaitInterval();
        });
      },
      // 取消申请
      userCancelApply() {
        this.micServer.userCancelApply().then(() => {
          this.isApplyed = false;
          clearInterval(this._waitInterval);
          this.btnText = '举手上麦';
          this.$message({
            message: '您已取消申请上麦！',
            showClose: true,
            type: 'success',
            customClass: 'zdy-info-box'
          });
        });
      },
      // 等待倒计时
      startWaitInterval() {
        this._waitInterval = setInterval(() => {
          this.waitTime--;
          this.btnText = `等待(${this.waitTime}s)`;
          if (this.waitTime <= 0) {
            this.handText = '举手上麦';
            // TODO: 分组
            let tip = '';
            if (this.isInGroup) {
              tip = '组长拒绝了您的上麦请求';
            } else {
              tip = '主持人拒绝了您的上麦请求';
            }
            this.$message.warning(tip);
            this.btnText = '举手上麦';
            this.isApplyed = false;
            this.micServer.userCancelApply();
            window.clearInterval(this._waitInterval);
          }
        }, 1000);
      }
    }
  };
</script>

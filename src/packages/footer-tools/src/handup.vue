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
      <el-button @click="speakOff" type="primary" size="medium" v-if="isSpeakOn" round>
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
        waitTime: 30, // 等待倒计时时间
        waitInterval: null
      };
    },
    computed: {
      joinInfo() {
        return this.$domainStore.state.roomBaseServer.watchInitData.join_info;
      },
      // 是否开启举手
      isAllowhandup() {
        let status = this.$domainStore.state.roomBaseServer.interactToolStatus.is_handsup;
        return status;
      },
      // 是否已上麦
      isSpeakOn() {
        return this.$domainStore.state.micServer.isSpeakOn;
      },
      isInGroup() {
        return this.$domainStore.state.groupServer.groupInitData.isInGroup;
      }
    },
    created() {
      if (this.waitInterval) {
        clearInterval(this.waitInterval);
      }
      const { join_info } = useRoomBaseServer().state.watchInitData;
      // 申请上麦
      useMicServer().$on('vrtc_connect_apply', msg => {
        console.log('---申请上麦消息---', join_info, msg);
      });
      // 用户成功上麦
      useMicServer().$on('vrtc_connect_success', msg => {
        if (this.joinInfo.third_party_user_id == msg.data.room_join_id) {
          clearInterval(this.waitInterval);
          this.isApplyed = false;
          this.btnText = '举手上麦';
        }
      });
      // 用户成功下麦
      useMicServer().$on('vrtc_disconnect_success', msg => {
        console.log('---申请下麦消息---', join_info, msg);
      });
      // 主持人同意上麦申请
      useMicServer().$on('user_apply_host_agree', msg => {
        console.log(msg);
      });
      // 主持人拒绝上麦申请
      useMicServer().$on('user_apply_host_reject', msg => {
        // TODO:被拒绝的处理
        console.log(msg);
      });
    },
    methods: {
      // 下麦
      speakOff() {
        useMicServer().speakOff();
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
        useMicServer()
          .userApply()
          .then(() => {
            this.isApplyed = true;
            this.waitTime = 30;
            this.btnText = `等待(${this.waitTime}s)`;
            this.startWaitInterval();
          });
      },
      // 取消申请
      userCancelApply() {
        useMicServer()
          .userCancelApply()
          .then(() => {
            this.isApplyed = false;
            this.waitInterval && clearInterval(this.waitInterval);
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
        this.waitInterval = setInterval(() => {
          this.waitTime--;
          this.btnText = `等待(${this.waitTime}s)`;
          if (this.waitTime <= 0) {
            clearInterval(this.waitInterval);
            this.btnText = '举手上麦';
            this.isApplyed = false;
            useMicServer().userCancelApply();
            // TODO: 分组
            let tip = '';
            if (this.isInGroup) {
              tip = '组长拒绝了您的上麦请求';
            } else {
              tip = '主持人拒绝了您的上麦请求';
            }
            this.$message.warning(tip);
          }
        }, 1000);
      }
    }
  };
</script>

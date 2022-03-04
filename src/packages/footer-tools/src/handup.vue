<template>
  <div class="vmp-handup">
    <!-- // 分组内 3|4|20 不展示举手、下麦按钮； roleMap: { 1: '主持人', 2: '观众', 3: '助理', 4: '嘉宾', 20: '组长' } -->
    <div>
      <el-button
        @click="handleHandClick"
        type="primary"
        size="medium"
        round
        v-if="
          inLine &&
          (isInGroup
            ? ![3, 4, 20].includes(parseInt(this.groupRole)) && !isSpeakOn
            : isAllowhandup && !isSpeakOn)
        "
      >
        {{ btnText }}
      </el-button>
    </div>
    <div>
      <el-button
        @click="speakOff"
        type="primary"
        size="medium"
        v-if="
          inLine &&
          (isInGroup ? ![3, 4, 20].includes(parseInt(this.groupRole)) && isSpeakOn : isSpeakOn)
        "
        round
      >
        下麦
      </el-button>
    </div>
  </div>
</template>
<script>
  import { useMicServer } from 'middle-domain';
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
      // 是否是直播中
      inLine() {
        return parseInt(this.$domainStore.state.roomBaseServer.watchInitData.webinar.type) === 1;
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
      },
      // 组内角色
      groupRole() {
        return this.$domainStore.state.groupServer.groupInitData?.join_role;
      }
    },
    created() {
      if (this.waitInterval) {
        clearInterval(this.waitInterval);
      }
      // 申请上麦
      useMicServer().$on('vrtc_connect_apply', msg => {
        console.log('---申请上麦消息---', this.joinInfo, msg);
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
        this.$message.warning(this.$t('interact.interact_1028'));
      });

      /**
       *
       * // 主持人同意上麦申请
      useMicServer().$on('user_apply_host_agree', msg => {
        console.log(msg);
      });
      // 主持人拒绝上麦申请
      useMicServer().$on('user_apply_host_reject', msg => {
        // TODO:被拒绝的处理
        console.log(msg);
      });**/
    },
    methods: {
      // 下麦
      async speakOff() {
        const { code, msg } = await useMicServer().speakOff();
        if (code === 513035) {
          this.$message.error(msg);
        }
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

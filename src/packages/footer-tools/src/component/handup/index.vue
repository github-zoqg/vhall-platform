<template>
  <div class="vmp-handup" v-if="device_status === 1 && isInteractLive">
    <!-- <div style="color: #fff">
      {{
        `isBanned : ${isBanned};
    isAllowhandup : ${isAllowhandup};
    isSpeakOn : ${isSpeakOn};
    isInGroup : ${isInGroup};
    groupRole : ${![3, 4, 20].includes(parseInt(this.groupRole))};
    isGroupBanned : ${isGroupBanned}; `
      }}
    </div> -->
    <!-- // 分组内 3|4|20 不展示举手、下麦按钮； roleMap: { 1: '主持人', 2: '观众', 3: '助理', 4: '嘉宾', 20: '组长' } -->
    <div>
      <el-button
        @click="handleHandClick"
        type="primary"
        size="medium"
        round
        v-if="
          isInGroup
            ? ![3, 4, 20].includes(parseInt(this.groupRole)) && isGroupBanned && !isSpeakOn
            : isBanned && isAllowhandup && !isSpeakOn
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
          isInGroup
            ? ![3, 4, 20].includes(parseInt(this.groupRole)) && isGroupBanned && isSpeakOn
            : isBanned && isSpeakOn
        "
        round
      >
        {{ $t('interact.interact_1007') }}
      </el-button>
    </div>
  </div>
</template>
<script>
  import { useMicServer, useChatServer } from 'middle-domain';
  export default {
    name: 'VmpHandup',
    data() {
      return {
        btnText: this.$t('interact.interact_1001'),
        isApplyed: false, // 是否申请上麦
        waitTime: 30, // 等待倒计时时间
        waitInterval: null
      };
    },
    computed: {
      joinInfo() {
        return this.$domainStore.state.roomBaseServer.watchInitData.join_info;
      },
      device_status() {
        // 设备状态  0未检测 1可以上麦 2不可以上麦
        return parseInt(this.$domainStore.state.mediaCheckServer.deviceInfo.device_status);
      },
      // 是否是互动 | 无延迟 | 分组直播
      isInteractLive() {
        const { watchInitData } = this.$domainStore.state.roomBaseServer;
        return (
          (watchInitData.webinar.mode == 3 ||
            watchInitData.webinar.no_delay_webinar === 1 ||
            watchInitData.webinar.mode == 6) &&
          watchInitData.webinar.type == 1
        );
      },
      // 是否开启举手
      isAllowhandup() {
        const status = this.$domainStore.state.roomBaseServer.interactToolStatus.is_handsup;
        return parseInt(status) === 1;
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
      },
      // 非分组内的禁言状态
      isBanned() {
        return !useChatServer().state.banned || !useChatServer().state.allBanned; //true禁言，false未禁言
      },
      // 分组 组内 禁言 状态
      isGroupBanned() {
        return parseInt(this.$domainStore.state.groupServer.groupInitData.is_banned) === 0;
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
          this.btnText = this.$t('interact.interact_1001');
        }
      });
      // 用户成功下麦
      useMicServer().$on('vrtc_disconnect_success', msg => {
        this.$message.warning(this.$t('interact.interact_1028'));
      });

      useMicServer().$on('vrtc_connect_open', msg => {
        if (parseInt(this.device_status) === 1) {
          this.$message.success(this.$t('interact.interact_1003'));
        }
      });

      useMicServer().$on('vrtc_connect_close', msg => {
        if (parseInt(this.device_status) === 1) {
          this.$message.success(this.$t('interact.interact_1002'));
        }
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
          .then(res => {
            if (res.code != 200) {
              this.$message.error(res.msg);
              return;
            }
            this.isApplyed = true;
            this.waitTime = 30;
            this.btnText = `${this.$t('interact.interact_1004')}(${this.waitTime}s)`;
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
            this.btnText = this.$t('interact.interact_1001');
            this.$message({
              message: this.$t('interact.interact_1027'),
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
          this.btnText = `${this.$t('interact.interact_1004')}(${this.waitTime}s)`;
          if (this.waitTime <= 0) {
            clearInterval(this.waitInterval);
            this.btnText = this.$t('interact.interact_1001');
            this.isApplyed = false;
            useMicServer().userCancelApply();
            // TODO: 分组
            let tip = '';
            if (this.isInGroup) {
              tip = '组长拒绝了您的上麦请求';
            } else {
              tip = this.$t('other.other_1006');
            }
            this.$message.warning(tip);
          }
        }, 1000);
      }
    }
  };
</script>

<template>
  <div class="vmp-handup" v-if="isInteractLive && !isBanned && !allBanned">
    <div>
      <el-button
        @click="handleHandClick"
        type="primary"
        size="medium"
        round
        :disabled="loading"
        v-if="isInGroup ? +groupRole !== 20 && !isSpeakOn : isAllowhandup && !isSpeakOn"
      >
        {{ btnText }}
      </el-button>
    </div>
    <div>
      <el-button
        @click="speakOff"
        type="primary"
        size="medium"
        :disabled="loading"
        v-if="isInGroup ? +groupRole !== 20 && isSpeakOn : isSpeakOn"
        round
      >
        {{ $t('interact.interact_1007') }}
      </el-button>
    </div>
  </div>
</template>
<script>
  import { useMicServer, useChatServer, useMsgServer, useMediaCheckServer } from 'middle-domain';
  export default {
    name: 'VmpHandup',
    data() {
      const groupData = this.$domainStore.state.groupServer.groupInitData;
      const interactStatus = this.$domainStore.state.roomBaseServer.interactToolStatus;
      console.log('禁言状态-----11111', groupData.isInGroup, groupData, interactStatus);
      return {
        btnText: this.$t('interact.interact_1041'),
        isApplyed: false, // 是否申请上麦
        waitTime: 30, // 等待倒计时时间
        waitInterval: null,
        loading: false,
        isBanned: groupData.isInGroup
          ? groupData.is_banned == 1
            ? true
            : false
          : interactStatus.is_banned == 1
          ? true
          : false, //true禁言，false未禁言
        allBanned: groupData.isInGroup ? false : interactStatus.all_banned == 1 ? true : false //true全体禁言，false未禁言
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
            watchInitData.webinar.no_delay_webinar == 1 ||
            watchInitData.webinar.mode == 6) &&
          watchInitData.webinar.type == 1 &&
          !this.$domainStore.state.interactiveServer.initInteractiveFailed
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
      }
    },
    created() {
      if (this.waitInterval) {
        clearInterval(this.waitInterval);
      }
      // 用户成功上麦
      useMicServer().$on('vrtc_connect_success', msg => {
        if (this.joinInfo.third_party_user_id == msg.data.room_join_id) {
          clearInterval(this.waitInterval);
          this.isApplyed = false;
          this.btnText = this.$t('interact.interact_1041');
        }
      });
      // 用户成功下麦
      useMicServer().$on('vrtc_disconnect_success', msg => {
        this.$message.warning(this.$t('interact.interact_1028'));
      });

      useMicServer().$on('vrtc_connect_open', msg => {
        this.$message.success(this.$t('interact.interact_1003'));
      });

      useMicServer().$on('vrtc_connect_close', msg => {
        this.$message.success(this.$t('interact.interact_1002'));
      });
      //监听禁言通知
      useChatServer().$on('banned', res => {
        console.log('监听禁言通知', res);
        this.isBanned = res;
      });
      //监听全体禁言通知
      useChatServer().$on('allBanned', res => {
        console.log('监听禁言通知-all', res);
        this.allBanned = res;
      });
      // 用户申请被拒绝（客户端有拒绝用户上麦的操作）
      useMsgServer().$onMsg('ROOM_MSG', msg => {
        let temp = Object.assign({}, msg);
        if (Object.prototype.toString.call(temp.data) !== '[object Object]') {
          temp.data = JSON.parse(temp.data);
        }
        const { type = '' } = temp.data || {};
        if (type === 'vrtc_connect_refused') {
          if (this.joinInfo.third_party_user_id != temp.data.room_join_id) return;
          this.loading = false;
          this.isApplyed = false;
          this.waitInterval && clearInterval(this.waitInterval);
          this.btnText = this.$t('interact.interact_1041');
        }
      });
      // 用户申请被拒绝（客户端有拒绝用户上麦的操作）
      useMicServer().$on('vrtc_connect_refused', msg => {
        this.loading = false;
        this.isApplyed = false;
        this.waitInterval && clearInterval(this.waitInterval);
        this.btnText = this.$t('interact.interact_1041');
      });
    },
    methods: {
      // 下麦
      async speakOff() {
        this.loading = true;
        try {
          const { code, msg } = await useMicServer().speakOff();
          if (code === 513035) {
            this.$message.error(msg);
          }
          this.loading = false;
        } catch (error) {
          this.loading = false;
        }
      },
      // 举手按钮点击事件
      async handleHandClick() {
        this.loading = true;
        if (this.isApplyed) {
          this.userCancelApply();
        } else {
          this.mediaCheckClick();
        }
      },
      // 上麦前进行媒体检测  device_status 0未检测 1 设备OK   2设备不支持
      async mediaCheckClick() {
        const device_status = useMediaCheckServer().state.deviceInfo.device_status;
        if (device_status == 1) {
          this.userApply();
        } else if (device_status == 0) {
          useMediaCheckServer()
            .getMediaInputPermission({ isNeedBroadcast: false })
            .then(flag => {
              if (flag) {
                this.userApply();
              } else {
                this.$message.warning(this.$t('interact.interact_1039'));
                this.loading = false;
              }
            });
        } else {
          this.$message.warning(this.$t('interact.interact_1039'));
          this.loading = false;
        }
      },
      // 申请上麦
      userApply() {
        useMicServer()
          .userApply()
          .then(res => {
            this.loading = false;
            if (res.code != 200) {
              if (res.code == 513345) {
                this.$message.warning(this.$t('interact.interact_1037'));
              } else if (res.code == 513025) {
                this.$message.error(
                  this.$t('interact.interact_1029', { n: res.data.replace_data[0] })
                );
              }
              return;
            }
            this.isApplyed = true;
            this.waitTime = 30;
            this.btnText = `${this.$t('interact.interact_1004')}(${this.waitTime}s)`;
            this.startWaitInterval();
          })
          .catch(err => {
            this.loading = false;
          });
      },
      // 取消申请
      userCancelApply() {
        useMicServer()
          .userCancelApply()
          .then(() => {
            this.loading = false;
            this.isApplyed = false;
            this.waitInterval && clearInterval(this.waitInterval);
            this.btnText = this.$t('interact.interact_1041');
            this.$message({
              message: this.$t('interact.interact_1027'),
              showClose: true,
              type: 'success',
              customClass: 'zdy-info-box'
            });
          })
          .catch(err => {
            this.loading = false;
          });
      },
      // 等待倒计时
      startWaitInterval() {
        this.waitInterval = setInterval(() => {
          this.waitTime--;
          this.btnText = `${this.$t('interact.interact_1004')}(${this.waitTime}s)`;
          if (this.waitTime <= 0) {
            clearInterval(this.waitInterval);
            this.btnText = this.$t('interact.interact_1041');
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
<style lang="less">
  .vmp-handup .el-button.el-button--primary {
    background: var(--theme-color);
    color: #ffffff;
    border: 1px solid var(--theme-color);
  }
</style>

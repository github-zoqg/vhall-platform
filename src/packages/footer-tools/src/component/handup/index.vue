<template>
  <div class="vmp-handup" v-if="liveStatus == 1">
    <div v-if="isInteractLive && !isBanned && !allBanned">
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
      },
      //当前直播状态
      liveStatus() {
        return this.$domainStore.state.roomBaseServer.watchInitData.webinar.type;
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
        // this.$message.warning(this.$t('interact.interact_1028'));
      });
      // 主播端开启 举手按钮
      useMicServer().$on('vrtc_connect_open', msg => {
        // 7.7.4 优化后不再提示
        // this.$message.success(this.$t('interact.interact_1003'));
      });
      // 主播端关闭 举手按钮
      useMicServer().$on('vrtc_connect_close', msg => {
        // 7.7.4 优化后不再提示
        // this.$message.success(this.$t('interact.interact_1002'));
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
          window.vhallReportForProduct.toResultsReporting(170008, {
            event_type: 'message',
            failed_reason: msg
          });
        }
      });
      // 用户申请被拒绝（客户端有拒绝用户上麦的操作）
      useMicServer().$on('vrtc_connect_refused', msg => {
        this.loading = false;
        this.isApplyed = false;
        this.waitInterval && clearInterval(this.waitInterval);
        this.btnText = this.$t('interact.interact_1041');
        window.vhallReportForProduct.toResultsReporting(170008, {
          event_type: 'message',
          failed_reason: msg
        });
      });
    },
    methods: {
      // 下麦
      speakOff() {
        this.$confirm(this.$t('interact.interact_1043'), this.$t('account.account_1061'), {
          confirmButtonText: this.$t('account.account_1062'),
          cancelButtonText: this.$t('account.account_1063'),
          customClass: 'zdy-message-box',
          cancelButtonClass: 'zdy-confirm-cancel'
        }).then(async () => {
          // 用户下麦
          window.vhallReportForProduct.toStartReporting(170002, [170003, 170033, 110193, 110185]);
          this.loading = true;
          try {
            const res = await useMicServer().speakOff();
            if (res.code === 513035) {
              this.$message.error(res.msg);
            }
            this.loading = false;
            window.vhallReportForProduct.toResultsReporting(170003, {
              event_type: 'interface',
              failed_reason: res,
              request_id: res.request_id
            });
          } catch (error) {
            this.loading = false;
            window.vhallReportForProduct.toResultsReporting(170003, {
              event_type: 'interface',
              failed_reason: error,
              request_id: error.request_id
            });
          }
        });
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
        // 申请连麦
        window.vhallReportForProduct.toStartReporting(170004, [170005, 170032, 110187, 110183]);
        useMicServer()
          .userApply()
          .then(res => {
            this.loading = false;
            if (res.code != 200) {
              let failed_reason = '';
              if (res.code == 513345) {
                failed_reason = this.$t('interact.interact_1037');
                this.$message.warning(failed_reason);
              } else if (res.code == 513025) {
                failed_reason = this.$t('interact.interact_1029', { n: res.data.replace_data[0] });
                this.$message.error(failed_reason);
              }

              // 数据上报，场景：申请接口 上麦失败
              window.vhallReportForProduct.toResultsReporting(170005, {
                waiting_time: this.waitTime,
                failed_reason: res,
                reasonTxt: failed_reason
              });
              return;
            }
            this.isApplyed = true;
            this.waitTime = 30;
            this.btnText = `${this.$t('interact.interact_1004')}(${this.waitTime}s)`;
            // 数据上报，场景：申请接口
            window.vhallReportForProduct.toResultsReporting(170005, {
              event_type: 'interface',
              failed_reason: res,
              waiting_time: this.waitTime,
              request_id: res.request_id
            });
            this.startWaitInterval();
          })
          .catch(err => {
            this.loading = false;
            // 数据上报，场景：申请接口 上麦失败
            window.vhallReportForProduct.toResultsReporting(170005, {
              waiting_time: this.waitTime,
              failed_reason: err,
              reasonTxt: '捕获到接口catch异常',
              request_id: err.request_id
            });
          });
      },
      // 取消申请
      userCancelApply() {
        // 取消连麦邀请上报
        window.vhallReportForProduct.toStartReporting(170006, 170007, {
          waiting_time: this.waitTime
        });
        useMicServer()
          .userCancelApply()
          .then(res => {
            this.loading = false;
            this.isApplyed = false;
            this.waitInterval && clearInterval(this.waitInterval);
            this.btnText = this.$t('interact.interact_1041');
            // 7.7.4 优化后不再提示
            // this.$message({
            //   message: this.$t('interact.interact_1027'),
            //   showClose: true,
            //   type: 'success',
            //   customClass: 'zdy-info-box'
            // });
            // 数据上报，场景：取消连麦邀请上报接口
            window.vhallReportForProduct.toResultsReporting(170007, {
              event_type: 'interface',
              failed_reason: res,
              request_id: res.request_id
            });
          })
          .catch(err => {
            this.loading = false;
            // 数据上报，场景：取消连麦邀请上报接口
            window.vhallReportForProduct.toResultsReporting(170007, {
              event_type: 'interface',
              failed_reason: err,
              request_id: err.request_id
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
            this.btnText = this.$t('interact.interact_1041');
            this.isApplyed = false;

            let tip = '';
            if (this.isInGroup) {
              tip = '组长拒绝了您的上麦请求';
            } else {
              tip = this.$t('other.other_1006');
            }
            this.$message.warning(tip);
            useMicServer().userCancelApply();
            // 数据上报，场景：倒计时结束（上麦失败）
            window.vhallReportForProduct.toResultsReporting(170005, {
              waiting_time: this.waitTime,
              failed_reason: {},
              reasonTxt: tip
            });
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
    &:hover {
      color: #ffffff;
      background: var(--theme-color);
      border: 1px solid var(--theme-color);
    }
  }
</style>

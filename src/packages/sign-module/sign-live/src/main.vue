<template>
  <div class="vmp-sign-live">
    <el-dialog title="签到" :visible.sync="signVisible" :close-on-click-modal="false" width="440px">
      <!-- 签到信息 -->
      <signinSet v-if="showSet" @start="startSign"></signinSet>
    </el-dialog>
    <div class="vmp-sign-live_down" v-if="signinDown">
      <div class="down-container">
        <!-- 签到倒计时弹窗 -->
        <Counter
          @close-sign="closeAutoSignin"
          :autoSign="signInfo.autoSign"
          :title="signInfo.signTip"
          :total="total"
          :remaining="remaining"
          v-if="starting"
          ref="counter"
        ></Counter>
        <!-- 签到结果 -->
        <signinResult
          v-if="showResult"
          @restartsign="resetSignState"
          :room_id="roomId"
          :signId="signId"
        ></signinResult>
        <div class="vmp-sign-live_close" @click="signinDown = false">
          <i class="vh-iconfont vh-line-circle-close"></i>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  import signinSet from './components/signinSet.vue';
  import Counter from './components/counter.vue';
  import signinResult from './components/signinResult.vue';
  import { useSignServer, useChatServer } from 'middle-domain';
  export default {
    name: 'VmpSignLive',
    components: {
      signinSet,
      Counter,
      signinResult
    },
    computed: {
      // 总时间
      total() {
        const { duration, autoSign, interval } = this.signInfo;
        return autoSign ? interval : duration;
      },
      // 签到现在的剩余的时间
      starting() {
        return this.signInfo !== null && !!this.remaining;
      },
      // 签到信息是否显示
      showSet() {
        return this.signInfo === null;
      },
      // 签到结果
      showResult() {
        return this.signInfo !== null && !this.remaining && !this.signInfo.autoSign;
      },
      roomId() {
        return this.$domainStore.state.roomBaseServer.watchInitData.interact.room_id;
      }
    },
    data() {
      return {
        signVisible: false,
        signinDown: false,
        signInfo: null,
        remaining: 0, // 总时长
        timer: null,
        totalTime: 0,
        signId: '', // 签到ID
        nowSignObj: '' // 当前自动签到信息
      };
    },
    beforeCreate() {
      this.signServer = useSignServer();
    },
    mounted() {
      // 签到推送
      this.signServer.$on('sign_in_push', e => {
        const data = {
          roleName: e.data.role_name,
          nickname: e.data.sign_creator_nickname,
          avatar: '//cnstatic01.e.vhall.com/static/images/watch/system.png',
          content: {
            text_content: `${this.$t('chat.chat_1027')}`
          },
          type: e.data.type,
          interactStatus: true
        };
        useChatServer().addChatToList(data);
      });
      // 签到关闭
      this.signServer.$on('sign_end', e => {
        window.sessionStorage.removeItem('isAutoSign');
        this.signInfo.autoSign = 0;
        this.remaining = 0;
        clearInterval(this.timer);
        const data = {
          roleName: e.data.role_name,
          nickname: e.data.sign_creator_nickname,
          avatar: '//cnstatic01.e.vhall.com/static/images/watch/system.png',
          content: {
            text_content: `${this.$t('chat.chat_1028')}`
          },
          type: e.data.type,
          interactStatus: true
        };
        useChatServer().addChatToList(data);
      });
      // 收到结束签到的消息
      this.signServer.$on('live_over', e => {
        this.signVisible = false;
        this.signinDown = false;
        if (this.timer) {
          clearInterval(this.timer);
        }
      });
    },
    methods: {
      handleSign(flag) {
        flag ? this.openSign() : this.closeSign();
      },
      openSign() {
        // 是否发起了签到
        this.getSignInfo();
      },
      closeSign() {
        this.signVisible = false;
      },
      getSignInfo() {
        this.signServer
          .getSignInfo({ room_id: this.roomId })
          .then(res => {
            if (res.data.id) {
              this.signVisible = false;
              this.signinDown = true;
              this.signInfo = res.data;
              this.signId = res.data.id;
              this.nowSignObj = res.data;
              this.signInfo.autoSign = res.data.is_auto_sign == 1;
              if (res.data.is_auto_sign == 1) {
                window.sessionStorage.setItem('isAutoSign', 'true');
                this.remaining = res.data.auto_sign_time_ttl;
                this.signInfo.interval = res.data.auto_sign_time;
                this.totalTime = res.data.auto_sign_time;
              } else {
                this.signInfo.duration = res.data.show_time;
                this.remaining = res.data.sign_time_ttl;
                this.totalTime = 0;
              }
              this.setIntervalAction();
            } else {
              this.signInfo = null;
              this.signVisible = true;
              this.remaining = 0;
              this.signinDown = false;
            }
          })
          .catch(res => {
            this.$message.error(res.msg);
          });
      },
      // 倒计时
      setIntervalAction() {
        clearInterval(this.timer);
        this.timer = setInterval(() => {
          if (--this.remaining == 0) {
            if (sessionStorage.getItem('isAutoSign')) {
              this.remaining = this.totalTime;
              this.signVisible = false;
              this.signinDown = true;
            } else {
              clearInterval(this.timer);
            }
          }
        }, 1000);
        this.$once('hook:beforeDestory', () => {
          clearInterval(this.timer);
        });
      },
      // 开始签到按钮
      startSign(state) {
        const _data = {
          room_id: this.roomId,
          sign_tips: state.signTip, // 签到提示语
          show_time: state.duration, // 签到显示的时间，单位秒，默认30
          is_auto_sign: Number(state.autoSign), // 是否自动发起签到，1自动，0取消自动，默认0
          auto_sign_time: state.interval // 自动发起签到的轮询定时时间，单位秒
        };
        this.signServer.signStart(_data).then(res => {
          if (res.code == 200) {
            if (state.autoSign) {
              this.totalTime = state.interval;
              window.sessionStorage.setItem('isAutoSign', 'true');
            }
            this.reportSign(state);
            this.signinDown = true;
            this.signVisible = false;
            this.signId = res.data.id;
            this.setSignState({ signInfo: state });
            this.setIntervalAction();
          } else if (res.code == 513204) {
            // 当前活动已签到中！
            this.openSign();
          } else {
            this.$message.error(res.msg);
          }
        });
      },
      // 数据埋点
      reportSign(state) {
        window.vhallReportForProduct && window.vhallReportForProduct.report(110039);
        window.vhallReportForProduct &&
          window.vhallReportForProduct.report(state.autoSign ? 110040 : 110041);
        if (state.signTip != '主持人发起了签到') {
          window.vhallReportForProduct && window.vhallReportForProduct.report(110042);
        }
        const duration = [10, 30, 60, 120, 180];
        const index = duration.indexOf(state.duration);
        const signType = [110043, 110044, 110045, 110046, 110047];
        window.vhallReportForProduct && window.vhallReportForProduct.report(signType[index]);
        if (state.autoSign) {
          const interval = [60, 300, 900, 1800];
          const indexs = interval.indexOf(state.interval);
          const intervalType = [110048, 110049, 110050, 110051];
          window.vhallReportForProduct && window.vhallReportForProduct.report(intervalType[indexs]);
        }
      },
      // 结束签到
      endSignServe() {
        this.signServer
          .signClose({
            room_id: this.roomId,
            sign_id: this.nowSignObj.id
          })
          .then(res => {
            this.$message.success('关闭签到成功');
            window.sessionStorage.removeItem('isAutoSign');
            this.signVisible = false;
            this.signinDown = false;
            this.signInfo = null;
            this.remaining = 0;
          })
          .catch(err => {
            this.$message.error(err.msg);
          });
      },
      // 设置签到信息和状态
      setSignState(state) {
        this.signInfo = state.signInfo;
        this.remaining = state.remaining ? state.remaining : this.total;
      },
      // 开始签到时先判断是否已经存在签到
      resetSignState() {
        this.getSignInfo();
      },
      // 关闭签到
      closeAutoSignin(form) {
        if (form == 'client') {
          // 客户端走的方法
          this.signVisible = false;
          return;
        }
        this.$confirm('您将取消自动签到，确认关闭？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          customClass: 'zdy-message-box',
          cancelButtonClass: 'zdy-confirm-cancel'
        })
          .then(() => {
            this.endSignServe();
          })
          .catch(() => {});
      }
    }
  };
</script>
<style lang="less">
  .vmp-sign-live {
    .el-dialog__body {
      padding: 10px 32px 24px 32px;
    }
    &_down {
      position: fixed;
      top: 0;
      left: 0;
      background: rgba(0, 0, 0, 0.6);
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      z-index: 128;
      .down-container {
        height: 469px;
        width: 400px;
        margin-top: 15vh;
        background-image: url('./img/signBox@2x.png');
        background-size: 100% 100%;
        position: relative;
      }
    }
    &_close {
      position: absolute;
      left: 47%;
      bottom: -18px;
      cursor: pointer;
      border-radius: 50%;
      i {
        font-size: 24px;
        color: #fff;
      }
    }
  }
</style>

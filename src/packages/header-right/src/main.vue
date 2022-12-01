<template>
  <div class="vmp-header-right">
    <section class="vmp-header-right_btn-box">
      <div v-if="countDown && (!isLiving || (isRehearsal && isLiving))" class="rehearsal_countDown">
        <span v-show="roleName != 1">距离开播：</span>
        <span>{{ countDown.time_h }}</span>
        <span>时</span>
        <span>{{ countDown.time_m }}</span>
        <span>分</span>
        <span>{{ countDown.time_s }}</span>
        <span>秒</span>
      </div>
      <record-control
        v-if="configList['cut_record'] && !isInGroup && !isRehearsal"
      ></record-control>
      <div
        class="rehearsalStatus"
        :class="roleName == 3 ? 'assistant' : ''"
        v-if="isRehearsal && isLiving"
      >
        <i class="dot"></i>
        彩排中
      </div>
      <!-- 查看saas-v3-lives 增加 非助理 ： 设备不可用 + 非助理 + 非第三方发起-->
      <template v-if="deviceStatus == 2 && !isThirdStream && roleName != 3 && !isStreamYun">
        <div class="vmp-header-right_btn" @click="handleRecheck">重新检测</div>
      </template>
      <!-- 主持人显示开始结束直播按钮 -->
      <template v-else-if="roleName == 1 && !isInGroup">
        <template v-if="isRecord">
          <div
            v-if="liveStep == 1"
            class="vmp-header-right_btn"
            :class="isStreamYun && !director_stream ? 'right_btn_dis' : ''"
            @click="handleStartClick"
          >
            开始录制
          </div>
        </template>
        <template v-else>
          <div
            v-if="liveStep == 1 && configList['live_rehearsal']"
            class="vmp-header-right_btn rehearsal"
            :class="isStreamYun && !director_stream ? 'right_btn_dis rehearsal_yun' : ''"
            @click="doStartClick($event, true)"
          >
            开始彩排
            <!-- 提示 -->
            <div class="audience-tip">
              <div class="audience-tip__arrow"></div>
              1.彩排下，主持人/嘉宾/助理依然使用正式直播地址参与，观众正式地址看不到彩排内容。
              <br />
              2.彩排会消耗流量/时长等，计费模式与正式直播一致。
            </div>
          </div>
          <div
            v-if="liveStep == 1"
            class="vmp-header-right_btn"
            :class="isStreamYun && !director_stream ? 'right_btn_dis' : ''"
            @click="doStartClick"
          >
            开始直播
          </div>
        </template>
        <div v-if="liveStep == 2" class="vmp-header-right_btn">正在启动...</div>

        <div
          v-if="liveStep == 3 && configList['ui.hide_live_end']"
          class="vmp-header-right_btn vmp-header-right_duration"
          @click="handleEndClick"
        >
          <span class="vmp-header-right_duration-text">{{ formatDuration }}</span>
          <span class="vmp-header-right_duration-end">
            {{ isRecord ? '结束录制' : isRehearsal ? '结束彩排' : '结束直播' }}
          </span>
        </div>

        <div v-if="liveStep == 4" class="vmp-header-right_btn">正在结束...</div>
      </template>
      <!-- 嘉宾显示申请上麦按钮 -->
      <template v-if="roleName == 4 && isLiving && !isInGroup && deviceStatus != 2">
        <!-- 申请上麦按钮 -->
        <div v-if="!isApplying && !isSpeakOn" class="vmp-header-right_btn" @click="mediaCheckClick">
          申请上麦
        </div>
        <!-- 等待应答按钮 -->
        <div v-if="isApplying" class="vmp-header-right_btn" @click="handleApplyCancleClick">
          等待应答{{ applyTime }}s
        </div>
        <!-- 下麦按钮 -->
        <div v-if="isSpeakOn" class="vmp-header-right_btn" @click="handleSpeakOffClick">下麦</div>
      </template>
      <div class="vmp-header-right_control">
        <headerControl
          @openVirtualProple="openVirtualProple"
          @openMediaSettings="openMediaSettings"
          @thirdPushStream="thirdPushStream"
        ></headerControl>
      </div>
      <div class="vmp-header-right_full" @click="fullScreen('body')">
        <i :class="`vh-iconfont ${isFullscreen ? 'vh-line-narrow' : 'vh-line-amplification'}`"></i>
      </div>
    </section>
    <!-- 是否生成回放的弹窗 -->
    <saas-alert
      :visible="popAlert.visible"
      :confirm="popAlert.confirm"
      :knowText="'知道了'"
      :confirmText="'确定'"
      :cancelText="'取消'"
      @onSubmit="doConfirm"
      @onClose="closeConfirm"
      @onCancel="closeConfirm"
    >
      <main slot="content" class="space">{{ popAlert.text }}</main>
    </saas-alert>
    <!-- 非默认回放暂存时间提示 -->
    <saas-alert
      :visible="noDefaultPopAlert.visible"
      :knowText="'知道了'"
      @onClose="noDefaultPopClose"
      @onCancel="noDefaultPopClose"
    >
      <main slot="content">
        <span v-html="noDefaultPopAlert.text"></span>
      </main>
    </saas-alert>
    <!-- 嘉宾上麦前的设备禁用提示 -->
    <saas-alert
      :visible="micfrontPopAlert.visible"
      :isShowClose="false"
      :knowText="'确定'"
      @onClose="closeFrontConfirm"
    >
      <main slot="content">
        <span v-html="micfrontPopAlert.text"></span>
      </main>
    </saas-alert>
  </div>
</template>

<script>
  import headerControl from './components/header-control.vue';
  import RecordControl from './components/record-control.vue';
  import {
    useRoomBaseServer,
    useMicServer,
    useInteractiveServer,
    useSubscribeServer,
    useSplitScreenServer,
    useMediaCheckServer,
    useRebroadcastServer,
    useMsgServer
  } from 'middle-domain';
  import { boxEventOpitons } from '@/app-shared/utils/tool';
  import SaasAlert from '@/packages/pc-alert/src/alert.vue';
  export default {
    name: 'VmpHeaderRight',
    data() {
      return {
        liveStep: 1, // 1未开始 2启动中 3直播中 4结束中
        liveDuration: '',
        isApplying: false, // 是否正在等待应答
        applyTime: 30,
        isFullscreen: false,
        assistantType: this.$route.query.assistantType,
        popAlert: {
          // 设为默认回放的弹窗
          text: '',
          visible: false,
          confirm: true,
          level: false //优先级 彩排中 <30s 需要用户自己控制关闭，添加此标识
        },
        noDefaultPopAlert: {
          // 非默认回放暂存时间提示
          text: '',
          visible: false
        },
        deviceStatus: useMediaCheckServer().state.deviceInfo?.device_status,
        countDownTime: Number,
        countDownTimer: null, // 开播倒计时计时器
        micfrontPopAlert: {
          // 嘉宾上麦前的禁用提示
          text: '检测到您的设备（摄像头或麦克风）处于关闭状态，上麦后会自动打开。',
          visible: false
        }
      };
    },
    computed: {
      formatDuration() {
        const temp = this.liveDuration * 1000;
        const hours = dayjs.duration(temp).hours();
        const minutes = dayjs.duration(temp).minutes();
        const seconds = dayjs.duration(temp).seconds();
        return `${hours < 10 ? '0' + hours : hours}:${minutes < 10 ? '0' + minutes : minutes}:${
          seconds < 10 ? '0' + seconds : seconds
        }`;
      },
      // 是否是录制
      isRecord() {
        return this.$domainStore.state.roomBaseServer.clientType == 'record';
      },
      // 是否是彩排
      isRehearsal() {
        return this.$domainStore.state.roomBaseServer.watchInitData.live_type == 2;
      },
      configList() {
        return this.$domainStore.state.roomBaseServer.configList;
      },
      roleName() {
        return this.$domainStore.state.roomBaseServer.watchInitData.join_info.role_name;
      },
      isSpeakOn() {
        return useMicServer().getSpeakerStatus();
      },
      isLiving() {
        return this.$domainStore.state.roomBaseServer.watchInitData.webinar.type == 1;
      },
      isInGroup() {
        // 在小组中
        return this.$domainStore.state.groupServer.groupInitData?.isInGroup;
      },
      isStreamYun() {
        return (
          this.$domainStore.state.roomBaseServer.watchInitData.webinar.is_director == 1 &&
          this.$domainStore.state.roomBaseServer.watchInitData.permissionKey['webinar.director'] ==
            1
        );
      },
      // 是否为第三方发起
      isThirdStream() {
        return this.$domainStore.state.roomBaseServer.isThirdStream;
      },
      // 第三方发起拉流地址URL
      thirdPullStreamUrl() {
        return this.$domainStore.state.roomBaseServer.thirdPullStreamUrl;
      },
      // 第三方发起拉流模式
      thirdPullStreamMode() {
        return this.$domainStore.state.roomBaseServer.thirdPullStreamMode;
      },
      // 云导播台是否有流
      director_stream() {
        return this.$domainStore.state.roomBaseServer.director_stream == 1;
      },
      // 开播倒计时
      countDown() {
        let countDown = this.countDownTime;
        if (countDown <= 0 || countDown > 24 * 60 * 60 * 1000) return;
        let h, m, s, _h, _m, time_str, timeObj;
        h = parseInt(countDown / (60 * 60 * 1000));
        _h = parseInt(countDown % (60 * 60 * 1000));
        m = parseInt(_h / (1000 * 60));
        _m = parseInt(_h % (1000 * 60));
        s = parseInt(_m / 1000);
        time_str =
          (h > 9 ? h : '0' + h) +
          '时' +
          (m > 9 ? m : '0' + m) +
          '分' +
          (s > 9 ? s : '0' + s) +
          '秒';
        timeObj = {
          time_str,
          time_h: h > 9 ? h : '0' + h,
          time_m: m > 9 ? m : '0' + m,
          time_s: s > 9 ? s : '0' + s
        };
        return timeObj;
      }
    },
    components: {
      headerControl,
      SaasAlert,
      RecordControl
    },
    created() {
      this.roomBaseServer = useRoomBaseServer();
      this.interactiveServer = useInteractiveServer();
      this.splitScreenServer = useSplitScreenServer();
      this.rebroadcastServer = useRebroadcastServer();
      this.initConfig();
      this.listenEvents();
    },
    mounted() {
      /*
       * 补充：第三方发起时，不在进行设备状态的相关提示
       *    若助理，则无需进行提示，助理是不存在上麦的
       */
      if (
        this.deviceStatus == 2 &&
        this.roleName != 3 &&
        !this.isThirdStream &&
        !this.isStreamYun
      ) {
        this.$message.error('发起直播前，请先允许访问摄像头和麦克风');
      }
      const { watchInitData } = this.roomBaseServer.state;
      if (watchInitData.webinar.type == 1 || watchInitData?.record?.is_recording == 1) {
        this._tempLiveType = watchInitData.live_type;
        if (watchInitData?.record?.is_recording == 1) {
          this.liveDuration = watchInitData.record.record_time;
        } else {
          this.liveDuration = watchInitData.webinar.live_time;
        }
        this.calculateLiveDuration();
        // 补充逻辑：若是网页上显示第三方发起->则直接修改状态至3
        if (
          !useMicServer().getSpeakerStatus() ||
          this.isThirdStream ||
          watchInitData.rebroadcast.isRebroadcasting
        ) {
          this.liveStep = 3;
        } else {
          this.liveStep = 2;
        }
        // 如果开启了分屏 或者是 云导播
        if (this.splitScreenServer.state.isOpenSplitScreen || this.isStreamYun) {
          this.handlePublishComplate();
        }
      }
      if (this.isStreamYun) {
        this.roomBaseServer.getStreamStatus();
      }
      this.countDownTime =
        new Date(
          this.$domainStore.state.roomBaseServer.watchInitData.webinar.start_time.replace(/-/g, '/')
        ).getTime() - new Date().getTime();
      // 倒计时大于0小于24小时
      if (this.countDownTime > 0) {
        this.countDownTimer = setInterval(() => {
          this.countDownTime =
            new Date(
              this.$domainStore.state.roomBaseServer.watchInitData.webinar.start_time.replace(
                /-/g,
                '/'
              )
            ).getTime() - new Date().getTime();

          if (this.countDownTime <= 0) {
            clearInterval(this.countDownTimer);
          }
        }, 1000);
      }
    },
    methods: {
      // 上麦前进行媒体检测  device_status 0未检测 1 设备OK   2设备不支持
      mediaCheckClick() {
        const device_status = useMediaCheckServer().state.deviceInfo.device_status;
        if (device_status == 1) {
          // this.handleApplyClick();
          this.showConfirmPop();
        } else if (device_status == 0) {
          useMediaCheckServer()
            .getMediaInputPermission({ isNeedBroadcast: false })
            .then(flag => {
              if (flag) {
                // this.handleApplyClick();
                this.showConfirmPop();
              } else {
                this.$message.warning(this.$t('interact.interact_1039'));
              }
            });
        } else {
          this.$message.warning(this.$t('interact.interact_1039'));
        }
      },
      showConfirmPop() {
        const { videoMuted, audioMuted } = this.interactiveServer.state.localSpeaker;
        if (videoMuted || audioMuted) {
          this.micfrontPopAlert.visible = true;
        } else {
          this.handleApplyClick();
        }
      },
      closeFrontConfirm() {
        console.log('closeFrontConfirm-----');
        this.micfrontPopAlert.visible = false;
        this.handleApplyClick();
      },
      // 嘉宾点击申请上麦
      handleApplyClick() {
        window.vhallReportForProduct?.toStartReporting(110131, [110158, 170032, 110187, 110183]);
        this._applyInterval && clearInterval(this._applyInterval);
        useMicServer()
          .userApply()
          .then(res => {
            window.vhallReportForProduct?.toResultsReporting(110158, {
              request_id: res?.request_id,
              event_type: 'interface',
              res
            });
            if (+res.code !== 200) {
              if (res.code == 513025) {
                this.$message.error(
                  this.$t('interact.interact_1029', { n: res.data.replace_data[0] })
                );
              } else {
                this.$message.error(res.msg);
              }
              return;
            }
            this.isApplying = true;
            this.applyTime = 30;
            this._applyInterval = setInterval(() => {
              this.applyTime = this.applyTime - 1;
              if (this.applyTime == 0 && this._applyInterval) {
                this.$message.warning({ message: this.$t('other.other_1006') });
                clearInterval(this._applyInterval);
                this.isApplying = false;
                window.vhallReportForProduct?.toStartReporting(110160, 110161);
                useMicServer()
                  .speakOff()
                  .then(res => {
                    const { code, msg, request_id } = res;
                    window.vhallReportForProduct?.toResultsReporting(110161, {
                      request_id,
                      event_type: 'interface',
                      code,
                      msg
                    });
                    if (code === 513035) {
                      this.$message.error(msg);
                    }
                  });
              }
            }, 1000);
          });
      },
      // 嘉宾取消申请
      handleApplyCancleClick() {
        window.vhallReportForProduct?.toStartReporting(110152, 110159, {
          waiting_time: this.applyTime
        });
        useMicServer()
          .userCancelApply()
          .then(res => {
            window.vhallReportForProduct?.toResultsReporting(110159, {
              request_id: res?.request_id,
              event_type: 'interface',
              res
            });
            this.isApplying = false;
            this.applyTime = 30;
            clearInterval(this._applyInterval);
          });
      },
      // 嘉宾下麦
      handleSpeakOffClick() {
        this.$confirm(this.$t('interact.interact_1043'), this.$t('account.account_1061'), {
          confirmButtonText: this.$t('other.other_1027'),
          cancelButtonText: this.$t('other.other_1028'),
          customClass: 'zdy-message-box',
          cancelButtonClass: 'zdy-confirm-cancel'
        }).then(async () => {
          window.vhallReportForProduct?.toStartReporting(110132, [110156, 170033, 110193, 110185]);
          // 下麦接口停止推流，成功之后执行下面的逻辑
          const { code, msg, request_id } = await useMicServer().speakOff();
          window.vhallReportForProduct?.toResultsReporting(110156, {
            request_id,
            event_type: 'interface',
            code,
            msg
          });
          if (parseInt(this.roleName) !== 4) {
            if (code !== 200) {
              this.$message.error(msg);
            }
          }
          this.isApplying = false;
          this.applyTimerCount = 30;
        });
      },

      /**
       * 描述 重新检测当前设备
       *      1、提示麦克风设备不可用
       *      2、检测麦克风设备
       *          可用 则本地修改deviceStatus值
       *               检测是否在直播中，若在直播中，则liveStep = 3
       * deviceStatus: 设备检测之后刷新按钮状态
       * @date 2022-03-24
       * @returns {any}
       */
      async handleRecheck(deviceStatus = false) {
        if (!deviceStatus) {
          await useMediaCheckServer().getMediaInputPermission({ isNeedBroadcast: false });
        }
        if (useMediaCheckServer().state.deviceInfo?.device_status == 1 || deviceStatus) {
          this.deviceStatus = 1;
          window.$middleEventSdk?.event?.send(
            boxEventOpitons(this.cuid, 'emitClickCheckStartPush')
          );
          if (this.isLiving) {
            this.liveStep = 3;
          } else {
            this.liveStep = 1;
          }
        } else {
          this.$message.error('发起直播前，请先允许访问摄像头和麦克风');
        }
      },
      listenEvents() {
        // 全屏事件
        const setFullscreen = () => {
          const fullscreenElement =
            document.fullscreenElement ||
            document.webkitFullscreenElement ||
            document.mozFullscreenElement ||
            document.msFullscreenElement;
          if (fullscreenElement && fullscreenElement.tagName === 'BODY') {
            this.isFullscreen = true;
          } else {
            this.isFullscreen = false;
          }
        };
        window.addEventListener('fullscreenchange', setFullscreen);
        window.addEventListener('webkitfullscreenchange', setFullscreen);
        window.addEventListener('mozfullscreenchange', setFullscreen);
        window.addEventListener('msfullscreenchange', setFullscreen);
        window.addEventListener('MSFullscreenChange', setFullscreen);

        // 嘉宾上麦成功相关处理
        if (this.roleName == 4) {
          useMicServer().$on('vrtc_connect_success', async msg => {
            if (
              msg.data.room_join_id ==
              this.roomBaseServer.state.watchInitData?.join_info?.third_party_user_id
            ) {
              this.isApplying = false;
              clearInterval(this._applyInterval);
            }
          });

          // 嘉宾申请被拒绝（客户端有拒绝用户上麦的操作）
          useMsgServer().$onMsg('ROOM_MSG', msg => {
            let temp = Object.assign({}, msg);
            if (Object.prototype.toString.call(temp.data) !== '[object Object]') {
              temp.data = JSON.parse(temp.data);
            }
            const { type = '' } = temp.data || {};
            console.log(
              '1111-a-a-a-a-a-',
              temp,
              this.roomBaseServer.state.watchInitData?.join_info?.third_party_user_id
            );
            if (type === 'vrtc_connect_refused') {
              if (
                this.roomBaseServer.state.watchInitData?.join_info?.third_party_user_id !=
                temp.data.room_join_id
              ) {
                return;
              }
              this.isApplying = false;
              this.applyTime = 30;
              this._applyInterval && clearInterval(this._applyInterval);
            }
          });

          // 开始直播显示申请上麦
          useSubscribeServer().$on('live_start', () => {
            this.liveStep = 2;
          });

          // live_over 结束直播
          this.interactiveServer.$on('live_over', () => {
            this.liveStep = 1;
          });
        }
      },
      initConfig() {
        const widget = window.$serverConfig?.[this.cuid];
        if (widget && widget.options) {
          Object.assign(this.$data, widget.options);
        }
      },
      // 打开媒体设置弹窗
      openMediaSettings() {
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitMediaSettingClick'));
      },
      // 打开虚拟人数的弹窗
      openVirtualProple() {
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitVirtualClick'));
      },
      // 校验第三方拉流地址
      checkValidatePullUrl() {
        window.$middleEventSdk?.event?.send(
          boxEventOpitons(this.cuid, 'emitClickCheckValidatePullUrl')
        );
      },
      // 第三方推流和网页
      thirdPushStream(flag) {
        window.$middleEventSdk?.event?.send(
          boxEventOpitons(this.cuid, 'emitClickThirdStream', [{ status: flag }])
        );
      },
      // 推流成功事件
      // TODO：第三方发起 请求了两次接口，第一次开播之后，收到vrtc_connect_success上麦的消息，又回调了handlePublishComplate
      async handlePublishComplate() {
        const { watchInitData } = this.roomBaseServer.state;
        // 如果是录制页面
        if (this.isRecord) {
          const res = await this.postStartRecord();
          if (res.code == 200) {
            this.liveStep = 3;
            this.calculateLiveDuration();
            if (this.roomBaseServer.state.watchInitData?.record) {
              this.roomBaseServer.state.watchInitData.record.is_recording = 1;
            }
          }
          return;
        }
        // 如果是发起端页面
        if (watchInitData.webinar.type != 1) {
          //mode2  需要校验url，调用单独接口
          if (this.thirdPullStreamMode == 2) {
            const res = await this.postStartLiveThird();
            // 开始直播成功
            if (res.code == 200) {
              //数据埋点--第三方发起模式-拉流设置2
              window.vhallReportForProduct?.report(120012);
              this.liveStep = 3;
              this.calculateLiveDuration();
            }
          } else {
            const res = await this.postStartLive();
            // 开始直播成功
            if (res.code == 200) {
              if (this.isThirdStream) {
                //数据埋点--第三方发起模式-拉流设置1
                window.vhallReportForProduct?.report(120011);
              } else {
                //数据埋点--网页直播
                window.vhallReportForProduct?.report(120013);
              }
              this.liveStep = 3;
              this.calculateLiveDuration();
            }
          }
          window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitStartLiveSuccess'));
        } else {
          this.liveStep = 3;
        }
      },
      // 停止本地推流事件
      handleUnpublishComplate() {
        if (this.isRecord) {
          // 如果是回放录制页面
          this.handleSaveVodInRecord();
        } else if (this._tempLiveType !== 2 || (this._tempLiveType == 2 && !this.popAlert.level)) {
          // 如果是直播页面
          // 注意：此时直播已经结束，live_type已经重制，所以不能用live_type判断
          this.handleSaveVodInLive();
        }
        this.liveStep = 1;
      },
      // 调开始录制接口
      postStartRecord() {
        console.log('调开始录制接口');
        return this.roomBaseServer.startRecord({
          webinar_id: this.roomBaseServer.state.watchInitData.webinar.id,
          user_id: this.roomBaseServer.state.watchInitData.join_info.third_party_user_id
        });
      },
      // 调开始直播接口
      postStartLive() {
        return this.roomBaseServer.startLive({
          webinar_id: this.roomBaseServer.state.watchInitData.webinar.id,
          start_type: this.roomBaseServer.state.interactToolStatus.start_type,
          live_type: this.isRehearsal ? 2 : 0 //开播类型：0-正式直播（默认）；2-彩排
        });
      },
      // 调开始直播接口- 第三方
      postStartLiveThird() {
        return this.roomBaseServer.startLiveThird({
          webinar_id: this.roomBaseServer.state.watchInitData.webinar.id,
          dest_url: this.roomBaseServer.state.thirdPullStreamUrl,
          live_type: this.isRehearsal ? 2 : 0 //开播类型：0-正式直播（默认）；2-彩排
        });
      },
      doStartClick(event, isRehearsal = false) {
        // 如果是开始彩排，将场次类型改为 2
        if (isRehearsal) {
          this.roomBaseServer.state.watchInitData.live_type = 2;
          // 由于 live_type 在结束直播之后会重制，所以需要记录一个状态，用于在结束直播之后生成回放的时候，判断是否是彩排的回放
          this._tempLiveType = 2;
        } else {
          this._tempLiveType = 0;
        }
        this.handleStartClick();
      },
      // 开始直播/录制事件  thirdPullStreamvalidate=>false-未校验   true->无需校验   isRehearsal:是否彩排
      async handleStartClick(event, thirdPullStreamvalidate = false) {
        const { watchInitData } = this.roomBaseServer.state;
        // 如果是云导播活动 并且没有流
        if (this.isStreamYun && !this.director_stream) return false;
        if (this.isThirdStream) {
          await this.roomBaseServer.getInavToolStatus();
          // getInavToolStatus接口回重制start_type状态，所以需要重新设置第三方推流开启状态
          this.roomBaseServer.setInavToolStatus('start_type', 4);
          if (this.roomBaseServer.state.interactToolStatus.speakerAndShowLayout == 1) {
            this.$message.warning('合并模式不支持三方推流');
            return;
          }
        }
        //mode2  需要校验url，调用单独接口
        if (this.isThirdStream && this.thirdPullStreamMode == 2 && !thirdPullStreamvalidate) {
          this.checkValidatePullUrl();
          return false;
        }
        this.liveStep = 2;
        if (this.isThirdStream || this.isStreamYun) {
          if (this.isRehearsal) {
            window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitOpenShare'));
          }
          // 若是选择第三方发起，则直接进行调用接口更改liveStep状态 || 云导播无需推流 直接调用开播接口即可
          this.handlePublishComplate();
        } else {
          //先检测房间内有无推流
          await this.roomBaseServer.getLiveStreamStatus();
          if (this.roomBaseServer.state.streamStatus == 1) {
            this.$confirm(
              '<p>监测到您的直播间有正在进行的推流，确认是否开播？</p><p>注意：继续开播，观看端将看到正在进行的推流画面</p>',
              '提示',
              {
                dangerouslyUseHTMLString: true,
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                customClass: 'zdy-message-box',
                cancelButtonClass: 'zdy-confirm-cancel'
                // type: 'info',
                // center: true
              }
            )
              .then(() => {
                // 派发推流事件
                if (watchInitData.webinar.mode == 2) {
                  this.roomBaseServer.setThirdPushStream(true);
                }
                this.clickStartLive();
              })
              .catch(action => {
                this.liveStep = 1;
              });
          } else {
            // 派发推流事件
            this.clickStartLive();
          }
        }
      },
      // 结束直播/录制
      handleEndClick() {
        if (this.splitScreenServer.state.isHostWaitingSplit) {
          return this.$message.warning('请分屏关闭完成以后结束直播');
        }
        if (this.isRecord) {
          this.handleEndClickInRecord();
        } else {
          //彩排弹框确认
          if (this.isRehearsal) {
            if (this.liveDuration < 30) {
              window.clearInterval(this._durationInterval);
              const { watchInitData } = this.roomBaseServer.state;
              this.liveDuration = 0;
              const type = watchInitData.webinar.mode == 1 ? '音频' : '视频';
              this.popAlert.text = `${type}时长过短，不支持生成回放`;
              this.popAlert.visible = true;
              this.popAlert.confirm = false;
              this.popAlert.level = true;

              this.handleEndClickInLive();
            } else {
              this.popAlert.text =
                '点击确定后，直播彩排结束。\n彩排结束生成带有“彩排回放”标识的视频。';
              this.popAlert.visible = true;
              this.popAlert.confirm = true;
              this.popAlert.level = false;
            }
          } else {
            this.handleEndClickInLive();
            // 彩排倒计时清除
            if (this.countDownTimer) {
              this.countDownTime = -1;
              clearInterval(this.countDownTimer);
            }
          }
        }
      },
      // 直播页 点击结束直播
      async handleEndClickInLive() {
        if (this._tempLiveType == 2 && !this.popAlert.level) {
          this.popAlert.visible = false;
        }
        const { watchInitData, interactToolStatus } = this.roomBaseServer.state;

        this.liveStep = 4;

        // 如果正在开启转播
        if (watchInitData.rebroadcast?.id) {
          // 先结束转播
          await this.rebroadcastServer.stop({
            webinar_id: watchInitData.webinar.id,
            source_id: this.rebroadcastServer.state.sourceWebinarId
          });
        }

        const res = await this.roomBaseServer.endLive({
          webinar_id: watchInitData.webinar.id,
          end_type: interactToolStatus.start_type,
          live_type: this.isRehearsal ? 2 : 0 //开播类型：0-正式直播（默认）；2-彩排
        });
        // 如果开启了分屏
        if (this.splitScreenServer.state.isOpenSplitScreen) {
          return;
        }

        // 如果是第三方推流直接生成回放 云导播逻辑相同
        if (res.code == 200 && (interactToolStatus.start_type == 4 || this.isStreamYun)) {
          this.handleSaveVodInLive();
          this.liveStep = 1;
        }
      },
      // 录制页 点击结束录制
      async handleEndClickInRecord() {
        const { watchInitData } = this.roomBaseServer.state;
        const res = await this.roomBaseServer.endRecord({
          webinar_id: watchInitData.webinar.id,
          user_id: watchInitData.join_info.third_party_user_id
        });
        if (res.code == 200) {
          this._recordId = res.data.sid; // 场次id
          // 派发事件，结束推流
          window.$middleEventSdk?.event?.send(
            boxEventOpitons(this.cuid, 'emitClickEndLive', [{ source: 'live_over' }])
          );
        }
      },
      // 录制 生成回放
      async handleSaveVodInRecord() {
        if (this.liveDuration < 30) {
          this.liveDuration = 0;
          this.popAlert.text = `录制时长过短，不支持生成回放`;
          this.popAlert.visible = true;
          this.popAlert.confirm = false;
          this.popAlert.level = false;
        } else {
          this.liveDuration = 0;
          // 如果是录制结束,并且录制时长大于30秒,展示录制结束组件
          window.$middleEventSdk?.event?.send(
            boxEventOpitons(this.cuid, 'recordVideoSuccess', [this._recordId])
          );
        }
      },
      // 直播 生成回放
      async handleSaveVodInLive() {
        window.clearInterval(this._durationInterval);
        const { watchInitData } = this.roomBaseServer.state;
        if (this.liveDuration < 30) {
          this.liveDuration = 0;
          const type = watchInitData.webinar.mode == 1 ? '音频' : '视频';
          this.popAlert.text = `${type}时长过短，不支持生成回放`;
          this.popAlert.visible = true;
          this.popAlert.confirm = false;
          this.popAlert.level = false;
        } else {
          this.liveDuration = 0;
          // 直播结束生成回放
          // 注意：此时直播已经结束，live_type已经重制，所以不能用live_type判断
          const res = await this.roomBaseServer.createRecordInLive({
            webinar_id: watchInitData.webinar.id,
            live_type: this._tempLiveType ? 2 : 0 //开播类型：0-正式直播（默认）；2-彩排
          });
          // 如果是彩排，不需要设置默认回放
          if (this._tempLiveType == 2) return;
          // 如果是直播并且开启生成回放的提示,展示弹窗
          if (res.code == 200 && watchInitData.record_tip == 1 && !this.isRecord) {
            this.popAlert.text = '自动生成回放成功，是否设置为默认回放？';
            this.popAlert.visible = true;
            this.popAlert.confirm = true;
            this.popAlert._recordId = res.data.record_id;
            this.popAlert.level = false;
          }
        }
      },

      //兼容 直播和彩排的确认框
      doConfirm() {
        if (this.isRehearsal) {
          this.handleEndClickInLive();
        } else {
          this.handleSetDefaultRecord();
        }
      },
      // 设置默认回放
      async handleSetDefaultRecord() {
        try {
          window.vhallReportForProduct?.report(110140);
          const res = await this.roomBaseServer.setDefaultRecord({
            webinar_id: this.roomBaseServer.state.watchInitData.webinar.id,
            record_id: this.popAlert._recordId,
            type: 1
          });
          if (res.code == 200) {
            this.popAlert.visible = false;
            this.$message.success('设置成功');
          }
        } catch (err) {
          console.log(err);
        }
      },
      // 关闭弹窗
      closeConfirm() {
        this.popAlert.visible = false;
        if (this.isRehearsal) {
          return;
        }

        window.vhallReportForProduct?.report(110141);
        // 如果是关闭设置默认回放的弹窗，需要给出暂存时间提示，否则直接return
        if (!this.popAlert.confirm) return;
        const { watchInitData } = this.roomBaseServer.state;
        if (watchInitData.record_notice == 4) {
          return;
        }
        this.noDefaultPopAlert.visible = true;
        let html = '非默认回放将暂存15天';
        if (watchInitData.record_notice == 1) {
          html = '非默认回放将暂存15天';
        } else if (watchInitData.record_notice == 2) {
          html =
            "非默认回放将暂存15天，联系您的客户经理或 <a href=\"https://vhall.s4.udesk.cn/im_client/?web_plugin_id=15038\" style='color: #fb3a32' target='_blank'>客服</a> 开通点播服务，即可将非默认回放永久保存和播放";
        } else if (watchInitData.record_notice == 3) {
          html = '非默认回放将暂存15天，发布为点播，即可将非默认回放永久保存和播放';
        }
        this.noDefaultPopAlert.text = html;
      },
      // 关闭非默认回放暂存时间提醒弹窗
      noDefaultPopClose() {
        this.noDefaultPopAlert.visible = false;
      },
      // 开播时间计时器
      calculateLiveDuration() {
        if (this._durationInterval) {
          window.clearInterval(this._durationInterval);
        }
        this._durationInterval = window.setInterval(() => {
          this.liveDuration++;
        }, 1000);
      },
      // 全屏
      fullScreen(el) {
        window.vhallReportForProduct && window.vhallReportForProduct.report(120000);
        this.isFullscreen = !this.isFullscreen;
        if (this.isFullscreen) {
          this.enterFullscreen(el);
        } else {
          this.exitFullscreen(el);
        }
      },
      enterFullscreen() {
        const element = document.querySelector('body');
        if (!this.assistantType) {
          if (element.requestFullscreen) element.requestFullscreen();
          else if (element.mozRequestFullScreen) element.mozRequestFullScreen();
          else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
          } else if (element.msRequestFullscreen) element.msRequestFullscreen();
        }
      },
      exitFullscreen() {
        if (!this.assistantType) {
          if (document.exitFullscreen) document.exitFullscreen();
          else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
          else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
          else if (document.msExitFullscreen) document.msExitFullscreen();
        }
      },
      // 派发推流事件
      clickStartLive() {
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitClickStartLive'));
        if (this.isRehearsal) {
          window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitOpenShare'));
        }
      }
    }
  };
</script>

<style lang="less">
  .vmp-header-right {
    .space {
      white-space: pre-wrap;
    }
    .vmp-header-right_btn-box {
      float: right;
      display: flex;
      height: 100%;
      align-items: center;
      position: relative;
      .rehearsal_countDown {
        color: #fff;
        font-size: 18px;
        margin-right: 16px;
        span:nth-child(2n) {
          padding-left: 7px;
        }
        span:nth-child(2) {
          padding-left: 0;
        }
        span:nth-child(2n + 1) {
          font-size: 10px;
        }
      }
      .rehearsalStatus {
        color: #fb3a32;
        font-weight: 400;
        font-size: 14px;
        line-height: 20px;
        margin-right: 12px;
        position: relative;
        &.assistant {
          margin-right: 4px;
        }
        .dot {
          position: absolute;
          top: 6px;
          left: -12px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #fb3a32;
          content: '';
        }
      }
    }
    .vmp-header-right_btn {
      width: 80px;
      height: 26px;
      border-radius: 80px;
      font-size: 14px;
      text-align: center;
      line-height: 26px;
      color: @font-error-low;
      padding: 0 10px;
      cursor: pointer;
      background-color: @bg-error-light;
      &.rehearsal {
        border: 1px solid rgba(255, 255, 255, 0.45);
        background-color: transparent;
        margin-right: 12px;
        box-sizing: border-box;
        width: 100px;
        position: relative;
        &:hover {
          border: 1px solid #fb3a32;
          background-color: #fb3a32;
          .audience-tip {
            display: block;
          }
        }
        .audience-tip {
          display: none;
          position: absolute;
          top: 51px;
          left: -217px;
          width: 290px;
          word-break: break-all;
          background: #ff9b00;
          border-radius: 4px;
          line-height: 20px;
          padding: 10px 12px;
          color: #fff;
          box-sizing: border-box;
          user-select: none;
          font-size: 14px;
          text-align: left;

          .audience-tip__arrow {
            position: absolute;
            display: block;
            width: 0;
            height: 0;
            border-width: 0 8px 8px;
            border-style: solid;
            border-color: transparent transparent #ff9b00;
            top: -8px;
            right: 14px;
          }
        }
      }
    }
    .rehearsal_yun:hover {
      border: 1px solid rgba(252, 86, 89, 0.5) !important;
      background-color: rgba(252, 86, 89, 0.5) !important;
    }
    .right_btn_dis {
      background: rgba(252, 86, 89, 0.5);
      // background: #fc5659;
      // opacity: 0.5;
    }
    .vmp-header-right_duration {
      &-end {
        display: none;
      }
      &:hover {
        .vmp-header-right_duration-text {
          display: none;
        }
        .vmp-header-right_duration-end {
          display: inline;
        }
      }
    }
    &_control {
      margin-left: 12px;
      color: @font-error-low;
      font-size: 14px;
    }
    &_full {
      margin: 0 20px 0 12px;
      background-color: hsla(0, 0%, 88.6%, 0.15);
      border-radius: 50%;
      width: 28px;
      height: 28px;
      color: @font-dark-low;
      font-size: 14px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      .iconfont {
        font-size: 14px;
      }
    }
  }
</style>

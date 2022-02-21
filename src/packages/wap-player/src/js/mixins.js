import { computeRecordTime } from './utils';
const playerMixins = {
  data() {
    return {
      TimesShow: false,
      ContorlWidth: '',
      hoverTime: 0,
      hoverLeft: 0,
      changeTime: null, // 记录时间
      defaultVoice: 0 // 记录静音之前的声音
    };
  },
  methods: {
    getListenPlayer() {
      //  直播开始
      this.playerServer.$on(VhallPlayer.PLAY, () => {
        // 监听播放状态
        this.isPlayering = true;
        this.isShowPoster = false;
        console.warn('PLAY');
      });
      this.playerServer.$on(VhallPlayer.PAUSE, () => {
        // 监听暂停状态
        this.isPlayering = false;
        console.warn('PAUSE');
      });
      // 视频清晰度发生改变----卡顿切换清晰度时触发
      this.playerServer.$on(VhallPlayer.DEFINITION_CHANGE, () => {
        console.warn('DEFINITION_CHANGE');
        this.loading = true;
      });
      this.playerServer.$on(VhallPlayer.LOADEDMETADATA, () => {
        console.warn('LOADEDMETADATA');
      });
      this.playerServer.$on(VhallPlayer.LAG_REPORT, () => {
        console.warn('LAG_REPORT');
        this.loading = false;
      });
      this.playerServer.$on(VhallPlayer.LOADED, () => {
        this.loading = false;
      });
      this.playerServer.$on(VhallPlayer.ERROR, e => {
        this.loading = false;
        console.log('播放器sdk VhallPlayer.ERROR事件', e);
      });
      this.playerServer.$on(VhallPlayer.ENDED, () => {
        // 监听暂停状态
        console.log('播放完毕');
        this.isVodEnd = true;
        this.isShowPoster = true;
      });
      // 打开弹幕
      this.playerServer.$on('push_barrage', data => {
        if (!this.danmuIsOpen) return;
        this.addBarrage(data);
      });

      // 结束直播
      this.playerServer.$on('live_over', data => {
        console.log(data);
        this.isLivingEnd = true;
      });
    },
    listenEvents() {
      // 退出页面时记录历史时间 TODO 配置是否支持断点续播的逻辑
      if (this.playerState.type === 'vod') {
        window.addEventListener('beforeunload', () => {
          this.endTime = this.playerServer.getCurrentTime(() => {
            console.log('获取当前视频播放时间失败----------');
          });

          this.totalTime = this.playerServer.getDuration(() => {
            console.log('获取视频总时长失败');
          });
          const curLocalHistoryTime = window.sessionStorage.getItem(
            this.roomBaseState.watchInitData.paas_record_id
          );
          if (!curLocalHistoryTime && this.recordHistoryTime) {
            return;
          }
          window.sessionStorage.setItem(this.vodOption.recordId, this.endTime);
        });
      }
    },
    initSlider() {
      this.playerServer.$on(VhallPlayer.TIMEUPDATE, () => {
        this.currentTime = this.playerServer.getCurrentTime(() => {
          console.log('获取当前视频播放时间失败----------');
        });
        this.sliderVal = (this.currentTime / this.totalTime) * 100;
        // 派发播放器时间更新事件，通知章节当前播放的时间节点
        // this.$VhallEventBus.$emit(this.$VhallEventType.Chapter.PLAYER_TIME_UPDATE, this.currentTime);
      });
    },
    changeSlider(value) {
      this.currentTime = (value / 100) * this.totalTime;
      this.playerServer.setCurrentTime(this.currentTime, () => {
        this.$toast('调整播放时间失败');
      });
    },
    /**
     * 发送弹幕
     */
    addBarrage(text) {
      try {
        this.playerServer &&
          this.playerServer.addBarrage(text, e => {
            console.log(e, '添加弹幕失败');
          });
      } catch (e) {
        console.log(e);
      }
    },
    // 全屏
    enterFullscreen() {
      if (this.isFullscreen) {
        this.isFullscreen = false;
        if (
          !(
            document.exitFullscreen ||
            document.mozCancelFullScreen ||
            document.webkitExitFullscreen ||
            document.msExitFullscreen
          )
        ) {
          this.playerServer.exitFullScreen();
        }
        if (document.exitFullscreen) document.exitFullscreen();
        else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
        else if (document.msExitFullscreen) document.msExitFullscreen();
      } else {
        this.isFullscreen = true;
        const element = document.getElementById('videoWapBox');
        if (
          !(
            element.requestFullscreen ||
            element.mozRequestFullScreen ||
            element.webkitRequestFullscreen ||
            element.msRequestFullscreen
          )
        ) {
          this.playerServer.enterFullScreen();
        }
        if (element.requestFullscreen) element.requestFullscreen();
        else if (element.mozRequestFullScreen) element.mozRequestFullScreen();
        else if (element.webkitRequestFullscreen) element.webkitRequestFullscreen();
        else if (element.msRequestFullscreen) element.msRequestFullscreen();
      }
    },
    // 设置默认视频清晰度
    setDefaultQuality() {
      let defaultDefinition;
      if (sessionStorage.getItem('localQualityValue')) {
        defaultDefinition = sessionStorage.getItem('localQualityValue');
      } else {
        defaultDefinition = this.definitionConfig;
      }
      return defaultDefinition;
    },
    // 获取回放总时长
    getRecordTotalTime() {
      let getRecordTotalTimer = null;
      // 回放时间异步获取 需要通过定时器获取
      getRecordTotalTimer = setInterval(() => {
        this.totalTime =
          this.playerServer &&
          this.playerServer.getDuration(() => {
            console.log('获取视频总时长失败');
          });
        console.log(this.totalTime, 'zog总时间');
        if (this.isTryPreview && this.totalTime > 0) {
          this.recordTime = computeRecordTime(this.totalTime);
          if (this.recordTime === 0) {
            this.recordTime = 1;
          }
          this.authText = this.getShiPreview();
        }
        this.getDuanxuPreview(); //断点续播逻辑
        this.totalTime > 0 && clearInterval(getRecordTotalTimer);
      }, 50);
    },
    // 试看的权限
    getShiPreview() {
      const { webinar } = this.roomBaseState.watchInitData;
      const authType = webinar.verify;
      if (authType == 1) {
        return webinar.verify_tip || '输入密码';
      } else if (authType == 2) {
        return webinar.verify_tip || '输入手机号/邮箱/工号';
      } else if (authType == 3) {
        return webinar.verify_tip || '付费';
      } else if (authType == 4) {
        return webinar.verify_tip || '输入邀请码';
      } else if (authType == 6) {
        return 6;
      }
    },
    // 获取清晰度列表和当前清晰度
    getQualitys() {
      const qualityList = this.playerServer ? this.playerServer.getQualitys() : [];
      if (this.isAudio) {
        this.qualitysList = qualityList.filter(item => item.def === 'same');
        return;
      } else {
        this.qualitysList = qualityList;
      }
      // 如果过当前有设置过清晰度，就用缓存，否则就有接口返回
      if (sessionStorage.getItem('localQualityValue')) {
        this.$nextTick(() => {
          this.$set(this.currentQualitys, 'def', sessionStorage.getItem('localQualityValue'));
        });
      }
      let exist = false; // 设置变量 查看时候在sdk转码列表内
      this.playerServer.getQualitys().forEach(ele => {
        if (ele.def == this.definitionConfig) exist = true;
      });
      this.currentQualitys = exist
        ? { def: this.definitionConfig }
        : this.playerServer.getCurrentQuality();
      this.$nextTick(() => {
        if (this.currentQualitys.def == 'a') {
          console.log('音频进入');
          this.audioStatus = true;
        } else {
          console.log('no----音频---进入');
          this.audioStatus = false;
        }
      });
      console.log(this.qualitysList, this.currentQualitys, '?????1111111');
    },
    // 获取倍速列表和当前倍速
    getInitSpeed() {
      const UsableSpeed = this.playerServer.getUsableSpeed(() => {
        console.log('获取倍速失败');
      });
      console.log('获取倍速', UsableSpeed);
      this.UsableSpeed =
        UsableSpeed &&
        UsableSpeed.filter(value => {
          return [2, 1.75, 1.5, 1.25, 1, 0.75].includes(value);
        });
      if (sessionStorage.getItem('localSpeedValue')) {
        this.currentSpeed = sessionStorage.getItem('localSpeedValue');
        let suc = true;
        this.playerServer.setPlaySpeed(this.currentSpeed, () => (suc = false));
        if (suc) {
          console.log('设置成功,sucess');
        } else {
          console.log('设置失败,falil');
          this.currentSpeed = 1;
        }
      } else {
        this.currentSpeed = 1;
      }
    },
    // 修改视频清晰度
    changeQualitys(item) {
      console.log('12334324', item);
      let sucess = true;
      this.playerServer.setQuality(item, err => {
        sucess = false;
        console.log('设置画质失败 ', err); // object 类型，{ code: 错误码, message: "", data: {} }
      });
      if (sucess) {
        console.log('设置画质成功--------', item);
        if (item.def == 'a') {
          this.audioStatus = true;
        } else {
          this.audioStatus = false;
        }
        this.isSetQuality = true;
        this.isOpenQuality = false;
        this.currentQualitys = item;
        sessionStorage.setItem('localQualityValue', item.def);
        this.setChange();
      }
    },
    // 开启/关闭弹幕
    openBarrage() {
      this.danmuIsOpen = !this.danmuIsOpen;
      this.danmuIsOpen
        ? this.playerServer && this.playerServer.openBarrage()
        : this.playerServer && this.playerServer.closeBarrage();
    },
    // 修改视频倍速
    changeSpeed(item) {
      let sucess = true;
      this.playerServer.setPlaySpeed(item, err => {
        console.log(err, '切换失败');
        sucess = false;
      });
      if (sucess) {
        console.log('设置倍速成功--------', item);
        sessionStorage.setItem('localSpeedValue', item);
        this.isSetSpeed = true;
        this.isOpenSpeed = false;
        this.currentSpeed = item;
        this.setChange();
      }
    },
    setChange() {
      if (this.changeTime) {
        clearTimeout(this.changeTime);
      }
      this.changeTime = setTimeout(() => {
        this.isSetSpeed = false;
        this.isSetQuality = false;
      }, 2000);
    },
    // 设置播放时间
    setVideoCurrentTime(val) {
      if (!this.playerServer) return;

      console.log('video val', val);

      this.playerServer.setCurrentTime(val, () => {
        this.$message({
          type: 'error',
          message: '设置当前时间失败,请稍后重试'
        });
        console.error('设置当前播放时间失败');
      });
    },
    formatQualityText(val) {
      let text;
      switch (val) {
        case 'same':
          text = '原画';
          break;
        case '720p':
          text = '超清';
          break;
        case '480p':
          text = '高清';
          break;
        case 'a':
          text = '音频';
          break;
        case '360p':
          text = '标清';
          break;
        default:
          text = '标清';
      }
      return text;
    }
  }
};

export default playerMixins;

import { computeRecordTime } from './utils';
import { getBrowserType } from '@/app-shared/utils/getBrowserType.js';
const playerMixins = {
  data() {
    return {
      changeTime: null, // 记录时间
      defaultVoice: 0 // 记录静音之前的声音
    };
  },
  methods: {
    getListenPlayer() {
      //  直播开始
      this.playerServer.$on(VhallPlayer.PLAY, () => {
        // 监听播放状态
        this.playerServer.state.isPlaying = true;
        this.isShowPoster = false;
        this.isVodEnd = false;
        console.warn('PLAY');
      });
      this.playerServer.$on(VhallPlayer.PAUSE, () => {
        // 监听暂停状态
        this.playerServer.state.isPlaying = false;
        console.warn('PAUSE');
      });

      // 视频清晰度发生改变----卡顿切换清晰度时触发
      this.playerServer.$on(VhallPlayer.DEFINITION_CHANGE, () => {
        console.warn('DEFINITION_CHANGE');
        this.isNoBuffer = true;
      });

      // 卡顿
      this.playerServer.$on(VhallPlayer.LAG_REPORT, () => {
        console.warn('LAG_REPORT');
        this.isNoBuffer = true;
      });

      // 卡顿恢复
      this.playerServer.$on(VhallPlayer.LAG_RECOVER, () => {
        console.warn('LAG_RECOVER');
        this.isNoBuffer = false;
      });

      // 视频加载完毕
      this.playerServer.$on(VhallPlayer.LOADED, () => {
        this.isNoBuffer = false;
        const { system } = getBrowserType();
        if (system == 'ios') {
          this.handleDuanXu();
        }
        if (this.isWarnPreview) {
          if (this.warmUpVideoList.length > 1 && !this.subscribeServer.state.isFirstEnterPlayer) {
            this.subscribeServer.state.isFirstEnterPlayer = true;
            if (this.initPlayerIndex < this.warmUpVideoList.length - 1) {
              this.subscribeServer.state.initIndex++;
            } else {
              this.subscribeServer.state.initIndex = 0;
            }
            this.subscribeServer.setWarmVideoList(
              this.warmUpVideoList[this.subscribeServer.state.initIndex],
              true
            );
          }
        }
      });

      // 视频出错
      this.playerServer.$on(VhallPlayer.ERROR, e => {
        this.isNoBuffer = true;
        console.log('播放器sdk VhallPlayer.ERROR事件', e);
      });

      // 视频播放完毕
      this.playerServer.$on(VhallPlayer.ENDED, () => {
        // 监听暂停状态
        console.log('wap-播放完毕');
        this.isShowPoster = true;
        this.playerServer.state.isPlaying = false;
        // 如果是暖场视频和试看不显示回放结束的标识
        if (this.isTryPreview) return;
        if (this.isWarnPreview) {
          if (this.warmUpVideoList.length == 1) {
            // 如果只有一个暖场视频，并且开启了循环播放，就自动调用播放方法
            if (this.roomBaseServer.state.warmUpVideo.warmup_player_type == 2) {
              this.playerServer.play();
            }
          } else {
            // 多个暖场视频的逻辑，如果大于2，才播放完毕一个销毁一个，初始化下一个
            if (this.warmUpVideoList.length > 2) {
              this.playerServer.destroy();
            }
            // 将当前存的断点续播时间清除
            window.sessionStorage.removeItem(this.warmUpVideoList[this.playIndex]);
            window.sessionStorage.removeItem('warm_recordId');
            // 如果播放完的playIndex 小于暖场视频长度-1，就+1，否则就从0开始播放
            if (this.playIndex < this.warmUpVideoList.length - 1) {
              this.subscribeServer.state.playIndex++;
            } else {
              this.subscribeServer.state.playIndex = 0;
            }
            // 暖场视频循环的列表，只存2个值，播放完第一个，移除第一个，并往上增加第三个的值
            this.subscribeServer.setWarmVideoList('', false);
            // 如果初始化完的initPlayerIndex 小于暖场视频长度-1，就+1，否则就从0开始播放
            if (this.initPlayerIndex < this.warmUpVideoList.length - 1) {
              this.subscribeServer.state.initIndex++;
              this.subscribeServer.setWarmVideoList(
                this.warmUpVideoList[this.subscribeServer.state.initIndex],
                true
              );
            } else {
              this.subscribeServer.state.initIndex = 0;
              this.subscribeServer.setWarmVideoList(this.warmUpVideoList[0], true);
            }
          }
        } else {
          this.isVodEnd = true;
          // 为了将打开的弹窗关闭
          this.videoShowIcon();
        }
      });
    },
    listenEvents() {
      if (this.subscribeServer.state.isChangeOrder && this.isWarnPreview) return;
      // 退出页面时记录历史时间 TODO 配置是否支持断点续播的逻辑
      if (this.playerServer.state.type == 'vod') {
        window.addEventListener('pagehide', () => {
          this.endTime = this.playerServer.getCurrentTime(() => {
            console.log('获取当前视频播放时间失败----------');
          });

          this.totalTime =
            this.playerServer.getDuration(() => {
              console.log('获取视频总时长失败');
            }) || 0;
          if (this.isWarnPreview) {
            window.sessionStorage.setItem('recordIds', this.warmUpVideoList.join(','));
            window.sessionStorage.setItem('warm_recordId', this.warmUpVideoList[this.playIndex]);
            if (this.warmUpVideoList[this.initIndex] === this.warmUpVideoList[this.playIndex]) {
              window.sessionStorage.setItem(this.warmUpVideoList[this.playIndex], this.endTime);
            }
          } else {
            const curLocalHistoryTime = window.sessionStorage.getItem(
              this.roomBaseState.watchInitData.paas_record_id
            );
            if (!curLocalHistoryTime && this.recordHistoryTime) {
              return;
            }
            window.sessionStorage.setItem(this.vodOption.recordId, this.endTime);
          }
        });
      }
      // 横屏逻辑 和佳佳沟通暂时不加
      // window.addEventListener('orientationchange', () => {
      //   if (screen.orientation.angle == 90 || screen.orientation.angle == 270) {
      //     this.isOrientation = true;
      //     this.setFullScreen();
      //   } else {
      //     this.isOrientation = false;
      //   }
      // });
    },
    initSlider() {
      this.playerServer.$on(VhallPlayer.TIMEUPDATE, () => {
        this.currentTime = this.playerServer.getCurrentTime(() => {
          console.log('获取当前视频播放时间失败----------');
        });
        this.sliderVal = (this.currentTime / this.totalTime) * 100;
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
    setFullscreen() {
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
        if (navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)) {
          this.isFullscreen = false;
        }
        this.playerServer.enterFullScreen();
      }
      if (element.requestFullscreen) element.requestFullscreen();
      else if (element.mozRequestFullScreen) element.mozRequestFullScreen();
      else if (element.webkitRequestFullscreen) element.webkitRequestFullscreen();
      else if (element.msRequestFullscreen) element.msRequestFullscreen();
    },
    exitFullScreen() {
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
    },
    // 全屏
    enterFullscreen() {
      this.isFullscreen ? this.exitFullScreen() : this.setFullscreen();
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
        try {
          this.totalTime =
            (this.playerServer &&
              this.playerServer.getDuration(() => {
                console.log('获取视频总时长失败');
              })) ||
            0;
          this.totalTime > 0 && clearInterval(getRecordTotalTimer);
        } catch (error) {
          console.log(error);
        }
        if (this.isTryPreview && this.totalTime > 0) {
          this.recordTime = computeRecordTime(this.totalTime);
          if (this.recordTime === 0) {
            this.recordTime = 1;
          }
          this.authText = this.getShiPreview();
        }
        const { system } = getBrowserType();
        if (system != 'ios') {
          this.handleDuanXu();
        }
      }, 50);
    },
    //获取断点续播功能
    handleDuanXu() {
      if (this.subscribeServer.state.isChangeOrder && this.isWarnPreview) return;
      if (this.isWarnPreview) {
        if (this.warmUpVideoList[this.initIndex] == sessionStorage.getItem('warm_recordId')) {
          this.getDuanxuPreview(); //断点续播逻辑
        }
      } else {
        this.getDuanxuPreview(); //断点续播逻辑
      }
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
      console.log('isAudio ???', this.isAudio);
      if (this.isAudio) {
        this.qualitysList = qualityList.filter(item => item.def === 'same');
        console.log('isAudio 获取清晰度列表和当前清晰度', qualityList, this.qualitysList);
        return;
      } else {
        this.qualitysList = qualityList;
      }
      this.currentQualitys = this.playerServer.getCurrentQuality();
      // // 如果过当前有设置过清晰度，就用缓存，否则就有接口返回
      // if (sessionStorage.getItem('localQualityValue')) {
      //   this.$nextTick(() => {
      //     this.$set(this.currentQualitys, 'def', sessionStorage.getItem('localQualityValue'));
      //   });
      // } else {
      //   let exist = false; // 设置变量 查看时候在sdk转码列表内
      //   this.playerServer.getQualitys().forEach(ele => {
      //     if (ele.def == this.definitionConfig) exist = true;
      //   });
      //   this.currentQualitys = exist
      //     ? { def: this.definitionConfig }
      //     : this.playerServer.getCurrentQuality();
      // }
      this.$nextTick(() => {
        if (this.currentQualitys.def == 'a') {
          console.log('音频进入');
          this.audioStatus = true;
        } else {
          console.log('no----音频---进入');
          this.audioStatus = false;
        }
      });
      console.log(this.isAudio, this.qualitysList, this.currentQualitys, '?????1111111');
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
      if (sessionStorage.getItem('localSpeedValue') && this.playerOtherOptions.speed) {
        this.currentSpeed = parseFloat(sessionStorage.getItem('localSpeedValue'));
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
      console.log('video val', val, this.initIndex, this.playIndex);
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
          text = this.$t('player.player_1002');
          break;
        case '720p':
          text = this.$t('player.player_1005');
          break;
        case '480p':
          text = this.$t('player.player_1003');
          break;
        case 'a':
          text = this.$t('player.player_1006');
          break;
        case '360p':
          text = this.$t('player.player_1004');
          break;
        default:
          text = this.$t('player.player_1004');
      }
      return text;
    }
  }
};

export default playerMixins;

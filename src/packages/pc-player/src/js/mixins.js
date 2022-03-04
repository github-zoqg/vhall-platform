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
    // 试看的权限
    getShiPreview() {
      const { webinar } = this.roomBaseServer.state.watchInitData;
      const authType = webinar.verify;
      if (authType == 1) {
        this.authText = webinar.verify_tip || this.$t('other.other_1002');
      } else if (authType == 2) {
        this.authText = webinar.verify_tip || this.$t('appointment.appointment_1002');
      } else if (authType == 3) {
        this.authText = webinar.verify_tip || this.$t('appointment.appointment_1010');
      } else if (authType == 4) {
        this.authText = webinar.verify_tip || this.$t('other.other_1003');
      } else if (authType == 6) {
        this.authText = 6;
      }
    },
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
      this.playerServer.$on(VhallPlayer.DEFINITION_CHANGE, e => {
        console.warn('DEFINITION_CHANGE');
        this.loading = true;
      });
      this.playerServer.$on(VhallPlayer.LOADEDMETADATA, e => {
        console.warn('LOADEDMETADATA');
      });
      this.playerServer.$on(VhallPlayer.LAG_REPORT, e => {
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
        this.isShowPoster = true;
        if (this.isWarnPreview) return;
        this.isVodEnd = true;
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
      // 支付成功
      this.playerServer.$on('pay_success', data => {
        const userInfo = this.$domainStore.state.userServer.userInfo;
        if (data.target_id == userInfo.user_id) {
          this.$message({
            message: this.$t('common.common_1005'),
            showClose: true,
            type: 'success',
            customClass: 'zdy-info-box'
          });
          this.feeAuth({ type: 3 });
          this.closePayFee();
        }
      });
    },
    controllerMouseLeave() {
      clearTimeout(this.hoverVideoTimer);
      this.hoverVideoTimer = setTimeout(() => {
        this.hoveVideo = false;
      }, 3000);
    },
    controllerMouseEnter() {
      clearTimeout(this.hoverVideoTimer);
      this.hoveVideo = true;
    },
    wrapEnter() {
      this.hoveVideo = true;
    },
    wrapLeave() {
      clearTimeout(this.hoverVideoTimer);
      this.hoverVideoTimer = setTimeout(() => {
        this.hoveVideo = false;
      }, 3000);
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
      console.log(this.qualityList, this.currentQualitys, '?????1111111');
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
        this.currentQualitys = item;
        sessionStorage.setItem('localQualityValue', item.def);
        this.setChange();
      }
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
        this.currentSpeed = item;
        this.setChange();
      }
    },
    initSlider() {
      this.playerServer.$on(window.VhallPlayer.TIMEUPDATE, () => {
        this.currentTime = this.playerServer.getCurrentTime(() => {
          console.log('获取当前视频播放时间失败----------');
        });
        this.sliderVal = (this.currentTime / this.totalTime) * 100;
        // 派发播放器时间更新事件，通知章节当前播放的时间节点
        this.playerServer.emitChapterTimeUpdate(this.currentTime);
      });
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
    // 设置静音
    jingYin() {
      if (this.voice == 0) {
        this.voice = this.defaultVoice;
      } else {
        this.defaultVoice = this.voice;
        this.voice = 0;
      }
    },
    // 开启/关闭弹幕
    openBarrage() {
      this.danmuIsOpen = !this.danmuIsOpen;
      this.danmuIsOpen
        ? this.playerServer && this.playerServer.openBarrage()
        : this.playerServer && this.playerServer.closeBarrage();
    },
    // 全屏
    enterFullscreen() {
      this.isFullscreen = !this.isFullscreen;
      if (this.isFullscreen) {
        const element = document.querySelector('.vmp-player-watch');
        if (element.requestFullscreen) element.requestFullscreen();
        else if (element.mozRequestFullScreen) element.mozRequestFullScreen();
        else if (element.webkitRequestFullscreen) element.webkitRequestFullscreen();
        else if (element.msRequestFullscreen) element.msRequestFullscreen();
      } else {
        if (document.exitFullscreen) document.exitFullscreen();
        else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
        else if (document.msExitFullscreen) document.msExitFullscreen();
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
    setTime() {
      // 拖拽显示时间
      // const dom = this.$refs.controllerRef.$el;
      const dom = document.querySelector('.slider_controller');
      const button = document.querySelector('.controller_slider .el-slider__button-wrapper');
      const initDom = () => {
        dom.onmouseover = e => {
          console.log('dom over', e);
          this.TimesShow = true;
          const totalWidth = dom.offsetWidth;
          this.ContorlWidth = dom.offsetWidth;
          const lef = e.layerX;
          this.hoverTime = (lef / totalWidth) * this.totalTime;
          this.hoverLeft = lef;
          dom.onmousemove = event => {
            const lef = event.layerX;
            this.hoverTime = (lef / totalWidth) * this.totalTime;
            this.hoverLeft = lef;
          };
        };
        // eslint-disable-next-line no-unused-vars
        dom.onmouseout = e => {
          this.TimesShow = false;
        };
      };
      initDom();
      // eslint-disable-next-line no-unused-vars
      button.onmousedown = e => {
        dom.onmouseout = dom.onmousemove = dom.onmousemove = dom.onmouseover = null;
        this.ContorlWidth = dom.offsetWidth;
        this.onmousedownControl = true;
        this.pause();
        // eslint-disable-next-line no-unused-vars
        document.onmousemove = e => {
          this.TimesShow = true;
        };
        // eslint-disable-next-line no-unused-vars
        document.onmouseup = e => {
          document.onmousemove = null;
          this.onmousedownControl = false;
          this.TimesShow = false;
          initDom();
        };
      };
      button.onmouseover = e => {
        this.TimesShow = false;
        e.stopPropagation();
      };
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

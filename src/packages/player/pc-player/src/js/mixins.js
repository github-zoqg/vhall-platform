import screenfull from 'screenfull';
const playerMixins = {
  data() {
    return {
      changeTime: null, // 记录时间
      defaultVoice: 0 // 记录静音之前的声音
    };
  },
  methods: {
    // 试看的权限
    getShiPreview() {
      const { webinar } = this.roomBaseServer.state.watchInitData;
      const authType = webinar.verify;
      if (this.agreement) {
        this.authText = this.$t('appointment.appointment_1025');
      } else if (authType == 1) {
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
    listenEvents() {
      // 退出页面时记录历史时间 TODO 配置是否支持断点续播的逻辑
      if (this.subscribeServer.state.isChangeOrder && this.isWarnPreview) return;
      if (this.playerServer.state.type === 'vod' && !this.isTryPreview) {
        window.addEventListener('beforeunload', () => {
          this.endTime = this.playerServer.getCurrentTime(() => {
            console.log('获取当前视频播放时间失败----------');
          });
          this.totalTime = this.playerServer.getDuration(() => {
            console.log('获取视频总时长失败');
          });
          if (this.isWarnPreview) {
            console.log(this.endTime);
            if (this.warmUpVideoList[this.initIndex] === this.warmUpVideoList[this.playIndex]) {
              window.sessionStorage.setItem(this.warmUpVideoList[this.playIndex], this.endTime);
            }
            window.sessionStorage.setItem('warm_recordId', this.warmUpVideoList[this.playIndex]);
            window.sessionStorage.setItem('recordIds', this.warmUpVideoList.join(','));
          } else {
            const curLocalHistoryTime = window.sessionStorage.getItem(
              this.roomBaseServer.state.watchInitData.paas_record_id
            );
            if (!curLocalHistoryTime && this.recordHistoryTime) {
              return;
            }
            window.sessionStorage.setItem(this.vodOption.recordId, this.endTime);
          }
        });
      }
      screenfull.on('error', event => {
        console.log(event, this.playIndex, this.initIndex, '???我是全屏错误');
      });
      screenfull.on('change', ev => {
        // if (ev.target.id === `vmp-player-vod_${this.warmUpVideoList[this.initIndex]}`) {
        //   this.isFullscreen = !this.isFullscreen;
        //   console.log(ev, this.playIndex, this.initIndex, '??quan全屏');
        // }
        this.isFullscreen = !this.isFullscreen;
      });
      clearTimeout(this.hoverVideoTimer);
      this.hoverVideoTimer = setTimeout(() => {
        this.hoveVideo = false;
      }, 3000);
      window.onkeydown = event => {
        let e = event || window.event || arguments.callee.caller.arguments[0];
        if (e.keyCode === 32) {
          this.startPlay();
          if (e.preventDefault) {
            e.preventDefault();
          } else {
            window.event.returnValue = false;
          }
        } else if (e.keyCode === 38) {
          if (this.voice >= 100) {
            this.voice = 100;
            return;
          }
          this.voice = this.voice + 2;
        } else if (e.keyCode === 40) {
          if (this.voice <= 0) {
            this.voice = 0;
            return;
          }
          this.voice = this.voice - 2;
        } else if (e.keyCode === 173) {
          console.log('11111静音');
        }
      };
    },
    getListenPlayer() {
      //  直播开始
      this.playerServer.$on(VhallPlayer.PLAY, () => {
        // 监听播放状态
        this.isPlayering = true;
        this.isShowPoster = false;
        if (this.isWarnPreview) {
          this.subscribeServer.state.isPlaying = true;
        }
        console.warn('PLAY', this.isPlayering, this.isVodEnd);
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
      // 卡顿
      this.playerServer.$on(VhallPlayer.LAG_REPORT, () => {
        console.warn('LAG_REPORT');
        this.loading = true;
      });

      // 卡顿恢复
      this.playerServer.$on(VhallPlayer.LAG_RECOVER, () => {
        console.warn('LAG_RECOVER');
        this.loading = false;
      });

      // 视频加载完毕
      this.playerServer.$on(VhallPlayer.LOADED, () => {
        this.loading = false;
        if (this.isWarnPreview) {
          // 如果暖场视频长度大于1，才初始化二个播放器。将isFirstEnterPlayer在初始化第一个之后置为true
          if (this.warmUpVideoList.length > 1 && !this.subscribeServer.state.isFirstEnterPlayer) {
            this.subscribeServer.state.isFirstEnterPlayer = true;
            //initPlayerIndex是从0开始计数的 如果initPlayerIndex小于暖场视频长度-1，就加+1，否则就从第0个开始初始化
            if (this.initPlayerIndex < this.warmUpVideoList.length - 1) {
              this.subscribeServer.state.initIndex++;
            } else {
              this.subscribeServer.state.initIndex = 0;
            }
            // 更新循环列表更新
            this.subscribeServer.setWarmVideoList(
              this.warmUpVideoList[this.subscribeServer.state.initIndex],
              true
            );
          }
        }
      });
      // 视频错误
      this.playerServer.$on(VhallPlayer.ERROR, () => {
        this.loading = true;
      });
      // 视频播放完毕
      this.playerServer.$on(VhallPlayer.ENDED, () => {
        // 监听播放完毕状态
        console.log('pc-播放完毕', this.warmUpVideoList.length);
        console.log('-----------playIndex--------=========', this.playIndex);
        console.log('-----------initPlayerIndex--------=========', this.initPlayerIndex);
        // 如果是暖场视频
        if (this.isWarnPreview) {
          this.isShowPoster = true;
          this.isPlayering = false;
          if (this.warmUpVideoList.length == 1) {
            // 如果只有一个暖场视频，并且开启了循环播放，就自动调用播放方法
            if (this.roomBaseServer.state.warmUpVideo.warmup_player_type == 2) {
              this.playerServer.play();
            }
          } else {
            this.subscribeServer.state.warmFullScreen = this.isFullscreen;
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
          this.isShowPoster = true;
          this.isVodEnd = true;
          if (this.isVisibleMiniElement) {
            // 如果回放时没有文档，就不用重置最小值
            this.roomBaseServer.setChangeElement('doc');
          }
          this.displayMode = 'normal';
        }
      });

      // 结束直播
      this.playerServer.$on('live_over', data => {
        console.log(data);
        this.playerServer && this.playerServer.destroy();
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
      this.currentQualitys = this.playerServer.getCurrentQuality();
      this.$nextTick(() => {
        if (this.currentQualitys.def == 'a') {
          console.log('音频进入');
          this.audioStatus = true;
        } else {
          console.log('no----音频---进入');
          this.audioStatus = false;
        }
      });
    },
    // 获取倍速列表和当前倍速
    getInitSpeed() {
      const UsableSpeed = this.playerServer.getUsableSpeed(() => {
        console.log('获取倍速失败');
      });
      this.UsableSpeed =
        UsableSpeed &&
        UsableSpeed.filter(value => {
          return [2, 1.75, 1.5, 1.25, 1, 0.75].includes(value);
        });
      console.log('获取倍速', this.UsableSpeed);
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
        if (this._isSetingCurrentTime) return;
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
      this._isSetingCurrentTime = false;
    },
    // 设置静音
    jingYin() {
      if (this.voice == 0) {
        this.voice = this.defaultVoice;
      } else {
        this.defaultVoice = this.voice;
        this.voice = 0;
      }
      if (this.isWarnPreview) {
        this.subscribeServer.state.warmVideo = this.voice;
      }
    },
    // 开启/关闭弹幕
    openBarrage() {
      this.danmuIsOpen = !this.danmuIsOpen;
      this.danmuIsOpen
        ? this.playerServer && this.playerServer.openBarrage()
        : this.playerServer && this.playerServer.closeBarrage();
    },
    enterFullscreen() {
      // let domFull = document.getElementById(
      //   `vmp-player-vod_${this.warmUpVideoList[this.initIndex]}`
      // );
      screenfull.toggle(this.$refs.playerWatch);
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

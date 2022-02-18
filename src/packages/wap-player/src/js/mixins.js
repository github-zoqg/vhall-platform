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
    startPlay() {
      this.isPlayering ? this.pause() : this.play();
    },
    // 播放
    play() {
      this.iconShow = false;
      this.fiveDown();
      this.playerServer && this.playerServer.play();
    },
    // 暂停
    pause() {
      this.playerServer && this.playerServer.pause();
    },
    // 判断是直播还是回放 活动状态
    getWebinerStatus() {
      const { webinar, warmup, record } = this.roomBaseState.watchInitData;
      if (this.roomBaseState.watchInitData.status === 'live') {
        if (webinar.type === 1) {
          // 直播
          this.isLive = true;
          this.optionTypeInfo('live');
        } else if (webinar.type === 5) {
          // 回放
          this.optionTypeInfo('vod', this.roomBaseState.watchInitData.paas_record_id);
          this.recordHistoryTime = sessionStorage.getItem(
            this.roomBaseState.watchInitData.paas_record_id
          )
            ? Number(sessionStorage.getItem(this.roomBaseState.watchInitData.paas_record_id))
            : 0;
        }
      } else {
        if (webinar.type === 3) return; //结束状态
        let _id = warmup.warmup_paas_record_id
          ? warmup.warmup_paas_record_id
          : record.preview_paas_record_id;
        this.vodType = warmup.warmup_paas_record_id ? 'warm' : 'shikan';
        if (this.vodType === 'shikan') {
          this.isTryPreview = true;
        } else if (this.vodType === 'warm') {
          this.isWarnPreview = true;
        }
        this.optionTypeInfo('vod', _id);
      }
      // 暖场视频或者试看
      if (!this.isWarnPreview) {
        this.initPlayerOtherInfo();
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
    // 初始化播放器配置项
    initConfig() {
      const { interact, join_info } = this.roomBaseState.watchInitData;
      console.log(this.roomBaseState, '????====zhangxiao');
      let params = {
        appId: interact.paas_app_id || '', // 应用ID，必填
        accountId: join_info.third_party_user_id || '', // 第三方用户ID，必填
        token: interact.paas_access_token || '', // access_token，必填
        videoNode: 'vmp-player',
        type: this.playerState.type, // live 直播  vod 点播  必填
        poster: '',
        autoplay: false,
        forceMSE: false,
        subtitleOption: {
          enable: true
        },
        // 强制卡顿切线
        thornOption: {
          enable: true
        },
        barrageSetting: {
          positionRange: [0, 1],
          speed: 15000,
          style: {
            fontSize: 16
          }
        },
        peer5Option: {
          open: this.roomBaseState.configList['ui.browser_peer5'] == '1',
          customerId: 'ds6mupmtq5gnwa4qmtqf',
          fallback: true
        }
      };
      if (this.playerState.type == 'live') {
        params = Object.assign(params, {
          liveOption: this.liveOption
        });
      } else if (this.playerState.type === 'vod') {
        params = Object.assign(params, {
          vodOption: this.vodOption
        });
        params.pursueOption = { enable: true };
      } else {
        throw new Error('参数异常--2');
      }
      if (!this.isWarnPreview) {
        params = Object.assign({}, params, this.getPlayerInfo());
      }
      return params;
    },
    // 初始化播放器
    initPlayer() {
      this.initSDK().then(() => {
        this.getQualitys(); // 获取清晰度列表和当前清晰度
        if (this.playerState.type === 'vod') {
          this.getRecordTotalTime(); // 获取视频总时长
          this.initSlider(); // 初始化播放进度条
          this.getInitSpeed(); // 获取倍速列表和当前倍速
        }
        this.getListenPlayer();
      });
    },
    async initSDK() {
      const defineQuality = this.setDefaultQuality();
      if (this.playerState.type == 'live') {
        this.liveOption.defaultDefinition = defineQuality || '';
      } else if (this.playerState.type == 'vod') {
        this.vodOption.defaultDefinition = defineQuality || '';
      }
      const params = this.initConfig();
      return new Promise(resolve => {
        this.playerServer.init(params).then(() => {
          this.eventPointList = this.playerServer.state.markPoints;
          this.playerServer.openControls(false);
          this.playerServer.openUI(false);
          if (this.isLive) {
            resolve();
          } else {
            this.playerServer.$on(VhallPlayer.LOADED, () => {
              resolve();
            });
          }
        });
      });
    },
    initPlayerOtherInfo() {
      const { webinar } = this.roomBaseState.watchInitData;
      this.playerServer
        .getPlayerConfig({
          webinar_id: webinar.id,
          tags: ['basic-config', 'definition', 'screen-config', 'water-mark']
        })
        .then(res => {
          if (res.code == 200) {
            this.definitionConfig = res.data.definition.data.default_definition;
            this.marquee = res.data['screen-config'].data;
            this.waterInfo = res.data['water-mark'].data;
            this.playerOtherOptions = res.data['basic-config'].data;
          }
        });
    },
    // 获取跑马灯、水印等播放器配置
    getPlayerInfo() {
      const { join_info } = this.roomBaseState.watchInitData;
      let playerParams = {
        marqueeOption: {
          text: '',
          enable: false
        },
        watermarkOption: {
          enable: false
        }
      };
      // 跑马灯
      if (this.marquee && this.marquee.scrolling_open == 1) {
        let marqueeText = '';
        if (this.marquee.text_type == 1) {
          marqueeText = this.marquee.text;
        } else {
          let text = '';
          if (join_info.join_id) {
            text = `${join_info.join_id}-${join_info.nickname}`;
          } else {
            if (localStorage.getItem('userInfo')) {
              text = localStorage.getItem('userInfo').nick_name;
            } else {
              text = '';
            }
          }
          marqueeText = `${this.marquee.text}-${text}`;
        }
        playerParams.marqueeOption = {
          enable: true,
          text: marqueeText, // 跑马灯的文字
          alpha: this.marquee.alpha, // 透明度,100完全显示,0 隐藏
          size: this.marquee.size, // 文字大小
          color: this.marquee.color, // 文字颜色
          interval: this.marquee.scroll_type == 1 ? this.marquee.interval : 1, // 下次跑马灯开始与本次结束的时间间隔 ， 秒为单位
          speed: this.marquee.speed || 6000, // 跑马灯移动速度:3000快,6000中,10000慢
          displayType: this.marquee.scroll_type == 1 ? 0 : 1,
          position: this.marquee.position // 跑马灯位置 , 1 随机 2上,3中 4下
        };
      }
      // 水印
      if (this.water && this.water.watermark_open == 1) {
        const alianMap = new Map([
          [1, 'tl'],
          [2, 'tr'],
          [3, 'br'],
          [4, 'bl']
        ]);
        const align = alianMap.get(parseInt(this.water.img_position));

        playerParams.watermarkOption = {
          enable: true,
          url: this.water.img_url, // 水印图片的路径
          align, // 图片的对其方式， tl | tr | bl | br 分别对应：左上，右上，左下，右下
          position: ['20px', '20px'], // 对应的横纵位置，支持px,vh,vw,%
          size: ['8%'], // 水印大小，支持px,vh,vw,%
          alpha: this.water.img_alpha
        };
      }
      return playerParams;
    },
    getDuanxuPreview() {
      let endTime;
      const parsedTotalTime = parseInt(this.totalTime);
      if (this.recordHistoryTime != '') {
        endTime = parseFloat(this.recordHistoryTime);
        const parsedEndTime = parseInt(this.recordHistoryTime);
        if (endTime && endTime != 'undefined' && parsedTotalTime != parsedEndTime) {
          const seekTime = endTime < 6 ? 0 : endTime - 5;
          if (seekTime) {
            this.isPickupVideo = true;
            setTimeout(() => {
              this.isPickupVideo = false;
            }, 5000);
          }
          this.setVideoCurrentTime(seekTime);
        }
      } else {
        endTime = sessionStorage.getItem(this.vodOption.recordId);
        const parsedEndTime = parseInt(endTime);
        if (endTime && endTime != 'undefined' && parsedTotalTime != parsedEndTime) {
          const seekTime = endTime < 6 ? 0 : endTime - 5;
          this.setVideoCurrentTime(seekTime);
        }
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

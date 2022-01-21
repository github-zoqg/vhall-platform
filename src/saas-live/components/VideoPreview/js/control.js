const controle = {
  methods: {
    jingYin() {
      if (this.isMute) {
        this.voice = this._cacheVolume;
        this.isMute = false;
        this.$Vhallplayer.setVolume(this.voice, () => {
          console.log('开启声音失败');
          this.isMute = true;
        });
        // this.$Vhallplayer.setMute(false, ()=>{
        //   console.log('解除静音失败');
        //   this.isMute = true;
        // });
      } else {
        this._cacheVolume = this.voice;
        this.voice = 1;
        this.isMute = true;
        this.$Vhallplayer.setVolume(this.voice, () => {
          console.log('静音失败');
        });
      }
    },
    setVoice() {
      this.$Vhallplayer.setVolume(this.voice, () => {
        console.log('改变音量失败');
      });
    },
    setVideo() {
      let _seekTime = 0;
      _seekTime = (this.sliderVal / 100) * this.totalTime;
      this.$Vhallplayer.setCurrentTime(_seekTime, () => {
        console.log('调整播放时间失败');
      });
    },
    videoPlayBtn() {
      if (this.statePaly) {
        this.$Vhallplayer.pause();
      } else {
        this.$Vhallplayer.play();
      }
    },
    enterFullscreen() {
      this.isFullscreen = true;
      this.$Vhallplayer.enterFullScreen(() => {});
    },
    exitFullscreen() {
      this.isFullscreen = false;
      this.$Vhallplayer.exitFullScreen(() => {});
    },
    wrapEnter() {
      this.hoveVideo = true;
    },
    wrapLeave(isSelfInvok) {
      // 如果是插播播放器，禁止组件自身触发leave方法，只能通过 parent.refs 调用
      if (isSelfInvok && this.isInsertVideoPreview) {
        return;
      }
      this.hoveVideo = false;
    },
    resetPlay() {
      this.sliderVal = 0;
      this.$Vhallplayer.play();
      this.tipsType = 0;
      this.setVideo();
      console.log(this.tipsType, '23424');
    },
    listen() {
      this.$Vhallplayer.on(window.VhallPlayer.ENDED, () => {
        console.log('播放结束');
        this.tipsType = 2;
        if (this.isInsertVideoPreview) {
          this._isVideoEnd = true;
          this.tipsType = 0;
        }
      });
      this.$Vhallplayer.on(window.VhallPlayer.PLAY, () => {
        this.statePaly = true;
        // 监听播放状态
        if (this.isInsertVideoPreview) {
          if (!this._firstInit) {
            this.$emit('handleRemoteInsertVideoPlay', this._isVideoEnd);
          }
          this._isVideoEnd = false;
          if (this._firstInit) {
            const elVideo = document.getElementById('vh-video');
            this.$emit('remoteInsterSucces', elVideo);
            this._firstInit = false;
          }
        }
      });
      this.$Vhallplayer.on(window.VhallPlayer.PAUSE, () => {
        if (this.isInsertVideoPreview) {
          // 监听暂停状态
          this.$emit('handleRemoteInsertVideoPause');
        }
        this.statePaly = false;
      });
      /**
       *  监听退出全屏事件
       */
      window.addEventListener(
        'fullscreenchange',
        e => {
          if (document.fullscreenElement) {
            // 进入全屏
          } else {
            // 离开全屏
            this.isFullscreen = false;
          }
        },
        true
      );
    }
  }
};
export default controle;

<template>
  <div class="vmp-rebroadcast-container">
    <!-- <div class="vmp-rbrdcst-leftpanel" v-loading="loading">
      <div class="vmp-searchbar">
        <span class="mylive">
          我的直播
          <i class="iconfont iconicon-help"></i>
          <div class="tips">暂只支持转播直播</div>
        </span>
        <div class="search-right">
          <el-button @click="getList" type="mini" round>刷新</el-button>
          <el-input
            v-model="input"
            class="go-search"
            placeholder="请输入直播标题"
            clearable
            @keyup.enter.native="getList"
            @change="getList"
          >
            <i slot="prefix" class="el-input__icon el-icon-search" @click="getList"></i>
          </el-input>
        </div>
      </div>
      <div class="vmp-searchresult">
        <div v-if="!list.length" class="no-list">
          <div v-if="!isSearch">
            <img src="./images/no-create@2x.png" alt="" />
            <p>暂无可转播的直播</p>
          </div>
          <div v-else>
            <img src="./images/no-search@2x.png" alt="" />
            <p>暂未搜索到您想要的内容</p>
          </div>
        </div>
        <div
          v-for="item in list"
          v-bind="item"
          :key="item.id"
          class="item-container"
          :class="item.is_stream || current == item.room_id ? 'rebroadcasting ' : ''"
          @click="select(item.room_id, item.id)"
        >
          <i v-show="item.is_stream == 1" class="broadcasting">转播中</i>
          <div class="item-logo">
            <img
              :src="
                item.img_url || '//t-alistatic01.e.vhall.com/static/img/video_default_nologo.png'
              "
              class="mCS_img_loaded"
            />
            <i>直播</i>
          </div>
          <div class="item-content">
            <div class="broadcast-title">{{ item.subject }}</div>
            <div class="broadcast-time">{{ item.start_time }}</div>
          </div>
        </div>
      </div>
    </div>
    <div class="vmp-rbrdcst-rightpanel">
      <div class="rbrdcs-title">预览</div>
      <div class="rbrdcs-videobox 1" v-if="!docUrl" v-loading="previewLoading">
        <img v-if="!current && !rebroadcastingRoomId" :src="posterUrl" />
        <video-preview ref="videoPreview" :videoParam="videoParam" />
      </div>
      <div class="rbrdcs-videobox 2" v-else v-loading="previewLoading">
        <img class="doc" :src="docUrl" />
        <div class="mini-video-box">

          <video-preview ref="videoPreview" :videoParam="videoParam"></video-preview>
        </div>
      </div>
      <div class="rbrdcs-button-container" v-if="current">
        <div class="stream">
          <p v-if="pushStreamSeperately" class="start-local-stream" @click="pushLocalStream">
            开始本地推流
          </p>
          <p v-if="rebroadcastingRoomId" class="local-streambox" style="display: block">
            <el-checkbox v-model="localStream">同时开始本地推流</el-checkbox>
          </p>
        </div>
        <div class="switch-broadcast">
          <span v-if="!rebroadcastingRoomId" @click="rebroadcast">开始转播</span>
          <span v-if="rebroadcastingRoomId" @click="stopRebroadcast">结束转播</span>
        </div>
      </div>
    </div> -->
  </div>
</template>
<script>
  // import { useRebroadcastServer } from 'middle-domain';
  // import VideoPreview from '@/packages/app-shared/components/video-preview';
  export default {
    name: 'VmpRebroadcast'
    // components: { VideoPreview },
    // // props: ['webinar_id', 'roomId', 'vssToken', 'status', 'visible'],
    // data() {
    //   return {
    //     videoParam: {},
    //     loading: false,
    //     previewLoading: false, // 预览视频的loading
    //     isSearch: false,
    //     list: [],
    //     current: '', // 选中的roomID
    //     webinar: {},
    //     input: '',
    //     localStream: false,
    //     posterUrl:
    //       '//t-vhallsaas-static.oss-cn-beijing.aliyuncs.com/upload/common/static-imgs/c0/e7/c0e7569408de296971eb4b98945c240b.png',
    //     rebroadcastingRoomId: '', // 转播中的roomID
    //     appId: '',
    //     accountId: '',
    //     token: '',
    //     recordId: '',
    //     docUrl: '',
    //     pushStreamSeperately: false
    //   };
    // },
    // beforeCreate() {
    //   this.rebroadcastServer = useRebroadcastServer();
    // },
    // mounted() {
    //   this.getList();
    // },
    // watch: {
    //   visible(newvalue) {
    //     console.warn(newvalue, '转播');
    //     if (!newvalue) {
    //       this.current = '';
    //       this.rebroadcastingRoomId = '';
    //       this.docUrl = '';
    //       this.pushStreamSeperately = false;
    //       try {
    //         this.$refs.preview && this.$refs.preview.$PLAYER.destroy();
    //       } catch (error) {
    //         console.log(error);
    //       }
    //     } else {
    //       this.getList();
    //     }
    //   }
    // },
    // methods: {
    //   select(id, sourceWebinarId) {
    //     // 目标房间id     目标活动id
    //     this.previewLoading = true;
    //     try {
    //       this.$refs.preview && this.$refs.preview.$PLAYER.destroy();
    //     } catch (error) {
    //       console.log(error, '选中进行销毁实例');
    //     }
    //     this.docUrl = '';
    //     this.current = '';
    //     this.rebroadcastingRoomId = '';
    //     window.setTimeout(() => {
    //       this.current = id;
    //       console.warn(id, sourceWebinarId, '0000');
    //       this.sourceWebinarId = sourceWebinarId;
    //       const currentItem = this.list.find(item => item.room_id == this.current);
    //       console.warn('选择的id-----', currentItem);
    //       this.posterUrl = currentItem.img_url || this.posterUrl;
    //       if (currentItem.is_stream == 1) {
    //         this.rebroadcastingRoomId = this.current;
    //       }
    //       this.getPreviewInfo(id, sourceWebinarId);
    //     }, 1000);
    //     console.log(this.current, '?????123456<<<<<<');
    //   },
    //   async getList() {
    //     this.loading = true;
    //     if (this.input) {
    //       this.isSearch = true;
    //     }

    //     try {
    //       const res = await this.rebroadcastServer.getList({
    //         webinar_id: this.webinar_id,
    //         subject: this.input,
    //         limit: 100
    //       });

    //       this.loading = false;
    //       this.list = res.data ? res.data.list : [];
    //     } catch (error) {
    //       this.loading = false;
    //     }
    //   },
    //   async getPreviewInfo(id, sourceWebinarId) {
    //     try {
    //       const res = await this.rebroadcastServer.preview({
    //         webinar_id: this.webinar_id,
    //         source_id: sourceWebinarId
    //       });

    //       console.log('选中转播 id', res.data);
    //       this.webinar = res.data;
    //       this.token = this.webinar.paas_access_token;
    //       this.accountId = this.webinar.third_party_user_id;
    //       this.docUrl = res.data.document_url;
    //       this.appId = this.webinar.paas_app_id;
    //       this.recordId = this.webinar.paas_record_id;
    //       setTimeout(() => {
    //         this.previewLoading = false;
    //       }, 600);
    //     } catch (error) {
    //       this.$message.warning(error.msg);
    //       console.log(error);
    //     }
    //   },
    //   toggleLocalStream(value) {
    //     this.localStream = value;
    //   },
    //   pushLocalStream() {
    //     this.$EventBus.$emit('rebroadcastPushStream');
    //     this.$emit('onClose');
    //   },
    //   async rebroadcast() {
    //     if (!this.$refs.preview || !this.$refs.preview.$PLAYER)
    //       return this.$message.error('拉流中或者拉流失败！');
    //     if (this.status != 1) return this.$message('请先开始直播！');

    //     try {
    //       const res = await this.rebroadcastServer.start({
    //         webinar_id: this.webinar_id,
    //         source_id: this.sourceWebinarId
    //       });

    //       if (res.code == 200) {
    //         console.warn(1559, res.data);
    //         this.getList();
    //         this.rebroadcastingRoomId = this.current;

    //         // TODO: 埋点
    //         this.$vhall_paas_port({
    //           k: 120001,
    //           data: {
    //             business_uid: this.webinar.third_party_user_id,
    //             user_id: '',
    //             webinar_id: this.webinar_id,
    //             refer: '',
    //             s: '',
    //             report_extra: {},
    //             ref_url: '',
    //             req_url: ''
    //           }
    //         });

    //         // 开始转播
    //         // TODO: 开始转播
    //         // this.$EventBus.$emit('rebroadcastStart', {
    //         //   roomId: this.webinar.room_id,
    //         //   sourceWebinarId: this.sourceWebinarId, // 活动id
    //         //   sourceRoomId: this.current, // 房间id
    //         //   recordId: this.webinar.record_id,
    //         //   token: this.webinar.paas_access_token,
    //         //   accountId: this.webinar.third_party_user_id,
    //         //   appId: this.webinar.paas_app_id,
    //         //   layout: this.webinar.webinar_type,
    //         //   liveOption: { roomId: this.current, type: 'flv' },
    //         //   channelId: this.webinar.channel_id
    //         // });
    //       }
    //       if (res.code == 200) {
    //         this.$emit('onClose');
    //         this.$message.success('转播成功！');
    //       } else {
    //         this.$message.error('转播失败！');
    //       }
    //     } catch (error) {
    //       console.warn('v3RebroadcastStart', error);
    //       this.$message.error('转播失败！');
    //     }
    //   },
    //   async stopRebroadcast() {
    //     try {
    //       const res = await this.rebroadcastServer.stop({
    //         webinar_id: this.webinar_id,
    //         source_id: this.sourceWebinarId
    //       });

    //       this.rebroadcastingRoomId = '';
    //       if (!this.localStream) {
    //         this.pushStreamSeperately = true;
    //       }
    //       this.getList();

    //       // TODO: stopRebroadcast
    //       // this.$EventBus.$emit('rebroadcastStop', {
    //       //   roomId: this.roomId,
    //       //   sourceRoomId: this.current,
    //       //   recordId: this.webinar.paas_record_id,
    //       //   token: this.webinar.paas_access_token,
    //       //   accountId: this.webinar.third_party_user_id,
    //       //   appId: this.webinar.paas_app_id,
    //       //   localStream: this.localStream
    //       // });

    //       if (res.code == 200) {
    //         this.$message.success('停止转播成功！');
    //       } else {
    //         this.$message.error('停止转播失败！');
    //       }
    //     } catch (error) {
    //       console.error(error);
    //       this.$message.error('停止转播失败！');
    //     }
    //   }
    // }
  };
</script>
<style lang="less">
  .vmp-rebroadcast-container {
    background-color: #fff;
    font-family: @fontRegular;
    padding-left: 27px;
    padding-right: 27px;
    padding-bottom: 27px;
    padding: 0 32px;
    // padding-top: 4px;
    display: flex;
    ::-webkit-scrollbar {
      width: 6px; // 横向滚动条
      height: 6px; // 纵向滚动条 必写
    }
    // 滚动条的滑块
    ::-webkit-scrollbar-thumb {
      border-radius: 5px;
      transition: all 0.3s;
      cursor: pointer;
      // display: none;
      background-color: #e0e0e0;
    }
    ::-webkit-scrollbar-track {
      background-color: transparent;
    }
    &:hover {
      ::-webkit-scrollbar-thumb {
        display: block;
      }
    }
    & > .vmp-rbrdcst-leftpanel {
      width: calc(100% - 340px);
      padding-bottom: 10px;
      & > .vmp-searchbar {
        display: flex;
        justify-content: flex-start;
        position: relative;
        width: 100%;
        padding: 10px 0 20px 0;
        & > .mylive {
          display: inline-block;
          line-height: 40px;
          width: 90px;
          text-align: left;
          position: relative;
          font-size: 14px;
          color: #1a1a1a;
          & > i {
            display: inline-block;
            width: 14px;
            height: 14px;
            position: absolute;
            left: 60px;
            cursor: pointer;
            color: #999;
          }
          & > .tips {
            background-color: rgba(51, 51, 51, 0.8);
            box-shadow: 0 5px 10px 0 rgba(0, 0, 0, 0.2);
            position: absolute;
            z-index: 999;
            color: #fff;
            font-size: 12px;
            width: 120px;
            border-radius: 4px;
            top: 28px;
            display: none;
            left: -20px;
            padding: 0 10px;
          }
        }
        .search-right {
          flex: 1;
          display: flex;
          padding-left: 15px;
          & > .refresh {
            width: 50px;
            border-radius: 3px;
            border-color: #d2d2d2;
            height: 32px;
            line-height: 28px;
            position: relative;
            color: #666;
            border: 1px solid #d2d2d2;
            display: inline-block;
            margin-bottom: 0;
            font-size: 12px;
            margin-right: 10px;
            font-weight: 400;
            text-align: center;
            white-space: nowrap;
            vertical-align: middle;
            cursor: pointer;
            user-select: none;
            background: none;
            border-radius: 4px;
            margin-bottom: 2px;
            &:hover {
              background: #fc5659;
              color: #fff;
              border-color: transparent;
            }
            &:active {
              background: #c62020;
              color: #fff;
              border-color: transparent;
            }
          }
          .el-button:focus {
            color: #fff !important;
            border-color: #fb3a32 !important;
            background-color: #fb3a32 !important;
          }
          .el-button {
            height: 36px;
            font-size: 14px;
          }
          & > .go-search {
            // background-color: #fff;
            // background-position: 10px 8px;
            // border: 1px solid #ccc;
            // width: 140px;
            // height: 34px;
            // border-radius: 20px;
            // line-height: 36px;
            // color: #666666;
            // font-size: 12px;
            // background-image: url('../../public/saas/images/account-file-search.png');
            // background-repeat: no-repeat;
            // padding: 0px 30px 0px 35px;
            // box-sizing: content-box !important;
            margin-left: 6px;
            &.el-input {
              width: 185px;
            }
            .el-input__inner {
              width: 100%;
              border-radius: 20px;
              height: 36px;
            }
            .el-input__icon {
              line-height: 36px;
            }
          }
          & > .clear-search {
            display: none;
            position: absolute;
            top: 50%;
            right: 10px;
            margin-top: -10.5px;
            width: 15px;
            height: 15px;
            cursor: pointer;
            background-size: 100%;
          }
        }
      }
      & > .vmp-searchresult {
        height: 338px;
        overflow-y: auto;
        overflow-x: hidden;
        margin-right: 10px;
        scroll-behavior: smooth;
        // margin-bottom: 16px;
        position: relative;
        .no-list {
          // background: url(../../../common/images/sys/no-search@2x.png) no-repeat;
          // background-position: center 70px;
          font-size: 16px;
          color: #666;
          text-align: center;
          height: 100%;
          width: 380px;
          padding-top: 80px;
          img {
            width: 130px;
            height: 130px;
          }
        }
        p {
          font-size: 14px;
        }
        & > .item-container {
          box-sizing: content-box;
          cursor: pointer;
          // border: 1px solid #dfdfdf;
          // margin-bottom: 10px;
          width: 380px;
          height: 77px;
          padding: 8px 0;
          display: flex;
          justify-content: flex-start;
          position: relative;
          background-color: #fff;
          border-bottom: 1px solid #e6e6e6;
          & > .broadcasting {
            position: absolute;
            top: 0;
            right: 0;
            padding: 0 3px 0 4px;
            // width: 42px;
            // text-align: center;
            height: 18px;
            line-height: 18px;
            font-size: 12px;
            color: #fff;
            background: #fb3a32;
            font-style: normal;
            border-radius: 0px 0px 0px 10px;
          }
          &:hover {
            background-color: #f7f7f7;
          }
          & > .item-logo {
            box-sizing: content-box;
            width: 140px;
            height: 79px;
            position: relative;
            border-radius: 4px;
            background-color: #1a1a1a;
            & > img {
              width: 100%;
              height: 100%;
              object-fit: scale-down;
              border-radius: 4px;
              // border: 0.5px solid #dfdfdf;
            }
            & > i {
              position: absolute;
              top: 4px;
              left: 2px;
              width: 40px;
              text-align: center;
              height: 18px;
              line-height: 18px;
              color: #fff;
              background: rgba(0, 0, 0, 0.65);
              border-radius: 14px;
              font-size: 12px;
              font-style: normal;
            }
          }
          & > .item-content {
            box-sizing: content-box;
            // padding: 16px 0;
            display: flex;
            flex-direction: column;
            padding: 0px 10px;
            display: flex;
            // justify-content: center;
            & > div:first-child {
              width: 200px;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              font-size: 16px;
              color: #1a1a1a;
              text-align: left;
              margin-bottom: 5px;
            }
            & > div:nth-child(2) {
              text-align: left;
              font-size: 12px;
              color: #1a1a1a;
            }
          }
          &.rebroadcasting {
            background-color: #f7f7f7;
          }
        }
        &:hover {
          &::-webkit-scrollbar {
            display: block;
          }
        }
      }
    }
    & > .vmp-rbrdcst-rightpanel {
      // flex: 1;
      width: 330px;
      & > .rbrdcs-title {
        text-align: left;
        color: #d2d2d2;
        font-size: 14px;
        font-weight: normal;
        padding: 80px 0 12px 0;
        color: #1a1a1a;
      }
      & > .rbrdcs-videobox {
        width: 100%;
        height: 186px;
        border: 1px solid #dfdfdf;
        border-radius: 4px;
        overflow: hidden;
        background-color: rgb(223, 223, 223);
        position: relative;
        text-align: center;
        & > img {
          height: 100%;
          width: 100%;
        }
        & > img.doc {
          height: 100%;
          width: initial;
        }
        & > .mini-video-box {
          width: 118px;
          height: 89px;
          position: absolute;
          right: 0;
          top: 0;
        }
      }
      // .el-loading-mask{
      //   top: 50px;
      // }
      & > .rbrdcs-button-container {
        margin-top: 16px;
        // box-sizing: content-box;
        position: relative;
        display: flex;
        justify-content: space-between;
        align-items: center;
        .el-checkbox__label {
          padding-left: 5px;
          color: #666;
          font-weight: normal;
        }
        .el-checkbox__input.is-checked + .el-checkbox__label {
          color: #666;
        }
        & > .switch-broadcast {
          padding: 0;
          width: 104px;
          height: 36px;
          line-height: 36px;
          border-radius: 20px;
          color: #666;
          border: 1px solid #ccc;
          display: inline-block;
          margin-bottom: 0;
          font-size: 14px;
          font-weight: 400;
          text-align: center;
          white-space: nowrap;
          cursor: pointer;
          user-select: none;
          background: none;
          &:hover {
            border-color: #fb3a32;
            background: #fb3a32;
            color: #fff;
          }
          &:active {
            background: #fb3a32;
            color: #fff;
            border-color: transparent;
          }
        }
        .stream {
          color: #666;
          font-size: 14px;
          padding-left: 5px;
          box-sizing: content-box;
        }
        .local-streambox {
          overflow: hidden;
          & > input {
            display: none;
          }
          & > label {
            cursor: pointer;
            font-size: 12px;
            color: rgb(68, 68, 68);
            & > i {
              display: inline-block;
              width: 14px;
              height: 14px;
              border-radius: 2px;
              border: 1px solid #999;
              margin-right: 5px;
              position: relative;
              top: 3px;
            }
            & > i.selected {
              border-color: #fff;
              background: url('../../public/saas/images/account-file-check.png') no-repeat;
            }
          }
        }
        .start-local-stream {
          overflow: hidden;
          cursor: pointer;
          &:hover {
            color: #fb3a32;
          }
        }
      }
    }
  }
  .mylive {
    &:hover {
      .tips {
        display: block !important;
      }
    }
  }
</style>

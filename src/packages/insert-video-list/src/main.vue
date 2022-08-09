<template>
  <div class="vmp-insert-video">
    <el-dialog
      title="插播文件"
      :visible.sync="insertVideoVisible"
      :close-on-click-modal="false"
      :append-to-body="true"
      width="800px"
    >
      <div class="vmp-insert-video-wrap">
        <div v-if="noVideo == 1">
          <div class="vmp-insert-video-wrap-search">
            <el-button type="primary" round @click="selectLocalVideo">选择文件</el-button>
            <el-tooltip placement="right">
              <div slot="content">
                1.视频直播、互动直播支持的文件格式：MP4、WEBM、OGG格式；音频直播支持的文件格式OGG
                <br />
                2.视频格式支持1280*720及以下分辨率，文件小于5G
                <br />
                3.想要上传更多文件格式，可在活动详情-插播文件中进行上传
                <br />
                4.发起端插播文件仅支持本地插播，不会上传到活动下哦！
              </div>
              <i class="vh-iconfont vh-line-question"></i>
            </el-tooltip>
            <el-input
              v-model="searchKey"
              placeholder="请输入音视频文件名称"
              style="width: 220px; float: right"
              @keyup.enter.native="
                getTableList({
                  isNeedResetPage: true
                })
              "
              @clear="
                getTableList({
                  isNeedResetPage: true
                })
              "
              clearable
            >
              <i
                slot="prefix"
                class="el-icon-search el-input__icon"
                style="cursor: pointer; line-height: 36px"
                @click="
                  getTableList({
                    isNeedResetPage: true
                  })
                "
              ></i>
            </el-input>
          </div>
          <div class="vmp-insert-video-wrap-list">
            <ul>
              <li class="insert-list-header">
                <p class="insert-header-item0"></p>
                <p class="insert-header-item insert-header-item1">音视频名称</p>
                <p class="insert-header-item">上传时间</p>
                <p class="insert-header-item">时长</p>
                <p class="insert-header-item">进度</p>
                <p class="insert-header-item">操作</p>
              </li>
              <div
                class="insert-list-container"
                v-infinite-scroll="moreLoadData"
                :infinite-scroll-disabled="isFetching"
                v-show="total"
              >
                <li v-for="video in tableData" :key="video.id">
                  <p class="insert-header-item0">
                    <img
                      src="./img/playing.gif"
                      alt=""
                      v-if="currentRemoteInsertFile.id == video.id"
                    />
                  </p>
                  <p class="insert-header-item">
                    <i
                      class="vh-iconfont vh-fill-audio"
                      v-if="video.file_type == '.mp3' || video.file_type == '.mav'"
                    ></i>
                    <i class="vh-iconfont vh-fill-video" v-else></i>
                    <span>{{ video.name }}</span>
                  </p>
                  <p class="insert-header-item">{{ video.created_at }}</p>
                  <p class="insert-header-item">{{ video.duration }}</p>
                  <p class="insert-header-item">
                    <i
                      class="insert-process-icon"
                      :class="video.transcode_status == 1 ? 'success' : 'failer'"
                    ></i>
                    {{ video.transcode_status_text }}
                  </p>
                  <p class="insert-header-item">
                    <span class="insert-header-item-button" @click="handlePlay(video)">播放</span>
                    <span
                      :class="video.transcode_status != 1 ? 'disable' : ''"
                      class="insert-header-item-button"
                      @click="handlePreview(video)"
                    >
                      预览
                    </span>
                    <span class="insert-header-item-button" @click="handleDelete(video)">删除</span>
                  </p>
                </li>
              </div>
              <div class="insert-list-uncontainer" v-show="!total">
                <span><img src="./img/no-search.png" alt="" /></span>
                <p>暂未搜索到您想要的内容</p>
              </div>
            </ul>
          </div>
        </div>
        <div class="vmp-insert-video-wrap-null" v-else>
          <img src="./img/no-create.png" alt="" />
          <p class="vmp-insert-video-wrap-null-text">暂未上传音视频</p>
          <el-button type="primary" round @click="selectLocalVideo">选择文件</el-button>
          <div>
            1.视频直播、互动直播支持的文件格式：MP4、WEBM、OGG格式；音频直播支持的文件格式OGG
            <br />
            2.视频格式支持1280*720及以下分辨率，文件小于5G
            <br />
            <span v-if="!hideItem">
              3.想要上传更多文件格式，可在活动详情-插播文件中进行上传
              <br />
              4.发起端插播文件仅支持本地插播，不会上传到活动下哦！
            </span>
          </div>
        </div>
      </div>
    </el-dialog>
    <!-- 预览功能 -->
    <template v-if="previewDialog">
      <el-dialog
        class="vmp-insert-video-preview"
        :visible.sync="previewDialog"
        width="642px"
        :before-close="closeBefore"
        :close-on-click-modal="true"
        :append-to-body="true"
      >
        <video-preview
          ref="videoPreview"
          :isShowController="true"
          :videoParam="videoParam"
        ></video-preview>
      </el-dialog>
    </template>
  </div>
</template>
<script>
  import { useInsertFileServer, useMsgServer, useRoomBaseServer } from 'middle-domain';
  import videoPreview from '@/app-shared/components/video-preview';
  import { boxEventOpitons } from '@/app-shared/utils/tool.js';
  import { debounce } from 'lodash';
  export default {
    name: 'VmpInsertVideoList',
    data() {
      return {
        insertVideoVisible: false, // 弹窗显示隐藏
        searchKey: '', // 关键字搜索
        noVideo: 1, // 是否没有插播文件
        isFetching: false, // 接口加载中
        videoParam: {}, //预览数据
        tableData: [], // 插播文件列表
        pageInfo: {
          pos: 0,
          limit: 10,
          pageNum: 1
        },
        total: 1, // 总数
        totalPages: 0, // 总页数
        previewDialog: false // 预览弹窗
      };
    },
    computed: {
      // 当前插播中的云插播文件
      currentRemoteInsertFile() {
        return this.$domainStore.state.insertFileServer.currentRemoteInsertFile;
      },
      // 权限配置
      configList() {
        return this.$domainStore.state.roomBaseServer.configList;
      },
      // 隐藏部分文案及选项(安利定制)
      hideItem() {
        return (
          this.configList['initiate_embed_function_close'] &&
          (this.$route.query.liveT || this.$route.query.live_token)
        );
      },
      // 是否开启了桌面共享
      isShareScreen() {
        return this.$domainStore.state.desktopShareServer.localDesktopStreamId;
      },
      // 桌面共享人信息
      desktopShareInfo() {
        return this.$domainStore.state.desktopShareServer.desktopShareInfo;
      }
    },
    components: {
      videoPreview
    },
    beforeCreate() {
      this.insertFileServer = useInsertFileServer();
      this.msgServer = useMsgServer();
    },
    created() {
      this.assistantType = this.$route.query.assistantType;
    },
    methods: {
      // 显示插播列表 dialog
      openInsertFileDialog() {
        // 检查是否可以插播文件
        window.vhallReportForProduct.report(110189);
        const isCanInsert = this.checkInsertFileProcess();
        window.vhallReportForProduct.report(110190, { report_extra: { isCanInsert } });
        if (isCanInsert) {
          // 显示插播列表
          this.insertVideoVisible = true;
          window.vhallReportForProduct.report(110191);
          this.getTableList({
            isNeedResetPage: true,
            isInvokeInCreated: true
          });
        }
      },

      // 检测当前用户是否可以插播
      checkInsertFileProcess() {
        const insertFileServer = useInsertFileServer();
        const { watchInitData } = useRoomBaseServer().state;
        const { isInsertFilePushing, insertStreamInfo } = insertFileServer.state;
        console.log('---点击插播文件按钮----', insertStreamInfo);

        // 如果是直播状态需要判断当前主持人是否是用网页发起直播
        // 嘉宾：设为主讲人的时候 可以插播
        // 助理： 如果是网页发起，一直都有插播。如果是客户端发起，不支持插播文件，存在提示
        if (
          watchInitData.switch.start_type != 1 &&
          watchInitData.webinar.type == 1 &&
          watchInitData.join_info.role_name == 3
        ) {
          this.$alert('仅发起端为PC网页时支持使用插播文件功能', '', {
            title: '提示',
            confirmButtonText: '知道了',
            // center: true,
            customClass: 'zdy-message-box',
            cancelButtonClass: 'zdy-confirm-cancel'
          });
          return false;
        }

        // 如果在插播中，并且不是当前用户插播，alert提示
        if (
          isInsertFilePushing &&
          insertStreamInfo.userInfo.accountId != watchInitData.join_info.third_party_user_id
        ) {
          this.$alert(
            `${this.$getRoleName(insertStreamInfo.userInfo.role)}${
              insertStreamInfo.userInfo.role != 1 ? insertStreamInfo.userInfo.nickname : ''
            }正在插播文件，请稍后重试`,
            '',
            {
              title: '提示',
              confirmButtonText: '确定',
              customClass: 'zdy-message-box',
              cancelButtonClass: 'zdy-confirm-cancel'
            }
          );
          return false;
        }

        // 判断该当前浏览器是否支持插播
        if (!insertFileServer.isCanUseCaptureStream()) {
          this.$alert(
            '当前浏览器版本不支持插播文件。<br>建议您下载chrome72及以上版本后使用<br>下载<a href="https://www.google.cn/chrome/" target="_blank" style="color: #3562fa">Chrome浏览器</a>',
            '',
            {
              title: '提示',
              confirmButtonText: '知道了',
              customClass: 'zdy-message-box',
              cancelButtonClass: 'zdy-confirm-cancel',
              dangerouslyUseHTMLString: true,
              callback: () => {}
            }
          );
          return false;
        }
        return true;
      },
      // 关闭插播列表弹窗
      closeInserVideoDialog() {
        this.insertVideoVisible = false;
      },
      // 选择本地文件插播
      selectLocalVideo() {
        window.vhallReportForProduct?.report(110216);
        // 他人正在演示插播，当前不可操作；有人正在桌面共享，当前不可插播
        if (!this.checkInsertFileProcess() || this.isShareScreen) {
          if (this.isShareScreen && this.desktopShareInfo) {
            // 当前有桌面共享，并且桌面共享演示人信息能获取的时候
            this.$alert(
              `${this.$getRoleName(this.desktopShareInfo.role)}${
                this.desktopShareInfo.role != 1 ? this.desktopShareInfo.nickname : ''
              }正在进行桌面共享，请稍后重试`,
              '',
              {
                title: '提示',
                confirmButtonText: '确定',
                customClass: 'zdy-message-box',
                cancelButtonClass: 'zdy-confirm-cancel'
              }
            );
          }
          // 当前不可演示插播, 关闭插播列表弹窗
          this.closeInserVideoDialog();
          return;
        }
        const insertFileServer = useInsertFileServer();
        const { watchInitData } = useRoomBaseServer().state;
        const _this = this;
        insertFileServer.selectLocalFile(e => {
          // 如果是音频直播
          if (watchInitData.webinar.mode == 1) {
            const video_ext_type = e.target.files[0].type; // type: "audio/ogg" // video/mp4
            if (!video_ext_type.includes('ogg')) {
              _this.$message.warning('音频直播只支持插播ogg格式的音频');
              return;
            }
          } else {
            const video_ext_type = e.target.files[0].type; // type: "audio/ogg" // video/mp4
            if (
              !(
                video_ext_type.includes('ogg') ||
                video_ext_type.includes('mp4') ||
                video_ext_type.includes('webm')
              )
            ) {
              _this.$message.warning('只支持插播MP4、WEBM、OGG格式的视频');
              return;
            }
            console.log('本地插播上传的文件', e, e.target.files[0]);
            this.initLocalVideo(e.target.files[0]);
          }
        });
      },
      // 进入本地文件插播
      initLocalVideo(File) {
        console.log('本地插播上传的文件', File);
        const isGt5M = File.size / 1024 / 1024 / 1024 > 5;
        console.log(File.type, 'File.type');
        if (isGt5M) {
          this.$message.warning('超过文件大小限制，请选择5G以下的音视频文件');
          return;
        }
        window.vhallReportForProduct?.report(110217);
        window.$middleEventSdk?.event?.send(
          boxEventOpitons(this.cuid, 'emitInsertFileChange', [File, 'local'])
        );
      },
      moreLoadData() {
        if (this.pageInfo.pageNum >= this.totalPages) {
          return false;
        }
        this.pageInfo.pageNum++;
        this.isFetching = true;
        this.pageInfo.pos = parseInt((this.pageInfo.pageNum - 1) * this.pageInfo.limit);
        this.getTableList({
          isNeedResetPage: false
        });
      },
      getTableList: debounce(function (
        options = {
          isNeedResetPage: false,
          isInvokeInCreated: false
        }
      ) {
        const { watchInitData } = useRoomBaseServer().state;
        if (options.isNeedResetPage) {
          this.pageInfo = {
            pos: 0,
            limit: 10,
            pageNum: 1
          };
          this.tableData = [];
        }
        const params = {
          name: this.searchKey,
          get_no_trans: 1,
          webinar_id: watchInitData.webinar.id,
          ...this.pageInfo
        };
        this.insertFileServer.getInsertFileList(params).then(res => {
          if (res.code == 200) {
            // 转码状态:0新增排队中 1转码成功 2转码失败 3转码中
            res.data.list.forEach(ele => {
              ele.file_type = ele.file_type.toLowerCase();
              switch (ele.transcode_status) {
                case 0:
                  ele.transcode_status_text = '转码中';
                  ele.duration = '——';
                  break;
                case 1:
                  ele.transcode_status_text = '转码成功';
                  break;
                case 2:
                  ele.transcode_status_text = '转码失败';
                  ele.duration = '——';
                  break;
                case 3:
                  ele.transcode_status_text = '转码中';
                  ele.duration = '——';
                  break;
                default:
                  ele.transcode_status_text = '转码中';
                  ele.duration = '——';
                  break;
              }
            });
            this.isFetching = false;
            this.tableData.push(...res.data.list);
            this.total = res.data.total;
            this.totalPages = Math.ceil(res.data.total / this.pageInfo.limit);
            if (options.isInvokeInCreated) {
              this.noVideo = !res.data.total ? 2 : 1;
            }
          }
        });
      }, 300),
      // 云插播开始播放
      handlePlay(video) {
        window.vhallReportForProduct.report(110197);
        const insertFileServer = useInsertFileServer();
        const insertFileServerState = insertFileServer.state;
        const { watchInitData } = useRoomBaseServer().state;
        let isAudioFile = false;
        const videoType = video.file_type;
        if (
          videoType.toLowerCase() === '.ogg' ||
          videoType.toLowerCase() === '.mp3' ||
          videoType.toLowerCase() === '.mav'
        ) {
          isAudioFile = true;
        }
        insertFileServerState.insertStreamInfo.has_video = !isAudioFile;

        // 如果当前角色正在进行插播，需要先确认
        if (
          insertFileServerState.isInsertFilePushing &&
          insertFileServerState.insertStreamInfo.userInfo.accountId ==
            watchInitData.join_info.third_party_user_id
        ) {
          this.$confirm('是否中断播放中视频，并替换播放？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            customClass: 'zdy-message-box',
            cancelButtonClass: 'zdy-confirm-cancel'
          }).then(() => {
            window.$middleEventSdk?.event?.send(
              boxEventOpitons(this.cuid, 'emitInsertFileChange', [video, 'remote'])
            );
          });
        } else {
          window.$middleEventSdk?.event?.send(
            boxEventOpitons(this.cuid, 'emitInsertFileChange', [video, 'remote'])
          );
        }
      },
      handleDelete(video) {
        window.vhallReportForProduct.report(110231);
        this.$confirm('删除后将会影响视频的演示和观看，确定删除？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          customClass: 'zdy-message-box',
          cancelButtonClass: 'zdy-confirm-cancel'
        })
          .then(() => {
            window.vhallReportForProduct.report(110233);
            this.insertFileServer
              .deleteInsertFile({
                ids: video.id
              })
              .then(res => {
                window.vhallReportForProduct.report(110238, { report_extra: res });
                if (res.code === 200) {
                  this.getTableList({
                    isNeedResetPage: true
                  });
                  this.$message({
                    message: '删除成功',
                    showClose: true,
                    type: 'success',
                    customClass: 'zdy-info-box'
                  });
                }
              })
              .catch(res => {
                window.vhallReportForProduct.report(110234);
                this.$message({
                  message: res.msg || '删除失败',
                  showClose: true,
                  type: 'error',
                  customClass: 'zdy-info-box'
                });
              });
          })
          .catch(() => {});
      },
      // 预览页面
      handlePreview(video) {
        this.previewDialog = true;
        window.vhallReportForProduct.report(110192);
        if (video.transcode_status == 1) {
          this.videoParam = {
            autoplay: true,
            ...video
          };
        } else {
          this.$message.warning('只有转码成功才能查看');
        }
      },
      closeBefore(done) {
        this.previewDialog = false;
        this.$refs.videoPreview.destroy();
        done();
      }
    }
  };
</script>
<style lang="less">
  .vmp-insert-video {
    &-wrap {
      &-search {
        .vh-line-question {
          margin-left: 10px;
          color: #999;
        }
        .el-input__inner {
          border-radius: 20px;
          height: 36px;
          line-height: 36px;
        }
      }
      &-list {
        width: 100%;
        margin-top: 16px;
        ul {
          list-style: none;
          li {
            display: flex;
            height: 56px;
            line-height: 56px;
            color: #1a1a1a;
            &.insert-list-header {
              background-color: #f7f7f7;
              color: #666;
            }
            .insert-header-item0 {
              width: 60px;
              text-align: center;
              img {
                width: 12px;
                height: 12px;
              }
            }
            .insert-header-item {
              width: 200px;
            }
            .insert-header-item {
              overflow: hidden;
              white-space: nowrap;
              text-overflow: ellipsis;
            }
          }
          .insert-list-container {
            overflow-y: auto;
            height: 336px;
            li {
              border-bottom: 1px solid #e6e6e6;
              .insert-header-item {
                .vh-iconfont {
                  margin-right: 14px;
                  font-size: 18px;
                }
                .vh-fill-video {
                  color: #ff733c;
                }
                .vh-fill-audio {
                  color: #10d3a8;
                }
                .insert-process-icon {
                  display: inline-block;
                  width: 8px;
                  height: 8px;
                  border-radius: 4px;
                  margin-right: 6px;
                  &.success {
                    background-color: #14ba6a;
                  }
                  &.failer {
                    background-color: #fb3a32;
                  }
                }
                &-button {
                  margin-right: 10px;
                  color: #666;
                  &.disable {
                    color: #666;
                    pointer-events: none;
                  }
                }
              }
              &:hover {
                background-color: #f7f7f7;
                .insert-header-item-button {
                  color: #fb3a32;
                  cursor: pointer;
                }
              }
            }
          }
          .insert-list-uncontainer {
            padding: 80px 0 140px;
            margin: 0 auto;
            text-align: center;
            p {
              line-height: 40px;
              color: #666;
            }
          }
        }
      }
      &-null {
        padding: 50px 0 100px;
        text-align: center;
        &-text {
          margin: 15px 0;
          color: #666;
          line-height: 20px;
          font-size: 14px;
        }
        .el-button.is-round {
          padding: 7px 47px;
        }
        div {
          width: 524px;
          margin-top: 24px;
          font-size: 12px;
          line-height: 17px;
          color: #999;
          word-break: break-all;
          text-align: left;
          margin-left: 102px;
        }
      }
    }
    &-preview {
      .el-dialog {
        background: transparent;
        box-shadow: none;
      }
      .el-dialog__header {
        width: 642px !important;
        padding: 0;
        height: 55px;
        background: transparent !important;
        border: none;
        color: #fff;
      }
      .el-dialog__body {
        height: 361px;
        border-top: 4px solid #000;
        border-bottom: 4px solid #000;
        background: #000;
        border-radius: 4px;
        padding: 0 4px;
      }
      .el-dialog__headerbtn {
        right: 10px;
        .el-dialog__close {
          color: #fff;
          &:hover {
            color: #fff;
          }
        }
        &-null {
          padding: 50px 0 100px 0;
          text-align: center;
          &-text {
            margin: 15px 0;
            color: #666;
            line-height: 20px;
            font-size: 14px;
          }
          .el-button.is-round {
            padding: 7px 47px;
          }
          div {
            width: 524px;
            margin-top: 24px;
            font-size: 12px;
            line-height: 17px;
            color: #999;
            word-break: break-all;
            text-align: left;
            margin-left: 102px;
          }
        }
      }
    }
    &-preview {
      .el-dialog {
        background: transparent;
        box-shadow: none;
      }
      .el-dialog__header {
        width: 642px !important;
        padding: 0;
        height: 55px;
        background: transparent !important;
        border: none;
        color: #fff;
      }
      .el-dialog__body {
        height: 361px;
        border-top: 4px solid #000;
        border-bottom: 4px solid #000;
        background: #000;
        border-radius: 4px;
        padding: 0 4px;
      }
      .el-dialog__headerbtn {
        right: 10px;
        .el-dialog__close {
          color: #fff;
          &:hover {
            color: #fff;
          }
        }
      }
    }
  }
</style>

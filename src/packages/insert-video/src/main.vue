<template>
  <div class="vmp-insert-video">
    <el-dialog
      title="插播文件"
      :visible.sync="insertVideoVisible"
      :close-on-click-modal="false"
      width="800px"
    >
      <div class="vmp-insert-video-wrap">
        <div v-if="noVideo == 1">
          <div class="vmp-insert-video-wrap-search">
            <el-button type="primary" round @click="selectlocalVideo">选择文件</el-button>
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
              <i class="iconfont iconicon_help_m"></i>
            </el-tooltip>
            <el-input
              v-model="searchKey"
              placeholder="请输入音视频文件名称"
              style="width: 220px; float: right"
              @keyup.enter.native="searchTableList"
              @clear="searchTableList"
              clearable
            >
              <i
                slot="prefix"
                class="el-icon-search el-input__icon"
                style="cursor: pointer; line-height: 36px"
                @click="searchTableList"
              ></i>
            </el-input>
          </div>
          <div class="vmp-insert-video-wrap-list">
            <ul>
              <li class="insert-list-header">
                <p class="insert-header-item0"></p>
                <p class="insert-header-item">音视频名称</p>
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
                    <img src="./images/playing.gif" alt="" v-if="video.type" />
                  </p>
                  <p class="insert-header-item">
                    <i
                      class="iconfont iconyinpinwenjian"
                      v-if="video.file_type == '.mp3' || video.file_type == '.mav'"
                    ></i>
                    <i class="iconfont iconshipinwenjian" v-else></i>
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
                <span><img src="./images/no-search.png" alt="" /></span>
                <p>暂未搜索到您想要的内容</p>
              </div>
            </ul>
          </div>
        </div>
        <div class="vmp-insert-video-wrap-null" v-else>
          <img src="./images/no-create.png" alt="" />
          <p class="vmp-insert-video-wrap-null-text">暂未上传音视频</p>
          <el-button type="primary" round @click="selectlocalVideo">选择文件</el-button>
          <div>
            1.视频直播、互动直播支持的文件格式：MP4、WEBM、OGG格式；音频直播支持的文件格式OGG
            <br />
            2.视频格式支持1280*720及以下分辨率，文件小于5G
            <br />
            3.想要上传更多文件格式，可在活动详情-插播文件中进行上传
            <br />
            4.发起端插播文件仅支持本地插播，不会上传到活动下哦！
          </div>
        </div>
      </div>
    </el-dialog>
    <!-- 预览功能 -->
    <template>
      <el-dialog
        class="vmp-insert-video-preview"
        :visible.sync="previewDialog"
        width="642px"
        :close-on-click-modal="false"
      >
        <video-preview ref="videoPreview" :videoParam="videoParam"></video-preview>
      </el-dialog>
    </template>
  </div>
</template>
<script>
  import { useInsertFileServer } from 'middle-domain';
  import videoPreview from '../../components/video-preview';
  export default {
    name: 'VmpInsertVideo',
    data() {
      return {
        insertVideoVisible: true,
        searchKey: '',
        noVideo: 1,
        isFetching: false,
        videoParam: {}, //预览数据
        webinarId: this.$route.params.id,
        tableData: [
          {
            type: 1,
            name: '体面.mp3',
            duration: '00:04:42',
            file_type: '.mp3',
            transcode_status: 1,
            paas_record_id: '22429f36',
            id: 819,
            transcode_status_text: '转码成功',
            created_at: '2022-01-17 11:15:06'
          },
          {
            type: 0,
            name: '宣传.mp4',
            duration: '00:04:42',
            file_type: '.mp4',
            transcode_status: 0,
            paas_record_id: '26054ddf',
            transcode_status_text: '转码失败',
            id: 818,
            created_at: '2022-01-17 11:15:06'
          },
          {
            type: 0,
            name: '微吼全新.mav',
            duration: '00:04:42',
            file_type: '.mav',
            transcode_status: 1,
            paas_record_id: '48cdaf1d',
            transcode_status_text: '转码成功',
            id: 817,
            created_at: '2022-01-17 11:15:06'
          }
        ],
        pageInfo: {
          pos: 0,
          limit: 10,
          pageNum: 1
        },
        total: 1,
        totalPages: 0,
        previewDialog: false
      };
    },
    components: {
      videoPreview
    },
    beforeCreate() {
      this.insertFileServer = useInsertFileServer();
    },
    methods: {
      searchTableList() {
        this.getTableList(false);
      },
      selectlocalVideo() {
        if (!this.insertFileServer.isCanUseCaptureStream()) {
          this.$message.error('当前浏览器不支持captureStream()方法! 无法使用此功能');
          return;
        }
        const _this = this;
        this.insertFileServer.selectLocalFile(e => {
          if (_this.layout == 1) {
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
          }
        });
      },
      moreLoadData() {
        if (this.pageInfo.pageNum >= this.totalPages) {
          return false;
        }
        this.pageInfo.pageNum++;
        this.isFetching = true;
        this.pageInfo.pos = parseInt((this.pageInfo.pageNum - 1) * this.pageInfo.limit);
        this.getTableList(true);
      },
      getTableList(flag, isCreated) {
        if (!flag) {
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
          webinar_id: this.webinarId,
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
            if (isCreated) {
              this.noVideo = !res.data.total ? 2 : 1;
            }
          }
        });
      },
      handlePlay(video) {
        video.isAudio = false;
        const videoType = video.file_type;
        if (
          videoType.toLowerCase() === '.ogg' ||
          videoType.toLowerCase() === '.mp3' ||
          videoType.toLowerCase() === '.mav'
        ) {
          video.isAudio = true;
        }
        // 如果当前角色正在进行插播，需要先确认
        if (this.insertVideoStatus) {
          this.$confirm('是否中断播放中视频，并替换播放？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            customClass: 'zdy-message-box',
            cancelButtonClass: 'zdy-confirm-cancel'
          })
            .then(() => {
              // this.$emit('insterVideoInit', video, 'remote');
            })
            .catch(() => {});
        } else {
          // this.$emit('insterVideoInit', video, 'remote');
        }
      },
      handleDelete(video) {
        this.$confirm('删除后将会影响视频的演示和观看，确定删除？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          customClass: 'zdy-message-box',
          cancelButtonClass: 'zdy-confirm-cancel'
        })
          .then(() => {
            this.insertFileServer
              .deleteInsertFile({
                ids: video.id
              })
              .then(res => {
                if (res.code === 200) {
                  this.getTableList(false);
                  this.$message({
                    message: '删除成功',
                    showClose: true,
                    type: 'success',
                    customClass: 'zdy-info-box'
                  });
                }
              })
              .catch(res => {
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
        if (video.transcode_status == 1) {
          this.videoParam = video;
        } else {
          this.$message.warning('只有转码成功才能查看');
        }
      }
    }
  };
</script>
<style lang="less">
  .vmp-insert-video {
    &-wrap {
      &-search {
        .iconicon_help_m {
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
          }
          .insert-list-container {
            overflow-y: auto;
            height: 336px;
            li {
              border-bottom: 1px solid #e6e6e6;
              .insert-header-item {
                .iconfont {
                  margin-right: 12px;
                }
                .iconshipinwenjian {
                  color: #ff733c;
                }
                .iconyinpinwenjian {
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
                    color: #666666;
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
            padding: 80px 0 140px 0;
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

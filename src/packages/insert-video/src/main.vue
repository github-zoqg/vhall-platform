<template>
  <div class="vmp-insert-video">
    <el-dialog
      title="插播文件"
      :visible.sync="insertVideoVisible"
      :close-on-click-modal="false"
      width="800px"
    >
      <div class="vmp-insert-video-wrap">
        <div v-if="total">
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
              <li class="vmp-insert-video-wrap-list-header">
                <p></p>
                <p>音视频名称</p>
                <p>上传时间</p>
                <p>时长</p>
                <p>进度</p>
                <p>操作</p>
              </li>
              <div class="vmp-insert-video-wrap-list-container">
                <li>
                  <p>
                    <img src="../images/playing.gif" alt="" />
                  </p>
                  <p>
                    <i
                      class="iconfont iconyinpinwenjian"
                      v-if="video.file_type == '.mp3' || video.file_type == '.mav'"
                    ></i>
                    <i class="iconfont iconshipinwenjian" v-else></i>
                    <span>{{ video.name }}</span>
                  </p>
                  <p>{{ video.created_at }}</p>
                  <p>{{ video.duration }}</p>
                  <p>
                    <i
                      class="process-icon"
                      :class="video.transcode_status == 1 ? 'success' : 'failer'"
                    ></i>
                    {{ video.transcode_status_text }}
                  </p>
                  <p>
                    <span @click="handlePlay(video)">播放</span>
                    <span
                      :class="video.transcode_status != 1 ? 'disable' : ''"
                      @click="handlePreview(video)"
                    >
                      预览
                    </span>
                    <span @click="handleDelete(video)">删除</span>
                  </p>
                </li>
              </div>
            </ul>
          </div>
        </div>
        <div class="vmp-insert-video-wrap-null" v-else></div>
      </div>
    </el-dialog>
  </div>
</template>
<script>
  import { useInsertFileServer } from 'middle-domain';
  export default {
    name: 'VmpInsertVideo',
    data() {
      return {
        insertVideoVisible: true,
        searchKey: '',
        noVideo: 1,
        webinarId: this.$route.params.id,
        tableData: [],
        pageInfo: {
          pos: 0,
          limit: 10,
          pageNum: 1
        },
        total: 1,
        totalPages: 0
      };
    },
    beforeCreate() {
      this.insertFileServer = useInsertFileServer();
    },
    created() {
      this.getTableList(false, true);
    },
    methods: {
      searchTableList() {
        console.log('11111111111');
      },
      selectlocalVideo() {
        console.log('22222222');
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
      }
    }
  };
</script>
<style lang="less">
  .vmp-insert-video {
    &-wrap {
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
  }
</style>

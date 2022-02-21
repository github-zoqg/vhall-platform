<template>
  <div class="vmp-doc-list">
    <el-dialog
      :visible.sync="dialogVisible"
      @open="handlOpen"
      :before-close="handleClose"
      width="800px"
    >
      <!-- 标题栏 -->
      <template slot="title">
        <span v-show="mode === 2" style="margin-right: 3px" @click="handleDoclibCancel">
          <i class="iconfont iconzuofanye"></i>
        </span>
        <span>{{ $t('usual.chooseDocument') }}</span>
      </template>

      <!-- 内容区域 -->
      <div style="height: 480px">
        <!-- 当前直播列表 -->
        <div class="vmp-doc-cur" v-show="mode === 1">
          <!-- 无数据 -->
          <div class="vmp-doc-cur__empty" v-show="dataList.length === 0">
            <img src="/static/img/no-file.png" />
            <p>您还没有文档，快来上传吧</p>
            <div>
              <!-- 上传文档 -->
              <el-upload
                class="doc-uploader"
                action="#"
                :http-request="handleUpload"
                :before-upload="beforeUpload"
                accept="*/*"
                :show-file-list="false"
              >
                <el-button type="primary">{{ $t('usual.upload') }}</el-button>
              </el-upload>
              <el-button @click="handleGotoDoclib">
                {{ $t('doc_list.doclib') }}
              </el-button>
            </div>
          </div>
          <!-- 有数据 -->
          <div class="vmp-doc-cur__inner" v-show="dataList.length > 0">
            <div class="vmp-doc-cur__hd">
              <!-- 上传文档 -->
              <el-upload
                class="doc-uploader"
                action="#"
                :http-request="handleUpload"
                :before-upload="beforeUpload"
                accept="*/*"
                list-type="text"
                :show-file-list="false"
              >
                <el-button type="primary">{{ $t('usual.upload') }}</el-button>
              </el-upload>
              <el-button v-if="!isWatch" @click="handleGotoDoclib">
                {{ $t('doc_list.doclib') }}
              </el-button>

              <el-tooltip placement="right">
                <div slot="content">
                  <div class="help-tips">
                    <p>1.支持的文档格式： doc/docx,xls/xlsx,ppt</p>
                    <p>/pptx,pdf,jpeg/jpg,png,bmp</p>
                    <p>2.单份文档不能超过200页,不超过100M</p>
                    <p>3.如果ppt格式转换失败或文档打开失败请尝试</p>
                    <p>用office转为pdf后上传</p>
                    <p>4.直播过程中发现PPT自动翻页，请检查源文件</p>
                    <p>是否设置自动放映</p>
                    <p>5.文档转换较慢，请于直播前从资料管理-文档</p>
                    <p>管理上传文档</p>
                    <p>6.动态版文档转码时间较长，请耐心等待，可选</p>
                    <p>择静态版（无动画效果）快速演示</p>
                  </div>
                </div>
                <i style="margin-left: 5px" class="el-tooltip iconfont iconicon_help_m"></i>
              </el-tooltip>

              <el-input
                style="width: 220px; float: right"
                placeholder="请输入文档名称"
                v-model="docSearchKey"
                clearable
                @keydown.enter.stop.native="handleDocSearch"
              >
                <i slot="prefix" class="el-input__icon el-icon-search" @click="handleDocSearch"></i>
              </el-input>
            </div>
            <div class="vmp-doc-cur__bd">
              <el-table :data="dataList" style="width: 100%" height="370px">
                <el-table-column prop="file_name" label="文档名称" width="180"></el-table-column>
                <el-table-column prop="created_at" label="创建时间" width="170"></el-table-column>
                <el-table-column prop="page" label="页码"></el-table-column>
                <el-table-column prop="uploadPropress" label="进度">
                  <template slot-scope="scope">
                    <DocProgressStatus
                      :docStatus="scope.row.docStatus"
                      :transformProcess="scope.row.transformProcess"
                      :uploadPropress="scope.row.uploadPropress"
                    ></DocProgressStatus>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="200">
                  <template slot-scope="scope">
                    <el-button
                      v-if="scope.row.status_jpeg == 200"
                      @click="demonstrate(scope.row.document_id, 2)"
                      size="mini"
                      type="text"
                    >
                      演示
                    </el-button>
                    <el-button
                      v-if="scope.row.ext.indexOf('ppt') > -1 && scope.row.status == 200"
                      @click="demonstrate(scope.row.document_id, 1)"
                      size="mini"
                      type="text"
                    >
                      动画版演示
                    </el-button>
                    <el-button
                      v-if="scope.row.id"
                      @click="handleDeleteDoc(scope.row)"
                      size="mini"
                      type="text"
                    >
                      删除
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
            <div class="vmp-doc-cur__ft" v-if="!isWatch">
              <span>观众可见</span>
              <el-switch
                class="vmp-doc-cur__switch"
                v-model="switchStatus"
                :width="28"
                active-color="#fb3a32"
              ></el-switch>
              <span>默认开启，文档演示将自动对观众可见</span>
            </div>
          </div>
        </div>

        <!-- 资料库列表 -->
        <div v-if="!isWatch" class="vmp-doc-lib" v-show="mode === 2">
          <div class="vmp-doc-lib__hd">
            <el-input
              style="width: 220px"
              placeholder="请输入文档名称"
              v-model="doclibSearchKey"
              clearable
              @keydown.enter.stop.native="handleDoclibSearch"
            >
              <i
                slot="prefix"
                class="el-input__icon el-icon-search"
                @click="handleDoclibSearch"
              ></i>
            </el-input>
          </div>
          <div class="vmp-doc-lib__bd">
            <el-table
              ref="doclibTable"
              :data="doclibList"
              height="350px"
              style="width: 100%; margin-top: 10px"
              @selection-change="handleChangeSelection"
              @select-all="handleChangeSelectall"
            >
              <el-table-column type="selection" width="55" align="left"></el-table-column>
              <el-table-column prop="file_name" label="文档名称" width="180"></el-table-column>
              <el-table-column prop="created_at" label="创建时间" width="170"></el-table-column>
              <el-table-column prop="page" label="页码"></el-table-column>
              <el-table-column prop="uploadPropress" label="进度" width="200">
                <template slot-scope="scope">
                  <DocProgressStatus
                    :docStatus="scope.row.docStatus"
                    :transformProcess="scope.row.transformProcess"
                    :uploadPropress="scope.row.uploadPropress"
                  ></DocProgressStatus>
                </template>
              </el-table-column>
            </el-table>
          </div>
          <div class="vmp-doc-lib__ft">
            <div class="vmp-doc-lib__ft-tip">当前选中 {{ selectIds.length }} 个文档</div>
            <div>
              <el-button type="primary" @click="handleDoclibSubmit">确定</el-button>
              <el-button @click="handleDoclibCancel">取消</el-button>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>
<script>
  import { useRoomBaseServer, useMsgServer, useDocServer } from 'middle-domain';
  import { boxEventOpitons } from '@/packages/app-shared/utils/tool';
  import DocProgressStatus from './progress-status.vue';

  export default {
    name: 'VmpDocDlglist',
    components: {
      DocProgressStatus
    },
    data() {
      return {
        dialogVisible: false,
        mode: 1, //模式，默认1:当前直播列表 ，2：资料库列表

        uploadUrl: `${process.env.VUE_APP_BASE_URL}/v3/interacts/document/upload-webinar-document`,

        // 要演示的文档观众是否可见
        switchStatus: true,
        // 当前活动文档列表相关
        isLoading: false,
        docSearchKey: '',
        dataList: [],

        // 资料库文档列表相关
        doclibSearchKey: '',
        doclibList: [],
        selectIds: [], // 选中的文档ID列表
        isCheckAll: false
      };
    },
    beforeCreate() {
      this.docServer = useDocServer();
      this.roomBaseServer = useRoomBaseServer();
      this.msgServer = useMsgServer();
    },
    computed: {
      // 是否观看端
      isWatch() {
        return this.roomBaseServer.state.clientType !== 'send';
      }
    },
    watch: {
      docSearchKey(val) {
        if (val == '') {
          this.handleDocSearch();
        } else {
          this.dataList = this.dataList.filter(item => {
            return item.file_name.indexOf(val) > -1;
          });
        }
      }
    },
    mounted() {
      // 初始化事件
      this.initEvents();
    },
    methods: {
      initEvents() {
        // 监听文档消息
        this.msgServer.$onMsg('CUSTOM_MSG', this.listenDocMsg);
      },
      // 使用具名消息，后面offMsg的时候使用
      // TODO 暂时没有offMsg事件，后面有的时候加上
      listenDocMsg(msg) {
        console.log('[doc] ------CUSTOM_MSG-----文档消息：', msg);
        // {
        //   "type": "host_msg_webinar",
        //   "data": {
        //       "page": "1",
        //       "document_id": "64f984ff",
        //       "converted_page": "0",
        //       "status": "0",
        //       "status_jpeg": "200",
        //       "converted_page_jpeg": "1",
        //       "doc_type": "doc_convert",
        //       "user_id": 101643
        //    },
        //   "webinar_id": "131121788"
        // }
        try {
          if (typeof msg === 'string') {
            msg = JSON.parse(msg);
          }
          if (typeof msg.context === 'string') {
            msg.context = JSON.parse(msg.context);
          }
          if (typeof msg.data === 'string') {
            msg.data = JSON.parse(msg.data);
          }
        } catch (ex) {
          console.log('消息转换错误：', ex);
          return;
        }
        if (msg.data.type === 'host_msg_webinar') {
          const msgData = msg.data.data;
          // status: "200" // 动态转换状态 0待转换 100转换中 200完成 500失败
          // status_jpeg: "200" // 静态转换状态 0待转换 100转换中 200完成 500失败
          this.$nextTick(() => {
            this.dataList.forEach(item => {
              if (msgData.document_id === item.document_id) {
                const statusJpeg = Number(msgData.status_jpeg);
                const status = Number(msgData.status);
                if (statusJpeg === 0 && status === 0) {
                  item.docStatus = 'transwait'; // 等待转码
                  item.transformProcess = 0;
                } else if (statusJpeg === 100 || status === 100) {
                  item.docStatus = 'transdoing'; // 转码中
                } else if (statusJpeg === 200 || status === 200) {
                  item.docStatus = 'transcompleted'; // 转码完成
                  item.transformProcess = 100;
                } else {
                  item.docStatus = 'transfailed'; // 转码失败
                  item.transformProcess = 100;
                }
                item.status_jpeg = statusJpeg;
                item.page = Number(msgData.page);
                // 使用set解决视图有时候不更新的问题
                this.$set(item, 'status', status);
              }
            });
          });
        }
      },
      show() {
        this.dialogVisible = true;
      },
      /**
       * 对话框打开事事件
       */
      handlOpen() {
        this.handleDocSearch();
      },
      handleClose() {
        if (this.mode === 2) {
          this.handleDoclibCancel();
        } else {
          this.dialogVisible = false;
        }
      },
      // 选中或者取消选中某一项，全选或者取消全选会先触发此事件
      handleChangeSelection(val) {
        this.selectDocIdList = val.map(item => item.document_id);
      },
      // 全选或者取消全选
      handleChangeSelectall(selection) {
        console.log('全选与非全选', selection);
        // 只要数量大于0，即是全选
        this.isCheckAll = selection && selection.length > 0;
      },
      /**
       * 演示文档
       */
      demonstrate(docId, docType) {
        this.dialogVisible = false;
        console.log('演示文档ID：', docId);
        window.$middleEventSdk?.event?.send(
          boxEventOpitons(this.cuid, 'emitDemonstrateDoc', [docId, docType, this.switchStatus])
        );
      },
      /***
       * 删除文档
       */
      async handleDeleteDoc(row) {
        // TODO 提示文本进行国际化处理
        try {
          await this.$confirm('删除后将会影响文档演示和观看，确定删除？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          });
          const result = await this.docServer.delDocList({
            tag: 1,
            ids: row.id,
            webinar_id: row.webinar_id,
            room_id: this.roomBaseServer.state.watchInitData.interact.room_id
          });
          if (result && result.code === 200) {
            this.$message({
              message: '删除成功',
              type: 'success'
            });
            this.handleDocSearch();
          } else {
            this.$message.error('删除失败');
          }
        } catch (err) {
          console.log(err);
        }
      },
      /**
       * 点击资料库按钮
       */
      async handleGotoDoclib() {
        this.mode = 2;
        this.handleDoclibSearch();
      },
      /**
       * 当前活动下文档查询
       */
      async handleDocSearch() {
        if (this.isLoading) {
          return false;
        }
        this.isLoading = true;
        try {
          const result = await this.docServer.getWebinarDocList({
            pos: 0,
            limit: 200,
            type: 2,
            webinar_id: this.roomBaseServer.state.watchInitData.webinar.id,
            room_id: this.roomBaseServer.state.watchInitData.interact.room_id
          });
          if (result && result.code === 200) {
            this.dataList = result.data.list;
            // console.log(this.dataList);
          } else {
            this.$message.error('查询失败');
          }
          this.isLoading = false;
        } catch (ex) {
          this.isLoading = false;
          this.$message.error('查询失败~');
        }
      },
      /**
       * 资料库文档查询
       */
      async handleDoclibSearch() {
        const result = await this.docServer.getSharedDocList({
          keyword: this.doclibSearchKey,
          type: 2,
          room_id: this.roomBaseServer.state.watchInitData.interact.room_id
        });
        if (result && result.code === 200) {
          this.doclibList = result.data.list;
        } else {
          this.$message.error('查询失败');
        }
      },
      cancelCheckHandle() {
        this.selectIds = [];
        this.doclibSearchKey = '';
        try {
          this.$refs.doclibTable.clearSelection();
        } catch (e) {
          console.log(e);
        }
      },
      /**
       * 把资料库中选中的的文档同步到当前活动中
       */
      async handleDoclibSubmit() {
        if (!this.selectDocIdList || this.selectDocIdList.length <= 0) {
          this.$message.warning('请确认是否选中文档');
          return;
        }
        const params = {
          document_id: this.selectDocIdList.join(','),
          tag: 2, // 1：同步到资料库 ，2：同步到活动
          webinar_id: this.roomBaseServer.state.watchInitData.webinar.id,
          room_id: this.roomBaseServer.state.watchInitData.interact.room_id
        };
        try {
          const result = await this.docServer.syncDoc(params);
          if (result && result.code === 200) {
            this.$message.success('关联成功');
            // 关闭资料列表返回到当前活动文档列表
            this.handleDoclibCancel();
            // 更新当前活动文档列表
            this.handleDocSearch();
          } else {
            this.$message.error('关联失败');
          }
        } catch (err) {
          this.$message.warning(err.msg);
        }
      },
      /**
       * 资料库点击取消按钮
       */
      async handleDoclibCancel() {
        this.cancelCheckHandle();
        this.mode = 1;
      },
      beforeUpload(file) {
        if (file.size / 1024 / 1024 > 100) {
          this.$message.warning('上传文件不可大于100M');
          return false;
        }
        const acceptFileTypes = /(jpe?g|png|pptx?|xlsx?|docx?|pdf|bmp)$/i;
        const cacheArr = file.name.split('.');
        var curExt = cacheArr[cacheArr.length - 1];
        if (!acceptFileTypes.test(curExt)) {
          this.$message.warning('文件格式不正确，无法上传');
          return false;
        }
        // console.log('---beforeUpload file:');
        // console.log(file);
        const fileObj = {
          file_name: file.name,
          ext: file.name.split('.')[1],
          created_at: new Date().format('yyyy-MM-dd hh:mm:ss'),
          page: 1,
          docStatus: 'uploading', // 文档状态:上传中
          uploadPropress: 0, // 上传进度
          transformProcess: 0, // 文档转换进度
          uid: file.uid
        };
        this.dataList.unshift(fileObj);
        return true;
      },
      // 上传文档
      handleUpload(param) {
        param.onError = (err, file) => {
          this.dataList.forEach(item => {
            if (file.uid === item.uid) {
              item.docStatus = 'uploadfailed'; //上传失败
            }
          });
          console.error('上传失败：', err);
        };
        param.onSuccess = async (res, file) => {
          // console.log(' 文档的上传完成:', res, file, fileList);
          if (res.code === 200) {
            // res.data;
            // document_id: "28fbfb47"
            // ext: "jpg"
            // file_name: "snow.jpg"
            // hash: "d9df81a72626f52d11d4626bd98c6e8e"
            // id: 20855
            // page: 1
            // size: 362733
            const fuid = file.uid;
            let documentId;
            this.dataList.forEach(item => {
              if (fuid === item.uid) {
                documentId = res.data.document_id;
                item.document_id = res.data.document_id;
                item.id = res.data.id;
                item.docStatus = 'transwait'; //上传成功，等待转码
              }
            });
            this.dataList = [...this.dataList];
            this.$message({
              message: '上传成功',
              type: 'success'
            });
            try {
              await this.$confirm('是否同步上传的文档共享至资料库，便于其他活动使用？', '提示', {
                confirmButtonText: '同步',
                cancelButtonText: '不同步'
              });
            } catch (ex) {
              // 取消
              return;
            }
            const params = {
              document_id: documentId,
              tag: 1
            };
            try {
              const result = await this.docServer.syncDoc(params);
              if (result && result.code === 200) {
                this.$message({
                  message: '同步成功',
                  type: 'success'
                });
              } else {
                this.$message.error('同步失败');
              }
            } catch (err) {
              this.$message.warning(err.msg);
            }
          }
        };
        param.onProgress = (percent, file) => {
          // console.log('[doc] 上传进度：', percent);
          const fuid = file.uid;
          this.dataList.forEach(item => {
            if (fuid === item.uid) {
              item.uploadPropress = parseInt(percent);
            }
          });
          // 触发 watch/computed
          this.dataList = [...this.dataList];
        };
        // 开始上传
        this.docServer.uploadFile(param, this.uploadUrl);
      }
    }
  };
</script>
<style lang="less">
  .vmp-doc-list {
    .vmp-doc-cur__empty {
      height: 380px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      p {
        line-height: 60px;
        font-size: 14px;
        color: #999;
      }
    }
    .help-tips p {
      line-height: 20px;
    }
    .vmp-doc-cur {
      display: flex;
      flex-direction: column;
      height: 100%;

      .vmp-doc-cur__bd {
        padding-top: 10px;

        .el-button.el-button--text {
          color: #666;
          border: 0;
          margin-left: 0;
          font-size: 14px;
          padding: 2px 8px;
        }
      }
      .vmp-doc-cur__ft {
        display: flex;
        flex-direction: row;
        line-height: 20px;
        font-size: 12px;
        padding-top: 15px;
      }
      .vmp-doc-cur__switch {
        margin: 0 8px;

        .el-switch__core {
          height: 16px;

          &:after {
            width: 12px;
            height: 12px;
          }
        }
      }

      .vmp-doc-cur__switch.el-switch.is-checked .el-switch__core::after {
        margin-left: -14px;
      }
    }

    .vmp-doc-lib {
      display: flex;
      flex-direction: column;
      height: 100%;

      .vmp-doc-lib__ft {
        margin: 15px 0 24px 0;
        display: flex;
        flex-direction: row;
        align-items: center;
        .vmp-doc-lib__ft-tip {
          flex: 1;
        }
      }
    }

    .doc-uploader {
      display: inline;
      margin-right: 20px;
    }
  }
</style>

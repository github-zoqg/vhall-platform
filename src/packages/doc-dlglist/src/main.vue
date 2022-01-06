<template>
  <div class="vmp-doc-list">
    <el-dialog :visible.sync="dialogVisible" :before-close="handleClose" width="800px">
      <!-- 标题栏 -->
      <template slot="title">
        <div>
          <span v-show="mode === 2" @click="handleDoclibCancel">
            <i class="iconfont iconzuofanye"></i>
          </span>
          <span>{{ $t('usual.chooseDocument') }}</span>
        </div>
      </template>

      <!-- 内容区域 -->
      <div style="height: 448px">
        <!-- 当前直播列表 -->
        <div class="vmp-doc-cur" v-show="mode === 1">
          <div class="vmp-doc-cur__hd">
            <el-button @click="handleUpload">{{ $t('usual.upload') }}</el-button>
            <el-button @click="handleGotoDoclib">{{ $t('doc_list.doclib') }}</el-button>

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

            <el-input style="width: 220px; float: right" placeholder="请输入文档名称"></el-input>
          </div>
          <div class="vmp-doc-cur__bd">
            <el-table :data="dataList" style="width: 100%" height="336px">
              <el-table-column prop="file_name" label="文档名称" width="180"></el-table-column>
              <el-table-column prop="created_at" label="创建时间" width="170"></el-table-column>
              <el-table-column prop="page" label="页码"></el-table-column>
              <el-table-column prop="address" label="进度"></el-table-column>
              <el-table-column label="操作" width="200">
                <template slot-scope="scope">
                  <el-button
                    v-if="scope.row.status_jpeg == 200 || scope.row.transcoded"
                    @click="demonstrate(scope.row.document_id, 2)"
                    size="mini"
                    type="text"
                  >
                    演示
                  </el-button>
                  <el-button
                    v-if="
                      scope.row.ext.indexOf('ppt') != -1 &&
                      (scope.row.status_jpeg == 200 || scope.row.transcoded)
                    "
                    @click="demonstrate(scope.row.document_id, 1)"
                    size="mini"
                    type="text"
                  >
                    动画版演示
                  </el-button>
                  <el-button
                    @click="handleDeleteDoc(scope.row.id, scope.$index, scope.row.isLocalUpload)"
                    size="mini"
                    type="text"
                  >
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
          <div class="vmp-doc-cur__ft">
            <div>观众可见</div>
          </div>
        </div>

        <!-- 资料库列表 -->
        <div class="vmp-doc-lib" v-show="mode === 2">
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
              height="336px"
              style="width: 100%; margin-top: 10px"
              @selection-change="handleChangeSelection"
              @select-all="handleChangeSelectall"
            >
              <el-table-column type="selection" width="55" align="left"></el-table-column>
              <el-table-column prop="file_name" label="文档名称" width="180"></el-table-column>
              <el-table-column prop="created_at" label="创建时间" width="170"></el-table-column>
              <el-table-column prop="page" label="页码"></el-table-column>
              <el-table-column prop="address" label="进度" width="200"></el-table-column>
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
  import { contextServer } from 'vhall-sass-domain';
  export default {
    name: 'VmpDocDlglist',
    data() {
      return {
        dialogVisible: false,
        title: '',
        subject: '', // 直播名称
        id: '', // 房间id
        mode: 1, //模式，默认1:当前直播列表 ，2：资料库列表

        // 当前活动文档列表相关
        dataList: [],

        // 资料库文档列表相关
        doclibSearchKey: '',
        doclibList: [],
        selectIds: [], // 选中的文档ID列表
        isCheckAll: false
      };
    },
    beforeCreate() {
      this.roomBaseServer = contextServer.get('roomBaseServer');
      this.docServer = contextServer.get('docServer');
    },
    mounted() {
      this.handleDoccurSearch();
    },
    methods: {
      show() {
        this.dialogVisible = true;
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
      demonstrate() {},
      /***
       * 删除文档
       */
      handleDeleteDoc() {},
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
      async handleDoccurSearch() {
        const result = await this.docServer.getWebinarDocList({
          pos: 0,
          limit: 10,
          file_name: '',
          type: 2,
          webinar_id: this.roomBaseServer.state.watchInitData.webinar.id,
          room_id: this.roomBaseServer.state.watchInitData.interact.room_id
        });
        if (result && result.code === 200) {
          this.dataList = result.data.list;
        } else {
          this.$message.error('查询失败');
        }
      },
      /**
       * 资料库文档查询
       */
      async handleDoclibSearch() {
        const result = await this.docServer.getAllDocList({
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
            this.handleDoccurSearch();
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
      }
    }
  };
</script>
<style lang="less">
  .help-tips p {
    line-height: 20px;
  }
  .vmp-doc-cur {
    display: flex;
    flex-direction: column;
    height: 100%;
    .vmp-doc-cur__bd {
      padding-top: 10px;
    }
    .vmp-doc-cur__ft {
      display: flex;
      flex-direction: row;
    }
  }
  .vmp-doc-lib {
    display: flex;
    flex-direction: column;
    height: 100%;

    .vmp-doc-lib__ft {
      margin: 12px 0 24px 0;
      display: flex;
      flex-direction: row;
      align-items: center;
      .vmp-doc-lib__ft-tip {
        flex: 1;
      }
    }
  }
</style>

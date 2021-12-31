<template>
  <div class="vmp-doc-une">
    <div class="vmp-doc-une__hd">
      <vmp-air-container :cuid="cuid"></vmp-air-container>
    </div>
    <div class="vmp-doc-une__content">
      <div class="vmp-doc-une-placeholder">
        <i class="iconfont iconzanwuwendang"></i>
        <span>暂未分享任何文档</span>
      </div>
    </div>
  </div>
</template>
<script>
  export default {
    name: 'VmpDocUne',
    data() {
      return {};
    },
    created() {},
    methods: {
      // initDocSDK() {
      //   // 防止销毁
      //   if (!this.docServer) {
      //     this.docServer = useDocServer();
      //   }
      // },
      /**
       * 初始化文档容器
       * type 文档类型： document 文档, borad 白板
       * cid 容器Id
       * documentId 文档id,在主讲人状态时，是演示的文档ID,其他角色时，是创建文档/白板的UUID
       */
      // initContainer(type = 'document', cid, documentId, noDispatch = false) {
      //   // if (this.isInGroup) {
      //   //   noDispatch = true // 后期优化,,在小组内组长不派发
      //   // }
      //   console.log('初始化容器的参数===========', cid, documentId);
      //   if (type === 'document') {
      //     const opts = {
      //       id: cid,
      //       docId: documentId,
      //       elId: cid, // div 容器 必须
      //       width: parseFloat(this.docBoxStyle.width), // div 宽度，像素单位，数值型不带px 必须
      //       height: parseFloat(this.docBoxStyle.height), // div 高度，像素单位，数值型不带px 必须
      //       noDispatch: noDispatch
      //     };
      //     this.docServer.createDocument(opts);
      //     this.docServer.setControlStyle(this.styleOpts);
      //   } else {
      //     this.boardId = cid;
      //     const opts = {
      //       id: cid,
      //       elId: cid, // div 容器 必须
      //       width: parseFloat(this.boardBoxStyle.width), // div 宽度，像素单位，数值型不带px 必须
      //       height: parseFloat(this.boardBoxStyle.height), // div 高度，像素单位，数值型不带px 必须
      //       backgroundColor: '#FFFFFF',
      //       noDispatch: noDispatch
      //     };
      //     this.docServer.createBoard(opts);
      //     this.docServer.setControlStyle(this.styleOpts);
      //   }
      //   // return Promise.resolve()
      // }
    }
  };
</script>
<style lang="less">
  .vmp-doc-une {
    display: flex;
    flex-direction: column;
    color: #fff;
    .vmp-doc-une__hd {
      width: 100%;
      height: 50px;
      box-sizing: border-box;
    }
    .vmp-doc-une__content {
      flex: 1;
    }
    .vmp-doc-une-placeholder {
      height: 100%;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #2d2d2d;
      flex-direction: column;

      i {
        font-size: 137px;
        color: #7c7c7c;
      }
    }
  }
</style>

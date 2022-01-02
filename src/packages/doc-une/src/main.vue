<template>
  <div class="vmp-doc-une">
    <div class="vmp-doc-une__hd">
      <!-- 这里配置的是文档工具栏 -->
      <vmp-air-container :cuid="cuid"></vmp-air-container>
    </div>
    <div class="vmp-doc-une__content">
      <div ref="docInner" class="vmp-doc-inner">
        <div v-for="item of fileOrboardList" :id="item.cid" :key="item.cid"></div>
      </div>

      <!-- 没有文档时的占位组件 -->
      <div class="vmp-doc-placeholder">
        <div class="vmp-doc-placeholder__inner">
          <i class="iconfont iconzanwuwendang"></i>
          <span>暂未分享任何文档</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  import { contextServer } from 'vhall-sass-domain';
  export default {
    name: 'VmpDocUne',
    data() {
      return {
        currentContainerId: '',
        fileOrboardList: []
      };
    },
    beforeCreate() {
      this.docServer = contextServer.get('docServer');
    },
    methods: {
      onResize() {
        console.log('00---');
        console.log('=======触发了resize事件 ========================');
        this.$nextTick(() => {
          if (this.docServer) {
            const { width, height } = this.setStageSize();
            this.docServer.setSize(width, height, {
              id: this.currentContainerId
            });
          }
        });
      },
      setStageSize() {
        if (!this.$refs.docInner) {
          return;
        }
        const style = window.getComputedStyle(this.$refs.docInner);
        const ratio = 16 / 9;
        const wrapWidth = parseFloat(style.width);
        const wrapHeight = parseFloat(style.height);
        let docBoxWidth = null;
        let docBoxHeight = null;
        if (wrapWidth / wrapHeight > ratio) {
          docBoxHeight = wrapHeight;
          docBoxWidth = docBoxHeight * ratio;
        } else {
          docBoxWidth = wrapWidth;
          docBoxHeight = docBoxWidth * (1 / ratio);
        }
        return {
          width: docBoxWidth,
          height: docBoxHeight
        };
      },
      async createB() {
        let elId = this.docServer.createUUID('board');
        console.log('doc elId:', elId);
        this.fileOrboardList.push({
          cid: elId
        });

        const { width, height } = this.setStageSize();
        let opts = {
          id: elId,
          elId, // div 容器 必须
          width, // div 宽度，像素单位，数值型不带px 必须
          height, // div 高度，像素单位，数值型不带px 必须
          backgroundColor: '#FFFFFF',
          noDispatch: false
        };
        console.log('doc: opts', opts);
        await this.$nextTick();
        this.docServer.createBoard(opts);
        this.docServer.selectContainer({ id: elId });
        this.currentContainerId = elId;
      }
    },
    mounted() {
      window.addEventListener('resize', this.onResize);
      this.createB();
    },
    beforeDestroy() {
      window.removeEventListener('resize', this.onResize);
    }
  };
</script>
<style lang="less">
  .vmp-doc-une {
    display: flex;
    flex-direction: column;
    color: #fff;
    flex: 1;
    .vmp-doc-une__hd {
      width: 100%;
      box-sizing: border-box;
    }
    .vmp-doc-une__content {
      flex: 1;
      position: relative;
    }
    .vmp-doc-placeholder {
      display: none;
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      overflow: hidden;

      .vmp-doc-placeholder__inner {
        width: 100%;
        height: 100%;
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
    .vmp-doc-inner {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      overflow: hidden;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
</style>

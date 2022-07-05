<template>
  <div class="vmp-com-upload" @click="fileSelect">
    <slot></slot>
    <button v-if="!this.$slots.default" class="upload-btn">
      <i class="iconfont icon-upload"></i>
      <span class="upload-btn-text">{{ uploadTxt }}</span>
    </button>
    <input
      ref="upload"
      type="file"
      class="com-upload-file"
      :multiple="multiple"
      @change="startUpload"
      :accept="acceptStr"
    />
  </div>
</template>

<script>
  const MIME_TYPES = {
    jpeg: 'image/jpeg',
    jpg: 'image/jpeg',
    png: 'image/png',
    bmp: 'image/bmp',
    gif: 'image/gif',
    doc: 'application/msword',
    docx: 'application/msword',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.ms-excel',
    pdf: 'application/pdf',
    ppt: 'application/mspowerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    mp4: 'video/mp4',
    flv: 'video/x-flv',
    m3u8: 'application/x-mpegURL',
    mov: 'video/quicktime',
    avi: 'video/x-msvideo',
    wmv: 'video/x-ms-wmv',
    csv: 'text/csv|application/vnd.ms-excel'
  };
  export default {
    name: 'VmpComUpload',
    props: {
      //接受的文件类型
      accept: {
        type: String,
        default: ''
      },
      //上传地址
      actionUrl: {
        type: String,
        required: true
      },
      //默认的文件名
      inputName: {
        type: String,
        default: 'file'
      },
      //额外参数
      exParams: {
        type: Object,
        default() {
          return {};
        }
      },
      //上传的文字
      uploadTxt: {
        type: String,
        default: 'Upload'
      },
      //超时时间
      timeout: {
        type: Number,
        default: 30000
      },
      //证书
      credentials: {
        type: Boolean,
        default: false
      },
      //是否支持多选
      multiple: {
        type: Boolean,
        default: false
      },
      //当前上传的个数
      currentCount: {
        type: Number,
        default: 0
      },
      //总个数
      totalCount: {
        type: Number,
        default: 1
      },
      //文件大小
      fileSize: {
        type: Number,
        default: 0
      }
    },
    data() {
      return {
        current: '',
        queue: [],
        list: [],
        //出错的个数
        error: [],
        uuid: ''
      };
    },
    methods: {
      //唤起文件选择
      fileSelect() {
        this.$refs.upload.value = '';
        this.$refs.upload.click();
      },
      //开始上传
      startUpload(e) {
        this.current = '';
        this.list = [];
        this.queue = [];
        this.error = [];
        let fileSize = this.fileSize * 1024;
        Array.prototype.forEach.call(this.$refs.upload.files, item => {
          let sFileName = item.name.split('.').pop();
          if (this.accept.indexOf(sFileName) === -1) {
            this.error.push({
              state: 'type-limit',
              name: item.name,
              type: item.type
            });
          } else if (item.size > fileSize) {
            this.error.push({
              state: 'size-limit',
              name: item.name,
              size: item.size
            });
          } else {
            this.list.push({
              name: item.name,
              size: item.size
            });
            this.queue.push(item);
          }
        });
        if (this.error.length > 0) {
          this.$emit('error', { code: 503, data: this.error });
          return;
        }
        if (this.currentCount + this.list.length > this.totalCount) {
          this.$emit('error', {
            code: 502,
            type: 'over-count',
            msg: `一次最多上传${this.totalCount}个`
          });
          return;
        }
        this.uuid = Math.random().toString();
        this.$emit('selected', { data: this.list, uuid: this.uuid });
        if (this.queue.length > 0) {
          this.doWork();
        }
      },
      doWork() {
        this.queue.forEach(file => {
          if (file) {
            this.current = file.name;
            const body = new FormData();
            body.append(`${this.inputName}`, file);
            for (let [key, value] of Object.entries(this.exParams)) {
              body.append(key, value);
            }
            this.doUpload(body);
          } else {
            this.current = '';
            this.$emit('over');
          }
        });
      },
      doUpload(formData) {
        let uuid = this.uuid;
        let name = this.current;
        const xhr = new XMLHttpRequest();
        xhr.open('post', this.actionUrl);
        // xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded;charset=UTF-8')
        xhr.timeout = this.timeout;
        if (this.credentials) {
          xhr.withCredentials = true;
        }
        xhr.upload.onprogress = e => {
          if (e.lengthComputable) {
            this.$emit('progress', {
              uuid: uuid,
              name: name,
              loaded: e.loaded,
              total: e.total,
              percent: `${((e.loaded / e.total) * 100).toFixed(2)}%`
            });
          }
        };
        xhr.onload = e => {
          this.$emit('load', { uuid: uuid, name: name, data: xhr.responseText });
          // this.doWork()
        };
        xhr.ontimeout = e => {
          this.$emit('error', { uuid: uuid, name: name, code: 501, error: e });
        };
        xhr.onerror = e => {
          this.$emit('error', { uuid: uuid, name: name, code: 501, error: e });
        };
        xhr.send(formData);
      }
    },
    computed: {
      acceptStr() {
        let str = '';
        const arr = this.accept.split('|');
        if (arr.length > 0) {
          arr.forEach(item => {
            str += `${MIME_TYPES[item]},`;
          });
        } else {
          str = '*';
        }
        return str;
      }
    }
  };
</script>

<style lang="less">
  .vmp-com-upload {
    position: relative;
    display: inline-block;
    .upload-btn {
      line-height: 1.5;
      display: inline-block;
      font-weight: 400;
      text-align: center;
      cursor: pointer;
      background-image: none;
      border: 1px solid #d9d9d9;
      white-space: nowrap;
      padding: 0 15px;
      font-size: 14px;
      border-radius: 4px;
      height: 32px;
      transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
      position: relative;
      color: rgba(0, 0, 0, 0.65);
      background-color: #fff;
      .upload-btn-text {
        margin-left: 8px;
      }
      &:hover {
        color: #40a9ff;
        border-color: #40a9ff;
      }
    }
    .com-upload-file {
      display: none;
    }
  }
</style>

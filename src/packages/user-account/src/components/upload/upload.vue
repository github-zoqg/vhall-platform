<template>
  <el-upload
    class="vmp-avatar-uploader"
    v-bind="$props"
    :headers="headersVo"
    :data="saveData"
    name="resfile"
    accept="image/x-ms-bmp,image/x-png,image/gif,image/jpeg,image/bmp"
    :on-success="handleuploadSuccess"
  >
    <div class="box">
      <div v-if="value">
        <div :style="`width:${widthImg}px;height:${heightImg}px`" class="img-logo">
          <img
            :src="domain_url || domainUrl"
            class="avatar"
            alt=""
            @click.stop.prevent="!isFullCover && fullCover()"
          />
        </div>
        <div v-if="isFullCover" class="mask" @click="isProduct && refresh($event)">
          <span v-if="!!$props.coverPic" @click.stop.prevent="coverPage">
            <i class="el-icon-collection"></i>
            <br />
            {{ $t('account.account_1067') }}
          </span>
          <span @click="refresh($event)">
            <i class="vh-iconfont vh-line-refresh-left"></i>
            <br />
            {{ $t('account.account_1004') }}
          </span>
          <span @click.stop.prevent="deletes">
            <i class="vh-iconfont vh-line-delete"></i>
            <br />
            {{ $t('account.account_1068') }}
          </span>
        </div>
        <div v-else class="bottom-mask">
          <span @click="refresh($event)">{{ $t('account.account_1004') }}</span>
          <span @click.stop.prevent="deletes">{{ $t('account.account_1068') }}</span>
        </div>
      </div>
      <div v-else class="noPic">
        <div class="picInco"><i class="vh-iconfont vh-a-line-cloudtoupload"></i></div>
        <div class="tips">
          <slot name="tip"></slot>
        </div>
      </div>
    </div>
  </el-upload>
</template>

<script>
  import { Upload } from 'element-ui';
  import { v1 as uuidV1 } from 'uuid';

  export default {
    props: {
      ...Object.assign(Upload.props, {
        saveData: {
          type: Object,
          default: () => ({
            path: 'sys/img_url',
            type: 'image'
          })
        },
        action: {
          type: String,
          default: `${process.env.VUE_APP_BASE_URL}/v3/commons/upload/index`
        },
        domain_url: {
          type: String,
          default: ''
        },
        accept: {
          type: String,
          default: 'image/gif, image/jpeg, image/jpg, image/png, image/bmp'
        },
        'list-type': {
          type: String,
          default: 'picture-card'
        },
        // 'on-progress': {
        //   type: Function,
        //   default: ()=> this.uploadProcess
        // },
        'on-error': {
          type: Function,
          default: () => this.uploadError
        },
        'on-preview': {
          type: Function,
          default: () => this.uploadPreview
        },
        // 'before-upload': {
        //   type: Function,
        //   default: ()=> this.beforeUploadHandler
        // },
        'show-file-list': {
          type: Boolean,
          default: false
        }
      }),
      value: {
        type: String,
        default: ''
      },
      coverPic: {
        type: Boolean,
        default: false
      },
      isProduct: {
        type: Boolean,
        default: false
      },
      isFullCover: {
        type: Boolean,
        default: true
      },
      heightImg: {
        type: Number,
        default: 180
      },
      widthImg: {
        type: Number,
        default: 320
      }
    },
    data() {
      return {
        imageUrl: '',
        domainUrl: '',
        token: '', // TODO this.$VhallStorage.get('token', 'local'),
        headersVo: {}
      };
    },
    created() {
      // console.log('----dingxiaodong----初始化上传组件', this.$VhallStorage.get(`V3_WAP_US_${this.$route.params.il_id}`, 'session'));
      this.headersVo = {
        'gray-id': '', // TODO this.$VhallStorage.get(`V3_WAP_US_${this.$route.params.il_id}`, 'session') || '',
        token: '', // TODO this.$VhallStorage.get('token', 'local'),
        platform: 17,
        'request-id': uuidV1()
      };
    },
    methods: {
      handleuploadSuccess(response, file, fileList) {
        console.log('heqhwhqhwhd ', response, file, fileList, this.onSuccess);
        this.headersVo['request-id'] = uuidV1();
        if (response.code !== 200) {
          this.$message({
            message: this.$tec(response.code) || response.msg || '上传失败',
            showClose: true,
            // duration: 0,
            type: 'error',
            customClass: 'zdy-info-box'
          });
        } else {
          console.log(this.$props);
          if (response.data.domain_url) {
            this.domainUrl = response.data.domain_url;
          }
          // this.$emit('input', URL.createObjectURL(file.raw));
          // this.imageUrl = URL.createObjectURL(file.raw);
          this.onSuccess(response, file, fileList);
          // this.$emit('on-success', args)
        }
      },
      // uploadProcess(event, file, fileList){
      //   this['on-progress'](event, file, fileList);
      //   // this.$emit('on-progress', args)
      // },
      // uploadError(err, file, fileList){
      //   this['on-error'](err, file, fileList);
      //   // this.$emit('on-error', args)
      // },
      // uploadPreview(file){
      //   this['on-preview'](file);
      //   // this.$emit('on-preview', args)
      // },
      // beforeUploadHandler(file){
      //   console.log(file);
      //   // this['before-upload'](file);
      //   // this.$emit('before-upload', args)
      // },
      // changeHanler(file, fileList){
      //   this['on-change'](file, fileList);
      //   // this.$emit('on-change', args)
      // },
      deletes() {
        this.domainUrl = '';
        this.$emit('delete', '');
      },
      coverPage() {
        this.$emit('coverPage', '');
      },
      fullCover() {
        this.$emit('fullCover');
      },
      refresh() {
        this.$emit('resetImage');
      }
    }
  };
</script>

<style lang="less">
  .vmp-avatar-uploader {
    .el-upload--picture-card {
      width: 100%;
      height: 138px;
      line-height: unset;
      overflow: hidden;
      background-color: #f7f7f7;
      border: 1px solid #cccccc;
      border-radius: 4px;
      &:hover,
      &:focus {
        background-color: #f7f7f7;
        border: 1px solid #999999;
        border-radius: 4px;
      }
      i {
        color: #999;
        display: inline-block;
      }
      i.saasicon_shangchuan {
        font-size: 36px;
        color: #999;
      }
      .box {
        width: 100%;
        height: 100%;
        display: table;
        > div {
          width: 100%;
          height: 100%;
          position: relative;
          // padding-top: 30px;
          display: table-cell;
          vertical-align: middle;
          text-align: center;
          &:hover {
            .mask {
              display: flex;
              justify-content: center;
              align-items: center;
              color: #fff;
              line-height: 20px;
              // padding: 0 10px;
            }
            .bottom-mask {
              display: flex;
              justify-content: space-around;
              align-items: center;
              color: #fff;
            }
          }
        }
        /* .picInco{
          height: 40px;
        } */
      }
      .img-logo {
        margin: 0 auto;
      }
      img {
        height: 100%;
        object-fit: scale-down;
        width: 100%;
        margin: 0px auto;
      }
    }
    .mask {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      display: none;
      span {
        font-size: 14px;
        &:nth-child(2) {
          margin: 0 0 0 10px;
          i {
            line-height: 1;
          }
        }
        i {
          color: #fff;
          font-size: 18px;
          vertical-align: middle;
        }
      }
    }
    .bottom-mask {
      position: absolute;
      left: 0;
      width: 100%;
      background: rgba(0, 0, 0, 0.7);
      display: none;
      border-radius: 2px 2px 0 0;
      padding: 0 5px;
      bottom: 0;
      span {
        font-size: 14px;
        display: inline-block;
        line-height: 26px;
        color: #fff;
      }
    }
    .tips {
      font-size: 12px;
      color: #999;
      text-align: center;
      p {
        line-height: 16px;
        padding: 0;
      }
    }
  }
</style>

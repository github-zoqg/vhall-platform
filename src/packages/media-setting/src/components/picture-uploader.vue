<template>
  <section class="vmp-picture-uploader-container">
    <section class="vmp-picture-uploader">
      <el-upload
        class="picture-uploader"
        :show-file-list="false"
        :headers="{ token: headToken, platform: 7 }"
        :action="`${baseUrl}/v3/commons/upload/index`"
        :on-success="onUploadSuccess"
        :before-upload="beforeUpload"
        name="resfile"
        :data="{
          path: `${roomId}/img`,
          type: 'image',
          interact_token: interactToken
        }"
      >
        <div ref="uploaderView" v-if="canvasImgUrl" class="picture-uploader-view">
          <el-image
            :key="'defaultImg' + rand"
            class="picture-uploader-img"
            :src="canvasImgUrl"
            alt=""
          ></el-image>
          <p class="picture-uploader-controller-panel">
            <span class="icon-wrap-con icon-wrap-change" :class="{ 'icon-wrap-only': !showDelImg }">
              <i class="vh-iconfont vh-line-refresh-right"></i>
              {{ $t('account.account_1004') }}
            </span>
            <span class="icon-wrap-con icon-wrap-del" @click.stop="onRemove" v-show="showDelImg">
              <i class="vh-iconfont vh-line-delete"></i>
              {{ $t('setting.setting_1015') }}
            </span>
          </p>
        </div>
        <i v-else class="el-icon-plus picture-uploader-icon"></i>
      </el-upload>

      <p class="vmp-picture-uploader-tips">{{ $t('setting.setting_1016') }}</p>
    </section>
  </section>
</template>

<script>
  import { useRoomBaseServer } from 'middle-domain';
  import { sleep } from '@/app-shared/utils/tool.js';
  import canvasDefaultImg from '../assets/img/canvasDefault.png';
  export default {
    props: {
      canvasImgUrl: {
        require: true,
        default: ''
      }
    },
    data() {
      return {
        roomId: null,
        interactToken: null,
        baseUrl: process.env.VUE_APP_BASE_URL,
        hasUploadImg: false,
        showDelImg: false,
        rand: ''
      };
    },
    created() {
      const { watchInitData } = useRoomBaseServer().state;
      this.roomId = watchInitData?.interact?.room_id;
      this.interactToken = watchInitData?.interact?.interact_token;
      this.headToken = localStorage.getItem('token');
    },
    methods: {
      /**
       * 上传前检查
       * @param {File} file
       */
      beforeUpload(file) {
        const isJPG = file.type === 'image/jpeg' || file.type === 'image/png';
        const isLt2M = file.size / 1024 / 1024 < 2;

        if (!isJPG) {
          this.$message.warning('上传图片只能是 JPG、PNG 格式!');
        }
        if (!isLt2M) {
          this.$message.warning(this.$t('other.other_1004'));
        }
        return isJPG && isLt2M;
      },
      /**
       * 上传成功时，更新canvasImgUrl
       * @param {*} res
       */
      async onUploadSuccess(res) {
        if (res.code == 200) {
          this.showDelImg = true;
          this.$emit('update:canvasImgUrl', res.data.domain_url);
          this.canvasImgUrlChange = true;

          // 等待图片更换完毕，一秒再弹出，动画效果较好
          await sleep(1000);
          this.$message.success('上传成功');
        } else {
          this.$message.error(res.msg);
        }
      },
      onRemove() {
        this.showDelImg = false;
        this.$emit('update:canvasImgUrl', canvasDefaultImg);
      },
      selected() {
        if (
          this.$refs['uploaderView'] &&
          this.$refs['uploaderView'].getElementsByTagName('img').length === 0
        ) {
          this.rand = (Math.random() * 10000000).toFixed(0);
        }
      }
    }
  };
</script>

<style lang="less">
  .vmp-picture-uploader-container {
    .picture-uploader {
      width: 100%;
      height: 100%;
      border-radius: 6px;
      overflow: hidden;
      .el-upload {
        border-radius: 6px;
        cursor: pointer;
        position: relative;
        overflow: hidden;
        width: 100%;
        height: 100%;
        background: #000;
      }
      .el-upload:hover {
        border-color: #409eff;
      }

      &-controller-panel {
        position: absolute;
        width: 100%;
        height: 100%;
      }

      .picture-uploader-icon {
        font-size: 28px;
        color: #8c939d;
        width: 178px;
        height: 178px;
        line-height: 178px;
        text-align: center;

        img {
          width: 100%;
        }
      }
    }

    .picture-uploader-view {
      position: relative;
      height: 166px;
      width: 100%;
      background: #000;

      &:hover .picture-uploader-controller-panel {
        display: flex;

        .icon-wrap-con {
          i {
            font-size: 18px;
          }

          display: flex;
          flex-direction: column;
        }

        .icon-wrap-con:not(:first-child) {
          margin-left: 15px;
        }
      }
    }

    .picture-uploader-img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    .picture-uploader-controller-panel {
      display: none;
      position: absolute;
      justify-content: center;
      align-items: center;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      font-size: 14px;
      font-weight: 400;
      color: #fff;
      line-height: 20px;
      background: rgba(0, 0, 0, 0.7);
    }

    .vmp-picture-uploader-tips {
      font-size: 12px;
      font-weight: 400;
      color: #999;
      line-height: 17px;
    }
  }
</style>

<template>
  <div class="vmp-share">
    <el-dialog
      :title="$t('nav.nav_1013')"
      :visible.sync="shareVisible"
      :close-on-click-modal="true"
      :modal-append-to-body="true"
      width="440px"
    >
      <div class="vmp-share-wrap">
        <div class="vmp-share-wrap-imgs">
          <div class="vmp-share-wrap-imgs-chat" @click="shareOtherDialog(1)">
            <span></span>
            <p>{{ $t('nav.nav_1016') }}</p>
          </div>
          <div class="vmp-share-wrap-imgs-qq" @click="shareOtherDialog(2)">
            <span></span>
            <p>{{ $t('nav.nav_1018') }}</p>
          </div>
          <div class="vmp-share-wrap-imgs-weibo" @click="shareOtherDialog(3)">
            <span></span>
            <p>{{ $t('nav.nav_1017') }}</p>
          </div>
          <div class="vmp-share-wrap-imgs-invite" @click="shareOtherDialog(4)" v-if="isInviteShare">
            <span></span>
            <p>{{ $t('nav.nav_1015') }}</p>
          </div>
        </div>
        <div class="vmp-share-wrap-input">
          <el-input
            id="vmp-share-watch"
            v-model="watchWebUrl"
            class="vmp-share-wrap-input-width"
            readOnly
          ></el-input>
          <span @click="copy">{{ $t('nav.nav_1014') }}</span>
        </div>
      </div>
    </el-dialog>
    <el-dialog
      :title="$t('nav.nav_1013')"
      :visible.sync="shareOtherVisible"
      :close-on-click-modal="false"
      width="320px"
    >
      <div class="vmp-share-other">
        <img :src="shareUrl" alt="" />
      </div>
      <p class="vmp-share-introduce">
        {{ $t('nav.nav_1019') }}
        <br />
        {{ introduceText }}
      </p>
    </el-dialog>
  </div>
</template>
<script>
  import { contextServer } from 'vhall-sass-domain';
  export default {
    name: 'VmpShare',
    data() {
      return {
        shareVisible: false,
        shareOtherVisible: false,
        watchWebUrl: `https://t-webinar.e.vhall.com/v3/lives/watch/${this.$route.params.id}`,
        shareUrl: '',
        introduceText: this.$t('nav.nav_1022'),
        isInviteShare: false
      };
    },
    beforeCreate() {
      this.roomBaseServer = contextServer.get('roomBaseServer');
    },
    mounted() {
      this.initConfig();
    },
    created() {
      this.roomBaseState = this.roomBaseServer.state;
    },
    methods: {
      initConfig() {
        const widget = window.$serverConfig?.[this.cuid];
        if (widget && widget.options) {
          Object.assign(this.$data, widget.options);
        }
      },
      openShareDialog() {
        this.shareVisible = true;
      },
      shareOtherDialog(index) {
        this.shareUrl = '';
        this.introduceText = '';
        if (index == 1) {
          this.openWeixinDialog();
          this.introduceText = this.$t('nav.nav_1022');
        } else if (index == 2) {
          this.openQqDialog();
        } else if (index == 3) {
          this.openWeiboDialog();
        } else if (index == 4) {
          this.openInviteDialog();
          this.introduceText = this.$t('nav.nav_1023');
        }
      },
      openWeixinDialog() {
        this.shareOtherVisible = true;
        const shareId = `${this.roomBaseState.watchInitData.share_id}-3`;
        const url = `${this.watchWebUrl}?shareId=${encodeURIComponent(shareId)}`;
        this.shareUrl = `https://aliqr.e.vhall.com/qr.png?t=${url}`;
      },
      openQqDialog() {
        const p = {
          /* 获取URL，可加上来自分享到QQ标识，方便统计 */
          url: `${this.watchWebUrl}?shareId=${encodeURIComponent(
            this.roomBaseState.watchInitData.share_id + '-2'
          )}`,
          desc: '',
          /* 分享标题(可选) */
          title: this.$t('nav.nav_1026'),
          /* 分享摘要(可选) */
          summary: this.$t('nav.nav_1025'),
          /* 分享图片(可选) */
          pics: '',
          /* 分享来源(可选) 如：QQ分享 */
          site: '',
          style: '201',
          width: 32,
          height: 32
        };
        const s = [];
        for (const i in p) {
          s.push(i + '=' + encodeURIComponent(p[i] || ''));
        }
        const url = 'http://connect.qq.com/widget/shareqq/index.html?' + s.join('&');
        window.open(url);
      },
      openWeiboDialog() {
        // 微博是 3
        const shareId = `${this.roomBaseState.watchInitData.share_id}-2`;
        const url = `${this.watchWebUrl}?shareId=${encodeURIComponent(shareId)}`;
        const weiboShareUrl = `https://aliqr.e.vhall.com/qr.png?t=${url}`;
        const p = {
          url: weiboShareUrl,
          title: this.$t('nav.nav_1027')
        };
        const s = [];
        for (const i in p) {
          s.push(i + '=' + encodeURIComponent(p[i] || ''));
        }
        const weiBourl = 'http://service.weibo.com/share/share.php?' + s.join('&');
        window.open(weiBourl);
      },
      openInviteDialog() {
        // 邀请卡分享二维码链接
        this.shareOtherVisible = true;
        const { join_info } = this.roomBaseState.watchInitData;
        if (join_info) {
          const url = encodeURIComponent(
            `https://t-webinar.e.vhall.com/v3/lives/invite/${this.$route.params.id}?invite_id=${
              join_info.join_id || ''
            }`
          );
          this.shareUrl = `https://aliqr.e.vhall.com/qr.png?t=${url}`;
        }
      },
      copy() {
        const input = document.getElementById('vmp-share-watch');
        input.select();
        document.execCommand('copy');
        this.$message({
          message: this.$t('nav.nav_1024'),
          showClose: true,
          type: 'success',
          customClass: 'zdy-info-box'
        });
      }
    }
  };
</script>
<style lang="less">
  .vmp-share {
    &-wrap {
      padding-bottom: 15px;
      &-imgs {
        display: flex;
        align-items: center;
        justify-content: space-around;
        padding: 0 18px 16px 18px;
        div {
          text-align: center;
          cursor: pointer;
          span {
            display: block;
            width: 40px;
            height: 40px;
            cursor: pointer;
          }
          p {
            font-size: 14px;
            font-weight: 400;
            color: @font-light-normal;
            line-height: 20px;
            margin-top: 8px;
          }
        }
        &-chat {
          span {
            background: url('./images/wechat@2x.png') 50% no-repeat;
            background-size: 100% 100%;
          }
          p:hover {
            color: #05c215;
          }
        }
        &-qq {
          span {
            background: url('./images/qq@2x.png') 50% no-repeat;
            background-size: 100% 100%;
          }
          p:hover {
            color: #4a9afd;
          }
        }
        &-weibo {
          span {
            background: url('./images/weibo@2x.png') 50% no-repeat;
            background-size: 100% 100%;
          }
          p:hover {
            color: #f8cf29;
          }
        }
        &-invite {
          span {
            background: url('./images/inv-card@2x.png') 50% no-repeat;
            background-size: 100% 100%;
          }
          p:hover {
            color: #fb3a32;
          }
        }
      }
      &-input {
        height: 40px;
        width: 376px;
        border: 1px solid #ccc;
        border-radius: 4px;
        .el-input {
          width: 296px;
          border-radius: 4px 0 0 4px;
          background: #f7f7f7;
        }
        .el-input__inner {
          border: none;
          height: 40px;
          background: transparent;
          font-size: 14px;
          font-weight: 400;
          color: #1a1a1a;
          line-height: 20px;
        }
        span {
          display: inline-block;
          width: 80px;
          height: 40px;
          text-align: center;
          line-height: 40px;
          background: #e6e6e6;
          color: #666;
          vertical-align: top;
          cursor: pointer;
        }
      }
    }
    &-other {
      display: flex;
      justify-content: center;
      align-items: center;
      padding-bottom: 20px;
      img {
        width: 132px;
        height: 132px;
      }
    }
    &-introduce {
      font-size: 14px;
      font-weight: 400;
      color: @font-light-low;
      line-height: 20px;
      text-align: center;
      word-break: break-word;
      padding-bottom: 12px;
    }
  }
</style>

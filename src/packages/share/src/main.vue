<template>
  <div class="vmp-share">
    <el-dialog
      :title="isRehearsal ? $t('nav.nav_1054') : $t('nav.nav_1013')"
      :visible.sync="shareVisible"
      :close-on-click-modal="true"
      :modal-append-to-body="true"
      width="440px"
    >
      <div class="vmp-share-wrap">
        <div class="vmp-share-wrap_imgs">
          <div class="imgs_chat" @click="shareOtherDialog(1)">
            <span></span>
            <p>{{ $t('nav.nav_1016') }}</p>
          </div>
          <div class="imgs_qq" @click="shareOtherDialog(2)">
            <span></span>
            <p>{{ $t('nav.nav_1018') }}</p>
          </div>
          <div class="imgs_weibo" @click="shareOtherDialog(3)">
            <span></span>
            <p>{{ $t('nav.nav_1017') }}</p>
          </div>
          <div
            class="imgs_invite"
            @click="shareOtherDialog(4)"
            v-if="isInviteShare && isWatchInvite"
          >
            <span></span>
            <p>{{ $t('nav.nav_1015') }}</p>
          </div>
        </div>
        <div class="vmp-share-wrap_input">
          <el-input
            id="vmp-share-watch"
            v-model="watchWebUrl"
            class="input_width"
            readOnly
          ></el-input>
          <span @click="copy">{{ $t('nav.nav_1014') }}</span>
        </div>
        <div v-if="isRehearsal" class="share_tip">
          {{ $t('other.other_1021') }}
        </div>
      </div>
    </el-dialog>
    <el-dialog
      :title="$t('nav.nav_1013')"
      :visible.sync="shareOtherVisible"
      :close-on-click-modal="false"
      width="320px"
    >
      <div class="vmp-share_other">
        <img :src="shareUrl" alt="" />
      </div>
      <p class="vmp-share_introduce">
        {{ $t('nav.nav_1019') }}
        <br />
        {{ introduceText }}
      </p>
    </el-dialog>
  </div>
</template>
<script>
  import { useRoomBaseServer } from 'middle-domain';
  import { getUrl, doCopy } from '@/app-shared/utils/tool';
  export default {
    name: 'VmpShare',
    data() {
      return {
        shareVisible: false,
        shareOtherVisible: false,
        watchWebUrl: `${window.location.protocol}${process.env.VUE_APP_WAP_WATCH}${process.env.VUE_APP_ROUTER_BASE_URL}/lives/watch/${this.$route.params.id}`,
        shareUrl: '',
        introduceText: this.$t('nav.nav_1022'),
        isInviteShare: false,
        isSubjectShare: false,
        isWatchInvite: false
      };
    },
    beforeCreate() {
      this.roomBaseServer = useRoomBaseServer();
    },
    created() {
      this.roomBaseState = this.roomBaseServer.state;
    },
    computed: {
      // 是否是彩排
      isRehearsal() {
        return this.$domainStore.state.roomBaseServer.watchInitData.live_type == 2;
      }
    },
    methods: {
      // 事件驱动打开分享弹窗
      openShareDialog(id) {
        this.watchWebUrl = `${window.location.protocol}${process.env.VUE_APP_WAP_WATCH}${process.env.VUE_APP_ROUTER_BASE_URL}/lives/watch/${this.$route.params.id}`;
        this.shareVisible = true;
        if (id && this.isSubjectShare) {
          this.watchWebUrl = `${window.location.protocol}${process.env.VUE_APP_WAP_WATCH}${process.env.VUE_APP_ROUTER_BASE_URL}/special/detail?id=${id}`;
        }
        if (this.isRehearsal) {
          this.watchWebUrl = getUrl(this.watchWebUrl, { rehearsal: 1 });
        }
        if (!this.isInviteShare) return; //发起端不用判断是否开启邀请卡
        if (this.roomBaseState.inviteCard.status == '1') {
          this.isWatchInvite = true;
        } else {
          this.isWatchInvite = false;
        }
      },
      // 打开分享弹窗
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
        // 上报分享
        const shareChannelArr = [0, 3, 2, 1, 4]; // 0:复制链接、1:微博、2:QQ、3:微信、4:邀请卡
        window.vhallReportForWatch?.report(170020, {
          share_channel: shareChannelArr[index]
        });
      },
      // 打开微信弹窗 - 3
      openWeixinDialog() {
        this.shareOtherVisible = true;
        const shareId = `${this.roomBaseState.watchInitData.share_id}-3`;
        let url = this.isSubjectShare
          ? this.watchWebUrl
          : getUrl(this.watchWebUrl, { shareId: shareId });
        this.shareUrl = `https://aliqr.e.vhall.com/qr.png?s=7&t=${url}`;
      },
      // 打开qq分享 - 2
      openQqDialog() {
        if (this.isSubjectShare) {
          let url = `//connect.qq.com/widget/shareqq/index.html?url=${this.watchWebUrl}`;
          window.open(url, '_blank');
        } else {
          let urlStr = getUrl(this.watchWebUrl, {
            shareId: this.roomBaseState.watchInitData.share_id + '-2'
          });

          const p = {
            /* 获取URL，可加上来自分享到QQ标识，方便统计 */
            url: urlStr,
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
        }
      },
      // 打开微博 - 1
      openWeiboDialog() {
        if (this.isSubjectShare) {
          let url = `http://service.weibo.com/share/share.php?url=${this.watchWebUrl}`;
          window.open(url, '_blank');
        } else {
          const shareId = `${this.roomBaseState.watchInitData.share_id}-1`;
          let url = getUrl(this.watchWebUrl, { shareId: shareId });
          const weiboShareUrl = `https://aliqr.e.vhall.com/qr.png?s=7&t=${url}`;
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
        }
      },
      // 打开邀请卡
      openInviteDialog() {
        // 邀请卡分享二维码链接
        this.shareOtherVisible = true;
        const { join_info } = this.roomBaseState.watchInitData;
        if (join_info) {
          const url = encodeURIComponent(
            `${window.location.origin}${process.env.VUE_APP_ROUTER_BASE_URL}/lives/invite/${
              this.$route.params.id
            }?invite_id=${join_info.join_id || ''}`
          );
          this.shareUrl = `https://aliqr.e.vhall.com/qr.png?s=7&t=${url}`;
        }
      },
      // 复制地址
      copy() {
        // const input = document.getElementById('vmp-share-watch');
        // input.select();
        // document.execCommand('copy');
        doCopy(this.watchWebUrl);
        this.$message({
          message: this.$t('nav.nav_1024'),
          showClose: true,
          type: 'success',
          customClass: 'zdy-info-box'
        });
        // 上报分享
        window.vhallReportForWatch?.report(170020, {
          share_channel: 0
        });
      }
    }
  };
</script>
<style lang="less">
  .vmp-share {
    .el-dialog__body {
      padding: 0 32px 24px 32px;
    }
    &-wrap {
      &_imgs {
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
        .imgs_chat {
          span {
            background: url('./img/wechat@2x.png') 50% no-repeat;
            background-size: 100% 100%;
          }
          p:hover {
            color: #05c215;
          }
        }
        .imgs_qq {
          span {
            background: url('./img/qq@2x.png') 50% no-repeat;
            background-size: 100% 100%;
          }
          p:hover {
            color: #4a9afd;
          }
        }
        .imgs_weibo {
          span {
            background: url('./img/weibo@2x.png') 50% no-repeat;
            background-size: 100% 100%;
          }
          p:hover {
            color: #f8cf29;
          }
        }
        .imgs_invite {
          span {
            background: url('./img/inv-card@2x.png') 50% no-repeat;
            background-size: 100% 100%;
          }
          p:hover {
            color: #fb3a32;
          }
        }
      }
      &_input {
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
      .share_tip {
        color: #666;
        font-size: 12px;
        margin-top: 8px;
      }
    }
    &_other {
      display: flex;
      justify-content: center;
      align-items: center;
      padding-bottom: 20px;
      img {
        width: 132px;
        height: 132px;
      }
    }
    &_introduce {
      font-size: 14px;
      font-weight: 400;
      color: @font-light-low;
      line-height: 20px;
      text-align: center;
      word-break: break-word;
      // padding-bottom: 12px;
    }
  }
</style>

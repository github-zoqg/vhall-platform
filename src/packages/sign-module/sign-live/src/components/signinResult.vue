<template>
  <div class="sign-live-result">
    <div class="sign-live-result_count" :class="signTotal == 0 ? 'sign-live-result_nocount' : ''">
      <div class="sign-people">
        <span>{{ signTotal }}</span>
        人签到
      </div>
    </div>
    <div class="sign-live-result_table" v-if="signTotal != 0">
      <div class="table-list">
        <div class="table-list_item" v-for="(user, index) in signList" :key="index">
          <span class="sign-avatar">
            <img :src="user.signer_avatar ? user.signer_avatar : defaultAvater" alt="" />
          </span>
          <span class="sign-name text-overflow">{{ user.signer_nickname }}</span>
          <span class="sign-time">{{ signTime(user.created_at) }}</span>
        </div>
      </div>
    </div>
    <div class="sign-live-result_btn">
      <el-button type="primary" round @click="$emit('restartsign')">开始签到</el-button>
    </div>
    <div class="sign-live-result_tip">最多显示100人，控制台/当前活动/互动统计/签到查看数据</div>
  </div>
</template>

<script>
  import { useSignServer } from 'middle-domain';
  import { defaultAvatar } from '@/app-shared/utils/ossImgConfig';
  export default {
    name: 'SignResult',
    props: {
      room_id: {
        type: [Number, String]
      },
      signId: {
        type: [Number, String]
      }
    },
    computed: {
      signTime() {
        return function (val) {
          return dayjs(val).format('HH:mm');
        };
      }
    },
    beforeCreate() {
      this.signServer = useSignServer();
    },
    data() {
      return {
        signImg: require('../img/sign@2x.png'),
        signImgZero: require('../img/sign_zero@2x.png'),
        defaultAvatar,
        signTotal: 10,
        signList: []
      };
    },
    mounted() {
      this.signTotal = 0;
      const _data = {
        room_id: this.room_id,
        sign_id: this.signId,
        limit: 100
      };
      this.signServer
        .getSignRecordList(_data)
        .then(res => {
          console.warn('获取当前活动的签到列表', res);
          this.signTotal = res.data.total;
          this.signList = res.data.list;
        })
        .catch(error => {
          this.$message.error(error.msg);
        });
    }
  };
</script>

<style lang="less">
  .sign-live-result {
    text-align: center;
    padding-top: 110px;
    &_count {
      margin-bottom: 12px;
      img {
        width: 56px;
        height: 56px;
      }
      .img-zero {
        width: 110px;
        height: 110px;
      }
      .sign-people {
        font-size: 14px;
        color: #1a1a1a;
        margin-top: 50px;
        span {
          color: #1a1a1a;
          font-size: 28px;
        }
      }
    }
    &_nocount {
      padding-top: 75px;
    }
    ::-webkit-scrollbar {
      width: 6px; // 横向滚动条
      height: 6px; // 纵向滚动条 必写
    }
    // 滚动条的滑块
    ::-webkit-scrollbar-thumb {
      border-radius: 5px;
      transition: all 0.3s;
      cursor: pointer;
      display: none;
      background-color: #e0e0e0;
    }
    ::-webkit-scrollbar-track {
      background-color: transparent;
    }
    &:hover {
      ::-webkit-scrollbar-thumb {
        display: block;
      }
    }
    &_tip {
      width: 100%;
      position: absolute;
      font-size: 12px;
      text-align: center;
      color: #666;
      bottom: 40px;
    }
    &_table {
      background-color: rgba(255, 255, 255, 0.8);
      border-radius: 8px;
      color: #222;
      margin: 10px 45px;
      &-head {
        display: flex;
        padding: 12px 20px;
        justify-content: space-between;
      }
      .table-list_item {
        display: flex;
        padding: 8px 24px;
        align-items: center;
        color: #1a1a1a;
        .sign-avatar {
          display: inline-block;
          width: 24px;
          height: 24px;
          font-size: 0;
          border-radius: 50%;
          img {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            object-fit: cover;
          }
        }
        .sign-name {
          text-align: left;
          padding-left: 8px;
          font-size: 14px;
          width: 190px;
        }
        .sign-time {
          flex: 1;
          text-align: right;
          font-size: 14px;
        }
      }
      .table-list {
        height: 150px;
        overflow-y: auto;
        overflow-x: hidden;
      }
    }
    &_btn {
      text-align: center;
      .el-button {
        width: 160px;
        line-height: 20px;
      }
    }
  }
</style>

/**
 * 客户端嵌入页编排配置
 */
export default {
  // 客户端嵌入页组件
  embedClientRoot: {
    component: 'VmpEmbedClient',
    children: [
      'comDocUne',
      'dlgDocList',
      'comChat',
      'comQa',
      'comLottery',
      'comSignLive',
      'comRedPacket',
      'comLiveTimerSet',
      'comLiveTimer'
    ],
    emiSwitchTo: {
      cuid: ['comDocUne'],
      method: 'switchTo',
      args: ['$0']
    }
  },
  // 文档白板组件
  comDocUne: {
    component: 'VmpDocUne',
    emitSwitchTo: {
      cuid: ['comAsideMenu'],
      method: 'switchTo',
      args: ['$0'] // 获取动态参数的第一个
    },
    // 打开对话框
    emitOpenDocList: {
      cuid: 'dlgDocList',
      method: 'show'
    }
  },
  //文档列表对话框
  dlgDocList: {
    component: 'VmpDocDlglist',
    emitDemonstrateDoc: [
      {
        cuid: 'comDocUne',
        method: 'demonstrate',
        args: ['$0', '$1', '$2']
      }
    ]
  },
  //聊天组件
  comChat: {
    component: 'VmpChat',
    options: {
      //是否有图片上传按钮【聊天区域底部操作栏--上传图片】
      hasImgUpload: true,
      //是否有聊天过滤按钮【聊天区域底部操作栏--屏蔽特效,只看主办方】
      hasChatFilterBtn: false,
      //是否开启聊天设置功能
      enableChatSetting: true,
      //操作用户消息的弹窗配置【消息区域--左键单击用户头像，可以回复，@，禁言，删除消息，踢出人员等】
      userControlOptions: {
        enable: true
      }
    },
    //打开私聊弹窗
    emitOpenLivePrivateChatModal: [
      {
        cuid: 'comLivePrivateChat',
        method: 'openModal'
      }
    ],
    //客户端嵌入-通知客户端打开图片语言
    emitPreviewImage: [{ cuid: 'embedClientRoot', method: 'preivewImage', args: ['$0'] }],
    //客户端嵌入-通知客户端开启聊天审核
    emitOpenChatFilterUrl: [{ cuid: 'embedClientRoot', method: 'openChatFilterUrl', args: ['$0'] }]
  },
  //抽奖
  comLottery: {
    component: 'VmpLotteryLive'
  },
  //问答
  comQa: {
    component: 'VmpQa',
    //客户端嵌入-通知客户端开启问答管理页面
    emitOpenQAAdmin: [{ cuid: 'embedClientRoot', method: 'openQAAdmin', args: ['$0'] }]
  },
  // 红包
  comRedPacket: {
    component: 'VmpRedPacketLive'
  },
  //签到
  comSignLive: {
    component: 'VmpSignLive'
  },
  // 互动工具-计时器设置
  comLiveTimerSet: {
    component: 'VmpLiveTimerSet',
    emitDisTimerIcon: [
      {
        cuid: ['embedClientRoot'],
        method: 'changeStatus',
        args: ['$0', '$1']
      }
    ]
  },
  // 互动工具-计时器
  comLiveTimer: {
    component: 'VmpLiveTimer',
    emitOpenTimerSet: [
      {
        cuid: ['comLiveTimerSet'],
        method: 'openTimerSet'
      }
    ]
  }
};

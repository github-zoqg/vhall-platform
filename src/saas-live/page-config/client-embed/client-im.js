/**
 * 客户端嵌入页编排配置
 */
export default {
  // 客户端嵌入页聊天组件
  imClientRoot: {
    component: 'VmpContainer',
    children: ['comChat', 'comPcRewardEffect'],
    emitKickout: [
      {
        cuid: 'comChat',
        method: 'assistantKickout',
        args: ['$0']
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
    emitHideEffect: {
      cuid: 'comPcRewardEffect',
      method: 'setHideEffect',
      args: ['$0']
    }
  },
  // 礼物动画组件
  comPcRewardEffect: {
    component: 'VmpPcRewardEffect'
  }
};

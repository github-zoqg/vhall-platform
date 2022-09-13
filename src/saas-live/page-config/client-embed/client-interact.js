/**
 * 客户端嵌入页编排配置
 */
export default {
  // 客户端嵌入页互动组件
  interactClientRoot: {
    component: 'VmpContainer',
    children: ['comQuestionnaire', 'comQa', 'comLottery', 'comSignLive', 'comRedPacket'],
    emitQu: [
      {
        cuid: 'comQuestionnaire',
        method: 'handleQu',
        args: ['$0']
      }
    ],
    emitLottery: [
      {
        cuid: 'comLottery',
        method: 'handleLottery',
        args: ['$0']
      }
    ],
    emitQa: [
      {
        cuid: 'comQa',
        method: 'handleQa',
        args: ['$0']
      }
    ],
    emitSign: [
      {
        cuid: 'comSignLive',
        method: 'handleSign',
        args: ['$0']
      }
    ],
    emitRedPacket: [
      {
        cuid: 'comRedPacket',
        method: 'handleRedPacket',
        args: ['$0']
      }
    ]
  },
  //问卷
  comQuestionnaire: {
    component: 'VmpQuestionnaire'
  },
  //抽奖
  comLottery: {
    component: 'VmpLotteryLive'
  },
  //问答
  comQa: {
    component: 'VmpQa'
  },
  // 红包
  comRedPacket: {
    component: 'VmpRedPacketLive'
  },
  //签到
  comSignLive: {
    component: 'VmpSignLive'
  }
};

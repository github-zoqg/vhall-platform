const onlineMixin = {
  data() {
    return {
      uvOnline: 1, // 真实人数
      virtualOnline: 0,
      uvHot: 1, // 真实热度
      virtualHot: 0
    };
  },
  filters: {
    formatHotNum(value) {
      value = parseInt(value);
      let unit = '';
      const k = 99999;
      const sizes = ['', '万', '亿', '万亿'];
      let i;
      if (value > k) {
        i = Math.floor(Math.log(value) / Math.log(k));
        value = (value / Math.pow(k / 10, i)).toFixed(1);
        unit = sizes[i];
      }
      return value + unit;
    }
  },
  computed: {
    hotNum() {
      return Number(this.uvHot) + Number(this.virtualHot) + 1;
    },
    onlineNum() {
      return Number(this.uvOnline) + Number(this.virtualOnline);
    }
  },
  created() {
    this.roomBaseState = this.roomBaseServer.state;
    const { watchInitData } = this.roomBaseState;
    this.virtualOnline = (watchInitData.online && Number(watchInitData.online.num)) || 0;
    this.uvHot = (watchInitData.pv && watchInitData.pv.num2) || 0;
    this.virtualHot = (watchInitData.pv && Number(watchInitData.pv.num)) || 0;
  },
  mounted() {
    this.listenEvent();
  },
  methods: {
    listenEvent() {
      // 加入房间
      this.msgServer.$on('JOIN', msg => {
        this.$nextTick(() => {
          this.uvOnline = msg.uv;
          if (msg.context.pv > this.uvHot) {
            this.uvHot = msg.context.pv;
          }
        });
      });
      // 离开房间 ROOM_NUM_UPDATE
      this.msgServer.$on('LEFT', msg => {
        this.$nextTick(() => {
          this.uvOnline = msg.uv;
        });
      });
      // 添加虚拟人数和热度
      this.msgServer.$on('ROOM_MSG', msg => {
        let msgs = JSON.parse(msg.data);
        if (msgs.type == 'base_num_update') {
          console.log(msg, msgs, '14zhangxiao==========');
          this.$nextTick(() => {
            this.virtualHot = this.virtualHot + Number(msgs.update_pv);
            this.virtualOnline = this.virtualOnline + Number(msgs.update_online_num);
          });
        }
      });
    }
  }
};
export default onlineMixin;

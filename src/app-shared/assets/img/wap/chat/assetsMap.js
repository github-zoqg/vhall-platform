import image_666 from './666.png';
import image_love from './爱心.png';
import image_aircraft from './飞机.png';
import image_rocket from './火箭.png';
import image_coffee from './咖啡.png';
import image_salute from './礼炮.png';
import image_rose from './玫瑰.png';
import image_car from './汽车.png';
import image_reward from './reward.png';

const map = {
  666: image_666,
  爱心: image_love,
  飞机: image_aircraft,
  火箭: image_rocket,
  咖啡: image_coffee,
  礼炮: image_salute,
  玫瑰: image_rose,
  汽车: image_car,
  reward: image_reward
};

export default function getAsset(assetName) {
  return map[assetName] || map['reward'];
}

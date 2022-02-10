const mock1 = [
  {
    component_id: 1,
    content: '<p><span style="font-size: 24px;">abc</span></p>'
  },
  {
    component_id: 2,
    imageSrc:
      'https://t-alistatic01.e.vhall.com/upload//aliqr.e.vhall.com/qr.png?t=https://t-webinar.e.vhall.com/v3/lives/watch/800606360'
  },
  {
    component_id: 8
  },
  {
    component_id: 7,
    title: 'AB C'
  }
];

const mock2 = [
  {
    component_id: 9,
    inSwitch: 1,
    rewardSwitch: '1',
    inContent: '<p>123123</p>\n<p>456456</p>',
    rewardContent: '<p>123123</p>\n<p>456456</p>\n<p>123123</p>\n<p>456456</p>'
  }
];

const mock3 = [
  {
    component_id: 10,
    promoteId: []
  },
  {
    component_id: 1,
    content: '<p><span style="font-size: 24px;">abc</span></p>'
  },
  {
    component_id: 8
  },
  // {
  //   component_id: 7,
  //   title: 'AB C'
  // },
  {
    component_id: 2,
    imageSrc:
      'https://t-alistatic01.e.vhall.com/upload//aliqr.e.vhall.com/qr.png?t=https://t-webinar.e.vhall.com/v3/lives/watch/800606360'
  },
  // {
  //   component_id: 3,
  //   webinars: [834527205, 603265575, 666782699, 542135044]
  // },
  {
    component_id: 8
  },
  // {
  //   component_id: 4,
  //   subjects: [680009208, 180242371]
  // },
  {
    component_id: 8
  },
  {
    component_id: 5,
    text: 'text123',
    src: 'https://www.baidu.com/'
  },
  {
    component_id: 6,
    imageSrc:
      'https://t-alistatic01.e.vhall.com/upload/interacts/menu-link-imgs/9b/70/9b70419d8d84a882d1189b8ec785186d.jpeg',
    src: 'https://www.baidu.com'
  }
];

const mockPromote = [
  {
    id: 4898,
    activity_id: '65866008',
    menu_id: '33251',
    business_uid: 101742572,
    img_url:
      'https://t-alistatic01.e.vhall.com/upload/interacts/menu-link-imgs/9b/70/9b70419d8d84a882d1189b8ec785186d.jpeg',
    title: 'abc',
    link: 'http://www.baidu.com/',
    sort: 1,
    created_at: '2022-02-09 10:47:10',
    updated_at: '2022-02-09 10:47:10',
    deleted_at: null,
    operator: '101742572'
  },
  {
    id: 4899,
    activity_id: '65866008',
    menu_id: '33251',
    business_uid: 101742572,
    img_url:
      'https://t-alistatic01.e.vhall.com/upload/interacts/menu-link-imgs/9b/70/9b70419d8d84a882d1189b8ec785186d.jpeg',
    title: 'test',
    link: 'http://www.baidu.com/',
    sort: 2,
    created_at: '2022-02-09 10:47:10',
    updated_at: '2022-02-09 10:47:10',
    deleted_at: null,
    operator: '101742572'
  }
];

export { mock1, mock2, mock3, mockPromote };

export default defineAppConfig({
  pages: [
    'pages/sendoff/index',
    'pages/pending/index',
    'pages/pool/index',
    'pages/mine/index',
    'pages/detail/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#FFFFFF',
    navigationBarTitleText: '剧本杀用车助手',
    navigationBarTextStyle: 'black',
    backgroundColor: '#F4F6FA'
  },
  tabBar: {
    color: '#9099B0',
    selectedColor: '#2D5BFF',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/sendoff/index',
        text: '今晚送客'
      },
      {
        pagePath: 'pages/pending/index',
        text: '待发布'
      },
      {
        pagePath: 'pages/pool/index',
        text: '车源池'
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的'
      }
    ]
  }
})

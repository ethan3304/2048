// app.js
const gameCore = require('./game.js');

// 初始化游戏
App({
  onLaunch() {
    // 加载游戏核心
    gameCore.init();
  }
}); 
# 2048 微信小游戏

这是一个基于Canvas实现的2048微信小游戏版本。

## 功能特性

- 经典的2048游戏玩法
- 触摸滑动控制
- 分数统计和最高分记录
- 游戏结束检测
- 简洁美观的界面

## 如何使用

### 开发环境配置

1. 下载并安装[微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 克隆或下载本项目代码
3. 在微信开发者工具中导入项目
4. 在`project.config.json`中替换`appid`为你自己的微信小游戏AppID

### 运行游戏

在微信开发者工具中点击"编译"按钮，游戏将在模拟器中运行。

### 发布游戏

1. 在微信开发者工具中点击"上传"按钮
2. 登录[微信公众平台](https://mp.weixin.qq.com/)
3. 在管理后台提交审核并发布

## 游戏操作说明

- 向上、下、左、右滑动屏幕移动方块
- 相同数字的方块碰撞后会合并成为它们的和
- 每次移动后，会在空白处随机出现一个2或4的方块
- 当无法移动时游戏结束
- 点击"新游戏"按钮可以重新开始游戏

## 项目结构

- `app.js` - 小游戏入口文件
- `app.json` - 小游戏全局配置
- `game.js` - 游戏核心逻辑
- `game.json` - 游戏配置文件
- `project.config.json` - 项目配置文件

## 技术实现

- Canvas绘制游戏界面
- 使用微信小游戏API处理触摸事件和本地存储
- 游戏逻辑基于经典2048算法

## 自定义主题

如果您想修改游戏的界面颜色和风格，可以在`game.js`文件中修改`COLORS`对象中的颜色值。

## 版权信息

本游戏基于2048原版游戏改编，游戏玩法版权归原作者所有。

## Features

- Score tracking
- Best score saved in local storage
- Game over detection
- Responsive design

## Controls

- Arrow Up: Move tiles up
- Arrow Down: Move tiles down
- Arrow Left: Move tiles left
- Arrow Right: Move tiles right
- New Game button: Start a new game

## Preview

The game features a clean, minimalist design based on the original 2048 game, with tiles of different colors representing different numbers. "# 2048" 

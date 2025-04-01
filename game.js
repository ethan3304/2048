// game.js - 微信小游戏主逻辑
const CELL_SIZE = 15; // 小格子间距
const GRID_SIZE = 4; // 游戏格子是4x4
const BOARD_MARGIN = 15; // 棋盘边距
let ctx; // canvas上下文
let canvas; // 画布

// 游戏状态
let board = [];
let score = 0;
let bestScore = 0;
let gameOver = false;
let isAnimating = false;

// 触摸变量
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

// 颜色配置
const COLORS = {
  background: '#faf8ef',
  boardBackground: '#bbada0',
  emptyCell: 'rgba(238, 228, 218, 0.35)',
  text: '#776e65',
  scoreBox: '#bbada0',
  scoreText: '#ffffff',
  button: '#8f7a66',
  buttonText: '#ffffff',
  tile2: '#eee4da',
  tile4: '#ede0c8',
  tile8: '#f2b179',
  tile16: '#f59563',
  tile32: '#f67c5f',
  tile64: '#f65e3b',
  tile128: '#edcf72',
  tile256: '#edcc61',
  tile512: '#edc850',
  tile1024: '#edc53f',
  tile2048: '#edc22e',
  tileTextDark: '#776e65',
  tileTextLight: '#ffffff'
};

// 游戏初始化
function init() {
  // 获取画布和上下文
  canvas = wx.createCanvas();
  ctx = canvas.getContext('2d');

  // 获取本地存储的最高分
  try {
    const savedBestScore = wx.getStorageSync('bestScore');
    if (savedBestScore) {
      bestScore = parseInt(savedBestScore);
    }
  } catch (e) {
    console.error('获取最高分失败', e);
  }
  
  // 初始化游戏状态
  resetGame();
  
  // 设置触摸事件监听
  listenForTouchEvents();

  // 开始游戏循环
  gameLoop();
}

// 重置游戏
function resetGame() {
  // 初始化游戏数据
  board = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(0));
  score = 0;
  gameOver = false;
  isAnimating = false;
  
  // 添加两个初始方块
  addRandomTile();
  addRandomTile();
}

// 添加随机方块(90%概率为2，10%概率为4)
function addRandomTile() {
  // 找出所有空白格子
  const emptyCells = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (board[r][c] === 0) {
        emptyCells.push({ r, c });
      }
    }
  }
  
  // 如果没有空格，返回
  if (emptyCells.length === 0) return;
  
  // 随机选择一个空格
  const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  
  // 设置值为2或4(90%的概率为2)
  board[randomCell.r][randomCell.c] = Math.random() < 0.9 ? 2 : 4;
}

// 绘制游戏界面
function drawGame() {
  // 清空画布
  ctx.fillStyle = COLORS.background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // 绘制顶部信息区域
  drawHeader();
  
  // 绘制游戏棋盘
  drawBoard();
  
  // 绘制方块
  drawTiles();
  
  // 如果游戏结束，显示游戏结束信息
  if (gameOver) {
    drawGameOver();
  }
}

// 绘制顶部信息
function drawHeader() {
  // 绘制游戏标题
  ctx.fillStyle = COLORS.text;
  ctx.font = 'bold 36px Arial';
  ctx.textAlign = 'left';
  ctx.fillText('2048', 20, 50);
  
  // 绘制分数区域
  drawScoreBox('分数', score, canvas.width - 180, 20, 80);
  drawScoreBox('最高分', bestScore, canvas.width - 80, 20, 80);
  
  // 绘制"新游戏"按钮
  drawButton('新游戏', canvas.width / 2 - 50, 80, 100, 40);
}

// 绘制分数框
function drawScoreBox(label, value, x, y, width) {
  const height = 60;
  
  // 绘制背景
  ctx.fillStyle = COLORS.scoreBox;
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, 3);
  ctx.fill();
  
  // 绘制标签
  ctx.fillStyle = COLORS.scoreText;
  ctx.font = '14px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(label, x + width / 2, y + 20);
  
  // 绘制分数
  ctx.font = 'bold 20px Arial';
  ctx.fillText(value, x + width / 2, y + 45);
}

// 绘制按钮
function drawButton(text, x, y, width, height) {
  // 绘制背景
  ctx.fillStyle = COLORS.button;
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, 5);
  ctx.fill();
  
  // 绘制文本
  ctx.fillStyle = COLORS.buttonText;
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x + width / 2, y + height / 2);
}

// 绘制游戏棋盘
function drawBoard() {
  // 计算棋盘大小和位置
  const boardSize = Math.min(canvas.width, canvas.height - 130) - 2 * BOARD_MARGIN;
  const cellSize = (boardSize - (GRID_SIZE + 1) * CELL_SIZE) / GRID_SIZE;
  const boardX = (canvas.width - boardSize) / 2;
  const boardY = 130;
  
  // 绘制棋盘背景
  ctx.fillStyle = COLORS.boardBackground;
  ctx.beginPath();
  ctx.roundRect(boardX, boardY, boardSize, boardSize, 6);
  ctx.fill();
  
  // 绘制空格子
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const x = boardX + CELL_SIZE + c * (cellSize + CELL_SIZE);
      const y = boardY + CELL_SIZE + r * (cellSize + CELL_SIZE);
      
      ctx.fillStyle = COLORS.emptyCell;
      ctx.beginPath();
      ctx.roundRect(x, y, cellSize, cellSize, 3);
      ctx.fill();
    }
  }
}

// 绘制方块
function drawTiles() {
  // 计算棋盘大小和位置
  const boardSize = Math.min(canvas.width, canvas.height - 130) - 2 * BOARD_MARGIN;
  const cellSize = (boardSize - (GRID_SIZE + 1) * CELL_SIZE) / GRID_SIZE;
  const boardX = (canvas.width - boardSize) / 2;
  const boardY = 130;
  
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const value = board[r][c];
      if (value !== 0) {
        const x = boardX + CELL_SIZE + c * (cellSize + CELL_SIZE);
        const y = boardY + CELL_SIZE + r * (cellSize + CELL_SIZE);
        
        // 获取方块颜色和文字颜色
        const { bgColor, textColor } = getTileColors(value);
        
        // 绘制方块背景
        ctx.fillStyle = bgColor;
        ctx.beginPath();
        ctx.roundRect(x, y, cellSize, cellSize, 3);
        ctx.fill();
        
        // 绘制方块文字
        ctx.fillStyle = textColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // 根据数字长度调整字体大小
        const fontSize = value < 100 ? 36 : value < 1000 ? 32 : 24;
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.fillText(value.toString(), x + cellSize / 2, y + cellSize / 2);
      }
    }
  }
}

// 获取方块颜色
function getTileColors(value) {
  let bgColor;
  let textColor;
  
  switch (value) {
    case 2:
      bgColor = COLORS.tile2;
      textColor = COLORS.tileTextDark;
      break;
    case 4:
      bgColor = COLORS.tile4;
      textColor = COLORS.tileTextDark;
      break;
    case 8:
      bgColor = COLORS.tile8;
      textColor = COLORS.tileTextLight;
      break;
    case 16:
      bgColor = COLORS.tile16;
      textColor = COLORS.tileTextLight;
      break;
    case 32:
      bgColor = COLORS.tile32;
      textColor = COLORS.tileTextLight;
      break;
    case 64:
      bgColor = COLORS.tile64;
      textColor = COLORS.tileTextLight;
      break;
    case 128:
      bgColor = COLORS.tile128;
      textColor = COLORS.tileTextLight;
      break;
    case 256:
      bgColor = COLORS.tile256;
      textColor = COLORS.tileTextLight;
      break;
    case 512:
      bgColor = COLORS.tile512;
      textColor = COLORS.tileTextLight;
      break;
    case 1024:
      bgColor = COLORS.tile1024;
      textColor = COLORS.tileTextLight;
      break;
    case 2048:
      bgColor = COLORS.tile2048;
      textColor = COLORS.tileTextLight;
      break;
    default:
      bgColor = COLORS.tile2048;
      textColor = COLORS.tileTextLight;
  }
  
  return { bgColor, textColor };
}

// 绘制游戏结束界面
function drawGameOver() {
  // 绘制半透明背景
  ctx.fillStyle = 'rgba(238, 228, 218, 0.73)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // 绘制游戏结束文字
  ctx.fillStyle = COLORS.text;
  ctx.font = 'bold 40px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('游戏结束!', canvas.width / 2, canvas.height / 2 - 30);
  
  // 绘制重新开始按钮
  drawButton('再试一次', canvas.width / 2 - 60, canvas.height / 2 + 20, 120, 40);
}

// 游戏主循环
function gameLoop() {
  // 绘制游戏
  drawGame();
  
  // 继续循环
  requestAnimationFrame(gameLoop);
}

// 处理移动
function move(direction) {
  if (gameOver || isAnimating) return;
  
  // 设置动画标志
  isAnimating = true;
  
  // 设置超时保护，防止卡死
  const animationTimeout = setTimeout(() => {
    isAnimating = false;
  }, 250);
  
  try {
    let moved = false;
    
    // 克隆当前棋盘状态
    const oldBoard = JSON.parse(JSON.stringify(board));
    
    // 根据方向处理移动
    switch (direction) {
      case 'up':
        moved = moveUp();
        break;
      case 'down':
        moved = moveDown();
        break;
      case 'left':
        moved = moveLeft();
        break;
      case 'right':
        moved = moveRight();
        break;
    }
    
    // 如果有移动，添加新方块
    if (moved) {
      // 延迟添加新方块，模拟动画效果
      setTimeout(() => {
        // 清除超时保护
        clearTimeout(animationTimeout);
        
        // 添加新方块
        addRandomTile();
        
        // 更新最高分
        if (score > bestScore) {
          bestScore = score;
          try {
            wx.setStorageSync('bestScore', bestScore.toString());
          } catch (e) {
            console.error('保存最高分失败', e);
          }
        }
        
        // 检查游戏是否结束
        if (isGameOver()) {
          gameOver = true;
        }
        
        // 重置动画标志
        isAnimating = false;
      }, 150);
    } else {
      // 没有移动，直接重置动画标志
      clearTimeout(animationTimeout);
      isAnimating = false;
    }
  } catch (e) {
    console.error('移动处理错误:', e);
    clearTimeout(animationTimeout);
    isAnimating = false;
  }
}

// 向上移动
function moveUp() {
  let moved = false;
  
  for (let c = 0; c < GRID_SIZE; c++) {
    // 获取列数据
    const column = [board[0][c], board[1][c], board[2][c], board[3][c]];
    
    // 合并列
    const result = collapse(column);
    
    // 检查列是否改变
    const columnChanged = !arraysEqual(column, result);
    moved = moved || columnChanged;
    
    // 更新棋盘
    for (let r = 0; r < GRID_SIZE; r++) {
      board[r][c] = result[r];
    }
  }
  
  return moved;
}

// 向下移动
function moveDown() {
  let moved = false;
  
  for (let c = 0; c < GRID_SIZE; c++) {
    // 获取列数据（倒序）
    const column = [board[3][c], board[2][c], board[1][c], board[0][c]];
    
    // 合并列
    const result = collapse(column);
    
    // 检查列是否改变
    const columnChanged = !arraysEqual(column, result);
    moved = moved || columnChanged;
    
    // 更新棋盘（倒序）
    for (let r = 0; r < GRID_SIZE; r++) {
      board[3-r][c] = result[r];
    }
  }
  
  return moved;
}

// 向左移动
function moveLeft() {
  let moved = false;
  
  for (let r = 0; r < GRID_SIZE; r++) {
    // 获取行数据
    const row = [...board[r]];
    
    // 合并行
    const result = collapse(row);
    
    // 检查行是否改变
    const rowChanged = !arraysEqual(row, result);
    moved = moved || rowChanged;
    
    // 更新棋盘
    board[r] = result;
  }
  
  return moved;
}

// 向右移动
function moveRight() {
  let moved = false;
  
  for (let r = 0; r < GRID_SIZE; r++) {
    // 获取行数据（倒序）
    const row = [...board[r]].reverse();
    
    // 合并行
    const result = collapse(row);
    
    // 检查行是否改变
    const rowChanged = !arraysEqual(row, result);
    moved = moved || rowChanged;
    
    // 更新棋盘（倒序）
    board[r] = result.reverse();
  }
  
  return moved;
}

// 合并数组
function collapse(arr) {
  // 过滤掉零值
  let filtered = arr.filter(val => val !== 0);
  
  // 合并相邻相等的值
  for (let i = 0; i < filtered.length - 1; i++) {
    if (filtered[i] === filtered[i+1]) {
      filtered[i] *= 2;
      filtered[i+1] = 0;
      score += filtered[i];
      i++; // 跳过已合并的值
    }
  }
  
  // 再次过滤掉零值（合并产生的）
  filtered = filtered.filter(val => val !== 0);
  
  // 用零填充到长度为4
  while (filtered.length < GRID_SIZE) {
    filtered.push(0);
  }
  
  return filtered;
}

// 检查两个数组是否相等
function arraysEqual(arr1, arr2) {
  if (arr1.length !== arr2.length) return false;
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) return false;
  }
  return true;
}

// 检查游戏是否结束
function isGameOver() {
  // 检查空格
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (board[r][c] === 0) {
        return false;
      }
    }
  }
  
  // 检查水平合并可能性
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE - 1; c++) {
      if (board[r][c] === board[r][c+1]) {
        return false;
      }
    }
  }
  
  // 检查垂直合并可能性
  for (let r = 0; r < GRID_SIZE - 1; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (board[r][c] === board[r+1][c]) {
        return false;
      }
    }
  }
  
  // 没有空格且无法合并，游戏结束
  return true;
}

// 监听触摸事件
function listenForTouchEvents() {
  // 监听触摸开始事件
  wx.onTouchStart((event) => {
    const touch = event.changedTouches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    
    // 检测点击"新游戏"按钮
    checkNewGameButtonClick(touch.clientX, touch.clientY);
  });
  
  // 监听触摸结束事件
  wx.onTouchEnd((event) => {
    const touch = event.changedTouches[0];
    touchEndX = touch.clientX;
    touchEndY = touch.clientY;
    
    handleSwipe();
  });
}

// 检查是否点击了"新游戏"按钮
function checkNewGameButtonClick(x, y) {
  const buttonX = canvas.width / 2 - 50;
  const buttonY = 80;
  const buttonWidth = 100;
  const buttonHeight = 40;
  
  if (
    x >= buttonX && 
    x <= buttonX + buttonWidth && 
    y >= buttonY && 
    y <= buttonY + buttonHeight
  ) {
    resetGame();
  }
  
  // 如果游戏结束，检查是否点击了"再试一次"按钮
  if (gameOver) {
    const restartX = canvas.width / 2 - 60;
    const restartY = canvas.height / 2 + 20;
    const restartWidth = 120;
    const restartHeight = 40;
    
    if (
      x >= restartX && 
      x <= restartX + restartWidth && 
      y >= restartY && 
      y <= restartY + restartHeight
    ) {
      resetGame();
    }
  }
}

// 处理滑动
function handleSwipe() {
  const xDiff = touchEndX - touchStartX;
  const yDiff = touchEndY - touchStartY;
  
  // 设置最小滑动距离
  const minSwipeDistance = 30;
  
  // 检查是水平还是垂直滑动
  if (Math.abs(xDiff) > Math.abs(yDiff)) {
    // 水平滑动
    if (Math.abs(xDiff) > minSwipeDistance) {
      if (xDiff > 0) {
        move('right');
      } else {
        move('left');
      }
    }
  } else {
    // 垂直滑动
    if (Math.abs(yDiff) > minSwipeDistance) {
      if (yDiff > 0) {
        move('down');
      } else {
        move('up');
      }
    }
  }
}

// 添加圆角矩形方法 (微信小游戏需要手动实现)
CanvasRenderingContext2D.prototype.roundRect = function(x, y, width, height, radius) {
  if (typeof radius === 'undefined') {
    radius = 5;
  }
  
  this.beginPath();
  this.moveTo(x + radius, y);
  this.lineTo(x + width - radius, y);
  this.quadraticCurveTo(x + width, y, x + width, y + radius);
  this.lineTo(x + width, y + height - radius);
  this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  this.lineTo(x + radius, y + height);
  this.quadraticCurveTo(x, y + height, x, y + height - radius);
  this.lineTo(x, y + radius);
  this.quadraticCurveTo(x, y, x + radius, y);
  this.closePath();
};

// 导出初始化函数
module.exports = {
  init
}; 
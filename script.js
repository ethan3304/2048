document.addEventListener('DOMContentLoaded', () => {
    const gameBoard = document.getElementById('game-board');
    const scoreElement = document.getElementById('score');
    const bestScoreElement = document.getElementById('best-score');
    const newGameButton = document.getElementById('new-game-button');
    const themeSelect = document.getElementById('theme-select');
    
    let board = [];
    let score = 0;
    let bestScore = localStorage.getItem('bestScore') || 0;
    let gameOver = false;
    let isAnimating = false;
    
    // Touch variables
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    
    // Initialize game
    function initGame() {
        // Reset variables
        board = Array(4).fill().map(() => Array(4).fill(0));
        score = 0;
        gameOver = false;
        isAnimating = false;
        scoreElement.textContent = score;
        bestScoreElement.textContent = bestScore;
        
        // Clear the game board
        gameBoard.innerHTML = '';
        
        // Create the grid cells
        for (let i = 0; i < 16; i++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            gameBoard.appendChild(cell);
        }
        
        // Add two initial tiles
        addRandomTile();
        addRandomTile();
        
        // Render the board
        renderBoard();
    }
    
    // Apply the selected theme
    function applyTheme(theme) {
        // Remove all theme classes from body
        document.body.classList.remove('theme-dark', 'theme-blue', 'theme-green');
        
        // Add the selected theme class if not default
        if (theme !== 'default') {
            document.body.classList.add(`theme-${theme}`);
        }
        
        // Save theme preference to localStorage
        localStorage.setItem('theme', theme);
    }
    
    // Initialize theme from localStorage or default
    function initTheme() {
        const savedTheme = localStorage.getItem('theme') || 'default';
        themeSelect.value = savedTheme;
        applyTheme(savedTheme);
    }
    
    // Generate a random tile (90% chance of 2, 10% chance of 4)
    function addRandomTile() {
        // Find all empty cells
        const emptyCells = [];
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                if (board[r][c] === 0) {
                    emptyCells.push({ r, c });
                }
            }
        }
        
        // If there are no empty cells, return
        if (emptyCells.length === 0) return;
        
        // Choose a random empty cell
        const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        
        // Set its value to 2 or 4 (90% chance of 2, 10% chance of 4)
        board[randomCell.r][randomCell.c] = Math.random() < 0.9 ? 2 : 4;
        
        // Mark this tile as new for animation
        const index = randomCell.r * 4 + randomCell.c;
        const cell = gameBoard.children[index];
        setTimeout(() => {
            const tile = document.createElement('div');
            tile.classList.add('tile', `tile-${board[randomCell.r][randomCell.c]}`, 'new');
            tile.textContent = board[randomCell.r][randomCell.c];
            cell.appendChild(tile);
        }, 50);
    }
    
    // Render the board
    function renderBoard() {
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                const value = board[r][c];
                const index = r * 4 + c;
                const cell = gameBoard.children[index];
                
                // Clear previous tile
                if (cell.querySelector('.tile')) {
                    cell.removeChild(cell.querySelector('.tile'));
                }
                
                // Add a new tile if the value is not 0
                if (value !== 0) {
                    const tile = document.createElement('div');
                    tile.classList.add('tile', `tile-${value}`);
                    tile.textContent = value;
                    cell.appendChild(tile);
                }
            }
        }
    }
    
    // Move tiles in a direction with animation
    function move(direction) {
        if (gameOver || isAnimating) return;
        
        // 设置一个超时保护，防止卡死
        const animationTimeout = setTimeout(() => {
            isAnimating = false;
        }, 1000); // 1秒后自动重置动画状态
        
        // Set animating flag
        isAnimating = true;
        
        try {
            let moved = false;
            let mergedPositions = []; // Keep track of merged positions for animation
            let movementInfo = []; // 记录每个方块的移动信息
            
            // Clone the board to check if it changes
            const oldBoard = JSON.parse(JSON.stringify(board));
            
            // 记录当前所有方块的位置和值
            const tilesBeforeMove = [];
            for (let r = 0; r < 4; r++) {
                for (let c = 0; c < 4; c++) {
                    if (oldBoard[r][c] !== 0) {
                        tilesBeforeMove.push({
                            r, c, value: oldBoard[r][c]
                        });
                    }
                }
            }
            
            // Process the move based on direction
            switch (direction) {
                case 'up':
                    moved = moveUp(mergedPositions, movementInfo);
                    break;
                case 'down':
                    moved = moveDown(mergedPositions, movementInfo);
                    break;
                case 'left':
                    moved = moveLeft(mergedPositions, movementInfo);
                    break;
                case 'right':
                    moved = moveRight(mergedPositions, movementInfo);
                    break;
            }
            
            // If the board changed, add a new tile
            if (moved) {
                // 创建移动路径的幽灵方块
                createMovementGhosts(tilesBeforeMove, direction);
                
                // Add animation classes to tiles based on movement distance
                addMoveAnimationsWithDistance(direction, movementInfo);
                
                // 创建消除动画
                createMergeRemoveEffects(mergedPositions);
                
                // After animation completes, update the board
                setTimeout(() => {
                    try {
                        // 清除超时保护
                        clearTimeout(animationTimeout);
                        
                        // Remove all animation classes before re-rendering
                        document.querySelectorAll('.tile').forEach(tile => {
                            tile.classList.remove(
                                'move-up', 'move-down', 'move-left', 'move-right',
                                'move-up-2', 'move-down-2', 'move-left-2', 'move-right-2',
                                'move-up-3', 'move-down-3', 'move-left-3', 'move-right-3',
                                'merge-remove'
                            );
                        });
                        
                        // 移除所有幽灵方块
                        document.querySelectorAll('.tile-ghost').forEach(ghost => {
                            if (ghost.parentElement) {
                                ghost.parentElement.removeChild(ghost);
                            }
                        });
                        
                        renderBoard();
                        
                        // Apply merge animations
                        mergedPositions.forEach(pos => {
                            if (pos.r >= 0 && pos.r < 4 && pos.c >= 0 && pos.c < 4) {
                                const index = pos.r * 4 + pos.c;
                                if (index >= 0 && index < 16) {
                                    const cell = gameBoard.children[index];
                                    if (cell) {
                                        const tile = cell.querySelector('.tile');
                                        if (tile) {
                                            tile.classList.add('merge');
                                        }
                                    }
                                }
                            }
                        });
                        
                        addRandomTile();
                        
                        // Update best score if needed
                        if (score > bestScore) {
                            bestScore = score;
                            bestScoreElement.textContent = bestScore;
                            localStorage.setItem('bestScore', bestScore);
                        }
                        
                        // Check for game over
                        if (isGameOver()) {
                            gameOver = true;
                            setTimeout(() => {
                                alert('Game Over! No more moves available.');
                            }, 500);
                        }
                        
                        // Reset animation flag
                        isAnimating = false;
                    } catch (e) {
                        console.error("动画完成后更新错误:", e);
                        isAnimating = false; // 确保动画状态重置
                    }
                }, 150); // Match this timing with CSS animation duration
            } else {
                clearTimeout(animationTimeout); // 清除超时保护
                isAnimating = false;
            }
        } catch (e) {
            console.error("移动处理错误:", e);
            clearTimeout(animationTimeout); // 清除超时保护
            isAnimating = false; // 确保动画状态重置
        }
    }
    
    // 创建移动路径上的幽灵方块
    function createMovementGhosts(tilesBeforeMove, direction) {
        tilesBeforeMove.forEach(tile => {
            const { r, c, value } = tile;
            
            // 找到新位置
            let newR = -1, newC = -1;
            let found = false;
            
            // 使用更可靠的方式查找移动后的位置
            if (direction === 'up') {
                for (let nr = 0; nr < r; nr++) {
                    if (board[nr][c] === value && !found) {
                        for (let i = 0; i < tilesBeforeMove.length; i++) {
                            const otherTile = tilesBeforeMove[i];
                            if (otherTile.r === nr && otherTile.c === c && otherTile.value === value) {
                                // 这是相同值的不同方块，不是移动结果
                                found = true;
                                break;
                            }
                        }
                        if (!found) {
                            newR = nr;
                            newC = c;
                            found = true;
                        }
                    }
                }
            } else if (direction === 'down') {
                for (let nr = 3; nr > r; nr--) {
                    if (board[nr][c] === value && !found) {
                        for (let i = 0; i < tilesBeforeMove.length; i++) {
                            const otherTile = tilesBeforeMove[i];
                            if (otherTile.r === nr && otherTile.c === c && otherTile.value === value) {
                                // 这是相同值的不同方块，不是移动结果
                                found = true;
                                break;
                            }
                        }
                        if (!found) {
                            newR = nr;
                            newC = c;
                            found = true;
                        }
                    }
                }
            } else if (direction === 'left') {
                for (let nc = 0; nc < c; nc++) {
                    if (board[r][nc] === value && !found) {
                        for (let i = 0; i < tilesBeforeMove.length; i++) {
                            const otherTile = tilesBeforeMove[i];
                            if (otherTile.r === r && otherTile.c === nc && otherTile.value === value) {
                                // 这是相同值的不同方块，不是移动结果
                                found = true;
                                break;
                            }
                        }
                        if (!found) {
                            newR = r;
                            newC = nc;
                            found = true;
                        }
                    }
                }
            } else if (direction === 'right') {
                for (let nc = 3; nc > c; nc--) {
                    if (board[r][nc] === value && !found) {
                        for (let i = 0; i < tilesBeforeMove.length; i++) {
                            const otherTile = tilesBeforeMove[i];
                            if (otherTile.r === r && otherTile.c === nc && otherTile.value === value) {
                                // 这是相同值的不同方块，不是移动结果
                                found = true;
                                break;
                            }
                        }
                        if (!found) {
                            newR = r;
                            newC = nc;
                            found = true;
                        }
                    }
                }
            }
            
            // 如果找到了新位置并且移动了超过一格
            const distance = getMovementDistance(r, c, newR, newC, direction);
            if (distance > 1) {
                try {
                    // 计算需要放置幽灵方块的位置
                    const ghostPositions = [];
                    
                    if (direction === 'up' || direction === 'down') {
                        const step = direction === 'up' ? -1 : 1;
                        for (let gr = r + step; gr !== newR; gr += step) {
                            if (gr >= 0 && gr < 4) { // 确保位置有效
                                ghostPositions.push({ r: gr, c });
                            }
                        }
                    } else { // left or right
                        const step = direction === 'left' ? -1 : 1;
                        for (let gc = c + step; gc !== newC; gc += step) {
                            if (gc >= 0 && gc < 4) { // 确保位置有效
                                ghostPositions.push({ r, c: gc });
                            }
                        }
                    }
                    
                    // 创建幽灵方块
                    ghostPositions.forEach(pos => {
                        const ghostIndex = pos.r * 4 + pos.c;
                        if (ghostIndex >= 0 && ghostIndex < 16) { // 确保索引有效
                            const cell = gameBoard.children[ghostIndex];
                            if (cell) {
                                const ghost = document.createElement('div');
                                ghost.classList.add('tile', `tile-${value}`, 'tile-ghost');
                                ghost.textContent = value;
                                cell.appendChild(ghost);
                            }
                        }
                    });
                } catch (e) {
                    console.error("幽灵方块创建错误:", e);
                    // 错误处理：继续游戏而不创建幽灵方块
                }
            }
        });
    }
    
    // 创建合并消除效果
    function createMergeRemoveEffects(mergedPositions) {
        try {
            // 遍历所有被合并的位置，找到它们的原始位置
            mergedPositions.forEach(pos => {
                // 确保位置信息完整
                if (!pos.hasOwnProperty('oldR') || !pos.hasOwnProperty('oldC')) {
                    return; // 跳过不完整的位置信息
                }
                
                // 确保索引在有效范围内
                const oldIndex = pos.oldR * 4 + pos.oldC;
                if (oldIndex < 0 || oldIndex >= 16) {
                    return; // 跳过无效索引
                }
                
                // 给被合并的方块添加消除动画
                const oldCell = gameBoard.children[oldIndex];
                if (oldCell) {
                    const oldTile = oldCell.querySelector('.tile');
                    if (oldTile) {
                        oldTile.classList.add('merge-remove');
                    }
                }
            });
        } catch (e) {
            console.error("合并消除效果错误:", e);
            // 错误处理：继续游戏而不创建消除效果
        }
    }
    
    // Calculate movement distance between two positions
    function getMovementDistance(r1, c1, r2, c2, direction) {
        if (r2 === -1 || c2 === -1) return 0; // 没有移动
        
        if (direction === 'up' || direction === 'down') {
            return Math.abs(r1 - r2);
        } else {
            return Math.abs(c1 - c2);
        }
    }
    
    // Add animation classes based on direction and movement distance
    function addMoveAnimationsWithDistance(direction, movementInfo) {
        try {
            movementInfo.forEach(info => {
                const { index, distance } = info;
                
                // 检查索引有效性
                if (index < 0 || index >= 16) return;
                
                const cell = gameBoard.children[index];
                if (!cell) return;
                
                const tile = cell.querySelector('.tile');
                
                if (tile && distance > 0) {
                    // 根据距离添加不同的动画类
                    if (distance === 1) {
                        tile.classList.add(`move-${direction}`);
                    } else if (distance === 2) {
                        tile.classList.add(`move-${direction}-2`);
                    } else if (distance >= 3) {
                        tile.classList.add(`move-${direction}-3`);
                    }
                }
            });
        } catch (e) {
            console.error("动画添加错误:", e);
            // 错误处理：继续游戏而不添加动画
        }
    }
    
    // Add animation classes based on direction
    function addMoveAnimations(direction) {
        const tiles = document.querySelectorAll('.tile');
        tiles.forEach(tile => {
            const cell = tile.parentElement;
            const index = Array.from(gameBoard.children).indexOf(cell);
            const row = Math.floor(index / 4);
            const col = index % 4;
            
            // 检查在移动方向上，该方块是否会移动（不是检查是否在边缘，而是检查是否实际会移动）
            let willMove = false;
            
            switch(direction) {
                case 'up':
                    // 检查上方是否有空位或可合并的方块
                    for (let r = row - 1; r >= 0; r--) {
                        const targetValue = board[r][col];
                        if (targetValue === 0) {
                            // 有空位，可以移动
                            willMove = true;
                            break;
                        } else if (targetValue === board[row][col]) {
                            // 可以合并，可以移动
                            willMove = true;
                            break;
                        } else {
                            // 被阻挡，不能移动
                            break;
                        }
                    }
                    break;
                    
                case 'down':
                    // 检查下方是否有空位或可合并的方块
                    for (let r = row + 1; r < 4; r++) {
                        const targetValue = board[r][col];
                        if (targetValue === 0) {
                            willMove = true;
                            break;
                        } else if (targetValue === board[row][col]) {
                            willMove = true;
                            break;
                        } else {
                            break;
                        }
                    }
                    break;
                    
                case 'left':
                    // 检查左侧是否有空位或可合并的方块
                    for (let c = col - 1; c >= 0; c--) {
                        const targetValue = board[row][c];
                        if (targetValue === 0) {
                            willMove = true;
                            break;
                        } else if (targetValue === board[row][col]) {
                            willMove = true;
                            break;
                        } else {
                            break;
                        }
                    }
                    break;
                    
                case 'right':
                    // 检查右侧是否有空位或可合并的方块
                    for (let c = col + 1; c < 4; c++) {
                        const targetValue = board[row][c];
                        if (targetValue === 0) {
                            willMove = true;
                            break;
                        } else if (targetValue === board[row][col]) {
                            willMove = true;
                            break;
                        } else {
                            break;
                        }
                    }
                    break;
            }
            
            // 只有当方块实际会移动时，才添加动画类
            if (willMove) {
                tile.classList.add(`move-${direction}`);
            }
        });
    }
    
    // Movement functions with tracking of merged positions
    function moveUp(mergedPositions, movementInfo) {
        let moved = false;
        
        for (let c = 0; c < 4; c++) {
            // Collapse column
            let column = [board[0][c], board[1][c], board[2][c], board[3][c]];
            let originalPositions = [0, 1, 2, 3]; // 跟踪原始位置
            
            // 记录移动前位置
            const originalColumn = [...column];
            
            // 调用改进的合并函数，同时记录原始位置
            let result = collapseAndTrackMergesWithOrigin(column, originalPositions, (r, oldR) => {
                mergedPositions.push({r, c, oldR, oldC: c});
            });
            
            // Check if the column changed
            const columnChanged = !arraysEqual(column, result.values);
            moved = moved || columnChanged;
            
            // 计算每个非零单元格的移动距离
            for (let r = 0; r < 4; r++) {
                if (originalColumn[r] !== 0) {
                    const newIdx = result.positions.indexOf(r);
                    if (newIdx !== -1) {
                        const distance = Math.abs(newIdx - r);
                        const index = r * 4 + c; // 原始索引
                        movementInfo.push({ index, distance });
                    }
                }
            }
            
            // Update the board with the result
            for (let r = 0; r < 4; r++) {
                board[r][c] = result.values[r];
            }
        }
        
        return moved;
    }
    
    function moveDown(mergedPositions, movementInfo) {
        let moved = false;
        
        for (let c = 0; c < 4; c++) {
            // Collapse column (reversed)
            let column = [board[3][c], board[2][c], board[1][c], board[0][c]];
            let originalPositions = [3, 2, 1, 0]; // 跟踪原始位置
            
            // 记录移动前位置
            const originalColumn = [board[0][c], board[1][c], board[2][c], board[3][c]];
            
            // 调用改进的合并函数，同时记录原始位置
            let result = collapseAndTrackMergesWithOrigin(column, originalPositions, (i, originalPos) => {
                // Convert the merged index to the original board position
                const r = 3 - i;
                const oldR = originalPos;
                mergedPositions.push({r, c, oldR, oldC: c});
            });
            
            // Check if the column changed
            const columnChanged = !arraysEqual(column, result.values);
            moved = moved || columnChanged;
            
            // 计算每个非零单元格的移动距离
            for (let r = 0; r < 4; r++) {
                if (originalColumn[r] !== 0) {
                    // 找到r在originalPositions中的索引
                    const originalIdx = originalPositions.indexOf(r);
                    if (originalIdx !== -1) {
                        // 找到原始位置在新结果中的索引
                        const newIdx = result.positions.indexOf(r);
                        if (newIdx !== -1) {
                            const distance = Math.abs(3 - newIdx - r);
                            const index = r * 4 + c; // 原始索引
                            movementInfo.push({ index, distance });
                        }
                    }
                }
            }
            
            // Update the board with the result (reversed)
            for (let r = 0; r < 4; r++) {
                board[3-r][c] = result.values[r];
            }
        }
        
        return moved;
    }
    
    function moveLeft(mergedPositions, movementInfo) {
        let moved = false;
        
        for (let r = 0; r < 4; r++) {
            // Collapse row
            let row = [...board[r]];
            let originalPositions = [0, 1, 2, 3]; // 跟踪原始位置
            
            // 记录移动前位置
            const originalRow = [...row];
            
            // 调用改进的合并函数，同时记录原始位置
            let result = collapseAndTrackMergesWithOrigin(row, originalPositions, (c, oldC) => {
                mergedPositions.push({r, c, oldR: r, oldC});
            });
            
            // Check if the row changed
            const rowChanged = !arraysEqual(row, result.values);
            moved = moved || rowChanged;
            
            // 计算每个非零单元格的移动距离
            for (let c = 0; c < 4; c++) {
                if (originalRow[c] !== 0) {
                    const newIdx = result.positions.indexOf(c);
                    if (newIdx !== -1) {
                        const distance = Math.abs(newIdx - c);
                        const index = r * 4 + c; // 原始索引
                        movementInfo.push({ index, distance });
                    }
                }
            }
            
            // Update the board with the result
            board[r] = result.values;
        }
        
        return moved;
    }
    
    function moveRight(mergedPositions, movementInfo) {
        let moved = false;
        
        for (let r = 0; r < 4; r++) {
            // Collapse row (reversed)
            let row = [...board[r]].reverse();
            let originalPositions = [3, 2, 1, 0]; // 跟踪原始位置
            
            // 记录移动前位置
            const originalRow = [...board[r]];
            
            // 调用改进的合并函数，同时记录原始位置
            let result = collapseAndTrackMergesWithOrigin(row, originalPositions, (i, originalPos) => {
                // Convert the merged index to the original board position
                const c = 3 - i;
                const oldC = originalPos;
                mergedPositions.push({r, c, oldR: r, oldC});
            });
            
            // Check if the row changed
            const rowChanged = !arraysEqual(row, result.values);
            moved = moved || rowChanged;
            
            // 计算每个非零单元格的移动距离
            for (let c = 0; c < 4; c++) {
                if (originalRow[c] !== 0) {
                    // 找到c在originalPositions中的索引
                    const originalIdx = originalPositions.indexOf(c);
                    if (originalIdx !== -1) {
                        // 找到原始位置在新结果中的索引
                        const newIdx = result.positions.indexOf(c);
                        if (newIdx !== -1) {
                            const distance = Math.abs(3 - newIdx - c);
                            const index = r * 4 + c; // 原始索引
                            movementInfo.push({ index, distance });
                        }
                    }
                }
            }
            
            // Update the board with the result (reversed)
            board[r] = result.values.reverse();
        }
        
        return moved;
    }
    
    // 改进的合并函数，同时跟踪原始位置
    function collapseAndTrackMergesWithOrigin(arr, positions, onMerge) {
        // Filter out zeros while maintaining positions
        let filtered = [];
        let filteredPositions = [];
        
        for (let i = 0; i < arr.length; i++) {
            if (arr[i] !== 0) {
                filtered.push(arr[i]);
                filteredPositions.push(positions[i]);
            }
        }
        
        // Merge adjacent equal values
        for (let i = 0; i < filtered.length - 1; i++) {
            if (filtered[i] === filtered[i+1]) {
                filtered[i] *= 2;
                score += filtered[i];
                scoreElement.textContent = score;
                
                // 记录被合并的方块的原始位置
                const originalPos = filteredPositions[i+1];
                
                // Call the onMerge callback with the position
                onMerge(i, originalPos);
                
                // Remove the merged tile
                filtered.splice(i+1, 1);
                filteredPositions.splice(i+1, 1);
            }
        }
        
        // Pad with zeros
        while (filtered.length < 4) {
            filtered.push(0);
            filteredPositions.push(-1); // 标记为无源位置
        }
        
        return { 
            values: filtered,
            positions: filteredPositions
        };
    }
    
    // Collapse an array of 4 values and track merged positions
    function collapseAndTrackMerges(arr, onMerge) {
        // Filter out zeros
        let filtered = arr.filter(val => val !== 0);
        
        // Merge adjacent equal values
        for (let i = 0; i < filtered.length - 1; i++) {
            if (filtered[i] === filtered[i+1]) {
                filtered[i] *= 2;
                filtered[i+1] = 0;
                score += filtered[i];
                scoreElement.textContent = score;
                
                // Call the onMerge callback with the position
                onMerge(i);
                
                i++; // Skip the next value (it's been merged)
            }
        }
        
        // Filter out zeros again (from merges)
        filtered = filtered.filter(val => val !== 0);
        
        // Pad with zeros
        while (filtered.length < 4) {
            filtered.push(0);
        }
        
        return filtered;
    }
    
    // Check if two arrays are equal
    function arraysEqual(arr1, arr2) {
        if (arr1.length !== arr2.length) return false;
        for (let i = 0; i < arr1.length; i++) {
            if (arr1[i] !== arr2[i]) return false;
        }
        return true;
    }
    
    // Check if two boards are equal
    function boardsEqual(board1, board2) {
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                if (board1[r][c] !== board2[r][c]) {
                    return false;
                }
            }
        }
        return true;
    }
    
    // Check if the game is over (no empty cells and no possible merges)
    function isGameOver() {
        // Check for empty cells
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                if (board[r][c] === 0) {
                    return false;
                }
            }
        }
        
        // Check for possible merges horizontally
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 3; c++) {
                if (board[r][c] === board[r][c+1]) {
                    return false;
                }
            }
        }
        
        // Check for possible merges vertically
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 4; c++) {
                if (board[r][c] === board[r+1][c]) {
                    return false;
                }
            }
        }
        
        // No empty cells and no possible merges
        return true;
    }
    
    // Event listeners
    document.addEventListener('keydown', handleKeyPress);
    newGameButton.addEventListener('click', initGame);
    themeSelect.addEventListener('change', (e) => applyTheme(e.target.value));
    
    // Add touch event listeners for mobile support
    gameBoard.addEventListener('touchstart', handleTouchStart, false);
    gameBoard.addEventListener('touchmove', handleTouchMove, false);
    gameBoard.addEventListener('touchend', handleTouchEnd, false);
    
    // Handle key presses
    function handleKeyPress(e) {
        switch (e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                e.preventDefault();
                move('up');
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                e.preventDefault();
                move('down');
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                e.preventDefault();
                move('left');
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                e.preventDefault();
                move('right');
                break;
        }
    }
    
    // Touch event handlers
    function handleTouchStart(e) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }
    
    function handleTouchMove(e) {
        // Prevent scrolling when swiping
        e.preventDefault();
    }
    
    function handleTouchEnd(e) {
        touchEndX = e.changedTouches[0].clientX;
        touchEndY = e.changedTouches[0].clientY;
        
        handleSwipe();
    }
    
    function handleSwipe() {
        const xDiff = touchEndX - touchStartX;
        const yDiff = touchEndY - touchStartY;
        
        // Check if the swipe is horizontal or vertical
        if (Math.abs(xDiff) > Math.abs(yDiff)) {
            // Horizontal swipe
            if (xDiff > 30) {
                move('right');
            } else if (xDiff < -30) {
                move('left');
            }
        } else {
            // Vertical swipe
            if (yDiff > 30) {
                move('down');
            } else if (yDiff < -30) {
                move('up');
            }
        }
    }
    
    // Initialize theme
    initTheme();
    
    // Start the game
    initGame();
}); 
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
    
    // Move tiles in a direction
    function move(direction) {
        if (gameOver) return;
        
        let moved = false;
        
        // Clone the board to check if it changes
        const oldBoard = JSON.parse(JSON.stringify(board));
        
        // Temporary board for calculations
        const tempBoard = JSON.parse(JSON.stringify(board));
        
        // Process the move based on direction
        switch (direction) {
            case 'up':
                for (let c = 0; c < 4; c++) {
                    // Collapse column
                    let column = [board[0][c], board[1][c], board[2][c], board[3][c]];
                    let result = collapse(column);
                    
                    // Update the board with the result
                    for (let r = 0; r < 4; r++) {
                        board[r][c] = result[r];
                    }
                }
                break;
                
            case 'down':
                for (let c = 0; c < 4; c++) {
                    // Collapse column (reversed)
                    let column = [board[3][c], board[2][c], board[1][c], board[0][c]];
                    let result = collapse(column);
                    
                    // Update the board with the result (reversed)
                    for (let r = 0; r < 4; r++) {
                        board[3-r][c] = result[r];
                    }
                }
                break;
                
            case 'left':
                for (let r = 0; r < 4; r++) {
                    // Collapse row
                    let row = board[r];
                    board[r] = collapse(row);
                }
                break;
                
            case 'right':
                for (let r = 0; r < 4; r++) {
                    // Collapse row (reversed)
                    let row = [...board[r]].reverse();
                    let result = collapse(row);
                    
                    // Update the board with the result (reversed)
                    board[r] = result.reverse();
                }
                break;
        }
        
        // Check if the board changed
        moved = !boardsEqual(oldBoard, board);
        
        // If the board changed, add a new tile
        if (moved) {
            addRandomTile();
            renderBoard();
            
            // Update best score if needed
            if (score > bestScore) {
                bestScore = score;
                bestScoreElement.textContent = bestScore;
                localStorage.setItem('bestScore', bestScore);
            }
            
            // Check for game over
            if (isGameOver()) {
                gameOver = true;
                alert('Game Over! No more moves available.');
            }
        }
    }
    
    // Collapse an array of 4 values (used for moving in all directions)
    function collapse(arr) {
        // Filter out zeros
        let filtered = arr.filter(val => val !== 0);
        
        // Merge adjacent equal values
        for (let i = 0; i < filtered.length - 1; i++) {
            if (filtered[i] === filtered[i+1]) {
                filtered[i] *= 2;
                filtered[i+1] = 0;
                score += filtered[i];
                scoreElement.textContent = score;
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
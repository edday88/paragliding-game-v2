// Select the Canvas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Canvas dimensions
const WIDTH = canvas.width;
const HEIGHT = canvas.height;

// Game Variables
let gameOver = false;
let score = 0;
let frameCount = 0;

// Paraglider Properties
const paraglider = {
    x: 100,               // Starting X position
    y: HEIGHT / 2,        // Starting Y position
    width: 40,
    height: 40,
    speedY: 0,
    gravity: 0.2,
    lift: -5,
    color: '#FF0000',     // Red color for paraglider
};

// Obstacles and Thermals
const obstacles = [];    // Array to hold mountains, cables, clouds
const thermals = [];

// Keyboard Controls
const keys = {
    up: false,
};

// Event Listeners for Key Presses
document.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowUp') keys.up = true;
});
document.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowUp') keys.up = false;
});

// Functions to Create Obstacles and Thermals
function createObstacle() {
    const obstacleTypes = ['mountain', 'cable', 'cloud'];
    const type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
    const x = WIDTH;
    let y, width, height;

    switch (type) {
        case 'mountain':
            y = HEIGHT - 50 - Math.random() * 100;
            width = 50 + Math.random() * 50;
            height = HEIGHT - y - 50;
            break;
        case 'cable':
            y = Math.random() * (HEIGHT - 200) + 50;
            width = 10;
            height = 100;
            break;
        case 'cloud':
            y = Math.random() * (HEIGHT / 2);
            width = 80;
            height = 40;
            break;
    }

    obstacles.push({ type, x, y, width, height });
}

function createThermal() {
    const x = WIDTH + Math.random() * 200;
    const y = Math.random() * (HEIGHT - 150) + 50;
    const width = 20;
    const height = 20;
    thermals.push({ x, y, width, height });
}

// Collision Detection Function
function isColliding(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Main Game Loop
function gameLoop() {
    if (!gameOver) {
        update();
        render();
        requestAnimationFrame(gameLoop);
    } else {
        renderGameOver();
    }
}

// Update Game State
function update() {
    frameCount++;

    // Handle Keyboard Input
    if (keys.up) {
        paraglider.speedY = paraglider.lift;
    }

    // Apply Gravity
    paraglider.speedY += paraglider.gravity;
    paraglider.y += paraglider.speedY;

    // Prevent Paraglider from going off-screen
    if (paraglider.y < 0) {
        paraglider.y = 0;
        paraglider.speedY = 0;
    }
    if (paraglider.y + paraglider.height > HEIGHT - 50) {
        paraglider.y = HEIGHT - 50 - paraglider.height;
        paraglider.speedY = 0;
        gameOver = true;
    }

    // Move Obstacles to the Left
    obstacles.forEach((obstacle, index) => {
        obstacle.x -= 3; // Adjust speed as needed
        if (obstacle.x + obstacle.width < 0) {
            obstacles.splice(index, 1);
        }
    });

    // Move Thermals to the Left
    thermals.forEach((thermal, index) => {
        thermal.x -= 3; // Same speed as obstacles
        if (thermal.x + thermal.width < 0) {
            thermals.splice(index, 1);
        }
    });

    // Create New Obstacles and Thermals Periodically
    if (frameCount % 100 === 0) {
        createObstacle();
    }
    if (frameCount % 150 === 0) {
        createThermal();
    }

    // Check for Collisions with Obstacles
    const paragliderRect = {
        x: paraglider.x,
        y: paraglider.y,
        width: paraglider.width,
        height: paraglider.height,
    };

    obstacles.forEach((obstacle) => {
        const obstacleRect = {
            x: obstacle.x,
            y: obstacle.y,
            width: obstacle.width,
            height: obstacle.height,
        };

        if (isColliding(paragliderRect, obstacleRect)) {
            gameOver = true;
        }
    });

    // Check for Thermals
    thermals.forEach((thermal, index) => {
        const thermalRect = {
            x: thermal.x,
            y: thermal.y,
            width: thermal.width,
            height: thermal.height,
        };

        if (isColliding(paragliderRect, thermalRect)) {
            paraglider.speedY = paraglider.lift;
            thermals.splice(index, 1);
            score += 10;
        }
    });

    // Update Score
    score += 1;
}

// Render Game Elements
function render() {
    // Clear the Canvas
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    // Draw Ground
    ctx.fillStyle = '#228B22'; // Forest Green
    ctx.fillRect(0, HEIGHT - 50, WIDTH, 50);

    // Draw Paraglider
    ctx.fillStyle = paraglider.color;
    ctx.fillRect(paraglider.x, paraglider.y, paraglider.width, paraglider.height);

    // Draw Obstacles
    obstacles.forEach((obstacle) => {
        switch (obstacle.type) {
            case 'mountain':
                ctx.fillStyle = '#8B4513'; // Brown
                ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
                break;
            case 'cable':
                ctx.fillStyle = '#000000'; // Black
                ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
                break;
            case 'cloud':
                ctx.fillStyle = '#D3D3D3'; // Light Gray
                ctx.beginPath();
                ctx.ellipse(obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height / 2, obstacle.width / 2, obstacle.height / 2, 0, 0, Math.PI * 2);
                ctx.fill();
                break;
        }
    });

    // Draw Thermals
    ctx.fillStyle = '#FF8C00'; // Dark Orange
    thermals.forEach((thermal) => {
        ctx.fillRect(thermal.x, thermal.y, thermal.width, thermal.height);
    });

    // Draw Score
    ctx.fillStyle = '#000000'; // Black
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 10, 30);
}

// Render Game Over Screen
function renderGameOver() {
    // Clear the Canvas
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    // Draw Ground
    ctx.fillStyle = '#228B22'; // Forest Green
    ctx.fillRect(0, HEIGHT - 50, WIDTH, 50);

    // Draw Game Over Text
    ctx.fillStyle = '#FF0000'; // Red
    ctx.font = '50px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over!', WIDTH / 2, HEIGHT / 2 - 50);

    // Draw Final Score
    ctx.fillStyle = '#000000'; // Black
    ctx.font = '30px Arial';
    ctx.fillText(`Final Score: ${score}`, WIDTH / 2, HEIGHT / 2);

    // Prompt to Restart
    ctx.font = '20px Arial';
    ctx.fillText('Refresh the page to play again.', WIDTH / 2, HEIGHT / 2 + 50);
}

// Start the Game Loop
gameLoop();

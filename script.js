const world = document.getElementById('world');
const circle = document.getElementById('circle');

const worldWidth = 3000;
const worldHeight = 2000;
const viewWidth = 1280;
const viewHeight = 720;

let x = worldWidth / 2; // Player's world X
let y = worldHeight / 2; // Player's world Y
const speed = 5;
let circleRadius = 25;

// WASD key state
const keys = { w: false, a: false, s: false, d: false };

const NUM_BALLS = 30; // Number of balls to spawn
const OTHER_BALL_RADIUS = 20;
const COLORS = ['red', 'green', 'orange', 'purple', 'yellow', 'pink', 'cyan', 'lime', 'magenta', 'gold', 'blue'];

// Function to get a random color
function getRandomColor() {
    return COLORS[Math.floor(Math.random() * COLORS.length)];
}

// Function to start or restart the game
function startGame() {
    // Set random color for player ball
    circle.style.background = getRandomColor();

    // Reset player size and position
    circleRadius = 25;
    x = worldWidth / 2;
    y = worldHeight / 2;
    circle.style.width = (circleRadius * 2) + 'px';
    circle.style.height = (circleRadius * 2) + 'px';

    // Reset score
    score = 0;
    document.getElementById('score').textContent = 'Score: 0';

    // Remove old balls and spawn new ones
    for (const ball of otherBalls) {
        if (ball.el.parentNode) ball.el.parentNode.removeChild(ball.el);
    }
    spawnOtherBalls();
}

// Score variable
let score = 0;

// Store references to other balls
let otherBalls = [];

let playerNumber = 1; // Player is always 1

// Function to create a ball at a random position
function spawnOtherBalls() {
    otherBalls = [];
    for (let i = 0; i < NUM_BALLS; i++) {
        const ball = document.createElement('div');
        ball.className = 'other-ball';
        const bx = Math.random() * (worldWidth - 50) + 25;
        const by = Math.random() * (worldHeight - 50) + 25;
        const vx = (Math.random() - 0.5) * 2;
        const vy = (Math.random() - 0.5) * 2;
        const radius = 25;
        const number = i + 2; // Player is 1, others are 2, 3, ...
        ball.dataset.number = number;
        ball.style.left = (bx - radius) + 'px';
        ball.style.top = (by - radius) + 'px';
        ball.style.width = (radius * 2) + 'px';
        ball.style.height = (radius * 2) + 'px';
        ball.style.background = COLORS[Math.floor(Math.random() * COLORS.length)];
        ball.style.opacity = 1;
        world.appendChild(ball);
        otherBalls.push({
            el: ball,
            x: bx,
            y: by,
            vx,
            vy,
            radius,
            eaten: false,
            number,
            score: 0 // Each ball has its own score
        });
    }
}

// Call this once at the start
spawnOtherBalls();

function update() {
    // Move player
    if (keys.w) y -= speed;
    if (keys.s) y += speed;
    if (keys.a) x -= speed;
    if (keys.d) x += speed;

    // Clamp player to world bounds
    x = Math.max(circleRadius, Math.min(worldWidth - circleRadius, x));
    y = Math.max(circleRadius, Math.min(worldHeight - circleRadius, y));

    // Player collision with AI balls
    for (const ball of otherBalls) {
        if (ball.eaten) continue;
        const dx = x - ball.x;
        const dy = y - ball.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < circleRadius + ball.radius) {
            // Player absorbs if bigger or same size
            if (circleRadius > ball.radius || (circleRadius === ball.radius)) {
                ball.eaten = true;
                ball.el.style.transition = 'opacity 0.5s';
                ball.el.style.opacity = 0;
                setTimeout(() => {
                    if (ball.el.parentNode) ball.el.parentNode.removeChild(ball.el);
                }, 500);
                // Increase player size and score
                circleRadius += Math.round(ball.radius * 0.2);
                circle.style.width = (circleRadius * 2) + 'px';
                circle.style.height = (circleRadius * 2) + 'px';
                score += 100;
                document.getElementById('score').textContent = 'Score: ' + score;
            }
            // Optionally, handle "death" if player is smaller
            // else if (circleRadius < ball.radius) { onPlayerDeath(); }
        }
    }

    // Move and handle AI ball collisions
    for (let i = 0; i < otherBalls.length; i++) {
        const ball = otherBalls[i];
        if (ball.eaten) continue;

        // Find the nearest other ball
        let nearest = null;
        let minDist = Infinity;
        for (let j = 0; j < otherBalls.length; j++) {
            if (i === j) continue;
            const other = otherBalls[j];
            if (other.eaten) continue;
            const dx = other.x - ball.x;
            const dy = other.y - ball.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < minDist) {
                minDist = dist;
                nearest = other;
            }
        }

        // Move towards the nearest ball if found
        if (nearest) {
            const dx = nearest.x - ball.x;
            const dy = nearest.y - ball.y;
            const length = Math.sqrt(dx * dx + dy * dy) || 1;
            const speed = 1.5; // AI ball speed
            ball.vx = (dx / length) * speed;
            ball.vy = (dy / length) * speed;
        }

        // Move ball
        ball.x += ball.vx;
        ball.y += ball.vy;

        // Bounce off world edges
        if (ball.x - ball.radius < 0 || ball.x + ball.radius > worldWidth) ball.vx *= -1;
        if (ball.y - ball.radius < 0 || ball.y + ball.radius > worldHeight) ball.vy *= -1;
        ball.x = Math.max(ball.radius, Math.min(worldWidth - ball.radius, ball.x));
        ball.y = Math.max(ball.radius, Math.min(worldHeight - ball.radius, ball.y));

        // Update DOM position and size
        ball.el.style.left = (ball.x - ball.radius) + 'px';
        ball.el.style.top = (ball.y - ball.radius) + 'px';
        ball.el.style.width = (ball.radius * 2) + 'px';
        ball.el.style.height = (ball.radius * 2) + 'px';

        // AI ball collision with other balls
        for (let j = 0; j < otherBalls.length; j++) {
            if (i === j) continue;
            const other = otherBalls[j];
            if (other.eaten) continue;
            const dx = ball.x - other.x;
            const dy = ball.y - other.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < ball.radius + other.radius) {
                // Absorb if this ball is bigger, or same size (first to touch wins)
                if (ball.radius > other.radius || (ball.radius === other.radius && i < j)) {
                    other.eaten = true;
                    other.el.style.transition = 'opacity 0.5s';
                    other.el.style.opacity = 0;
                    setTimeout(() => {
                        if (other.el.parentNode) other.el.parentNode.removeChild(other.el);
                    }, 500);
                    ball.radius += Math.round(other.radius * 0.2); // Grow by 20% of eaten ball's size
                    ball.score = (ball.score || 0) + 100; // Increase this ball's personal score
                }
            }
        }
    }

    // Center camera on player, clamp so world edges stay visible
    let camX = x - viewWidth / 2;
    let camY = y - viewHeight / 2;
    camX = Math.max(0, Math.min(worldWidth - viewWidth, camX));
    camY = Math.max(0, Math.min(worldHeight - viewHeight, camY));

    // Move world for camera effect
    world.style.left = -camX + 'px';
    world.style.top = -camY + 'px';

    // Position player in world
    circle.style.left = (x - circleRadius) + 'px';
    circle.style.top = (y - circleRadius) + 'px';

    updateSidebar();

    requestAnimationFrame(update);
}

// Key handlers
document.addEventListener('keydown', e => {
    if (e.key === 'w') keys.w = true;
    if (e.key === 'a') keys.a = true;
    if (e.key === 's') keys.s = true;
    if (e.key === 'd') keys.d = true;
});
document.addEventListener('keyup', e => {
    if (e.key === 'w') keys.w = false;
    if (e.key === 'a') keys.a = false;
    if (e.key === 's') keys.s = false;
    if (e.key === 'd') keys.d = false;
});

// Start loop
update();

// Call startGame() at the beginning
startGame();

// When the player dies, call startGame() to restart
function onPlayerDeath() {
    startGame();
}

function updateSidebar() {
    const sidebar = document.getElementById('sidebar');
    let html = `<b>Ball Numbers</b><ul style="padding-left:20px;">`;
    html += `<li>Player (1) - Score: ${score}</li>`;
    for (const ball of otherBalls) {
        if (!ball.eaten) {
            html += `<li>Ball ${ball.number} - Score: ${ball.score || 0}</li>`;
        }
    }
    html += `</ul>`;
    sidebar.innerHTML = html;
}
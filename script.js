const world = document.getElementById('world');
const circle = document.getElementById('circle');

const worldWidth = 12000; // was 8000
const worldHeight = 8000; // was 5000
const viewWidth = window.innerWidth;
const viewHeight = window.innerHeight;

let x = worldWidth / 2; // Player's world X
let y = worldHeight / 2; // Player's world Y
const speed = 2;
let circleRadius = 25; // Initial player radius

// WASD key state
const keys = { w: false, a: false, s: false, d: false };

const NUM_BALLS = 200; // Number of balls to spawn
const OTHER_BALL_RADIUS = 20;
const COLORS = ['red', 'green', 'orange', 'purple', 'yellow', 'pink', 'cyan', 'lime', 'magenta', 'gold', 'blue'];

const maxStretch = 1.35; // Max scale for squash/stretch
const minStretch = 0.75; // Min scale for squash/stretch

// Add a pool of random names (people, brands, pop culture, etc.)
const RANDOM_NAMES = [
    "Mario", "Sonic", "Zelda", "Tesla", "Apple", "Nike", "Goku", "Naruto", "Batman", "Iron Man", "Pepsi", "CocaCola",
    "Pikachu", "Yoda", "Barbie", "Optimus", "McQueen", "Elsa", "Shrek", "Minion", "Mario Kart", "Luffy", "Hermione",
    "Google", "Microsoft", "Amazon", "Starbucks", "Wolverine", "Thor", "Spock", "Mario Bros", "Luigi", "Bowser",
    "Pac-Man", "Lara Croft", "Kratos", "Master Chief", "Halo", "Fortnite", "Minecraft", "Among Us", "SpongeBob",
    "Rick", "Morty", "Darth Vader", "Chewbacca", "Buzz", "Woody", "Simba", "Mufasa", "Scar", "Joker", "Harley Quinn",
    "Venom", "Mario", "Link", "Samus", "Kirby", "Donkey Kong", "Ash", "Brock", "Misty", "Red", "Blue", "Charizard",
    "Squirtle", "Bulbasaur", "Pikachu", "Eevee", "Snorlax", "Mewtwo", "Gandalf", "Frodo", "Legolas", "Aragorn",
    "Sauron", "Thanos", "Loki", "Black Panther", "Captain Marvel", "Spider-Man", "Superman", "Wonder Woman", "Flash",
    "Aquaman", "Green Lantern", "Deadpool", "Wolverine", "Storm", "Magneto", "Professor X", "Ryu", "Ken", "Chun-Li",
    "Guile", "Blanka", "Dhalsim", "Honda", "Zangief", "Cammy", "Sagat", "Bison", "Balrog", "Vega", "Akuma"
];

// Function to get a random color
function getRandomColor() {
    return COLORS[Math.floor(Math.random() * COLORS.length)];
}

// Function to get a random name
function getRandomName() {
    return RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
}

// Score variable
let score = 0;

// Store references to other balls
let otherBalls = [];

let playerNumber = 1; // Player is always 1

// Function to create a ball at a random position
function spawnOtherBalls() {
    otherBalls = [];
    const minDist = 180; // Minimum distance between balls (increase for more separation)
    const maxTries = 1000; // Max attempts to place a ball

    for (let i = 0; i < NUM_BALLS; i++) {
        let tries = 0;
        let bx, by, valid;
        do {
            bx = Math.random() * (worldWidth - 50) + 25;
            by = Math.random() * (worldHeight - 50) + 25;
            valid = true;
            for (const other of otherBalls) {
                const dx = bx - other.x;
                const dy = by - other.y;
                if (Math.sqrt(dx * dx + dy * dy) < minDist) {
                    valid = false;
                    break;
                }
            }
            tries++;
        } while (!valid && tries < maxTries);

        const ball = document.createElement('div');
        ball.className = 'other-ball';
        const vx = 0;
        const vy = 0;
        const radius = 25;
        const number = i + 2;
        const randomName = getRandomName();
        ball.dataset.number = number;
        ball.dataset.name = randomName;
        ball.title = randomName;
        ball.style.left = (bx - radius) + 'px';
        ball.style.top = (by - radius) + 'px';
        ball.style.width = (radius * 2) + 'px';
        ball.style.height = (radius * 2) + 'px';
        ball.style.background = COLORS[Math.floor(Math.random() * COLORS.length)];
        ball.style.opacity = 1;
        ball.style.display = "flex";
        ball.style.alignItems = "center";
        ball.style.justifyContent = "center";
        ball.style.fontSize = "12px";
        ball.style.fontWeight = "bold";
        ball.style.color = "#fff";
        ball.textContent = randomName;
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
            name: randomName,
            score: 0
        });
    }
}

const NUM_FOOD = 100; // Number of food balls
let foodBalls = [];

// Function to create a food ball at a random position
function spawnFoodBall() {
    const food = document.createElement('div');
    food.className = 'food-ball';
    const radius = 7 + Math.random() * 5; // Tiny, random size
    const fx = Math.random() * (worldWidth - 2 * radius) + radius;
    const fy = Math.random() * (worldHeight - 2 * radius) + radius;
    food.style.left = (fx - radius) + 'px';
    food.style.top = (fy - radius) + 'px';
    food.style.width = (radius * 2) + 'px';
    food.style.height = (radius * 2) + 'px';
    food.style.background = COLORS[Math.floor(Math.random() * COLORS.length)];
    food.style.position = "absolute";
    food.style.borderRadius = "50%";
    food.style.boxShadow = "0 0 4px rgba(0,0,0,0.2)";
    food.style.pointerEvents = "none";
    world.appendChild(food);
    foodBalls.push({
        el: food,
        x: fx,
        y: fy,
        radius: radius
    });
}

// Spawn all food balls
function spawnAllFoodBalls() {
    // Remove old food balls
    for (const food of foodBalls) {
        if (food.el.parentNode) food.el.parentNode.removeChild(food.el);
    }
    foodBalls = [];
    for (let i = 0; i < NUM_FOOD; i++) {
        spawnFoodBall();
    }
}

// --- START SCREEN LOGIC ---
const startOverlay = document.getElementById('start-overlay');
const startBtn = document.getElementById('start-btn');
const playerNameInput = document.getElementById('player-name');
const playerColorInput = document.getElementById('player-color');

// Prevent game from starting until player chooses
let gameStarted = false;
let playerName = "";
let playerColor = "#00bfff";
let lastSidebarUpdate = 0;
let gameOver = false;

function showStartScreen() {
    startOverlay.style.display = "flex";
    playerNameInput.value = playerName || "";
    playerColorInput.value = playerColor || "#00bfff";
    playerNameInput.focus();
}
function hideStartScreen() {
    startOverlay.style.display = "none";
}

// When player clicks Start Game
startBtn.onclick = function() {
    const name = playerNameInput.value.trim();
    if (!name) {
        playerNameInput.focus();
        playerNameInput.style.borderColor = "red";
        setTimeout(() => playerNameInput.style.borderColor = "#aaa", 700);
        return;
    }
    playerName = name;
    playerColor = playerColorInput.value;
    hideStartScreen();
    gameStarted = true;
    // Remove any game over overlay if present
    const overlay = document.getElementById('game-over-overlay');
    if (overlay) overlay.remove();
    startGame();
    circle.classList.add('active');
};

// --- Modify startGame to use playerName and playerColor ---
function startGame() {
    // Set chosen color and name for player ball
    circle.style.background = playerColor;
    circle.textContent = playerName;
    circle.style.display = "flex";
    circle.style.alignItems = "center";
    circle.style.justifyContent = "center";
    circle.style.fontSize = "14px";
    circle.style.fontWeight = "bold";
    circle.style.color = "#fff";

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

    // Remove and respawn all food balls
    spawnAllFoodBalls();

    // Reset growth animation
    targetRadius = circleRadius;
    growAnimFrame = 0;
    growAnimTotal = 0;
    growAnimOvershoot = 1.15;
    gameOver = false;
    circle.style.display = '';

    // Start the game loop
    update();
}

// --- When the player dies, show start screen again ---
function showGameOver() {
    if (document.getElementById('game-over-overlay')) return;
    let overlay = document.createElement('div');
    overlay.id = 'game-over-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = 0;
    overlay.style.left = 0;
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.background = 'rgba(0,0,0,0.7)';
    overlay.style.display = 'flex';
    overlay.style.flexDirection = 'column';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.zIndex = 10000;
    overlay.style.opacity = 0;
    overlay.style.transition = 'opacity 0.7s ease';

    let msg = document.createElement('div');
    msg.textContent = 'Game Over';
    msg.style.color = '#fff';
    msg.style.fontSize = '64px';
    msg.style.fontWeight = 'bold';
    msg.style.marginBottom = '40px';

    let btn = document.createElement('button');
    btn.textContent = 'Restart';
    btn.style.fontSize = '32px';
    btn.style.padding = '20px 40px';
    btn.style.cursor = 'pointer';
    btn.onclick = () => {
        document.body.removeChild(overlay);
        showStartScreen();
    };

    overlay.appendChild(msg);
    overlay.appendChild(btn);
    document.body.appendChild(overlay);

    setTimeout(() => {
        overlay.style.opacity = 1;
    }, 10);
}

let targetRadius = circleRadius;
let growAnimFrame = 0;
let growAnimTotal = 0;
let growAnimOvershoot = 1.15; // 15% overshoot for bounce

function update() {
    // Move player only if not game over
    if (!gameOver) {
        if (keys.w) y -= speed;
        if (keys.s) y += speed;
        if (keys.a) x -= speed;
        if (keys.d) x += speed;

        // Clamp player to world bounds
        x = Math.max(circleRadius, Math.min(worldWidth - circleRadius, x));
        y = Math.max(circleRadius, Math.min(worldHeight - circleRadius, y));
    }

    // --- FIX: Calculate camX/camY before using them below ---
    let camX = x - viewWidth / 2;
    let camY = y - viewHeight / 2;
    camX = Math.max(0, Math.min(worldWidth - viewWidth, camX));
    camY = Math.max(0, Math.min(worldHeight - viewHeight, camY));
    // -------------------------------------------------------

    // Player collision with AI balls
    if (!gameOver) {
        for (const ball of otherBalls) {
            if (ball.eaten) continue;
            const dx = x - ball.x;
            const dy = y - ball.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < circleRadius + ball.radius) {
                if (circleRadius > ball.radius || (circleRadius === ball.radius)) {
                    // Player absorbs
                    ball.eaten = true;
                    ball.el.style.transition = 'opacity 0.5s';
                    ball.el.style.opacity = 0;
                    setTimeout(() => {
                        if (ball.el.parentNode) ball.el.parentNode.removeChild(ball.el);
                    }, 500);
                    const growBy = Math.round(ball.radius * 0.2);
                    targetRadius = circleRadius + growBy;
                    growAnimFrame = 0;
                    growAnimTotal = 20; // Animation frames (~0.33s at 60fps)
                    score += 100;
                    document.getElementById('score').textContent = 'Score: ' + score;
                } else if (circleRadius < ball.radius) {
                    // Player is eaten by a bigger ball
                    showGameOver();
                    circle.style.display = 'none';
                    gameOver = true;
                    break;
                }
            }
        }
    }

    // --- FOOD COLLISION ---
    for (let i = 0; i < foodBalls.length; i++) {
        const food = foodBalls[i];
        if (!food.el.parentNode) continue;
        const dx = x - food.x;
        const dy = y - food.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < circleRadius + food.radius) {
            if (food.el.parentNode) food.el.parentNode.removeChild(food.el);
            targetRadius = circleRadius + 2;
            growAnimFrame = 0;
            growAnimTotal = 10;
            score += 10;
            document.getElementById('score').textContent = 'Score: ' + score;
            foodBalls.splice(i, 1);
            spawnFoodBall();
            i--;
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
            const aiSpeed = 1.5; // Set a fixed speed for all AI balls
            ball.vx = (dx / length) * aiSpeed;
            ball.vy = (dy / length) * aiSpeed;
        }

        // Move ball
        ball.x += ball.vx;
        ball.y += ball.vy;

        // Bounce off world edges
        if (ball.x - ball.radius < 0 || ball.x + ball.radius > worldWidth) ball.vx *= -1;
        if (ball.y - ball.radius < 0 || ball.y + ball.radius > worldHeight) ball.vy *= -1;
        ball.x = Math.max(ball.radius, Math.min(worldWidth - ball.radius, ball.x));
        ball.y = Math.max(ball.radius, Math.min(worldHeight - ball.radius, ball.y));

        // Calculate if the ball is in or near the viewport (add a margin for smoother entry)
        const margin = 200; // px
        const inView =
            ball.x + ball.radius > camX - margin &&
            ball.x - ball.radius < camX + viewWidth + margin &&
            ball.y + ball.radius > camY - margin &&
            ball.y - ball.radius < camY + viewHeight + margin;

        if (inView) {
            ball.el.classList.add('active');
            ball.el.style.left = (ball.x - ball.radius) + 'px';
            ball.el.style.top = (ball.y - ball.radius) + 'px';
            ball.el.style.width = (ball.radius * 2) + 'px';
            ball.el.style.height = (ball.radius * 2) + 'px';
            ball.el.style.fontSize = Math.max(10, Math.min(28, Math.round(ball.radius * 0.7))) + "px";
            ball.el.style.transform = "";
        } else {
            ball.el.classList.remove('active');
        }

        // AI ball collision with other balls (keep this outside inView check)
        for (let j = 0; j < otherBalls.length; j++) {
            if (i === j) continue;
            const other = otherBalls[j];
            if (other.eaten) continue;
            const dx = ball.x - other.x;
            const dy = ball.y - other.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < ball.radius + other.radius) {
                if (ball.radius > other.radius || (ball.radius === other.radius && i < j)) {
                    other.eaten = true;
                    other.el.style.transition = 'opacity 0.5s';
                    other.el.style.opacity = 0;
                    setTimeout(() => {
                        if (other.el.parentNode) other.el.parentNode.removeChild(other.el);
                    }, 500);
                    ball.radius += Math.round(other.radius * 0.2);
                    ball.score = (ball.score || 0) + 100;
                }
            }
        }
    }

    // Center camera on player, clamp so world edges stay visible
    world.style.left = -camX + 'px';
    world.style.top = -camY + 'px';

    // Position player in world (player ball will be hidden after death)
    circle.style.left = (x - circleRadius) + 'px';
    circle.style.top = (y - circleRadius) + 'px';
    circle.classList.add('active');

    // Calculate player velocity (based on keys)
    let vx = 0, vy = 0;
    if (keys.w) vy -= speed;
    if (keys.s) vy += speed;
    if (keys.a) vx -= speed;
    if (keys.d) vx += speed;
    const playerVelocity = Math.sqrt(vx * vx + vy * vy);
    const playerStretch = Math.min(maxStretch, 1 + playerVelocity * 0.15);
    const playerSquash = Math.max(minStretch, 1 - playerVelocity * 0.10);
    const playerAngle = Math.atan2(vy, vx);

    circle.style.transform = ""; // Keep player upright

    // Animate player growth with a bounce effect
    if (circleRadius !== targetRadius) {
        growAnimFrame++;
        let t = growAnimFrame / growAnimTotal;
        if (t > 1) t = 1;
        let overshoot = growAnimOvershoot;
        let eased = t < 1
            ? (1 + (overshoot - 1) * Math.sin(Math.PI * t)) * t
            : 1;
        let newRadius = circleRadius + (targetRadius - circleRadius) * eased;
        if (t === 1) {
            circleRadius = targetRadius;
        } else {
            circleRadius = newRadius;
        }
        circle.style.width = (circleRadius * 2) + 'px';
        circle.style.height = (circleRadius * 2) + 'px';
        circle.style.fontSize = Math.max(12, Math.min(36, Math.round(circleRadius * 0.7))) + "px";
    }

    // Only update sidebar once per second
    const now = Date.now();
    if (now - lastSidebarUpdate > 1000) {
        updateSidebar();
        lastSidebarUpdate = now;
    }

    requestAnimationFrame(update);
}

// Key handlers
document.addEventListener('keydown', e => {
    if (gameOver) return;
    if (e.key === 'w') keys.w = true;
    if (e.key === 'a') keys.a = true;
    if (e.key === 's') keys.s = true;
    if (e.key === 'd') keys.d = true;
});
document.addEventListener('keyup', e => {
    if (gameOver) return;
    if (e.key === 'w') keys.w = false;
    if (e.key === 'a') keys.a = false;
    if (e.key === 's') keys.s = false;
    if (e.key === 'd') keys.d = false;
});

function updateSidebar() {
    const sidebar = document.getElementById('sidebar');
    let html = `<b>Ball Numbers</b><ul>`;
    html += `<li class="player">${playerName ? playerName : "Player"} <span style="margin-left:auto;">${score}</span></li>`;
    for (const ball of otherBalls) {
        if (!ball.eaten) {
            html += `<li>${ball.name} <span style="margin-left:auto;">${ball.score || 0}</span></li>`;
        }
    }
    html += `</ul>`;
    sidebar.innerHTML = html;
}

// --- On load, show start screen ---
window.onload = function() {
    showStartScreen();
};
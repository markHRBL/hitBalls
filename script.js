const canvas = document.querySelector('canvas'),
    c = canvas.getContext('2d');

canvas.width = innerWidth;
canvas.height = innerHeight;

const scoreElem = document.getElementById('scoreElem'),
    bestScoreElem = document.getElementById('bestScoreElem');

class Player {
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
    }

    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
        c.closePath();
    }
}

class Projectile {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;

    }

    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
        c.closePath();
    }

    update() {
        this.draw();

        this.x += this.velocity.x;
        this.y += this.velocity.y;
    }
}

class Enemy {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }

    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
        c.closePath();
    }

    update() {
        this.draw();

        this.x += this.velocity.x;
        this.y += this.velocity.y;
    }
}

const friction = 0.99;
class Particle {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.alpha = 1;
    }

    draw() {
        c.save();
        c.globalAlpha = this.alpha;
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
        c.closePath();
        c.restore();
    }

    update() {
        this.draw();

        this.velocity.x *= friction;
        this.velocity.y *= friction;

        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.alpha -= 0.01;
    }
}

const x = canvas.width / 2,
    y = canvas.height / 2;

const player = new Player(x, y, 15, 'white'),
    projectiles = [],
    enemies = [],
    particles = [];

function spawnEnemies() {
    setInterval(() => {
        const radius = Math.random() * (30 - 10) + 10;
        let x, y;

        if (Math.random() < 0.5) { 
            x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
            y = Math.random() * canvas.height;
            //y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
        } else {
            x = Math.random() * canvas.width;
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
        }

        const color = `hsl(${Math.random() * 360}, 50%, 50%)`,
            angle = Math.atan2(canvas.height / 2 - y,
                canvas.width / 2 - x),
            velocity = {
                x: Math.cos(angle) * 1.5,
                y: Math.sin(angle) * 1.5
            },
            enemy = new Enemy(x, y, radius, color, velocity);
        
        enemies.push(enemy);
    }, 700);
}

function setScore(value) {
    score += value;
    scoreElem.innerText = score;
}

let animationId;
let score = 0;
bestScoreElem.innerText = Number(localStorage.getItem('bestScore'));
function animate() {
    animationId = requestAnimationFrame(animate);
    c.fillStyle = 'rgba(0, 0, 0, 0.1)';
    c.fillRect(0, 0, canvas.width, canvas.height);
    player.draw();

    particles.forEach((particle, index) => {
        if (particle.alpha <= 0) {
            particles.splice(index, 1);
        } else {
            particle.update();
        }
    });

    projectiles.forEach((projectile, index) => {
        projectile.update();

        if (projectile.x + projectile.radius < 0 ||
            projectile.x - projectile.radius > canvas.width ||
            projectile.y + projectile.radius < 0 ||
            projectile.y - projectile.radius > canvas.height) {
            setTimeout(() => projectiles.splice(index, 1), 0);
        }
    });

    enemies.forEach((enemy, index) => {
        enemy.update();

        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);

        if (dist - enemy.radius - player.radius < 1) {
            cancelAnimationFrame(animationId);
            if (score > Number(localStorage.getItem('bestScore'))) {
                localStorage.setItem('bestScore', score);
            }
            location.reload();
        }
        
        // colition with enemy
        projectiles.forEach((projectile, projectileIndex) => {
            const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);

            if (dist - enemy.radius - projectile.radius < 1) {
                setScore(10);

                for (let i = 0; i < enemy.radius * 2; i++) {
                    particles.push(new Particle(projectile.x, projectile.y,
                        Math.random() * 2, enemy.color, { x: (Math.random() - 0.5) * (Math.random() * 8), y: (Math.random() - 0.5) * (Math.random() * 8) }));
                }
                
                if (enemy.radius - 10 > 10) {
                    gsap.to(enemy, {
                        radius: enemy.radius - 10
                    });
                    setTimeout(() => {
                        projectiles.splice(projectileIndex, 1);
                    }, 0);
                } else {
                    setTimeout(() => {
                        setScore(90);
                        enemies.splice(index, 1);
                        projectiles.splice(projectileIndex, 1);
                    }, 0);
                }
            }
        });
    });
}

addEventListener('click', e => {
    const angle = Math.atan2(e.clientY - canvas.height / 2,
        e.clientX - canvas.width / 2),
        velocity = {
            x: Math.cos(angle) * 4,
            y: Math.sin(angle) * 4
        };

    const projectile = new Projectile(
        canvas.width / 2, 
        canvas.height / 2, 
        5, 
        'white', 
        {
            x: velocity.x,
            y: velocity.y
        }
    );

    projectiles.push(projectile);
});

addEventListener('resize', () => {
    location.reload();
});

animate();
spawnEnemies();

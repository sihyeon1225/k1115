async function loadTexture(path) {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = path;
        img.onload = () => {
            resolve(img);
        };
    });
}

let canvas, ctx, heroImg, enemyImg, backgroundImg;
let playerX, playerY;
const PLAYER_SPEED = 5;
const AUXILIARY_SCALE = 0.5; // 보조 우주선 크기 비율
let enemies = []; // 적의 위치를 저장하는 배열
let lastLaserTime = 0; // 마지막 레이저 발사 시각
const LASER_COOLDOWN = 300; // 레이저 발사 쿨타임 (0.3초 = 300 밀리초)
let laserRed; // 레이저 이미지를 저장할 변수
let laserGreenShot; // 레이저 피격 이펙트를 저장할 변수

function gameLoop() {
    drawGame();
    requestAnimationFrame(gameLoop); // 다음 프레임 호출
}

window.onload = async () => {
    canvas = document.getElementById("myCanvas");
    ctx = canvas.getContext("2d");

    backgroundImg = await loadTexture('assets/starBackground.png');
    heroImg = await loadTexture('assets/player.png');
    enemyImg = await loadTexture('assets/enemyShip.png');
    laserGreenShot = await loadTexture('assets/laserGreenShot.png'); 

    playerX = canvas.width / 2 - 45;
    playerY = canvas.height - (canvas.height / 6);

    // 초기 적 생성
    createEnemies2(ctx, canvas, enemyImg);

    // 레이저 이미지 로드
    laserRed = await loadTexture('assets/laserRed.png'); // 'laserRed.png' 로드 (경로는 상황에 맞게 조정)
    // 게임 루프 시작
    gameLoop();
};

// 플레이어 및 보조 우주선 그리기 함수
function drawPlayer() {
    ctx.drawImage(heroImg, playerX, playerY);

    // 보조 우주선 크기 계산
    const auxiliaryWidth = heroImg.width * AUXILIARY_SCALE;
    const auxiliaryHeight = heroImg.height * AUXILIARY_SCALE;

    // 왼쪽 보조 우주선
    ctx.drawImage(heroImg, playerX - auxiliaryWidth - 20, playerY + (heroImg.height - auxiliaryHeight) / 2, auxiliaryWidth, auxiliaryHeight);

    // 오른쪽 보조 우주선
    ctx.drawImage(heroImg, playerX + heroImg.width + 20, playerY + (heroImg.height - auxiliaryHeight) / 2, auxiliaryWidth, auxiliaryHeight);
}

// 적의 속도와 방향을 설정하는 함수
function createEnemies2(ctx, canvas, enemyImg) {
    enemies = []; // 새 적 배열 초기화
    const ROWS = 5;
    const COLS = 5;
    const START_X = canvas.width / 2;
    const START_Y = 100;
    const SPACING_X = enemyImg.width + 10;
    const SPACING_Y = enemyImg.height + 15;

    for (let row = 0; row < ROWS; row++) {
        const numEnemies = COLS - row * 1;
        const offsetX = (COLS - numEnemies) * SPACING_X / 2;

        for (let col = 0; col < numEnemies; col++) {
            const x = START_X - (COLS / 2) * SPACING_X + offsetX + col * SPACING_X;
            const y = START_Y + row * SPACING_Y;

            // 각 적에게 랜덤 속도와 방향을 추가
            const speed = Math.random() * 2 + 1; // 1 ~ 3 속도 범위
            const directionX = Math.random() < 0.5 ? -1 : 1; // 좌우 랜덤 방향
            const directionY = Math.random() < 0.5 ? -1 : 1; // 상하 랜덤 방향

            // 적 객체에 체력과 이동 속도 추가
            enemies.push({
                x: x,
                y: y,
                width: enemyImg.width,
                height: enemyImg.height,
                health: 3, // 기본 체력 3칸
                speed: speed,
                directionX: directionX,
                directionY: directionY
            });

            ctx.drawImage(enemyImg, x, y);
        }
    }
}

// 적의 이동 및 화면 경계 체크 함수
function moveEnemies() {
    enemies.forEach(enemy => {
        // 이동 계산
        enemy.x += enemy.speed * enemy.directionX;
        enemy.y += enemy.speed * enemy.directionY;

        // 화면을 벗어나지 않도록 경계 체크
        if (enemy.x <= 0 || enemy.x + enemy.width >= canvas.width) {
            enemy.directionX *= -1; // 화면 좌우 경계를 넘으면 방향 반전
        }

        if (enemy.y <= 0 || enemy.y + enemy.height >= canvas.height) {
            enemy.directionY *= -1; // 화면 상하 경계를 넘으면 방향 반전
        }
    });
}
// 적의 체력바를 그리는 함수
function drawHealthBars(ctx) {
    const BAR_WIDTH = 40; // 체력바의 길이
    const BAR_HEIGHT = 5; // 체력바의 높이
    const BAR_OFFSET = 5; // 체력바의 위치 (적 이미지 위에 위치)

    enemies.forEach(enemy => {
        const healthPercentage = enemy.health / 3; // 체력 비율 계산
        const healthBarWidth = BAR_WIDTH * healthPercentage; // 체력에 맞는 바 길이
        
        // 체력바 배경 (회색)
        ctx.fillStyle = 'gray';
        ctx.fillRect(enemy.x + (enemy.width - BAR_WIDTH) / 2, enemy.y - BAR_OFFSET, BAR_WIDTH, BAR_HEIGHT);

        // 체력에 따른 체력바 전경 색상 설정 (초록, 노랑, 빨강)
        if (enemy.health === 3) {
            ctx.fillStyle = 'green'; // 3칸 체력일 때 초록색
        } else if (enemy.health === 2) {
            ctx.fillStyle = 'yellow'; // 2칸 체력일 때 노란색
        } else if (enemy.health === 1) {
            ctx.fillStyle = 'red'; // 1칸 체력일 때 빨간색
        } else {
            ctx.fillStyle = 'black'; // 체력이 0 이하일 때는 검은색 (삭제된 적 표시)
        }

        // 체력바 전경 (초록색, 노랑색, 빨간색 등)
        ctx.fillRect(enemy.x + (enemy.width - BAR_WIDTH) / 2, enemy.y - BAR_OFFSET, healthBarWidth, BAR_HEIGHT);
    });
}


// 레이저와 적의 충돌 처리 후 체력바 업데이트
function updateLasers() {
    lasers = lasers.filter(laser => {
        laser.y -= LASER_SPEED; // 레이저 이동

        for (let i = 0; i < enemies.length; i++) {
            if (isColliding(laser, enemies[i])) {
                // 레이저가 적에 맞을 때 레이저 피격 이펙트 그리기
                ctx.drawImage(laserGreenShot, enemies[i].x, enemies[i].y, laserGreenShot.width, laserGreenShot.height);

                enemies[i].health -= 3; // 메인 비행기 레이저는 3칸 체력 감소

                if (enemies[i].health <= 0) {
                    enemies.splice(i, 1); // 체력이 0 이하인 적 제거
                    i--; // 배열 인덱스 보정
                }
                
                return false; // 해당 레이저 제거
            }
        }
        return laser.y > 0; // 화면 밖으로 나간 레이저 제거
    });
}
// 보조 비행기의 레이저 자동 발사 함수
function updateAuxiliaryLasers() {
    auxiliaryLasers = auxiliaryLasers.filter(laser => {
        laser.y -= LASER_SPEED; // 레이저 이동

        for (let i = 0; i < enemies.length; i++) {
            if (isColliding(laser, enemies[i])) {
                // 레이저가 적에 맞을 때 레이저 피격 이펙트 그리기
                ctx.drawImage(laserGreenShot, enemies[i].x, enemies[i].y, laserGreenShot.width, laserGreenShot.height);

                enemies[i].health -= 1; // 보조 비행기 레이저는 1칸 체력 감소

                if (enemies[i].health <= 0) {
                    enemies.splice(i, 1); // 체력이 0 이하인 적 제거
                    i--; // 배열 인덱스 보정
                }
                return false; // 해당 레이저 제거
            }
        }
        return laser.y > 0; // 화면 밖으로 나간 레이저 제거
    });
}

// 화면에 적 그리기 및 체력바 그리기
function drawEnemies(ctx) {
    enemies.forEach(enemy => {
        // 적 그리기
        ctx.drawImage(enemyImg, enemy.x, enemy.y);
    });

    // 체력바 그리기
    drawHealthBars(ctx);
}


// 충돌 감지 함수
// 충돌 감지 함수
function isColliding(rect1, rect2) {
    return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
    );
}

// 플레이어와 적 충돌 확인
function checkCollision() {
    const player = {
        x: playerX,
        y: playerY,
        width: heroImg.width,
        height: heroImg.height,
    };

    for (const enemy of enemies) {
        if (isColliding(player, enemy)) {
            alert("Game Over!"); // 충돌 시 알림
            resetGame(); // 게임 초기화
            break;
        }
    }
}

// 게임 초기화 함수
function resetGame() {
    playerX = canvas.width / 2 - 45;
    playerY = canvas.height - (canvas.height / 6);
    createEnemies2(ctx, canvas, enemyImg);
    drawGame();
}

// 키보드 입력에 따른 플레이어 이동 처리
let lasers = []; // 레이저를 저장하는 배열
const LASER_SPEED = 15; // 레이저 속도
const LASER_WIDTH = 5; // 레이저 너비
const LASER_HEIGHT = 20; // 레이저 높이

// 레이저 그리기 함수 수정
function drawLasers() {
    lasers.forEach(laser => {
        ctx.drawImage(laserRed, laser.x, laser.y, laser.width, laser.height); // 이미지로 레이저 그리기
    });
}

// 레이저 발사 함수 수정
function shootLaser() {
    const currentTime = Date.now();

    // 마지막 레이저 발사 후 쿨타임이 지난 경우에만 발사
    if (currentTime - lastLaserTime >= LASER_COOLDOWN) {
        lasers.push({
            x: playerX + heroImg.width / 2 - laserRed.width / 2, // 레이저 이미지 중심에 맞추기
            y: playerY - laserRed.height,
            width: laserRed.width,
            height: laserRed.height,
        });

        lastLaserTime = currentTime; // 레이저 발사 후 시간을 기록
    }
}

let isMovingLeft = false;
let isMovingRight = false;
let isMovingUp = false;
let isMovingDown = false;
let isShooting = false;

window.addEventListener('keydown', (e) => {
    // 방향키 입력이 있을 때 페이지 스크롤 방지
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault(); // 기본 스크롤 동작 방지
    }
    // 이동 처리
    if (e.key === 'ArrowLeft' && playerX > 0) isMovingLeft = true;
    if (e.key === 'ArrowRight' && playerX < canvas.width - heroImg.width) isMovingRight = true;
    if (e.key === 'ArrowUp' && playerY > 0) isMovingUp = true;
    if (e.key === 'ArrowDown' && playerY < canvas.height - heroImg.height) isMovingDown = true;

    // 레이저 발사 처리
    if (e.key === ' ' && !isShooting) {
        shootLaser(); 
        isShooting = true;
    }

    // Z 키로 빔 발사
    if (e.key === 'z') {
        const currentTime = Date.now();
        
        // 빔의 쿨타임이 지난 후 발사
        if (currentTime - lastBeamTime >= BEAM_COOLDOWN) {
            beamStartX = playerX + heroImg.width / 2 - BEAM_WIDTH / 2; // 빔 시작 X
            beamStartY = playerY - BEAM_LENGTH; // 빔 시작 Y (플레이어 위쪽에서 시작)
            isBeamActive = true;
            lastBeamTime = currentTime;
        }
    }
});


window.addEventListener('keyup', (e) => {
    // 키에서 손을 떼면 이동 멈추기
    if (e.key === 'ArrowLeft') isMovingLeft = false;
    if (e.key === 'ArrowRight') isMovingRight = false;
    if (e.key === 'ArrowUp') isMovingUp = false;
    if (e.key === 'ArrowDown') isMovingDown = false;
    
    // 레이저 발사 중지
    if (e.key === ' ') {
        isShooting = false; // 레이저 발사 완료
    }
});

// 게임 루프에서 이동 처리
function updateMovement() {
    if (isMovingLeft) playerX -= PLAYER_SPEED;
    if (isMovingRight) playerX += PLAYER_SPEED;
    if (isMovingUp) playerY -= PLAYER_SPEED;
    if (isMovingDown) playerY += PLAYER_SPEED;
}

let auxiliaryLasers = []; // 보조 비행기의 레이저를 저장할 배열
const AUXILIARY_LASER_COOLDOWN = 500; // 보조 비행기의 레이저 쿨타임 (0.5초)
let lastAuxiliaryLaserTime = 0; // 마지막 보조 비행기 레이저 발사 시간

// 보조 비행기의 레이저 자동 발사 함수
// 보조 비행기의 레이저 자동 발사 함수
function autoShootAuxiliaryLasers() {
    const currentTime = Date.now();

    // 보조 비행기 레이저 발사 간격 체크
    if (currentTime - lastAuxiliaryLaserTime >= AUXILIARY_LASER_COOLDOWN) {
        const auxiliaryWidth = heroImg.width * AUXILIARY_SCALE;
        const auxiliaryHeight = heroImg.height * AUXILIARY_SCALE;

        // 왼쪽 보조 우주선의 레이저
        auxiliaryLasers.push({
            x: playerX - auxiliaryWidth - 20 + 20, // 왼쪽 보조 비행기에서 발사
            y: playerY + (heroImg.height - auxiliaryHeight) / 2 - 10,
            width: 5,
            height: 15,
            color: 'yellow',
            hitCount: 0, // 레이저 적중 횟수
        });

        // 오른쪽 보조 우주선의 레이저
        auxiliaryLasers.push({
            x: playerX + heroImg.width + 50 - 10, // 오른쪽 보조 비행기에서 발사
            y: playerY + (heroImg.height - auxiliaryHeight) / 2 - 10,
            width: 5,
            height: 15,
            color: 'yellow',
            hitCount: 0, // 레이저 적중 횟수
        });

        lastAuxiliaryLaserTime = currentTime; // 레이저 발사 후 시간 기록
    }
}

// 보조 비행기 레이저 그리기
function drawAuxiliaryLasers() {
    auxiliaryLasers.forEach(laser => {
        ctx.fillStyle = laser.color; // 레이저 색상 설정 (노란색)
        ctx.fillRect(laser.x, laser.y, laser.width, laser.height);
    });
}

let isBeamActive = false;  // 빔이 활성화된 상태인지 확인
let beamStartX = 0;        // 빔의 시작 X 위치
let beamStartY = 0;        // 빔의 시작 Y 위치
const BEAM_WIDTH = 30;      // 빔의 너비
const BEAM_LENGTH = 900;    // 빔의 길이 (화면에서 빔이 얼마나 뻗을지)
const BEAM_COOLDOWN = 30000; // 빔의 쿨타임 (3초)
let lastBeamTime = 0;       // 마지막 빔 발사 시간
let beamAlpha = 1; // 빔의 초기 알파 값 (완전 불투명)
let beamDuration = 1000; // 빔의 지속 시간 (3초)
let beamStartTime = 0; // 빔이 시작된 시간



function updateBeam() {
    if (isBeamActive) {
        // 빔이 시작된 시간 기록
        if (beamStartTime === 0) {
            beamStartTime = Date.now();
        }

        // 빔이 서서히 사라지도록 알파 값 조정
        const elapsedTime = Date.now() - beamStartTime;
        beamAlpha = Math.max(1 - elapsedTime / beamDuration, 0); // 시간이 지나면서 알파 값이 0으로 줄어듦

        // 빔을 화면에 그리기
        ctx.save(); // 현재 상태를 저장

        ctx.globalAlpha = beamAlpha; // 알파 값 설정
        ctx.fillStyle = "blue"; // 빔의 색상
        ctx.fillRect(beamStartX, beamStartY, BEAM_WIDTH, BEAM_LENGTH);

        // 빔과 적의 충돌 처리
        for (let i = 0; i < enemies.length; i++) {
            const enemy = enemies[i];
            ctx.drawImage(laserGreenShot, enemies[i].x, enemies[i].y, laserGreenShot.width, laserGreenShot.height);

            // 빔이 적의 영역을 지나갈 때 충돌 확인
            if (
                enemy.y < beamStartY + BEAM_LENGTH && 
                enemy.y + enemyImg.height > beamStartY && 
                enemy.x + enemyImg.width > beamStartX && 
                enemy.x < beamStartX + BEAM_WIDTH
            ) {
                // 충돌한 적 제거
                enemies.splice(i, 1); // 적 배열에서 해당 적을 제거
                i--; // 배열 인덱스 보정
            }
        }

        ctx.restore(); // 상태 복원

        // 빔이 일정 시간이 지나면 비활성화
        if (elapsedTime >= beamDuration) {
            isBeamActive = false; 
            beamAlpha = 1; // 알파 값 초기화
            beamStartTime = 0; // 시간 초기화
        }
    }
}

function drawGame() {
    ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height); // 배경 그리기
    drawPlayer(); // 플레이어 그리기
    updateLasers(); // 플레이어 레이저 업데이트
    drawLasers(); // 플레이어 레이저 그리기
    autoShootAuxiliaryLasers(); // 자동으로 보조 비행기 레이저 발사
    updateAuxiliaryLasers(); // 보조 비행기 레이저 업데이트
    drawAuxiliaryLasers(); // 보조 비행기 레이저 그리기
    updateMovement(); // 이동 처리
    updateBeam(); // 빔 상태 업데이트
    moveEnemies(); // 적 이동 처리
    drawEnemies(ctx); // 적과 체력바 그리기
    checkCollision(); // 플레이어와 적 충돌 확인
}

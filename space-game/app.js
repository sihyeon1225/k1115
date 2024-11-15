function loadTexture(path) {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = path;
        img.onload = () => {
            resolve(img);
        };
    });
}

let canvas, ctx, heroImg, enemyImg, backgroundImg;
let playerX, playerY; // 플레이어 위치 변수
const PLAYER_SPEED = 10; // 플레이어 이동 속도
const AUXILIARY_SCALE = 0.5; // 보조 우주선 크기 비율

window.onload = async () => {
    canvas = document.getElementById("myCanvas");
    ctx = canvas.getContext("2d");

    // 이미지 로드
    backgroundImg = await loadTexture('assets/starBackground.png');
    heroImg = await loadTexture('assets/player.png');
    enemyImg = await loadTexture('assets/enemyShip.png');

    // 플레이어 초기 위치 설정
    playerX = canvas.width / 2 - 45;
    playerY = canvas.height - (canvas.height / 4);

    // 첫 번째 화면 그리기
    drawGame();
};

// 게임 화면을 그리는 함수
function drawGame() {
    // 배경 이미지 그리기
    ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);

    // 플레이어 및 보조 우주선 그리기
    drawPlayer();

    // 적 생성
    createEnemies2(ctx, canvas, enemyImg);
}

// 플레이어 및 보조 우주선 그리기 함수
function drawPlayer() {
    // 플레이어 우주선 그리기
    ctx.drawImage(heroImg, playerX, playerY);

    // 보조 우주선 크기 계산
    const auxiliaryWidth = heroImg.width * AUXILIARY_SCALE;
    const auxiliaryHeight = heroImg.height * AUXILIARY_SCALE;

    // 왼쪽 보조 우주선
    ctx.drawImage(heroImg, playerX - auxiliaryWidth - 20, playerY + (heroImg.height - auxiliaryHeight) / 2, auxiliaryWidth, auxiliaryHeight);

    // 오른쪽 보조 우주선
    ctx.drawImage(heroImg, playerX + heroImg.width + 20, playerY + (heroImg.height - auxiliaryHeight) / 2, auxiliaryWidth, auxiliaryHeight);
}

// 적 생성 함수 (역삼각형 형태)
function createEnemies2(ctx, canvas, enemyImg) {
    const ROWS = 5; // 적의 행 수
    const COLS = 5; // 최대 열 수
    const START_X = canvas.width / 2; // 캔버스 중앙
    const START_Y = 50; // 적 배치 시작 Y 좌표
    const SPACING_X = enemyImg.width + 5; // 적 간의 가로 간격
    const SPACING_Y = enemyImg.height + 10; // 적 간의 세로 간격

    for (let row = 0; row < ROWS; row++) {
        const numEnemies = COLS - row * 1; // 줄마다 적의 수가 줄어듦
        const offsetX = (COLS - numEnemies) * SPACING_X / 2; // 중앙 정렬을 위한 오프셋

        for (let col = 0; col < numEnemies; col++) {
            const x = START_X - (COLS / 2) * SPACING_X + offsetX + col * SPACING_X;
            const y = START_Y + row * SPACING_Y;
            ctx.drawImage(enemyImg, x, y);
        }
    }
}

// 키보드 입력에 따른 플레이어 이동 처리
window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' && playerX > 0) {
        // 왼쪽 이동
        playerX -= PLAYER_SPEED;
    }
    if (e.key === 'ArrowRight' && playerX < canvas.width - heroImg.width) {
        // 오른쪽 이동
        playerX += PLAYER_SPEED;
    }
    drawGame(); // 새로운 위치에 플레이어 및 보조 우주선 그리기
});

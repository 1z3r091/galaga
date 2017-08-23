var game = new Phaser.Game(400, 400, Phaser.AUTO, 'my_galaga', { preload: preload, create: create, update: update });

function preload()
{
    
    // a. 브라우저에 화면이 다 보일 수 있게 scaling
	// b. 필요한 이미지 로드
    game.load.image('player', 'assets/player.png');
    game.load.image('bullet', 'assets/bullet.png');
    game.load.image('enemy_bullet', 'assets/enemy-bullet.png');
    game.load.image('background', 'assets/starfield.png');
    game.load.spritesheet('boom', 'assets/explode.png', 100, 100);
    
	// c. 적군 이미지 로드 
    game.load.image('invader', 'assets/invader.png');
    
}

var player;
var background;
var invaders = [];
var invaders_cnt = 0;
var cursors;
var fire;
var enemy_bullets;
var player_bullets;
var cnt = 0;
var score = 0;
var score_text;
var boom;
var bullet;
var enemy_bullet;
var time_delay = 0;
var invader_move_cnt = 0;
var life = 3;
var life_text;

function create()
{
    game.physics.startSystem(Phaser.Physics.ARCADE);
    
    // a. 백그라운드 화면 생성 
    background = game.add.sprite(0,0,'background');
    game.physics.enable(background, Phaser.Physics.ARCADE);
    // 이부분을 지우면 백그라운드 지우기 가능
    background.body.collideWorldBounds = true;
    // 이부분을 지우면 백그라운드 움직임 or 흔들림
    background.body.immovable = true;
    
	// b. 플레이어 총알 그룹
    player_bullets = game.add.group();
    player_bullets.enableBody = true;
    player_bullets.createMultiple(20, 'bullet');
    
	// c. 적군 총알 그룹
    enemy_bullets = game.add.group();
    enemy_bullets.enableBody = true;
    enemy_bullets.createMultiple(40,'enemy_bullet');
    
	// d. 플레이어 비행기 생성
    player = game.add.sprite(250, 450, 'player');
    game.physics.arcade.enable(player);
    player.body.collideWorldBounds = true;
    
	// e. 적군 비행기 그룹
    invaders = game.add.group();
    invaders.enableBody = true;
    invaders.collideWorldBounds = true;
    
	// f. 적군 비행기 생성
    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 10; j++) {
            
            var invader = invaders.create(j*50, i*40+25, 'invader');
            invaders_cnt++;
            game.physics.enable(invader, Phaser.Physics.ARCADE);
            invader.body.collideWorldBounds = true;
            invader.body.bounce.setTo(1,1);
            invader.body.velocity.x = 50;
        }
    }
    
	// g. 점수 표시
    score_text = game.add.text(0,10,'SCORE : ' + score, {fill: 'white'});
    
	// h. 라이프 표시 (텍스트 + 그림)
    life_text = game.add.text(0,50,'LIFE : ' + life, {fill: 'white'});
    
	// i. 게임 오버 / 다음 레벨 표시
    
	// j. 적군 폭발
    // boom.animations.add('boom',null,10,true);
    
	// k. 키 입력 리스너
    cursors = game.input.keyboard.createCursorKeys();
    fire = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
}

function update()
{   
    if (player.alive === false) {
        player.revive();
    }
    game.physics.arcade.collide(background, invaders);
    invader_move_cnt++;
    // a. 백그라운드 화면 스크롤
    background.y += 2;
    
	// b. 플레이어 이동 초기화 
    player.body.velocity.x = 0;
    
	// c. 키 입력 시 행동 지정
    // 방향키
    if (cursors.left.isDown) {
        player.body.velocity.x = -200;
    } else if (cursors.right.isDown) {
        player.body.velocity.x = 200;
    } 
    // 미사일
    time_delay += game.time.elapsed;
    if (fire.isDown) {
        if (time_delay >= 400) {
        bullet = player_bullets.getFirstExists(false);
        
        if (bullet) {
            bullet.reset(player.x+10, player.y - 15);
            bullet.body.velocity.y = -100;
            
        } else {
            player_bullets.createMultiple(20, 'bullet');
        }
        time_delay = 0;
        }
    }
    
    // d. 적군 미사일 발사
    if (Math.floor(Math.random()*70) === 1) {
        invaders.forEachAlive(function(invader, enemy_bullet) {
            enemy_bullet = enemy_bullets.getFirstExists(false);
            
            if (enemy_bullet) {
                enemy_bullet.reset(invader.x,invader.y);
                enemy_bullet.body.velocity.y = 100;
            } else {
                enemy_bullets.createMultiple(20,'enemy_bullet');
            }
        });
    }
    
	// e. 플레이어 미사일이 적군에 맞았을 경우
    game.physics.arcade.overlap(player_bullets, invaders, destroyInvader, null, this);
    
		// 3) 적군이 다 죽으면
        if (invaders_cnt === 0) {
            invaders_cnt = 40;
            restart();
        }
			// a) 속도 증가 표시 
			// b) 클릭 입력시 다시 시작
	// f. 적군 미사일이 플레이어에 맞았을 경우
    game.physics.arcade.overlap(enemy_bullets, player, destroyPlayer, null, this);
		// 1) 라이프 감소
		// 2) 폭발
		// 3) 라이프가 0보다 작아지면 
        if (life < 0) {
            life = 0;
            restart();
        }
			// a) 게임 오버 표시
			// b) 클릭 입력시 다시 시작
}

// FUNCTIONS
function destroyPlayer (enemy_bullet, player) {
    enemy_bullet.kill();
    player.kill();
    if (game.time.elapsed > 3000) {
        player.revive();
    }
    life -= 1;
    life_text.text = 'LIFE: ' + life;
    
    
    
}
function destroyInvader (bullet, invader) {
    // 폭발
    bullet.kill();
    invader.kill();
    
    // 점수 증가
    score += 10;
    score_text.text = 'SCORE: ' + score;
    
    invaders_cnt--;
}

function restart () {
    
}
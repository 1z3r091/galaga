var game = new Phaser.Game(800, 600, Phaser.AUTO, 'my_galaga', { preload: preload, create: create, update: update });

function preload()
{
    
    // a. 브라우저에 화면이 다 보일 수 있게 scaling
    // game board 크기 조절해 해결함
    
	// b. 필요한 이미지 로드
    game.load.image('player', 'assets/player.png');
    game.load.image('bullet', 'assets/bullet.png');
    game.load.image('enemy_bullet', 'assets/enemy-bullet.png');
    game.load.image('background', 'assets/starfield.png');
    game.load.spritesheet('boom', 'assets/explode.png', 128, 128);
    
	// c. 적군 이미지 로드 
    game.load.image('invader', 'assets/invader.png');
    
}

var player;
var background;
var invaderss;
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
var game_over_text;
var next_level_text;
var restart;
var level = 1;

function create()
{
    game.physics.startSystem(Phaser.Physics.ARCADE);
    
    // a. 백그라운드 화면 생성 
    background = game.add.tileSprite(0,0,game.width, game.height,'background');
    
    game.physics.enable(background, Phaser.Physics.ARCADE);
    background.body.collideWorldBounds = true;
    background.body.immovable = true;
    
	// b. 플레이어 총알 그룹
    player_bullets = game.add.group();
    player_bullets.enableBody = true;
    player_bullets.createMultiple(20, 'bullet');
    
	// c. 적군 총알 그룹
    enemy_bullets = game.add.group();
    enemy_bullets.enableBody = true;
    enemy_bullets.createMultiple(level,'enemy_bullet');
    
	// d. 플레이어 비행기 생성
    player = game.add.sprite(background.width/2, background.height, 'player');
    game.physics.arcade.enable(player);
    player.body.collideWorldBounds = true;
    
	// e. 적군 비행기 그룹
    invaders = game.add.group();
    invaders.enableBody = true;
    invaders.collideWorldBounds = true;
    
	// f. 적군 비행기 생성
    createInvaders();
    
	// g. 점수 표시
    score_text = game.add.text(0,10,'SCORE : ' + score, {fill: 'white'});
    
	// h. 라이프 표시 (텍스트 + 그림)
    life_text = game.add.text(0,50,'LIFE : ' + life, {fill: 'white'});
    
	// i. 게임 오버 / 다음 레벨 표시
    game_over_text = game.add.text(background.width/3,background.height/3,'  GAME OVER\nEnter to Restart', {fill:'white'});
    game_over_text.visible = false;
    
    next_level_text = game.add.text(background.width/3,background.height/3,'    Cleared\n  Next Level', {fill:'white'});
    next_level_text.visible = false;
    
	// j. 폭발 pool
    boom = game.add.group();
    boom.enableBody = true;
    boom.createMultiple(30, 'boom');
    boom.forEach( function(explosion) {
       explosion.animations.add('boom'); 
    });
    
	// k. 키 입력 리스너
    cursors = game.input.keyboard.createCursorKeys();
    fire = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    restart = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
}

function update()
{   
    if (player.alive === false && life > 0) {
        player.revive();
    }
    game.physics.arcade.collide(background, invaders);
    invader_move_cnt++;
    // a. 백그라운드 화면 스크롤
    // 백그라운드 tile 을 움직이므로써 앞으로가는 효과
    background.tilePosition.y += 2;
    
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
        if (time_delay >= 500) {
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
    
    // Enter 누르면 다시 시작
    if (restart.isDown) {
       reset(); 
    }
    
    // d. 적군 미사일 발사
    if (Math.floor(Math.random()*70) === 1) {
        invaders.forEachAlive(function(invader, enemy_bullet) {
            
            enemy_bullet = enemy_bullets.getFirstExists(false);
            
            if (enemy_bullet && time_delay >= 400) {
                enemy_bullet.reset(invader.x,invader.y);
                enemy_bullet.body.velocity.y = 100;
            } else {
                enemy_bullets.createMultiple(level,'enemy_bullet');
            }
        });
    }
    
	// e. 플레이어 미사일이 적군에 맞았을 경우
    game.physics.arcade.overlap(player_bullets, invaders, destroyInvader, null, this);
    
		// 적군이 다 죽으면
        if (invaders_cnt === 0) {
            invaders_cnt = 40;
            next_level_text.visible = true;
        }

	// f. 적군 미사일이 플레이어에 맞았을 경우
    game.physics.arcade.overlap(enemy_bullets, player, destroyPlayer, null, this);
}

// FUNCTIONS
function createInvaders() {
    invaders_cnt = 0;
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
}

function destroyPlayer (enemy_bullet, player) {
    // 폭발
    var explosion = boom.getFirstExists(false);
    explosion.reset(player.body.x-70, player.body.y-70);
    explosion.play('boom',30,false,true);
    
    enemy_bullet.kill();
    player.kill();
    
    // 라이프 감소
    life -= 1;
    
    // 라이프가 0보다 작아지면 
    if (life <= 0) {
        life = 0;
        player.kill();
        
        // 게임 오버
        game_over_text.visible = true;
    }
    life_text.text = 'LIFE: ' + life;
    
    
    
}
function destroyInvader (bullet, invader) {
    // 폭발
    var explosion = boom.getFirstExists(false);
    explosion.reset(invader.body.x-70, invader.body.y-70);
    explosion.play('boom',30,false,true);
    bullet.kill();
    invader.kill();
    
    // 점수 증가
    score += 10;
    score_text.text = 'SCORE: ' + score;
    
    invaders_cnt--;
}

function reset () {
    if (invaders_cnt != 0) { 
        score = 0;
        life = 3;
        
        score_text.text = 'SCORE: ' + score;
        life_text.text = 'LIFE: ' + life;
        game_over_text.visible = false;
    } else {
        next_level_text.visible = false;
    }
    
    invaders.removeAll();
    enemy_bullets.removeAll();
    player_bullets.removeAll();
    createInvaders();
}
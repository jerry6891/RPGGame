

var game = new Phaser.Game(950, 540, Phaser.AUTO, 'game', {preload: preload, create: create, update: update});

function preload() {
    game.load.image('background', 'assets/background0.png');
    game.load.image('ground', 'assets/floor1.png');
    game.load.spritesheet('evilCharacter', 'assets/allcharacter.png', 153, 200);
    game.load.spritesheet('goodGuy', 'assets/enemyfixed.png', 92, 200);

    game.load.audio('horror', ['assets/horror.m4a']);
    game.load.audio('sword', 'assets/sword.mp3');
    game.load.audio('demon', ['assets/demonscream.m4a']);
    game.load.audio('boy', 'assets/boyscream.m4a');
}

var platforms;
var cursors;
var swingButton;
var player;
var enemies;
var layer;

var lives = 5;
var enemyKills = 0;
var livesText;
var enemyKillsText;

var music;
var sword;
var boy;
var demon;

function create() {

    music = game.add.audio('horror');
    music.play();
    sword = game.add.audio('sword');
    boy = game.add.audio('boy');
    demon = game.add.audio('demon');

    // game.sound.setDecodedCallback([ sword ], start, this);


    //  We're going to be using physics, so enable the Arcade Physics system
    game.physics.startSystem(Phaser.Physics.ARCADE);

    //  A simple background for our game
    var background = game.add.sprite(0, 0, 'background');
    background.scale.set(.5, .5);

    //  The platforms group contains the ground and the 2 ledges we can jump on
    platforms = game.add.group();

    //  We will enable physics for any object that is created in this group
    platforms.enableBody = true;

    // Here we create the ground.
    var ground = platforms.create(0, game.world.height - 64, 'ground');

    //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
    ground.scale.setTo(59.375, 4);

    //  This stops it from falling away when you jump on it
    ground.body.immovable = true;

    // platforms = game.add.group();
    // The player and its settings
    player = game.add.sprite(32, game.world.height - 264, 'evilCharacter');
    // player = game.add.sprite(0, 0, 'evilCharacter');

    //  We need to enable physics on the player
    game.physics.arcade.enable(player);

    //  Player physics properties. Give the little guy a slight bounce.
    player.body.bounce.y = 0.2;
    player.body.gravity.y = 300;
    player.body.collideWorldBounds = true;

    //  Animations, walking left and right.
    player.animations.add('left', [1, 4, 1, 5], 5, true);
    player.animations.add('right', [0, 2, 0, 3], 5, true);
    player.animations.add('stop-left', [1], 5, true);
    player.animations.add('stop-right', [0], 5, true);
    player.animations.add('jump', [10], 5, true);
    player.animations.add('swing-right', [6, 7, 6], 3, false);
    player.animations.add('swing-left', [8, 9, 8], 5, false);
    // player.animations.play('right', 4, true);

    enemies = game.add.group();
    spawnEnemy(700, -100);

    livesText = game.add.text(50, 30, 'LIVES: ' + lives, {font: "Bold 11px Century Gothic", fill: "#ffffff", align: "center"});
    enemyKillsText = game.add.text(820, 30, 'ENEMY KILLS: ' + enemyKills, {font: "Bold 11px Century Gothic", fill: "#ffffff", align: "center"});

    cursors = game.input.keyboard.createCursorKeys();
    swingButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    swingButton.onDown.add(swing);
}


function update() {
    //  Collide the player and the stars with the platforms
    var hitPlatform = game.physics.arcade.collide(player, platforms);

    var hitLayer = game.physics.arcade.collide(player, layer);
    game.physics.arcade.collide(enemies, layer);
    game.physics.arcade.overlap(player, enemies, collideWithEnemy, null, this);

    //  Reset the players velocity (movement)
    // player.body.velocity.x = 0;

    if (cursors.left.isDown && player.body.touching.down) {
        //  Move to the left
        player.body.velocity.x = -150;
        player.animations.play('left');
    }
    else if (cursors.right.isDown && player.body.touching.down) {
        //  Move to the right
        player.body.velocity.x = 150;
        player.animations.play('right');
    }
    else if (player.body.touching.down) {
        if (player.animations.currentAnim.name === 'left') {
            player.animations.play('stop-left');
        } else if (player.animations.currentAnim.name === 'right') {
            player.animations.play('stop-right');
        }

        //  Stand still
        // player.frame = 0;
        player.body.velocity.x = 0;

    }

    //  Allow the player to jump if they are touching the ground.
    if (cursors.up.isDown && player.body.touching.down && hitPlatform) {
        player.body.velocity.y = -350;
        player.animations.play('jump');
    }
}

function spawnEnemy(x, velocity) {
    var enemy = game.add.sprite(x, 280, 'goodGuy');
    game.physics.enable(enemy, Phaser.Physics.ARCADE);

    enemy.body.velocity.x = velocity;
    enemy.body.bounce.y = 0.2;
    enemy.body.collideWorldBounds = true;
    enemy.animations.add('float', [0, 1], 5, true);
    enemy.animations.play('float');
    enemies.add(enemy);
}

function swing() {
    if (swingButton.isDown) {
        player.animations.play('swing-right');
        sword.play();
    }
}

function collideWithEnemy(player, enemy) {
    if (player.animations.currentAnim.name === 'swing-right') {
        //Kill enemy
        enemyKills = enemyKills + 1;
        enemyKillsText.text = 'enemy kills: ' + enemyKills;
        if (enemyKills < 1) {
            // Spawn new enemy
            spawnEnemy(700, -100);

        } else if (enemyKills < 10) {
            // Spawn new enemy
            spawnEnemy(700, -200);
            spawnEnemy(850, -100);
        } else {
            game.add.text(375, 230, 'YOU ARE A GOD', {font: "Bold 30px Century Gothic", fill: "#ffffff", align: "center"});
        }
        enemies.remove(enemy);
        enemy.kill();
        boy.play();

    } else {
        //Kill player
        lives = lives - 1;
        livesText.text = 'lives: ' + lives;
        demon.play();
        if (lives > 0) {
            // Place the player back at the start
            player.body.x = 32;
            player.body.y = 264;
        } else {
            player.kill();
            game.add.text(375, 230, 'YOU ARE DEAD', {font: "Bold 30px Century Gothic", fill: "#ffffff", align: "center"});
        }
    }
}
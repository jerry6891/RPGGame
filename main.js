const TILEMAP = 'TileMap';

var game = new Phaser.Game(688, 608, Phaser.AUTO, 'game', {preload: preload, create: create, update: update});

function preload() {

    game.load.tilemap(TILEMAP, 'assets/tilemap1.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.image('walls', 'assets/walls.png');
    game.load.image('doorsFloors', 'assets/doors-and-floors.png');

    // Character Sprites
    game.load.spritesheet('trueDemon', 'assets/character_unweaponed.png', 20, 22, 29, 0, 2);
    game.load.spritesheet('trueDemonShield', 'assets/character_shield.png', 20, 22, 29, 0, 2);
    game.load.spritesheet('trueDemonSword', 'assets/character_all_weapon.png', 20, 29, 52, 0, 2);

    // Health Bar
    game.load.image('fullHeart', 'assets/heartKomplete.png');
    game.load.image('deadHeart', 'assets/heartDead.png');

    // Enemies Sprites
    game.load.spritesheet('knightEnemy', 'assets/knightenemy.png', 31, 31);
    game.load.spritesheet('swordsEnemy', 'assets/swordsenemy.png', 31, 33);
    game.load.spritesheet('spearsEnemy', 'assets/spearenemy.png', 27, 37);

    // MiniBosses
    game.load.spritesheet('miniBoss', 'assets/miniboss.png', 58, 75);

    //Bosses

    // Weapons Sprite
    game.load.spritesheet('weaponsAnimation', 'assets/swordshieldanimation.png', 16, 32);
    game.load.spritesheet('weaponsObjects', 'assets/weapons.png', 27, 37);

    // Music/Sounds::Audio
    game.load.audio('horror', ['assets/horror.m4a']);
    // game.load.audio('sword', 'assets/sword.mp3');
    // game.load.audio('demon', ['assets/demonscream.m4a']);
    // game.load.audio('boy', 'assets/boyscream.m4a');
    game.load.audio('stairs', ['assets/stairs.mp3']);
    game.load.audio('chestOpened', ['assets/chestopened.mp3']);
}

var map;
var layer;
var objectLayer;

var platforms;
var cursors;
var swingButton;
var bladingButton;
var character;
var enemies;

var lives = 5;
var enemyKills = 0;
var livesText;
var deadNow;
var enemyKillsText;
var Physics = {
    WALK: 150,
    STAIRS: 50};

var onStairsMusic;
var isOnStairs = false;

// Music/Sounds
var levelTheme;
var swordSound;
var bossTheme;
var painSound;
var enemySound;
var stairs;

var Animations = {
    FRONT_STAND: 'front-stand',
    BACK_STAND: 'back-stand',
    LEFT_STAND: 'left-stand',
    RIGHT_STAND: 'right-stand',
    LEFT_WALK: 'left-walk',
    RIGHT_WALK: 'right-walk',
    FRONT_WALK: 'front-walk',
    BACK_WALK: 'back-walk'
}

var Weaponed = {
    FRONT_WEAPON: 'front-weapon',
    BACK_WEAPON: 'back-weapon',
    LEFT_WEAPON: 'left-weapon',
    RIGHT_WEAPON: 'right-weapon',
    LEFT_WALK_WEAPON: 'left-weapon',
    RIGHT_WALK_WEAPON: 'right-weapon',
    FRONT_WALK_WEAPON: 'front-weapon',
    BACK_WALK_WEAPON: 'back-weapon'
}

var Blading = {
    FRONT_BLADING: 'front-blading',
    BACK_BLADING: 'back-blading',
    LEFT_BLADING: 'left-blading',
    RIGHT_BLADING: 'right-blading'
}

function handleDoorEvent(sprite, tile) {
    var objects = map.objects["DoorwayLayer"];
    var targetObjectName;
    if (sprite.goneThroughDoor) {
        return;
    }

    for (var obj of objects) {
        if ((tile.worldX >= obj.x && tile.worldX < obj.x + obj.width) && (tile.worldY >= obj.y && tile.worldY < obj.y + obj.height)) {
            // if (!obj.properties || !obj.properties["other-door"]) return;
            targetObjectName = obj.properties["other-door"];
        }
    }
    if (targetObjectName) {
        for (obj of objects) {
            if (obj.name === targetObjectName) {
                sprite.body.x = obj.x + sprite.body.halfWidth;
                sprite.body.y = obj.y + sprite.body.halfHeight;
                sprite.goneThroughDoor = true;
                game.time.events.add(Phaser.Timer.HALF, function() {sprite.goneThroughDoor = false}, this);                // debugger
            }
        }
    }
}


function handleOpenEvent(sprite) {
    var objects = map.objects["ItemsLayer"];

    for (var obj of objects) {
        if ((sprite.body.x + sprite.body.halfWidth >= obj.x && sprite.body.x + sprite.body.halfWidth < obj.x + obj.width) && (sprite.body.y === obj.y + obj.height)) {

            // Do chest animation logic
            var chestOpened = game.add.audio('chestOpened');
            chestOpened.play();

            // var chestOne = game.add.sprite(1040, 480, 'weaponsAnimation');
            // chestOne.animations.add('weaponsAnimation', [0, 1, 2, 4], 5, true);
            // chestOne.animations.play('weaponsAnimation');

            var chestOne = game.add.sprite(1040, 480, 'weaponsAnimation');
            chestOne.animations.add('weaponsAnimation', [0, 1, 2, 3, 0], 4, false, killOnComplete = true);
            chestOne.animations.play('weaponsAnimation', killOnComplete);

            // Adding Character sprite with sword
            sprite.loadTexture("trueDemonSword");

            //Adding Character sword blading...
            // sprite.blading = "trueDemonSword";

            // character = game.add.sprite(823, game.world.height - 75, 'trueDemonWeapon');
            //do character animation logic
            // var characterItemAnimation = game.add.sprite('trueDemon');
            // characterItemAnimation.animations.add('weapoonsAnimation', [28], 5, true);
            // characterItemAnimation.animations.play('weaponsAnimation');
            break;
        }
    }
}

function handleOpenEventTwo(sprite) {
    var objects = map.objects["ItemChestTwo"];

    for (var obj of objects) {
        if ((sprite.body.x + sprite.body.halfWidth >= obj.x && sprite.body.x + sprite.body.halfWidth < obj.x + obj.width) && (sprite.body.y === obj.y + obj.height)) {

            // Do chest animation logic
            var chestOpened = game.add.audio('chestOpened');
            chestOpened.play();

            // var chestOne = game.add.sprite(1040, 480, 'weaponsAnimation');
            // chestOne.animations.add('weaponsAnimation', [0, 1, 2, 4], 5, true);
            // chestOne.animations.play('weaponsAnimation');

            var chestTwo = game.add.sprite(1184, 480, 'weaponsAnimation');
            chestTwo.animations.add('weaponsAnimation', [4, 5, 6, 7, 4], 4, false, killOnComplete = true);
            chestTwo.animations.play('weaponsAnimation', killOnComplete);

            // Adding Character sprite with shield
            sprite.loadTexture("trueDemonShield");

            // character = game.add.sprite(823, game.world.height - 75, 'trueDemonWeapon');
            //do character animation logic
            // var characterItemAnimation = game.add.sprite('trueDemon');
            // characterItemAnimation.animations.add('weapoonsAnimation', [28], 5, true);
            // characterItemAnimation.animations.play('weaponsAnimation');
            break;
        }
    }
}

function create() {

    // music = game.add.audio('horror');
    // music.play();
    // sword = game.add.audio('sword');
    // boy = game.add.audio('boy');
    // demon = game.add.audio('demon');

    // game.sound.setDecodedCallback([ sword ], start, this);
    onStairsMusic = game.add.audio('stairs');

    game.physics.startSystem(Phaser.Physics.ARCADE);

    map = game.add.tilemap(TILEMAP);
    map.addTilesetImage('walls', 'walls', 16, 16, 0, 1);
    map.addTilesetImage('doors-and-floors', 'doorsFloors', 16, 16, 0, 0);

    layer = map.createLayer('TileLayer1');
    objectLayer = map.createLayer('DoorwayLayer');
    layer.resizeWorld();

    map.setCollisionByExclusion([8, 9, 48, 69, 53, 74, 113, 114, 134, 135, 136, 154, 155, 156, 157, 176, 177, 178, 193, 279, 280, 281, 282, 297, 298, 300, 301, 302, 304, 321, 322, 323, 324, 342, 343, 344, 345], true, layer);
    map.setTileIndexCallback([279, 280, 281, 282, 300, 301, 302, 304, 321, 322, 323, 324, 342, 343, 344, 345], function() {
        if (!onStairsMusic.isPlaying) {
            onStairsMusic.play();
        }
        isOnStairs = true;
    });
    map.setTileIndexCallback([29, 30, 49, 52, 70, 73, 92, 93], handleDoorEvent, this);

    //  A simple background for our game
    // var background = game.add.sprite(0, 0, 'background');
    // background.scale.set(.5, .5);

    //  The platforms group contains the ground and the 2 ledges we can jump on
    // platforms = game.add.group();

    //  We will enable physics for any object that is created in this group
    // platforms.enableBody = true;

    // Here we create the ground.
    // var ground = platforms.create(0, game.world.height - 64, 'ground');

    //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
    // ground.scale.setTo(59.375, 4);

    //  This stops it from falling away when you jump on it
    // ground.body.immovable = true;

    // platforms = game.add.group();
    // The player and its settings
    character = game.add.sprite(823, game.world.height - 75, 'trueDemon');

    // character = game.add.sprite(0, 0, 'trueDemon');

    // We need to enable physics on the player
    game.physics.arcade.enable(character);
    character.body.setSize(12, 12, 4, 5);

    //  Player physics properties. Give the little guy a slight bounce.
    // character.body.bounce.y = 0.2;
    // character.body.gravity.y = 300;
    // character.body.collideWorldBounds = true;

    //  Animations, walking left and right.
    character.animations.add(Animations.FRONT_STAND, [3], 5, true);
    character.animations.add(Animations.BACK_STAND, [10], 5, true);
    character.animations.add(Animations.LEFT_STAND, [24], 5, true);
    character.animations.add(Animations.RIGHT_STAND, [17], 5, true);
    character.animations.add(Animations.LEFT_WALK, [22, 23, 24, 25, 26], 5, true);
    character.animations.add(Animations.RIGHT_WALK, [15, 16, 17, 18, 19, 20], 5, true);
    character.animations.add(Animations.FRONT_WALK, [0, 1, 2, 3, 4, 5, 6], 5, true);
    character.animations.add(Animations.BACK_WALK, [7, 10, 13], 5, true);
    character.animations.play(Animations.BACK_STAND);

    //  Character, with sword & shield.
    character.animations.add(Weaponed.FRONT_WEAPON, [3], 5, true);
    character.animations.add(Weaponed.BACK_WEAPON, [10], 5, true);
    character.animations.add(Weaponed.LEFT_WEAPON, [24], 5, true);
    character.animations.add(Weaponed.RIGHT_WEAPON, [17], 5, true);
    character.animations.add(Weaponed.LEFT_WALK_WEAPON, [22, 23, 24, 25, 26], 5, true);
    character.animations.add(Weaponed.RIGHT_WALK_WEAPON, [15, 16, 17, 18, 19, 20], 5, true);
    character.animations.add(Weaponed.FRONT_WALK_WEAPON, [0, 1, 2, 3, 4, 5, 6], 5, true);
    character.animations.add(Weaponed.BACK_WALK_WEAPON, [7, 10, 13], 5, true);
    character.animations.play(Weaponed.BACK_WEAPON);

    //  Character animations, with sword & shield.
    character.animations.add(Blading.FRONT_BLADING, [28, 29, 30, 31, 32, 33], 5, false);
    character.animations.add(Blading.BACK_BLADING, [34, 35, 36, 37, 38, 39, 40], 5, false);
    character.animations.add(Blading.LEFT_BLADING, [41, 42, 43, 44, 45, 46], 5, false);
    character.animations.add(Blading.RIGHT_BLADING, [47, 48, 49, 50, 51, 52], 5, false);

    enemies = game.add.group();
    // spawnEnemy(823, 75);

    // Enemies Appearance | 1st Room
    var enemyOne = game.add.sprite(850, 1320, 'knightEnemy');
    game.physics.arcade.enable(enemyOne);
    enemyOne.animations.add('knightEnemy', [0, 1, 2], 5, true);
    enemyOne.animations.play('knightEnemy');
    enemies.add(enemyOne);
    var tweenA = game.add.tween(enemyOne).to( { x: 600 }, 2000);
    var tweenB = game.add.tween(enemyOne).to( { x: 850 }, 2000);
    tweenA.chain(tweenB);
    tweenB.chain(tweenA);
    tweenA.start();

    var enemyTwo = game.add.sprite(785, 1320, 'knightEnemy');
    game.physics.arcade.enable(enemyTwo);
    enemyTwo.animations.add('knightEnemy', [0, 1, 2], 5, true);
    enemyTwo.animations.play('knightEnemy');
    enemies.add(enemyTwo);
    var tweenC = game.add.tween(enemyTwo).to( { x: 1000 }, 5000);
    var tweenD = game.add.tween(enemyTwo).to( { x: 785 }, 5000);
    tweenC.chain(tweenD);
    tweenD.chain(tweenC);
    tweenC.start();

    var enemyThree = game.add.sprite(730, 1200, 'swordsEnemy');
    game.physics.arcade.enable(enemyThree);
    enemyThree.animations.add('swordsEnemy', [0, 1, 2], 5, true);
    enemies.add(enemyThree);

    var enemyFour = game.add.sprite(898, 1200, 'swordsEnemy');
    game.physics.arcade.enable(enemyFour);
    enemyFour.animations.add('swordsEnemy', [0, 1, 2], 5, true);
    enemies.add(enemyFour);

    var enemyFive = game.add.sprite(1020, 1180, 'spearsEnemy');
    game.physics.arcade.enable(enemyFive);
    enemyFive.animations.add('spearsEnemy', [0, 1, 2], 5, true);
    enemyFive.animations.play('spearsEnemy');
    enemies.add(enemyFive);
    var tweenE = game.add.tween(enemyFive).to( { y: 1100, }, 2000);
    var tweenF = game.add.tween(enemyFive).to( { y: 1180, }, 2000);
    tweenE.chain(tweenF);
    tweenF.chain(tweenE);
    tweenE.start();

    var enemySix = game.add.sprite(590, 1180, 'spearsEnemy');
    game.physics.arcade.enable(enemySix);
    enemySix.animations.add('spearsEnemy', [0, 1, 2], 5, true);
    enemySix.animations.play('spearsEnemy');
    enemies.add(enemySix);
    var tweenG = game.add.tween(enemySix).to( { y: 1100, }, 4000);
    var tweenH = game.add.tween(enemySix).to( { y: 1180, }, 4000);
    tweenG.chain(tweenH);
    tweenH.chain(tweenG);
    tweenG.start();

    // Enemies Appearance | 2nd Room
    // var enemySeven = game.add.sprite(802, 899, 'swordsEnemy');
    // game.physics.arcade.enable(enemySeven);
    // enemySeven.animations.add('swordsEnemy', [6, 7, 8], 5, true);
    // enemySeven.animations.play('swordsEnemy');
    // enemies.add(enemySeven);
    // var tweenI = game.add.tween(enemySeven).to( { x: 850, }, 4000);
    // var tweenJ = game.add.tween(enemySeven).to( { x: 802, }, 4000);
    // tweenI.chain(tweenJ);
    // tweenJ.chain(tweenI);
    // tweenI.start();

    // MiniBoss & Enemies Appearance | 4th Room


    livesText = game.add.text(20, 20, 'LIVES: ' + lives, {font: "11px Century Gothic", fill: "#ffffff", align: "left"});
    livesText.fixedToCamera = true;
    livesText.cameraOffset.setTo(20, 20);

    // enemyKillsText = game.add.text(820, 30, 'ENEMY KILLS: ' + enemyKills, {font: "Bold 11px Century Gothic", fill: "#ffffff", align: "center"});

    // player.animations.add('swing-right', [6, 7, 6], 3, false);
    // player.animations.add('swing-left', [8, 9, 8], 5, false);
    // character.animations.play('back-walk', 5, true);

    // livesText = game.add.text(50, 30, 'LIVES: ' + lives, {font: "Bold 11px Century Gothic", fill: "#ffffff", align: "center"});
    // enemyKillsText = game.add.text(820, 30, 'ENEMY KILLS: ' + enemyKills, {font: "Bold 11px Century Gothic", fill: "#ffffff", align: "center"});
    game.camera.follow(character);
    cursors = game.input.keyboard.createCursorKeys();
    swingButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

    bladingButton = game.input.keyboard.addKey(Phaser.KeyCode.A);
    bladingButton.onDown.add(characterBlading);
}


function update() {

    game.physics.arcade.collide(character, layer);
    game.physics.arcade.collide(character, objectLayer, function() {console.log("Hello")});

    //game.physics.arcade.collide(enemies, layer);
    game.physics.arcade.overlap(character, enemies, collideWithEnemy, null, this);

    function getWalkVelocity() {
        return isOnStairs ? Physics.STAIRS : Physics.WALK;
    }
    if (swingButton.justDown) {
        handleOpenEvent(character);
        handleOpenEventTwo(character);
    }

    if (cursors.left.isDown)
    {
        character.animations.play(Animations.LEFT_WALK);
        character.body.velocity.x = -1 * getWalkVelocity();
        character.body.velocity.y = 0;
    } else if (cursors.right.isDown)
    {
        character.animations.play(Animations.RIGHT_WALK);
        character.body.velocity.x = getWalkVelocity();
        character.body.velocity.y = 0;
    } else if (cursors.up.isDown)
    {
        character.animations.play(Animations.BACK_WALK);
        character.body.velocity.x = 0;
        character.body.velocity.y = -1 * getWalkVelocity();
    } else if (cursors.down.isDown)
    {
        character.animations.play(Animations.FRONT_WALK);
        character.body.velocity.x = 0;
        character.body.velocity.y = getWalkVelocity();
    } else {
        if (character.animations.currentAnim.isPlaying && (character.animations.currentAnim.name === 'back-blading'
            || character.animations.currentAnim.name === 'front-blading'
            || character.animations.currentAnim.name === 'left-blading'
            || character.animations.currentAnim.name === 'right-blading'
        )) {
            // Do nothing if attack animation is playing
        } else if (character.body.velocity.x > 0) {
            character.animations.play(Animations.RIGHT_STAND);
        } else if (character.body.velocity.x < 0) {
            character.animations.play(Animations.LEFT_STAND);
        } else if (character.body.velocity.y > 0) {
            character.animations.play(Animations.FRONT_STAND);
        } else if (character.body.velocity.y < 0) {
            character.animations.play(Animations.BACK_STAND);
        } else {
            // Animation playing, but 0 velocity because we've collided with a wall.
            switch (character.animations.currentAnim.name) {
                case Animations.FRONT_WALK:
                    character.animations.play(Animations.FRONT_STAND);
                    break;
                case Animations.BACK_WALK:
                    character.animations.play(Animations.BACK_STAND);
                    break;
                case Animations.RIGHT_WALK:
                    character.animations.play(Animations.RIGHT_STAND);
                    break;
                case Animations.LEFT_WALK:
                    character.animations.play(Animations.LEFT_STAND);
                    break;
            }
        }
        character.body.velocity.x = 0;
        character.body.velocity.y = 0;
    }
    isOnStairs = false;


    // Collide the player and the stars with the platforms
    // var hitPlatform = game.physics.arcade.collide(character, platforms);

    // var hitLayer = game.physics.arcade.collide(character, layer);
    // game.physics.arcade.collide(enemies, layer);
    // game.physics.arcade.overlap(player, enemies, collideWithEnemy, null, this);

    // Reset the players velocity (movement)
    // character.body.velocity.x = 0;

    // if (cursors.left.isDown && character.body.touching.down) {
        //  Move to the left
        // character.body.velocity.x = -150;
        // character.animations.play('left-walk'); }

    // else if (cursors.right.isDown && player.body.touching.down) {
        //  Move to the right
        // player.body.velocity.x = 150;
        // player.animations.play('right'); }

    // else if (player.body.touching.down) {
        // if (player.animations.currentAnim.name === 'left') {
            // player.animations.play('stop-left'); }
    // else if (player.animations.currentAnim.name === 'right') {
            // player.animations.play('stop-right'); }

        // Stand still
        // character.frame = 10;
        // player.body.velocity.x = 0; }

    //  Allow the player to jump if they are touching the ground.
    // if (cursors.up.isDown && player.body.touching.down && hitPlatform) {
        // player.body.velocity.y = -350;
        // player.animations.play('jump'); } }

// function spawnEnemy(x, velocity) {
    // var enemy = game.add.sprite(x, 280, 'goodGuy');
    // game.physics.enable(enemy, Phaser.Physics.ARCADE);

    // enemy.body.velocity.x = velocity;
    // enemy.body.bounce.y = 0.2;
    // enemy.body.collideWorldBounds = true;
    // enemy.animations.add('float', [0, 1], 5, true);
    // enemy.animations.play('float');
    // enemies.add(enemy); }


// --------------------------------------------------------------------


// function swing() {
    // if (swingButton.isDown) {
        // player.animations.play('swing-right'); sprite.weapon === "trueDemonSword"
        // sword.play(); } }


// ---------------------------------------------------------------------


// function collideWithEnemy(player, enemy) {
    // if (player.animations.currentAnim.name === 'swing-right') {
        //Kill enemy
        // enemyKills = enemyKills + 1;
        // enemyKillsText.text = 'enemy kills: ' + enemyKills;
        // if (enemyKills < 1) {
            // Spawn new enemy
            // spawnEnemy(700, -100); }
    // else if (enemyKills < 10) {
            // Spawn new enemy
            // spawnEnemy(700, -200);
            // spawnEnemy(850, -100); }

        // else {
            // game.add.text(375, 230, 'YOU ARE A GOD', {font: "Bold 30px Century Gothic", fill: "#ffffff", align: "center"}); }

        // enemies.remove(enemy);
        // enemy.kill();
        // boy.play(); }

    // else {
        //Kill player
        // lives = lives - 1;
        // livesText.text = 'lives: ' + lives;
        // demon.play();
        // if (lives > 0) {
            // Place the player back at the start
            // player.body.x = 32;
            // player.body.y = 264; }
        // else {
            // player.kill();
            // game.add.text(375, 230, 'YOU ARE DEAD', {font: "Bold 30px Century Gothic", fill: "#ffffff", align: "center"});
        // }
    // }
}

function characterBlading() {
    debugger

    if (cursors.up.isDown && bladingButton.isDown)
    {
        character.animations.play('back-blading');
    }

    else if (cursors.down.isDown && bladingButton.isDown)
    {
        character.animations.play('front-blading');
    }

    else if (cursors.right.isDown && bladingButton.isDown)
    {
        character.animations.play('left-blading');
    }

    else (cursors.left.isDown && bladingButton.isDown)
    {
        character.animations.play('right-blading');
    }

}

function spawnEnemy(x, velocity) {
    var enemy = game.add.sprite(x, 280, 'knightEnemy');
    game.physics.enable(enemy, Phaser.Physics.ARCADE);

    enemy.body.velocity.x = velocity;
    enemy.body.bounce.y = 0.2;
    enemy.body.collideWorldBounds = true;
    enemy.animations.add('knightEnemy', [0, 1, 2], 5, true);
    enemy.animations.play('knightEnemy');
    // enemies.add(enemy);
}

function collideWithEnemy(character, enemy) {
    if (character.animations.currentAnim.name === 'swing-right') {
        //Kill enemy
        enemyKills = enemyKills + 1;
        enemyKillsText.text = 'enemy kills: ' + enemyKills;
        if (enemyKills < 1) {
            // Spawn new enemy
            spawnEnemy(823, 75);

        } else if (enemyKills < 10) {
            // Spawn new enemy
            spawnEnemy(823, 75);
            spawnEnemy(823, 75);
        } else {
            game.add.text(375, 230, 'YOU ARE A GOD', {font: "Bold 30px Century Gothic", fill: "#ffffff", align: "center"});
        }
        enemies.remove(enemy);
        enemy.kill();

    } else {
        //Kill player
        lives = lives - 1;
        livesText.text = 'LIVES: ' + lives;
        if (lives > 0) {
            // Place the player back at the start
            character.body.x = 830;
            character.body.y = 1540;
        } else {
            character.kill();
            deadNow = game.add.text(240, 270, 'BACK TO HELL', {font: "30px Century Gothic", fill: "#ffffff"});
            deadNow.fixedToCamera = true;
            deadNow.cameraOffset.setTo(240, 270);
        }
    }
}
var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug:true
        }
    },
    scene: {
        preload: preload,
        create: create,
        update:update,
        render:render
    }
};

var game = new Phaser.Game(config);
var player;
var skill;
var stars;
var platforms;
var cursors;
var keyObj;  // Get key object
var aIsDown ;
var aIsUp ;
var isUsingSkill = false;

function preload ()
{
    this.load.image('bg', 'data/bg/henesysground.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.image('star', 'assets/star.png');
    this.load.image('bomb', 'assets/bomb.png');

    this.load.spritesheet('player_walk', 
        'data/sprite/walk_r.png',
        { frameWidth: 39, frameHeight: 62 }
    );
    this.load.spritesheet('player_idle', 
        'data/sprite/idle_r.png',
        { frameWidth: 39, frameHeight: 62 }
    );
    this.load.spritesheet('player_jump', 
        'data/sprite/jump_r.png',
        { frameWidth: 39, frameHeight: 62 }
    );
    this.load.spritesheet('skill_roar', 
        'data/sprite/effect_sheet.png',
        { frameWidth: 365, frameHeight: 376 }
    );
    this.load.spritesheet('mob', 
        'data/sprite/orangemush.png',
        { frameWidth: 65, frameHeight: 76 }
    );
}

function create ()
{
    this.add.image(400, 300, 'bg');
    this.add.image(400, 300, 'star');

    platforms = this.physics.add.staticGroup();

    platforms.create(400, 550, 'ground').setScale(2).refreshBody();

    platforms.create(600, 400, 'ground');
    platforms.create(50, 250, 'ground');
    platforms.create(750, 220, 'ground');
    platforms.toggleVisible();
    
    player = this.physics.add.sprite(100,440,'player_idle');
    player.setBounce(0);
    player.setCollideWorldBounds(true);
    player.setZ(5);

    mob = this.physics.add.sprite(200,440,'mob');
    mob.setBounce(0);
    mob.setCollideWorldBounds(true);


    skill = this.physics.add.sprite(0,0,'skill_roar');
    skill.visible = false;
    skill.body.enable = false;
    skill.body.setGravity(0,-300);
    skill.on('animationcomplete', function (animation,frame) {
        skill.visible = false;
        skill.body.enable = false;
        isUsingSkill = false;
    });

    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('player_walk', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'idle',
        frames: this.anims.generateFrameNumbers('player_idle', { start: 0, end: 2 }),
        frameRate: 1,
        repeat:-1
    });
    this.anims.create({
        key: 'jump',
        frames: [ { key: 'player_jump', frame: 0 } ],
        frameRate: 20,
    });

    this.anims.create({
        key: 'roar',
        frames: this.anims.generateFrameNumbers('skill_roar', { start: 0, end: 13 }),
        frameRate: 10,
    });

    this.anims.create({
        key: 'mob_idle',
        frames: this.anims.generateFrameNumbers('mob', { start: 0, end: 13 }),
        frameRate: 10,
    });
    
    this.physics.add.collider(player,platforms);
    this.physics.add.collider(mob,platforms);
    this.physics.add.overlap(player,mob,takeDmg,null,this);
    this.physics.add.overlap(skill,mob,takeDmg,null,this);
    // this.physics.add.overlap(skill,player,takeDmg,null,this);
    
    cursors=this.input.keyboard.createCursorKeys();
    
    keyObj = this.input.keyboard.addKey('A');  // Get key object


    stars = this.physics.add.group({
        key: 'star',
        repeat: 11,
        setXY: { x: 12, y: 0, stepX: 70 }
    });

    stars.children.iterate(function(child){

        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));

    });
    this.physics.add.collider(stars,platforms);
    this.physics.add.overlap(player,stars,collectStar,null,this);

}

function update(){
    if (cursors.left.isDown)
    {
        player.setVelocityX(-160);
        player.flipX=true;
        if(player.body.onFloor()){
            
            player.anims.play('left', true);
        }
    }
    else if (cursors.right.isDown)
    {
        player.setVelocityX(160);
        player.flipX=false;
        if(player.body.onFloor()){
            
            player.anims.play('left', true);
        }
    }
    else
    {   
        mob.anims.play('mob_idle',true);


        if(player.body.onFloor()){
            player.anims.play('idle',true);
        }else {
            player.anims.play('jump',true);
        }
        player.setVelocityX(0);
        
        
    }
    //jump
    if (cursors.up.isDown && player.body.onFloor())
    {
        player.setVelocityY(-300);
        player.anims.play('jump',true);
        
    }
    if(keyObj.isDown && !isUsingSkill){
        isUsingSkill = true;
        skill.visible = true;
        skill.body.enable = true;
        skill.setPosition(player.x,player.y,0);
        skill.anims.play('roar',true);

        
    }

}



function render() {

    // Sprite debug info
    this.game.debug.spriteInfo(player, 32, 32);
    this.game.debug.body(player);
    console.log("helloworld");

}

function collectStar(player,star){
    star.disableBody(true,true);
}

function takeDmg(player,mob){
    console.log("dmgtaken!");
}
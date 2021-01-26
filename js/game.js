//TODO: get collision points

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

class Character extends Phaser.Physics.Arcade.Sprite{
    constructor(scene,x,y){
        super(scene,x,y,'player_idle');
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setBounce(0);
        // this.setCollideWorldBounds(true);

    }

}


var game = new Phaser.Game(config);
var character;
var character2;
var skill;
var stars;
var platforms;
var cursors;
var keyObj;  // Get key object
var aIsDown ;
var aIsUp ;
var isUsingSkill = false;
var actual_JSON;
function loadJSON(callback) {   
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', 'map_json/100000203.json', true);
    xobj.onreadystatechange = function () {
      if (xobj.readyState == 4 && xobj.status == "200") {
        callback(JSON.parse(xobj.responseText));
      }
    };
    xobj.send(null);  
  }

function init() {
    loadJSON(function(response) {
     // Parse JSON string into object
       actual_JSON = response;
    });
   }
init();

function preload ()
{   //this is game
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
    

    mob = this.physics.add.sprite(200,440,'mob');
    mob.setBounce(0);
    mob.setCollideWorldBounds(true);

    // skills =this.physics.add.group();

    skill = this.physics.add.sprite(0,0,'skill_roar');
    skill.visible = false;
    skill.body.enable = false;
    skill.body.setGravity(0,-300);
    skill.on('animationcomplete', function (animation,frame) {
        skill.visible = false;
        skill.body.enable = false;
        isUsingSkill = false;
    });
    // skills.add(skill);

    character = this.physics.add.sprite(100,440,'player_idle');
    character.setBounce(0);
    character.setCollideWorldBounds(true);
    character2 = new Character(this,100,240);   


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
    
    this.physics.add.collider(character,platforms);
    this.physics.add.collider(mob,platforms);
    this.physics.add.overlap(character,mob,takeDmg,null,this);
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
    this.physics.add.overlap(character,stars,collectStar,null,this);

}

function update(){
    mob.anims.play('mob_idle',true);
    if (cursors.left.isDown)
    {
        character.setVelocityX(-160);
        character.flipX=true;
        if(character.body.onFloor()){
            
            character.anims.play('left', true);
        }
    }
    else if (cursors.right.isDown)
    {
        character.setVelocityX(160);
        character.flipX=false;
        if(character.body.onFloor()){
            
            character.anims.play('left', true);
        }
    }
    else
    {   
        


        if(character.body.onFloor()){
            character.anims.play('idle',true);
        }else {
            character.anims.play('jump',true);
        }
        character.setVelocityX(0);
        
        
    }
    //jump
    if (cursors.up.isDown && character.body.onFloor())
    {
        character.setVelocityY(-300);
        character.anims.play('jump',true);
        
    }
    if(keyObj.isDown && !isUsingSkill){
        isUsingSkill = true;
        skill.visible = true;
        skill.body.enable = true;
        skill.setPosition(character.x,character.y,0);
        skill.anims.play('roar',true);

        
    }

}



function render() {


}

function collectStar(p1,star){
    star.disableBody(true,true);
}

function takeDmg(p1,mob){
    console.log("dmgtaken!");
}
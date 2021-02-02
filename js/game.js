//TODO: get collision points

const GRAVITY =300;

var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: GRAVITY },
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
    constructor(scene,x,y,sprite){
        super(scene,x,y,sprite);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setBounce(0);
        this.setCollideWorldBounds(true);
        scene.physics.add.collider(this,platforms);

        this.str = 4;
        this.dex = 4;
        this.int = 4;
        this.luk = 4;
        this.hp = 100;
        this.mp = 100;

        //each character also has an arsenal of skills
        this.skills =[];
    }
    gethp(){
        return this.hp;
    }
    sethp(hp){
        this.hp = this.hp-hp;
    }
    getmp(){
        return this.mp;
    }
    setmp(mp){
        this.mp = this.mp-mp;
    }
    //adds a Skill object into array
    addSkill(skill){
        skill.setCharacter(this);
        this.skills.push(skill);
    }
    getSkill(){
        return this.skills[0];
    }
    getAllSkills(){
        return this.skills;
    }
}

class Mob extends Phaser.Physics.Arcade.Sprite{
    constructor(scene,x,y,sprite){
        super(scene,x,y,sprite);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setBounce(0);
        this.setCollideWorldBounds(true);
        scene.physics.add.collider(this,platforms);
        this.hp = 100;
        this.mp = 100;
    }
    gethp(){
        return this.hp;
    }
    //technically should be minus hp
    sethp(hp){
        this.hp = this.hp-hp;
    }
    getmp(){
        return this.mp;
    }
    setmp(mp){
        this.mp = this.mp-mp;
    }

}

class Skill extends Phaser.Physics.Arcade.Sprite{
    constructor(scene,x,y,sprite){
        super(scene,x,y,sprite);
        //need these two statements to add sprite scene and enable physics
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.visible = false;
        this.body.enable = false;
        this.body.setGravity(0,GRAVITY*(-1));
        this.name='roar';

        this.on('animationcomplete', function (animation,frame) {
            this.visible = false;
            // this.body.enable = false;
            isUsingSkill = false;
        });

        //at half way of the frame completion, display the damage number
        

        scene.physics.add.overlap(this,mob);
        //what matters is the base dmg of the skill that hit
        this.baseDmg =50;
        //this is to find the character this skill belongs to
        this.character;
    }
    setCharacter(c){
        this.character =c;
    }
    getCharacter(){
        return character;
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
var txt;
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
    

    mob = new Mob(this,200,440,'mob');

    // skills =this.physics.add.group();
    // skills.add(skill);

    skill = new Skill(this,0,0,'skill_roar');
    skill2 = new Skill(this,0,0,'skill_roar');

    character = new Character(this,100,240,'player_idle'); 
    character.addSkill(skill);
    skill2.name='roar2';
    character.addSkill(skill2);

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
    this.physics.add.overlap(character,mob,null,null,this);
    //how to distinguish which skill hit?
    this.physics.add.overlap(character.getAllSkills(),mob,takeDmg,null,this);
    // this.physics.add.overlap(skill,player,takeDmg,null,this);
    
    cursors=this.input.keyboard.createCursorKeys();
    
    keyObj = this.input.keyboard.addKey('A');  // Get key object

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
    //listener for the skill
    if(keyObj.isDown && !isUsingSkill){
        isUsingSkill = true;
        character.getSkill().visible = true;
        character.getSkill().body.enable = true;
        character.getSkill().setPosition(character.x,character.y,0);
        character.getSkill().anims.play('roar',true);

        
    }

}



function render() {


}

function collectStar(p1,star){
    star.disableBody(true,true);
}

function takeDmg(skillhit,mobhit){
    //will only take the skill that hits
    //get the character's stats based on the skill and then calculate the dmg that way. but here there is only one character.
    
    //do this so that the skill will only trigger once
    skillhit.body.enable = false;
    mobhit.sethp(skillhit.baseDmg+skillhit.getCharacter().str*0.5);
    console.log("Mob hit!");
    txt = this.add.text(mobhit.x, mobhit.y, skillhit.baseDmg+skillhit.getCharacter().str*0.5,{ fontSize: "56px" });
    this.tweens.add({
        targets: txt,
        y: txt.y - 50,
        alpha: 0,
        ease: "Quart.easeInOut",
        duration: 500,
        repeat: 0,

    });
}

//  The callback is always sent a reference to the Tween as the first argument and the targets as the second.
//  Whatever you provided in the onCompleteParams array follows.
function onCompleteHandler (tween, targets, myTxt)
{
    console.log('onCompleteHandler');

    console.log(myTxt);
}


class Character extends Phaser.Physics.Arcade.Sprite{
    constructor(scene,x,y,texture){
        super(scene,x,y,texture);
        console.log(texture);
        scene.add.existing(this);
        this.setBounce(0);
        // this.setCollideWorldBounds(true);

    }

}
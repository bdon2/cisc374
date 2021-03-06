import Phaser from 'phaser';
import { beeController, generatePlayer } from '../classes/Player';

var score = 0;
var scoreText;
var energy = 100;
var energyText;
var cloudsWhite, cloudsWhiteSmall;

export default class HelloWorldScene extends Phaser.Scene
{
    private platforms?: Phaser.Physics.Arcade.StaticGroup;
    private player?: Phaser.Physics.Arcade.Sprite;
    private enemy?: Phaser.Physics.Arcade.Sprite;
    private plant?: Phaser.Physics.Arcade.Sprite;
    private keys?: Phaser.Types.Input.Keyboard.CursorKeys;

    private health: number;
    private hearts: Phaser.GameObjects.Sprite[];
    private canTakeDamage: boolean;

	constructor()
	{
		super('hello-world');
        this.health = 3;
        this.hearts = []
        this.canTakeDamage = true;
	}

	preload()
    {
        this.load.spritesheet('bee', 'assets/bee.png', {
            frameWidth: 512, frameHeight: 512
        })
        this.load.spritesheet('heart', 'assets/hearts.png', {
            frameWidth: 300, frameHeight: 300
        })
            
        this.load.image('ground', 'assets/platform.png');
        this.load.image('bear', 'assets/bear.png');
        this.load.image('sky', 'assets/sky.png');

        this.load.image('flower', 'assets/tulip.png');

        this.load.image('clouds-white', 'assets/clouds-white.png');
        this.load.image("clouds-white-small", 'assets/clouds-white-small.png');

        

        this.load.image('left-cap', 'assets/barHorizontal_green_left.png');
        this.load.image('middle', 'assets/barHorizontal_green_mid.png');
        this.load.image('right-cap', 'assets/barHorizontal_green_right.png');

        this.load.image('left-cap-shadow', 'assets/barHorizontal_shadow_left.png');
        this.load.image('middle-shadow', 'assets/barHorizontal_shadow_mid.png');
        this.load.image('right-shadow', 'assets/barHorizontal_shadow_right.png');
    }

    create()
    {
        const fullWidth = 300;

        const createAligned = (scene, totalWidth, texture, scrollFactor) => {
            const w = scene.textures.get(texture).getSourceImage().width
            const count = Math.ceil(totalWidth / w) * scrollFactor
        
            let x = 0
            for (let i = 0; i < count; ++i)
            {
                const m = scene.add.image(x, scene.scale.height, texture)
                    .setOrigin(0, 1)
                    .setScrollFactor(scrollFactor)
        
                x += m.width
            }
        }

        this.add.image(400,300,'sky');
        this.add.text(10, 12, 'Energy');
        this.createBarBackground(10, 50, fullWidth);
        this.hearts = this.createHearts(10 + fullWidth + 30, 50);
        this.platforms = this.physics.add.staticGroup();
        const ground = this.platforms.create(400,600, 'ground') as Phaser.Physics.Arcade.Sprite;
        ground.setScale(2).refreshBody();
        
        ground.setScrollFactor(0.5);

        createAligned(this, 800, 'ground', 0.5);

        this.player = generatePlayer(this);

        this.enemy = this.physics.add.sprite(500, 450,'bear')
        this.enemy.setCollideWorldBounds(true)

        this.plant = this.physics.add.sprite(300, 450, 'flower')
        this.plant.setCollideWorldBounds(true)
        this.plant.setScale(.25)

        cloudsWhite = this.add.tileSprite(640, 200, 1280, 400, "clouds-white");
        cloudsWhiteSmall = this.add.tileSprite(640, 200, 1280, 400, "clouds-white-small");

        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('bee', { 
                start: 6, end: 11
            }),
            frameRate: 10,
            repeat: 1
        })

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('bee', {
                start: 0, end: 5
            }),
            frameRate: 10,
            repeat: 1
        })

        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.enemy, this.platforms);
        this.physics.add.collider(this.plant, this.platforms);

        this.keys = this.input.keyboard.createCursorKeys();

        this.physics.add.overlap(this.player, this.enemy, this.handleHitEnemy, undefined, this);
        this.physics.add.collider(this.plant, this.platforms);
    
        this.scene.launch('ui-scene', { controller: this});

        scoreText = this.add.text(16, 80, 'Resources: 0', { fontSize: '32px', fill: '#000' });
        energyText = this.add.text(15, 35, 'Energy: 100', { fontSize: '32px', fill: '#000' });
    }

    private handleHitEnemy(p: Phaser.GameObjects.GameObject, b: Phaser.GameObjects.GameObject) {
        if (this.canTakeDamage) {
            if (this.health > 0) {
                this.health--;
                this.hearts[this.health].setFrame(2);
                this.canTakeDamage = false;
                this.knockback(this.player, this.enemy);
                this.canTakeDamage = true;
            }
            else {
                this.scene.start("GameOverScene");
            }
        }
    }

    private knockback(player?: Phaser.Physics.Arcade.Sprite, b?: Phaser.Physics.Arcade.Sprite) {
        const xdiff = player.body.position.x - b.body.position.x;
        const ydiff = player.body.position.y - b.body.position.y;
        const magnitude = Math.sqrt(xdiff * xdiff + ydiff * ydiff);
        const normalX = xdiff / magnitude;
        const normalY = ydiff / magnitude;
        player?.setVelocity(normalX * 500, normalY * 500);
    }

    
    private handleHitPlant(player: Phaser.GameObjects.GameObject, b: Phaser.GameObjects.GameObject) {
        this.add.text(100, 300, 'Yay, nectar!');
        for (let i = 0; i < 20; i++) {
            score = score + 1;
        scoreText.setText('Resources: ' + score);
        }
    }

    private createBarBackground(x: number, y: number, fullWidth: number) {
        const leftShadowCap = this.add.image(x, y, 'left-cap')
            .setOrigin(0, 0.5);

        const middleShadowCap = this.add.image(leftShadowCap.x + leftShadowCap.width, y, 'middle')
            .setOrigin(0, 0.5);
            middleShadowCap.displayWidth = fullWidth;

        this.add.image(middleShadowCap.x + middleShadowCap.displayWidth, y, 'right-cap')
            .setOrigin(0, 0.5);
    }

    private createHearts(x: number, y: number): Phaser.GameObjects.Sprite[] {
        let h1: Phaser.GameObjects.Sprite = this.add.sprite(x, y, 'heart').setScale(0.1)
            .setOrigin(0, 0.5);

        let h2: Phaser.GameObjects.Sprite = this.add.sprite(h1.x + h1.displayWidth + 15, y, 'heart', 0).setScale(0.1)
            .setOrigin(0, 0.5);

        let h3: Phaser.GameObjects.Sprite = this.add.sprite(h2.x + h2.displayWidth + 15, y, 'heart', 0).setScale(0.1)
            .setOrigin(0, 0.5);
        return [h1,h2,h3];
    }
    
    update() {
        beeController(this.keys, this.player);

        cloudsWhite.tilePositionX += 0.5;
        cloudsWhiteSmall.tilePositionX += 0.25;

        //this.plant.tilePositionX += 1;
        //this.platforms.tilePositionX += 0.5;
    }
}

Game.Jogo1Intro = function(game) {
    this.background = null;
    this.text = null;
    this.dialogue = [
        "Era uma vez um robô chamado MAKI",
        "Que costumava navegar pela galáxia",
        "Um dia sua nave teve um problema", 
        "E caiu no planeta Terra...",
        ""
    ];

    this.nave = null;
    this.sndFalling = null;
    this.explosionEmitter = null;
    this.sndExplosion = null;

    this.maki_quebrado = null;
};

Game.Jogo1Intro.prototype = {

    preload: function() {

        this.stage.backgroundColor = "#113344";

        this.background = this.add.sprite(0, 0, 'terraBackground');
        let scale = Math.max(this.camera.bounds.width/ this.background.width, this.camera.bounds.height/this.background.height);
        this.background.scale.x = scale;
        this.background.scale.y = scale;

        // TODO: adicionar narração por voz
        let style = { font: 'bold 40pt Arial', fill: 'white', align: 'left', wordWrap: true, wordWrapWidth: 450 };
        this.text = this.add.text(20, 20, this.dialogue[0], style);
        for (let i = 1; i < this.dialogue.length; i++) {
            this.time.events.add(Phaser.Timer.SECOND * 5 * i, () => {
                this.text.text = this.dialogue[i]}, this);
        }

        this.time.events.add(Phaser.Timer.SECOND * 20, this.animNaveCaindo, this);

        this.sndFalling = this.add.sound("sndFalling4s", 0.3, false);
        this.sndExplosion = this.add.sound("sndExplosion", 1, false);

        this.explosionEmitter = this.add.emitter(0, 0);
        this.explosionEmitter.makeParticles(['pFire1', 'pFire2', 'pFire3', 'pSmoke']);
        this.explosionEmitter.setAlpha(1, 0, 3000);
        this.explosionEmitter.setScale(0.8, 0, 0.8, 0, 3000);

        this.time.events.add(Phaser.Timer.SECOND * 25, () => {
            this.add.tween(this.background).to({alpha: 0}, 3000, Phaser.Easing.Default).start();
            this.maki_quebrado = this.add.sprite(this.world.centerX, this.world.centerY, "maki_quebrado");
            this.maki_quebrado.anchor.set(0.5);
            this.maki_quebrado.alpha = 0;
            this.add.tween(this.maki_quebrado).to({alpha: 1}, 2000, Phaser.Easing.Default, false, 1000).start();
        }, this);

        this.time.events.add(Phaser.Timer.SECOND * 28, () => { this.text.text = "Ajude-o a se reconstruir!"}, this);

        // Start game
        this.time.events.add(Phaser.Timer.SECOND * 32, this.startGame, this);
    },

    create: function() {
        if (Game.music.isPlaying == false) {
            Game.music.play();
        }
    },

    update: function() {

    },

    animNaveCaindo: function() {
        this.nave = this.add.sprite(this.world.width + 200, this.world.centerY - 70, "nave");
        this.nave.anchor.set(0.5);
        this.nave.scale.set(-0.4, 0.4);
        this.nave.angle = -30;

        let anim01 = this.add.tween(this.nave).to({
            x: this.world.centerX + 10,
            y: this.world.centerY + 80,
            angle: -50
        }, 4000, Phaser.Easing.Default);

        let anim02 = this.add.tween(this.nave.scale).to({
            x: -0.005,
            y: 0.005
        }, 4000, Phaser.Easing.Default);

        anim01.onComplete.add(() => {
            this.explosionEmitter.emitX = this.nave.x;
            this.explosionEmitter.emitY = this.nave.y;
            this.explosionEmitter.start(true, 1000, null, 20);
            this.nave.destroy();
            this.sndExplosion.play();
        });
        anim01.start();
        anim02.start();

        this.sndFalling.play();

    },

    startGame: function() {
        this.state.start("Jogo1");
    }



}
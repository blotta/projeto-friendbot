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

    this.gamestate = "start"; // start, playing, waitforinput, ended

    // array of functions to step through
    this.steps = [];
    this.curr_step = 0;

    this.continue_icon = null;

    // Narrations
    this.narr = null;
};

Game.Jogo1Intro.prototype = {

    preload: function() {

        this.stage.backgroundColor = "#113344";

        // Narrations
        this.narr = this.add.sound('sndJ1INarracao', 1, false);
        this.narr.allowMultiple = true;
        this.narr.addMarker('eraumavez', 0, 3, 1, false);
        this.narr.addMarker('costumavanavegar', 3, 3, 1, false);
        this.narr.addMarker('naveteveproblema', 6, 3, 1, false);
        this.narr.addMarker('caiunaterra', 9, 3, 1, false);
        this.narr.addMarker('ajudeo', 12, 3, 1, false);

        this.background = this.add.sprite(0, 0, 'terraBackground');
        let scale = Math.max(this.camera.bounds.width/ this.background.width, this.camera.bounds.height/this.background.height);
        this.background.scale.x = scale;
        this.background.scale.y = scale;

        let style = { font: 'bold 40pt Arial', fill: 'white', align: 'left', wordWrap: true, wordWrapWidth: 450 };
        this.text = this.add.text(20, 20, "", style);

        this.sndFalling = this.add.sound("sndFalling4s", 0.1, false);
        this.sndExplosion = this.add.sound("sndExplosion", 1, false);

        this.explosionEmitter = this.add.emitter(0, 0);
        this.explosionEmitter.makeParticles(['pFire1', 'pFire2', 'pFire3', 'pSmoke']);
        this.explosionEmitter.setAlpha(1, 0, 3000);
        this.explosionEmitter.setScale(0.8, 0, 0.8, 0, 3000);

        this.continue_icon = this.add.sprite(this.camera.bounds.width - 100, this.camera.bounds.height + 100, 'tap_to_continue');
        this.continue_icon.anchor.set(0.5);
        this.add.tween(this.continue_icon).to({
            x: this.camera.bounds.width - 150
        }, 500, Phaser.Easing.Quadratic.In, true, 0, 0, true).loop(true);

        // functions
        this.steps.push(() => {
            this.text.text = "Era uma vez um robô chamado MAKI";
            this.narr.play('eraumavez');
            this.time.events.add(Phaser.Timer.SECOND * 3, this.stepEnded, this);
        });

        this.steps.push(() => {
            this.text.text = "Ele costumava navegar pela galáxia";
            this.narr.play('costumavanavegar');
            this.time.events.add(Phaser.Timer.SECOND * 3, this.stepEnded, this);
        });

        this.steps.push(() => {
            this.text.text = "Um dia, sua nave teve um problema";
            this.narr.play('naveteveproblema');
            this.time.events.add(Phaser.Timer.SECOND * 3, this.stepEnded, this);
        });

        this.steps.push(() => {
            this.text.text = "E caiu no planeta Terra";
            this.narr.play('caiunaterra');
            this.time.events.add(Phaser.Timer.SECOND * 3, this.stepEnded, this);
        });

        // Anim falling ship
        this.steps.push(() => {
            this.text.text = "";
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
            this.time.events.add(Phaser.Timer.SECOND * 5, this.nextStep, this);
        });

        // fade out earth, fade in maki
        this.steps.push(() => {
            this.add.tween(this.background).to({alpha: 0}, 3000, Phaser.Easing.Default).start();
            this.maki_quebrado = this.add.sprite(this.world.centerX, this.world.centerY, "maki_quebrado");
            this.maki_quebrado.anchor.set(0.5);
            this.maki_quebrado.alpha = 0;
            this.add.tween(this.maki_quebrado).to({alpha: 1}, 2000, Phaser.Easing.Default, false, 1000).start();

            this.time.events.add(Phaser.Timer.SECOND * 3, () => {
                this.text.text = "Ajude-o a se reconstruir!";
                this.narr.play('ajudeo');
                this.time.events.add(Phaser.Timer.SECOND * 3, this.stepEnded, this);
            });
        });


        this.input.onTap.add(this.nextStep, this);
    },

    create: function() {
        if (Game.music != null && Game.music.isPlaying == false) {
            Game.music.play();
        }

        this.nextStep();
    },

    update: function() {

    },

    nextStep: function() {

        if (this.curr_step < this.steps.length) {
            this.hideContinueIcon();
            this.input.enabled = false;
            this.gamestate = 'playing';
            this.steps[this.curr_step]();
            this.curr_step++;
        } else {
            this.startGame();
        }
    },

    stepEnded: function() {
        this.input.enabled = true;
        this.gamestate = 'waitforinput';
        this.showContinueIcon();
    },

    showContinueIcon: function() {
        this.add.tween(this.continue_icon)
            .to({y: this.camera.bounds.height - 90}, 300, Phaser.Easing.Exponential.Out, true);
    },

    hideContinueIcon: function() {
        this.add.tween(this.continue_icon)
            .to({y: this.camera.bounds.height + 90}, 300, Phaser.Easing.Exponential.Out, true);
    },

    startGame: function() {
        this.state.start("Jogo1");
    }
}
Game.MainMenu = function(game) {

    this.music = null;
    this.jogo1Button = null;
    this.jogo2Button = null;

    this.button_group = null;

    this.state_time = 0;

    this.space_bg = null;

};

Game.MainMenu.prototype = {

    preload: function() {
        this.stage.backgroundColor = "#113344";
    },

    create: function() {

        if (Game.music == null) {
            Game.music = this.add.audio('sndIntroMusic', 0.2);
        }

        if (Game.music.isPlaying == false) {
            Game.music.play();
            // if (Game.debug) this.music.stop();
        }

        // fade in
        this.camera.fadeIn(0x000000, 16 * Phaser.Timer.SECOND);

        // Background. start zoomed in, zooms out with tween
        this.space_bg = this.add.sprite(this.camera.bounds.width / 2, this.camera.bounds.height / 2, 'space_bg');
        let scale = Math.max(this.camera.bounds.width/ this.space_bg.width, this.camera.bounds.height/this.space_bg.height);

        this.space_bg.anchor.set(0.5);
        this.space_bg.scale.set(4);
        this.add.tween(this.space_bg.scale)
            .to({x: scale, y: scale}, 16 * Phaser.Timer.SECOND,
                Phaser.Easing.Quadratic.InOut, true);

        // All buttons
        this.button_group = this.add.group();
        this.button_group.x = this.camera.bounds.width / 2;
        this.button_group.y = this.camera.bounds.height * 2;
        this.add.tween(this.button_group)
            .to({y: this.camera.bounds.height / 2},
                5000, Phaser.Easing.Cubic.Out, true, 15 * Phaser.Timer.SECOND);

        this.jogo1Button = this.make.button(0, 0, 'red_square', this.startGame, this);
        this.jogo1Button.anchor.set(0.5);
        this.jogo1Button.scale.set(2);
        this.jogo1Button.x = 100;
        this.button_group.add(this.jogo1Button);

        this.jogo2Button = this.make.button(0, 0, 'nave', this.startGame, this);
        this.jogo2Button.anchor.set(0.5);
        this.jogo2Button.scale.set(0.2);
        this.jogo2Button.x = -100;
        this.button_group.add(this.jogo2Button);
    },

    update: function() {
        this.state_time += this.time.elapsed / 1000;

        this.jogo1Button.x = 250 * Math.cos(this.state_time * 0.3);
        this.jogo1Button.y = 150 * -Math.sin(this.state_time * 0.3);

        this.jogo2Button.x = 250 * Math.cos(Math.PI + this.state_time * 0.3);
        this.jogo2Button.y = 150 * -Math.sin(Math.PI + this.state_time * 0.3);
    },

    startGame: function(btn) {
        switch(btn.key) {
            case 'red_square':
                this.state.start('Jogo1Intro');
                break;
            case 'nave':
                this.state.start('Jogo2');
                break;
        }
    },

}
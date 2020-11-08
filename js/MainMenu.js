Game.MainMenu = function(game) {

    this.music = null;
    this.jogo1Button = null;
    this.jogo2Button = null;

    this.button_group = null;

    this.state_time = 0;

    this.space_bg = null;

    this.activities = {
        jogo1: {
            title: "Reconstrução do MAKI",
            week: "Segunda-feira",
            desc: "Ajude o MAKI a se reconstruir, conectando as combinações de peças necessárias.",
            next_state: "Jogo1Intro"
        },
        jogo2: {
            title: "Comunicação por Música",
            week: "Terça-feira",
            desc: "Crie uma música para ajudar o MAKI a se comunicar com seu planeta.",
            next_state: "Jogo2"
        }
    }

    this.selectedGame = null;
    this.title = null;
    this.subtitle = null;
    this.desc = null;

    this.play_btn = null;

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

        // Background. start zoomed in, zooms out with tween
        this.space_bg = this.add.sprite(this.camera.bounds.width / 2, this.camera.bounds.height / 2, 'space_bg');
        this.space_bg.anchor.set(0.5);
        let scale = Math.max(this.camera.bounds.width/ this.space_bg.width, this.camera.bounds.height/this.space_bg.height);
        this.space_bg.scale.set(scale); // stretch

        // Buttons
        this.button_group = this.add.group();
        this.button_group.x = this.camera.bounds.width / 2;
        this.button_group.y = this.camera.bounds.height / 2;

        this.jogo1Button = this.make.button(0, 0, 'main_menu_btns', this.selectGame, this, 0, 0);
        this.jogo1Button.data.gameStateKey = 'jogo1';
        this.jogo1Button.anchor.set(0.5, 0);
        this.button_group.add(this.jogo1Button);

        this.jogo2Button = this.make.button(0, 0, 'main_menu_btns', this.selectGame, this, 1, 1);
        this.jogo2Button.data.gameStateKey = 'jogo2';
        this.jogo2Button.anchor.set(0.5, 0);
        this.button_group.add(this.jogo2Button);


        let w = 190;
        let h = 160;
        this.button_group.align(this.button_group.children.length, 1, w, h);
        this.button_group.y = 60;
        this.button_group.x = this.camera.bounds.centerX - w * this.button_group.children.length / 2;


        let title_style = { font: 'bold 40pt Arial', fill: 'white', align: 'left'};
        this.title = this.add.text(60, this.camera.bounds.centerY, "", title_style);

        let subtitle_style = { font: 'bold 20pt Arial', fill: 'white', align: 'left'};
        this.subtitle = this.add.text(60, this.camera.bounds.centerY + 60, "", subtitle_style);

        let desc_style = { font: 'bold 20pt Arial', fill: 'white', align: 'left', wordWrap: true, wordWrapWidth: this.camera.bounds.width - 300};
        this.desc = this.add.text(60, this.camera.bounds.centerY + 120, "", desc_style);

        if (!Game.menu_intro_skip){
            Game.menu_intro_skip = true;

            // fade in
            this.camera.fadeIn(0x000000, 16 * Phaser.Timer.SECOND);

            // BG zoom out
            this.space_bg.scale.set(4);
            this.add.tween(this.space_bg.scale)
                .to({x: scale, y: scale}, 16 * Phaser.Timer.SECOND,
                    Phaser.Easing.Quadratic.InOut, true);

            // Place buttons under camera
            // this.button_group.x = this.camera.bounds.width / 2;
            this.button_group.y = this.camera.bounds.height * 2;
            this.add.tween(this.button_group)
                .to({y: 60},
                    5000, Phaser.Easing.Cubic.Out, true, 15 * Phaser.Timer.SECOND);


        }
    },

    // update: function() {},

    selectGame: function(btn) {
        // scale
        for (let b of this.button_group.children) {
            b.scale.set(1);
        }
        btn.scale.set(1.1);

        // info
        const key = btn.data.gameStateKey;
        this.selectedGame = this.activities[key];

        // text
        this.title.text = this.selectedGame.title;
        this.subtitle.text = this.selectedGame.week;
        this.desc.text = this.selectedGame.desc;

        // button
        console.log(this.play_btn);
        if (this.play_btn == null) {
            this.play_btn = this.add.button(this.camera.bounds.width - 260, this.camera.bounds.centerY + 60, 'main_menu_btns', () => {}, this, 2, 2);
        }
        this.play_btn.onInputUp.add(() => { 
            this.play_btn = null;
            this.state.start(this.selectedGame.next_state);
        });
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
Game.Preloader = function(game) {
    this.background = null;
    this.preloadBar = null;

    this.ready = false;

};

Game.Preloader.prototype = {
    preload: function() {

        // Assets loaded in Boot.js
        this.background = this.add.sprite(0, 0, 'terraBackground');
        let scale = Math.max(this.camera.bounds.width/ this.background.width, this.camera.bounds.height/this.background.height);
        this.background.scale.x = scale;
        this.background.scale.y = scale;
        this.preloadBar = this.add.sprite(this.world.centerX, this.world.centerY, 'preloaderBar');
        this.preloadBar.anchor.setTo(0.5, 0.5);

        // this.time.advancedTiming = true;

        // Sets preloadBar sprite as a loader sprite
        // Auto-crops sprite from 0 to width as files are loaded in
        this.load.setPreloadSprite(this.preloadBar);

        // Load all the rest of the assets game needs

        // MAKI
        this.load.image('maki_top', 'assets/images/maki_top.png');
        this.load.image('maki_quebrado', 'assets/images/maki_quebrado.png');

        this.load.image("nave", "assets/images/ship.png");
        this.load.image('red_square', 'assets/images/square_red.png');
        this.load.image('restart_button', 'assets/images/restart_button.png');
        this.load.image('space_bg', 'assets/images/spaceBG-smaller.png');

        // JOGO 1
        this.load.image('eletronico_01', 'assets/images/eletronico_01.png');
        this.load.image('eletronico_02', 'assets/images/eletronico_02.png');
        this.load.image('eletronico_03', 'assets/images/eletronico_03.png');
        this.load.image('eletronico_04', 'assets/images/eletronico_04.png');

        // Particles
        this.load.image('pFire1', 'assets/images/particles/fire1.png');
        this.load.image('pFire2', 'assets/images/particles/fire2.png');
        this.load.image('pFire3', 'assets/images/particles/fire3.png');
        this.load.image('pSmoke', 'assets/images/particles/smoke-puff.png');

        // musica
        this.load.audio('sndIntroMusic', ['assets/music/space-walk.ogg']);

        // sons
        this.load.audio("sndExplosion", 'assets/sounds/explosion.wav');
        this.load.audio("sndFalling4s", 'assets/sounds/falling-4s.mp3');
        this.load.audio('sndError', 'assets/sounds/error.wav');
        this.load.audio('sndGood', 'assets/sounds/good.wav');
        this.load.audio('sndGreat', 'assets/sounds/great.wav');
        this.load.audio('sndShween', 'assets/sounds/shween.wav');
        this.load.audio('sndC1Start', 'assets/sounds/c1_start.wav');
        this.load.audio('sndC1Stop', 'assets/sounds/c1_stop.wav');
        this.load.audio('sndFinish', 'assets/sounds/finish.wav');
        this.load.audio('sndApplause', 'assets/sounds/applause.wav');

    },

    create: function() {
        // this.state.start('Level1');

        // sit in the update loop for a short while
        this.preloadBar.cropEnabled = false;
    },

    update: function() {
        // decode audio file
        if (this.cache.isSoundDecoded('sndIntroMusic') && this.ready == false) {
            this.ready = true;
            this.state.start('MainMenu');
            // this.state.start('Jogo1');
        }
    }
}
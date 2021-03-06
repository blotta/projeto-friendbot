const Game = {
    // Global level vars
    music: null,
    debug: true,
    menu_intro_skip: false,
};

Game.Boot = function(game) {
};

Game.Boot.prototype = {

    init: function() {
        
        this.input.maxPointers = 1;

        this.stage.disableVisibilityChange = true;

        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        // this.scale.setMinMax(1024, 576, 1280, 720);
        this.scale.setMinMax(512, 288, 1980, 1080);
        this.scale.pageAlignHorizontally = true;
        this.scale.pageAlignVertically = true;

        if (!this.game.device.desktop)
        {
            this.scale.forceOrientation(true, false);
            this.scale.setResizeCallback(this.gameResized, this);
            // this.scale.enterIncorrectOrientation.add(this.enterIncorrectOrientation, this);
            // this.scale.leaveIncorrectOrientation.add(this.leaveIncorrectOrientation, this);

        }
        // this.scale.startFullScreen();

    },

    preload: function() {

        this.load.image('terraBackground', 'assets/images/terra.jpg');
        this.load.image('preloaderBar', 'assets/images/cmaki_015.png');

    },

    create: function() {
        this.state.start('Preloader');
    },

    gameResized: function(width, height) {
        // extra resizing processing
    }
}
/** @type {Phaser.Game} */
let game;

window.onload = function() {

    game = new Phaser.Game(1024, 576, Phaser.AUTO, 'gamewindow', { preload: preload, create: create, update: update });
};

/** @type {Phaser.Sprite} */
let maki_obj;

/** @type {boolean} */
let maki_estaRotacionando = false;

/** @type {Phaser.Group} */
let platforms;

function preload () {

    let images = [
        "maki_top"
    ];

    for (let img of images) {
        game.load.image("spr_" + img, "assets/images/" + img + ".png");
    }
}

function create () {
    maki_obj = game.add.sprite(game.world.width / 2, game.world.height / 2, "spr_maki_top");
    maki_obj.anchor.set(0.5);
    maki_obj.scale.set(0.5);
    maki_estaRotacionando = false;

}

function update() {
    if (!maki_estaRotacionando) {
        addRandomTween();
    }
}

function addRandomTween() {
    game.add.tween(maki_obj)
        .to({ angle: -180 + Math.random() * 360}, 1000 + Math.random() * 3000, Phaser.Easing.Linear.None, true)
        .onComplete.add(() => maki_estaRotacionando = false);
    maki_estaRotacionando = true;
}
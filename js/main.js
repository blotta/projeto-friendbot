/** @type {Phaser.Game} */
let game;

window.onload = function() {

    game = new Phaser.Game(800, 600, Phaser.AUTO, 'gamewindow', { preload: preload, create: create, update: update });
};

/** @type {Phaser.Sprite} */
let player;

/** @type {Phaser.Group} */
let platforms;

/** @type {Phaser.Group} */
let cubes;

function preload () {

    let images = [];

    for (let img of images) {
        game.load.image("spr_" + img, "assets/" + img + ".png");
    }
}

function create () {

}

function update() {

}

function collectCube(player, cube) {
    cube.kill();
}
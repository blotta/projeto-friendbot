/** @type {Phaser.Game} */
let game;

window.onload = function() {

    game = new Phaser.Game(1024, 576, Phaser.AUTO, 'gamewindow', { preload: preload, create: create, update: update, render: render });
};

// MAKI
/** @type {Phaser.Sprite} */
let maki;

// Eletronico a ser lançado
/** @type {Phaser.Sprite} */
let elet;

// Eletronicos
/** @type {Phaser.Group} */
let group;

/** @type {Phaser.Button} */
let button;

function preload () {

    let images = [
        "maki_top",
        "eletronico_01",
        "eletronico_02",
        "eletronico_03",
        "eletronico_04",
        "square_red"
    ];

    for (let img of images) {
        game.load.image("spr_" + img, "assets/images/" + img + ".png");
    }
}

function create () {
    game.physics.startSystem(Phaser.Physics.ARCADE);

    maki = game.add.sprite(game.world.width *3/4, game.world.height / 2, "spr_maki_top");
    maki.anchor.set(0.5);
    game.physics.enable(maki, Phaser.Physics.ARCADE);
    let radius = maki.width / 2;
    maki.body.setCircle(radius, (-radius + 0.5 * maki.width  / maki.scale.x), (-radius + 0.5 * maki.height / maki.scale.y));

    group = game.add.group();
    group.x = maki.x;
    group.y = maki.y;

    elet = novoEletronico();

    button = game.add.button(game.world.centerX, game.world.height - 70, "spr_square_red", lancarEletronico, this);
    button.anchor.set(0.5);
    button.scale.set(3, 1.5);

    novaRotacao();
}

function update() {
    if (elet == null) {
        elet = novoEletronico();
    }

    game.physics.arcade.overlap(elet, maki, encaixaEletronico);
}

function novoEletronico() {
    let key = game.rnd.pick([
        "spr_eletronico_01",
        "spr_eletronico_02",
        "spr_eletronico_03",
        "spr_eletronico_04"
    ]);
    let e = game.add.sprite(game.world.width * 1/4, game.world.height / 2, key);
    game.physics.enable(e, Phaser.Physics.ARCADE);
    e.anchor.set(0.5);
    return e;
}

function lancarEletronico() {
    elet.body.velocity.x = 1700;
}

function encaixaEletronico() {
    let key = elet.key;
    elet.kill();

    let e = game.add.sprite(0, 0, key);
    game.physics.enable(e, Phaser.Physics.ARCADE);
    e.anchor.set(0.5);
    e.pivot.x = maki.width / 2;
    e.body.angularVelocity = maki.body.angularVelocity;

    group.add(e);
    elet = null;
}

function novaRotacao() {
    let angVel = game.rnd.between(40, 200);
    if (Math.random() > 0.5) angVel = -angVel;

    maki.body.angularVelocity = angVel;
    group.forEach(e => e.body.angularVelocity = angVel);

    setTimeout(novaRotacao, game.rnd.between(1000, 5000));
}

function render() {
    game.debug.body(maki);
    group.forEach((s) => {
        game.debug.body(s);
        game.debug.pixel(s.x, s.y, "#0000FF");
    });

    game.debug.spriteInfo(maki, 10, 20);
    game.debug.pixel(maki.x, maki.y);
    game.debug.pixel(group.x, group.y, "#FF0000");
    game.debug.text(`Group: ${group.children.length}`, 10, 120);
}
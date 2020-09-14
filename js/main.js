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

/** @type {Phaser.Sound} */
let sound_error;
/** @type {Phaser.Sound} */
let sound_good;
/** @type {Phaser.Sound} */
let sound_great;
/** @type {Phaser.Sound} */
let sound_shween;

/** @type {Phaser.Sound} */
let music;


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


    // Audio
    game.load.audio('snd_error', 'assets/sounds/error.wav');
    game.load.audio('snd_good', 'assets/sounds/good.wav');
    game.load.audio('snd_great', 'assets/sounds/great.wav');
    game.load.audio('snd_shween', 'assets/sounds/shween.wav');

    game.load.audio('snd_music', 'assets/music/hyper-action.ogg');
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


    sound_error = game.add.audio("snd_error", 0.7);
    sound_good = game.add.audio("snd_good", 0.7);
    sound_great = game.add.audio("snd_great", 0.7);
    sound_shween = game.add.audio("snd_shween", 0.3);

    music = game.add.audio("snd_music", 1.2, true);
    music.play();

    novaRotacao();
}

function update() {
    if (elet == null) {
        elet = novoEletronico();
    }

    if (!game.physics.arcade.overlap(maki, elet, encaixaEletronico)) {

        group.forEach(e => game.physics.arcade.overlap(e, elet, derrubarEletronico, null, this));
        // if (game.physics.arcade.overlap(group, elet, derrubarEletronico)) {
        //     console.log("Oops");
        // }
    }
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
    tocaSfx(sound_shween);
    elet.body.velocity.x = 1700;
}

function encaixaEletronico() {
    tocaSfx(sound_good);
    let key = elet.key;
    elet.destroy();

    let e = game.add.sprite(0, 0, key);
    game.physics.enable(e, Phaser.Physics.ARCADE);
    e.anchor.set(0.5);
    e.pivot.x = maki.width / 2;
    e.body.angularVelocity = maki.body.angularVelocity;

    group.add(e);
    elet = null;
}

/**
 * 
 * @param {Phaser.Sprite} e 
 */
function derrubarEletronico(e) {
    tocaSfx(sound_error);
    elet.kill();
    elet = null;

    let global_pos = e.worldPosition;
    console.log(e);
    group.remove(e);
    e.x = global_pos.x;
    e.y = global_pos.y;
    // e.kill();
    // e.x = 100;
    // e.pivot.x = e.x;
    e.body.velocity.x = -game.rnd.between(30, 100);
    e.body.velocity.y = game.rnd.between(30, 100);
    // elet = novoEletronico();
}

function novaRotacao() {
    let angVel = game.rnd.between(40, 200);
    if (Math.random() > 0.5) angVel = -angVel;

    maki.body.angularVelocity = angVel;
    group.forEach(e => e.body.angularVelocity = angVel);

    setTimeout(novaRotacao, game.rnd.between(1000, 5000));
}

function render() {
    // game.debug.body(maki);
    // group.forEach((s) => {
    //     game.debug.body(s);
    //     game.debug.pixel(s.x, s.y, "#0000FF");
    // });

    // game.debug.spriteInfo(maki, 10, 20);
    // game.debug.pixel(maki.x, maki.y);
    // game.debug.pixel(group.x, group.y, "#FF0000");
    // game.debug.text(`Group: ${group.children.length}`, 10, 120);
}

/**
 * 
 * @param {Phaser.Sound} sfx 
 */
function tocaSfx(sfx) {
    if (sfx.isPlaying) sfx.stop();
    sfx.play();
}
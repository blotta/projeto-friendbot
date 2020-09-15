/** @type {Phaser.Game} */
let game;

let playState = {}

// MAKI
/** @type {Phaser.Sprite} */
let maki;

// Eletronico a ser lançado
/** @type {Phaser.Sprite} */
let elet;

// Eletronicos
/** @type {Phaser.Group} */
let elet_group;

// Gameplay
/** @type {Phaser.Group} */
let elet_combinacao;
let elet_combinacao_count = 3;
let combinacoes_completadas = 0;

/** @type {Phaser.Button} */
let lancar_button;

/** @type {Phaser.Button} */
let restart_button;

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


playState.preload = function() {

    let images = [
        "maki_top",
        "eletronico_01",
        "eletronico_02",
        "eletronico_03",
        "eletronico_04",
        "square_red",
        "restart_button"
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

playState.create = function () {
    game.physics.startSystem(Phaser.Physics.ARCADE);

    maki = game.add.sprite(game.world.width *3/4, game.world.height / 2, "spr_maki_top");
    maki.anchor.set(0.5);
    game.physics.enable(maki, Phaser.Physics.ARCADE);
    let radius = maki.width / 2;
    maki.body.setCircle(radius, (-radius + 0.5 * maki.width  / maki.scale.x), (-radius + 0.5 * maki.height / maki.scale.y));

    elet_group = game.add.group();
    elet_group.x = maki.x;
    elet_group.y = maki.y;

    elet = novoEletronico();

    lancar_button = game.add.button(game.world.centerX, game.world.height - 70, "spr_square_red", lancarEletronico, this);
    lancar_button.anchor.set(0.5);
    lancar_button.scale.set(3, 1.5);

    elet_combinacao = game.add.group();
    elet_combinacao.x = 40;
    elet_combinacao.y = 40;

    sound_error = game.add.audio("snd_error", 0.7);
    sound_good = game.add.audio("snd_good", 0.7);
    sound_great = game.add.audio("snd_great", 0.7);
    sound_shween = game.add.audio("snd_shween", 0.3);

    music = game.add.audio("snd_music", 1.2, true);
    music.play();

    combinacoes_completadas = 0;
    elet_combinacao_count = 3;

    novaCombinacao(3);
    console.log(elet_combinacao);
    novaRotacao();
}

playState.update = function() {
    if (elet == null) {
        elet = novoEletronico();
    }

    if (!game.physics.arcade.overlap(maki, elet, encaixaEletronico)) {

        elet_group.forEach(e => game.physics.arcade.overlap(e, elet, derrubarEletronico, null, this));
    }
}

playState.render = function() {
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

    elet_group.add(e);
    elet = null;

    checarCombinacao();
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
    elet_group.remove(e);
    e.x = global_pos.x;
    e.y = global_pos.y;
    e.body.velocity.x = -game.rnd.between(30, 100);
    e.body.velocity.y = game.rnd.between(30, 100);

    checarCombinacao();
}

function novaRotacao() {
    let angVel = game.rnd.between(40, 200);
    if (Math.random() > 0.5) angVel = -angVel;

    maki.body.angularVelocity = angVel;
    elet_group.forEach(e => e.body.angularVelocity = angVel);

    setTimeout(novaRotacao, game.rnd.between(1000, 5000));
}

/**
 * 
 * @param {number} n 
 */
function novaCombinacao(n) {
    n = Math.floor(n);
    let keys = [
        "spr_eletronico_01",
        "spr_eletronico_02",
        "spr_eletronico_03",
        "spr_eletronico_04"
    ];
    let picks = []
    for (let i = 0; i < n; i++) {
        picks.push(game.rnd.pick(keys));
    }
    elet_combinacao.removeAll(true);
    elet_combinacao.createMultiple(1, picks, null, true);
    elet_combinacao.forEach(e => e.scale.set(0.4));
    elet_combinacao.align(n, -1, 100, 10, Phaser.CENTER);

    tocaSfx(sound_great);
}

function checarCombinacao() {
    let keys = [
        "spr_eletronico_01",
        "spr_eletronico_02",
        "spr_eletronico_03",
        "spr_eletronico_04"
    ];
    let combs = {};
    let goal_reached = true;
    for (let k of keys) {
        let required = elet_combinacao.filter(e => e.key == k);
        let attached = elet_group.filter(e => e.key == k);

        combs[k] = { required: required, attached: attached };

        if (combs[k].attached.list.length < combs[k].required.list.length) {
            goal_reached = false;
        }
    }
    console.log(combs);

    if (goal_reached) {
        console.log("Goal reached!");

        let comb_strs = [];
        for (let k of keys) {
            for (let i = 0; i < combs[k].required.list.length; i++) {
                comb_strs.push(k);
            }
        }

        for (let e of comb_strs) {
            for (let i = 0; i < combs[e].required.list.length; i++) {
                elet_group.remove(elet_group.getFirst("key", e), true);
            }
        }

        combinacoes_completadas += 1;
        if (combinacoes_completadas < 2) {
            elet_combinacao_count = 3;
        } else if (combinacoes_completadas == 2) {
            elet_combinacao_count = 4;
        } else {
            elet_combinacao_count = 5;
        }

        if (combinacoes_completadas >= 4) {
            // ganhou jogo
            console.log("GANHOU!");
            ganhouJogo();
        }

        novaCombinacao(elet_combinacao_count);

    } else {
        console.log("Goal NOT reached!");
    }
}

function ganhouJogo() {
    let style = { font: "bold 45px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };
    let win_text = game.add.text(game.world.centerX, game.world.centerY - 150, "VOCÊ GANHOU!", style);
    win_text.anchor.set(0.5);

    lancar_button.kill();

    let restart_button = game.add.button(game.world.centerX, game.world.centerY + 50, "spr_restart_button", () => game.state.start("play"));
    restart_button.anchor.set(0.5);
}


/**
 * 
 * @param {Phaser.Sound} sfx 
 */
function tocaSfx(sfx) {
    if (sfx.isPlaying) sfx.stop();
    sfx.play();
}


/**
 * INTRO
 */

/** @type {Phaser.TileSprite} */
let introBG;

/** @type {Phaser.Sprite} */
let nave;
/** @type {Phaser.Sprite} */
let maki_quebrado;

/** @type {Phaser.Particles.Arcade.Emitter} */
let emitter;

let introState = {
    preload: function () {
        game.load.image("spr_terra", "assets/images/terra.jpg");
        game.load.image("spr_nave", "assets/images/ship.png");
        game.load.image('spr_maki_quebrado', 'assets/images/maki_quebrado.png');

        game.load.image('spr_fire1', 'assets/images/particles/fire1.png');
        game.load.image('spr_fire2', 'assets/images/particles/fire2.png');
        game.load.image('spr_fire3', 'assets/images/particles/fire3.png');
        game.load.image('spr_smoke', 'assets/images/particles/smoke-puff.png');
    },
    create: function () {
        introBG = game.add.tileSprite(0, 0, 1024, 576, 'spr_terra');
        introBG.tilePosition.x = 100;
        introBG.tilePosition.y = 50;

        // texto intro
        let style = { font: 'bold 40pt Arial', fill: 'white', align: 'left', wordWrap: true, wordWrapWidth: 450 };
        let text = game.add.text(20, 20, "Era uma vez um robô chamado MAKI", style);
        setTimeout(() => text.text = "Que costumava navegar pela galáxia", 5000);
        setTimeout(() => text.text = "Um dia sua nave teve um problema", 10000);
        setTimeout(() => text.text = "E caiu no planeta Terra...", 15000);
        setTimeout(() => {
            text.text = "";
            this.animNaveCaindo();
        }, 20000);
        setTimeout(() => {
            game.add.tween(introBG).to({alpha: 0}, 3000, Phaser.Easing.Default).start();
            maki_quebrado = game.add.sprite(game.world.centerX, game.world.centerY, "spr_maki_quebrado");
            maki_quebrado.anchor.set(0.5);
            maki_quebrado.alpha = 0;
            game.add.tween(maki_quebrado).to({alpha: 1}, 2000, Phaser.Easing.Default, false, 1000).start();
        }, 25000);
        setTimeout(() => {
            text.text = "Ajude-o a se reconstruir!";
        }, 28000);
        setTimeout(() => {
            game.state.start("play");
        }, 32000);

    },
    update: function () {
    },
    render: function () {},

    animNaveCaindo() {
        nave = game.add.sprite(game.world.width + 100, game.world.centerY, 'spr_nave');
        nave.anchor.set(0.5);
        nave.scale.set(-0.4, 0.4);
        nave.angle = -30;

        emitter = game.add.emitter(0, 0);

        emitter.makeParticles( [ 'spr_fire1', 'spr_fire2', 'spr_fire3', 'spr_smoke' ] );
        emitter.setAlpha(1, 0, 3000);
        emitter.setScale(0.8, 0, 0.8, 0, 3000);
        emitter.emitX = nave.x;
        emitter.emitY = nave.y;

        let anim01 = game.add.tween(nave).to({
            x: game.world.centerX + 10,
            y: game.world.centerY + 80,
            angle: -50
        }, 4000, Phaser.Easing.Default);

        let anim02 = game.add.tween(nave.scale).to({
            x: -0.005,
            y: 0.005
        }, 4000, Phaser.Easing.Default);

        anim01.onComplete.add(() => {
            emitter.emitX = nave.x;
            emitter.emitY = nave.y;
            emitter.start(true, 1000, null, 20);
            nave.destroy();
        });
        anim01.start();
        anim02.start();
    },
}

window.onload = function() {

    game = new Phaser.Game(1024, 576, Phaser.AUTO, 'gamewindow');

    game.state.add('intro', introState);
    game.state.add('play', playState);

    game.state.start('intro');
};
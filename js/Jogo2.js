Game.Jogo2 = function(game) {
    this.sprites = [
        'earth',
        'red-planet',
        'rocket',
        'alien',
        'spaceship',
        'sun',
        'comet',
        'empty'
    ];
    this.sounds = {
        earth: null,
        "red-planet": null,
        rocket: null,
        alien: null,
        spaceship: null,
        sun: null,
        comet: null,
        empty: null,
    };

    this.gamestate = 'edit'; // edit, playing, menu

    this.sel_grp = null;
    this.btn_grp = null;

    this.selected_btn = null;

    this.sheet = null; // group
    this.cell_size = 0;
    this.w_count = 32;
    this.h_count = 8;
    this.sheet_initial_x = null;
    this.sheet_old_x = null;
    this.touch_start_x = 0;
    this.touch_start_y = 0;
    this.touch_end = null;

    this.subdiv = null; // group

    this.dragging = false;
    this.drag_threshold = 20;
    this.possible_set_cell = null;

    // Player
    this.player_marker = null;
    this.player_playbtn = null;
    this.player_speed = 160; // bmp - beats per minute
    this.step_time = 0; // 60000 / bmp
    this.should_loop = false;

    // Menu
    this.menu_btn = null;
    this.submenu_buttons = null;
    this.loop_btn = null;
}

Game.Jogo2.prototype = {
    preload: function() {
        if (Game.music != null && Game.music.isPlaying) {
            Game.music.stop();
        }
        this.stage.backgroundColor = "#f2f2f2";

        // Load sounds
        // Drums
        this.sounds.earth = this.add.sound('sndBassDrum', 1, false);
        this.sounds['red-planet'] = this.add.sound('sndSnare', 1, false);
        this.sounds.rocket = this.add.sound('sndHithat', 1, false);

        // Notes
        this.sounds.alien = this.add.sound('sndSynthBass8', 1, false);
        this.sounds.spaceship = this.add.sound('sndChords8', 0.7, false);
        this.sounds.sun = this.add.sound('sndXylo8', 1, false);
        this.sounds.comet = this.add.sound('sndSynthLead8', 1, false);

        for (let snd of ['alien', 'spaceship', 'sun', 'comet']) {
            this.sounds[snd].allowMultiple = true;
            // e.g C D E F G A B C (C major)
            for (let i = 0; i < 8; i++) {
                this.sounds[snd].addMarker(i.toString(), i, 1, 1, false);
            }
        }

        // Init selection group
        this.sel_grp = this.add.group();
        this.sel_grp.scale.set(0.6);
        this.sel_grp.x = this.camera.bounds.centerX;
        this.sel_grp.y = 0;

        const panel = this.add.sprite(0, 0, 'notes-panel');
        panel.anchor.set(0.5, 0);
        this.sel_grp.add(panel);

        this.btn_grp = this.add.group();
        this.sel_grp.add(this.btn_grp);
        for (let spr of this.sprites) {
            if (spr == 'empty') continue;
            let btn = this.add.button(0, 0, "si-" + spr, this.selectSound, this);
            btn.data.key = spr;
            btn.anchor.set(0.5, 0);
            // btn.onDownSound = this.sounds[spr];
            // if (this.sprites.indexOf(spr) >= 3) {
            //     btn.onDownSoundMarker = 5;
            // }
            this.btn_grp.add(btn);
        }
        this.btn_grp.align(7, 1, 128, 128);
        this.btn_grp.x = -64 * 7;
        this.btn_grp.y = 4;

        this.selectSound('alien');


        // Music sheet
        this.sheet = this.add.group();
        this.cell_size = 48;
        this.w_count = 32;
        this.h_count = 8;
        const pad = 0;

        for (let i = 0; i < this.w_count * this.h_count; i++) {
            const empty_frame = this.sprites.indexOf('empty');
            let btn = this.add.button(0, 0, 'space-icons');
            btn.setFrames(empty_frame, empty_frame);
            btn.data.key = 'empty';
            btn.data.cx = Math.floor(i / this.h_count);
            btn.data.cy = i % this.h_count;
            this.sheet.add(btn);
        }

        this.sheet.align(-1, this.h_count, this.cell_size + pad, this.cell_size + pad);
        this.sheet.x = this.cell_size / 2;
        this.sheet.y = this.camera.bounds.height - this.cell_size * this.h_count - this.cell_size * 3/4;
        this.sheet_initial_x = this.sheet.x;
        this.sheet_old_x = this.sheet.x;

        // Sheet subdivision
        this.subdiv = this.add.group();
        this.subdiv.x = this.sheet.x;
        this.subdiv.y = this.sheet.y;
        const bmp = this.add.bitmapData((this.cell_size + pad) * 4, (this.cell_size + pad) * this.h_count, 'subdivision', true);
        bmp.fill(200, 200, 200, 255);
        const subdiv_step = (this.cell_size + pad) * 4;
        for (let i = 0; i < this.w_count / 4; i += 2) {
            this.subdiv.create(i * subdiv_step, 0, this.cache.getBitmapData('subdivision'));
        }

        this.world.bringToTop(this.sheet);

        this.sheet.onChildInputDown.add(this.sheetTouchStart.bind(this));
        this.sheet.onChildInputUp.add(this.sheetTouchEnd.bind(this));


        /* Player */
        ////////////
        const marker_bmp = this.add.bitmapData(5, (this.cell_size + pad) * this.h_count, 'player_marker', true);
        marker_bmp.fill(33, 33, 33, 255);
        this.player_marker = this.subdiv.create(0, 0, this.cache.getBitmapData('player_marker'));
        this.world.bringToTop(this.player_marker);

        this.player_playbtn = this.add.button(this.sheet.x, 0, 'menu_buttons', this.togglePlaySong, this, 0, 0);

        this.step_time = 60000 / this.player_speed; // ms per beat


        /* Menu */
        //////////
        this.menu_btn = this.add.button(this.camera.bounds.width - this.sheet.x, 0, 'menu_buttons', this.toggleMenu, this, 2, 2);
        this.menu_btn.anchor.set(1, 0);

        this.submenu_buttons = this.add.group();

        this.loop_btn = this.add.button(0, 0, 'menu_buttons', this.toggleShouldLoop, this, 4, 4);
        this.submenu_buttons.add(this.loop_btn);

        const clear_btn = this.add.button(0, 0, 'menu_buttons', this.clearSheet, this, 7, 7);
        this.submenu_buttons.add(clear_btn);

        const exit_btn = this.add.button(0, 0, 'menu_buttons',() => {this.state.start('MainMenu');}, this, 6, 6);
        this.submenu_buttons.add(exit_btn);

        this.submenu_buttons.align(-1, 1, 160, 128);

        this.submenu_buttons.alignTo(this.menu_btn, Phaser.BOTTOM_RIGHT);
        this.submenu_buttons.x = this.camera.bounds.width;

        console.log(this.menu_btn);
        console.log(this.submenu_buttons);
    },

    toggleMenu: function(btn) {
        if (this.gamestate != 'menu') {
            if (this.gamestate == 'playing') this.togglePlaySong();
            this.gamestate = 'menu';
            this.menu_btn.setFrames(3, 3);
            this.player_playbtn.inputEnabled = false;
            this.add.tween(this.submenu_buttons)
                .to({x: this.menu_btn.x - 160 * this.submenu_buttons.children.length}, 500, Phaser.Easing.Exponential.Out, true);
        } else {
            this.gamestate = 'edit';
            this.menu_btn.setFrames(2, 2);
            this.player_playbtn.inputEnabled = true;
            this.add.tween(this.submenu_buttons)
                .to({x: this.camera.bounds.width}, 500, Phaser.Easing.Exponential.Out, true);
        }
    },

    toggleShouldLoop: function() {
        this.should_loop = !this.should_loop;
        const frame = this.should_loop ? 5 : 4;
        this.loop_btn.setFrames(frame, frame);
    },

    create: function() {
        this.loadCells(Game.default_song);
    },

    update: function() {
        if (this.gamestate == 'edit') {
            if (this.dragging == false && this.possible_set_cell != null) {
                const dist = this.math.distance(this.input.activePointer.x, this.input.activePointer.y, this.touch_start_x, this.touch_start_y);
                if (dist > this.drag_threshold) {
                    this.dragging = true;
                    this.sheet_old_x = this.sheet.x;
                }
            }

            if (this.dragging) {
                const xoffset = this.input.activePointer.x - this.touch_start_x;
                this.sheet.x = this.sheet_old_x + xoffset;
                // this.subdiv.x = this.sheet.x;
            }
        } else if (this.gamestate == 'playing') {

        }
    },

    postUpdate: function() {
        this.subdiv.x = this.sheet.x;
    },

    togglePlaySong: function(btn = null) {
        this.sheet.x = this.sheet_initial_x;

        if (this.gamestate == 'edit') {
            this.gamestate = 'playing';
            this.player_playbtn.setFrames(1, 1);
            this.playBeat(0);
            this._printSong();
        } else if (this.gamestate == 'playing') {
            this.gamestate = 'edit';
            this.player_playbtn.setFrames(0, 0);
            this.player_marker.x = 0;
            this.sheet.x = this.sheet_initial_x;
        }
    },

    playBeat: function(beat) {
        // play beat. Assumes beat exists
        if (this.gamestate == 'playing') this.playSoundsInBeat(beat);
        if (beat == 0) this.sheet.x = this.sheet_initial_x;

        // Determine next beat
        let nextBeat = beat + 1;
        if (nextBeat > this.w_count - 1) {
            if (this.should_loop) {
                nextBeat = 0;
            } else {
                // song ended. no loop
                this.togglePlaySong();
                return;
            }
        } else if (this.gamestate != 'playing') {
            // pressed menu or play button. stop song
            this.add.tween(this.player_marker)
                .to({x: 0}, 200, Phaser.Easing.Exponential.Out, true);
            return;
        }

        // Move marker to front of beat that was just played
        this.add.tween(this.player_marker).to({x: nextBeat * this.cell_size}, this.step_time - 50, Phaser.Easing.Exponential.Out, true);

        // setup next time playBeat should play next beat
        this.time.events.add(this.step_time, () => {
            this.playBeat(nextBeat);
        }, this);

        // offset sheet so marker is visible
        let offset = this.camera.bounds.centerX
        if (this.player_marker.x > offset &&
            this.player_marker.x < this.cell_size * this.w_count - offset + this.cell_size) {

            this.add.tween(this.sheet).to({x: offset - this.player_marker.x},
                this.step_time - 50, Phaser.Easing.Exponential.Out, true);
        }

    },

    sheetTouchStart: function(obj, pointer) {
        if (this.gamestate != 'edit') return;
        this.possible_set_cell = obj;
        this.touch_start_x = pointer.x;
        this.touch_start_y = pointer.y;
    },
    sheetTouchEnd: function(obj, pointer) {
        if (this.gamestate != 'edit') return;

        if (this.dragging) {
            this.dragging = false;
        } else {
            this.setSound(this.possible_set_cell);
        }

        this.possible_set_cell = null;

        if (this.sheet.x > this.sheet_initial_x) {
            this.add.tween(this.sheet).to({x: this.sheet_initial_x}, 300, Phaser.Easing.Exponential.Out, true);
        } else if (this.sheet.x + this.cell_size * this.w_count + this.cell_size / 2 < this.camera.bounds.width) {
            let targetX = this.camera.bounds.width - this.cell_size * this.w_count - this.cell_size / 2;
            this.add.tween(this.sheet).to({x: targetX}, 300, Phaser.Easing.Exponential.Out, true);
        }
    },

    selectSound: function(input) {
        // deselect previous
        if (this.selected_btn != null) {
            this.add.tween(this.selected_btn.scale)
                .to({x: 1, y: 1}, 300, Phaser.Easing.Bounce.Out, true);
        }

        // select next
        let key;
        if (typeof input == 'string') {
            key = input;
        } else {
            key = input.data.key;
        }
        let idx = this.sprites.indexOf(key);
        this.selected_btn = this.btn_grp.children[idx];
        this.add.tween(this.selected_btn.scale)
            .to({x: 1.7, y: 1.7}, 300, Phaser.Easing.Bounce.Out, true);

        // play sound
        if (idx < 3) {
            // drums
            this.sounds[key].play();
        } else {
            // A
            this.sounds[key].play(5);
            if (key == 'comet') {
                this.time.events.add(
                    this.step_time / 2,
                    () => {this.sounds['comet'].play(5);},
                    this);
            }
        }
    },

    setSound: function(cell) {

        if (cell.data.key == 'empty') {
            cell.data.key = this.selected_btn.data.key;
            if (this.sprites.indexOf(cell.data.key) < 3){
                this.sounds[cell.data.key].play()
            } else {
                this.sounds[cell.data.key].play(this.h_count - cell.data.cy - 1);
                if (cell.data.key == 'comet') {
                    this.time.events.add(
                        this.step_time / 2,
                        () => {this.sounds['comet'].play(this.h_count - cell.data.cy - 1);},
                        this);
                }
            }
        } else {
            cell.data.key = 'empty';
        }

        const frame = this.sprites.indexOf(cell.data.key);
        cell.setFrames(frame, frame);
    },

    clearSheet: function() {
        for (let cell of this.sheet.children) {
            cell.data.key = 'empty';
            const frame = this.sprites.indexOf('empty')
            cell.setFrames(frame, frame);
        }
    },

    loadCells: function(obj) {
        this.clearSheet();
        for (let cell of obj.cells) {
            let idx = (this.h_count * cell.cx) + cell.cy;
            this.sheet.children[idx].data.key = cell.key;
            const frame = this.sprites.indexOf(cell.key);
            this.sheet.children[idx].setFrames(frame, frame);
        }
    },

    playSoundsInBeat: function(col) {
        const first_idx = col * this.h_count;
        const last_idx = first_idx + this.h_count - 1;
        const cells = this.sheet.children.slice(first_idx, last_idx + 1);

        for (let cell of cells) {
            if (cell.data.key == 'empty') continue;
            if (this.sprites.indexOf(cell.data.key) >= 3) {
                this.sounds[cell.data.key].play(this.h_count - cell.data.cy - 1);
                if (cell.data.key == 'comet') {
                    this.time.events.add(
                        this.step_time / 2,
                        () => {this.sounds['comet'].play(this.h_count - cell.data.cy - 1);},
                        this);
                }
            } else {
                this.sounds[cell.data.key].play();
            }
        }
    },

    _printSong: function() {
        const song = {};
        song.w_count = this.w_count;
        song.h_count = this.h_count;
        song.cells = [];
        for (let cell of this.sheet.children) {
            if (cell.data.key == 'empty') continue;
            song.cells.push({key: cell.data.key, cx: cell.data.cx, cy: cell.data.cy});
        }
        console.log(song);
    }

}

Game.default_song = {
  "w_count": 32,
  "h_count": 8,
  "cells": [
    {
      "key": "earth",
      "cx": 0,
      "cy": 0
    },
    {
      "key": "sun",
      "cx": 0,
      "cy": 2
    },
    {
      "key": "comet",
      "cx": 0,
      "cy": 4
    },
    {
      "key": "alien",
      "cx": 0,
      "cy": 7
    },
    {
      "key": "rocket",
      "cx": 1,
      "cy": 0
    },
    {
      "key": "spaceship",
      "cx": 1,
      "cy": 5
    },
    {
      "key": "comet",
      "cx": 1,
      "cy": 7
    },
    {
      "key": "red-planet",
      "cx": 2,
      "cy": 0
    },
    {
      "key": "comet",
      "cx": 2,
      "cy": 3
    },
    {
      "key": "alien",
      "cx": 2,
      "cy": 7
    },
    {
      "key": "rocket",
      "cx": 3,
      "cy": 0
    },
    {
      "key": "spaceship",
      "cx": 3,
      "cy": 5
    },
    {
      "key": "comet",
      "cx": 3,
      "cy": 7
    },
    {
      "key": "earth",
      "cx": 4,
      "cy": 0
    },
    {
      "key": "sun",
      "cx": 4,
      "cy": 1
    },
    {
      "key": "comet",
      "cx": 4,
      "cy": 6
    },
    {
      "key": "alien",
      "cx": 4,
      "cy": 7
    },
    {
      "key": "rocket",
      "cx": 5,
      "cy": 0
    },
    {
      "key": "spaceship",
      "cx": 5,
      "cy": 4
    },
    {
      "key": "comet",
      "cx": 5,
      "cy": 7
    },
    {
      "key": "red-planet",
      "cx": 6,
      "cy": 0
    },
    {
      "key": "comet",
      "cx": 6,
      "cy": 5
    },
    {
      "key": "alien",
      "cx": 6,
      "cy": 7
    },
    {
      "key": "rocket",
      "cx": 7,
      "cy": 0
    },
    {
      "key": "spaceship",
      "cx": 7,
      "cy": 4
    },
    {
      "key": "comet",
      "cx": 7,
      "cy": 7
    },
    {
      "key": "sun",
      "cx": 8,
      "cy": 0
    },
    {
      "key": "earth",
      "cx": 8,
      "cy": 1
    },
    {
      "key": "comet",
      "cx": 8,
      "cy": 2
    },
    {
      "key": "alien",
      "cx": 8,
      "cy": 7
    },
    {
      "key": "rocket",
      "cx": 9,
      "cy": 0
    },
    {
      "key": "sun",
      "cx": 9,
      "cy": 1
    },
    {
      "key": "comet",
      "cx": 9,
      "cy": 3
    },
    {
      "key": "spaceship",
      "cx": 9,
      "cy": 5
    },
    {
      "key": "red-planet",
      "cx": 10,
      "cy": 0
    },
    {
      "key": "sun",
      "cx": 10,
      "cy": 2
    },
    {
      "key": "comet",
      "cx": 10,
      "cy": 6
    },
    {
      "key": "alien",
      "cx": 10,
      "cy": 7
    },
    {
      "key": "rocket",
      "cx": 11,
      "cy": 0
    },
    {
      "key": "sun",
      "cx": 11,
      "cy": 3
    },
    {
      "key": "spaceship",
      "cx": 11,
      "cy": 5
    },
    {
      "key": "comet",
      "cx": 11,
      "cy": 7
    },
    {
      "key": "earth",
      "cx": 12,
      "cy": 0
    },
    {
      "key": "sun",
      "cx": 12,
      "cy": 4
    },
    {
      "key": "comet",
      "cx": 12,
      "cy": 5
    },
    {
      "key": "alien",
      "cx": 12,
      "cy": 7
    },
    {
      "key": "rocket",
      "cx": 13,
      "cy": 0
    },
    {
      "key": "comet",
      "cx": 13,
      "cy": 3
    },
    {
      "key": "spaceship",
      "cx": 13,
      "cy": 4
    },
    {
      "key": "sun",
      "cx": 13,
      "cy": 7
    },
    {
      "key": "red-planet",
      "cx": 14,
      "cy": 0
    },
    {
      "key": "sun",
      "cx": 14,
      "cy": 3
    },
    {
      "key": "comet",
      "cx": 14,
      "cy": 6
    },
    {
      "key": "alien",
      "cx": 14,
      "cy": 7
    },
    {
      "key": "rocket",
      "cx": 15,
      "cy": 0
    },
    {
      "key": "spaceship",
      "cx": 15,
      "cy": 4
    },
    {
      "key": "comet",
      "cx": 15,
      "cy": 7
    },
    {
      "key": "earth",
      "cx": 16,
      "cy": 0
    },
    {
      "key": "sun",
      "cx": 16,
      "cy": 2
    },
    {
      "key": "comet",
      "cx": 16,
      "cy": 4
    },
    {
      "key": "alien",
      "cx": 16,
      "cy": 7
    },
    {
      "key": "rocket",
      "cx": 17,
      "cy": 0
    },
    {
      "key": "spaceship",
      "cx": 17,
      "cy": 5
    },
    {
      "key": "comet",
      "cx": 17,
      "cy": 7
    },
    {
      "key": "red-planet",
      "cx": 18,
      "cy": 0
    },
    {
      "key": "comet",
      "cx": 18,
      "cy": 3
    },
    {
      "key": "alien",
      "cx": 18,
      "cy": 7
    },
    {
      "key": "rocket",
      "cx": 19,
      "cy": 0
    },
    {
      "key": "spaceship",
      "cx": 19,
      "cy": 5
    },
    {
      "key": "comet",
      "cx": 19,
      "cy": 7
    },
    {
      "key": "earth",
      "cx": 20,
      "cy": 0
    },
    {
      "key": "sun",
      "cx": 20,
      "cy": 1
    },
    {
      "key": "comet",
      "cx": 20,
      "cy": 6
    },
    {
      "key": "alien",
      "cx": 20,
      "cy": 7
    },
    {
      "key": "rocket",
      "cx": 21,
      "cy": 0
    },
    {
      "key": "spaceship",
      "cx": 21,
      "cy": 4
    },
    {
      "key": "comet",
      "cx": 21,
      "cy": 7
    },
    {
      "key": "red-planet",
      "cx": 22,
      "cy": 0
    },
    {
      "key": "comet",
      "cx": 22,
      "cy": 5
    },
    {
      "key": "alien",
      "cx": 22,
      "cy": 7
    },
    {
      "key": "rocket",
      "cx": 23,
      "cy": 0
    },
    {
      "key": "spaceship",
      "cx": 23,
      "cy": 4
    },
    {
      "key": "comet",
      "cx": 23,
      "cy": 7
    },
    {
      "key": "earth",
      "cx": 24,
      "cy": 0
    },
    {
      "key": "sun",
      "cx": 24,
      "cy": 2
    },
    {
      "key": "comet",
      "cx": 24,
      "cy": 4
    },
    {
      "key": "alien",
      "cx": 24,
      "cy": 7
    },
    {
      "key": "rocket",
      "cx": 25,
      "cy": 0
    },
    {
      "key": "sun",
      "cx": 25,
      "cy": 4
    },
    {
      "key": "spaceship",
      "cx": 25,
      "cy": 5
    },
    {
      "key": "comet",
      "cx": 25,
      "cy": 6
    },
    {
      "key": "red-planet",
      "cx": 26,
      "cy": 0
    },
    {
      "key": "sun",
      "cx": 26,
      "cy": 1
    },
    {
      "key": "comet",
      "cx": 26,
      "cy": 3
    },
    {
      "key": "alien",
      "cx": 26,
      "cy": 7
    },
    {
      "key": "rocket",
      "cx": 27,
      "cy": 0
    },
    {
      "key": "comet",
      "cx": 27,
      "cy": 5
    },
    {
      "key": "spaceship",
      "cx": 27,
      "cy": 7
    },
    {
      "key": "earth",
      "cx": 28,
      "cy": 0
    },
    {
      "key": "sun",
      "cx": 28,
      "cy": 3
    },
    {
      "key": "comet",
      "cx": 28,
      "cy": 6
    },
    {
      "key": "alien",
      "cx": 28,
      "cy": 7
    },
    {
      "key": "earth",
      "cx": 29,
      "cy": 0
    },
    {
      "key": "sun",
      "cx": 29,
      "cy": 1
    },
    {
      "key": "comet",
      "cx": 29,
      "cy": 3
    },
    {
      "key": "spaceship",
      "cx": 29,
      "cy": 7
    },
    {
      "key": "sun",
      "cx": 30,
      "cy": 0
    },
    {
      "key": "comet",
      "cx": 30,
      "cy": 1
    },
    {
      "key": "red-planet",
      "cx": 30,
      "cy": 2
    },
    {
      "key": "alien",
      "cx": 30,
      "cy": 7
    },
    {
      "key": "comet",
      "cx": 31,
      "cy": 0
    },
    {
      "key": "rocket",
      "cx": 31,
      "cy": 1
    },
    {
      "key": "red-planet",
      "cx": 31,
      "cy": 2
    },
    {
      "key": "spaceship",
      "cx": 31,
      "cy": 4
    },
    {
      "key": "alien",
      "cx": 31,
      "cy": 7
    }
  ]
}
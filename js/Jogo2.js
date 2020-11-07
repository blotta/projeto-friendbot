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

    this.gamestate = 'edit'; // edit, playing

    this.sel_grp = null;
    this.btn_grp = null;

    this.selected_btn = null;

    // this.sheet.data.grid -> 2d array meta data
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
    this.player_curr_beat = 0;
    this.player_playbtn = null;
    this.player_speed = 160; // bmp - beats per minute
    this.step_time = 0;
}

Game.Jogo2.prototype = {
    preload: function() {
        if (Game.music.isPlaying) {
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
            // this.sounds[snd] = this.add.audio('sndSynthBass8', 1, false);
            this.sounds[snd].allowMultiple = true;
            // e.g C D E F A B C (C major)
            for (let i = 0; i < 8; i++) {
                this.sounds[snd].addMarker(i.toString(), i, 1, 1, false);
            }
        }
        // this.sounds.empty = this.add.sound('sndC1Start', 0.1, false);

        // Init selection group
        this.sel_grp = this.add.group();
        this.sel_grp.scale.set(0.6);
        this.sel_grp.x = this.camera.bounds.centerX;
        this.sel_grp.y = 0;
        // this.select_grp.x = this.camera.bounds.width/2;

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
            let btn = this.add.button(0, 0, 'space-icons'); // , () => {}, this, empty_frame, empty_frame);
            btn.setFrames(empty_frame, empty_frame);
            btn.data.key = 'empty';
            btn.data.cx = Math.floor(i / this.h_count);
            btn.data.cy = i % this.h_count;
            // btn.setFrame(7);
            this.sheet.add(btn);
        }

        this.sheet.align(-1, this.h_count, this.cell_size + pad, this.cell_size + pad);
        this.sheet.x = this.cell_size / 2;
        // this.sheet.y = this.camera.bounds.centerY - cell_size * this.h_count / 2;
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
            // this.add.sprite(this.sheet.x + i * subdiv_step, this.sheet.y, this.cache.getBitmapData('subdivision'));
            this.subdiv.create(i * subdiv_step, 0, this.cache.getBitmapData('subdivision'));
        }

        this.world.bringToTop(this.sheet);

        this.sheet.onChildInputDown.add(this.sheetTouchStart.bind(this));
        this.sheet.onChildInputUp.add(this.sheetTouchEnd.bind(this));

        // Player
        const marker_bmp = this.add.bitmapData(5, (this.cell_size + pad) * this.h_count, 'player_marker', true);
        marker_bmp.fill(33, 33, 33, 255);
        this.player_marker = this.subdiv.create(0, 0, this.cache.getBitmapData('player_marker'));
        this.world.bringToTop(this.player_marker);

        this.player_playbtn = this.add.button(this.sheet.x, 0, 'play-pause-button', this.togglePlaySong, this, 0, 0);
        // this.player_playbtn.scale.set(0.6);

        this.step_time = 60000 / this.player_speed; // ms per beat

        /* Back to menu button */
        this.add.button(this.camera.bounds.width - this.sheet.x, 0, 'back-button', () => {
            this.state.start('MainMenu');
        }, this).anchor.set(1, 0);

    },

    create: function() {},

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

    togglePlaySong: function(btn) {
        this.sheet.x = this.sheet_initial_x;

        if (this.gamestate == 'edit') {
            this.gamestate = 'playing';
            if (btn) btn.setFrames(1, 1);
            this.stepSong();
        } else if (this.gamestate == 'playing') {
            this.gamestate = 'edit';
            if (btn) btn.setFrames(0, 0);
            this.player_marker.x = 0;
            this.player_curr_beat = 0;
        }
    },

    stepSong: function() {
        // play sounds in beat
        if (this.gamestate == 'playing') this.playSoundsInBeat(this.player_curr_beat);

        // setup next step
        let nextStep = this.player_marker.x + this.cell_size;
        if (nextStep > this.cell_size * this.w_count) {
            this.togglePlaySong();
            return;
        } else if (this.gamestate != 'playing') {
            this.add.tween(this.player_marker)
                .to({x: 0}, 200, Phaser.Easing.Exponential.Out, true);
            return;
        }

        this.player_curr_beat++;
        this.add.tween(this.player_marker).to({x: nextStep}, this.step_time - 50, Phaser.Easing.Exponential.Out, true);
        this.time.events.add(this.step_time, () => {
            this.stepSong();
        }, this);

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
            // this.add.tween(this.subdiv).to({x: this.sheet_initial_x}, 300, Phaser.Easing.Exponential.Out, true);
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
    }

}
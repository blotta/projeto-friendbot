
Game.Jogo1 = function(game) {
    this.elet_images = [
        "eletronico_01",
        "eletronico_02",
        "eletronico_03",
        "eletronico_04",
    ];

    this.rot_group = null;

    this.maki = null;
    this.elet = null;

    this.launch_button = null;
    this.restart_button = null;

    this.change_rot_timer = null;

    this.combination = {
        completed: 0,
        count: 3,
        current: null,
        group: null,
    };

    this.gamewon = false;

    this.sfx = {
        error: null,
        good: null,
        great: null,
        shween: null,
        new_comb_init: null,
        new_comb_done: null,
        comb_complete: null,
        attach: null,
        drop: null,
        win: null,
    };

    // Battery
    this.battery_cells = null;

    // Menu
    this.submenu = null;

}

Game.Jogo1.prototype = {
    preload: function() {

        this.physics.startSystem(Phaser.Physics.ARCADE);

        // this.sfx.good = this.add.audio('sndGood');
        // this.sfx.great = this.add.audio('sndGreat');
        this.sfx.launch = this.add.audio('sndShween', 0.5);
        this.sfx.new_comb_init = this.add.audio('sndC1Start', 0.1);
        this.sfx.new_comb_done = this.add.audio('sndC1Stop', 0.1);
        this.sfx.attach = this.add.audio('sndGood', 0.1);
        this.sfx.comb_complete = this.add.audio('sndFinish', 0.1);
        this.sfx.drop = this.add.audio('sndError', 0.1);
        this.sfx.win = this.add.audio('sndApplause', 0.1);

        // setup rotating group
        this.rot_group = this.add.group();
        this.rot_group.enableBody = true;
        this.rot_group.enableDebugBody = true;
        this.rot_group.physicsBodyType = Phaser.Physics.ARCADE;
        this.rot_group.x = this.world.width * 3/4;
        this.rot_group.y = this.world.height * 1/2;

        // Create Maki and add to group
        this.maki = this.rot_group.create(0, 0, "maki_top");
        this.maki.anchor.set(0.5);
        this.maki.name = "maki";
        // this.physics.enable(this.maki, Phaser.Physics.ARCADE);

        // Set angular velocity for all in group
        this.setRotGroupAngVel(this.rnd.between(40, 170));
        this.setRotationChangeTimer();

        // Launch Button
        this.launch_button = this.add.button(this.camera.bounds.width * 1/4, this.world.height - 10, 'launch_button', this.launchElet, this, 0, 0, 1, 0);
        this.launch_button.anchor.set(0.5, 1);
        this.launch_button.scale.set(0.7);

        // Electronic to be launched
        this.elet = null;

        // combination
        this.combination.group = this.add.group();
        this.combination.group.x = -600;
        this.newCombination();
        // this.add.tween(this.combination.group).to({x: 0}, 1000, Phaser.Easing.Elastic.Out, true);

        // this.time.events.add(Phaser.Timer.SECOND * 5, () => {
        //     this.add.tween(this.combination.group).to({x: -600}, 1000, Phaser.Easing.Elastic.In, true);
        // }, this);

        /* BATTERY */
        let battery_holder = this.add.sprite(this.camera.bounds.width * 3/4, 0, 'battery_holder');
        battery_holder.x -= battery_holder.width/2;

        this.battery_cells = this.add.group();
        this.battery_cells.x = battery_holder.x;

        /* MENU */
        let menu_scale = 0.5;
        let menu_btn = this.add.button(this.camera.bounds.width, 0, 'menu_buttons', this.toggleMenu, this, 2, 2);
        menu_btn.anchor.set(1, 0);
        menu_btn.scale.set(menu_scale);

        this.submenu = this.add.group();
        this.submenu.scale.set(menu_scale);

        // let other_btn = this.add.button(0, 0, 'menu_buttons', () => {}, this, 7, 7);
        // this.submenu.add(other_btn);

        let exit_btn = this.add.button(0, 0, 'menu_buttons', this.gotoMainMenu, this, 6, 6);
        this.submenu.add(exit_btn);


        this.submenu.alignTo(menu_btn, Phaser.BOTTOM_RIGHT);
        this.submenu.x = this.camera.bounds.width;
        this.submenu.align(-1, 1, exit_btn.width, exit_btn.height);
    },

    toggleMenu: function(menu_btn) {
        if (menu_btn.frame == 2) {
            menu_btn.setFrames(3, 3);
            this.showSubmenu();
        } else if (menu_btn.frame == 3) {
            menu_btn.setFrames(2, 2);
            this.hideSubmenu();
        }
    },

    showSubmenu: function() {
        this.add.tween(this.submenu)
            .to({x: this.camera.bounds.width - this.submenu.children.length * this.submenu.children[0].width * this.submenu.scale.x}, 300, Phaser.Easing.Cubic.Out, true);
    },

    hideSubmenu: function() {
        this.add.tween(this.submenu)
            .to({x: this.camera.bounds.width}, 300, Phaser.Easing.Cubic.Out, true);

    },

    create: function() {

    },

    update: function() {

        if (this.elet == null || !this.elet.alive) {
            this.newElet();
        }
        // console.log("ELET:", this.elet);

        this.physics.arcade.overlap(
            this.elet, this.rot_group,
            (elet, rot_elem) => {
                // console.log(elet.key, rot_elem.key);
                if (rot_elem.name == "maki") {
                    this.attachElet(this.elet.key);
                    this.elet.kill();
                    // this.elet.data.rotating = true;
                } else {
                    // drop both
                    this.sfx.drop.play();
                    rot_elem.kill();
                    elet.kill();
                }
            }, null, this);
        
        if (this.change_rot_timer.timer.expired) {
            this.setRotationChangeTimer();
        }

        // this.combination.group.x -= 10 * this.time.elapsed / 1000;
    },

    postUpdate: function() {
        this.rot_group.forEachDead((e) => {
            e.destroy();
            // console.log('OK');
        });
    },

    setRotationChangeTimer: function() {
        const interval = this.rnd.between(3, 6);
        let angVel = this.rnd.between(50, 170);
        if (Math.random() > 0.5) angVel = -angVel; 
        this.change_rot_timer = this.time.events.add(
            Phaser.Timer.SECOND * interval,
            this.setRotGroupAngVel, this, angVel);
    },

    setRotGroupAngVel: function(v) {
        this.rot_group.forEach((e) => e.body.angularVelocity = v);
    },

    attachElet: function(key) {
        this.sfx.attach.play();
        // console.log(key);
        const e = this.rot_group.create(0, 0, key);
        e.anchor.set(0.5);
        e.pivot.x = this.maki.width/2;
        e.body.angularVelocity = this.maki.body.angularVelocity;


        this.checkCombination();
    },

    newElet: function() {
        this.highlightAttachedRequiredElets();
        if (this.elet != null) this.elet.destroy();
        const key = this.rnd.pick(this.elet_images);
        const e = this.add.sprite(this.world.width * 1/4, this.world.centerY, key);
        e.anchor.set(0.5);
        this.physics.enable(e, Phaser.Physics.ARCADE);
        this.elet = e;
    },

    launchElet: function() {
        this.elet.body.velocity.x = 1700;
        this.sfx.launch.play();
    },

    switchCombination: function() {
        this.newCombination();
        this.add.tween(this.combination.group).to({x: 0}, 1000, Phaser.Easing.Elastic.Out, true);
    },
    newCombination: function() {
        let picks = [];
        for (let i = 0; i < this.combination.count; i++) {
            picks.push(this.rnd.pick(this.elet_images));
        }

        // Tween out of screen
        this.add.tween(this.combination.group).to({x: -600}, 1000, Phaser.Easing.Elastic.In, true, 200);
        if (this.combination.completed > 0) {
            this.sfx.new_comb_init.play();
        }

        this.input.enabled = false;

        // After it's out of screen (same amount of time)
        this.time.events.add(Phaser.Timer.SECOND * 1.5, () => {
            this.combination.group.removeAll(true);
            this.combination.group.createMultiple(1, picks, null, true);
            this.combination.group.forEach(e => {
                e.scale.set(0.4);
                e.anchor.set(0.5);
            });
            this.combination.group.align(this.combination.count, -1, 100, 100, Phaser.CENTER);
            this.sfx.new_comb_done.play();

            // Tween into screen with new combination
            this.add.tween(this.combination.group).to({x: 0}, 1000, Phaser.Easing.Elastic.Out, true);

            this.input.enabled = true;

            this.highlightAttachedRequiredElets();
        }, this);

    },

    checkCombination: function() {
        let combs = {};
        let goal_reached = true;
        for (let k of this.elet_images) {
            let required = this.combination.group.filter(e => e.key == k);
            let attached = this.rot_group.filter(e => e.key == k);

            combs[k] = { required: required, attached: attached };

            if (combs[k].attached.list.length < combs[k].required.list.length) {
                goal_reached = false;
            }
        }
        // console.log(combs);

        this.highlightAttachedRequiredElets();

        if (goal_reached) {
            // console.log("Goal Reached!");
            this.sfx.comb_complete.play();

            this.incBatteryCells();

            let comb_strs = [];
            for (let k of this.elet_images) {
                for (let i = 0; i < combs[k].required.list.length; i++) {
                    comb_strs.push(k);
                }
            }

            for (let e of comb_strs) {
                for (let i = 0; i < combs[e].required.list.length; i++) {
                    this.rot_group.remove(this.rot_group.getFirst("key", e), true);
                }
            }

            this.combination.completed += 1;
            if (this.combination.completed < 2) {
                this.combination.count = 3;
            } else if (this.combination.completed == 2) {
                this.combination.count = 4;
            } else {
                this.combination.count = 5;
            }

            if (this.combination.completed >= 4) {
                // console.log("WINNER!");
                this.winGame();
                this.add.tween(this.combination.group).to({x: -600}, 1000, Phaser.Easing.Sinusoidal.In, true);
            } else {
                this.newCombination();
            }

        }

    },

    highlightAttachedRequiredElets: function() {
        // reset
        this.combination.group.children.forEach(c => {
            c.tint = 0xAA5555;
            c.scale.set(0.4)
        });

        // apply
        const combs = {};
        for (let k of this.elet_images) {
            let required = this.combination.group.filter(e => e.key == k);
            let attached_left = this.rot_group.filter(e => e.key == k).list.length;

            for (let req of required.list) {
                if (attached_left) {
                    req.scale.set(0.7);
                    req.tint = 0xFFFFFF;
                    attached_left -= 1;
                }
            }
        }
    },

    incBatteryCells: function() {
        let c = this.battery_cells.create(0, 0, 'battery_cell');
        this.battery_cells.align(-1, 1, c.width, c.height);
    },

    winGame: function() {
        this.sfx.win.play();
        let style = { font: "bold 45px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };
        let win_text = this.add.text(this.world.centerX, this.world.centerY - 150, "VOCÊ GANHOU!", style);
        win_text.anchor.set(0.5);

        this.launch_button.kill();

        let restart_button = this.add.button(this.world.centerX, this.world.centerY + 50, "restart_button", () => this.state.start("MainMenu"));
        restart_button.anchor.set(0.5);
        restart_button.bringToTop();

        this.elet.visible = false;
    },

    gotoMainMenu: function() {
        this.state.start("MainMenu");
    },



}
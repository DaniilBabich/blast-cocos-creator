const config = require('config');
const logic = require('logic');

cc.Class({
    extends: cc.Component,

    properties: {
        cube: {
            default: null,
            type: cc.Prefab
        },
        red: {
            default: null,
            type: cc.SpriteFrame
        },
        green: {
            default: null,
            type: cc.SpriteFrame
        },
        blue: {
            default: null,
            type: cc.SpriteFrame
        },
        yellow: {
            default: null,
            type: cc.SpriteFrame
        },
        purple: {
            default: null,
            type: cc.SpriteFrame
        },
        super: {
            default: null,
            type: cc.SpriteFrame
        },
        goal: {
            default: null,
            type: cc.Node
        },
        moves: {
            default: null,
            type: cc.Node
        },
        score: {
            default: null,
            type: cc.Node
        },
        bombs: {
            default: null,
            type: cc.Node
        },
        game: {
            default: null,
            type: cc.Node
        },
        persist: {
            default: null,
            type: cc.Node
        }
    },

    onLoad() {
        logic.init();
        this.renderCubes();
        this.runOnloadAnimation();
    },

    renderCubes(prevRowsCount) {
        this.node.parent.getComponent(cc.Mask).enabled = true;
        this.eventsOff();
        let fallenCubes = 0;
        for (const cube of this.node.children) cube.destroy();
        for (let row = 0; row < config.rowsCount; row++) {
            for (let column = 0; column < config.columnsCount; column++) {
                const cube = cc.instantiate(this.cube);
                cube.getComponent(cc.Sprite).spriteFrame = this[logic.cubes[row][column].color];
                cube.x = config.cellWidth * column;
                cube.y = config.cellHeight * row;
                cube.parent = this.node;
                if (logic.cubes[row][column].prevRow) {
                    cube.y = config.cellHeight * logic.cubes[row][column].prevRow;
                    cc.tween(cube)
                        .to((logic.cubes[row][column].prevRow - row) * config.timePerCell, {position: cc.v2(cube.x, config.cellHeight * row)})
                        .call(() => {
                            fallenCubes += 1;
                            if (fallenCubes === prevRowsCount) this.callbackToAnimationsBeforeNewMove();
                        })
                        .start()
                }
            }
        }
    },

    runOnloadAnimation() {
        this.node.y = -this.node.y;
        cc.tween(this.node)
            .to(config.rowsCount * config.timePerCell, {position: cc.v2(this.node.x, -this.node.y)})
            .call(this.callbackToAnimationsBeforeNewMove, this)
            .start()
    },

    callbackToAnimationsBeforeNewMove() {
        this.node.parent.getComponent(cc.Mask).enabled = false;
        this.eventsOn();
        logic.deletePrevRows();
        if (!logic.isAvailableMoves()) {
            logic.reshuffleCubes();
            this.renderCubes();
            this.runOnloadAnimation();
        }
    },

    eventsOn() {
        for (const cube of this.node.children) {
            if (cube.getComponent(cc.Sprite).spriteFrame.name === 'super') cube.on(cc.Node.EventType.MOUSE_DOWN, this.superCubeOn, this);
            else cube.on(cc.Node.EventType.MOUSE_DOWN, this.cubeOn, this);
        }
        this.bombs.on(cc.Node.EventType.MOUSE_DOWN, this.bombsOn, this);
    },

    eventsOff() {
        for (const cube of this.node.children) {
            cube.off(cc.Node.EventType.MOUSE_DOWN, this.cubeOn, this);
            cube.off(cc.Node.EventType.MOUSE_DOWN, this.bombCubeOn, this);
            cube.off(cc.Node.EventType.MOUSE_DOWN, this.superCubeOn, this);
        }
        this.bombs.off(cc.Node.EventType.MOUSE_DOWN, this.bombsOn, this);
        this.game.off(cc.Node.EventType.MOUSE_DOWN, this.bombsOff, this);
    },

    cubesEvent(clickedCube, typeOfEvent) {
        const cubesToDestroy = logic.getCubesToDestroy(clickedCube.y / config.cellHeight, clickedCube.x / config.cellWidth, typeOfEvent);
        if (cubesToDestroy.length >= config.minCubesCountForDestroy) {
            const goalCubes = logic.getGoalCubes(cubesToDestroy);
            if (!typeOfEvent && cubesToDestroy.length >= config.minCubesCountForSuper) logic.saveSuperCube(cubesToDestroy);
            logic.calculateCubesChanges(cubesToDestroy);
            const prevRowsCount = logic.getPrevRowsCount();
            if (goalCubes.length) {
                this.eventsOff();
                for (const cubeToDestroy of cubesToDestroy) {
                    if (cubeToDestroy.color !== logic.goalColor) {
                        const cube = this.node.children.find(cube => cube.x / config.cellWidth === cubeToDestroy.column && cube.y / config.cellHeight === cubeToDestroy.row);
                        cube.destroy();
                    }
                }
                for (const goalCube of goalCubes) {
                    const cube = this.node.children.find(cube => cube.x / config.cellWidth === goalCube.column && cube.y / config.cellHeight === goalCube.row);
                    cc.tween(cube)
                        .to(0, {zIndex: 1})
                        .to(config.timeToGoal, {position: cc.v2(800, 2000), width: cube.width / 2, height: cube.height / 2}, {easing: 'quartIn'})
                        .call(() => {
                            this.renderCubes(prevRowsCount);
                            this.goal.getComponent('goal').goalProgress(goalCubes.length);
                            this.score.getComponent('score').scoreProgress(goalCubes.length);
                            if (typeOfEvent !== 'bomb') this.moves.getComponent('moves').movesReduce();
                        })
                        .start()
                }
            } else {
                this.renderCubes(prevRowsCount);
                if (typeOfEvent !== 'bomb') this.moves.getComponent('moves').movesReduce();
            }
        }
    },

    cubeOn(event) {
        this.cubesEvent(event.target);
    },

    superCubeOn(event) {
        this.cubesEvent(event.target, 'super')
    },

    bombCubeOn(event) {
        this.cubesEvent(event.target, 'bomb')
        this.bombs.getComponent('bombs').changeBombsLabelColor(false);
        this.bombs.getComponent('bombs').reduceBombsCount();
    },

    bombsOn() {
        if (this.bombs.getComponent('bombs').bombsCount > 0) {
            this.bombs.getComponent('bombs').changeBombsLabelColor(true);
            for (const cube of this.node.children) {
                cube.off(cc.Node.EventType.MOUSE_DOWN, this.cubeOn, this);
                cube.off(cc.Node.EventType.MOUSE_DOWN, this.superCubeOn, this);
                cube.on(cc.Node.EventType.MOUSE_DOWN, this.bombCubeOn, this);
            }
            this.game.on(cc.Node.EventType.MOUSE_DOWN, this.bombsOff, this);
        }
    },

    bombsOff(event) {
        if (event.target.name === 'game') {
            this.bombs.getComponent('bombs').changeBombsLabelColor(false);
            for (const cube of this.node.children) {
                cube.off(cc.Node.EventType.MOUSE_DOWN, this.bombCubeOn, this);
                if (cube.getComponent(cc.Sprite).spriteFrame.name === 'super') cube.on(cc.Node.EventType.MOUSE_DOWN, this.superCubeOn, this);
                else cube.on(cc.Node.EventType.MOUSE_DOWN, this.cubeOn, this);
            }
            this.game.off(cc.Node.EventType.MOUSE_DOWN, this.bombsOff, this);
        }
    }
});
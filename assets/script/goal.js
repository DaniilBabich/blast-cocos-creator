const config = require("config");
const logic = require('logic');

cc.Class({
    extends: cc.Component,

    properties: {
        number: {
            default: null,
            type: cc.Node
        },
        cube: {
            default: null,
            type: cc.Node
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
        bar: {
            default: null,
            type: cc.Node
        },
        persist: {
            default: null,
            type: cc.Node
        }
    },

    onLoad() {
        this.goalNumber = config.startGoalNumber;
        this.goalRender();
    },

    goalRender() {
        this.number.getComponent(cc.Label).string = this.goalNumber;
        this.cube.getComponent(cc.Sprite).spriteFrame = this[logic.goalColor];
        this.bar.getComponent(cc.Sprite).fillRange = logic.getBarFillRange(this.goalNumber);
    },

    goalProgress(goalCubesCount) {
        this.goalNumber -= goalCubesCount;
        if (this.goalNumber <= 0) {
            this.goalNumber = 0;
            this.persist.getComponent('persist').changeStatus('VICTORY');
            cc.director.loadScene('result');
        }
        this.goalRender();
    }
});
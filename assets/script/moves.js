const config = require("config");
const logic = require('logic');

cc.Class({
    extends: cc.Component,

    properties: {
        persist: {
            default: null,
            type: cc.Node
        }
    },

    onLoad() {
        this.moves = config.startMoves;
        this.movesRender();
    },

    movesRender() {
        this.node.getComponent(cc.Label).string = this.moves;
    },

    movesReduce() {
        this.moves -= 1;
        if (this.moves === 0) {
            this.persist.getComponent('persist').changeStatus('DEFEAT');
            cc.director.loadScene('result');
        }
        this.movesRender();
    }
});
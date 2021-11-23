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
        this.score = 0;
        this.scoreRender();
    },

    scoreRender(points) {
        if (points) {
            const id = setInterval(() => {
                points -= config.pointsPerCube;
                if (!points) clearTimeout(id);
                this.node.getComponent(cc.Label).string = this.score - points;
            }, config.timeOfScoreStep * 1000)
        } else this.node.getComponent(cc.Label).string = this.score;
    },

    scoreProgress(goalCubesCount) {
        const points = logic.getPoints(goalCubesCount);
        this.score += points;
        this.persist.getComponent('persist').changeScore(this.score);
        this.scoreRender(points);
    }
});
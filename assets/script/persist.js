cc.Class({
    extends: cc.Component,

    onLoad() {
        cc.game.addPersistRootNode(this.node);
    },

    changeStatus(status) {
        this.status = status;
    },

    changeScore(score) {
        this.score = score;
    }
});
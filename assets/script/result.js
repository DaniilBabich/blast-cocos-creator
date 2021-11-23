cc.Class({
    extends: cc.Component,

    properties: {
        status: {
            default: null,
            type: cc.Node
        },
        score: {
            default: null,
            type: cc.Node
        }
    },

    onLoad() {
        const persist = cc.find('persist');
        cc.game.removePersistRootNode(persist);
        this.status.getComponent(cc.Label).string = persist.getComponent('persist').status;
        this.score.getComponent(cc.Label).string = 'Score: ' + persist.getComponent('persist').score;
    }
});
const config = require("config");
const logic = require('logic');

cc.Class({
    extends: cc.Component,

    properties: {
        label: {
            default: null,
            type: cc.Node
        },
        count: {
            default: null,
            type: cc.Node
        }
    },

    onLoad() {
        this.bombsCount = config.startBombsCount;
        this.bombsCountRender();
    },

    bombsCountRender() {
        this.count.getComponent(cc.Label).string = this.bombsCount;
    },

    changeBombsLabelColor(status) {
        switch (status) {
            case true:
                this.label.color = config.bombsOnColor;
                break;
            case false:
                this.label.color = config.bombsOffColor;
                break;
        }
    },

    reduceBombsCount() {
        this.bombsCount -= 1;
        this.bombsCountRender();
    }
});
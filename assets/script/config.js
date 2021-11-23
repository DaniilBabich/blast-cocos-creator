module.exports = {
    rowsCount: 9,
    columnsCount: 9,
    cellWidth: 171,
    cellHeight: 192,
    colors: ['red', 'green', 'blue', 'yellow', 'purple'],
    minCubesCountForDestroy: 2,
    minCubesCountForSuper: 5,
    timePerCell: 0.15,
    timeToGoal: 0.3,
    timeOfScoreStep: 0.05,
    startBombsCount: 5,
    bombsRadius: 1,
    bombsOnColor: new cc.Color(0, 255, 10),
    bombsOffColor: new cc.Color(255, 255, 255),
    startGoalNumber: 50,
    startMoves: 30,
    pointsPerCube: 100
};
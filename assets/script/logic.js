const config = require("config");

module.exports = {
    init() {
        this.cubes = [];
        for (let row = 0; row < config.rowsCount; row++) {
            this.cubes[row] = [];
            for (let column = 0; column < config.columnsCount; column++) {
                const color = this.randomColor();
                this.cubes[row][column] = {row, column, color};
            }
        }
        this.goalColor = this.randomColor();
    },

    randomColor() {
        return config.colors[Math.floor(Math.random() * config.colors.length)];
    },

    isExistingCoordinate(row, column) {
        return row >= 0 && row < config.rowsCount && column >= 0 && column < config.columnsCount;
    },

    getCubesToDestroy(row, column, typeOfDestroy) {
        const cubesToDestroy = [this.cubes[row][column]];
        switch (typeOfDestroy) {
            case 'super':
                this.calculateCubesToDestroyBySuper(row, column, cubesToDestroy);
                break;
            case 'bomb':
                this.calculateCubesToDestroyByBomb(row, column, cubesToDestroy);
                break;
            default:
                this.calculateCubesToDestroy(row, column, cubesToDestroy);
                break;
        }
        return cubesToDestroy;
    },

    calculateCubesToDestroy(row, column, cubesToDestroy) {
        const addCube = (row, column) => {
            if (this.isExistingCoordinate(row, column)) {
                const cube = this.cubes[row][column];
                if (!cubesToDestroy.includes(cube) && cube.color === cubesToDestroy[0].color) {
                    cubesToDestroy.push(cube);
                    this.calculateCubesToDestroy(row, column, cubesToDestroy);
                }
            }
        }
        addCube(row, column - 1);
        addCube(row, column + 1);
        addCube(row - 1, column);
        addCube(row + 1, column);
    },

    calculateCubesToDestroyBySuper(row, column, cubesToDestroy) {
        const addCube = (row, column) => {
            const cube = this.cubes[row][column];
            if (!cubesToDestroy.includes(cube)) {
                cubesToDestroy.push(cube);
                if (cube.color === 'super') this.calculateCubesToDestroyBySuper(cube.row, cube.column, cubesToDestroy);
            }
        }
        for (let row = 0; row < config.rowsCount; row++) addCube(row, column);
        for (let column = 0; column < config.columnsCount; column++) addCube(row, column);
    },

    calculateCubesToDestroyByBomb(row, column, cubesToDestroy) {
        const startRow = row - config.bombsRadius;
        const startColumn = column - config.bombsRadius;
        for (let row = startRow; row < startRow + config.bombsRadius * 2 + 1; row++) {
            for (let column = startColumn; column < startColumn + config.bombsRadius * 2 + 1; column++) {
                if (this.isExistingCoordinate(row, column)) {
                    const cube = this.cubes[row][column];
                    if (!cubesToDestroy.includes(cube)) cubesToDestroy.push(cube);
                    if (cube.color === 'super') this.calculateCubesToDestroyBySuper(cube.row, cube.column, cubesToDestroy);
                }
            }
        }
    },

    calculateCubesChanges(cubesToDestroy) {
        for (let row = config.rowsCount; row < config.rowsCount * 2; row++) this.cubes[row] = [];
        for (const cubeToDestroy of cubesToDestroy) {
            let newRow = config.rowsCount;
            while (this.cubes[newRow][cubeToDestroy.column]) newRow += 1;
            delete this.cubes[cubeToDestroy.row][cubeToDestroy.column];
            const color = this.randomColor();
            this.cubes[newRow][cubeToDestroy.column] = {row: newRow, column: cubeToDestroy.column, color};
        }
        const changedColumns = [];
        for (const cubeToDestroy of cubesToDestroy) if (!changedColumns.includes(cubeToDestroy.column)) changedColumns.push(cubeToDestroy.column);
        for (const changedColumn of changedColumns) {
            let emptyCellsUnderCube = 0;
            for (let row = 0; row < this.cubes.length; row++) {
                const cube = this.cubes[row][changedColumn];
                if (!cube) emptyCellsUnderCube += 1;
                else if (cube && emptyCellsUnderCube) {
                    const newRow = row - emptyCellsUnderCube;
                    this.cubes[newRow][changedColumn] = {row: newRow, column: changedColumn, color: cube.color, prevRow: row};
                }
            }
        }
        this.cubes.splice(config.rowsCount, this.cubes.length - config.rowsCount);
    },

    saveSuperCube(cubesToDestroy) {
        cubesToDestroy[0].color = 'super';
        cubesToDestroy.splice(0, 1);
    },

    getGoalCubes(cubesToDestroy) {
        const goalCubes = [];
        for (const cubeToDestroy of cubesToDestroy) {
            if (cubeToDestroy.color === this.goalColor)
                goalCubes.push(cubeToDestroy);
        }
        return goalCubes;
    },

    getPrevRowsCount() {
        let prevRowsCount = 0;
        for (let row = 0; row < config.rowsCount; row++) {
            for (let column = 0; column < config.columnsCount; column++) {
                if (this.cubes[row][column].prevRow) prevRowsCount += 1;
            }
        }
        return prevRowsCount;
    },

    deletePrevRows() {
        for (let row = 0; row < config.rowsCount; row++) {
            for (let column = 0; column < config.columnsCount; column++) {
                if (this.cubes[row][column].prevRow) delete this.cubes[row][column].prevRow;
            }
        }
    },

    isAvailableMoves() {
        for (let row = 0; row < config.rowsCount; row++) {
            for (let column = 0; column < config.columnsCount - 1; column++) {
                if (this.cubes[row][column].color === this.cubes[row][column + 1].color) return true;
            }
        }
        for (let column = 0; column < config.columnsCount; column++) {
            for (let row = 0; row < config.rowsCount - 1; row++) {
                if (this.cubes[row][column].color === this.cubes[row + 1][column].color) return true;
            }
        }
    },

    reshuffleCubes() {
        for (let row = 0; row < config.rowsCount; row++) {
            for (let column = 0; column < config.columnsCount; column++) {
                this.cubes[row][column].color = this.randomColor();
            }
        }
    },

    getBarFillRange(goalNumber) {
        return (100 - goalNumber / config.startGoalNumber * 100) / 100;
    },

    getPoints(goalCubesCount) {
        if (goalCubesCount > config.minCubesCountForDestroy)
            return goalCubesCount * config.pointsPerCube + (goalCubesCount - config.minCubesCountForDestroy) * config.pointsPerCube;
        else return goalCubesCount * config.pointsPerCube;
    }
};
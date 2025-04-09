// A Cell is a [[List Number Number], Natural, V2D]
// {pos, dist, force}


// Represents a rectangular grid of forces for the game world, where each cell
// has width and height as defined in the constants, and uses a coordinate
// system where x increases as rightwards, and y increases as downwards, and
// topleft is the origin.
class ForceGrid {
        // Creates the rows for the grid, given the maximum X and Y grid positions.
        static #createRows(maxX, maxY) {
                const rows = [];
                for (let y = 0; y <= maxY; y++) {
                        const currRow = [];
                        for (let x = 0; x <=maxX; x++) {
                                currRow.push({
                                        pos: [x, y],
                                        dist: 0,
                                        force: new V2D()
                                })
                        }
                        rows.push(currRow);
                }
                return rows;
        }

        // Number Number -> [List Natural Natural]
        // Gets the corresponding grid position of the given world position.
        static #worldPosToGridPos(x, y) {
                const gridX = Math.floor(x / opt.cellWidth);
                const gridY = Math.floor(y / opt.cellHeight);
                return [gridX, gridY];
        }

        // Constructs a zeroed out grid with the right size.
        // Assumes that the screen's width is non-zero.
        constructor(obstacles) {
                const [maxX, maxY] = ForceGrid.#worldPosToGridPos(g.width, g.height);
                this.rows = ForceGrid.#createRows(maxX, maxY);
                this.width = this.rows[0].length;
                this.height = this.rows.length;
                this.prev = new Map();
                this.obstacles = obstacles;
        }

        // Natural Natural -> Boolean
        // Is the given grid position within the bounds of the map.
        #withinGridBounds(x, y) {
                return 0 <= x && x < this.width &&
                        0 <= y && y < this.height;
        }

        // Number Number -> Boolean
        // Is the given world position within the bounds of the screen.
        static #withinBounds(x, y) {
                return 0 <= x && x <= g.width &&
                        0 <= y && y <= g.height;
        }

        // Number Number -> Cell
        // Given world position.
        #getCellAt(x, y) {
                if (!ForceGrid.#withinBounds(x, y)) {
                        console.error("Position not within screen:", x, y, ", program is broken.");
                        return;
                }
                const [gridX, gridY] = ForceGrid.#worldPosToGridPos(x, y);
                return this.#getCellAtWithGridPos(gridX, gridY);
        }

        // Natural Natural -> Cell
        // Assumes that within bounds.
        #getCellAtWithGridPos(x, y) {
                return this.rows[y][x];
        }
        
        // Number Number -> V2D
        // Gets the force at the given world position in this grid.
        getAt(x, y) {
                return this.#getCellAt(x, y).force;
        }

        // -> Void
        // Zeroes out all of the forces in this grid.
        zero() {
                this.rows.forEach(r => r.forEach(c => { c.force.zero(); c.dist = Infinity; }));
                this.prev.clear();
        }

        // Computes the forces of this grid, given the previous cells of each
        // cell.
        #computeForces() {
                for (const [fromCell, toCell] of this.prev.entries()) {
                        const [ax, ay] = fromCell.pos;
                        const [bx, by] = toCell.pos;
                        const dx = bx - ax;
                        const dy = by - ay;
                        fromCell.force.set(dx, dy).setMag(opt.goalForce);
                }
        }

        // Cell -> [Listof Cell]
        // Gets the neighbouring cells of the given cell.
        #neighbours(cell) {
                const res = [];
                const [x, y] = cell.pos;
                const deltas = [[-1, 0], [1, 0], [0, -1], [0, 1]];
                for (const [dx, dy] of deltas) {
                        const nx = x + dx;
                        const ny = y + dy;
                        if (this.#withinGridBounds(nx, ny)) {
                                const cell = this.#getCellAtWithGridPos(nx, ny);
                                res.push(cell);
                        }
                }
                return res;
        }

        // [PriorityQueueof Cell] Cell [Setof Cell] -> Void
        // Adds the given cell to the given queue if it hasn't already been
        // processed, isn't in a wall and within bounds of the map.
        #addToQIfShould(q, cell, processed) {
                const [x, y] = cell.pos;
                if (!processed.has(cell) &&
                    !this.obstacles.has_wall(x, y) &&
                    ForceGrid.#withinBounds(x, y)) {
                        q.push(cell);
                }
        }

        // Number Number -> Void
        // Adds a source to this grid of forces, such that every cell has a
        // force that points to the closest source.
        // Implementation: Dijkstra's is performed on the existing grid starting
        // from the source, and terminates when there are no more neighbours to
        // explore, either because all nodes are visited or because the existing
        // nodes have a lower score.
        #addSource(x, y) {
                const q = new PriorityQueue((a, b) => a.dist < b.dist);
                const processed = new Set();
                const source = this.#getCellAt(x, y);
                source.dist = 0;
                q.push(source);

                while (!q.isEmpty()) {
                        const u = q.pop();

                        if (processed.has(u)) {
                                continue;
                        }

                        for (const v of this.#neighbours(u)) {
                                this.#addToQIfShould(q, v, processed);
                                const alt = u.dist + 1;
                                if (alt < v.dist) {
                                        v.dist = alt;
                                        this.prev.set(v, u);
                                }
                        }
                        processed.add(u);
                }
        }

        // [Listof [List Number Number]] -> Void
        addSources(poss) {
                for (const [x, y] of poss) {
                        this.#addSource(x, y);
                }
                this.#computeForces();
        }
}

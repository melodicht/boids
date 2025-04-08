// A Coord is a [List Number Number].
// Represents the x and y coordinate in the coordinate system,
// where x increases as move right, and y increases as move down,
// and the origin is the top left of the screen.

// An InclusiveCoordRange is a [List Coord Coord].
// Represents a range of discrete coordinates, between and including the first
// and second coordinate in the list.

// Does given coordinate range include the given coordinate?
function coord_range_has_coord(coord_range, coord) {
        const [[lower_x, lower_y], [upper_x, upper_y]] = coord_range;
        const [coord_x, coord_y] = coord;
        return lower_x <= coord_x && coord_x <= upper_x && lower_y <= coord_y && coord_y <= upper_y;
}

// Represents a 2D grid map, which is the screen that the user
// seens broken down into discrete cells arranged in a rectangular
// grid. A cell either has a wall or doesn't.
class Obstacles {
        // [Listof InclusiveCoordRange] -> Obstacles
        // Constructs the obstacles given 
        constructor(wall_positions) {
                this.wall_positions = wall_positions;

                this.shape = new PIXI.Graphics();
                app.stage.addChild(this.shape);

                this.draw();
        }

        // Number Number -> Boolean
        // Does this grid map contain a wall at the given world
        // position?
        // Runs in O(n) where n is the number of ranges. This is justified
        // because we intentionally don't have many ranges because we build the
        // levels by hand.
        has_wall(x, y) {
                const gridX = Math.floor(x / opt.cellWidth);
                const gridY = Math.floor(y / opt.cellHeight);
                return this.wall_positions.some((wp) => coord_range_has_coord(wp, [gridX,gridY]));                
        }

        // -> [List Number Number]
        // Gets a random X and Y position in world position within the width and
        // height that isn't in a wall.
        getRandomXY() {
                let candidate = [random(g.width), random(g.height)];
                let count = 0;
                while (this.has_wall(candidate[0], candidate[1])) {
                        candidate = [random(g.width), random(g.height)];
                        count++;
                        if (count > 10) {
                                return [35, 100];
                        }
                }
                return candidate;
        }

        draw() {
                this.wall_positions.forEach(this.#drawWallInCoordRange.bind(this));
        }

        #drawWallInCoordRange(wallPosition) {
                const [[ax, ay], [bx, by]] = wallPosition;
                const min_x = Math.min(ax, bx);
                const max_x = Math.max(ax, bx);
                const min_y = Math.min(ay, by);
                const max_y = Math.max(ay, by);
                for (let x = min_x; x <= max_x; x++) {
                        for (let y = min_y; y <= max_y; y++) {
                                const tlx = x * opt.cellWidth;
                                const tly = y * opt.cellHeight;
                                this.shape.beginFill(opt.wallColor);
                                this.shape.drawRect(tlx, tly, opt.cellWidth, opt.cellHeight);
                                this.shape.endFill();
                        }
                }
        }
}

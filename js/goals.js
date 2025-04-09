// Represents the goals for a single tag, containing their positions and how
// long they have left in the world in milliseconds, as well as the influence
// they have on the field of forces.
// NOTE: Some of these methods ought to be private, but for some reason can't
// invoke them without some error even though they invoked within this class?
class TagGoals {
        constructor(tagN, obstacles) {
                this.tagN = tagN;
                // [Listof [Obj Coord Number Graphics]]
                // {pos, durationMS, graphics}
                this.goals = [];
                this.forceField = new ForceGrid(obstacles);
        }

        // Number -> Void
        // Updates this goals and force field given the elapsed milliseconds, by
        // removing dead goals and updating the force field, as well as redrawing.
        update(elapsedMS) {
                let shouldRefreshForceField = false;
                this.goals = this.goals.reduce((acc, g0) => {
                        const durationMS = g0.durationMS - elapsedMS;
                        if (durationMS >= 0) {
                                acc.push({...g0, durationMS: durationMS});
                        }
                        else {
                                app.stage.removeChild(g0.graphics);
                                shouldRefreshForceField = true;
                        }
                        return acc;
                }, []);

                if (shouldRefreshForceField) {
                        this.refreshForceField();
                }
        }

        // Number Number -> Void
        // Adds a goal at the given world position.
        addGoalAt(worldPosX, worldPosY) {
                const newGoal = {
                        pos: [worldPosX,worldPosY],
                        durationMS: opt.goalDurationMS,
                        graphics: new PIXI.Graphics()
                }
                app.stage.addChild(newGoal.graphics);
                TagGoals.drawGoal(newGoal.graphics, worldPosX, worldPosY);
                this.goals.push(newGoal);
                this.refreshForceField();
        }

        // Number Number -> V2D
        getDeltaAcc(worldPosX, worldPosY) {
                return this.forceField.getAt(worldPosX, worldPosY);
        }

        refreshForceField() {
                this.forceField.zero();
                this.forceField.addSources(this.goals.map(g => g.pos));
        }

        // Graphics Number Number -> Void
        // Draws a goal using the given graphics instance, on the given world position.
        static drawGoal(graphics, worldPosX, worldPosY) {
                graphics.clear();
                graphics.beginFill(opt.goalColour);
                graphics.drawCircle(worldPosX, worldPosY, opt.goalRadius);
                graphics.endFill();
        }
}

// Represents the goals of the corresponding tags. Each goal is responsible for
// drawing itself.
class Goals {
        constructor(obstacles) {
                this.goals = [];
                for (let tagN = 0; tagN < opt.numTags; tagN++) {
                        this.goals.push(new TagGoals(tagN, obstacles));
                }
        }

        // Number -> Void
        // Updates the goals given the elapsed milliseconds since the last
        // update, removing goals that have died.
        update(elapsedMS) {
                this.goals.forEach(g => g.update(elapsedMS));
        }

        // Natural Number Number -> Void
        // Adds a goal of a given tag at the given world position in this goals.
        // Assumes that the given tag is valid.
        addGoalAt(tagN, worldPosX, worldPosY) {
                this.goals[tagN].addGoalAt(worldPosX, worldPosY);
        }

        // Natural Number Number -> Number
        // Gets the force in the force field of the corresponding tag in the
        // given X and Y world position.
        getDeltaAcc(tagN, worldPosX, worldPosY) {
                return this.goals[tagN].getDeltaAcc(worldPosX, worldPosY);
        }
}

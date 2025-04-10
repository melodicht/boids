// Taken from:
// https://stackoverflow.com/questions/42919469/efficient-way-to-implement-priority-queue-in-javascript
// Renamed top to top0 because apparently top has already been declared?

const top0 = 0;
const parent = i => ((i + 1) >>> 1) - 1;
const left = i => (i << 1) + 1;
const right = i => (i + 1) << 1;

class PriorityQueue {
        constructor(comparator = (a, b) => a > b) {
                this._heap = [];
                this._comparator = comparator;
        }
        size() {
                return this._heap.length;
        }
        isEmpty() {
                return this.size() == 0;
        }
        peek() {
                return this._heap[top0];
        }
        push(...values) {
                values.forEach(value => {
                        this._heap.push(value);
                        this._siftUp();
                });
                return this.size();
        }
        pop() {
                const poppedValue = this.peek();
                const bottom = this.size() - 1;
                if (bottom > top0) {
                        this._swap(top0, bottom);
                }
                this._heap.pop();
                this._siftDown();
                return poppedValue;
        }
        replace(value) {
                const replacedValue = this.peek();
                this._heap[top0] = value;
                this._siftDown();
                return replacedValue;
        }
        _greater(i, j) {
                return this._comparator(this._heap[i], this._heap[j]);
        }
        _swap(i, j) {
                [this._heap[i], this._heap[j]] = [this._heap[j], this._heap[i]];
        }
        _siftUp() {
                let node = this.size() - 1;
                while (node > top0 && this._greater(node, parent(node))) {
                        this._swap(node, parent(node));
                        node = parent(node);
                }
        }
        _siftDown() {
                let node = top0;
                while (
                        (left(node) < this.size() && this._greater(left(node), node)) ||
                                (right(node) < this.size() && this._greater(right(node), node))
                ) {
                        let maxChild = (right(node) < this.size() && this._greater(right(node), left(node))) ? right(node) : left(node);
                        this._swap(node, maxChild);
                        node = maxChild;
                }
        }
}

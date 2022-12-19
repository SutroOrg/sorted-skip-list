import assert from "node:assert";

class SkipListNode<T> {
  public next: SkipListNode<T>[] = [];
  public value: T | null;

  static createSentinel<T>(): SkipListNode<T> {
    return new SkipListNode(null) as SkipListNode<T>;
  }

  constructor(value: T) {
    this.next = [];
    this.value = value;
  }

  get firstNext() {
    const firstNext = this.next[0];
    if (firstNext === undefined) {
      throw new Error("firstNext is undefined");
    }
    return firstNext;
  }
}
const isSentinel = (node: SkipListNode<any>) => node.value === null;

/**
 * This skip list is a probabilistic data structure that allows for efficient
 * insertion of elements in a sorted list.
 *
 * This list implements the iterable protocol for flexible traversal.
 *
 */
export class SkipList<T> {
  private head: SkipListNode<T>;
  private probability: number;

  private _comparator(a: T, b: T): number;
  private _comparator(): never {
    throw new Error("Not implemented");
  }

  constructor() {
    this.head = SkipListNode.createSentinel<T>();
    this.head.next[0] = SkipListNode.createSentinel<T>();
    this.probability = 0.5;
  }

  /**
   * Set the comparator function for the list.
   *
   * This function must be set before any elements are added to the list.
   *
   * a  <  b returns -1
   * a === b returns  0
   * a  >  b returns  1
   */
  set comparator(comp: (a: T, b: T) => number) {
    if (!isSentinel(this.head.firstNext)) {
      throw new Error("Cannot change comparator after adding elements");
    }
    this._comparator = comp;
  }

  private compare(a: SkipListNode<T>, b: SkipListNode<T>): number {
    if (isSentinel(a)) {
      return 1;
    }
    if (isSentinel(b)) {
      return -1;
    }
    return this._comparator(a.value!, b.value!);
  }

  /**
   * Inserts a value into its sorted position in the list.
   * @param value
   * @returns
   */
  insert(value: T) {
    const newNode = new SkipListNode(value);
    if (isSentinel(this.head.firstNext)) {
      newNode.next[0] = this.head.firstNext;
      this.head.next[0] = newNode;
      return newNode;
    }

    const insertionPath = this.find(newNode);

    let flip = 0;
    let level = 0;

    while (flip < this.probability) {
      const before = insertionPath[level] ?? this.head;
      newNode.next[level] =
        before.next[level] ?? SkipListNode.createSentinel<T>();
      before.next[level] = newNode;

      level++;
      flip = Math.random();
    }
    return newNode;
  }

  /**
   * Returns the list as an array.
   */
  toArray(): T[] {
    return Array.from(this as Iterable<T>);
  }

  [Symbol.iterator]() {
    let current = this.head.firstNext;
    return {
      next: () => {
        const done = isSentinel(current);

        if (isSentinel(current)) {
          return { done };
        }
        const value: T = current.value!;
        current = current.firstNext;
        return { done, value };
      },
    };
  }

  private find(
    sought: SkipListNode<T>,
    path: SkipListNode<T>[] = [],
    level = this.head.next.length - 1
  ): SkipListNode<T>[] {
    assert(level >= 0, "level must be >= 0");
    const from = path[0] || this.head;

    if (this.compare(sought, from) === 0) {
      return path;
    }

    const { next } = from;
    const right = next[level] || SkipListNode.createSentinel<T>();

    if (isSentinel(right) || this.compare(sought, right) < 0) {
      if (level === 0) {
        return path;
      }
      return this.find(sought, path, level - 1);
    }
    return this.find(sought, [right, ...path], level);
  }
}

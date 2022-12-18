import { describe, expect, it } from "@jest/globals";
import { SkipList } from "../src";

describe("index", () => {
  it("throws if comparator is not set", () => {
    const list = new SkipList<number>();
    list.insert(1);
    expect(() => list.insert(1)).toThrow("Not implemented");
  });

  it("throws if setting comparator after adding items", () => {
    const list = new SkipList<number>();
    list.insert(1);
    expect(() => (list.comparator = (a, b) => a - b)).toThrow(
      "Cannot change comparator after adding elements"
    );
  });

  it("maintains order", () => {
    const list = new SkipList<number>();
    list.comparator = (a, b) => a - b;

    list.insert(1);
    list.insert(2);
    list.insert(3);
    list.insert(4);

    expect(list.toArray()).toEqual([1, 2, 3, 4]);
  });

  it("sorts on input", () => {
    const list = new SkipList<number>();
    list.comparator = (a, b) => a - b;

    list.insert(4);
    list.insert(3);
    list.insert(2);
    list.insert(1);

    expect(list.toArray()).toEqual([1, 2, 3, 4]);
  });

  it("handles equality", () => {
    const list = new SkipList<number>();
    list.comparator = (a, b) => a - b;

    list.insert(1);
    list.insert(2);
    list.insert(2);
    list.insert(1);

    expect(list.toArray()).toEqual([1, 1, 2, 2]);
  });

  it("handles non-numeric values", () => {
    const list = new SkipList<string>();
    list.comparator = (a, b) => a.localeCompare(b);

    list.insert("a");
    list.insert("c");
    list.insert("b");
    list.insert("d");

    expect(list.toArray()).toEqual(["a", "b", "c", "d"]);
  });
});

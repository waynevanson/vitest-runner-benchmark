import * as fs from "node:fs";
import * as path from "node:path";
import type { SequenceHooks, Test } from "@vitest/runner";
import {} from "@vitest/runner";
import type { SerializedConfig } from "vitest";
import { VitestTestRunner } from "vitest/runners";
import type { VitestRunner } from "vitest/suite";
import { getFn, getHooks } from "vitest/suite";

function getTestEachHooks(test: Test, sequenceHooks: SequenceHooks) {
  const suite = test.suite;

  if (!suite) {
    throw new Error("Expected test to have a suite");
  }

  return async function beforeEachCycle() {
    const hooks = getHooks(suite);

    let results: Array<unknown> = [];

    if (sequenceHooks === "parallel") {
      results = await Promise.all(
        hooks.beforeEach.map((fn) => fn(test.context, suite)),
      );
    } else {
      for (const fn of hooks.beforeEach) {
        results.push(await fn(test.context, suite));
      }

      if (sequenceHooks === "stack") {
        results.reverse();
      }
    }

    const cleanups = results.filter(
      (value): value is () => unknown =>
        typeof value === "function" && value.arguments === 0,
    );
  };
}

/**
 * @summary
 * A `VitestRunner` that runs tests as benchmarks.
 */
// todo: remove assertions via vite plugin?
export default class VitestBenchRunner
  extends VitestTestRunner
  implements VitestRunner
{
  // todo: ensure this can take multiple things like minimum time of cycles.
  #config = {
    benchmark: {
      cycles: 64,
    },
    warmup: {
      cycles: 10,
    },
  };
  #tests = new Set<Test>();

  constructor(config: SerializedConfig) {
    if (config.sequence.concurrent) {
      throw new Error("Expected config.sequence.concurrent to be falsey");
    }

    if (config.sequence.shuffle) {
      throw new Error("Expected config.sequence.shuffle to be falsey");
    }

    super(config);
  }

  // todo: assumes we're going to run at least 1 bench via config
  //
  // todo: how about just call after Each first then beforeEach at the end?
  async runTask(test: Test) {
    const fn = getFn(test);

    let warmups = 1;
    let benchmarks = 1;

    const warmable = this.#config.warmup.cycles > 0;

    // todo: add parallel option
    async function beforeEach() {
      for (const fn of getHooks(test.suite!)?.beforeEach ?? []) {
        const a = await fn(test.context, test.suite!);
        console.log(a);
      }
    }

    // todo: add parallel option
    async function afterEach() {
      for (const fn of getHooks(test.suite!)?.afterEach ?? []) {
        await fn(test.context, test.suite!);
      }
    }

    async function benchmark() {
      performance.mark(`${test.id}:open:${benchmarks}`);
      await fn();
      performance.mark(`${test.id}:shut:${benchmarks}`);
    }

    // beforeEach has already been called by Vitest
    if (warmable) {
      await fn();
      warmups += 1;
    } else {
      await benchmark();
      benchmarks += 1;
    }

    await afterEach();

    if (warmable) {
      while (warmups <= this.#config.warmup.cycles) {
        await beforeEach();
        await fn();
        await afterEach();
        warmups++;
      }
    }

    while (benchmarks <= this.#config.benchmark.cycles) {
      await beforeEach();
      await benchmark();
      await afterEach();
      benchmarks++;
    }

    this.#tests.add(test);
  }

  // Format details
  // https://bencher.dev/docs/reference/bencher-metric-format/
  async onAfterRunFiles() {
    const filename = new Date().toISOString();
    const filepath = path.resolve(this.config.root, ".benchmark", filename);

    const results = this.#tests.values().reduce((accu, test) => {
      const measures = getMeasures(test.id, this.#config.benchmark.cycles);
      const min = measures.reduce((accu, curr) => Math.min(accu, curr), 0);
      const max = measures.reduce((accu, curr) => Math.max(accu, curr), 0);
      const average =
        measures.reduce((accu, curr) => accu + curr, 0) / measures.length;

      const measure = { value: average, lower_value: min, higher_value: max };

      const name = [test.file.filepath + test.name].join(":");

      accu[name] = { duration: measure };

      return accu;
    }, {} as BMF);

    const data = JSON.stringify(results, null, 4);

    fs.mkdirSync(path.dirname(filepath), { recursive: true });
    fs.writeFileSync(filepath, data, { encoding: "utf8" });

    super.onAfterRunFiles();
  }
}

type BMF = Record<
  string,
  Record<string, { value: number; lower_value?: number; higher_value?: number }>
>;

// function* window<T>(iterator: IterableIterator<T>): Generator<[T, T]> {
//   let a = iterator.next();
//   let b = iterator.next();

//   while (!a.done && !b.done) {
//     yield [a.value, b.value];

//     a = b;
//     b = iterator.next();
//   }
// }

function getMeasures(id: string, count: number) {
  return Array.from({ length: count }, (_, index) => {
    const counter = index + 1;
    const open = `${id}:open:${counter}`;
    const shut = `${id}:shut:${counter}`;
    const measure = performance.measure(open, shut);
    return measure.duration;
  });
}

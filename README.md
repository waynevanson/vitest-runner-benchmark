# `@waynevanson/vitest-benchmark`

A Vitest runner and reporter that runs benchmarks on existing tests.

This is not endorsed by Vitest, please use at your own risk.

Development is being tested against [AriaKit](https://github.com/ariakit/ariakit) project in this [pull request](https://github.com/ariakit/ariakit/pull/4415).

## Cost Benefit Analysis

### Benefits

1. Uses existing tests.

### Drawbacks

1. Keeps assertions in place.
2. Likely not endorsed by Vitest team.

## Usage

1. Install from registry

```sh
# Use relevant commands to your package manager.
npm install @waynevanson/vitest-benchmark
```

2. Configure runner for use in Vitest.

```ts
# Config file
# ie. vitest.config.ts

import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // required. You'll likely want to control this with an environment variable
    runner: "@waynevanson/vitest-benchmark/runner"

    // optionally, add the extra reporter
    reporters: ["default", "@waynevanson/vitest-benchmark/reporter/bmf"],
    provide: {
      // Configuration defaults, recommendations in comments.
      benchrunner: {
        benchmark: {
          // ~1000
          minCycles: 1,
          minMs: 0
        },
        warmup: {
          // ~50
          minCycles: 0,
          minMs: 0
        }
      }
    }
  }
})
```

3. Run tests.

```
npm exec vitest
```

All your tests should pass. If not, feel free to raise an issue.

4. Assuming you've configured for it, see the output file via the reporter.

```jsonc
// .benchmarks.json

{
  "path/to/test.test.ts > description > to > test": {
    "latency": {
      "min_value": 0.02334,
      "value": 0.3434,
      "max_value": 0.9837483434
    }
  }
  // ... other benchmarks here.
}
```

## FAQ

## Vitest Bench Mode

> Vitest already has a bench mode, which is a runner. Why create a new runner?

Because the offical bench runner doesn't call your hooks and doesn't call your existing tests.

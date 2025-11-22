# `vitest-runner-benchmark`

A Vitest runner and reporter that runs benchmarks on existing tests.

This is not endorsed by Vitest, please use at your own risk.

## Cost Benefit Analysis

### Benefits

1. Uses existing tests.
2. Removes throws from expect (when using instance bound `expect`).

### Drawbacks

1. Expressions used in assertions are still evaluated.
2. Not endorsed by Vitest team.

## Usage

1. Install from registry

```sh
# Use relevant commands to your package manager.
npm install vitest-runner-benchmark@git://github.com:waynevanson/vitest-runner-benchmark.git
```

2. Configure runner for use in Vitest.

```ts
# Config file
# ie. vitest.config.ts

import { defineConfig } from 'vitest/config'

// Vitest doesn't allow us to pass extra information via config,
// so we need to use environment variables.
//
// These are all the options available.
process.env["VITEST_RUNNER_BENCHMARK_OPTIONS"] = JSON.stringify({
  benchmark: {
    // n > 0
    cycles: 64
  },
  warmup: {
    // n >=0
    cycles: 10
  }
})

export default defineConfig({
    test: {
        // required. You'll likely want to control this with an environment variable
        runner: "./node_modules/vitest-runner-benchmark/runner"

        // optionally, add the extra reporter
        reporters: ["default", "./node_modules/vitest-runner-benchmark/reporter"]

        // optionally, log the reporters' BMF output to a file.
        outDir: ".benchmarks.json"
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
}
```

## FAQ

## Vitest Bench Mode

> Vitest already has a bench mode, which is a runner. Why create a new runner?

Because the offical bench runner doesn't call your hooks and doesn't call your existing tests.

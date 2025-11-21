# `vitest-runner-benchmark`

A Vitest runner that runs benchmarks on existing tests.

## Cost Benefit Analysis

### Benefits

1. Uses existing tests.
2. Removes throws from expect (when using instance bound `expect`).

### Drawbacks

1. Expressions used in assertions are still evaluated.

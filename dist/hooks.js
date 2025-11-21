// `getHooks` and `setHooks` is just hooks added per suite.
// It does not handle execution.
/**
 * @summary
 * Gets all the hooks to run the suite for a test.
 */
function deriveSuiteListeners(suite, getHooks) {
    // collect all the `beforeEach` callbacks.
    // we keep these together so the order between cleanups is known.
    const listeners = [];
    function collect(suite) {
        const hooks = getHooks(suite);
        const item = {
            befores: hooks.beforeEach,
            afters: hooks.afterEach
        };
        listeners.unshift(item);
    }
    let parent = suite;
    while (parent) {
        collect(parent);
        parent = parent.suite;
    }
    // `config.setupFiles`
    collect(suite.file);
    return listeners;
}
export function createBeforeEachCycle(test, options) {
    return async function beforeEachCycle() {
        const suite = test.suite ?? test.file;
        const suitesListeners = deriveSuiteListeners(suite, options.getHooks);
        const traverse = options.sequence === "parallel" ? parallel : series;
        const cleanups = await traverse(suitesListeners.map((suiteListeners) => async () => {
            const unknowns = await traverse(suiteListeners.befores.map((before) => () => before(test.context, suite)));
            const befores = unknowns.filter((value) => typeof value === "function");
            const afters = suiteListeners.afters.map((fn) => () => fn(test.context, suite));
            if (options.sequence === "stack") {
                befores.reverse();
                afters.reverse();
            }
            return async function cleanupEachSuite() {
                await traverse(befores);
                await traverse(afters);
            };
        }));
        return async function afterEachCycle() {
            return await traverse(cleanups);
        };
    };
}
async function series(fns) {
    const result = [];
    for (const fn of fns) {
        result.push(await fn());
    }
    return result;
}
async function parallel(fns) {
    return Promise.all(Iterator.from(fns).map((fn) => fn()));
}

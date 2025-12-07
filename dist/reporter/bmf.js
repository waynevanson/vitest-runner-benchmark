import { writeFileSync } from "node:fs";
import { collapse } from "../utils.js";
// todo: allow template syntax for saving names
export default class BMFReporter {
    config = { outputFile: undefined, prefix: "" };
    vitest;
    onInit(vitest) {
        const userOptions = 
        //@ts-expect-error
        vitest.config.reporters.find(
        //@ts-expect-error
        (value) => value[0] === "@waynevanson/vitest-benchmark/reporter/bmf")?.[1] ?? {};
        this.config.outputFile =
            typeof vitest.config.outputFile === "string"
                ? vitest.config.outputFile
                : vitest.config.outputFile?.["@waynevanson/vitest-benchmark/reporter/bmf"] ?? userOptions.outputFile;
        this.config.prefix = userOptions.prefix ?? "";
        this.vitest = vitest;
    }
    onTestRunEnd(testModules, unhandledErrors, reason) {
        if (reason !== "passed" || unhandledErrors.length > 0)
            return;
        const bmf = {};
        for (const testModule of testModules) {
            for (const testCase of testModule.children.allTests("passed")) {
                const name = createBenchmarkName(testCase, this.config.prefix);
                if (name in bmf) {
                    throw new Error([
                        `Expected "${name}" not to exist as a benchmark name.`,
                        `Please remove duplicate test names.`,
                        `If these tests are in two different projects, please add a project name in the vitest config to fix.`
                    ].join("\n"));
                }
                const measures = createBenchmarkMeasures(testCase);
                if (measures) {
                    bmf[name] = measures;
                }
            }
        }
        const data = JSON.stringify(bmf);
        if (this.config.outputFile) {
            writeFileSync(this.config.outputFile, data, { encoding: "utf8" });
        }
        else {
            console.log(data);
        }
    }
}
function createBenchmarkName(testCase, prefix) {
    // todo: add project name
    //@ts-expect-error`
    return [prefix, testCase.task.fullName].filter(Boolean).join(" # ");
}
export function createBenchmarkMeasures(testCase) {
    const meta = testCase.meta();
    if (!meta.benchrunner) {
        throw new Error("Expected test to report a benchmark");
    }
    const results = meta.benchrunner;
    const latencyPercentiles = createPercentiles("Latency", results.latency?.percentiles);
    const throughputPercentiles = createPercentiles("Throughput", results?.throughput?.percentiles);
    // todo: allow renaming
    const measures = collapse({
        "Latency Average": createMeasure(results?.latency?.average),
        "Throughput Average": createMeasure(results?.throughput?.average),
        "Latency Minimum": createMeasure(results?.latency?.min),
        "Latency Maximum": createMeasure(results?.latency?.max),
        "Throughput Minimum": createMeasure(results?.throughput?.min),
        "Throughput Maximum": createMeasure(results?.throughput?.max),
        ...latencyPercentiles,
        ...throughputPercentiles
    });
    return measures;
}
export function createMeasure(value) {
    if (value === undefined) {
        return undefined;
    }
    else {
        return { value };
    }
}
export function createPercentiles(category, percentiles = {}) {
    if (Object.keys(percentiles).length === 0) {
        return undefined;
    }
    const measures = {};
    for (const percentile in percentiles) {
        const name = `${category} P${percentile}`;
        const value = percentiles[percentile];
        measures[name] = { value };
    }
    return measures;
}

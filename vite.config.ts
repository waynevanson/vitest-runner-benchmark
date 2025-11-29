import { defineConfig } from "vitest/config"
import dts from "vite-plugin-dts"
import { globSync as glob } from "glob"

const entry = glob("./src/public/**/*.ts").reduce((accu, filepath) => {
  const entry = filepath.replace(/^src\/public\//, "").replace(/\.ts$/, "")
  accu[entry] = filepath
  return accu
}, {} as Record<string, string>)

// todo: move non-unit tests into integrated tests
export default defineConfig({
  test: {
    setupFiles: ["./vitest.setup.ts"],
    // exclude the fixtures in test files
    exclude: ["./test/*/**", "node_modules/"]
  }
})

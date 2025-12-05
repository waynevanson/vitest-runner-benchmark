export function conditional(condition, dependsOn) {
    return { type: "Conditional", condition, dependsOn };
}

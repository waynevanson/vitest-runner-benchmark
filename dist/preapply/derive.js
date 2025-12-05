export function derive(dependsOn, fn) {
    return { type: "Derive", dependsOn, fn };
}

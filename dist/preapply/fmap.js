export function fmap(dependsOn, transform) {
    return {
        type: "FMap",
        dependsOn,
        transform
    };
}

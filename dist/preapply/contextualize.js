import { get } from "./get";
import { collapsible } from "./collapsible";
import { conditional } from "./conditional";
import { derive } from "./derive";
import { fmap } from "./fmap";
import { gets } from "./gets";
import { structural } from "./structural";
import { tuple } from "./tuple";
export function contextualize() {
    return {
        get,
        gets,
        derive,
        conditional,
        structural,
        collapsible,
        tuple,
        fmap
    };
}

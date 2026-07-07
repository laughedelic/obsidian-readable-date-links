import { moment } from "obsidian";
import type { MomentFn } from "./readable";

// Obsidian types its bundled moment as a namespace, which esModuleInterop
// considers non-callable; narrow it to the slice this plugin uses.
export const momentFn = moment as unknown as MomentFn;

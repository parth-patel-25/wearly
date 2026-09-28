/// <reference types="uniwind/types" />

// Metro generates src/uniwind-types.d.ts with the themes discovered from
// global.css. Importing the stylesheet is a side effect only, so TypeScript
// needs this declaration to accept it under noUncheckedSideEffectImports.
declare module "*.css";

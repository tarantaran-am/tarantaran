import { z } from "zod";

// Zod probes `Function("")` to compile fast validators, and our CSP has no 'unsafe-eval', so in the
// browser the probe is blocked and reported as a CSP issue. Schemas that also run in the browser
// import `z` from here instead of "zod".
z.config({ jitless: true });

export { z };

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validateProfile } from "./validate-profile.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const baseline = JSON.parse(fs.readFileSync(path.join(here, "profile.json"), "utf8"));
assert.equal(validateProfile(baseline).maturity, "design-only");

function reject(mutator) {
  const candidate = structuredClone(baseline);
  mutator(candidate);
  assert.throws(() => validateProfile(candidate));
}

reject((p) => { p.productionEligible = true; });
reject((p) => { p.runtimeReady = true; });
reject((p) => { p.network.bindAddress = "0.0.0.0"; });
reject((p) => { p.network.defaultInterzoneAction = "allow"; });
reject((p) => { p.network.permittedFlows.push({ sourceZone: "compute-lab", destinationZone: "federation-disabled", service: "peer", transport: "TCP", purpose: "synthetic" }); });
reject((p) => { p.identity.realInstitutionAccountsAccepted = true; });
reject((p) => { p.keyManagement.keyMaterialInRepository = true; });
reject((p) => { p.keyManagement.keyLifetimeHoursMaximum = 72; });
reject((p) => { p.data.protectedStudentRecordsAllowed = true; });
reject((p) => { p.data.publicProviderAdaptersEnabled = true; });
console.log("Synthetic profile passed; ten unsafe or overclaiming mutations rejected.");

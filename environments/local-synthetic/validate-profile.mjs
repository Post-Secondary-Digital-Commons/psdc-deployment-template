import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const requiredZones = ["control", "compute-lab", "storage", "federation-disabled"];
const requiredKeyClasses = ["artifact-attestation", "object-envelope", "workload-session"];

export function validateProfile(profile) {
  assert.equal(profile.schemaVersion, 1);
  assert.equal(profile.profileId, "psdc-local-synthetic-v1");
  assert.equal(profile.classification, "synthetic-only");
  assert.equal(profile.maturity, "design-only");
  for (const key of ["institutionApproved", "productionEligible", "runtimeReady"]) {
    assert.equal(profile[key], false, `${key} must remain false until a separate approved profile exists`);
  }

  const network = profile.network;
  assert.equal(network.mode, "loopback-simulation");
  assert.equal(network.bindAddress, "127.0.0.1");
  assert.equal(network.examplePrefix, "192.0.2.0/24");
  assert.equal(network.defaultInterzoneAction, "deny");
  assert.deepEqual([...network.zones].sort(), [...requiredZones].sort());
  assert.equal(network.workerConnection, "outbound-only-to-cell-gateway");
  assert.equal(network.federationEnabled, false);
  assert.equal(network.publicIngressEnabled, false);
  assert.deepEqual(network.permittedFlows.map((flow) => [flow.sourceZone, flow.destinationZone, flow.service, flow.transport]), [
    ["compute-lab", "control", "cell-gateway", "mTLS"],
    ["control", "storage", "object-gateway", "mTLS"]
  ]);
  for (const flow of network.permittedFlows) {
    assert.ok(typeof flow.purpose === "string" && flow.purpose.includes("synthetic"));
  }

  const identity = profile.identity;
  assert.equal(identity.authority, "synthetic-development-only");
  assert.equal(identity.issuer, "https://issuer.psdc.invalid");
  assert.equal(identity.workloadTrustDomain, "spiffe://synthetic.psdc.invalid");
  assert.equal(identity.defaultAuthorization, "deny");
  assert.deepEqual(identity.acceptedSubjects, ["synthetic-test-runner", "synthetic-lab-worker"]);
  assert.equal(identity.realInstitutionAccountsAccepted, false);

  const kms = profile.keyManagement;
  assert.equal(kms.mode, "ephemeral-development");
  assert.equal(kms.providerCandidate, "OpenBao");
  assert.equal(kms.keyMaterialInRepository, false);
  assert.equal(kms.productionTrustRootsAccepted, false);
  assert.deepEqual([...kms.syntheticKeyClasses].sort(), requiredKeyClasses);
  assert.ok(Number.isInteger(kms.keyLifetimeHoursMaximum) && kms.keyLifetimeHoursMaximum > 0 && kms.keyLifetimeHoursMaximum <= 24);
  assert.equal(kms.rotationAndRevocationTestRequired, true);

  assert.deepEqual(profile.data.allowed, ["synthetic", "public-test"]);
  for (const key of ["protectedStudentRecordsAllowed", "publicProviderAdaptersEnabled", "publicContentNetworkEnabled"]) {
    assert.equal(profile.data[key], false);
  }
  return { profileId: profile.profileId, classification: profile.classification, maturity: profile.maturity };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const file = process.argv[2] ?? path.join(here, "profile.json");
  console.log(JSON.stringify(validateProfile(JSON.parse(fs.readFileSync(file, "utf8")))));
}

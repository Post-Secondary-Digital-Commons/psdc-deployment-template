# Local synthetic Wave A profile

> Status: design-only, structurally validated when the local test passes. Not deployed.
> Authority: PSDC common development example; no institution approval or site values.

This profile describes a **simulation boundary**, not actual campus VLANs, VRFs, routing,
PKI, or OpenBao deployment. It is intended to let Wave A component work start safely with
synthetic identities and records while institution-specific networking and key custody are
not yet approved. It cannot be renamed or toggled into a production profile.

`profile.json` fixes a loopback-only bind, documentation-only example prefix, default-deny
zone policy, outbound worker-to-cell-gateway channel, disabled federation/public ingress,
synthetic issuer and workload trust domain, ephemeral development key class, and a ban on
protected student records or public provider adapters. `192.0.2.0/24` is a documentation
prefix, not an allocation or a route. The `.invalid` names cannot serve as real issuers.

Run from this directory with Node.js 20 or later:

```powershell
node validate-profile.mjs
node profile.test.mjs
```

The first command checks the checked-in profile. The second rejects unsafe profile
mutations. A passing result proves only that the JSON matches this local guardrail. It
does **not** prove that mTLS, default-deny routing, OpenBao, a database, or an outbox works.

To create a real institution profile, use a separately reviewed overlay with approved IPAM
prefixes, DNS zone, VLAN/VRF mapping, named firewall owner, issuing CA/SPIRE trust domain,
OpenBao key custody, secret injection, backup/restore, and evidence from an isolated test
environment. Do not replace this file with those values or store keys here. The common
[network architecture](https://github.com/Post-Secondary-Digital-Commons/psdc-architecture/blob/main/docs/network/Network-Architecture.md)
and [KMS architecture](https://github.com/Post-Secondary-Digital-Commons/psdc-architecture/blob/main/docs/security/KMS.md)
govern the future deployment; this example does not supersede them.

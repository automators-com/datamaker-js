---
"@automators/datamaker": minor
---

Sync `spec/openapi.json` with the API and regenerate. 178 operations that previously returned `unknown` now carry a real response type, and `components["schemas"]` grows from 15 entries to 123.

Additive only: all 15 schemas that existed before are byte-identical, so nothing that compiles today stops compiling. `GET /scenarios/jobs` is new.

This widens the generated `paths` and `components` types, which are exported and usable directly. It does not by itself add methods to the resource clients (`dm.projects`, `dm.templates`, ...) - those still cover the resources they covered before, and extending them is separate work.

31 operations remain deliberately untyped upstream and still resolve to `unknown`: the Tosca/Jira/SAP pass-throughs, whose bodies belong to those systems rather than to DataMaker, and a handful of routes that return credentials and so are kept out of the published contract.

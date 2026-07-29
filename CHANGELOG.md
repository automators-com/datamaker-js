# @automators/datamaker

## 1.1.0

### Minor Changes

- 42c489b: Sync `spec/openapi.json` with the API and regenerate. 178 operations that previously returned `unknown` now carry a real response type, and `components["schemas"]` grows from 15 entries to 123.

  Additive only: all 15 schemas that existed before are byte-identical, so nothing that compiles today stops compiling. `GET /scenarios/jobs` is new.

  This widens the generated `paths` and `components` types, which are exported and usable directly. It does not by itself add methods to the resource clients (`dm.projects`, `dm.templates`, ...) - those still cover the resources they covered before, and extending them is separate work.

  31 operations remain deliberately untyped upstream and still resolve to `unknown`: the Tosca/Jira/SAP pass-throughs, whose bodies belong to those systems rather than to DataMaker, and a handful of routes that return credentials and so are kept out of the published contract.

## 1.0.0

### Major Changes

- 3803e44: Rebuild the SDK from the API's OpenAPI document. Types are generated rather than hand-written, and the client covers projects, templates, sets, keymaps, masking policies and plans instead of only generate/export.

## 0.2.0

### Minor Changes

- 360c738: Implement exportToApi() method that exports data either to endpoint saved in Datamaker account or to a custom endpoint defined in code.
- 17fb18a: Implement exportToDB() method that exports data to database connection saved in Datamaker account.

  Adding more examples of effective work with the package.

## 0.1.0

### Minor Changes

- e013c71: Implement basic instance instantiation and generate method to create data according to specified template.

  Exporting Template and Field types to enable improved editor completions.

## 0.0.1

### Patch Changes

- 0dbb2df: Initial version of datamaker ts/js package.

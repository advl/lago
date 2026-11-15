## Done

[The one concern this pull request carries, told as what it makes possible: "a stories file is a test file now", "a saved picture is accepted with one key now". Then the work that delivers it, drive-bys named. Where nothing a user can see changed, as in a refactor or a pipeline change, state what the change protects or makes cheaper instead.]

## QA

[Commands a reviewer can run and the output they should see. If the pipeline did not run, paste the local gate output; the pull request body is then the record that the gates were green.]

## Readiness

- [ ] The title is a conventional commit with a package as its scope, under 72 characters. It becomes the commit on `main`.
- [ ] `bun run ci` passes locally.
- [ ] New behaviour lands together with the tests that pin it.
- [ ] Nothing points at a record outside this repository or names a person or a machine. The history is a shipped artifact.

# How to contribute

This document will eventually outline all aspects of guidance to make your
contributing experience a fruitful and enjoyable one. What it already contains
is information about commit message formatting and how that directly affects
the numerous automated processes that are used for this repo.

[[_TOC_]]

## Overview


Submitting a merge request is more than just code! To achieve a quality
product, the tests and documentation need to be updated as well. An excellent
merge request will include these in the changes, wherever relevant.


## Commit message formatting

Since every type of change requires making Git commits, we will start by
covering the importance of ensuring that all of your commit messages are in the
correct format.

### Automation of multiple processes

This project uses
[semantic-release](https://github.com/semantic-release/semantic-release) for
automating numerous processes such as bumping the version number appropriately,
creating new tags/releases and updating the changelog. The entire process
relies on the structure of commit messages to determine the version bump, which
is then used for the rest of the automation.

Full details are available in the upstream docs regarding
the [Conventionnal Commit Message Conventions](https://www.conventionalcommits.org/en/v1.0.0/).
The key factor is that the first line of the commit message must follow this format:

```
type(scope): subject
```

For example:

```
feat(libfoo): new API `foo.quux` deprecates `foo.bar`

We create the new API `foo.quux` to better do things and mark
`foo.bar` deprecated from version `1.3.4`.

* test/libfoo.t: test the new API `foo.quux`

* lib/foo.pl: new API `foo.quux` and mark `foo.bar` deprecated.
```

Besides the version bump, the changelog and release notes are formatted
accordingly. So based on the example above:

> Features
>
> - **libfoo**: new API `foo.quux` deprecates `foo.bar`

- The `type` translates into a `Features` sub-heading.
- The `(scope)`: will be shown in bold text without the brackets.
- The `subject` follows the `scope` as standard text.

### Linting commit messages in CI

This project uses
[commitlint](https://github.com/conventional-changelog/commitlint) for checking
commit messages during CI testing. This ensures that they are in accordance
with the
[semantic-release](https://github.com/semantic-release/semantic-release)
settings.

For more details about the default settings, refer back to
the [`commitlint` reference rules](https://conventional-changelog.github.io/commitlint/#/reference-rules).


### Relationship between commit type and version bump

This project applies some customisation to the defaults, as outlined in the
table below, based upon the type of the commit:

| Type     | Heading                  | Description                                                                                             | Bump (default) | Bump (custom) |
|----------|--------------------------|---------------------------------------------------------------------------------------------------------|----------------|---------------|
| build    | Build System             | Changes related to the build system                                                                     | –              | _             |
| chore    | –                        | Changes to the build process or auxiliary tools and libraries such as documentation generation          | –              | _             |
| ci       | Continuous Integration   | Changes to the continuous integration configuration                                                     | –              | _             |
| docs     | Documentation            | Documentation only changes                                                                              | –              | 0.0.1         |
| feat     | Features                 | A new feature                                                                                           | 0.1.0          | 0.1.0         |
| fix      | Bug Fixes                | A bug fix                                                                                               | 0.0.1          | 0.0.1         |
| perf     | Performance Improvements | A code change that improves performance                                                                 | 0.0.1          | 0.0.1         |
| refactor | Code Refactoring         | A code change that neither fixes a bug nor adds a feature                                               | –              | 0.0.1         |
| revert   | Reverts                  | A commit used to revert a previous commit                                                               | –              | 0.0.1         |
| style    | Styles                   | Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc.) | –              | 0.0.1         |
| test     | Tests                    | Adding missing or correcting existing tests                                                             | –              | 0.0.1         |


#### Scopes

Even if it is possible to
[limit the possible scopes](https://github.com/conventional-changelog/commitlint/blob/master/docs/reference-rules.md#scope-enum)
like [in Angular](https://github.com/angular/angular/blob/master/CONTRIBUTING.md#scope),
this project does not enforce them and let the contributors define meaningful
ones in their commits.

### Use `BREAKING CHANGE` to trigger a `major` version change

Adding `BREAKING CHANGE` to the footer of the extended description of the
commit message will **always** trigger a `major` version change, no matter
which type has been used. This will be appended to the changelog and release
notes as well. To preserve good formatting of these notes, the following format
is prescribed:

```
BREAKING CHANGE: <explanation in paragraph format>.
```

An example of that:

```
feat(api): remove the API deprecated before 1.4.0

To make the project maintainable, we need to cleanup some deprecated
API.

The API deprecated after 1.4.0 are not concerned by this cleanup.

BREAKING CHANGE: the old API `foo.bar` was deprecated since version 1.3.4 and is
removed now.

BREAKING CHANGE: the old API `foo.baz` was deprecated since version 1.2.6 and is
removed now.
```

# Changelog

## [3.3.4](https://gitlab.mim-libre.fr/alphabet/laboite/compare/release/3.3.3...release/3.3.4) (2022-01-13)


### Bug Fixes

* **gitlab-ci:** some globally defined keywords are deprecated ([67717d9](https://gitlab.mim-libre.fr/alphabet/laboite/commit/67717d9346b19e732be2c9258ed15b0c4d83f7dc)), closes [#7](https://gitlab.mim-libre.fr/alphabet/laboite/issues/7)
* **menu:** display group management in menu for adminstructure users ([71182e6](https://gitlab.mim-libre.fr/alphabet/laboite/commit/71182e67c4aae7bd47c802bb389d90f660f0e60e))
* **ui:** Update structure page title to user structure ([7f92831](https://gitlab.mim-libre.fr/alphabet/laboite/commit/7f92831ae7a3a2f884469e1707a08d430f641f7b))
* **version:** update version number for testing ([008048e](https://gitlab.mim-libre.fr/alphabet/laboite/commit/008048e6c83471f593f6a7c5ee0ae5f3bf4de0b1))
* **version:** update version number for testing ([7845825](https://gitlab.mim-libre.fr/alphabet/laboite/commit/78458251cb42cd190010ea76c68584b52b01bc4a))


### Continuous Integration

* **artifacts:** expires quickly useless artifacts ([f946e68](https://gitlab.mim-libre.fr/alphabet/laboite/commit/f946e688dda55b7aee106302fee03d617f5459c4)), closes [#8](https://gitlab.mim-libre.fr/alphabet/laboite/issues/8)
* **build:** create the docker image and push it to `${CI_REGISTRY}` ([0f9bbbc](https://gitlab.mim-libre.fr/alphabet/laboite/commit/0f9bbbc5f8e8533b1b1401605f39312b3d6333fe))
* **commitlint:** enforce commit message format ([abde698](https://gitlab.mim-libre.fr/alphabet/laboite/commit/abde698d39da30e4baada868840f9be993f84348))
* **commitlint:** execute before any resource heavy jobs ([ec12bff](https://gitlab.mim-libre.fr/alphabet/laboite/commit/ec12bfff026520ce33e7c7450dea3427896bc14a))
* **meteor:** lint and test code before building the docker image ([bc5a932](https://gitlab.mim-libre.fr/alphabet/laboite/commit/bc5a932d7b32a64c849137fe7c37765e7a1872d0))
* **release:** avoid regression in `dev` branch ([a96e561](https://gitlab.mim-libre.fr/alphabet/laboite/commit/a96e561bc2f11b7104fd38e3bdd2c18b6394a77f))
* **release:** create release automatically with `semantic-release` ([fc8f953](https://gitlab.mim-libre.fr/alphabet/laboite/commit/fc8f9538b5dbc74cfbeff6a3d1902c1d2fe6a4e5))
* **release:** tag docker images based on release cycle ([c2e9535](https://gitlab.mim-libre.fr/alphabet/laboite/commit/c2e9535465b0a2b2f654287b47c7a933014068ce))
* **rules:** restrict execution to non stable branches by default ([ddc00cf](https://gitlab.mim-libre.fr/alphabet/laboite/commit/ddc00cfa224696900e197d7f6fb98ac8a070b670))
* **runners:** use OpenNebula runners with shared cache ([abc7531](https://gitlab.mim-libre.fr/alphabet/laboite/commit/abc7531d5384182eb9f31b8742c5b9c73230bebb))


### Styles

* **gitlab-ci:** better self explanatory job names ([2099482](https://gitlab.mim-libre.fr/alphabet/laboite/commit/2099482c0dc35e67edd9ae597dd36784bd4700d9))

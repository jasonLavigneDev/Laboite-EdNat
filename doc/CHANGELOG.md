# Changelog

## [4.0.2](https://gitlab.mim-libre.fr/alphabet/laboite/compare/release/4.0.1...release/4.0.2) (2022-03-07)


### Bug Fixes

* **ui:** display admin menu for nextcloud management ([a80766b](https://gitlab.mim-libre.fr/alphabet/laboite/commit/a80766be0d72d6aa1abd741585c2ef3fd6c4241f))

## [4.0.1](https://gitlab.mim-libre.fr/alphabet/laboite/compare/release/4.0.0...release/4.0.1) (2022-03-03)


### Bug Fixes

* **ui:** show structure name in group addressbook ([9a27901](https://gitlab.mim-libre.fr/alphabet/laboite/commit/9a27901d1dfd5ada9c541abd342a59f1b04e585e))


### Continuous Integration

* **merge-to-dev:** non fast forward merge requires configured git ([99b9a9b](https://gitlab.mim-libre.fr/alphabet/laboite/commit/99b9a9bb94ff226558778f00657234e28e94602c))

# [4.0.0](https://gitlab.mim-libre.fr/alphabet/laboite/compare/release/3.4.0...release/4.0.0) (2022-02-17)


### Bug Fixes

* **readme:** explanation of what it is comes before who does it ([97a4cd5](https://gitlab.mim-libre.fr/alphabet/laboite/commit/97a4cd5ec5a1973d9bf2278e61170a6cb6dd3a7f))


### Documentation

* **readme:** add Rizomo as contributor ([0af2e3d](https://gitlab.mim-libre.fr/alphabet/laboite/commit/0af2e3d14b2aef5e6d55f8998779691e81f42a05))
* **readme:** better markdown formatting ([2c886fe](https://gitlab.mim-libre.fr/alphabet/laboite/commit/2c886fe057f5827f0ca28d5230244db2fcc63bf8))


### Features

* **semantic-release:** create `testing` prerelease ([10e4627](https://gitlab.mim-libre.fr/alphabet/laboite/commit/10e4627e20e901d15ced16b03b07140a1d228419))


### BREAKING CHANGES

* **readme:** integrate Rizomo contributions

# [3.4.0](https://gitlab.mim-libre.fr/alphabet/laboite/compare/release/3.3.4...release/3.4.0) (2022-02-17)


### Bug Fixes

* **admin:** debounce bug ([bde294c](https://gitlab.mim-libre.fr/alphabet/laboite/commit/bde294c366e82841f9a2dcadeb99174471086360))
* **admin:** enable access to admin pages for admin without structure ([8ba643c](https://gitlab.mim-libre.fr/alphabet/laboite/commit/8ba643c98928ed5628b90717a38a52956dca6731))
* **admin:** nextcloud admin menu ([a6f1e14](https://gitlab.mim-libre.fr/alphabet/laboite/commit/a6f1e148e94c4e832d4e9b90833c63e73f76d3fa))
* **admin:** paths ([b357f78](https://gitlab.mim-libre.fr/alphabet/laboite/commit/b357f78af7451c088962c86a1ef1ddf88f50058d))
* **app:** move uploader inside the suspense ([7a1a531](https://gitlab.mim-libre.fr/alphabet/laboite/commit/7a1a531b4d6229e1140a6337b43c19507845ca40))
* **css:** css and structures ([21af1dc](https://gitlab.mim-libre.fr/alphabet/laboite/commit/21af1dc584c1c02a2e7f0577a22eac1c8a58eefa))
* **css:** structures ([a4b1187](https://gitlab.mim-libre.fr/alphabet/laboite/commit/a4b11872d749f942657f47396196794d307292d0))
* **eslint:** eslint file ([fc44cb3](https://gitlab.mim-libre.fr/alphabet/laboite/commit/fc44cb3e08ed1bf5d3658a1d212f96d001912f2b))
* **gitlab-ci:** some globally defined keywords are deprecated ([eddad55](https://gitlab.mim-libre.fr/alphabet/laboite/commit/eddad552c68ae8e91c74d8fb8a0a5452219cbe93)), closes [#7](https://gitlab.mim-libre.fr/alphabet/laboite/issues/7)
* **groups:** add tests for bookmarks and events, lint fixes ([5279133](https://gitlab.mim-libre.fr/alphabet/laboite/commit/527913354aed99dbb4e3c502fc2dc93383d3369e))
* **groups:** add tests for polls ([2c460d0](https://gitlab.mim-libre.fr/alphabet/laboite/commit/2c460d0cf9879a1eb3043c946ad3db98a1ad8d60))
* **groups:** check access to group resources on server, remove old code ([5fcf26a](https://gitlab.mim-libre.fr/alphabet/laboite/commit/5fcf26a3ae2041e03a2a02f0be1ec52bf0d9edca))
* **groups:** fix back button missing if not authorized ([5d96409](https://gitlab.mim-libre.fr/alphabet/laboite/commit/5d964094d300997daa76e7e666f41af3123708fd))
* **groups:** manage access to protected groups bookmarks and events ([a3068b3](https://gitlab.mim-libre.fr/alphabet/laboite/commit/a3068b359b4dc580878be9eeeb3d3f4518ef319f))
* **groups:** manage access to protected groups polls and address book ([37897d3](https://gitlab.mim-libre.fr/alphabet/laboite/commit/37897d3e572eaf9616437c17fe2544c2809b818b))
* **i18n:** add i18n texts to MainMenu ([61a7f82](https://gitlab.mim-libre.fr/alphabet/laboite/commit/61a7f82a536c27bae93968b6695485c069fdbe01))
* **i18n:** fix french group publications button label ([56f8b72](https://gitlab.mim-libre.fr/alphabet/laboite/commit/56f8b7288a424e68a18baf1fbde55215d70e0cf8))
* **i18n:** fix group publications button label ([045d188](https://gitlab.mim-libre.fr/alphabet/laboite/commit/045d1884b63632b17a6c4d2ed590bf905e14d02a))
* **iframe:** remote script merge conflicts ([53b654d](https://gitlab.mim-libre.fr/alphabet/laboite/commit/53b654d0454280853bf743cf287cd63b5c05d874))
* **menu:** display group management in menu for adminstructure users ([a72c7c7](https://gitlab.mim-libre.fr/alphabet/laboite/commit/a72c7c7741f1e49f72ce81e2ecf88fb03641c26b))
* **migration:** fix migration name ([2f0bc46](https://gitlab.mim-libre.fr/alphabet/laboite/commit/2f0bc466c82b6f9e9e86377445d030aca8943ef1))
* **new user:** change button label when no structure selected ([af6e57b](https://gitlab.mim-libre.fr/alphabet/laboite/commit/af6e57b6353356149426e1ba90300cebb8f09337))
* **new user:** fix button label when no structure selected ([5393a58](https://gitlab.mim-libre.fr/alphabet/laboite/commit/5393a583b1ae3ea86b0031ff428a778ad141afef))
* **package:** add license description and author fields to package.json ([0f20ae8](https://gitlab.mim-libre.fr/alphabet/laboite/commit/0f20ae8ddad6065807ac952d77f05cff57686012))
* **package:** update license field in package.json ([d8a977b](https://gitlab.mim-libre.fr/alphabet/laboite/commit/d8a977bb0ed9145a7b397144e6178b8a654148b4))
* **personalspace:** reduce empty zone height ([f4f71ce](https://gitlab.mim-libre.fr/alphabet/laboite/commit/f4f71ce9b387386ec1775335c0957c0a30832709))
* **readme:** readme file ([8634653](https://gitlab.mim-libre.fr/alphabet/laboite/commit/863465353af82102de6d05186badb15aa4631b0d))
* **schema:** spelling in key name (was children, become parent) ([a17e7e0](https://gitlab.mim-libre.fr/alphabet/laboite/commit/a17e7e07f206510d1949b73af891e35c071a5a07))
* **settings:** remove trailing comma in setting sample ([79278f8](https://gitlab.mim-libre.fr/alphabet/laboite/commit/79278f86f770520b450964732d2a8119db0aa574))
* **structures:** add structures names everywhere ([b34d3b4](https://gitlab.mim-libre.fr/alphabet/laboite/commit/b34d3b4c9cd4a9aa57e5cb56f3149e3faac09227))
* **structures:** fix migration script ([8a8f90c](https://gitlab.mim-libre.fr/alphabet/laboite/commit/8a8f90ce1777a83e42caf6a982289ea81d5e2c87))
* **structures:** migrate existing structure services ([f41cd3d](https://gitlab.mim-libre.fr/alphabet/laboite/commit/f41cd3dce4e5ada40fec8768b27a9e0ed1c00ec3))
* **structures:** simple schema validation fields ([81a150d](https://gitlab.mim-libre.fr/alphabet/laboite/commit/81a150d5f5d856afc4e98993593ce094721a2696))
* **structures:** update structure to _id for adminStructure roles ([4752daa](https://gitlab.mim-libre.fr/alphabet/laboite/commit/4752daa716cd2ed669fb50333fa8c99fbd2e51ec))
* **theme:** restore loader icon ([6e74a4d](https://gitlab.mim-libre.fr/alphabet/laboite/commit/6e74a4d33f0ef72dd27f1eb9fb221d6c28fe3cb9))
* **ui:** add button in group page to create new group ([fd4bab4](https://gitlab.mim-libre.fr/alphabet/laboite/commit/fd4bab41f9169d8b3e762ae4cd32c78f463c9dca))
* **ui:** add categories count in admin categories page ([43a0f87](https://gitlab.mim-libre.fr/alphabet/laboite/commit/43a0f877527e9c3466219fef4e51749f4f45a743))
* **ui:** add groups count in admin groups page ([517220d](https://gitlab.mim-libre.fr/alphabet/laboite/commit/517220dfeb5dc1f568576fab59800814e5a64e3a))
* **ui:** add mailto link for users' mail in admin users request page ([d26d54b](https://gitlab.mim-libre.fr/alphabet/laboite/commit/d26d54b31e28aa3ed37a6b5820ce752a9d1463bd))
* **ui:** add services count in admin services page ([b52afb3](https://gitlab.mim-libre.fr/alphabet/laboite/commit/b52afb34e976f07c5e12a27537189bde57b2d6b4))
* **ui:** add structures count in admin strucutres page ([d67ab4d](https://gitlab.mim-libre.fr/alphabet/laboite/commit/d67ab4df913069aac7443d14c7abb353a3fc9efa))
* **ui:** add users count in admin user page ([5caa7c0](https://gitlab.mim-libre.fr/alphabet/laboite/commit/5caa7c0d29b8b48b682853bd2971296617f51cf3))
* **ui:** add users count on admin users request validation page ([57d1663](https://gitlab.mim-libre.fr/alphabet/laboite/commit/57d16633199f571becd9c37b83eba47fbc69de28))
* **ui:** maintenance strip is back on top ([d567b45](https://gitlab.mim-libre.fr/alphabet/laboite/commit/d567b45c46894d6ff32887357b7c836fd8f11418))
* **ui:** remove empty string from translations ([9b4b12e](https://gitlab.mim-libre.fr/alphabet/laboite/commit/9b4b12efa62a3e37b44a63a294ebe8809bc8f7d6))
* **ui:** replace structure id with name if possible in admin validation ([dee917e](https://gitlab.mim-libre.fr/alphabet/laboite/commit/dee917ea8830e2da195afd9322509495f9fb983e))
* **ui:** retrieve add to favorite button on mobile services page ([c53719c](https://gitlab.mim-libre.fr/alphabet/laboite/commit/c53719c14b8096f2da00665379373ab9189cd8bd))
* **ui:** reword switch in groups page ([7ede0f0](https://gitlab.mim-libre.fr/alphabet/laboite/commit/7ede0f039ecc787d3a3166b28d7e1b1eedf062fe))
* **ui:** update structure page title to user structure ([421863e](https://gitlab.mim-libre.fr/alphabet/laboite/commit/421863e304cc8cd054d4179e1b62aad617677529))
* **version:** update version for testing ([4df6c82](https://gitlab.mim-libre.fr/alphabet/laboite/commit/4df6c82136437fcc5a1ce74fb444bd10562a0f88))
* **version:** update version number for testing ([0a8d0b3](https://gitlab.mim-libre.fr/alphabet/laboite/commit/0a8d0b311e0a10bf49736c348ba84157801c2055))
* **version:** update version number for testing ([c957815](https://gitlab.mim-libre.fr/alphabet/laboite/commit/c95781514f9123908cf9cbeabdf4b5ba4c4fb477))
* **widget:** add comment & remove timestamp ([62373f7](https://gitlab.mim-libre.fr/alphabet/laboite/commit/62373f7fbaa39f0f63fa8625b25ad2fde93951c1))
* **widget:** css to head ([3d6477e](https://gitlab.mim-libre.fr/alphabet/laboite/commit/3d6477e2232a2050f167f577e80de0737addcb44))
* **widget:** notification css position ([0d4665c](https://gitlab.mim-libre.fr/alphabet/laboite/commit/0d4665c7c8dd9d5a1195e65053d178e1985fdbef))
* **widget:** remove console.log ([3d71b9e](https://gitlab.mim-libre.fr/alphabet/laboite/commit/3d71b9e95e10fff12774ccc07a8643b09ba0fc15))


### Code Refactoring

* **base:** optimized code ([#13](https://gitlab.mim-libre.fr/alphabet/laboite/issues/13)) ([59f1358](https://gitlab.mim-libre.fr/alphabet/laboite/commit/59f1358174df9cf4589b2960538068115e3bdc34))
* **base:** reduce duplicates ([2741507](https://gitlab.mim-libre.fr/alphabet/laboite/commit/27415071c82f2aed11cdbc50a5e6589a4624b45e))
* **card:** cardmessage component ([9d2429e](https://gitlab.mim-libre.fr/alphabet/laboite/commit/9d2429e4f489467b3bdecf9777c1b53b25c7598b))
* **css:** adminhome ([6bde0ff](https://gitlab.mim-libre.fr/alphabet/laboite/commit/6bde0fff0cbc8ac5c8d43bc9e5af38162b4a2933))
* **css:** no structure selected ([878d450](https://gitlab.mim-libre.fr/alphabet/laboite/commit/878d450c3a06e5d5da0dc67b4fbb42ce4088c539))
* **git:** rebase rizomo to change commits ([a9b0f35](https://gitlab.mim-libre.fr/alphabet/laboite/commit/a9b0f35a33b072a6495a62e87d82023b5836b340))
* **header:** change common header ([274b4a2](https://gitlab.mim-libre.fr/alphabet/laboite/commit/274b4a21291b721504bba0ae29e399a47cba1783))
* **settings:** optional whitelist & add appDescription to doc ([751feee](https://gitlab.mim-libre.fr/alphabet/laboite/commit/751feee293b4ac858bea559a8a1f6ea95a43b46a))
* **theme:** laboite header height ([e974ba4](https://gitlab.mim-libre.fr/alphabet/laboite/commit/e974ba4d94d971f731834a4aa592e71ad55727bb))


### Continuous Integration

* **artifacts:** expires quickly useless artifacts ([78a4fba](https://gitlab.mim-libre.fr/alphabet/laboite/commit/78a4fba26a277306a7443e0f9f9bc148ad3da641)), closes [#8](https://gitlab.mim-libre.fr/alphabet/laboite/issues/8)
* **build:** create the docker image and push it to `${CI_REGISTRY}` ([47d2321](https://gitlab.mim-libre.fr/alphabet/laboite/commit/47d23213d8f0efbf338a495465c5238bdfe55759))
* **commitlint:** enforce commit message format ([5407bad](https://gitlab.mim-libre.fr/alphabet/laboite/commit/5407bad5e65edac56f593504e7a7b1340a063076))
* **commitlint:** execute before any resource heavy jobs ([2103e1b](https://gitlab.mim-libre.fr/alphabet/laboite/commit/2103e1b83beb4dbd6f03c3434c6d2101db1b1bd9))
* **gitignore:** add all development.json to gitignore ([acfed0d](https://gitlab.mim-libre.fr/alphabet/laboite/commit/acfed0dc23d8dd5ca0e1ea3dcf21be550fb1eb33))
* **husky:** add husky pre-commit hooks ([0b5741e](https://gitlab.mim-libre.fr/alphabet/laboite/commit/0b5741e9a2bd6749bec053e7dd6bb6c74550a04d))
* **husky:** add husky pre-push and pre-commit ([dfc4ff4](https://gitlab.mim-libre.fr/alphabet/laboite/commit/dfc4ff4293652738276483efd8dd7a38778acbee))
* **jscpd:** add jscpd to pre-commit hook ([0e7563c](https://gitlab.mim-libre.fr/alphabet/laboite/commit/0e7563c42eedc8d38b5c772b11099b849b2ee598))
* **meteor:** lint and test code before building the docker image ([941459f](https://gitlab.mim-libre.fr/alphabet/laboite/commit/941459f6d9863b4c1eea6c3837e7ad9f0b682a78))
* **release:** avoid regression in `dev` branch ([12c33d9](https://gitlab.mim-libre.fr/alphabet/laboite/commit/12c33d920dd246ae399de35b34caf4d157721636))
* **release:** create release automatically with `semantic-release` ([6e36fbe](https://gitlab.mim-libre.fr/alphabet/laboite/commit/6e36fbe1bfb1319d4f6e93fdc548e8ae83922e58))
* **release:** tag docker images based on release cycle ([0b7b459](https://gitlab.mim-libre.fr/alphabet/laboite/commit/0b7b45929c1a386105fcc831441e2cbb4f94dd27))
* **rules:** restrict execution to non stable branches by default ([4e2914b](https://gitlab.mim-libre.fr/alphabet/laboite/commit/4e2914b2de5997319b08c6d80ac553d54e8b3ba2))
* **runners:** use OpenNebula runners with shared cache ([99c7fb9](https://gitlab.mim-libre.fr/alphabet/laboite/commit/99c7fb903d386d27a93f760326e5ae74211a19c6))


### Features

* **admin:** add notif sender ([7f3d1bf](https://gitlab.mim-libre.fr/alphabet/laboite/commit/7f3d1bfb35e3fb3ecb37b3d0606f421045cb6763))
* **admin:** add structure admin to admin interface ([927d244](https://gitlab.mim-libre.fr/alphabet/laboite/commit/927d244a4778c58465a5d1f785899348ab8eba6d))
* **admin:** add structures crud ([c4fa8c4](https://gitlab.mim-libre.fr/alphabet/laboite/commit/c4fa8c4e924bcf765758e9fb3fcb3202bb7884ee))
* **admin:** create admin interface and remove big menu ([916ba60](https://gitlab.mim-libre.fr/alphabet/laboite/commit/916ba601c82900eaa795b72a8c4c888245bc037f))
* **admin:** new admin interface ([4661657](https://gitlab.mim-libre.fr/alphabet/laboite/commit/4661657e33e7043186fc348fb978233e5e077976))
* **api:** access token ([ad97594](https://gitlab.mim-libre.fr/alphabet/laboite/commit/ad97594ca243e95bb5a8a03479ee55b27b0aa736))
* **blog:** enable blog in settings ([05a8859](https://gitlab.mim-libre.fr/alphabet/laboite/commit/05a8859de355d5f7ca80081e0c0396c4afb40559))
* **blog:** enable blog in settings ([52bdd67](https://gitlab.mim-libre.fr/alphabet/laboite/commit/52bdd67f7b2be4289efaf8c1b7f1b1d12569781c))
* **iframe:** add notification display on robot ([6959f0c](https://gitlab.mim-libre.fr/alphabet/laboite/commit/6959f0c636de4d554eb7c0bd4de56adcfa091097))
* **iframe:** add robot & header ([abd88a0](https://gitlab.mim-libre.fr/alphabet/laboite/commit/abd88a0cc302fc26ad9b56fb5c3c0ebbf894704a))
* **iframe:** add script file with rizomo button ([99c26a7](https://gitlab.mim-libre.fr/alphabet/laboite/commit/99c26a776f597d4b65db83b29f44095747264d38))
* **rizomo:** merge dev into rizomo ([f515029](https://gitlab.mim-libre.fr/alphabet/laboite/commit/f5150290521b6ac630d427e5b81e73ec8a9f8cd0))
* **settings:** feature to cut minio ([93fb710](https://gitlab.mim-libre.fr/alphabet/laboite/commit/93fb7108adf39052429595b9308784d59009b5d9))
* **settings:** simplify settings file ([f26d523](https://gitlab.mim-libre.fr/alphabet/laboite/commit/f26d5235183bf9d070044d65ec5cd0e3d38b2dc0))
* **structures:** add migration script ([b71aa17](https://gitlab.mim-libre.fr/alphabet/laboite/commit/b71aa17f74fdc4bd4a31b97bbe8ee139e88008cd))
* **theme:** add components overrides architecture ([a9ba27f](https://gitlab.mim-libre.fr/alphabet/laboite/commit/a9ba27f8885c5a3790489e62b8dc6dcaef0b72e7))
* **theme:** add custom themes features ([ae34ef2](https://gitlab.mim-libre.fr/alphabet/laboite/commit/ae34ef2ca8205642fe28d87d4293913aa89d2848))
* **theme:** add default props to theme & example ([8f135bb](https://gitlab.mim-libre.fr/alphabet/laboite/commit/8f135bbfe5fab8d56a9d560b941e25f35198a87a))
* **theme:** change header & button & card styles ([f71b04e](https://gitlab.mim-libre.fr/alphabet/laboite/commit/f71b04e5329a23e27b109dc6557a9624f4e4a824))
* **theme:** overwrite input style to the DSE ([4aca673](https://gitlab.mim-libre.fr/alphabet/laboite/commit/4aca67332039d42bc4c0bfc63d06f01a424c4d3b))
* **theme:** update theming ([d4569d2](https://gitlab.mim-libre.fr/alphabet/laboite/commit/d4569d27ef4442db4c5e1ebcdb55e898dd9d04cf))
* **view:** common topBar on themes ([1599e03](https://gitlab.mim-libre.fr/alphabet/laboite/commit/1599e035a8fa6dfbfa497581346688f864b70190))
* **widget:** add new script to have common widget ([ffb41aa](https://gitlab.mim-libre.fr/alphabet/laboite/commit/ffb41aab26aeb3a84ccafb7c5076cb24f3812ae6))
* **widget:** logged icon for widget ([fcd91ff](https://gitlab.mim-libre.fr/alphabet/laboite/commit/fcd91ff5799675890682306cfe772b9c2c3f5f7a))


### Performance Improvements

* **signlayout:** remove background image for mobile version ([ee76304](https://gitlab.mim-libre.fr/alphabet/laboite/commit/ee763040758a4e41cd6e856430b4140e0dd3e3b6))


### Styles

* **gitlab-ci:** better self explanatory job names ([62613a8](https://gitlab.mim-libre.fr/alphabet/laboite/commit/62613a8f92073a84c5f0b722a4cfd906c7a4178c))

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

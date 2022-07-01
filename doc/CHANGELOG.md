# Changelog

## [4.2.6](https://gitlab.mim-libre.fr/alphabet/laboite/compare/release/4.2.5...release/4.2.6) (2022-07-01)


### Bug Fixes

* **nextcloud:** disable nextcloud group synchronization ([d1458f9](https://gitlab.mim-libre.fr/alphabet/laboite/commit/d1458f9bc1b62d80e9ff03cc3b666b0b06553721))

## [4.2.5](https://gitlab.mim-libre.fr/alphabet/laboite/compare/release/4.2.4...release/4.2.5) (2022-06-21)


### Bug Fixes

* **admin:** prevent users admin pages crash if user has no email ([0d489c6](https://gitlab.mim-libre.fr/alphabet/laboite/commit/0d489c6564e4eb38a5834325b3521d384e57d246))

## [4.2.4](https://gitlab.mim-libre.fr/alphabet/laboite/compare/release/4.2.3...release/4.2.4) (2022-06-14)


### Bug Fixes

* **account:** ensure that default user data exists at login ([5d3243e](https://gitlab.mim-libre.fr/alphabet/laboite/commit/5d3243e96128313f694307dd81dd09b5323766e9))
* **activation:** don't rely on isRequest to get inactive users ([786ba91](https://gitlab.mim-libre.fr/alphabet/laboite/commit/786ba91fb738b3398694094dcced4eac85a2bfc9))

## [4.2.3](https://gitlab.mim-libre.fr/alphabet/laboite/compare/release/4.2.2...release/4.2.3) (2022-05-24)


### Bug Fixes

* **blog:** fix audio record button ([f110e62](https://gitlab.mim-libre.fr/alphabet/laboite/commit/f110e621dcd5e8c93ee39dc7787c24357a70bc5d))

## [4.2.2](https://gitlab.mim-libre.fr/alphabet/laboite/compare/release/4.2.1...release/4.2.2) (2022-05-12)


### Bug Fixes

* **group:** don't exit admin UI on group edit/create ([87e85d2](https://gitlab.mim-libre.fr/alphabet/laboite/commit/87e85d27e595d2cc5d9e2caa9c8e3f4f4d39befb))
* **group:** fix deleting group ([bae4d5a](https://gitlab.mim-libre.fr/alphabet/laboite/commit/bae4d5a7a00888b2cb5c87c7aa7fbc1b6940c0fd))
* **group:** fix redirect after group removal ([5a3893c](https://gitlab.mim-libre.fr/alphabet/laboite/commit/5a3893c24c2e8bc9538a828dee117ee1880a2c46))
* **group:** no delete button for group animators ([dc6a933](https://gitlab.mim-libre.fr/alphabet/laboite/commit/dc6a933d343adad44249ee6401c1a307486e423b))

## [4.2.1](https://gitlab.mim-libre.fr/alphabet/laboite/compare/release/4.2.0...release/4.2.1) (2022-05-12)


### Bug Fixes

* **markdown:** change onchange handler ([0ec1257](https://gitlab.mim-libre.fr/alphabet/laboite/commit/0ec1257a3b220ba49b83a75f50f1c497f4f80f97))
* **markdown:** remove console.log ([74253ac](https://gitlab.mim-libre.fr/alphabet/laboite/commit/74253ac1f55d442d96e2baaa7d4d60ecb1c59120))

# [4.2.0](https://gitlab.mim-libre.fr/alphabet/laboite/compare/release/4.1.2...release/4.2.0) (2022-05-05)


### Bug Fixes

* **addressBook:** fix pagination in group's address book ([af06afa](https://gitlab.mim-libre.fr/alphabet/laboite/commit/af06afa07908a21d89dfc8ef79e537afe1223a71))
* **addressBook:** fix search and display in address book page ([81da4c4](https://gitlab.mim-libre.fr/alphabet/laboite/commit/81da4c476033d0b19ae048afc9e87c21f57ddb07))
* **article factory:** limit description to 400 char ([54121d1](https://gitlab.mim-libre.fr/alphabet/laboite/commit/54121d19575464336b718a411ecb37e4c93a5af9))
* **audit:** fix momentjs and reapply forced libs versions ([3eb601b](https://gitlab.mim-libre.fr/alphabet/laboite/commit/3eb601b2f09a3a4ba5af007297750a2f6d308010))
* **audit:** update Dockerfile and CI ([fc372e0](https://gitlab.mim-libre.fr/alphabet/laboite/commit/fc372e00d9bbd7d77db54c17e46223ceae359ec9))
* **audit:** update meteor and project dependencies ([40a250d](https://gitlab.mim-libre.fr/alphabet/laboite/commit/40a250dc8652cc4e855f3e77434f3ac1a538eb72))
* **audit:** update minimist to version 1.2.6 ([ccad65b](https://gitlab.mim-libre.fr/alphabet/laboite/commit/ccad65b127dd2405d41e8895b85764ff0f188437))
* **audit:** update to Meteor 2.7.1 (includes node 14.19.1) ([5ea0a6d](https://gitlab.mim-libre.fr/alphabet/laboite/commit/5ea0a6df67f4b7faf517b2b7f21c148af1d1ff5c))
* **categorie:** fix translationwhen category already exists ([7b04cfe](https://gitlab.mim-libre.fr/alphabet/laboite/commit/7b04cfed5d86232359cdd8024377d70094063719))
* **contact:** fix structure selection in contact form ([23abbf0](https://gitlab.mim-libre.fr/alphabet/laboite/commit/23abbf05e60f06e28ab888664b468ee76e9ed83a))
* **css:** fix search box group event padding ([9226c12](https://gitlab.mim-libre.fr/alphabet/laboite/commit/9226c12ceb9d77a59577eedcb8a442a89c619e28))
* **docs:** add a message to not merging release branches locally ([8810c94](https://gitlab.mim-libre.fr/alphabet/laboite/commit/8810c945e5540518622f25c2b3ade9c471151ab8))
* **events:** fix pagination for group events page ([f616447](https://gitlab.mim-libre.fr/alphabet/laboite/commit/f616447566c4c7c5f4b322aabf47acf26324036c))
* **fakedata article:** limit description length, prevent server crash ([21ed523](https://gitlab.mim-libre.fr/alphabet/laboite/commit/21ed523d35ebb360f81fb66cadbfad9ccf852ac1))
* **fakedata:** fix url for codiMD in fake data ([a2adffe](https://gitlab.mim-libre.fr/alphabet/laboite/commit/a2adffe356239c7ee74422319edb8476f1a345a0))
* **fakeData:** retry 3 times if email already exists for fake user ([21303f7](https://gitlab.mim-libre.fr/alphabet/laboite/commit/21303f7281efa55ba4d0e6e62af88a699de794d7))
* **favicon:** update favicon with apps image ([1112437](https://gitlab.mim-libre.fr/alphabet/laboite/commit/11124376f823b9169a4c3dc8677eb90e2f5a4449))
* **group admin:** temporarily disable group members import ([f686a8d](https://gitlab.mim-libre.fr/alphabet/laboite/commit/f686a8dd1edf9cbcb443a8b323c053ecd8b2b4c9))
* **group:** fix and improve search on users.groups ([5451af7](https://gitlab.mim-libre.fr/alphabet/laboite/commit/5451af7a7a8f722d842f8fb2cf5f666daa4a408a))
* **group:** remove useless code ([164eecc](https://gitlab.mim-libre.fr/alphabet/laboite/commit/164eeccc9416f63287083562811d7f8c31a48e6d))
* **group:** replace delete button ([03ff509](https://gitlab.mim-libre.fr/alphabet/laboite/commit/03ff5093c9e023f608c419d3fb52abdacc252cfe))
* **groups:** fix redirection after group deletion ([ab35b2d](https://gitlab.mim-libre.fr/alphabet/laboite/commit/ab35b2de6a395e3fd5c20b64eacbc94d56b774b2))
* **help:** add key to each child ([0b6ac6e](https://gitlab.mim-libre.fr/alphabet/laboite/commit/0b6ac6e11b0f067778eb2ce2692e758a6413d74f))
* **help:** remove appname from title ([fe5401c](https://gitlab.mim-libre.fr/alphabet/laboite/commit/fe5401c0986f514ac07b613e1c5df335aeba811e))
* **help:** remove wrong zoneclasses prop ([34973f0](https://gitlab.mim-libre.fr/alphabet/laboite/commit/34973f01a98f97399d584498844e5bd5cffb6151))
* **i18n:** add english trad for deletion modal ([5321247](https://gitlab.mim-libre.fr/alphabet/laboite/commit/5321247009386afb12c7f280fd36f5641d3b8a3f))
* **i18n:** fix i18n ([b35b767](https://gitlab.mim-libre.fr/alphabet/laboite/commit/b35b7672706df47905e8eb85df83fc6ff2006c55))
* **i18n:** fix label for help page ([97afef3](https://gitlab.mim-libre.fr/alphabet/laboite/commit/97afef32604ab23877f912ed53d2be2a2989258d))
* **lint:** disable eslint rule react/forbid-prop-types ([70c1740](https://gitlab.mim-libre.fr/alphabet/laboite/commit/70c17404d07104badce8247d644982902dc2a46a))
* **nclocator:** block deletion when url is used ([ca42949](https://gitlab.mim-libre.fr/alphabet/laboite/commit/ca42949fce03dd0f6bf4d054a89948cc0a53f5e0))
* **nclocator:** fix url count when user is deleted ([1a6046a](https://gitlab.mim-libre.fr/alphabet/laboite/commit/1a6046aa916bd095e7956a9dc2c88e43ef81df16))
* **offline:** sort offline categories and services ([d8e48a9](https://gitlab.mim-libre.fr/alphabet/laboite/commit/d8e48a93f38dc92adbfac61ad01a555122e85402))
* **polls:** fix pagination for poll page ([808d687](https://gitlab.mim-libre.fr/alphabet/laboite/commit/808d6871ac57c52d2030b210d44675b8d4bdcd27))
* **profile:** button load data entirely clickable ([88ea2fc](https://gitlab.mim-libre.fr/alphabet/laboite/commit/88ea2fcbf4beaa9ec5e945f087460b2f7d468965))
* **profile:** delete second tooltip on load file button ([29ac847](https://gitlab.mim-libre.fr/alphabet/laboite/commit/29ac84731c2acbb3f5e78327a1c863ee41731994))
* **profil:** fix input type file on load image button ([6c6f92f](https://gitlab.mim-libre.fr/alphabet/laboite/commit/6c6f92f78c0e9b47d9ebe4f8219ad14efbbbfaae))
* **services:** fix promise on services deletion ([a2518b6](https://gitlab.mim-libre.fr/alphabet/laboite/commit/a2518b6f6c15ebbdcae7bd27cbc88da0b92a205d))
* **services:** removeFolder function is server side only, remove checks ([7ab62f4](https://gitlab.mim-libre.fr/alphabet/laboite/commit/7ab62f42d32ccca200be205e9642fac159b434ec))
* **services:** service name is unique by structure only ([ee04180](https://gitlab.mim-libre.fr/alphabet/laboite/commit/ee04180e886d275c09002112941b541d2695da5b))
* **settings:** add missing comma ([1ab5c94](https://gitlab.mim-libre.fr/alphabet/laboite/commit/1ab5c944ca5c8fb08ffffc3476507ab242d14b94))
* **structure:** fix bad display of users structure ([1846c78](https://gitlab.mim-libre.fr/alphabet/laboite/commit/1846c78fc1d1fbae000c5c43acb9e5f50805a1c7))
* **structure:** fix structure display in validation page ([d9bd2d8](https://gitlab.mim-libre.fr/alphabet/laboite/commit/d9bd2d862fa6339a8bf9efe0e1c0d027fa1ea8e9))
* **tabs:** fix menu indicator on first load ([2088b68](https://gitlab.mim-libre.fr/alphabet/laboite/commit/2088b68642ca3ff0d5f63cec92f76541e9629730))
* **test:** add test for nclocator deletion ([ea88665](https://gitlab.mim-libre.fr/alphabet/laboite/commit/ea88665f9022a559244ba87de348f7208bfb70d5))
* **tests:** fix factory for helps ([081824d](https://gitlab.mim-libre.fr/alphabet/laboite/commit/081824da7d9b4156c3241343ecfb81f100e7980f))
* **tests:** fix factory for helps ([c4dab4a](https://gitlab.mim-libre.fr/alphabet/laboite/commit/c4dab4ad641c2e534234c3cb7721e11b394d94ff))
* **ui:** fix favicon 404 with codiMD in fake data ([3a95c8b](https://gitlab.mim-libre.fr/alphabet/laboite/commit/3a95c8bc508b9b5a376bc5e7ae9503d688d667d2))
* **ui:** fix label for + button in groups page ([7831604](https://gitlab.mim-libre.fr/alphabet/laboite/commit/7831604c61e0de2ec3015fd21df2e3a1efe1f548))
* **ui:** fix scroll bar in help page ([18ff352](https://gitlab.mim-libre.fr/alphabet/laboite/commit/18ff3523522c11e8fbab1c5e6dc1b855c19f5fb3))
* **ui:** fix view mode toggle buttons not displaying state ([a0e3d31](https://gitlab.mim-libre.fr/alphabet/laboite/commit/a0e3d31a88a2bff5a61fdb3faba7ea035458b0e0))
* **ui:** fix warnings of librairies and components ([815f31b](https://gitlab.mim-libre.fr/alphabet/laboite/commit/815f31b2844c31f03a20aa7e39c87db90add3e6f))
* **ui:** replace buttons in page ([f68ad38](https://gitlab.mim-libre.fr/alphabet/laboite/commit/f68ad385cd09242db423249ebc983bf2e0bfbaf9))
* **widget:** improve widget behavior on mobile device ([27e7e5a](https://gitlab.mim-libre.fr/alphabet/laboite/commit/27e7e5a01e245d0c7e077ac9d57dd2b6332ad69e))


### Code Refactoring

* **gitlab-ci:** use new template jobs ([8cb8569](https://gitlab.mim-libre.fr/alphabet/laboite/commit/8cb85691ddaa0e8c5260e48ff61b27735999a836))
* **mainmenu:** replace logout button at the bottom of the menu ([509affd](https://gitlab.mim-libre.fr/alphabet/laboite/commit/509affdde5695497e9203084e712c185817506e4))
* **menu:** move help tap to right menu ([c787217](https://gitlab.mim-libre.fr/alphabet/laboite/commit/c787217f62dca8c062d5bd1f611d8356845b9bf2))


### Features

* **admin:** add chip to the main menu for admins ([bcad3ac](https://gitlab.mim-libre.fr/alphabet/laboite/commit/bcad3acb08f6c604761b82fd1b45aa994a0a313a))
* **admin:** add counter in admin menu to verify users ([cc46e12](https://gitlab.mim-libre.fr/alphabet/laboite/commit/cc46e12e24f6b489adf10a234a4ec5a1f2ac33aa))
* **admin:** db migration can be unlocked from appsettings UI ([22c42d1](https://gitlab.mim-libre.fr/alphabet/laboite/commit/22c42d1111372be65d32c96bfa434638a96076ef))
* **categorie:** block creation when name already use ([39702d4](https://gitlab.mim-libre.fr/alphabet/laboite/commit/39702d4d43dd1bcbe8d5ed109adf517b5979494a))
* **group:** add delete group button in edition page ([cd762d7](https://gitlab.mim-libre.fr/alphabet/laboite/commit/cd762d7d477573f6ad88e24f8d7f2d8dfefb2040))
* **help:** add help administration ([b3fc037](https://gitlab.mim-libre.fr/alphabet/laboite/commit/b3fc03776bacf9d33d32a3484a3094dad9cb3f37))
* **help:** change texts for the help page ([d87e8ed](https://gitlab.mim-libre.fr/alphabet/laboite/commit/d87e8ed710a426af05bd908a7308655734bc163c))
* **help:** display help in categories ([b4e38cb](https://gitlab.mim-libre.fr/alphabet/laboite/commit/b4e38cb3ce3933a179cfcdeecca6f70688cae9ec))
* **helps:** add category input to help items ([f6b1de8](https://gitlab.mim-libre.fr/alphabet/laboite/commit/f6b1de883ce10d5045c70a90440ab736da0bf5c9))
* **nextcloud:** auto-create nextcloud users at activation ([e871b7c](https://gitlab.mim-libre.fr/alphabet/laboite/commit/e871b7c15ad1c706840f53bc479006be79dfab88))
* **nextcloud:** create nextcloud users when auto-validating users ([f1384f6](https://gitlab.mim-libre.fr/alphabet/laboite/commit/f1384f671cafdfeba1928ae54d8723b597bf8abd))
* **users:** add delete user button in validation page ([57f2a60](https://gitlab.mim-libre.fr/alphabet/laboite/commit/57f2a60fe7d86ff0912659ff0e07c1c3a8590425))


### Tests

* **help:** add test for help api ([0796519](https://gitlab.mim-libre.fr/alphabet/laboite/commit/07965195330ff96a35b927008d7e66b5724961e9))

## [4.1.2](https://gitlab.mim-libre.fr/alphabet/laboite/compare/release/4.1.1...release/4.1.2) (2022-04-01)


### Bug Fixes

* **avatar:** fix upload image button in profile page ([9db3249](https://gitlab.mim-libre.fr/alphabet/laboite/commit/9db324948d79768d582995a91fffb20f1341e97d))

## [4.1.1](https://gitlab.mim-libre.fr/alphabet/laboite/compare/release/4.1.0...release/4.1.1) (2022-03-29)


### Bug Fixes

* **dockerfile:** migrate to node 14.19.1 ([a86fe14](https://gitlab.mim-libre.fr/alphabet/laboite/commit/a86fe141177fdc63d1bbcff068d7b5de29795795))

# [4.1.0](https://gitlab.mim-libre.fr/alphabet/laboite/compare/release/4.0.2...release/4.1.0) (2022-03-11)


### Bug Fixes

* **admin:** fix input field ([0024204](https://gitlab.mim-libre.fr/alphabet/laboite/commit/0024204320f7ecb99f2768497d3ddcb2dfba3d13))
* **blog:** hide publication menu correctly ([6098b81](https://gitlab.mim-libre.fr/alphabet/laboite/commit/6098b81b9654715fd9e6fe393a2cedb905ba9ac8))
* **groups:** do not display hidden apps in group apps ([b4b063a](https://gitlab.mim-libre.fr/alphabet/laboite/commit/b4b063af0e9c6711f6db7facc43711c9be819e91))
* **groups:** fix publication and slug parsing for group events ([f8d84ad](https://gitlab.mim-libre.fr/alphabet/laboite/commit/f8d84ad055463426ddbdce49447dbcfbf62ac31e))
* **groups:** hide routes from router ([bc3ee2e](https://gitlab.mim-libre.fr/alphabet/laboite/commit/bc3ee2e6d9ef7c0af2a9e1ae64b731059cfec62f))
* **header:** fix menu bar ([23da5b0](https://gitlab.mim-libre.fr/alphabet/laboite/commit/23da5b0f276ab7956294daf2fb34f966d7a63142))
* **migration:** set auth token to optional ([df45f39](https://gitlab.mim-libre.fr/alphabet/laboite/commit/df45f39e76d2ae1d62537b5d3a7ccc212f376d9d))
* **offline:** add disabled services to list ([15d9085](https://gitlab.mim-libre.fr/alphabet/laboite/commit/15d90852dd3548e15d3eb2a09c8498f4150bac12))
* **services:** hide inactive services in offline mode ([fc4aebf](https://gitlab.mim-libre.fr/alphabet/laboite/commit/fc4aebf70b8010725e5cb562871f79e7c759aef8))
* **services:** remove offline from structure ([ef6464a](https://gitlab.mim-libre.fr/alphabet/laboite/commit/ef6464a8be688415c630f816e8a951630e5535e0))
* **settings:** change disabled pages in sample ([2ae7e41](https://gitlab.mim-libre.fr/alphabet/laboite/commit/2ae7e41ccef71a850e9a613e99c99af8be084c36))
* **settings:** fix sample commit error ([cdecc62](https://gitlab.mim-libre.fr/alphabet/laboite/commit/cdecc6262ac13d5104abd0e161e223d65e10aea6))
* **structures:** display structure name on service ([e2569dd](https://gitlab.mim-libre.fr/alphabet/laboite/commit/e2569dd4ca80a8d78884df0da89d95497f0b67cc))
* **ui:** display admin menu for nextcloud management ([f312fde](https://gitlab.mim-libre.fr/alphabet/laboite/commit/f312fde9e08ee58f3fd817eb80606b08600ef1b8))


### Continuous Integration

* **merge-to-dev:** can't merge to `dev` branch if it exists on runner ([8e725b5](https://gitlab.mim-libre.fr/alphabet/laboite/commit/8e725b51466c77d96deeecac72bbcbc4af0d860f))


### Features

* **groups:** link on group event redirects to agenda event page ([d567293](https://gitlab.mim-libre.fr/alphabet/laboite/commit/d5672931ecdf408c034255498715fbe22d6a3070))
* **migration:** set maintenance mode if database migration is locked ([5e87b28](https://gitlab.mim-libre.fr/alphabet/laboite/commit/5e87b28dd8331f9db7693e2bf2165ab6a7285df4))
* **notifications:** add auth token to users for the notifications api ([4581ac6](https://gitlab.mim-libre.fr/alphabet/laboite/commit/4581ac6dbdcef6b7ea0ae88b52735ea52700c0fb))
* **offline:** add offline column in admin ([2bcb48a](https://gitlab.mim-libre.fr/alphabet/laboite/commit/2bcb48a8ff0ec0701aae048d48ef16200b76947c))
* **offline:** add offline option to services ([e982632](https://gitlab.mim-libre.fr/alphabet/laboite/commit/e9826327427c0127cd7c68737ff2ad6f6e539c52))
* **polls:** add autologin parameter when accessing a group poll ([4ec81b5](https://gitlab.mim-libre.fr/alphabet/laboite/commit/4ec81b5e006fb9a97817d962414bd54f351e3ac6))
* **services:** add offlinePage to settings with services ([f8fc017](https://gitlab.mim-libre.fr/alphabet/laboite/commit/f8fc017aaee03086ccb576c6389a4d5d3a1ec4f9))
* **settings:** disable group features ([2b765d7](https://gitlab.mim-libre.fr/alphabet/laboite/commit/2b765d7ae61edd027903316ba6299c7d0735bf01))
* **settings:** replace enableblog with disabledfeatures ([bd8bb8c](https://gitlab.mim-libre.fr/alphabet/laboite/commit/bd8bb8c3ec303fea7c68fdb6705b7bf448d0ab33))


### Styles

* **rizomo:** change rizomo logo ([daaf799](https://gitlab.mim-libre.fr/alphabet/laboite/commit/daaf7991bc5b2464f0f806d682b6124f127c26ee))
* **widget:** max-heigh ([45b729a](https://gitlab.mim-libre.fr/alphabet/laboite/commit/45b729a2d590f8b2e5878c1d84e9fc24bcc36f78))


### Tests

* **users:** add reset token test ([3c57da4](https://gitlab.mim-libre.fr/alphabet/laboite/commit/3c57da4c21d561524b93266082dbfb17a5dcd455))

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

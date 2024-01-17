# Changelog

## [5.7.2](https://gitlab.mim-libre.fr/alphabet/laboite/compare/release/5.7.1...release/5.7.2) (2023-12-04)


### Bug Fixes

* **nctoken:** always return URL with protocol for nclocator ([77f007e](https://gitlab.mim-libre.fr/alphabet/laboite/commit/77f007e9813445dda79c851b70c97c40e666813e))

## [5.7.1](https://gitlab.mim-libre.fr/alphabet/laboite/compare/release/5.7.0...release/5.7.1) (2023-11-20)


### Bug Fixes

* **nextcloud:** manage nclocators without https:// at start ([27fb132](https://gitlab.mim-libre.fr/alphabet/laboite/commit/27fb132c1995a31d56f025d5eaca9715ef76b947))

# [5.7.0](https://gitlab.mim-libre.fr/alphabet/laboite/compare/release/5.6.1...release/5.7.0) (2023-11-07)


### Bug Fixes

* **adminpage:** remove unused expiration date input ([3074433](https://gitlab.mim-libre.fr/alphabet/laboite/commit/307443338b642667be647cab4957709bfe2de65e))
* **api:** generate basic user by API ([073280e](https://gitlab.mim-libre.fr/alphabet/laboite/commit/073280edaa716e380b07d9558629be42299558e5))
* **avatar:** check if user is active ([9f3fdce](https://gitlab.mim-libre.fr/alphabet/laboite/commit/9f3fdceec048e2b63420c06a7dc1939194412865))
* **env:** variable force cast to int ([208a6d4](https://gitlab.mim-libre.fr/alphabet/laboite/commit/208a6d413f3a893121283befca028271ebe5346d))
* **eventsAgenda:** ensure updatedAt field is set on all events ([d81ede8](https://gitlab.mim-libre.fr/alphabet/laboite/commit/d81ede8918c4be8eb61bc9d4e251ae2c154dd6c7))
* **globalInfos:** allow to edit and delete structure infos ([58e09e6](https://gitlab.mim-libre.fr/alphabet/laboite/commit/58e09e6b7f1ed6f925763ddc6ed38f67240d66bd))
* **matomo:** call to Matomo trackPageView on App component ([be1bec1](https://gitlab.mim-libre.fr/alphabet/laboite/commit/be1bec19f70ed93e30f1174557aa9fa431211233))
* **personalspace:** fix disappearing blocs after search ([6df6ba9](https://gitlab.mim-libre.fr/alphabet/laboite/commit/6df6ba949252b848bcecb7cb33547d200adc0c6b))
* **personalSpace:** fix zone expand, deletion and search toggle ([1667c4a](https://gitlab.mim-libre.fr/alphabet/laboite/commit/1667c4a01bf7a24116cbcb99b28cb5fbb81999f9))
* **personalspace:** hide empty zone by default ([6b439c3](https://gitlab.mim-libre.fr/alphabet/laboite/commit/6b439c3ae5990cd3959c02370a06e003ffdb989d))
* **personalSpace:** remove useCallbacks as they break pSpace edition ([0368bec](https://gitlab.mim-libre.fr/alphabet/laboite/commit/0368bec0fbb8e447f862308892fa7bb0c7384a1d))
* **provisionning:** ancestors and children fields for structure ([bec3687](https://gitlab.mim-libre.fr/alphabet/laboite/commit/bec368719f1f62ac0114f6df87ee21525f5f1a44))
* **provisionning:** imports ([1b97e88](https://gitlab.mim-libre.fr/alphabet/laboite/commit/1b97e88e4c1bdf55cc58474288fdf704f61ff4b4))
* **provisionning:** mongo uri ([0eaf7f9](https://gitlab.mim-libre.fr/alphabet/laboite/commit/0eaf7f9755f265f303c6db376963af171dbfbe3c))
* **provisionning:** remove comment ([664d052](https://gitlab.mim-libre.fr/alphabet/laboite/commit/664d052fe9ca85da550ddfa5eb8edf78e0510379))
* **provisionning:** structure generator for csv ([0d076f4](https://gitlab.mim-libre.fr/alphabet/laboite/commit/0d076f41e96c6e7e5b49ebd98675d8ab416f5a78))
* **realm:** add user realm name as variable ([91554f9](https://gitlab.mim-libre.fr/alphabet/laboite/commit/91554f9b00298c370fb92c2d7189cce19949536b))
* **requirement:** add dotenv to requirements ([a2bfb14](https://gitlab.mim-libre.fr/alphabet/laboite/commit/a2bfb14cba43cf3159cb9f9db4134434a69fe490))
* **requirements:** add keykloak lib to list ([4849ae4](https://gitlab.mim-libre.fr/alphabet/laboite/commit/4849ae42cc66c3fe2ec29bcc37dbdbff51a40de4))
* **sample:** update .env sample with good k3d value ([009a266](https://gitlab.mim-libre.fr/alphabet/laboite/commit/009a266362190a9686fe8a9f4a5bdeec18c2fa49))
* **trad:** fix some translation problems in admin struc menu ([e76ae82](https://gitlab.mim-libre.fr/alphabet/laboite/commit/e76ae82b248a943a419e34f4d9269ca8fb1135ae))
* **user:** add favservices field ([1d87046](https://gitlab.mim-libre.fr/alphabet/laboite/commit/1d870467cb912953d02e8f1f6db84a0974e1747d))
* **username:** replace point in username ([96b70e5](https://gitlab.mim-libre.fr/alphabet/laboite/commit/96b70e5fec19750283700b0be57a043d706d14c6))
* **username:** use username instead of mail ([c5f2090](https://gitlab.mim-libre.fr/alphabet/laboite/commit/c5f2090c0978202bf8dfaa95a4eaffe265478b2a))


### Features

* **article:** add no articles page message ([8a9cc69](https://gitlab.mim-libre.fr/alphabet/laboite/commit/8a9cc6928f6690fa2d3313ab1514b15871d6a755))
* **blog:** delete enableArticle from user schema ([6cde847](https://gitlab.mim-libre.fr/alphabet/laboite/commit/6cde847426949354ff1cb114f17f5061c8ba6e3b))
* **data:** add provisioning for structures and groups ([8fc82a9](https://gitlab.mim-libre.fr/alphabet/laboite/commit/8fc82a91fa407dd57bd85bd47a31544b2890b1ab))
* **env:** add mongo db name as env ([325da93](https://gitlab.mim-libre.fr/alphabet/laboite/commit/325da931bf31b24b873c3c2f5d2142d028e9938c))
* **privisionning:** improve mail extension generator ([0520d9f](https://gitlab.mim-libre.fr/alphabet/laboite/commit/0520d9f5df188c4ad37505c9ef2eaf0157097b57))
* **profile:** publication tab is always enable for user ([a4fce9a](https://gitlab.mim-libre.fr/alphabet/laboite/commit/a4fce9a2bf5afd34752b6ee054c5882bdb937196))
* **provisionning:** add mail extension ([cd64f7b](https://gitlab.mim-libre.fr/alphabet/laboite/commit/cd64f7b5fc96d8106518bc323cade26899012b11))
* **provisionning:** add nb structures parameters ([8da9366](https://gitlab.mim-libre.fr/alphabet/laboite/commit/8da93662eb02d18d8af432e6a48a3e70af368f22))
* **provisionning:** add nb structures parameters and .env file ([834f38d](https://gitlab.mim-libre.fr/alphabet/laboite/commit/834f38d93a77e0730f98512ad099cfc7db77ff38))
* **provisionning:** add nb structures parameters and .env file ([01af381](https://gitlab.mim-libre.fr/alphabet/laboite/commit/01af38121245eb3511a0b844259036a4a15458dd))
* **provisionning:** add option to use custom csv ([1df4f09](https://gitlab.mim-libre.fr/alphabet/laboite/commit/1df4f091fea878006bbea505d8f72a46b852fde5))
* **provisionning:** add reset data option ([dbb9f21](https://gitlab.mim-libre.fr/alphabet/laboite/commit/dbb9f216c989ff34fdbb9c98de3bf869825a4653))
* **provisionning:** add script to generate csv ([08a784b](https://gitlab.mim-libre.fr/alphabet/laboite/commit/08a784b3cd3e18f42c7791d1dc0fcddccbecb9bf))
* **provisionning:** add script to generate users ([66c2159](https://gitlab.mim-libre.fr/alphabet/laboite/commit/66c2159cfeb89ee5c44cfb903f1159cd4d371eab))
* **provisionning:** add script to insert data from csv ([cf0094a](https://gitlab.mim-libre.fr/alphabet/laboite/commit/cf0094a4e729c35c21c46373d059442133fb992f))
* **provisionning:** add timestamp to log ([9ddb807](https://gitlab.mim-libre.fr/alphabet/laboite/commit/9ddb8070667b9b54396da1272dc3bdd0807d4001))
* **provisionning:** add users repartition ([374f57f](https://gitlab.mim-libre.fr/alphabet/laboite/commit/374f57fd1d9da8e245bb14e7c7f8e850be343132))
* **provisionning:** clear code ([9520975](https://gitlab.mim-libre.fr/alphabet/laboite/commit/9520975499aee888db1fdb7591c2ecaa6c8c8575))
* **provisionning:** create user and add them to structure ([9058b4e](https://gitlab.mim-libre.fr/alphabet/laboite/commit/9058b4e40e2c700799985f64efec4624923f2e3c))
* **provisionning:** edit .env file ([f71f029](https://gitlab.mim-libre.fr/alphabet/laboite/commit/f71f029d8b9fe2e04cfd9fd7adc0d6c54dc07732))
* **provisionning:** improve add to structure, generate personalspaces ([5a0d321](https://gitlab.mim-libre.fr/alphabet/laboite/commit/5a0d3213bb7b37b2831a46eb347b7c573eb644f5))
* **provisionning:** improve data deletion ([db7a9b5](https://gitlab.mim-libre.fr/alphabet/laboite/commit/db7a9b5c190f17eb220080fe28120f2acd408d3f))
* **provisionning:** improve optional arguments use ([c144f91](https://gitlab.mim-libre.fr/alphabet/laboite/commit/c144f9193acaaee2d1be7e9949f25d791c3b5089))
* **provisionning:** improve user deletion and user add in group ([9ef5c67](https://gitlab.mim-libre.fr/alphabet/laboite/commit/9ef5c67552b05565cbdbdd1fe4dccc45ae9e76b7))
* **provisionning:** remove id from csv ([e2af1f1](https://gitlab.mim-libre.fr/alphabet/laboite/commit/e2af1f195843f24cb2e6322589684797fa722996))
* **provisionning:** user deletion and creation improvement ([0b68f39](https://gitlab.mim-libre.fr/alphabet/laboite/commit/0b68f39f905847a881a3a7a53d4daef8c1af7d3e))
* **roles:** add users role to group ([653e2e0](https://gitlab.mim-libre.fr/alphabet/laboite/commit/653e2e064ed6d3891c4f11e1b61bc808e68ce567))
* **settings:** add missing documentation on app settings ([fa6e072](https://gitlab.mim-libre.fr/alphabet/laboite/commit/fa6e072b34bf8a7ddb4614f0246b505a3427f7e1))
* **settings:** complete settings documentation ([83f620b](https://gitlab.mim-libre.fr/alphabet/laboite/commit/83f620b522c68b3e742ba87f6a5adb80e31bfa47))
* **zones:** don't show mepty zones on searching ([e79255b](https://gitlab.mim-libre.fr/alphabet/laboite/commit/e79255b20784bd06a4e06b15db06785f64c9ab31))

## [5.6.1](https://gitlab.mim-libre.fr/alphabet/laboite/compare/release/5.6.0...release/5.6.1) (2023-10-02)


### Bug Fixes

* **articles:** allow embedded videos in articles and descriptions ([4084938](https://gitlab.mim-libre.fr/alphabet/laboite/commit/4084938b57f1d02aecb752a38143e461930aff8f))
* **articles:** update sanitizeHtml parameters for articles ([b92b1f4](https://gitlab.mim-libre.fr/alphabet/laboite/commit/b92b1f46234726014d9c917c0f68aabac4c6b33d))

# [5.6.0](https://gitlab.mim-libre.fr/alphabet/laboite/compare/release/5.5.2...release/5.6.0) (2023-10-02)


### Bug Fixes

* **analytics:** build structure tree on any depth ([8ec2258](https://gitlab.mim-libre.fr/alphabet/laboite/commit/8ec22589ec440219f43779116e5e16db88df1885))
* **articles:** allow embedded videos in articles and descriptions ([fb10267](https://gitlab.mim-libre.fr/alphabet/laboite/commit/fb1026796c87b34f94dfb5984b17a4dbed01526c))
* **articles:** update sanitizeHtml parameters for articles ([6b1ed4b](https://gitlab.mim-libre.fr/alphabet/laboite/commit/6b1ed4b70cb117698059539aeaab261a96e6913e))
* **build:** get node image from meteor docker images ([a3d6874](https://gitlab.mim-libre.fr/alphabet/laboite/commit/a3d68740563b3bea2f5e1cebb3756f35f8abe02c))
* **css:** add selector in css file ([fa91881](https://gitlab.mim-libre.fr/alphabet/laboite/commit/fa918815d7c25ece92e19d2d616aafbde8a37668))
* **fileUpload:** remove unnecessary log when file is too large ([73107a9](https://gitlab.mim-libre.fr/alphabet/laboite/commit/73107a932169da90863cd944bd9aa540981977de))
* **forms:** fix typo in get_groups.forms_count method ([b297cd9](https://gitlab.mim-libre.fr/alphabet/laboite/commit/b297cd951068a412d65216f828738b13db5730e4))
* **globalInfos:** fix display and position of date and text ([beabace](https://gitlab.mim-libre.fr/alphabet/laboite/commit/beabace1a6600511768a29fad3770f6a0d77d032))
* **globalInfos:** fix various texts and glitches in UI ([e1b8d59](https://gitlab.mim-libre.fr/alphabet/laboite/commit/e1b8d59e559268d2a03059b9eed761cc597794b9))
* **i18n:** remove duplicate message ([eea2831](https://gitlab.mim-libre.fr/alphabet/laboite/commit/eea283161bff38c9749542bf58f387219a07420e))
* **informations:** fix modal size to modify a global info ([7464f1e](https://gitlab.mim-libre.fr/alphabet/laboite/commit/7464f1e8a40e471d6812dcbed60667f1157126dc))
* **IntroductionPage:** replace inline style with classes ([55138e8](https://gitlab.mim-libre.fr/alphabet/laboite/commit/55138e829546bf8ddceba4a0e56f897d629c0322))
* **labels:** change some labels in menus ([f18644c](https://gitlab.mim-libre.fr/alphabet/laboite/commit/f18644c3819fafecd53c9d653afa31523c31e390))
* **links:** make html links blue and underlined ([1dcb443](https://gitlab.mim-libre.fr/alphabet/laboite/commit/1dcb4438dcc6f9acddd42b420a9c1cce6e677a52))
* **logo:** app logo in top bar redirects to personal space ([436cb4b](https://gitlab.mim-libre.fr/alphabet/laboite/commit/436cb4bd20ce18de965592fa236c64f8f7323fab))
* **onboarding:** disable onboarding until active with structure ([5da15eb](https://gitlab.mim-libre.fr/alphabet/laboite/commit/5da15eb77063accfec4e0382a913d51610bcd4d8))
* **onBoarding:** remove theme, apps translation is the default ([735c5fd](https://gitlab.mim-libre.fr/alphabet/laboite/commit/735c5fd97632072a4f835f2214a7031b6c64de60))
* **onboarding:** remove unnecessary Meteor import ([ba21c01](https://gitlab.mim-libre.fr/alphabet/laboite/commit/ba21c01d9f076f39f1340311dd7098cd55557de7))
* **package:** change script to run tests ([0ed93c5](https://gitlab.mim-libre.fr/alphabet/laboite/commit/0ed93c5bca7f2b42905db0e8e5269bdc0487ce88))
* **profile:** disable avatar edition if user is not active ([2f3d4be](https://gitlab.mim-libre.fr/alphabet/laboite/commit/2f3d4be154961680d4bd31d6b97dcbe5f9e380f3))
* **quota:** quota check in admin group page ([07d4be1](https://gitlab.mim-libre.fr/alphabet/laboite/commit/07d4be19e06d8bf08adc9571bf861a7b275de46c))
* **redirect:** auto redirect from informations page ([85fae14](https://gitlab.mim-libre.fr/alphabet/laboite/commit/85fae14be640c0d77c595662386643ab15f3d604))
* **redirect:** auto redirect on informations page ([bd840b9](https://gitlab.mim-libre.fr/alphabet/laboite/commit/bd840b978638fb6f3a869ec1136e42fde702d115))
* **service:** force favservices init if field is missing ([d3d7d09](https://gitlab.mim-libre.fr/alphabet/laboite/commit/d3d7d09a105a720aefcbb084f12ae01d7a8a44e8))
* **services:** prefix structure service url with structure id ([683e98b](https://gitlab.mim-libre.fr/alphabet/laboite/commit/683e98b6f2aefe60312ca32f99ace374571f6772))
* **structures:** create and receive structure information messages ([06121a0](https://gitlab.mim-libre.fr/alphabet/laboite/commit/06121a0aec5cf697eb33cc64fada6d2202a0bfd6))
* **structures:** fix query in getAllGlobalInfoByLanguage ([45a6b87](https://gitlab.mim-libre.fr/alphabet/laboite/commit/45a6b87d06a58144d93d101ee9a091a3ce595768))
* **structures:** manage structure name and parent struc messages ([4b6c2bc](https://gitlab.mim-libre.fr/alphabet/laboite/commit/4b6c2bccb81b5ff164b9800b5cf3ac9575848764))
* **structures:** page NewIntroductionPage replaces IntroductionPage ([72cb752](https://gitlab.mim-libre.fr/alphabet/laboite/commit/72cb7523f089f4909edddf26db96823844c28a6f))
* **structures:** remove chip from admin, change messages design ([c4a1a1f](https://gitlab.mim-libre.fr/alphabet/laboite/commit/c4a1a1f122aec1462439a02a8f7f5e8047d9a508))
* **user tests:** email not passed correctly at account creation ([ccebeb5](https://gitlab.mim-libre.fr/alphabet/laboite/commit/ccebeb5078692f38a6306d1022de7a5dddb0f4a9))


### Features

* **bookmarks:** add import/export ([daf963b](https://gitlab.mim-libre.fr/alphabet/laboite/commit/daf963b88bffc154e2baa365e9a3a04fe5f3f906))
* **bookmarks:** increase bookmarks url length ([fb28609](https://gitlab.mim-libre.fr/alphabet/laboite/commit/fb28609978b09658de88aa2ec9fd2c3e604dddbf))
* **forms:** force user to log in when answering a group form ([5b08d1a](https://gitlab.mim-libre.fr/alphabet/laboite/commit/5b08d1a6ee3fdd8f7d49fc012f6d923f8f205ac8))
* **group:** disable add button if too many groups created ([8517b2c](https://gitlab.mim-libre.fr/alphabet/laboite/commit/8517b2c7d2301a2b0bad829187d8246cfdb8732e))
* **libs:** update npm libs to wanted version ([1592db4](https://gitlab.mim-libre.fr/alphabet/laboite/commit/1592db43d8f9aaa9376bc549a48a98f6280b79bc))
* **libs:** update version number of meteor base ([11d81e3](https://gitlab.mim-libre.fr/alphabet/laboite/commit/11d81e3a8545379f728234391813795e1f6de4bc))
* **mediastorage:** add crop tools for upload image ([081f966](https://gitlab.mim-libre.fr/alphabet/laboite/commit/081f9669eb628982d1892b73f48515ed683f23a3))
* **mediastorage:** add warning text to media storage page ([600f3d7](https://gitlab.mim-libre.fr/alphabet/laboite/commit/600f3d7b16dc56119553139679083521081d2766))
* **node:** change node version to previous version ([05d1c41](https://gitlab.mim-libre.fr/alphabet/laboite/commit/05d1c4199ee9efd9461ed67a82578246c77c8612))
* **onBoarding:** add steps for groups and apps theme ([4cf8adf](https://gitlab.mim-libre.fr/alphabet/laboite/commit/4cf8adfec1474c32709df4cee4e4e69ca00aea64))
* **packgage:** regen package lock with the new deps ([84d6269](https://gitlab.mim-libre.fr/alphabet/laboite/commit/84d6269f78af219b7aff82f03f6924cdea5ab138))
* **profile:** hide apply struc perso space if no structure ([d32cb67](https://gitlab.mim-libre.fr/alphabet/laboite/commit/d32cb673c025d243118fa45665c05272e09a32e6))
* **test:** disable logging initialize for tests ([4653234](https://gitlab.mim-libre.fr/alphabet/laboite/commit/4653234431537e0ab87a5b4362bd4c2767b60a48))
* **tokenApi:** allow users to login from widget host ([64f555d](https://gitlab.mim-libre.fr/alphabet/laboite/commit/64f555d5254798541f8898f414da6c2ad5204cf8))
* **widget:** init widget in a shadow root ([2143857](https://gitlab.mim-libre.fr/alphabet/laboite/commit/2143857082c025b0d12488761fa8f32424db0d55))


### Tests

* fix tests and eslint errors ([8c6661d](https://gitlab.mim-libre.fr/alphabet/laboite/commit/8c6661d4cc0cc53de6d1534bbeef682d0f217195))
* **globalinfos:** add tests for structure messages ([6c1c917](https://gitlab.mim-libre.fr/alphabet/laboite/commit/6c1c917680932c32521c68a37ae66996d1965929))

## [5.5.2](https://gitlab.mim-libre.fr/alphabet/laboite/compare/release/5.5.1...release/5.5.2) (2023-09-29)


### Bug Fixes

* **service:** disable add button for structure groups ([c465878](https://gitlab.mim-libre.fr/alphabet/laboite/commit/c465878ad27476572cd6b4f42c04f51eb92265b5))

## [5.5.1](https://gitlab.mim-libre.fr/alphabet/laboite/compare/release/5.5.0...release/5.5.1) (2023-09-01)


### Bug Fixes

* **nextcloud:** add setting to hide plugins checkboxes in group admin ([0210865](https://gitlab.mim-libre.fr/alphabet/laboite/commit/0210865e943811b9fdf40af075425d22a62a57a7))

# [5.5.0](https://gitlab.mim-libre.fr/alphabet/laboite/compare/release/5.4.0...release/5.5.0) (2023-08-24)


### Bug Fixes

* **admin users:** take selected structure into account ([8acb462](https://gitlab.mim-libre.fr/alphabet/laboite/commit/8acb4624f029776e700e02eb2c1630a25d8885e9))
* **admin:** fix error case in admin message interface ([4fd9e47](https://gitlab.mim-libre.fr/alphabet/laboite/commit/4fd9e47077bb2c1eab374eb76afb08526ec7decb))
* **adminService:** size url to 20 char max and show it in title ([2aa0a2d](https://gitlab.mim-libre.fr/alphabet/laboite/commit/2aa0a2d2b0a338c97943653264d56ccf986da979))
* **banner:** fix icon position when only icon is set ([d680ea2](https://gitlab.mim-libre.fr/alphabet/laboite/commit/d680ea2e2a4109df122d0367fd564d109187f2fa))
* **bookmark:** change error message when edit/create bookmark ([8c46ae6](https://gitlab.mim-libre.fr/alphabet/laboite/commit/8c46ae64033e23498af4b4912cee2526dba425ad))
* **bookmark:** check if user is member of group or author ([59d7fb2](https://gitlab.mim-libre.fr/alphabet/laboite/commit/59d7fb23c6bc321b1b64f15058ffdcfc0a4e95a0))
* **bookmark:** missing link ref ([0f8e3be](https://gitlab.mim-libre.fr/alphabet/laboite/commit/0f8e3bebc93882394c102884eba073130babcab6))
* **bookmark:** rewrite conditions ([e43ec7d](https://gitlab.mim-libre.fr/alphabet/laboite/commit/e43ec7d19dd818b0708004a4c4dbab94722886d7))
* **button:** fix button position skip to content ([0d2938f](https://gitlab.mim-libre.fr/alphabet/laboite/commit/0d2938fb9f49e2f404e9ff9de13727b86426013b))
* **circles:** adapt code for api calls on federated instance ([adde624](https://gitlab.mim-libre.fr/alphabet/laboite/commit/adde62402f154a6206807b857907a60443dbd671))
* **circles:** adapt group resources link for nextcloud ([ad1b93a](https://gitlab.mim-libre.fr/alphabet/laboite/commit/ad1b93a852b91fdee3bda013f8d143e6d1fe96fd))
* **contact:** array of mails for carbon copy ([185dac0](https://gitlab.mim-libre.fr/alphabet/laboite/commit/185dac0561abe8a179f7ed80ae9a00cde3875563))
* **contact:** verify external url string ([b731113](https://gitlab.mim-libre.fr/alphabet/laboite/commit/b731113c87278e74375ec25f4d8cd2b4325c0f9f))
* **eventsAgenda:** add migration step for incomplete events (sondage) ([66015b8](https://gitlab.mim-libre.fr/alphabet/laboite/commit/66015b864bf458fb7a4123adfedbffad0a39533b))
* **favorite:** unfavorite group bookmark ([ec1c55d](https://gitlab.mim-libre.fr/alphabet/laboite/commit/ec1c55d43af6df80231b3b932e878f822326a40c))
* **file-transfer:** add server logs ([df61adc](https://gitlab.mim-libre.fr/alphabet/laboite/commit/df61adcb7b9165640707a2918b687dec0ac7c0f4))
* **file-upload:** add post-rebases fixes ([b81ac01](https://gitlab.mim-libre.fr/alphabet/laboite/commit/b81ac01fe19eddab7337c1ac26091d9bfd2ed904))
* **forms:** sort on publication ([9cdc6af](https://gitlab.mim-libre.fr/alphabet/laboite/commit/9cdc6afe5045c2d1a98b53add62415a32d43598b))
* **globalinfos:** reset state when cancel update ([0679d02](https://gitlab.mim-libre.fr/alphabet/laboite/commit/0679d02ee2b6f1e715a419c2f16d940b88f6e72f))
* **i18n:** add missing messages ([f0ecf16](https://gitlab.mim-libre.fr/alphabet/laboite/commit/f0ecf163260fbe96867c526bd809756e50a3e412))
* **i18n:** dates display for events ([f8fcb18](https://gitlab.mim-libre.fr/alphabet/laboite/commit/f8fcb187bb68bbb3121efab206f35728f26c3849))
* **i18n:** fix ortho in "AvatarEdit" ([54dd33c](https://gitlab.mim-libre.fr/alphabet/laboite/commit/54dd33c29d315b0d5a13ed4854047daff1bb29e7))
* **i18n:** translation ([6aebe8f](https://gitlab.mim-libre.fr/alphabet/laboite/commit/6aebe8fca3458efe0316c74016c44ed60b7b26b5))
* **import:** remove useless pages ([dfaa05e](https://gitlab.mim-libre.fr/alphabet/laboite/commit/dfaa05eba0c374627e6a3e5e2ec7a97451d29406))
* **info:** fix message display in user interface ([f97c3df](https://gitlab.mim-libre.fr/alphabet/laboite/commit/f97c3dff281455bcf2a0c51faab63aabf1f707ae))
* **kcClient:** fix _getToken not working anymore ([3eb4f7b](https://gitlab.mim-libre.fr/alphabet/laboite/commit/3eb4f7b9656e888721eaa3206807748b56b4acaf))
* **keycloak:** create adminStructure group at startup if needed ([cac7425](https://gitlab.mim-libre.fr/alphabet/laboite/commit/cac7425dde2ce8a1f690a534e6dfff479053ef04))
* **keycloak:** don't log the full error when authentication fails ([6327d26](https://gitlab.mim-libre.fr/alphabet/laboite/commit/6327d26ceec54f2aa2db1e70178ffa822e51839b))
* **keycloak:** remove deleted groups from keycloak ([3c4ffbc](https://gitlab.mim-libre.fr/alphabet/laboite/commit/3c4ffbc26dbcaf138165fc2d643f31d0571c057d))
* **keycloak:** remove useless .then ([fa419a2](https://gitlab.mim-libre.fr/alphabet/laboite/commit/fa419a2722943c773b911fc63bc0e7ba66b34b87))
* **labels:** improve coherency for menus and page titles ([bbbf1ef](https://gitlab.mim-libre.fr/alphabet/laboite/commit/bbbf1ef119afc807037db6c32ed004915665cdb7))
* **log:** add LOG_LEVEL env variable for default level ([d597b29](https://gitlab.mim-libre.fr/alphabet/laboite/commit/d597b292c78fcd9f2b17384c73771272176c91eb))
* **log:** delete last parameter for logServer ([31e12c5](https://gitlab.mim-libre.fr/alphabet/laboite/commit/31e12c59965d3044ff9dfc182dc5ffd13547a818))
* **log:** display params after at end line ([1277c17](https://gitlab.mim-libre.fr/alphabet/laboite/commit/1277c1745aa584a2ff0fb8ac0d90f3fddc106a14))
* **logs:** correct object object text in logs ([15e3b2d](https://gitlab.mim-libre.fr/alphabet/laboite/commit/15e3b2d27ab2a3326ead936ae1306fab4596758b))
* **logs:** stringify object in server logs string ([4fff563](https://gitlab.mim-libre.fr/alphabet/laboite/commit/4fff563bb21e201b73b8bf2d941c05b26bfdab2e))
* **mails:** get target mails ([8aa041e](https://gitlab.mim-libre.fr/alphabet/laboite/commit/8aa041e6afcea848287d8e7c97ecef07763a14d0))
* **mails:** improve mails search ([1da3bc0](https://gitlab.mim-libre.fr/alphabet/laboite/commit/1da3bc0b4ec2c13367205968e45d418507c3517a))
* **mainlayout:** disable redirect if no globalinfo ([4382fe8](https://gitlab.mim-libre.fr/alphabet/laboite/commit/4382fe8961423eeaf975976e8712ea1d774917d9))
* **menu:** fix errors when rendering Divider inside Tabs component ([15c4cc2](https://gitlab.mim-libre.fr/alphabet/laboite/commit/15c4cc24e7e7b032ccb26e4883f385bf3be329ce))
* **menu:** reorder items in MenuBar.jsx ([22682f4](https://gitlab.mim-libre.fr/alphabet/laboite/commit/22682f46dab45be9f8a37f4612a5d1a8a14d2c97))
* **meteor:** change version in packages ([74ad50d](https://gitlab.mim-libre.fr/alphabet/laboite/commit/74ad50db299abb22e270e5e7dd919e691b894d98))
* **mui:** add select mui component ([9aafd5e](https://gitlab.mim-libre.fr/alphabet/laboite/commit/9aafd5e044925acb23b31311285e9817bdbdf793))
* **nextcloud:** don't display full errors in logs (sensitive data) ([ec5f779](https://gitlab.mim-libre.fr/alphabet/laboite/commit/ec5f779a2b44335a239c947d5f7b08a553ad28b7))
* **nextcloud:** fix url for share access button in group page ([85a2b94](https://gitlab.mim-libre.fr/alphabet/laboite/commit/85a2b9400585e737bc9c659d6e57d8d035ab082b))
* **nextcloud:** inviteMembers ignores users without nclocator ([7dfa421](https://gitlab.mim-libre.fr/alphabet/laboite/commit/7dfa421e0c7876c7d865c8cf7baa25b3d5e7872c))
* **nextcloud:** take sharename into account at group edition ([beea984](https://gitlab.mim-libre.fr/alphabet/laboite/commit/beea984ef06528fa7b311b50053598cc9d453fd3))
* **notification:** add multi groups api notification ([72affd9](https://gitlab.mim-libre.fr/alphabet/laboite/commit/72affd9533807ab441c78320e5148807be55a44e))
* **notification:** change button style ([df88def](https://gitlab.mim-libre.fr/alphabet/laboite/commit/df88def144b55b6ebc31d7961e7d2183c616abd0))
* **notifications:** hide structure group id in role notifications ([be2dbbf](https://gitlab.mim-libre.fr/alphabet/laboite/commit/be2dbbfe8527e88a0cbc5d98d4397415a1170dab))
* **onboarding:** adapt to new path for personal space steps ([6e7b2cb](https://gitlab.mim-libre.fr/alphabet/laboite/commit/6e7b2cb357bf87d4b281de047dc25f200659145b))
* **onBoarding:** settings really disable onboarding ([9f6c56d](https://gitlab.mim-libre.fr/alphabet/laboite/commit/9f6c56ddade7542bcdba71dc7130f4666969acd3))
* **package:** add script to fix npm problems ([8331a96](https://gitlab.mim-libre.fr/alphabet/laboite/commit/8331a964dd7554d5ced1535fbb90457399073769))
* **packages:** add correct version of minio library ([4c81147](https://gitlab.mim-libre.fr/alphabet/laboite/commit/4c811474e63085d990259456e9d5b472f85c794e))
* **packages:** remove reintroduced npm-force-resolutions, audit fix ([d86b42b](https://gitlab.mim-libre.fr/alphabet/laboite/commit/d86b42bbefde8ad2f4e96e7bdbc26ccdfc542e3b))
* **personalspace:** group card duplication ([8f3cc49](https://gitlab.mim-libre.fr/alphabet/laboite/commit/8f3cc499355746718f7c45080b553d5f907a9d07))
* **polls:** remove polls page ([5e562cd](https://gitlab.mim-libre.fr/alphabet/laboite/commit/5e562cd261aa7d7c7912168d162c95901129732c))
* **profilepage:** dont display username if hasnt nclocator ([cad3295](https://gitlab.mim-libre.fr/alphabet/laboite/commit/cad3295d45ee0a875c350da15f720fe61f4ae8d6))
* **search:** change calcul of nbPage in method callback ([ee082a9](https://gitlab.mim-libre.fr/alphabet/laboite/commit/ee082a997b356f8fbe3dfdb189cbde992e8e3fd7))
* **search:** change page after search ([6515a2a](https://gitlab.mim-libre.fr/alphabet/laboite/commit/6515a2a63f1e6e3a7a69f1f0f73635e4315a635e))
* **search:** page change after search ([efe5852](https://gitlab.mim-libre.fr/alphabet/laboite/commit/efe5852f033846c4e83e257c9b1ccaaed9fefde4))
* **search:** pagination in users search ([ca3ee71](https://gitlab.mim-libre.fr/alphabet/laboite/commit/ca3ee7187bf307a583b4fbab4edac0ed1072479b))
* **search:** search all users regex ([9f7215b](https://gitlab.mim-libre.fr/alphabet/laboite/commit/9f7215be745da3f5efe19c1cc35cb26a0813abab))
* **service:** add titles and adjust style ([97f1eb2](https://gitlab.mim-libre.fr/alphabet/laboite/commit/97f1eb2e694bd4a271f6ca1204aea07855330c94))
* **services:** orders and display of polls and events ([07e5641](https://gitlab.mim-libre.fr/alphabet/laboite/commit/07e56413ab612d47906a5dbf58a490d6420a2fec))
* **services:** search and publications ([ff28700](https://gitlab.mim-libre.fr/alphabet/laboite/commit/ff28700f6538308ecaa36254c500f54c9a7b1d4a))
* **settings:** display of save button for global settings ([fbd3a1b](https://gitlab.mim-libre.fr/alphabet/laboite/commit/fbd3a1bfa4105b2435f927c8428de2b5409c3ba6))
* **settings:** state reset after window resize ([e318ed1](https://gitlab.mim-libre.fr/alphabet/laboite/commit/e318ed1ba9faffdb6da9e79b862a15a99d124450))
* **smtp:** generation of mails list for carbon copy ([6233037](https://gitlab.mim-libre.fr/alphabet/laboite/commit/62330378158f198d826d431efc7a6f5a31b51365))
* **structure:** loading page when no structures exist ([75322e7](https://gitlab.mim-libre.fr/alphabet/laboite/commit/75322e7dc646e42cbfc084d4e20bf59974a74fbf))
* **structures:** fix hover and style attribute ([c0f2c7a](https://gitlab.mim-libre.fr/alphabet/laboite/commit/c0f2c7a381c99b4ee1e41b67a0383204224773a8))
* **structures:** make structure selection more user friendly ([86060d8](https://gitlab.mim-libre.fr/alphabet/laboite/commit/86060d80a1c67bce722267d39f2ea469453b57c1))
* **structures:** trim name on structure creation/edition ([391db9c](https://gitlab.mim-libre.fr/alphabet/laboite/commit/391db9cbc9b4978c1ecd01675b6c4363f77483a7))
* **structure:** trim on structure name on submit only ([e29ec37](https://gitlab.mim-libre.fr/alphabet/laboite/commit/e29ec37f48ef37cf43bd69d99b835b14f867c942))
* **tooltip-service-fields:** adding tooltip on some service fields ([d9a7127](https://gitlab.mim-libre.fr/alphabet/laboite/commit/d9a7127fcfd745d47159b98a3fee965dbebc053c))
* **tooltip:** fix tooltip ([5686261](https://gitlab.mim-libre.fr/alphabet/laboite/commit/5686261e175ca1951cb7a7e9c318bc60500130c2))
* typo ([577f88a](https://gitlab.mim-libre.fr/alphabet/laboite/commit/577f88a6960d75537d7454c30ac85236a8416071))
* **ui:** fix skiptocontent link position ([89bef68](https://gitlab.mim-libre.fr/alphabet/laboite/commit/89bef68c2cd696b4a04990a3242b59d7caef5437))
* **user-search:** fix missing structure and reactivity ([7128d83](https://gitlab.mim-libre.fr/alphabet/laboite/commit/7128d832b86de6adbca48074c9d3a03dbd6cd99a))
* **user-search:** replace subscription with method ([e6170f6](https://gitlab.mim-libre.fr/alphabet/laboite/commit/e6170f60d127a27e79f9604ba137f7b48ace8270))
* **users:** refetch user list on user deletion ([57e23b6](https://gitlab.mim-libre.fr/alphabet/laboite/commit/57e23b675d60072da2e3efe92cde24324589d9e1))
* **utils:** search of user in role ([e6928d7](https://gitlab.mim-libre.fr/alphabet/laboite/commit/e6928d793c5dd0092787ad618083f1abd092a12f))
* **widget:** add ([1867393](https://gitlab.mim-libre.fr/alphabet/laboite/commit/186739314ff190f330b9074451ecc8271759b7b1))


### Build System

* **meteor:** update meteor to 2.12 and meteor packages ([7e6ef12](https://gitlab.mim-libre.fr/alphabet/laboite/commit/7e6ef12525d8db0f188e84a06c765f68abde6ae6))


### Code Refactoring

* **adminServices:** remove style balise and add style to css class ([2082102](https://gitlab.mim-libre.fr/alphabet/laboite/commit/20821027d1b11ceec769d924f3ceeb50ddc95239))
* **default_space:** rebase on dev ([9c95f29](https://gitlab.mim-libre.fr/alphabet/laboite/commit/9c95f295f25800c763654ec58fce19abd9e5286b))
* **gitignore:** add .reports to gitignore ([4c8e1c8](https://gitlab.mim-libre.fr/alphabet/laboite/commit/4c8e1c86dd0f9fa55e3bc2ad725858bf8aec31f2))
* **group:** poll, event and form pages ([073a4db](https://gitlab.mim-libre.fr/alphabet/laboite/commit/073a4db307b536aa40063d7ace9687b64cfcfaa1))


### Continuous Integration

* **husky:** run check-lang script at commit ([c2ec83b](https://gitlab.mim-libre.fr/alphabet/laboite/commit/c2ec83ba23c3d624e6cc72b0ffbe8766ab64d411))


### Documentation

* **dev:** start doc about CRUD ([40080a3](https://gitlab.mim-libre.fr/alphabet/laboite/commit/40080a3512e9d2157ee8a9dafcfffba31ed1ca76))
* **dev:** start new dev doc ([80c1939](https://gitlab.mim-libre.fr/alphabet/laboite/commit/80c193951c09b907da98d66f003aadec79324299))
* **fix:** remove not useful backtick ([45eb239](https://gitlab.mim-libre.fr/alphabet/laboite/commit/45eb239247b71b4213a019f2d1e79d8681f93c4b))
* **fs:** add explanation about project file architecture ([ac172b0](https://gitlab.mim-libre.fr/alphabet/laboite/commit/ac172b04faf0806f0e0353920a75d22ed02fd736))
* **global:** create a contrib doc to link all docs ([6e6a4ac](https://gitlab.mim-libre.fr/alphabet/laboite/commit/6e6a4ac6a987d0afc27164240f29de2d573eef16))
* **laboite:** add explanation about global app usage ([ae83196](https://gitlab.mim-libre.fr/alphabet/laboite/commit/ae83196de7895c53a84c334e5956c6e9f62830fd))
* **logs:** add documention for server logging ([4978a52](https://gitlab.mim-libre.fr/alphabet/laboite/commit/4978a52f124b2bcf1675430f55f088f813641a96))
* **mui:** complete markdown syntax ([7f23dce](https://gitlab.mim-libre.fr/alphabet/laboite/commit/7f23dce33684e12350d5b207853dd84f0321e37d))
* **readme:** add link to contributing guide in readme ([8842204](https://gitlab.mim-libre.fr/alphabet/laboite/commit/88422044193f407b3fe4a523339c202e7abb8d8e))
* **theme:** add documention about theme and MUI ([f960856](https://gitlab.mim-libre.fr/alphabet/laboite/commit/f96085650706c9e15f050c329525163a80f8c38f))
* **theme:** add precisions on tss react ([9c5c4c7](https://gitlab.mim-libre.fr/alphabet/laboite/commit/9c5c4c7a14ce2d6415c1245ee663d3dc3dcb69be))


### Features

* **admin:** add front error in admin form ([9e2ad23](https://gitlab.mim-libre.fr/alphabet/laboite/commit/9e2ad23d0c00fff13fd6b705903caa558d3213bd))
* **admin:** fix admin menu style for global info ([3927094](https://gitlab.mim-libre.fr/alphabet/laboite/commit/3927094296a9fa544c755ce4e80ce143dde11edd))
* **analytics:** implement analytics module ([0c67517](https://gitlab.mim-libre.fr/alphabet/laboite/commit/0c675174b346e72de08cc84da6ea3014384b0a67))
* **API:** create nextcloud user in createuser API ([6a19c9c](https://gitlab.mim-libre.fr/alphabet/laboite/commit/6a19c9cb159fd8129a306be8cc7d42b811a3c36b))
* **bookmark:** add edit option on favorites ([67321f5](https://gitlab.mim-libre.fr/alphabet/laboite/commit/67321f5183c1dbe2b52a51ffec33cf925b23c04f))
* **bookmark:** add favorite group bookmark to personal space ([4a18eea](https://gitlab.mim-libre.fr/alphabet/laboite/commit/4a18eea29490fa23f16692970d93ef91a59f0da6))
* **bookmark:** add favorite on groups bookmarks ([64df3d4](https://gitlab.mim-libre.fr/alphabet/laboite/commit/64df3d4d0aa397c29285b640006f265f39f8eb10))
* **bookmarks:** detect url in clipboard ([e919758](https://gitlab.mim-libre.fr/alphabet/laboite/commit/e919758666504ec886f899802a831daa7c006bf5))
* **circles:** allow user to specify nextcloud share name ([383ce7e](https://gitlab.mim-libre.fr/alphabet/laboite/commit/383ce7ecf8327cd52e5c305cc81abae5642fa445))
* **circles:** manage circle and share at group creation/removal ([fba0174](https://gitlab.mim-libre.fr/alphabet/laboite/commit/fba01743bd41a377c03f58fb3864345865de21ed))
* **circles:** manage circle and share at group edition ([823f260](https://gitlab.mim-libre.fr/alphabet/laboite/commit/823f26012f783b52006494593a32c14bd253d6f6))
* **circles:** remove groupfolders code from nextcloud plugin ([d54141a](https://gitlab.mim-libre.fr/alphabet/laboite/commit/d54141ac0ea76f6f0f9c443c6ea852eb22cdfe09))
* **contact:** add backend for new contact settings ([013b248](https://gitlab.mim-libre.fr/alphabet/laboite/commit/013b2486fd5c9a6b5504c5f1da2b0712389b2aaf))
* **contact:** add options to contact settings ([512670c](https://gitlab.mim-libre.fr/alphabet/laboite/commit/512670cd3c2aa5e0d63c67cc1f3aaaa13e5a388f))
* **contact:** manage global admin warning ([1733ee1](https://gitlab.mim-libre.fr/alphabet/laboite/commit/1733ee19b57a165a0d54c8f3d30221ce8f36c31d))
* **contact:** manage send of mail with new contact settings ([8cb0624](https://gitlab.mim-libre.fr/alphabet/laboite/commit/8cb0624d7bde7081609938d49ec13141d95e7b18))
* **feedback:** add a feedback link in dropdown menu ([baccc88](https://gitlab.mim-libre.fr/alphabet/laboite/commit/baccc8890efcb982ce22fad558f05773f883e66f))
* **file-transfer:** add drag and drop on widget to france-transfert ([70d5e66](https://gitlab.mim-libre.fr/alphabet/laboite/commit/70d5e664d70297a724bf680a48ffc95a16c8bf98))
* **form:** add group link for form creation and answers ([464b359](https://gitlab.mim-libre.fr/alphabet/laboite/commit/464b3596f1026618e493e1e835be4e61d98412c7))
* **globalinfo:** change db collection for globalinfos ([334231e](https://gitlab.mim-libre.fr/alphabet/laboite/commit/334231e0ada698221662d67430943110fde35b31))
* **globalInfos:** add methods ([7341d27](https://gitlab.mim-libre.fr/alphabet/laboite/commit/7341d2794ce51eae923c0db01701b03ae0c7ceea))
* **globalinfos:** add unitary test ([d66f33e](https://gitlab.mim-libre.fr/alphabet/laboite/commit/d66f33ea1ca473992ce12ff4b6a47e841d1f23df))
* **globalinfos:** add unitary test for user table ([e4ea782](https://gitlab.mim-libre.fr/alphabet/laboite/commit/e4ea78281a144138d0ee1f4a7c8836939c1eff7a))
* **globalinfos:** change expirationDate from timestamps to date object ([8134ad6](https://gitlab.mim-libre.fr/alphabet/laboite/commit/8134ad65aa8232db9fa1be656a0efdc93468f002))
* **globalinfos:** clean code ([7a2642b](https://gitlab.mim-libre.fr/alphabet/laboite/commit/7a2642b4e0766b483db908a4f55663abb2d7868e))
* **globalinfos:** fix redirect for english user ([dd20914](https://gitlab.mim-libre.fr/alphabet/laboite/commit/dd20914e83ac58c1b9c016f81ac52c17143d39fc))
* **globalinfos:** remove old introductionpageand clean code ([4d98dbf](https://gitlab.mim-libre.fr/alphabet/laboite/commit/4d98dbfc923005d7610775503b840734eb9a6b96))
* **i18n:** add translation in all pages ([37eb729](https://gitlab.mim-libre.fr/alphabet/laboite/commit/37eb7295406193b116bc97fdf84cd0814b861d95))
* **info:** add style in admin page ([9bb175f](https://gitlab.mim-libre.fr/alphabet/laboite/commit/9bb175fa3699180fbea394227895494c168a6cd2))
* **info:** add translations in admin menu ([3bebbc7](https://gitlab.mim-libre.fr/alphabet/laboite/commit/3bebbc70b2027964c14224c845387045be53e759))
* **information:** add super style ([0a4baa7](https://gitlab.mim-libre.fr/alphabet/laboite/commit/0a4baa7edc05f287815140b1fb666ac5024a32e2))
* **log:** add server logs in categories methods ([76db777](https://gitlab.mim-libre.fr/alphabet/laboite/commit/76db777179c6163c6de6d8b214a3c9d17ee3da9b))
* **logs:** add error logs in appsettings methods ([0294b3b](https://gitlab.mim-libre.fr/alphabet/laboite/commit/0294b3b72b056761dbd1da904f64debb0704bbda))
* **logs:** add logs in bookmarks methods ([72d234d](https://gitlab.mim-libre.fr/alphabet/laboite/commit/72d234d0d2608c3efa886ce0efbe717b265f9033))
* **logs:** add logs in helps methods ([12eef9c](https://gitlab.mim-libre.fr/alphabet/laboite/commit/12eef9c5b0a753e35acbf94ed3014c63cc0a9462))
* **logs:** add logs in latest migrations ([c7421b0](https://gitlab.mim-libre.fr/alphabet/laboite/commit/c7421b087b26f32ac8f2441a81d090e1095fd009))
* **logs:** add logs in personalspace methods ([2aa20c9](https://gitlab.mim-libre.fr/alphabet/laboite/commit/2aa20c91ca946e25395af9b3f7e7d0d7341b172f))
* **logs:** add logs in services methods ([dc2a2f8](https://gitlab.mim-libre.fr/alphabet/laboite/commit/dc2a2f858801851f683d399a588e2ca214c215f1))
* **logs:** add logs in structures methods ([7517ecc](https://gitlab.mim-libre.fr/alphabet/laboite/commit/7517ecc2f6a0c7d4181999c92ea70b5dce691a88))
* **logs:** add logs in tags methods ([a9da8cd](https://gitlab.mim-libre.fr/alphabet/laboite/commit/a9da8cd38d296a867f1080d7c67d7bd78bab29d6))
* **logs:** add logs in users methods ([bf09220](https://gitlab.mim-libre.fr/alphabet/laboite/commit/bf092208f4c6ce4a80396097bec1a6ca5c9e9b9d))
* **logs:** add missing server logs ([6d971bf](https://gitlab.mim-libre.fr/alphabet/laboite/commit/6d971bf76a1ee249eff502f54cef0ac4464df17c))
* **logs:** add server error logs in asam methods ([b224c71](https://gitlab.mim-libre.fr/alphabet/laboite/commit/b224c717a461a28c717ab9cad951caf72d57d994))
* **logs:** add server error logs in bookmark methods ([05905bb](https://gitlab.mim-libre.fr/alphabet/laboite/commit/05905bb9bf409a7abb8b0720151549cba4600695))
* **logs:** add server error logs in groups methods ([4731c86](https://gitlab.mim-libre.fr/alphabet/laboite/commit/4731c8635c48335d987f1e8caa5f110faba9f43c))
* **logs:** add server error logs in helps methods ([42a10f7](https://gitlab.mim-libre.fr/alphabet/laboite/commit/42a10f7ebe34ec3fa812dd56558a5e07f24758f5))
* **logs:** add server error logs in tags methods ([1fb112c](https://gitlab.mim-libre.fr/alphabet/laboite/commit/1fb112cc8c3c301439047242af76fd82761ea140))
* **logs:** add server log error in migration methods ([613a888](https://gitlab.mim-libre.fr/alphabet/laboite/commit/613a888e036bcab38a1d174a76e5dd9d9e7adab9))
* **logs:** add server log error in nextcloud methods ([ee0f12a](https://gitlab.mim-libre.fr/alphabet/laboite/commit/ee0f12aa44e606a9bd3d6ec5c47618e0f85caf37))
* **logs:** add server log error in personalspace methods ([3ddecec](https://gitlab.mim-libre.fr/alphabet/laboite/commit/3ddececf568348751498fad954abed76fe014fb2))
* **logs:** add server log error in services methods ([52675b4](https://gitlab.mim-libre.fr/alphabet/laboite/commit/52675b4495375d0d83cdf66f883b315ba872dce9))
* **logs:** add server log error in user methods ([bd32f05](https://gitlab.mim-libre.fr/alphabet/laboite/commit/bd32f05d6fa7057f534147b8a8fcde33cc53eccd))
* **logs:** add server log error in userBookmark methods ([d7d701b](https://gitlab.mim-libre.fr/alphabet/laboite/commit/d7d701ba67b76ecca4c213477e8477a8cf588451))
* **logs:** add server log error in utils methods ([9620794](https://gitlab.mim-libre.fr/alphabet/laboite/commit/9620794a0ba8b88c5a90a13822a26fc9b4addc5c))
* **logs:** add server log errors in smtp methods ([1aed683](https://gitlab.mim-libre.fr/alphabet/laboite/commit/1aed68314f8bf8f25a16d8734ee2e8c16bda2b08))
* **logs:** add server logs error in article methods ([61993ec](https://gitlab.mim-libre.fr/alphabet/laboite/commit/61993ec1eaddb9dbacbc69c7c411f0546e832ba3))
* **logs:** add server logs error in bbbClient file ([1c24dc0](https://gitlab.mim-libre.fr/alphabet/laboite/commit/1c24dc0c674e3cee256aa719725d3102eaa20202))
* **logs:** add server logs error in business methods ([239df0c](https://gitlab.mim-libre.fr/alphabet/laboite/commit/239df0c8dbfe77b178edb808c9ee5912cd54a50b))
* **logs:** add server logs error in defaultspace methods ([dce3869](https://gitlab.mim-libre.fr/alphabet/laboite/commit/dce3869ee70b247e0d9ea749127b2494133c5fcc))
* **logs:** add server logs error in files methods ([e1ab452](https://gitlab.mim-libre.fr/alphabet/laboite/commit/e1ab452f228ed9e3122fdfff589753712d3625b3))
* **logs:** add server logs error in notification methods ([4d4e166](https://gitlab.mim-libre.fr/alphabet/laboite/commit/4d4e1668f8b6aa39be204c4ea7a87e8941c92fba))
* **logs:** add server logs error in structure methods ([8b66418](https://gitlab.mim-libre.fr/alphabet/laboite/commit/8b6641869af23d5e3d3075451ec4426b8836c34e))
* **logs:** add server logs errors in categories methods ([25aa872](https://gitlab.mim-libre.fr/alphabet/laboite/commit/25aa872502ac930669bd90ace249993942afaa74))
* **logs:** add server logs in appsettings folder ([81fc553](https://gitlab.mim-libre.fr/alphabet/laboite/commit/81fc553d4f3a0ec6cefd8eaae4ea1509d52ef930))
* **logs:** add server logs in asam methods ([fc5c33b](https://gitlab.mim-libre.fr/alphabet/laboite/commit/fc5c33bdfe33648c8a6321d8b1245efce6e3d1e7))
* **logs:** add server logs in buisiness methods ([8e42620](https://gitlab.mim-libre.fr/alphabet/laboite/commit/8e426203ccf6fa2095f30438b34e5a63d61ffe19))
* **logs:** add server logs in defaultspace methods ([3a81573](https://gitlab.mim-libre.fr/alphabet/laboite/commit/3a815736d75f17e549663db787d70fa610c6e1b7))
* **logs:** add server logs in nextcloud methods ([a82bcd2](https://gitlab.mim-libre.fr/alphabet/laboite/commit/a82bcd285966ac9be641a7f26710318c90343272))
* **logs:** add server logs on articles methods ([68af1c6](https://gitlab.mim-libre.fr/alphabet/laboite/commit/68af1c625551c72e63ddeb07bdedda654631c6d4))
* **logs:** add server logs on bookmarks methods ([bb52071](https://gitlab.mim-libre.fr/alphabet/laboite/commit/bb52071157d88a8884727312d5dfc6e57555a78e))
* **logs:** disable logs in unit tests ([9f3c610](https://gitlab.mim-libre.fr/alphabet/laboite/commit/9f3c610c9fbbd09f767bfa9652c2988d04ab5bf4))
* **logs:** rework levels error in server logs ([5362ec5](https://gitlab.mim-libre.fr/alphabet/laboite/commit/5362ec5f4d0f12d13686f9261dbb3633c4008299))
* **logs:** rework logs and delete unwanted comments ([97728c5](https://gitlab.mim-libre.fr/alphabet/laboite/commit/97728c5ad149fb19cf6c7b49e29079d95f184359))
* **logs:** setup singleton for logger ([c21bee1](https://gitlab.mim-libre.fr/alphabet/laboite/commit/c21bee1cd3978aaf7397d27364083cbb0972322c))
* **los:** add server logs in notification methods ([6e505c9](https://gitlab.mim-libre.fr/alphabet/laboite/commit/6e505c90275fb5356a35504d118d13f6820a1c47))
* **mainlayout:** redirect user on infopage if new messages has come ([5fe22b3](https://gitlab.mim-libre.fr/alphabet/laboite/commit/5fe22b30de636527b34304843deab204aaabfbfe))
* **menu:** change order and group menu entries in MenuBar ([eee00ea](https://gitlab.mim-libre.fr/alphabet/laboite/commit/eee00ea2dbb6651bc6a660f04ca223a154562c71))
* **meteor:** change meteor base version ([5758130](https://gitlab.mim-libre.fr/alphabet/laboite/commit/5758130f4c13a073a8984fd361738e370a4caa30))
* **nextcloud:** refactor nextcloud plugin using fetch API ([20e2e5b](https://gitlab.mim-libre.fr/alphabet/laboite/commit/20e2e5b4f8c0eb47db958a58ead8f1bb6048ec33))
* **nextcloud:** use a specific user/password for circles and shares ([2fd2a1b](https://gitlab.mim-libre.fr/alphabet/laboite/commit/2fd2a1bf1535a2cdf0ec40fd439db73794fdeadf))
* **onboarding:** add onboarding process ([0dda923](https://gitlab.mim-libre.fr/alphabet/laboite/commit/0dda923ce5ab1bb7b0c01c558e772517caefb6ee))
* **onboarding:** use copyright free image ([de29286](https://gitlab.mim-libre.fr/alphabet/laboite/commit/de292864cc8e025003cb9851dc0057ae6caf70ab))
* **service:** hide blog and mezig on addressbook if disabled ([34d069b](https://gitlab.mim-libre.fr/alphabet/laboite/commit/34d069b3be1c2ca3cca9ee9930811b27a83f98d1))
* **service:** hide service card when url is empty ([14ecbdb](https://gitlab.mim-libre.fr/alphabet/laboite/commit/14ecbdbf0b983f89875d81a82714f91a477053ab))
* **structures:** structure search is accent insensitive ([20f3d61](https://gitlab.mim-libre.fr/alphabet/laboite/commit/20f3d6182da5a38768768619089fef43d870beaf))
* **style:** add style in test page ([d459b53](https://gitlab.mim-libre.fr/alphabet/laboite/commit/d459b5347aefceef1c48446f4d01a2626c03f5c2))
* **tabs:** add style for form test in test page ([6037dd2](https://gitlab.mim-libre.fr/alphabet/laboite/commit/6037dd2c2ba321463f7f2cb8153c2e1549f3582e))
* **theme:** add custom theme ([d8b82ff](https://gitlab.mim-libre.fr/alphabet/laboite/commit/d8b82ffbe6d216c1ca7b32a6cf8c96db43ff38fd))
* **users:** display nextcloud id in button tooltip ([87e9bd7](https://gitlab.mim-libre.fr/alphabet/laboite/commit/87e9bd7c78184ef8b822ec2f780afdefe7fb457d))
* **widget:** improve widget script ([99c34cf](https://gitlab.mim-libre.fr/alphabet/laboite/commit/99c34cf2e01bbdad9c61216451796868680f2c72))


### Styles

* **service-help-message:** delete space between placeholders ([1b33079](https://gitlab.mim-libre.fr/alphabet/laboite/commit/1b33079c083c2f64beb16da08645f728775a7081))

# [5.4.0](https://gitlab.mim-libre.fr/alphabet/laboite/compare/release/5.3.0...release/5.4.0) (2023-04-28)


### Bug Fixes

* **createuser:** logserver syntax, error if email already exists ([cca3858](https://gitlab.mim-libre.fr/alphabet/laboite/commit/cca3858a59c085a6a9195d2ca34c4f8c40387331))
* **user creation api:** add missing async declaration ([fedceb6](https://gitlab.mim-libre.fr/alphabet/laboite/commit/fedceb66d96ed7d26ee7e06db4c995cd6853f522))
* **user creation api:** fix route in doc, add settings sample ([13f235b](https://gitlab.mim-libre.fr/alphabet/laboite/commit/13f235b4c1691768018dc8a571df6174d777c9e6))


### Features

* **api:** add endpoint for user creation through API ([640fd40](https://gitlab.mim-libre.fr/alphabet/laboite/commit/640fd4097c6e27894d7f8353325278caaf2a5fc8))

# [5.3.0](https://gitlab.mim-libre.fr/alphabet/laboite/compare/release/5.2.2...release/5.3.0) (2023-04-17)


### Bug Fixes

* **400:** modification after review ([cab9db7](https://gitlab.mim-libre.fr/alphabet/laboite/commit/cab9db759bd05984210a86e814ea13a3f526d885))
* **adminUsers:** change text for removing user from structure ([6d43ea8](https://gitlab.mim-libre.fr/alphabet/laboite/commit/6d43ea8d3e29204a975f92e294630e1fb60e89ef))
* **article:** escape space on image url when insert in markdown article ([692205f](https://gitlab.mim-libre.fr/alphabet/laboite/commit/692205f6bc4bf3b4b04a2c35fad343c8cbf23c94))
* **asam:** delete unwanted caracter in modal title ([32b547e](https://gitlab.mim-libre.fr/alphabet/laboite/commit/32b547ea714bccdd5b8592ba1960b878700a0482))
* **auth:** remove irrelevant code now that keycloak is the only option ([7866f82](https://gitlab.mim-libre.fr/alphabet/laboite/commit/7866f822a402fab479d3c4a9f0fe3e4ea67747c0))
* **auth:** remove local authentification code ([3a388c8](https://gitlab.mim-libre.fr/alphabet/laboite/commit/3a388c8df12f28e122d23b068081b229a474bb40))
* **auth:** signin render ([1d88259](https://gitlab.mim-libre.fr/alphabet/laboite/commit/1d88259e658fae4877f8bc4510bee8547952fe84))
* **bookmarks:** update validation regexes in updateBookmark method ([cd9cb1e](https://gitlab.mim-libre.fr/alphabet/laboite/commit/cd9cb1eb3fae5eb40ceb372feb8770881614928d))
* **config:** move blog url from public to public.services ([b38a2f8](https://gitlab.mim-libre.fr/alphabet/laboite/commit/b38a2f8f89dd71348335bd2696ecbf703a8d4f01))
* **csp headers:** temporarily allow '*' for CSP default-src ([3c1cbe8](https://gitlab.mim-libre.fr/alphabet/laboite/commit/3c1cbe83b20525d4b8452fa76bdf32e79291d0ad))
* **file upload:** allow file paths with more than one subfolder ([ceecb74](https://gitlab.mim-libre.fr/alphabet/laboite/commit/ceecb7454d694251f5e82d64b180529a3be498dc))
* **file uploader:** additional forbidden characters in filename ([244648b](https://gitlab.mim-libre.fr/alphabet/laboite/commit/244648bd649f9566525516a1480ff8f1f33a036f))
* **file uploader:** check paths and filenames ([d302cce](https://gitlab.mim-libre.fr/alphabet/laboite/commit/d302ccee410c4385166a00b1dde1f4912485ff9a))
* **file uploader:** optimize function _validateName ([8ae4596](https://gitlab.mim-libre.fr/alphabet/laboite/commit/8ae4596d30df38333e76a98c327db2b6b90e6fc1))
* **footer:** fix personal space intro display as text ([e8be4d6](https://gitlab.mim-libre.fr/alphabet/laboite/commit/e8be4d68a40980e1e6177d96f98c900db474db04))
* **group:** link from settings for blog ([4440571](https://gitlab.mim-libre.fr/alphabet/laboite/commit/4440571d178a16023b0eee80c12b87ca489476e4))
* **group:** rebase on dev ([ec07255](https://gitlab.mim-libre.fr/alphabet/laboite/commit/ec07255cc1309f22e7aed2e598af06f94bface76))
* **groups:** change value in material table in struc groups ([e416b06](https://gitlab.mim-libre.fr/alphabet/laboite/commit/e416b064e381331acb93630721568cf284bddcda))
* **groups:** delete struc prefix and add logo in struc page ([fb23ec6](https://gitlab.mim-libre.fr/alphabet/laboite/commit/fb23ec6d72af6e809f0523436e3f64c2ba839650))
* **header:** fix icon size in topbar ([c6ace81](https://gitlab.mim-libre.fr/alphabet/laboite/commit/c6ace818c1c2e6c22f1471b780fcd740f0fc9ef1))
* **headers:** test header https ([2ee379a](https://gitlab.mim-libre.fr/alphabet/laboite/commit/2ee379a7f7c5f659ca3a2b451ee1a9da4a8c980a))
* **help:** check title already use on update method ([6808d2f](https://gitlab.mim-libre.fr/alphabet/laboite/commit/6808d2f77b35174a6021386261eabcaab032a466))
* **help:** error message for already created help ([1e80d9d](https://gitlab.mim-libre.fr/alphabet/laboite/commit/1e80d9d914be2df2af191b19ee4d7e23d97b6a5a))
* **help:** remove console log on data ([9f60a82](https://gitlab.mim-libre.fr/alphabet/laboite/commit/9f60a821e130a00b5a9b103ee6c62046f23d3414))
* **help:** update method and call ([0d0e40a](https://gitlab.mim-libre.fr/alphabet/laboite/commit/0d0e40ad25343f4e67301ef25ad22151bbfb113a))
* **libraries:** fix npm dependencies and remove unwanted import ([ad2248a](https://gitlab.mim-libre.fr/alphabet/laboite/commit/ad2248a928c727bc5099b7cdb363f4714eff966d))
* **library:** compatibility with react-meteor-data > 2.4.0 ([5feca9a](https://gitlab.mim-libre.fr/alphabet/laboite/commit/5feca9a40b7ae28812270d20fe6f713516c59e6e))
* **library:** hook should not be called in withTracker HOC ([dd10fde](https://gitlab.mim-libre.fr/alphabet/laboite/commit/dd10fde58ac42bf722b73910b91a61f5bb0c23f4))
* **libs:** downgrade meteor-react-data to 2.4.0 ([e7438b9](https://gitlab.mim-libre.fr/alphabet/laboite/commit/e7438b9716c61721fdc3233c48b1a2075634e329))
* **link:** add noopener,noreferrer options to window.open with _blank ([9f5b26d](https://gitlab.mim-libre.fr/alphabet/laboite/commit/9f5b26dbe935622b98731bf5ad0d4e7a94a761ba))
* **link:** add rel attribute on a html tags ([cd94842](https://gitlab.mim-libre.fr/alphabet/laboite/commit/cd948420dde7e0f46a8127844f1d2a20a5bd715b))
* **links:** add missing target and rel on links ([6014bcb](https://gitlab.mim-libre.fr/alphabet/laboite/commit/6014bcb57005d897b5374b8e945fff4e242be2df))
* **minio:** delete minio SSL option ([4cf8a89](https://gitlab.mim-libre.fr/alphabet/laboite/commit/4cf8a89aa1d27d949628f94007781e98b481c636))
* **nextcloud token:** don't store nctoken after retrieval ([8d7c6f0](https://gitlab.mim-libre.fr/alphabet/laboite/commit/8d7c6f0c39af1ffb1f559cffb14f909796cd93b4))
* **package:** fix package lock version to v2 ([0628665](https://gitlab.mim-libre.fr/alphabet/laboite/commit/0628665592344c2f142a676863e4dd7552f458d3))
* **package:** update material-table/core lib to 6.1.13 ([8c327b3](https://gitlab.mim-libre.fr/alphabet/laboite/commit/8c327b3f715a25099692f1e5110608f52ec84193))
* **profile:** validation-error appears when changing structure ([371ecb7](https://gitlab.mim-libre.fr/alphabet/laboite/commit/371ecb70daab7df66acd14388a8612857c1d884e))
* **sample:** delete unwanted settings ([d4a13a9](https://gitlab.mim-libre.fr/alphabet/laboite/commit/d4a13a96e1b6059926177147f9876339e1559a45))
* **settings:** add missing translate in struc opt ([11bbd23](https://gitlab.mim-libre.fr/alphabet/laboite/commit/11bbd23ab582e3dde09d89efdad3b1f524d92c1a))
* **settings:** reduce time of meteor session ([6917e7a](https://gitlab.mim-libre.fr/alphabet/laboite/commit/6917e7a26c5b69e312ef727a983d66f7134690a7))
* **startup:** add http headers with helmet lib ([7a2366b](https://gitlab.mim-libre.fr/alphabet/laboite/commit/7a2366bca138729f17fdd4752d5dca227d5d7337))
* **startup:** configure helmet http headers ([b3cef0f](https://gitlab.mim-libre.fr/alphabet/laboite/commit/b3cef0fce5fca09aef3fe4cd0827ec09be1ce52d))
* **structure:** admin removal of a user from the structure ([639e9e4](https://gitlab.mim-libre.fr/alphabet/laboite/commit/639e9e4e8f6caabd90d2b77b1f030658561854d7))
* **structure:** reduce loading on validating page ([00d0dce](https://gitlab.mim-libre.fr/alphabet/laboite/commit/00d0dcedfbcf9c4bc3eec4c07d7fcfab499205a5))
* **structure:** roles removal after leaving structure ([57131f0](https://gitlab.mim-libre.fr/alphabet/laboite/commit/57131f04eb72035bbf12cca55ca9b5207ed16993))
* **structures:** add missing parameters validation on two methods ([946fe25](https://gitlab.mim-libre.fr/alphabet/laboite/commit/946fe252dc70262e3872b0d8deada7721f2973d3))
* **structures:** apply code review recommendations ([e552a03](https://gitlab.mim-libre.fr/alphabet/laboite/commit/e552a03d1492f9c693e189f3c9d9ff8bdbf5c15a))
* **upload notifier:** check that file extension is allowed ([28d3421](https://gitlab.mim-libre.fr/alphabet/laboite/commit/28d3421385e21f1ee2a581d136ef93dd06e21091))


### Build System

* **meteor:** update meteor 2.9.1 ([7bfa6e1](https://gitlab.mim-libre.fr/alphabet/laboite/commit/7bfa6e1cdf58efabeec14d69cb0c9d4d03dd2a3b))


### Code Refactoring

* **logs:** use logging enum in place of notifications enum ([404d48d](https://gitlab.mim-libre.fr/alphabet/laboite/commit/404d48dbddff8128afa36185b87f95fe21c63883))


### Features

* **headers:** csp frame-ancestors can be overriden in settings ([f777d4f](https://gitlab.mim-libre.fr/alphabet/laboite/commit/f777d4fa2ac25244a771007d48fb22af628504c3))
* **help:** add an anchor to each help category zone ([7b94062](https://gitlab.mim-libre.fr/alphabet/laboite/commit/7b94062db4eab6b14b82b8bc320d17fed26c9e1b))
* **input validation:** add a maximum length for string user inputs ([fa62a2f](https://gitlab.mim-libre.fr/alphabet/laboite/commit/fa62a2fa64c07060e7163d144702b506ac8ddb9d))
* **input validation:** add string inputs validation in all methods ([b036093](https://gitlab.mim-libre.fr/alphabet/laboite/commit/b0360936c2449f14324ae4d9aa182301e87c5606))
* **input validation:** sanitize html user input with sanitize-html ([87e305f](https://gitlab.mim-libre.fr/alphabet/laboite/commit/87e305f76a9451c5439c02fab98d483547ac2f70))
* **input validation:** start adding input validation ([6beb16d](https://gitlab.mim-libre.fr/alphabet/laboite/commit/6beb16d5c7d70c1cf35b09a1f57087c6aca460b4))
* **log:** add log for group methods ([d621035](https://gitlab.mim-libre.fr/alphabet/laboite/commit/d62103569f5935a4f4637d171694a28e05b2fdc2))
* **Signin:** add doc and fix settings name in sample file ([fe39a42](https://gitlab.mim-libre.fr/alphabet/laboite/commit/fe39a426c961fa0a4be6e76f8c49e5213fc4d7e2))
* **SignIn:** add popup possibility ([082239c](https://gitlab.mim-libre.fr/alphabet/laboite/commit/082239cbf9ca45573797befa956f9612ffd63c12))


### Performance Improvements

* **roles:** optimize roles removal method ([3cf8b01](https://gitlab.mim-libre.fr/alphabet/laboite/commit/3cf8b011ecfa6c0fe6240e3c7186167b9764ba52))

## [5.2.2](https://gitlab.mim-libre.fr/alphabet/laboite/compare/release/5.2.1...release/5.2.2) (2023-03-06)


### Bug Fixes

* **mongo:** add index on notification collection ([c6128b3](https://gitlab.mim-libre.fr/alphabet/laboite/commit/c6128b3b36ff83b7db058fa8e12ad64b62a4287e))

## [5.2.1](https://gitlab.mim-libre.fr/alphabet/laboite/compare/release/5.2.0...release/5.2.1) (2023-03-06)


### Performance Improvements

* **structure:** replace subscribe by method in main layout ([cdbc469](https://gitlab.mim-libre.fr/alphabet/laboite/commit/cdbc469d75c8173e3a73eed1a0b103ed8b037d12))

# [5.2.0](https://gitlab.mim-libre.fr/alphabet/laboite/compare/release/5.1.5...release/5.2.0) (2023-01-30)


### Bug Fixes

* **263-busines-regrouping:** check admin structure on crud actions ([65d8ab5](https://gitlab.mim-libre.fr/alphabet/laboite/commit/65d8ab53b71cef9f8811f9fab64d81ed83ba8ae2))
* **263-busines-regrouping:** fix feature access for admin structure ([ae81f80](https://gitlab.mim-libre.fr/alphabet/laboite/commit/ae81f80ac503a4ca4a819107e8ae3ead7f88acb3))
* **263-busines-regrouping:** update busines regrouping unit test ([394800c](https://gitlab.mim-libre.fr/alphabet/laboite/commit/394800ca85c95733b89873e5d1f6d70d1a30ae08))
* **269-cover-image:** cover image height divided by 2 ([1c2a1a5](https://gitlab.mim-libre.fr/alphabet/laboite/commit/1c2a1a54d86b0a8dac881a98c68bce773c8eef4f))
* **269-cover-image:** fix information path while clik on i button ([413096b](https://gitlab.mim-libre.fr/alphabet/laboite/commit/413096b62cd1e684e677263a8dc8179cd47a0f51))
* **269-cover-image:** fix left icon without dynamic calculation ([03e2c39](https://gitlab.mim-libre.fr/alphabet/laboite/commit/03e2c39cbb0aa7e03a86a67907f1e33ba57e0304))
* **269-cover-image:** handle left icon img change on window resize ([4cb2cb6](https://gitlab.mim-libre.fr/alphabet/laboite/commit/4cb2cb6583cf4af21bb3aacc5e560cbe7439e56a))
* **269-cover-image:** handle left icon img on page refresh ([296ff53](https://gitlab.mim-libre.fr/alphabet/laboite/commit/296ff5371c685c93b01e169a214074b493f1d016))
* **269-cover-image:** rebase 5.1.0 and import infoedition component ([b6da573](https://gitlab.mim-libre.fr/alphabet/laboite/commit/b6da573abe8a45090d96e04b6b5dcbd9dd207ba8))
* **269-cover-image:** space on top and bottom of title after top bar ([b0d5d2e](https://gitlab.mim-libre.fr/alphabet/laboite/commit/b0d5d2e0811608d69e43c2514e5d48ec7594378c))
* **269:** add padding and align upload and delete buttons ([6949948](https://gitlab.mim-libre.fr/alphabet/laboite/commit/69499482242682b81b75f1269524b8795544abcf))
* **269:** display icon and cover image only if those img were settled ([1c17524](https://gitlab.mim-libre.fr/alphabet/laboite/commit/1c17524dcb95c42b0a2371b877c62ecdc5b71e01))
* **269:** fix bug regarding horizontal scroll bar ([b4db12a](https://gitlab.mim-libre.fr/alphabet/laboite/commit/b4db12a3d6a7251c4bb9e9ad88649bcd4ba119a5))
* **269:** fix icon and cover image display when setting those images ([d4ba87a](https://gitlab.mim-libre.fr/alphabet/laboite/commit/d4ba87ac7327dcd7d4d671328434e00d9b585591))
* **295-user-book-marks:** 10 as default rows per page ([8b3f824](https://gitlab.mim-libre.fr/alphabet/laboite/commit/8b3f8241e7934009fc7572c3ca15901ed8b6609e))
* **309:** remember the last settled mode for services list display ([0f2327d](https://gitlab.mim-libre.fr/alphabet/laboite/commit/0f2327d3623b1159fe6af4db6b12d9f3e4b70a27))
* **324:** hidden service from default space is not visible on ps page ([35a2198](https://gitlab.mim-libre.fr/alphabet/laboite/commit/35a21986732968e611957bdc6787fbed8b0e9751))
* **326:** fix eslint error ([b506e48](https://gitlab.mim-libre.fr/alphabet/laboite/commit/b506e48ef417d46b66a1ca0cbf731317999a43d3))
* **334:** icon and cover img are displayed in minimized widget iframe ([a800744](https://gitlab.mim-libre.fr/alphabet/laboite/commit/a800744ef95816a269810c4f96610e088c0097cd))
* **52-mail-extension:** fix corresponding unit tests ([244ce1e](https://gitlab.mim-libre.fr/alphabet/laboite/commit/244ce1ef5cabd2879e80af407f7ca80c48789b1b))
* **52-mail-extension:** fix structue changed validation rules ([8c71191](https://gitlab.mim-libre.fr/alphabet/laboite/commit/8c71191e90b69601334246b69367fb9ac6e3d8e9))
* **52-mail-extension:** fix structue changed validation rules V2 ([154fc73](https://gitlab.mim-libre.fr/alphabet/laboite/commit/154fc733ab8a362c1df1c61d900474b259e87a96))
* **52-mail-extension:** fix unit tests ([e75aacd](https://gitlab.mim-libre.fr/alphabet/laboite/commit/e75aacd72c60d359f6bb0d3c8b73fe0af48f63ac))
* **52-mail-extension:** valid if domain different to structure domain ([1560df7](https://gitlab.mim-libre.fr/alphabet/laboite/commit/1560df770f2b711b79dce3f4d187d30ab5fd9e6c))
* **52:** app admin can change structure without validation mandatory ([b9aff5f](https://gitlab.mim-libre.fr/alphabet/laboite/commit/b9aff5f8b867ff35f4f15c24dcf435214122a34d))
* **52:** make user structure validation mandatory field optional ([42e4528](https://gitlab.mim-libre.fr/alphabet/laboite/commit/42e452871be6fb26e87434debe34a81b020e07ab))
* **52:** struct change validation is no more based on mail extension ([2677199](https://gitlab.mim-libre.fr/alphabet/laboite/commit/2677199030c3fba063f354a7c3d613f60c5d1bcb))
* **52:** using setmemberof method instead of using meteor call ([f5bc991](https://gitlab.mim-libre.fr/alphabet/laboite/commit/f5bc9917382c9cd6c701805ff90f429b63685a4a))
* **admin settings:** diplay modified content ([d7cda2c](https://gitlab.mim-libre.fr/alphabet/laboite/commit/d7cda2cdbe86247b499e853ace6e4adc60e2ee81))
* **admin:** count business regroupment by structure ([b783fac](https://gitlab.mim-libre.fr/alphabet/laboite/commit/b783fac8047364501bf8ead0fd9438eb46dac147))
* **admin:** fix some ui stuffs ([cd815c5](https://gitlab.mim-libre.fr/alphabet/laboite/commit/cd815c5a79f2b6e204cccdcc297152ec560d5fc7))
* **adminlayout paddingtop:** take in account admin layout paddingtop ([ec06516](https://gitlab.mim-libre.fr/alphabet/laboite/commit/ec06516aeeb88bc84abc5e82c2527b2afba0e264))
* **adminService:** fixed material table layout and fix overflow ([0564a56](https://gitlab.mim-libre.fr/alphabet/laboite/commit/0564a56d7170fae51a194cb0cc09d5a769b25bea))
* **adminStructure:** fix target user for group admin ([db0d3ba](https://gitlab.mim-libre.fr/alphabet/laboite/commit/db0d3baacfd527a4e100c75ff9d4150fb37f8a45))
* **adminuserpage:** hide cloud button when click on delete user ([5ac5901](https://gitlab.mim-libre.fr/alphabet/laboite/commit/5ac590158766a42b03cf98ce12f16fa988e06b3a))
* **app-settings:** fix video optim & inf loop ([1c08ccf](https://gitlab.mim-libre.fr/alphabet/laboite/commit/1c08ccff909e92b18c8da0eb6b7cb1b81b9f7481))
* **appSettings:** add default value for appsettings.personalSpace ([7af567f](https://gitlab.mim-libre.fr/alphabet/laboite/commit/7af567f82229de8fb0714d6ec976e94618a2eef0))
* **articles:** articles can not be edited if group type is not stored ([5e1b375](https://gitlab.mim-libre.fr/alphabet/laboite/commit/5e1b375874386e430ed0f136f5097907fcc66033))
* **audit:** update vulnerable libraries ([6e2a807](https://gitlab.mim-libre.fr/alphabet/laboite/commit/6e2a8070910a50048b6bb1e32f4d04cc20688b38))
* **business regroup by structure:** don't display chlidren regrouping ([b36f670](https://gitlab.mim-libre.fr/alphabet/laboite/commit/b36f670d323452bf34aab4c16aa8754d49f59f2e))
* **business regrouping:** creating busines regroup with same name ([0941d50](https://gitlab.mim-libre.fr/alphabet/laboite/commit/0941d502c72a8bad9377fa4bc102e333943f4a80))
* **business regrouping:** display busines regrouping from ancestors ([bd1f074](https://gitlab.mim-libre.fr/alphabet/laboite/commit/bd1f074f4b72889da63a3dda891a5b4ce0a38969))
* **business regrouping:** fix reading acestorsids of undefined ([d6e38a7](https://gitlab.mim-libre.fr/alphabet/laboite/commit/d6e38a76241c09b832e2c7d0ec14138c51b74807))
* **business regrouping:** fix service.businessReGrouping is undefined ([811cd3a](https://gitlab.mim-libre.fr/alphabet/laboite/commit/811cd3a528891c6a72d6fcf5e2400a53be07b80a))
* **business regrouping:** take in account old structure service ([b8f324b](https://gitlab.mim-libre.fr/alphabet/laboite/commit/b8f324b2f24a8eecdf95ecdac301d4981d6dcf71))
* **business regroup:** possibility of hidding businessregrouping menu ([bd9f3cd](https://gitlab.mim-libre.fr/alphabet/laboite/commit/bd9f3cdf8ae4656e55b64a2d34f7e66860da764e))
* **contact:** block sending if msg contains only spaces ([b251e78](https://gitlab.mim-libre.fr/alphabet/laboite/commit/b251e78ccb56a3c6c5a893d5213a0254e821c8d3))
* **cover image:** prevent image cropping ([8ded69f](https://gitlab.mim-libre.fr/alphabet/laboite/commit/8ded69f37b2eab9e3c584083d452e70de4e88a75))
* **defaultpersonalspace:** hide this functionnality which dosent work ([f37feb1](https://gitlab.mim-libre.fr/alphabet/laboite/commit/f37feb1db58c1fa58e6c0fdc10bd4fbea75e7368))
* **footer:** add missing trad for personal space link ([dbe6b12](https://gitlab.mim-libre.fr/alphabet/laboite/commit/dbe6b12f927a6f437914d793617b17ae01286ee7))
* **global:** rebase dev ([843ebf5](https://gitlab.mim-libre.fr/alphabet/laboite/commit/843ebf5068b03a959668be478e8bc292d5cdfd31))
* **group:** adminStructure is not admin of parent structure group ([a4fd8c7](https://gitlab.mim-libre.fr/alphabet/laboite/commit/a4fd8c72c44ed2d8b091f3ea79b285f357a8b6e1))
* **groupe:** add default description ([21f2816](https://gitlab.mim-libre.fr/alphabet/laboite/commit/21f2816e3c8309f3d66fc2dda18a4855ae0e9552))
* **group:** fix admin group role removal ([33cbd28](https://gitlab.mim-libre.fr/alphabet/laboite/commit/33cbd284501a8508a90c3c95c619ec54aae3cdd4))
* **group:** fix admin role removal ([91523dc](https://gitlab.mim-libre.fr/alphabet/laboite/commit/91523dcce6770b22ee7d2010ae989a7888c2ae09))
* **group:** fix condition to update ([f0c9b80](https://gitlab.mim-libre.fr/alphabet/laboite/commit/f0c9b803eb6d436472484c0f040f37b79b44d881))
* **group:** fix group name display ([3d41fe2](https://gitlab.mim-libre.fr/alphabet/laboite/commit/3d41fe2fef9e910b9f0d1ebe1b0f3fc25641b166))
* **group:** fix label ([a0249fa](https://gitlab.mim-libre.fr/alphabet/laboite/commit/a0249faeda73adde80bb302d1a3f25f1d0ce638f))
* **group:** fix schema ([71104e3](https://gitlab.mim-libre.fr/alphabet/laboite/commit/71104e3b43dc79ace4307b0ecd7f319985afdcb1))
* **group:** fix tests ([ce98939](https://gitlab.mim-libre.fr/alphabet/laboite/commit/ce98939875118560d2a695a8bb8697b00cfff4cd))
* **group:** fix update of automatic group ([ac0233e](https://gitlab.mim-libre.fr/alphabet/laboite/commit/ac0233eb7343b78b0cc20d3970318f4e80d6970d))
* **group:** really fix admin group removal ([328d476](https://gitlab.mim-libre.fr/alphabet/laboite/commit/328d476255000d334dde8a21430d787da64d9c2f))
* **group:** refactor and improve update conditions ([94769c4](https://gitlab.mim-libre.fr/alphabet/laboite/commit/94769c4436a5078253402792a94ffd12bef0d549))
* **groups:** don't propose automatic type at group creation ([324ad28](https://gitlab.mim-libre.fr/alphabet/laboite/commit/324ad28b7aaeacdf8dba35f86de633381cbebf1f))
* **groups:** fix address book if structure is undefined ([62ffcd8](https://gitlab.mim-libre.fr/alphabet/laboite/commit/62ffcd894a1c63076a13ce33c822945c0acf3351))
* **groups:** fix structure group display in article edition ([8242bc7](https://gitlab.mim-libre.fr/alphabet/laboite/commit/8242bc7d0e5491f2dc24351cca6015660f6c9f60))
* **groups:** remove user from old structure group on structure change ([8249238](https://gitlab.mim-libre.fr/alphabet/laboite/commit/824923845685d38604bd4faa6a230819e8def836))
* **groups:** store group type in article.groups ([cff773e](https://gitlab.mim-libre.fr/alphabet/laboite/commit/cff773ee3a811b82b86f39564abee3d811f8cdab))
* **groups:** warn admin about unsubscribing members at group deletion ([c0bef3f](https://gitlab.mim-libre.fr/alphabet/laboite/commit/c0bef3f7e0abc1f95d86c2fe9be79ace22707e68))
* **icon and cover images:** allow to display one without an other ([fab7d1c](https://gitlab.mim-libre.fr/alphabet/laboite/commit/fab7d1cad11c7085d00a19e12e2a3e2060c6e818))
* **icon:** add container to icon ([0d93374](https://gitlab.mim-libre.fr/alphabet/laboite/commit/0d933747cd8a37a639db2856db55fa33ef6235f4))
* **layout:** fix css ([31fd6a3](https://gitlab.mim-libre.fr/alphabet/laboite/commit/31fd6a323bbb72ec3459980b0db34440c55ad41c))
* **lint:** fix lint errors ([98f5cb9](https://gitlab.mim-libre.fr/alphabet/laboite/commit/98f5cb928c65ab3154e429185397690e20a08f18))
* **migration:** allow migration 29 to be run several times ([f38cb86](https://gitlab.mim-libre.fr/alphabet/laboite/commit/f38cb863ddde186c335ca075978ac8ffb8a34ccd))
* **migration:** fix migration ([c43fa0c](https://gitlab.mim-libre.fr/alphabet/laboite/commit/c43fa0c08e6440199a90f5aaf552b9df68e01fa7))
* **migration:** fix migration ([ccef521](https://gitlab.mim-libre.fr/alphabet/laboite/commit/ccef521244b330f71c373492e5992cc16d1b189d))
* **migration:** push user in group admins when necessary ([d7eb69a](https://gitlab.mim-libre.fr/alphabet/laboite/commit/d7eb69a5215aab0041f8f7003f36c8cd8f1f3b76))
* **migration:** use correct import path after mui migration ([aab5c03](https://gitlab.mim-libre.fr/alphabet/laboite/commit/aab5c03f621bba5097ae1f238950b2e3121338e1))
* **minimized widget:** servic simple mode displayed in businesregroup ([ef2fd95](https://gitlab.mim-libre.fr/alphabet/laboite/commit/ef2fd951ba7af2c925e72f5558d07b16445e59a5))
* **nclocator:** click on copynclocator return federation Id ([bc8911c](https://gitlab.mim-libre.fr/alphabet/laboite/commit/bc8911cc46eb30eff2adf551fe31cb3b2fe9d729))
* **nextloud:** normalize nextcloud settings URL ([9ac2fda](https://gitlab.mim-libre.fr/alphabet/laboite/commit/9ac2fdacd6ef331c573e10fe0d964161e3eb5d7a))
* **notifications:** fix iframe notif update ([3533af6](https://gitlab.mim-libre.fr/alphabet/laboite/commit/3533af6e2b3a9b9c4aeee6a74d6af0409180e150))
* **packages:** downgrade version of react meteor data ([0932289](https://gitlab.mim-libre.fr/alphabet/laboite/commit/0932289a8143b4bac3b659f4b3a4f3ec6bb28c9c))
* **packages:** update package-lock.json to v2 ([f418933](https://gitlab.mim-libre.fr/alphabet/laboite/commit/f41893367049ffad861eb026e8b6a4b9042c3164))
* **personal space:** add padding top ([c92d900](https://gitlab.mim-libre.fr/alphabet/laboite/commit/c92d9005ddfdd592ca2f32a3f11fbc09be6ef59e))
* **personal space:** do not apply default zones on user struct change ([6cfcdc8](https://gitlab.mim-libre.fr/alphabet/laboite/commit/6cfcdc8e49c65f486b6fbd603e222e66d9df69a2))
* **personal space:** possibility of drag and drop bookmark to a zone ([937a52f](https://gitlab.mim-libre.fr/alphabet/laboite/commit/937a52fd58a3a4d497e049d77983920937c5dcfc))
* **personalspace:** disable regen personal space ([ceffefb](https://gitlab.mim-libre.fr/alphabet/laboite/commit/ceffefbfb396940f69a5f5593ce4cce9f01403d5))
* **personalspace:** disable regen personal space ([1089194](https://gitlab.mim-libre.fr/alphabet/laboite/commit/108919457c6eb1775b441beb288050a6a2587a51))
* **ps:** automatic group not displayed if group feat is disabled ([6efc77c](https://gitlab.mim-libre.fr/alphabet/laboite/commit/6efc77c0aea81c332df482c4cbd8deac2df98a2f))
* **ps:** on struct change event defaultspace not applied in all cases ([4841bc5](https://gitlab.mim-libre.fr/alphabet/laboite/commit/4841bc5314cb804518d338c611cc6e7ab73a0966))
* **service:** focus on button only ([c9a58bf](https://gitlab.mim-libre.fr/alphabet/laboite/commit/c9a58bf9cf4239816a228f965b632c86bd05b928))
* **service:** focus on screenshot add button ([9d42d25](https://gitlab.mim-libre.fr/alphabet/laboite/commit/9d42d25757530d58db5179dd5135abc418423785))
* **service:** simplify focus fix ([10b4825](https://gitlab.mim-libre.fr/alphabet/laboite/commit/10b48251c58800ddc14b38597970ba696e77bb78))
* **settings:** display data on admin settings menu ([ade4e8d](https://gitlab.mim-libre.fr/alphabet/laboite/commit/ade4e8dd1f0f9638bba8718e3ca62eeaf74ad0ce))
* **singleGroup:** dont show page of group deleted ([cb3415e](https://gitlab.mim-libre.fr/alphabet/laboite/commit/cb3415e8ce42b244c8fc7c3b73b0a0d57c0e61fe))
* **structure change:** check if a user exists in old structure groups ([2beca13](https://gitlab.mim-libre.fr/alphabet/laboite/commit/2beca13349dc7141b3bf6c908f2095e1ee2389bf))
* **structure setup:** update the way admin structure role is checked ([57ad2dc](https://gitlab.mim-libre.fr/alphabet/laboite/commit/57ad2dc520d8f1237ad5cd0fd28dafc461fd328c))
* **structure:** fix group remove when structure is deleted ([23bfbe3](https://gitlab.mim-libre.fr/alphabet/laboite/commit/23bfbe35110be2758a4e0ecf0239a53012358d63))
* **structure:** fix methods and add tests ([b449066](https://gitlab.mim-libre.fr/alphabet/laboite/commit/b449066bf708984c6b3bc785a61a0a9ab64e33f8))
* **structure:** fix migrations and frontend ([8d0ef7d](https://gitlab.mim-libre.fr/alphabet/laboite/commit/8d0ef7d769b0d633ab738dc2d673d5e3837642ac))
* **structures:** adminStructure user can not accept awaiting users ([8d4f340](https://gitlab.mim-libre.fr/alphabet/laboite/commit/8d4f340c503610b4baea419bb54c27d70e2b6018))
* **tests:** fix tests ([059d11c](https://gitlab.mim-libre.fr/alphabet/laboite/commit/059d11c8ae02175bd17308898d76e6932335d5a6))
* **typo:** remove user in "l'utilisateur user" ([65003d1](https://gitlab.mim-libre.fr/alphabet/laboite/commit/65003d19501cd28947f848a937e52b21f4673bf3))
* **url:** fix one more meteor settings url ([2599e50](https://gitlab.mim-libre.fr/alphabet/laboite/commit/2599e5058689096e1239c9de6cb966922943777a))
* **yaml:** correct lint syntax ([2fe33a9](https://gitlab.mim-libre.fr/alphabet/laboite/commit/2fe33a96d530b5fca8ba6e7503b7457d175bf8f2))


### Code Refactoring

* **269-cover-image:** fr language file ([89d2ee9](https://gitlab.mim-libre.fr/alphabet/laboite/commit/89d2ee9445dd55b403ef75497b060ecf37a596e3))
* **303-busines-regrouping:** fr language file ([2892543](https://gitlab.mim-libre.fr/alphabet/laboite/commit/28925438f30a256769913e1ca9d1a2b3635ee442))
* **338:** add mediastorage menu field in disabledfeatures ([eb183a4](https://gitlab.mim-libre.fr/alphabet/laboite/commit/eb183a484121404a27946238cbd7e2783c5af047))
* **52:** display different text labels if admin structure level ([3c6d30e](https://gitlab.mim-libre.fr/alphabet/laboite/commit/3c6d30e75909c3fcdb56ef74f48b6c68bb9687a4))
* **52:** meteor call ([3e277fc](https://gitlab.mim-libre.fr/alphabet/laboite/commit/3e277fc3e89c0fa5bc416af80393b8d6141bf18a))
* **52:** using setmemberof method in new file ([e5b6a50](https://gitlab.mim-libre.fr/alphabet/laboite/commit/e5b6a506f6acaffe38aeefdecd7168a2fb8fa432))
* **busines regrouping:** sort by name instead of id ([02bbcb4](https://gitlab.mim-libre.fr/alphabet/laboite/commit/02bbcb4c1723019d03fc892b914744bb744a7c4c))
* **business regrouping:** create busines regroup with same name ([ae3617e](https://gitlab.mim-libre.fr/alphabet/laboite/commit/ae3617ea95870cd804d6d6e2f9ea5d2d89591523))
* **icon and cover image:** event listener cleanup and usemethod ([08319c6](https://gitlab.mim-libre.fr/alphabet/laboite/commit/08319c6600964536ac41eb81021241fbc3787fbf))
* **mthods:** move getStructure method to server ([5f4f238](https://gitlab.mim-libre.fr/alphabet/laboite/commit/5f4f238c423db421415c12f2d72013b55d3712e1))
* **personal space:** remove unnecessary Meteor.subscribe ([dac68bd](https://gitlab.mim-libre.fr/alphabet/laboite/commit/dac68bd1d64ddfa80768c161ba48aa94985507d5))
* **personal space:** take in account personalzoneupdater page ([7ec3afc](https://gitlab.mim-libre.fr/alphabet/laboite/commit/7ec3afc41201b9c319c96adb904c1ff8774047ee))
* **personal space:** using existing functions filtergroup and link ([b7cbf93](https://gitlab.mim-libre.fr/alphabet/laboite/commit/b7cbf9330a72fb674d1736398b9a72f8068b838e))
* **structure select:** extract auto complete select to component ([c5486ff](https://gitlab.mim-libre.fr/alphabet/laboite/commit/c5486ff478be1eb83ccca9d238057a2094782f3d))
* **tests:** update users tests ([58791cf](https://gitlab.mim-libre.fr/alphabet/laboite/commit/58791cf4832511fd82085328bee033ad56047874))
* **url:** test all meteor settings url ([9f011a0](https://gitlab.mim-libre.fr/alphabet/laboite/commit/9f011a09d5f91088d647fa6ceb58dd73578b40d2))


### Documentation

* **api:** add documentation for nctoken api call ([8916d4f](https://gitlab.mim-libre.fr/alphabet/laboite/commit/8916d4f0a076841b812ad82404d8dea25206add6))
* **general:** complete documentation ([bcf208d](https://gitlab.mim-libre.fr/alphabet/laboite/commit/bcf208dba532485a8c9cc8f8ffae897a7f548eaf))
* **general:** update general readme ([42cdfbb](https://gitlab.mim-libre.fr/alphabet/laboite/commit/42cdfbb97cf7813cc9f79f4a0a65fd68e3b40561))


### Features

* **269 cover image:** possibility of hide or display img on scroll ([463ab1f](https://gitlab.mim-libre.fr/alphabet/laboite/commit/463ab1f20ba398e89ced8a05f599fcf5a416d7df))
* **295-user-book-marks:** memorize rows per page per user session ([707bb46](https://gitlab.mim-libre.fr/alphabet/laboite/commit/707bb464bbe5bf8a70fad3a1cee4775b2e152353))
* **323:** possibility of hide or display medias storage menu ([fe0dd52](https://gitlab.mim-libre.fr/alphabet/laboite/commit/fe0dd528fbaef8184b75fec4587f2ba09ac8e775))
* **52:** add a structure change validation on admin structure level ([c569a61](https://gitlab.mim-libre.fr/alphabet/laboite/commit/c569a61d410534dc9806b82209c8e5a58be0354f))
* **52:** add a structure change validation on admin structure level ([04ebbed](https://gitlab.mim-libre.fr/alphabet/laboite/commit/04ebbed5c829d5fda72e7da244ceae66a6d8f128))
* **52:** automatically add new user to his group of structure ([74633d1](https://gitlab.mim-libre.fr/alphabet/laboite/commit/74633d139a77e690c0ffddeccdf78898c218df9f))
* **admin settings:** display database version in admin settings ([9c48c6a](https://gitlab.mim-libre.fr/alphabet/laboite/commit/9c48c6a1c10917efbb11d3a7e43705c4c4edc25a))
* **admin:** add remove admin structure rights to users ([ee3d918](https://gitlab.mim-libre.fr/alphabet/laboite/commit/ee3d9184ccd65223a6a415b5afa26135e778f1a6))
* **api:** add endpoint on /api/nctoken to retrieve Nextcloud token ([6e68cd4](https://gitlab.mim-libre.fr/alphabet/laboite/commit/6e68cd45c788e9b114742ce8b69ae12c63a1fb27))
* **asam:** add asamextensions schema and link to structures ([91ffffd](https://gitlab.mim-libre.fr/alphabet/laboite/commit/91ffffd52bd2305fc337d070e47052a06d1ffb41))
* **asam:** admin can assign structure to email extension ([cda37c2](https://gitlab.mim-libre.fr/alphabet/laboite/commit/cda37c2f8c276434110d24fba334ed8574e60703))
* **business regrouping by structure:** regrouping by structure ([08dc3b1](https://gitlab.mim-libre.fr/alphabet/laboite/commit/08dc3b16f638d92a1d577ce9af35435f55e9139a))
* **business regrouping:** possibility of regrouping services ([3a31919](https://gitlab.mim-libre.fr/alphabet/laboite/commit/3a31919e9d574d69442c11761e39f4f5abec248e))
* **groupe:** add migration ([a94e455](https://gitlab.mim-libre.fr/alphabet/laboite/commit/a94e455b0454ce4f75692e34a2c703c8a0294793))
* **groups:** add articles to group display page ([8553083](https://gitlab.mim-libre.fr/alphabet/laboite/commit/85530830e68f530c757f542e06a1b625f3386440))
* **groups:** add qr code display to group bookmarks ([60fcda9](https://gitlab.mim-libre.fr/alphabet/laboite/commit/60fcda9ea2a444b235622452aa282df1255269ba))
* **icon and cover image:** displaying cover image by structure ([81a8d5b](https://gitlab.mim-libre.fr/alphabet/laboite/commit/81a8d5b15586deb1b18630c1e95867bbdb0c3620))
* **listactions:** add copy nclocator into adminMenu and AdressBook ([68aac4e](https://gitlab.mim-libre.fr/alphabet/laboite/commit/68aac4eada1a3e5f69b03162da7d38de1886164b))
* **mail extension:** deleting email extension and fix some bugs ([4415987](https://gitlab.mim-libre.fr/alphabet/laboite/commit/44159872a9d66779d4ad3d240dfbfcf9b7549fd3))
* **mail extension:** possibilty of adding new domail extension ([83c9285](https://gitlab.mim-libre.fr/alphabet/laboite/commit/83c928524736f7f056ae90adf15c61bca3c3ad5b))
* **mail extension:** use keycloakwhitelist domains while checking mail ([6dcad88](https://gitlab.mim-libre.fr/alphabet/laboite/commit/6dcad8854fc4b4eb06b51ebd100824a9f118a167))
* make action column sticky ([9950370](https://gitlab.mim-libre.fr/alphabet/laboite/commit/99503704b7f72d62ff790bd5469b0307a396db35))
* **packages:** update meteor to 2.8.0 and other packages ([33c0058](https://gitlab.mim-libre.fr/alphabet/laboite/commit/33c0058993e04a7963f4b04c0bf5914d8caf40e3))
* **personalspace:** display configured video or text on personal space ([0b9f609](https://gitlab.mim-libre.fr/alphabet/laboite/commit/0b9f609df701f1a451da033a53724fc077119686))
* **profile:** add nclocator into profile page ([442cdf4](https://gitlab.mim-libre.fr/alphabet/laboite/commit/442cdf44984130caaeabba1fdabf7409d2b86a96))
* **profile:** collapse useless menu ([823aa66](https://gitlab.mim-libre.fr/alphabet/laboite/commit/823aa66c044d461c0482ec328e5f0a7ed4a0c7ca))
* **refactor:** refactor set/unset Admin & Admin Structure ([0fb53aa](https://gitlab.mim-libre.fr/alphabet/laboite/commit/0fb53aa84490782c44bb179be81c683dcbf0ec98))
* **structure:** add admin of group if user is structure admin ([74e0bac](https://gitlab.mim-libre.fr/alphabet/laboite/commit/74e0bacefb3451c411212bad919d4f209324efdc))
* **structure:** add associated group to structure ([ab38e44](https://gitlab.mim-libre.fr/alphabet/laboite/commit/ab38e44bb668f5d9fac28e3e4140a1ef0e532d01))
* **structure:** add prefix for group structure ([f6b691b](https://gitlab.mim-libre.fr/alphabet/laboite/commit/f6b691ba34a7a96ef324a90ef12540fe45b18df0))
* **structure:** block some options for structure group ([aa8df43](https://gitlab.mim-libre.fr/alphabet/laboite/commit/aa8df4397135eef59490f567be7ca1676d77f06a))
* **structure:** manage automatic group join at structure change ([40e81e7](https://gitlab.mim-libre.fr/alphabet/laboite/commit/40e81e76a4b602c2d2c2232298df2a05ef72bce2))
* **user creation:** auto assign structure if found by extension ([8e11a8d](https://gitlab.mim-libre.fr/alphabet/laboite/commit/8e11a8d35e37a25cc557a1e53f72a7aea4c4693a))
* **userBookmarks:** add qr code display in user bookmarks management ([def0efa](https://gitlab.mim-libre.fr/alphabet/laboite/commit/def0efa872f5101818ef900cdbd5effff3dd5f91))
* **version:** update meteor 2.8.1 ([3abc7c1](https://gitlab.mim-libre.fr/alphabet/laboite/commit/3abc7c14d45f1c5d78703c5de98fa77bc1ae5ae6))


### Styles

* **userbookmarks:** crop the url to prevent horizontal scroll ([6bc6048](https://gitlab.mim-libre.fr/alphabet/laboite/commit/6bc6048343ec8af2ee586981ec3fd6c9067a5851))

## [5.1.5](https://gitlab.mim-libre.fr/alphabet/laboite/compare/release/5.1.4...release/5.1.5) (2022-12-06)


### Bug Fixes

* **avatar:** uploads of images and size limit check ([e0e8286](https://gitlab.mim-libre.fr/alphabet/laboite/commit/e0e82864948cce25a644acbc0e443f57929a2c91))

## [5.1.4](https://gitlab.mim-libre.fr/alphabet/laboite/compare/release/5.1.3...release/5.1.4) (2022-12-02)


### Bug Fixes

* **dbinitialize:** add missing default value: globalInfo ([1d266fc](https://gitlab.mim-libre.fr/alphabet/laboite/commit/1d266fcd5ba6192991f4b29e276ba09b4e7186f1))

## [5.1.3](https://gitlab.mim-libre.fr/alphabet/laboite/compare/release/5.1.2...release/5.1.3) (2022-11-29)


### Bug Fixes

* **users:** emails field on users validation page ([be517e7](https://gitlab.mim-libre.fr/alphabet/laboite/commit/be517e78d906f687c33d8b568588236217199b3e))

## [5.1.2](https://gitlab.mim-libre.fr/alphabet/laboite/compare/release/5.1.1...release/5.1.2) (2022-11-29)


### Bug Fixes

* **admin:** fix admin settings ([f026c32](https://gitlab.mim-libre.fr/alphabet/laboite/commit/f026c32c6da3e580128da7f5e52d6ec0c605a56e))

## [5.1.1](https://gitlab.mim-libre.fr/alphabet/laboite/compare/release/5.1.0...release/5.1.1) (2022-11-25)


### Bug Fixes

* **users:** fix blank screen on admin user page ([d229a25](https://gitlab.mim-libre.fr/alphabet/laboite/commit/d229a25407de4bd172384764ce3ac1850185a4e8))

# [5.1.0](https://gitlab.mim-libre.fr/alphabet/laboite/compare/release/5.0.1...release/5.1.0) (2022-11-22)


### Bug Fixes

* **admin:** fix admin users pagination ([e18d297](https://gitlab.mim-libre.fr/alphabet/laboite/commit/e18d297e69b781f02647bcad15d9225294f7e0f5))
* **admin:** fix error notification on maintenance page ([d5c8df5](https://gitlab.mim-libre.fr/alphabet/laboite/commit/d5c8df59f9f67af599699018add8cb5e0db59f69))
* **admin:** fix maintenance error message ([2772b55](https://gitlab.mim-libre.fr/alphabet/laboite/commit/2772b55b6dd7bf8593407120fe00da2a6d54a4a0))
* **admin:** fix structure route with user param ([d6c679f](https://gitlab.mim-libre.fr/alphabet/laboite/commit/d6c679f62b50674797c40975217f7de32294a5a9))
* **admin:** limited access tio default space ([413539e](https://gitlab.mim-libre.fr/alphabet/laboite/commit/413539e78cb3a8d19b47ff8cfdf74debc095f06e))
* **admin:** replace new notification icon in admin user page ([c7e972e](https://gitlab.mim-libre.fr/alphabet/laboite/commit/c7e972e943bafeb2f2f2ac60b2354a876442122f))
* **adminUsers:** display message if no matching users found ([a039dae](https://gitlab.mim-libre.fr/alphabet/laboite/commit/a039dae82c510c302502db5cc909d16d0cb47ca7))
* **adminUsers:** reload users list after role removal ([0965445](https://gitlab.mim-libre.fr/alphabet/laboite/commit/09654451f0d3d81442e8c4db667bb58ed78b9311))
* **adminUsers:** remove unused calculation ([1c5ac0d](https://gitlab.mim-libre.fr/alphabet/laboite/commit/1c5ac0d4ff39f0c6f4459b7cb2555b5fa2dc0b8a))
* **appsettings:** fix display of current text in admin settings ([a475499](https://gitlab.mim-libre.fr/alphabet/laboite/commit/a4754991a77d331dfd173a895875b355dcae0efc))
* **badge:** delete unused box shadow ([9f355bf](https://gitlab.mim-libre.fr/alphabet/laboite/commit/9f355bfe6811f5a47440a40cc7d3ef646b2556d0))
* **footer:** hide footer in maintenance mode ([d93fe59](https://gitlab.mim-libre.fr/alphabet/laboite/commit/d93fe59594113144d66e1807a28e63c4eec778e3))
* **groups:** only group members can add events/polls ([3a9c8b4](https://gitlab.mim-libre.fr/alphabet/laboite/commit/3a9c8b42c8bb8da761d5e3272d3fca01bb8355d3))
* **groups:** only members can add bookmarks to group ([13346dc](https://gitlab.mim-libre.fr/alphabet/laboite/commit/13346dcfa1a57d23f0fd489d2c0cf59172ee6e62))
* **info:** fix path and information page ([82a559c](https://gitlab.mim-libre.fr/alphabet/laboite/commit/82a559c72a80ea516738e98dd37511b279cb9538))
* **intro:** fix introduction on signin page ([6b188b5](https://gitlab.mim-libre.fr/alphabet/laboite/commit/6b188b596461f71cce2d6d68c5c38c7ee81b12a7))
* **label:** correct labels in services creation form ([b4bea95](https://gitlab.mim-libre.fr/alphabet/laboite/commit/b4bea9543053749dfad360f75d92bdc81e828f1f))
* **logo:** fix spinner on error on logo change ([9045f47](https://gitlab.mim-libre.fr/alphabet/laboite/commit/9045f47e60bc20c8367ebff1a9c39fa3db9c5676))
* **logout:** optional chaining in filterservice into personalzoneupdater ([53b7a22](https://gitlab.mim-libre.fr/alphabet/laboite/commit/53b7a2261e4cb07407a0e167173bd98388cd0ae0))
* **menu:** fix var mobile notation in main menu ([3186992](https://gitlab.mim-libre.fr/alphabet/laboite/commit/318699274cdf5eec8672b3e3065baf1d7af54e1b))
* **migration:** fix imports paths ([66107f7](https://gitlab.mim-libre.fr/alphabet/laboite/commit/66107f71499965050fbfe1df083ebc1c44425bef))
* **notifications:** remove notification type choice in form ([21ec926](https://gitlab.mim-libre.fr/alphabet/laboite/commit/21ec926995fcffb121a8aa52e8e24af6033adee5))
* **notif:** set notification popup in top right corner ([873ced5](https://gitlab.mim-libre.fr/alphabet/laboite/commit/873ced5fbc2b3aab8d797a17deaf982533a20542))
* **pagination:** set mongo version 6.0.2 into docker compose ([b6bbb91](https://gitlab.mim-libre.fr/alphabet/laboite/commit/b6bbb91773b2ad12c7158d599ac61bc3cfdcd0a4))
* **personalPage:** hidden services must not appear on personalPage ([40a0e07](https://gitlab.mim-libre.fr/alphabet/laboite/commit/40a0e077791d9c227b6853045100ba054b789107))
* **plugins:** check permissions in rocketchat plugin hooks ([95d7a9c](https://gitlab.mim-libre.fr/alphabet/laboite/commit/95d7a9c884b1b21309bc7b8fa25c14a5e878f707))
* **refactor:** remove unused refactored page (AdminStructureUsersPage) ([1c12bd1](https://gitlab.mim-libre.fr/alphabet/laboite/commit/1c12bd17ba70b5c4bfa41ad2327cd1e0dc641693))
* **search:** fix [#199](https://gitlab.mim-libre.fr/alphabet/laboite/issues/199) to support whitespace ([5b41f6f](https://gitlab.mim-libre.fr/alphabet/laboite/commit/5b41f6f4224ca15fe293243b05b5250c5097ca90))
* **search:** fix space that fetch all users ([2a7dba7](https://gitlab.mim-libre.fr/alphabet/laboite/commit/2a7dba7d15f062fed0df6858eb273f6bb4b38a75))
* **search:** removes doublon ([9d710e4](https://gitlab.mim-libre.fr/alphabet/laboite/commit/9d710e463aa3f26b544f6cbf3d4634bd48c58d0f))
* **settings:** fix settings destructuration ([71b9530](https://gitlab.mim-libre.fr/alphabet/laboite/commit/71b953044fece257846f240e8bad7ab0cee95b8a))
* **settings:** remove key from sample config, set value at migration ([8d8c9b0](https://gitlab.mim-libre.fr/alphabet/laboite/commit/8d8c9b022fe5c3fef70ccc34b08747cd88b8d36f))
* **svg:** set mimetype when svg to fix html display ([1dc92f8](https://gitlab.mim-libre.fr/alphabet/laboite/commit/1dc92f8e770f529629e5def7e80486edff4d3bba))
* **test:** fix tests ([8d5889a](https://gitlab.mim-libre.fr/alphabet/laboite/commit/8d5889a7950d14aaeffb42bfbf8c1b2b8ec01232))
* **theme:** add missing property in eole and apps theme ([04a6991](https://gitlab.mim-libre.fr/alphabet/laboite/commit/04a6991d1f4f29bd36e454d18837568c0f45ed9f))
* **theme:** delete paper background attribute ([560e1be](https://gitlab.mim-libre.fr/alphabet/laboite/commit/560e1be469f0b240b344562f7edad35e40c4a41f))
* **topbar:** fix information button ([ee3ef60](https://gitlab.mim-libre.fr/alphabet/laboite/commit/ee3ef601f8a759a12916576655a2f3bbcdcdaf40))
* **ui menus:** restrict three col layout to mobile ([6efa21e](https://gitlab.mim-libre.fr/alphabet/laboite/commit/6efa21ed46eac17b70404292b070a18ce5edaa56))
* **ui topbar:** notification bell is not doubled ([d164a7e](https://gitlab.mim-libre.fr/alphabet/laboite/commit/d164a7e65edb322f4898f0f005f03575fb82c741))
* **ui:** don't call user count if group is not loaded ([96cfec4](https://gitlab.mim-libre.fr/alphabet/laboite/commit/96cfec4b7396be2f5f2ff57b25e28c1df4756245))
* **ui:** fix appearance of some selects ([301c4c8](https://gitlab.mim-libre.fr/alphabet/laboite/commit/301c4c8198c21516a856bbab4ce6d7e228354655))
* **ui:** fix label on state input in service creation ([c972dab](https://gitlab.mim-libre.fr/alphabet/laboite/commit/c972dabc653d0bff7d8c8845db1f20c43e9164cb))
* **ui:** fix ui to show notif bell on top ([1956764](https://gitlab.mim-libre.fr/alphabet/laboite/commit/1956764c102ed293dab16c8bf17cd98dab75786d))
* **widget:** add firefox storage request on login ([97b37f5](https://gitlab.mim-libre.fr/alphabet/laboite/commit/97b37f5463ae3c8132be78e4dc37b8796ab6200b))


### Code Refactoring

* **admin:** refactor admin settings ([0586d12](https://gitlab.mim-libre.fr/alphabet/laboite/commit/0586d128375334519f3b3fd5617031956513338d))
* **group:** refactor countMembersOfGroup method ([226f2b8](https://gitlab.mim-libre.fr/alphabet/laboite/commit/226f2b84fd07c0d938873a9ec4f7e4b1a54b19ed))
* **group:** replace publication by method for count users ([c727b0b](https://gitlab.mim-libre.fr/alphabet/laboite/commit/c727b0bc0e99a020b5bdb48a5b34d4f5de368356))
* **log:** remove non-useful console log ([e32a0df](https://gitlab.mim-libre.fr/alphabet/laboite/commit/e32a0dff33e7d55a9eb2716650c957e42868cc4c))
* **migration:** rebase after librairies migrations ([5a48994](https://gitlab.mim-libre.fr/alphabet/laboite/commit/5a48994abaa7954768cc23edb1d3d5aa91cd4b6b))
* **service:** create new component for remove duplicate code ([6332204](https://gitlab.mim-libre.fr/alphabet/laboite/commit/6332204736c369db8c9f67be24f3e31e3d85b213))
* **settings:** remove the key in settings  and use DB ([4d06d19](https://gitlab.mim-libre.fr/alphabet/laboite/commit/4d06d1946c4d702fe69a78bb39b673d11c8eaae6))


### Documentation

* **config:** add useStructureValidationMandatory to README ([deb2b6f](https://gitlab.mim-libre.fr/alphabet/laboite/commit/deb2b6f383406bcab843295c127e5e9dcc81d1f0))
* **plugins:** improve groupPlugins documentation ([de8d50d](https://gitlab.mim-libre.fr/alphabet/laboite/commit/de8d50d12e545dbd675bcb28b4d68c46a31914f5))


### Features

* **addressbook:** add the option to show only admins or animators ([c7ab70e](https://gitlab.mim-libre.fr/alphabet/laboite/commit/c7ab70ef1c627f35bbf37d469ca1ba7724e0a203))
* **admin ui:** admin can change structure attachment mandatoriness ([8fde615](https://gitlab.mim-libre.fr/alphabet/laboite/commit/8fde615f5790e9c77bf98eaf007789cae88e0c2f))
* **admin:** indicate inactive services ([a0b9c9b](https://gitlab.mim-libre.fr/alphabet/laboite/commit/a0b9c9b70124e05e0d0a309d68594f4b75da5c9d))
* **adminUsers:** allow to show only admin or adminStructure users ([46ae357](https://gitlab.mim-libre.fr/alphabet/laboite/commit/46ae357f7def2545f0061f5f7364d54763cea114))
* **default:** apply to all & reset methods ([5289768](https://gitlab.mim-libre.fr/alphabet/laboite/commit/5289768a6f9c9ec000897277a1fa9275bffc7ee5))
* **group:** add total count of group members on the UI ([23464c7](https://gitlab.mim-libre.fr/alphabet/laboite/commit/23464c7d145b16d6ddb81125016c6c96ced84cbd))
* **group:** enable sending notification to one or all member of a group ([4403cc1](https://gitlab.mim-libre.fr/alphabet/laboite/commit/4403cc1fad5823434f65abf8ded4c5a8b4506012))
* **hook:** add useboolean hook in utils ([a9f6ded](https://gitlab.mim-libre.fr/alphabet/laboite/commit/a9f6ded3a9a57b964e28857a529a4a452f46b7fb))
* **layout:** user know if they are awaiting structure ([7e8eaa5](https://gitlab.mim-libre.fr/alphabet/laboite/commit/7e8eaa5b783e53112a25516353d5931039b1482e))
* **settings:** add global informations in app settings ([d7ff547](https://gitlab.mim-libre.fr/alphabet/laboite/commit/d7ff5478cc0ffb4e3c4a122a2469170d0aec0035))
* **space:** autotmaticly generate pspace from structure ([a886bfd](https://gitlab.mim-libre.fr/alphabet/laboite/commit/a886bfd3dabd2a511cd173311c09ba8c34df9422))
* **spaces:** add hook on users structure change ([546612e](https://gitlab.mim-libre.fr/alphabet/laboite/commit/546612eb144c06b99f3dda94bad09ff5b774d9a6))
* **spaces:** wip add default spaces to structures ([8176354](https://gitlab.mim-libre.fr/alphabet/laboite/commit/8176354758bd62f4cee052358fdce5355db3a5cd))
* **structure:** structure attachment validation can be mandatory ([f5e656e](https://gitlab.mim-libre.fr/alphabet/laboite/commit/f5e656e0625ea445bc4123e328cb6ca1e73ddc63))
* **tags:** add enter event to add a to to an article ([0466bb6](https://gitlab.mim-libre.fr/alphabet/laboite/commit/0466bb62952d80bbbe33d2805bdb52e67899ba58))
* **ui topbar:** use three column layout for topbar ([c4d5a9a](https://gitlab.mim-libre.fr/alphabet/laboite/commit/c4d5a9a2e50e26a023cd254b32b9835505b4ba69))
* **users:** add temporary method to fix badly created users ([2bcabf1](https://gitlab.mim-libre.fr/alphabet/laboite/commit/2bcabf1b75d66a63a25cb42727526f695caa1a69))


### Reverts

* **admin:** revert fix admin users pagination ([8934009](https://gitlab.mim-libre.fr/alphabet/laboite/commit/89340091be8020aed12a6bf69a2484a01dcadac2))


### Tests

* **default:** add default space tests ([a1bb12d](https://gitlab.mim-libre.fr/alphabet/laboite/commit/a1bb12d8d7f6047ab82dd18be4251dae00ece86b))
* **group:** add test for countMembersOfGroup method ([6ccecbd](https://gitlab.mim-libre.fr/alphabet/laboite/commit/6ccecbdfa534378a54e428f73b15844f68179288))

## [5.0.1](https://gitlab.mim-libre.fr/alphabet/laboite/compare/release/5.0.0...release/5.0.1) (2022-10-18)


### Bug Fixes

* **services:** fix offline services display ([12afd2e](https://gitlab.mim-libre.fr/alphabet/laboite/commit/12afd2e0f54946ef9b15a4a2e11508bdb670844f))

# [5.0.0](https://gitlab.mim-libre.fr/alphabet/laboite/compare/release/4.3.3...release/5.0.0) (2022-09-16)


### Bug Fixes

* **admin menu:** display all admin menus when scrolling ([e984230](https://gitlab.mim-libre.fr/alphabet/laboite/commit/e984230e244062866e131eb0af75133f6f1a079f))
* **admin menu:** display return "pers.space" menu when scrolling menus ([5bbbbce](https://gitlab.mim-libre.fr/alphabet/laboite/commit/5bbbbced126929c9551438c1b2696f781e8947c0))
* **admin:** fix remove user from structure ([fabebb4](https://gitlab.mim-libre.fr/alphabet/laboite/commit/fabebb48e1a84a37eb48a49b883fa1ba528806ec))
* **admin:** fix user structure name ([791af60](https://gitlab.mim-libre.fr/alphabet/laboite/commit/791af60446f76785c301064286ea12c43f798811))
* **all:** last fixes before review 1 ([e905b05](https://gitlab.mim-libre.fr/alphabet/laboite/commit/e905b05837bea065f8754f0e9f430bbbac810629))
* **ci:** disable husky if ci running ([21a2a83](https://gitlab.mim-libre.fr/alphabet/laboite/commit/21a2a83c341d3834aedaa477326be49f5a749bf9))
* **contact:** move connected contact page to mainlayout ([25a21ed](https://gitlab.mim-libre.fr/alphabet/laboite/commit/25a21eda4a1e30fb93721240c457274b1debeb40))
* **event:** events participants update after user joins group ([9084ae9](https://gitlab.mim-libre.fr/alphabet/laboite/commit/9084ae98941e0498a9e3e72350ec814bf41846ab))
* **event:** fix update events at group join ([f0255e2](https://gitlab.mim-libre.fr/alphabet/laboite/commit/f0255e2bf5542858cb5fe2f0d92f8344073a43dd))
* **fakedata:** remove undefined structure reference from users ([90ab4ab](https://gitlab.mim-libre.fr/alphabet/laboite/commit/90ab4ab561ff7bcfb5b99420ffaae9836bba098d))
* **Filter services:** display all services categories when scrolling ([d40bfd7](https://gitlab.mim-libre.fr/alphabet/laboite/commit/d40bfd74a0e6baecb7072900a3570592c64025f0))
* **form hook:** fix event persistance on synthetic event ([3d54ee3](https://gitlab.mim-libre.fr/alphabet/laboite/commit/3d54ee306ed7e5cc5cde669088c9d7ee1b1b2969))
* **front:** filter dangerouslySetInnerHTML ([a3dc730](https://gitlab.mim-libre.fr/alphabet/laboite/commit/a3dc7306430ae1381fedaf6aba10d9079d932087))
* **front:** fix meteor-lint err ([57f0946](https://gitlab.mim-libre.fr/alphabet/laboite/commit/57f09462fa3dc0f0a9cf0db5e477ef24881c94de))
* **front:** fix meteor-lint err ([4692a2b](https://gitlab.mim-libre.fr/alphabet/laboite/commit/4692a2be0bc41e1c934fcd071ec63f48aef51e8e))
* **front:** fix meteor-lint err ([1765be0](https://gitlab.mim-libre.fr/alphabet/laboite/commit/1765be04bdc61d2de8bfa0ea391213e51f21c327))
* **front:** fix meteor-lint err ([a490cf3](https://gitlab.mim-libre.fr/alphabet/laboite/commit/a490cf36a64cfd7e1bf8deac855d7e361a6ed3cb))
* **front:** fix meteor-lint err ([9d938a5](https://gitlab.mim-libre.fr/alphabet/laboite/commit/9d938a5ae1b05c5aac667d6caa0a5e12d4df9f87))
* **help:** display help page on large widget ([b0d317b](https://gitlab.mim-libre.fr/alphabet/laboite/commit/b0d317b68badd6fb241fd1a1e78eca128dc5285c))
* **i18n:** fix translations ([6cfa8e5](https://gitlab.mim-libre.fr/alphabet/laboite/commit/6cfa8e57eeb65cbb629598d3746ebd13c7ab5f39))
* **legal:** fix back button with all themes ([d97d7d4](https://gitlab.mim-libre.fr/alphabet/laboite/commit/d97d7d410c1df718f1bbe1ae7f0ac857dc7e7097))
* **licence:** open creative commons website on new tab ([becde41](https://gitlab.mim-libre.fr/alphabet/laboite/commit/becde41c4cbe116fa39d274f4e94c01f5f21e46c))
* **link:** change url in publication share icon ([eb392c2](https://gitlab.mim-libre.fr/alphabet/laboite/commit/eb392c28eeee9751816d27b8d7ec1bb7a01e5ba1))
* **migration:** change import path and useStyles return ([39b1415](https://gitlab.mim-libre.fr/alphabet/laboite/commit/39b141587c56a0ece8ef5894953bb47f12a0f9d1))
* **mui:** change labelWidth, CollapsingSearch and styles ([66bfbfa](https://gitlab.mim-libre.fr/alphabet/laboite/commit/66bfbfa01a52a5c5a4619c8cd37ed6a0bbd474b9))
* **mui:** fix fade fragment ([386ac54](https://gitlab.mim-libre.fr/alphabet/laboite/commit/386ac54ec5aaebb0a1dd24d7768d69fd4702176b))
* **mui:** improve tabs behavior ([c42c924](https://gitlab.mim-libre.fr/alphabet/laboite/commit/c42c924a1a98314dcc87277c0e5c9f976235bb49))
* **mui:** mui alert & colors ([c7dcf60](https://gitlab.mim-libre.fr/alphabet/laboite/commit/c7dcf607721544a937305a1cade8b1ef00376a1c))
* **notifications:** make the notifi bell visible again ([e270113](https://gitlab.mim-libre.fr/alphabet/laboite/commit/e270113083daa891d8ee56b119dab6735cbc3478))
* **notifications:** update keyframes for mui 5 ([9919a36](https://gitlab.mim-libre.fr/alphabet/laboite/commit/9919a3658f356ff5cc6d6029b758bcc9b2a2eacc))
* **packages:** update package-lock.json and npm libraries ([4fd5349](https://gitlab.mim-libre.fr/alphabet/laboite/commit/4fd5349dec41059bbdc91c7dad4217fba5158f04))
* **personalpage:** disable loading video when personal page exists ([c2a1dec](https://gitlab.mim-libre.fr/alphabet/laboite/commit/c2a1decd552c633b8a73fe961b4c8591e81c8412))
* **personalspace:** lazy loading of animation ([413165b](https://gitlab.mim-libre.fr/alphabet/laboite/commit/413165b5aac09ecc70a82d69093a58f3926b727c))
* **profil:** fix label of username input ([2dd70c8](https://gitlab.mim-libre.fr/alphabet/laboite/commit/2dd70c875825c8fe3d5d9279e17dca78cf62bbeb))
* **publication:** fix mobile views ([13197dc](https://gitlab.mim-libre.fr/alphabet/laboite/commit/13197dcceb5bf6ca3a3c9d820d26b3f8885a076f))
* **service:** modify validata schema at service creation ([152ee22](https://gitlab.mim-libre.fr/alphabet/laboite/commit/152ee22add1edbde6b7974edcd64d93e4c2994a8))
* **service:** remove console log ([da179cd](https://gitlab.mim-libre.fr/alphabet/laboite/commit/da179cdb20c0f82bd6e128d1285cc90ffbd555d7))
* **spinner:** fix spinner, package-lock & themes ([a446213](https://gitlab.mim-libre.fr/alphabet/laboite/commit/a4462136e356d2af3520ea1c4c3319d9396eb729))
* **structure:** resolve bug when create a structure after child tructure ([e6fc5fb](https://gitlab.mim-libre.fr/alphabet/laboite/commit/e6fc5fbb3a3698be3b73d765236b887269d2d7ba))
* **structures gen:** fake data use generated _ids now ([48b7f8f](https://gitlab.mim-libre.fr/alphabet/laboite/commit/48b7f8fdef162109494dfb890bb0e6797c103b6a))
* **theme:** change light import to dark import ([dab1264](https://gitlab.mim-libre.fr/alphabet/laboite/commit/dab1264beddf764404df9057f90cf16c9c968b1b))
* **themes:** remove themes folder from jscpd ([4bdd249](https://gitlab.mim-libre.fr/alphabet/laboite/commit/4bdd249ac73f58f2555d544af0853020a3b13624))
* **ui list:** list view should be default one ([d4e2baa](https://gitlab.mim-libre.fr/alphabet/laboite/commit/d4e2baa516999bf308100ea8d31df02db2e1cc10))
* **ui:** add margin between card grid and toolbar ([49edba0](https://gitlab.mim-libre.fr/alphabet/laboite/commit/49edba0a60b0bbd5c1b1db14851e527b3b436694))
* **ui:** button work on first page render ([1b87cd2](https://gitlab.mim-libre.fr/alphabet/laboite/commit/1b87cd2005460671b1f21df909867d735883f6bb))
* **ui:** fix hover background size ([6d10d70](https://gitlab.mim-libre.fr/alphabet/laboite/commit/6d10d7028a44fef2cd005b539381d78440969828))
* **ui:** fix mobile ui after libraries migration ([a0f1707](https://gitlab.mim-libre.fr/alphabet/laboite/commit/a0f1707cc649c73031fa17d0ec80d9d6981c3e92))
* **ui:** fix spinner logo for eole theme and animation ([37a8f06](https://gitlab.mim-libre.fr/alphabet/laboite/commit/37a8f067b9a454bc6526e81a27d89fbc2c17e31a))
* **ui:** fix spinner when deleting all publi ([e9b8e39](https://gitlab.mim-libre.fr/alphabet/laboite/commit/e9b8e399aa91f5050185640ca59c535354d4f404))
* **ui:** refactor textfield like old verison 4.3.0 ([0e77a85](https://gitlab.mim-libre.fr/alphabet/laboite/commit/0e77a85140467b12822bfb8981f5e7e5502207d9))
* **ui:** remove black square in notifications display ([986be24](https://gitlab.mim-libre.fr/alphabet/laboite/commit/986be24cae9677ef297107a849c4c731aa1da952))
* **version:** merge master into dev ([7cb16ee](https://gitlab.mim-libre.fr/alphabet/laboite/commit/7cb16ee51928b26576b5aaabc7b83db27709a119))


### Build System

* **husky:** disable husky in pre push hook ([6ca4db9](https://gitlab.mim-libre.fr/alphabet/laboite/commit/6ca4db9970e833fcd0276d41bce292ce009961c3))
* **husky:** update command that disable husky if ci running ([99efbfc](https://gitlab.mim-libre.fr/alphabet/laboite/commit/99efbfcf989928ad2d248a83fa608aa03098378a))


### Code Refactoring

* **admin:** merge admin users files in one ([ab71250](https://gitlab.mim-libre.fr/alphabet/laboite/commit/ab71250edc9f9d2f7f5591a10fd564d669d19ae9))
* **legal:** remove border from back button ([5883e03](https://gitlab.mim-libre.fr/alphabet/laboite/commit/5883e03f4fa96fe1faaca2dfb0d624f987bf4f52))
* **log:** remove console log ([1c16fa2](https://gitlab.mim-libre.fr/alphabet/laboite/commit/1c16fa2536e6c27a94b658639f338e328eea9a06))
* **migration:** rebase after librairies migrations ([28a07c6](https://gitlab.mim-libre.fr/alphabet/laboite/commit/28a07c64215cf97529e69805669b4930f1dd1ada))
* **mui:** add tss-react & update code ([559429d](https://gitlab.mim-libre.fr/alphabet/laboite/commit/559429d38cffbe3f3d15a78a1384105234b0fc9a))
* **mui:** change themes format ([5f2e539](https://gitlab.mim-libre.fr/alphabet/laboite/commit/5f2e539f9993b37fcd8e71051ce29259e13d94c2))
* **mui:** finalize migration ([1fb8f9c](https://gitlab.mim-libre.fr/alphabet/laboite/commit/1fb8f9c8ce771b475cf9cb4d0e09c947ea0ab0fb))
* **mui:** fix components ([c604a6b](https://gitlab.mim-libre.fr/alphabet/laboite/commit/c604a6b5cc3e57a19c684beaabd498b4916abf09))
* **mui:** install new mui packages ([7edb905](https://gitlab.mim-libre.fr/alphabet/laboite/commit/7edb9058eca51225844168f705d3d31ba4a9131a))
* **mui:** preset-safe script modified imports ([a447386](https://gitlab.mim-libre.fr/alphabet/laboite/commit/a447386d9a01d4a9635e2b5110c28f559a70986f))
* **packages:** migrate package-lock and add husky script ([7e0a3f2](https://gitlab.mim-libre.fr/alphabet/laboite/commit/7e0a3f275305499833c4cb2dbdf17d31f4e17c59))
* **profile:** change i18n  pseudonyme to nom d utilisateur ([0c61aa4](https://gitlab.mim-libre.fr/alphabet/laboite/commit/0c61aa4f5ce0329d35c3ec108d8321407b386670))
* **profile:** change style button back to profile ([3ab1e70](https://gitlab.mim-libre.fr/alphabet/laboite/commit/3ab1e70bc3acb28f9df2ed821ff08cabeebde8d4))
* **react:** update react version to 17 ([ac008d1](https://gitlab.mim-libre.fr/alphabet/laboite/commit/ac008d15ecb686574dc0a594c1e910434184f637))
* **smtp method:** sendContactEmail use validatedMethod now ([86c8eeb](https://gitlab.mim-libre.fr/alphabet/laboite/commit/86c8eeb07926cce11c6890b49704c5f49cb37ed5))
* **sortable:** update react-sortablejs ([9d900bb](https://gitlab.mim-libre.fr/alphabet/laboite/commit/9d900bb3f497a5a5c45698035dd79197968020db))
* **table:** update @material-table/core ([ec60897](https://gitlab.mim-libre.fr/alphabet/laboite/commit/ec60897ffadadbedb71d1ba445ba6b02209dd324))


### Continuous Integration

* **yml:** delete meteor npm ci in cache deps update ([c0e6e4f](https://gitlab.mim-libre.fr/alphabet/laboite/commit/c0e6e4ff33a139c6c9852b684f11289cdc3a050a))


### Features

* **article:** add licences for articles ([2dee375](https://gitlab.mim-libre.fr/alphabet/laboite/commit/2dee375ca8f4a6629e50398f959ddbdd8b6cbb64))
* **contact:** structure can have a contact email ([c1f625c](https://gitlab.mim-libre.fr/alphabet/laboite/commit/c1f625c90496e197af2645c4572b6709f4094566))
* **event:** add button to add new event ([65d0c5e](https://gitlab.mim-libre.fr/alphabet/laboite/commit/65d0c5eee4903c800db2004162dd5e54fee2d90a))
* **footer:** add back button to footers pages ([9ab8967](https://gitlab.mim-libre.fr/alphabet/laboite/commit/9ab8967af6b54df1fddcbb19241fb1420d43a353))
* **grid view:** make configurable default view mode ([5ee21d9](https://gitlab.mim-libre.fr/alphabet/laboite/commit/5ee21d92177b3b5920112b49119bf20159beee60))
* **mail head:** use app name instead of raw 'LaBoite' ([0aca0f2](https://gitlab.mim-libre.fr/alphabet/laboite/commit/0aca0f22a6e74087e52e6970cec24c6b269318ce))
* **node:** add node version to package.json ([49cdec2](https://gitlab.mim-libre.fr/alphabet/laboite/commit/49cdec26061fcb5590f67caee0f09b8e143bf1a4))
* **notif:** display bell on mobile and tab ([af992e5](https://gitlab.mim-libre.fr/alphabet/laboite/commit/af992e54c5ff9f784e77859b050fb04a6c877f35))
* **poll:** add create poll button ([dffd104](https://gitlab.mim-libre.fr/alphabet/laboite/commit/dffd1049bc597e0f618a494caaa1cb20aa6ef52d))
* **services:** add maintenance option on Service Administration ([c774036](https://gitlab.mim-libre.fr/alphabet/laboite/commit/c7740368a614f8acbf526bbd30a787dda1bf164c))
* **services:** disabled button for service on maintenance or inactive ([33c1226](https://gitlab.mim-libre.fr/alphabet/laboite/commit/33c1226b82501ecb5305cefdc3a08644b41dd61a))
* **users:** remove user from structure ([dedca5c](https://gitlab.mim-libre.fr/alphabet/laboite/commit/dedca5ce3490b4c18d84e383368041d7cdc967c2))


### Tests

* **users:** remove from structure tests ([cf5b0e9](https://gitlab.mim-libre.fr/alphabet/laboite/commit/cf5b0e929a0919747929207875d6f51c89503d7f))


### BREAKING CHANGES

* **grid view:** `ui.defaultGridViewMode` setting is mandatory

## [4.3.3](https://gitlab.mim-libre.fr/alphabet/laboite/compare/release/4.3.2...release/4.3.3) (2022-09-12)


### Bug Fixes

* **lib:** backport react-meteor-data to version 2.4.0 ([91e0fc0](https://gitlab.mim-libre.fr/alphabet/laboite/commit/91e0fc05b0ca7f30649cc07045aa1135a85790da))

## [4.3.2](https://gitlab.mim-libre.fr/alphabet/laboite/compare/release/4.3.1...release/4.3.2) (2022-09-09)


### Bug Fixes

* **ci:** disable husky for ci ([a020083](https://gitlab.mim-libre.fr/alphabet/laboite/commit/a02008386629b80b6609336a6feed8d2d8fb0a47))
* **version:** generate new release 4.3.2 ([2ab3aa5](https://gitlab.mim-libre.fr/alphabet/laboite/commit/2ab3aa50042e8bc0e1697c63660728a8fa0ef626))


### Build System

* **meteor:** update meteor to 2.7.3 ([6ebee75](https://gitlab.mim-libre.fr/alphabet/laboite/commit/6ebee7568601beb2b2cafd59e5f82842123d4bb2))

## [4.3.1](https://gitlab.mim-libre.fr/alphabet/laboite/compare/release/4.3.0...release/4.3.1) (2022-08-26)


### Bug Fixes

* **animation:** replace url video from dijon.beta to podeduc ([d0a9d7b](https://gitlab.mim-libre.fr/alphabet/laboite/commit/d0a9d7b15dd72ef5b10890c8a42921cb50b684d9))

# [4.3.0](https://gitlab.mim-libre.fr/alphabet/laboite/compare/release/4.2.6...release/4.3.0) (2022-07-04)


### Bug Fixes

* **admin:** fix user page view in small & medium devices ([523ceff](https://gitlab.mim-libre.fr/alphabet/laboite/commit/523ceff6f453a9148fdfe793af2b72d17a62d7da))
* **admingroup:** fix close finder ([9265fb3](https://gitlab.mim-libre.fr/alphabet/laboite/commit/9265fb35858f1ca05032f62f82eaf52829e110f5))
* **app build:** extract hook in another file to build app ([d2b0157](https://gitlab.mim-libre.fr/alphabet/laboite/commit/d2b0157a39c9d9d7586c07dcba3648c8a42edf2d))
* **app build:** extract hook in another file to build app ([21a4c38](https://gitlab.mim-libre.fr/alphabet/laboite/commit/21a4c3878753cfb3c15aa63ebf53f7c74df1ec2b))
* **app build:** extract hook in another file to build app ([f4b0506](https://gitlab.mim-libre.fr/alphabet/laboite/commit/f4b050658c81e9d6d71e03318ae34d573a371daf))
* **articles:** fix audio recording upload ([7ecb472](https://gitlab.mim-libre.fr/alphabet/laboite/commit/7ecb47234474232b8468bbe68e7fe4447172f20b))
* **articles:** tweak toast plugin to fix i18n ([c736ede](https://gitlab.mim-libre.fr/alphabet/laboite/commit/c736edee33a73da3f0b3260de2d3d68a1138a661))
* **blog:** fix internal blog ([6c18365](https://gitlab.mim-libre.fr/alphabet/laboite/commit/6c18365853d1151fdc64bf4e2818c82e56af2a5e))
* **blog:** remove useless chevron button on articles ([222752d](https://gitlab.mim-libre.fr/alphabet/laboite/commit/222752dd235d1d341a1f8a9ba162a21bd62ef97e))
* **contact:** fix display mail and css on fields ([f38119b](https://gitlab.mim-libre.fr/alphabet/laboite/commit/f38119b25bd9be16ecd5bc20ad72675ec1e3881c))
* **contact:** fix structure and captcha if user is not active ([65c0e52](https://gitlab.mim-libre.fr/alphabet/laboite/commit/65c0e5231dccb5cd7b1ad51457c30bd4c7f0d230))
* **deps:** update axios version ([87fd033](https://gitlab.mim-libre.fr/alphabet/laboite/commit/87fd03304c7e36dc955e5c685c1f1b73ef97b3c1))
* **duplicate:** remove code clones ([8ad63a7](https://gitlab.mim-libre.fr/alphabet/laboite/commit/8ad63a72c2c620b7862c26688f09431c597022df))
* **events:** fix event url in group events ([fa116b5](https://gitlab.mim-libre.fr/alphabet/laboite/commit/fa116b5e3d82bcac18a9c45fde34d4daed10dd7d))
* **finder:** close finder if another is opening ([97e11a2](https://gitlab.mim-libre.fr/alphabet/laboite/commit/97e11a2194b5c94978fb13e156b200d54af26c24))
* **fonts:** fix import path for material icons ([49a5a87](https://gitlab.mim-libre.fr/alphabet/laboite/commit/49a5a870f92507e5d89a70806f54cb7726e3f183))
* **global:** revert commit ([6d16e3f](https://gitlab.mim-libre.fr/alphabet/laboite/commit/6d16e3f507c9260c314aa030731756327a4ad0bc))
* **group:** fix console error when group is deleted ([9230149](https://gitlab.mim-libre.fr/alphabet/laboite/commit/9230149f10c7d758fae00ffdcbd6999bdffaf606))
* **group:** fix console error when group is deleting ([22ed5cc](https://gitlab.mim-libre.fr/alphabet/laboite/commit/22ed5cc3e3e2c1d11fa705ea7f68fa0b86adbcbf))
* **group:** fix error when removing a group from it's edition page ([1c4bd19](https://gitlab.mim-libre.fr/alphabet/laboite/commit/1c4bd19496c5ba5ff99ea62333607c6664388954))
* **group:** fix import members of another group ([c41d217](https://gitlab.mim-libre.fr/alphabet/laboite/commit/c41d2175375d508151ce02728be6d81979ef432d))
* **group:** fix rocket chat hook ([0dc8210](https://gitlab.mim-libre.fr/alphabet/laboite/commit/0dc82104fba0110eeeeec0dd9c6869b5f60787b7))
* **group:** fix rocketchat hook ([1510a55](https://gitlab.mim-libre.fr/alphabet/laboite/commit/1510a55c1e12d2f2f9a5e5fe61097870e556a8e0))
* **groups:** add hooks for add members from another group ([1728e46](https://gitlab.mim-libre.fr/alphabet/laboite/commit/1728e4652846197df6074605263b0e794b915a21))
* **groups:** fix hooks ([80ba132](https://gitlab.mim-libre.fr/alphabet/laboite/commit/80ba13293a7b8fb30b0d838abd7a257f4791c6fb))
* **groups:** fix hooks ([baf13a9](https://gitlab.mim-libre.fr/alphabet/laboite/commit/baf13a954a4ea6801f1a6649eabfe29eb2b88f2e))
* **groups:** fix redirect when admin a group ([fcbf9ba](https://gitlab.mim-libre.fr/alphabet/laboite/commit/fcbf9baa2a37172b94fe50ca10ba27c07e5ae9c3))
* **groups:** improve loop and fix hook ([6e47a31](https://gitlab.mim-libre.fr/alphabet/laboite/commit/6e47a3112c82083a0d0c66723499049ab538b27f))
* **help:** fix sort categories really ([79d7c12](https://gitlab.mim-libre.fr/alphabet/laboite/commit/79d7c1299dff7b6db21038600168e29230e18c34))
* **help:** sort category array ([717293e](https://gitlab.mim-libre.fr/alphabet/laboite/commit/717293ebb2118e9fa256847c1c32878b55bcdfb5))
* **hook:** show structure name with useEffect ([53490a7](https://gitlab.mim-libre.fr/alphabet/laboite/commit/53490a7cae8f3f5ede4d53b1339a6ef95c480b3a))
* **i18n:** add missing translation for profile ([796f5cd](https://gitlab.mim-libre.fr/alphabet/laboite/commit/796f5cdfc7f368dccf657c11e3929798631d4b7d))
* **i18n:** add missing translations for profile ([41acfbf](https://gitlab.mim-libre.fr/alphabet/laboite/commit/41acfbf41759c259943d791bc99574377eaacad8))
* **i18n:** add traduction ([bf9c4b1](https://gitlab.mim-libre.fr/alphabet/laboite/commit/bf9c4b13c6c8acdfbef1272455e2e431e67b022d))
* **i18n:** fix json imports ([017139f](https://gitlab.mim-libre.fr/alphabet/laboite/commit/017139f646b6d3f9a23401dbfccc5413d4fcb7ed))
* **i18n:** fix typo in profileStructureSelection i18n ([cf96eb0](https://gitlab.mim-libre.fr/alphabet/laboite/commit/cf96eb0a45f7bbff91de29fac77efaef514eb817))
* **i18n:** inject i18n in html ([ca8caed](https://gitlab.mim-libre.fr/alphabet/laboite/commit/ca8caedeeb105b83adec2ddb551d7b1c121b1b29))
* **i18n:** move folder to avoid default import ([f1b6990](https://gitlab.mim-libre.fr/alphabet/laboite/commit/f1b6990b8732d40496f5184788a81c5961822d48))
* **i18n:** use correct key spellingf or menu item ([62be4ac](https://gitlab.mim-libre.fr/alphabet/laboite/commit/62be4aced4f73d7c33a8a05b5a30dd0bb8f7e314))
* **import:** import handleresult ([535d4f8](https://gitlab.mim-libre.fr/alphabet/laboite/commit/535d4f84e93d6b8e34e1884447e6df64ac752f02))
* **into structure:** introduction is not displayed if content empty ([5cc98f3](https://gitlab.mim-libre.fr/alphabet/laboite/commit/5cc98f3cd311d8afeb49e9abf402427341e97edc))
* **lint:** remove button ([ce10291](https://gitlab.mim-libre.fr/alphabet/laboite/commit/ce102916a656785a6ba94024ba65ce2c78da7143))
* **lint:** remove handleresult in adminservicepage ([79ded6f](https://gitlab.mim-libre.fr/alphabet/laboite/commit/79ded6f7497aecefba132888b41214ad342caeb9))
* **login:** change mobile breakpoint to muis ([741ccf8](https://gitlab.mim-libre.fr/alphabet/laboite/commit/741ccf8eb76d5fe18639a4ce3cac78daa6b259ec))
* **minio check:** refactor permissions checks for minio ([b14e367](https://gitlab.mim-libre.fr/alphabet/laboite/commit/b14e367b3b6e8de5651eeb3a99df32afd996ba22))
* **minio check:** structure admin check updated ([0a1c40b](https://gitlab.mim-libre.fr/alphabet/laboite/commit/0a1c40b5e6c9e9c10f13617f915eaacf1364735f))
* **nclocator:** update nclocator field if empty or not exists ([31b40ed](https://gitlab.mim-libre.fr/alphabet/laboite/commit/31b40edf8d2d1286d7eba252af8e835e90853f5a))
* **nextcloud:** disable nextcloud group synchronization ([7a5fb40](https://gitlab.mim-libre.fr/alphabet/laboite/commit/7a5fb4048c52b73369933bd8a845ed6bd51d442a))
* **notifications:** reduce server calls, translate rate limiter error ([dba4693](https://gitlab.mim-libre.fr/alphabet/laboite/commit/dba469336bdb6e0d1f4559967f813f468dc48cbb))
* **notifs:** add notifs types enums ([598b223](https://gitlab.mim-libre.fr/alphabet/laboite/commit/598b2231b2c8b0cf9cdbb9c5f9b613a2bf0871a5))
* **offline ui:** offline services does not longer have react error ([5855b15](https://gitlab.mim-libre.fr/alphabet/laboite/commit/5855b158dfd8f3018066b5cc3e9665d8d6e696da))
* **package:** update package-lock.json ([1dc1017](https://gitlab.mim-libre.fr/alphabet/laboite/commit/1dc10171e1a338efcd83ed77a316dc4921b8fc1e))
* **plugins:** check if plugins hooks should run ([edf9aa2](https://gitlab.mim-libre.fr/alphabet/laboite/commit/edf9aa24198ce73f30f6578f2d838cdb84dfdd7e))
* **profile ui:** use bold text for attached structure name ([115df2d](https://gitlab.mim-libre.fr/alphabet/laboite/commit/115df2d83406cd1d318edd38fe0917d57b2293c8))
* **profile ui:** use clearer choose structure button ([bb83521](https://gitlab.mim-libre.fr/alphabet/laboite/commit/bb835217daca2e73285cd3d8fe861ef6b4ca5de9))
* **route:** profile selection route has correct format ([04b4c47](https://gitlab.mim-libre.fr/alphabet/laboite/commit/04b4c47eb34cdbc528231eab413338c041d90c6a))
* **service admin ui:** structure name show correctly on edit ([9e74d6d](https://gitlab.mim-libre.fr/alphabet/laboite/commit/9e74d6d4591c4e353eceb52af3b588dc11de6241))
* **service hook:** add a way to fetch structure ([ba7b2ca](https://gitlab.mim-libre.fr/alphabet/laboite/commit/ba7b2cabaea8d6b1b175f14b299149de952e0c4d))
* **service:** better error message on service edit ([2bcc745](https://gitlab.mim-libre.fr/alphabet/laboite/commit/2bcc7451f3a4bcc0562daa40f3838092a181be07))
* **services:** structure admin can delete its childs services ([a49c24f](https://gitlab.mim-libre.fr/alphabet/laboite/commit/a49c24fe4b572bb845087be1a511226a5a2e38f2))
* **structure ui:** reduce spinner occurence ([dff70ce](https://gitlab.mim-libre.fr/alphabet/laboite/commit/dff70cea78bf9f6ecab78aedfaa96c63c9334126))
* **structure update:** exclude concerned  structure from search query ([ae8fa58](https://gitlab.mim-libre.fr/alphabet/laboite/commit/ae8fa588bb28487407785ea666aada8fc4947549))
* **structure update:** use correct regex to search same name ([30bb865](https://gitlab.mim-libre.fr/alphabet/laboite/commit/30bb8657d4d0812462cef9c757ce29698c7eaa3e))
* **styles:** fix text field icon left padding ([16a5316](https://gitlab.mim-libre.fr/alphabet/laboite/commit/16a5316aab1a80edd74a199d0ceaa33034950a52))
* **test:** fix import ([4d82dfe](https://gitlab.mim-libre.fr/alphabet/laboite/commit/4d82dfe77c935cd0a8c46b241192e3af096cfa20))
* **ui:** add margin for add zone button and link to service ([21b76f2](https://gitlab.mim-libre.fr/alphabet/laboite/commit/21b76f274794393d6cdf904390c06d0fe77bb2c2))
* **ui:** add missing icon import for service table ([8d95ae9](https://gitlab.mim-libre.fr/alphabet/laboite/commit/8d95ae95deca7becf71bb2ad816218ef9e1c492f))
* **ui:** fix console error in contact form ([807edec](https://gitlab.mim-libre.fr/alphabet/laboite/commit/807edec6d01397b5202e2a108a41575f36073494))
* **ui:** fix console error in notifications page ([bbea02f](https://gitlab.mim-libre.fr/alphabet/laboite/commit/bbea02fc1bb48d4f0dadc26f6992ef5e464088e3))
* **ui:** fix console error on nextcloud checkbox ([8d0c8c6](https://gitlab.mim-libre.fr/alphabet/laboite/commit/8d0c8c64e795f0699222d63b5c064bccb8bf5fe8))
* **ui:** fix console errors in profil page ([b4edb3f](https://gitlab.mim-libre.fr/alphabet/laboite/commit/b4edb3fa4e6672eec17f419d48d6198c8e2d5f3f))
* **ui:** fix duplicate onclick event ([bb0884c](https://gitlab.mim-libre.fr/alphabet/laboite/commit/bb0884cd8ab83bdd5616a234c4409bb01ad294b1))
* **ui:** fix footer default height ([69132a1](https://gitlab.mim-libre.fr/alphabet/laboite/commit/69132a1939b5d4fe805b65bbc072f593850e2704))
* **ui:** tree view does wait for data reactivity to render childs ([0403f52](https://gitlab.mim-libre.fr/alphabet/laboite/commit/0403f525025c3cde99a4aff56cd16ff1b39c2260))
* **url:** modify link markup to include previous url ([88ff527](https://gitlab.mim-libre.fr/alphabet/laboite/commit/88ff527eea0cd099c44683a548296dead583382f))
* **widget:** fix connected widget & information tab ([86ce264](https://gitlab.mim-libre.fr/alphabet/laboite/commit/86ce264e21cd6b6d9ed869395cb806f917b7f7e3))
* **widget:** improve behavior on desktop ([421a8ce](https://gitlab.mim-libre.fr/alphabet/laboite/commit/421a8ce6f6bf580e4a022927b096e788c945362b))


### Code Refactoring

* **hook:** add optional dependency array to usePagination ([49f9476](https://gitlab.mim-libre.fr/alphabet/laboite/commit/49f9476f98571620577453f546e2b432d3a2dbce))
* **introduction:** use helper function to get correct introduction ([de37963](https://gitlab.mim-libre.fr/alphabet/laboite/commit/de37963c123c5d12661ec98a09744a56060979a7))
* **jscpd:** remove code duplicates ([c44d7c6](https://gitlab.mim-libre.fr/alphabet/laboite/commit/c44d7c65ca83ea24d0b893f4f30827e4d18f445a))
* **logo:** change rizomo logos ([3a26a80](https://gitlab.mim-libre.fr/alphabet/laboite/commit/3a26a808b585528fb142b5dd0b663e91b5221d20))
* **structure info:** add parameter to show or not structures info ([91dfb32](https://gitlab.mim-libre.fr/alphabet/laboite/commit/91dfb32d87d0344d25a23996de54974a6db9e3ba))
* **structures:** improve tree view selection ([a12a767](https://gitlab.mim-libre.fr/alphabet/laboite/commit/a12a76769a0ea1c81d63db9b92e94e1c60271297))


### Features

* **analytics:** add matomo ([40b92d8](https://gitlab.mim-libre.fr/alphabet/laboite/commit/40b92d87dd129ce888f216cbfb191e2bd01737ff))
* **auth:** add expiration session in settings ([b7b016e](https://gitlab.mim-libre.fr/alphabet/laboite/commit/b7b016e3b4c3d906cdab9fad8a8ad915af15e077))
* **contact:** add autofocus on connected mode ([eab99a8](https://gitlab.mim-libre.fr/alphabet/laboite/commit/eab99a8e330b7f17557315df17c2af5648e409ea))
* **contact:** add autofocus on text on connected mode ([18e1fe0](https://gitlab.mim-libre.fr/alphabet/laboite/commit/18e1fe0a76f006246dfe3a2a2c1b1a7edc3e28e7))
* **contact:** add contact form in connected mode ([99a696c](https://gitlab.mim-libre.fr/alphabet/laboite/commit/99a696c81f56eddf30112e968bbcf61847951723))
* **contact:** disable captcha for connected mode ([1eb7e2a](https://gitlab.mim-libre.fr/alphabet/laboite/commit/1eb7e2a7dfbe98c7c068ec00da372e8bf96bc4bb))
* **context:** add istablet breakpoint in the context ([c0bb2a7](https://gitlab.mim-libre.fr/alphabet/laboite/commit/c0bb2a7c35616895158cdacf410ea7275833d6f7))
* **env:** add two env variables for i18n languages ([8889e7d](https://gitlab.mim-libre.fr/alphabet/laboite/commit/8889e7d5ea7a89cdf5e995806c59bbef973f2b80))
* **help:** add help on offline page ([f1946f6](https://gitlab.mim-libre.fr/alphabet/laboite/commit/f1946f60eaf1bfafdc3bfaf9191b512781ae4963))
* **identity:** add logos, dynamic document titles ([1ea6245](https://gitlab.mim-libre.fr/alphabet/laboite/commit/1ea62459d00df9d1d64339971bfb8094bb385363))
* **introduction:** add app introduction in new information tab ([1fabfee](https://gitlab.mim-libre.fr/alphabet/laboite/commit/1fabfee5d93308f28d533e4e7b49a7663c28d3b4))
* **login:** move version number ([2f1006d](https://gitlab.mim-libre.fr/alphabet/laboite/commit/2f1006d09067169be783549811ae83c99658af64))
* **logo:** no logo feature ([927ee1b](https://gitlab.mim-libre.fr/alphabet/laboite/commit/927ee1b43af3502f48e8f929bcf97ae8259f72c6))
* **matomo:** add doc & fix no matomo mode ([290b450](https://gitlab.mim-libre.fr/alphabet/laboite/commit/290b45065abd3675b9fc62b0e10219df82aa7a18))
* **matomo:** add tracked events on signin page ([d757234](https://gitlab.mim-libre.fr/alphabet/laboite/commit/d757234c222a5596dbda6c880eefcd8bc7e40ee2))
* **notifs:** add notifications in tabs ([95a0c09](https://gitlab.mim-libre.fr/alphabet/laboite/commit/95a0c09ff075015e2d4a17815623677a554dc313))
* **profile:** disable structure selection if user is not active ([dc15bf5](https://gitlab.mim-libre.fr/alphabet/laboite/commit/dc15bf54939b9649b883b38ac739636a4eccf619))
* **profile:** redirect user to profile is setStructure is success ([57214ed](https://gitlab.mim-libre.fr/alphabet/laboite/commit/57214ed679a3061aab04555ca83951d490edf74c))
* **profile:** user can choose structure with a tree view ([430789b](https://gitlab.mim-libre.fr/alphabet/laboite/commit/430789b84d0025e57002920fa303a0e4ebce4960))
* **services structure:** struc admin can manage services by structure ([07ba587](https://gitlab.mim-libre.fr/alphabet/laboite/commit/07ba5870f60214a5d8e14e6facebf69d27b4ce05))
* **services:** user can see services from its structure and parents ([b0d7ce3](https://gitlab.mim-libre.fr/alphabet/laboite/commit/b0d7ce3113ef8295da76e4bf984207e3b65f1115))
* **structure ui:** app level admin can manage multi level structures ([7497405](https://gitlab.mim-libre.fr/alphabet/laboite/commit/7497405be60147313eeec627fb44c6761b32a948))
* **structure:** add a structure select component and related hook ([3f130fc](https://gitlab.mim-libre.fr/alphabet/laboite/commit/3f130fcb5861f6537564fc0a15ce56fe043af0d9))
* **structure:** add counter on structure's user list ([5a38d81](https://gitlab.mim-libre.fr/alphabet/laboite/commit/5a38d81c70816e3c3c4d56e43e728151ba6d59ac))
* **structure:** add current user structure to app context ([d96dc85](https://gitlab.mim-libre.fr/alphabet/laboite/commit/d96dc853946ef54168f04f8b027c1f0dedb2a65a))
* **structures:** make structures data shape multi level ([74b1f73](https://gitlab.mim-libre.fr/alphabet/laboite/commit/74b1f73db451e7f2180d75ce0ce996c7ad441e04))
* **structures:** make structures data shape multi level ([c703a2d](https://gitlab.mim-libre.fr/alphabet/laboite/commit/c703a2d28dae8cce9fcad21c9263ebf1b548a4af))
* **structures:** make structures data shape multi level ([37dec97](https://gitlab.mim-libre.fr/alphabet/laboite/commit/37dec976fa309836a5971275e99477908f04bdaa))
* **structures:** structure level admin user can manage sub structures ([2a6628e](https://gitlab.mim-libre.fr/alphabet/laboite/commit/2a6628ef3e8ef874cf8c81f5215671891fe58223))
* **structure:** structure admin can manage introduction texts ([05b817d](https://gitlab.mim-libre.fr/alphabet/laboite/commit/05b817d16732680e91579fefbb175cd3019a0e90))
* **structure:** user can read structures introduction in info tab ([aebe3af](https://gitlab.mim-libre.fr/alphabet/laboite/commit/aebe3af0c0cabfa673bcc2972dd5b890cab02048))
* **theme:** add eole theme for Laboite ([59f6881](https://gitlab.mim-libre.fr/alphabet/laboite/commit/59f68819a5be74c695567b14969ad118398e9e7a))
* **ui:** add a custom dialog component ([9ad850c](https://gitlab.mim-libre.fr/alphabet/laboite/commit/9ad850c02ec13c5788ac8f81b2a0b05289e93e2d))
* **ui:** add help title when it is a modal ([9cdee6f](https://gitlab.mim-libre.fr/alphabet/laboite/commit/9cdee6ffa72b3b11a248cfdae1c2eb5de315d80f))
* **ui:** change stylesheet source to local source for material icons ([b81c535](https://gitlab.mim-libre.fr/alphabet/laboite/commit/b81c535300c6edf8c962c628c9d4aaa8e2d77f9a))
* **ui:** detail and simple view for services have better icon ([0ed954b](https://gitlab.mim-libre.fr/alphabet/laboite/commit/0ed954b3b0ae9949a28a6490974af66ad5cf1a0e))
* **ui:** use icons for services display when is mobile ([4518b3f](https://gitlab.mim-libre.fr/alphabet/laboite/commit/4518b3fa620bc984c1ae4ba21ce8cdb0f47edf9e))
* **user profile:** user can choose structure with autocompleted select ([decedb9](https://gitlab.mim-libre.fr/alphabet/laboite/commit/decedb9f1195c0d2b47c02a659b1c1e189f5d42f))
* **users structure:** structure admin can manage users ([d38e174](https://gitlab.mim-libre.fr/alphabet/laboite/commit/d38e17423a738ff0e479990f9a93884c204e0433))
* **utils:** add helper to get current introduction by language ([b9a6db6](https://gitlab.mim-libre.fr/alphabet/laboite/commit/b9a6db65249ed084034b6a73ecfe0260c569da55))
* **widget:** remove border top left and top right ([d7e7baa](https://gitlab.mim-libre.fr/alphabet/laboite/commit/d7e7baa0b53ab0f40d0a1239f91ec5baeea2411e))


### Styles

* **admin:** fix back to personnal space visibility ([8547730](https://gitlab.mim-libre.fr/alphabet/laboite/commit/8547730eecea6da987dd56dd9367df53a5b58d58))
* **version:** move the version into the card ([e59c3aa](https://gitlab.mim-libre.fr/alphabet/laboite/commit/e59c3aa51a310cb64615adea86e64db359b3a013))
* **widget:** add menu on large widget screen ([716b8eb](https://gitlab.mim-libre.fr/alphabet/laboite/commit/716b8ebe397b8dd6ebb3129be63e5b6c9dbae469))
* **widget:** change logos ([4f5f7a7](https://gitlab.mim-libre.fr/alphabet/laboite/commit/4f5f7a7855f4d6eef8318a19a21ce24f1ec7a4da))

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

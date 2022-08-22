# Systeme de theme

## Introduction à Material UI ([MUI](https://mui.com/))

Material UI est une librairie React permettant d'implémenter des composants. L'avantage de **MUI** est de pouvoir unifier le visuel de l'application en utilisant les mêmes composant. Cette dernière suite les règles du [Matérial design](https://fr.wikipedia.org/wiki/Material_Design).
**MUI** à l'avantage de proposer une multitude de composants qui permettent d'obtenir un visuel cohérent et surtout d'être responsive.

## Thème MUI

**MUI** est une librairie qui propose une liste de composants personnalisable composant par composant mais le plus intéressant est le principe de thème.
Les thèmes permettent d'appliquer un ton cohérent dans toute l'application. Cela permet de personnalisé le visuel au plus proche des besoins du projet.
**MUI** offre la possibilité d'avoir un thème clair qui sera le thème par défaut et un thème sombre.

## Création d'un thème

Pour créer un nouveau thème, il faut aller dans le dossier `theme` qui est dans `app/imports/ui/themes`.

Une fois dans ce dossier le but est de créer un dossier avec le nom du nouveau thème.
Dans ce nouveau dossier un certains nombre de fichiers sont nécessaires :

- un dossier `components` qui contiendra les composants personnalisés
- un fichier `commons.js` qui contient les propriétés communes à tout le thème
- un fichier `customs.js` qui permets d'importer les composants personnalisé présent dans le dossier `components`
- un fichier `dark.js` qui représente la palette de couleur pour le thème en mode sombre
- un fichier `light.js` qui représente la palette de couleur pour le thème en mode clair qui est le mode par défaut

Une fois le dossier du nouveau thème créé, il faut le déclarer pour chaque mode (clair et sombre). Pour ce faire, il faut aller dans les fichiers `dark.js` et `light.js` présents à la racine du dossier `themes`. Dans ces fichiers, il faut importer le thème et le déclarer dans la constante.

## Personnalisation du thème

Le but premier d'un thème est de pouvoir changer toutes les couleurs de l'application sans toucher au design.

### Les imports

Pour cela rendez-vous dans le fichier `light.js` ( idem pour le fichier `dark.js` ) dans le dossier du nouveau thème.
Dans ce fichier il y a plusieurs éléments indispensable :

- Les imports suivants :
  - `{ computeCustoms } from '../utils'` qui est la méthode permettant d'appliquer la palette aux composants
  - `COMMONS from './commons'` qui contient les propriétés commune à tout le thème
  - `{ overrides, props } from './customs'` qui contient les composant 'overrides' et les propriétés spécifique définies sur un composant

### La palette

La palette de **MUI** permet de définir les différentes couleur qui seront utilisées dans l'application. Le but est de déclarer un constante `palette` qui est un objet contenant les propriétés suivantes :

- `type` qui définit le mode du thème. En règle générale 'light' ou 'dark'
- `primary` qui est la palette primaire de couleur. Elle possède elle aussi des propriétés :
  - `main` qui est la couleur par défaut utilisé par MUI si elle est définit
  - `light` qui est généralement une déclinaison de main mais plus clair
  - `dark` qui est généralement une déclinaison de main pour plus sombre
- `secondary` qui est la palette secondaire de couleur. Elle a les mêmes propriétés que la primary.

Ceci est la liste minimal pour ce qui concerne la définition des palettes de couleurs.

> Il est possible de définir d'autre propriétés dans la palette selon les besoins. Le but est de suivre le même schéma de définition. Dans certains cas on peut retrouver une propriété `terciary` ou `background` qui permet de définir une troisième couleurs principale à l'application et une couleur d'arrière plan.

### Export

Une fois toutes les couleurs voulues définies, il ne reste plus qu'à exporter le thème.
Le but est de définir une constante avec le nom du thème en majuscule qui est un objet avec les propriétés suivante :

- `...COMMUNS` qui reprend les propriétés communes à tout le thème
- `props: computeCustoms(palette, props)` qui applique la palette aux composants qui ont des propriétés particulières
- ` overrides: computeCustoms(palette, overrides)` qui applique la palette aux composants qui ont été ré-écrient
- `palette` qui permet d'avoir accès à la palette dans le reste de l'application

### Commons

Le fichier `commons.js` permet de définir les propriétés qui seront commune à tout le thème. Comme pour la [palette](#la-palette), il faut définir un objet sous forme de constante avec les propriétés suivantes:

- `signinBackground` permet de définir l'image de fond pour l'écran de connexion
- `logos` permet de définir les différents logos utilisés dans l'application
  - `SMALL_LOGO` est le logo au format mobile
  - `LONG_LOGO` est le logo classique sur PC
  - `SMALL_LOGO_MAINTENANCE` est le logo mobile quand le site est en maintenance
  - `LONG_LOGO_MAINTENANCE` est le logo PC quand le site est en maintenance
- `typography` permet les polices d'écriture du thème par balise (HTML)
  - `fontFamily` définit la police d'écriture par défaut
  - `h1`
    - `fontFamily` définit la police d'écriture pour les balises h1
  - Possible de personnalisé la police d'écriture pour chaque balise HTML

### Components

Le dossier `components` permets de définir des propriété spécifique à des composants. Pour ce faire, il suffit d'exporter les nouvelles propriétés comme suit :

```jsx
export const newComponentName = () => ({
  MuiProps: { prop: value },
});
```

## Utilisation du thème

Maintenant que le thème est créé, il est possible de le définir en temps que thème d'application.

### Thème d'application

Pour ce faire, rendez-vous dans le dossier `config` à la racine du projet puis dans le fichier `settings.development`. Ensuite dans la partie `public` il y a une propriété `theme`. Dans cette dernière il suffit de saisir le nom du nouveau thème.

## Conseils d'utilisation de MUI

Voici quelques conseils et avertissement concernant MUI.

### MakeStyles / useStyles

> Il faut éviter d'utiliser cette fonctionnalité. Il faut prioriser les style dans les composants comme vu dans la partie [Components](#Components)

Cette fonctionnalité s'utilise dans les fichiers composants .jsx ou .js. Pour ce faire il suffit de déclarer une constante comme suit :

```jsx
const useStyles = makeStyles(() => ({
  nomClasse: {
    prop: value,
    prop2: value,
    prop3: value,
  },
}));
```

Une fois cette constante déclarée, nous avons pour habitude d'utiliser la notation suivante pour utiliser les classes précédemment déclarées:

```jsx
const classes = useStyles();
```

Il suffit ensuite d'utiliser les classes déclarées dans une balise HTML dans l'attribut `className` avec la notation suivante :

```jsx
className={classes.nomClasse}
```

### Overrides dynamique

> Comme pour la partie [MakeStyles/UseStyles](#makestyles--usestyles), il est déconseillé d'utiliser cette méthode. La meilleure façon reste d'overrides dans le [thème](#components).

Il est toujours possible de ré-écrire les propriétés d'un composant MUI. Il est possible de le faire via le thème mais aussi directement dans la balise HTML du composant MUI avec la notation suivante :

Pour l'exemple, on va prendre un Input MUI.

```jsx
  sx={{ '& .MuiInput-classMuiConcernee': { propMui: value, } }}
```

Il est possible de trouver la classe MUI concernée via la console du navigateur. Si jamais il est impossible de la trouvée de cette manière il est possible de se référer à la doc [MUI](https://mui.com/)

### Breakpoints

Les breakpoints servent à définir des médias queries qui seront utilisées dans le thème. En effet, ces derniers se définissent dans le fichier `light.js` ou `dark.js`. Nous les avons définis ainsi dans les projets :

```jsx
breakpoints: {
  values: {
    xs: 600, // down for mobile version / up for tablets
    sm: 768, // up for landscape tablet/tablet
    md: 1000, // up for small laptops/desktops
    lg: 1200, // up for laptops and desktops
    xl: 1600, // up for extra large desktops
  },
},
```

Pour plus d'informations sur les breakpoints, vous pouvez vous référer à la [documentation MUI](https://mui.com/customization/breakpoints/#default-breakpoints).

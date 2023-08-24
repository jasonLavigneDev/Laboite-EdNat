# Feature 1 : Rediriger l'utilisateur en fonction de si il a lu les dernieres info ou non

> A la connexion de l'utilisateur , on verifie si il a lu les derniers messages ou non .
> Si il les a lus , on le redirige vers sa page perso .
> Sinon , on enregistre le dernier message lu ( en bdd ) et on ne fait pas de redirection .

## Changement effectué :

Page par defaut apres connexion , INFORMATIONS ( a la place de MON ESPACE )
Ajout du champ `'lastGlobalInfoReadId'` sur la table USER .
Règle associée : defaultValue a `''`
Ajout du champ `'id'` sur la table APPSETTINGS a la clé globalInfo
Regle associée : autoValue sur le champ `id` dans la table APPSETTINGS
=> a chaque update , un nouvel ID est généré

## Fonctionnement :

> A la connexion :
> on recupere uniquement l'objet globalInfo a la clé language correspondant au language du USER
> on verifie le dernier message lu par le USER en regardant l'ID contenu dans le champ lastGlobalInfoReadId

1. Si User a le champ `isActive` a `false` OU Si User a le champ `structure` a `false`

   1. Alors on ne redirige pas et on ne met pas a jour le champ `lastGlobalInfoReadId` du USER
   2. Car l'interface ne lui presente pas les informations mais un message du type " en attente de validation" ou "veuillez choisir une structure " .

2. Si USER a le champ `lastGlobalInfoReadId` a `''` ou l 'ID contenu dans le champ `lastGlobalInfoReadId` est différent du champ `id` de globalInfo

   1. Alors on ne redirige pas et on met a jour le champ `lastGlobalInfoReadId` avec l'ID de globalInfo

3. Si USER a le champ `lastGlobalInfoReadId` strcitement egal au champ `id` de globalInfo
   1. Alors on le redirige sur la page MON ESPACE

# Feature 2 : Ajouter une date de validité sur les messages pour gerer l'affichage

## DISCUSSION :

### Le fonctionnement actuel est le suivant :

> On a 1 array globalInfo qui contient 2 objets ( un objet pour les messages en anglais et un autre pour le francais )
> Lorsqu'un admin met a jour le message ( fr ou en ) on remplace l'ancien objet par le nouveau
> On a donc pas de listes de messages

#### TRAVAIL:

Pour pouvoir ajouter la notion de validité sur les messages il faut modifier la structure en BDD
Si la structure change il faut revoir l'UI de l'onglet Informations generales contenu dans le menu reglages administrateur du panneau d'amin
Il faudrait avoir un affichage ressemblant a une liste de messages avec un input associé pour saisir la validité (validity) et un bouton de supression du message

#### PROPOSITION: ( A REVOIR AVEC LA SECTION QUESTION)

> Un message est un objet avec `createdAt`, `updatedAt`, `content`, `expireAt` > `createdAt` est set en autovalue une seule fois a la creation
> `updatedAt` est set en autovalue et est mis a jour a chaque update
> `expireAt` est set a `null` .

1. Un admin saisi un nouveau message
   Il ne reseigne pas de validity
   on a l'objet message , avec `createdAt`, `updatedAt`, `content` et `expireAt` a `null`
2. Il renseigne une validity
   on a l'objet message avec `createdAt`, `updatedAt`, `content` et expireAT a `la date de creation + les jours de validity (type date)`

3. Un admin modifie un message existant => on met a jour `content` et `updatedAt` (et `expireAT` si changer)

4. Un admin supprime un message => on le retire de la liste

**Connexion du USER :**

> on recupere uniquement le tableau globalInfo a la clé language correspondant au language du USER
> on verifie le dernier message lu par le USER en regardant l'ID contenu dans le champ lastGlobalInfoReadId

1. Si User a le champ `isActive` a false OU Si User a le champ `structure` a false

   1. Alors on ne redirige pas et on ne met pas a jour le champ `lastGlobalInfoReadId` du USER
   2. Car l'interface ne lui presente pas les informations mais un message du type " en attente de validation" ou "veuillez choisir une structure " .

2. Si USER a le champ `lastGlobalInfoReadId` a `''` ou l 'ID contenu dans le `champ lastGlobalInfoReadId` est différent de l'`id` du plus recent message

   1. Alors on ne redirige pas et on met a jour le champ `lastGlobalInfoReadId` avec l'`id` du plus recent message

3. Si USER a le champ `lastGlobalInfoReadId` strcitement egal au champ `id` du plus recent message
   1. Alors on le redirige sur la page MON ESPACE

**Affichage :**
liste des messages du plus recent au plus ancien (en se basant sur `updatedAt`) qui ont un `expireAt` a `null` ou dont `expireAt` n'est pas encore passé

#### QUESTION :

Si un message precedemment lu par un USER est modifié, est il considérer comme nouveau message ?

Pour les 2 features , on pourrait stocker la date de lecture des messages de l'utilisateur a la place de l 'id du message
Ce qui faciliterait la comparaison entre le dernier message lu et les nouveaux messages .
Par exemple ca evite de definir si on verifie le champ createdAt ou UpdatedAt .

A la connexion du USER , on verifie qu'aucun message n'a une date superieure a la date stocké dans lastReadMessage .
SI vrai => on redirige sur son espace perso . TERMINE
SI faux => on trie les messages en retirant tous les messages donc expireAT est dépassé , on trie les messages restants par ordre de updatedAT , on affiche les 5 premiers ( 5 étant la valeur a definir)

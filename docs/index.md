# Instantiation

A new league table can be created via

```javascript
new LeagueTable(<Object>);
```
where the input object must have the following compulsory key.

## Key `teams`

|                        |                                                                |
|------------------------|----------------------------------------------------------------|
| **Description**        | The list of the teams that are taking part in the league.      |
| **Expected value**     | An array of unique identifiers of any type, or an array of objects with keys `"team"` and `"flags"` where the values of the first keys are unique identifiers of any type, while the values of the second key are arrays of integers all of which have the same length that is equal to the length of `sorting.flags`. |
| **Compulsory**         | **Yes.**                                                       |

It is best if `teams` is an array of strings comprising of the (unique) names of the teams involved, but any other type of unique identifier works; repeated entries **will throw an error** of type

```
Team identifiers must be unique.
```
Notice that explicitly submitting [`sorting.flags`](#optional-subkey-flags) as a nonempty array will require `teams` to be an array of objects as opposed to an array of strings; this includes circumstances in which `sorting` is decided via a keyword (e.g. `"FIFA World Cup"`) that is defined in the code to have a nonempty `sorting.flags` array (see [`sorting`](#optional-key-sorting) down below for a list of the default kewords, as well as the flags associated with them).

Additionally, the starting object may have any of the following optional keys.

## Optional key `format`

|                        |                                                                    |
|------------------------|--------------------------------------------------------------------|
| **Description**        | Whether the league is played as round-robin or home-and-away.      |
| **Expected value**     | Either the string `"round-robin"` or the string `"home-and-away"`. |
| **Compulsory**         | No.                                                                |
| **Default**            | `"round-robin"`                                                    |

A `"round-robin"` league is one where the teams face each other only once; a `"home-and-away"` league is one in which teams face each other exactly twice (once at home and once away).

## Optional key `points`

|                        |                                                                    |
|------------------------|--------------------------------------------------------------------|
| **Description**        | How to calculate the points that teams get after every match.      |
| **Expected value**     | Either the string `"standard"` or the string `"old"`, or alternatively any function that accepts exactly three arguments (number of games won, number of games drawn, number of games lost). |
| **Compulsory**         | No.                                                                |
| **Default**            | `"standard"`                                                       |

The `"standard"` points system corresponds to the current one used in football that awards three points for a win, one for a draw and none for a loss, whereas the `"old"` one is the one used by FIFA before 1994 that awarded only two points for a win, one for a draw and none for a loss.

A function can also be passed as a value for `points`

```javascript
const table = new LeagueTable({
    // ...
    points: (w, d, l) => 3*w
});
```
where for example wins would still be worth three points here, but draws would not contribute anything.

## Optional key `names`

|                        |                                                                    |
|------------------------|--------------------------------------------------------------------|
| **Description**        | Specifies what terms are to be used when requiring a description of the ties. |
| **Expected value**     | An object with either of the keys `points`, `diff`, `for`, `won`, `away_for`, `away_won`, `lots`, `alphabetical`, `h2h`, `overall`, each of which accepting a string as a value. |
| **Compulsory**         | No.                                                                |
| **Default**            | *See below*                                                        |

If any of the keys in `names` are not specified, or if the whole key is absent, each unspecified term will default respectively to `"points"`, `"goal difference"`, `"number of goals scored"`, `"number of games won"`, `"number of goals scored away from home"`, `"number of games won away from home"`, `"drawing of random lots"`, `"the alphabetical order of their names"`, `"head-to-head"` and `"overall"`.

For example, writing `names: { points: "the amount of points earned", lots: "at random" }` will have this effect when `.ties()` is called

```javascript
messages: [
    'Italy and Spain are tied on the amount of points earned (4).',
    'Italy and Spain are sorted at random.'
]
```

## Optional key `sorting`

|                        |                                                                    |
|------------------------|--------------------------------------------------------------------|
| **Description**        | How the teams are to be sorted if they are even on points.         |
| **Expected value**     | Either a default string keyword or an object (*See below*)         |
| **Compulsory**         | No.                                                                |
| **Default**            | *See below*                                                        |

When wanting to initialize the `sorting` key to a preset corresponding to a real-world tournament, then the above accepts either the string `"FIFA World Cup"` (accepts a single [flag](#optional-subkey-flags): fair play points), the string `"UEFA Euro"` (accepts two flags: disciplinary points and European Qualifiers overall ranking), the string `"pre-2021 UEFA Champions League"` or the string `"2021-2024 UEFA Champions League"` (each accepting two flags: disciplinary points and UEFA club coefficient); leaving out this key during object creation will default it to the object

```js
{
    criteria: ["diff", "for", "won"],
    h2h: {
        when: "before",
        span: "all"
    },
    additional: [],
    shootout: false,
    flags: [],
    final: "lots"
}
```
In all other circumstances, `sorting` will accept an object with the following compulsory keys (see also the [**Tiebreakers and sorting options**](https://github.com/SuzuSuzu-HaruHaru/league-standings?tab=readme-ov-file#tiebreakers-and-sorting-options) section from the `README.md` file over on Github for the practical explanation of the phenomena some of these keys model).

### Subkey `criteria`

|                        |                                                                    |
|------------------------|--------------------------------------------------------------------|
| **Description**        | The list of criteria that will be applied one after the other to sort teams that are equal on points. |
| **Expected value**     | An array containing any of the strings `"diff"`, `"for"`, `"won"`, `"away_for"`, `"away_won"`. |
| **Compulsory**         | **Yes** if `sorting` is specified explicitly as an object.         |

The criteria correspond respectively to the goal difference, the number of goals scored, the number of games won, the number of goals scored away from home and the number of games won away from home.

### Subkey `h2h`

|                        |                                                                    |
|------------------------|--------------------------------------------------------------------|
| **Description**        | Handles the head-to-head section of the sorting procedure.         |
| **Expected value**     | An object with keys `when` (accepting only either the string `"before"` or the string `"after"`) and `span` (accepting only either the string `"all"` the string `"single"`, or the string `"none"`). |
| **Compulsory**         | **Yes** if `sorting` is specified explicitly as an object.         |

See [**Head-to-head v. overall**](https://github.com/SuzuSuzu-HaruHaru/league-standings?tab=readme-ov-file#head-to-head-v-overall) and [**Head-to-head reapplication**](https://github.com/SuzuSuzu-HaruHaru/league-standings?tab=readme-ov-file#head-to-head-reapplication) on Github for a pratical explanation of the real-world effects that these parameters have.

### Subkey `final`

|                        |                                                                    |
|------------------------|--------------------------------------------------------------------|
| **Description**        | How to sort the teams after every other criterion has proven inconclusive. |
| **Expected value**     | Either the string `"lots"` or the string `"alphabetical"`.         |
| **Compulsory**         | **Yes** if `sorting` is specified explicitly as an object.         |

The value `"lots"` indicates that the last criterion of all has to be a drawing of random lots, whereas `"alphabetical"` indicates that it should simply be the alphabetical order of their names.

Additionally, the `sorting` key object may have any of the following optional subkeys.

### Optional subkey `additional`

|                        |                                                                    |
|------------------------|--------------------------------------------------------------------|
| **Description**        | A list of criteria that has to be applied after both the overall and head-to-head ones have proven inconclusive. |
| **Expected value**     | Same as with `criteria`.                                           |
| **Compulsory**         | No.                                                                |
| **Default**            | [] *(the empty array)*                                             |

See also [**`additional`**](https://github.com/SuzuSuzu-HaruHaru/league-standings?tab=readme-ov-file#additional) on Github.

### Optional subkey `shootout`

|                        |                                                                    |
|------------------------|--------------------------------------------------------------------|
| **Description**        | Whether the league uses the rule according to which, if the league is round-robin *and* exactly two teams are tied on points *and* they meet on the last matchday *and* their game is drawn, then their position in the league is decided via a penalty shoot-out that takes place at the end of that game. |
| **Expected value**     | A boolean.                                                         |
| **Compulsory**         | No.                                                                |
| **Default**            | `false`                                                            |

See also [**`shootout`**](https://github.com/SuzuSuzu-HaruHaru/league-standings?tab=readme-ov-file#shootout) on Github.

### Optional subkey `flags`

|                        |                                                                    |
|------------------------|--------------------------------------------------------------------|
| **Description**        | Lets the user create *flags*, i.e. objects with a name and an ordering rule, that can be used to sort teams when all else fails right before sorting alphabetically or drawing lots. |
| **Expected value**     | An array of obects with keys `name` (accepting a string) and `order` (accepting only either the string `"asc"` or the string `"desc"`).                                                   |
| **Compulsory**         | No.                                                                |
| **Default**            | [] *(the empty array)*                                             |

See also [**`flags`**](https://github.com/SuzuSuzu-HaruHaru/league-standings?tab=readme-ov-file#flags) on Github.
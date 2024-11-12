# Object creation

A new league table can be created via

```javascript
new LeagueTable(<Object>);
```
where the object must have the following compulsory key.

## Key `teams`

|                        |                                                                |
|------------------------|----------------------------------------------------------------|
| **Description**        | The list of the teams that are taking part in the league.      |
| **Expected value**     | An array of unique identifiers of any type.                    |
| **Compulsory**         | **Yes.**                                                       |

It is best if `teams` is an array of strings comprising of the (unique) names of the teams involved, but any other type of unique identifier works; repeated entries **will throw an error** of type:

```javascript
`Team identifiers must be unique.`
```
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
| **Expected value**     | Either the string `"standard"` or the string `"old"`, or alternatively any function that accepts exactly three arguments. |
| **Compulsory**         | No.                                                                |
| **Default**            | `"standard"`                                                       |

The `"standard"` points system corresponds to the current one used in football that awards three points for a win, one for a draw and none for a loss, whereas the `"old"` one is the one used by FIFA before 1994 that awarded only two points for a win, one for a draw and none for a loss.

A function can also be passed as a value for `points`

```javascript
const table = new LeagueTable({
    teams: teams,
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

For example, `names: { points: "the amount of points earned", lots: "at random" }` will have this effect when `.ties()` is called

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

When wanting to initialize the `sorting` key to a preset corresponding to a real-world tournament, then the above accepts either the string `"FIFA World Cup"`, the string `"UEFA Euro"`, the string `"pre-2021 UEFA Champions League"` or the string `"2021-2024 UEFA Champions League"`; leaving out this key during object creation will default it to the object

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

### Subkey `h2h`

|                        |                                                                    |
|------------------------|--------------------------------------------------------------------|
| **Description**        | Handles the head-to-head section of the sorting procedure.         |
| **Expected value**     | An object with keys `when` (accepting only either the string `"before"` or the string `"after"`) and `span` (accepting only either the string `"all"` or the string `"single"`). |
| **Compulsory**         | **Yes** if `sorting` is specified explicitly as an object.         |

### Subkey `final`

|                        |                                                                    |
|------------------------|--------------------------------------------------------------------|
| **Description**        | How to sort the teams after every other criterion has proven inconclusive. |
| **Expected value**     | Either the string `"lots"` or the string `"alphabetical"`.         |
| **Compulsory**         | **Yes** if `sorting` is specified explicitly as an object.         |

Additionally, the sorting key object may have any of the following optional keys.

### Optional subkey `additional`

|                        |                                                                    |
|------------------------|--------------------------------------------------------------------|
| **Description**        | A list of criteria that has to be applied after both the overall and head-to-head ones have proven inconclusive. |
| **Expected value**     | Same as with `criteria`.                                           |
| **Compulsory**         | No.                                                                |
| **Default**            | [] *(the empty array)*                                             |

### Optional subkey `shootout`

|                        |                                                                    |
|------------------------|--------------------------------------------------------------------|
| **Description**        | Whether the league uses the rule according to which, if the league is round-robin *and* exactly two teams are tied on points *and* they meet on the last matchday *and* their game is drawn, then their position in the league is decided via a penalty shoot-out that takes place at the end of that game. |
| **Expected value**     | A boolean.                                                         |
| **Compulsory**         | No.                                                                |
| **Default**            | `false`                                                            |

### Optional subkey `flags`

|                        |                                                                    |
|------------------------|--------------------------------------------------------------------|
| **Description**        | Lets the user create *flags*, i.e. objects with a name and an ordering rule, that can be used to sort teams when all else fails right before sorting alphabetically or drawing lots. |
| **Expected value**     | An array of obects with keys `name` (accepting a string) and `order` (accepting only either the string `"asc"` or the string `"desc"`).                                                   |
| **Compulsory**         | No.                                                                |
| **Default**            | [] *(the empty array)*                                             |
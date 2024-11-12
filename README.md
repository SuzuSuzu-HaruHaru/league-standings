# league-standings

As a big fan of football (soccer), I can confidently say that there is nothing easier—***and*** nothing harder—than putting teams in a table. It is *easy*, in that the logic is apparently simple enough: track the results, compute the points, sort by points; if there are any ties, apply tiebreakers. Little nuances aside, that would be the end of the story. But, as they say, the devil is in the details.

The away goals rule is a famous one that made the news back in 2021, when UEFA did away with it; but is it *really* gone from the list of tiebreakers? or again, [Group F at the 2022-23 UEFA Europa League](https://en.wikipedia.org/wiki/2022%E2%80%9323_UEFA_Europa_League_group_stage) saw all teams finish their group with eight points each: how were these ties resolved? and who can say what happens at the Euros should two teams be equal on points, goal difference and goals scored, *and* they meet on the last matchday *and* their game ends in a draw? As cliché as it may sound, the answer might not be what you expect.

This `league-standing` package **offers complete flexibility in choosing all of these details:** from the quantity of tiebreakers to their order; to whether head-to-head comparisons should be applied before or after the overall ones; to all the little oddities that I alluded to in the previous paragraph, and much more.

## Table of Contents

1. [Installation](#installation)
2. [Quick start](#quick-start)
3. [Tiebreakers and sorting options](#tiebreakers-and-sorting-options)
4. [Documentation](#documentation)
5. [License](#license)

## Installation

Just run this on any terminal within your project folder

```bash
$ npm install league-standings
```

## Quick start

```javascript
import { LeagueTable } from 'league-standings';

const matches = [
    [1, 1, "AC Milan", "Juventus", 1, 2], // match id, matchday, team A, team B, goals A, goals B
    [2, 1, "Juventus", "Inter Milan", 2, 3],
    [3, 1, "Inter Milan", "AC Milan", 1, 2],
];

const table = new LeagueTable({
    teams: ["Juventus", "AC Milan", "Inter Milan"],
    sorting: {
        criteria: ["diff", "for", "away_for"],
        h2h: { when: "before", span: "all" },
        final: "lots"
    }
});
table.addMatches(matches);

console.table(table.standings());
console.log(table.ties());
```

## Tiebreakers and sorting options

As we mentioned above, the core of this package is how it handles the toughest part of the sorting process: that is, the resolution of ties. All control over this element happens via the `sorting` key in the starting object. As different competitions employ different ways of breaking ties, the simplest value that can be given to this key is a default keyword identifying a competition, which loads a replica of the rules that are applied there; for example, writing

```javascript
const teams = ["San Marino", "Italy", "Spain", "France"];
const table = new LeagueTable({
    teams: teams,
    sorting: "FIFA World Cup"
});
```
means that any ties between teams that finished level on points will be resolved using the standard procedure employed by FIFA during the FIFA World Cup group stage and qualification rounds. The full list of such keywords, as well as which list of tiebreaker each competition exactly employs, is available in the [documentation on github.io](#documentation).

In its most general form, `sorting` will accept an object with keys

```javascript
const teams = ["San Marino", "Italy", "Spain", "France"];
const table = new LeagueTable({
    teams: teams,
    sorting: {
        criteria: ["diff", "for"],
        h2h: { when: "before", span: "all" },
        additional: ["away_for"],
        shootout: false,
        flags: [ { name: "disciplinary points", order: "asc" } ],
        final: "lots"
    }
});
```
where only `criteria`, `h2h` and `final` are compulsory whenever `sorting` is given explicitly as an object like this.

The first of these is, in fact, the list of criteria that will be followed under normal circumstances: here `"diff"` and `"for"` stand for goal difference and number of goals scored respectively, meaning these tiebreakers will be applied one after another to break a tie whenever two or more teams end up with the same amount of points. The `final` subkey establishes a method for sorting teams for good should any of the previous ones prove inconclusive (in this case, `"lots"` stands for a drawing of random lots), while the `h2h` subkey deserves a more careful explanation.

### Head-to-head v. overall

As you may know, football competitions roughly divide in two categories when it comes to sorting methods: those like FIFA, where any tie in points is resolved by looking up tiebreakers (e.g. goal difference) in the *full* table, as it results from all the matches played by all the teams in the league/group; and those like UEFA, where if two or more teams are tied then we first have to compute a sub-table from the matches that were played only between the teams concerned in the tie, and it is in *this* sub-table that we look up any tiebreakers to decide the final standings.

An example will make this difference clear. Take [Group E at the UEFA Euro 2016](https://en.wikipedia.org/wiki/UEFA_Euro_2016), where the final table ended up looking like this

| Position | Team       | Won | Drawn | Lost | GF        | GA            | GD               | Points |
|----------|------------|:---:|:-----:|:----:|:---------:|:-------------:|:----------------:|:------:|
| 1        | Italy      | 2   | 0     | 1    | 3         | 1             | +2               | **6**  |
| 2        | Belgium    | 2   | 0     | 1    | 4         | 2             | +2               | **6**  |
| 3        | Republic of Ireland | 1 | 1 | 1 | 2         | 4             | -2               | **4**  |
| 4        | Sweden     | 0   | 1     | 2    | 1         | 3             | -2               | **1**  |

Both FIFA and UEFA agree that the next tiebreaker after points should be goal difference, and the one after that to be the number of goals scored; this is relevant since Italy and Belgium are tied on points at the top of the group. Now, had this been a FIFA tournament, we would have seen that Italy and Belgium are also tied on goal difference (Italy 2, Begium 2), at which point the tie would be broken in favor of Belgium by looking at how many goals the two teams scored across all matches (Belgium 4, Italy 3).

But UEFA uses the head-to-head method *first*, meaning that any tiebreakers are to be applied only to the matches between the teams concerned in the tie: which in this case was just one match, that Italy had won 2-0 in the very first matchday of the group stage; Italy therefore ranks first on account of head-to-head points—three to zero, due to Italy winning and Belgium losing.

**Whether the tournament is FIFA-style or UEFA-style is decided by the `sorting.h2h.when` key,** which can take the string value `"before"` to signify that head-to-head checks are to come first (like UEFA does) or the string value `"after"` to indicate that we must look at the whole table first (the so-called *overall* check, like FIFA does). Notice that the names of these values suggest that the two methods are not mutually exclusive, and in fact both happen in all cases: FIFA will switch to head-to-head when overall comparisons are iconclusive, and likewise UEFA switches to overall when head-to-head checks do not provide an answer. What changes is merely which type of check comes first.

### Head-to-head reapplication

To explan the next subkey, `sorting.h2h.span`, we will look instead at the famous [Group E at the UEFA Euro 2024](https://en.wikipedia.org/wiki/UEFA_Euro_2024) where every single team finished their group with 4 points

| Position | Team       | Won | Drawn | Lost | GF        | GA            | GD               | Points |
|----------|------------|:---:|:-----:|:----:|:---------:|:-------------:|:----------------:|:------:|
| 1        | Romania    | 1   | 1     | 1    | 4         | 3             | +1               | **4**  |
| 2        | Belgium    | 1   | 1     | 1    | 2         | 1             | +1               | **4**  |
| 3        | Slovakia   | 1   | 1     | 1    | 3         | 3             | 0                | **4**  |
| 4        | Ukraine    | 1   | 1     | 1    | 2         | 4             | -2               | **4**  |

You must know that one peculiar thing about UEFA's tiebreaker regulations is that it contains a special provision: whenever more than two teams are tied on points and head-to-head criteria are applied between them, and these manage to separate only some of them while leaving the rest still tied, then the head-to-head criteria are to be reapplied from the beginning *only between the teams that are still tied.*

However, the way I just worded it might leave some ambiguity. If we try it on the above example, where all teams are equal on points (and so the head-to-head sub-table ends up coinciding with the whole table anyway), we see that goal difference manages to separate Slovakia and Ukraine from the rest, leaving them at the bottom with 0 and -2 respectively; thus, given what we just said, one might expect that, in order to resolve the still-remaining tie between Romania and Belgium, on would reapply the head-to-head criteria from the beginning to the matches that concern only these two teams—which in this case was just one single match that Belgium won 2-0 in the second matchday. It looks like Belgium should have come first.

But here is the catch: according to official European Championship regulations, once certain teams separate from others in a head-to-head comparison, **the tiebreaking will not reset until they have run out.** Only when the list of tiebreakers is exhausted, and if some teams still remain tied, are head-to-head results recalculated based solely on the matches played among the still-tied teams. In this case, the list of tiebreakers is the number of points, the goal difference and the number of goals scored: after Slovakia and Ukraine are sorted on goal difference, the head-to-head procedure will not reset until at least the number of goals scored is examined—and this is what ultimately ends up putting Romania (Romania 4, Belgium 2).

**Whether the full list of criteria is expected to run out before resetting the head-to-head procedure is decided by the `sorting.h2h.span` key,** which can take the string value `"all"` to signify the style that we have just seen (the one where we must wait until all criteria are applied before rewriting any head-to-head sub-tables) or the string value `"single"` to mean the opposite, i.e. the case when head-to-head restarts from the beginning every single time some teams separate from the rest (the same line of reasoning that, in our fictional example, had made Belgium the winner of the group).

Notice, however, how some competitions do not have this provision at all: the FIFA World Cup is one prime example, where head-to-head criteria apply after the overall one but there is no requirement to restart them at any point should they only help to separate some teams, but not others. This behavior can be replicated via the third and last accepted value, `"none"`.

### Optional sorting keys

In addition to the subkeys seen above, that are required whenever the `sorting` key is stated explicitly as an object, there are some more that may or may not be provided when initializing the object.

#### `additional`

The first of these is the `additional` key, which behaves like `criteria` in that it also accepts an array of strings, each symbolizing a different tiebreaker; as the name suggests, these are *additional* criteria because they escape the head-to-head run: any tiebreaker in `criteria` will, depending on the circumstance, be applied either in an overall fashion or in a head-to-head check—whichever comes first depends on `sorting.h2h.when`, but in principle they can do both. **However, an additional criteria is one that comes *after* this entire procedure,** and is always checked in an overall fashion only.

One such example comes from the regulations of the UEFA Champions League between years 2021 and 2024 (e.g. the [Group stage at the 2023-24 UEFA Champions League](https://en.wikipedia.org/wiki/2023%E2%80%9324_UEFA_Champions_League_group_stage)), where you can see that goal difference and number of goals scored count as *regular* criteria, in that they are first applied in head-to-head fashion and, should the teams still be tied, they are applied in an overall style; this is what is normally modeled by `sorting.h2h.when = "before"`. However, you can see that the list does not end there: the tiebreakers go on with the number of goals scored away from home, the number of wins and the number of wins away from home, all of which are applied in an overall style (*in all group matches* being the keyword here on Wikipedia). This makes them *special* criteria that only ever exist as final overall comparisons, and this is why, within the code of the package, this particular format (callable via `sorting: "2021-2024 UEFA Champions League"`) exists as

```javascript
sorting: {
    criteria: ["diff", "for"],
    h2h: { when: "before", span: "all" },
    additional: ["away_for", "won", "away_won"],
    // ...more options
}
```

#### `shootout`

Next up is `shootout`, which models a very peculiar rule that exists primarily in the UEFA Euros, but also in some other confederation-level competitions (e.g. the AFC Asian Cup). It is a rule stating that, if two teams are completely equal on all criteria up to right after the head-to-head/overall checks, and they happen to meet on the last matchday of the group and their encounter ends in a draw, then their position in the table is decided via a penalty shoot-out that takes place right there and then, just after the final whistle of that last match.

It accepts the boolean values `true` or `false` depending on whether this special rule applies or not; we will see later how to interact with it, especially when it comes to submitting the results of the penalty shoot-out and what happens before and after this is done.ù

#### `flags`

The last of these is `flags`, which allows the user to set *any* criteria they want right before the final step in the entire process (which is always the value of the `final` key; see the [documentation on github.io](#documentation) for its allowed values). It is an array of objects (each representing one such custom-made criterion) with keys `name`, being the name of the criterion, and `order`, accepting the string value `"desc"` to indicate that the criterion works like the standard ones, and so a team is ranked *above* the other if the value of the criterion is *higher* (like with points) or the string value `"asc"` to indicate the opposite (one such example would be the amount of yellow and red cards collected, where a team is ranked *above* the other if their disciplinary count is *lower*).

When such flags are setted, the value of the `teams` key should not be a simple array of strings consisting of the identifiers of the teams, but rather an array of objects with keys `team` which, as before, holds the string-valued unique identifier, and `flags`, which is an array of integer that expresses the values of each flag associated with that team, in the same order as the flags have been defined in `sorting.flags`.

To make it clear, let us look at how the European Championship (callable via `sorting: "UEFA Euro"`) is defined within the code. This is

```javascript
sorting: {
    // ...more options
    flags: [{
        name: "disciplinary points",
        order: "asc"
    }, {
        name: "European Qualifiers overall ranking",
        order: "asc"
    }],
    // ...more options
}
```
where `"disciplinary points"` and `"European Qualifiers overall ranking"` are the last checks that are done before proceeding to `final`; this means that teams would have to be initialized as

```javascript
teams: [{ team: "Team A", flags: [0, 15] }, { team: "Team B", flags: [0, 21] }]
```
where the first value in each `flags` array represents the disciplinary points (which are initially zero for all teams, as no cards have been issued yet), and the second value represents the European Qualifiers overall ranking of the teams. Clearly the latter of the two is immutable, while the first will definitely change as the group unfolds and the cards start piling up. The `updateFlags(`*team*`,` *flag*`,` *value*`)` method exists for this purpose, and you should call it whenever you want to update a flag before calling the standings.

```javascript
table.updateFlags("Team A", "disciplinary points", 4);
table.standings(); // The new flag will now be taken into account, if needed.
```
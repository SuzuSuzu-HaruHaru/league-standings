# league-standings

As a big fan of football (soccer), I can confidently say that there is nothing easier—***and*** nothing harder—than putting teams in a table. It is *easy*, in that the logic is apparently simple enough: track the results, compute the points, sort by points; if there are any ties, apply tiebreakers. Little nuances aside, that would be the end of the story. But, as they say, the devil is in the details.

The away goals rule is a famous one that made the news back in 2021, when UEFA did away with it; but is it *really* gone from the list of tiebreakers? or again, [Group F at the 2022-23 UEFA Europa League](https://en.wikipedia.org/wiki/2022%E2%80%9323_UEFA_Europa_League_group_stage) saw all teams finish their group with eight points each: how were these ties resolved? and who can say what happens at the Euros should two teams be equal on points, goal difference and goals scored, *and* they meet on the last matchday *and* their game ends in a draw? As cliché as it may sound, the answer might not be what you expect.

This `league-standings` package **offers complete flexibility in choosing all of these details:** from the quantity of tiebreakers to their order; to whether head-to-head comparisons should be applied before or after the overall ones; to all the little oddities that I alluded to in the previous paragraph, and much more.

## Table of Contents

1. [Installation](#installation)
2. [Quick start](#quick-start)
3. [Tiebreakers and sorting options](#tiebreakers-and-sorting-options)
4. [Showing tie descriptions](#showing-tie-descriptions)
5. [Known issues and future directions](#known-issues-and-future-directions)
6. [Helping with the package](#helping-with-the-package)
7. [Documentation](#documentation)

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
means that any ties between teams that finished level on points will be resolved using the standard procedure employed by FIFA during the FIFA World Cup group stage and qualification rounds. The full list of such keywords, as well as which list of tiebreakers each competition exactly employs, is available in the [documentation on github.io](https://suzusuzu-haruharu.github.io/league-standings/).

In its most general form, `sorting` will accept an object with six subkeys as in the following example

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
where only `criteria`, `h2h` and `final` are compulsory whenever `sorting` is given explicitly as an object.

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

**Whether the tournament is FIFA-style or UEFA-style is decided by the `sorting.h2h.when` key,** which can take the string value `"before"` to signify that head-to-head checks are to come first (like UEFA does) or the string value `"after"` to indicate that we must look at the whole table first (the so-called *overall* check, like FIFA does). Notice that the names of these values suggest that the two methods are not mutually exclusive, and in fact both happen in all cases: FIFA will switch to head-to-head when overall comparisons are inconclusive, and likewise UEFA switches to overall when head-to-head checks do not provide an answer. What changes is merely which type of check comes first.

### Head-to-head reapplication

To explan the next subkey, `sorting.h2h.span`, we will look instead at the famous [Group E at the UEFA Euro 2024](https://en.wikipedia.org/wiki/UEFA_Euro_2024) where every single team finished their group with 4 points

| Position | Team       | Won | Drawn | Lost | GF        | GA            | GD               | Points |
|----------|------------|:---:|:-----:|:----:|:---------:|:-------------:|:----------------:|:------:|
| 1        | Romania    | 1   | 1     | 1    | 4         | 3             | +1               | **4**  |
| 2        | Belgium    | 1   | 1     | 1    | 2         | 1             | +1               | **4**  |
| 3        | Slovakia   | 1   | 1     | 1    | 3         | 3             | 0                | **4**  |
| 4        | Ukraine    | 1   | 1     | 1    | 2         | 4             | -2               | **4**  |

You must know that one peculiar thing about UEFA's tiebreaker regulations is that it contains a special provision: whenever more than two teams are tied on points and head-to-head criteria are applied between them, and these manage to separate only some of the teams while leaving the rest still tied, then the head-to-head criteria are to be reapplied from the beginning *only between the teams that are still tied.*

However, the way I just worded it might leave some ambiguity. If we try it on the above example, where all teams are equal on points (and so the head-to-head sub-table ends up coinciding with the whole table anyway), we see that goal difference manages to separate Slovakia and Ukraine from the rest, leaving them at the bottom with 0 and -2 respectively; thus, given what we just said, one might expect that, in order to resolve the still-remaining tie between Romania and Belgium, we would reapply the head-to-head criteria from the beginning to the matches that concern only these two teams—which in this case was just one single match that Belgium won 2-0 in the second matchday. Seeing it this way, it looks like Belgium should have come first.

But here is the catch: according to official European Championship regulations, once certain teams separate from others in a head-to-head comparison, ***the tiebreaking will not reset until they have run out.*** Only when the list of tiebreakers is exhausted, and if some teams still remain tied, are head-to-head results recalculated based solely on the matches played among the still-tied teams. In this case, the list of tiebreakers is the number of points, the goal difference and the number of goals scored: after Slovakia and Ukraine are sorted on goal difference, the head-to-head procedure will not reset until at least the number of goals scored is examined—and this is what ultimately ends up putting Romania on top (Romania 4, Belgium 2).

**Whether the full list of criteria is expected to run out before resetting the head-to-head procedure is decided by the `sorting.h2h.span` key,** which can take the string value `"all"` to signify the style that we have just seen (the one where we must wait until all criteria are applied before re-evaluating any head-to-head sub-tables) or the string value `"single"` to mean the opposite, i.e. the case where head-to-head checks restart from the beginning every single time some teams separate from others (basically the same line of reasoning that, in our fictional example, had made Belgium the winner of the group).

Notice, however, how some competitions do not have this provision at all: the FIFA World Cup is one prime example, where head-to-head criteria apply after the overall ones but there is no requirement to restart them at any point should they only help to separate some teams, but not others. This behavior can be replicated via the third and last accepted value, `"none"`.

### Optional sorting keys

In addition to the subkeys seen above, that are required whenever the `sorting` key is stated explicitly as an object, there are some more that may or may not be provided when initializing the object.

#### `additional`

The first of these is the `additional` key, which behaves like `criteria` in that it also accepts an array of strings, each symbolizing a different tiebreaker. As the name suggests, these are *additional* criteria because they escape the head-to-head run; any tiebreaker in `criteria` will, depending on the circumstance, be applied either in an overall fashion or in a head-to-head check (whichever comes first depends on `sorting.h2h.when`, but in principle they can do both): **however, an additional criteria is one that comes *after* this entire procedure,** and is always checked in an overall fashion only.

One such example comes from the regulations of the UEFA Champions League between years 2021 and 2024 (e.g. the [Group stage at the 2023-24 UEFA Champions League](https://en.wikipedia.org/wiki/2023%E2%80%9324_UEFA_Champions_League_group_stage)), where you can see that goal difference and number of goals scored count as *regular* criteria, in that they are first applied in head-to-head fashion and, should the teams still be tied, they are re-applied in an overall style; and this is what is normally modeled by `sorting.h2h.when = "before"`. However, you can see that the list does not end there: the tiebreakers go on with the number of goals scored away from home, the number of wins and the number of wins away from home, all of which are applied in an overall style (*‘in all group matches’* being the keywords here on Wikipedia). This makes them *special* criteria that only ever exist as final overall comparisons, and this is why, within the code of the package, this particular format (callable via `sorting: "2021-2024 UEFA Champions League"`) exists as

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

It accepts the boolean values `true` or `false` depending on whether this special rule applies or not; [we will see later how to interact with it](#showing-tie-descriptions), especially when it comes to submitting the results of the penalty shoot-out and what happens before and after this is done.

#### `flags`

The last of these is `flags`, which allows the user to set *any* criteria they want right before the final step in the entire process (which is always decided by the value of the `final` key). It is an array of objects (each representing one such custom-made criterion) with keys `name`, being the name of the criterion, and `order`, accepting the string value `"desc"` to indicate that the criterion works like the standard ones, and so a team is ranked *above* the other if the value of the criterion is *higher* (like with points), or the string value `"asc"` to indicate the opposite (one such example would be the amount of yellow and red cards collected, where a team is ranked *above* the other if their disciplinary count is *lower*).

When such flags are setted, the value of the `teams` key should not be a simple array of strings consisting of the identifiers of the teams, but rather an array of objects with keys `team` which, as before, holds the string-valued unique identifier for that specific team, and `flags`, which is an array of integers that expresses the values of each flag associated with that team, in the same order as the flags have been defined in `sorting.flags`.

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
where the first value in each `flags` array represents the disciplinary points (which are initially zero for all teams, as no cards have been issued yet), and the second value represents the European Qualifiers overall ranking of the teams. Clearly the latter of the two is immutable (the qualifiers are done by the time the UEFA Euro group stage starts), while the first will definitely change as the group unfolds and the cards start piling up. The `updateFlags(`*team*`,` *flag*`,` *value*`)` method exists for this purpose, and you should call it before calling the standings.

```javascript
table.updateFlags("Team A", "disciplinary points", 4);
table.standings(); // The new flag will now be taken into account, if needed.
```

## Showing tie descriptions

Calling the `.ties()` method after `.standings()` will give you access to an array of objects, whose each entry corresponds to a group of teams that were tied on points together with a concise explanation of how the relevant tie between them was resolved. Whenever `.standings()` is called for the purposes of *visual* presentation (like in an HTML page that shows the league table of a competition, or within the screen of a game), the output of `.ties()` should also be printed to screen for reasons of clarity.

If we take the example from [Quick start](#quick-start) above, the output of `.ties()` will be the array

```javascript
[
  {
    group: [ 'AC Milan', 'Inter Milan', 'Juventus' ],
    messages: [
      'AC Milan, Inter Milan and Juventus are tied on points (3).',
      'The position of AC Milan is decided on head-to-head number of goals scored (Juventus: 4; Inter Milan: 4; AC Milan: 3).',
      'Inter Milan and Juventus are sorted on head-to-head number of goals scored away from home (Inter Milan: 3; Juventus: 2).'
    ],
    requests: null
  }
]
```
In this case, the array contains only one entry because there was only one group of teams that were tied on a certain number of points (here being all of them, at three points each): the teams involved in the tie are collected within the `group` key as an array of their identifiers. The `messages` key is an array of sentences, describing each relevant step in how the tie was broken: here we have that AC Milan was the first to go on the number of head-to-head goals scored, whereas the still-remaining tie between Juventus and Inter Milan is decided on the third criterion, the number of goals scored away from home.

The `request` key is null here, meaning that the matches that have been submitted via the appropriate method were sufficient to compute the table; this may not be the case if, for example, the result of a penalty shoot-out is required (see [`shootout`](#shootout) above): in that case, submitting the matches alone and calling `.standings()` will temporarily sort the two teams involved at random, with `.ties()` specifying it as follows

```javascript
[
  {
    group: [ 'Japan', 'Senegal' ],
    messages: [
      'Japan and Senegal are tied on points (4).',
      'Japan and Senegal are provisionally sorted at random while waiting for the results of their penalty shootout.'
    ],
    requests: 'shootout'
  }
]
```
The presence of `"shootout"` in the `requests` key signals that the results of the penalty shoot-out (here between Japan and Senegal) needs to be submitted as well, which can be done via `addShootout(`*home team*`,` *away team*`,` *pen. shoot. results home*`, ` *pen. shoot. results away*`)` as such

```javascript
table.addShootout("Japan", "Senegal", 5, 4);
table.standings(); // The result of the penalty shootout will now be taken into account.
table.ties();
```
with `.ties()` now saying

```javascript
[
  {
    group: [ 'Japan', 'Senegal' ],
    messages: [
      'Japan and Senegal are tied on points (4).',
      'Having met on their last matchday and after drawing their match, Japan and Senegal are sorted on the results of their penalty shootout (Japan: 5; Senegal: 4).'
    ],
    requests: null
  }
]
```

## Known issues and future directions

### Computing and retrieving the standings via `.standings()`

*Nothing known at this point.*

### Displaying a description of how ties were broken via `.ties()`

~~- There is currently one point of improvement that I would like to focus on next: the `additional`, `shootout`, `flag` and `final` steps all count as one step, meaning that if more than two teams are involved and some of them are separated by one of these steps while the others are separated by another, only one message will be displayed. ***The teams will be sorted correctly in any case,*** but it is the text description that is insufficient in this scenario.~~ **(solved as of v.1.0.2)**

## Helping with the package

As I am essentially an amateur developer, this is my first JavaScript package ever. Whether I have the ability to keep up with it, let alone deliver something good, remains to be seen: but you can feel free to signal any bugs that you find, or request a feature that you think might be cool to implement, or generally help with the code however you see fit. There is certainly *a lot* of room for improvement!

If you want to act directly on the code, keep in mind that the `tests/` folder contains a list of examples (both real-world and custom-created) meant to run in [Jest](https://www.npmjs.com/package/jest); to work with it, after having cloned this repository and run `npm install` to get all the development dependencies needed (Jest included), simply hit `npm test`: you will see that (as the package currently stands) all tests will be marked as passed. Make sure to always run this command after modifying the package to check that the tests still work properly: this is of course not a *sufficient* condition (a success in all tests does not guarantee there are no more subtle bugs anywhere, even in the present code)—but it is certainly a *necessary* one, as any version of the code must at the very least sort teams correctly in all those instances.

Contributing by adding more real-world or custom-created examples in the style that is already shown in the test files is also greatly appreciated!

## Documentation

The documentation is currently a work in progress, but a [tentative version of it](https://suzusuzu-haruharu.github.io/league-standings/) is hosted on Github Pages. Feel free to check it out, mainly to know what type of sorting criteria you have available, or which competitions already have their default rules labeled under a keyword, or generally how every method and the object initialization exactly work!
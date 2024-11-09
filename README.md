# league-standings

A Javascript package that computes league tables from an array of matches. Types and order of tiebreakers are fully customizable, and it is possible to access the full description of which tiebreakers were used at what point in both textual and raw data form.

## Table of Contents

1. [Introduction](#introduction)
2. [Installation](#installation)
3. [Quick start](#quick-start)
4. [Tiebreakers and sorting options](#tiebreakers-and-sorting-options)
5. [Documentation](#documentation)
6. [License](#license)

## Introduction

The main purpose of this package is to accept a list of matches for a given set of teams and compute their standings based on the number of *points* they have earned. While it was heavily inspired by football (soccer), it can be applied to any sport—real or fictional. Due to this versatility, I will use a few naming conventions: I will refer to any competing party as a **team**, any encounter between two teams as a **match**, any act of scoring during a match as a **goal**, and any primary variable used to sort teams in the standings as **points**.

Although these terms are borrowed from soccer for simplicity, the underlying principles apply to other sports as well, with only minor changes to the terminology (e.g., a team may consist of just one person in single-player sports).

Standings are easy to compute when all teams have earned a different number of points, as these are by definition the primary criterion for determining the final position in the table, and thus sorting is trivial in this case. **Tiebreakers,** however, will come into play when teams finish with an equal number of points: these are what truly gives life to the package, so feel free to check the [Tiebreakers and sorting options](#tiebreakers-and-sorting-options) section below to explore the customization options available for selecting tiebreakers, determining their application order, and handling other nuances associated with them.

## Installation

...

## Quick start

To use the package, simply instantiate a new `LeagueTable` object via

```javascript
const teams = ["San Marino", "Italy", "Spain", "France"];
const table = new LeagueTable({
    teams: teams
});
```
where `team` is here an array of ***unique*** identifiers of any type (ideally strings containing the names of the teams, as per the example above). Matches can be added via the `addMatches()` method

```javascript
const matches = [
    [1, 1, "Spain", "San Marino", 2, 0],
    [2, 1, "Italy", "Spain", 9, 4],
    [3, 2, "France", "San Marino", 20, 0],
    [4, 2, "Italy", "France", 6, 7],
    [5, 3, "Italy", "San Marino", 1, 0],
    [6, 3, "Spain", "France", 3, 0]
];
table.addMatches(matches);
```
where `matches` is here an array of arrays, each representing one match. As per the example above, any match array must have entries that are respectively: a ***unique*** identifier for each match; the matchday; the unique identifier of the home team; the unique identifier of the away team; the number of points scored by the home team; and finally the number of points scored by the away team.

Finally, the standings can be retrieved via

```javascript
table.standings();
```
The result will be an array of objects containing all the properties of the various teams.

## Tiebreakers and sorting options

A sorting method can be implemented via the `sorting` key in the starting object, where the simplest value it can take is a default keyword; for example, in

```javascript
const teams = ["San Marino", "Italy", "Spain", "France"];
const table = new LeagueTable({
    teams: teams,
    sorting: "FIFA"
});
```
any ties between teams that finished level on points will be resolved using the standard procedure employed by FIFA during the FIFA World Cup group stage and qualification rounds (the full list of such keywords is available in the [Documentation](#documentation) section below).

In general, `sorting` will accept an object in the form of

```javascript
const teams = ["San Marino", "Italy", "Spain", "France"];
const table = new LeagueTable({
    teams: teams,
    sorting: {
        criteria: ["diff", "for"],
        final: "lots",
        h2h: {
            when: "before",
            span: "all"
        }
    }
});
```
where `criteria` is the list of tiebreakers that will be applied one after the other to break any ties, and `final` tells the code what to do when all criteria have been used and the standings are still inconclusive: in this case, the criteria to apply would be *goal difference* and *goal scored*, while the final criterion in case of absolute tie on all records will be a drawing of random lots.

Again, the full list of `criteria` and `final` keywords (as well as their meaning) is available in the documentation below.

### Head-to-head

The `h2h` key, meaning *head-to-head*, deserves its own subsection to be explained properly. As you may know, it is often the case that when a list of criteria does not return a useful result for two or more teams, then one way of breaking the tie is to reapply all the criteria from the start, but restricting ourselves only to the matches played between those teams. The `h2h` key gives you full control over this process via two parameters.

#### when

The first is `when`, which simply lets you choose whether you want the head-to-head comparisons to be done immediately (here signified by the `before` keyword, as per the example above), or only after the comparison using the overall results of the whole table has not been able to sort all the teams (here signified by the `after` keyword). Those of you who like soccer may already be familiar with this concept: FIFA uses overall criteria first in all of their competition, only resorting to head-to-head if this does not work fully, whereas UEFA famously uses head-to-head comparisons as their first row of criteria, with overall results being used only to solve any still-existing ties.

One such example comes from [Group E at the UEFA EURO 2016](https://en.wikipedia.org/wiki/UEFA_Euro_2016), where the final table ended up looking like this

| Position | Team       | Won | Drawn | Lost | GF | GA | GD  | Points |
|----------|------------|:---:|:-----:|:----:|:--:|:--:|:---:|:------:|
| 1        | Italy      | 2   | 0     | 1    | 3  | 1  | +2  | **6**  |
| 2        | Belgium    | 2   | 0     | 1    | 4  | 2  | +2  | **6**  |
| 3        | Republic of Ireland | 1 | 1 | 1 | 2  | 4  | -2  | **4**  |
| 4        | Sweden     | 0   | 1     | 2    | 1  | 3  | -2  | **1**  |

Normally one would expect to see Belgium come out on top, as the list of tiebreakers used at the European Championship runs through goal difference (Italy 2, Begium 2), then goals scored (Italy 3, Belgium 4): however, since UEFA uses the head-to-head score first, the criteria are reapplied from the beginning (points) only to the matches between the teams concerned—which in this case was just one match, that Italy had won 2-0 in the very first matchday of the group stage.

#### span

For what concerns the `span` key, once again an example will illustrate the concept much better. We will be looking at the European Championship once more, and specifically at the famous [Group E at the UEFA EURO 2024](https://en.wikipedia.org/wiki/UEFA_Euro_2024) where every single team finished their group with 4 points.

| Position | Team       | Won | Drawn | Lost | GF | GA | GD  | Points |
|----------|------------|:---:|:-----:|:----:|:--:|:--:|:---:|:------:|
| 1        | Romania    | 1   | 1     | 1    | 4  | 3  | +1  | **4**  |
| 2        | Belgium    | 1   | 1     | 1    | 2  | 1  | +1  | **4**  |
| 3        | Slovakia   | 1   | 1     | 1    | 3  | 3  | 0   | **4**  |
| 4        | Ukraine    | 1   | 1     | 1    | 2  | 4  | -2  | **4**  |

In this spectacular group, every team won, drew and lost exactly one game which resulted in these final standings. What made many perplexed is the position of Belgium, whose first place spot was curiously enough taken away from them via a technicality in the rules just eight years after the group we discussed in the previous example, where once again Belgium were the runners-up. The confusion stems from the fact that, seeing how all the teams are tied on points (and therefore the head-to-head comparisons end up involving the whole table anyway), we should move onto goal difference where only Romania and Belgium remain tied; but nevertheless Romania ended up taking the first place, even though their head-to-head match ended in a 2-0 win for Belgium during the second matchday.

The truth of the matter is that, according to the official regulations of the European Championship, whenever some teams *break away* from the others during a head-to-head check (like Slovakia and Ukraine did here on goal difference, leaving Romania and Belgium tied), **the criteria do not restart from the beginning but continue until the end.** Only when the list of tiebreakers ends and some teams are still tied do we compute the head-to-head results again, based only on the matches played between those remaining teams.

***This behavior is modeled by*** `span: all`***,*** where the `all` keyword tells the program to wait until *all* criteria have been used before recomputing the head-to-head results based on the teams that are still tied; ***conversely,*** `span: single` ***will do this every time a head-to-head check separates some teams from the others,*** even if the list of criteria has not been completed yet. Try this on your own by inserting the match results that occurred during that tournament and setting the `span` key to `single`: you will see that Belgium now comes out on top, as after Slovakia and Ukraine break away on head-to-head goal difference we go back to head-to-head points within the matches played between Romania and Belgium only, which favors the latter of the two (Belgium: 3, Romania: 0 due to Belgium beating Romania in matchday two).
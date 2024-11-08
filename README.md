# league-standings

A Javascript package that computes league tables from an array of matches. Types and order of tiebreakers are fully customizable, and it is possible to access the full description of which tiebreakers were used at what point in both textual and raw data form.

## Table of Contents

1. [Introduction](#introduction)
2. [Installation](#installation)
3. [Quick start](#quick-start)
4. [Sorting options](#features)
5. [Contributing](#contributing)
6. [License](#license)

## Introduction

The main purpose of this project is to accept a list of matches for a given set of teams and compute their standings based on the number of *points* they have earned. While it was heavily inspired by football (soccer), it can be applied to any sport—real or fictional. Due to this versatility, I will use a few naming conventions here: I will refer to any competing party as a **team**, any encounter between two teams as a **match**, any act of scoring during a match as a **goal**, and the primary variable used to sort teams for the final standings as **points**.

In this context, a *point* in standard soccer corresponds to three for a win, one for a draw, and zero for a loss. Although these terms are taken from soccer for simplicity, the principles apply to other sports as well, with only minor changes to the terminology.


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
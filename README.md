# league-standings

A Javascript package that computes league tables from an array of matches. Types and order of tiebreakers are fully customizable, and it is possible to access the full description of which tiebreakers were used at what point in both textual and raw data form.

## Table of Contents

1. [Introduction](#introduction)
2. [Installation](#installation)
3. [Quick start](#quick-start)
4. [Tiebreakers and sorting options](#tiebreakers-and-sorting-options)
5. [Contributing](#contributing)
6. [License](#license)

## Introduction

The main purpose of this package is to accept a list of matches for a given set of teams and compute their standings based on the number of *points* they have earned. While it was heavily inspired by football (soccer), it can be applied to any sport—real or fictional. Due to this versatility, I will use a few naming conventions: I will refer to any competing party as a **team**, any encounter between two teams as a **match**, any act of scoring during a match as a **goal**, and any primary variable used to sort teams in the standings as **points**.

Although these terms are borrowed from soccer for simplicity, the underlying principles apply to other sports as well, with only minor changes to the terminology (e.g., a team may consist of just one person in single-player sports).

Standings are easy to compute when all teams have earned a different number of points, as these are by definition the primary criterion for determining the final position in the table. ***Tiebreakers,*** however, will come into play when teams finish with an equal number of points: these are what truly gives life to the package, so feel free to check the [Tiebreakers and sorting options](#tiebreakers-and-sorting-options) section below to explore the customization options available for selecting tiebreakers, determining their application order, and handling other nuances associated with them.

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

...
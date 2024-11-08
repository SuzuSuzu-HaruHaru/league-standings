# league-standings

A Javascript package that computes league tables from an array of matches. Types and order of tiebreakers are fully customizable, and it is possible to access the full description of which tiebreakers were used at what point in both textual and raw data form.

## Table of Contents

1. [Installation](#installation)
2. [Quick start](#quickstart)
3. [Features](#features)
4. [Contributing](#contributing)
5. [License](#license)

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
where `team` is an array of unique identifiers of any type (ideally strings containing the names of the teams). Matches can be added via the `addMatches()` method

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
where `matches` is an array of arrays where each subarray represents one match, of entries respectively: a unique identifier for each match; the matchday; the unique identifier of the home team; the unique identifier of the away team; the number of points scored by the home team; the number of points scored by the away team.

Finally, the standings can be retrieved via

```javascript
table.standings();
```
The result will be an array of objects containing all the properties of the various teams.
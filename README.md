# league-standings

A Javascript package that computes league tables from an array of matches. Types and order of tiebreakers are fully customizable, and it is possible to access the full description of which tiebreakers were used at what point in both textual and raw data form.

## Table of Contents

1. [Installation](#installation)
2. [Usage](#usage)
3. [Features](#features)
4. [Contributing](#contributing)
5. [License](#license)

## Installation

...

## Usage

To use the package, simply instantiate a new `LeagueTable` object via

```javascript
const table = new LeagueTable({
    teams: teams,
    format: "round-robin",
    points: "standard",
    sorting: {
        criteria: ["diff", "for", "won"],
        h2h: {
            when: "before",
            span: "all"
        },
        final: "lots"
    }
});
```
where `team` is an array of unique identifiers of any type (ideally strings containing the names of the teams).
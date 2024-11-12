# league-standings

As a big fan of football (soccer), I can confidently say that there is nothing easier—***and*** nothing harder—than putting teams in a table. It is *easy*, in that the logic is apparently simple enough: track the results, compute the points, sort by points; if there are any ties, apply tiebreakers. Little nuances aside, that would be the end of the story. But, as they say, the devil is in the details.

The away goals rule is a famous one that made the news back in 2021, when UEFA did away with it; but is it *really* gone from the list of tiebreakers? or again, [Group F at the 2022-23 UEFA Europa League](https://en.wikipedia.org/wiki/2022%E2%80%9323_UEFA_Europa_League_group_stage) saw all teams finish their group with eight points each: how were these ties resolved? and who can say what happens at the Euros should two teams be equal on points, goal difference and goals scored, *and* they meet on the last matchday *and* their game ends in a draw? As cliché as it may sound, the answer might not be what you expect.

This `league-standing` package **offers complete flexibility in choosing all of these details:** from the quantity of tiebreakers to their order; to whether head-to-head comparisons should be applied before or after the overall ones; to all the little oddities that I alluded to in the previous paragraph, and much more.

## Table of Contents

1. [Installation](#installation)
2. [Quick start](#quick-start)
3. [Tiebreakers and sorting options](#tiebreakers-and-sorting-options)
4. [License](#license)

## Installation

Just run this on any terminal within your project folder

```bash
$ npm install league-standings
```

## Quick start

```javascript
import { LeagueTable } from 'league-standings';

const teams = ["Juventus", "AC Milan", "Inter Milan"];
const matches = [
    [1, 1, "AC Milan", "Juventus", 1, 2], // match id, matchday, team A, team B, goals A, goals B
    [2, 1, "Juventus", "Inter Milan", 2, 3],
    [3, 1, "Inter Milan", "AC Milan", 1, 2],
];

const table = new LeagueTable({
    teams: teams,
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

### Head-to-head comparisons

The `h2h` key, meaning *head-to-head*, deserves its own subsection to be explained properly. As you may know, it is often the case that when a list of criteria does not return a useful result for two or more teams, then one way of breaking the tie is to reapply all the criteria from the start, but restricting ourselves only to the matches played between those teams. The `h2h` key gives you full control over this process via two parameters.

#### when

The first is `when`, which simply lets you choose whether you want the head-to-head comparisons to be done immediately (here signified by the `before` keyword), or only after the comparison using the overall results of the whole table has not been able to sort all the teams (here signified by the `after` keyword). Those of you who like soccer may already be familiar with this concept: FIFA uses overall criteria first in all of their competitions, only resorting to head-to-head if this does not work fully, whereas UEFA famously uses head-to-head comparisons as their first row of criteria, with overall results being used only to solve any still-remaining ties.

One example of such a difference can be seen in [Group E at the UEFA EURO 2016](https://en.wikipedia.org/wiki/UEFA_Euro_2016), where the final table ended up looking like this

| Position | Team       | Won | Drawn | Lost | GF        | GA            | GD               | Points |
|----------|------------|:---:|:-----:|:----:|:---------:|:-------------:|:----------------:|:------:|
| 1        | Italy      | 2   | 0     | 1    | 3         | 1             | +2               | **6**  |
| 2        | Belgium    | 2   | 0     | 1    | 4         | 2             | +2               | **6**  |
| 3        | Republic of Ireland | 1 | 1 | 1 | 2         | 4             | -2               | **4**  |
| 4        | Sweden     | 0   | 1     | 2    | 1         | 3             | -2               | **1**  |

Normally one would expect to see Belgium come out on top, as the list of tiebreakers used at the European Championship runs through goal difference (Italy 2, Begium 2) and then goals scored (Italy 3, Belgium 4): however, since UEFA uses the head-to-head score first, the criteria are to be applied only to the matches between the teams concerned in the tie—which in this case was just one match, that Italy had won 2-0 in the very first matchday of the group stage; Italy therefore ranks first on head-to-head points (Italy 2, Belgium 0).

#### span

For what concerns the `span` key, once again an example will illustrate the concept much better. We will be looking at the European Championship once more, and specifically at the famous [Group E at the UEFA EURO 2024](https://en.wikipedia.org/wiki/UEFA_Euro_2024) where every single team finished their group with 4 points.

| Position | Team       | Won | Drawn | Lost | GF        | GA            | GD               | Points |
|----------|------------|:---:|:-----:|:----:|:---------:|:-------------:|:----------------:|:------:|
| 1        | Romania    | 1   | 1     | 1    | 4         | 3             | +1               | **4**  |
| 2        | Belgium    | 1   | 1     | 1    | 2         | 1             | +1               | **4**  |
| 3        | Slovakia   | 1   | 1     | 1    | 3         | 3             | 0                | **4**  |
| 4        | Ukraine    | 1   | 1     | 1    | 2         | 4             | -2               | **4**  |

In this remarkable group, each team won, drew, and lost exactly one match, leading to these final standings. What left many perplexed was Belgium’s position, as—just like eight year earlier, as per the previous example—their first-place spot was curiously taken away through a technicality in the rules. The confusion stems from the fact that, with all teams tied on points (and thus requiring head-to-head comparisons across the entire table), goal difference comes into play to decide the outcome leaving only Romania and Belgium tied: and yet Romania ended up in first place, even though Belgium had won their head-to-head match 2-0 against them in the second matchday.

The truth is that, according to official European Championship regulations, once certain teams separate from others in a head-to-head comparison (as Slovakia and Ukraine did here based on goal difference, leaving Romania and Belgium tied), **the tiebreaking criteria continue in sequence rather than resetting.** Only when the list of tiebreakers is exhausted, and if some teams remain tied, are head-to-head results recalculated based solely on the matches played among the still-tied teams.

For what concerns the package,
- the behavior described is represented by `span: all`, where the `all` keyword instructs the program to wait until all criteria have been applied before recalculating head-to-head results among the remaining tied teams;
- conversely, `span: single` performs this recalculation every time a head-to-head check separates some teams from the others, even if the full list of criteria has not yet been completed.

You can test this by inputting the actual match results from that tournament and setting the `span` key to `single`. You’ll see that Belgium comes out on top: after Slovakia and Ukraine separate based on head-to-head goal difference, the calculation returns to head-to-head points within the matches between Romania and Belgium, which favors Belgium (Belgium 3, Romania 0, due to Belgium’s win over Romania in the second matchday).
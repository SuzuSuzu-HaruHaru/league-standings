# Methods

## `addMatches`

Submitting a list of matches where at least one of the teams plays more matches than the number of its opponents (in a round-robin league), or more than twice that number (in a home-and-away league), will throw either of the following non-blocking warnings:

```javascript
`The total number of games played by a team in a round-robin format
cannot be more than the number of teams minus one`
```
```javascript
`The total number of games played by a team in a home-and-away format
cannot be more than twice the number of teams minus one`
```
followed by the first team identifier for which this check failed.

Likewise, submitting a list of matches where at least one of the teams plays at least one of its opponents more than once (in a round-robin league), or more *or* less than twice (in a home-and-away league), will throw either of the following non-blocking warnings:

```javascript
`In a round-robin format, teams must face each other exactly once`
```
```javascript
`In a home-and-away format, teams must face each other exactly twice`
```
followed by the team identifiers of the two teams for which this check first failed, followed in turn by the number of matches that have been found between them.

Additionally, only in the case of a home-and-away league, the two matches between any two teams should be played one at the home of the first team, and the other at the home of the second team. Failing this check will throw the following non-blocking warning:

```javascript
`In a home-and-away format, teams must face each other once at home and once away`
```
followed by the team identifiers of the two teams for which this check first failed.

Finally, if `sorting.shootout` is set to `false`, submitting a list of matches where at least one team appears more than once in the same matchday will throw the following non-blocking warning:

```javascript
`Each team may only appear exactly once per matchday.`
```
But if `sorting.shootout` is set to `true`, then matchdays become crucial to the sorting process and submitting a list of matches that fails that check **will throw an error** of type

```javascript
`Each team may only appear exactly once per matchday.
Since sorting.shootout was set to true and that depends
on matchdays, continuing may impact the final results;
either switch to a sorting method that does not employ
a shootout or fix the matchdays.`
```
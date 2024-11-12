# Methods

## `addMatches`

|                        |                                                                    |
|------------------------|--------------------------------------------------------------------|
| **Description**        | Adds the matches (and their results) from which the table is computed. |
| **Expected input**     | An array of arrays of six elements each, the first of which has to be a unique identifier. |
| **Expected output**    | *None.*                                                            |

The six elements in each subarray (representing a single match) must be respectively a unique identifier for each match (any type is allowed, though an integer is preferred), an integer representing the matchday (starting from 1 for the first matchday), the unique team identifier of the home team, the unique team identifier of the away team, an integer representing the number of goals scored by the home team and an integer representing the number of goals scored by the away team. Submitting an array of matches where some of the match identifiers are repeated across the subarrays **will throw an error** of type

```
Match identifiers must be unique.
```

Submitting a list of matches where at least one of the teams plays more matches than the number of its opponents (in a round-robin league), or more than twice that number (in a home-and-away league), will throw either of the following *non-blocking warnings*

```
The total number of games played by a team in a round-robin format cannot be more than the number of teams minus one
```
```
The total number of games played by a team in a home-and-away format cannot be more than twice the number of teams minus one
```
followed by the first team identifier for which this check failed.

Likewise, submitting a list of matches where at least one of the teams plays at least one of its opponents more than once (in a round-robin league), or more *or* less than twice (in a home-and-away league), will throw either of the following *non-blocking warnings*

```
In a round-robin format, teams must face each other exactly once
```
```
In a home-and-away format, teams must face each other exactly twice
```
followed by the team identifiers of the two teams for which this check first failed, followed in turn by the number of matches that have been found between them.

Additionally, only in the case of a home-and-away league, the two matches between any two teams should be played one at the home of the first team, and the other at the home of the second team. Failing this check will throw the following *non-blocking warning*

```
In a home-and-away format, teams must face each other once at home and once away
```
followed by the team identifiers of the two teams for which this check first failed.

Finally, if `sorting.shootout` is set to `false`, submitting a list of matches where at least one team appears more than once in the same matchday will throw the following *non-blocking warning*

```
Each team may only appear exactly once per matchday.
```
But if `sorting.shootout` is set to `true`, then matchdays become crucial to the sorting process and submitting a list of matches that fails that check **will throw an error** of type

```
Each team may only appear exactly once per matchday. Since sorting.shootout was set to true and that depends on matchdays, continuing may impact the final results; either switch to a sorting method that does not employ a shootout or fix the matchdays.
```

## `addShootout`

|                        |                                                                    |
|------------------------|--------------------------------------------------------------------|
| **Description**        | Tells the program how a required shootout ended, so it can be used to sort the teams involved. |
| **Expected input**     | Four arguments (unique team identifier of one of the teams involved in the shootout, unique team identifier of the other team involved in the shootout, shootout results for the first team, shootout results for the second team). |
| **Expected output**    | *None.*                                                            |

See [**`shootout`**](https://github.com/SuzuSuzu-HaruHaru/league-standings?tab=readme-ov-file#shootout) on Github for an explanation on when this may occur, as well as [**`ties`**](#ties) down below for how to realize that the results for a shootout need to be provided.

## `standings`

|                        |                                                                    |
|------------------------|--------------------------------------------------------------------|
| **Description**        | Retrieves the standings, as computed from the matches.             |
| **Expected input**     | Either none or the string `"all"`.                                 |
| **Expected output**    | An array of objects with keys `id`, `points`, `for`, `against`, `diff`, `won`, `drawn`, `lost`, `played` (additionally `away_for`, `away_won` if the input is set to `"all"`). |

The array in question will already be ordered as per the final standings of the league; for example, calling `table.standings()[2].for` on an `table` object of type `LeagueTable` will retrieve the number of goals scored by the team that placed third in the league (as per usual, Javascript arrays are zero-indexed so the third element in the array is accessible via the index two).

The keys represent the unique identifier of each team, the number of points earned, the number of goals scored, the nummber of goals against, the goal difference, the number of games won, the number of games drawn, the number of games lost, the total number of games played (additionally the number of goals scored away from home and the number of games won away from home). For displaying purposes, these values are always *overall* values that take into account the number of goals scored across all matches, the number of games won across all matches, and so on.

## `ties`

|                        |                                                                    |
|------------------------|--------------------------------------------------------------------|
| **Description**        | Retrieves the text explanation of how the various ties have been resolved. |
| **Expected input**     | Either none or the string `"raw"`.                                 |
| **Expected output**    | An array of objects with keys `group`, `messages` and `requests`, the first of which will be an array of unique team identifiers, the second will be an array of strings (each carrying a text description of a decisive tiebreaking step), and the third will either be `null` or the string `"shootout"`. If the input is `"raw"`, it will be an array of objects with keys `type`, `criterion`, `special` and `snapshot` (*See below*). |

Calling `ties` with no parameters will return a list of objects that is ready to be used: mapping it to `messages` already gives a list of human-readable explanations for how the ties between the various teams have been broken. The `request` field will be `null` if there is nothing to note, but it will carry the string `"shootout"` if it is determined that two teams require a shootout to be sorted—in which case this will have to be provided via [**`addShootout`**](#addshootout) before calling `standings` and `tied` again (the two teams involved will be in the `group` field of the same obect carrying the request for a shootout); in the meantime, the teams will be provisionally sorted at random and the `messages` in `ties` will say as much.

## `updateFlags`

|                        |                                                                    |
|------------------------|--------------------------------------------------------------------|
| **Description**        | Updates custom flags related to teams.                             |
| **Expected input**     | Three arguments (the unique team identifier of the team whose flag has to be updated, a string representing the `name` field of the flag that is to be updated, and the new integer value that has to be submitted for it). |
| **Expected output**    | *None.*                                                            |

See [**`flags`**](https://github.com/SuzuSuzu-HaruHaru/league-standings?tab=readme-ov-file#flags) on Github for an explanation of what flags are, and when it is expected to update them.
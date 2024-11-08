export default class LeagueTable {

    constructor(data) {
        if (
            typeof data !== "object" ||
            data === null ||
            !("teams" in data) ||
            !("format" in data) ||
            !("points" in data) ||
            !("sorting" in data)
        ) {
            throw new Error("Invalid constructor argument (expected an object with properties: teams, format, points, sorting).");
        }

        this.teams = data.teams;
        this.format = data.format;
        this.points = data.points;
        this.sorting = data.sorting;

        this.warning = false;
        this.tiesteps = [];

        this.matches = new Map();

        this.cycles = [];
        this.groups = [];
        this.timeline = [];

        this.information = [];
    }

    addMatches(data) {
        const idSet = new Set();
        data.forEach(item => {
            if (idSet.has(item[0])) {
                throw new Error(`Match ids must be unique (first thrown at a match with match id ${item[0]}).`);
            } else {
                idSet.add(item[0]);
            }

            switch (this.format) {
                case "round-robin":
                    if (Array.from(this.matches.values()).find(match => match.home == item[1] && match.away == item[2] || match.home == item[2] && match.away == item[1])) {
                        if (!this.warning) {
                            console.warn(`Round-robin format should allow for only one match between given teams.`);
                            this.warning = true;
                        }
                    }
                    break;
                case "home-and-away":
                    if (Array.from(this.matches.values()).filter(match => match.home == item[1] && match.away == item[2] || match.home == item[2] && match.away == item[1]).length > 1) {
                        if (!this.warning) {
                            console.warn(`Home-and-away format should allow for only two matches between given teams.`);
                            this.warning = true;
                        }
                    }
                    break;
            }

            this.matches.set(item[0], {
                home: item[2],
                away: item[3],
                home_for: item[4],
                away_for: item[5]
            });
        });
    }

    ties() {

        const greatConsoleLogs = () => {
            console.log("The cycles", this.cycles.map(cycle => {
                return {
                    type: cycle.type,
                    criterion: cycle.criterion,
                    snapshot: cycle.snapshot.map(team => team.id + " (points: " + team.points + ", diff: " + team.diff + ").")
                }
            }));
            this.groups.forEach(step => {
                console.log("The groups", step.map(group => group.map(team => team.id + " (points: " + team.points + ", diff: " + team.diff + ").")));
            });
        }

        // greatConsoleLogs();

        const repeat = (group, depth = 1) => {

            // Recursion failsafe
            if (depth > 10) {
                throw new Error("Maximum recursion depth exceeded for the information messages.");
            }

            // Step 1.
            // We find the teams and state that they need explaining
            if (depth == 1) {
                this.information.push(`${formatNames(group.map(team => team.id))} are tied on points (${this.cycles[0].snapshot.filter(team => group.some(element => element.id == team.id))[0].points}).`);
            }
            
            // Step 2.
            // Running through all of this.groups, we select the steps where the teams are somewhere within the arrays and then declare them sorted according to the criterion that is concurrently written in the same entry of this.cycles, also looking at the "h2h" or "overall" flags for better descriptions
            const history = [];

            // Assuming group is defined outside of the loop
            const groupIds = group.map(_team => _team.id);

            this.groups.forEach(step => {
                step.forEach(_group => {
                    // Check if any team in _group has an id that is in the groupIds array
                    if (groupIds.every(id => _group.map(team => team.id).includes(id))) {
                        history.push(step);
                    }
                });
            });

            const target = JSON.stringify(history[history.length - 1]);
            const index = this.groups.length - 1 - this.groups.slice().reverse().findIndex(step => JSON.stringify(step) === target);

            // console.log("And so the index is...", index);

            const h2h = this.cycles[index].type == "h2h" ?
                "head-to-head " :
                "";

            const criterion = this.cycles[index + 1].criterion;;
            switch (this.cycles[index + 1].type) {
                case "lots":
                    this.information.push(`${formatNames(group.map(team => team.id))} are sorted on drawing of random lots.`);
                    break;
                case "alphabetical":
                    this.information.push(`${formatNames(group.map(team => team.id))} are sorted on the alphabetical order of their names.`);
                    break;
                default:
                    this.information.push(`${formatNames(group.map(team => team.id))} are sorted on ${h2h}${this.#longNames(criterion)} (${this.cycles[index + 1].snapshot.sort((a, b) => { b[criterion] - a[criterion] }).map(team => `${team.id}: ${team[criterion]}`).join('; ')}).`);
                    break
            }

            const filterNonUniqueProperties = (arr, property) => {
                if (arr.length == 2 && arr[0][property] != arr[1][property]) {
                    arr.length = 1;
                    return arr;
                }

                // If the next step will be a random one, we may as well cut here.
                if (this.cycles[index + 1].type == "lots" || this.cycles[index + 1].type == "calphabetical" || index == this.groups.length - 2) {
                    arr.length = 1;
                    return arr;
                }

                // Step 1: Count occurrences of each specified `property` value
                const propertyCounts = arr.reduce((counts, obj) => {
                    const key = obj[property];  // Access the property dynamically
                    counts[key] = (counts[key] || 0) + 1;
                    return counts;
                }, {});

                // Step 2: Filter objects with non-unique values for the specified `property`
                return arr.filter(obj => propertyCounts[obj[property]] > 1);
            }

            const trim = filterNonUniqueProperties(group, criterion);

            function formatNames(names) {
                if (names.length === 0) return '';
                if (names.length === 1) return names[0];
                if (names.length === 2) return names.join(' and ');

                const last = names[names.length - 1];
                const others = names.slice(0, -1).join(', ');
                return `${others} and ${last}`;
            }

            // Recursive step
            if (trim.length > 1) {
                repeat(trim, depth + 1);
            }
        }

        // We iterate over the groups of length greater than 1 in the first element of this.groups, are these are the teams that were tied in the first place and thus need explaining.
        this.groups[0].forEach(group => {
            if (group.length > 1) {
                repeat(group);
            }
        });

        return this.information;
    }

    standings(options) {
        const standings = [];

        if (!this.matches.size) {
            console.warn("Matches Array is empty (no matches have been provided for this instance of LeagueTable).");
        } else {
            this.teams.forEach(team => {
                standings.push({
                    id: team,
                    points: 0,
                    for: 0,
                    against: 0,
                    diff: 0,
                    won: 0,
                    drawn: 0,
                    lost: 0,
                    away_for: 0,
                    away_won: 0,
                    played: 0
                });
            });

            this.matches.forEach((match, key) => {
                this.#computeTableRows(match, key, standings);
            });

            this.sorting.criteria.unshift("points");
        }

        this.recursive(standings, {
            index: 0,
            type: "overall"
        })

        switch (options) {
            case "all":
                return this.timeline[this.timeline.length - 1];
            default:
                return this.timeline[this.timeline.length - 1].map(({ away_for, away_won, ...rest }) => rest);;
        }
    }

    recursive(table, iteration, depth = 1, final = false) {

        // Recursion failsafe
        if (depth > 50) {
            throw new Error("Maximum recursion depth exceeded.");
        }

        console.log("-----------------------------------", depth, "-----------------------------------");

        let tiebreaker;
        let run;

        // Depending on whether we are starting as overall or h2h, we specify what cycle we are starting and where we're at; in particular, overall iterations start immediately while h2h are one offset (and so in any case we are always starting from "overall" regardless of whether h2h is "before" or "after", or even there)
        this.cycles.push({
            type: iteration.type,
            criterion: null,
            snapshot: JSON.parse(JSON.stringify(table))
        });

        // This constant reads the number of steps that we have taken into the current cycle (whether "h2h" or "overall"), which of course is important for reading criteria
        run = this.#run(this.cycles, table) % this.sorting.criteria.length;

        const criteriaLimitReached = run > this.sorting.criteria.length - 2;
        const cycleIndex = this.cycles.length - run - 1;
        console.log("Il grande debugging mi dice che run è", run, "con un ciclo di lunghezza", this.cycles.length, "che cycleIndex è", cycleIndex);
        const isProgress = () => JSON.stringify(this.cycles[cycleIndex].snapshot.map(team => team.id)) !== JSON.stringify(table.map(team => team.id));

        if (iteration.index > 2 && iteration.type === "h2h" && isProgress()) {
            console.log("\x1b[31mSembra che stiamo facendo progressi anche prima di aver concluso un ciclo, e siccome\nsiamo in regime di \"single\", ritorniamo a point solo per queste nuove squadre.\x1b[0m");
            console.log("");

            this.sorting.h2h.span == "single" ?
                run = 0 :
                null;
        }

        console.log("I cicli sono...", this.cycles.map(cycle => cycle.type));
        console.log("Di snapshot...", this.cycles.map(cycle => cycle.snapshot.map(team => team.id)));
        console.log("Il run è...", run);

        // We handle what to do whenever the current iteration is going beyond the criteria we have, which usually means
        // (a) that we switch from one type to the other (e.g. overall to h2h or viceversa)
        // (b) that we are in h2h and we are to reapply the criteria to the beginning to those teams that are still tied
        // (C) that we are to move onto drawing of lots, or leave the standings undecided

        tiebreaker = this.sorting.criteria[run];
        this.cycles[this.cycles.length - 1].criterion = tiebreaker;

        console.log("La tabella che mi è stata data è", table.map(team => team.id + " (pts: " + team.points + "; diff: " + team.diff + ")"));
        console.log("Per quest'iterazione, il criterio di spareggio è", tiebreaker);
        console.log("\x1b[31mSorting round di tipo:\x1b[0m ", iteration.type);
        console.log("\x1b[31mChe in cycles è marcato come:\x1b[0m ", this.cycles[this.cycles.length - 1].type);

        // Pre-step
        // If this is a head-to-head iteration, we have to rebuild the table that we are using so that it is made only of current matches
        // If this.sorting.h2h.interval is set to "all", then this is only recomputed for the teams that are still even when a cycle is completed and we are back to points; otherwise, if it is set to "single", we do it every single time.
        const recompute = iteration.type == "h2h" && (this.sorting.h2h.span == "all" ? run == 0 : true);

        if (recompute) {
            const matches = new Map(
                Array.from(this.matches.values())
                    .filter(match => {
                        return table.some(row => row.id == match.home) && table.some(row => row.id == match.away);
                    })
                    .map(match => [[...this.matches.entries()].find(([k, v]) => v === match)?.[0], match]));

            table.forEach(team => {
                Object.keys(team).forEach(key => {
                    if (key !== "id") {
                        team[key] = 0;
                    }
                });
            });

            matches.forEach((match, key) => {
                this.#computeTableRows(match, key, table);
            });

            console.log("L'ultimo snapshot prima...", this.cycles[this.cycles.length - 1].snapshot);
            this.cycles[this.cycles.length - 1].snapshot = JSON.parse(JSON.stringify(table));
            console.log("L'ultimo snapshot dopo...", this.cycles[this.cycles.length - 1].snapshot);

            console.log("");
            console.log("\x1b[95mCome parte di head-to-head, ho ricostruito la classifica delle squadre dei gruppi\nche abbiamo generato a partire dalla tabella che abbiamo al momento\n(escludendo ovviamente i gruppi di lunghezza 1). Ora è\x1b[0m", table.map(team => team.id + " (pts: " + team.points + "; diff: " + team.diff + ")"));
            console.log("");
        }

        // Step 1
        // As first step upon receiving a table, we sort it according to the current tiebreaker and via .reduce() we group together those entries that are tied according to the criterion in question

        const group = (array, key) => {

            // If this is an overall round, any info from the team from which to base the subarrays has to be based on the origina standings as per the timeline, and not from the groups which may have been tampered with by h2h
            if (iteration.type == "overall" && iteration.index != 0) {
                array = JSON.parse(JSON.stringify(this.timeline[this.timeline.length - 1].filter(team => table.some(element => team.id == element.id))));
            }

            const grouped = JSON.parse(JSON.stringify(array)).reduce((result, currentValue) => {
                const keyValue = currentValue[key];

                if (!result[keyValue]) {
                    result[keyValue] = [];
                }

                result[keyValue].push(currentValue);
                return result;
            }, {});

            return Object.values(grouped);
        };

        const groups = group(table, tiebreaker);
        this.groups.push(groups);

        console.log("Fin qui, l'elemento più recente dei gruppi è...", this.groups[this.groups.length - 1].map(group => group.map(team => team.id + ": " + team[tiebreaker] + " (on " + tiebreaker + ").")));

        // Step 2
        // We take back all elements from the latest entry in the timeline, and we sort them against their positions in the subgroups

        if (this.timeline.length == 0) {

            // At the first step, we always base the sorting just on the table that we were provided
            this.timeline.push(JSON.parse(JSON.stringify(table)).sort((a, b) => {
                return b[tiebreaker] - a[tiebreaker];
            }));
        } else {

            // Otherwise, the sorting happens on the timeline (i.e. on the rows containing the actual data to display), only between those teams that are part of the current subtable that we are examining; the comparison happens over the table itself if the iteration type is overall, and over the groups (which have been rewritten with the 'classifica avulsa') if it is h2h, and then the results are matches by id to sort the timeline as said
            this.timeline.push(JSON.parse(JSON.stringify(this.timeline[this.timeline.length - 1])).sort((a, b) => {
                if (table.some(team => team.id === a.id) &&
                    table.some(team => team.id === b.id)) {
                    if (!final) {

                        let aTeam;
                        let bTeam;

                        for (let group of groups) {
                            aTeam = group.find(team => team.id === a.id);
                            if (aTeam) {
                                break;
                            }
                        }
                        for (let group of groups) {
                            bTeam = group.find(team => team.id === b.id);
                            if (bTeam) {
                                break;
                            }
                        }

                        switch (iteration.type) {
                            case "overall":
                                console.log("\x1b[34mSto confrontando\x1b[0m", a.id, "(", a[tiebreaker], ") \x1b[34mcon\x1b[0m", b.id, "(", b[tiebreaker], ").");
                                return b[tiebreaker] - a[tiebreaker];
                            case "h2h":
                                console.log("\x1b[34mSto confrontando\x1b[0m", aTeam.id, "(", aTeam[tiebreaker], ") \x1b[34mcon\x1b[0m", bTeam.id, "(", bTeam[tiebreaker], ").");
                                return bTeam[tiebreaker] - aTeam[tiebreaker];
                        }
                    } else {

                        // If we have to draw lots, we artificially make each group one so to brea the recursion and then draw teams at random
                        groups.forEach(
                            group => group.length = 1
                        );
                        switch (this.sorting.final) {
                            case "lots":
                                this.cycles[this.cycles.length - 1].type = "lots";
                                return Math.random() > 0.5 ? -1 : 1;
                            case "alphabetical":
                                this.cycles[this.cycles.length - 1].type = "alphabetical";
                                return a.id.localeCompare(b.id);
                        }
                    }
                }
            }));
        }

        console.log("Fin qui, la versione più recente della timeline è...", this.timeline[this.timeline.length - 1].map(team => team.id + " (pts: " + team.points + "; diff: " + team.diff + ")"));

        // Step 3
        // For each of the groups that we have thus obtained, we rerun the function so long as they are at least two in length; however we have to keep a few things in mind, and namely:
        Object.entries(groups).forEach(([key, group]) => {

            // We change the type of iteration only when
            // (a) h2h is set to "before", and thus right after the first iteration we automatically switch to "h2h" and thus ready ourselves to push the cycles
            // (b) an overall list of criteria has run its course and h2h is set at "after" (so h2h next)
            // (c) an h2h list of criteria has run its course, even including the eventual reruns, and h2h is set at "before" (so overall next)

            // To check whether or not these have indeed run their course, we check the array of cycles to see whether the last number of iterations were of the same type, with that number being of course the number of criteria, at which point we decide if we have to switch to another type, rerun h2h for separated teams, or draw lots.

            let change;

            // Function to log and trigger drawing of lots
            const decide = () => {
                final = true;
                console.log("\x1b[35mCurrent teams cannot be resolved further. Proceeding to sort by", this.sorting.final, ".\x1b[0m");
            };

            if (iteration.index === 0 && this.sorting.h2h.when === "before") {
                // Point (a): Initial case when index is 0 and h2h is set to 'before'
                change = "h2h";

            } else if (iteration.type === "overall" && criteriaLimitReached) {
                // Handling "overall" cases based on when h2h should apply
                if (this.sorting.h2h.when === "after") {
                    // Point (b): Set to h2h if overall type, h2h after, and criteria limit reached
                    change = "h2h";
                } else if (this.sorting.h2h.when === "before" && !isProgress()) {
                    // Point (b-bis): Set to drawing of lots if no progress and h2h is "before"
                    decide();
                }

            } else if (iteration.type === "h2h" && criteriaLimitReached) {
                // Point (c): Handle cases when h2h type and criteria limit reached
                if (isProgress()) {
                    // Progress detected, rerun with h2h type
                    change = iteration.type;
                    console.log("\n\x1b[36mProgress detected\x1b[0m: Continuing with current head-to-head sorting.\n");
                    console.log("Comparing previous cycle:", JSON.stringify(this.cycles[cycleIndex].snapshot.map(team => team.id)), "with current table:", JSON.stringify(table.map(team => team.id)), "\n");
                } else if (this.sorting.h2h.when === "before") {
                    // No progress and h2h is "before", switch to overall
                    change = "overall";
                    console.log("\x1b[35mSwitching to overall!\x1b[0m");
                } else {
                    // No progress and h2h is "after", proceed to drawing of lots
                    decide();
                }
            } else {
                // Default case: Use current iteration type
                change = iteration.type;
            }

            // Recursively call with updated iteration type, if group length > 1
            if (group.length > 1) {
                this.recursive(group, { index: iteration.index + 1, type: change }, depth + 1, final);
            }
        });

        return table;
    }

    #run(array, table) {
        if (array.length === 0) return NaN;

        let lastType = array[array.length - 1].type;
        let count = 0;
        for (let i = array.length - 1; i >= 0; i--) {
            if (array[i].type === lastType &&
                table.map(team => team.id).every(table_id => array[i].snapshot.map(team => team.id).includes(table_id))) {
                count++;
            } else {
                break;
            }
        }
        return count - 1;
    }

    //-------------------------------------------------------------------------------------------------------------
    //-------------------------------------------------------------------------------------------------------------

    #computeTableRows(match, key, array) {
        const homeTeamRow = array.find(row => row.id == match.home);
        if (homeTeamRow === undefined) {
            throw new Error(`No team of ID ${match.home} has been given at construction time (first thrown at the home team of match with match ID ${key}).`);
        }
        homeTeamRow.played++;
        homeTeamRow.for += match.home_for;
        homeTeamRow.against += match.away_for;
        homeTeamRow.diff = homeTeamRow.for - homeTeamRow.against;

        const awayTeamRow = array.find(row => row.id == match.away);
        if (awayTeamRow === undefined) {
            throw new Error(`No team with this ID has been given at construction time (first thrown at the away team of match with match ID ${key}).`);
        }
        awayTeamRow.played++;
        awayTeamRow.for += match.away_for;
        awayTeamRow.away_for += match.away_for;
        awayTeamRow.against += match.home_for;
        awayTeamRow.diff = awayTeamRow.for - awayTeamRow.against;

        if (match.home_for > match.away_for) {
            homeTeamRow.won++;
            awayTeamRow.lost++;
        } else if (match.home_for == match.away_for) {
            homeTeamRow.drawn++;
            awayTeamRow.drawn++;
        } else if (match.home_for < match.away_for) {
            homeTeamRow.lost++;
            awayTeamRow.won++;
            awayTeamRow.away_won++;
        }

        this.#computePoints(homeTeamRow, awayTeamRow);
    }

    #computePoints(homeTeamRow, awayTeamRow) {
        switch (this.points) {
            case "standard":
                homeTeamRow.points = 3 * homeTeamRow.won + homeTeamRow.drawn;
                awayTeamRow.points = 3 * awayTeamRow.won + awayTeamRow.drawn;
                break;
            case "old":
                homeTeamRow.points = 2 * homeTeamRow.won + homeTeamRow.drawn;
                awayTeamRow.points = 2 * awayTeamRow.won + awayTeamRow.drawn;
                break;
            default:
                if (typeof this.points === "function" && this.points.length >= 3) {
                    homeTeamRow.points = this.points(homeTeamRow.won, homeTeamRow.drawn, homeTeamRow.lost);
                    awayTeamRow.points = this.points(awayTeamRow.won, awayTeamRow.drawn, awayTeamRow.lost);
                } else if (typeof this.points === "function" && this.points.length < 3) {
                    throw new Error("When given as a function, the 'points' value must accept at least three parameters (matches won, drawn, lost).");
                } else {
                    throw new Error("The 'points' value must either be a default string parameter or a function (check for typos).");
                }
        }
    }

    #longNames(shorthand) {
        switch (shorthand) {
            case "points":
                return "points";
            case "diff":
                return "goal difference";
            case "for":
                return "goals scored";
            case "won":
                return "number of games won";
            case "lots":
                return "drawing of random lots";
            case "alphabetical":
                return "the alphabetical order of their names";
        }
    }
}
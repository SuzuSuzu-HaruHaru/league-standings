export default class LeagueTable {

    constructor(data) {
        if (data === null || typeof data !== "object") {
            throw new Error(`Invalid constructor argument (expected an object).`);
        } else if (!("teams" in data)) {
            throw new Error(`Invalid constructor argument (object must at least contain a key named "teams").`);
        }

        // Checks whether or not the identifiers provided for the teams are unique
        if (new Set(data.teams).size !== data.teams.length) {
            throw new Error(`Team identifiers must be unique.`);
        } else {
            this.teams = data.teams;
        }

        // Checks whether the inputs for the optional fields are correct, and fills them in if they are not present
        if (!("format" in data)) {
            this.format = "round-robin";
        } else if (data.format !== "round-robin" && data.format !== "home-and-away") {
            throw new Error(`An explicitly specified "format" must be either "round-robin" or "home-and-away".`);
        } else {
            this.format = data.format;
        }

        if (!("points" in data)) {
            this.points = "standard";
        } else if (data.points !== "standard" && data.points !== "classic" && typeof data.points !== "function") {
            throw new Error(`An explicitly specified "points" must be either "standard", "classic" or a function.`);
        } else {
            this.points = data.points;
        }

        if (!("sorting" in data)) {
            this.sorting = {
                criteria: ["diff", "for", "won"],
                h2h: {
                    when: "before",
                    span: "all"
                },
                final: "lots"
            };
        } else if (data.sorting == "FIFA") {
            this.sorting = {
                criteria: ["diff", "for"],
                h2h: {
                    when: "after",
                    span: "all"
                },
                final: "lots"
            };
        } else if (data.sorting == "UEFA") {
            this.sorting = {
                criteria: ["diff", "for"],
                h2h: {
                    when: "before",
                    span: "all"
                },
                final: "lots"
            };
        } else if (data.sorting == "pre-2021-UEFA") {
            this.sorting = {
                criteria: ["diff", "for", "away_for"],
                h2h: {
                    when: "before",
                    span: "all"
                },
                final: "lots"
            };
        } else {
            if (typeof data.sorting !== "object") {
                throw new Error(`An explicitly specified "sorting" must be an object.`);
            }

            const { criteria, h2h, final } = data.sorting;
            if (!criteria || !h2h || !final) {
                throw new Error(`An explicitly specified "sorting" must contain keys named "criteria", "h2h", and "final".`);
            }

            if (!Array.isArray(criteria)) {
                throw new Error(`An explicitly specified "sorting.criteria" must be an array.`);
            }
            const allowed = ["diff", "for", "won", "away_for", "away_won"];
            for (const criterion of criteria) {
                if (!allowed.includes(criterion)) {
                    throw new Error(`An explicitly specified "sorting.criteria" can only contain the strings "diff", "for", "won", "away_for", or "away_won". Found invalid criterion: "${criterion}".`);
                }
            }

            if (typeof h2h !== "object" || !("when" in h2h) || !("span" in h2h)) {
                throw new Error(`An explicitly specified "sorting.h2h" must be an object containing keys named "when" and "span".`);
            }
            if (h2h.when !== "before" && h2h.when !== "after") {
                throw new Error(`An explicitly specified "sorting.h2h.when" must be either "before" or "after". Found: "${h2h.when}".`);
            }
            if (h2h.span !== "all" && h2h.span !== "single") {
                throw new Error(`An explicitly specified "sorting.h2h.span" must be either "all" or "single". Found: "${h2h.span}".`);
            }

            if (typeof final !== "string" || (final !== "lots" && final !== "alphabetical")) {
                throw new Error(`An explicitly specified "sorting.final" must be either "lots" or "alphabetical". Found: "${final}".`);
            }

            this.sorting = data.sorting;
        }

        this.matches = new Map();

        this.cycles = [];
        this.groups = [];
        this.timeline = [];

        this.information = [];
        this.warning = false;
    }

    addMatches(data) {
        const identifiers = new Set();
        data.forEach(item => {
            if (identifiers.has(item[0])) {
                throw new Error(`Match identifiers must be unique (first thrown at a match with match identifier ${item[0]}).`);
            } else {
                identifiers.add(item[0]);
            }

            this.matches.set(item[0], {
                matchday: item[1],
                home: item[2],
                away: item[3],
                home_for: item[4],
                away_for: item[5]
            });
        });

        switch (this.format) {
            case "round-robin":
                for (const team of this.teams) {
                    const matchCount = Array.from(this.matches.values()).filter(
                        match => match.home === team || match.away === team
                    ).length;

                    if (matchCount > this.teams.length - 1) {
                        console.warn(`Round-robin format should allow for only one match between given teams.`);
                        break;
                    }
                }
                break;
            case "home-and-away":
                for (const team of this.teams) {
                    const matchCount = Array.from(this.matches.values()).filter(
                        match => match.home === team || match.away === team
                    ).length;

                    if (matchCount > (2 * this.teams.length) - 1) {
                        console.warn(`Round-robin format should allow for only one match between given teams.`);
                        break;
                    }
                }
                break;
        }

        const groupedByMatchday = Array.from(this.matches.values()).reduce((acc, match) => {
            if (!acc[match.matchday]) {
                acc[match.matchday] = [];
            }
            acc[match.matchday].push(match);
            return acc;
        }, {});

        for (const matchdayGroup of Object.values(groupedByMatchday)) {
            const uniqueTeams = new Set();
            matchdayGroup.forEach(match => {
                uniqueTeams.add(match.home);
                uniqueTeams.add(match.away);
            });

            if (uniqueTeams.size !== this.teams.length) {
                console.warn(`Each team may only appear once per matchday.`);
                break;
            }
        }

    }

    ties(options) {
        const explainAndDivideGroup = (group, depth = 1) => {

            /* EXPLANATION
            
            This is the main function that is called to describe the various ties that have been encountered and resolved while sorting the table. It is a recursive function, with a recursive failsafe set at depth 50.
            
            ALGORITHM
            The algorithm is the following:
            
                (1) if this is the first iteration, then we merely state which teams are tied on points at the very start;
                (2) we run through all of this.groups and find the latest entry that contains all of the teams that we are currently working on at this iteration, as this means that this is the iteration where they are broken (remember that due to the recursive nature of this.#recursive, the groups in this.groups can only get smaller and smaller); thus, if this is this.groups[index], we look at this.cycles[index + 1] to actually retrieve information about which criterion has been used at that step, or whether this criteria is of type head-to-head or overall; (*)
                (3) from the current group of teams we filter out those whose property is non-unique;
                (4) if what remains is of length at least two, we reapply the recursive function. 

            */

            // Recursion failsafe
            if (depth > 50) {
                throw new Error("Maximum recursion depth exceeded for the information messages.");
            }

            let information = {
                group: group.map(team => team.id),
                messages: []
            };

            this.information.push(information);

            // Step (1) of the algorithm
            if (depth == 1) {
                information.messages.push(`${formatNames(group.map(team => team.id))} are tied on points (${this.cycles[0].snapshot.filter(team => group.some(element => element.id == team.id))[0].points}).`);
            }

            // Step (2) of the algorithm
            const history = [];

            const groupIds = group.map(_team => _team.id);

            JSON.parse(JSON.stringify(this.groups)).forEach(step => {
                step.forEach(_group => {
                    if (groupIds.every(id => _group.map(team => team.id).includes(id))) {
                        history.push(step);
                    }
                });
            });

            const target = JSON.stringify(history[history.length - 1]);
            const index = JSON.parse(JSON.stringify(this.groups)).length - 1 - JSON.parse(JSON.stringify(this.groups)).slice().reverse().findIndex(step => JSON.stringify(step) === target);

            const h2h = this.cycles[index + 1].type == "h2h" ?
                "head-to-head " :
                "overall ";

            const criterion = this.cycles[index + 1].criterion;;
            switch (this.cycles[index + 1].type) {
                case "lots":
                    information.messages.push(`${formatNames(group.map(team => team.id))} are sorted on drawing of random lots.`);
                    break;
                case "alphabetical":
                    information.messages.push(`${formatNames(group.map(team => team.id))} are sorted on the alphabetical order of their names.`);
                    break;
                default:
                    information.messages.push(`${formatNames(group.map(team => team.id))} are sorted on ${h2h}${this.#longNames(criterion)} (${this.cycles[index + 1].snapshot.sort((a, b) => { b[criterion] - a[criterion] }).map(team => `${team.id}: ${team[criterion]}`).join('; ')}).`);
                    break
            }

            const filterNonUnique = (arr, property) => {
                if (arr.length == 2 && this.cycles[index + 1].snapshot[0][property] != this.cycles[index + 1].snapshot[1][property]) {
                    arr.length = 1;
                    return arr;
                }

                // If the next step will be a random one, we may as well cut here.
                if (this.cycles[index + 1].type == "lots" || this.cycles[index + 1].type == "calphabetical" || index == this.groups.length - 2) {
                    arr.length = 1;
                    return arr;
                }

                const propertyCounts = arr.reduce((counts, obj) => {
                    const key = obj[property];
                    counts[key] = (counts[key] || 0) + 1;
                    return counts;
                }, {});

                return arr.filter(obj => propertyCounts[obj[property]] > 1);
            }

            // Step (3) of the algorithm
            const newGroup = filterNonUnique(group, criterion);

            // Step (4) of the algorithm
            if (newGroup.length > 1) {
                explainAndDivideGroup(newGroup, depth + 1);
            }

            // Utility function for English grammar
            function formatNames(names) {
                if (names.length === 0) return '';
                if (names.length === 1) return names[0];
                if (names.length === 2) return names.join(' and ');

                const last = names[names.length - 1];
                const others = names.slice(0, -1).join(', ');
                return `${others} and ${last}`;
            }
        }

        // We iterate over the groups of length greater than 1 in the first element of this.groups, are these are the teams that were tied in the first place and thus need explaining.
        JSON.parse(JSON.stringify(this.groups))[0].forEach(group => {
            if (group.length > 1) {
                explainAndDivideGroup(JSON.parse(JSON.stringify(group)));
            }
        });

        switch (options) {
            case undefined:
                return this.information;
            case "sequential":
                return this.information.map(group => group.messages).flat();
            case "raw":
                return this.cycles;
            default:
                throw new Error(`The argument of .ties() can only be "sequential", "raw" or none.`);
        }
    }

    standings(options) {

        /* EXPLANATION

        This method relies on the private method this.#recursive which, as the name implies, is applied recursively until the table is sorted. More on this in the appropriate method below.

        For now, we initialize the standings by pushing a row for each team and filling it in with the points, the goals scored and such as per the matches that have been given by the user.
        */

        const standings = [];

        if (!this.matches.size) {
            throw new Error(`Matches array is empty (no matches have been provided for this instance of LeagueTable).`);
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

            // As the first criteria is always points, there is no need for the user to input it manually in the list; but as we need it for the sorting, we add it here.
            this.sorting.criteria.unshift("points");
        }

        const sortAndDivideTable = (table, iteration, depth = 1, final = false) => {

            /* EXPLANATION
    
            This is the main function that is called to sort the teams into the table. It is a recursive function, with a recursive failsafe set at depth 50.
    
            ALGORITHM     
            The algorithm is the following:
    
                (1) at any given step, we have a table consisting of the teams to be sorted and their relative data; if this is the first iteration, the table consists of all teams;
                (2) if the current sorting criterion is of type head-to-head, the table in question is rewritten so that the data is only relative to the matches that were played between the teams in question (if the span is set to "all", then this is only recomputed for the teams that are still even when a cycle is completed and we are back to points; otherwise, if it is set to "single", we do it every single time);
                (3) the table is divided according to the current criterion by pairing up teams that are still tied: for example, for Team A (pts 6), Team B (pts 3), Team C (pts 6), with the current criterion being points, we would end up with an array [[Team A, Team C], [Team C]] (where each entry in the subarrays is an object containing all the relevant information about the teams) which is then pushed into this.groups.
    
                Now it is time to sort the teams: if this is the first iteration, an array that contains the initial standings is pushed into this.timeline; for all other iterations, the latest entry of this.timeline is retrieved, sorted and pushed as a new entry back into this.timeline; when the recursion eventually ends, the latest entry will be the output of the entire sorting process. As the entries in this.timeline are never rewritten even during sorting criteria of type head-to-head, the overall data for each team is conserved which is exactly what we want when we need to actually print the final table for viewing purposes.
    
                (4) As for the sorting itself:
                    only teams that are part of the table that is being considered at this recursion level are taken into account, and they are sorted according to the values they have (by matching via team id)
                        - in the latest entry of this.timeline, if the current sorting critetion is of type overall;
                        - in the latest entry of this.groups, if the current sorting critetion is of type head-to-head.
    
                (5) And finally, the recursive step: for each of the groups obtained in (3), so long as their length is at least 2, we call this,#recursive again on them.
                (6) When a new iteration starts, under general circumstances the next criterion in the list is applied this time.
    
            This process is guaranteed to end because, if a group contains teams that are sortable according to the current criterion, each of the subarrays will be of length strictly smaller; and if not, and some of the teams remain even for all the criteria, the method activates the "final" variable which sorts the teams either by drawing of random lots or by alphabetical order, and then artificially makes the group of length 1 to guarantee that the recursion ends for this specific group.
    
            VARIABLES
                run:
                    the number of consecutive steps of the same type (overall or head-to-head) that we have taken so far, up to and including the latest one; when this reaches the length of the array, we trigger the checks for deciding what to do next (switching to head-to-head, or switching to overall, or reapplying head-to-head to a subset of the team concerned, or proceding to randomization).
                this.cycles:
                    array whose each entry contains information about the current sorting step (head-to-head or overall, criterion used, teams being sorted which reflect those in the this.groups element of index one fewer).
            */

            // Recursion failsafe
            if (depth > 50) {
                throw new Error(`Maximum recursion depth exceeded while trying to sort the teams.`);
            }

            let tiebreaker;
            let run;

            // The new this.cycle entry for this iteration
            this.cycles.push({
                type: iteration.type,
                criterion: null,
                snapshot: JSON.parse(JSON.stringify(table))
            });

            run = this.#run(this.cycles, table) % this.sorting.criteria.length;

            // Values and booleans needed for deciding what to do next at the end of each run
            const criteriaLimitReached = run > this.sorting.criteria.length - 2;
            const cycleIndex = this.cycles.length - run - 1;
            const isProgress = () => JSON.stringify(this.cycles[cycleIndex].snapshot.map(team => team.id)) !== JSON.stringify(table.map(team => team.id));

            // If the sorting type is head-to-head and the span is set to "single", and we are doing progress (i.e. one or more teams have broken away from the tie), then even before the run has completed we set it back to zero so to reapply the criteria from the beginning (points)
            if (iteration.index > 2 && iteration.type === "h2h" && isProgress()) {
                this.sorting.h2h.span == "single" ?
                    run = 0 :
                    null;
            }

            tiebreaker = this.sorting.criteria[run];
            this.cycles[this.cycles.length - 1].criterion = tiebreaker;

            // Step (2) of the algorithm
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

                this.cycles[this.cycles.length - 1].snapshot = JSON.parse(JSON.stringify(table));
                this.cycles[this.cycles.length - 1].type = "h2h";
            }

            // Step (3) of the algorithm
            const group = (array, key) => {

                // If this is an overall round, any info from the team from which to create the subarrays has to be based on the original standings as per the timeline, and not from the groups themselves which are susceptible to rewriting
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

            // Step (4) of the algorithm
            if (this.timeline.length == 0) {
                this.timeline.push(JSON.parse(JSON.stringify(table)).sort((a, b) => {
                    return b[tiebreaker] - a[tiebreaker];
                }));
            } else {
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
                                    return b[tiebreaker] - a[tiebreaker];
                                case "h2h":
                                    return bTeam[tiebreaker] - aTeam[tiebreaker];
                            }
                        } else {
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

            // Step (5) of the algorithm
            Object.entries(groups).forEach(([key, group]) => {

                /* EXPLANATION
                
                Reminder that, at the end of a run, we change the type of iteration (from head-to-head to overall or vice versa) only when:
                    (a) h2h.when is set to "before", and thus right after the first iteration we automatically switch from the default overall to head-to-head;
                    (b) an overall list of criteria has run its course and h2h.when is set to "after", so head-to-head criteria are coming next;
                    (c) an head-to-head list of criteria has run its course, even including any reruns for teams that have broken away from the ties, and h2h.when is set to "before", so overall criteria are coming next.
    
                This also includes the triggering of final = true in case there is nothing coming up next (e.g. an overall run of criteria reaching its limit while h2h.when was set to "before", and so those are already gone too).
                */

                let change;

                // Function to log and trigger drawing of lots
                const finalize = () => {
                    final = true;
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
                        finalize();
                    }

                } else if (iteration.type === "h2h" && criteriaLimitReached) {
                    // Point (c): Handle cases when h2h type and criteria limit reached
                    if (isProgress()) {
                        // Progress detected, rerun with h2h type
                        change = iteration.type;
                    } else if (this.sorting.h2h.when === "before") {
                        // No progress and h2h is "before", switch to overall
                        change = "overall";
                    } else {
                        // No progress and h2h is "after", proceed to drawing of lots
                        finalize();
                    }
                } else {
                    // Default case: Use current iteration type
                    change = iteration.type;
                }

                // Recursively call with updated iteration type, if group length > 1
                if (group.length > 1) {
                    sortAndDivideTable(group, { index: iteration.index + 1, type: change }, depth + 1, final);
                }
            });

            return table;
        }

        sortAndDivideTable(standings, {
            index: 0,
            type: "overall"
        })

        switch (options) {
            case "all":
                return this.timeline[this.timeline.length - 1];
            default:
                return this.timeline[this.timeline.length - 1].map(({ away_for, away_won, ...rest }) => rest);
        }
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
            case "away_for":
                return "number of goals scored away from home";
            case "away_won":
                return "number of games won away from home";
            case "lots":
                return "drawing of random lots";
            case "alphabetical":
                return "the alphabetical order of their names";
        }
    }
}
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
        } else if (data.points !== "standard" && data.points !== "old" && typeof data.points !== "function") {
            throw new Error(`An explicitly specified "points" must be either "standard", "old" or a function.`);
        } else if (typeof data.points === "function" && data.points.length != 3) {
            throw new Error(`An explicitly specified "points" that is a function must accept exactly three parameters (matches won, drawn, lost).`);
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
                    span: "single"
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

        this.names = {};
        if (!("names" in data)) {
            this.names.points = "points";
            this.names.diff = "goal difference";
            this.names.for = "number of goals scored";
            this.names.won = "number of games won";
            this.names.away_for = "number of goals scored away from home";
            this.names.away_won = "number of games won away from home";
            this.names.lots = "on drawing of random lots";
            this.names.alphabetical = "on the alphabetical order of their names";
            this.names.h2h = "head-to-head";
            this.names.overall = "overall";
        } else if (typeof data.names !== "object") {
            throw new Error(`An explicitly specified "names" must be an object.`);
        } else {
            if (!("points" in data.names)) {
                this.names.points = "points";
            } else {
                this.names.points = data.names.points;
            }

            if (!("diff" in data.names)) {
                this.names.diff = "goal difference";
            } else {
                this.names.diff = data.names.diff;
            }

            if (!("for" in data.names)) {
                this.names.for = "number of goals scored";
            } else {
                this.names.for = data.names.for;
            }

            if (!("won" in data.names)) {
                this.names.won = "number of games won";
            } else {
                this.names.won = data.names.won;
            }

            if (!("away_for" in data.names)) {
                this.names.away_for = "number of goals scored away from home";
            } else {
                this.names.away_for = data.names.away_for;
            }

            if (!("away_won" in data.names)) {
                this.names.away_won = "number of games won away from home";
            } else {
                this.names.away_won = data.names.away_won;
            }

            if (!("lots" in data.names)) {
                this.names.lots = "drawing of random lots";
            } else {
                this.names.lots = data.names.lots;
            }

            if (!("alphabetical" in data.names)) {
                this.names.alphabetical = "the alphabetical order of their names";
            } else {
                this.names.alphabetical = data.names.alphabetical;
            }

            if (!("h2h" in data.names)) {
                this.names.h2h = "head-to-head";
            } else {
                this.names.h2h = data.names.h2h;
            }

            if (!("overall" in data.names)) {
                this.names.overall = "overall";
            } else {
                this.names.overall = data.names.overall;
            }
        }

        this.matches = new Map();

        this.cycles = [];
        this.groups = [];
        this.timeline = [];

        this.information = [];
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
        const groups = JSON.parse(JSON.stringify(this.groups));

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
                information.messages.push(`${formatNames(group.map(team => team.id))} are tied on ${this.names.points} (${this.cycles[0].snapshot.filter(team => group.some(element => element.id == team.id))[0].points}).`);
            }

            // Step (2) of the algorithm
            const history = [];
            const groupIds = group.map(team => team.id);

            groups.forEach(step => {
                step.forEach(_group => {
                    if (groupIds.every(id => _group.map(team => team.id).includes(id))) {
                        history.push(step);
                    }
                });
            });

            const index = (groups.length - 1) - groups.slice().reverse().findIndex(step => JSON.stringify(step) === JSON.stringify(history[history.length - 1]));
            const type = this.cycles[index + 1].type == "h2h" ?
                this.names.h2h + " " :
                this.names.overall + " ";
            const criterion = this.cycles[index + 1].criterion;
            const special = this.cycles[index + 1].special ?
                `Reapplying criteria 1-${this.sorting.criteria.length}: ` :
                "";

            switch (this.cycles[index + 1].type) {
                case "lots":
                    information.messages.push(`${formatNames(group.map(team => team.id))} are sorted ${this.names.lots}.`);
                    break;
                case "alphabetical":
                    information.messages.push(`${formatNames(group.map(team => team.id))} are sorted ${this.names.alphabetical}.`);
                    break;
                default:
                    // If more than two teams were tied and are now being resolved, we esclude from the message those that are still tied
                    const snapshot = this.cycles[index + 1].snapshot;
                    const pointsCount = snapshot.reduce((count, obj) => {
                        count[obj[criterion]] = (count[obj[criterion]] || 0) + 1;
                        return count;
                    }, {});

                    const sorted = snapshot.filter(team => pointsCount[team[criterion]] === 1);

                    if (group.length > 2 && group.length != sorted.length) {
                        if (sorted.length == 1) {
                            information.messages.push(`${special}The position of ${formatNames([sorted[0].id])} is decided on ${type}${this.#longNames(criterion)} (${this.cycles[index + 1].snapshot.sort((a, b) => { b[criterion] - a[criterion] }).map(team => `${team.id}: ${team[criterion]}`).join('; ')}).`);
                        } else {
                            information.messages.push(`${special}${formatNames(sorted.map(team => team.id))} are sorted on ${type}${this.#longNames(criterion)} (${this.cycles[index + 1].snapshot.sort((a, b) => { b[criterion] - a[criterion] }).map(team => `${team.id}: ${team[criterion]}`).join('; ')}).`);
                        }
                    } else {
                        information.messages.push(`${special}${formatNames(group.map(team => team.id))} are sorted on ${type}${this.#longNames(criterion)} (${this.cycles[index + 1].snapshot.sort((a, b) => { b[criterion] - a[criterion] }).map(team => `${team.id}: ${team[criterion]}`).join('; ')}).`);
                    }
                    break
            }

            const filterNonUnique = (array, property) => {
                if (array.length == 2 && this.cycles[index + 1].snapshot[0][property] != this.cycles[index + 1].snapshot[1][property]) {
                    array.length = 1;
                    return array;
                }

                // If the next step will be a random one, we may as well cut here.
                if (this.cycles[index + 1].type == "lots" || this.cycles[index + 1].type == "calphabetical" || index == this.groups.length - 2) {
                    array.length = 1;
                    return array;
                }

                const propertyCounts = array.reduce((counts, obj) => {
                    const key = obj[property];
                    counts[key] = (counts[key] || 0) + 1;
                    return counts;
                }, {});

                return array.filter(obj => propertyCounts[obj[property]] > 1);
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
        groups[0].forEach(group => {
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

            this.matches.forEach((match, index) => {
                this.#computeTableRows(match, index, standings);
            });

            // As the first criteria is always points, there is no need for the user to input it manually in the list; but as we need it for the sorting, we add it here.
            this.sorting.criteria.unshift("points");
        }

        const sortAndDivideTable = (table, iteration, depth = 1, final = false, special = false) => {

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

            // The new this.cycle entry for this iteration
            const current = 
            this.cycles.push({
                type: iteration.type,
                criterion: null,
                special: false,
                snapshot: JSON.parse(JSON.stringify(table))
            });
            let run;
            let tiebreaker;

            if (special) {
                run = 0;
                tiebreaker = this.sorting.criteria[0];
                this.cycles[this.cycles.length - 1].special = true;
                special = false;
            } else {
                run = this.#run(this.cycles, table) % this.sorting.criteria.length;
                tiebreaker = this.sorting.criteria[run];
            }

            // Values and booleans needed for deciding what to do next at the end of each run
            const criteriaLimitReached = run > this.sorting.criteria.length - 2;
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

                matches.forEach((match, index) => {
                    this.#computeTableRows(match, index, table);
                });

                this.cycles[this.cycles.length - 1].snapshot = JSON.parse(JSON.stringify(table));
                this.cycles[this.cycles.length - 1].type = "h2h";
            }

            // Step (3) of the algorithm
            const groupByTiebreaker = (array, key) => {

                // If this is an overall round, any info from the team from which to create the subarrays has to be based on the original standings as per the timeline, and not from the groups themselves which are susceptible to rewriting
                if (iteration.type == "overall" && iteration.index != 0) {
                    array = JSON.parse(JSON.stringify(this.timeline[this.timeline.length - 1].filter(team => table.some(element => team.id == element.id))));
                }

                const groupedByValue = JSON.parse(JSON.stringify(array)).reduce((result, currentValue) => {
                    const keyValue = currentValue[key];

                    if (!result[keyValue]) {
                        result[keyValue] = [];
                    }

                    result[keyValue].push(currentValue);
                    return result;
                }, {});

                return Object.values(groupedByValue);
            };

            const groups = groupByTiebreaker(table, tiebreaker);
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

                            for (const group of groups) {
                                aTeam = group.find(team => team.id === a.id);
                                if (aTeam) {
                                    break;
                                }
                            }
                            for (const group of groups) {
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
                            groups.forEach(group => group.length = 1);

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

            // If the sorting type is head-to-head and the span is set to "single", and we are doing progress (i.e. one or more teams have broken away from the tie), then even before the run has completed we set it back to zero so to reapply the criteria from the beginning (points)
            const isProgress = () => groups.length > 1;

            if (iteration.index >= 2 && this.sorting.h2h.span == "single" && iteration.type === "h2h" && isProgress()) {
                run = 0;
                tiebreaker = this.sorting.criteria[0];
                special = true;
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
                const finalize = () => final = true;

                if (iteration.index === 0 && this.sorting.h2h.when === "before") {
                    // Point (a)
                    change = "h2h";
                } else if (iteration.type === "overall" && criteriaLimitReached) {
                    // Point (b)
                    if (this.sorting.h2h.when === "after") {
                        change = "h2h";
                    } else if (this.sorting.h2h.when === "before" && !isProgress()) {
                        finalize();
                    }
                } else if (iteration.type === "h2h" && criteriaLimitReached) {
                    // Point (c)
                    if (isProgress()) {
                        change = iteration.type;
                    } else if (this.sorting.h2h.when === "before") {
                        change = "overall";
                    } else {
                        finalize();
                    }
                } else {
                    change = iteration.type;
                }

                // The recursive step, where we call the function again if the length of the group is greater than one
                if (group.length > 1) {
                    sortAndDivideTable(group, { index: iteration.index + 1, type: change }, depth + 1, final, special);
                }
            });

            return table;
        }

        // The initial step, where we provide the initial standings to initiate the recursive sorting algorithm
        sortAndDivideTable(standings, {
            index: 0,
            type: "overall"
        })

        switch (options) {
            case undefined:
                return this.timeline[this.timeline.length - 1].map(({ away_for, away_won, ...rest }) => rest);
            case "all":
                return this.timeline[this.timeline.length - 1];
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

    #computeTableRows(match, index, teams) {
        const homeTeamRow = teams.find(team => team.id == match.home);
        if (homeTeamRow === undefined) {
            throw new Error(`No team of identifier ${match.home} has been given at construction time (first thrown at the home team of the match with match identifier ${index}).`);
        }
        homeTeamRow.played++;
        homeTeamRow.for += match.home_for;
        homeTeamRow.against += match.away_for;
        homeTeamRow.diff = homeTeamRow.for - homeTeamRow.against;

        const awayTeamRow = teams.find(team => team.id == match.away);
        if (awayTeamRow === undefined) {
            throw new Error(`No team of identifier ${match.away} has been given at construction time (first thrown at the away team of the match with match identifier ${index}).`);
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
                homeTeamRow.points = parseInt(this.points(homeTeamRow.won, homeTeamRow.drawn, homeTeamRow.lost));
                awayTeamRow.points = parseInt(this.points(awayTeamRow.won, awayTeamRow.drawn, awayTeamRow.lost));
        }
    }

    #longNames(shorthand) {
        switch (shorthand) {
            case "points":
                return this.names.points;
            case "diff":
                return this.names.diff;
            case "for":
                return this.names.for;
            case "won":
                return this.names.won;
            case "away_for":
                return this.names.away_for;
            case "away_won":
                return this.names.away_won;
        }
    }
}
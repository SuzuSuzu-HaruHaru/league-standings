export default class LeagueTable {

    constructor(data) {
        if (data === null || typeof data !== "object") {
            throw new TypeError(`Invalid constructor argument (expected an object).`);
        } else if (!("teams" in data)) {
            throw new RangeError(`Invalid constructor argument (object must at least contain a key named "teams").`);
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
            throw new RangeError(`An explicitly specified "points" must be either "standard", "old" or a function.`);
        } else if (typeof data.points === "function" && data.points.length != 3) {
            throw new RangeError(`An explicitly specified "points" that is a function must accept exactly three arguments (matches won, drawn, lost).`);
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
                additional: [],
                shootout: false,
                flags: [],
                final: "lots"
            };
        } else if (data.sorting == "FIFA World Cup") {
            this.sorting = {
                criteria: ["diff", "for"],
                h2h: {
                    when: "after",
                    span: "none"
                },
                additional: [],
                shootout: false,
                flags: [{
                    name: "fair play points",
                    order: "desc"
                }],
                final: "lots"
            };
            this.flagNames = this.sorting.flags.map(flag => flag.name.replace(/ /g, '_'));
        } else if (data.sorting == "UEFA Euro") {
            this.sorting = {
                criteria: ["diff", "for"],
                h2h: {
                    when: "before",
                    span: "all"
                },
                additional: [],
                shootout: true,
                flags: [{
                    name: "disciplinary points",
                    order: "asc"
                }, {
                    name: "European Qualifiers overall ranking",
                    order: "asc"
                }],
                final: "lots"
            };
            this.flagNames = this.sorting.flags.map(flag => flag.name.replace(/ /g, '_'));
        } else if (data.sorting == "pre-2021 UEFA Champions League") {
            this.sorting = {
                criteria: ["diff", "for", "away_for"],
                h2h: {
                    when: "before",
                    span: "all"
                },
                additional: ["won", "away_won"],
                shootout: false,
                flags: [{
                    name: "disciplinary points",
                    order: "asc"
                }, {
                    name: "UEFA club coefficient",
                    order: "asc"
                }],
                final: "lots"
            };
            this.flagNames = this.sorting.flags.map(flag => flag.name.replace(/ /g, '_'));
        } else if (data.sorting == "2021-2024 UEFA Champions League") {
            this.sorting = {
                criteria: ["diff", "for"],
                h2h: {
                    when: "before",
                    span: "all"
                },
                additional: ["away_for", "won", "away_won"],
                shootout: false,
                flags: [{
                    name: "disciplinary points",
                    order: "asc"
                }, {
                    name: "UEFA club coefficient",
                    order: "asc"
                }],
                final: "lots"
            };
            this.flagNames = this.sorting.flags.map(flag => flag.name.replace(/ /g, '_'));
        } else {
            if (typeof data.sorting !== "object") {
                throw new TypeError(`An explicitly specified "sorting" must be either an object or a default keyword.`);
            }

            const { criteria, h2h, additional, shootout, flags, final } = data.sorting;
            if (criteria === undefined ||
                h2h === undefined ||
                final === undefined) {
                throw new RangeError(`An explicitly specified "sorting" must contain keys named "criteria", "h2h" and "final".`);
            }

            const allowed = ["diff", "for", "won", "away_for", "away_won"];
            if (!Array.isArray(criteria)) {
                throw new TypeError(`An explicitly specified "sorting.criteria" must be an array.`);
            }
            for (const criterion of criteria) {
                if (!allowed.includes(criterion)) {
                    throw new RangeError(`An explicitly specified "sorting.criteria" can only contain the strings "diff", "for", "won", "away_for", or "away_won". Found invalid criterion: "${criterion}".`);
                }
            }

            if (typeof h2h !== "object" || !("when" in h2h) || !("span" in h2h)) {
                throw new RangeError(`An explicitly specified "sorting.h2h" must be an object containing keys named "when" and "span".`);
            }
            if (h2h.when !== "before" && h2h.when !== "after") {
                throw new RangeError(`An explicitly specified "sorting.h2h.when" must be either "before" or "after". Found: "${h2h.when}".`);
            }
            if (h2h.span !== "all" && h2h.span !== "single" && h2h.span !== "none") {
                throw new RangeError(`An explicitly specified "sorting.h2h.span" must be either "all", "single" or "none". Found: "${h2h.span}".`);
            }

            if (additional === undefined) {
                data.sorting.additional = [];
            } else if (!Array.isArray(additional)) {
                throw new TypeError(`An explicitly specified "sorting.additional" must be an array.`);
            } else {
                for (const criterion of additional) {
                    if (!allowed.includes(criterion)) {
                        throw new RangeError(`An explicitly specified "sorting.additional" can only contain the strings "diff", "for", "won", "away_for", or "away_won". Found invalid criterion: "${criterion}".`);
                    }
                }
            }

            if (shootout === undefined) {
                data.sorting.shootout = false;
            } else if (typeof shootout !== "boolean") {
                throw new TypeError(`An explicitly specified "sorting.shootout" must be a boolean. Found: "${shootout}".`);
            }

            if (flags === undefined) {
                data.sorting.flags = [];
                this.flagNames = [];
            } else if (!Array.isArray(flags)) {
                throw new TypeError(`An explicitly specified "sorting.flags" must be an array.`);
            } else {
                for (const flag of flags) {
                    if (typeof flag !== "object" || !("name" in flag) || !("order" in flag)) {
                        throw new RangeError(`Each element in "sorting.flags" must be an object containing keys "name" and "order". Found: ${JSON.stringify(flag)}.`);
                    }
                    if (typeof flag.name !== "string") {
                        throw new TypeError(`The "name" in each "sorting.flags" element must be a string. Found: "${flag.name}".`);
                    }
                    if (flag.order !== "asc" && flag.order !== "desc") {
                        throw new RangeError(`The "order" in each "sorting.flags" element must be either "asc" or "desc". Found: "${flag.order}".`);
                    }
                }

                // If the flags are explicitly given, let us add them
                this.flagNames = data.sorting.flags.map(flag => flag.name.replace(/ /g, '_'));
            }

            if (typeof final !== "string" || (final !== "lots" && final !== "alphabetical")) {
                throw new RangeError(`An explicitly specified "sorting.final" must be either "lots" or "alphabetical". Found: "${final}".`);
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
            this.names.lots = "drawing of random lots";
            this.names.alphabetical = "the alphabetical order of their names";
            this.names.h2h = "head-to-head";
            this.names.overall = "overall";
        } else if (typeof data.names !== "object") {
            throw new TypeError(`An explicitly specified "names" must be an object.`);
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

        // The compulsory "teams" field
        if (Array.isArray(data.teams)) {
            if (data.teams.every(item => typeof item === "string")) {
                if (new Set(data.teams).size !== data.teams.length) {
                    throw new Error(`Team identifiers must be unique.`);
                } else {
                    this.teams = data.teams;
                }

                if (this.sorting.flags.length > 0) {
                    throw new Error(`Teams must be submitted as an array of objects with keys "team" and "flags" when sorting.flags is given explicitly as a nonempty array.`);
                }
            } else if (data.teams.every(item =>
                typeof item === "object" && item !== null &&
                "team" in item && typeof item.team === "string" &&
                "flags" in item && Array.isArray(item.flags) &&
                item.flags.every(flag => Number.isInteger(flag))
            )) {
                const flagsLength = this.sorting.flags.length;

                if (!data.teams.every(item => item.flags.length === flagsLength)) {
                    throw new Error(`All "flags" arrays within the team objects must be the same length, equal to the length of sorting.flags if it is given explicitly as a nonempty array.`);
                } else {
                    const teamFlags = data.teams.map(item => item.flags);
                    this.flags = teamFlags;
                }

                const teamIds = data.teams.map(item => item.team);
                if (new Set(teamIds).size !== teamIds.length) {
                    throw new Error(`Team identifiers must be unique.`);
                } else {
                    this.teams = teamIds;
                }
            } else {
                throw new TypeError(`Invalid format: the value of the "teams" key must be either an array of strings or an array of objects with a "team" and "flags" key.`);
            }
        } else {
            throw new TypeError(`Invalid data type: the value of the "teams" key must be an array.`);
        }

        this.matches = new Map();

        this.cycles = [];
        this.timeline = [];
        this.shootouts = [];

        this.information = [];
    }

    addMatches(data) {
        const identifiers = new Set();
        data.forEach(item => {
            if (identifiers.has(item[0])) {
                throw new Error(`Match identifiers must be unique.`);
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

        const checkFormat = (format) => {
            switch (format) {
                case "round-robin":
                    for (const team of this.teams) {
                        const matches = Array.from(this.matches.values()).filter(
                            match => match.home === team || match.away === team
                        );

                        if (matches.length > this.teams.length - 1) {
                            console.warn(`The total number of games played by a team in a round-robin format cannot be more than the number of teams minus one (first thrown at team ${team}).`);
                            return;
                        } else {
                            for (const opponent of this.teams) {
                                if (opponent !== team) {
                                    const directMatches = matches.filter(match => match.home === opponent || match.away === opponent);
                                    if (directMatches.length != 1) {
                                        console.warn(`In a round-robin format, teams must face each other exactly once (first thrown at teams ${team} and ${opponent}, found ${directMatches.length} matches).`);
                                        return;
                                    }
                                }
                            }
                        }
                    }
                    break;
                case "home-and-away":
                    for (const team of this.teams) {
                        const matches = Array.from(this.matches.values()).filter(
                            match => match.home === team || match.away === team
                        );

                        if (matches.length > (2 * this.teams.length) - 1) {
                            console.warn(`The total number of games played by a team in a home-and-away format cannot be more than twice the number of teams minus one (first thrown at team ${team}).`);
                            return;
                        } else {
                            for (const opponent of this.teams) {
                                if (opponent !== team) {
                                    const directMatches = matches.filter(match => match.home === opponent || match.away === opponent);
                                    if (directMatches.length != 2) {
                                        console.warn(`In a home-and-away format, teams must face each other exactly twice (first thrown at teams ${team} and ${opponent}, found ${directMatches.length} ${directMatches.length == 1 ? `match` : `matches`}).`);
                                        return;
                                    } else if (directMatches[0].home == directMatches[1].home) {
                                        console.warn(`In a home-and-away format, teams must face each other once at home and once away (first thrown at teams ${team} and ${opponent}).`);
                                        return;
                                    }
                                }
                            }
                        }
                    }
                    break;
            }
        }

        checkFormat(this.format);

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

            if (uniqueTeams.size !== this.teams.length && !this.sorting.shootout) {
                console.warn(`Each team may only appear exactly once per matchday.`);
                break;
            } else if (uniqueTeams.size !== this.teams.length && this.sorting.shootout) {
                throw new Error(`Each team may only appear exactly once per matchday. Since sorting.shootout was set to true and that depends on matchdays, continuing may impact the final results; either switch to a sorting method that does not employ a shootout or fix the matchdays.`);
            }
        }
    }

    standings(options) {

        /* EXPLANATION

        This method relies on the recursive function sortAndDivideTable; more on this below.

        For now, we initialize the standings by pushing a row for each team and filling it in with the points, the goals scored and all the other match data, as per the matches that have been provided by the user.
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

            // If there are any flags, we add them to each team as fields
            this.teams.forEach((team, teamIndex) => {
                this.flagNames.forEach((flagName, flagNameIndex) => {
                    standings[teamIndex][flagName] = this.flags[teamIndex][flagNameIndex];
                });
            });            

            this.matches.forEach((match, index) => {
                this.#computeTableRows(match, index, standings);
            });

            // As the first criteria is always points, there is no need for the user to input it manually in the list; but as we need it for the sorting, we add it here.
            this.sorting.criteria.unshift("points");
        }

        const sortAndDivideTable = (table, iteration, criteria, special = false) => {

            /* EXPLANATION
    
            This is the main function that is called to sort the teams into the table. It is a recursive function, with a recursive failsafe set at depth 75.
    
            ALGORITHM     
            The algorithm is the following:
    
                (1) at any given step, we have a table consisting of the teams to be sorted and their relative data; if this is the first iteration, the table consists of all teams with the goals scored in all matches;

                (2) if the current sorting criterion is of type head-to-head, the table in question is rewritten so that the data is only relative to the matches that were played between the teams in question, as opposed to global data that take the whole league into account:
                    2a. if the span is set to "all", then this is computed only once at the start when entering the head-to-head series, and then again (for the teams that are still tied) only when a full cycle of tiebrekers is completed;
                    2b. otherwise, if it is set to "single", we do it every single time);

                (3) the table is divided according to the current criterion by pairing up teams that are still tied: for example, for Team A (pts 6), Team B (pts 3), Team C (pts 6), with the current criterion being "points", we would end up with an array [[Team A, Team C], [Team B]] (where each entry in the subarrays is an object containing all the relevant information about the teams).
    
                (4) Now it is time to sort the teams:

                    - if this is the first iteration, an array that contains the initial standings (i.e. one with the data computed over all the matches, and tentatively sorted by points) is pushed into this.timeline;
                    - for all other iterations, the latest entry of this.timeline is retrieved, sorted through the current criterion only with respect to the teams in the current table (remember that this is a recursive function, so ideally it gets called over and over again over smaller subsets of the table as ties get broken), and re-pushed as a new entry into this.timeline.

                When the recursion eventually ends, the latest entry will be the completely sorted lague table as well as the basis for the output of the entire sorting process.
                
                (Note 1) Indeed, as this.timeline conserves the league with the full original overall data (at each step it's merely copied and re-sorted), it is also used as a reference whenever the current tiebreaker is of type overall, since we can match teams by their names to check what their original overall data were; while if it is of type head-to-head we compare the teams directly from within the table that the function currently holds in memory at that iteration, as step (2) has already rewritten it to be only relative to the teams in question (and this is why we need to take a peek at this.timeline instead for overall comparisons, when needed).
                
                (5) And finally, the recursive step: for each of the groups obtained in (3), so long as their length is at least 2, we call sortAndDivideTable again on them with the next criterion in the list.
        
            VARIABLES
                iteration:
                    an object made of two keys, "type" and "index"; the type describes what kind of check we are doing (whether overall or head-to-head, but also "additional" the additional ones once those are completed, "shootout" for the penalty shootout step, and so on); meanwhile the index is an integer that is incremented at each depth level of the recursion: since step (3) divides the table and step (5) applies the recursion to each of the subtables, the index increments one by one if you follow the history of a specific team through the sorting process (for example, if at iteration.index equal to 7 a table containing "Italy", "Spain", "France" and "San Marino" is divided into "Italy", "Spain" and "France", "San Marino", each of the two next calls of the function on either subtable will begin at iteration.index equal to 8, as opposed to assigning 8 to one and 9 to the other).
                run:
                    the (integer) number of consecutive steps of the same type (overall or head-to-head) that we have taken so far, up to and EXCLUDING the current one; when this reaches the length of the array of tiebreakers, we trigger the checks for deciding what to do next (switching to head-to-head, or switching to overall, or reapplying head-to-head from the start to a subset of the team concerned, or proceding to "final").
                this.cycles:
                    an array of objects whose each entry contains information about the current sorting step (whether it's head-to-head or overall, what criterion was used, if the "special" flag explained below is set, as well as the snapshot of the table that this function was analyzing at that step).
                special:
                    a boolean whose job it is to keep track of *special* iterations, i.e. those that occur when h2h.span is set to "single" and we are making progress in breaking ties before a full check of all the criteria is completed, in which case the variable is set to true and survives to the next iteration to tell the function to restart the list of criteria from points even if we are not done checking all the criteria yet; it is set back to false immediately after doing this.
            */

            // Recursion failsafe
            if (iteration.index > 75) {
                throw new RangeError(`Maximum recursion depth exceeded while sorting the teams.`);
            }

            // The new this.cycle entry for this iteration
            this.cycles.push({
                type: iteration.type,
                criterion: null,
                special: false,
                snapshot: JSON.parse(JSON.stringify(table))
            });
            let run;
            let tiebreaker;

            // Special check (see explanation above)
            if (special) {
                run = 0;
                tiebreaker = criteria[0];
                this.cycles[this.cycles.length - 1].special = true;
                special = false;
            } else {
                run = computeRun(this.cycles, table) % criteria.length;
                tiebreaker = criteria[run];
            }

            // Records the tiebreaker being used into the current this.cycle entry
            this.cycles[this.cycles.length - 1].criterion = tiebreaker;

            // Step (2) of the algorithm
            const recompute = iteration.type == "h2h" && (this.sorting.h2h.span !== "single" ? run == 0 : true);

            if (recompute) {
                const matches = new Map(
                    Array.from(this.matches.values())
                        .filter(match => {
                            return table.some(row => row.id == match.home) && table.some(row => row.id == match.away);
                        })
                        .map(match => [[...this.matches.entries()].find(([k, v]) => v === match)?.[0], match]));

                table.forEach(team => {
                    Object.keys(team).forEach(key => {
                        if (key == "points" || key == "for" || key == "against" || key == "diff" || key == "won" || key == "drawn" || key == "lost" || key == "away_for" || key == "away_won") {
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

                // (Note 1) of the algorithm
                if (iteration.type != "h2h" && iteration.index != 0) {
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

            // Step (4) of the algorithm
            if (this.timeline.length == 0) {
                // If it is the first iteration, then the order is based on points
                this.timeline.push(JSON.parse(JSON.stringify(table)).sort((a, b) => {
                    return b[tiebreaker] - a[tiebreaker];
                }));
            } else {
                this.timeline.push(JSON.parse(JSON.stringify(this.timeline[this.timeline.length - 1])).sort((a, b) => {
                    if (table.some(team => team.id === a.id) &&
                        table.some(team => team.id === b.id)) {

                        // Standard ordering (i.e. the one based on the tiebreaker that is currently being employed)
                        if (iteration.type == "overall" ||
                            iteration.type == "h2h" ||
                            iteration.type == "additional" ||
                            iteration.type == "flags") {

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

                            // In the case of h2h we compare from the groups as they are the ones holding the rewritten version of the table after the head-to-head recomputation; for flags, we sort depending on whether it is set as ascending or descending by the user
                            switch (iteration.type) {
                                case "overall":
                                    return b[tiebreaker] - a[tiebreaker];
                                case "additional":
                                    return b[tiebreaker] - a[tiebreaker];
                                case "flags":
                                    if (this.sorting.flags.length > 0) {
                                        if (this.sorting.flags.find(flag => flag.name.replace(/ /g, '_') == tiebreaker).order == "desc") {
                                            return b[tiebreaker] - a[tiebreaker];
                                        } else if (this.sorting.flags.find(flag => flag.name.replace(/ /g, '_') == tiebreaker).order == "asc") {
                                            return a[tiebreaker] - b[tiebreaker];
                                        }
                                    } else {
                                        return 0;
                                    }
                                case "h2h":
                                    return bTeam[tiebreaker] - aTeam[tiebreaker];
                            }
                        } else {
                            // Peculiar cases for which we do not have to compare according to a specific tiebreaker
                            // Essentially the case of the penalty shootout, if present, and the case of the final alphabetical order/drawing of random lots step
                            switch (iteration.type) {
                                case "shootout":
                                    // Penalty shootout
                                    if (this.sorting.shootout) {
                                        const numberOfMatches = this.teams.length - 1;
                                        const check = a.played == numberOfMatches && b.played == numberOfMatches;
                                        const lastMatch = Array.from(this.matches.values()).filter(match => match.matchday == numberOfMatches).find(match => (match.home == a.id && match.away == b.id) || (match.home == b.id && match.away == a.id));

                                        if (table.length == 2 &&
                                            this.format == "round-robin" &&
                                            check &&
                                            lastMatch &&
                                            lastMatch.home_for == lastMatch.away_for
                                        ) {
                                            const shootout = this.shootouts.find(shootout => (shootout[0] == a.id && shootout[1] == b.id) || (shootout[0] == b.id && shootout[1] == a.id));

                                            if (shootout) {
                                                const aTeam = shootout.findIndex(element => element == a.id);
                                                const bTeam = shootout.findIndex(element => element == b.id);
                                                let aShootout, bShootout;
                                                if (aTeam == 0 && bTeam == 1) {
                                                    aShootout = shootout[2];
                                                    bShootout = shootout[3];
                                                } else {
                                                    aShootout = shootout[3];
                                                    bShootout = shootout[2];
                                                }

                                                groups.forEach(group => group.length = 1);
                                                this.cycles[this.cycles.length - 1].type = "shootout";
                                                this.cycles[this.cycles.length - 1].criterion = "shootout";
                                                return bShootout - aShootout;
                                            } else {
                                                groups.forEach(group => group.length = 1);
                                                this.cycles[this.cycles.length - 1].type = "shootout";
                                                this.cycles[this.cycles.length - 1].criterion = "provisional";
                                                return Math.random() > 0.5 ? -1 : 1;
                                            }
                                        } else {
                                            this.cycles[this.cycles.length - 1].type = "shootout";
                                            this.cycles[this.cycles.length - 1].criterion = "none";
                                        }
                                    }
                                    break;
                                case "final":
                                    // Drawing of random lots or alphabetical order
                                    groups.forEach(group => group.length = 1);
                                    switch (this.sorting.final) {
                                        case "lots":
                                            this.cycles[this.cycles.length - 1].type = "final";
                                            this.cycles[this.cycles.length - 1].criterion = "lots";
                                            return Math.random() > 0.5 ? -1 : 1;
                                        case "alphabetical":
                                            this.cycles[this.cycles.length - 1].type = "final";
                                            this.cycles[this.cycles.length - 1].criterion = "alphabetical";
                                            return a.id.localeCompare(b.id);
                                    }
                                    break;
                            }
                        }
                    }
                }));
            }

            /*  SPECIAL ACTION
                
                Happens whenever the sorting type is head-to-head and the span is set to "single", and we are doing progress (i.e. one or more teams have broken away from the tie, indicated by the fact that groups, as the array of subtables, is of length greater then two): if it is so, then even before the run has completed we set it back to zero so to reapply the criteria from the beginning (points)

                // Amended: now it is decided by whether or not the cycles have shortened with respect to the beginning of the run
            */

            const groupsCheck = (groups.length > 1 && groups.some(group => group.length > 1));
            if (iteration.index >= 2 && this.sorting.h2h.span == "single" && iteration.type === "h2h" && groupsCheck) {
                run = 0;
                tiebreaker = criteria[0];
                special = true;
            }

            // Step (5) of the algorithm
            Object.entries(groups).forEach(([key, group]) => {

                /* EXPLANATION
                
                At the end of a run (see VARIABLES at the start for a refresher on what "run" is), we change the type of iteration (from head-to-head to overall or vice versa) only when:
                    (a) h2h.when is set to "before", and thus right after the first iteration which tentatively sort by points we automatically go to head-to-head (the recursion is initialized by default at overall);
                    (b) an overall list of criteria has run its course and h2h.when is set to "after", so head-to-head criteria are coming next;
                    (c) an head-to-head list of criteria has run its course, even including any reruns for teams that have broken away from the ties, and h2h.when is set to "before", so overall criteria are coming next.
    
                This step also includes the triggering of "final" (see VARIABLES again) in case there is nothing coming up next (e.g. if a run of overall-type criteria reaches its limit while h2h.when was set to "before", and so those are already gone too).
                */

                let nextType = iteration.type;
                let nextCriteria = criteria;
                const criteriaLimitReached = () => (tiebreaker == criteria[criteria.length - 1]);
                const isProgress = () => (this.cycles[this.cycles.length - 1].snapshot.length != this.cycles[this.cycles.length - 1 - run].snapshot.length) ||
                    (groups.length > 1 && groups.some(group => group.length > 1));

                if (iteration.index === 0 && this.sorting.h2h.when === "before") {
                    // Point (a)
                    nextType = "h2h";
                } else if (iteration.type === "overall" && criteriaLimitReached()) {
                    if (this.sorting.h2h.when === "after") {
                        // Point (b)
                        nextType = "h2h";
                    } else if (this.sorting.h2h.when === "before" && !isProgress()) {

                        if (this.sorting.additional.length > 0) {
                            nextType = "additional";
                            nextCriteria = this.sorting.additional;
                        } else if (this.sorting.shootout) {
                            nextType = "shootout";
                        } else if (this.sorting.flags.length > 0) {
                            nextType = "flags";
                            nextCriteria = this.flagNames;
                        } else {
                            nextType = "final";
                        }
                    }
                } else if (iteration.type === "h2h" && criteriaLimitReached()) {
                    if (isProgress() && this.sorting.h2h.span != "none") {
                        special = true;
                        nextType = iteration.type;
                    } else if (this.sorting.h2h.when === "before") {
                        // Point (c)
                        nextType = "overall";
                    } else {
                        if (this.sorting.additional.length > 0) {
                            nextType = "additional";
                            nextCriteria = this.sorting.additional;
                        } else if (this.sorting.shootout) {
                            nextType = "shootout";
                        } else if (this.sorting.flags.length > 0) {
                            nextType = "flags";
                            nextCriteria = this.flagNames;
                        } else {
                            nextType = "final";
                        }
                    }
                } else if (iteration.type === "additional" && criteriaLimitReached()) {
                    if (this.sorting.shootout == true) {
                        nextType = "shootout";
                    } else if (this.sorting.flags.length > 0) {
                        nextType = "flags";
                        nextCriteria = this.flagNames;
                    } else {
                        nextType = "final";
                    }
                } else if (iteration.type === "shootout") {
                    nextType = "flags";
                    nextCriteria = this.flagNames;
                } else if (iteration.type === "flags" && criteriaLimitReached()) {
                    nextType = "final";
                }

                // Step (5) of the algorithm
                if (group.length > 1) {
                    sortAndDivideTable(group,
                        { index: iteration.index + 1, type: nextType },
                        nextCriteria,
                        special);
                }
            });

            // Utility function that computes the "run" variable that we use in sortAndDivideTable
            function computeRun(array, table) {
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

            return table;
        }

        // The starting step of the recursion, where we provide the initial standings to initiate the sorting algorithm
        sortAndDivideTable(standings, {
            index: 0,
            type: "overall"
        }, this.sorting.criteria);

        switch (options) {
            case undefined:
                return this.timeline[this.timeline.length - 1].map(team => ({
                    id: team.id,
                    points: team.points,
                    for: team.for,
                    against: team.against,
                    diff: team.diff,
                    won: team.won,
                    drawn: team.drawn,
                    lost: team.lost,
                    played: team.played
                }));
            case "all":
                return this.timeline[this.timeline.length - 1];
            default:
                throw new RangeError(`The .standings() method only accepts "all" or nothing as its argument.`);
        }
    }

    ties(options) {

        /* EXPLANATION
    
            This is the main function that is called to explain how every instance of a tie in point has been resolved, which can then be printed to screen along with the table for extra clarity.

            ALGORITHM     
            The algorithm is the following:
    
                (1) it looks at this.cycles (which is a collective history of the entire sorting process) and, starting from the bottom (i.e. from the more recent steps, where ties have been resolved), whenever it encounters a set of team whose tie has been broken it crawls up the list to retrieve all entries connected to them, basically building their sorting history; and this is done for each independent set of teams that were sorted via tiebreakers, so that each of them can receive its own explanation;

                (2) from this, it is just a matter of examining each of these branches and retrieving the specific information we want to display.
        */

        const groupAndFilterByPoints = (arr) => {
            const grouped = arr.reduce((acc, obj) => {
                const key = obj.points;
                if (!acc[key]) {
                    acc[key] = [];
                }
                acc[key].push(obj);
                return acc;
            }, {});

            const result = Object.values(grouped).filter(group => group.length > 1);
            return result;
        }

        const findAllMatchingSubarrays = (arr) => {
            const seenPairs = new Set();
            const results = [];

            for (let i = arr.length - 1; i >= 0; i--) {
                const subarray = arr[i].snapshot;

                if (subarray.length === Math.min(...arr.map(cycle => cycle.snapshot.length))) {
                    const idPair = subarray.map(obj => obj.id).sort().join('-');

                    if (!seenPairs.has(idPair)) {
                        seenPairs.add(idPair);
                        const targetIds = subarray.map(obj => obj.id);
                        const matchedSubarrays = [];

                        for (let j = 1; j <= i; j++) {
                            const currentSubarray = arr[j];
                            const currentIds = currentSubarray.snapshot.map(obj => obj.id);

                            if (targetIds.every(id => currentIds.includes(id))) {
                                matchedSubarrays.push(currentSubarray);
                            }
                        }

                        results.push(matchedSubarrays);
                    }
                }
            }

            return results;
        }

        // Step (1) of the algorithm
        const grouped = groupAndFilterByPoints(this.timeline[this.timeline.length - 1]);
        const history = findAllMatchingSubarrays(this.cycles);

        // If there are no ties in points, then .ties() has nothing to do and thus we exit the method altogether
        if (grouped.length === 0) return [];

        // Step (2) of the algorithm
        history.forEach(story => {
            const first = story[0];
            const last = story[story.length - 1];

            let information = {
                group: first.snapshot.map(team => team.id).sort(),
                messages: [],
                requests: null
            };
            this.information.push(information);

            const getTypeString = (type) => {
                switch (type) {
                    case "h2h":
                        return `${this.names.h2h} `;
                    case "overall":
                        return `${this.names.overall} `;
                    case "flags":
                        return ``;
                    case "additional":
                        return `${this.names.overall} `;
                    default:
                        return '';
                }
            }

            const getSpecialString = (special, criteriaLength) => {
                return special ? `[Reapplying criteria 1-${criteriaLength}] ` : ``;
            }

            story.forEach((step, index) => {
                const previous = story[index - 1];

                // For each of the separated histories that we got in (1), the first thing to display is the mere fact that these teams were tied on points
                if (index == 0) {
                    information.messages.push(`${formatNames(step.snapshot.map(team => team.id).sort())} are tied on ${this.names.points} (${this.cycles[0].snapshot.filter(team => step.snapshot.map(team => team.id).some(element => element == team.id))[0].points}).`);
                }

                // Then, every time the length of the teams array being considered in the story step gets shortened, we print the data relative to the previous step as evidently that's where some teams got broken off
                if (index > 0 && step.snapshot.length < previous.snapshot.length) {
                    const snapshot = previous.snapshot;
                    const criterion = previous.criterion;
                    const pointsCount = JSON.parse(JSON.stringify(snapshot)).reduce((count, obj) => {
                        count[obj[criterion]] = (count[obj[criterion]] || 0) + 1;
                        return count;
                    }, {});

                    const sorted = snapshot.filter(team => pointsCount[team[criterion]] === 1);

                    // Whenever, while going through the history of the steps that eventually separated two teams, there were more than just two teams at the start, and then from a certain step to the next they became fewer, this means that some of the teams broke away and were sorted at that step, and so we stop to describe this fact
                    const type = getTypeString(previous.type);
                    const special = getSpecialString(previous.special, this.sorting.criteria.length);
                    const criterionName = this.names[criterion] ?? criterion.replace(/_/g, ' ');

                    if (sorted.length == 1) {
                        information.messages.push(`${special}The position of ${formatNames([sorted[0].id])} is decided on ${type}${criterionName} (${snapshot.sort((a, b) => { return b[criterion] - a[criterion] }).map(team => `${team.id}: ${team[criterion]}`).join('; ')}).`);
                    } else if (sorted.length > 1) {
                        information.messages.push(`${special}${formatNames(sorted.map(team => team.id).sort())} are sorted on ${type}${criterionName} (${snapshot.sort((a, b) => { return b[criterion] - a[criterion] }).map(team => `${team.id}: ${team[criterion]}`).join('; ')}).`);
                    }
                }
            });

            const type = getTypeString(last.type);
            const special = getSpecialString(last.special, this.sorting.criteria.length);
            const criterionName = this.names[last.criterion] ?? (last.criterion ?
                last.criterion.replace(/_/g, ' ') :
                null);

            switch (last.type) {
                case "shootout":
                    switch (last.criterion) {
                        case "provisional":
                            information.messages.push(`${formatNames(last.snapshot.map(team => team.id).sort())} are provisionally sorted at random while waiting for the results of their penalty shootout.`);
                            information.requests = "shootout";
                            break;
                        case "shootout":
                            information.messages.push(`Having met on their last matchday and after drawing their match, ${formatNames(last.snapshot.map(team => team.id).sort())} are sorted on the results of their penalty shootout (${last.snapshot.map(team => {

                                const shootout = this.shootouts.find(shootout => shootout[0] == team.id || shootout[1] == team.id);
                                const teamIndex = shootout.findIndex(element => element == team.id);

                                return `${team.id}: ${shootout[teamIndex + 2]}`;
                            }).join('; ')}).`);
                            break;
                    }
                    break;
                case "flag":
                    information.messages.push(`${formatNames(last.snapshot.map(team => team.id).sort())} are sorted on ${last.criterion} (${last.snapshot.map(team => {
                        const flagIndex = this.sorting.flags.findIndex(flag => flag.name == last.criterion);
                        return `${team.id}: ${this.flags[this.teams.findIndex(element => element == team.id)][flagIndex]}`;
                    }).join('; ')}).`);
                    break;
                case "final":
                    information.messages.push(`${formatNames(last.snapshot.map(team => team.id).sort())} are sorted on ${last.criterion == "lots" ? this.names.lots : this.names.alphabetical
                        }.`);
                    break;
                case "alphabetical":
                    information.messages.push(`${formatNames(last.snapshot.map(team => team.id).sort())} are sorted on ${this.names.alphabetical}.`);
                    break;
                case "additional":
                    information.messages.push(`${special}${formatNames(last.snapshot.map(team => team.id).sort())} are sorted on ${type}${criterionName} (${this.timeline[0].filter(team => last.snapshot.map(element => element.id).includes(team.id)).sort((a, b) => {
                        return this.timeline[0].find(team => team.id == b.id)[last.criterion] - this.timeline[0].find(team => team.id == a.id)[last.criterion]
                    }).map(team => `${team.id}: ${team[last.criterion]}`).join('; ')}).`);
                    break;
                default:
                    // However, in general, this is the step that describes any *normal* sorting of two teams, if we are not in any of the other special cases illustrated above or in the other cases of this switch statement
                    information.messages.push(`${special}${formatNames(last.snapshot.map(team => team.id).sort())} are sorted on ${type}${criterionName} (${last.snapshot.sort((a, b) => { return b[last.criterion] - a[last.criterion] }).map(team => `${team.id}: ${team[last.criterion]}`).join('; ')}).`);
                    break;
            }
        });

        switch (options) {
            case undefined:
                return this.information;
            case "raw":
                return this.cycles;
            default:
                throw new RangeError(`The .ties() method only accepts "raw" or nothing as its argument.`);
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

    // Method that lets the user update the flags associated to each team, if they are not immutable (e.g. the number of total yellow and red cards can change as they add up as the competition goes on)
    updateFlags(team, flag, value) {
        const teamIndex = this.teams.findIndex(element => element == team);
        const flagIndex = this.sorting.flags.findIndex(element => element.name == flag);

        this.flags[teamIndex][flagIndex] = value;
    }

    // Method that lets the user add the results of a penalty shootout whenever sortAndDivideTable requests one
    addShootout(home, away, home_for, away_for) {
        this.shootouts.push([home, away, home_for, away_for]);
    }

    // Private method that computes table rows whenever it is called (either at the start, or whenever a subtable has to be rewritten with only the results between the teams concerned for a head-to-head check)
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

        // Function that computes the points that a team has earned via a match
        const computePoints = (homeTeamRow, awayTeamRow) => {
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

        computePoints(homeTeamRow, awayTeamRow);
    }
}
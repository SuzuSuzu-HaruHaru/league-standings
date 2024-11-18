import LeagueTable from '../src/LeagueTable.js';

const scenarios = [
    {
        description: "\n2022 FIFA World Cup, Group A (Expected standings: 1. Netherlands, 2. Senegal, 3. Ecuador, 4. Qatar)",
        relevance: "Simplest scenario possible, where there are no ties in points whatsoever",
        teams: ["Senegal", "Netherlands", "Ecuador", "Qatar"],
        matches: [
            [1, 1, "Qatar", "Ecuador", 0, 2],
            [2, 1, "Senegal", "Netherlands", 0, 2],
            [3, 2, "Qatar", "Senegal", 1, 3],
            [4, 2, "Netherlands", "Ecuador", 1, 1],
            [5, 3, "Ecuador", "Senegal", 1, 2],
            [6, 3, "Netherlands", "Qatar", 2, 0]
        ],
        format: "round-robin",
        criteria: ["diff", "for"],
        when: "after",
        span: "none",
        additional: [],
        shootout: false,
        flags: [],
        order: ["Netherlands", "Senegal", "Ecuador", "Qatar"]
    },
    {
        description: "\n2018 FIFA World Cup, Group B (Expected standings: 1. Spain, 2. Portugal, 3. Iran, 4. Morocco)",
        relevance: "Standard example (in an overall-first competition) of a tie in points and goal difference that is resolved by looking at the number of goals scored)",
        teams: ["Iran", "Portugal", "Morocco", "Spain"],
        matches: [
            [1, 1, "Morocco", "Iran", 0, 1],
            [2, 1, "Portugal", "Spain", 3, 3],
            [3, 2, "Portugal", "Morocco", 1, 0],
            [4, 2, "Iran", "Spain", 0, 1],
            [5, 3, "Iran", "Portugal", 1, 1],
            [6, 3, "Spain", "Morocco", 2, 2]
        ],
        format: "round-robin",
        criteria: ["diff", "for"],
        when: "after",
        span: "none",
        additional: [],
        shootout: false,
        flags: [],
        order: ["Spain", "Portugal", "Iran", "Morocco"]
    },
    {
        description: "\n2018 FIFA World Cup, Group F (Expected standings: 1. Sweden, 2. Mexico, 3. South Korea, 4. Germany)",
        relevance: "Two separate two-way ties on points that are both sorted by looking at goal difference",
        teams: ["Germany", "Mexico", "South Korea", "Sweden"],
        matches: [
            [1, 1, "Germany", "Mexico", 0, 1],
            [2, 1, "Sweden", "South Korea", 1, 0],
            [3, 2, "South Korea", "Mexico", 1, 2],
            [4, 2, "Germany", "Sweden", 2, 1],
            [5, 3, "South Korea", "Germany", 2, 0],
            [6, 3, "Mexico", "Sweden", 0, 3]
        ],
        format: "round-robin",
        criteria: ["diff", "for"],
        when: "after",
        span: "none",
        additional: [],
        shootout: false,
        flags: [],
        order: ["Sweden", "Mexico", "South Korea", "Germany"]
    },
    {
        description: "\n2020 UEFA EUROs, Group B (Expected standings: 1. Belgium, 2. Denmark, 3. Finland, 4. Russia)",
        relevance: "Three-way tie that is immediately sorted by looking at overall goal difference",
        teams: ["Finland", "Denmark", "Russia", "Belgium"],
        matches: [
            [1, 1, "Denmark", "Finland", 0, 1],
            [2, 1, "Belgium", "Russia", 3, 0],
            [3, 2, "Finland", "Russia", 0, 1],
            [7, 2, "Denmark", "Belgium", 1, 2],
            [8, 3, "Russia", "Denmark", 1, 4],
            [9, 3, "Finland", "Belgium", 0, 2]
        ],
        format: "round-robin",
        criteria: ["diff", "for"],
        when: "before",
        span: "all",
        additional: [],
        shootout: true,
        flags: [],
        order: ["Belgium", "Denmark", "Finland", "Russia"]
    },
    {
        description: "\n1994 FIFA World Cup, Group D (Expected standings: 1. Nigeria, 2. Bulgaria, 3. Argentina, 4. Greece)",
        relevance: "Three-way tie on points that is resolved by looking at goal difference for Nigeria and, as Argentina and Bulgaria are still completely tied on all the other overall stats, their tie is sorted in favor of Bulgaria due to the head-to-head result of their match (Argentina 0-2 Bulgaria)",
        teams: ["Greece", "Bulgaria", "Argentina", "Nigeria"],
        matches: [
            [1, 1, "Argentina", "Greece", 4, 0],
            [2, 1, "Nigeria", "Bulgaria", 3, 0],
            [3, 2, "Argentina", "Nigeria", 2, 1],
            [4, 2, "Bulgaria", "Greece", 4, 0],
            [5, 3, "Argentina", "Bulgaria", 0, 2],
            [6, 3, "Greece", "Nigeria", 0, 2]
        ],
        format: "round-robin",
        criteria: ["diff", "for"],
        when: "after",
        span: "none",
        additional: [],
        shootout: false,
        flags: [],
        order: ["Nigeria", "Bulgaria", "Argentina", "Greece"]
    },
    {
        description: "\n2024 UEFA EUROs, Group E (Expected standings: 1. Romania, 2. Belgium, 3. Slovakia, 4. Ukraine)",
        relevance: "All four teams are even on points; Slovakia and Ukraine are immediately sorted on goal difference to the bottom of the table, whereas for Romania and Belgium the criteria do not reset (which would otherwise favor Belgium as they beat Romania 2-0), but instead go on to goals scored where Romania triumphs",
        teams: ["Ukraine", "Belgium", "Romania", "Slovakia"],
        matches: [
            [1, 1, "Romania", "Ukraine", 3, 0],
            [2, 1, "Belgium", "Slovakia", 0, 1],
            [3, 2, "Slovakia", "Ukraine", 1, 2],
            [4, 2, "Belgium", "Romania", 2, 0],
            [5, 3, "Slovakia", "Romania", 1, 1],
            [6, 3, "Ukraine", "Belgium", 0, 0]
        ],
        format: "round-robin",
        criteria: ["diff", "for"],
        when: "before",
        span: "all",
        additional: [],
        shootout: true,
        flags: [],
        order: ["Romania", "Belgium", "Slovakia", "Ukraine"]
    },
    {
        description: "\n2018-19 UEFA Champions League, Group B (Expected standings: 1. Barcelona, 2. Tottenham Hotspur, 3. Inter Milan, 4. PSV Eindhoven)",
        relevance: "Two teams in a head-to-head-first tournament are tied on points, head-to-head goal difference and goals scored, and are eventually sorted via head-to-head number of goals scored away from home",
        teams: ["Tottenham Hotspur", "Barcelona", "Inter Milan", "PSV Eindhoven"],
        matches: [
            [1, 1, "Barcelona", "PSV Eindhoven", 4, 0],
            [2, 1, "Inter Milan", "Tottenham Hotspur", 2, 1],
            [3, 2, "Tottenham Hotspur", "Barcelona", 2, 4],
            [4, 2, "PSV Eindhoven", "Inter Milan", 1, 2],
            [5, 3, "PSV Eindhoven", "Tottenham Hotspur", 2, 2],
            [6, 3, "Barcelona", "Inter Milan", 2, 0],

            [7, 4, "Tottenham Hotspur", "PSV Eindhoven", 2, 1],
            [8, 4, "Inter Milan", "Barcelona", 1, 1],
            [9, 5, "PSV Eindhoven", "Barcelona", 1, 2],
            [10, 5, "Tottenham Hotspur", "Inter Milan", 1, 0],
            [11, 6, "Barcelona", "Tottenham Hotspur", 1, 1],
            [12, 6, "Inter Milan", "PSV Eindhoven", 1, 1]
        ],
        format: "home-and-away",
        criteria: ["diff", "for", "away_for"],
        when: "before",
        span: "all",
        additional: ["won", "away_won"],
        shootout: false,
        flags: [],
        order: ["Barcelona", "Tottenham Hotspur", "Inter Milan", "PSV Eindhoven"]
    },
    {
        description: "\n2016 UEFA EUROs, Group E (Expected standings: 1. Italy, 2. Belgium, 3. Republic of Ireland, 4. Sweden)",
        relevance: "Situation where an overall-first competition would normally sort Belgium first due to more goals scored overall, but as this is a head-to-head-first tournament then Italy comes out on top due to the result of their head-to-head match (Belgium 0-2 Italy)",
        teams: ["Sweden", "Republic of Ireland", "Italy", "Belgium"],
        matches: [
            [1, 1, "Republic of Ireland", "Sweden", 1, 1],
            [2, 1, "Belgium", "Italy", 0, 2],
            [3, 2, "Italy", "Sweden", 1, 0],
            [7, 2, "Belgium", "Republic of Ireland", 3, 0],
            [8, 3, "Italy", "Republic of Ireland", 0, 1],
            [9, 3, "Sweden", "Belgium", 0, 1]
        ],
        format: "round-robin",
        criteria: ["diff", "for"],
        when: "before",
        span: "all",
        additional: [],
        shootout: true,
        flags: [],
        order: ["Italy", "Belgium", "Republic of Ireland", "Sweden"]
    },
    {
        description: "\n2002 FIFA World Cup, Group G (Expected standings: 1. Mexico, 2. Italy, 3. Croatia, 4. Ecuador)",
        relevance: "Situation where Ecuador is sorted below Croatia on goal difference as this is an overall-first tournament, but had this been a head-to-head-first competition then Ecuador would have come out on top due to the result of their head-to-head match (Ecuador 1-0 Croatia)",
        teams: ["Croatia", "Mexico", "Ecuador", "Italy"],
        matches: [
            [1, 1, "Croatia", "Mexico", 0, 1],
            [2, 1, "Italy", "Ecuador", 2, 0],
            [3, 2, "Italy", "Croatia", 1, 2],
            [4, 2, "Mexico", "Ecuador", 2, 1],
            [5, 3, "Mexico", "Italy", 1, 1],
            [6, 3, "Ecuador", "Croatia", 1, 0]
        ],
        format: "round-robin",
        criteria: ["diff", "for"],
        when: "after",
        span: "none",
        additional: [],
        shootout: false,
        flags: [],
        order: ["Mexico", "Italy", "Croatia", "Ecuador"]
    },
    {
        description: "\n1994 FIFA World Cup, Group E (Expected standings: 1. Mexico, 2. Republic of Ireland, 3. Italy, 4. Norway)",
        relevance: "Group where all teams end the stage equally with four points each: Croatia and Norway separate on goal difference respectively to the top and to the bottom of the table, whereas Italy and the Republic of Ireland remain tied on all overall criteria until we consider the result of their head-to-head match, which favors the Republic of Ireland (Italy 0-1 Republic of Ireland)",
        teams: ["Republic of Ireland", "Italy", "Mexico", "Norway"],
        matches: [
            [1, 1, "Italy", "Republic of Ireland", 0, 1],
            [2, 1, "Norway", "Mexico", 1, 0],
            [3, 2, "Italy", "Norway", 1, 0],
            [4, 2, "Mexico", "Republic of Ireland", 2, 1],
            [5, 3, "Italy", "Mexico", 1, 1],
            [6, 3, "Republic of Ireland", "Norway", 0, 0]
        ],
        format: "round-robin",
        criteria: ["diff", "for"],
        when: "after",
        span: "none",
        additional: [],
        shootout: false,
        flags: [],
        order: ["Mexico", "Republic of Ireland", "Italy", "Norway"]
    },
    {
        description: "\n2018 FIFA World Cup, Group H (Expected standings: 1. Colombia, 2. Japan, 3. Senegal, 4. Poland)",
        relevance: "Group where Japan and Senegal are tied in points and every other overall or head-to-head criteria, being eventually separated on a user-submitted flag (fair play points)",
        teams: [{
            team: "Poland",
            flags: [0]
        }, {
            team: "Japan",
            flags: [4]
        }, {
            team: "Senegal",
            flags: [6]
        }, {
            team: "Colombia",
            flags: [0]
        }],
        matches: [
            [1, 1, "Colombia", "Japan", 1, 2],
            [2, 1, "Poland", "Senegal", 1, 2],
            [4, 3, "Japan", "Senegal", 2, 2],
            [3, 3, "Poland", "Colombia", 0, 3],
            [5, 2, "Japan", "Poland", 0, 1],
            [6, 2, "Senegal", "Colombia", 0, 1]
        ],
        format: "round-robin",
        criteria: ["diff", "for"],
        when: "after",
        span: "none",
        additional: [],
        shootout: false,
        flags: [{
            name: "fair play points",
            order: "asc"
        }],
        order: ["Colombia", "Japan", "Senegal", "Poland"]
    },
    {
        description: "\n2022 FIFA World Cup qualification, UEFA Group H (Expected standings: 1. Croatia, 2. Russia, 3. Slovakia, 4. Slovenia, 5. Cyprus, 6. Malta)",
        relevance: "Six-team group where two sets of two teams each are tied on points and resolved via (overall) goal difference",
        teams: ["Russia", "Slovenia", "Slovakia", "Malta", "Cyprus", "Croatia"],
        matches: [
            [1, 1, "Cyprus", "Slovakia", 0, 0],
            [2, 1, "Malta", "Russia", 1, 3],
            [3, 1, "Slovenia", "Croatia", 1, 0],

            [4, 2, "Russia", "Slovenia", 2, 1],
            [5, 2, "Croatia", "Cyprus", 1, 0],
            [6, 2, "Slovakia", "Malta", 2, 2],

            [7, 3, "Cyprus", "Slovenia", 1, 0],
            [8, 3, "Croatia", "Malta", 3, 0],
            [9, 3, "Slovakia", "Russia", 2, 1],

            [10, 4, "Malta", "Cyprus", 3, 0],
            [11, 4, "Russia", "Croatia", 0, 0],
            [12, 4, "Slovenia", "Slovakia", 1, 1],

            [13, 5, "Cyprus", "Russia", 0, 2],
            [14, 5, "Slovenia", "Malta", 1, 0],
            [15, 5, "Slovakia", "Croatia", 0, 1],

            [16, 6, "Croatia", "Slovenia", 3, 0],
            [17, 6, "Russia", "Malta", 2, 0],
            [18, 6, "Slovakia", "Cyprus", 2, 0],

            [19, 7, "Cyprus", "Croatia", 0, 3],
            [20, 7, "Malta", "Slovenia", 0, 4],
            [21, 7, "Russia", "Slovakia", 1, 0],

            [22, 8, "Cyprus", "Malta", 2, 2],
            [23, 8, "Croatia", "Slovakia", 2, 2],
            [24, 8, "Slovenia", "Russia", 1, 2],

            [25, 9, "Russia", "Cyprus", 6, 0],
            [26, 9, "Malta", "Croatia", 1, 7],
            [27, 9, "Slovakia", "Slovenia", 2, 2],

            [28, 10, "Croatia", "Russia", 1, 0],
            [29, 10, "Malta", "Slovakia", 0, 6],
            [30, 10, "Slovenia", "Cyprus", 2, 1]
        ],
        format: "home-and-away",
        criteria: ["diff", "for"],
        when: "after",
        span: "none",
        additional: [],
        shootout: false,
        flags: [],
        order: ["Croatia", "Russia", "Slovakia", "Slovenia", "Cyprus", "Malta"]
    },
    {
        description: "\n2022-23 UEFA Europa League, Group H (Expected standings: 1. Ferencváros, 2. Monaco, 3. Trabzonspor, 4. Red Star Belgrade)",
        relevance: "Home-and-away tournament where a tie on points between two teams is resolved by looking at the number of points collected in their two head-to-head matches",
        teams: ["Monaco", "Trabzonspor", "Ferencváros", "Red Star Belgrade"],
        matches: [
            [1, 1, "Red Star Belgrade", "Monaco", 0, 1],
            [2, 1, "Ferencváros", "Trabzonspor", 3, 2],
            [3, 2, "Trabzonspor", "Red Star Belgrade", 2, 1],
            [4, 2, "Monaco", "Ferencváros", 0, 1],
            [5, 3, "Red Star Belgrade", "Ferencváros", 4, 1],
            [6, 3, "Monaco", "Trabzonspor", 3, 1],

            [7, 4, "Trabzonspor", "Monaco", 4, 0],
            [8, 4, "Ferencváros", "Red Star Belgrade", 2, 1],
            [9, 5, "Red Star Belgrade", "Trabzonspor", 2, 1],
            [10, 5, "Ferencváros", "Monaco", 1, 1],
            [11, 6, "Trabzonspor", "Ferencváros", 1, 0],
            [12, 6, "Monaco", "Red Star Belgrade", 4, 1]
        ],
        format: "home-and-away",
        criteria: ["diff", "for"],
        when: "before",
        span: "all",
        additional: ["away_for", "won", "away_won"],
        shootout: false,
        flags: [],
        order: ["Ferencváros", "Monaco", "Trabzonspor", "Red Star Belgrade"]
    },
    {
        description: "\n2022-23 UEFA Champions League, Group H (Expected standings: 1. Benfica, 2. PSG, 3. Juventus, 4. Maccabi Haifa)",
        relevance: "Two sets of teams being tied on points and head-to-head results, where one set is resolved just by looking at overall goal difference whereas the other needs to reach the additional criteria after the head-to-head/overall run to be sorted on overall number of goals scored away from home",
        teams: ["PSG", "Juventus", "Maccabi Haifa", "Benfica"],
        matches: [
            [1, 1, "PSG", "Juventus", 2, 1],
            [2, 1, "Benfica", "Maccabi Haifa", 2, 0],
            [3, 2, "Juventus", "Benfica", 1, 2],
            [4, 2, "Maccabi Haifa", "PSG", 1, 3],
            [5, 3, "Juventus", "Maccabi Haifa", 3, 1],
            [6, 3, "Benfica", "PSG", 1, 1],

            [7, 4, "Maccabi Haifa", "Juventus", 2, 0],
            [8, 4, "PSG", "Benfica", 1, 1],
            [9, 5, "PSG", "Maccabi Haifa", 7, 2],
            [10, 5, "Benfica", "Juventus", 4, 3],
            [11, 6, "Juventus", "PSG", 1, 2],
            [12, 6, "Maccabi Haifa", "Benfica", 1, 6]
        ],
        format: "home-and-away",
        criteria: ["diff", "for"],
        when: "before",
        span: "all",
        additional: ["away_for", "won", "away_won"],
        shootout: false,
        flags: [],
        order: ["Benfica", "PSG", "Juventus", "Maccabi Haifa"]
    },

    // -----------------------
    // CUSTOM-CREATED EXAMPLES
    // -----------------------

    // Set of three tests where the effects of sorting.h2h.when and sorting.h2h.span become apparent
    {
        description: "\n[Custom-created example] (Expected standings: 1. France, 2. Spain, 3. Italy, 4. San Marino)",
        relevance: "If sorting.h2h.when is set to \"after\", then overall goal difference is examined first and thus France triumphs due to their large victory over San Marino",
        teams: ["San Marino", "Italy", "Spain", "France"],
        matches: [
            [1, 1, "France", "San Marino", 20, 0],
            [2, 1, "Italy", "Spain", 3, 1],
            [3, 2, "Italy", "France", 0, 1],
            [5, 2, "Spain", "San Marino", 2, 0],
            [4, 3, "Spain", "France", 3, 0],
            [6, 3, "Italy", "San Marino", 1, 0]
        ],
        format: "round-robin",
        criteria: ["diff", "for"],
        when: "after",
        span: "all",
        additional: [],
        shootout: false,
        flags: [],
        order: ["France", "Spain", "Italy", "San Marino"]
    },
    {
        description: "\n[Custom-created example] (Expected standings: 1. Spain, 2. Italy, 3. Italy, 4. San Marino)",
        relevance: "If sorting.h2h.when is set to \"before\" and sorting.h2h.span is set to \"all\", then head-to-head results put Italy and Spain above France on head-to-head goal difference, with Spain coming on top as it overcomes Italy in the next criterion (head-to-head goals scored)",
        teams: ["San Marino", "Italy", "Spain", "France"],
        matches: [
            [1, 1, "France", "San Marino", 20, 0],
            [2, 1, "Italy", "Spain", 3, 1],
            [3, 2, "Italy", "France", 0, 1],
            [5, 2, "Spain", "San Marino", 2, 0],
            [4, 3, "Spain", "France", 3, 0],
            [6, 3, "Italy", "San Marino", 1, 0]
        ],
        format: "round-robin",
        criteria: ["diff", "for"],
        when: "before",
        span: "all",
        additional: [],
        shootout: false,
        flags: [],
        order: ["Spain", "Italy", "France", "San Marino"]
    },
    {
        description: "\n[Custom-created example] (Expected standings: 1. Italy, 2. Spain, 3. Italy, 4. San Marino)",
        relevance: "If sorting.h2h.when is set to \"before\" and sorting.h2h.span is set to \"single\", head-to-head results put Italy and Spain above France on head-to-head goal difference, but this time Italy wins as the criteria immediately restart as soon as France separates, thus letting Italy prevail over Spain due to the result of their head-to-head match (Italy 3-1 Spain)",
        teams: ["San Marino", "Italy", "Spain", "France"],
        matches: [
            [1, 1, "France", "San Marino", 20, 0],
            [2, 1, "Italy", "Spain", 3, 1],
            [3, 2, "Italy", "France", 0, 1],
            [5, 2, "Spain", "San Marino", 2, 0],
            [4, 3, "Spain", "France", 3, 0],
            [6, 3, "Italy", "San Marino", 1, 0]
        ],
        format: "round-robin",
        criteria: ["diff", "for"],
        when: "before",
        span: "single",
        additional: [],
        shootout: false,
        flags: [],
        order: ["Italy", "Spain", "France", "San Marino"]
    }
];

describe.each(scenarios)('$description', ({ relevance, teams, matches, format, criteria, when, span, additional, shootout, flags, order }) => {
    let table;

    beforeEach(() => {
        table = new LeagueTable({
            teams: teams,
            format: format,
            sorting: {
                criteria: criteria,
                h2h: { when: when, span: span },
                additional: additional,
                shootout: shootout,
                flags: flags,
                final: "lots"
            }
        });
        table.addMatches(matches);
    });

    test(relevance, () => {
        const result = table.standings().map(team => team.id);
        expect(result).toEqual(order);
    });
});
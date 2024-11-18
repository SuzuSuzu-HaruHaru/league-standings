import LeagueTable from '../src/LeagueTable.js';

const scenarios = [
    {
        description: "\n[Custom-created example]",
        relevance: "Custom-created group where all matches ended 0-0, thus we are expecting to sort all teams at random",
        teams: ["San Marino", "Italy", "Spain", "France"],
        matches: [
            [1, 1, "France", "San Marino", 0, 0],
            [2, 1, "Italy", "Spain", 0, 0],
            [3, 2, "Italy", "France", 0, 0],
            [5, 2, "Spain", "San Marino", 0, 0],
            [4, 3, "Spain", "France", 0, 0],
            [6, 3, "Italy", "San Marino", 0, 0]
        ],
        format: "round-robin",
        criteria: ["diff", "for"],
        when: "after",
        span: "none",
        additional: [],
        shootout: false,
        flags: [],
        messages: [
            'France, Italy, San Marino and Spain are tied on points (3).',
            'France, Italy, San Marino and Spain are sorted on drawing of random lots.'
        ],
        requests: null
    },
    {
        description: "\n[Custom-created example]",
        relevance: "Custom-created group where all but one match ended 0-0, and as Italy and San Marino are thus the only two teams tied on points, and meet on their last matchday and their match ends in a draw, and seeing how sorting.shootout is set to \"true\", a penalty shoot-out is in order",
        teams: ["San Marino", "Italy", "Spain", "France"],
        matches: [
            [1, 1, "France", "San Marino", 0, 0],
            [2, 1, "Italy", "Spain", 0, 0],
            [3, 2, "Italy", "France", 0, 0],
            [5, 2, "Spain", "San Marino", 0, 0],
            [4, 3, "Spain", "France", 1, 0],
            [6, 3, "Italy", "San Marino", 0, 0]
        ],
        format: "round-robin",
        criteria: ["diff", "for"],
        when: "after",
        span: "none",
        additional: [],
        shootout: true,
        flags: [],
        messages: [
            'Italy and San Marino are tied on points (3).',
            'Italy and San Marino are provisionally sorted at random while waiting for the results of their penalty shootout.'
        ],
        requests: "shootout"
    },
];

describe.each(scenarios)('$description', ({ relevance, teams, matches, format, criteria, when, span, additional, shootout, flags, messages, requests }) => {
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
        table.standings();
    });

    test(relevance, () => {
        const result = table.ties().map(tie => ({
            messages: tie.messages,
            requests: tie.requests,
        }));
        expect(result).toEqual([{ messages, requests }]);
    });
});
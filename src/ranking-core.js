export function sortRankingRows(rows, ruleType, sort1, sort2, sort3) {
    return rows.sort((a, b) => {
        if (a[ruleType] !== b[ruleType]) return b[ruleType] - a[ruleType];
        if (sort1 && a[sort1] !== b[sort1]) return b[sort1] - a[sort1];
        if (sort2 && a[sort2] !== b[sort2]) return b[sort2] - a[sort2];
        if (sort3 && a[sort3] !== b[sort3]) return b[sort3] - a[sort3];
        return 0;
    });
}

export function getTotalCountPrizeRankings(rows, limit = 3) {
    return [...(rows || [])]
        .sort((a, b) => {
            if (b.total_count === a.total_count) {
                if (b.max_len === a.max_len) {
                    return b.total_weight - a.total_weight;
                }
                return b.max_len - a.max_len;
            }
            return b.total_count - a.total_count;
        })
        .slice(0, limit);
}

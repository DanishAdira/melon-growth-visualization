import { useCallback, useEffect, useState } from 'react';
import { generateClient } from 'aws-amplify/api';
import { listDailyMelonSnapshots } from '../graphql/queries';
import type { DailyMelonSnapshot } from '../types/melon';

const client = generateClient();

type QueryResult = {
    data?: {
        listDailyMelonSnapshots: {
            items: (DailyMelonSnapshot | null)[];
            nextToken?: string | null;
        };
    };
};

interface Options {
    melonIDs: string[];
    /** 取得範囲の開始日 "YYYY-MM-DD" or "YYYYMMDD"。省略時は endDate 1日分のみ。 */
    startDate?: string | null;
    /** 取得範囲の終了日 "YYYY-MM-DD" or "YYYYMMDD"。省略時は未指定(全件)。 */
    endDate?: string | null;
}

/**
 * 複数メロンの daily snapshot を並列取得し、
 * 各メロンの「指定範囲内の最新」1件を {melonID: snapshot} map で返す。
 *
 * Overview モードのヒートマップ用途。
 */
export function useLatestDailyMelonSnapshotsByMelons({
    melonIDs, startDate, endDate,
}: Options) {
    const [data, setData]       = useState<Record<string, DailyMelonSnapshot | null>>({});
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError]     = useState<string | null>(null);

    const idsKey = melonIDs.slice().sort().join(',');

    const fetch = useCallback(async () => {
        if (melonIDs.length === 0) {
            setData({});
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const entries = await Promise.all(
                melonIDs.map(async (melonID) => {
                    try {
                        const res = (await client.graphql({
                            query: listDailyMelonSnapshots,
                            variables: {
                                melonID,
                                startDate: startDate ?? undefined,
                                endDate:   endDate ?? undefined,
                                limit: 100,
                            },
                        })) as QueryResult;

                        const items = (res.data?.listDailyMelonSnapshots?.items ?? [])
                            .filter((x): x is DailyMelonSnapshot => x != null)
                            .sort((a, b) => a.dateJST.localeCompare(b.dateJST));

                        const latest = items.length > 0 ? items[items.length - 1] : null;
                        return [melonID, latest] as const;
                    } catch {
                        return [melonID, null] as const;
                    }
                })
            );
            const map: Record<string, DailyMelonSnapshot | null> = {};
            for (const [id, snap] of entries) {
                map[id] = snap;
            }
            setData(map);
        } catch (e: any) {
            const msg = e?.errors
                ? e.errors.map((x: any) => x.message).join(', ')
                : e?.message ?? '日次サマリーの一括取得に失敗しました';
            setError(msg);
        } finally {
            setLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [idsKey, startDate, endDate]);

    useEffect(() => { fetch(); }, [fetch]);

    return { data, loading, error, refetch: fetch };
}
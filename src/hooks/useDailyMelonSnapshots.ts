import { useCallback, useEffect, useState } from 'react';
import { generateClient } from 'aws-amplify/api';
import { listDailyMelonSnapshots } from '../graphql/queries';
import { MAX_PAGES } from '../constants/metrics';
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
    melonID: string | null;
    startDate?: string | null;  // "YYYY-MM-DD" or "YYYYMMDD"
    endDate?: string | null;
}

export function useDailyMelonSnapshots({ melonID, startDate, endDate }: Options) {
    const [data, setData]       = useState<DailyMelonSnapshot[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState<string | null>(null);

    const fetch = useCallback(async () => {
        if (!melonID) { setData([]); setLoading(false); return; }
        setLoading(true);
        setError(null);
        try {
            const all: DailyMelonSnapshot[] = [];
            let nextToken: string | null | undefined = null;
            for (let i = 0; i < MAX_PAGES; i++) {
                const res = (await client.graphql({
                    query: listDailyMelonSnapshots,
                    variables: {
                        melonID,
                        startDate: startDate ?? undefined,
                        endDate:   endDate ?? undefined,
                        limit: 100,
                        nextToken,
                    },
                })) as QueryResult;

                const items = res.data?.listDailyMelonSnapshots?.items ?? [];
                all.push(...items.filter((x): x is DailyMelonSnapshot => x != null));
                nextToken = res.data?.listDailyMelonSnapshots?.nextToken;
                if (!nextToken) break;
            }
            setData(all);
        } catch (e: any) {
            const msg = e?.errors
                ? e.errors.map((x: any) => x.message).join(', ')
                : e?.message ?? '日次サマリーの取得に失敗しました';
            setError(msg);
        } finally {
            setLoading(false);
        }
    }, [melonID, startDate, endDate]);

    useEffect(() => { fetch(); }, [fetch]);

    return { data, loading, error, refetch: fetch };
}
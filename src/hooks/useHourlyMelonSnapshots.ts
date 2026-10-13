import { useCallback, useEffect, useState } from 'react';
import { generateClient } from 'aws-amplify/api';
import { listHourlyMelonSnapshots } from '../graphql/queries';
import { MAX_PAGES } from '../constants/metrics';
import type { HourlyMelonSnapshot } from '../types/melon';

const client = generateClient();

type QueryResult = {
    data?: {
        listHourlyMelonSnapshots: {
            items: (HourlyMelonSnapshot | null)[];
            nextToken?: string | null;
        };
    };
};

interface Options {
    melonID: string | null;
    startTimestamp?: string | null; // "YYYYMMDD-HH"
    endTimestamp?: string | null;
}

export function useHourlyMelonSnapshots({ melonID, startTimestamp, endTimestamp }: Options) {
    const [data, setData]       = useState<HourlyMelonSnapshot[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState<string | null>(null);

    const fetch = useCallback(async () => {
        if (!melonID) { setData([]); setLoading(false); return; }
        setLoading(true);
        setError(null);
        try {
            const all: HourlyMelonSnapshot[] = [];
            let nextToken: string | null | undefined = null;
            for (let i = 0; i < MAX_PAGES; i++) {
                const res = (await client.graphql({
                    query: listHourlyMelonSnapshots,
                    variables: {
                        melonID,
                        startTimestamp: startTimestamp ?? undefined,
                        endTimestamp:   endTimestamp ?? undefined,
                        limit: 500,
                        nextToken,
                    },
                })) as QueryResult;

                const items = res.data?.listHourlyMelonSnapshots?.items ?? [];
                all.push(...items.filter((x): x is HourlyMelonSnapshot => x != null));
                nextToken = res.data?.listHourlyMelonSnapshots?.nextToken;
                if (!nextToken) break;
            }
            setData(all);
        } catch (e: any) {
            const msg = e?.errors
                ? e.errors.map((x: any) => x.message).join(', ')
                : e?.message ?? '時次サマリーの取得に失敗しました';
            setError(msg);
        } finally {
            setLoading(false);
        }
    }, [melonID, startTimestamp, endTimestamp]);

    useEffect(() => { fetch(); }, [fetch]);

    return { data, loading, error, refetch: fetch };
}
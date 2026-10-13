import { useCallback, useEffect, useState } from 'react';
import { generateClient } from 'aws-amplify/api';
import { listDailySensorSnapshots } from '../graphql/queries';
import { MAX_PAGES } from '../constants/metrics';
import type { DailySensorSnapshot } from '../types/sensor';

const client = generateClient();

type QueryResult = {
    data?: {
        listDailySensorSnapshots: {
            items: (DailySensorSnapshot | null)[];
            nextToken?: string | null;
        };
    };
};

interface Options {
    aggregationKey: string | null;  // 例: "PLANT#daiwa-field-08#N1E2_1"
    startDate?: string | null;
    endDate?: string | null;
}

export function useDailySensorSnapshots({ aggregationKey, startDate, endDate }: Options) {
    const [data, setData]       = useState<DailySensorSnapshot[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState<string | null>(null);

    const fetch = useCallback(async () => {
        if (!aggregationKey) { setData([]); setLoading(false); return; }
        setLoading(true);
        setError(null);
        try {
            const all: DailySensorSnapshot[] = [];
            let nextToken: string | null | undefined = null;
            for (let i = 0; i < MAX_PAGES; i++) {
                const res = (await client.graphql({
                    query: listDailySensorSnapshots,
                    variables: {
                        aggregationKey,
                        startDate: startDate ?? undefined,
                        endDate:   endDate ?? undefined,
                        limit: 100,
                        nextToken,
                    },
                })) as QueryResult;

                const items = res.data?.listDailySensorSnapshots?.items ?? [];
                all.push(...items.filter((x): x is DailySensorSnapshot => x != null));
                nextToken = res.data?.listDailySensorSnapshots?.nextToken;
                if (!nextToken) break;
            }
            setData(all);
        } catch (e: any) {
            const msg = e?.errors
                ? e.errors.map((x: any) => x.message).join(', ')
                : e?.message ?? 'センサー日次サマリーの取得に失敗しました';
            setError(msg);
        } finally {
            setLoading(false);
        }
    }, [aggregationKey, startDate, endDate]);

    useEffect(() => { fetch(); }, [fetch]);

    return { data, loading, error, refetch: fetch };
}
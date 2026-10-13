import { useCallback, useEffect, useState } from 'react';
import { generateClient } from 'aws-amplify/api';
import { listIdealGrowthModels } from '../graphql/queries';
import type { IdealGrowthModel } from '../types/melon';

const client = generateClient();

type QueryResult = { data?: { listIdealGrowthModels: IdealGrowthModel[] } };

/**
 * season は melon-table.season から年を剥がした値（例: "Fall"）。
 * utils/mathUtils.extractSeasonName() で変換してから渡す。
 */
export function useIdealGrowthModels(season: string | null) {
    const [models, setModels]   = useState<Record<string, IdealGrowthModel>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState<string | null>(null);

    const fetch = useCallback(async () => {
        if (!season) { setModels({}); setLoading(false); return; }
        setLoading(true);
        setError(null);
        try {
            const res = (await client.graphql({
                query: listIdealGrowthModels,
                variables: { season },
            })) as QueryResult;
            const list = res.data?.listIdealGrowthModels ?? [];
            const map: Record<string, IdealGrowthModel> = {};
            list.forEach(m => { map[m.metric] = m; });
            setModels(map);
        } catch (e: any) {
            const msg = e?.errors
                ? e.errors.map((x: any) => x.message).join(', ')
                : e?.message ?? '理想モデルの取得に失敗しました';
            setError(msg);
        } finally {
            setLoading(false);
        }
    }, [season]);

    useEffect(() => { fetch(); }, [fetch]);

    return { models, loading, error, refetch: fetch };
}
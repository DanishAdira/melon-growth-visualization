import { useCallback, useEffect, useState } from 'react';
import { generateClient } from 'aws-amplify/api';
import { listGrowingMelonsByField } from '../graphql/queries';
import type { Melon } from '../types/melon';

const client = generateClient();

type QueryResult = { data?: { listGrowingMelonsByField: Melon[] } };

export function useGrowingMelonsByField(fieldID: string) {
    const [melons, setMelons]   = useState<Melon[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState<string | null>(null);

    const fetch = useCallback(async () => {
        if (!fieldID) { setMelons([]); setLoading(false); return; }
        setLoading(true);
        setError(null);
        try {
            const res = (await client.graphql({
                query: listGrowingMelonsByField,
                variables: { fieldID },
            })) as QueryResult;
            setMelons(res.data?.listGrowingMelonsByField ?? []);
        } catch (e: any) {
            const msg = e?.errors
                ? e.errors.map((x: any) => x.message).join(', ')
                : e?.message ?? 'メロン一覧の取得に失敗しました';
            setError(msg);
        } finally {
            setLoading(false);
        }
    }, [fieldID]);

    useEffect(() => { fetch(); }, [fetch]);

    return { melons, loading, error, refetch: fetch };
}
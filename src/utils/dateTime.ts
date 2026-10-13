// "YYYY-MM-DD"
export const toLocalDateStr = (d: Date): string => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};

// "YYYY-MM-DD" ⇄ "YYYYMMDD"
export const toCompactDateStr = (isoDate: string): string =>
    isoDate.split('-').join('');

export const fromCompactDateStr = (compact: string): string => {
    if (compact.length !== 8) return compact;
    return `${compact.slice(0, 4)}-${compact.slice(4, 6)}-${compact.slice(6, 8)}`;
};

export const formatHHmm = (ts: number): string => {
    const d = new Date(ts);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

export const nowMinutesOfDay = (): number => {
    const n = new Date();
    return n.getHours() * 60 + n.getMinutes();
};

export const nowLocalDatetimeStr = (): string =>
    new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);

export const formatDateLabel = (dateStr: string): string =>
    new Date(`${dateStr}T00:00:00`).toLocaleDateString('ja-JP', {
        year: 'numeric', month: 'long', day: 'numeric', weekday: 'short',
    });

// hourTimestamp "YYYYMMDD-HH" から Date を復元
export const parseHourTimestamp = (ht: string): Date | null => {
    if (ht.length !== 11) return null;
    const date = ht.slice(0, 8);
    const hour = Number(ht.slice(9, 11));
    if (Number.isNaN(hour)) return null;
    const y = Number(date.slice(0, 4));
    const m = Number(date.slice(4, 6));
    const d = Number(date.slice(6, 8));
    return new Date(y, m - 1, d, hour, 0, 0);
};

// ISO 日付同士の経過日数（toISODate - fromISODate）
export const daysBetween = (fromISODate: string, toISODate: string): number => {
    const a = new Date(`${fromISODate}T00:00:00`);
    const b = new Date(`${toISODate}T00:00:00`);
    return Math.floor((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
};
import type { AggregationLevel } from '../types/sensor';

export const buildFieldKey = (fieldID: string) =>
    `FIELD#${fieldID}`;

export const buildSectionKey = (fieldID: string, sectionID: string) =>
    `SECTION#${fieldID}#${sectionID}`;

export const buildPlantKey = (fieldID: string, plantID: string) =>
    `PLANT#${fieldID}#${plantID}`;

// Navigation 選択階層に応じて最も具体的な集約キーを返す
export interface AggregationSelection {
    fieldID: string;
    sectionID?: string | null;
    plantID?: string | null;
}

export interface ResolvedAggregation {
    level: AggregationLevel;
    aggregationKey: string;
}

export const resolveAggregationKey = (
    sel: AggregationSelection
): ResolvedAggregation | null => {
    if (!sel.fieldID) return null;

    if (sel.plantID && sel.sectionID) {
        return {
            level: 'PLANT',
            aggregationKey: buildPlantKey(sel.fieldID, sel.plantID),
        };
    }
    if (sel.sectionID) {
        return {
            level: 'SECTION',
            aggregationKey: buildSectionKey(sel.fieldID, sel.sectionID),
        };
    }
    return {
        level: 'FIELD',
        aggregationKey: buildFieldKey(sel.fieldID),
    };
};
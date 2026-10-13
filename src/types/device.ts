// pinode-visualization-app の Devices テーブル由来の型。
// 階層ナビ（Field > Section > Plant > HDR）の Field/Section/Plant 部分を担う。

export type DeviceType = 'melon' | 'wilt';

export interface Device {
    deviceID: string;
    fieldID: string;
    sectionID: string;
    plantID: string;
    plantNumber: number;
    deviceType: DeviceType;
    wiltDeviceId?: string;
}

export interface Plant {
    plantID: string;
    plantNumber: number;
    sectionID: string;
    melon?: Device;
    wilt?: Device;
}

export interface Section {
    sectionID: string;
    row: number;
    col: number;
    plants: Plant[];
}
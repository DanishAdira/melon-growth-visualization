// src/graphql/queries.ts

// 季節ごとのメロン一覧取得 (Registry)
export const listMelonsBySeason = /* GraphQL */ `
  query ListMelonsBySeason($season: String!, $limit: Int, $nextToken: String) {
    listMelonsBySeason(season: $season, limit: $limit, nextToken: $nextToken) {
      items {
        melonID
        season
        deviceID
        pollinationDate
        status
        harvestDate
      }
      nextToken
    }
  }
`;

// 特定のメロン情報取得
export const getMelon = /* GraphQL */ `
  query GetMelon($melonID: String!) {
    getMelon(melonID: $melonID) {
      melonID
      season
      deviceID
      pollinationDate
      status
      harvestDate
    }
  }
`;

// メロン一覧（DeviceMap）の取得
export const listDeviceMaps = /* GraphQL */ `
  query ListDeviceMaps {
    listDeviceMaps {
      deviceID_cameraID
      melonID
      season
      pollinationDate
    }
  }
`;

// 理想モデルの取得
export const listIdealModels = /* GraphQL */ `
  query ListIdealModels($season: String!) {
    listIdealModels(season: $season) {
      season
      metric_name
      parameters {
        L
        k
        t0
      }
    }
  }
`;

// 生育サマリー履歴の取得
export const getGrowthSummaries = /* GraphQL */ `
  query GetGrowthSummaries($melonID: String!, $startDate: String, $endDate: String, $limit: Int) {
    getGrowthSummaries(melonID: $melonID, startDate: $startDate, endDate: $endDate, limit: $limit) {
      items {
        melonID
        targetDate
        season
        dap
        
        # 実測値
        actual_metrics {
          density
          branch_points
          estimated_volume_px3
          fruit_area_px
          h_component_px
          v_component_px
          vh_ratio
          major_axis_px
          minor_axis_px
        }
        
        deviation {
          density
          branch_points
          estimated_volume_px3
          fruit_area_px
          h_component_px
          v_component_px
          vh_ratio
          major_axis_px
          minor_axis_px
        }
        
        ideal_metrics {
          density
          branch_points
          estimated_volume_px3
          fruit_area_px
          h_component_px
          v_component_px
          vh_ratio
          major_axis_px
          minor_axis_px
        }
      }
    }
  }
`;
// センサーデータの取得
export const listSensorData = /* GraphQL */ `
  query ListSensorData($deviceID: String!, $limit: Int, $nextToken: String) {
    listSensorData(deviceID: $deviceID, limit: $limit, nextToken: $nextToken) {
      items {
        deviceID
        timestamp
        temperature
        humidity
        i_v_light
        u_v_light
        imageKeys
      }
      nextToken
    }
  }
`;
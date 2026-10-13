// =============================================================================
// 既存：センサー生データ (PiNodeSensorData)
// =============================================================================

export const listSensorDataByDevice = /* GraphQL */ `
  query ListSensorDataByDevice(
    $deviceID: String!
    $startTimestamp: String
    $endTimestamp: String
    $limit: Int
    $nextToken: String
  ) {
    listSensorDataByDevice(
      deviceID: $deviceID
      startTimestamp: $startTimestamp
      endTimestamp: $endTimestamp
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        deviceID
        timestamp
        imageKeys
        temperature
        humidity
        i_v_light
        u_v_light
        temperature_hq
        humidity_hq
        stem
        fruit_diagram
      }
      nextToken
    }
  }
`;

export const listSensorDataByPlant = /* GraphQL */ `
  query ListSensorDataByPlant(
    $fieldID: String!
    $plantID: String!
    $startTimestamp: String
    $endTimestamp: String
    $limit: Int
    $nextToken: String
  ) {
    listSensorDataByPlant(
      fieldID: $fieldID
      plantID: $plantID
      startTimestamp: $startTimestamp
      endTimestamp: $endTimestamp
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        deviceID
        timestamp
        imageKeys
        temperature
        humidity
        i_v_light
        u_v_light
        temperature_hq
        humidity_hq
        stem
        fruit_diagram
      }
      nextToken
    }
  }
`;

export const listDevices = /* GraphQL */ `
  query ListDevices($fieldID: String!) {
    listDevices(fieldID: $fieldID) {
      deviceID
      fieldID
      sectionID
      plantID
      plantNumber
      deviceType
      wiltDeviceId
    }
  }
`;

// =============================================================================
// Phase 6 追加：Melon registry
// =============================================================================

export const listGrowingMelonsByField = /* GraphQL */ `
  query ListGrowingMelonsByField($fieldID: String!) {
    listGrowingMelonsByField(fieldID: $fieldID) {
      melonID
      fieldID
      sectionID
      plantID
      deviceID
      cameraID
      deviceCameraID
      projectID
      season
      variety
      status
      pollinationDate
      thinningDate
      harvestDate
      netDetectionStatus
      netOnsetAt
      netOnsetDaysAfterPollination
      updatedAt
      baseline_estimated_volume
      baseline_capturedAt
      baseline_sample_count
      baselineComputedAt
    }
  }
`;

export const getMelon = /* GraphQL */ `
  query GetMelon($melonID: String!) {
    getMelon(melonID: $melonID) {
      melonID
      fieldID
      sectionID
      plantID
      deviceID
      cameraID
      deviceCameraID
      projectID
      season
      variety
      status
      pollinationDate
      thinningDate
      harvestDate
      netDetectionStatus
      netOnsetAt
      netOnsetDaysAfterPollination
      updatedAt
      baseline_estimated_volume
      baseline_capturedAt
      baseline_sample_count
      baselineComputedAt
    }
  }
`;

// =============================================================================
// Phase 6 追加：Melon snapshots
// =============================================================================

export const listHourlyMelonSnapshots = /* GraphQL */ `
  query ListHourlyMelonSnapshots(
    $melonID: String!
    $startTimestamp: String
    $endTimestamp: String
    $limit: Int
    $nextToken: String
  ) {
    listHourlyMelonSnapshots(
      melonID: $melonID
      startTimestamp: $startTimestamp
      endTimestamp: $endTimestamp
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        melonID
        hourTimestamp
        sampleCount
        daysAfterPollination
        density
        branch_points
        v_component
        h_component
        estimated_volume
        density_ideal
        branch_points_ideal
        v_component_ideal
        h_component_ideal
        density_diff
        branch_points_diff
        v_component_diff
        h_component_diff
        representative_capturedAt
        representative_s3Key
        representative_mask_s3_key
        relative_growth
      }
      nextToken
    }
  }
`;

export const listDailyMelonSnapshots = /* GraphQL */ `
  query ListDailyMelonSnapshots(
    $melonID: String!
    $startDate: String
    $endDate: String
    $limit: Int
    $nextToken: String
  ) {
    listDailyMelonSnapshots(
      melonID: $melonID
      startDate: $startDate
      endDate: $endDate
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        melonID
        dateJST
        daysAfterPollination
        density
        branch_points
        v_component
        h_component
        density_raw
        branch_points_raw
        v_component_raw
        h_component_raw
        density_ideal
        branch_points_ideal
        v_component_ideal
        h_component_ideal
        density_diff
        branch_points_diff
        v_component_diff
        h_component_diff
        representative_hourTimestamp
        representative_capturedAt
        representative_s3Key
        representative_mask_s3_key
        hourly_sample_count
        estimated_volume
        estimated_volume_raw
        relative_growth
        relative_growth_raw
      }
      nextToken
    }
  }
`;

// =============================================================================
// Phase 6 追加：Ideal growth model
// =============================================================================

export const listIdealGrowthModels = /* GraphQL */ `
  query ListIdealGrowthModels($season: String!) {
    listIdealGrowthModels(season: $season) {
      season
      metric
      parameters {
        L
        k
        t0
      }
      r2_score
      updatedAt
    }
  }
`;

// =============================================================================
// Phase 6 追加：Daily sensor snapshot
// =============================================================================

export const listDailySensorSnapshots = /* GraphQL */ `
  query ListDailySensorSnapshots(
    $aggregationKey: String!
    $startDate: String
    $endDate: String
    $limit: Int
    $nextToken: String
  ) {
    listDailySensorSnapshots(
      aggregationKey: $aggregationKey
      startDate: $startDate
      endDate: $endDate
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        aggregationKey
        dateJST
        level
        fieldID
        sectionID
        plantID
        deviceID
        sampleCount
        temperature { min max mean median count }
        humidity    { min max mean median count }
        i_v_light   { min max mean sum count }
        u_v_light   { min max mean sum count }
        dailyGrowingDegreeDays
        GrowingDegreeDays {
          origin
          value
          coverageStart
        }
      }
      nextToken
    }
  }
`;

export const getDailySensorSnapshot = /* GraphQL */ `
  query GetDailySensorSnapshot(
    $aggregationKey: String!
    $dateJST: String!
  ) {
    getDailySensorSnapshot(
      aggregationKey: $aggregationKey
      dateJST: $dateJST
    ) {
      aggregationKey
      dateJST
      level
      fieldID
      sectionID
      plantID
      deviceID
      sampleCount
      temperature { min max mean median count }
      humidity    { min max mean median count }
      i_v_light   { min max mean sum count }
      u_v_light   { min max mean sum count }
      dailyGrowingDegreeDays
      GrowingDegreeDays {
        origin
        value
        coverageStart
      }
    }
  }
`;

// =============================================================================
// 既存：Mutation
// =============================================================================

export const createCsvExport = /* GraphQL */ `
  mutation CreateCsvExport(
    $deviceID: String!
    $startTimestamp: String!
    $endTimestamp: String!
  ) {
    createCsvExport(
      deviceID: $deviceID
      startTimestamp: $startTimestamp
      endTimestamp: $endTimestamp
    )
  }
`;
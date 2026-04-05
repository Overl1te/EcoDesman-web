import type { StyleSpecification } from "maplibre-gl";

const libertyMapStyleUrl = "https://tiles.openfreemap.org/styles/liberty";

const grayscaleLayers = {
  background: "#2e3747",
  residential: "#354053",
  wood: "#1e584c",
  grass: "#244d44",
  wetland: "#2d4f58",
  sand: "#425064",
  pitch: "#324154",
  track: "#334355",
  cemetery: "#334550",
  hospital: "#4a4257",
  school: "#43485f",
  minorRoad: "#91a1c6",
  roadCore: "#8a9bc1",
  roadCasing: "#5b6b8f",
  tunnelRoad: "#7284ab",
  rail: "#697999",
  water: "#0f3f9d",
  waterway: "#0b47b6",
  waterLabel: "#8cb4ff",
  building: "#b8c1cf",
  buildingOutline: "#556583",
  buildingExtrusion: "#a9b3c1",
  label: "#eef3ff",
  labelHalo: "rgba(38, 47, 64, 0.88)",
  roadLabel: "#c4d5ff",
};

const roadCenterLayerIds = [
  "road_path_pedestrian",
  "road_motorway_link",
  "road_service_track",
  "road_link",
  "road_minor",
  "road_secondary_tertiary",
  "road_trunk_primary",
  "road_motorway",
  "bridge_path_pedestrian",
  "bridge_motorway_link",
  "bridge_service_track",
  "bridge_link",
  "bridge_street",
  "bridge_secondary_tertiary",
  "bridge_trunk_primary",
  "bridge_motorway",
];

const roadCasingLayerIds = [
  "road_motorway_link_casing",
  "road_service_track_casing",
  "road_link_casing",
  "road_minor_casing",
  "road_secondary_tertiary_casing",
  "road_trunk_primary_casing",
  "road_motorway_casing",
  "bridge_motorway_link_casing",
  "bridge_service_track_casing",
  "bridge_link_casing",
  "bridge_street_casing",
  "bridge_path_pedestrian_casing",
  "bridge_secondary_tertiary_casing",
  "bridge_trunk_primary_casing",
  "bridge_motorway_casing",
];

const tunnelLayerIds = [
  "tunnel_motorway_link",
  "tunnel_service_track",
  "tunnel_link",
  "tunnel_minor",
  "tunnel_secondary_tertiary",
  "tunnel_trunk_primary",
  "tunnel_motorway",
  "tunnel_path_pedestrian",
];

const tunnelCasingLayerIds = [
  "tunnel_motorway_link_casing",
  "tunnel_service_track_casing",
  "tunnel_link_casing",
  "tunnel_street_casing",
  "tunnel_secondary_tertiary_casing",
  "tunnel_trunk_primary_casing",
  "tunnel_motorway_casing",
];

const railLayerIds = [
  "road_major_rail",
  "road_major_rail_hatching",
  "road_transit_rail",
  "road_transit_rail_hatching",
  "bridge_major_rail",
  "bridge_major_rail_hatching",
  "bridge_transit_rail",
  "bridge_transit_rail_hatching",
  "tunnel_major_rail",
  "tunnel_major_rail_hatching",
  "tunnel_transit_rail",
  "tunnel_transit_rail_hatching",
];

const placeLabelLayerIds = [
  "label_other",
  "label_village",
  "label_town",
  "label_state",
  "label_city",
  "label_city_capital",
  "label_country_3",
  "label_country_2",
  "label_country_1",
];

const roadLabelLayerIds = [
  "highway-name-path",
  "highway-name-minor",
  "highway-name-major",
];

const waterLabelLayerIds = [
  "waterway_line_label",
  "water_name_point_label",
  "water_name_line_label",
];

type ThemeMode = "light" | "dark";

let customDarkMapStylePromise: Promise<StyleSpecification> | null = null;

function cloneStyle(style: StyleSpecification): StyleSpecification {
  if (typeof structuredClone === "function") {
    return structuredClone(style);
  }

  return JSON.parse(JSON.stringify(style)) as StyleSpecification;
}

function findLayer(style: StyleSpecification, layerId: string) {
  return style.layers.find((layer) => layer.id === layerId);
}

function updatePaint(
  style: StyleSpecification,
  layerId: string,
  patch: Record<string, unknown>,
) {
  const layer = findLayer(style, layerId);
  if (!layer) {
    return;
  }

  layer.paint = {
    ...(layer.paint ?? {}),
    ...patch,
  };
}

function createDarkGrayMapStyle(baseStyle: StyleSpecification) {
  const style = cloneStyle(baseStyle);

  updatePaint(style, "background", {
    "background-color": grayscaleLayers.background,
  });

  updatePaint(style, "landuse_residential", { "fill-color": grayscaleLayers.residential });
  updatePaint(style, "landcover_wood", { "fill-color": grayscaleLayers.wood });
  updatePaint(style, "landcover_grass", { "fill-color": grayscaleLayers.grass });
  updatePaint(style, "landcover_wetland", { "fill-color": grayscaleLayers.wetland });
  updatePaint(style, "landcover_sand", { "fill-color": grayscaleLayers.sand });
  updatePaint(style, "landuse_pitch", { "fill-color": grayscaleLayers.pitch });
  updatePaint(style, "landuse_track", { "fill-color": grayscaleLayers.track });
  updatePaint(style, "landuse_cemetery", { "fill-color": grayscaleLayers.cemetery });
  updatePaint(style, "landuse_hospital", { "fill-color": grayscaleLayers.hospital });
  updatePaint(style, "landuse_school", { "fill-color": grayscaleLayers.school });

  updatePaint(style, "water", { "fill-color": grayscaleLayers.water });
  updatePaint(style, "waterway_river", { "line-color": grayscaleLayers.waterway });
  updatePaint(style, "waterway_other", { "line-color": grayscaleLayers.waterway });
  updatePaint(style, "waterway_tunnel", { "line-color": grayscaleLayers.waterway });
  updatePaint(style, "building", {
    "fill-color": grayscaleLayers.building,
    "fill-outline-color": [
      "interpolate",
      ["linear"],
      ["zoom"],
      13,
      "rgba(85, 101, 131, 0.2)",
      14,
      grayscaleLayers.buildingOutline,
    ],
  });
  updatePaint(style, "building-3d", {
    "fill-extrusion-color": grayscaleLayers.buildingExtrusion,
    "fill-extrusion-opacity": 0.26,
  });

  for (const layerId of roadCenterLayerIds) {
    updatePaint(style, layerId, {
      "line-color": grayscaleLayers.roadCore,
    });
  }

  for (const layerId of roadCasingLayerIds) {
    updatePaint(style, layerId, {
      "line-color": grayscaleLayers.roadCasing,
    });
  }

  for (const layerId of tunnelLayerIds) {
    updatePaint(style, layerId, {
      "line-color": grayscaleLayers.tunnelRoad,
    });
  }

  for (const layerId of tunnelCasingLayerIds) {
    updatePaint(style, layerId, {
      "line-color": grayscaleLayers.roadCasing,
    });
  }

  for (const layerId of railLayerIds) {
    updatePaint(style, layerId, {
      "line-color": grayscaleLayers.rail,
    });
  }

  updatePaint(style, "road_area_pattern", {
    "fill-color": "rgba(77, 92, 125, 0.18)",
  });

  for (const layerId of placeLabelLayerIds) {
    updatePaint(style, layerId, {
      "text-color": grayscaleLayers.label,
      "text-halo-color": grayscaleLayers.labelHalo,
      "text-halo-width": 1.2,
      "text-halo-blur": 0.8,
    });
  }

  for (const layerId of roadLabelLayerIds) {
    updatePaint(style, layerId, {
      "text-color": grayscaleLayers.roadLabel,
      "text-halo-color": grayscaleLayers.labelHalo,
      "text-halo-width": 1,
      "text-halo-blur": 0.7,
    });
  }

  for (const layerId of waterLabelLayerIds) {
    updatePaint(style, layerId, {
      "text-color": grayscaleLayers.waterLabel,
      "text-halo-color": grayscaleLayers.labelHalo,
      "text-halo-width": 1.4,
      "text-halo-blur": 0.7,
    });
  }

  return style;
}

async function getCustomDarkMapStyle() {
  if (!customDarkMapStylePromise) {
    customDarkMapStylePromise = fetch(libertyMapStyleUrl, {
      cache: "force-cache",
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Не удалось загрузить стиль карты");
        }

        return (await response.json()) as StyleSpecification;
      })
      .then(createDarkGrayMapStyle);
  }

  return cloneStyle(await customDarkMapStylePromise);
}

export async function getMapStyle(mode: ThemeMode) {
  if (mode === "light") {
    return libertyMapStyleUrl;
  }

  return getCustomDarkMapStyle();
}

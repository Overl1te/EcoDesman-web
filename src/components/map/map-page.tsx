"use client";

import maplibregl, {
  type GeoJSONSource,
  type LngLatBoundsLike,
  type Map as MapLibreMap,
  type MapGeoJSONFeature,
} from "maplibre-gl";
import {
  Cuboid,
  Clock3,
  Filter,
  ImagePlus,
  MapPin,
  MessageSquarePlus,
  Send,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { useAuth } from "@/components/providers/auth-provider";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingBlock } from "@/components/ui/loading-block";
import {
  createMapPointReview,
  getMapOverview,
  getMapPointDetail,
  uploadImages,
} from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { readMapOverviewCache, writeMapOverviewCache } from "@/lib/map-cache";
import {
  getCategoryPriority,
  getMapPointAppearance,
  getPrimaryMapCategory,
} from "@/lib/map-point-style";
import type { MapOverviewResponse, MapPointDetail, MapPointSummary } from "@/lib/types";

const mapStyleUrl = "https://tiles.openfreemap.org/styles/liberty";
const pointSourceId = "eco-map-points";
const pointHaloLayerId = "eco-map-points-halo";
const pointLayerId = "eco-map-points";
const nizhnyCenter: [number, number] = [43.974881, 56.315048];
const nizhnyZoom = 11.8;
const twoDimensionalPitch = 0;
const threeDimensionalPitch = 52;
const threeDimensionalBearing = -16;

type PointFeatureProperties = {
  id: number;
  title: string;
  isSelected: boolean;
  color: string;
  haloColor: string;
  strokeColor: string;
  selectedColor: string;
  selectedStrokeColor: string;
};

function buildErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function buildPointsGeoJson(points: MapPointSummary[], selectedId?: number | null): GeoJSON.FeatureCollection<GeoJSON.Point, PointFeatureProperties> {
  return {
    type: "FeatureCollection",
    features: points.map((point) => {
      const appearance = getMapPointAppearance(getPrimaryMapCategory(point));
      return {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [point.longitude, point.latitude],
        },
        properties: {
          id: point.id,
          title: point.title,
          isSelected: point.id === selectedId,
          color: appearance.color,
          haloColor: appearance.haloColor,
          strokeColor: appearance.strokeColor,
          selectedColor: appearance.selectedColor,
          selectedStrokeColor: appearance.selectedStrokeColor,
        },
      };
    }),
  };
}

export function MapPage() {
  const { isAuthenticated, openAuthModal } = useAuth();
  const [overview, setOverview] = useState<MapOverviewResponse | null>(null);
  const [selected, setSelected] = useState<MapPointDetail | null>(null);
  const [activeCategory, setActiveCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewBody, setReviewBody] = useState("");
  const [reviewImages, setReviewImages] = useState<File[]>([]);
  const [reviewImagePreviews, setReviewImagePreviews] = useState<string[]>([]);
  const [reviewBusy, setReviewBusy] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [filtersExpanded, setFiltersExpanded] = useState(true);
  const [isThreeDimensional, setIsThreeDimensional] = useState(false);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const reviewFileInputRef = useRef<HTMLInputElement | null>(null);
  const reviewPreviewUrlsRef = useRef<string[]>([]);
  const mapInstanceRef = useRef<MapLibreMap | null>(null);
  const visiblePointsRef = useRef<MapPointSummary[]>([]);
  const selectedIdRef = useRef<number | null>(null);

  const resetReviewForm = useCallback(() => {
    setReviewFormOpen(false);
    setReviewRating(5);
    setReviewBody("");
    setReviewImages([]);
    setReviewImagePreviews((current) => {
      current.forEach((previewUrl) => URL.revokeObjectURL(previewUrl));
      return [];
    });
    if (reviewFileInputRef.current) {
      reviewFileInputRef.current.value = "";
    }
    setReviewError(null);
  }, []);

  useEffect(() => {
    reviewPreviewUrlsRef.current = reviewImagePreviews;
  }, [reviewImagePreviews]);

  useEffect(() => {
    return () => {
      reviewPreviewUrlsRef.current.forEach((previewUrl) => URL.revokeObjectURL(previewUrl));
    };
  }, []);

  const loadPointDetail = useCallback(async (pointId: number) => {
    const point = await getMapPointDetail(pointId);
    setSelected(point);
    return point;
  }, []);

  const openPoint = useCallback(
    async (pointId: number) => {
      setDetailLoading(true);
      setError(null);

      try {
        await loadPointDetail(pointId);
      } catch (nextError) {
        setError(buildErrorMessage(nextError, "Не удалось открыть точку"));
      } finally {
        setDetailLoading(false);
      }
    },
    [loadPointDetail],
  );

  useEffect(() => {
    let active = true;
    const cachedOverview = readMapOverviewCache();

    if (cachedOverview) {
      setOverview(cachedOverview);
      setLoading(false);
    }

    void getMapOverview()
      .then((response) => {
        if (!active) {
          return;
        }

        setOverview(response);
        writeMapOverviewCache(response);
        setError(null);
      })
      .catch((nextError) => {
        if (!active) {
          return;
        }

        if (!cachedOverview) {
          setError(buildErrorMessage(nextError, "Не удалось загрузить карту"));
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    resetReviewForm();
  }, [resetReviewForm, selected?.id]);

  const visiblePoints = useMemo(() => {
    if (!overview) {
      return [];
    }

    if (!activeCategory) {
      return overview.points;
    }

    return overview.points.filter((point) =>
      point.categories.some((category) => category.slug === activeCategory),
    );
  }, [activeCategory, overview]);

  const filterOptions = useMemo(() => {
    if (!overview) {
      return [];
    }

    return [...overview.categories]
      .sort((left, right) => {
        const priorityDiff = getCategoryPriority(right) - getCategoryPriority(left);
        if (priorityDiff !== 0) {
          return priorityDiff;
        }
        return left.title.localeCompare(right.title, "ru");
      })
      .map((category) => ({
        ...category,
        appearance: getMapPointAppearance(category),
        count: overview.points.filter((point) =>
          point.categories.some((item) => item.slug === category.slug),
        ).length,
      }));
  }, [overview]);

  const selectedCategoryTitle = useMemo(() => {
    if (!overview || !activeCategory) {
      return "Все точки";
    }

    return (
      overview.categories.find((category) => category.slug === activeCategory)?.title ??
      "Фильтры"
    );
  }, [activeCategory, overview]);

  useEffect(() => {
    visiblePointsRef.current = visiblePoints;
    selectedIdRef.current = selected?.id ?? null;
  }, [selected?.id, visiblePoints]);

  useEffect(() => {
    if (!selected || !activeCategory) {
      return;
    }

    const matchesFilter = selected.categories.some(
      (category) => category.slug === activeCategory,
    );

    if (!matchesFilter) {
      setSelected(null);
    }
  }, [activeCategory, selected]);

  function handleReviewFilesChange(fileList: FileList | null) {
    if (!fileList?.length) {
      return;
    }

    const nextFiles = Array.from(fileList);
    const nextPreviewUrls = nextFiles.map((file) => URL.createObjectURL(file));

    setReviewImages((current) => [...current, ...nextFiles]);
    setReviewImagePreviews((current) => [...current, ...nextPreviewUrls]);
  }

  function removeReviewImage(index: number) {
    setReviewImages((current) => current.filter((_, currentIndex) => currentIndex !== index));
    setReviewImagePreviews((current) => {
      const previewUrl = current[index];
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      return current.filter((_, currentIndex) => currentIndex !== index);
    });
  }

  async function submitReview() {
    if (!selected) {
      return;
    }

    if (!isAuthenticated) {
      openAuthModal({ returnTo: "/map" });
      return;
    }

    const body = reviewBody.trim();
    if (body.length < 3) {
      setReviewError("Напишите хотя бы несколько слов об этой точке.");
      return;
    }

    setReviewBusy(true);
    setReviewError(null);

    try {
      const imageUrls = reviewImages.length ? await uploadImages(reviewImages) : [];
      await createMapPointReview(selected.id, {
        rating: reviewRating,
        body,
        image_urls: imageUrls,
      });
      await loadPointDetail(selected.id);
      resetReviewForm();
    } catch (nextError) {
      setReviewError(buildErrorMessage(nextError, "Не удалось отправить отзыв"));
    } finally {
      setReviewBusy(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    let resizeObserver: ResizeObserver | null = null;

    const setupMap = async () => {
      if (!overview || !mapRef.current || mapInstanceRef.current) {
        return;
      }

      try {
        const bounds: LngLatBoundsLike = [
          [overview.bounds.west, overview.bounds.south],
          [overview.bounds.east, overview.bounds.north],
        ];

        const map = new maplibregl.Map({
          container: mapRef.current,
          style: mapStyleUrl,
          center: nizhnyCenter,
          zoom: nizhnyZoom,
          pitch: threeDimensionalPitch,
          bearing: threeDimensionalBearing,
          maxPitch: 60,
          attributionControl: false,
          maxBounds: bounds,
          renderWorldCopies: false,
        });

        map.addControl(
          new maplibregl.NavigationControl({
            showCompass: false,
            visualizePitch: false,
          }),
          "bottom-right",
        );

        map.on("load", () => {
          if (cancelled) {
            return;
          }

          map.addSource(pointSourceId, {
            type: "geojson",
            data: buildPointsGeoJson(
              visiblePointsRef.current,
              selectedIdRef.current,
            ),
          });

          map.addLayer({
            id: pointHaloLayerId,
            type: "circle",
            source: pointSourceId,
            paint: {
              "circle-radius": [
                "case",
                ["boolean", ["get", "isSelected"], false],
                19,
                15,
              ],
              "circle-color": ["get", "haloColor"],
            },
          });

          map.addLayer({
            id: pointLayerId,
            type: "circle",
            source: pointSourceId,
            paint: {
              "circle-radius": [
                "case",
                ["boolean", ["get", "isSelected"], false],
                10.5,
                8.5,
              ],
              "circle-color": [
                "case",
                ["boolean", ["get", "isSelected"], false],
                ["get", "selectedColor"],
                ["get", "color"],
              ],
              "circle-stroke-width": [
                "case",
                ["boolean", ["get", "isSelected"], false],
                3,
                2,
              ],
              "circle-stroke-color": [
                "case",
                ["boolean", ["get", "isSelected"], false],
                ["get", "selectedStrokeColor"],
                ["get", "strokeColor"],
              ],
            },
          });

          map.on("mouseenter", pointLayerId, () => {
            map.getCanvas().style.cursor = "pointer";
          });

          map.on("mouseleave", pointLayerId, () => {
            map.getCanvas().style.cursor = "";
          });

          map.on("click", pointLayerId, (event) => {
            const feature = event.features?.[0] as MapGeoJSONFeature | undefined;
            const pointId = Number(feature?.properties?.id);
            if (!Number.isNaN(pointId)) {
              void openPoint(pointId);
            }
          });

          setMapReady(true);
          requestAnimationFrame(() => {
            map.resize();
          });
        });

        map.on("error", (event) => {
          console.error("maplibre-error", event.error);
        });

        resizeObserver = new ResizeObserver(() => {
          map.resize();
        });
        resizeObserver.observe(mapRef.current);

        mapInstanceRef.current = map;
      } catch (nextError) {
        console.error("maplibre-init-error", nextError);
        if (!cancelled) {
          setError(buildErrorMessage(nextError, "Не удалось инициализировать карту"));
        }
      }
    };

    void setupMap();

    return () => {
      cancelled = true;
      resizeObserver?.disconnect();
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
      setMapReady(false);
    };
  }, [openPoint, overview]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!mapReady || !map) {
      return;
    }

    const source = map.getSource(pointSourceId) as GeoJSONSource | undefined;
    source?.setData(buildPointsGeoJson(visiblePoints, selected?.id));
  }, [mapReady, selected?.id, visiblePoints]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!mapReady || !map) {
      return;
    }

    if (selected) {
      map.easeTo({
        center: [selected.longitude, selected.latitude],
        zoom: 13.6,
        duration: 600,
      });
      return;
    }

    map.easeTo({
      center: nizhnyCenter,
      zoom: nizhnyZoom,
      duration: 600,
    });
  }, [mapReady, selected]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!mapReady || !map) {
      return;
    }

    map.easeTo({
      pitch: isThreeDimensional ? threeDimensionalPitch : twoDimensionalPitch,
      bearing: isThreeDimensional ? threeDimensionalBearing : 0,
      duration: 700,
    });
  }, [isThreeDimensional, mapReady]);

  return (
    <AppShell title="Карта" contentClassName="page-content-map">
      {loading ? <LoadingBlock label="Загружаю карту..." /> : null}
      {error ? <EmptyState title="Ошибка загрузки карты" description={error} /> : null}

      {!loading && !error && overview ? (
        <section className="map-stage">
          <div ref={mapRef} className="map-canvas map-canvas-full" />

          {!mapReady ? (
            <div className="map-loading-overlay">
              <LoadingBlock label="Поднимаю карту..." />
            </div>
          ) : null}

          <div className={`map-toolbar ${filtersExpanded ? "" : "is-collapsed"}`}>
            <div className="map-toolbar-header">
              <div className="map-toolbar-header-copy">
                <strong className="map-toolbar-title">
                  {`${selectedCategoryTitle} · ${visiblePoints.length} точек`}
                </strong>
                <p className="eyebrow map-toolbar-label">Фильтры</p>
              </div>
              <div className="map-toolbar-actions">
                <button
                  type="button"
                  className="button button-muted button-inline map-toolbar-mode"
                  aria-label={
                    isThreeDimensional
                      ? "Переключить карту в 2D"
                      : "Переключить карту в 3D"
                  }
                  onClick={() => setIsThreeDimensional((current) => !current)}
                >
                  <Cuboid className="button-icon" />
                  <span>{isThreeDimensional ? "3D" : "2D"}</span>
                </button>
                <button
                  type="button"
                  className="icon-button icon-button-muted map-toolbar-toggle"
                  aria-label={filtersExpanded ? "Скрыть фильтры" : "Показать фильтры"}
                  aria-controls="map-filter-grid"
                  aria-expanded={filtersExpanded}
                  onClick={() => setFiltersExpanded((current) => !current)}
                >
                  <Filter className="nav-icon" />
                </button>
              </div>
            </div>

            {filtersExpanded ? (
              <div id="map-filter-grid" className="map-filter-grid">
                <button
                  type="button"
                  className={`map-filter-pill ${activeCategory === "" ? "is-active" : ""}`}
                  onClick={() => setActiveCategory("")}
                >
                  <span
                    className="map-filter-pill-swatch"
                    style={{ backgroundColor: "#56616F" }}
                    aria-hidden="true"
                  />
                  <span>Все</span>
                  <strong>{overview.points.length}</strong>
                </button>

                {filterOptions.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    className={`map-filter-pill ${
                      activeCategory === category.slug ? "is-active" : ""
                    }`}
                    onClick={() => setActiveCategory(category.slug)}
                  >
                    <span
                      className="map-filter-pill-swatch"
                      style={{ backgroundColor: category.appearance.color }}
                      aria-hidden="true"
                    />
                    <span>{category.title}</span>
                    <strong>{category.count}</strong>
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="map-hint">
            <span className="map-hint-dot" />
            <span>Нажмите на точку, чтобы открыть подробности</span>
          </div>

          <div className="map-attribution" aria-label="Атрибуция карты">
            <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">
              © OpenStreetMap
            </a>
            <span aria-hidden="true">·</span>
            <a href="https://www.openmaptiles.org/" target="_blank" rel="noreferrer">
              OpenMapTiles
            </a>
            <span aria-hidden="true">·</span>
            <a href="https://openfreemap.org/" target="_blank" rel="noreferrer">
              OpenFreeMap
            </a>
          </div>

          {selected || detailLoading ? (
            <aside className={`map-detail-overlay ${selected ? "is-open" : ""}`}>
              <div className="map-detail-header">
                <div>
                  <p className="eyebrow">Точка</p>
                  <h3>{selected?.title || "Загружаю..."}</h3>
                </div>
                <button
                  type="button"
                  className="icon-button icon-button-muted"
                  aria-label="Закрыть карточку точки"
                  onClick={() => setSelected(null)}
                >
                  <X className="nav-icon" />
                </button>
              </div>

              {detailLoading && !selected ? (
                <LoadingBlock label="Открываю точку..." />
              ) : selected ? (
                <div className="map-detail-content">

                  {selected.images.length ? (
                    <div className="map-gallery-grid">
                      {selected.images.map((image) => (
                        <a key={image.id} href={image.image_url} target="_blank" rel="noreferrer">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={image.image_url}
                            alt={image.caption || selected.title}
                            className="gallery-image"
                          />
                        </a>
                      ))}
                    </div>
                  ) : null}

                  <p className="muted">{selected.short_description}</p>

                  {selected.categories.length ? (
                    <div className="map-category-row" aria-label="Категории точки">
                      {selected.categories.map((category) => {
                        const appearance = getMapPointAppearance(category);

                        return (
                          <span
                            key={category.id}
                            className="map-category-chip"
                            style={{
                              borderColor: appearance.color,
                              backgroundColor: appearance.haloColor,
                            }}
                          >
                            <span
                              className="map-category-chip-dot"
                              style={{ backgroundColor: appearance.color }}
                              aria-hidden="true"
                            />
                            {category.title}
                          </span>
                        );
                      })}
                    </div>
                  ) : null}

                  <p className="map-detail-text">{selected.description}</p>

                  <div className="map-detail-meta">
                    {selected.address ? (
                      <div className="map-meta-row">
                        <MapPin className="nav-icon" />
                        <span>{selected.address}</span>
                      </div>
                    ) : null}
                    {selected.working_hours ? (
                      <div className="map-meta-row">
                        <Clock3 className="nav-icon" />
                        <span>{selected.working_hours}</span>
                      </div>
                    ) : null}
                  </div>

                  <div className="section-row">
                    <h4>Отзывы</h4>
                    <button
                      type="button"
                      className="button button-muted button-inline"
                      onClick={() => {
                        if (!isAuthenticated) {
                          openAuthModal({ returnTo: "/map" });
                          return;
                        }
                        setReviewFormOpen((current) => !current);
                        setReviewError(null);
                      }}
                    >
                      <MessageSquarePlus className="button-icon" />
                      <span>{reviewFormOpen ? "Скрыть форму" : "Добавить отзыв"}</span>
                    </button>
                  </div>

                  {reviewFormOpen ? (
                    <div className="panel stack-list map-review-form">
                      <div className="map-review-stars" role="radiogroup" aria-label="Оценка">
                        {Array.from({ length: 5 }, (_, index) => {
                          const value = index + 1;
                          const active = value <= reviewRating;

                          return (
                            <button
                              key={value}
                              type="button"
                              className={`map-review-star ${active ? "is-active" : ""}`}
                              onClick={() => setReviewRating(value)}
                              aria-label={`Оценка ${value}`}
                            >
                              <Star className="review-rating-icon" />
                            </button>
                          );
                        })}
                      </div>

                      <label className="field">
                        <span>Ваш отзыв</span>
                        <textarea
                          value={reviewBody}
                          onChange={(event) => setReviewBody(event.target.value)}
                          placeholder="Напишите, что понравилось или что стоит улучшить"
                        />
                      </label>

                      <div className="map-review-upload">
                        <input
                          ref={reviewFileInputRef}
                          type="file"
                          accept="image/*"
                          multiple
                          className="visually-hidden"
                          onChange={(event) => {
                            handleReviewFilesChange(event.target.files);
                            event.target.value = "";
                          }}
                        />

                        <div className="map-review-upload-header">
                          <div>
                            <strong>Фотографии места</strong>
                            <p className="muted">
                              Можно приложить несколько снимков к отзыву.
                            </p>
                          </div>
                          <button
                            type="button"
                            className="button button-muted button-inline"
                            onClick={() => reviewFileInputRef.current?.click()}
                            disabled={reviewBusy}
                          >
                            <ImagePlus className="button-icon" />
                            <span>
                              {reviewImages.length ? "Добавить ещё" : "Добавить фото"}
                            </span>
                          </button>
                        </div>

                        {reviewImagePreviews.length ? (
                          <div className="map-review-image-grid">
                            {reviewImagePreviews.map((previewUrl, index) => (
                              <div key={previewUrl} className="map-review-image-card">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={previewUrl}
                                  alt={`Предпросмотр фото ${index + 1}`}
                                  className="gallery-image"
                                />
                                <button
                                  type="button"
                                  className="icon-button icon-button-muted map-review-image-remove"
                                  aria-label={`Удалить фото ${index + 1}`}
                                  onClick={() => removeReviewImage(index)}
                                  disabled={reviewBusy}
                                >
                                  <Trash2 className="nav-icon" />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </div>

                      {reviewError ? <div className="form-banner is-error">{reviewError}</div> : null}

                      <div className="comment-actions">
                        <button
                          type="button"
                          className="button button-primary"
                          onClick={() => void submitReview()}
                          disabled={reviewBusy}
                        >
                          <Send className="button-icon" />
                          <span>{reviewBusy ? "Отправляю..." : "Опубликовать"}</span>
                        </button>
                        <button
                          type="button"
                          className="button button-ghost"
                          onClick={resetReviewForm}
                          disabled={reviewBusy}
                        >
                          Отмена
                        </button>
                      </div>
                    </div>
                  ) : null}

                  {selected.reviews.length ? (
                    <div className="stack-list">
                      {selected.reviews.map((review) => (
                        <article key={review.id} className="review-card">
                          <div className="review-card-header">
                            <strong>{review.author_name}</strong>
                            <span className="review-rating">
                              <Star className="review-rating-icon" />
                              {review.rating}/5
                            </span>
                          </div>
                          <span className="muted">{formatDateTime(review.created_at)}</span>
                          <p>{review.body}</p>
                          {review.images.length ? (
                            <div className="map-review-image-grid">
                              {review.images.map((image) => (
                                <a
                                  key={image.id}
                                  href={image.image_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="map-review-image-card"
                                >
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={image.image_url}
                                    alt={image.caption || review.author_name}
                                    className="gallery-image"
                                  />
                                </a>
                              ))}
                            </div>
                          ) : null}
                        </article>
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      title="Пока нет отзывов"
                      description="Станьте первым, кто поделится впечатлениями об этой точке."
                    />
                  )}
                </div>
              ) : null}
            </aside>
          ) : null}
        </section>
      ) : null}
    </AppShell>
  );
}

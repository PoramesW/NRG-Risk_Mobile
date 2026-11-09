import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  G,
  Line,
  LinearGradient,
  Path,
  Rect,
  Stop,
} from 'react-native-svg';
import { ForecastPoint } from '@/services/adminMockData';
import { colors, fonts, radius, typography } from '@/utils/theme';

function buildSmoothPath(points: { x: number; y: number }[]) {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const cx = (p0.x + p1.x) / 2;
    d += ` C ${cx} ${p0.y}, ${cx} ${p1.y}, ${p1.x} ${p1.y}`;
  }
  return d;
}

export function TrendTimeSeriesChart({
  labels,
  values,
  movingAvg,
  showMovingAverage,
  zoomMode,
}: {
  labels: string[];
  values: number[];
  movingAvg: number[];
  showMovingAverage: boolean;
  zoomMode: 'Full' | 'Peak' | 'Recent';
}) {
  const [selectedIdx, setSelectedIdx] = useState<number>(values.length - 3);

  const sliceRange =
    zoomMode === 'Peak'
      ? [4, 10]
      : zoomMode === 'Recent'
        ? [6, 12]
        : [0, values.length];

  const slicedValues = values.slice(sliceRange[0], sliceRange[1]);
  const slicedMa = movingAvg.slice(sliceRange[0], sliceRange[1]);
  const slicedLabels = labels.slice(sliceRange[0], sliceRange[1]);

  const W = 640;
  const H = 210;
  const padX = 18;
  const padTop = 18;
  const padBottom = 26;
  const plotW = W - padX * 2;
  const plotH = H - padTop - padBottom;

  const allNums = [...slicedValues, ...(showMovingAverage ? slicedMa : [])];
  const minV = Math.min(...allNums) * 0.92;
  const maxV = Math.max(...allNums) * 1.06;
  const span = Math.max(0.2, maxV - minV);

  const toCoords = (arr: number[]) =>
    arr.map((v, i) => ({
      x: padX + (i / Math.max(1, arr.length - 1)) * plotW,
      y: padTop + (1 - (v - minV) / span) * plotH,
    }));

  const actualPts = toCoords(slicedValues);
  const maPts = toCoords(slicedMa);
  const linePath = buildSmoothPath(actualPts);
  const maPath = buildSmoothPath(maPts);
  const areaPath =
    actualPts.length > 1
      ? `${linePath} L ${actualPts[actualPts.length - 1].x} ${padTop + plotH} L ${actualPts[0].x} ${padTop + plotH} Z`
      : '';

  const clampedIdx = Math.min(slicedValues.length - 1, Math.max(0, selectedIdx));
  const activePt = actualPts[clampedIdx];

  return (
    <View style={styles.chartContainer}>
      <View style={styles.scrubBanner}>
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendSwatch, { backgroundColor: colors.primary }]} />
            <Text style={styles.legendLabel}>Metered Demand</Text>
          </View>
          {showMovingAverage && (
            <View style={styles.legendItem}>
              <View style={[styles.legendSwatchDash, { borderColor: colors.teal }]} />
              <Text style={styles.legendLabel}>3-Point Moving Avg</Text>
            </View>
          )}
        </View>
        <Text style={styles.scrubReadout}>
          {slicedLabels[clampedIdx]}: <Text style={styles.scrubStrong}>{slicedValues[clampedIdx]} GW</Text>
          {showMovingAverage ? ` (MA ${slicedMa[clampedIdx]} GW)` : ''}
        </Text>
      </View>

      <View style={styles.svgBox}>
        <Svg width="100%" height={205} viewBox={`0 0 ${W} ${H}`}>
          <Defs>
            <LinearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={colors.primary} stopOpacity="0.20" />
              <Stop offset="1" stopColor={colors.primary} stopOpacity="0.01" />
            </LinearGradient>
          </Defs>

          {[0, 0.33, 0.66, 1].map((t) => {
            const y = padTop + t * plotH;
            return (
              <Line
                key={t}
                x1={padX}
                y1={y}
                x2={W - padX}
                y2={y}
                stroke={colors.border}
                strokeWidth="1"
                strokeDasharray={t === 1 ? undefined : '4 4'}
              />
            );
          })}

          {areaPath ? <Path d={areaPath} fill="url(#trendFill)" /> : null}
          {showMovingAverage && maPath ? (
            <Path
              d={maPath}
              fill="none"
              stroke={colors.teal}
              strokeWidth="2.2"
              strokeDasharray="6 4"
            />
          ) : null}
          <Path d={linePath} fill="none" stroke={colors.primary} strokeWidth="2.8" />

          {activePt && (
            <G>
              <Line
                x1={activePt.x}
                y1={padTop}
                x2={activePt.x}
                y2={padTop + plotH}
                stroke={colors.primaryBorder}
                strokeWidth="1.5"
              />
              <Circle
                cx={activePt.x}
                cy={activePt.y}
                r="6.5"
                fill={colors.card}
                stroke={colors.primary}
                strokeWidth="3"
              />
            </G>
          )}
        </Svg>
      </View>

      <View style={styles.xAxisStrip}>
        {slicedLabels.map((lbl, idx) => {
          const active = idx === clampedIdx;
          return (
            <Pressable
              key={`${lbl}-${idx}`}
              onPress={() => setSelectedIdx(idx)}
              style={[styles.xTickBtn, active && styles.xTickBtnActive]}
              accessibilityLabel={`Inspect ${lbl}: ${slicedValues[idx]} GW`}
            >
              <Text style={[styles.xTickText, active && styles.xTickTextActive]} numberOfLines={1}>
                {lbl}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function EnergyMixVisual({
  items,
  comparePrev,
}: {
  items: { label: string; share: number; prevShare: number; actualGwh: string; color: string }[];
  comparePrev: boolean;
}) {
  const radiusR = 54;
  const circumference = 2 * Math.PI * radiusR;
  let cumulative = 0;

  return (
    <View style={styles.mixWrapper}>
      <View style={styles.donutRow}>
        <View style={styles.donutBox}>
          <Svg width={144} height={144} viewBox="0 0 144 144">
            <Circle
              cx="72"
              cy="72"
              r={radiusR}
              fill="none"
              stroke={colors.cardMuted}
              strokeWidth="18"
            />
            {items.map((item) => {
              const strokeLen = (item.share / 100) * circumference;
              const offset = -cumulative * circumference;
              cumulative += item.share / 100;
              return (
                <Circle
                  key={item.label}
                  cx="72"
                  cy="72"
                  r={radiusR}
                  fill="none"
                  stroke={item.color}
                  strokeWidth="18"
                  strokeDasharray={`${Math.max(0, strokeLen - 2)} ${circumference}`}
                  strokeDashoffset={offset}
                  rotation="-90"
                  origin="72, 72"
                  strokeLinecap="butt"
                />
              );
            })}
          </Svg>
          <View style={styles.donutCenter} pointerEvents="none">
            <Text style={styles.donutTotal}>18.40</Text>
            <Text style={styles.donutUnit}>GWh total</Text>
          </View>
        </View>

        <View style={styles.strataCol}>
          <Text style={styles.strataCaption}>Proportional distribution</Text>
          <View style={styles.stackedBar}>
            {items.map((item) => (
              <View
                key={item.label}
                style={{
                  flex: item.share,
                  backgroundColor: item.color,
                  height: '100%',
                }}
              />
            ))}
          </View>
          <View style={styles.mixTable}>
            {items.map((item) => {
              const diff = item.share - item.prevShare;
              const diffSign = diff > 0 ? `+${diff}%` : `${diff}%`;
              return (
                <View key={item.label} style={styles.mixTableRow}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendSwatch, { backgroundColor: item.color }]} />
                    <Text style={styles.mixCarrierName}>{item.label}</Text>
                  </View>
                  <View style={styles.mixStatsRight}>
                    <Text style={styles.mixGwh}>{item.actualGwh} GWh</Text>
                    <Text style={styles.mixPct}>{item.share}%</Text>
                    {comparePrev && (
                      <Text
                        style={[
                          styles.mixDelta,
                          { color: diff >= 0 ? colors.success : colors.warn },
                        ]}
                      >
                        {diffSign}
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
}

export function ForecastComparisonChart({
  points,
  onSelectPoint,
  selectedIndex,
}: {
  points: ForecastPoint[];
  onSelectPoint: (pt: ForecastPoint) => void;
  selectedIndex: number | null;
}) {
  const W = 640;
  const H = 205;
  const padX = 20;
  const padTop = 18;
  const padBottom = 24;
  const plotW = W - padX * 2;
  const plotH = H - padTop - padBottom;

  const vals = points.flatMap((p) => [p.actual, p.forecast]);
  const minV = Math.min(...vals) * 0.9;
  const maxV = Math.max(...vals) * 1.08;
  const span = Math.max(0.2, maxV - minV);

  const actualCoords = points.map((p, i) => ({
    x: padX + (i / Math.max(1, points.length - 1)) * plotW,
    y: padTop + (1 - (p.actual - minV) / span) * plotH,
  }));
  const forecastCoords = points.map((p, i) => ({
    x: padX + (i / Math.max(1, points.length - 1)) * plotW,
    y: padTop + (1 - (p.forecast - minV) / span) * plotH,
  }));

  const maxAbsRes = Math.max(0.15, ...points.map((p) => Math.abs(p.residual)));

  return (
    <View style={styles.chartContainer}>
      <View style={styles.scrubBanner}>
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendSwatch, { backgroundColor: colors.primary }]} />
            <Text style={styles.legendLabel}>Actual Load</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendSwatchDash, { borderColor: colors.violet }]} />
            <Text style={styles.legendLabel}>GRU Forecast</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendSwatch, { backgroundColor: colors.dangerDot }]} />
            <Text style={styles.legendLabel}>High Residual (tap to inspect)</Text>
          </View>
        </View>
      </View>

      <View style={styles.svgBox}>
        <Svg width="100%" height={200} viewBox={`0 0 ${W} ${H}`}>
          {[0, 0.33, 0.66, 1].map((t) => {
            const y = padTop + t * plotH;
            return (
              <Line
                key={t}
                x1={padX}
                y1={y}
                x2={W - padX}
                y2={y}
                stroke={colors.border}
                strokeWidth="1"
                strokeDasharray={t === 1 ? undefined : '4 4'}
              />
            );
          })}
          <Path
            d={buildSmoothPath(forecastCoords)}
            fill="none"
            stroke={colors.violet}
            strokeWidth="2.4"
            strokeDasharray="6 4"
          />
          <Path
            d={buildSmoothPath(actualCoords)}
            fill="none"
            stroke={colors.primary}
            strokeWidth="2.8"
          />

          {points.map((pt, i) => {
            const c = actualCoords[i];
            const isSelected = selectedIndex === i;
            if (!pt.highError && !isSelected) return null;
            return (
              <G key={pt.index}>
                <Circle
                  cx={c.x}
                  cy={c.y}
                  r={isSelected ? 9 : 7}
                  fill={pt.highError ? colors.dangerBg : colors.primarySoft}
                  stroke={pt.highError ? colors.dangerDot : colors.primary}
                  strokeWidth="2.5"
                />
              </G>
            );
          })}
        </Svg>
      </View>

      {/* Residual Diverging Bar Sub-Chart */}
      <View style={styles.residualSection}>
        <Text style={styles.residualTitle}>Residuals (Actual − Forecast GW) — tap any slot for root-cause detail</Text>
        <View style={styles.residualStrip}>
          {points.map((pt, idx) => {
            const ratio = Math.min(1, Math.abs(pt.residual) / maxAbsRes);
            const barHeight = Math.max(6, Math.round(ratio * 34));
            const positive = pt.residual >= 0;
            const active = selectedIndex === idx;
            return (
              <Pressable
                key={pt.label}
                onPress={() => onSelectPoint(pt)}
                style={[styles.residualSlot, active && styles.residualSlotActive]}
                accessibilityRole="button"
                accessibilityLabel={`${pt.label}: residual ${pt.residual} GW`}
              >
                <View style={styles.residualHalfTop}>
                  {positive && (
                    <View
                      style={{
                        width: '66%',
                        height: barHeight,
                        borderTopLeftRadius: 5,
                        borderTopRightRadius: 5,
                        backgroundColor: pt.highError ? colors.dangerDot : colors.primaryBright,
                      }}
                    />
                  )}
                </View>
                <View style={styles.zeroAxis} />
                <View style={styles.residualHalfBottom}>
                  {!positive && (
                    <View
                      style={{
                        width: '66%',
                        height: barHeight,
                        borderBottomLeftRadius: 5,
                        borderBottomRightRadius: 5,
                        backgroundColor: pt.highError ? colors.dangerDot : colors.teal,
                      }}
                    />
                  )}
                </View>
                <Text
                  style={[
                    styles.residualLabel,
                    pt.highError && { color: colors.danger, fontFamily: fonts.sansSemiBold },
                  ]}
                  numberOfLines={1}
                >
                  {pt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

export function RiskScoreTimelineChart({
  scores,
  alertThreshold,
}: {
  scores: number[];
  alertThreshold: number;
}) {
  const W = 580;
  const H = 165;
  const padX = 16;
  const padY = 16;
  const plotW = W - padX * 2;
  const plotH = H - padY * 2;

  const coords = scores.map((s, i) => ({
    x: padX + (i / Math.max(1, scores.length - 1)) * plotW,
    y: padY + (1 - s / 100) * plotH,
  }));
  const thresholdY = padY + (1 - alertThreshold / 100) * plotH;

  return (
    <View style={styles.svgBox}>
      <Svg width="100%" height={165} viewBox={`0 0 ${W} ${H}`}>
        <Rect x={padX} y={padY} width={plotW} height={plotH * 0.2} fill="#FFF1F2" rx="6" />
        <Rect
          x={padX}
          y={padY + plotH * 0.2}
          width={plotW}
          height={plotH * 0.25}
          fill="#FFFBEB"
        />
        <Line
          x1={padX}
          y1={thresholdY}
          x2={W - padX}
          y2={thresholdY}
          stroke={colors.dangerDot}
          strokeWidth="1.6"
          strokeDasharray="5 4"
        />
        <Path
          d={buildSmoothPath(coords)}
          fill="none"
          stroke={colors.primary}
          strokeWidth="2.8"
        />
        {coords.map((c, idx) => (
          <Circle
            key={idx}
            cx={c.x}
            cy={c.y}
            r="4"
            fill={scores[idx] >= alertThreshold ? colors.dangerDot : colors.primary}
          />
        ))}
      </Svg>
    </View>
  );
}

export function LatencyPercentileChart({
  avgSeries,
  p95Series,
  p99Series,
}: {
  avgSeries: number[];
  p95Series: number[];
  p99Series: number[];
}) {
  const W = 580;
  const H = 170;
  const padX = 16;
  const padY = 16;
  const plotW = W - padX * 2;
  const plotH = H - padY * 2;
  const maxMs = 360;

  const mapPts = (arr: number[]) =>
    arr.map((v, i) => ({
      x: padX + (i / Math.max(1, arr.length - 1)) * plotW,
      y: padY + (1 - Math.min(maxMs, v) / maxMs) * plotH,
    }));

  const warnY = padY + (1 - 250 / maxMs) * plotH;

  return (
    <View style={styles.chartContainer}>
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendSwatch, { backgroundColor: colors.teal }]} />
          <Text style={styles.legendLabel}>Avg</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendSwatch, { backgroundColor: colors.primary }]} />
          <Text style={styles.legendLabel}>P95</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendSwatch, { backgroundColor: colors.amber }]} />
          <Text style={styles.legendLabel}>P99</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendSwatchDash, { borderColor: colors.dangerDot }]} />
          <Text style={styles.legendLabel}>250 ms Warning SLA</Text>
        </View>
      </View>
      <View style={styles.svgBox}>
        <Svg width="100%" height={165} viewBox={`0 0 ${W} ${H}`}>
          <Line
            x1={padX}
            y1={warnY}
            x2={W - padX}
            y2={warnY}
            stroke={colors.dangerDot}
            strokeWidth="1.4"
            strokeDasharray="5 4"
          />
          <Path d={buildSmoothPath(mapPts(p99Series))} fill="none" stroke={colors.amber} strokeWidth="2.2" />
          <Path d={buildSmoothPath(mapPts(p95Series))} fill="none" stroke={colors.primary} strokeWidth="2.4" />
          <Path d={buildSmoothPath(mapPts(avgSeries))} fill="none" stroke={colors.teal} strokeWidth="2.4" />
        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chartContainer: {
    gap: 10,
  },
  scrubBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 14,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  legendSwatch: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
  legendSwatchDash: {
    width: 14,
    height: 0,
    borderTopWidth: 2.5,
    borderStyle: 'dashed',
  },
  legendLabel: {
    ...typography.caption,
    color: colors.readForeground,
  },
  scrubReadout: {
    ...typography.caption,
    color: colors.readForeground,
    backgroundColor: colors.cardSubtle,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  scrubStrong: {
    ...typography.monoStrong,
    color: colors.primary,
  },
  svgBox: {
    width: '100%',
    backgroundColor: colors.cardSubtle,
    borderRadius: 16,
    paddingVertical: 6,
    overflow: 'hidden',
  },
  xAxisStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 3,
  },
  xTickBtn: {
    flex: 1,
    minHeight: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  xTickBtnActive: {
    backgroundColor: colors.primarySoft,
  },
  xTickText: {
    fontFamily: fonts.mono,
    fontSize: 10.5,
    color: colors.mutedForeground,
  },
  xTickTextActive: {
    fontFamily: fonts.monoMedium,
    color: colors.primary,
  },
  mixWrapper: {
    gap: 14,
  },
  donutRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 20,
  },
  donutBox: {
    width: 144,
    height: 144,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  donutCenter: {
    position: 'absolute',
    alignItems: 'center',
  },
  donutTotal: {
    fontFamily: fonts.sansBold,
    fontWeight: '700',
    fontSize: 21,
    color: colors.foreground,
  },
  donutUnit: {
    ...typography.caption,
    color: colors.mutedForeground,
  },
  strataCol: {
    flex: 1,
    minWidth: 210,
    gap: 10,
  },
  strataCaption: {
    ...typography.caption,
    color: colors.mutedForeground,
  },
  stackedBar: {
    height: 12,
    borderRadius: radius.full,
    overflow: 'hidden',
    flexDirection: 'row',
    backgroundColor: colors.cardMuted,
  },
  mixTable: {
    gap: 2,
  },
  mixTableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  mixCarrierName: {
    ...typography.bodySm,
    fontFamily: fonts.sansMedium,
    color: colors.foreground,
  },
  mixStatsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  mixGwh: {
    ...typography.mono,
    color: colors.mutedForeground,
  },
  mixPct: {
    ...typography.monoStrong,
    color: colors.foreground,
    minWidth: 38,
    textAlign: 'right',
  },
  mixDelta: {
    ...typography.mono,
    minWidth: 38,
    textAlign: 'right',
  },
  residualSection: {
    marginTop: 4,
    gap: 8,
  },
  residualTitle: {
    ...typography.caption,
    color: colors.mutedForeground,
  },
  residualStrip: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: colors.cardSubtle,
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 8,
    gap: 3,
  },
  residualSlot: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 8,
    paddingVertical: 4,
  },
  residualSlotActive: {
    backgroundColor: colors.primarySoft,
  },
  residualHalfTop: {
    height: 36,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  zeroAxis: {
    height: 1,
    width: '100%',
    backgroundColor: colors.borderStrong,
  },
  residualHalfBottom: {
    height: 36,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  residualLabel: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.mutedForeground,
    marginTop: 4,
  },
});


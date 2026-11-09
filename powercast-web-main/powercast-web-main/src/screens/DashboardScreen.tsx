import React, { useCallback, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Activity,
  BarChart3,
  CheckCircle2,
  Database,
  LogOut,
  RefreshCw,
  Shield,
  Users,
  Zap,
} from 'lucide-react-native';

import {
  ActivityLogRecord,
  AnomalyRecord,
  DatasetRecord,
  ForecastJobRecord,
  ImportHistoryRecord,
  LogAckStatus,
  ManagedUserRecord,
  MenuId,
  QualityIssueRecord,
  SharedFiltersState,
  SitemapPageId,
  SystemLogRecord,
  User,
  UserRole,
} from '@/types';
import {
  INITIAL_ACTIVITY_LOGS,
  INITIAL_ANOMALIES,
  INITIAL_DATASETS,
  INITIAL_FORECAST_JOBS,
  INITIAL_IMPORT_HISTORY,
  INITIAL_QUALITY_ISSUES,
  INITIAL_RISK_FACTORS,
  INITIAL_SYSTEM_LOGS,
  INITIAL_USERS,
  SITEMAP_PAGES,
} from '@/services/adminMockData';
import {
  DetailDrawerSheet,
  SelectPill,
  SoftButton,
  StatusPill,
} from '@/components/AdminPrimitives';
import { colors, focusRing, fonts, radius, shadow, typography } from '@/utils/theme';
import { AnalyzePages } from './AnalyzePages';
import { DataPages } from './DataPages';
import { SystemPages } from './SystemPages';
import { UsersPages } from './UsersPages';

interface DashboardScreenProps {
  user: User;
  onLogout: () => void;
}

const DEFAULT_FILTERS: SharedFiltersState = {
  dateRange: '7D',
  customStart: '2026-10-27',
  customEnd: '2026-11-03',
  granularity: 'Hourly',
  energyType: 'All',
  region: 'All Regions',
  dataset: 'All Datasets',
  status: 'All Status',
  search: '',
  operator: 'All Operators',
};

const MENU_GROUPS: {
  id: MenuId;
  label: string;
  mobileLabel: string;
  defaultPage: SitemapPageId;
}[] = [
  { id: 'analyze', label: 'Analyze', mobileLabel: 'Analyze', defaultPage: '1.1' },
  { id: 'data', label: 'Data Management', mobileLabel: 'Data', defaultPage: '2.1' },
  { id: 'system', label: 'System Status', mobileLabel: 'System', defaultPage: '3.1' },
  { id: 'users', label: 'User Management', mobileLabel: 'Users', defaultPage: '4.1' },
];

export function DashboardScreen({ user, onLogout }: DashboardScreenProps) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isMobile = width < 768;

  const initialRole: UserRole =
    user.role === 'Analyst' || user.role === 'Viewer' ? user.role : 'Admin';
  const [activeRole, setActiveRole] = useState<UserRole>(initialRole);
  const [activePage, setActivePage] = useState<SitemapPageId>('1.1');
  const [filters, setFilters] = useState<SharedFiltersState>(DEFAULT_FILTERS);
  const [lastRefreshed, setLastRefreshed] = useState('Just now');
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [mobileAccountOpen, setMobileAccountOpen] = useState(false);

  // Stateful domain records across all 10 pages
  const [datasets, setDatasets] = useState<DatasetRecord[]>(INITIAL_DATASETS);
  const [anomalies, setAnomalies] = useState<AnomalyRecord[]>(INITIAL_ANOMALIES);
  const [qualityIssues, setQualityIssues] = useState<QualityIssueRecord[]>(INITIAL_QUALITY_ISSUES);
  const [importHistory, setImportHistory] = useState<ImportHistoryRecord[]>(INITIAL_IMPORT_HISTORY);
  const [jobs, setJobs] = useState<ForecastJobRecord[]>(INITIAL_FORECAST_JOBS);
  const [logs, setLogs] = useState<SystemLogRecord[]>(INITIAL_SYSTEM_LOGS);
  const [managedUsers, setManagedUsers] = useState<ManagedUserRecord[]>(INITIAL_USERS);
  const [activityLogs, setActivityLogs] = useState<ActivityLogRecord[]>(INITIAL_ACTIVITY_LOGS);
  const [focusedUserId, setFocusedUserId] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((curr) => (curr === msg ? null : curr));
    }, 3200);
  }, []);

  const appendAudit = useCallback(
    (activity: ActivityLogRecord['activity'], detail: string) => {
      const entry: ActivityLogRecord = {
        id: `ACT-${Math.floor(510 + Math.random() * 400)}`,
        timestamp: '2026-11-03 01:10',
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        activity,
        ip: '10.42.18.104',
        device: isMobile ? 'Mobile Browser' : 'Desktop Console',
        result: 'Success',
        detail,
      };
      setActivityLogs((prev) => [entry, ...prev]);
    },
    [user, isMobile],
  );

  const currentPageMeta = useMemo(
    () => SITEMAP_PAGES.find((p) => p.id === activePage) ?? SITEMAP_PAGES[0],
    [activePage],
  );

  const activeMenu = currentPageMeta.menu;
  const siblingPages = useMemo(
    () => SITEMAP_PAGES.filter((p) => p.menu === activeMenu),
    [activeMenu],
  );

  const handleNavigatePage = useCallback((nextPage: SitemapPageId) => {
    setActivePage(nextPage);
    setFilters((prev) => ({ ...prev, status: 'All Status', search: '' }));
  }, []);

  const handleUpdateFilters = useCallback((patch: Partial<SharedFiltersState>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  // Domain handlers
  const handleUpdateAnomaly = useCallback(
    (id: string, patch: Partial<AnomalyRecord>) => {
      setAnomalies((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
    },
    [],
  );

  const handleToggleDatasetStatus = useCallback(
    (id: string) => {
      setDatasets((prev) =>
        prev.map((d) =>
          d.id === id ? { ...d, status: d.status === 'Active' ? 'Inactive' : 'Active' } : d,
        ),
      );
      appendAudit('Data Import', `Toggled dataset ${id} operational state.`);
    },
    [appendAudit],
  );

  const handleResolveQualityIssue = useCallback(
    (id: string) => {
      setQualityIssues((prev) =>
        prev.map((q) => (q.id === id ? { ...q, status: 'Resolved' } : q)),
      );
      appendAudit('Data Import', `Applied automated data quality remediation on ${id}.`);
    },
    [appendAudit],
  );

  const handleRecordImportOrJob = useCallback(
    (entry: ImportHistoryRecord, label: string) => {
      setImportHistory((prev) => [entry, ...prev]);
      appendAudit('Data Import', label);
    },
    [appendAudit],
  );

  const handleRerunJob = useCallback(
    (jobId: string) => {
      const target = jobs.find((j) => j.id === jobId);
      if (!target) return;
      const clone: ForecastJobRecord = {
        ...target,
        id: `JOB-${Math.floor(7430 + Math.random() * 60)}`,
        startTime: '01:10:05',
        endTime: 'Running',
        duration: '00m 04s',
        status: 'Running',
        triggerType: 'Manual',
        triggeredBy: user.name,
        logLines: [`[01:10:05] Manual rerun of ${jobId} initiated by ${user.name}`],
      };
      setJobs((prev) => [clone, ...prev]);
      appendAudit('Forecast Trigger', `Triggered manual rerun ${clone.id} (from ${jobId}).`);
    },
    [jobs, user.name, appendAudit],
  );

  const handleCancelJob = useCallback(
    (jobId: string) => {
      setJobs((prev) =>
        prev.map((j) =>
          j.id === jobId
            ? {
                ...j,
                status: 'Failed',
                endTime: 'Cancelled',
                logLines: [...j.logLines, `[01:10] Job cancelled by operator ${user.name}.`],
              }
            : j,
        ),
      );
      appendAudit('Forecast Trigger', `Cancelled forecast job ${jobId}.`);
    },
    [user.name, appendAudit],
  );

  const handleUpdateLogStatus = useCallback((logId: string, status: LogAckStatus) => {
    setLogs((prev) => prev.map((l) => (l.id === logId ? { ...l, status } : l)));
  }, []);

  const handleAcknowledgeAllNewLogs = useCallback(() => {
    setLogs((prev) =>
      prev.map((l) => (l.status === 'New' ? { ...l, status: 'Acknowledged' } : l)),
    );
  }, []);

  // User management handlers (with audit logging)
  const handleActivateUser = useCallback(
    (id: string) => {
      setManagedUsers((prev) =>
        prev.map((u) =>
          u.id === id
            ? {
                ...u,
                status: 'Active',
                suspensionReason: undefined,
                editHistory: [
                  { date: '2026-11-03', actor: user.name, change: 'Account activated' },
                  ...u.editHistory,
                ],
              }
            : u,
        ),
      );
      appendAudit('Account Action', `Activated user account ${id}.`);
    },
    [user.name, appendAudit],
  );

  const handleSuspendUser = useCallback(
    (id: string, reason: string) => {
      setManagedUsers((prev) =>
        prev.map((u) =>
          u.id === id
            ? {
                ...u,
                status: 'Suspended',
                suspensionReason: reason,
                editHistory: [
                  { date: '2026-11-03', actor: user.name, change: `Suspended: ${reason}` },
                  ...u.editHistory,
                ],
              }
            : u,
        ),
      );
      appendAudit('Account Action', `Suspended user ${id} (Reason: ${reason}).`);
    },
    [user.name, appendAudit],
  );

  const handleChangeUserRole = useCallback(
    (id: string, role: UserRole) => {
      setManagedUsers((prev) =>
        prev.map((u) =>
          u.id === id
            ? {
                ...u,
                role,
                editHistory: [
                  { date: '2026-11-03', actor: user.name, change: `Role updated to ${role}` },
                  ...u.editHistory,
                ],
              }
            : u,
        ),
      );
      appendAudit('Role Change', `Changed role for ${id} to ${role}.`);
    },
    [user.name, appendAudit],
  );

  const handleResetUserPassword = useCallback(
    (id: string) => {
      setManagedUsers((prev) =>
        prev.map((u) =>
          u.id === id
            ? {
                ...u,
                editHistory: [
                  { date: '2026-11-03', actor: user.name, change: 'Dispatched password reset link' },
                  ...u.editHistory,
                ],
              }
            : u,
        ),
      );
      appendAudit('Account Action', `Triggered password reset for ${id}.`);
    },
    [user.name, appendAudit],
  );

  const handleDeleteUser = useCallback(
    (id: string, reason: string) => {
      setManagedUsers((prev) => prev.filter((u) => u.id !== id));
      appendAudit('Account Action', `Deleted account ${id} (Reason: ${reason}).`);
    },
    [appendAudit],
  );

  const handleNavigateUserDetailFromLog = useCallback((userId: string) => {
    setActivePage('4.1');
    setFocusedUserId(userId);
  }, []);

  // Live alert badge counts per menu
  const badgeByPage: Partial<Record<SitemapPageId, number>> = {
    '1.3': anomalies.filter((a) => a.status === 'New').length,
    '2.3': qualityIssues.filter((q) => q.status === 'Open').length,
    '3.2': logs.filter((l) => l.status === 'New').length,
  };

  const renderMenuIcon = (menuId: MenuId, active: boolean) => {
    const iconColor = active ? colors.primary : colors.mutedForeground;
    if (menuId === 'analyze') return <BarChart3 size={18} color={iconColor} strokeWidth={2} />;
    if (menuId === 'data') return <Database size={18} color={iconColor} strokeWidth={2} />;
    if (menuId === 'system') return <Activity size={18} color={iconColor} strokeWidth={2} />;
    return <Users size={18} color={iconColor} strokeWidth={2} />;
  };

  const renderPageContent = () => {
    if (activePage === '1.1' || activePage === '1.2' || activePage === '1.3') {
      return (
        <AnalyzePages
          pageId={activePage}
          filters={filters}
          onUpdateFilters={handleUpdateFilters}
          onResetFilters={handleResetFilters}
          datasetNames={datasets.map((d) => d.slug)}
          riskFactors={INITIAL_RISK_FACTORS}
          anomalies={anomalies}
          onUpdateAnomaly={handleUpdateAnomaly}
          onNotify={showToast}
        />
      );
    }
    if (activePage === '2.1' || activePage === '2.2' || activePage === '2.3') {
      return (
        <DataPages
          pageId={activePage}
          filters={filters}
          onUpdateFilters={handleUpdateFilters}
          onResetFilters={handleResetFilters}
          datasets={datasets}
          onToggleDatasetStatus={handleToggleDatasetStatus}
          qualityIssues={qualityIssues}
          onResolveQualityIssue={handleResolveQualityIssue}
          importHistory={importHistory}
          onRecordImportOrJob={handleRecordImportOrJob}
          onNavigatePage={handleNavigatePage}
          currentOperatorName={user.name}
          activeRole={activeRole}
          onNotify={showToast}
        />
      );
    }
    if (activePage === '3.1' || activePage === '3.2') {
      return (
        <SystemPages
          pageId={activePage}
          filters={filters}
          onUpdateFilters={handleUpdateFilters}
          onResetFilters={handleResetFilters}
          jobs={jobs}
          onRerunJob={handleRerunJob}
          onCancelJob={handleCancelJob}
          logs={logs}
          onUpdateLogStatus={handleUpdateLogStatus}
          onAcknowledgeAllNewLogs={handleAcknowledgeAllNewLogs}
          activeRole={activeRole}
          onNotify={showToast}
        />
      );
    }
    return (
      <UsersPages
        pageId={activePage}
        filters={filters}
        onUpdateFilters={handleUpdateFilters}
        onResetFilters={handleResetFilters}
        currentUser={user}
        activeRole={activeRole}
        users={managedUsers}
        activityLogs={activityLogs}
        focusedUserId={focusedUserId}
        onSetFocusedUserId={setFocusedUserId}
        onActivateUser={handleActivateUser}
        onSuspendUser={handleSuspendUser}
        onChangeUserRole={handleChangeUserRole}
        onResetUserPassword={handleResetUserPassword}
        onDeleteUser={handleDeleteUser}
        onNavigateUserDetailFromLog={handleNavigateUserDetailFromLog}
        onNotify={showToast}
      />
    );
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {isMobile ? (
        /* ======================== MOBILE SHELL ======================== */
        <>
          <View style={styles.mobileHeader}>
            <View style={styles.brandRow}>
              <View style={styles.logoTile}>
                <Zap size={16} color={colors.primaryForeground} strokeWidth={2.2} />
              </View>
              <View>
                <Text style={styles.brandTitle}>PowerCast</Text>
                <Text style={styles.mobileSubtitle}>{currentPageMeta.shortLabel}</Text>
              </View>
            </View>

            <Pressable
              onPress={() => setMobileAccountOpen(true)}
              style={styles.mobileRoleChip}
              accessibilityRole="button"
              accessibilityLabel="Account and role settings"
            >
              <Shield size={13} color={colors.primary} strokeWidth={2} />
              <Text style={styles.mobileRoleChipText}>{activeRole}</Text>
            </Pressable>
          </View>

          {/* Horizontal Sub-Page Strip for Current Menu */}
          <View style={styles.mobileSubnavWrap}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.mobileSubnavScroll}
            >
              {siblingPages.map((pg) => {
                const selected = pg.id === activePage;
                const badge = badgeByPage[pg.id];
                return (
                  <Pressable
                    key={pg.id}
                    onPress={() => handleNavigatePage(pg.id)}
                    style={[styles.mobileSubPill, selected && styles.mobileSubPillActive]}
                  >
                    <Text
                      style={[
                        styles.mobileSubPillText,
                        selected && styles.mobileSubPillTextActive,
                      ]}
                    >
                      {pg.shortLabel}
                    </Text>
                    {badge && badge > 0 ? (
                      <View style={styles.navBadge}>
                        <Text style={styles.navBadgeText}>{badge}</Text>
                      </View>
                    ) : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.mobileScrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.mobilePageHeading}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <Text style={[styles.pageTitleMobile, { flex: 1 }]}>{currentPageMeta.title}</Text>
                <StatusPill label="Demo Data" tone="neutral" showDot={false} />
              </View>
              <Text style={styles.pageSubtitle}>{currentPageMeta.subtitle}</Text>
            </View>

            {renderPageContent()}
          </ScrollView>

          {/* Thumb-Zone Bottom Navigation Bar */}
          <View
            style={[
              styles.bottomTabBar,
              { paddingBottom: Math.max(10, insets.bottom) },
            ]}
          >
            {MENU_GROUPS.map((group) => {
              const active = activeMenu === group.id;
              return (
                <Pressable
                  key={group.id}
                  onPress={() => {
                    if (!active) handleNavigatePage(group.defaultPage);
                  }}
                  style={styles.bottomTabItem}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: active }}
                >
                  <View style={[styles.bottomTabIconPill, active && styles.bottomTabIconPillActive]}>
                    {renderMenuIcon(group.id, active)}
                  </View>
                  <Text style={[styles.bottomTabLabel, active && styles.bottomTabLabelActive]}>
                    {group.mobileLabel}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <DetailDrawerSheet
            visible={mobileAccountOpen}
            title={user.name}
            subtitle={user.email}
            onClose={() => setMobileAccountOpen(false)}
            footer={
              <SoftButton
                label="Sign Out"
                variant="danger"
                fullWidth
                icon={<LogOut size={15} color={colors.danger} />}
                onPress={() => {
                  setMobileAccountOpen(false);
                  onLogout();
                }}
              />
            }
          >
            <View style={styles.accountSheetSection}>
              <Text style={styles.accountLabel}>Active Permission Scope</Text>
              <Text style={styles.pageSubtitle}>
                Preview how role-based access controls govern imports, GRU retraining, and user
                mutations across all 10 pages:
              </Text>
              <View style={styles.roleSwitchRow}>
                {(['Admin', 'Analyst', 'Viewer'] as const).map((r) => (
                  <SoftButton
                    key={r}
                    label={r}
                    compact
                    variant={activeRole === r ? 'primary' : 'secondary'}
                    onPress={() => {
                      setActiveRole(r);
                      showToast(`Switched active permission preview to ${r}.`);
                    }}
                  />
                ))}
              </View>
            </View>
          </DetailDrawerSheet>
        </>
      ) : (
        /* ======================== DESKTOP SHELL ======================== */
        <View style={styles.desktopShell}>
          <View style={styles.sidebar}>
            <View style={styles.sidebarBrand}>
              <View style={styles.logoTile}>
                <Zap size={17} color={colors.primaryForeground} strokeWidth={2.2} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.brandTitle}>PowerCast</Text>
                <Text style={styles.brandCaption}>GRU Forecasting Admin</Text>
              </View>
            </View>

            <ScrollView
              style={{ flex: 1 }}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.sidebarNavScroll}
            >
              {MENU_GROUPS.map((group) => {
                const groupPages = SITEMAP_PAGES.filter((p) => p.menu === group.id);
                const groupActive = activeMenu === group.id;
                return (
                  <View key={group.id} style={styles.navGroupBlock}>
                    <Pressable
                      onPress={() => handleNavigatePage(group.defaultPage)}
                      style={styles.navGroupHeader}
                    >
                      {renderMenuIcon(group.id, groupActive)}
                      <Text
                        style={[
                          styles.navGroupTitle,
                          groupActive && { color: colors.foreground },
                        ]}
                      >
                        {group.label}
                      </Text>
                    </Pressable>

                    <View style={styles.subPageStack}>
                      {groupPages.map((pg) => {
                        const selected = pg.id === activePage;
                        const badge = badgeByPage[pg.id];
                        return (
                          <Pressable
                            key={pg.id}
                            onPress={() => handleNavigatePage(pg.id)}
                            style={(state) => [
                              styles.sidebarSubItem,
                              selected && styles.sidebarSubItemActive,
                              focusRing((state as { focused?: boolean }).focused),
                            ]}
                          >
                            <Text
                              style={[
                                styles.sidebarSubText,
                                selected && styles.sidebarSubTextActive,
                              ]}
                              numberOfLines={1}
                            >
                              {pg.shortLabel}
                            </Text>
                            {badge && badge > 0 ? (
                              <View style={styles.navBadge}>
                                <Text style={styles.navBadgeText}>{badge}</Text>
                              </View>
                            ) : null}
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                );
              })}
            </ScrollView>

            <View style={styles.sidebarFooter}>
              <View style={styles.userCardRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.userName} numberOfLines={1}>
                    {user.name}
                  </Text>
                  <Text style={styles.userEmail} numberOfLines={1}>
                    {user.email}
                  </Text>
                </View>
                <Pressable
                  onPress={onLogout}
                  style={styles.logoutIconBtn}
                  accessibilityRole="button"
                  accessibilityLabel="Sign out"
                >
                  <LogOut size={16} color={colors.readForeground} />
                </Pressable>
              </View>
              <SelectPill
                label="Role"
                value={activeRole}
                options={['Admin', 'Analyst', 'Viewer'] as const}
                onChange={(r) => {
                  setActiveRole(r);
                  showToast(`Active permission view set to ${r}.`);
                }}
              />
            </View>
          </View>

          <ScrollView
            style={styles.desktopMainScroll}
            contentContainerStyle={styles.desktopMainContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.desktopTopHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.pageTitleDesktop} accessibilityRole="header">
                  {currentPageMeta.title}
                </Text>
                <Text style={styles.pageSubtitle}>{currentPageMeta.subtitle}</Text>
              </View>

              <View style={styles.topHeaderRight}>
                <StatusPill label="Synthetic Demo Data" tone="neutral" showDot={false} />
                <StatusPill label="GRU v2.4.1 Ready" tone="success" />
                <Pressable
                  onPress={() => {
                    setLastRefreshed('Just now');
                    showToast('Telemetry synchronized with latest pipeline snapshot.');
                  }}
                  style={styles.refreshCapsule}
                  accessibilityRole="button"
                  accessibilityLabel="Refresh telemetry"
                >
                  <RefreshCw size={14} color={colors.primary} strokeWidth={2} />
                  <Text style={styles.refreshCapsuleText}>Synced: {lastRefreshed}</Text>
                </Pressable>
              </View>
            </View>

            {renderPageContent()}
          </ScrollView>
        </View>
      )}

      {/* Non-intrusive Action Feedback Toast */}
      {toastMsg ? (
        <View
          style={[
            styles.toastBanner,
            isMobile ? { bottom: Math.max(82, insets.bottom + 72) } : { bottom: 24 },
          ]}
          pointerEvents="none"
        >
          <CheckCircle2 size={16} color={colors.successDot} strokeWidth={2.2} />
          <Text style={styles.toastText}>{toastMsg}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  desktopShell: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 256,
    backgroundColor: colors.card,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 16,
  },
  sidebarBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingHorizontal: 6,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  logoTile: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.subtle,
  },
  brandTitle: {
    fontFamily: fonts.sansBold,
    fontWeight: '700',
    fontSize: 17,
    lineHeight: 21,
    color: colors.foreground,
    letterSpacing: -0.3,
  },
  brandCaption: {
    ...typography.caption,
    color: colors.mutedForeground,
  },
  sidebarNavScroll: {
    gap: 18,
    paddingVertical: 4,
  },
  navGroupBlock: {
    gap: 5,
  },
  navGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  navGroupTitle: {
    fontFamily: fonts.sansSemiBold,
    fontWeight: '600',
    fontSize: 13.5,
    color: colors.mutedForeground,
  },
  subPageStack: {
    paddingLeft: 14,
    gap: 3,
  },
  sidebarSubItem: {
    minHeight: 38,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  sidebarSubItemActive: {
    backgroundColor: colors.primarySoft,
  },
  sidebarSubText: {
    fontFamily: fonts.sansMedium,
    fontSize: 13.5,
    color: colors.readForeground,
    flex: 1,
  },
  sidebarSubTextActive: {
    fontFamily: fonts.sansSemiBold,
    fontWeight: '600',
    color: colors.primary,
  },
  navBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 999,
    backgroundColor: colors.dangerBg,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  navBadgeText: {
    fontFamily: fonts.monoMedium,
    fontSize: 10.5,
    color: colors.danger,
  },
  sidebarFooter: {
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 10,
  },
  userCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 4,
  },
  userName: {
    fontFamily: fonts.sansSemiBold,
    fontWeight: '600',
    fontSize: 13.5,
    color: colors.foreground,
  },
  userEmail: {
    ...typography.caption,
    color: colors.mutedForeground,
  },
  logoutIconBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.cardSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  desktopMainScroll: {
    flex: 1,
  },
  desktopMainContent: {
    maxWidth: 1320,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 32,
    paddingTop: 26,
    paddingBottom: 48,
    gap: 18,
  },
  desktopTopHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 16,
  },
  pageTitleDesktop: {
    ...typography.h1,
    color: colors.foreground,
  },
  pageSubtitle: {
    ...typography.bodySm,
    color: colors.readForeground,
    marginTop: 4,
  },
  topHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  refreshCapsule: {
    minHeight: 38,
    paddingHorizontal: 14,
    borderRadius: radius.full,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    ...shadow.subtle,
  },
  refreshCapsuleText: {
    fontFamily: fonts.sansMedium,
    fontSize: 12.5,
    color: colors.foreground,
  },

  /* Mobile Shell Styles */
  mobileHeader: {
    backgroundColor: colors.card,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  mobileSubtitle: {
    ...typography.caption,
    color: colors.mutedForeground,
  },
  mobileRoleChip: {
    minHeight: 38,
    paddingHorizontal: 13,
    borderRadius: radius.full,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  mobileRoleChipText: {
    fontFamily: fonts.sansSemiBold,
    fontWeight: '600',
    fontSize: 12.5,
    color: colors.primary,
  },
  mobileSubnavWrap: {
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 8,
  },
  mobileSubnavScroll: {
    paddingHorizontal: 14,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  mobileSubPill: {
    minHeight: 38,
    paddingHorizontal: 14,
    borderRadius: radius.full,
    backgroundColor: colors.cardSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  mobileSubPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  mobileSubPillText: {
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    color: colors.readForeground,
  },
  mobileSubPillTextActive: {
    fontFamily: fonts.sansSemiBold,
    fontWeight: '600',
    color: colors.primaryForeground,
  },
  mobileScrollContent: {
    paddingHorizontal: 14,
    paddingTop: 16,
    paddingBottom: 110,
    gap: 14,
  },
  mobilePageHeading: {
    paddingHorizontal: 2,
    marginBottom: 2,
  },
  pageTitleMobile: {
    ...typography.h2,
    fontSize: 22,
    lineHeight: 28,
    color: colors.foreground,
  },
  bottomTabBar: {
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    ...shadow.card,
  },
  bottomTabItem: {
    flex: 1,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  bottomTabIconPill: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  bottomTabIconPillActive: {
    backgroundColor: colors.primarySoft,
  },
  bottomTabLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 11.5,
    color: colors.mutedForeground,
  },
  bottomTabLabelActive: {
    fontFamily: fonts.sansSemiBold,
    fontWeight: '600',
    color: colors.primary,
  },
  accountSheetSection: {
    gap: 10,
  },
  accountLabel: {
    ...typography.label,
    color: colors.foreground,
  },
  roleSwitchRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  toastBanner: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: colors.foreground,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    maxWidth: '90%',
    ...shadow.floating,
  },
  toastText: {
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    color: colors.white,
  },
});

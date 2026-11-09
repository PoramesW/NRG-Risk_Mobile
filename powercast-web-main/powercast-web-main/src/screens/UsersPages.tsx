import React, { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import {
  AlertOctagon,
  Download,
  KeyRound,
  Shield,
  ShieldAlert,
  Trash2,
  UserCheck,
  UserX,
} from 'lucide-react-native';
import {
  AccountStatus,
  ActivityLogRecord,
  ActivityType,
  ManagedUserRecord,
  SharedFiltersState,
  SitemapPageId,
  User,
  UserRole,
} from '@/types';
import {
  ConfirmActionModal,
  DetailDrawerSheet,
  KeyValueGrid,
  PaginationFooter,
  SectionTitleBlock,
  SelectPill,
  SoftButton,
  SortHeaderButton,
  StatusPill,
  SurfaceCard,
  ToggleSwitch,
} from '@/components/AdminPrimitives';
import { SharedFilterBar } from '@/components/SharedFilterBar';
import { colors, fonts, radius, typography } from '@/utils/theme';

interface UsersPagesProps {
  pageId: Extract<SitemapPageId, '4.1' | '4.2'>;
  filters: SharedFiltersState;
  onUpdateFilters: (patch: Partial<SharedFiltersState>) => void;
  onResetFilters: () => void;
  currentUser: User;
  activeRole: UserRole;
  users: ManagedUserRecord[];
  activityLogs: ActivityLogRecord[];
  focusedUserId: string | null;
  onSetFocusedUserId: (id: string | null) => void;
  onActivateUser: (id: string) => void;
  onSuspendUser: (id: string, reason: string) => void;
  onChangeUserRole: (id: string, role: UserRole) => void;
  onResetUserPassword: (id: string) => void;
  onDeleteUser: (id: string, reason: string) => void;
  onNavigateUserDetailFromLog: (userId: string) => void;
  onNotify: (msg: string) => void;
}

export function UsersPages(props: UsersPagesProps) {
  if (props.pageId === '4.1') return <UserAccountsPage {...props} />;
  return <ActivityAuditPage {...props} />;
}

/* -------------------------------------------------------------------------- */
/* Page 4.1: User Accounts & Role Management                                  */
/* -------------------------------------------------------------------------- */
function UserAccountsPage({
  filters,
  onUpdateFilters,
  onResetFilters,
  currentUser,
  activeRole,
  users,
  focusedUserId,
  onSetFocusedUserId,
  onActivateUser,
  onSuspendUser,
  onChangeUserRole,
  onResetUserPassword,
  onDeleteUser,
  onNotify,
}: UsersPagesProps) {
  const { width } = useWindowDimensions();
  const isMobile = width < 880;

  const [roleFilter, setRoleFilter] = useState<'All Roles' | UserRole>('All Roles');
  const [createdWindow, setCreatedWindow] = useState<'All Created' | '2026' | '2025'>('All Created');
  const [loginWindow, setLoginWindow] = useState<'Any Login' | 'Last 24h' | 'Inactive / Never'>(
    'Any Login',
  );
  const [sortBy, setSortBy] = useState<'name' | 'created' | 'lastLogin'>('lastLogin');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const pageSize = 4;

  const [pendingModal, setPendingModal] = useState<
    | null
    | { type: 'suspend'; user: ManagedUserRecord }
    | { type: 'delete'; user: ManagedUserRecord }
    | { type: 'resetPw'; user: ManagedUserRecord }
  >(null);

  const selectedUser = useMemo(
    () => users.find((u) => u.id === focusedUserId) ?? null,
    [users, focusedUserId],
  );

  const isAdmin = activeRole === 'Admin';

  const handleSort = (col: 'name' | 'created' | 'lastLogin') => {
    if (sortBy === col) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(col);
      setSortDir('asc');
    }
  };

  const filteredUsers = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    const list = users.filter((u) => {
      if (
        q &&
        !u.name.toLowerCase().includes(q) &&
        !u.email.toLowerCase().includes(q) &&
        !u.id.toLowerCase().includes(q)
      ) {
        return false;
      }
      if (roleFilter !== 'All Roles' && u.role !== roleFilter) return false;
      if (filters.status !== 'All Status' && u.status !== (filters.status as AccountStatus)) {
        return false;
      }
      if (createdWindow === '2026' && !u.createdAt.startsWith('2026')) return false;
      if (createdWindow === '2025' && !u.createdAt.startsWith('2025')) return false;
      if (loginWindow === 'Last 24h' && !u.lastLogin.startsWith('2026-11-0')) return false;
      if (
        loginWindow === 'Inactive / Never' &&
        (u.lastLogin.startsWith('2026-11-0') || u.status === 'Active')
      ) {
        return false;
      }
      return true;
    });

    list.sort((a, b) => {
      const mul = sortDir === 'asc' ? 1 : -1;
      if (sortBy === 'name') return a.name.localeCompare(b.name) * mul;
      if (sortBy === 'created') return a.createdAt.localeCompare(b.createdAt) * mul;
      return a.lastLogin.localeCompare(b.lastLogin) * mul;
    });

    return list;
  }, [
    users,
    filters.search,
    filters.status,
    roleFilter,
    createdWindow,
    loginWindow,
    sortBy,
    sortDir,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pagedUsers = filteredUsers.slice((page - 1) * pageSize, page * pageSize);

  const isSelfAccount = (target: ManagedUserRecord) =>
    target.id === currentUser.id || target.email.toLowerCase() === currentUser.email.toLowerCase();

  return (
    <View style={styles.pageStack}>
      <SharedFilterBar
        filters={filters}
        onChange={(patch) => {
          onUpdateFilters(patch);
          setPage(1);
        }}
        onReset={() => {
          onResetFilters();
          setRoleFilter('All Roles');
          setCreatedWindow('All Created');
          setLoginWindow('Any Login');
          setPage(1);
        }}
        searchPlaceholder="Search by name, email, or User ID (e.g. USR-1002)..."
        statusOptions={['All Status', 'Active', 'Suspended', 'Pending']}
        extraInline={
          <View style={styles.inlineControls}>
            <SelectPill
              label="Role"
              value={roleFilter}
              options={['All Roles', 'Admin', 'Analyst', 'Viewer'] as const}
              onChange={(v) => {
                setRoleFilter(v);
                setPage(1);
              }}
            />
            <SelectPill
              label="Created"
              value={createdWindow}
              options={['All Created', '2026', '2025'] as const}
              onChange={(v) => {
                setCreatedWindow(v);
                setPage(1);
              }}
            />
            <SelectPill
              label="Last Login"
              value={loginWindow}
              options={['Any Login', 'Last 24h', 'Inactive / Never'] as const}
              onChange={(v) => {
                setLoginWindow(v);
                setPage(1);
              }}
            />
          </View>
        }
      />

      {!isAdmin && (
        <SurfaceCard>
          <View style={styles.inlineControls}>
            <ShieldAlert size={18} color={colors.warn} />
            <Text style={styles.rowMeta}>
              Viewing with <Text style={styles.rowTitle}>{activeRole}</Text> permissions. Account
              role changes, suspensions, password resets, and deletions require an Admin role.
            </Text>
          </View>
        </SurfaceCard>
      )}

      <SurfaceCard>
        <SectionTitleBlock
          title="Workspace Directory"
          subtitle="Tap any account to inspect permissions, audit history, and administrative controls"
          right={
            isMobile ? (
              <SelectPill
                label="Sort"
                value={sortBy === 'name' ? 'Name' : sortBy === 'created' ? 'Created' : 'Last Login'}
                options={['Last Login', 'Name', 'Created'] as const}
                onChange={(val) =>
                  handleSort(val === 'Name' ? 'name' : val === 'Created' ? 'created' : 'lastLogin')
                }
              />
            ) : undefined
          }
        />

        {!isMobile && (
          <View style={styles.tableHeaderBar}>
            <SortHeaderButton
              label="User"
              active={sortBy === 'name'}
              direction={sortDir}
              onPress={() => handleSort('name')}
              flex={2.2}
            />
            <Text style={[styles.thStatic, { flex: 1 }]}>Role</Text>
            <Text style={[styles.thStatic, { flex: 1 }]}>Status</Text>
            <SortHeaderButton
              label="Created"
              active={sortBy === 'created'}
              direction={sortDir}
              onPress={() => handleSort('created')}
              flex={1}
            />
            <SortHeaderButton
              label="Last Login"
              active={sortBy === 'lastLogin'}
              direction={sortDir}
              onPress={() => handleSort('lastLogin')}
              flex={1.3}
            />
          </View>
        )}

        <View style={styles.listStack}>
          {pagedUsers.map((u) => {
            const self = isSelfAccount(u);
            return isMobile ? (
              <Pressable
                key={u.id}
                onPress={() => onSetFocusedUserId(u.id)}
                style={styles.mobileCard}
              >
                <View style={styles.mobileCardTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowTitle}>
                      {u.name} {self ? '(You)' : ''}
                    </Text>
                    <Text style={styles.rowMeta}>
                      {u.email} · {u.id}
                    </Text>
                  </View>
                  <StatusPill label={u.status} />
                </View>
                <View style={styles.inlineControls}>
                  <StatusPill label={u.role} tone="info" showDot={false} />
                  <Text style={styles.rowMeta}>Created {u.createdAt}</Text>
                  <Text style={styles.rowMeta}>Last login: {u.lastLogin}</Text>
                </View>
              </Pressable>
            ) : (
              <Pressable
                key={u.id}
                onPress={() => onSetFocusedUserId(u.id)}
                style={styles.desktopRow}
              >
                <View style={{ flex: 2.2 }}>
                  <Text style={styles.rowTitle}>
                    {u.name} {self ? '(You)' : ''}
                  </Text>
                  <Text style={styles.rowMeta}>
                    {u.email} · <Text style={styles.monoSub}>{u.id}</Text>
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <StatusPill label={u.role} tone="info" showDot={false} />
                </View>
                <View style={{ flex: 1 }}>
                  <StatusPill label={u.status} />
                </View>
                <Text style={[styles.monoSub, { flex: 1 }]}>{u.createdAt}</Text>
                <Text style={[styles.monoSub, { flex: 1.3 }]}>{u.lastLogin}</Text>
              </Pressable>
            );
          })}
        </View>

        <PaginationFooter
          page={page}
          totalPages={totalPages}
          totalItems={filteredUsers.length}
          pageSize={pageSize}
          onPageChange={setPage}
        />
      </SurfaceCard>

      {/* User Account Detail & Actions Drawer (4.2 + 4.3) */}
      <DetailDrawerSheet
        visible={!!selectedUser}
        title={selectedUser ? selectedUser.name : ''}
        subtitle={selectedUser ? `${selectedUser.email} · ${selectedUser.id}` : ''}
        onClose={() => onSetFocusedUserId(null)}
        footer={
          <SoftButton
            label="Close"
            variant="secondary"
            onPress={() => onSetFocusedUserId(null)}
          />
        }
      >
        {selectedUser && (
          <>
            <View style={styles.inlineControls}>
              <StatusPill label={selectedUser.status} />
              <StatusPill label={`Role: ${selectedUser.role}`} tone="info" showDot={false} />
              <StatusPill
                label={selectedUser.mfaEnabled ? 'MFA Enrolled' : 'MFA Pending'}
                tone={selectedUser.mfaEnabled ? 'success' : 'warning'}
              />
            </View>

            <KeyValueGrid
              items={[
                { label: 'User ID', value: selectedUser.id, mono: true },
                { label: 'Department', value: selectedUser.department },
                { label: 'Created Date', value: selectedUser.createdAt, mono: true },
                { label: 'Last Sign-In', value: selectedUser.lastLogin, mono: true },
              ]}
            />

            <View style={styles.permissionWell}>
              <View style={styles.inlineControls}>
                <Shield size={15} color={colors.primary} />
                <Text style={styles.rowTitle}>Effective Role Scope ({selectedUser.role})</Text>
              </View>
              <Text style={styles.rowMeta}>
                {selectedUser.role === 'Admin'
                  ? 'Full access: Analytics, Dataset Import, GRU Retrain, System Controls, and User Governance.'
                  : selectedUser.role === 'Analyst'
                    ? 'Operational access: Analytics, Dataset Import, Quality Remediation, Job Reruns, and Log Acknowledgement.'
                    : 'Read-only access: View dashboards, inspect drawers, and export reports.'}
              </Text>
            </View>

            {selectedUser.suspensionReason ? (
              <View style={styles.dangerWell}>
                <Text style={styles.dangerHeading}>Suspension Note</Text>
                <Text style={styles.rowMeta}>{selectedUser.suspensionReason}</Text>
              </View>
            ) : null}

            {/* Role-Guarded Account Controls (4.3) */}
            {isAdmin && (
              <View style={styles.adminControlsSection}>
                <Text style={styles.sectionMiniHeading}>Administrative Controls</Text>
                <View style={styles.inlineControls}>
                  <SelectPill
                    label="Assign Role"
                    value={selectedUser.role}
                    options={['Admin', 'Analyst', 'Viewer'] as const}
                    onChange={(nextRole) => {
                      if (isSelfAccount(selectedUser) && nextRole !== 'Admin') {
                        onNotify('Guardrail: You cannot downgrade your own active Admin session.');
                        return;
                      }
                      onChangeUserRole(selectedUser.id, nextRole);
                      onNotify(`Updated ${selectedUser.name} role to ${nextRole}.`);
                    }}
                  />

                  <SoftButton
                    label="Reset Password"
                    compact
                    variant="secondary"
                    icon={<KeyRound size={14} color={colors.foreground} />}
                    onPress={() => setPendingModal({ type: 'resetPw', user: selectedUser })}
                  />

                  {selectedUser.status !== 'Active' ? (
                    <SoftButton
                      label="Activate Account"
                      compact
                      variant="primary"
                      icon={<UserCheck size={14} color={colors.primaryForeground} />}
                      onPress={() => {
                        onActivateUser(selectedUser.id);
                        onNotify(`Activated ${selectedUser.name}.`);
                      }}
                    />
                  ) : (
                    <SoftButton
                      label={isSelfAccount(selectedUser) ? 'Cannot Suspend Self' : 'Suspend'}
                      compact
                      variant="secondary"
                      disabled={isSelfAccount(selectedUser)}
                      icon={<UserX size={14} color={colors.warn} />}
                      onPress={() => setPendingModal({ type: 'suspend', user: selectedUser })}
                    />
                  )}
                </View>

                {/* Deliberately isolated destructive zone */}
                <View style={styles.isolatedDangerZone}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.dangerHeading}>Permanent Account Removal</Text>
                    <Text style={styles.rowMeta}>
                      {isSelfAccount(selectedUser)
                        ? 'Self-deletion is blocked on your active Admin session.'
                        : 'Revokes all tokens and archives audit attribution.'}
                    </Text>
                  </View>
                  <SoftButton
                    label="Delete Account"
                    compact
                    variant="danger"
                    disabled={isSelfAccount(selectedUser)}
                    icon={<Trash2 size={14} color={colors.danger} />}
                    onPress={() => setPendingModal({ type: 'delete', user: selectedUser })}
                  />
                </View>
              </View>
            )}

            {/* Account Edit History */}
            <View style={{ gap: 8 }}>
              <Text style={styles.sectionMiniHeading}>Account Edit History</Text>
              {selectedUser.editHistory.map((h, idx) => (
                <View key={idx} style={styles.historyItem}>
                  <Text style={styles.monoSub}>
                    {h.date} · by {h.actor}
                  </Text>
                  <Text style={styles.rowTitle}>{h.change}</Text>
                </View>
              ))}
            </View>
          </>
        )}
      </DetailDrawerSheet>

      {/* Guarded Reason / Confirmation Modals */}
      <ConfirmActionModal
        visible={!!pendingModal}
        title={
          pendingModal?.type === 'suspend'
            ? `Suspend ${pendingModal.user.name}?`
            : pendingModal?.type === 'delete'
              ? `Delete ${pendingModal.user.name}?`
              : pendingModal
                ? `Send Password Reset to ${pendingModal.user.name}?`
                : ''
        }
        description={
          pendingModal?.type === 'suspend'
            ? 'Active sessions will be revoked immediately and recorded in the workspace audit log.'
            : pendingModal?.type === 'delete'
              ? 'This permanently removes the user account from PowerCast. Audit records remain preserved.'
              : 'A time-limited password reset link will be dispatched and active tokens rotated.'
        }
        confirmLabel={
          pendingModal?.type === 'suspend'
            ? 'Suspend Account'
            : pendingModal?.type === 'delete'
              ? 'Delete Permanently'
              : 'Dispatch Reset Link'
        }
        danger={pendingModal?.type === 'suspend' || pendingModal?.type === 'delete'}
        requireReason={pendingModal?.type === 'suspend' || pendingModal?.type === 'delete'}
        onCancel={() => setPendingModal(null)}
        onConfirm={(reason) => {
          if (!pendingModal) return;
          if (pendingModal.type === 'suspend') {
            onSuspendUser(pendingModal.user.id, reason);
            onNotify(`Suspended ${pendingModal.user.name} (audit logged).`);
          } else if (pendingModal.type === 'delete') {
            onDeleteUser(pendingModal.user.id, reason);
            onSetFocusedUserId(null);
            onNotify(`Deleted ${pendingModal.user.name} (audit logged).`);
          } else {
            onResetUserPassword(pendingModal.user.id);
            onNotify(`Sent password reset link to ${pendingModal.user.email}.`);
          }
          setPendingModal(null);
        }}
      />
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* Page 4.2: Activity & Audit Log                                             */
/* -------------------------------------------------------------------------- */
function ActivityAuditPage({
  filters,
  onUpdateFilters,
  onResetFilters,
  users,
  activityLogs,
  onNavigateUserDetailFromLog,
  onNotify,
}: UsersPagesProps) {
  const [activityFilter, setActivityFilter] = useState<'All Activities' | ActivityType>(
    'All Activities',
  );
  const [resultFilter, setResultFilter] = useState<'All Results' | 'Success' | 'Failed'>(
    'All Results',
  );
  const [ipFilter, setIpFilter] = useState('All IPs');
  const [flaggedOnly, setFlaggedOnly] = useState(false);

  const uniqueIps = useMemo(
    () => ['All IPs', ...Array.from(new Set(activityLogs.map((a) => a.ip)))],
    [activityLogs],
  );

  const filteredLogs = useMemo(() => {
    return activityLogs.filter((a) => {
      if (filters.operator !== 'All Operators' && a.userName !== filters.operator) return false;
      if (activityFilter !== 'All Activities' && a.activity !== activityFilter) return false;
      if (resultFilter !== 'All Results' && a.result !== resultFilter) return false;
      if (ipFilter !== 'All IPs' && a.ip !== ipFilter) return false;
      if (flaggedOnly && !a.suspicious) return false;
      return true;
    });
  }, [activityLogs, filters.operator, activityFilter, resultFilter, ipFilter, flaggedOnly]);

  const suspiciousCount = activityLogs.filter((a) => a.suspicious).length;

  return (
    <View style={styles.pageStack}>
      <SharedFilterBar
        filters={filters}
        onChange={onUpdateFilters}
        onReset={() => {
          onResetFilters();
          setActivityFilter('All Activities');
          setResultFilter('All Results');
          setIpFilter('All IPs');
          setFlaggedOnly(false);
        }}
        showDateRange
        operatorOptions={['All Operators', ...users.map((u) => u.name)]}
        extraInline={
          <View style={styles.inlineControls}>
            <SelectPill
              label="Activity"
              value={activityFilter}
              options={[
                'All Activities',
                'Login',
                'Logout',
                'Failed Login',
                'Role Change',
                'Data Import',
                'Forecast Trigger',
                'Account Action',
              ] as const}
              onChange={setActivityFilter}
            />
            <SelectPill
              label="Result"
              value={resultFilter}
              options={['All Results', 'Success', 'Failed'] as const}
              onChange={setResultFilter}
            />
            <SelectPill
              label="IP"
              value={ipFilter}
              options={uniqueIps}
              onChange={setIpFilter}
            />
          </View>
        }
      />

      <SurfaceCard>
        <SectionTitleBlock
          title="Security & Operational Activity Trail"
          subtitle={`${filteredLogs.length} recorded events · ${suspiciousCount} flagged security anomalies`}
          right={
            <View style={styles.inlineControls}>
              <ToggleSwitch
                label={`Flagged only (${suspiciousCount})`}
                checked={flaggedOnly}
                onChange={setFlaggedOnly}
              />
              <SoftButton
                label="Export Audit CSV"
                compact
                variant="secondary"
                icon={<Download size={14} color={colors.foreground} />}
                onPress={() => onNotify(`Exported ${filteredLogs.length} audit log records.`)}
              />
            </View>
          }
        />

        <View style={styles.listStack}>
          {filteredLogs.map((act) => (
            <View
              key={act.id}
              style={[styles.activityRow, act.suspicious && styles.activityRowSuspicious]}
            >
              <View style={{ flex: 1, gap: 4 }}>
                <View style={styles.inlineControls}>
                  {act.suspicious && <AlertOctagon size={15} color={colors.danger} />}
                  <Pressable onPress={() => onNavigateUserDetailFromLog(act.userId)}>
                    <Text style={styles.userLinkText}>{act.userName}</Text>
                  </Pressable>
                  <StatusPill label={act.activity} tone="info" showDot={false} />
                  <StatusPill label={act.result} />
                  {act.suspicious && <StatusPill label="Repeated Failure Alert" tone="danger" />}
                </View>
                <Text style={styles.rowMeta}>{act.detail}</Text>
                <Text style={styles.monoSub}>
                  {act.timestamp} · IP {act.ip} · {act.device}
                </Text>
              </View>

              <SoftButton
                label="Inspect User"
                compact
                variant="secondary"
                onPress={() => onNavigateUserDetailFromLog(act.userId)}
              />
            </View>
          ))}
        </View>
      </SurfaceCard>
    </View>
  );
}

const styles = StyleSheet.create({
  pageStack: {
    gap: 16,
  },
  inlineControls: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  tableHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 10,
  },
  thStatic: {
    fontFamily: fonts.sansSemiBold,
    fontWeight: '600',
    fontSize: 12.5,
    color: colors.mutedForeground,
    paddingVertical: 10,
  },
  listStack: {
    gap: 2,
  },
  desktopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 10,
  },
  mobileCard: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 8,
  },
  mobileCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  rowTitle: {
    fontFamily: fonts.sansSemiBold,
    fontWeight: '600',
    fontSize: 14,
    color: colors.foreground,
  },
  rowMeta: {
    ...typography.caption,
    color: colors.readForeground,
  },
  monoSub: {
    ...typography.mono,
    color: colors.mutedForeground,
  },
  permissionWell: {
    backgroundColor: colors.cardSubtle,
    borderRadius: 14,
    padding: 14,
    gap: 5,
  },
  dangerWell: {
    backgroundColor: colors.dangerBg,
    borderRadius: 14,
    padding: 14,
    gap: 4,
  },
  dangerHeading: {
    fontFamily: fonts.sansSemiBold,
    fontWeight: '600',
    fontSize: 13.5,
    color: colors.danger,
  },
  adminControlsSection: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 12,
  },
  sectionMiniHeading: {
    ...typography.label,
    color: colors.foreground,
  },
  isolatedDangerZone: {
    marginTop: 14,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
    backgroundColor: colors.dangerBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
  },
  historyItem: {
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 2,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
    paddingVertical: 13,
    paddingHorizontal: 12,
    borderRadius: radius.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  activityRowSuspicious: {
    backgroundColor: colors.dangerBg,
    borderColor: colors.dangerBorder,
    borderWidth: 1,
    marginVertical: 3,
  },
  userLinkText: {
    fontFamily: fonts.sansSemiBold,
    fontWeight: '600',
    fontSize: 14,
    color: colors.primary,
    textDecorationLine: 'underline',
  },
});


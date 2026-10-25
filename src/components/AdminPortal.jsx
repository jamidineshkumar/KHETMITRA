import React, { useState } from 'react';
import {
  Users,
  Settings,
  ShieldCheck,
  UserCheck,
  UserX,
  Search,
  Plus,
  RefreshCw,
  Cpu,
  Database,
  Radio,
  AlertTriangle,
  Check,
  Download,
  Trash2,
  Send,
  Sliders,
  Power,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { hasSupabaseConfig } from '../supabase';
import { checkSupabaseHealth } from '../services/supabaseService';

const INITIAL_USERS = [
  {
    id: 'usr_101',
    name: 'Ramesh Patel',
    email: 'ramesh.farmer@khetmitra.com',
    farmName: 'Shree Krishna Agro Plots',
    deviceId: 'ESP32_CENTRAL_01',
    status: 'Active',
    role: 'Customer',
    joined: '2026-09-12',
    acreage: '8.2 Acres',
  },
  {
    id: 'usr_102',
    name: 'Suresh Verma',
    email: 'suresh.crops@khetmitra.com',
    farmName: 'Verma Mustard & Wheat Farm',
    deviceId: 'ESP32_NODE_02',
    status: 'Active',
    role: 'Customer',
    joined: '2026-10-04',
    acreage: '5.5 Acres',
  },
  {
    id: 'usr_103',
    name: 'Pooja Sharma',
    email: 'pooja.orchards@khetmitra.com',
    farmName: 'Green Valley Organic Orchards',
    deviceId: 'ESP32_NODE_03',
    status: 'Active',
    role: 'Customer',
    joined: '2026-10-14',
    acreage: '12.0 Acres',
  },
  {
    id: 'usr_104',
    name: 'Vikram Singh',
    email: 'vikram.boundary@khetmitra.com',
    farmName: 'Riverbed Pulse Fields',
    deviceId: 'ESP32_NODE_04',
    status: 'Pending',
    role: 'Customer',
    joined: '2026-10-21',
    acreage: '4.0 Acres',
  },
  {
    id: 'usr_001',
    name: 'System Admin',
    email: 'admin@khetmitra.com',
    farmName: 'Central Gateway Fleet',
    deviceId: 'MASTER_GATEWAY_HUB',
    status: 'Active',
    role: 'Admin',
    joined: '2026-08-01',
    acreage: 'Global Fleet',
  },
];

export default function AdminPortal({
  userEmail,
  isLiveHardware,
  onResetSimulatedData,
  onSendDemoAlert,
}) {
  const [adminTab, setAdminTab] = useState('users'); // 'users' or 'settings'
  const [usersList, setUsersList] = useState(INITIAL_USERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', farmName: '', acreage: '' });

  // App settings state
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastActive, setBroadcastActive] = useState('');
  const [otaFirmwareVersion, setOtaFirmwareVersion] = useState('v1.2.0-khetmitra');
  const [otaPushing, setOtaPushing] = useState(false);
  const [otaSuccess, setOtaSuccess] = useState(false);
  const [dbTesting, setDbTesting] = useState(false);
  const [dbResult, setDbResult] = useState(null);
  const [adminToast, setAdminToast] = useState('');

  function showToast(msg) {
    setAdminToast(msg);
    setTimeout(() => setAdminToast(''), 3000);
  }

  const filteredUsers = usersList.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.farmName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.deviceId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function toggleUserStatus(id) {
    setUsersList((prev) =>
      prev.map((u) => {
        if (u.id === id && u.role !== 'Admin') {
          const nextStatus = u.status === 'Active' ? 'Suspended' : 'Active';
          showToast(`User ${u.name} set to ${nextStatus}`);
          return { ...u, status: nextStatus };
        }
        return u;
      })
    );
  }

  function handleAddUser(e) {
    e.preventDefault();
    if (!newUser.name || !newUser.email) return;

    const created = {
      id: `usr_${Date.now().toString().slice(-4)}`,
      name: newUser.name,
      email: newUser.email,
      farmName: newUser.farmName || 'New Agricultural Plot',
      deviceId: `ESP32_NODE_${Math.floor(Math.random() * 80 + 10)}`,
      status: 'Active',
      role: 'Customer',
      joined: new Date().toISOString().slice(0, 10),
      acreage: newUser.acreage || '5.0 Acres',
    };

    setUsersList((prev) => [created, ...prev]);
    setShowAddUserModal(false);
    setNewUser({ name: '', email: '', farmName: '', acreage: '' });
    showToast(`New customer farmer ${created.name} registered successfully!`);
  }

  function handlePushOTA() {
    setOtaPushing(true);
    setOtaSuccess(false);
    setTimeout(() => {
      setOtaPushing(false);
      setOtaSuccess(true);
      showToast('Firmware OTA update broadcasted to all active ESP32 field gateways.');
      setTimeout(() => setOtaSuccess(false), 4000);
    }, 1200);
  }

  function handleSendBroadcast(e) {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;
    setBroadcastActive(broadcastMessage);
    showToast('Emergency announcement broadcasted to all farmer dashboards.');
    setBroadcastMessage('');
  }

  async function handleTestDb() {
    setDbTesting(true);
    setDbResult(null);
    const res = await checkSupabaseHealth();
    setDbTesting(false);
    setDbResult(res);
  }

  return (
    <div className="admin-console-container page-section">
      <div className="page-heading">
        <div>
          <span className="eyebrow">Administrative Control Console</span>
          <h1>System Administration & User Management</h1>
          <p>
            Manage registered customer accounts, configure global app parameters, deploy firmware,
            and monitor cloud infrastructure.
          </p>
        </div>
        <div className="page-heading-actions">
          <div className="button-group">
            <button
              type="button"
              className={`btn btn-sm ${adminTab === 'users' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setAdminTab('users')}
            >
              <Users size={16} /> User Management ({usersList.length})
            </button>
            <button
              type="button"
              className={`btn btn-sm ${adminTab === 'settings' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setAdminTab('settings')}
            >
              <Settings size={16} /> App & System Settings
            </button>
          </div>
        </div>
      </div>

      {adminToast && (
        <div className="form-message success" role="status">
          <Check size={16} />
          <span>{adminToast}</span>
        </div>
      )}

      {/* Broadcast Banner (if active) */}
      {broadcastActive && (
        <div className="admin-active-broadcast" role="alert">
          <div className="aab-icon">
            <AlertTriangle size={18} />
          </div>
          <div className="aab-text">
            <strong>Active Global Broadcast to Farmers:</strong>
            <span>{broadcastActive}</span>
          </div>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => {
              setBroadcastActive('');
              showToast('Broadcast dismissed.');
            }}
          >
            Clear Broadcast
          </button>
        </div>
      )}

      {/* TAB 1: USER MANAGEMENT */}
      {adminTab === 'users' && (
        <div className="admin-users-view">
          {/* User Metrics Summary */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon green">
                <Users size={20} />
              </div>
              <div className="stat-label">Total Registered Users</div>
              <div className="stat-value">{usersList.length} Accounts</div>
              <div className="stat-caption">Farmers & Field Administrators</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon blue">
                <UserCheck size={20} />
              </div>
              <div className="stat-label">Active Farmers</div>
              <div className="stat-value">
                {usersList.filter((u) => u.status === 'Active' && u.role === 'Customer').length} Active
              </div>
              <div className="stat-caption">Monitoring real field perimeters</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon amber">
                <Radio size={20} />
              </div>
              <div className="stat-label">Assigned Gateways</div>
              <div className="stat-value">{usersList.length - 1} Nodes</div>
              <div className="stat-caption">ESP32 field nodes deployed</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon purple">
                <ShieldCheck size={20} />
              </div>
              <div className="stat-label">System Role</div>
              <div className="stat-value">Admin Access</div>
              <div className="stat-caption">{userEmail || 'admin@khetmitra.com'}</div>
            </div>
          </div>

          {/* User Directory Table Panel */}
          <section className="panel mt-4">
            <div className="panel-heading">
              <div>
                <h3>Customer & Farmer Directory</h3>
                <p>Manage customer access, linked hardware device IDs, and account standing</p>
              </div>
              <div className="panel-heading-actions">
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => setShowAddUserModal(true)}
                >
                  <Plus size={16} /> Add New Farmer
                </button>
              </div>
            </div>

            {/* Filter Search */}
            <div className="filter-search-box mb-3">
              <Search size={16} className="filter-search-icon" />
              <input
                type="text"
                placeholder="Search users by farmer name, email, farm name, or node ID…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="filter-search-input"
              />
            </div>

            <div className="admin-table-wrapper">
              <table className="pinout-table admin-users-table">
                <thead>
                  <tr>
                    <th>Farmer Name</th>
                    <th>Email Address</th>
                    <th>Farm Name & Acreage</th>
                    <th>Hardware Gateway ID</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <strong>{u.name}</strong>
                      </td>
                      <td>
                        <code>{u.email}</code>
                      </td>
                      <td>
                        <div>{u.farmName}</div>
                        <span className="tel-sub">{u.acreage}</span>
                      </td>
                      <td>
                        <span className="side-pill">
                          <Radio size={12} /> {u.deviceId}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`portal-role-pill ${
                            u.role === 'Admin' ? 'role-admin' : 'role-customer'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge-ok ${
                            u.status === 'Active' ? '' : 'status-suspended'
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td>{u.joined}</td>
                      <td>
                        {u.role !== 'Admin' && (
                          <button
                            type="button"
                            className={`btn btn-sm ${
                              u.status === 'Active' ? 'btn-outline' : 'btn-primary'
                            }`}
                            onClick={() => toggleUserStatus(u.id)}
                            title="Toggle user active or suspended status"
                          >
                            {u.status === 'Active' ? 'Suspend' : 'Activate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {/* TAB 2: APP & SYSTEM SETTINGS */}
      {adminTab === 'settings' && (
        <div className="admin-settings-view">
          <div className="settings-grid">
            {/* Maintenance Mode & Announcements */}
            <section className="panel settings-panel">
              <div className="panel-heading">
                <div>
                  <h3>Platform Operations & Maintenance</h3>
                  <p>Global app controls affecting all customer farmers</p>
                </div>
                <Power size={20} className="text-leaf" />
              </div>

              <div className="notify-toggles-list">
                <div className="notify-toggle-item">
                  <div>
                    <strong>System Maintenance Mode</strong>
                    <p>Pauses simulated telemetry generation for scheduled upgrades</p>
                  </div>
                  <label className="switch-label">
                    <input
                      type="checkbox"
                      checked={maintenanceMode}
                      onChange={(e) => {
                        setMaintenanceMode(e.target.checked);
                        showToast(
                          e.target.checked ? 'Maintenance Mode Enabled' : 'Maintenance Mode Disabled'
                        );
                      }}
                    />
                    <span className="switch-ui" />
                  </label>
                </div>
              </div>

              <hr className="divider-hr" />

              <h4>Customer Alert Demo</h4>
              <p className="tel-sub mb-2">
                Send a clearly labelled test alert to signed-in customer dashboards. This does not represent a real sensor event and does not activate hardware.
              </p>
              <button
                type="button"
                className="btn btn-outline full-btn mb-3"
                onClick={onSendDemoAlert}
              >
                <AlertTriangle size={15} /> Send Demo Alert to Customers
              </button>

              <hr className="divider-hr" />

              <h4>Broadcast Announcement to Farmers</h4>
              <p className="tel-sub mb-2">
                Sends a high-priority alert banner to all farmer dashboards.
              </p>
              <form onSubmit={handleSendBroadcast}>
                <label className="settings-field">
                  Announcement Text
                  <input
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    placeholder="e.g. Weather Advisory: High wind speeds expected tonight."
                  />
                </label>
                <button
                  type="submit"
                  className="btn btn-primary full-btn mt-2"
                  disabled={!broadcastMessage.trim()}
                >
                  <Send size={15} /> Publish Announcement
                </button>
              </form>
            </section>

            {/* Firmware OTA Deployment */}
            <section className="panel settings-panel">
              <div className="panel-heading">
                <div>
                  <h3>ESP32 Firmware OTA Management</h3>
                  <p>Over-The-Air firmware binary deployment for field gateways</p>
                </div>
                <Cpu size={20} className="text-leaf" />
              </div>

              <div className="health-list">
                <div className="health-row">
                  <div className="health-label">Production Release</div>
                  <strong className="health-value">v1.2.0-khetmitra</strong>
                </div>
                <div className="health-row">
                  <div className="health-label">Target Binary</div>
                  <strong className="health-value">{otaFirmwareVersion}</strong>
                </div>
                <div className="health-row">
                  <div className="health-label">Architecture</div>
                  <span className="health-value">ESP-IDF v4.4 + FreeRTOS 32-bit</span>
                </div>
              </div>

              {otaSuccess && (
                <div className="form-message success mt-3" role="status">
                  <Check size={16} />
                  <span>OTA payload verified and acknowledged by 4 field gateways.</span>
                </div>
              )}

              <div className="mt-3">
                <button
                  type="button"
                  className="btn btn-primary full-btn"
                  onClick={handlePushOTA}
                  disabled={otaPushing}
                >
                  <RefreshCw size={16} className={otaPushing ? 'spin-icon' : ''} />
                  {otaPushing ? 'Broadcasting OTA Binary…' : 'Deploy Firmware OTA to Gateways'}
                </button>
              </div>
            </section>

            {/* Backend Database Diagnostics */}
            <section className="panel settings-panel">
              <div className="panel-heading">
                <div>
                  <h3>Backend & Supabase Diagnostics</h3>
                  <p>PostgreSQL schema status and cloud endpoint health</p>
                </div>
                <Database size={20} className="text-leaf" />
              </div>

              <div className="health-list">
                <div className="health-row">
                  <div className="health-label">Supabase URL Config</div>
                  <span className="health-value">
                    {hasSupabaseConfig ? 'Active in .env.local' : 'Local Fallback'}
                  </span>
                </div>
                <div className="health-row">
                  <div className="health-label">Realtime Channel</div>
                  <span className="health-value">public:field_alerts</span>
                </div>
              </div>

              <div className="mt-3">
                <button
                  type="button"
                  className="btn btn-outline full-btn"
                  onClick={handleTestDb}
                  disabled={dbTesting}
                >
                  <RefreshCw size={16} className={dbTesting ? 'spin-icon' : ''} />
                  {dbTesting ? 'Checking Supabase…' : 'Test Supabase Connection'}
                </button>

                {dbResult && (
                  <div
                    className={`form-message mt-3 ${dbResult.ok ? 'success' : 'error'}`}
                    role="status"
                  >
                    {dbResult.ok ? <Check size={16} /> : <Info size={16} />}
                    <span>{dbResult.message}</span>
                  </div>
                )}
              </div>
            </section>

            {/* System Factory Reset */}
            <section className="panel settings-panel">
              <div className="panel-heading">
                <div>
                  <h3>System Purge & Factory Reset</h3>
                  <p>Clear temporary simulation data across all nodes</p>
                </div>
                <RotateCcw size={20} className="text-danger" />
              </div>

              <p className="tel-sub">
                Restores factory baseline users, cleared incident logs, and default sensor states.
              </p>

              <button
                type="button"
                className="btn btn-outline full-btn text-danger mt-3"
                onClick={onResetSimulatedData}
              >
                <RotateCcw size={16} /> Reset All Simulated Data to Default
              </button>
            </section>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="modal-backdrop" onClick={() => setShowAddUserModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3>Register New Farmer</h3>
              <button
                type="button"
                className="icon-button"
                onClick={() => setShowAddUserModal(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAddUser} className="modal-body">
              <label className="settings-field">
                Farmer Full Name
                <input
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="e.g. Balram Yadav"
                  required
                />
              </label>

              <label className="settings-field">
                Email Address
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="e.g. balram.farm@khetmitra.com"
                  required
                />
              </label>

              <label className="settings-field">
                Farm / Estate Name
                <input
                  value={newUser.farmName}
                  onChange={(e) => setNewUser({ ...newUser, farmName: e.target.value })}
                  placeholder="e.g. Yadav Agro Fields"
                />
              </label>

              <label className="settings-field">
                Field Acreage
                <input
                  value={newUser.acreage}
                  onChange={(e) => setNewUser({ ...newUser, acreage: e.target.value })}
                  placeholder="e.g. 6.5 Acres"
                />
              </label>

              <div className="modal-actions">
                <button type="submit" className="btn btn-primary">
                  Create Account
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowAddUserModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

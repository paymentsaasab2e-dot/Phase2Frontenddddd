'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Upload,
  RefreshCcw,
  MoreVertical,
  Search,
  Filter,
  Grid2X2,
  List,
  ChevronDown,
  Building2,
  AlertCircle,
  CheckSquare,
} from 'lucide-react';
import { ClientSummaryMetrics } from '../../components/ClientSummaryMetrics';
import { ClientTable } from '../../components/ClientTable';
import { ClientFilterDrawer } from '../../components/drawers/ClientFilterDrawer';
import { ClientBulkActionsBar } from '../../components/ClientBulkActionsBar';
import { ClientDetailsDrawer } from '../../components/drawers/ClientDetailsDrawer';
import { ClientImportDrawer } from '../../components/drawers/ClientImportDrawer';
import { CreateTaskModal } from '../../components/CreateTaskModal';
import { CountPill, EmptyStateCard, PageHeader, cx } from '../../components/recruitment-ui';
import { INITIAL_CLIENTS } from './types';
import type { Client } from './types';
import { apiGetClients, apiDeleteClient, type BackendClient } from '../../lib/api';

// Tab Component
const StatusTabs = ({ activeTab, onTabChange, clients }: { activeTab: string, onTabChange: (tab: string) => void, clients: Client[] }) => {
  const counts = {
    all: clients.length,
    active: clients.filter(c => c.stage === 'Active').length,
    'on-hold': clients.filter(c => c.stage === 'On Hold').length,
    inactive: clients.filter(c => c.stage === 'Inactive').length,
    hot: clients.filter(c => c.priority === 'High').length,
  };

  const tabs = [
    { id: 'all', label: 'All', count: counts.all },
    { id: 'active', label: 'Active Clients', count: counts.active },
    { id: 'on-hold', label: 'On Hold', count: counts['on-hold'] },
    { id: 'inactive', label: 'Inactive', count: counts.inactive },
    { id: 'hot', label: 'Hot Clients 🔥', count: counts.hot },
  ];

  return (
    <div className="recruitment-surface p-2">
      <div className="recruitment-tabs-bar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cx(
              'recruitment-tab whitespace-nowrap',
              activeTab === tab.id && 'recruitment-tab-active'
            )}
          >
            <span className="flex items-center gap-2">
              {tab.label}
              <span
                className={cx(
                  'recruitment-tab-count',
                  activeTab === tab.id && 'recruitment-tab-count-active'
                )}
              >
                {tab.count}
              </span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

// Empty State Component
const EmptyState = ({ onImportClick }: { onImportClick?: () => void }) => (
  <EmptyStateCard
    icon={<Building2 className="h-10 w-10" />}
    title="No clients added yet"
    description="Start building your agency pipeline by adding your first client or importing them from a CSV file."
    actions={
      <>
        <button className="recruitment-primary-button">
          <Plus className="h-4 w-4" /> Create Client
        </button>
        <button
          onClick={onImportClick}
          className="recruitment-secondary-button"
        >
          <Upload className="h-4 w-4" /> Import Clients
        </button>
      </>
    }
  />
);

// Helper function to map backend client to frontend format
function mapBackendClientToFrontend(backendClient: BackendClient): Client {
  // Client UI supports only Active / On Hold / Inactive / Hot Clients.
  const statusMap: Record<string, Client['stage']> = {
    'ACTIVE': 'Active',
    'PROSPECT': 'Active',
    'ON_HOLD': 'On Hold',
    'INACTIVE': 'Inactive',
  };
  // Note: 'Hot Clients 🔥' is a frontend-only stage that maps to 'ACTIVE' status in backend

  return {
    id: backendClient.id, // Use string ID directly to avoid collisions
    name: backendClient.companyName,
    industry: backendClient.industry || 'Not specified',
    location: backendClient.location || 'Not specified',
    openJobs: backendClient._count?.jobs || 0,
    activeCandidates: 0, // Would need to calculate from jobs/candidates
    placements: backendClient._count?.placements || 0,
    stage: statusMap[backendClient.status] || 'Active',
    owner: backendClient.assignedTo ? {
      name: backendClient.assignedTo.name,
      avatar: backendClient.assignedTo.avatar || '',
    } : { name: 'Unassigned', avatar: '' },
    lastActivity: backendClient.updatedAt ? new Date(backendClient.updatedAt).toLocaleDateString() : 'Never',
    logo: backendClient.logo || '',
    revenue: backendClient.revenueGenerated || undefined,
    companySize: backendClient.companySize || undefined,
    hiringLocations: backendClient.hiringLocations || undefined,
    website: backendClient.website || undefined,
    linkedin: backendClient.linkedin || undefined,
    timezone: backendClient.timezone || undefined,
    clientSince: backendClient.clientSince ? new Date(backendClient.clientSince).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : undefined,
    priority: backendClient.priority as Client['priority'] || undefined,
    sla: backendClient.sla || undefined,
    nextFollowUpDue: backendClient.nextFollowUpDue ? new Date(backendClient.nextFollowUpDue).toLocaleDateString() : undefined,
    avgTimeToFill: backendClient.avgTimeToFill || undefined,
    healthStatus: backendClient.healthStatus as Client['healthStatus'] || undefined,
    billingTotalRevenue: backendClient.billingTotalRevenue || undefined,
    billingOutstanding: backendClient.billingOutstanding || undefined,
    billingPaid: backendClient.billingPaid || undefined,
  };
}

function extractBackendClients(responseData: unknown): BackendClient[] {
  if (Array.isArray(responseData)) return responseData as BackendClient[];
  if (responseData && typeof responseData === 'object') {
    const payload = responseData as { data?: unknown; items?: unknown };
    if (Array.isArray(payload.data)) return payload.data as BackendClient[];
    if (Array.isArray(payload.items)) return payload.items as BackendClient[];
  }
  return [];
}

export default function App() {
  const [activeTab, setActiveTab] = useState('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showAddClientDrawer, setShowAddClientDrawer] = useState(false);
  const [isEmpty, setIsEmpty] = useState(false);
  const [showImportDrawer, setShowImportDrawer] = useState(false);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Check authentication status on client side only
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    setIsAuthenticated(!!token);
  }, []);

  // Fetch clients from API
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
        setIsAuthenticated(!!token);

        if (!token) {
          console.warn('No authentication token found. Using mock data. Please log in to access real data.');
          setClients(INITIAL_CLIENTS);
          setLoading(false);
          return;
        }

        // Map activeTab to status filter
        const statusMap: Record<string, string | undefined> = {
          'all': undefined,
          'active': 'ACTIVE',
          'on-hold': 'ON_HOLD',
          'inactive': 'INACTIVE',
        };

        const response = await apiGetClients({
          status: statusMap[activeTab],
          search: searchQuery || undefined,
        });

        // Backend returns: { success: true, message: "...", data: { data: [...], pagination: {...} } }
        const backendClients = response.data ? extractBackendClients(response.data) : [];

        if (!Array.isArray(backendClients)) {
          console.error('Unexpected API response format: data is not an array.', response);
          setError('Unexpected API response format.');
          setClients(INITIAL_CLIENTS);
          return;
        }

        const mappedClients = backendClients.map(mapBackendClientToFrontend);
        
        // Deduplicate clients by ID to prevent duplicate key errors
        // Use Map to keep the last occurrence of each ID
        const clientMap = new Map<string, Client>();
        mappedClients.forEach(client => {
          // Ensure ID is always a string
          const id = String(client.id);
          clientMap.set(id, { ...client, id });
        });
        
        const uniqueClients = Array.from(clientMap.values());
        
        // Log if duplicates were found (for debugging)
        if (mappedClients.length !== uniqueClients.length) {
          console.warn(`Found ${mappedClients.length - uniqueClients.length} duplicate client(s), removed duplicates.`);
        }
        
        setClients(uniqueClients);
        setIsEmpty(uniqueClients.length === 0);
      } catch (err: any) {
        console.error('Failed to fetch clients:', err);

        if (err.message?.includes('Authentication required') ||
            err.message?.includes('No token') ||
            err.message?.includes('401')) {
          console.warn('Authentication required. Using mock data. Please log in to access real data.');
          setClients(INITIAL_CLIENTS);
          setError(null);
        } else {
          setError(err.message || 'Failed to load clients');
          setClients(INITIAL_CLIENTS);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, [activeTab, searchQuery]);

  const handleRefresh = async () => {
    try {
      setLoading(true);
      const statusMap: Record<string, string | undefined> = {
        'all': undefined,
        'active': 'ACTIVE',
        'on-hold': 'ON_HOLD',
        'inactive': 'INACTIVE',
      };

      const response = await apiGetClients({
        status: statusMap[activeTab],
        search: searchQuery || undefined,
      });

      const backendClients = response.data ? extractBackendClients(response.data) : [];

      const mappedClients = backendClients.map(mapBackendClientToFrontend);
      // Deduplicate clients by ID to prevent duplicate key errors
      // Use Map to keep the last occurrence of each ID
      const clientMap = new Map<string, Client>();
      mappedClients.forEach(client => {
        const id = String(client.id);
        clientMap.set(id, { ...client, id });
      });
      const uniqueClients = Array.from(clientMap.values());
      setClients(uniqueClients);
      setIsEmpty(uniqueClients.length === 0);
    } catch (err: any) {
      console.error('Failed to refresh clients:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClient = async (id: string) => {
    const client = clients.find(c => c.id === id);
    const name = client?.name || 'this client';
    if (!window.confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
      return;
    }

    try {
      await apiDeleteClient(id);
      // Optimistically update list
      setClients(prev => prev.filter(c => c.id !== id));
      setSelectedClients(prev => prev.filter(cid => cid !== id));
      await handleRefresh();
    } catch (err: any) {
      console.error('Failed to delete client:', err);
      alert(err?.message || 'Failed to delete client');
    }
  };

  return (
    <div className="recruitment-page">
      <div className="recruitment-page-shell max-w-7xl">
        <PageHeader
          title="Clients"
          description="Manage active accounts, track hiring momentum, and keep account operations consistent across your recruitment funnel."
          meta={<CountPill>{clients.length} records</CountPill>}
          actions={
            <>
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="recruitment-icon-button"
                title="Refresh clients"
              >
                <RefreshCcw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => setShowImportDrawer(true)}
                className="recruitment-secondary-button"
              >
                <Upload className="h-4 w-4" /> Import Clients
              </button>
              <button
                onClick={() => setCreateTaskOpen(true)}
                className="recruitment-secondary-button"
              >
                <CheckSquare className="h-4 w-4" /> Create Task
              </button>
              <button
                onClick={() => {
                  setSelectedClient(null);
                  setShowAddClientDrawer(true);
                }}
                className="recruitment-primary-button"
              >
                <Plus className="h-5 w-5" /> Add Client
              </button>
              <button className="recruitment-icon-button" title="More actions">
                <MoreVertical className="h-5 w-5" />
              </button>
            </>
          }
        />

        <div className="recruitment-toolbar">
          <div className="recruitment-search-shell flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by client name, industry, location or owner..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="recruitment-search-input"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsFilterOpen(true)}
              className="recruitment-secondary-button"
            >
              <Filter className="h-5 w-5" /> Filters
            </button>
            <div className="recruitment-segmented">
              <button className="recruitment-segmented-button recruitment-segmented-button-active">
                <List className="h-5 w-5" />
              </button>
              <button className="recruitment-segmented-button">
                <Grid2X2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <StatusTabs activeTab={activeTab} onTabChange={setActiveTab} clients={clients} />

        <ClientSummaryMetrics />

        {loading ? (
          <div className="recruitment-surface px-6 py-12 text-center text-sm font-medium text-slate-500">
            Loading clients...
          </div>
        ) : error && !loading ? (
          <div className="recruitment-surface border-red-200 bg-red-50 px-6 py-12 text-center text-sm font-medium text-red-600">
            Error: {error}
          </div>
        ) : isEmpty ? (
          <EmptyState onImportClick={() => setShowImportDrawer(true)} />
        ) : (
          <>
            <div className="recruitment-toolbar py-3">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                <span>
                  Showing{' '}
                  <strong>
                    {clients.length}{' '}
                    {activeTab === 'all' ? 'Clients' : activeTab === 'active' ? 'Active Clients' : 'Clients'}
                  </strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Sort by</span>
                <button className="recruitment-chip text-sm text-slate-700 hover:text-blue-600">
                  Last Activity <ChevronDown className="h-4 w-4" />
                </button>
              </div>
            </div>

            <ClientTable
              clients={clients}
              selectedIds={selectedClients}
              onSelectionChange={setSelectedClients}
              onSelectClient={setSelectedClient}
              onDeleteClient={handleDeleteClient}
            />
          </>
        )}
      </div>

      <ClientDetailsDrawer
        client={selectedClient}
        isAddMode={showAddClientDrawer}
        onClose={() => {
          setSelectedClient(null);
          setShowAddClientDrawer(false);
        }}
        onDelete={(id) => { setSelectedClient(null); handleDeleteClient(id); }}
        onClientCreated={() => {
          setShowAddClientDrawer(false);
          handleRefresh();
        }}
        onJobCreated={() => {
          handleRefresh();
        }}
      />
      <ClientFilterDrawer isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} />
      <ClientImportDrawer
        isOpen={showImportDrawer}
        onClose={() => setShowImportDrawer(false)}
        onImportComplete={() => { /* TODO: refresh client list */ }}
      />
      <CreateTaskModal
        isOpen={createTaskOpen}
        onClose={() => setCreateTaskOpen(false)}
        onSuccess={() => setCreateTaskOpen(false)}
        initialRelatedTo="Client"
      />
      <ClientBulkActionsBar 
        selectedCount={selectedClients.length} 
        onClear={() => setSelectedClients([])} 
      />
    </div>
  );
}

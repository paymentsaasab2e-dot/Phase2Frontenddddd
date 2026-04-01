import React from 'react';
import { MoreHorizontal, Eye, Briefcase, Mail, ChevronDown, ArrowUpDown, Check, Trash2 } from 'lucide-react';
import { ImageWithFallback } from './ImageWithFallback';
import type { Client, ClientStage } from '@/app/client/types';

const stageColors: Record<ClientStage, string> = {
  Active: 'bg-emerald-100 text-emerald-700',
  'On Hold': 'bg-amber-100 text-amber-700',
  Inactive: 'bg-slate-100 text-slate-700',
  'Hot Clients 🔥': 'bg-red-100 text-red-700',
};

interface ClientTableProps {
  clients: Client[];
  selectedIds: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  onSelectClient?: (client: Client) => void;
  onDeleteClient?: (id: string) => void;
}

// Custom Checkbox Component for better design tool compatibility
const CustomCheckbox = ({ checked, onChange }: { checked: boolean, onChange: () => void }) => (
  <div 
    onClick={onChange}
    className={`w-4 h-4 rounded border flex items-center justify-center cursor-pointer transition-colors ${
      checked ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300'
    }`}
  >
    {checked && <Check className="w-3 h-3 text-white" strokeWidth={4} />}
  </div>
);

export function ClientTable({ clients, selectedIds, onSelectionChange, onSelectClient, onDeleteClient }: ClientTableProps) {
  const toggleSelectAll = () => {
    if (selectedIds.length === clients.length) {
      onSelectionChange([]);
    } else {
      const allIds = clients.map(c => c.id);
      onSelectionChange(allIds);
    }
  };

  const toggleSelect = (id: string) => {
    const newSelection = selectedIds.includes(id)
      ? selectedIds.filter(selectedId => selectedId !== id)
      : [...selectedIds, id];
    onSelectionChange(newSelection);
  };

  const handleRowClick = (client: Client) => (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('[role="checkbox"]') || target.closest('input')) return;
    onSelectClient?.(client);
  };

  return (
    <div className="recruitment-table-shell">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="recruitment-table-head-row">
              <th className="recruitment-table-head-cell w-10">
                <CustomCheckbox 
                  checked={selectedIds.length === clients.length && clients.length > 0}
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="recruitment-table-head-cell">
                <div className="flex items-center gap-1 cursor-pointer hover:text-slate-700">
                  Client Name <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="recruitment-table-head-cell">Industry</th>
              <th className="recruitment-table-head-cell">Location</th>
              <th className="recruitment-table-head-cell text-center">Open Jobs</th>
              <th className="recruitment-table-head-cell text-center">Candidates</th>
              <th className="recruitment-table-head-cell text-center">Placements</th>
              <th className="recruitment-table-head-cell">Stage</th>
              <th className="recruitment-table-head-cell">Recruiter</th>
              <th className="recruitment-table-head-cell">Last Activity</th>
              <th className="recruitment-table-head-cell text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {clients.map((client, index) => (
              <tr
                key={`${client.id}-${index}`}
                onClick={handleRowClick(client)}
                className={`group cursor-pointer transition-colors hover:bg-blue-50/50 ${selectedIds.includes(client.id) ? 'bg-blue-50/80' : ''}`}
              >
                <td className="px-4 py-4 align-middle" onClick={(e) => e.stopPropagation()}>
                  <CustomCheckbox
                    checked={selectedIds.includes(client.id)}
                    onChange={() => toggleSelect(client.id)}
                  />
                </td>
                <td className="px-4 py-4 align-middle">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 flex-shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-white">
                      <ImageWithFallback src={client.logo} alt={client.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{client.name}</div>
                      <div className="text-xs text-slate-500">ID: {client.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm font-medium text-slate-600">{client.industry}</td>
                <td className="px-4 py-4 text-sm font-medium text-slate-600">{client.location}</td>
                <td className="px-4 py-4 text-center align-middle">
                  <span className="inline-flex min-w-[2rem] items-center justify-center rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700">
                    {client.openJobs}
                  </span>
                </td>
                <td className="px-4 py-4 text-center align-middle">
                  <span className="inline-flex min-w-[2rem] items-center justify-center rounded-full bg-blue-100 px-2 py-1 text-xs font-bold text-blue-700">
                    {client.activeCandidates}
                  </span>
                </td>
                <td className="px-4 py-4 text-center align-middle">
                  <span className="inline-flex min-w-[2rem] items-center justify-center rounded-full bg-indigo-100 px-2 py-1 text-xs font-bold text-indigo-700">
                    {client.placements}
                  </span>
                </td>
                <td className="px-4 py-4 align-middle">
                  <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] ${stageColors[client.stage] ?? 'bg-slate-100 text-slate-600'}`}>
                    {client.stage}
                  </span>
                </td>
                <td className="px-4 py-4 align-middle">
                  <div className="flex items-center gap-2">
                    <ImageWithFallback src={client.owner.avatar} alt={client.owner.name} className="h-7 w-7 rounded-full border border-slate-200" />
                    <span className="text-sm font-medium text-slate-700">{client.owner.name}</span>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-slate-500">{client.lastActivity}</td>
                <td className="px-4 py-4 text-right align-middle" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1 opacity-100">
                    <button
                      type="button"
                      onClick={() => onSelectClient?.(client)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 shadow-sm transition-all hover:text-blue-600"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 shadow-sm transition-all hover:text-emerald-600"
                      title="Create Job"
                    >
                      <Briefcase className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 shadow-sm transition-all hover:text-indigo-600"
                      title="Email Client"
                    >
                      <Mail className="w-4 h-4" />
                    </button>
                    {onDeleteClient && (
                      <button
                        type="button"
                        onClick={() => onDeleteClient(client.id)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 shadow-sm transition-all hover:text-red-600"
                        title="Delete Client"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 shadow-sm transition-all hover:text-slate-600"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
        <div>Showing 5 of 124 clients</div>
        <div className="flex items-center gap-2">
          <button className="rounded-lg border border-slate-200 px-3 py-1.5 hover:bg-slate-50 disabled:opacity-50" disabled>Previous</button>
          <div className="flex items-center gap-1">
            <button className="h-8 w-8 rounded-lg bg-blue-600 text-white font-medium">1</button>
            <button className="h-8 w-8 rounded-lg hover:bg-slate-50 transition-colors">2</button>
            <button className="h-8 w-8 rounded-lg hover:bg-slate-50 transition-colors">3</button>
          </div>
          <button className="rounded-lg border border-slate-200 px-3 py-1.5 hover:bg-slate-50">Next</button>
        </div>
      </div>
    </div>
  );
}

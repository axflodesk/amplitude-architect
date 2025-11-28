import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { AmplitudeEvent } from '../types';

interface DashboardProps {
  events: AmplitudeEvent[];
}

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

export const Dashboard: React.FC<DashboardProps> = ({ events }) => {
  const stats = useMemo(() => {
    // Count by View
    const viewCounts = events.reduce((acc, curr) => {
      acc[curr.view] = (acc[curr.view] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const viewData = Object.entries(viewCounts).map(([name, count]) => ({ name, count }));

    // Count by Action Type (simple heuristic from eventName or Click)
    const typeCounts = events.reduce((acc, curr) => {
        // Try to guess type from event name format view:click:etc
        let type = 'other';
        if (curr.eventName.includes(':click:')) type = 'click';
        else if (curr.eventName.includes(':view')) type = 'view';
        else if (curr.eventName.includes(':submit')) type = 'submit';
        else if (curr.eventName.includes(':change')) type = 'change';
        else if (curr.click) type = 'interaction'; // Fallback if click column has value

        acc[type] = (acc[type] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const typeData = Object.entries(typeCounts).map(([name, count]) => ({ name, count }));

    return { viewData, typeData };
  }, [events]);

  if (events.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <h4 className="text-sm font-semibold text-slate-700 mb-4">Events per View</h4>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.viewData} layout="vertical" margin={{ left: 20 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" width={100} tick={{fontSize: 10}} />
              <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {stats.viewData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <h4 className="text-sm font-semibold text-slate-700 mb-4">Events by Type</h4>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.typeData}>
               <XAxis dataKey="name" tick={{fontSize: 12}} stroke="#94a3b8" />
               <YAxis hide />
               <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
               <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

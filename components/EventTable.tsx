import React, { useState } from 'react';
import { AmplitudeEvent } from '../types';
import { Download, Table as TableIcon, Copy, Check } from 'lucide-react';
import { Button } from './Button';

interface EventTableProps {
  events: AmplitudeEvent[];
}

export const EventTable: React.FC<EventTableProps> = ({ events }) => {
  const [copied, setCopied] = useState(false);

  const generateCSV = () => {
    const headers = ["Action", "View", "Click", "Event Name", "Event Properties"];
    const rows = events.map(e => [
      `"${e.action.replace(/"/g, '""')}"`,
      `"${e.view.replace(/"/g, '""')}"`,
      `"${e.click.replace(/"/g, '""')}"`,
      `"${e.eventName.replace(/"/g, '""')}"`,
      `"${e.eventProperties.replace(/"/g, '""')}"`
    ]);

    return [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');
  };

  const downloadCSV = () => {
    if (events.length === 0) return;
    const csvContent = generateCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'amplitude_events.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = async () => {
    if (events.length === 0) return;
    const csvContent = generateCSV();
    try {
      await navigator.clipboard.writeText(csvContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-secondary rounded-xl border border-dashed border-primary/20 text-primary/40">
        <TableIcon className="w-12 h-12 mb-3 opacity-50" />
        <p>No events generated yet. Upload an image or describe a feature to get started.</p>
      </div>
    );
  }

  return (
    <div className="bg-secondary rounded-xl flex flex-col h-full overflow-hidden">
      <div className="p-4 flex justify-between items-center bg-secondary">
        <h3 className="font-semibold text-primary flex items-center gap-2">
          <TableIcon className="w-5 h-5 text-primary" />
          Generated Events ({events.length})
        </h3>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={copyToClipboard}>
            {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
            {copied ? "Copied" : "Copy CSV"}
          </Button>
          <Button size="sm" variant="secondary" onClick={downloadCSV}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>
      <div className="overflow-auto flex-1">
        <table className="w-full text-left text-sm">
          <thead className="bg-page text-primary sticky top-0 z-10">
            <tr>
              <th className="px-6 py-3 font-semibold border-b border-primary/10">Action</th>
              <th className="px-6 py-3 font-semibold border-b border-primary/10">View</th>
              <th className="px-6 py-3 font-semibold border-b border-primary/10">Click</th>
              <th className="px-6 py-3 font-semibold border-b border-primary/10">Event Name</th>
              <th className="px-6 py-3 font-semibold border-b border-primary/10 w-1/3">Event Properties</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-primary/5">
            {events.map((event, idx) => (
              <tr key={event.id || idx} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-primary font-medium">{event.action}</td>
                <td className="px-6 py-4 text-primary/80 font-mono text-xs">{event.view}</td>
                <td className="px-6 py-4 text-primary/80 font-mono text-xs">{event.click}</td>
                <td className="px-6 py-4 text-primary font-mono text-xs font-bold">{event.eventName}</td>
                <td className="px-6 py-4 text-primary/80 whitespace-pre-wrap">{event.eventProperties}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
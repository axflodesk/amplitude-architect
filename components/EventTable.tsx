import React, { useState } from 'react';
import { AmplitudeEvent } from '../types';
import { IconDownload, IconTable, IconCopy, IconCheck } from './icons';
import { Button } from './Button';

interface EventTableProps {
  events: AmplitudeEvent[];
  isLoading?: boolean;
}

export const EventTable: React.FC<EventTableProps> = ({ events, isLoading = false }) => {
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

  if (events.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-secondary border border-dashed border-primary/20 text-primary/40">
        <IconTable width={48} height={48} className="mb-3 opacity-50" />
        <p>No events generated yet. Upload an image or describe a feature to get started</p>
      </div>
    );
  }

  return (
    <div className="bg-secondary flex flex-col h-full overflow-hidden">
      <div className="p-4 flex justify-between items-center bg-secondary">
        <h3 className="font-semibold text-primary flex items-center gap-2">
          <IconTable width={20} height={20} className="text-primary" />
          Generated events ({events.length})
        </h3>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={copyToClipboard}>
            {copied ? <IconCheck width={16} height={16} style={{ marginRight: '8px' }} /> : <IconCopy width={16} height={16} style={{ marginRight: '8px' }} />}
            {copied ? "Copied!" : "Copy CSV"}
          </Button>
          <Button size="sm" variant="secondary" onClick={downloadCSV}>
            <IconDownload width={16} height={16} style={{ marginRight: '8px' }} />
            Export CSV
          </Button>
        </div>
      </div>
      <div className="overflow-auto flex-1">
        <table className="w-full text-left text-sm">
          <thead className="bg-page text-primary sticky top-0 z-10">
            <tr>
              <th className="px-6 py-3 font-semibold border-b border-primary/10 w-1/4">Action</th>
              <th className="px-6 py-3 font-semibold border-b border-primary/10">View</th>
              <th className="px-6 py-3 font-semibold border-b border-primary/10">Click</th>
              <th className="px-6 py-3 font-semibold border-b border-primary/10">Event Name</th>
              <th className="px-6 py-3 font-semibold border-b border-primary/10 w-1/3">Event Properties</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-primary/5">
            {isLoading ? (
              // Skeleton loader rows
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={`skeleton-${idx}`} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="h-4 bg-gray-200 w-24 animate-pulse"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-gray-200 w-20 animate-pulse"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-gray-200 w-24 animate-pulse"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-gray-200 w-32 animate-pulse"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 w-full animate-pulse"></div>
                      <div className="h-3 bg-gray-200 w-5/6 animate-pulse"></div>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              // Actual event rows
              events.map((event, idx) => (
                <tr key={event.id || idx} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-primary font-medium whitespace-normal">{event.action}</td>
                  <td className="px-6 py-4 text-primary/80 font-mono text-xs">{event.view}</td>
                  <td className="px-6 py-4 text-primary/80 font-mono text-xs">{event.click}</td>
                  <td className="px-6 py-4 text-primary font-mono text-xs font-bold">{event.eventName}</td>
                  <td className="px-6 py-4 text-primary/80 whitespace-pre-wrap">{event.eventProperties}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
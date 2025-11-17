'use client';

import { useState } from 'react';
import {
  Trash2,
  Archive,
  Download,
  Edit3,
  X,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface BulkActionsMenuProps {
  selectedCount: number;
  onDelete: () => Promise<void>;
  onUpdateStage: (stage: string) => Promise<void>;
  onArchive: () => Promise<void>;
  onExport: () => void;
  onClear: () => void;
}

const STAGES = [
  { value: 'applied', label: 'Applied' },
  { value: 'screening', label: 'Screening' },
  { value: 'interviewing', label: 'Interviewing' },
  { value: 'offer', label: 'Offer' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
];

export function BulkActionsMenu({
  selectedCount,
  onDelete,
  onUpdateStage,
  onArchive,
  onExport,
  onClear,
}: BulkActionsMenuProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDelete = async () => {
    setIsProcessing(true);
    try {
      await onDelete();
      toast.success(`Deleted ${selectedCount} application${selectedCount !== 1 ? 's' : ''}`);
      setShowDeleteConfirm(false);
    } catch (error) {
      toast.error('Failed to delete applications');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateStage = async (stage: string) => {
    setIsProcessing(true);
    try {
      await onUpdateStage(stage);
      toast.success(
        `Updated ${selectedCount} application${selectedCount !== 1 ? 's' : ''} to ${
          STAGES.find((s) => s.value === stage)?.label
        }`
      );
    } catch (error) {
      toast.error('Failed to update applications');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleArchive = async () => {
    setIsProcessing(true);
    try {
      await onArchive();
      toast.success(`Archived ${selectedCount} application${selectedCount !== 1 ? 's' : ''}`);
    } catch (error) {
      toast.error('Failed to archive applications');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExport = () => {
    onExport();
    toast.success('Exporting applications...');
  };

  if (selectedCount === 0) return null;

  return (
    <>
      {/* Floating Action Bar */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 animate-slide-up">
        <div className="bg-white rounded-xl border border-gray-200 shadow-lg px-6 py-4 flex items-center gap-4">
          {/* Selected Count */}
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold text-blue-600">
                {selectedCount}
              </span>
            </div>
            <span className="text-sm font-medium text-gray-700">
              selected
            </span>
          </div>

          {/* Divider */}
          <div className="h-8 w-px bg-gray-200"></div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Update Stage */}
            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleUpdateStage(e.target.value);
                  e.target.value = '';
                }
              }}
              disabled={isProcessing}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Update Stage</option>
              {STAGES.map((stage) => (
                <option key={stage.value} value={stage.value}>
                  {stage.label}
                </option>
              ))}
            </select>

            {/* Export */}
            <button
              onClick={handleExport}
              disabled={isProcessing}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Export to CSV"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>

            {/* Archive */}
            <button
              onClick={handleArchive}
              disabled={isProcessing}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Archive selected"
            >
              <Archive className="h-4 w-4" />
              <span>Archive</span>
            </button>

            {/* Delete */}
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isProcessing}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Delete selected"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete</span>
            </button>
          </div>

          {/* Divider */}
          <div className="h-8 w-px bg-gray-200"></div>

          {/* Clear Selection */}
          <button
            onClick={onClear}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Clear selection"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 animate-scale-in">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Delete Applications
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  Are you sure you want to delete {selectedCount} application
                  {selectedCount !== 1 ? 's' : ''}? This action cannot be undone.
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isProcessing}
                    className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isProcessing}
                    className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {isProcessing ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

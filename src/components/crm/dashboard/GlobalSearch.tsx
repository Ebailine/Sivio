'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import { Search, Briefcase, Users, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchResult {
  id: string;
  type: 'application' | 'contact';
  title: string;
  subtitle: string;
  url: string;
}

interface GlobalSearchProps {
  applications: Array<{
    id: string;
    company: string;
    position: string;
    location?: string;
  }>;
  contacts: Array<{
    id: string;
    name: string;
    position: string;
    company?: string;
  }>;
}

export function GlobalSearch({ applications, contacts }: GlobalSearchProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const router = useRouter();

  // Toggle command palette with Cmd+K / Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleSelect = useCallback((url: string) => {
    setOpen(false);
    setSearch('');
    router.push(url);
  }, [router]);

  // Filter results based on search
  const applicationResults: SearchResult[] = applications
    .filter((app) => {
      const searchLower = search.toLowerCase();
      return (
        app.company.toLowerCase().includes(searchLower) ||
        app.position.toLowerCase().includes(searchLower) ||
        app.location?.toLowerCase().includes(searchLower)
      );
    })
    .slice(0, 5)
    .map((app) => ({
      id: app.id,
      type: 'application',
      title: `${app.company} - ${app.position}`,
      subtitle: app.location || '',
      url: `/crm/applications/${app.id}`,
    }));

  const contactResults: SearchResult[] = contacts
    .filter((contact) => {
      const searchLower = search.toLowerCase();
      return (
        contact.name.toLowerCase().includes(searchLower) ||
        contact.position.toLowerCase().includes(searchLower) ||
        contact.company?.toLowerCase().includes(searchLower)
      );
    })
    .slice(0, 5)
    .map((contact) => ({
      id: contact.id,
      type: 'contact',
      title: contact.name,
      subtitle: `${contact.position}${contact.company ? ` at ${contact.company}` : ''}`,
      url: `/crm/contacts?id=${contact.id}`,
    }));

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
      >
        <Search className="h-4 w-4" />
        <span>Search...</span>
        <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-gray-500 bg-gray-100 border border-gray-200 rounded">
          <span>⌘</span>K
        </kbd>
      </button>

      {/* Command Palette Modal */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />

            {/* Command Palette */}
            <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                transition={{ duration: 0.2 }}
                className="w-full max-w-2xl"
              >
                <Command
                  className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden"
                  shouldFilter={false}
                >
                  <div className="flex items-center border-b border-gray-200 px-4">
                    <Search className="h-5 w-5 text-gray-400 mr-2" />
                    <Command.Input
                      value={search}
                      onValueChange={setSearch}
                      placeholder="Search applications and contacts..."
                      className="flex-1 py-4 text-sm bg-transparent border-0 outline-none placeholder:text-gray-400"
                    />
                    <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-500 bg-gray-100 border border-gray-200 rounded">
                      ESC
                    </kbd>
                  </div>

                  <Command.List className="max-h-[400px] overflow-y-auto p-2">
                    {search === '' && (
                      <div className="px-4 py-8 text-center text-sm text-gray-500">
                        Type to search applications and contacts...
                      </div>
                    )}

                    {search !== '' && applicationResults.length === 0 && contactResults.length === 0 && (
                      <div className="px-4 py-8 text-center text-sm text-gray-500">
                        No results found for "{search}"
                      </div>
                    )}

                    {applicationResults.length > 0 && (
                      <Command.Group heading="Applications" className="px-2 py-2">
                        {applicationResults.map((result) => (
                          <Command.Item
                            key={result.id}
                            onSelect={() => handleSelect(result.url)}
                            className="flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer hover:bg-blue-50 data-[selected=true]:bg-blue-50 transition-colors"
                          >
                            <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                              <Briefcase className="h-4 w-4 text-purple-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm text-gray-900 truncate">
                                {result.title}
                              </div>
                              {result.subtitle && (
                                <div className="text-xs text-gray-500 truncate">
                                  {result.subtitle}
                                </div>
                              )}
                            </div>
                          </Command.Item>
                        ))}
                      </Command.Group>
                    )}

                    {contactResults.length > 0 && (
                      <Command.Group heading="Contacts" className="px-2 py-2">
                        {contactResults.map((result) => (
                          <Command.Item
                            key={result.id}
                            onSelect={() => handleSelect(result.url)}
                            className="flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer hover:bg-blue-50 data-[selected=true]:bg-blue-50 transition-colors"
                          >
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Users className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm text-gray-900 truncate">
                                {result.title}
                              </div>
                              {result.subtitle && (
                                <div className="text-xs text-gray-500 truncate">
                                  {result.subtitle}
                                </div>
                              )}
                            </div>
                          </Command.Item>
                        ))}
                      </Command.Group>
                    )}
                  </Command.List>
                </Command>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

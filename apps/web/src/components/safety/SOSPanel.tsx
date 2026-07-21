'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Share2, Plus, Loader2 } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { useContacts, useAddContact, useTriggerSOS } from '@/hooks/useSafety';

export function SOSPanel() {
  const [sosActive, setSosActive] = useState(false);
  const [shareLocation, setShareLocation] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');

  const { data: contacts = [], isLoading: loadingContacts } = useContacts();
  const addContactMutation = useAddContact();
  const triggerSOSMutation = useTriggerSOS();

  const activateSOS = () => {
    setSosActive(true);
    // Use fallback coordinates if geolocation fails or just fallback directly for MVP
    triggerSOSMutation.mutate({ lat: 19.0760, lng: 72.8777 });
  };

  const cancelSOS = () => {
    setSosActive(false);
  };

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    addContactMutation.mutate({ name: newContactName, phone: newContactPhone }, {
      onSuccess: () => {
        setNewContactName('');
        setNewContactPhone('');
        setShowAddForm(false);
      }
    });
  };

  return (
    <div className="relative">
      <AnimatePresence>
        {sosActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 rounded-2xl bg-red-500/8 border border-red-500/30 z-10 flex flex-col items-center justify-center p-6 gap-4"
          >
            <motion.div
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-bio-coral text-xl font-mono font-bold tracking-widest"
            >
              SOS ACTIVATED
            </motion.div>
            <p className="text-text-muted text-sm text-center">
              {triggerSOSMutation.isPending ? 'Help is being notified…' : `Notified ${triggerSOSMutation.data?.contacts_notified ?? 0} contacts`}
            </p>
            <div className="space-y-2 w-full">
              {contacts.map((c) => (
                <div key={c.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5">
                  <span className="text-sm text-text-primary">{c.name}</span>
                  <div className="flex items-center gap-2 text-xs text-bio-coral">
                    {triggerSOSMutation.isPending ? (
                      <><Loader2 className="w-3 h-3 animate-spin" /> Notifying…</>
                    ) : (
                      <span className="text-green-400">Notified</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={cancelSOS}
              className="mt-2 px-4 py-2 rounded-lg border border-white/20 text-text-muted text-sm hover:border-white/40 transition-all"
            >
              Close
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <GlassCard className={`p-5 space-y-4 ${sosActive ? 'opacity-20 pointer-events-none' : ''}`}>
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-bio-coral uppercase tracking-wide">Emergency SOS</h3>
        </div>

        <div className="flex items-start gap-4">
          {/* SOS Button with pulse rings */}
          <div className="relative flex-shrink-0">
            <motion.div
              className="absolute inset-0 rounded-full bg-bio-coral/30"
              animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.div
              className="absolute inset-0 rounded-full bg-bio-coral/20"
              animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            />
            <motion.button
              onClick={activateSOS}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative w-20 h-20 rounded-full bg-bio-coral text-void font-mono font-bold text-base hover:shadow-glow-coral transition-all z-10"
            >
              SOS
            </motion.button>
          </div>

          {/* Contacts */}
          <div className="flex-1 space-y-2">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-text-muted uppercase">Contacts</span>
              <button onClick={() => setShowAddForm(!showAddForm)} className="text-bio-teal hover:text-bio-teal/80">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            {loadingContacts ? (
              <Loader2 className="w-4 h-4 animate-spin text-text-muted" />
            ) : contacts.length === 0 ? (
              <p className="text-xs text-text-muted">No contacts added.</p>
            ) : (
              contacts.map((c) => (
                <div key={c.id} className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-body text-text-primary">{c.name}</div>
                    <div className="text-xs text-text-muted font-mono">{c.phone}</div>
                  </div>
                  <Phone className="w-4 h-4 text-text-muted" />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Add Contact Form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.form 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              onSubmit={handleAddContact} 
              className="space-y-2 pt-2 border-t border-white/10 overflow-hidden"
            >
              <input 
                type="text" 
                required 
                placeholder="Name" 
                value={newContactName}
                onChange={e => setNewContactName(e.target.value)}
                className="w-full text-sm bg-black/20 border border-white/10 rounded p-2 text-white" 
              />
              <input 
                type="tel" 
                required 
                placeholder="Phone (e.g. +1234567890)" 
                value={newContactPhone}
                onChange={e => setNewContactPhone(e.target.value)}
                className="w-full text-sm bg-black/20 border border-white/10 rounded p-2 text-white" 
              />
              <button 
                type="submit" 
                disabled={addContactMutation.isPending}
                className="w-full bg-bio-teal/20 text-bio-teal text-sm p-2 rounded hover:bg-bio-teal/30 flex justify-center items-center"
              >
                {addContactMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Contact'}
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Share Location Toggle */}
        <div className="flex items-center justify-between pt-2 border-t border-white/8">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-text-muted" />
            <span className="text-sm text-text-muted">Share Live Location</span>
          </div>
          <button
            onClick={() => setShareLocation(!shareLocation)}
            className={`relative w-10 h-6 rounded-full transition-all duration-300 ${
              shareLocation ? 'bg-bio-teal' : 'bg-white/10'
            }`}
          >
            <div
              className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${
                shareLocation ? 'left-5' : 'left-1'
              }`}
            />
          </button>
        </div>
      </GlassCard>
    </div>
  );
}

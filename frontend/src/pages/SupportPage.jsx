import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const SUPPORT_CATEGORIES = [
  { value: 'ACCOUNT', label: 'Account Issues' },
  { value: 'PAYMENT', label: 'Payment & Earnings' },
  { value: 'TRANSCRIPTION', label: 'Transcription Problems' },
  { value: 'TECHNICAL', label: 'Technical Support' },
  { value: 'OTHER', label: 'Other' }
];

const COMMON_ISSUES = {
  ACCOUNT: [
    'Cannot log in',
    'Need to change email',
    'Profile not updating',
    'Account verification issues'
  ],
  PAYMENT: [
    'Payment not received',
    'Wrong payment amount',
    'Stripe account setup issues',
    'Payment method problems'
  ],
  TRANSCRIPTION: [
    'Cannot claim videos',
    'Video playback issues',
    'Submission errors',
    'Quality score questions'
  ],
  TECHNICAL: [
    'Website not loading',
    'Browser compatibility issues',
    'Error messages',
    'Performance problems'
  ],
  OTHER: [
    'General inquiry',
    'Feature request',
    'Bug report',
    'Other issue'
  ]
};

export default function SupportPage() {
  const { user } = useAuth();
  const [category, setCategory] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTickets();
  }, []);

  async function fetchTickets() {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      toast.error('Failed to load support tickets');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!category || !subject || !message.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('support_tickets')
        .insert([
          {
            user_id: user.id,
            category,
            subject,
            message: message.trim()
          }
        ]);

      if (error) throw error;

      toast.success('Support ticket submitted successfully');
      setCategory('');
      setSubject('');
      setMessage('');
      fetchTickets();
    } catch (error) {
      toast.error('Failed to submit support ticket');
      console.error('Error:', error);
    } finally {
      setSubmitting(false);
    }
  }

  function handleCategoryChange(e) {
    const newCategory = e.target.value;
    setCategory(newCategory);
    // Reset subject when category changes
    setSubject('');
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Support Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Contact Support</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Category
                <select
                  value={category}
                  onChange={handleCategoryChange}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                >
                  <option value="">Select a category</option>
                  {SUPPORT_CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {category && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Common Issues
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  >
                    <option value="">Select an issue</option>
                    {COMMON_ISSUES[category].map(issue => (
                      <option key={issue} value={issue}>
                        {issue}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Message
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Please describe your issue in detail..."
                  required
                />
              </label>
            </div>

            <div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Ticket'}
              </button>
            </div>
          </form>
        </div>

        {/* Previous Tickets */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Your Support Tickets</h2>
          
          {loading ? (
            <p className="text-gray-500 dark:text-gray-400">Loading tickets...</p>
          ) : tickets.length > 0 ? (
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="border dark:border-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{ticket.subject}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Category: {SUPPORT_CATEGORIES.find(cat => cat.value === ticket.category)?.label}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Submitted: {new Date(ticket.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${
                      ticket.status === 'OPEN' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100' :
                      ticket.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100' :
                      ticket.status === 'RESOLVED' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
                    }`}>
                      {ticket.status}
                    </span>
                  </div>
                  <div className="mt-2">
                    <p className="text-gray-700 dark:text-gray-300">{ticket.message}</p>
                  </div>
                  {ticket.admin_response && (
                    <div className="mt-4 bg-gray-50 dark:bg-gray-700 p-3 rounded">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Admin Response:</p>
                      <p className="text-gray-700 dark:text-gray-300">{ticket.admin_response}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No support tickets yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
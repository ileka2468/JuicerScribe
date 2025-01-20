import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const SUPPORT_CATEGORIES = {
  ACCOUNT: 'Account Issues',
  PAYMENT: 'Payment & Earnings',
  TRANSCRIPTION: 'Transcription Problems',
  TECHNICAL: 'Technical Support',
  OTHER: 'Other'
};

export default function SupportSection() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [response, setResponse] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState('OPEN');

  useEffect(() => {
    fetchTickets();
  }, [filter]);

  async function fetchTickets() {
    try {
      // First get the tickets
      const query = supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter !== 'ALL') {
        query.eq('status', filter);
      }

      const { data: ticketsData, error: ticketsError } = await query;

      if (ticketsError) throw ticketsError;

      // Then get the usernames for each ticket
      const userIds = [...new Set(ticketsData.map(ticket => ticket.user_id))];
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Create a map of user IDs to usernames
      const usernameMap = Object.fromEntries(
        profilesData.map(profile => [profile.id, profile.username])
      );

      // Combine the data
      const ticketsWithUsernames = ticketsData.map(ticket => ({
        ...ticket,
        username: usernameMap[ticket.user_id] || 'Unknown User'
      }));

      setTickets(ticketsWithUsernames);
    } catch (error) {
      toast.error('Failed to load support tickets');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitResponse(e) {
    e.preventDefault();
    if (!response.trim()) {
      toast.error('Please enter a response');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({
          admin_response: response.trim()
        })
        .eq('id', selectedTicket.id);

      if (error) throw error;

      toast.success('Response submitted successfully');
      setResponse('');
      setSelectedTicket(null);
      fetchTickets();
    } catch (error) {
      toast.error('Failed to submit response');
      console.error('Error:', error);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStatusChange(ticketId, newStatus) {
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ status: newStatus })
        .eq('id', ticketId);

      if (error) throw error;
      toast.success('Status updated successfully');
      fetchTickets();
    } catch (error) {
      toast.error('Failed to update status');
      console.error('Error:', error);
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Support Tickets</h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="ALL">All Tickets</option>
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
          <option value="CLOSED">Closed</option>
        </select>
      </div>

      {loading ? (
        <p className="text-gray-500 dark:text-gray-400">Loading tickets...</p>
      ) : tickets.length > 0 ? (
        <div className="space-y-6">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="border dark:border-gray-700 rounded-lg p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{ticket.subject}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    From: {ticket.username}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Category: {SUPPORT_CATEGORIES[ticket.category]}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Submitted: {new Date(ticket.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <select
                    value={ticket.status}
                    onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                    className="text-sm rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="OPEN">Open</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded mb-4">
                <p className="text-gray-700 dark:text-gray-300">{ticket.message}</p>
              </div>

              {ticket.admin_response && (
                <div className="bg-indigo-50 dark:bg-indigo-900 p-3 rounded mb-4">
                  <p className="text-sm font-medium text-indigo-900 dark:text-indigo-100">Admin Response:</p>
                  <p className="text-indigo-700 dark:text-indigo-300">{ticket.admin_response}</p>
                </div>
              )}

              {ticket.status !== 'CLOSED' && (
                <button
                  onClick={() => setSelectedTicket(ticket)}
                  className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
                >
                  {ticket.admin_response ? 'Update Response' : 'Add Response'}
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 dark:text-gray-400">No support tickets found.</p>
      )}

      {/* Response Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {selectedTicket.admin_response ? 'Update Response' : 'Add Response'}
            </h3>
            <form onSubmit={handleSubmitResponse} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Your Response
                  <textarea
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    rows={6}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </label>
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : (selectedTicket.admin_response ? 'Update Response' : 'Submit Response')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
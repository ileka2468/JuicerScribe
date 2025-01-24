import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";

export default function PaymentCenter() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [accountStatus, setAccountStatus] = useState(null);
  const [payoutHistory, setPayoutHistory] = useState([]);
  const [creatingLink, setCreatingLink] = useState(false);

  useEffect(() => {
    fetchAccountStatus();
  }, []);

  async function fetchAccountStatus() {
    try {
      const { data, error } = await supabase
        .from("stripe_accounts")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      setAccountStatus(data);

      // Fetch payout history if account exists
      if (data?.account_id) {
        const { data: payouts, error: payoutsError } = await supabase
          .from("payouts")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (payoutsError) throw payoutsError;
        setPayoutHistory(payouts || []);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching account status:", error);
      toast.error("Failed to load account status");
      setLoading(false);
    }
  }

  async function handleCreateAccount() {
    setCreatingLink(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "create-stripe-account",
        {
          body: { return_url: window.location.href },
        }
      );

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No onboarding URL received");
      }
    } catch (error) {
      console.error("Error creating account:", error);
      toast.error("Failed to start account setup");
      setCreatingLink(false);
    }
  }

  async function handleResumeOnboarding() {
    setCreatingLink(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "create-account-link",
        {
          body: {
            account_id: accountStatus.account_id,
            return_url: window.location.href,
          },
        }
      );

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No account link URL received");
      }
    } catch (error) {
      console.error("Error creating account link:", error);
      toast.error("Failed to resume onboarding");
      setCreatingLink(false);
    }
  }

  async function handleLoginToDashboard() {
    try {
      const { data, error } = await supabase.functions.invoke(
        "create-login-link",
        {
          body: { account_id: accountStatus.account_id },
        }
      );

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No login link URL received");
      }
    } catch (error) {
      console.error("Error creating login link:", error);
      toast.error("Failed to access dashboard");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-gray-500 dark:text-gray-400">
            Loading payment center...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Payout Account Setup
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Set up your account to receive payments for transcription work.
          </p>
        </div>

        {/* Account Status Card */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Account Status
          </h2>

          <div className="space-y-4">
            {!accountStatus ? (
              <>
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <span className="w-3 h-3 bg-gray-400 rounded-full mr-2"></span>
                  No payout account found
                </div>
                <button
                  onClick={handleCreateAccount}
                  disabled={creatingLink}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {creatingLink
                    ? "Setting up..."
                    : "Create Your Payout Account"}
                </button>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  You'll be redirected to Stripe to securely set up your payout
                  account. Need help? Checkout the{" "}
                  <a
                    className="underline"
                    href="https://juicerscribe.com/knowledge-base/6"
                  >
                    Payment Center guide
                  </a>
                  .
                </p>
              </>
            ) : accountStatus.charges_enabled ? (
              <>
                <div className="flex items-center text-green-600 dark:text-green-400">
                  <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                  Your payout account is ready to receive payments
                </div>
                <button
                  onClick={handleLoginToDashboard}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Go to Your Payout Dashboard
                </button>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Manage your bank account, payment details, and payouts
                  directly in your Stripe dashboard.
                </p>
              </>
            ) : (
              <>
                <div className="flex items-center text-yellow-600 dark:text-yellow-400">
                  <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                  Onboarding incomplete. Please finish setting up your account.
                </div>
                <button
                  onClick={handleResumeOnboarding}
                  disabled={creatingLink}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {creatingLink ? "Loading..." : "Resume Account Setup"}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Payout History */}
        {accountStatus?.charges_enabled && (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Payout History
            </h2>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {payoutHistory.map((payout) => (
                    <tr key={payout.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                        {new Date(payout.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                        ${payout.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            payout.status === "paid"
                              ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100"
                          }`}
                        >
                          {payout.status.charAt(0).toUpperCase() +
                            payout.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {payoutHistory.length === 0 && (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400"
                      >
                        No payouts yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

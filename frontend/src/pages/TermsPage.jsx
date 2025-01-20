import React from 'react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Terms and Conditions</h1>
          
          <div className="prose dark:prose-invert max-w-none">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using JuicerScribe, you agree to be bound by these Terms and Conditions.
              If you do not agree to these terms, please do not use our service.
            </p>

            <h2>2. Service Description</h2>
            <p>
              JuicerScribe is a platform that enables users to transcribe xQc's content. Users can earn
              money by providing accurate transcriptions of video content.
            </p>

            <h2>3. Payment Processing</h2>
            <p>
              All financial transactions and payment processing are handled securely by Stripe, a third-party
              payment processor. JuicerScribe does not collect, store, or process any financial information
              directly. By using our service, you agree to Stripe's terms of service and privacy policy.
            </p>

            <h2>4. Payout Requirements</h2>
            <ul>
              <li>Users must have a valid bank account to receive payouts through Stripe</li>
              <li>Users must be of legal age in their jurisdiction or have consent from a legal guardian</li>
              <li>Unclaimed funds will be rescinded after one year of inactivity</li>
            </ul>

            <h2>5. Quality Standards</h2>
            <p>
              We reserve the right to deny payouts for transcriptions that do not meet our quality standards.
              This includes but is not limited to:
            </p>
            <ul>
              <li>Inaccurate transcriptions</li>
              <li>Incomplete submissions</li>
              <li>Deliberately incorrect content</li>
              <li>Spam or automated submissions</li>
            </ul>

            <h2>6. Account Termination</h2>
            <p>
              We reserve the right to terminate or suspend accounts for any reason, including but not limited to:
            </p>
            <ul>
              <li>Violation of these terms</li>
              <li>Suspicious or fraudulent activity</li>
              <li>Consistent low-quality submissions</li>
              <li>Harassment or abuse of other users</li>
            </ul>

            <h2>7. Intellectual Property</h2>
            <p>
              Users retain no rights to the transcriptions they create. All transcriptions become the
              property of JuicerScribe and may be used for any purpose, including but not limited to
              training AI models and improving accessibility features.
            </p>

            <h2>8. Limitation of Liability</h2>
            <p>
              JuicerScribe is not liable for any damages arising from the use of our service, including
              but not limited to errors in transcription, payment delays, or service interruptions.
            </p>

            <h2>9. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. Continued use of the service
              after changes constitutes acceptance of the new terms.
            </p>

            <h2>10. Contact Information</h2>
            <p>
              For questions about these terms, please contact us through our support channels.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
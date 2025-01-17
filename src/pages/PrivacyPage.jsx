import React from 'react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Privacy Policy</h1>
          
          <div className="prose dark:prose-invert max-w-none">
            <h2>1. Information We Collect</h2>
            <p>
              We collect the following types of information:
            </p>
            <ul>
              <li>Email address and username for account creation</li>
              <li>Transcription content and activity data</li>
              <li>Usage statistics and performance metrics</li>
            </ul>

            <h2>2. Payment Information</h2>
            <p>
              JuicerScribe does not collect, store, or process any financial information. All payment
              processing is handled securely by Stripe, our third-party payment processor. When you set
              up your payout account:
            </p>
            <ul>
              <li>You interact directly with Stripe's secure platform</li>
              <li>Your banking and financial information is stored only with Stripe</li>
              <li>We only receive confirmation of successful account setup and payout status</li>
            </ul>

            <h2>3. How We Use Your Information</h2>
            <p>
              We use your information to:
            </p>
            <ul>
              <li>Manage your account and provide our services</li>
              <li>Process transcription submissions and payments</li>
              <li>Improve our service and user experience</li>
              <li>Communicate important updates and changes</li>
            </ul>

            <h2>4. Information Sharing</h2>
            <p>
              We share information with:
            </p>
            <ul>
              <li>Stripe (for payment processing only)</li>
              <li>Service providers who assist in operating our platform</li>
              <li>Law enforcement when required by law</li>
            </ul>

            <h2>5. Data Security</h2>
            <p>
              We implement appropriate security measures to protect your information:
            </p>
            <ul>
              <li>Encryption of data in transit and at rest</li>
              <li>Regular security audits and updates</li>
              <li>Strict access controls and authentication</li>
            </ul>

            <h2>6. Your Rights</h2>
            <p>
              You have the right to:
            </p>
            <ul>
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your account</li>
              <li>Export your data</li>
            </ul>

            <h2>7. Cookies and Tracking</h2>
            <p>
              We use cookies and similar technologies to:
            </p>
            <ul>
              <li>Maintain your session and preferences</li>
              <li>Analyze usage patterns and improve our service</li>
              <li>Ensure platform security</li>
            </ul>

            <h2>8. Changes to Privacy Policy</h2>
            <p>
              We may update this privacy policy from time to time. We will notify you of any significant
              changes through our platform or via email.
            </p>

            <h2>9. Contact Us</h2>
            <p>
              For privacy-related questions or concerns, please contact us through our support channels.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
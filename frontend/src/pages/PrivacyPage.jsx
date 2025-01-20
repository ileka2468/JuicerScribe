import React from "react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
            Privacy Policy
          </h1>

          <div className="prose dark:prose-invert max-w-none">
            <h2 className="text-2xl font-semibold mt-6 mb-4">
              1. Information We Collect
            </h2>
            <p className="mb-4">
              We collect the following types of information:
            </p>
            <ul className="list-disc list-inside mb-6">
              <li>Email address and username for account creation</li>
              <li>Transcription content and activity data</li>
              <li>Usage statistics and performance metrics</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-6 mb-4">
              2. Payment Information
            </h2>
            <p className="mb-4">
              JuicerScribe does not collect, store, or process any financial
              information. All payment processing is handled securely by Stripe,
              our third-party payment processor. When you set up your payout
              account:
            </p>
            <ul className="list-disc list-inside mb-6">
              <li>You interact directly with Stripe's secure platform</li>
              <li>
                Your banking and financial information is stored only with
                Stripe
              </li>
              <li>
                We only receive confirmation of successful account setup and
                payout status
              </li>
            </ul>

            <h2 className="text-2xl font-semibold mt-6 mb-4">
              3. How We Use Your Information
            </h2>
            <p className="mb-4">We use your information to:</p>
            <ul className="list-disc list-inside mb-6">
              <li>Manage your account and provide our services</li>
              <li>Process transcription submissions and payments</li>
              <li>Improve our service and user experience</li>
              <li>Communicate important updates and changes</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-6 mb-4">
              4. Information Sharing
            </h2>
            <p className="mb-4">We share information with:</p>
            <ul className="list-disc list-inside mb-6">
              <li>Stripe (for payment processing only)</li>
              <li>Service providers who assist in operating our platform</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-6 mb-4">
              5. Data Security
            </h2>
            <p className="mb-4">
              We implement appropriate security measures to protect your
              information:
            </p>
            <ul className="list-disc list-inside mb-6">
              <li>Encryption of data in transit and at rest</li>
              <li>Regular security audits and updates</li>
              <li>Strict access controls and authentication</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-6 mb-4">6. Your Rights</h2>
            <p className="mb-4">You have the right to:</p>
            <ul className="list-disc list-inside mb-6">
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your account</li>
              <li>Export your data</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-6 mb-4">
              7. Cookies and Tracking
            </h2>
            <p className="mb-4">We use cookies and similar technologies to:</p>
            <ul className="list-disc list-inside mb-6">
              <li>Maintain your session and preferences</li>
              <li>Analyze usage patterns and improve our service</li>
              <li>Ensure platform security</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-6 mb-4">
              8. Ezoic Services
            </h2>
            <p className="mb-4">
              This website uses the services of Ezoic Inc. (“Ezoic”), including
              to manage third-party interest-based advertising. Ezoic may employ
              a variety of technologies on this website, including tools to
              serve content, display advertisements and enable advertising to
              visitors of this website, which may utilize first and third-party
              cookies.
            </p>
            <p className="mb-4">
              A cookie is a small text file sent to your device by a web server
              that enables the website to remember information about your
              browsing activity. First-party cookies are created by the site you
              are visiting, while third-party cookies are set by domains other
              than the one you're visiting. Ezoic and our partners may place
              third-party cookies, tags, beacons, pixels, and similar
              technologies to monitor interactions with advertisements and
              optimize ad targeting. Please note that disabling cookies may
              limit access to certain content and features on the website, and
              rejecting cookies does not eliminate advertisements but will
              result in non-personalized advertising. You can find more
              information about cookies and how to manage them{" "}
              <a className="underline" href="https://allaboutcookies.org/">
                here
              </a>
              .
            </p>
            <p className="mb-4">
              The following information may be collected, used, and stored in a
              cookie when serving personalized ads:
            </p>
            <ul className="list-disc list-inside mb-6">
              <li>IP address</li>
              <li>Operating system type and version</li>
              <li>Device type</li>
              <li>Language preferences</li>
              <li>Web browser type</li>
              <li>Email (in a hashed or encrypted form)</li>
            </ul>
            <p className="mb-4">
              Ezoic and its partners may use this data in combination with
              information that has been independently collected to deliver
              targeted advertisements across various platforms and websites.
              Ezoic's partners may also gather additional data, such as unique
              IDs, advertising IDs, geolocation data, usage data, device
              information, traffic data, referral sources, and interactions
              between users and websites or advertisements, to create audience
              segments for targeted advertising across different devices,
              browsers, and apps. You can find more information about
              interest-based advertising and how to manage them{" "}
              <a className="underline" href="https://youradchoices.com/">
                here
              </a>
              .
            </p>
            <p className="mb-4">
              You can view Ezoic's privacy policy{" "}
              <a className="underline" href="https://ezoic.com/privacy/">
                here
              </a>
              , or for additional information about Ezoic's advertising and
              other partners, you can view Ezoic's advertising partners{" "}
              <a
                className="underline"
                href="https://www.ezoic.com/privacy-policy/advertising-partners/"
              >
                here
              </a>
              .
            </p>

            <h2 className="text-2xl font-semibold mt-6 mb-4">
              9. Changes to Privacy Policy
            </h2>
            <p className="mb-4">
              We may update this privacy policy from time to time. We will
              notify you of any significant changes through our platform or via
              email.
            </p>

            <h2 className="text-2xl font-semibold mt-6 mb-4">10. Contact Us</h2>
            <p className="mb-4">
              For privacy-related questions or concerns, please contact us
              through our support channels.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

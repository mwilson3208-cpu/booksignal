import type { Metadata } from 'next';
import { BRAND } from '@/lib/brand';

export const metadata: Metadata = { title: 'Terms of Service' };

export default function TermsPage() {
  return (
    <>
      <h1>Terms of Service</h1>
      <p>
        These terms are a starting template. Have them reviewed by a qualified lawyer in your
        jurisdiction before you take payments.
      </p>

      <h2>1. The service</h2>
      <p>
        {BRAND.name} provides market research estimates to help authors evaluate book topics. It
        does not provide financial, legal or business advice, and nothing it outputs is a
        prediction of the results any particular book will achieve.
      </p>

      <h2>2. Accounts</h2>
      <p>
        You are responsible for keeping your account credentials secure and for all activity that
        happens under your account. You must be at least 18 years old to hold an account.
      </p>

      <h2>3. Subscriptions and billing</h2>
      <ul>
        <li>Paid plans bill in advance, monthly or yearly, through Stripe.</li>
        <li>Each plan includes a fixed number of validations per billing cycle. Unused validations do not roll over.</li>
        <li>You can cancel at any time from the billing page. Access continues to the end of the period already paid for.</li>
        <li>Yearly plans are charged as ten months of the monthly rate, billed once per year.</li>
      </ul>

      <h2>4. Estimates and accuracy</h2>
      <p>
        Search volume, sales, rank and revenue figures are estimates derived from publicly
        observable signals and modelled curves. They are not reported sales data and they will not
        match any retailer&apos;s internal figures. Version 1 of the service runs on a labelled
        sample data layer. Use the numbers to compare topics against each other, not as a forecast
        of your earnings.
      </p>

      <h2>5. Acceptable use</h2>
      <ul>
        <li>Do not resell, scrape or systematically extract the service&apos;s output.</li>
        <li>Do not attempt to interfere with the service or access other users&apos; data.</li>
        <li>Do not use the service to infringe anyone&apos;s intellectual property.</li>
      </ul>

      <h2>6. Your content</h2>
      <p>
        Topics, projects and notes you enter remain yours. You grant us only the licence needed to
        operate the service for you. We do not sell your data.
      </p>

      <h2>7. Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, {BRAND.name} is not liable for lost profits, lost
        revenue, or any indirect or consequential damages arising from your use of the service.
        Total liability is limited to the amount you paid in the twelve months before the claim.
      </p>

      <h2>8. Changes</h2>
      <p>
        We may update these terms. Material changes will be announced by email to the address on
        your account before they take effect.
      </p>

      <h2>9. Contact</h2>
      <p>Questions about these terms: {BRAND.supportEmail}</p>
    </>
  );
}

import type { Metadata } from 'next';
import { BRAND } from '@/lib/brand';

export const metadata: Metadata = { title: 'Privacy Policy' };

export default function PrivacyPage() {
  return (
    <>
      <h1>Privacy Policy</h1>
      <p>
        This policy is a starting template. Have it reviewed against the privacy law that applies
        to you and your customers before launch.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>Account details: your email address and, if you provide it, your name.</li>
        <li>Product data: the topics you validate, the reports you save, and your projects.</li>
        <li>Billing data: handled by Stripe. We store only a customer and subscription identifier — never your card details.</li>
        <li>Technical data: standard server logs, used to keep the service running and secure.</li>
      </ul>

      <h2>How we use it</h2>
      <ul>
        <li>To run the service and show you your own saved work.</li>
        <li>To meter usage against your plan&apos;s allowance.</li>
        <li>To send transactional email about your account and billing.</li>
      </ul>

      <h2>Who we share it with</h2>
      <p>
        Only the processors needed to operate: Supabase (authentication and database), Stripe
        (payments), Vercel (hosting), and Anthropic (only the messages you send to the AI
        Publishing Coach, plus the reports you ask it about). We do not sell personal data and we
        do not share it for advertising.
      </p>

      <h2>Retention</h2>
      <p>
        Account and report data is kept while your account is open. Delete your account from the
        billing page and we remove your personal data within 30 days, except where we are required
        to retain records for tax or legal reasons.
      </p>

      <h2>Your rights</h2>
      <p>
        Depending on where you live you may have the right to access, correct, export or delete
        your personal data. Email {BRAND.supportEmail} and we will action the request.
      </p>

      <h2>Cookies</h2>
      <p>
        We set the cookies required to keep you signed in. No third-party advertising or tracking
        cookies are used.
      </p>

      <h2>Contact</h2>
      <p>Privacy questions: {BRAND.supportEmail}</p>
    </>
  );
}

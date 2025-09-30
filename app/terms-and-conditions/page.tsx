// server component; static content
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export default function TermsAndConditionsPage() {
  return (
    <section className="py-6">
      <div className="mx-auto max-w-[1000px] space-y-6">
        <header className="text-center">
          <h1 id="top" className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-[#aa2ee2] to-[#9322c8] bg-clip-text text-transparent">Terms & Conditions</h1>
          <p className="mt-3 text-muted-foreground">Please read these terms carefully before using BrickAI</p>
        </header>

        <Card className="rounded-2xl border-[#aa2ee2]/40 bg-white/[0.03] hover:border-[#aa2ee2]/50 transition-colors">
          <CardContent className="p-4 sm:p-6">
            <div className="max-h-[70vh] overflow-y-auto pr-2 scrollbox">
              <article className="prose prose-invert prose-sm sm:prose-base max-w-none prose-headings:text-white prose-headings:font-semibold prose-p:leading-relaxed prose-li:my-1 prose-li:marker:text-[#aa2ee2]/60 prose-a:text-[#aa2ee2] hover:prose-a:text-[#77e5f2] prose-hr:border-white/10 prose-h2:mt-6 prose-h2:mb-2 prose-h3:mt-5 prose-h3:mb-1 prose-h2:scroll-mt-24">
                <h3 className="text-white/80">Contents</h3>
                <ul>
                  <li><a href="#introduction">Introduction</a></li>
                  <li><a href="#definitions">Definitions</a></li>
                  <li><a href="#eligibility">Eligibility</a></li>
                  <li><a href="#use-of-service">Use of Service</a></li>
                  <li><a href="#accounts">Accounts</a></li>
                  <li><a href="#payments">Fees &amp; Payment</a></li>
                  <li><a href="#trials-beta">Trials &amp; Beta</a></li>
                  <li><a href="#acceptable-use">Acceptable Use</a></li>
                  <li><a href="#anti-scraping">Anti‑Scraping &amp; Automated Access</a></li>
                  <li><a href="#rate-limits">Rate Limits &amp; Excessive Use</a></li>
                  <li><a href="#customer-data">Customer Data &amp; Privacy</a></li>
                  <li><a href="#third-party">Third-Party Services</a></li>
                  <li><a href="#intellectual-property">Intellectual Property</a></li>
                  <li><a href="#feedback">Feedback</a></li>
                  <li><a href="#confidentiality">Confidentiality</a></li>
                  <li><a href="#warranty-disclaimer">Disclaimer of Warranties</a></li>
                  <li><a href="#liability">Limitation of Liability</a></li>
                  <li><a href="#indemnity">Indemnification</a></li>
                  <li><a href="#service-changes">Service Changes &amp; Availability</a></li>
                  <li><a href="#termination">Suspension &amp; Termination</a></li>
                  <li><a href="#export">Export Controls</a></li>
                  <li><a href="#assignment">Assignment</a></li>
                  <li><a href="#entire">Entire Agreement</a></li>
                  <li><a href="#changes">Changes</a></li>
                  <li><a href="#law">Governing Law</a></li>
                  <li><a href="#contact">Contact</a></li>
                </ul>

                <h2 id="introduction">Introduction</h2>
                <p>
                  These Terms &amp; Conditions (the “Terms”) govern your access to and use of the BrickAI platform and services (the
                  “Service”). By accessing or using the Service you agree to be bound by these Terms.
                </p>

                <h2 id="definitions">Definitions</h2>
                <p>
                  &quot;Customer Data&quot; means any data, content, files, or materials that you or your users submit to the Service.
                  &quot;We&quot;, &quot;us&quot;, and &quot;our&quot; refer to BrickAI.
                </p>

                <h2 id="eligibility">Eligibility</h2>
                <p>
                  You must be at least 18 years of age and able to enter into a binding contract to use the Service.
                </p>

                <h2 id="use-of-service">Use of Service</h2>
                <p>
                  You must use the Service in compliance with applicable law. You are responsible for the content you input and
                  the actions you take within your account.
                </p>

                <h2 id="accounts">Accounts</h2>
                <p>
                  You are responsible for maintaining the confidentiality of your account credentials and for all activities
                  that occur under your account. Notify us promptly of any unauthorised use.
                </p>

                <h2 id="customer-data">Customer Data &amp; Privacy</h2>
                <p>
                  You retain ownership of Customer Data. You grant us a limited right to process Customer Data to provide the
                  Service and related support, consistent with our <a href="/privacy-policy">Privacy Policy</a> and
                  <a href="/cookie-policy"> Cookie Policy</a>. You are responsible for having the rights and consents needed to
                  submit Customer Data.
                </p>

                <h2 id="third-party">Third-Party Services</h2>
                <p>
                  The Service may interoperate with or link to third-party products or services. We do not control and are not
                  responsible for third-party services. Your use of them is governed by their terms.
                </p>

                <h2 id="payments">Fees &amp; Payment</h2>
                <p>
                  Paid plans are billed in accordance with the pricing presented at checkout. Unless otherwise stated, fees are
                  non-refundable except as required by law.
                </p>

                <h2 id="trials-beta">Trials &amp; Beta</h2>
                <p>
                  We may offer trials or beta features at our discretion. Beta features are provided &quot;as is&quot; for evaluation and
                  may be modified or discontinued at any time.
                </p>

                <h2 id="acceptable-use">Acceptable Use</h2>
                <p>When using the Service you agree not to:</p>
                <ul>
                  <li>Violate any applicable law, regulation, or the rights of others.</li>
                  <li>Upload unlawful, infringing, harmful, or misleading content.</li>
                  <li>Reverse engineer, interfere with, or disrupt the Service or its security.</li>
                  <li>Access the Service using automated means except as permitted by an API we provide.</li>
                  <li>Attempt to gain unauthorised access to the Service or related systems.</li>
                </ul>

                <h2 id="anti-scraping">Anti‑Scraping &amp; Automated Access</h2>
                <p>
                  You may not scrape, crawl, harvest, or otherwise access the Service by automated means except through
                  interfaces that we expressly make available (for example, a documented API) and only in accordance with
                  the then‑current documentation and rate limits. You agree not to:
                </p>
                <ul>
                  <li>Bypass or circumvent access controls, rate‑limiting, robots.txt, or other technical restrictions.</li>
                  <li>Use headless browsers, bots, or similar tools to copy, mirror, or index content without written consent.</li>
                  <li>Collect or harvest user data or metadata for profiling, marketing, or resale.</li>
                </ul>
                <p>
                  We may monitor, detect, and block automated access patterns and take technical, operational, or legal
                  actions to protect the Service and our users.
                </p>

                <h2 id="rate-limits">Rate Limits &amp; Excessive Use</h2>
                <p>
                  We apply fair‑use and rate‑limiting controls to ensure reliable Service for all customers. You agree not to
                  exceed published or otherwise communicated limits for your plan or integration. Without limiting our other
                  rights, we may throttle, temporarily or permanently block access, or suspend/terminate accounts engaged in
                  excessive usage or attempts to evade limits. Repeated or intentional exceedance of limits is deemed misuse
                  of the Service.
                </p>

                <h2 id="intellectual-property">Intellectual Property</h2>
                <p>
                  BrickAI retains all rights, title and interest in and to the Service, including software, logos and content
                  we provide. You retain rights to your data.
                </p>

                <h2 id="feedback">Feedback</h2>
                <p>
                  If you provide feedback or suggestions, you grant us a non-exclusive, perpetual, irrevocable, royalty-free
                  licence to use it without restriction.
                </p>

                <h2 id="confidentiality">Confidentiality</h2>
                <p>
                  Each party may receive confidential information from the other. The receiving party will protect such
                  information and not disclose it except to personnel or advisors who need to know it and are bound by
                  confidentiality obligations.
                </p>

                <h2 id="warranty-disclaimer">Disclaimer of Warranties</h2>
                <p>
                  To the maximum extent permitted by law, the Service is provided on an &quot;as is&quot; and &quot;as available&quot; basis, and we
                  disclaim all warranties, express or implied, including merchantability, fitness for a particular purpose, and
                  non-infringement. We do not warrant that the Service will be uninterrupted, secure, or error-free.
                </p>

                <h2 id="termination">Suspension &amp; Termination</h2>
                <p>
                  We may suspend or terminate access if these Terms are violated or to protect the Service. You may stop using
                  the Service at any time.
                </p>

                <h2 id="liability">Limitation of Liability</h2>
                <p>
                  To the maximum extent permitted by law, BrickAI is not liable for any indirect, incidental, special,
                  consequential or punitive damages, or loss of profits, data, or goodwill.
                </p>

                <h2 id="indemnity">Indemnification</h2>
                <p>
                  You agree to indemnify and hold BrickAI and our affiliates harmless from any claims, losses, and expenses
                  (including reasonable legal fees) arising from your use of the Service, Customer Data, or your violation of
                  these Terms or applicable law.
                </p>

                <h2 id="service-changes">Service Changes &amp; Availability</h2>
                <p>
                  We may modify, suspend, or discontinue the Service in whole or in part. We aim to provide reasonable notice of
                  material changes where practicable.
                </p>

                <h2 id="export">Export Controls</h2>
                <p>
                  You must comply with applicable export, re-export, and sanctions laws and may not use the Service where such
                  use is prohibited.
                </p>

                <h2 id="assignment">Assignment</h2>
                <p>
                  You may not assign these Terms without our prior written consent. We may assign these Terms in connection with
                  a merger, acquisition, or sale of assets.
                </p>

                <h2 id="entire">Entire Agreement; Severability; Waiver</h2>
                <p>
                  These Terms constitute the entire agreement between you and BrickAI regarding the Service and supersede any
                  prior agreements. If any provision is found unenforceable, the remaining terms will remain in effect. Our
                  failure to enforce a term is not a waiver of our right to do so later.
                </p>

                <h2 id="changes">Changes</h2>
                <p>
                  We may update these Terms. If changes are material we will provide notice by reasonable means. Continued use
                  of the Service after changes take effect constitutes acceptance.
                </p>

                <h2 id="law">Governing Law</h2>
                <p>
                  These Terms are governed by the laws of England and Wales, without regard to conflict of law principles. The
                  courts of England and Wales shall have exclusive jurisdiction over disputes arising out of or in connection
                  with these Terms.
                </p>

                <h2 id="contact">Contact</h2>
                <p>
                  Questions about these Terms? Email <a href="mailto:hello@brickai.app">hello@brickai.app</a>.
                </p>
              </article>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

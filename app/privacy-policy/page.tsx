// server component; static content
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { PolicyBackToTop } from "@/components/PolicyBackToTop";

export default function PrivacyPolicyPage() {
  const scrollContainerId = "privacy-policy-scroll";

  return (
    <section className="pt-10 pb-6">
      <div className="mx-auto max-w-[1000px] space-y-6">
        <header className="text-center">
          <h1 id="top" className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-[#aa2ee2] to-[#9322c8] bg-clip-text text-transparent">Privacy Policy</h1>
          <p className="mt-3 text-muted-foreground">How we collect, use, and protect your information</p>
        </header>

        <Card className="rounded-2xl border border-[#aa2ee2]/35 bg-[#171717] shadow-lg">
          <CardContent className="p-4 sm:p-6 flex flex-col gap-4 h-[70vh]">
            <div id={scrollContainerId} className="flex-1 overflow-y-auto pr-2 scrollbox">
              <article className="prose prose-invert prose-sm sm:prose-base max-w-none prose-headings:text-white prose-headings:font-semibold prose-p:leading-relaxed prose-li:my-1 prose-li:marker:text-[#aa2ee2]/60 prose-a:text-[#aa2ee2] hover:prose-a:text-[#77e5f2] prose-hr:border-white/10 prose-h2:mt-6 prose-h2:mb-2 prose-h3:mt-5 prose-h3:mb-1 prose-h2:scroll-mt-24">
                <h3 className="text-white/80">Contents</h3>
                <ul>
                  <li><a href="#overview">Overview</a></li>
                  <li><a href="#controller">Controller &amp; Contact</a></li>
                  <li><a href="#info">Information We Collect</a></li>
                  <li><a href="#use">How We Use Information</a></li>
                  <li><a href="#legal-bases">Legal Bases</a></li>
                  <li><a href="#sharing">Sharing</a></li>
                  <li><a href="#transfers">International Transfers</a></li>
                  <li><a href="#retention">Data Retention</a></li>
                  <li><a href="#security">Security</a></li>
                  <li><a href="#choices">Your Choices &amp; Rights</a></li>
                  <li><a href="#children">Children</a></li>
                  <li><a href="#automated">Automated Decision-Making</a></li>
                  <li><a href="#changes">Changes</a></li>
                  <li><a href="#contact">Contact</a></li>
                </ul>

                <h2 id="overview">Overview</h2>
                <p>
                  This Privacy Policy explains how BrickAI handles personal information when you use the Service. We aim to be
                  transparent and to give you control over your data.
                </p>

                <h2 id="controller">Controller &amp; Contact</h2>
                <p>
                  For the purposes of the UK GDPR, BrickAI is the data controller for personal information processed through
                  the Service unless stated otherwise. You can contact us at <a href="mailto:hello@brickai.app">hello@brickai.app</a>.
                </p>

                <h2 id="info">Information We Collect</h2>
                <ul>
                  <li>Account details you provide such as name and email.</li>
                  <li>Content and files you upload to manage your portfolios and projects.</li>
                  <li>Usage information such as device, browser, and interactions for product improvement.</li>
                </ul>

                <h2 id="use">How We Use Information</h2>
                <ul>
                  <li>To provide and maintain the Service.</li>
                  <li>To improve features, performance, and usability.</li>
                  <li>To communicate important updates or support responses.</li>
                  <li>To detect, prevent, and investigate abuse or misuse (including scraping, automated access, and attempts to circumvent rate limits).</li>
                </ul>

                <h2 id="legal-bases">Legal Bases</h2>
                <p>
                  We rely on one or more of the following legal bases: performance of a contract (to provide the Service),
                  legitimate interests (to improve and secure the Service), consent (where required), and compliance with legal
                  obligations (such as record keeping and responding to lawful requests).
                </p>

                <h2 id="sharing">Sharing</h2>
                <p>
                  We do not sell personal information. We may share with service providers that help operate the Service and as
                  required by law.
                </p>

                <h2 id="transfers">International Transfers</h2>
                <p>
                  Where personal information is transferred outside the UK/EEA, we use appropriate safeguards such as
                  Standard Contractual Clauses or other lawful mechanisms, and require recipients to protect information at a
                  level comparable to UK standards.
                </p>

                <h2 id="retention">Data Retention</h2>
                <p>
                  We retain information for as long as your account is active or as needed to provide the Service. You may
                  request deletion where applicable.
                </p>

                <h2 id="security">Security</h2>
                <p>
                  We design and develop the Service around current cybersecurity best practices and standards (for example,
                  principles informed by OWASP guidance, NIST CSF, and ISO/IEC 27001). Measures include access controls, logging,
                  and the use of industry‑standard encryption for data in transit, and at rest where applicable. We also deploy
                  technical measures to monitor for suspicious or automated activity, scraping, and rate‑limit evasion. We aim to
                  meet applicable security and privacy obligations; however, no method of transmission or storage is completely
                  secure and we cannot guarantee absolute security, as is the case with all vendors.
                </p>
                <div className="not-prose mt-3 rounded-lg border border-[#aa2ee2]/40 bg-[#171717] p-3 text-sm text-white/90">
                  Security note: We align with widely recognised frameworks and best practices, but no provider can offer a
                  100% guarantee. Please report issues and we will respond promptly.
                </div>

                <h2 id="choices">Your Choices &amp; Rights</h2>
                <ul>
                  <li>Access, update, or delete information in your account, where available.</li>
                  <li>Opt out of non‑essential communications.</li>
                  <li>Request a copy of your personal information and portability, where applicable.</li>
                  <li>Object to or restrict certain processing, and withdraw consent where processing is based on consent.</li>
                </ul>

                <h2 id="children">Children</h2>
                <p>
                  The Service is not directed to children under 16 and we do not knowingly collect personal information from
                  children. If you believe a child has provided us information, please contact us to request deletion.
                </p>

                <h2 id="automated">Automated Decision-Making</h2>
                <p>
                  We do not engage in solely automated decision‑making that produces legal or similarly significant effects
                  without appropriate safeguards. Where features use AI to assist, results are reviewed by users and subject to
                  human oversight.
                </p>

                <h2 id="changes">Changes</h2>
                <p>
                  We may update this policy. If changes are material we will provide notice by reasonable means.
                </p>

                <h2 id="contact">Contact</h2>
                <p>
                  Questions or complaints about privacy? Email <a href="mailto:hello@brickai.app">hello@brickai.app</a>. You may
                  also lodge a complaint with the UK Information Commissioner&apos;s Office (ICO) or your local supervisory authority.
                </p>
              </article>
            </div>
            <div className="flex justify-end pt-2">
              <PolicyBackToTop targetId={scrollContainerId} />
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

// server component; static content
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export default function CookiePolicyPage() {
  return (
    <section className="py-6">
      <div className="mx-auto max-w-[1000px] space-y-6">
        <header className="text-center">
          <h1 id="top" className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-[#aa2ee2] to-[#9322c8] bg-clip-text text-transparent">Cookie Policy</h1>
          <p className="mt-3 text-muted-foreground">How BrickAI uses cookies and similar technologies</p>
        </header>

        <Card className="rounded-2xl border-[#aa2ee2]/40 bg-white/[0.03] hover:border-[#aa2ee2]/50 transition-colors">
          <CardContent className="p-4 sm:p-6">
            <div className="max-h-[70vh] overflow-y-auto pr-2 scrollbox">
              <article className="prose prose-invert prose-sm sm:prose-base max-w-none prose-headings:text-white prose-headings:font-semibold prose-p:leading-relaxed prose-li:my-1 prose-li:marker:text-[#aa2ee2]/60 prose-a:text-[#aa2ee2] hover:prose-a:text-[#77e5f2] prose-hr:border-white/10 prose-h2:mt-6 prose-h2:mb-2 prose-h3:mt-5 prose-h3:mb-1 prose-h2:scroll-mt-24">
                <h3 className="text-white/80">Contents</h3>
                <ul>
                  <li><a href="#what-are-cookies">What Are Cookies?</a></li>
                  <li><a href="#use">How We Use Cookies</a></li>
                  <li><a href="#manage">Managing Cookies</a></li>
                  <li><a href="#changes">Changes</a></li>
                </ul>

                <h2 id="what-are-cookies">What Are Cookies?</h2>
                <p>
                  Cookies are small text files stored on your device by your browser. They help websites remember information
                  about your visit and can be used for core functionality, preferences, and analytics.
                </p>

                <h2 id="use">How We Use Cookies</h2>
                <ul>
                  <li>Essential cookies to keep you signed in and secure.</li>
                  <li>Preference cookies to remember settings like recently used views.</li>
                  <li>Analytics cookies to understand usage and improve the product.</li>
                </ul>

                <h2 id="manage">Managing Cookies</h2>
                <p>
                  You can control cookies via your browser settings. Blocking some types may impact your experience.
                </p>

                <h2 id="changes">Changes</h2>
                <p>
                  We may update this policy as our use of cookies evolves. We will post updates on this page.
                </p>
                <div className="not-prose mt-3 rounded-lg border border-[#aa2ee2]/30 bg-[#aa2ee2]/5 p-3 text-sm text-white/90">
                  Tip: You can clear cookies in your browser settings. Blocking some types of cookies may impact your
                  experience on parts of the Service.
                </div>
                <div className="not-prose mt-6 text-right">
                  <a href="#top" className="text-sm text-white/70 hover:text-white">Back to top</a>
                </div>
              </article>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

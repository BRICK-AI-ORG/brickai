import React from "react";
import StatusCard from "@/components/StatusCard";

const COPY: Record<string, { title: string; message: React.ReactNode; copy: string }> = {
  "401": {
    title: "You need to sign in",
    message: "This page requires authentication. Please sign in to continue.",
    copy: "Error 401 (Unauthorized): Authentication is required to access this resource.",
  },
  "403": {
    title: "Access is restricted",
    message: "You don't have permission to view this page. If you think this is an error, contact your administrator.",
    copy: "Error 403 (Forbidden): Your account does not have permission to access this resource.",
  },
  "404": {
    title: "This page doesn't exist",
    message: "The link may be broken or the page has moved. Check the URL or go back to the homepage.",
    copy: "Error 404 (Not Found): The requested page/resource could not be found.",
  },
  "429": {
    title: "Too many requests",
    message: "You've hit our rate limits. Please slow down and try again shortly.",
    copy: "Error 429 (Too Many Requests): Rate limit exceeded. Please retry after a short wait.",
  },
  "500": {
    title: "We hit a snag",
    message: "An unexpected error occurred. You can try again or return to the homepage.",
    copy: "Error 500 (Internal Server Error): The server encountered an unexpected condition.",
  },
  "502": {
    title: "Bad gateway",
    message: "Upstream service returned an invalid response. Please try again.",
    copy: "Error 502 (Bad Gateway): An upstream service returned an invalid response.",
  },
  "503": {
    title: "Service unavailable",
    message: "We're temporarily down for maintenance or high load. Please try again later.",
    copy: "Error 503 (Service Unavailable): The service is temporarily unavailable (maintenance or high load).",
  },
  "504": {
    title: "Gateway timeout",
    message: "A request took too long to complete. Please retry in a moment.",
    copy: "Error 504 (Gateway Timeout): The upstream service took too long to respond.",
  },
};

export default function StatusPage({ params }: { params: { code: string } }) {
  const code = params.code;
  const content = COPY[code] ?? {
    title: "Unexpected status",
    message: "We encountered a status we didn't recognise. If this keeps happening, please contact support.",
    copy: "Unexpected status: An unrecognised status code was encountered.",
  } as const;

  return (
    <section className="py-20">
      <div className="mx-auto max-w-[900px] px-4 text-center">
        <div className="mb-6">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">Status {code}</h1>
          <p className="mt-3 text-muted-foreground">{"Here's what we can tell you."}</p>
        </div>
        <div className="mx-auto max-w-2xl text-left">
          <StatusCard
            code={code}
            title={content.title}
            message={content.message}
            copyText={content.copy}
            primary={{ label: "Back to Home", href: "/home" }}
            secondary={{ label: "View Solutions", href: "/solutions" }}
          />
        </div>
      </div>
    </section>
  );
}

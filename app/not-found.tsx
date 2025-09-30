import React from "react";
import StatusCard from "@/components/StatusCard";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-[900px] px-4 text-center">
        <div className="mb-6">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">Page not found</h1>
          <p className="mt-3 text-muted-foreground">We couldn&apos;t find the page you&apos;re looking for.</p>
        </div>
        <div className="mx-auto max-w-2xl text-left">
          <StatusCard
            code={404}
            title="This page doesn't exist"
            message={
              <>
                The link may be broken or the page may have been moved. Check the URL or return to the homepage.
              </>
            }
            copyText={"Error 404 (Not Found): The requested page/resource could not be found."}
            primary={{ label: "Back to Home", href: "/home" }}
            secondary={{ label: "View Solutions", href: "/solutions" }}
          />
        </div>
        <div className="mt-6">
          <Link href="/contact">
            <Button variant="ghost" className="text-white/80 hover:text-white">Need help? Contact us</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

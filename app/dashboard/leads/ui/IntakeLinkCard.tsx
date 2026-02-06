"use client";

import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";

export default function IntakeLinkCard({
  orgName,
  slug,
  brandColor,
}: {
  orgName: string;
  slug: string;
  brandColor: string;
}) {
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  const url = useMemo(() => {
    const base = process.env.NEXT_PUBLIC_APP_BASE_URL || "";
    return base ? `${base}/i/${slug}` : `/i/${slug}`;
  }, [slug]);

  const absoluteUrl = useMemo(() => {
    if (url.startsWith("http")) return url;
    if (typeof window === "undefined") return url;
    return `${window.location.origin}${url}`;
  }, [url]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const dataUrl = await QRCode.toDataURL(absoluteUrl, {
          margin: 1,
          width: 180,
        });
        if (!cancelled) setQrDataUrl(dataUrl);
      } catch {
        // ignore
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [absoluteUrl]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(absoluteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  }

  return (
    <div className="rounded-lg border border-neutral-200 p-6">
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: brandColor }} />
            <p className="text-sm font-medium">{orgName} intake link</p>
          </div>

          <p className="mt-1 text-sm text-neutral-600">
            Share this link with couples to collect inquiries automatically.
          </p>

          <div className="mt-4 flex items-center gap-2">
            <input
              readOnly
              value={absoluteUrl}
              className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={copy}
              className="rounded-md border border-neutral-200 px-3 py-2 text-sm hover:bg-neutral-50"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>

          <p className="mt-2 text-xs text-neutral-500">
            Tip: add it to your Instagram bio, email signature, or proposals.
          </p>

          <div className="mt-4 flex gap-2">
            <a
              href={absoluteUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-md border border-black bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              Preview
            </a>
          </div>
        </div>

        {/* QR */}
        <div className="shrink-0">
          <div className="rounded-lg border border-neutral-200 p-3">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="Intake link QR code"
                className="h-[180px] w-[180px]"
              />
            ) : (
              <div className="flex h-[180px] w-[180px] items-center justify-center text-xs text-neutral-500">
                Generating QR…
              </div>
            )}
          </div>
          <p className="mt-2 text-center text-xs text-neutral-500">Scan to open</p>
        </div>
      </div>
    </div>
  );
}

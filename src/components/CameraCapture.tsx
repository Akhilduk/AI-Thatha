"use client";

import { useEffect, useRef, useState } from "react";

interface CameraCaptureProps {
  enabled: boolean;
  onCapture: (dataUrl: string | null) => void;
}

export function CameraCapture({ enabled, onCapture }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [active, setActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!enabled) {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      setActive(false);
      setError("");
    }
  }, [enabled]);

  const startCamera = async () => {
    if (!enabled || typeof navigator === "undefined") return;
    if (!window.isSecureContext) {
      setError("Camera requires HTTPS or localhost.");
      return;
    }
    try {
      setLoading(true);
      setError("");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 360 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setActive(true);
    } catch {
      setError("Unable to access camera. Please allow permission and retry.");
      setActive(false);
    } finally {
      setLoading(false);
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setActive(false);
  };

  const capture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const vw = videoRef.current.videoWidth;
    const vh = videoRef.current.videoHeight;
    if (!vw || !vh) {
      setError("Camera frame not ready yet.");
      return;
    }
    canvas.width = vw;
    canvas.height = vh;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0, vw, vh);
    onCapture(canvas.toDataURL("image/png"));
  };

  if (!enabled) return null;

  return (
    <div className="rounded-xl border border-white/20 bg-black/35 p-3">
      <video ref={videoRef} autoPlay muted playsInline className="h-36 w-full rounded-lg object-cover" />
      <canvas ref={canvasRef} className="hidden" />
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {!active ? (
          <button
            type="button"
            onClick={startCamera}
            disabled={loading}
            className="rounded-md bg-amber-500 px-3 py-1.5 text-sm font-semibold text-black disabled:opacity-50"
          >
            {loading ? "Starting..." : "Start Camera"}
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={capture}
              className="rounded-md bg-amber-500 px-3 py-1.5 text-sm font-semibold text-black"
            >
              Capture Photo
            </button>
            <button
              type="button"
              onClick={stopCamera}
              className="rounded-md border border-white/30 px-3 py-1.5 text-sm text-amber-100"
            >
              Stop
            </button>
          </>
        )}
        {error ? <span className="text-xs text-rose-300">{error}</span> : null}
      </div>
    </div>
  );
}

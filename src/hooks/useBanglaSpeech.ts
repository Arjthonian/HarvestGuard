"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type RecognitionInstance = SpeechRecognition | null;

export type SpeechStatus = "idle" | "listening" | "error";

export function useBanglaSpeech() {
  const [supported, setSupported] = useState(false);
  const [status, setStatus] = useState<SpeechStatus>("idle");
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<RecognitionInstance>(null);
  const resultCallbackRef = useRef<((value: string) => void) | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const SpeechRecognitionClass =
      window.SpeechRecognition || (window as typeof window & { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setSupported(false);
      return;
    }

    const recognition = new SpeechRecognitionClass();
    recognition.lang = "bn-BD";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const value = event.results?.[0]?.[0]?.transcript?.trim() ?? "";
      setTranscript(value);
      resultCallbackRef.current?.(value);
    };

    recognition.onerror = (event) => {
      setStatus("error");
      setError(event.error);
    };

    recognition.onend = () => {
      setStatus("idle");
    };

    recognitionRef.current = recognition;
    setSupported(true);

    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
  }, []);

  const startListening = useCallback((onResult?: (value: string) => void) => {
    if (!supported || !recognitionRef.current) {
      setError("Speech recognition not supported");
      return;
    }
    resultCallbackRef.current = onResult ?? null;
    setTranscript("");
    setError(null);
    recognitionRef.current.start();
    setStatus("listening");
  }, [supported]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setStatus("idle");
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript("");
  }, []);

  return {
    supported,
    status,
    transcript,
    error,
    startListening,
    stopListening,
    resetTranscript,
  };
}


import { useState, useRef, useCallback, useEffect } from 'react';
import type { AudioData } from '../types';

export const useAudioSystem = () => {
  const [audioFile, setAudioFile] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(70);
  const [audioError, setAudioError] = useState('');

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  const setupAudio = useCallback((audio: HTMLAudioElement, fileName: string) => {
    audio.volume = volume / 100;
    audioElementRef.current = audio;
    setAudioFile(fileName);
    setAudioError('');

    audio.addEventListener('loadedmetadata', () => {
      setDuration(audio.duration);
    });

    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime);
    });

    audio.addEventListener('ended', () => {
      setIsPlaying(false);
    });

    // Setup Web Audio API
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }

    if (!sourceNodeRef.current && audioContextRef.current) {
      const source = audioContextRef.current.createMediaElementSource(audio);
      const analyser = audioContextRef.current.createAnalyser();
      analyser.fftSize = 512;

      source.connect(analyser);
      analyser.connect(audioContextRef.current.destination);

      analyserRef.current = analyser;
      sourceNodeRef.current = source;
      dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);
    }
  }, [volume]);

  const loadAudioFile = useCallback((file: File) => {
    try {
      const url = URL.createObjectURL(file);

      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current = null;
      }

      const audio = new Audio(url);
      setupAudio(audio, file.name);

    } catch (error) {
      setAudioError('Failed to load audio file');
      console.error('Audio loading error:', error);
    }
  }, [setupAudio]);

  const loadPresetAudio = useCallback((url: string, fileName: string) => {
    try {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current = null;
      }

      const audio = new Audio(url);
      setupAudio(audio, fileName);

    } catch (error) {
      setAudioError('Failed to load preset audio');
      console.error('Preset audio loading error:', error);
    }
  }, [setupAudio]);

  const togglePlayPause = useCallback(() => {
    if (!audioElementRef.current) return;

    if (isPlaying) {
      audioElementRef.current.pause();
      setIsPlaying(false);
    } else {
      audioElementRef.current.play();
      setIsPlaying(true);
    }
  }, [isPlaying]);

  const getAudioData = useCallback((): AudioData | null => {
    if (!analyserRef.current || !dataArrayRef.current || !isPlaying) {
      return null;
    }

    analyserRef.current.getByteFrequencyData(dataArrayRef.current as Uint8Array<ArrayBuffer>);
    const data = dataArrayRef.current;

    // Bass: 0-50, Mid: 50-150, High: 150-255
    const bass = Array.from(data.slice(0, 50)).reduce((a, b) => a + b, 0) / 50 / 255;
    const mid = Array.from(data.slice(50, 150)).reduce((a, b) => a + b, 0) / 100 / 255;
    const high = Array.from(data.slice(150, 255)).reduce((a, b) => a + b, 0) / 105 / 255;

    return { bass, mid, high };
  }, [isPlaying]);

  useEffect(() => {
    if (audioElementRef.current) {
      audioElementRef.current.volume = volume / 100;
    }
  }, [volume]);

  return {
    audioFile,
    isPlaying,
    currentTime,
    duration,
    volume,
    audioError,
    audioElementRef,
    audioContextRef,
    sourceNodeRef,
    setVolume,
    loadAudioFile,
    loadPresetAudio,
    togglePlayPause,
    getAudioData,
  };
};

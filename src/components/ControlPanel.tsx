import React from 'react';
import type { VisualParams, Theme } from '../types';

interface AudioSystemProps {
  isPlaying: boolean;
  audioFile: string | null;
  currentTime: number;
  duration: number;
  audioError: string;
  volume: number;
  setVolume: (volume: number) => void;
  loadAudioFile: (file: File) => void;
  togglePlayPause: () => void;
}

interface ControlPanelProps {
  themes: Theme[];
  currentTheme: string;
  setCurrentTheme: (theme: string) => void;
  params: VisualParams;
  setParams: (params: VisualParams) => void;
  audioSystem: AudioSystemProps;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  themes,
  currentTheme,
  setCurrentTheme,
  params,
  setParams,
  audioSystem
}) => {
  const handleParamChange = (key: keyof VisualParams, value: number | string) => {
    setParams({ ...params, [key]: value });
  };

  const oceanColorPresets = [
    { id: 'midnight', name: '🌙 Midnight Ocean' },
    { id: 'tropical', name: '🏝️ Tropical Paradise' },
    { id: 'sunset', name: '🌅 Sunset Glow' },
    { id: 'arctic', name: '🧊 Arctic Ice' },
    { id: 'emerald', name: '💎 Emerald Deep' },
  ];

  const mentalFocusColorPresets = [
    { id: 'electric', name: '⚡ Electric Blue' },
    { id: 'softPink', name: '🌸 Soft Pink' },
    { id: 'softGreen', name: '🍃 Soft Green' },
    { id: 'softYellow', name: '☀️ Soft Yellow' },
  ];

  const brainBoostColorPresets = [
    { id: 'electric', name: '⚡ Electric Purple' },
    { id: 'softPink', name: '🌸 Soft Pink' },
    { id: 'softGreen', name: '🍃 Soft Green' },
    { id: 'softYellow', name: '☀️ Soft Yellow' },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      audioSystem.loadAudioFile(file);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="control-panel">
      <h3>🎵 Audio</h3>

      <div className="control-group">
        <label className="file-upload-btn">
          📁 Upload Audio
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
        </label>

        {audioSystem.audioFile && (
          <>
            <button
              onClick={audioSystem.togglePlayPause}
              className="audio-play-btn"
            >
              {audioSystem.isPlaying ? '⏸ Pause' : '▶ Play'}
            </button>
            <div className="audio-info">
              <span className="audio-filename">{audioSystem.audioFile}</span>
              <span>
                {formatTime(audioSystem.currentTime)} / {formatTime(audioSystem.duration)}
              </span>
            </div>
          </>
        )}

        {audioSystem.audioError && (
          <div className="audio-error">❌ {audioSystem.audioError}</div>
        )}
      </div>

      <div className="control-group">
        <label>Volume: {audioSystem.volume}%</label>
        <input
          type="range"
          min="0"
          max="100"
          value={audioSystem.volume}
          onChange={(e) => audioSystem.setVolume(parseInt(e.target.value))}
        />
      </div>

      <h3>🎨 Visual</h3>

      <div className="control-group">
        <label>Theme</label>
        <select
          value={currentTheme}
          onChange={(e) => setCurrentTheme(e.target.value)}
        >
          {themes.map(theme => (
            <option key={theme.id} value={theme.id}>
              {theme.name}
            </option>
          ))}
        </select>
      </div>

      <div className="control-group">
        <label>Speed: {params.speed.toFixed(1)}x</label>
        <input
          type="range"
          min="0.1"
          max="3"
          step="0.1"
          value={params.speed}
          onChange={(e) => handleParamChange('speed', parseFloat(e.target.value))}
        />
      </div>

      <div className="control-group">
        <label>Density: {params.density.toFixed(1)}</label>
        <input
          type="range"
          min="0.1"
          max="1"
          step="0.1"
          value={params.density}
          onChange={(e) => handleParamChange('density', parseFloat(e.target.value))}
        />
      </div>

      <div className="control-group">
        <label>Audio Reactivity: {params.audioReactivity.toFixed(1)}</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={params.audioReactivity}
          onChange={(e) => handleParamChange('audioReactivity', parseFloat(e.target.value))}
        />
      </div>

      {currentTheme === 'ocean' && (
        <div className="control-group">
          <label>Ocean Color</label>
          <select
            value={params.colorPreset || 'midnight'}
            onChange={(e) => handleParamChange('colorPreset', e.target.value)}
          >
            {oceanColorPresets.map(preset => (
              <option key={preset.id} value={preset.id}>
                {preset.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {currentTheme === 'mentalfocus' && (
        <div className="control-group">
          <label>Mental Focus Color</label>
          <select
            value={params.colorPreset || 'electric'}
            onChange={(e) => handleParamChange('colorPreset', e.target.value)}
          >
            {mentalFocusColorPresets.map(preset => (
              <option key={preset.id} value={preset.id}>
                {preset.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {currentTheme === 'brainboost' && (
        <div className="control-group">
          <label>Brain Boost Color</label>
          <select
            value={params.colorPreset || 'electric'}
            onChange={(e) => handleParamChange('colorPreset', e.target.value)}
          >
            {brainBoostColorPresets.map(preset => (
              <option key={preset.id} value={preset.id}>
                {preset.name}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

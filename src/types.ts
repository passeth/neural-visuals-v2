export interface AudioData {
  bass: number;
  mid: number;
  high: number;
}

export interface VisualParams {
  speed: number;
  density: number;
  audioReactivity: number;
  colorPreset?: string;
}

export interface Theme {
  id: string;
  name: string;
  description: string;
}

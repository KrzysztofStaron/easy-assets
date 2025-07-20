export interface ImageItem {
  id: string;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number;
  rotation: number;
  img: HTMLImageElement;
}

export interface ContextMenu {
  visible: boolean;
  x: number;
  y: number;
  imageId: string | null;
}

export interface TransformHandle {
  type: "scale" | "rotate";
  x: number;
  y: number;
  size: number;
}

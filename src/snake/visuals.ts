export const hsvToRgb = (
  h: number,
  s: number,
  v: number,
): [number, number, number] => {
  let r = 1,
    g = 1,
    b = 1;
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  switch (i % 6) {
    case 0:
      r = v;
      g = t;
      b = p;
      break;
    case 1:
      r = q;
      g = v;
      b = p;
      break;
    case 2:
      r = p;
      g = v;
      b = t;
      break;
    case 3:
      r = p;
      g = q;
      b = v;
      break;
    case 4:
      r = t;
      g = p;
      b = v;
      break;
    case 5:
      r = v;
      g = p;
      b = q;
      break;
  }

  return [r * 255, g * 255, b * 255];
};

export const updateColor = (
  index: number,
  total: number,
  step: number,
): [number, number, number] => {
  const hue = index / total;
  const brightness = (1 + 0.5 * Math.sin((step + index) / 2.5)) / 1.5;
  const saturation = 0.85 + 0.05 * Math.sin((5 * step + index) / 2.5);
  let [r, g, b] = hsvToRgb(hue, saturation, brightness);

  const metallicFactor = 0.5;
  r = r * (1 - metallicFactor) + metallicFactor * 255;
  g = g * (1 - metallicFactor) + metallicFactor * 255;
  b = b * (1 - metallicFactor) + metallicFactor * 255;

  return [Math.floor(r), Math.floor(g), Math.floor(b)];
};

export const styleEyes = (direction: string) => {
  const eyeOffset = 25;
  const eyeStyle = {
    width: "20%",
    height: "20%",
    backgroundColor: "black",
    position: "absolute",
    borderRadius: "50%",
  };

  let eye1Style = {};
  let eye2Style = {};

  switch (direction) {
    case "UP":
      eye1Style = {
        ...eyeStyle,
        top: `${eyeOffset}%`,
        left: `${eyeOffset}%`,
      };
      eye2Style = {
        ...eyeStyle,
        top: `${eyeOffset}%`,
        right: `${eyeOffset}%`,
      };
      break;
    case "DOWN":
      eye1Style = {
        ...eyeStyle,
        bottom: `${eyeOffset}%`,
        left: `${eyeOffset}%`,
      };
      eye2Style = {
        ...eyeStyle,
        bottom: `${eyeOffset}%`,
        right: `${eyeOffset}%`,
      };
      break;
    case "LEFT":
      eye1Style = {
        ...eyeStyle,
        top: `${eyeOffset}%`,
        left: `${eyeOffset}%`,
      };
      eye2Style = {
        ...eyeStyle,
        bottom: `${eyeOffset}%`,
        left: `${eyeOffset}%`,
      };
      break;
    case "RIGHT":
      eye1Style = {
        ...eyeStyle,
        top: `${eyeOffset}%`,
        right: `${eyeOffset}%`,
      };
      eye2Style = {
        ...eyeStyle,
        bottom: `${eyeOffset}%`,
        right: `${eyeOffset}%`,
      };
      break;
  }

  return { eye1Style, eye2Style };
};

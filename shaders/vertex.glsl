uniform float uTime;
uniform float uProgress;
uniform vec2 uResolution;
uniform vec2 uQuadSize;
uniform vec4 uCorners;

varying vec2 vUv;
varying vec2 vSize;

void main() {
  float PI = 3.1415926;
  float sine = sin(PI * uProgress);
  float waves = sine * 0.1 * sin(5.0 * length(uv) + 15.0 * uProgress);
  vec4 defaultState = modelMatrix * vec4(position, 1.0);
  vec4 fullScreenState = vec4(position, 1.0);
  fullScreenState.x *= uResolution.x / uQuadSize.x;
  fullScreenState.y *= uResolution.y / uQuadSize.y;
  float cornersProgress = mix(mix(uCorners.z, uCorners.w, uv.x), mix(uCorners.x, uCorners.y, uv.x), uv.y);

  vec4 finalState = mix(defaultState, fullScreenState, uProgress + waves);

  gl_Position = projectionMatrix * viewMatrix * finalState;

  vUv = uv;
  vSize = mix(uQuadSize, uResolution, uProgress);
}
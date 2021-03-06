import { Vector3, Color } from 'three';

const dotGridSizeX = '4.001';
const dotGridSizeY = '4.0';
const dotGridThreshold = '6.0';

export default {
  uniforms: {
    uDirLightPos: { value: new Vector3() },
    uDirLightColor: { value: new Color(0xeeeeee) },

    uAmbientLightColor: { value: new Color(0x050505) },

    uBaseColor: { value: new Color(0xffffff) },
    uLineColor1: { value: new Color(0xa0a0a0) },
    uLineColor2: { value: new Color(0x0000a0) },
  },

  vertexShader: [
    'varying vec3 vNormal;',

    'void main() {',

    '	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
    '	vNormal = normalize( normalMatrix * normal );',

    '}',
  ].join('\n'),

  fragmentShader: `
    uniform vec3 uBaseColor;
    uniform vec3 uLineColor1;
    uniform vec3 uLineColor2;
    uniform vec3 uLineColor3;
    uniform vec3 uLineColor4;

    uniform vec3 uDirLightPos;
    uniform vec3 uDirLightColor;

    uniform vec3 uAmbientLightColor;

    varying vec3 vNormal;

    void main() {
      float directionalLightWeighting = max( dot( normalize(vNormal), uDirLightPos ), 0.0);
      vec3 lightWeighting = uAmbientLightColor + uDirLightColor * directionalLightWeighting * directionalLightWeighting;

      gl_FragColor = vec4( uBaseColor, 1.0 );

      if ( length(lightWeighting) < 1.00 ) {
        if ( ( mod(gl_FragCoord.x, ${dotGridSizeX}) + mod(gl_FragCoord.y, ${dotGridSizeY}) ) > ${dotGridThreshold} ) {
          gl_FragColor = vec4( uLineColor1, 1.0 );
        }
      }

      if ( length(lightWeighting) < 0.75 ) {
        if ( ( mod(gl_FragCoord.x + 2.0, ${dotGridSizeX}) + mod(gl_FragCoord.y + 2.0, ${dotGridSizeY}) ) > ${dotGridThreshold} ) {
          gl_FragColor = vec4( uLineColor2, 1.0 );
        }
      }

      if ( length(lightWeighting) < 0.5 ) {
        if ( ( mod(gl_FragCoord.x - 2.0, ${dotGridSizeX}) + mod(gl_FragCoord.y - 2.0, ${dotGridSizeY}) ) > ${dotGridThreshold} ) {
          gl_FragColor = vec4( uLineColor3, 1.0 );
        }
      }

      if ( length(lightWeighting) < 0.25 ) {
        if ( ( mod(gl_FragCoord.x, ${dotGridSizeX}) + mod(gl_FragCoord.y, ${dotGridSizeY}) ) > ${dotGridThreshold} ) {
          gl_FragColor = vec4( uLineColor4, 1.0 );
        }
      }
    }
    `,
};

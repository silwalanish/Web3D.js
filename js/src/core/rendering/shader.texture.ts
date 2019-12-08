import { ShaderSource } from './shader';
import DefaultShader from './shader.default';
import { Texture } from '../utils/texture.utils';

const TEXTURE_SHADER_SOURCE: ShaderSource = {
  vertex: `
    precision highp float;
    attribute vec4 aVertexPosition;
    attribute vec2 aVertexUV;

    uniform mat4 uViewMatrix;
    uniform mat4 uModelMatrix;
    uniform mat4 uProjectionMatrix;

    varying vec2 vUV;

    void main() {
      gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * aVertexPosition;
      vUV = aVertexUV;
    }
  `,
  fragment: `
    precision highp float;
    varying vec2 vUV;

    uniform sampler2D uTex;

    void main() {
      vec4 texColor = texture2D(uTex, vUV);
      gl_FragColor = texColor;
    }
  `
};

export default class TextureShader extends DefaultShader {
  private readonly vertexUVLoc: GLuint | null;

  private readonly texLoc: WebGLUniformLocation | null;

  public constructor(gl: WebGLRenderingContext, shaderSource?: ShaderSource) {
    super(gl, shaderSource || TEXTURE_SHADER_SOURCE);

    this.vertexUVLoc = this.getAttribLocation(gl, 'aVertexUV');
    this.texLoc = this.getUniformLocation(gl, 'uTex');
  }

  public enableVertexUVPosition(
    gl: WebGLRenderingContext,
    components: number,
    type: number,
    normalize: boolean,
    stride: number,
    offset: number
  ): void {
    if (this.vertexUVLoc != null) {
      gl.vertexAttribPointer(this.vertexUVLoc, components, type, normalize, stride, offset);
      gl.enableVertexAttribArray(this.vertexUVLoc);
    }
  }

  public setTexture(gl: WebGLRenderingContext, tex: Texture, texPos?: number): void {
    gl.activeTexture(gl.TEXTURE0 + (texPos || 0));
    gl.bindTexture(gl.TEXTURE_2D, tex);

    this.setUniform1i(gl, this.texLoc, texPos || 0);
  }
}
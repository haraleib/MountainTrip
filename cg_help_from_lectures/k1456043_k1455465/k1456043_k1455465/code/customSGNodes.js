/**
 * Created by Flo on 16.06.2016.
 */

/**
 * Scengraph node for the spotlight
 */
class SpotLightSGNode extends LightSGNode {
  constructor(position,angle,dir, children) {
    super(children);
    this.position = position || [0, 0, 0];
    this.ambient = [0, 0, 0, 1];
    this.diffuse = [1, 1, 1, 1];
    this.specular = [1, 1, 1, 1];

    //uniform name
    this.uniform = 'u_light';
    this.angle=angle;       //cutoff angle for the spotlight
    this.dir=dir;           //direction of the spotlight
    this.disableSpot=false; //on/off "button" for spotlight

    this._worldPosition = null;
  }


  render(context) {
    this.computeLightPosition(context);
    this.setLight(context);

    //set the uniforms for the spotlight
    gl.uniform1f(gl.getUniformLocation(context.shader, this.uniform+'.angle'), this.angle);
    gl.uniform3f(gl.getUniformLocation(context.shader, this.uniform+'.direction'), this.dir[0], this.dir[1], this.dir[2]);

    gl.uniform3f(gl.getUniformLocation(context.shader, this.uniform+'.position'), this.position[0],this.position[1],this.position[2]);
    gl.uniform1i(gl.getUniformLocation(context.shader, 'u_spotLight'), 1);

    if(this.disableSpot) {
      gl.uniform1i(gl.getUniformLocation(context.shader, 'u_disableSpot'), 1);
    } else {
      gl.uniform1i(gl.getUniformLocation(context.shader, 'u_disableSpot'), 0);
    }

    //render children
    super.render(context);


  }
}

/**
 *  custom texture node which sets a flag to activate a texture
 */
class CustomTexSGNode extends SGNode {

  render(context) {
    gl.uniform1i(gl.getUniformLocation(context.shader, 'u_enableObjectTexture'), 1);
    super.render(context);
    gl.uniform1i(gl.getUniformLocation(context.shader, 'u_enableObjectTexture'), 0);
  }
}


/**
 * Scenegraph node for texture alpha blending
 */
class AlphaSGNode extends SGNode {
  constructor(image,imageAlpha, children ) {
    super(children);

    this.image = image;
    this.imageAlpha=imageAlpha;
    this.textureunit = 0;
    this.uniform='u_tex';
    this.uniformAlpha = 'u_alphaTex';
    this.textureId = -1;
    this.textureIdAlpha=-1;
  }
  init(gl) {

    //set the normal texture without an alpha value
    this.textureId = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.textureId);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0,  gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.image);


    //set the texture with the alpha values
    this.textureIdAlpha = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.textureIdAlpha);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0,  gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.imageAlpha);

    gl.bindTexture(gl.TEXTURE_2D, null);


  }

  render(context) {
    if (this.textureId < 0||this.textureIdAlpha<0) {
      this.init(context.gl);
    }


    //activate blending and set a blend function
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);


    //set unfiforms
    gl.uniform1i(gl.getUniformLocation(context.shader, 'u_enableAlpha'), 1);
    gl.uniform1f(gl.getUniformLocation(context.shader, 'u_alpha'), 0.75);
    gl.uniform1i(gl.getUniformLocation(context.shader, this.uniform), 0);
    //activate and bind texture
    gl.activeTexture(gl.TEXTURE0 + 0);
    gl.bindTexture(gl.TEXTURE_2D, this.textureId);

    //set additional shader parameters
    gl.uniform1i(gl.getUniformLocation(context.shader, this.uniformAlpha), 1);

    //activate and bind texture
    gl.activeTexture(gl.TEXTURE0 + 1);
    gl.bindTexture(gl.TEXTURE_2D, this.textureIdAlpha);



    //render children
    super.render(context);

    //disable the alpha texture and blending
    gl.uniform1i(gl.getUniformLocation(context.shader, 'u_enableAlpha'), 0);
    gl.disable(gl.BLEND);

    //clean up the first texture unit
    gl.activeTexture(gl.TEXTURE0 + 0);
    gl.bindTexture(gl.TEXTURE_2D, null);
    //clean up the second texture unit
    gl.activeTexture(gl.TEXTURE0 + 1);
    gl.bindTexture(gl.TEXTURE_2D, null);

  }
}

class EnvironmentSGNode extends SGNode {

  constructor(envtexture, textureunit, children) {
    super(children);
    this.envtexture = envtexture;
    this.textureunit = textureunit;
  }

  render(context)
  {
    let invView3x3 = mat3.fromMat4(mat3.create(), context.invViewMatrix);
    gl.uniformMatrix3fv(gl.getUniformLocation(context.shader, 'u_invView'), false, invView3x3);
    gl.uniform1i(gl.getUniformLocation(context.shader, 'u_texCube'), this.textureunit);

    gl.activeTexture(gl.TEXTURE0 + this.textureunit);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.envtexture);

    super.render(context);

    gl.activeTexture(gl.TEXTURE0 + this.textureunit);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
  }
}

class BlendTextureSGNode extends SGNode {
  constructor(texture, textureunit, alpha, children ) {
    super(children);
    this.texture = texture;
    this.textureunit = textureunit;
    this.alpha = alpha;
  }

  render(context)
  {
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.BLEND);

    let invView3x3 = mat3.fromMat4(mat3.create(), context.invViewMatrix);
    gl.uniformMatrix3fv(gl.getUniformLocation(context.shader, 'u_invView'), false, invView3x3);
    gl.uniform1f(gl.getUniformLocation(context.shader, 'uAlpha'), this.alpha);

    gl.uniform1i(gl.getUniformLocation(context.shader, 'u_tex'), this.textureunit);

    gl.activeTexture(gl.TEXTURE0 + this.textureunit);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);

    super.render(context);

    gl.activeTexture(gl.TEXTURE0 + this.textureunit);
    gl.bindTexture(gl.TEXTURE_2D, null);

    gl.disable(gl.BLEND);
  }
}

class WaterSGNode extends BlendTextureSGNode {
  constructor(reflectionTexture, reflTextureUnit, dudvMapTexture, dudvMapTextureUnit, alpha, children ) {
    super(reflectionTexture, reflTextureUnit, alpha, children);
    this.dudvMapTexture = dudvMapTexture;
    this.dudvMapTextureUnit = dudvMapTextureUnit;
  }

  render(context)
  {
    gl.uniform1i(gl.getUniformLocation(context.shader, 'u_texDUDV'), this.dudvMapTextureUnit);
    gl.uniform1f(gl.getUniformLocation(context.shader, 'u_moveFactor'), moveFactor);


    gl.activeTexture(gl.TEXTURE0 + this.dudvMapTextureUnit);
    gl.bindTexture(gl.TEXTURE_2D, this.dudvMapTexture);

    super.render(context);

    gl.activeTexture(gl.TEXTURE0 + this.dudvMapTextureUnit);
    gl.bindTexture(gl.TEXTURE_2D, null);
  }
}



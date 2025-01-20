---
layout: page
title: Procedural Terrain Generation
description: Real-time Procedural Multifractal Terrain Generation, developed in C++/OpenGL, that generates infinite multifractal terrains using Fractal Brownian Motion and Perlin Noise. Features Physically-Based Rendering (PBR), Image-Based Lighting (IBL), HDR skybox and Volumetric Fog Rendering.
img: assets/img/ptg2.png
importance: 3
category:
---

***

<span style="color:red; font-size:16px;"><a href="https://github.com/AmrHMorsy/Procedural-Terrain-Generation-OpenGL"><b>Project Github Link</b></a></span>

***

<br>

# **Procedural Terrain Generation**
***

Real-time Procedural Multifractal Terrain Generation developed in C++ and OpenGL, capable of generating infinite terrains using multifractal models based on **Fractal Brownian Motion** and **Perlin Noise**. It incorporates Physically-Based Rendering (PBR), image-based lighting (IBL), an HDR skybox, and volumetric fog rendering. 

<div class="row mt-3">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.html loading="eager" path="assets/img/ptg.png" class="img-fluid rounded z-depth-1" %}
    </div>
</div>

<br>

## **Features**
***

### **Noise**

The base noise function used is perlin noise. This function is used within a domain-warped Fractal Brownian Motion function (fBM) with multiple octaves to simulate and approximate the geomorphological and jagged features of the terrains that are caused by erosion and tectonics. However, the original version of the fBM function generates only homogeneous terrains. These terrains are overly simplistic and unrealistic, since they assume that all patches of the terrain have the same roughness. 

Nature, however, is far more complex and irregular. Real landscapes are quite heterogeneous, which is why multifractal terrain models are used. These models approximate certain erosion features, without overly compromising the elegance and computational efficiency of the original fBm model. They generate terrains where low-lying areas tend to accumulate silt and become topographically smoother, while higher regions remain jagged due to ongoing erosive processes.

<div class="row mt-3">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.html loading="eager" path="assets/img/ptg2.png" class="img-fluid rounded z-depth-1" %}
    </div>
</div>

<br>

### **Shading**

The terrain's shading and colors are procedurally generated, without relying on pre-made texture assets.

<br>

#### **Albedo Color**

The terrain consists of three main elements: Rocks, grass and snow. Multi-layered noise functions generate the albedo colors for these elements by blending various color shades. The colors are interpolated together based on altitudes: Lower altitudes feature more grass, while higher altitudes transition to snow. Noise-based functions further enhance the realism by adding dark streaks to simulate terrain cracks. This color data is precomputed during program initialization and stored in a texture for real-time sampling during rendering.

<br>

#### **Normal**

The normal vector at a point in the terrain is computed using the first derivative of the height function. This derivative determines the slope of the terrain, representing changes in height, and is used to compute the normal vector at each point. The derivative is analytically precomputed within the noise function and stored alongside the height data in a texture for efficient real-time sampling during rendering.

<br>

#### **Roughness**

Roughness is a measure of how smooth the surface of the terrain is and is essential for computing Physically Based Rendering (PBR) and Image-Based Lighting (IBL) functions. It is estimated using the first derivative of the height function, which represents the terrain's slope and variability, and is stored alongside the height and normal data in the baked texture. 

<br>

#### **Ambient Occlusion** 

Ambient occlusion quantifies how much ambient light is blocked at a given point on the terrain. It is approxmiated using the second derivative of the height function, which represents the terrain's curvature or slope variation, and is essential for computing Image-Based Lighting (IBL) functions. The derivative is analytically precomputed within the noise function and stored in a texture for efficient real-time sampling during rendering.

<div class="row mt-3">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.html loading="eager" path="assets/img/ptg3.png" class="img-fluid rounded z-depth-1" %}
    </div>
</div>

<br>

### **Volumetric Fog**

This technique simulates fog by estimating the density of the fog particles in the regions of space visibile to the camera and then uses raymarching to calculate the amount of light that reaches the camera after the physical interaction of the fog particles with the incoming light. Noise-based functions were used to estimate the fog color, the fog density, the scattering coefficient and the asymmetry parameter (g) of the Henyey-Greenstein phase function, which is a mathematical model used to describe the scattering of light in mediums such as fog, clouds and water. 

<div class="row mt-3">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.html loading="eager" path="assets/img/ptg8.png" class="img-fluid rounded z-depth-1" %}
    </div>
</div>

<br>

### **Infinite Terrains**

As the camera moves in any of the XZ directions, more unique terrains are generated, giving the illusion of infinite terrains. It works by translating terrain patches that are behind the camera to the front and recalculating the noise to generate new unique height maps. This trick simulates infinite terrains, but keeps the total number of terrain patches constant. 

<div class="row mt-3">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.html loading="eager" path="assets/img/ptg7.png" class="img-fluid rounded z-depth-1" %}
    </div>
</div>

<br>

## **Optimizations**

***

<br>

### **Frustum Culling**

Frustum culling is used to optimize performance by rendering only the terrain patches that are inside the view frustum of the camera. The terrain patches that are outside the camera's field of view are not rendered, reducing processing load and saving the computation that would have been otherwise wasted in noise computation and terrain shading; thus improving the FPS. 

<div class="row mt-3">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.html loading="eager" path="assets/img/ptg4.png" class="img-fluid rounded z-depth-1" %}
    </div>
</div>
<br>

<br>

### **Baking Data**

Computing noise-based height, ambient occlusion, normal, roughness and albedo every frame would be inefficient, since these data do not change from frame to frame and do not depend on external dynamic parameters such as camera position. Therefore, these data can be precomputed or baked into textures only once during the program initialization, and then are sampled from in real-time during rendering. This optimization alone significantly improved the FPS. 

<div class="row mt-3">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.html loading="eager" path="assets/img/ptg9.png" class="img-fluid rounded z-depth-1" %}
    </div>
</div>

<br>

*** 

## **References**
<br>

- Ebert, D. S., Musgrave, F. K., Peachey, D., Perlin, K., & Worley, S. (2003). *Texturing and Modeling: A Procedural Approach (3rd ed.)*. Chapter 14: A Brief Introduction to Fractals. Morgan Kaufmann Publishers.
  
- Ebert, D. S., Musgrave, F. K., Peachey, D., Perlin, K., & Worley, S. (2003). *Texturing and Modeling: A Procedural Approach (3rd ed.)*. Chapter 16: Procedural Fractals Terrains. Morgan Kaufmann Publishers.

- Scratchpixel. [Perlin Noise](https://www.scratchapixel.com/lessons/procedural-generation-virtual-worlds/perlin-noise-part-2/perlin-noise.html)

- Perlin, K. (2002). Improving Noise.

*** 

<br>

---
layout: post
title: Light Culling in Vulkan
date: 2026-07-13 09:00:00
description:
tags:
categories:
thumbnail: assets/img/Blog/LightCulling/
featured: false
---

<br>

<blockquote>
<h3><b>Contents</b></h3>
<br>
<ul>
    <li><a href="#introduction">Introduction</a></li>
    <li><a href="#TiledLightCullingAlgorithm">Naive Tiled Light Culling Algorithm</a></li>
    <li><a href="#LightBoundingSphere">Light Bounding Sphere</a></li>
    <li><a href="#TileFrustum">Tile Frustum</a></li>
    <ul>
        <li><a href="#DerivingEquationforLeftPlane">Deriving Equation for Left Plane</a></li>
        <li><a href="#DerivingEquationforRightPlane">Deriving Equation for Right Plane</a></li>
        <li><a href="#DerivingEquationforBottomPlane">Deriving Equation for Bottom Plane</a></li>
        <li><a href="#DerivingEquationforTopPlane">Deriving Equation for Top Plane</a></li>
        <li><a href="#PointInsideFrustum">Point-Frustum Test</a></li>
        <li><a href="#TileFrustumNearFarPlane">Tile Frustum’s Near and Far Plane</a></li>
        <li><a href="#TileMinMaxDepthParallelAlgorithm">Parallel Min-Max Depth Reduction</a></li>
        <li><a href="#LinearizingDepth">Linearizing Depth</a></li>
    </ul>
    <li><a href="#FrustumLightIntersection">Frustum-Sphere Intersection Test</a></li>
    <li><a href="#25DCullingAlgorithm">2.5D Light Culling Algorithm</a></li>
    <li><a href="#stochasticLightCulling">Stochastic Light Culling</a></li>
    <ul>
        <li><a href="#problem">Problem Statement</a></li>
        <li><a href="#stochastic">Stochastic Fall-off Function</a></li>
        <li><a href="#probability">Probability Function</a></li>
        <li><a href="#radius">Light Influence Range</a></li>
        <li><a href="#variance">Variance Control</a></li>
        <li><a href="#alpha">Constructing Equation for \(\alpha_i\)</a></li>
    </ul>
    <li><a href="#Demo">Demo</a></li>
    <li><a href="#References">References</a></li>
</ul>
</blockquote>
<br>
<hr>
<br>
<h3 id="introduction"><b>Introduction</b></h3>
<br>

Consider a scene with $$N$$ light sources: $$L_0$$, $$L_1$$, ..., $$L_{N-1}$$. Let $$x$$ be a shading point, and $$\hat{w}$$ be the view direction. The radiance $$L(x, \hat{w})$$ is defined as follows

$$
L(x, \hat{w}) = \sum_{i=0}^{N-1} I_i(-\hat{w}_{i}^{\prime}) \; f(\lVert x_i - x \rVert) \; V(x, x_i) \; ρ(x, \hat{w}, \hat{w}_{i}^{\prime}) \; max(\hat{w}_{i}^{\prime} \cdot \hat{n}, 0)
\tag{1}
$$

where: 

- $$x_i$$ is the position of the light $$L_i$$
- $$\hat{n}$$ is the surface normal at $$x$$
- $$\lVert x_i - x \rVert$$ is the distance between $$x_i$$ and $$x$$
- $$I_i(-\hat{w}_{i}^{\prime})$$ is the radiant intensity of $$L_i$$
- $$ρ(x, \hat{w}, \hat{w}_{i}^{\prime})$$ is the bidirectional reflectance distribution function (BRDF)
- $$V(x, x_i)$$ is the visibility between $$x$$ and $$x_i$$ to represent shadow. It is a measure of how occluded $$x$$ is from the light sources. 
- $$f(\lVert x_i - x \rVert)$$ is the fall-off function. It measures the attenuation of the light as it travels away from the light source. In other words, it models how the contribution of the light source decreases, as the distance between the shading point and the light increases.
- $$\hat{w}_{i}^{\prime}$$ is the direction of the light $$L_i$$, where

$$
\hat{w}_{i}^{\prime} = \frac{x_i - x}{\lVert x_i - x \rVert}
$$

<div class="row align-items-center mt-3">
<div class="col-md-5">
<br>

<br>

During rasterization, the triangles in the scene are converted into fragments. Assuming that lighting is supported, the fragment shader executes equation \(1\) for each of these fragments, in which it adds up the lighting contributions from all light sources in the scene, and accordingly computes the radiance at each shading point. All these fragments are then subjected to depth testing, and those that fail the test are discarded.

<br>
<br>

This is the typical rendering pipeline that exists in most real-time graphics applications. It is known as the <b>Forward Rendering Pipeline</b>. It can achieve interactive frame-rate for simple scenes with a few light sources. However, it does not scale well with the number of lights. That is, if \(N\) grows, the execution time of the fragment shader increases, and the pipeline will fail to maintain adequate frame-rate. Hence, the idea of light culling was introduced. 

<br>
<br>

<b>Light culling</b> is an optimization technique often used in rendering pipelines. The main idea behind this method is to simply reduce the number of light sources being evaluated for each shading point. Instead of evaluating \(N\) light sources, we evaluate only a subset of them. This is done by assuming a limited range of influence \(r_i\) for each light source \(L_i\). If a shading point falls outside that influence range, the light \(L_i\) is ignored when computing the radiance at \(x\).

</div>
<br>
<br>
<div class="col-md-7">
    <figure class="col-md-12 text-center theme-img repo-img-light">
        {% include figure.html  path="assets/img/Blog/LightCulling/Dark/vulkan_simplified_pipeline.svg" %}
        <figcaption>
        <br><a href="https://docs.vulkan.org/tutorial/latest/03_Drawing_a_triangle/02_Graphics_pipeline_basics/00_Introduction.html#"
             style="font-size: 14px; color:#ffffff;">
             Vulkan graphics pipeline
          </a>
        </figcaption>
    </figure>
    <figure class="col-md-12 text-center theme-img repo-img-dark">
        {% include figure.html  path="assets/img/Blog/LightCulling/Light/vulkan_simplified_pipeline.svg"%}
        <figcaption>
          <br><a href="https://docs.vulkan.org/tutorial/latest/03_Drawing_a_triangle/02_Graphics_pipeline_basics/00_Introduction.html#"
             style="font-size: 14px; color:#000000;">
             Vulkan graphics pipeline
          </a>
        </figcaption>
    </figure>
</div>
</div>

<div class="row align-items-center mt-3 justify-content-center text-center">
<div class="col-md-6">
<blockquote>
A high-level overview of the <b>light culling</b> algorithm is shown below. A more detailed explanation of the algorithm will be explained in the subsequent section.
<br>
<br>
<li>The screen is split into a 2D grid of tiles.</li>
<li>A frustum is constructed for each tile.</li>
<li>A bounding sphere is built for each light source. The center of the sphere is the light position, and the radius of the sphere is the influence range of the light.</li>
<li>Intersection is tested between all the light bounding spheres and all tile frustums.</li>
<li>If there is an intersection, the index of the light source is appended to the tile's private list of lights.</li> 
<li>Pixels within this tile will only evaluate the light sources whose indices are in this tile's list</li>
</blockquote>
<br>
<br>
<br>
</div>
<div class="col-md-6">
    <figure class="col-md-12 text-center theme-img repo-img-light">
        {% include figure.html  path="assets/img/Blog/LightCulling/Dark/Graph.png" class="scaled-img80"%}
        <figcaption>Graph of \(\frac{1}{d^2}\)</figcaption>
    </figure>
    <figure class="col-md-12 text-center theme-img repo-img-dark">
        {% include figure.html  path="assets/img/Blog/LightCulling/Light/Graph.png" class="scaled-img80"%}
        <figcaption>Graph of \(\frac{1}{d^2}\)</figcaption>
    </figure>
</div>
</div>

Although the assumption of a limited range of influence for each light source is physically inaccurate, imposing it should not affect the scene’s quality significantly, provided the range is chosen conservatively. The radiance contributions from distant light sources are relatively small due to <b>attenuation</b>. Culling them should not affect the rendering quality by a great deal, and, in return, it should save us some computational cost.

<br>

<h4 id="TiledLightCullingAlgorithm"><b>Naive Tiled Light Culling Algorithm</b></h4>
<br>

The <b>naive tiled light culling</b> algorithm is described as follows: 

<blockquote>
Let \(W \times H\) be the screen resolution, and \(S\) be the number of light sources in the scene. 
<br>
<br>

<ol>
<li>For each light source \(L_{k}\), create a bounding sphere \(B_{k}\)</li> 
<br>
<li>Dissect the screen into \(N_x \times N_y\) tiles \(T_{i, j}\) with equal resolution \(R_x \times R_y\), where 

$$
N_x = \lceil \frac{W}{R_x} \rceil
$$

$$
N_y = \lceil \frac{H}{R_y} \rceil
$$

</li> 
<li>For each tile \(T_{ij}\)</li>
<br>
    <ul><li>Compute its frustum \(F_{ij}\)</li></ul>
    <br>
    <ul><li>Initialize an array \(V_{ij}\) with size \(S\). This array will store the indices of light sources whose bounding sphere intersects the tile frustum \(F_{ij}\)</li></ul>
    <br>
    <ul><li>Initialize a variable \(C_{ij}\). This variable will store the <b>actual</b> count of light sources whose bounding sphere intersects the tile frustum \(F_{ij}\)</li></ul>
<br>
<li>Iterate through all the light sources \(L_{k}\) and test the intersection between the light bounding sphere \(B_{k}\) and each tile frustum \(F_{ij}\). If \(B_{k}\) intersects the frustum \(F_{ij}\), record \(k\) into \(V_{ij}\) and increment \(C_{ij}\) by \(1\).</li>
<br>
<li>In the fragment shader of the main shading pass:</li>
<br>
    <ul><li>Locate the tile \(T_{ij}\) that the fragment resides in, where 
    
    $$
    i = \lfloor \frac{gl\_FragCoord.x}{R_x} \rfloor
    $$
    
    $$
    j = \lfloor \frac{gl\_FragCoord.y}{R_y} \rfloor
    $$
    
    </li></ul>
    <ul><li>Compute the color of the fragment by only considering the \(C_{ij}\) light sources whose indices are inside the array \(V_{ij}\)</li></ul>
<br>
</ol>
</blockquote>

<br>
<h4 id="LightBoundingSphere"><b>Light Bounding Sphere</b></h4>
<br>

Let $$B_k$$ be the bounding sphere of the light source $$L_k$$, where the center $$c_k = (c_{kx}, c_{ky}, c_{kz})$$ is the light position, and the radius $$r_k$$ is the distance at which the maximum component of the light intensity $$I_k$$ equals a user-defined scalar value, let's call it $$i^{min}_k$$. 

<br>

The attenuation of the intensity $$I$$ of the light source is modelled using the **inverse square law**. This law states that $$I$$ is inversely proportional to the square of the distance $$d$$ from the light source. That is, the intensity $$I$$ of the light source at distance $$d$$; call it $$I_d$$, is 

<br>
<br>

$$
I_d = \frac{I}{d^2}
\tag{2}
$$

<br>

Hence, the radius $$r_k$$ of $$B_k$$ is the distance between the center $$c_k$$, and the point at which the decreasing light intensity becomes equal to $$i^{min}_k$$. That is, 

<br>

$$
i^{min}_k = \frac{max \; (I^k_r, \; I^k_g, \; I^k_b)}{r_k^2}
$$

<br>

$$
r_k = \sqrt{\frac{max \; (I^k_r, \; I^k_g, \; I^k_b)}{i^{min}_k}}
$$

<br>
<br>

Below is the code for the function that computes the bounding sphere for a light source: 

<br>

```c++
glm::vec4 ComputeLightBoundingSphere(glm::vec3 position, glm::vec3 lightColor, float lightIntensity, float intensityCutoff)
{
    glm::vec3 color = lightColor * lightIntensity;
    float radius = sqrt(max{color.r, color.g, color.b} / intensityCutoff);
    
    return glm::vec4(position, radius);
}
```

<br>

The data structure used to represent the bounding sphere is **vec4**. The **XYZ** component of the vector will contain the center of the sphere and the **W** component will contain the radius of the sphere. 

<figure class="col-md-12 text-center theme-img repo-img-light">
    {% include figure.html  path="assets/img/Blog/LightCulling/Dark/vec4.png" class="scaled-img50" %}
</figure>
<figure class="col-md-12 text-center theme-img repo-img-dark">
    {% include figure.html  path="assets/img/Blog/LightCulling/Light/vec4.png" class="scaled-img50" %}
</figure>

<br>
<br>
<h3 id="TileFrustum"><b>Tile Frustum</b></h3>
<br>

A frustum consists of $$6$$ planes: **top**, **bottom**, **right**, **left**, **near**, and **far**. The equation of a plane $$P$$ is defined as the points $$Q$$ such that: 

<br>

$$
P \cdot Q = 0
$$

<br>

<figure class="col-md-12 text-center theme-img repo-img-light">
    {% include figure.html  path="assets/img/Blog/LightCulling/Dark/Frustum.png" class="scaled-img40" %}
</figure>
<figure class="col-md-12 text-center theme-img repo-img-dark">
    {% include figure.html  path="assets/img/Blog/LightCulling/Light/Frustum.png" class="scaled-img40" %}
</figure>

<br>
We want to construct the view-space frustum $$F_{ij} = \{ \pi_{ij}^L, \pi_{ij}^R, \pi_{ij}^T, \pi_{ij}^B, \pi_{ij}^N, \pi_{ij}^F \}$$ of the tile $$T_{ij}$$. We know that the range of screen coordinates of tile $$T_{ij}$$ is 

<br>

$$
x^{ij}_{screen, min} = iR_x 
$$

$$
x^{ij}_{screen, max} = iR_x + R_x = R_x(i+1)
$$

$$
y^{ij}_{screen, min} = jR_y
$$

$$
y^{ij}_{screen, max} = jR_y + R_y = R_y(j+1)
$$ 

<br>

Since the ***ndc*** coordinates are in the range of $$[-1, 1]$$, then each tile has ***ndc*** resolution of 

<br>

$$
\frac{1-(-1)}{N_x} \times \frac{1-(-1)}{N_y} = \frac{2}{N_x} \times \frac{2}{N_y}
$$

<br>

This means that the range of ***ndc*** coordinates of tile $$T_{ij}$$ is, 

<br>

$$
x^{ij}_{ndc, min} = -1 + \frac{2i}{N_x}
$$

$$
x^{ij}_{ndc, max} = -1 + \frac{2i}{N_x} + \frac{2}{N_x} = -1 + \frac{2(i + 1)}{N_x}
$$

$$
y^{ij}_{ndc, min} = -1 + \frac{2j}{N_y}
$$

$$
y^{ij}_{ndc, max} = -1 + \frac{2j}{N_y} + \frac{2}{N_y} = -1 + \frac{2(j + 1)}{N_y}
$$ 

<br>
<h4 id = "DerivingEquationforLeftPlane"><b>Deriving Equation for Left Plane \(\pi_{ij}^L\)</b></h4>
<br>

The points that lie on the plane $$\pi_{ij}^L$$ are the set of points $$q_{view}$$ in view-space such that when converted to ***ndc***, their x-coordinates is equal to $$x^{ij}_{ndc, min}$$. More formally, 

$$
\pi_{ij}^L = \{ {q_{view} | q_{ndc} = x^{ij}_{ndc, min}} \}
$$

<br>

We know that 

$$
x^{ij}_{ndc, min} = \frac{q_{clip, x}}{q_{clip, w}}
$$

We also know that 

<br>

$$
q_{clip, x} = projectionMatrix[0] \cdot q_{view}
$$

$$
q_{clip, w} = projectionMatrix[3] \cdot q_{view}
$$

<br>

Hence, 

$$
x^{ij}_{ndc, min} = \frac{q_{clip, x}}{q_{clip, w}}
$$

$$
q_{clip, x} = x^{ij}_{ndc, min} \; q_{clip, w}
$$

$$
q_{clip, x} - x^{ij}_{ndc, min} \; q_{clip, w} = 0
$$

$$
projectionMatrix[0] \cdot q_{view} - x^{ij}_{ndc, min} \; projectionMatrix[3] \cdot q_{view} = 0
$$

$$
(projectionMatrix[0] - x^{ij}_{ndc, min} \cdot projectionMatrix[3]) \cdot q_{view} = 0
$$

<br>

This means that the equation of the left plane $$\pi_{ij}^L$$ of the frustum $$F_{ij}$$ is 

<br>

$$
\pi_{ij}^L: \; projectionMatrix[0] - x^{ij}_{ndc, min} \cdot projectionMatrix[3]
$$

<br>
<br>
<h4 id = "DerivingEquationforRightPlane"><b>Deriving Equation for Right Plane \(\pi_{ij}^R\)</b></h4>
<br>

The points that lie on the plane $$\pi_{ij}^R$$ are the set of points $$q_{view}$$ in view-space such that when converted to ***ndc***, their x-coordinates is equal to $$x^{ij}_{ndc, max}$$. More formally, 

$$
\pi_{ij}^R = \{ {q_{view} | q_{ndc} = x^{ij}_{ndc, max}} \}
$$

<br>

We know that 

$$
x^{ij}_{ndc, max} = \frac{q_{clip, x}}{q_{clip, w}}
$$

We also know that 

<br>

$$
q_{clip, x} = projectionMatrix[0] \cdot q_{view}
$$

$$
q_{clip, w} = projectionMatrix[3] \cdot q_{view}
$$

<br>

Hence, 

$$
x^{ij}_{ndc, max} = \frac{q_{clip, x}}{q_{clip, w}}
$$

$$
q_{clip, x} = x^{ij}_{ndc, max} \; q_{clip, w}
$$

$$
q_{clip, x} - x^{ij}_{ndc, max} \; q_{clip, w} = 0
$$

$$
projectionMatrix[0] \cdot q_{view} - x^{ij}_{ndc, max} \; projectionMatrix[3] \cdot q_{view} = 0
$$

$$
(projectionMatrix[0] - x^{ij}_{ndc, max} \cdot projectionMatrix[3]) \cdot q_{view} = 0
$$

<br>

This means that the equation of the right plane $$\pi_{ij}^R$$ of the frustum $$F_{ij}$$ is 

<br>

$$
\pi_{ij}^R: \; projectionMatrix[0] - x^{ij}_{ndc, max} \cdot projectionMatrix[3]
$$

<br>

<br>
<h4 id = "DerivingEquationforBottomPlane"><b>Deriving Equation for Bottom Plane \(\pi_{ij}^B\)</b></h4>
<br>

The points that lie on the plane $$\pi_{ij}^B$$ are the set of points $$q_{view}$$ in view-space such that when converted to ***ndc***, their y-coordinates is equal to $$y^{ij}_{ndc, min}$$. More formally, 

$$
\pi_{ij}^B = \{ {q_{view} | q_{ndc} = y^{ij}_{ndc, min}} \}
$$

<br>

We know that 

$$
y^{ij}_{ndc, min} = \frac{q_{clip, y}}{q_{clip, w}}
$$

We also know that 

<br>

$$
q_{clip, y} = projectionMatrix[1] \cdot q_{view}
$$

$$
q_{clip, w} = projectionMatrix[3] \cdot q_{view}
$$

<br>

Hence, 

$$
y^{ij}_{ndc, min} = \frac{q_{clip, y}}{q_{clip, w}}
$$

$$
q_{clip, y} = y^{ij}_{ndc, min} \; q_{clip, w}
$$

$$
q_{clip, y} - y^{ij}_{ndc, min} \; q_{clip, w} = 0
$$

$$
projectionMatrix[1] \cdot q_{view} - y^{ij}_{ndc, min} \; projectionMatrix[3] \cdot q_{view} = 0
$$

$$
(projectionMatrix[1] - y^{ij}_{ndc, min} \cdot projectionMatrix[3]) \cdot q_{view} = 0
$$

<br>
This means that the equation of the bottom plane $$\pi_{ij}^B$$ of the frustum $$F_{ij}$$ is 

<br>

$$
\pi_{ij}^B: \; projectionMatrix[1] - y^{ij}_{ndc, min} \cdot projectionMatrix[3]
$$

<br>
<br>
<h4 id = "DerivingEquationforTopPlane"><b>Deriving Equation for Top Plane \(\pi_{ij}^T\)</b></h4>
<br>

The points that lie on the plane $$\pi_{ij}^T$$ are the set of points $$q_{view}$$ in view-space such that when converted to ***ndc***, their y-coordinates is equal to $$y^{ij}_{ndc, max}$$. More formally, 

$$
\pi_{ij}^T = \{ {q_{view} | q_{ndc} = y^{ij}_{ndc, max}} \}
$$

<br>

We know that 

$$
y^{ij}_{ndc, max} = \frac{q_{clip, y}}{q_{clip, w}}
$$

We also know that 

<br>

$$
q_{clip, y} = projectionMatrix[1] \cdot q_{view}
$$

$$
q_{clip, w} = projectionMatrix[3] \cdot q_{view}
$$

<br>

Hence, 

$$
y^{ij}_{ndc, max} = \frac{q_{clip, y}}{q_{clip, w}}
$$

$$
q_{clip, y} = y^{ij}_{ndc, max} \; q_{clip, w}
$$

$$
q_{clip, y} - y^{ij}_{ndc, max} \; q_{clip, w} = 0
$$

$$
projectionMatrix[0] \cdot q_{view} - y^{ij}_{ndc, max} \; projectionMatrix[3] \cdot q_{view} = 0
$$

$$
(projectionMatrix[0] - y^{ij}_{ndc, max} \cdot projectionMatrix[3]) \cdot q_{view} = 0
$$

<br>

This means that the equation of the top plane $$\pi_{ij}^T$$ of the frustum $$F_{ij}$$ is 

<br>

$$
\pi_{ij}^T: \; projectionMatrix[0] - y^{ij}_{ndc, max} \cdot projectionMatrix[3]
$$

<br>
<br>
<h4 id="PointInsideFrustum"><b>Point-Frustum Test</b></h4>
<br>

Consider an arbitrary plane $$P$$ and a point $$q$$. We know that the equation $$P \cdot q = d$$ gives the signed distance $$d$$ between the point $$q$$ and the plane $$P$$, where

<br>

- If $$d = 0$$, then $$q$$ is on the plane $$P$$. 

- If $$d > 0$$, then $$q$$ is not on the plane $$P$$, but is on the side of the plane to where normal vector of the plane points; or in other words, $$q$$ is on the **positive** side of the plane. 

- If $$d < 0$$, then $$q$$ is not on the plane $$P$$, but is on the side of the plane opposite to where the normal vector of the plane points; or in other words, $$q$$ is on the **negative** side of the plane.

<br>

Now, to be able to test whether the point $$q_{view}$$ is inside frustum $$F_{ij}$$, the following conditions must be true: 

<br>

- $$q_{view}$$ is on the positive side of the plane $$\pi_{ij}^L$$

- $$q_{view}$$ is on the negative side of the plane $$\pi_{ij}^R$$

- $$q_{view}$$ is on the positive side of the plane $$\pi_{ij}^B$$

- $$q_{view}$$ is on the negative side of the plane $$\pi_{ij}^T$$

<br>

More formally,

<br>

$$
\pi_{ij}^L \cdot q_{view} \geq 0
$$

$$
\pi_{ij}^B \cdot q_{view} \geq 0
$$

$$
\pi_{ij}^R \cdot q_{view} \leq 0
$$

$$
\pi_{ij}^T \cdot q_{view} \leq 0
$$

<br>

To simplify the test of whether the point $$q_{view}$$ is inside the frustum $$F_{ij}$$ or not, we are going to flip the normal of the right plane $$\pi_{ij}^R$$ and the top plane $$\pi_{ij}^T$$, so that they are in the opposite directions to the normal of the left plane $$\pi_{ij}^L$$ and bottom plane $$\pi_{ij}^B$$ respectively. Hence, the equations of the right plane and the top plane becomes: 

<br>

$$
\pi_{ij}^R: \; (x^{ij}_{ndc, max} \cdot projectionMatrix[3]) - projectionMatrix[0]
$$

$$
\pi_{ij}^T: \; (y^{ij}_{ndc, max} \cdot projectionMatrix[3]) - projectionMatrix[1]
$$

<br>

As a result, the point $$q_{view}$$ is inside the frustum $$F_{ij}$$ if all of the following conditions are true: 

<br>

- $$q_{view}$$ is on the positive side of the plane $$\pi_{ij}^L$$

- $$q_{view}$$ is on the positive side of the plane $$\pi_{ij}^R$$

- $$q_{view}$$ is on the positive side of the plane $$\pi_{ij}^B$$

- $$q_{view}$$ is on the positive side of the plane $$\pi_{ij}^T$$

<br>

or more formally,

$$
\pi_{ij}^L \cdot q_{view} \geq 0
$$

$$
\pi_{ij}^B \cdot q_{view} \geq 0
$$

$$
\pi_{ij}^R \cdot q_{view} \geq 0
$$

$$
\pi_{ij}^T \cdot q_{view} \geq 0
$$

<br>
<br>

Below are the **updated** equations of for the **left**, **right**, **top**, and **bottom** planes of the frustum of the tile. 

<br>

$$
\pi_{ij}^L: \; projectionMatrix[0] - x^{ij}_{ndc, min} \cdot projectionMatrix[3]
$$

$$
\pi_{ij}^R: \; (x^{ij}_{ndc, max} \cdot projectionMatrix[3]) - projectionMatrix[0]
$$

$$
\pi_{ij}^B: \; projectionMatrix[1] - y^{ij}_{ndc, min} \cdot projectionMatrix[3]
$$

$$
\pi_{ij}^T: \; (y^{ij}_{ndc, max} \cdot projectionMatrix[3]) - projectionMatrix[1]
$$

<br>
<br>
Below is the code for a function that computes the **left**, **right**, **top**, and **bottom** planes of the frustum of all tiles. 

<br>

```cpp
std::vector<glm::vec4> ComputeTileFrustums(glm::uvec2 numTiles, glm::mat4 projection)
{
    std::vector<glm::vec4> tileFrustums(numTiles.x * numTiles.y * 4);
    
    glm::vec4 row1 = glm::vec4(projection[0][0], projection[1][0], projection[2][0], projection[3][0]);
    glm::vec4 row2 = glm::vec4(projection[0][1], projection[1][1], projection[2][1], projection[3][1]);
    glm::vec4 row4 = glm::vec4(projection[0][3], projection[1][3], projection[2][3], projection[3][3]);
    
    float stepX = 2.0f / (float)numTiles.x;
    float stepY = 2.0f / (float)numTiles.y;
        
    for(int x = 0; x < numTiles.x; x++){
        for(int y = 0; y < numTiles.y; y++){
            float offsetX = (float)x * stepX;
            float xMin = -1.0f + offsetX;
            float xMax = xMin + stepX;
            float offsetY = (float)y * stepY;
            float yMin = -1.0f + offsetY;
            float yMax = yMin + stepY;
                        
            std::array<glm::vec4, 4> frustum;
            frustum[0] = row1 - (row4 * xMin);
            frustum[1] = (xMax * row4) - row1;
            frustum[2] = row2 - (row4 * yMin);
            frustum[3] = (yMax * row4) - row2;
            
            for(int i = 0; i < 4; i++)
                frustum[i] /= glm::length(glm::vec3(frustum[i]));
                
            int baseIndex = (y * numTiles.x * 4) + (x * 4);
            for(int i = 0; i < 4; i++)
                tileFrustums[baseIndex + i] = frustum[i];
        }
    }
        
    return tileFrustums;
}
```

<br>
<br>

<h4 id="TileFrustumNearFarPlane"><b>Tile Frustum's Near and Far Plane</b></h4>
<br>

<div class="row mt-4">
    <div class="col-md-6">
    <br>
    We have discussed the construction of the right, left, top, and bottom planes of the tile frustum. We still have not discussed, however, the derivation of the near and far planes. A straightforward choice would be to use the near and far planes of the view frustum. However, this will produce a frustum that is unnecessarily loose and large, resulting in many false-positive intersections with light sources.

    <br>
    <br>

    A better approach, instead, is to compute the minimum and maximum depth of each tile, and accordingly use them to construct tighter near and far planes, and in turn, tighter tile frustums. This requires the inclusion of a depth pre-pass, where the depth values of the scene are baked into a buffer and passed along to the light culling stage. Typically, the process of computing the minimum and maximum depth of each tile is done in parallel using reduction, after which the constructed tile frustums are tested for intersection with all the light sources in the scene.     
    <br>
    <br>

    </div>
    <div class="col-md-6">
        <figure class="col-md-12 text-center theme-img repo-img-light">
            {% include figure.html  path="assets/img/Blog/LightCulling/Dark/depth.png" class="scaled-img100"%}
        <figcaption>Depth of the Sponza scene</figcaption>
        </figure>
        <figure class="col-md-12 text-center theme-img repo-img-dark">
            {% include figure.html  path="assets/img/Blog/LightCulling/Light/depth.png" class="scaled-img100"%}
        <figcaption>Depth of the Sponza scene</figcaption>
        </figure>
    </div>
</div>

<blockquote>
In a typical rendering pipeline without a depth pre-pass, the fragment shader may execute on many fragments that are later discarded by depth testing, resulting in wasted computation. The inclusion of a depth prepass addresses this problem by baking the depth values into a buffer using a minimal shader ahead of the main shading pass. The main shading pass then uses this depth buffer, instead of writing its own, leading the fragment shader to be executed only on visible fragments. In other words, the inclusion of a depth prepass in the rendering pipeline is not primarily to be used for light culling, but rather mainly to reduce overdraw and improve rendering efficiency.
</blockquote>

<br>
<br>
<h4 id="TileMinMaxDepthParallelAlgorithm"><b>Parallel Min-Max Depth Reduction</b></h4>
<br>

We can compute the minimum and maximum depth of each tile in **parallel** using the following algorithm: 

<blockquote>
Suppose the screen is dissected into \(N_x \times N_y\) tiles, where each tile \(T_{ij}\) has a resolution of \(R_x \times R_y\), and \(R_x\) and \(R_y\) are powers of \(2\).
<br>
<br>

<ol>
<li>Launch a grid of \(N_x \times N_y\) workgroups, where each workgroup \(W_{ij}\) has a grid of \(R_x \times R_y\) threads, and each thread \([H_{ij}]_{xy}\) manages the pixel \(P_{gk}\), where 

$$
g = (i \; R_x) + x
$$

$$
k = (j \; R_y) + y
$$

</li>
<br>
<li>For each workgroup \(W_{ij}\), initialize a local array \(D_{ij}\) of size \(R_x \times R_y\)</li>
<br>
<li>Invoke each thread \([H_{ij}]_{xy}\) to read the depth value of pixel \(P_{gk}\), and store it in \([D_{ij}]_{xy}\)</li>
<br>
<li>Enforce a barrier to ensure all threads have written the depth values into \([D_{ij}]\)</li>
<br>
<li>For simplicity, we will interpret the \(2D\) grid of threads \([H_{ij}]_{xy}\) and the local \(2D\) array \(D_{ij}\) as \(1D\) arrays with size \(R_x \times R_y\), where the tuple index \( (x, y) \) is mapped to index \([I_{ij}]_{xy}\), where 

$$
[I_{ij}]_{xy} = (yR_x) + x
$$

</li>
<br>
<li> 
Start a loop iterating from \(0\) to \(log_{2}N\). For each iteration \(z\):
<br>
<br>
<ul><li>Invoke thread \([H_{ij}]_{[I_{ij}]_{xy}}\) to compare the depth values \([D_{ij}]_{[I_{ij}]_{xy}}\) and \([D_{ij}]_{[I_{ij}]_{uv}}\), where 

$$
[I_{ij}]_{uv}= [I_{ij}]_{xy} + 2^z
$$

and store the minimum and the maximum of both values into \([D_{ij}]_{[I_{ij}]_{xy}}\)
</li></ul>
<br>
<ul><li>Enforce a barrier before starting the next iteration to ensure all invoked threads have finished their task</li></ul>
</li>
<br>
<li>After the loop is finished, \([D_{ij}]_{0}\) will contain the minimum and maximum depth of the tile \([T_{ij}]\).</li>
</ol>

</blockquote>
  
<br>

<figure class="col-md-12 text-center theme-img repo-img-light">
    {% include figure.html  path="assets/img/Blog/LightCulling/Dark/DepthMinMaxTree.png" class="scaled-img70" %}
<figcaption>Computing minimum and maximum depth in parallel using a grid of \(4 \times 4\) threads; or 16 threads</figcaption>
</figure>
<figure class="col-md-12 text-center theme-img repo-img-dark">
    {% include figure.html  path="assets/img/Blog/LightCulling/Light/DepthMinMaxTree.png" class="scaled-img70" %}
<figcaption>Computing minimum and maximum depth in parallel using a grid of \(4 \times 4\) threads; or 16 threads</figcaption>
</figure>

<br>
<br>
<h3 id = "LinearizingDepth"> <b>Linearizing Depth</b></h3>
<br>

The depth values inside the depth buffer are in window-space in the range of $$[0,1]$$. Since the tile frustums are in view-space, then the near and far planes of these tile frustum must also be in view-space. This requires that we convert the depth values inside the depth buffer into view-space before finding the minimum and maximum value among them. However, the conversion process differs, depending on the type of projection used. 

<br>
##### **OpenGL-style projection**
<br>

OpenGL-style projection follows a specific pipeline when processing view-space depth values. It converts them, first, to ***ndc*** values to be in the range of $$[-1,1]$$, before multiplying them with the projection matrix to be in the range of $$[0,1]$$. Thus, if we wish to convert the window-space depth values back into view-space, we must backtrack in a similar fashion. That is, we must first derive the ndc depth values, and then apply inverse projection to retrieve the view-space depth values. 

<br>

In the case of openGL-style **perspective projection**, $$z_{ndc}$$ is calculated as follows: 

<br>

$$
z_{ndc} = \frac{\frac{f+n}{f-n} \, z_{view} + \frac{2fn}{f-n}}{-z_{view}}
$$

<br>

and hence, $$z_{view}$$ can be calculated as follows: 

$$
z_{ndc} = \frac{\frac{1}{f-n}(z_{view} \; (f+n) + 2fn)}{-z_{view}}
$$

$$
-z_{view} \; z_{ndc} (f-n) = z_{view} \; (f+n) + 2fn
$$

$$
-z_{view} \; z_{ndc} (f-n) - z_{view} \; (f+n) = 2fn
$$

$$
z_{view}(-z_{ndc} (f-n) - (f+n)) = 2fn
$$

$$
z_{view} = \frac{2fn}{-z_{ndc} (f-n) - (f+n)}
$$

<br>

Below is the code for a function that converts a depth value from window-space to view-space, assuming the use of OpenGL-style perspective projection. 

```cpp
float LinearizeDepth(float depthWindowSpace, float n, float f)
{
    float depthNDC = depthWindowSpace * 2.0 - 1.0; // [-1, 1]
    return (2.0 * n * f) / (f + n - depthNDC * (f - n));
}
```

<br>
<br>

In the case of openGL-style **orthographic projection**, $$z_{ndc}$$ is calculated as follows: 

<br>

$$
z_{ndc} = \frac{2}{f - n} \, z_{view} - \frac{f+n}{f-n}
$$

<br>

and hence, $$z_{view}$$ can be calculated as follows: 

<br>

$$
z_{view} = \frac{(f - n)(z_{ndc} + \frac{f+n}{f-n})}{2}
$$

<br>
<br>

Below is the code for a function that converts a depth value from window-space to view-space, assuming the use of OpenGL-style orthographic projection. 

```cpp
float LinearizeDepth(float depthWindowSpace, float n, float f)
{
    float depthNDC = depthWindowSpace * 2.0 - 1.0; // [-1, 1]
    return ((f-n) * (depthNDC + ((f+n) / (f-n)))) / 2;
}
```

<br>
<br>
##### **Vulkan-style projection**
<br>

Vulkan follows a different conversion process compared to OpenGL. In OpenGL, view-space depth values must first be converted to ndc to be in the range of $$[-1, 1]$$, before being mapped to the range of $$[0, 1]$$ to be in window-space. On the other hand, in Vulkan, the depth ndc and window-space values are both in the range of $$[0, 1]$$. Therefore, only applying inverse-projection is enough to convert window-space depth values back to view-space.

<br>

In the case of Vulkan-style **perspective projection**, $$z_{ndc}$$ is calculated as follows: 

<br>

$$
z_{ndc} = \frac{\frac{f}{f-n} \, z_{view} - \frac{fn}{f-n}}{-z_{view}}
$$

<br>

and hence, $$z_{view}$$ can be calculated as follows: 

<br>

$$
z_{ndc} = \frac{f}{f-n} + \frac{-fn}{(f-n) \, z_{view}}
$$

$$
z_{ndc} = \frac{1}{f-n}(f - \frac{fn}{z_{view}}) 
$$

$$
z_{ndc}(f-n) = f - \frac{fn}{z_{view}}
$$

$$
z_{ndc} \, f - z_{ndc} \, n = f(1 - \frac{n}{z_{view}})
$$

$$
\frac{z_{ndc} \, f - z_{ndc} \, n}{f} = 1 - \frac{n}{z_{view}}
$$

$$
\frac{n}{z_{view}} = 1 - \frac{z_{ndc} \, f - z_{ndc} \, n}{f}
$$

$$
z_{view} = \frac{n}{1 - \frac{z_{ndc} \, f - z_{ndc} \, n}{f}}
$$

$$
z_{view} = \frac{n}{\frac{f - z_{ndc} \, f + z_{ndc} \, n}{f}}
$$

$$
z_{view} = \frac{nf}{f - z_{ndc} \, f + z_{ndc} \, n}
$$

$$
z_{view} = \frac{nf}{f - z_{ndc}(f-n)}
$$

<br>
<br>

Below is the code for a function that converts a depth value from window-space to view-space, assuming the use of Vulkan-style perspective projection. 

<br>

```cpp
float LinearizeDepth(float depthWindowSpace, float n, float f)
{
    return ((n*f) / (f - depthWindowSpace * (f-n))
}
```

<br>

In the case of Vulkan-style **orthographic projection**, $$z_{ndc}$$ is calculated as follows: 

<br>

$$
z_{ndc} = \frac{z_{view} - n}{f - n}
$$

<br>

and hence, $$z_{view}$$ can be calculated as follows: 

<br>

$$
z_{view} = z_{ndc}(f-n) + n
$$

<br>
<br>

Below is the code for a function that converts a depth value from window-space to view-space, assuming the use of Vulkan-style orthographic projection. 

```cpp
float LinearizeDepth(float depthWindowSpace, float n, float f)
{
    return depthWindowSpace * (f-n) + n
}
```

<br>
<br>
<h3 id = "FrustumLightIntersection"><b>Frustum-Sphere Intersection Test</b></h3>
<br>

Consider the frustum $$F_{ij}$$ of the tile $$T_{ij}$$, and the bounding sphere $$B_k$$ of the light source $$L_k$$, where $$r_k$$ and $$c_k = (c_{kx}, c_{ky}, c_{kz})$$ are the radius and the center of the bounding sphere respectively. We want to test for intersection between $$B_k$$ and $$F_{ij}$$. Let $$n$$ and $$f$$ be the near and far plane of the frustum $$F_{ij}$$ (minimum depth and maximum depth of the frustum $$F_{ij}$$), and $$d_{k, min}$$ and $$d_{k, max}$$ be the minimum and maximum depth of the bounding sphere $$B_k$$ respectively, where 

<br>

$$
d_{k, min} = c_{kz} - r_k
$$

$$
d_{k, max} = c_{kz} + r_k
$$

<br>

If $$d_{k, min} > f$$, then the entire sphere $$B_k$$ is beyond the far plane, and hence, $$B_k$$ is not intersecting with $$F_{ij}$$. Similarly, if $$d_{k, max} < n$$, then the entire sphere $$B_k$$ is beyond the near plane, and thus, $$B_k$$ is not intersecting with $$F_{ij}$$. If any of these conditions are true, then it can be ruled out conclusively that the sphere $$B_k$$ is not intersecting with the frustum $$F_{ij}$$, and the function can return. Otherwise, we continue checking whether the bounding sphere $$B_k$$ is within the left, right, bottom and top planes of the frustum. 

<br>

We discussed that the equation $$P \cdot q = d$$ gives the signed distance $$d$$ between the plane $$P$$ and the point $$q$$, where if $$d > 0$$, then $$q$$ must be on the positive side of the plane, and if $$d < 0$$, then $$q$$ must be on the negative side of the plane. We also discussed that a point $$q_{view}$$ is inside the frustum $$F_{ij}$$ if all of the following is true: 

<br>

$$
\pi_{ij}^L \cdot q_{view} \geq 0
$$

$$
\pi_{ij}^B \cdot q_{view} \geq 0
$$

$$
\pi_{ij}^R \cdot q_{view} \geq 0
$$

$$
\pi_{ij}^T \cdot q_{view} \geq 0
$$

<br>

To check whether the sphere $$B_k$$ is inside the frustum $$F_{ij}$$ or not, we need to compute the signed distance $$d$$ between the center $$c_k$$ and each plane of the frustum. If there exist at least one plane $$\pi_{ij}$$ in the frustum $$F_{ij}$$ in which the distance $$d$$ between $$c_k$$ and $$\pi_{ij}$$ is negative and greater than the radius $$r_k$$, then the bounding sphere $$B_k$$ must be completely outside the frustum $$F_{ij}$$. Otherwise, the bounding sphere $$B_k$$ is intersecting or inside the frustum $$F_{ij}$$.

<br>
<hr>
<br>

Below is the code for the complete compute shader that implements naive light culling algorithm:

<br>

```cpp
#version 450

const int MAX_NUM_THREADS_PER_WORKGROUP = 1024;

layout(local_size_x_id = 0, local_size_y_id = 1, local_size_z_id = 2) in;

layout(binding = 0) uniform sampler2D depthTexture;

layout(std430, binding = 1) readonly buffer LightBoundingSpheresViewSpace{
    vec4 lightBoundingSpheresViewSpace[];
};

layout(std430, binding = 2) buffer TileLightCount {
    uint tileLightCount[];
};

layout(std430, binding = 3) buffer TileLightIndices {
    uint tileLightIndices[];
};

layout(std140, binding = 4) uniform LightCullingUniformVariables{
    float nearClippingPlane;
    float farClippingPlane;
    uvec2 numTiles2D;
    uint padding;
    uint numLights;
    uvec2 tileResolution;
};

layout(std430, binding = 5) readonly buffer TilesFrustumPlanes{
    vec4 tilesFrustumPlanes[];
};

layout(std430, binding = 6) buffer MaxLightCountBuffer{
    uint globalMaxLightCount;
};

shared float minDepth;
shared float maxDepth;
shared vec2 threadDepths[MAX_NUM_THREADS_PER_WORKGROUP];

float LinearizeDepth(float depth)
{
    float z = depth * 2.0 - 1.0;
    return (2.0 *  nearClippingPlane * farClippingPlane) / (farClippingPlane +  nearClippingPlane - z * (farClippingPlane - nearClippingPlane));
}

bool IsLightVisible(vec4 lightBoundingSphere, float minDepth, float maxDepth, uint tileIndex)
{
    vec3 lightCenter = lightBoundingSphere.xyz;
    float lightDepth = -lightBoundingSphere.z;
    float radius = lightBoundingSphere.w;
    
    float lightMinDepth = lightDepth - radius;
    float lightMaxDepth  = lightDepth + radius;
    
    if(lightMaxDepth < minDepth)
        return false;

    if(lightMinDepth > maxDepth)
        return false;
        
    uint baseP = tileIndex * 4;
        
    for(int i = 0; i < 4; i++){
        vec4 plane = tilesFrustumPlanes[baseP+i];
        if(dot(plane, vec4(lightCenter, 1.0f)) < -radius)
            return false;
    }
        
    return true;
}

void main()
{
    uint numThreadsPerWorkGroup = gl_WorkGroupSize.x * gl_WorkGroupSize.y;
    
    uint numLights = lightBoundingSpheresViewSpace.length();
    
    uint threadIndex = (gl_LocalInvocationID.y * tileResolution.x) + gl_LocalInvocationID.x;
    
    uint tileIndex = ((gl_WorkGroupID.y * uint(numTiles2D.x)) + gl_WorkGroupID.x);
    
    uvec2 textureCoordinates = (gl_WorkGroupID.xy * tileResolution) + gl_LocalInvocationID.xy;
    
    float depth = LinearizeDepth(texelFetch(depthTexture, ivec2(textureCoordinates), 0).r);
    
    threadDepths[threadIndex] = vec2(depth);
    
    barrier();
    
    for(uint stride = 1; stride < numThreadsPerWorkGroup; stride*=2){
        if(threadIndex % (stride*2) == 0){
            float minZ = min(threadDepths[threadIndex].x, threadDepths[threadIndex + stride].x);
            float maxZ = max(threadDepths[threadIndex].y, threadDepths[threadIndex + stride].y);
            threadDepths[threadIndex] = vec2(minZ, maxZ);
        }
        barrier();
    }
    
    if(threadIndex == 0){
        minDepth = threadDepths[0].x;
        maxDepth = threadDepths[0].y;
        tileLightCount[tileIndex] = 0;
    }
        
    barrier();
    
    for(uint k = threadIndex; k < numLights; k+=numThreadsPerWorkGroup){
        vec4 lightBoundingSphere = lightBoundingSpheresViewSpace[k];
        if(IsLightVisible(lightBoundingSphere, minDepth, maxDepth, tileIndex)){
            uint i = atomicAdd(tileLightCount[tileIndex], 1);
            atomicMax(globalMaxLightCount, i + 1);
            tileLightIndices[(tileIndex * numLights) + i] = k;
        }
    }
}
```

<br>
<br>

Below is a snippet of the fragment shader of the main shading pass that computes the tile the fragment resides in, and in turn, determines the list of the light indices to traverse to compute lighting. 
 
```cpp
uvec2 tileUV = uvec2(gl_FragCoord.xy) / fs.tileResolution;
uint tileIndex = (tileUV.y * fs.numTiles2D.x) + tileUV.x;
uint lightCount = tileLightCount[tileIndex];
uint startingIndex = tileIndex * fs.numLights;
uint endingIndex = startingIndex + lightCount;
```

<br>
<br>
<h3 id = "25DCullingAlgorithm"><b>\(2.5D\) Light Culling Algorithm</b></h3>

<div class="row align-items-center mt-3">
<div class="col-md-8">
<br>
<br>

Consider an arbitrary scene that is rendered using a pipeline that uses naive light culling. Typically, if a tile does not have any geometry triangles in it, the computed minimum and maximum depth will be zero, and hence, there will be no intersections with any light sources in the scene.

<br>
<br>

Now, suppose the tile contains triangles really close to the near plane, and triangles really close to the far plane, with no triangles in the region in between. The range between the computed minimum and maximum depth of that tile will be huge, and in turn, the frustum will be huge, resulting in many false-positive intersections. 

<br>
<br>

This phenomena is known as <b>depth discontinuity</b>. It is one of the main shortcomings of the <b>naive</b> light culling algorithm, and it occurs in many scenes. A character framed against a distant mountain is one prominent example of such scenes.

<br>
<br>

The solution to the problem of <b>depth discontinuity</b> is to use an algorithm proposed by T.Harada. in 2012 called <b>2.5D light culling algorithm</b>. The idea of this algorithm is to split the depth range of the tile into \(n\) cells. The slicing can either be done linearly, in which all slices are equal, or logarithmically, in which cells get bigger as it approaches the far plane.

</div>

<div class="col-md-4">
    <figure class="col-md-12 text-center theme-img repo-img-light">
        {% include figure.html  path="assets/img/Blog/LightCulling/Dark/25DPaper.png" class="scaled-img80"%}
        <figcaption>T.Harada. A 2.5D Culling for Forward+. 2012</figcaption>
    </figure>
    <figure class="col-md-12 text-center theme-img repo-img-dark">
        {% include figure.html  path="assets/img/Blog/LightCulling/Light/25DPaper.png" class="scaled-img80"%}
        <figcaption>T.Harada. A 2.5D Culling for Forward+. 2012</figcaption>
    </figure>
</div>
</div>

<br>


<br>

For each pixel $$P_{gk}$$ within the tile $$T_{ij}$$, we will sample its depth value from the depth buffer, and accordingly map it to a tile cell. Following the mapping process, cells that contain depth values will be marked as <b>occupied</b>, and those that do not will be marked as <b>empty</b>. Typically, the status of the of the tile cells is represented using the bits within a <b>int</b> variable. If the bit is $$0$$, then that cell is empty. Otherwise, the cell is occupied. 

<br>

Then, while checking for intersection between the light source and the tile frustum, we will compute the minimum and maximum cell indices the light bounding sphere occupies. If all the cells in that range are marked as **empty**, then that light will not be appended to the tile's evaluation list. If there is at least one cell in that range of cells that is marked as **occupied**, then the light will be approved, assuming it passed the initial intersection test. 

<br>

<blockquote>
Logarithmic slicing is often preferred, since perspective projection causes depth values near the camera to be in high resolution than those far away. Having tiny slices near the camera allows finer separation of geometry into seperate slices.
</blockquote>

<br>
<hr>
<br>

Below is the code for the complete compute shader that implements 2.5D light culling algorithm:

<br>

```cpp
#version 450

const int MAX_NUM_THREADS_PER_WORKGROUP = 1024;

layout(local_size_x_id = 0, local_size_y_id = 1, local_size_z_id = 2) in;

layout(binding = 0) uniform sampler2D depthTexture;

layout(std430, binding = 1) readonly buffer LightBoundingSpheresViewSpace{
    vec4 lightBoundingSpheresViewSpace[];
};

layout(std430, binding = 2) buffer TileLightCount {
    uint tileLightCount[];
};

layout(std430, binding = 3) buffer TileLightIndices {
    uint tileLightIndices[];
};

layout(std140, binding = 4) uniform LightCullingUniformVariables{
    float nearClippingPlane;
    float farClippingPlane;
    uvec2 numTiles2D;
    uint numCellsPerTile;
    uint numLights;
    uvec2 tileResolution;
};

layout(std430, binding = 5) readonly buffer TilesFrustumPlanes{
    vec4 tilesFrustumPlanes[];
};

layout(std430, binding = 6) buffer MaxLightCountBuffer{
    uint globalMaxLightCount;
};

shared float minDepth;
shared float maxDepth;
shared uint tileGeometryBitMask;
shared vec2 threadDepths[MAX_NUM_THREADS_PER_WORKGROUP];

float LinearizeDepth(float depth)
{
    float z = depth * 2.0 - 1.0;
    return (2.0 *  nearClippingPlane * farClippingPlane) / (farClippingPlane +  nearClippingPlane - z * (farClippingPlane - nearClippingPlane));
}

uint ComputeCellIndexLinearly(float depth, float minDepth, float maxDepth)
{
    if(abs(maxDepth - minDepth) < 1e-5)
        return 0;
    
    float depth01 = (depth - minDepth) / (maxDepth - minDepth);
    uint cellIndex = uint(round(depth01 * float(numCellsPerTile)));
    return clamp(cellIndex, 0u, numCellsPerTile - 1u);
}

uint ComputeCellIndexLogarithmically(float depth, float minDepth, float maxDepth)
{
    if(abs(maxDepth - minDepth) < 1e-5)
        return 0;
        
    float den = max(maxDepth / minDepth, 1.0001);
    float num = max(depth / minDepth, 1.0001);
    float depth01 = log(num) / log(den);
    uint cellIndex = uint(round(depth01 * float(numCellsPerTile)));
    
    return max(min(cellIndex, numCellsPerTile - 1u), 0);
}

uint ComputeCellIndex(float depth, float minDepth, float maxDepth)
{
    return ComputeCellIndexLogarithmically(depth, minDepth, maxDepth);
    
    // return ComputeCellIndexLinearly(depth, minDepth, maxDepth);
}

bool IsLightVisible(vec4 lightBoundingSphere, float minDepth, float maxDepth, uint tileGeometryBitMask, uint tileIndex)
{
    vec3 lightCenter = lightBoundingSphere.xyz;
    float lightDepth = -lightBoundingSphere.z;
    float radius = lightBoundingSphere.w;
    
    float lightMinDepth = lightDepth - radius;
    float lightMaxDepth  = lightDepth + radius;
    
    if(lightMaxDepth < minDepth)
        return false;

    if(lightMinDepth > maxDepth)
        return false;
        
    uint baseP = tileIndex * 4;
        
    for(int i = 0; i < 4; i++){
        vec4 plane = tilesFrustumPlanes[baseP+i];
        if(dot(plane, vec4(lightCenter, 1.0f)) < -radius)
            return false;
    }
    
    uint i1 = ComputeCellIndex(lightMinDepth, minDepth, maxDepth);
    uint i2 = ComputeCellIndex(lightMaxDepth, minDepth, maxDepth);
    
    uint minCell = min(i1, i2);
    uint maxCell = max(i1, i2);
    
    uint lightBitMask = 0;
    for(uint i = minCell; i <= maxCell; i++)
        lightBitMask |= (1u << i);
    
    if((lightBitMask & tileGeometryBitMask) == 0)
        return false;
    
    return true;
}

void main()
{
    uint numThreadsPerWorkGroup = gl_WorkGroupSize.x * gl_WorkGroupSize.y;
    
    uint numLights = lightBoundingSpheresViewSpace.length();
    
    uint threadIndex = (gl_LocalInvocationID.y * tileResolution.x) + gl_LocalInvocationID.x;
    
    uint tileIndex = ((gl_WorkGroupID.y * uint(numTiles2D.x)) + gl_WorkGroupID.x);
    
    uvec2 textureCoordinates = (gl_WorkGroupID.xy * tileResolution) + gl_LocalInvocationID.xy;
    
    float depth = LinearizeDepth(texelFetch(depthTexture, ivec2(textureCoordinates), 0).r);
    
    threadDepths[threadIndex] = vec2(depth);
    
    barrier();
    
    for(uint stride = 1; stride < numThreadsPerWorkGroup; stride*=2){
        if(threadIndex % (stride*2) == 0){
            float minZ = min(threadDepths[threadIndex].x, threadDepths[threadIndex + stride].x);
            float maxZ = max(threadDepths[threadIndex].y, threadDepths[threadIndex + stride].y);
            threadDepths[threadIndex] = vec2(minZ, maxZ);
        }
        barrier();
    }
    
    if(threadIndex == 0){
        tileGeometryBitMask = 0;
        minDepth = threadDepths[0].x;
        maxDepth = threadDepths[0].y;
        tileLightCount[tileIndex] = 0;
    }
    
    barrier();
    
    uint threadCellIndex = ComputeCellIndex(depth, minDepth, maxDepth);
    atomicOr(tileGeometryBitMask, 1u << threadCellIndex);
    
    barrier();
    
    for(uint k = threadIndex; k < numLights; k+=numThreadsPerWorkGroup){
        vec4 lightBoundingSphere = lightBoundingSpheresViewSpace[k];
        if(IsLightVisible(lightBoundingSphere, minDepth, maxDepth, tileGeometryBitMask, tileIndex)){
            uint i = atomicAdd(tileLightCount[tileIndex], 1);
            atomicMax(globalMaxLightCount, i + 1);
            tileLightIndices[(tileIndex * numLights) + i] = k;
        }
    }
}
```

<br>
<br>
<h3 id="stochasticLightCulling"><b>Stochastic Light Culling</b></h3>
<br>

The assumption that light culling is making of imposing a limited influence range for each light source is physically inaccurate. In general, physically-based lights have infinite range of influence. Regardless of the distance $$d$$ between the shading point $$x$$ and the light source $$L_i$$, $$x$$ should still receive some radiance contribution from $$L_i$$. This is typically modelled using the fall-off function $$f(d)$$ outlined in equation $$2$$.

<br>

<div class="row align-items-center mt-3">
<div class="col-md-6">
    <figure class="col-md-12 text-center theme-img repo-img-light">
        {% include figure.html  path="assets/img/Blog/LightCulling/Dark/SceneWoLightCulling.png" class="scaled-img80"%}
        <figcaption>
        Scene without light culling
        </figcaption>
    </figure>
    <figure class="col-md-12 text-center theme-img repo-img-dark">
        {% include figure.html  path="assets/img/Blog/LightCulling/Light/SceneWoLightCulling.png" class="scaled-img80"%}
        <figcaption>
        Scene without light culling
        </figcaption>
    </figure>
</div>
<div class="col-md-6">
    <figure class="col-md-12 text-center theme-img repo-img-light">
        {% include figure.html  path="assets/img/Blog/LightCulling/Dark/SceneWLightCulling.png" class="scaled-img80"%}
        <figcaption>
        Scene with light culling
        </figcaption>
    </figure>
    <figure class="col-md-12 text-center theme-img repo-img-dark">
        {% include figure.html  path="assets/img/Blog/LightCulling/Light/SceneWLightCulling.png" class="scaled-img80"%}
        <figcaption>
        Scene with light culling
        </figcaption>
    </figure>
</div>
</div>

<br>

The physical inaccuracy of light culling is apparent in the scenes it produces. Rendering pipelines that use light culling produce scenes that are darker than the original. This is especially true if the influence range $$r_i$$ of the light is reduced aggressively. However, despite the physical inaccuracy it introduces, light culling is still commonly used in rendering pipelines. This is due to the performance benefits it provides for scenes with large number of light sources. Although we always aim to produce realistic scenes in computer graphics, we tend to favor performance over realism. A scene with high frame-rate that is not physically accurate is preferred over a scene that is physically accurate, but non-interactive or has slow frame-rate. That's why light culling is still used nowadays in rendering pipelines despite its shortcomings.

<br>

<div class="row align-items-center mt-3">
<div class="col-md-8">
Now, the question is: 

<br>

<div class="row align-items-center mt-3 justify-content-center text-center">
<div class="col-md-6">
<b><i>Is there a way we can "fix" these darkened bits in the scenes caused by light culling, while at the same time maintain the performance benefits it provides ? </i></b>
</div>
</div>

<br>

The answer is: 

<div class="row align-items-center mt-3 justify-content-center text-center">
<div class="col-md-8">
<b><i>Yes
<br>
The method is explained in the 2016 paper "Stochastic Light Culling" by Y.Tokuyoshi, T.Harada.</i></b>
</div>
</div>

<br>
<br>

In this section, we will explain the method, derive its equations and formulas, and provide an implementation in C++. 

</div>
<div class="col-md-4">
    <figure class="col-md-12 text-center theme-img repo-img-light">
        {% include figure.html  path="assets/img/Blog/LightCulling/Dark/paper.png" class="scaled-img80"%}
        <figcaption>Y.Tokuyoshi, T.Harada. Stochastic Light Culling. 2016</figcaption>
    </figure>
    <figure class="col-md-12 text-center theme-img repo-img-dark">
        {% include figure.html  path="assets/img/Blog/LightCulling/Light/paper.png" class="scaled-img80"%}
        <figcaption>Y.Tokuyoshi, T.Harada. Stochastic Light Culling. 2016</figcaption>
    </figure>
</div>
</div>

<br>
<h4 id="problem"><b>Problem Statement</b></h4>
<br>

The truncated fall-off function $$f^{\prime}(d)$$ used by light culling is defined as follows: 

<br>

$$
f^{\prime}(d) \approx
\begin{cases}
f(d), &&&& d \leq r_i \\
\\
0, &&&& d > r_i \\
\end{cases}
$$

<br>

where $$r_i$$ is the influence range of the light $$L_i$$. 

<br>

As shown, if the shading point $$x$$ is within the influence range $$r_i$$, the function $$f^{\prime}(d)$$ applies the physically-based fall-off function $$f(d)$$. However, if the shading point $$x$$ is beyond the range $$r_i$$, the light $$L_i$$ is completely ignored. This explains why scenes produced by light culling has darkened regions. In fact, if we computed the bias  $$E$$ of $$f^{\prime}(d)$$, we will find it biased: 

<br>

$$
E(f^{\prime}(d)) = f^{\prime}(d)
$$

$$
Bias(d) = E(f^{\prime}(d)) - f(d)
$$

$$
Bias(d) = f^{\prime}(d) - f(d)
$$

$$
Bias(d) =
\begin{cases}
0, &&&& d \leq r_i \\
\\
- f(d), &&&& d > r_i \\
\end{cases}
$$

<br>

In other words, inside the cutoff radius $$r_i$$, the fall-off function $$f^{\prime}(d)$$ is unbiased. Otherwise, the estimator underestimates the light contribution significantly by setting it to zero. This lines up with the results we are seeing. If $$f^{\prime}(d)$$ was truly unbiased, the scene would have looked identical to the one produced by the traditional rendering pipeline, which is not the case. 

<br>

The solution the paper is introducing is to replace the truncated fall-off function $$f^{\prime}(d)$$ with an unbiased stochastic fall-off function $$\hat{f}(d)$$. This way, we get to produce scenes that are almost identical to the physically-based one, yet keep the performance benefits of light culling. 

<br>
<br>
<h4 id="stochastic"><b>Stochastic Fall-off Function</b></h4>
<br>

Let $$p_i(d)$$ be a probability function, and $$ξ_i \in [0, 1)$$ be a uniform random number for each light source $$L_i$$. The stochastic fall-off function $$\hat{f}(d)$$ approximated using Russian roulette is given by

$$
\hat{f}(d) \approx
\begin{cases}
\frac{f(d)}{p_i{d}}, &&&& p_i(d) > ξ_i \\
\\
0, &&&& otherwise \\
\end{cases}
\tag{3}
$$

<br>

Let's take a step back and explain this function more clearly, and how exactly we derived it. 

<br>

Consider, for example, the physically-based fall-off function $$f(d)$$ defined in equation $$2$$. Every light $$L_i$$ is contributing exactly the amount of $$\frac{1}{d_i^2}$$ to the shading point $$x$$. With the introduction of the truncated fall-off function $$f^{\prime}(d)$$ in light culling, only a subset of the lights is contributing the amount of $$\frac{1}{d_i^2}$$, decreasing the total contribution that the shading point $$x$$ should physically be receiving. 

<br>

The key idea of the stochastic fall-off function is to artifically increase the radiance contribution provided by the surviving lights to account for the contribution that would have been provided by the culled lights, keeping the total contribution that the shading point $$x$$ is receiving practically the same. 

<br>

So, we define the probability function $$p_i(d) \in [0, 1]$$ as the probability that light $$L_i$$ is evaluated at the shading point $$x$$. For every light $$L_i$$, we flip a weighted coin $$ξ_i$$. If $$p_i(d) > ξ_i$$, we evaluate the light $$L_i$$, and artifically inflate its contribution by a factor of $$\frac{1}{p_i(d)}$$. Otherwise, we ignore it. 

<br>

Suppose for example that $$f(d) = 40$$ for the light $$L_i$$, and $$p_i(d) = 0.25$$. This means that $$25\%$$ of the time, $$L_i$$ survives, and the other $$75\%$$ of the time, it is ignored. The average contribution of light $$L_i$$ is 

$$
0.75(0) + 0.25(40) = 10
$$

<br>

What we do then here is that we inflate the radiance contribution of light $$L_i$$ in the times it is evaluated with a factor of $$\frac{1}{p_i(d)}$$, such that 

<br>

$$
0.75(0) + 0.25(\frac{40}{0.25}) = 40
$$

<br>

This way, the average contribution becomes equal to the physically-accurate value of $$f(d) = 40$$. 

<br>

<div class="proof">
\(\hat{f}(d)\) is unbiased
<br>
<br>
<b><b>Proof</b></b>
<br>
<br>
The expectation \(E\) of the estimator \(\hat{f}(d)\) is given as 

$$
E\left[\hat{f}(d)\right] = p_i(d)\left[\frac{f(d)}{p_i(d)}\right] + (0) \left[1-p_i(d)\right]
$$

$$
E\left[\hat{f}(d)\right] = f(d)
$$

Since

$$
Bias(d) = E\left[\hat{f}(d)\right] - f(d) = 0
$$

then the estimator \(\hat{f}(d)\) is unbiased.
<br>
<br>
<br>
\(\blacksquare\)
</div>

<br>

The stochastic fall-off function $$\hat{f}(d)$$ will be used in the main shader of the rendering pipeline to compute the attenutation of the light intensity, in place of the truncated fall-off function $$f^{\prime}(d)$$ used by light culling. 

<br>

The following is a function that computes the uniform random number $$\epsilon_i$$ that is generated for each light source $$L_i$$:

```c++
float GenerateEpsilon()
{
    std::mt19937 rng(std::random_device{}());
    std::uniform_real_distribution<float> dist01(0.0f, 1.0f);
    
    return dist01(rng);
}
```

<br>
<br>
<h4 id="probability"><b>Probability Function</b></h4>
<br>

In the previous section, we defined the stochastic fall-off function $$\hat{f}(d)$$ in equation $$3$$. We did not, however, define the probability function $$p_i(d)$$. This is because it did not matter what probability function was used. Regardless of how $$p_i(d)$$ is defined, $$\hat{f}(d)$$ is still unbiased. The definition of $$\hat{f}(d)$$ is not dependent on $$p_i(d)$$ at all. Having said that, some probability functions are better than other in this context. For example, we could set 

<br>

$$
p_i(d) = 0.5
$$

<br>

With this choice of $$p_i(d)$$, the stochastic fall-off function $$\hat{f}(d)$$ would still unbiased. However, we would be evaluating 50% of all light sources for each shading point $$x$$, regardless of the distance between them. This does not align with our light culling pipeline, since there is no relationship between $$p_i(d)$$ and the distance $$d$$ between the light source and the shading point $$x$$. 

<br>

We need to define a probability function $$p_i(d)$$ that is proportional to $$f(d)$$. This way, lights that are far from the shading point $$x$$ gets low probability of survival, and lights close to $$x$$ gets high probability of survival, and are evaluated. 

<br>

The paper is proposing the following probability function $$p_i(d)$$: 

<br>

$$
p_i(d) = min(\frac{f(d)}{\alpha_i}, 1)
\tag{4}
$$

<br>

where $$\alpha_i$$ is a constant value to control variance. 

<br>

<div class="proof">
\(\frac{f(d)}{p_i{d}} = max(\alpha_i, f(d))\)
<br>
<br>
<b><b>Proof</b></b>
<br>
<br>
We know that

$$
f(d) = \frac{1}{d^2}
$$

We also know that

$$
p_i(d) = min(\frac{f(d)}{\alpha_i}, 1)
$$

Now, if \(f(d) \geq \alpha_i\), then 

$$
p_i(d) = 1
$$ 

and 

$$
\frac{f(d)}{p_i(d)} = f(d)
$$

If \(f(d) \leq \alpha_i\), then 

$$
p_i(d) = \frac{f(d)}{\alpha_i}
$$ 

and 

$$
\frac{f(d)}{p_i(d)} = \frac{f(d)}{\frac{f(d)}{\alpha_i}} = \alpha_i
$$

Hence, \(\frac{f(d)}{p_i(d)} = max(f(l), \alpha_i)\).
<br>
<br>
<br>
\(\blacksquare\)
</div>

<br>

Since $$\frac{f(d)}{p_i{d}} = max(\alpha_i, f(d))$$, we can update $$\hat{f}(d)$$ as follows: 

$$
\hat{f}(d) \approx
\begin{cases}
max(\alpha_i, f(d)), &&&& p_i(d) > ξ_i \\
\\
0, &&&& otherwise \\
\end{cases}
\tag{5}
$$

<br>

In the main shader, the attenutation of the light source is computed using the stochastic fall-off function $$\hat{f(d)}$$ defined in equation $$5$$:

<br>

```c++
float ComputeAttenutation(float dist, float alpha)
{
    float f = 1.0 / (dist * dist);
        
    return max(alpha, f);
}
```

<br>
<br>
<h4 id="radius"><b>Light's Influence Range</b></h4>
<br>

According to the stochastic fall-off function $$\hat{f}(d)$$, if the probability $$p_i(d) > ξ_i$$, the light $$L_i$$ is ignored. We need to compute the influence range $$r_i$$ of the light $$L_i$$, such that it is set at the point in which the light contribution becomes zero. This point is at the distance $$d$$ at which 

$$
p_i(d) = ξ_i
$$

That is, 

$$
p_i(r_i) = min(\frac{f(r_i)}{\alpha_i}, 1) = ξ_i
$$

Since $$ξ \in [0, 1)$$, then $$ξ < 1$$. This means that 

$$
ξ_i = \frac{f(r_i)}{\alpha_i}
$$

$$
ξ_i = \frac{1}{r_i^2 \alpha_i}
$$

$$
r_i^2 = \frac{1}{\alpha_i ξ_i}
$$

$$
r_i = \frac{1}{\sqrt{\alpha_i ξ_i}}
\tag{6}
$$

<br>
<br>

The following is a function that computes the bounding sphere of the light source. The center of the sphere is the position of the light, and the radius is computed using equation $$6$$: 

<br>

```c++
glm::vec4 ComputeBoundingSphere(float alpha, float epsilon)
{
    glm::vec3 center = light.config.position;
    float radius = (1.0f / (sqrt(alpha * epsilon)));
    
    return glm::vec4(center, radius);
}
```

<br>
<br>
<h4 id="variance"><b>Variance Control</b></h4>
<br>

One of the variables we have not discussed till now is $$\alpha_i$$. We briefly mentioned that it controls the variance $$σ^2(\hat{f}(d))$$ of the stochastic fall-off function $$\hat{f}(d)$$, but in this section, we will explain how. The equation for computing the variance $$σ^2(X)$$ of an estimator $$X$$ is defined as follows: 

<br>

$$
σ^2(X) = E\left[X^2\right] - (E\left[X\right])^2
$$

<br>

We will start by computing the expected value $$E\left[\hat{f}(d)\right]$$ of the estimator $$\hat{f}(d)$$. 

<br>

$$
E\left[\hat{f}(d)\right] = p_i(d)\left[\frac{f(d)}{p_i(d)}\right] + (0) \left[1-p_i(d)\right]
$$

$$
E\left[\hat{f}(d)\right] = f(d)
$$

<br>

Next, we will define the estimator $$\hat{f}^2(d)$$ as follows: 

$$
\hat{f}^2(d) \approx
\begin{cases}
\frac{f^2(d)}{p_i^2(d)}, &&&& p_i(d) > ξ_i \\
\\
0, &&&& otherwise \\
\end{cases}
$$

<br>

The expected value $$E$$ of $$\hat{f}^2(d)$$; $$E\left[\hat{f}^2(d)\right]$$ is defined as follows: 

<br>

$$
E\left[\hat{f}^2(d)\right] = p_i(d)\left[\frac{f^2(d)}{p_i^2(d)}\right] + (0) \left[1-p_i(d)\right]
$$

$$
E\left[\hat{f}^2(d)\right] = \frac{f^2(d)}{p_i(d)}
$$

<br>

Hence, the equation for computing the varince $$σ^2(\hat{f}(d))$$ of the estimator $$\hat{f}(d)$$, is defined as follows: 

<br>

$$
σ^2(\hat{f}(d)) = E\left[\hat{f}^2(d)\right] - E\left[\hat{f}(d)\right]^2
$$

$$
σ^2(\hat{f}(d)) = \frac{f^2(d)}{p_i(d)} - f^2(d)
$$

$$
σ^2(\hat{f}(d)) = f^2(d)\left[\frac{1}{p_i(d)} - 1\right]
$$

By substituting $$p_i(d) = \frac{f(d)}{\alpha_i}$$, we get

$$
σ^2(\hat{f}(d)) = f^2(d)\left[\frac{\alpha_i}{f(d)} - 1\right]
$$

$$
σ^2(\hat{f}(d)) = \alpha_i f(d) - f^2(d)
\tag{7}
$$

<br>

As shown in equation $$7$$, $$\alpha_i$$ is proportional to the variance $$σ^2(\hat{f}(d))$$. This means that if $$\alpha_i$$ increases, the variance $$σ^2(\hat{f}(d))$$ also increases, and vice versa. This realization lines up accurately with the framework we discussed so far. Suppose, for instance, we increased $$\alpha_i$$. This will cause $$p_i(d)$$ to decrease, and, in turn, more lights will fail the condition of $$p_i(d) > ξ_i$$ and get ignored. The influence range $$r_i$$ of the lights will also decrease causing more aggressive culling by the pipeline. Moreover, the radiance contribution of the surviving lights; namely, 

$$
\frac{f(d)}{p_i(d)}
$$ 

will also increase. This means that the values that the estimator $$\hat{f}(d)$$ is producing are either zero, or very high values, leading to the high <b>variance</b>. Conversely, if we decreased $$\alpha_i$$, the number of culled lights will decrease, leading to low variance, and in turn, better rendering quality, but at the expense of worse performance.  

<br>

Regardless of the level of variance, the estimator is still unbiased. The large fluctuations of data in estimators with high variance, however, are not always favourable to have. Suppose, for example, we evaluate the stochastic fall-off $$\hat{f}(d)$$ every frame with a newly generated random number. There will be large data variations between every frame, causing noise in the rendered scene. 

<br>

Luckily, in our setup, we generate a random number only once at the begining, evaluate $$\hat{f}(d)$$ then, and re-use the same data every frame. As a result, our rendered scene will not have any flickering. However, there will be big discrepancy between each program run. One program run could have decent rendering quality, and the next could be awful. The key idea here is to determine how to pick the value of $$\alpha_i$$ that balances the competing factors of rendering quality and performance. The paper defines an equation that calculates $$\alpha_i$$ based on a maximum error value $$\epsilon_{max}$$ to be tolerated by the user.


<br>
<br>
<h4 id="alpha"><b>Constructing Equation for \(\alpha_i\)</b></h4>
<br>

Recall equation $$1$$. We will replace the fall-off function $$f(\lVert x_i - x \rVert)$$ with our stochastic fall-off function $$\hat{f}(\lVert x_i - x \rVert)$$. Namely, 

<br>

$$
L(x, \hat{w}) = \sum_{i=0}^{N-1} I_i(-\hat{w}_{i}^{\prime}) \; \hat{f}(\lVert x_i - x \rVert) \; V(x, x_i) \; ρ(x, \hat{w}, \hat{w}_{i}^{\prime}) \; max(\hat{w}_{i}^{\prime} \cdot \hat{n}, 0)
\tag{8}
$$

<br>

Next, let's reduce equation $$8$$ by only considering the radiance contribution of one light source: 

<br>

$$
L(x, \hat{w}) = I_i(-\hat{w}_{i}^{\prime}) \; \hat{f}(\lVert x_i - x \rVert) \; V(x, x_i) \; ρ(x, \hat{w}, \hat{w}_{i}^{\prime}) \; max(\hat{w}_{i}^{\prime} \cdot \hat{n}, 0)
$$

<br>

We want to compute the radiance error $$\epsilon_i(x, \hat{w})$$ inflicted by the term $$\hat{f}(\lVert x_i - x \rVert)$$. To do this, we will replace the term $$\hat{f}(\lVert x_i - x \rVert)$$ with the standard deviation $$σ(\lVert x_i - x \rVert)$$, which is a measure of how far the value produced by the estimator $$\hat{f}(\lVert x_i - x \rVert)$$ is from the expected value $$E\left[\hat{f}(d)\right]$$. That is,

<br>

$$
\epsilon_i(x, \hat{w}) = I_i(-\hat{w}_{i}^{\prime}) \; σ(\lVert x_i - x \rVert) \; V(x, x_i) \; ρ(x, \hat{w}, \hat{w}_{i}^{\prime}) \; max(\hat{w}_{i}^{\prime} \cdot \hat{n}, 0)
\tag{9}
$$

<br>

We will compute the error bound $$\epsilon_{max}$$ by assuming the maximum value for each term of equation $$9$$. That is, 

- The maximum value for the visibility variable $$V(x, x_i)$$ is $$1$$.
- The maximum value for the dot product $$(\hat{w}_{i}^{\prime} \cdot \hat{n})$$ is $$1$$.
- We will assume the usage of the Lambertian model for the BRDF function $$ρ(x, \hat{w}, \hat{w}_{i}^{\prime})$$. Hence, $$ρ(x, \hat{w}, \hat{w}_{i}^{\prime}) = \frac{1}{\pi}$$
- We will compute the maximum possible value for the standard deviation $$σ(\hat{f}(d))$$; $$σ_{max}(\hat{f}(d))$$ by, first, computing the maximum value for the variance $$σ_{max}^2(\hat{f}(d))$$, and then applying the equation $$σ(X) = \sqrt(σ^2)$$. The maximum value $$σ_{max}(\hat{f}(d))$$ can be computed by calculating the derivative of equation $$7$$ and setting it to $$0$$. Namely, 

$$
\frac{d}{d f(d)} σ^{2}(\hat{f}(d)) = \alpha_i - 2 f(d) = 0
$$

$$
\alpha_i - 2 f(d) = 0
$$

$$
f(d) = \frac{\alpha_i}{2}
$$

<br>

$$
σ^2(\hat{f}(d)) = \alpha_i f(d) - f^2(d) = \alpha_i (\frac{\alpha_i}{2}) - (\frac{\alpha_i}{2})^2
$$

$$
σ^2(\hat{f}(d)) = (\frac{\alpha_i^2}{2}) - (\frac{\alpha_i^2}{4})
$$

$$
σ^2(\hat{f}(d)) = \frac{\alpha_i^2}{4}
$$

<br>

$$
σ(\hat{f}(d)) = \sqrt{σ^2(\hat{f}(d))} = \sqrt{\frac{\alpha_i^2}{4}}
$$

$$
σ(\hat{f}(d)) = \frac{\alpha_i}{2}
$$

<br>

By substituting the maximum values in equation $$9$$, the resultant equation for the error bound $$\epsilon_{max}$$ is defined as follows:

$$
\epsilon_{max} = \frac{\alpha_i E max_{\hat{\omega}^{\prime}}(I_i(\hat{\omega}^{\prime}))}{2 \pi}
\tag{10}
$$

Therefore, the equation for computing $$\alpha_i$$ is given as: 

$$
\alpha_i = \frac{2 \pi \epsilon_{max}}{E max_{\hat{\omega}^{\prime}}(I_i(\hat{\omega}^{\prime}))}
\tag{11}
$$

<br>

The following is a function that computes $$\alpha_i$$ using equation $$11$$, where $$errorMax$$ is a user-define error bound.

```c++
float ComputeAlpha(float errorMax, glm::vec3 lightColor, float lightIntensity)
{
    glm::vec3 I = lightIntensity * lightColor;
    float maxLightIntensityComponent = std::max({I.x, I.y, I.z});
    
    return ((2.0f * PI * errorMax) / (maxLightIntensityComponent));
}
```

<br>
<br>
<br>

<div class="row align-items-center mt-3">
<div class="col-md-6">
    <figure class="col-md-12 text-center theme-img repo-img-light">
        {% include figure.html  path="assets/img/Blog/LightCulling/Dark/SceneWoLightCulling.png" class="scaled-img80"%}
        <figcaption>
        Scene without light culling
        </figcaption>
    </figure>
    <figure class="col-md-12 text-center theme-img repo-img-dark">
        {% include figure.html  path="assets/img/Blog/LightCulling/Light/SceneWoLightCulling.png" class="scaled-img80"%}
        <figcaption>
        Scene without light culling
        </figcaption>
    </figure>
</div>
<div class="col-md-6">
    <figure class="col-md-12 text-center theme-img repo-img-light">
        {% include figure.html  path="assets/img/Blog/LightCulling/Dark/SceneWLightCulling.png" class="scaled-img80"%}
        <figcaption>
        Scene with light culling \((\epsilon_{max} = 0.1)\)        
        </figcaption>
    </figure>
    <figure class="col-md-12 text-center theme-img repo-img-dark">
        {% include figure.html  path="assets/img/Blog/LightCulling/Light/SceneWLightCulling.png" class="scaled-img80"%}
        <figcaption>
        Scene with light culling \((\epsilon_{max} = 0.1)\)        
        </figcaption>
    </figure>
</div>
</div>

<br>

<div class="row align-items-center mt-3 justify-content-center">
<div class="col-md-6">
    <figure class="col-md-12 text-center theme-img repo-img-light">
        {% include figure.html  path="assets/img/Blog/LightCulling/Dark/Stochastic01.png" class="scaled-img80"%}
        <figcaption>
        Scene with stochastic light culling \((\epsilon_{max} = 0.1)\)
        </figcaption>
    </figure>
    <figure class="col-md-12 text-center theme-img repo-img-dark">
        {% include figure.html  path="assets/img/Blog/LightCulling/Light/Stochastic01.png" class="scaled-img80"%}
        <figcaption>
        Scene with stochastic light culling \((\epsilon_{max} = 0.1)\)
        </figcaption>
    </figure>
</div>
</div>

<br>
<br>
<hr>
<br>
<br>
An <b id="Demo"></b> application demonstrating light culling, along with its source code, can be found and downloaded from the github repository <a href="https://github.com/AmrHMorsy/Vulkan-Light-Culling-Demo">here</a>.

<br>
<br>

<div class="row align-items-center mt-3">
<div class="col-md-6">
    <figure class="col-md-12 text-center theme-img repo-img-light">
        {% include figure.html  path="assets/img/Blog/LightCulling/Dark/Demo-Bistro.png" class="scaled-img80"%}
        <figcaption>
        Bistro Scene
        </figcaption>
    </figure>
    <figure class="col-md-12 text-center theme-img repo-img-dark">
        {% include figure.html  path="assets/img/Blog/LightCulling/Light/Demo-Bistro.png" class="scaled-img80"%}
        <figcaption>
        Bistro Scene
        </figcaption>
    </figure>
</div>
<div class="col-md-6">
    <figure class="col-md-12 text-center theme-img repo-img-light">
        {% include figure.html  path="assets/img/Blog/LightCulling/Dark/Demo-sponza.png" class="scaled-img80"%}
        <figcaption>
        Sponza Scene
        </figcaption>
    </figure>
    <figure class="col-md-12 text-center theme-img repo-img-dark">
        {% include figure.html  path="assets/img/Blog/LightCulling/Light/Demo-sponza.png" class="scaled-img80"%}
        <figcaption>
        Sponza Scene
        </figcaption>
    </figure>
</div>
</div>


<br>
<br>
<hr>
<br>
<br>
<h4 id="References"><b>References</b></h4>
<br>

**[1]** $$$$ $$$$ Harada, T., McKee, J., Yang, J. C. Forward+: Bringing Deferred Lighting to the Next Level. 2012.
<br>
<br>
**[2]** $$$$ $$$$ T.Harada. A 2.5d culling for forward+. 2012.
<br>
<br>
**[3]** $$$$ $$$$ Chapter 20.3 - Real-time Rendering by Tomas Akenine-Möller, Eric Haines, Naty Hoffman, Angelo Pesce, Michat Iwanicki, and Sébastien Hillaire
<br>
<br>
**[4]** $$$$ $$$$ Y.Tokuyoshi, T.Harada. Stochastic Light Culling. 2016.
<br>
<br>
**[5]** $$$$ $$$$ [Vulkan Documentation](https://docs.vulkan.org/spec/latest/index.html)
<br>
<br>
<br>
<hr>
<br>
<br>

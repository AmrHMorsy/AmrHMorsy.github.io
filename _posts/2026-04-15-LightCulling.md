---
layout: post
title: Tiled Light Culling in Vulkan
date: 2026-04-15 09:00:00
description:
tags:
categories:
thumbnail: assets/img/Blog/LightCulling/
featured: false
---

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
    </ul>
    <li><a href="#PointInsideFrustum">Point-Frustum Test</a></li>
    <li><a href="#TileFrustumNearFarPlane">Tile Frustum’s Near and Far Plane</a></li>
    <li><a href="#TileMinMaxDepthParallelAlgorithm">Tile-Based Min/Max Depth Reduction for Light Culling</a></li>
    <li><a href="#LinearizingDepth">Linearizing Depth</a></li>
    <li><a href="#FrustumLightIntersection">Tile Frustum-Light Bounding Sphere Intersection Test</a></li>
    <li><a href="#DepthDiscont">Depth Discontinuties</a></li>
    <li><a href="#25DCullingAlgorithm">2.5D Light Culling Algorithm</a></li>
    <li><a href="#Demo">Demo</a></li>
    <li><a href="#References">References</a></li>
</ul>
</blockquote>
<br>
<hr>
<br>
<h3 id="introduction"><b>Introduction</b></h3>
<div class="row align-items-center mt-3">
<div class="col-md-5">
<br>
During rasterization, the triangles in the scene are converted into fragments. Assuming that lighting is supported, the fragment shader is then executed for each of these fragments, in which it adds up the lighting contributions from all light sources in the scene, and computes the final color of the fragment. All fragments are then subjected to depth testing, and those who fail the test are discarded.
<br>
<br>
This is the typical rendering pipeline that exists in most real-time graphics applications. It is known as the <b>Forward Rendering Pipeline</b>. It can achieve interactive frame-rate for simple scenes with a few light sources. However, it does not scale well with the increase in the number of light sources. That is, it will fail to maintain adequate frame-rate with more complex scenes with hundreds or thousands of light sources. Hence, the idea of light culling was introduced. 
<br>
<br>
Tiled light culling is an optimization technique in rendering. The idea of tiled light culling is that at certain great distances from the light source, the light contribution from that light source becomes so small, because of <b>attenuation</b>, that ignoring the light source completely in the fragment shading computation will not affect the physical accuracy of the final scene by a great deal, and, in return, save us significant computational cost.
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

<br>
<h3 id="TiledLightCullingAlgorithm"><b>Naive Tiled Light Culling Algorithm</b></h3>
<br>

The <b>naive tiled light culling</b> algorithm is described as follows: 

<blockquote>
Let \(W \times H\) be the screen resolution, and \(S\) be the number of light sources in the scene. 
<br>
<br>

<ol>
<li>For each light source \(L_{k}\), create a bounding sphere \(B_{k}\)</li> 
<br>
<li>Dissect the screen into \(N_x \times N_y\) tiles \(T_{i < N_x , j < N_y}\) with equal resolution \(R_x \times R_y\), where 

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
<li>Iterate through all the light sources \(L_{k}\) and test the intersection between the light bounding sphere \(B_{k}\) and each tile frustum \(F_{ij}\). If \(B_{k}\) intersects the frustum \(F_{ij}\), record \(k\) into \(V_{ij}\) and increment \(C_{ij}\) by \(1\)</li>
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
<h3 id="LightBoundingSphere"><b>Light Bounding Sphere</b></h3>
<br>

Let $$B_k$$ be the bounding sphere of the light source $$L_k$$. The center $$c_k = (c_{kx}, c_{ky}, c_{kz})$$ of $$B_k$$ is the light position, and the radius $$r_k$$ of $$B_k$$ is the distance at which the maximum component of the light intensity $$I_k$$ equals a user-defined scalar value, let's call it $$I_{k, min}$$. This assumes the use of **inverse square law** to model the attenuation of the light source, which states that the light intensity $$I$$ is inversely proportional to the square of the distance $$d$$ from the light source. That is, the intensity of the light source at distance $$d$$; call it $$I_d$$, is

$$
I_d = \frac{I}{d^2}
$$

Hence, we can calculate the radius of $$B_k$$ as follows: 

$$
r = \sqrt{\frac{max \; (I.r, \; I.g, \; I.b)}{I_{k, min}}}
$$

<br>

Below is the code for the function that computes the bounding sphere for a light source: 

```c++
glm::vec4 ComputeLightBoundingSphere(glm::vec3 position, glm::vec3 color, float minIntensity)
{
    float radius = sqrt(max{color.r, color.g, color.b} / minIntensity);
    
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

Since the ***ndc*** coordinates are in the range of $$[-1, 1]$$, then each tile has ***ndc*** resolution of $$\frac{2}{N_x} \times \frac{2}{N_y}$$. This means that the range of ***ndc*** coordinates of tile $$T_{ij}$$ is, 

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

Now, let's start by deriving the equation for the **left** plane $$\pi_{ij}^L$$ of the frustum $$F_{ij}$$. The points that lie on the plane $$\pi_{ij}^L$$ are the set of points $$q_{view}$$ in view-space such that when converted to ***ndc***, their x-coordinates is equal to $$x^{ij}_{ndc, min}$$. More formally, 

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

Next, let's derive the equation of the **right** plane $$\pi_{ij}^R$$ of the frustum $$F_{ij}$$. The points that lie on the plane $$\pi_{ij}^R$$ are the set of points $$q_{view}$$ in view-space such that when converted to ***ndc***, their x-coordinates is equal to $$x^{ij}_{ndc, max}$$. More formally, 

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

Now, let's start by deriving the equation of the **bottom** plane $$\pi_{ij}^B$$ of the frustum $$F_{ij}$$. The points that lie on the plane $$\pi_{ij}^B$$ are the set of points $$q_{view}$$ in view-space such that when converted to ***ndc***, their y-coordinates is equal to $$y^{ij}_{ndc, min}$$. More formally, 

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
projectionMatrix[0] \cdot q_{view} - y^{ij}_{ndc, min} \; projectionMatrix[3] \cdot q_{view} = 0
$$

$$
(projectionMatrix[0] - y^{ij}_{ndc, min} \cdot projectionMatrix[3]) \cdot q_{view} = 0
$$

<br>
This means that the equation of the bottom plane $$\pi_{ij}^B$$ of the frustum $$F_{ij}$$ is 

<br>

$$
\pi_{ij}^B: \; projectionMatrix[0] - y^{ij}_{ndc, min} \cdot projectionMatrix[3]
$$

<br>
<br>
<h4 id = "DerivingEquationforTopPlane"><b>Deriving Equation for Top Plane \(\pi_{ij}^T\)</b></h4>
<br>

Next, let's derive the equation of the **top** plane $$\pi_{ij}^T$$ of the frustum $$F_{ij}$$. The points that lie on the plane $$\pi_{ij}^T$$ are the set of points $$q_{view}$$ in view-space such that when converted to ***ndc***, their y-coordinates is equal to $$y^{ij}_{ndc, max}$$. More formally, 

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

Consider an arbitrary plane $$P$$ and a point $$q$$. We know that the equation

<br>

$$
P \cdot q = d
$$

<br>

gives the signed distance $$d$$ between the point $$q$$ and the plane $$P$$. If $$d \geq 0$$, then $$q$$ is on the side of the plane to where normal vector of the plane points; or in other words, $$q$$ is on the **positive** side of the plane. On the other hand, if $$d \leq 0$$, then $$q$$ is on the side of the plane opposite to where the normal vector of the plane points; or in other words, $$q$$ is on the **negative** side of the plane.

<br>

Now, to be able to test whether the point $$q_{view}$$ is inside frustum $$F_{ij}$$, the following conditions must be true: 

<br>

- $$q_{view}$$ is on the positive side of the plane $$\pi_{ij}^L$$

- $$q_{view}$$ is on the negative side of the plane $$\pi_{ij}^R$$

- $$q_{view}$$ is on the positive side of the plane $$\pi_{ij}^B$$

- $$q_{view}$$ is on the negative side of the plane $$\pi_{ij}^T$$

<br>

More formally,

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
\pi_{ij}^B: \; projectionMatrix[0] - y^{ij}_{ndc, min} \cdot projectionMatrix[3]
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
    We can use the global near and far planes of the view frustum as the near and far planes of each tile frustum \(F_{ij}\). However, this results in a loose frustum for each tile, leading to many false-positive intersections with light bounding spheres. A better approach is to compute the per-tile depth bounds (minimum and maximum depth) from the depth buffer, and use them to construct tighter near and far planes, and in turn, tighter tile frustums. 

    <br>
    <br>
    <br>

    This requires the implementation of a depth pre-pass before the light culling stage. This pre-pass will bake the depth values of all pixels on the screen into a depth buffer, which is then used in the light culling pass to compute the depth bounds of each tile, and consequently, the near and far plane of the frustum \(F_{ij}\) of the tile \(T_{ij}\). 
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
<h4 id="TileMinMaxDepthParallelAlgorithm"><b>Tile-Based Min/Max Depth Reduction for Light Culling</b></h4>
<br>

We can compute the minimum and maximum depth of each tile in **parallel** using the following algorithm: 

<blockquote>
Suppose the screen is dissected into \(N_x \times N_y\) tiles, where each tile \(T_{ij}\) has a resolution of \(R_x \times R_y\). Do the following: 
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

The depth values inside the depth buffer are in window-space in the range of $$[0,1]$$. They must be converted to view-space. Depending on the type of projection used, the conversion process differs. 

<br>

Let $$n$$ and $$f$$ be the near and far clipping plane of the view frustum. There are **two** types of projections: **OpenGL-style projection** and **Vulkan-style projection**

<br>
#### **OpenGL-style projection**
<br>

OpenGL-style projection maps view-space depth values to ***ndc*** values to be in the range of $$[-1,1]$$ before converting to window-space to be in the range of $$[0,1]$$. 

<br>
##### **Perspective Projection**
<br>

The following GLM library function apply perspective OpenGL-style projection:

```cpp
glm::perspective()
```

<br>
In the case of openGL-style perspective projection, $$z_{ndc}$$ is calculated as follows: 

$$
z_{ndc} = \frac{\frac{f+n}{f-n} \, z_{view} + \frac{2fn}{f-n}}{-z_{view}}
$$

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
##### **Orthographic Projection**
<br>

The following GLM library function apply orthographic OpenGL-style projection:

```cpp
glm::ortho()
```

<br>

In the case of openGL-style orthographic projection, $$z_{ndc}$$ is calculated as follows: 

$$
z_{ndc} = \frac{2}{f - n} \, z_{view} - \frac{f+n}{f-n}
$$

and hence, $$z_{view}$$ can be calculated as follows: 

$$
z_{view} = \frac{(f - n)(z_{ndc} + \frac{f+n}{f-n})}{2}
$$

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
#### **Vulkan-style projection**
<br>

Vulkan-style projection maps view-space depth values to ***ndc*** values to be in the range of $$[0,1]$$, which is then stored as in the depth-buffer.

<br>
##### **Perspective Projection**
<br>

The following GLM library function apply perspective Vulkan-style projection:

```cpp
glm::perspectiveRH_ZO()
```

<br>

In the case of Vulkan-style perspective projection, $$z_{ndc}$$ is calculated as follows: 

$$
z_{ndc} = \frac{\frac{f}{f-n} \, z_{view} - \frac{fn}{f-n}}{-z_{view}}
$$

and hence, $$z_{view}$$ can be calculated as follows: 

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

Below is the code for a function that converts a depth value from window-space to view-space, assuming the use of OpenGL-style perspective projection. 

```cpp
float LinearizeDepth(float depthWindowSpace, float n, float f)
{
       return ((n*f) / (f - depthWindowSpace * (f-n))
}
```

<br>
##### **Orthographic Projection**
<br>

The following GLM library function apply perspective Vulkan-style projection:

```cpp
glm::orthoRH_ZO()
```

<br>

In the case of Vulkan-style orthographic projection, $$z_{ndc}$$ is calculated as follows: 

$$
z_{ndc} = \frac{z_{view} - n}{f - n}
$$

and hence, $$z_{view}$$ can be calculated as follows: 

$$
z_{view} = z_{ndc}(f-n) + n
$$

<br>

Below is the code for a function that converts a depth value from window-space to view-space, assuming the use of Vulkan-style orthographic projection. 

```cpp
float LinearizeDepth(float depthWindowSpace, float n, float f)
{
       return depthWindowSpace * (f-n) + n
}
```

<br>
<hr>
<br>

Below is a snippet of the compute shader code that linearizes the depth values sampled from the depth buffer, and computes the minimum and maximum depth for each tile.

<br>

```cpp
shared vec2 threadDepths[numThreadsPerWorkGroup];

float LinearizeDepth(float depth)
{
    return (cameraNearPlane * cameraFarPlane) / (cameraFarPlane - depth * (cameraFarPlane - cameraNearPlane));
}

vec2 ComputeMinMaxDepth()
{
    uint threadIndex = (gl_LocalInvocationID.y * tileResolution.x) + gl_LocalInvocationID.x;
        
    uint tileIndex = (gl_WorkGroupID.y * uint(numTiles2D.x)) + gl_WorkGroupID.x;

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
    
    float minDepth = threadDepths[0].x;
    float maxDepth = threadDepths[0].y;
    
    return vec2(minDepth, maxDepth);
}
```

<br>
<br>
<h3 id = "FrustumLightIntersection"><b>Frustum-Sphere Intersection Test</b></h3>
<br>

Consider the frustum $$F_{ij}$$ of the tile $$T_{ij}$$, and the bounding sphere $$B_k$$ of the light source $$L_k$$, where $$r_k$$ and $$c_k = (c_{kx}, c_{ky}, c_{kz})$$ are the radius and the center of the bounding sphere respectively. We want to test the intersection between $$B_k$$ and $$F_{ij}$$.

<br>

Let $$n$$ and $$f$$ be the near and far plane of the frustum $$F_{ij}$$, and $$d_{k, min}$$ and $$d_{k, max}$$ be the minimum and maximum depth of the bounding sphere $$B_k$$ respectively, where 

$$
d_{k, min} = c_{kz} - r_k
$$

$$
d_{k, max} = c_{kz} + r_k
$$

<br>

If $$d_{k, min} > f$$, then the entire sphere $$B_k$$ is beyond the far plane, and hence, $$B_k$$ is not intersecting with $$F_{ij}$$. Similarly, if $$d_{k, max} < n$$, then the entire sphere $$B_k$$ is beyond the near plane, and thus, $$B_k$$ is not intersecting with $$F_{ij}$$.

<br>

Next, we need to check whether the bounding sphere $$B_k$$ is within the left, right, bottom and top planes of the frustum. We discussed that the equation

$$
P \cdot q = d
$$

gives the signed distance $$d$$ between the plane $$P$$ and the point $$q$$, where if $$d \geq 0$$, then $$q$$ must be on the positive side of the plane, and if $$d \leq 0$$, then $$q$$ must be on the negative side of the plane. 

<br>

We also discussed that a point $$q_{view}$$ is inside the frustum $$F_{ij}$$ if all of the following is true: 

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


To check whether the sphere $$B_k$$ is inside the frustum $$F_{ij}$$ or not, we need to compute the signed distance $$d$$ between the center $$c_k$$ and each plane of the frustum. If there exist at least one plane $$\pi_{ij}$$ in the frustum $$F_{ij}$$ in which the distance $$d$$ between $$c_k$$ and $$\pi_{ij}$$ is negative and greater than the radius $$r_k$$, then the bounding sphere $$B_k$$ must be completely outside the frustum $$F_{ij}$$. Otherwise, the bounding sphere $$B_k$$ is intersecting or inside the frustum $$F_{ij}$$.

<br>

Below is the code for a function that checks for intersection between the bounding sphere of the light source and the frustum of the tile.

```cpp
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
```

<br>
<hr>
<br>

Below is the code for the complete compute shader that implements naive light culling algorithm, assuming the resolution of each tile is $$16 \times 16$$, and hence, the use of a grid of $$16 \times 16$$ threads in each workgroup.

```cpp
#version 450

layout(local_size_x = 16, local_size_y = 16, local_size_z = 1) in;

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
};

layout(std430, binding = 5) readonly buffer TilesFrustumPlanes{
    vec4 tilesFrustumPlanes[];
};

const uvec2 tileResolution = uvec2(16, 16);
const uint numThreadsPerWorkGroup = tileResolution.x * tileResolution.y;
shared vec2 threadDepths[numThreadsPerWorkGroup];

float LinearizeDepth(float depth)
{
    return (cameraNearPlane * cameraFarPlane) / (cameraFarPlane - depth * (cameraFarPlane - cameraNearPlane));
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

    return true;
}

void main()
{
    uint threadIndex = (gl_LocalInvocationID.y * tileResolution.x) + gl_LocalInvocationID.x;
    
    uint numLights = lightBoundingSpheresViewSpace.length();
    
    uint tileIndex = (gl_WorkGroupID.y * uint(numTiles2D.x)) + gl_WorkGroupID.x;

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
    
    float minDepth = threadDepths[0].x;
    float maxDepth = threadDepths[0].y;
    
    if(threadIndex == 0)
        tileLightCount[tileIndex] = 0;
    
    barrier();
    
    if(threadIndex < numLights){
        vec4 lightBoundingSphere = lightBoundingSpheresViewSpace[threadIndex];
        if(IsLightVisible(lightBoundingSphere, minDepth, maxDepth, tileIndex)){
            uint i = atomicAdd(tileLightCount[tileIndex], 1);
            tileLightIndices[(tileIndex * numLights)+i] = threadIndex;
        }
    }
}
```

<br>
<br>

Below is a snippet code of the fragment shader of the main shading pass that computes the tile the fragment resides in, and in turn, determines the list of light indices to traverse to compute lighting. 
 
```cpp
uvec2 tileUV = uvec2(gl_FragCoord.xy) / tileResolution;
uint tileIndex = (tileUV.y * fs.numTiles2D.x) + tileUV.x;
float depth = LinearizeDepth(gl_FragCoord.z);
float minDepth = tileLightCullingPrepass[tileIndex].x;
float maxDepth = tileLightCullingPrepass[tileIndex].y;
uint tileCellIndex = ComputeCellIndex(depth, minDepth, maxDepth);
uint lightCount = tileLightCount[(tileIndex * numCellsPerTile) + tileCellIndex];
uint startingIndex = (tileIndex * fs.numLights * numCellsPerTile) + (tileCellIndex * fs.numLights);
uint endingIndex = startingIndex + lightCount;
```

<br>
<br>
<h3 id = "DepthDiscont"><b>Depth Discontinuities</b></h3>
<br>

One of the main problems of the **naive** light culling algorithm is a phenomena called **Depth Discontinuities**. 

Consider an arbitrary scene that is rendered using an engine that is implementing a naive light culling algorithm. If a tile does not have any geometry triangles in it, the computed minimum and maximum depth of the tile will be zero, and hence, there will be no intersections between light bounding spheres and the frustum of that tile. 

However, consider a tile that contains triangles really close to the near plane, and triangles really close to the far plane, with no triangles at in the region in between. The range between the computed minimum and maximum depth of that tile will be huge, and in turn, the tile frustum will be huge, resulting in many false-positive intersections with light's bounding spheres, and thus, defeating the purpose of light culling. 

This scene example is not an extreme case. Rather it is fairly common. Examples of these scenes are: 

- A scene of a forest with tall grass or vegetation

- A scene of a character framed against a distant mountain

- etc...

<br>

The solution to this problem is to use an algorithm called **$$2.5D$$ light culling algorithm**. 

<br>

<br>
<h3 id = "25DCullingAlgorithm"><b>\(2.5D\) Light Culling Algorithm</b></h3>
<br>

The idea of the $$2.5D$$ light culling algorithm is to split the depth range of the tile into $$n$$ cells. Each cell is independent, and has its own array of light indices $$V_{ij}$$, and its own light count $$C_{ij}$$. 

For each pixel $$P_{gk}$$ within the tile $$T_{ij}$$, we will sample its depth value from the depth buffer, and accordingly, compute the index of the depth cell it resides. The cells that contains pixels will be marked as **occupied**, and those that do not will be marked as **empty**. 

Then, while checking for intersection between the light bounding sphere and the frustum of the tile, we will compute the minimum and maximum cell indices the light bounding sphere occupies. If all the cells in that range are empty, then the light bounding sphere will not be appended to $$V_{ij}$$, even if it intersects the frustum, since there is no geometry in those regions in the first place to be affected by lighting. If there is at least one cell in that range of cells that is occupied, then light bounding sphere is appended to the array $$V_{ij}$$.

The depth range can be sliced either linearly, in which all slices are equal, logarithmically, in which cells get bigger as it approaches the far plane. Logarithmic slicing is preferred, since perspective projection causes depth values near the camera to be in high resolution than those far away. Having tiny slices near the camera allows finer separation of geometry into seperate slices. 

<br>

Below is the code for the function that computes the cell slice of the pixel:

```cpp
uint ComputeCellIndex(float depth, float minDepth, float maxDepth)
{
    float depth01 = log(depth / minDepth) / log(maxDepth / minDepth);
    uint cellIndex = uint(depth01 * float(numCellsPerTile));
    
    return max(min(cellIndex, numCellsPerTile - 1u), 0);
}
```

<br>

A typical way to represent cells in the depth range is the use of the bits within a variable. That is, each bit within the variable represents a cell in the depth range. If the bit is $$0$$, then that cell is empty. Otherwise, the cell is occupied. 

<br>

<figure class="col-md-12 text-center theme-img repo-img-light">
    {% include figure.html  path="assets/img/Blog/LightCulling/Dark/DepthSlicing.png" class="scaled-img70"%}
<figcaption>Depth Slicing</figcaption>
</figure>
<figure class="col-md-12 text-center theme-img repo-img-dark">
    {% include figure.html  path="assets/img/Blog/LightCulling/Light/DepthSlicing.png" class="scaled-img70"%}
<figcaption>Depth Slicing</figcaption>
</figure>

<br>

The bits of the unsigned integer variable can be filled in parallel using the following code: 

```cpp
uvec2 textureCoordinates = (gl_WorkGroupID.xy * tileResolution) + gl_LocalInvocationID.xy;
float depth = LinearizeDepth(texelFetch(depthTexture, ivec2(textureCoordinates), 0).r);
uint threadCellIndex = ComputeCellIndex(depth, minDepth, maxDepth);
atomicOr(tilesGeometryBitMask[tileIndex], 1u << threadCellIndex);
```

> The naive light culling algorithm is considered a case of the 2.5D culling algorithm, in which $$n = 1$$. Another light culling algorithm called **HalfZ** is also considered another case in which $$n = 2$$ 

<br>
<hr>
<br>

Below is the code for the complete compute shader that implements 2.5D light culling algorithm, assuming the number of cells per tile is 32, and the resolution of each tile is $$16 \times 16$$, and hence, the use of a grid of $$16 \times 16$$ threads in each workgroup.

```cpp
#version 450

layout(local_size_x = 16, local_size_y = 16, local_size_z = 1) in;

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

layout(std140, binding = 4) uniform LightCullingUniformVariables {
    float nearClippingPlane;
    float farClippingPlane;
    uvec2 numTiles2D;
};

layout(std430, binding = 5) readonly buffer TilesFrustumPlanes{
    vec4 tilesFrustumPlanes[];
};

const uint numCellsPerTile = 32;
const uvec2 tileResolution = uvec2(16, 16);
const uint numThreadsPerWorkGroup = tileResolution.x * tileResolution.y;
shared vec2 threadDepths[numThreadsPerWorkGroup];

struct LightVisibilityInfo{
    bool isVisible;
    uint minCell;
    uint maxCell;
};

float LinearizeDepth(float depth)
{
    return (cameraNearPlane * cameraFarPlane) / (cameraFarPlane - depth * (cameraFarPlane - cameraNearPlane));
}

uint ComputeCellIndex(float depth, float minDepth, float maxDepth)
{
    float depth01 = log(depth / minDepth) / log(maxDepth / minDepth);
    uint cellIndex = uint(depth01 * float(numCellsPerTile));
    
    return max(min(cellIndex, numCellsPerTile - 1u), 0);
}

LightVisibilityInfo IsLightVisible(vec4 lightBoundingSphere, float minDepth, float maxDepth, uint tileGeometryBitMask, uint tileIndex)
{
    LightVisibilityInfo info;
    
    vec3 lightCenter = lightBoundingSphere.xyz;
    float lightDepth = -lightBoundingSphere.z;
    float radius = lightBoundingSphere.w;
    
    float lightMinDepth = lightDepth - radius;
    float lightMaxDepth  = lightDepth + radius;
    if(lightMaxDepth < minDepth) {
        info.isVisible = false;
        return info;
    }
    if(lightMinDepth > maxDepth) {
        info.isVisible = false;
        return info;
    }

    uint baseP = tileIndex * 4;
        
    for(int i = 0; i < 4; i++){
        vec4 plane = tilesFrustumPlanes[baseP+i];
        if(dot(plane, vec4(lightCenter, 1.0f)) < -radius){
            info.isVisible = false;
            return info;
        }
    }
    
    uint i1 = ComputeCellIndex(lightMinDepth, minDepth, maxDepth);
    uint i2 = ComputeCellIndex(lightMaxDepth, minDepth, maxDepth);
    
    info.minCell = min(i1, i2);
    info.maxCell = max(i1, i2);
    
    bool isDiscard = true;
    for(uint i = info.minCell; i <= info.maxCell; i++){
        if(((tileGeometryBitMask >> i) & 1u) == 1){
            isDiscard = false;
            break;
        }
    }
    
    if(isDiscard){
        info.isVisible = false;
        return info;
    }

    info.isVisible = true;
    return info;
}

void main()
{
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
    
    float minDepth = threadDepths[0].x;
    float maxDepth = threadDepths[0].y;
            
    uint threadCellIndex = ComputeCellIndex(depth, minDepth, maxDepth);
    atomicOr(tileGeometryBitMask, 1u << threadCellIndex);
        
    uint baseC = tileIndex * numCellsPerTile;
                    
    if(threadIndex < numCellsPerTile)
        tileLightCount[baseC+threadIndex] = 0;
    
    barrier();
    
    if(threadIndex < numLights){
        vec4 lightBoundingSphere = lightBoundingSpheresViewSpace[threadIndex];
        LightVisibilityInfo info = IsLightVisible(lightBoundingSphere, minDepth, maxDepth, tileGeometryBitMask, tileIndex);
        if(info.isVisible){
            uint baseI = tileIndex * numLights * numCellsPerTile;
            for(uint j = info.minCell; j <= info.maxCell; j++){
                uint i = atomicAdd(tileLightCount[baseC+j], 1);
                tileLightIndices[baseI+(j*numLights)+i] = threadIndex;
            }
        }
    }
}
```

<br>
<br>

Below is a snippet code of the fragment shader of the main shading pass that determines the tile the fragment resides in, and in turn, the list of light indices to traverse to compute lighting. 
 
```cpp
uvec2 tileUV = uvec2(gl_FragCoord.xy) / tileResolution;
uint tileIndex = (tileUV.y * fs.numTiles2D.x) + tileUV.x;
float depth = LinearizeDepth(gl_FragCoord.z);
float minDepth = tileLightCullingPrepass[tileIndex].x;
float maxDepth = tileLightCullingPrepass[tileIndex].y;
uint tileCellIndex = ComputeCellIndex(depth, minDepth, maxDepth);
uint lightCount = tileLightCount[(tileIndex * numCellsPerTile) + tileCellIndex];
uint startingIndex = (tileIndex * fs.numLights * numCellsPerTile) + (tileCellIndex * fs.numLights);
uint endingIndex = startingIndex + lightCount;
```

<br>
<hr>
<br>
<br>
<p id="Demo">
The github repository containing the entire demo source code can be found <a href="https://github.com/AmrHMorsy/Vejaler">here</a>.
</p>

<br>

***

<br>
<h4 id="References"><b>References</b></h4>
<br>

**[1]** $$$$ $$$$ Harada, T., McKee, J., Yang, J. C. Forward+: Bringing Deferred
Lighting to the Next Level. 2012.
<br>
<br>
**[2]** $$$$ $$$$ T.Harada. A 2.5d culling for forward+. 2012.
<br>
<br>
**[3]** $$$$ $$$$ Chapter 20.3 - Real-time Rendering by Tomas Akenine-Möller, Eric Haines, Naty Hoffman, Angelo Pesce, Michat Iwanicki, and Sébastien Hillaire
<br>
<br>
**[4]** $$$$ $$$$ [Vulkan Documentation](https://docs.vulkan.org/spec/latest/index.html)
<br>
<br>
<br>
<hr>
<br>

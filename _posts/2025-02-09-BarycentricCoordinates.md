---
layout: post
title: Understanding Barycentric Coordinates
date: 2025-02-09 12:00:00
description:
tags:
categories:
thumbnail: assets/img/Blog/BarycentricCoordinates/
featured: false
---

<div class="row align-items-center mt-3">
    <div class="col-md-6">
        <h3><b><b> Introduction </b></b></h3>
        <br>
        <br>
        A <b><b>nondegenerate</b></b> triangle is a triangle where: 
        <br>
        <br>
        <li> All vertices are distinct</li>
        <li> The vertices do not all lie on a single line (Non-collinear vertices)</li>
        <br>
        Consider the following <b>nondegenerate</b> triangle with vertices \(A\), \(B\), and \(C\). 
    </div>
    <div class="col-md-6">
        <figure class="col-md-12 text-center theme-img repo-img-light">
            {% include figure.html loading="lazy"
                 path="assets/img/Blog/BarycentricCoordinates/Dark/1.png"
                 width="550" height="400" %}
        </figure>
        <figure class="col-md-12 text-center theme-img repo-img-dark">
            {% include figure.html loading="lazy"
                 path="assets/img/Blog/BarycentricCoordinates/Light/1.png"
                 width="550" height="400" %}
        </figure>
    </div>
</div>

<br>

<div class="row align-items-center mt-3">
    <div class="col-md-4">
A point \(Q\) that lies on the edge \(AB\) has the form

$$
Q = (1-t)A + tB
$$

where \(0 \leq t \leq 1\).
 
    </div>
    <div class="col-md-8">
        <figure class="col-md-12 text-center theme-img repo-img-light">
            {% include figure.html loading="lazy"
                 path="assets/img/Blog/BarycentricCoordinates/Dark/2.png"
                 width="550" height="400" %}
        </figure>
        <figure class="col-md-12 text-center theme-img repo-img-dark">
            {% include figure.html loading="lazy"
                 path="assets/img/Blog/BarycentricCoordinates/Light/2.png"
                 width="550" height="400" %}
        </figure>
    </div>
</div>


<div class="row align-items-center mt-3">
    <div class="col-md-4">
        Similarly, a point \(R\) that lies on the edge \(QC\) has the form 

        $$
        R = (1-s)Q + sC
        $$

        where \(0 \leq s \leq 1\).
    </div>
    <div class="col-md-8">
        <figure class="col-md-12 text-center theme-img repo-img-light">
            {% include figure.html loading="lazy"
                 path="assets/img/Blog/BarycentricCoordinates/Dark/3.png"
                 width="550" height="400" %}
        </figure>
        <figure class="col-md-12 text-center theme-img repo-img-dark">
            {% include figure.html loading="lazy"
                 path="assets/img/Blog/BarycentricCoordinates/Light/3.png"
                 width="550" height="400" %}
        </figure>
    </div>
</div>

We can rewrite $$R$$ by substituting the equation for $$Q$$. This results in the following equation

$$
R = (1-s)((1-t)A + tB) + sC
$$

$$
R = (1-s)(1-t)A + (1-s)tB + sC
$$

Now, if we sum the coefficients of equation of $$R$$, we get

$$
(1-s)(1-t) + (1-s)t + s = (1 - t - s + st) + (t - st) + s = 1
$$

Since $$R$$ is an arbitrary point inside the triangle $$ABC$$, we can generalize the equation to any point $$P$$. 

That is, any point $$P$$ inside the triangle $$ABC$$ has the form

$$
P = αA + βB + γC
$$

where $$α + β + γ = 1 $$ and $$α, β, γ \geq 0$$. 


<div class="row align-items-center mt-3">
    <div class="col-md-6">
        These coefficients \(α\), \(β\) and \(γ\) are called the <b>barycentric coordinates</b> of \(P\) with respect to the triangle \(ABC\), such that 
        <br>
        <br>
        <li> If \(α = 0\), then \(P\) lies on the edge \(BC\)</li>
        <li> If \(β = 0\), then \(P\) lies on the edge \(AC\)</li>
        <li> If \(γ = 0\), then \(P\) lies on the edge \(AB\)</li>
        
    </div>
    <div class="col-md-6">
        <figure class="col-md-12 text-center theme-img repo-img-light">
            {% include figure.html loading="lazy"
                 path="assets/img/Blog/BarycentricCoordinates/Dark/4.png"
                 width="550" height="400" %}
        </figure>
        <figure class="col-md-12 text-center theme-img repo-img-dark">
            {% include figure.html loading="lazy"
                 path="assets/img/Blog/BarycentricCoordinates/Light/4.png"
                 width="550" height="400" %}
        </figure>
    </div>
</div>

<br>
### **Calculating Barycentric Coordinates** <br>
<br>

<div class="row align-items-center mt-3">
    <div class="col-md-6">
        The equations for calculating the <b>barycentric coordinates</b> are

        $$
        α = \frac{Area(▲PBC)}{Area(▲ABC)}
        $$

        $$
        β = \frac{Area(▲PAC)}{Area(▲ABC)}
        $$

        $$
        γ = \frac{Area(▲PAB)}{Area(▲ABC)}
        $$
        
        <br>

        The proof for these equations will be explained later in this blog post. 
    </div>
    <div class="col-md-6">
        <figure class="col-md-12 text-center theme-img repo-img-light">
            {% include figure.html loading="lazy"
                 path="assets/img/Blog/BarycentricCoordinates/Dark/5.png"
                 width="550" height="400" %}
        </figure>
        <figure class="col-md-12 text-center theme-img repo-img-dark">
            {% include figure.html loading="lazy"
                 path="assets/img/Blog/BarycentricCoordinates/Light/5.png"
                 width="550" height="400" %}
        </figure>
    </div>
</div>

<br>
### **Calculating Area of the Triangle** <br>
<br>

There are 2 ways to calculate the area of the triangle: 

<div class="row align-items-center mt-3">
    <div class="col-md-6">
        <b><b>Approach 1</b></b>
        <br>
        <br>
        The area of the triangle is 

        $$
        Area = \frac{1}{2} \times Base \times Height
        $$

        where \(Height\) is the perpendicular shortest distance from the the base edge to the opposite vertex. 

        For example, the area of triangle \(PBC\) is 

        $$
        Area(▲PBC) = \frac{1}{2} \times ||\vec{BC}|| \times d_{⊥} (P,BC)
        $$
        
    </div>
    <div class="col-md-6">
        <figure class="col-md-12 text-center theme-img repo-img-light">
            {% include figure.html loading="lazy"
                 path="assets/img/Blog/BarycentricCoordinates/Dark/6.png"
                 width="550" height="400" %}
        </figure>
        <figure class="col-md-12 text-center theme-img repo-img-dark">
            {% include figure.html loading="lazy"
                 path="assets/img/Blog/BarycentricCoordinates/Light/6.png"
                 width="550" height="400" %}
        </figure>
    </div>
</div>


<div class="row align-items-center mt-3">
    <div class="col-md-6">
        <b><b>Approach 2</b></b>
        <br>
        <br>
        Another easier way to calculate the area of the triangle, is to use the area of the parallelogram. 

        Consider the parallelogram \(ABCD\). The area of the parallelogram \(ABCD\) is 

        $$
        Area(▰ABCD) = ||\vec{AB}|| \times ||\vec{AC}|| \times sin(\theta)
        $$

        We can also express the area of the parallelogram \(ABCD\) as the magnitude of the cross product of two vectors that lie on the parallelogram. That is, 

        $$
        Area(▰ABCD) = ||\vec{AB} \times \vec{AC}|| 
        $$

        The area of the triangle is equal to half the area of the parallelogram. Hence, the area of the triangle \(ABC\) can be expressed as 

        $$
        Area(▲ABC) = \frac{||\vec{AB}|| \times ||\vec{AC}|| \times sin(\theta)}{2} = \frac{||\vec{AB} \times \vec{AC}|| }{2}
        $$

    </div>
    <div class="col-md-6">
        <figure class="col-md-12 text-center theme-img repo-img-light">
            {% include figure.html loading="lazy"
                 path="assets/img/Blog/BarycentricCoordinates/Dark/7.png"
                 width="550" height="400" %}
        </figure>
        <figure class="col-md-12 text-center theme-img repo-img-dark">
            {% include figure.html loading="lazy"
                 path="assets/img/Blog/BarycentricCoordinates/Light/7.png"
                 width="550" height="400" %}
        </figure>
    </div>
</div>

<div class="row align-items-center mt-3">
    <div class="col-md-6">
        <h3><b><b>Proof</b></b></h3>
        <br>
        <br>
        Consider the triangle \(ABC\). Let \(P\) be a point inside the triangle. We know that 

        $$
        P = αA + βB + γC
        $$

        where \(α + β + γ = 1\) and \(α, β, γ \geq 0\). 
    </div>
    <div class="col-md-6">
        <figure class="col-md-12 text-center theme-img repo-img-light">
            {% include figure.html loading="lazy"
                 path="assets/img/Blog/BarycentricCoordinates/Dark/8.png"
                 width="550" height="400" %}
        </figure>
        <figure class="col-md-12 text-center theme-img repo-img-dark">
            {% include figure.html loading="lazy"
                 path="assets/img/Blog/BarycentricCoordinates/Light/8.png"
                 width="550" height="400" %}
        </figure>
    </div>
</div>

<div class="row align-items-center mt-3">
    <div class="col-md-6">
        We want to prove that 

        $$
        α = \frac{Area(▲PBC)}{Area(▲ABC)}
        $$

        $$
        β = \frac{Area(▲PAC)}{Area(▲ABC)}
        $$

        $$
        γ = \frac{Area(▲PAB)}{Area(▲ABC)}
        $$

        Without loss of generality, consider the barycentric coordinate \(α\). 

        Let \(d_P\) be the perpendicular distance from \(P\) to \(BC\) and \(d_A\) be the perpendicular distance from \(A\) to \(BC\). 
    </div>
    <div class="col-md-6">
        <figure class="col-md-12 text-center theme-img repo-img-light">
            {% include figure.html loading="lazy"
                 path="assets/img/Blog/BarycentricCoordinates/Dark/9.png"
                 width="550" height="400" %}
        </figure>
        <figure class="col-md-12 text-center theme-img repo-img-dark">
            {% include figure.html loading="lazy"
                 path="assets/img/Blog/BarycentricCoordinates/Light/9.png"
                 width="550" height="400" %}
        </figure>
    </div>
</div>


<div class="row align-items-center mt-3">
    <div class="col-md-6">
        We know that the area of triangle \(PBC\) is 

        $$
        Area(▲PBC) = \frac{1}{2} \times ||\vec{BC}|| \times d_P
        $$

        and the area of triangle \(ABC\) is 

        $$
        Area(▲ABC) = \frac{1}{2} \times ||\vec{BC}|| \times d_A
        $$

        From these equations, we can see that

        - \(Area(▲PBC)\) is linearly proportional to the perpendicular distance from \(P\) to \(BC\) ; \(d_P\)

        $$
        Area(▲PBC) ∝ d_P
        $$

        - \(Area(▲ABC)\) is linearly proportional to the perpendicular distance from \(A\) to \(BC\) ; \(d_A\). 

        $$
        Area(▲ABC) ∝ d_A
        $$

        As \(d_P\) decreases, the point \(P\) becomes closer to the edge \(BC\), causing the value of \(α\) to also decrease. When \(d_P=0\), the point \(P\) lies on the edge \(BC\) and \(α=0\). 
    </div>
    <div class="col-md-6">
        <figure class="col-md-12 text-center theme-img repo-img-light">
            {% include figure.html loading="lazy"
                 path="assets/img/Blog/BarycentricCoordinates/Dark/10.png"
                 width="550" height="500" %}
        </figure>
        <figure class="col-md-12 text-center theme-img repo-img-dark">
            {% include figure.html loading="lazy"
                 path="assets/img/Blog/BarycentricCoordinates/Light/10.png"
                 width="550" height="500" %}
        </figure>
    </div>
</div>

<br>
<br>

<div class="row align-items-center mt-3">
    <div class="col-md-6">
        As \(d_P\) increases, the point \(P\) becomes closer to the point \(A\), causing the value of \(α\) to increase. When \(d_P=d_A\), the point \(P\) coincides the point \(A\) and \(α = 1\). 
        
        This implies that \(α\) is proportional to \(d_P\)

        $$
        α ∝ d_P
        $$

        where the proportionality constant is \(d_A\). 

        That is, 

        $$
        α = \frac{d_P}{d_A}
        $$

        Since \(d_P\) is linearly proportional to \(Area(PBC)\) and \(d_A\) is linearly proportional to \(Area(ABC)\), then we can rewrite \(α\) as


        $$
        α = \frac{Area(▲PBC)}{Area(▲ABC)}
        $$

        By applying the same reasoning to the other two coordinates, we obtain that 

        $$
        β = \frac{Area(▲PAC)}{Area(▲ABC)}
        $$

        $$
        γ = \frac{Area(▲PAB)}{Area(▲ABC)}
        $$

        Thus, proof is complete. 
    </div>
    <div class="col-md-6">
        <figure class="col-md-12 text-center theme-img repo-img-light">
            {% include figure.html loading="lazy"
                 path="assets/img/Blog/BarycentricCoordinates/Dark/11.png"
                 width="550" height="500" %}
        </figure>
        <figure class="col-md-12 text-center theme-img repo-img-dark">
            {% include figure.html loading="lazy"
                 path="assets/img/Blog/BarycentricCoordinates/Light/11.png"
                 width="550" height="500" %}
        </figure>
    </div>
</div>
        
<br>
<br>
        
<div class="row align-items-center mt-3">
    <div class="col-md-6">
        <h3><b><b> Applications of Barycentric Coordinates</b></b></h3>
        <br>
        <br>
        In modern <b>computer graphics</b>, triangles are the fundamental building block for rendering. 
        
        <br>
        <br>
        
        All complex geometric meshes are processed in the GPU (Graphics Processing Unit) in terms of triangles. 
        
        <br>
        <br>
        
        Regardless of how complex a 3D model is (e.g., spheres, characters, buildings, etc..), it is ultimately broken down into a mesh of triangles that the GPU processes.
                
        <br>
        <br>
        
        Why triangles? Because today’s <b>GPUs (Graphics Processing Units)</b> are highly optimized to handle triangle-based operations very efficiently.
        
        <br>
        <br>
        
        Because triangles are such a widely used geometric primitive, there are many applications for <b>barycentric coordinates</b>. 
        
        <br>
        <br>
        
        One of the key steps in the graphics pipeline is <b>rasterization</b>. 
        
        <br>
        <br>
        
        During <b>rasterization</b>, the GPU needs to determine whether a pixel is inside the triangle or outside the triangle. 
    </div>
    <div class="col-md-6">
        <figure class="col-md-12 text-center theme-img repo-img-light">
            {% include figure.html loading="lazy"
                 path="assets/img/Blog/BarycentricCoordinates/Dark/12.png"
                 width="700" height="500" %}
        </figure>
        <figure class="col-md-12 text-center theme-img repo-img-dark">
            {% include figure.html loading="lazy"
                 path="assets/img/Blog/BarycentricCoordinates/Light/12.png"
                 width="700" height="500" %}
        </figure>
    </div>
</div>


<div class="row align-items-center mt-3">
    <div class="col-md-4">
        If the pixel is inside the triangle, it will be shaded. If the pixel is outside the triangle, it will not be shaded. 
        
        <br>
        <br>
        
        The GPU uses <b>barycentric coordinates</b> \(α\), \(β\), and \(γ\), given the pixel coordinates and the coordinates of each vertex of the triangle, to determine if the pixel is inside the triangle or outside the triangle.
                
        <br>
        <br>
        
        If \(α + β + γ = 1\) and \(α, β, γ \geq 0\), then the pixel is inside the triangle and it will be shaded. 
        
        <br>
        <br>
        
        Otherwise, the pixel is outside the triangle and it will not be shaded. 
 
    </div>
    <div class="col-md-8">
        <figure class="col-md-12 text-center theme-img repo-img-light">
            {% include figure.html loading="lazy"
                 path="assets/img/Blog/BarycentricCoordinates/Dark/13.png"
                 width="600" height="500" %}
        </figure>
        <figure class="col-md-12 text-center theme-img repo-img-dark">
            {% include figure.html loading="lazy"
                 path="assets/img/Blog/BarycentricCoordinates/Light/13.png"
                 width="600" height="500" %}
        </figure>
    </div>
</div>

<br>

***

<br>
### **References**
<br>
- Chapter 7.9.1 - Computer Graphics: Principles and Practice by John F. Hughes

<br>

***

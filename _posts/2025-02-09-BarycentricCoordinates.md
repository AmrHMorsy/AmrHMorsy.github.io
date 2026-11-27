---
layout: post
title: Barycentric Coordinates
date: 2025-02-09 12:00:00
description:
tags:
categories:
thumbnail: assets/img/Blog/BarycentricCoordinates/
featured: false
---

<br>
<h3><b><b> Introduction </b></b></h3>
<br>

<div class="row align-items-center mt-3">
    <div class="col-md-6">
    A <b>nondegenerate</b> triangle is a triangle where: 
    <br><br>
    <ul><li>All vertices are distinct</li></ul>
    <ul><li>The vertices do not all lie on a single line (Non-collinear vertices)</li></ul>
    <br><br>
        Consider the following <b>nondegenerate</b> triangle with vertices \(A\), \(B\), and \(C\).
    <br><br>
    <br><br>
        A point \(Q\) that lies on the edge \(AB\) has the form

        $$
        Q = (1-t)A + tB
        $$
        where \(0 \leq t \leq 1\).
        <br><br>
        <br><br>
        Similarly, a point \(R\) that lies on the edge \(QC\) has the form 

        $$
        R = (1-s)Q + sC
        $$

        where \(0 \leq s \leq 1\).
    </div>
    <div class="col-md-6">
        <figure class="col-md-12 text-center theme-img repo-img-light">
            {% include figure.html  path="assets/img/Blog/BarycentricCoordinates/Dark/2.png" class="scaled-img70" %}
        </figure>
        
        <figure class="col-md-12 text-center theme-img repo-img-dark">
            {% include figure.html  path="assets/img/Blog/BarycentricCoordinates/Light/2.png" class="scaled-img70" %}
        </figure>
        <figure class="col-md-12 text-center theme-img repo-img-light">
            {% include figure.html  path="assets/img/Blog/BarycentricCoordinates/Dark/3.png" class="scaled-img70" %}
        </figure>
        <figure class="col-md-12 text-center theme-img repo-img-dark">
            {% include figure.html  path="assets/img/Blog/BarycentricCoordinates/Light/3.png" class="scaled-img70" %}
        </figure>
    </div>
</div>

<br><br>

We can rewrite $$R$$ by substituting the equation for $$Q$$.

$$
R = (1-s)((1-t)A + tB) + sC
$$

$$
R = (1-s)(1-t)A + (1-s)tB + sC
$$

If we sum the coefficients of equation $$R$$, we get

$$
(1-s)(1-t) + (1-s)t + s = (1 - t - s + st) + (t - st) + s = 1
$$

<br>

Since $$R$$ is an arbitrary point inside the triangle $$ABC$$, we can generalize the equation to any point $$P$$. That is, any point $$P$$ inside the triangle $$ABC$$ has the form

$$
P = αA + βB + γC
$$

where $$α + β + γ = 1 $$ and $$\; 0 \; \geq α, \; β, \; γ \leq \; 1 \;$$. 

<div class="row align-items-center mt-3">
    <div class="col-md-6">
        These coefficients \(α\), \(β\) and \(γ\) are called the <b>barycentric coordinates</b> of \(P\) with respect to the triangle \(ABC\), such that 
        <br>
        <br>
        <ul><li> If \(α = 0\), then \(P\) lies on the edge \(BC\)</li></ul>
        <ul><li> If \(β = 0\), then \(P\) lies on the edge \(AC\)</li></ul>
        <ul><li> If \(γ = 0\), then \(P\) lies on the edge \(AB\)</li></ul>
        
    </div>
    <div class="col-md-6">
        <figure class="col-md-12 text-center theme-img repo-img-light">
            {% include figure.html 
                 path="assets/img/Blog/BarycentricCoordinates/Dark/4.png"
                class="scaled-img80" %}
        </figure>
        <figure class="col-md-12 text-center theme-img repo-img-dark">
            {% include figure.html 
                 path="assets/img/Blog/BarycentricCoordinates/Light/4.png"
                                 class="scaled-img70" %}
        </figure>
    </div>
</div>

<br><br>
### **The Area of a Triangle** <br>
<br>

There are **two** ways to calculate the area of the triangle: 

<div class="row align-items-center mt-3">
    <div class="col-md-6">
        <b><b>Approach 1</b></b>
        <br>
        <br>
        The area of the triangle is 

        $$
        Area = \frac{1}{2} \;. \; Base \;. \; Height
        $$

        where \(Height\) is the perpendicular shortest distance from the the base edge to the opposite vertex. 

        For example, the area of triangle \(PBC\) is 

        $$
        Area(▲PBC) = \frac{1}{2} \; ||\vec{BC}|| \; d_{⊥} (P,BC)
        $$
        
    </div>
    <div class="col-md-6">
        <figure class="col-md-12 text-center theme-img repo-img-light">
            {% include figure.html 
                 path="assets/img/Blog/BarycentricCoordinates/Dark/6.png"
                                 class="scaled-img70" %}
        </figure>
        <figure class="col-md-12 text-center theme-img repo-img-dark">
            {% include figure.html 
                 path="assets/img/Blog/BarycentricCoordinates/Light/6.png"
                                 class="scaled-img70" %}
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
        Area(▰ABCD) = ||\vec{AB}|| \; ||\vec{AC}|| \; sin(\theta)
        $$

        We can also express the area of the parallelogram \(ABCD\) as the magnitude of the cross product of two vectors that lie on the parallelogram. That is, 

        $$
        Area(▰ABCD) = ||\vec{AB} \times \vec{AC}|| 
        $$

        The area of the triangle is equal to half the area of the parallelogram. Hence, the area of the triangle \(ABC\) can be expressed as 

        $$
        Area(▲ABC) = \frac{||\vec{AB}|| \; ||\vec{AC}|| \; sin(\theta)}{2} = \frac{||\vec{AB} \times \vec{AC}|| }{2}
        $$

    </div>
    <div class="col-md-6">
        <figure class="col-md-12 text-center theme-img repo-img-light">
            {% include figure.html 
                 path="assets/img/Blog/BarycentricCoordinates/Dark/7.png"
                                 class="scaled-img70" %}
        </figure>
        <figure class="col-md-12 text-center theme-img repo-img-dark">
            {% include figure.html 
                 path="assets/img/Blog/BarycentricCoordinates/Light/7.png"
                                 class="scaled-img70" %}
        </figure>
    </div>
</div>

<br><br>
<br>
### **Barycentric Coordinates Equations** <br>
<br>

<blockquote>
<div class="row align-items-center mt-3">
    <div class="col-md-6">
        The equations for calculating the <b>barycentric coordinates</b> \(α\), \(β\) and \(γ\) of the triangle \(ABC\) are:

        $$
        α = \frac{Area(▲PBC)}{Area(▲ABC)}
        $$

        $$
        β = \frac{Area(▲PAC)}{Area(▲ABC)}
        $$

        $$
        γ = \frac{Area(▲PAB)}{Area(▲ABC)}
        $$        
    </div>
    <div class="col-md-6">
        <figure class="col-md-12 text-center theme-img repo-img-light">
            {% include figure.html 
                 path="assets/img/Blog/BarycentricCoordinates/Dark/5.png"
                                 class="scaled-img70" %}
        </figure>
        <figure class="col-md-12 text-center theme-img repo-img-dark">
            {% include figure.html 
                 path="assets/img/Blog/BarycentricCoordinates/Light/5.png"
                                 class="scaled-img70" %}
        </figure>
    </div>
</div>
<br><br>
<b><b>Proof</b></b>
<br>
<br>

<div class="row align-items-center mt-3">
    <div class="col-md-6">
        Let \(P\) be a point inside the triangle \(ABC\). We know that 

        $$
        P = αA + βB + γC
        $$

        where \(α + β + γ = 1\) and \(α, β, γ \geq 0\). 
        
        <br><br><br>
        
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
        <br>
        Without loss of generality, consider the barycentric coordinate \(α\). 
        <br><br><br>
        We know that the area of triangle \(PBC\) is 

        $$
        Area(▲PBC) = \frac{1}{2} \; ||\vec{BC}|| \; d_P
        $$

        and the area of triangle \(ABC\) is 

        $$
        Area(▲ABC) = \frac{1}{2} \; ||\vec{BC}|| \; d_A
        $$
    </div>
    <div class="col-md-6">
        <figure class="col-md-12 text-center theme-img repo-img-light">
            {% include figure.html 
                 path="assets/img/Blog/BarycentricCoordinates/Dark/9.png"
                                 class="scaled-img70" %}
        </figure>
        <figure class="col-md-12 text-center theme-img repo-img-dark">
            {% include figure.html 
                 path="assets/img/Blog/BarycentricCoordinates/Light/9.png"
                                 class="scaled-img70" %}
        </figure>
    </div>
</div>

<div class="row align-items-center mt-3">
    <div class="col-md-8">
        Let \(d_P\) be the perpendicular distance from \(P\) to \(BC\) and \(d_A\) be the perpendicular distance from \(A\) to \(BC\). 
        <br><br>
        As \(d_P\) increases, the point \(P\) becomes closer to the point \(A\), causing the value of \(α\) to increase. When \(d_P=d_A\), the point \(P\) coincides the point \(A\) and \(α = 1\). 
        
        <br><br>
        
        Similarly, as \(d_P\) decreases, the point \(P\) becomes closer to the edge \(BC\) and the value of \(α\) to also decrease. When \(d_P=0\), the point \(P\) lies on the edge \(BC\) and \(α=0\). 
        
        <br><br>
        
        This implies that \(α\) is proportional to \(d_P\)

        $$
        α ∝ d_P
        $$

        where the proportionality constant is \(d_A\). 

        That is, 

        $$
        α = \frac{d_P}{d_A}
        $$
        <br><br>
        Using the equations for the area of triangle \(▲PBC\) and \(▲ABC\), we can rewrite the equation for \(α\) as: 
        
        $$
        α = \frac{d_P}{d_A} = \frac{\frac{2 \; . \; Area(▲PBC)}{||\vec{BC}||}}{\frac{2 \; . \; Area(▲ABC)}{||\vec{BC}||}}
        $$
        
        <br>
        
        $$
        α = \frac{Area(▲PBC)}{Area(▲ABC)}
        $$

        <br>
        
        By applying the same reasoning to the other two coordinates, we obtain that 

        $$
        β = \frac{Area(▲PAC)}{Area(▲ABC)}
        $$

        $$
        γ = \frac{Area(▲PAB)}{Area(▲ABC)}
        $$

        Thus, proof is complete. 
        <br><br>
    </div>
    <div class="col-md-4">
        <figure class="col-md-12 text-center theme-img repo-img-light">
            {% include figure.html 
                 path="assets/img/Blog/BarycentricCoordinates/Dark/10.png"
                                 class="scaled-img90" %}
        </figure>
        <figure class="col-md-12 text-center theme-img repo-img-dark">
            {% include figure.html 
                 path="assets/img/Blog/BarycentricCoordinates/Light/10.png"
                                 class="scaled-img90" %}
        </figure>
        <figure class="col-md-12 text-center theme-img repo-img-light">
            {% include figure.html 
                 path="assets/img/Blog/BarycentricCoordinates/Dark/11.png"
                                 class="scaled-img70" %}
        </figure>
        <figure class="col-md-12 text-center theme-img repo-img-dark">
            {% include figure.html 
                 path="assets/img/Blog/BarycentricCoordinates/Light/11.png"
                                 class="scaled-img70" %}
        </figure>
    </div>
</div>

<br><br>
\(\blacksquare\)
</blockquote>


<br><br>

***

<br>
### **References**
<br>
- Chapter 7.9.1 - Computer Graphics: Principles and Practice by John F. Hughes

<br>

<hr>

<br>


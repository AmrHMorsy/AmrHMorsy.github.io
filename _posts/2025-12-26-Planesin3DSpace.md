---
layout: post
title: Planes in 3D Space
date: 2025-12-27 09:00:00
description: Planes in 3D Space
tags:
categories:
thumbnail: assets/img/Blog/PlanesIn3DSpace/
featured: false
---

<br>
<blockquote>
    <div class="row align-items-center mt-3">
        <div class="col-md-8">
            Let \(U\) and \(V\) be vectors. If \(U \cdot V = 0\), then \(U\) and \(V\) are perpendicular to each other.
        </div>
        <div class="col-md-4">
            <figure class="col-md-6 text-center theme-img repo-img-light">
              {% include figure.html loading="lazy"
                 path="assets/img/Blog/PlanesIn3DSpace/Dark/1.png"
                 width="300" height="300" %}
            </figure>
            <figure class="col-md-6 text-center theme-img repo-img-dark">
              {% include figure.html loading="lazy"
                 path="assets/img/Blog/PlanesIn3DSpace/Light/1.png"
                 width="300" height="300" %}
            </figure>
        </div>
    </div>
</blockquote>



<br>
### **Plane Equation** <br>
<br>

Given a point $$P$$ and a normal $$N = (A, B, C)$$, the plane passing through the point $$P$$ that is perpendicular to the normal $$N$$ is defined as the set of points $$Q = (x, y, z)$$, such that 

<br>

\begin{equation}
N \cdot (Q-P) = 0
\end{equation}

<br>

We can rewrite this equation as 

$$
N \cdot (Q-P) = 0
$$

$$
(N \cdot Q) - (N \cdot P) = 0
$$

$$
Ax + By + Cz - (N \cdot P) = 0
$$

$$
Ax + By + Cz + D = 0
$$

where $$D = - (N \cdot P)$$. 



<blockquote>
<div class="row align-items-center mt-3">
  <div class="col-md-6">
The value of \(\frac{|D|}{||N||}\) is the distance by which the plane is offset from a parallel plane that passes through the origin. 

<br>
<br>

<b>Proof</b>
<br>
<br>
We can expand \(\ \frac{|D|}{||N||} \) as follows: 

$$
\frac{|D|}{||N||} = \frac{|-N \cdot P|}{||N||} = \frac{N \cdot P}{||N||} = \frac{N}{||N||} \cdot P
$$ 

By the definition of the dot product, the value of \(\ \frac{N}{||N||} \cdot P \) represents the length of the vector \(P\) projected onto the normalized vector \(N\). 

<br>
<br>

Since \(||P||\) is the distance from \(P\) to the origin, then \(\frac{N}{||N||} \cdot P\) is the distance from \(P\) to the origin along the normalized normal \(N\). Also, all the points that lie on the plane have the same distance to the origin along the normal \(N\) as the point \(P\). Thus, we can conclude that \(\frac{N}{||N||} \cdot P\) is the distance from the plane to another parallel plane that passes through the origin. 
  </div>
  
    <div>
        <figure class="col-md-6 text-center theme-img repo-img-light">
            {% include figure.html loading="lazy"
                 path="assets/img/Blog/PlanesIn3DSpace/Dark/2.png"
                 width="500" height="400" %}
        </figure>
        <figure class="col-md-6 text-center theme-img repo-img-dark">
            {% include figure.html loading="lazy"
                 path="assets/img/Blog/PlanesIn3DSpace/Light/2.png"
                 width="500" height="400" %}
        </figure>
    </div>

</div>

</blockquote>

<div class="row align-items-center mt-3">
  <div class="col-md-8">

If the normal \(N\) is normalized, then we can say that the equation 

\begin{equation}
d = (N.Q) + D
\end{equation}

gives the signed distance \(d\) from the plane to another parallel plane that passes through \(Q\). 

<br>
<br>

<ul><li> If \(d = 0\), then \(Q\) lies on the plane. </li></ul>
<br>
<ul><li> If \(d > 0\), then \(Q\) lies on the positive side of the plane --- the side in which the normal points.  </li></ul>
<br>
<ul><li> If \(d < 0\), then \(Q\) lies on the negative side of the plane --- the side opposite in which the normal points.  </li></ul>

   </div>
   
    <div>
        <figure class="col-md-4 text-center theme-img repo-img-light">
            {% include figure.html loading="lazy"
                 path="assets/img/Blog/PlanesIn3DSpace/Dark/3.png"
                 width="450" height="450" %}
        </figure>
        <figure class="col-md-4 text-center theme-img repo-img-dark">
            {% include figure.html loading="lazy"
                 path="assets/img/Blog/PlanesIn3DSpace/Light/3.png"
                 width="450" height="450" %}
        </figure>
    </div>

</div>

```c++
struct Plane{
    float D;
    glm::vec3 N;
};

float ComputeOffsetFromPlane(Plane P, glm::vec3 Q)
{
    return glm::dot(P.N, Q) + P.D;
}
```

<blockquote>
<div class="row align-items-center mt-3">
  <div class="col-md-12">
         We can also derive the equation of a plane if only given three points \(P\), \(Q\), and \(R\) on the plane. Using these points, we can form two vectors \(PQ\) and \(PR\) as follows: 

$$
\vec{PQ} = Q - P
$$

$$
\vec{PR} = R - P
$$

The normal of the plane can be calculated by taking the cross product of \(PQ\) and \(PR\) as follows: 

$$
N = \vec{PQ} \times \vec{PR}
$$ 

The plane equation can be constructed using the derived normal \(N\) and any one of the points \(P\), \(Q\) or \(R\).
  </div>

</div>
</blockquote>

<br>

```c++
struct Plane{
    float D;
    glm::vec3 N;
};

Plane ComputePlane(glm::vec3 P, glm::vec3 Q, glm::vec3 R)
{
    glm::vec3 PQ = Q - P;
    glm::vec3 PR = R - P;
    
    glm::vec3 N = glm::cross(PQ, PR);
    float D = - glm::dot(N, P);
    return Plane{
        .N = N, 
        .D = D
    };
}
```

<br>

It is sometimes convenient to represent a plane using 4D vectors. We can use the shorthand notation of 
$$L = (N, D)$$. If we treat the 3D points as 4D homogenous points with $$w = 1$$, then the plane equation can be re-written as 

\begin{equation}
d = L \cdot Q
\end{equation}

<br>

```c++
float ComputeOffsetFromPlane(glm::vec4 p, glm::vec4 Q)
{
    return glm::dot(p, Q);
}
```

<br>
### **Intersection of a Line and a Plane**
<br>

We know that the equation $$P(t) = S + tV$$ represents a line containing the point $$S$$ and running in a direction parallel to the direction $$V$$. We can find the point of intersection between a line and a plane by substituting $$P(t)$$ into the plane equation and solving for $$t$$. 

$$
N \cdot P(t) + D = 0
$$

$$
N \cdot (S + tV) + D = 0
$$

$$
(N \cdot S) + (N \cdot V)t + D = 0
$$

\begin{equation}
t = \frac{- (N \cdot S) - D}{(N \cdot V)}
\end{equation}

Plugging the value of $$t$$ back into the line equation gives us the point of intersection. 

$$
P(t) = S + tV
$$

$$
P(t) = S + \frac{- (N \cdot S) - D}{(N \cdot V)} V
$$

> If $$N \cdot V = 0$$, then $$V$$ is perpendicular to $$N$$. This means that the line is parallel to the plane. In that case, if $$N \cdot S + D = 0$$, then the line lies on the plane. Otherwise, there is no point of intersection between them.

If the plane is represented in 4D, then we can rewrite equation 4 as follows: 

$$
L \cdot P(t) = 0
$$

$$
L \cdot (S + tV) = 0
$$

$$
(L \cdot S) + (L \cdot V)t = 0
$$

$$
t = \frac{-(L \cdot S)}{L \cdot V}
$$

<br>
### **Intersection of a Ray and a Plane** <br>
<br>

Checking for ray-plane intersection is identical to the line-plane intersection we discussed earlier. This is because a ray is the same as a line, except that a ray has one starting point and extends infinitely in one direction, while a line has no starting point and extends infinitely in both direction.

The equation $$P(t) = P_0 + tV$$ represents a ray with a starting point $$P_0$$ and running in a direction parallel to $$V$$. We can find the point of intersection between the ray and a plane by substituting $$P(t)$$ into the plane equation and finding the value of $$t$$: 

$$
N \cdot P(t) + D = 0
$$

$$
N \cdot (P_0 + tV) + D = 0
$$

$$
t = \frac{- (N \cdot P_0) - D}{(N \cdot V)}
$$

If $$t > 0$$, then the ray intersects the plane. Otherwise, there is no intersection. 

To find the point of intersection, we simply plug the value of $$t$$ back into the equation of the ray. 

> Similar to the line-plane intersection, $$V$$ is perpendicular to $$N$$ if $$N \cdot V = 0$$. This means that the ray is running parallel to the plane. In that case, if $$N \cdot P_0 + D = 0$$, then the ray lies on the plane. Otherwise, there is no point of intersection between them.

<br>
### **Intersection of Three Planes** <br>
<br>

Let $$L_1 = (N_1, D_1)$$, $$L_2 = (N_2, D_2)$$, and $$L_3 = (N_3, D_3)$$ be 3 arbitrary planes. We want to find the point $$Q$$ at which all 3 planes intersect. This can be done by solving for $$Q$$ such that; 

$$
L_1 \cdot Q = 0
$$

$$
L_2 \cdot Q = 0
$$

$$
L_3 \cdot Q = 0
$$

We can rewrite this in matrix form as 

$$
MQ = 
\begin{bmatrix} 
-D_1 \\\\
-D_2 \\\\
-D_3 \\\\
\end{bmatrix}
$$

where $$M = \begin{bmatrix} 
N_{1x} & N_{1y} & N_{1z} \\\\
N_{2x} & N_{2y} & N_{2z} \\\\
N_{3x} & N_{3y} & N_{3z} \\\\
\end{bmatrix}$$. We can then solve for $$Q$$ by solving the following equation

$$
Q = M^{-1}
\begin{bmatrix} 
-D_1 \\\\
-D_2 \\\\
-D_3 \\\\
\end{bmatrix}
$$

> If $$M$$ is singular, i.e., $$det(M) = 0$$, then $$M$$ cannot be inverted and hence, the three planes do not intersect at a point.

<br>
### **Intersection of Two Planes** <br>
<br>

Let $$L_1 = (N_1, D_1)$$ and $$L_2 = (N_2, D_2)$$ be any two arbitrary planes. When $$L_1$$ and $$L_2$$ intersect, they form a line. Suppose the equation of that line is $$P(t) = Q + Vt$$. The vector $$V$$ is simply the vector perpendicular to the normals of both planes:

$$
V = N_1 \times N_2
$$

However, to find $$Q$$, we need to construct a new plane $$H = (V, 0)$$ that passes through the origin with normal $$V$$, and find the point of intersection of all 3 planes $$L_1$$, $$L_2$$, and $$H$$. That is, 

$$
Q =
\begin{bmatrix} 
N_{1x} & N_{1y} & N_{1z} \\\\
N_{2x} & N_{2y} & N_{2z} \\\\
V_{x} & V_{y} & V_{z} \\\\
\end{bmatrix}
^{-1}

\begin{bmatrix} 
-D_1 \\\\
-D_2 \\\\
0 \\\\
\end{bmatrix}
$$

<br>
### **Intersection of a Sphere and a Plane** <br>
<br>

Consider the sphere $$S$$ with equation

$$
(x-C_x)^2 + (y-C_y)^2 + (z-C_z)^2 = R^2
$$

where $$C = (C_x, C_y, C_z)$$ is the center, and $$R$$ is the radius of the sphere. 

<br>

We want to test for intersection between the sphere $$S$$ and an arbitrary plane $$P$$. We can do that by calculating the signed distance $$d$$ between the plane and the sphere center $$C$$, and compare it with the radius $$R$$ of the sphere: 

$$
d = (N \cdot S) + D
$$



<div class="row align-items-center mt-3">
  <div class="col-md-8">

<ul><li> If \(-R \leq d \leq R\), then there is intersection between the sphere and the plane: </li></ul>
<br>
    <ul><ul> <ul><li> If \( 0 \leq d \leq R\), then sphere is on the positive side of the plane -- the side of the plane to where the normal points. </li> </ul></ul></ul>
    <ul><ul><ul> <li> If \( -R \leq d \leq 0\), then sphere is on the negative side of the plane -- the side of the plane opposite to where the normal points. </li> </ul> </ul> </ul>
<br>
<ul><li> If \(d < -R\), then there is <b>no</b> intersection between the sphere and the plane.</li> </ul>
<br>
<ul><li> If \(d > R\), then there is <b>no</b> intersection between the sphere and the plane.</li> </ul>

    </div>
    
    <div>
        <figure class="col-md-4 text-center theme-img repo-img-light">
            {% include figure.html loading="lazy"
                 path="assets/img/Blog/PlanesIn3DSpace/Dark/4.png"
                 width="450" height="450" %}
        </figure>
        <figure class="col-md-4 text-center theme-img repo-img-dark">
            {% include figure.html loading="lazy"
                 path="assets/img/Blog/PlanesIn3DSpace/Light/4.png"
                 width="450" height="450" %}
        </figure>
    </div>
</div>


```c++

#define OUTSIDE_NEGATIVE -1
#define INTERSECTING 0
#define OUTSIDE_POSITIVE -1

struct Sphere{
    float radius;
    glm::vec3 center;
};

int TestSpherePlaneIntersection(glm::vec4 plane, Sphere sphere)
{
    float d = glm::dot(plane, glm::vec4(sphere.center, 1.0f));
    
    if(d < -sphere.radius)
        return OUTSIDE_NEGATIVE; // No Intersection -- Sphere is entirely on the negative side of the plane 
            
    if(d > sphere.radius)
        return OUTSIDE_POSITIVE; // No Intersection -- Sphere is entirely on the positive side of the plane
    
    return INTERSECTING;
}

```

<br>
### **Intersection of a Box and a Plane** <br>
<br>

<br>
#### **Intersection of an Axis-Aligned Box and a Plane** <br>
<br>

Consider an axis-aligned box $$G$$, with minimum vertex $$V_{min}$$ and maximum vertex $$V_{max}$$. We want to test for intersection between the box $$G$$ and an arbitrary plane $$P = (N, D)$$, where the $$N$$ is normalized. We can do that by calculating the signed distance $$d$$ from the center $$C$$, along the normal $$N$$, to the plane $$P$$, and compare it with the maximum radius $$R$$, projected onto the normal $$N$$, inside the box.  

The maximum radius $$R$$ inside the box is given by 

$$
R = \frac {V_{max} - V{min}}{2}
$$

This is equivalent to using the equation 

$$
R = V_{max} - C
$$

The center $$C$$ of the box is given by 

$$
C = \frac {V_{max} + V{min}}{2}
$$

We calculate the signed distance $$d$$ along the normal $$N$$ from the center $$C$$ to the plane using equation 2:

$$
d = (N \cdot C) + D
$$

<div class="row align-items-center mt-3">
  <div class="col-md-8">
        We will compare \(R\) and \(d\): 
        <br>
        <br>
        <br>
        <ul><li> If \(d > R\), then there is no intersection -- the box is completely on the positive side of the plane. </li></ul>
        <br>
        <ul><li> If \(d < -R\), then there is no intersection -- the box is completely on the negative side of the plane. </li></ul>
        <br>
        <ul><li> If \(-R \leq d \leq R\), then there is an intersection. </li></ul>
    </div>
    
    <div>
        <figure class="col-md-5 text-center theme-img repo-img-light">
            {% include figure.html loading="lazy"
                 path="assets/img/Blog/PlanesIn3DSpace/Dark/5.png"
                 width="450" height="450" %}
        </figure>
        <figure class="col-md-5 text-center theme-img repo-img-dark">
            {% include figure.html loading="lazy"
                 path="assets/img/Blog/PlanesIn3DSpace/Light/5.png"
                 width="450" height="450" %}
        </figure>
    </div>
</div>

```c++

#define OUTSIDE_NEGATIVE -1
#define INTERSECTING 0
#define OUTSIDE_POSITIVE -1

struct AABB{
    glm::vec3 min;
    glm::vec3 max;
};

int TestAABBPlaneIntersection(glm::vec4 plane, AABB box)
{
    glm::vec3 C = (box.min + box.max) * 0.5f;
    glm::vec3 E = (box.max - box.min) * 0.5f;
    glm::vec3 N = glm::vec3(plane.x, plane.y, plane.z);
        
    float R = glm::dot(E, glm::vec3(std::abs(N.x), std::abs(N.y), std::abs(N.z)));
    float d = glm::dot(plane, glm::vec4(C, 1.0f));
    
    if(d > R)
        return OUTSIDE_POSITIVE; // No intersection -- Box is completely on the positive side of the plane.
        
    if(d < -R)
        return OUTSIDE_NEGATIVE; // No intersection -- Box is completely on the negative side of the plane.
    
    return INTERSECTING;
}
```

<br>
#### **Intersection of an Object-Oriented Box and a Plane** <br>
<br>

Consider an object-oriented box $$G$$, with center $$C$$, local coordinate axes $$u_0$$, $$u_1$$, and $$u_2$$, and three scalars $$e_0$$, $$e_1$$, and $$e_2$$. The points $$R$$ in $$G$$ are given by 

$$
R = C ± a_0 u_0 ± a_1 u_1 ± a_2 u_2
$$

where $$a_i \leq e_i$$. Similarly, the eight corner vertices $$V_i$$ of the box are given by

$$
V_i = C ± e_0 u_0 ± e_1 u_1 ± e_2 u_2
$$

<br>


We want to test for intersection between the box $$G$$ and an arbitrary plane $$P = (N, D)$$, where the $$N$$ is normalized. We can do that by calculating the signed distance $$d$$ from the center $$C$$, along the normal $$N$$, to the plane $$P$$, and compare it with the maximum radius $$R$$, projected onto the normal $$N$$, inside the box.  

The corner vertices $$V_i$$ of the box are considered the points inside the box that are the furthest away from the center $$C$$. Hence, we will only consider them when calculating the maximum radius $$R$$. The radii $$r_i$$ projected onto the normal $$N$$ of each vertex $$V_i$$ is given by

$$
r_i = (V_i - C) \cdot n = (C ± e_0 u_0 ± e_1 u_1 ± e_2 u_2 - C) \cdot n
$$

$$
r_i = (e_0 u_0 ± e_1 u_1 ± e_2 u_2) \cdot n
$$

$$
r_i = (e_0 u_0 \cdot n) ± (e_1 u_1 \cdot n) ± (e_2 u_2 \cdot n) 
$$

The maximum radius $$R$$ is obtained when all the involved terms are positive, which is achieved by taking the absolute values of all the terms. That is,  

$$
R = |(e_0 u_0 \cdot n)| + |(e_1 u_1 \cdot n)| + |(e_2 u_2 \cdot n)|
$$

Since the extents $$e_0$$, $$e_1$$, and $$e_2$$ are assumed to be positive, then

$$
R = e_0|(u_0 \cdot n)| + e_1|(u_1 \cdot n)| + e_2|(u_2 \cdot n)|
$$

> If $$N$$ is not normalized, then $$
R = \frac {e_0|(u_0 \cdot n)| + e_1|(u_1 \cdot n)| + e_2|(u_2 \cdot n)|}{||N||}
$$

Finally, we calculate the signed distance $$d$$ along the normal $$N$$ from the center $$C$$ to the plane using equation 2:

$$
d = (N \cdot C) + D
$$

We will compare $$R$$ and $$d$$: 

- If $$d > R$$, then there is no intersection -- the box is completely on the positive side of the plane. 
    
- If $$d < -R$$, then there is no intersection -- the box is completely on the negative side of the plane.

- If $$-R \leq d \leq R$$, then there is an intersection. 
    
<br>

```c++

#define OUTSIDE_NEGATIVE -1
#define INTERSECTING 0
#define OUTSIDE_POSITIVE -1

struct OOB{
    glm::vec3 center;    
    std::array<float, 3> e;
    std::array<glm::vec3, 3> u;
};


int TestOOBPlaneIntersection(glm::vec4 plane, OOB box)
{
    glm::vec3 n = glm::vec3(plane.x, plane.y, plane.z);
    
    float R = (box.e[0] * std::abs(glm::dot(box.u[0], n))) + (box.e[1] * std::abs(glm::dot(box.u[1], n))) + (box.e[2] * std::abs(glm::dot(box.u[2], n)));
        
    float d = glm::dot(plane, glm::vec4(box.center, 1.0f));
    
    if(d > R)
        return OUTSIDE_POSITIVE; // No intersection -- Box is completely on the positive side of the plane.
        
    if(d < -R)
        return OUTSIDE_NEGATIVE; // No intersection -- Box is completely on the negative side of the plane.
    
    return INTERSECTING;
}
```

<br>
<br>

***

<br>
#### **References** <br>
<br>

**[1]** 3D Math Primer for Graphics and Game Development by Fletcher Dunn and Ian Parbery

**[2]** Mathematics for 3D Game Programming and Computer Graphics by Eric Lengyel

**[3]** Real-time Collision Detection by Christer Ericson

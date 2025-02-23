---
layout: post
title: Quaternions
date: 2025-02-22 12:00:00
description:
tags:
categories:
featured: false
---

<br> 
### **Introduction** <br>
<br> 

In computer graphics, rotations are commonly represented using matrices. For example, a rotation by an angle $$\theta$$ around the axis $$A$$ is expressed using the following matrix: 

<br>

\begin{bmatrix}
\cos \theta + (1 - \cos \theta) A_x^2  & (1 - \cos \theta) A_x A_y - \sin \theta A_z & (1- \cos \theta) A_x A_z + \sin \theta A_y \cr
(1 - \cos \theta)A_x A_y + \sin \theta A_z & \cos \theta + (1 - \cos \theta) A_y^2  & (1- \cos \theta) A_y A_z - \sin \theta A_x \cr
(1 - \cos \theta)A_x A_z - \sin \theta A_y & (1 - \cos \theta) A_y A_z + \sin \theta A_x & \cos \theta + ( 1 - \cos \theta ) A_z^2
\end{bmatrix}

<br>

We can apply this rotation to a vertex by multiplying the vertex coordinates by the matrix. 

However, matrices are not the only mathematical entity to represent rotations. There is a better alternative: **Quaternions**.

<br>

**Why use quaternions ?**
<br>

- Requires less storage than traditional matrices 
- Easier to interpolate for smoother animations 
- Concatenation requires fewer arithmetic operations

<br>

In this post, we will dive into the topic of quaternions. We will explore their mathematical foundations, their use in representing rotations, and how they can be more easily interpolated to produce smooth animations.


<br> 
### **Quaternion Mathematics** <br>
<br> 

The set of quaternions is a 4-dimensional vector space denoted by $$H$$.

A quaternion $$q$$, where $$q \in H$$, has the form 

$$
q = (w, x, y, z) = w + xi + yj + zk
$$


It can also be written as: 

$$
q = s + v
$$

where $$s$$ represents the scalar component, corresponding to the $$w$$-component of $$q$$ (i.e. $$s = w$$), and $$v$$ represents the vector component, corresponding to the $$x$$, $$y$$, and $$z$$ components of $$q$$ (i.e. $$v = (x,y,z) = xi + yj + zk$$ ). 

<br> 

The set of quaternions $$H$$ is a natural extension of the set of complex numbers. Multiplication of quaternions's imaginary components $$i$$, $$j$$, and $$k$$, follows a specific set of rules. These rules are: 

$$
i^{2} = j^{2} = k^{2} = -1
$$

$$
ij = -ji = k
$$

$$
jk = -kj = ii
$$

$$
ki = -ik = j
$$

<br>

As noted in these rules, the multiplication of the imaginary components $$i$$, $$j$$, and $$k$$, are **not** commutative. 

As a result, the multiplication of quaternions must also be **not** commutative. 

That is, for any two quaternions $$q1$$ and $$q2$$, 

$$
q1 q2 \neq q2 q1
$$

<br>


<br>

To Be Continued....

***

<br>
### References 
<br>
- Chapter 4.6 - Mathematics for 3D Programming and Computer Graphics by Eric Lengyel


*** 

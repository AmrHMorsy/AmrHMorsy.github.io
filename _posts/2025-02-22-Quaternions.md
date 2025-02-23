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
- Easier and more stable to interpolate for smoother animations 
- Concatenation requires fewer arithmetic operations

<br>

In this post, we will dive into the topic of quaternions. We will explore their mathematical foundations, their use in representing rotations, and how they can be more easily interpolated to produce smooth animations.


<br> 
### **Quaternion Mathematics** <br>
<br> 

The set of quaternions is a 4-dimensional vector space denoted by $$H$$.

A quaternion $$q$$, where $$q \in H$$, has the form 

$$
q = q_{w} + q_{x}i + q_{y}j + q_{z}k = q_{w} + q_{v}
$$

where 

- $$q_{v} = q_{x}i + q_{y}j + q_{z}k$$, such that $$q_{v}$$ is called the imaginary part of a quaternion, and $$i$$, $$j$$, and $$k$$ are called imaginary units, 
- $$q_{w}$$ is called the real part of a quaternion,
- All $$q_{w}$$, $$q_{x}$$, $$q_{y}$$, and $$q_{z}$$ are real numbers, 
- $$q_{x}$$, $$q_{y}$$, and $$q_{z}$$ are closely related to axis of rotation, and
- The angle of rotation affects all four parts $$q_{w}$$, $$q_{x}$$, $$q_{y}$$, and $$q_{z}$$. 

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

**Multiplication**

The multiplication of the two quaternions $$q$$ and $$r$$ is as follows: 

$$
qr = (iq_{x} + jq_{y} + kq_{z} + q_{w}) (ir_{x} + jr_{y} + kr_{z} + r_{w})
$$

$$
= i(q_{y}r_{z} - q_{z}r_{y} + r_{w}q_{x} + q_{w}r_{x})
$$

$$
+ j( q_{z}r_{x} - q_{x}r_{z} + r_{w}q_{y} + q_{w}r_{y}) 
$$

$$
+ k( q_{x}r_{y} - q_{y}r_{x} + r_{w}q_{z} + q_{w}r_{z})
$$

$$
+ q_{w}r_{w} - q_{x}r_{x} - q_{y}r_{y} - q_{z}r_{z}
$$

<br>

***

<br>
### References 
<br>
- Chapter 4.6 - Mathematics for 3D Programming and Computer Graphics by Eric Lengyel


*** 

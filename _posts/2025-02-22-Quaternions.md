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
### **1   Introduction** <br>
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
### **2   Quaternion Mathematics** <br>
<br> 

The set of quaternions is denoted by $$H$$. 

It is considered an extension of the set of complex numbers and can be thought of as a 4-dimensional vector space. 

A quaternion $$q \in H$$, has the form 

$$
q = iq_{x} + jq_{y} + kq_{z} + q_{w}
$$

where $$q_{w}$$ is called the **real** part of a quaternion and $$iq_{x} + jq_{y} + kq_{z}$$ is called the **imaginary** part of the quaternion. 

The quaternion $$q$$ can also be written as: 

$$
q = q_{v} + q_{w}
$$

where 

$$
q_{v} = q_{x}i + q_{y}j + q_{z}k
$$

<br>

**Notes:**

- $$i$$, $$j$$, and $$k$$ are called imaginary units.
- All $$q_{w}$$, $$q_{x}$$, $$q_{y}$$, and $$q_{z}$$ are real numbers.
- $$q_{x}$$, $$q_{y}$$, and $$q_{z}$$ are closely related to axis of rotation.
- The angle of rotation affects all four parts: $$q_{w}$$, $$q_{x}$$, $$q_{y}$$, and $$q_{z}$$. 

<br> 
<br>

##### **2.1   Addition**
<br>

The definition of the addition of two quaternions $$q$$ and $$r$$ is as follows: 

$$
q + r = (iq_{x} + jq_{y} + kq_{z} + q_{w}) + (ir_{x} + jr_{y} + kr_{z} + r_{w}) 
$$

$$
= i(q_{x} + r_{x}) + j(q_{y} + r_{y}) + k(q_{z} + r_{z}) + (q_{w} + r_{w} )
$$

<br>

##### **2.2  Multiplication**
<br>

The multiplication of quaternions's imaginary units $$i$$, $$j$$, and $$k$$ follows a specific set of rules. These rules are: 

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

As noted in these rules, the multiplication of the imaginary components $$i$$, $$j$$, and $$k$$, is **not** commutative. 

As a result, the multiplication of quaternions must also be **not** commutative. 

That is, for any two quaternions $$q$$ and $$r$$, their multiplication is not commutative: 

$$
qr \neq rq
$$

<br>

The definition of the multiplication of the two quaternions $$q$$ and $$r$$ is as follows: 

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

The definition of the multiplication of the two quaternions $$q$$ and $$r$$ can also be written in scalar-vector form as: 

$$
qr = q_{w}r_{w} - q_{v}.r_{v} + q_{w}r_{v} + r_{w}q_{v} + q_{v} \times r_{v}
$$

<br>


##### **2.3  Conjugate**
<br>

The conjugate of a quaternion $$q$$, denoted by $$\bar{q}$$, is given by 

$$
\bar{q} = -q_{v} + q_{w}
$$

<br>

If we take the product of the quaternion $$q$$ and its conjugate $$\bar{q}$$, we get 

$$
q \bar{q} = (q_{v} + q_{w})(-q_{v} + q_{w}) 
$$

$$
= q_{w}^{2} + (q_{v}.q_{v}) - q_{w}q_{v} + q_{w}q_{v} + q_{v} x -q_{v}
$$

$$
= q_{w}^{2} + (q_{v}.q_{v})
$$

$$
= q_{x}^{2} + q_{y}^{2} + q_{z}^{2} + q_{w}^{2}
$$



<br>

##### **2.4  Normalization**
<br>

The magnitude of a quaternion $$q$$, denoted by $$||q||$$
, is given by

$$
||q|| = \sqrt{q_{x}^{2} + q_{y}^{2} + q_{z}^{2} + q_{w}^{2} }
$$

Since the product of $$q$$ and its conjugate, $$\bar{q}$$, is given by

$$
q \bar{q} = q_{x}^{2} + q_{y}^{2} + q_{z}^{2} + q_{w}^{2}
$$

then we can rewrite the magnitude equation as 

$$
||q|| = \sqrt{q \bar{q}}
$$

Therefore, the normalization of any quaternion $$q$$ into a unit quaternion is given by

$$
q = \frac{q}{||q||} = \frac{q}{\sqrt{q \bar{q}}}
$$

<br>

##### **2.5  Inverse**
<br>

The inverse of a non-zero quaternion $$q$$, denoted by $$q^{-1}$$, is given by

$$
q^{-1} = \frac{\bar{q}}{||q||^{2}}
$$

<br>

**Proof**

We know that 

$$
q q^{-1} = q^{-1} q = 1
$$

We also know that 

$$
||q|| = \sqrt{q \bar{q}}
$$

and, consequently

$$
||q||^{2} = q \bar{q}
$$

Hence, we can rewrite $$q q^{-1}$$ as

$$
q q^{-1} = \frac{q \bar{q}}{||q||^{2}}
$$

, and therefore, 

$$
q^{-1} = \frac{q \bar{q}}{q ||q||^{2}} = \frac{\bar{q}}{||q||^{2}}
$$

<br>

**Note**

If quaternion $$q$$ is a unit quaternion, then

$$
q^{-1} = \frac{\bar{q}}{||q||^{2}} = \frac{\bar{q}}{1} = \bar{q}
$$

<br>
<br>

### **3  Rotation with Quaternions** <br>

<br>






















<br>

***

<br>

### **References**
<br>
- Chapter 4.6 - Mathematics for 3D Programming and Computer Graphics by Eric Lengyel
- Chapter 4.3 - Real-Time Rendering by Tomas Akenine-Möller, Eric Haines, Naty Hoffman, Angelo Pesce, Michat Iwanicki and Sébastien Hillaire

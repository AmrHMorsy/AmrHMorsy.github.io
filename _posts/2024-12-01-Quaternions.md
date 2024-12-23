---
layout: post
title: Quaternions
date: 2024-12-01 12:00:00
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

We can apply this rotation to a vertex by multiplying the vertex coordinates by the matrix. 

However, matrices are not the only mathematical entity to represent rotations. There is a better alternative: **Quaternions**.

In this post, we will dive into the topic of quaternions. We will explore their mathematical foundations, their use in representing rotations, and how they can be more easily interpolated to produce smooth animations.

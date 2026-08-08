---
layout: post
title: Stochastic Light Culling in Vulkan
date: 2026-07-13 09:00:00
description:
tags:
categories:
thumbnail: assets/img/Blog/StochasticLightCulling/
featured: false
---

<br>

<div class="row align-items-center mt-3 justify-content-center text-center">
<div class="col-md-8">
<i>
This blog post serves as an extension to my recent light culling blog post found <a href="../LightCulling/">here</a>. 
<br>
<br>
</i>
</div>
</div>
 
<br>

<blockquote>
<h3><b>Contents</b></h3>
<br>
<ul>
    <li><a href="#introduction">Introduction</a></li>
    <li><a href="#problem">Problem Statement</a></li>
    <li><a href="#stochastic">Stochastic Fall-off Function</a></li>
    <li><a href="#probability">Probability Function</a></li>
    <li><a href="#radius">Light Influence Range</a></li>
    <li><a href="#variance">Variance Control</a></li>
    <li><a href="#alpha">Constructing Equation for \(\alpha_i\)</a></li>
    <li><a href="#implementation">Implementation</a></li>
    <li><a href="#References">References</a></li>
</ul>
</blockquote>

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

<br>

In a traditional rendering pipeline, also known as the <b>Forward Rendering Pipeline</b>, equation $$1$$ is executed by the fragment shader to compute the radiance at each shading point. The problem with this setup, however, is that it does not scale well with the number of lights. If $$N$$ grows, the execution time of the fragment shader increases, and the pipeline will fail to maintain adequate frame-rate, and hence why, the idea of light culling was introduced.

<br>

<b>Light culling</b> is an optimization technique often used in rendering pipelines. The main idea behind this method is to simply reduce the number of light sources being evaluated for each shading point. Instead of evaluating $$N$$ light sources, we evaluate only a subset of them. This is done by assuming a limited range of influence $$r_i$$ for each light source $$L_i$$. If a shading point falls outside that influence range, the light $$L_i$$ is ignored when computing the radiance at $$x$$.

<br>

<div class="row align-items-center mt-3 justify-content-center text-center">
<div class="col-md-6">
<blockquote>
A high-level overview of the <b>light culling</b> algorithm is as follows: 
<br>
<br>
<li>The screen is split into a 2D grid of tiles.</li>
<li>A frustum is constructed for each tile.</li>
<li>A bounding sphere is built for each light source. The center of the sphere is the light position, and the radius of the sphere is the influence range of the light.</li>
<li>Intersection is tested between all the light bounding spheres and all tile frustums.</li>
<li>If there is an intersection, the index of the light source is appended to the tile's private list of lights.</li> 
<li>Pixels within this tile will only evaluate the light sources whose indices are in this tile's list</li>
</blockquote>
</div>
<div class="col-md-6">
    <figure class="col-md-12 text-center theme-img repo-img-light">
        {% include figure.html  path="assets/img/Blog/StochasticLightCulling/Dark/Graph.png" class="scaled-img80"%}
        <figcaption>Graph of \(\frac{1}{d^2}\)</figcaption>
    </figure>
    <figure class="col-md-12 text-center theme-img repo-img-dark">
        {% include figure.html  path="assets/img/Blog/StochasticLightCulling/Light/Graph.png" class="scaled-img80"%}
        <figcaption>Graph of \(\frac{1}{d^2}\)</figcaption>
    </figure>
</div>
</div>

<br>

However, the assumption of limited influence range of each light made by the light culling is physically inaccurate. Physical-based lights have infinite range of influence. Regardless of the distance $$d$$ between the shading point $$x$$ and the light source $$L_i$$, $$x$$ should still receive some radiance contribution from $$L_i$$. This is typically modelled using the fall-off function $$f(d)$$

$$
f(d) = \frac{1}{d^2}
\tag{2}
$$

<br>

<div class="row align-items-center mt-3">
<div class="col-md-6">
    <figure class="col-md-12 text-center theme-img repo-img-light">
        {% include figure.html  path="assets/img/Blog/StochasticLightCulling/Dark/SceneWoLightCulling.png" class="scaled-img80"%}
        <figcaption>
        Scene without light culling
        </figcaption>
    </figure>
    <figure class="col-md-12 text-center theme-img repo-img-dark">
        {% include figure.html  path="assets/img/Blog/StochasticLightCulling/Light/SceneWoLightCulling.png" class="scaled-img80"%}
        <figcaption>
        Scene without light culling
        </figcaption>
    </figure>
</div>
<div class="col-md-6">
    <figure class="col-md-12 text-center theme-img repo-img-light">
        {% include figure.html  path="assets/img/Blog/StochasticLightCulling/Dark/SceneWLightCulling.png" class="scaled-img80"%}
        <figcaption>
        Scene with light culling
        </figcaption>
    </figure>
    <figure class="col-md-12 text-center theme-img repo-img-dark">
        {% include figure.html  path="assets/img/Blog/StochasticLightCulling/Light/SceneWLightCulling.png" class="scaled-img80"%}
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

In this blog post, we will explain the method, derive its equations and formulas, and provide an implementation in C++. 

</div>
<div class="col-md-4">
    <figure class="col-md-12 text-center theme-img repo-img-light">
        {% include figure.html  path="assets/img/Blog/StochasticLightCulling/Dark/paper.png" class="scaled-img80"%}
        <figcaption>Y.Tokuyoshi, T.Harada. Stochastic Light Culling. 2016</figcaption>
    </figure>
    <figure class="col-md-12 text-center theme-img repo-img-dark">
        {% include figure.html  path="assets/img/Blog/StochasticLightCulling/Light/paper.png" class="scaled-img80"%}
        <figcaption>Y.Tokuyoshi, T.Harada. Stochastic Light Culling. 2016</figcaption>
    </figure>
</div>
</div>

<br>
<h4 id="problem"><b>Problem Statement</b></h4>
<br>

The truncated fall-off function $$f^{\prime}(d)$$ used by light culling is defined as follows: 

$$
f^{\prime}(d) \approx
\begin{cases}
f(d), &&&& d \leq r_i \\
\\
0, &&&& d > r_i \\
\end{cases}
$$

where $$r_i$$ is the influence range of the light $$L_i$$. 

<br>

As shown, if the shading point $$x$$ is within the influence range $$r_i$$, the function $$f^{\prime}(d)$$ applies the physically-based fall-off function $$f(d)$$. However, if the shading point $$x$$ is beyond the range $$r_i$$, the light $$L_i$$ is completely ignored. This explains why scenes produced by light culling has darkened regions.

<br>

In fact, if we computed the bias  $$E$$ of $$f^{\prime}(d)$$, we will find it biased: 

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

In other words, inside the cutoff radius $$r_i$$, the fall-off function $$f^{\prime}(d)$$ is unbiased. Otherwise, the estimator underestimates the light contribution significantly by setting it to zero. This lines up with the results we are seeing. If $$f^{\prime}(d)$$ was truly unbiased, the scene would have looked identical to the one produced by the traditional rendering pipeline, which is not the case. This is the problem we are trying to solve. 

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

Consider, for example, the physically-based fall-off function $$f(d)$$ defined in equation $$$$. Every light $$L_i$$ is contributing exactly the amount of $$\frac{1}{d_i^2}$$ to the shading point $$x$$. With the introduction of the truncated fall-off function $$f^{\prime}(d)$$ in light culling, only a subset of the lights is contributing the amount of $$\frac{1}{d_i^2}$$, decreasing the total contribution that the shading point $$x$$ should physically receive. The key idea of the stochastic fall-off function is to artifically increase the radiance contribution provided by the surviving lights to account for the contribution that would have been provided by the culled lights, keeping the total contribution that the shading point $$x$$ is receiving practically the same. 

<br>

So, we define the probability function $$p_i(d) \in [0, 1]$$ as the probability that light $$L_i$$ is evaluated at the shading point $$x$$. For every light $$L_i$$, we flip a weighted coin $$ξ_i$$. If $$p_i(d) > ξ_i$$, we evaluate the light $$L_i$$, and artifically inflate its contribution by a factor of $$\frac{1}{p_i(d)}$$. Otherwise, we ignore it. 

<br>

Suppose for example that $$f(d) = 40$$ for the light $$L_i$$, and $$p_i(d) = 0.25$$. This means that $$25\%$$ of the time, $$L_i$$ survives, and the other $$75\%$$ of the time, it is ignored. The average contribution of light $$L_i$$ is 

$$
0.75(0) + 0.25(10) = 2.5
$$

<br>

What we do then here is that we inflate the radiance contribution of light $$L_i$$ in the times it is evaluated with a factor of $$\frac{1}{p_i(d)}$$, such that 

<br>

$$
0.75(0) + 0.25(\frac{10}{0.25}) = 40
$$

<br>

The average contribution becomes equal to the physically-accurate value of $$f(d) = 40$$. 

<br>

<div class="proof">
\(\hat{f}(d)\) is unbiased
<br>
<br>
<b><b><u>Proof</u></b></b>
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

The stochastic fall-off function $$\hat{f}(d)$$ will be used in the main shader of the rendering pipeline to compute the attenutation of the light intensity, in place of the truncated fall-off function $$f^{\prime}(d)$$ used by light culling. 

<br>
<br>
<h4 id="probability"><b>Probability Function</b></h4>
<br>

In the previous section, we defined the stochastic fall-off function $$\hat{f}(d)$$, but we did not define the probability function $$p_i(d)$$. This is because it did not matter. Regardless of how $$p_i(d)$$ is defined, $$\hat{f}(d)$$ is still unbiased. The definition of $$\hat{f}(d)$$ is not dependent on $$p_i(d)$$ at all. 

<br>

Some probability functions, however, are better than other in this context. For example, we could set 

$$
p_i(d) = 0.5
$$

With this choice of $$p_i(d)$$, the stochastic fall-off function $$\hat{f}(d)$$ is still unbiased. However, we would be evaluating 50% of all light sources for each shading point $$x$$, regardless of the distance between them. This does not align with our light culling pipeline, since there is no relationship between $$p_i(d)$$ and the distance $$d$$ from the shading point $$x$$. 

<br>

We need to define a probability function $$p_i(d)$$ that is proportional to $$f(d)$$; 

$$
p_i(d) ∝ f(d)
$$

This way, lights that are far from the shading point $$x$$ gets low probability of survival, and lights close to $$x$$ gets high probability of survival, and are evaluated. 

<br>

The paper defines the probability function $$p_i(d)$$ as follows: 

$$
p_i(d) = min(\frac{f(d)}{\alpha_i}, 1)
\tag{4}
$$

where $$\alpha_i$$ is a constant value to control variance. 

<br>

<div class="proof">
\(\frac{f(d)}{p_i{d}} = max(\alpha_i, f(d))\)
<br>
<br>
<b><b><u>Proof</u></b></b>
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
<br>
<br>

<div class="row align-items-center mt-3">
<div class="col-md-6">
    <figure class="col-md-12 text-center theme-img repo-img-light">
        {% include figure.html  path="assets/img/Blog/StochasticLightCulling/Dark/SceneWoLightCulling.png" class="scaled-img80"%}
        <figcaption>
        Scene without light culling
        </figcaption>
    </figure>
    <figure class="col-md-12 text-center theme-img repo-img-dark">
        {% include figure.html  path="assets/img/Blog/StochasticLightCulling/Light/SceneWoLightCulling.png" class="scaled-img80"%}
        <figcaption>
        Scene without light culling
        </figcaption>
    </figure>
</div>
<div class="col-md-6">
    <figure class="col-md-12 text-center theme-img repo-img-light">
        {% include figure.html  path="assets/img/Blog/StochasticLightCulling/Dark/SceneWLightCulling.png" class="scaled-img80"%}
        <figcaption>
        Scene with light culling \((\epsilon_{max} = 0.1)\)        
        </figcaption>
    </figure>
    <figure class="col-md-12 text-center theme-img repo-img-dark">
        {% include figure.html  path="assets/img/Blog/StochasticLightCulling/Light/SceneWLightCulling.png" class="scaled-img80"%}
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
        {% include figure.html  path="assets/img/Blog/StochasticLightCulling/Dark/Stochastic01.png" class="scaled-img80"%}
        <figcaption>
        Scene with stochastic light culling \((\epsilon_{max} = 0.1)\)
        </figcaption>
    </figure>
    <figure class="col-md-12 text-center theme-img repo-img-dark">
        {% include figure.html  path="assets/img/Blog/StochasticLightCulling/Light/Stochastic01.png" class="scaled-img80"%}
        <figcaption>
        Scene with stochastic light culling \((\epsilon_{max} = 0.1)\)
        </figcaption>
    </figure>
</div>
</div>



    
<br>
<br>
<h4 id="implementation"><b>Implementation</b></h4>
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

The following is a function that computes the bounding sphere of the light source. The center of the sphere is the position of the light, and the radius is computed using equation $$6$$: 

```c++
glm::vec4 ComputeBoundingSphere(float alpha, float epsilon)
{
    glm::vec3 center = light.config.position;
    float radius = (1.0f / (sqrt(alpha * epsilon)));
    
    return glm::vec4(center, radius);
}
```

<br>

In the main shader, the attenutation of the light source is computed using the stochastic fall-off function $$\hat{f(d)}$$ defined in equation $$5$$:

```c++
float ComputeAttenutation(float dist, float alpha)
{
    float f = 1.0 / (dist * dist);
        
    return max(alpha, f);
}
```

<br>
<br>
<hr>

<br>
<h4 id="References"><b>References</b></h4>
<br>

**[1]** $$$$ $$$$ Y.Tokuyoshi, T.Harada. Stochastic Light Culling. 2016.
<br>
<br>
<br>
<hr>
<br>
<br>

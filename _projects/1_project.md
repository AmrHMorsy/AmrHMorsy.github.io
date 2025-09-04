---
layout: page
title: Ocean Simulation
description: Real-time ocean simulation developed in C++/OpenGL, leveraging Fast Fourier Transform (FFT) and OpenCL for wave simulation. Features Physically-Based Rendering (PBR), image-based lighting (IBL) for enhanced realism, and an HDR skybox for a dynamic, immersive sky. Inspired by Jerry Tessendorf's paper 'Simulating Ocean Water'.
img: assets/img/12.jpg
importance: 1
category:
---

***

<span style="color:red; font-size:16px;"><a href="https://github.com/AmrHMorsy/Ocean-Simulation-OpenGL"><b>Project Github Link</b></a></span>

***

<br>

# **Ocean Simulation**

Developed in C++ and OpenGL, this real-time simulation uses the Fast Fourier Transform method (FFT) to simulate waves, inspired by the paper ["Simulating Ocean Water"](https://people.computing.clemson.edu/~jtessen/reports/papers_files/coursenotes2004.pdf) by Jerry Tessendorf. Additionally, it is parallelized using OpenCL and employs Physically-Based Rendering (PBR) and image-based lighting (IBL) techniques to enhance the realism of the oceanic visuals, and an HDR skybox to present dynamic and an immersive sky. 

<div class="row mt-3">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.html loading="eager" path="assets/img/Ocean/Ocean1.png" class="img-fluid rounded z-depth-1" %}
    </div>
</div>

<br>
## **Features**

#### **Physically-Based Rendering (PBR)**

PBR techniques are employed to simulate realistic material properties. This approach ensures that the water surface in the simulation accurately reflects and refracts light, mimicking the way light interacts with natural water. The result is a stunningly realistic depiction of the ocean, complete with nuanced lighting effects.

<div class="row mt-3">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.html loading="eager" path="assets/img/Ocean/Ocean2.png" class="img-fluid rounded z-depth-1" %}
    </div>
</div>

<br>

#### **Image-Based Lighting (IBL)**

To further improve visual fidelity, Image-Based Lighting (IBL) is used. This technique utilizes real-world imagery to provide environmental lighting, ensuring that the simulation's lighting conditions are based on actual atmospheric lighting. This results in richer reflections and more accurate illumination across the simulated ocean.

<div class="row mt-3">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.html loading="eager" path="assets/img/Ocean/Ocean3.png" class="img-fluid rounded z-depth-1" %}
    </div>
</div>

<br>

#### **Ocean Waves using Fast Fourier Transform (FFT)**

The Fast Fourier Transform (FFT) algorithm is used to simulate realistic ocean waves. This mathematical approach is inspired by Jerry Tessendorf's paper ["Simulating Ocean Water"](https://people.computing.clemson.edu/~jtessen/reports/papers_files/coursenotes2004.pdf). The FFT algorithm creates dynamic, lifelike wave patterns that faithfully mimic real oceanic conditions.

<div class="row mt-3">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.html loading="eager" path="assets/img/Ocean/Ocean4.png" class="img-fluid rounded z-depth-1" %}
    </div>
</div>

<br>

#### **Phillips Spectrum for Wave Energy Modeling**

The simulation incorporates the Phillips Spectrum, a mathematical model that provides a detailed statistical representation of wave energy distribution. By using this model, the simulation can accurately depict the varying energy levels across different wave frequencies, adding to the authenticity of the ocean wave behavior.

<div class="row mt-3">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.html loading="eager" path="assets/img/Ocean/Ocean5.png" class="img-fluid rounded z-depth-1" %}
    </div>
</div>

<br>

#### **Dynamic HDR Skybox**

An HDR (High Dynamic Range) Skybox is introduced to present a more dynamic and immersive sky. This feature captures the vast range of luminance of real-world skies, from the brightest clouds to the darkest nights, creating a more lifelike backdrop that enhances the visual experience.

<div class="row mt-3">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.html loading="eager" path="assets/img/Ocean/Ocean6.png" class="img-fluid rounded z-depth-1" %}
    </div>
</div>

<br>

#### **Atmospheric Fog**

Atmospheric fog effects are implemented to add depth and a captivating ambiance to the scene. This contributes to the visual appeal of the simulation and adds a layer of realism by mimicking the way fog interacts with light and the environment in natural settings.

<div class="row mt-3">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.html loading="eager" path="assets/img/Ocean/Ocean7.png" class="img-fluid rounded z-depth-1" %}
    </div>
</div>

<br>

#### **Infinite Ocean**

The Infinite Ocean feature ensures that the ocean landscape extends endlessly, providing a consistent and immersive backdrop. This feature is crucial in creating a believable and boundless oceanic environment, where the horizon seamlessly meets the sky, just like in the real world.

<div class="row mt-3">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.html loading="eager" path="assets/img/Ocean/Ocean8.png" class="img-fluid rounded z-depth-1" %}
    </div>
</div>

<br>

#### **Frustum Culling**

This simulation uses frustum culling to optimize the performance of the simulation. By rendering only the elements that are within the player's field of view, it significantly reduces the processing load. This optimization ensures smooth and responsive performance, even when rendering complex scenes.

<div class="row mt-3">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.html loading="eager" path="assets/img/Ocean/Ocean9.png" class="img-fluid rounded z-depth-1" %}
    </div>
</div>

<br>

#### **OpenCL Parallelization**

The library OpenCL is used to parallelize the FFT computation for waves simulation, by utilizing the GPU and the CPU for maximized speed and efficency. This greatly enhances the overall performance and responsiveness of the simulation.

<div class="row mt-3">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.html loading="eager" path="assets/img/Ocean/Ocean10.png" class="img-fluid rounded z-depth-1" %}
    </div>
</div>

<br>

#### **Adjustable Ocean Temperament Settings**

Users have the flexibility to adjust the ocean's temperament in the simulation. This feature allows for a seamless transition between calm, serene waters and more turbulent, stormy seas, offering a varied and interactive experience.

<div class="row mt-3">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.html loading="eager" path="assets/img/Ocean/Ocean11.png" class="img-fluid rounded z-depth-1" %}
    </div>
</div>

<br>


<br>

*** 

<br>

---
layout: post
title: How I Built a Vulkan Rendering Engine
date: 2025-09-04 12:00:00
description:
tags: Vulkan
categories:
thumbnail: assets/img/Blog/HowIBuiltaVulkanRenderingEngine/CarOnBridgeScene.png
featured: false
---

<br>
### **Introduction** <br>
<br>

In this blog post, I am going to share my entire development journey in building a rendering engine using the [Vulkan](https://www.vulkan.org) API. The engine features Physically-Based Rendering (PBR), HDR skybox, Image-Based Lighting (IBL), frustum culling, shadow mapping and depth pre-pass. I named the engine **Vejaler** and published its source code [here](https://vejaler.github.io).

Although the engine is still under development, I thought it might be worthwhile to document what I have built so far, and share the challenges I have faced early-on.

<br>
<div class="row mt-3">
  <div class="col-sm mt-3 mt-md-0">
    <figure class="text-center">
      {% include figure.html loading="eager" path="assets/img/Blog/HowIBuiltaVulkanRenderingEngine/CarOnBridgeScene.png" class="img-fluid rounded z-depth-1" %}
      <figcaption class="mt-2 text-muted">A scene of a car on a bridge in the morning, rendered using Vejaler.</figcaption>
    </figure>
  </div>
</div>
<br>


<br>
### **Why I Wanted To Learn Vulkan** <br>
<br>

I started my graphics programming journey in January 2022, after finishing my computer graphics course at Concordia University, in Montreal, Canada. During the course, I got introduced to OpenGL and built a simple simulation as part of the required project. However, I fell in love with graphics programming as a career then, and decided to pursue it full-time while completing my degree. 

<br>
<div class="row mt-3">
  <div class="col-sm mt-3 mt-md-0">
    <figure class="text-center">
      {% include figure.html loading="eager" path="assets/img/Blog/HowIBuiltaVulkanRenderingEngine/ClothSimulation.png" class="img-fluid rounded z-depth-1" %}
      <figcaption class="mt-2 text-muted">Cloth simulation, built using my OpenGL engine</figcaption>
    </figure>
  </div>
</div>
<br>

After finishing the course, I started diving deeper into more advanced computer graphics topics, such as PBR, IBL, portal culling, occlusion culling, etc..., and was using OpenGL as the main API to apply the concepts I learnt from the textbooks, and also build advanced applications such as ocean simulation, cloth simulation, procedural-terrain generation and more.

<br>
<div class="row mt-3">
  <div class="col-sm mt-3 mt-md-0">
    <figure class="text-center">
      {% include figure.html loading="eager" path="assets/img/Blog/HowIBuiltaVulkanRenderingEngine/OceanSimulation.png" class="img-fluid rounded z-depth-1" %}
      <figcaption class="mt-2 text-muted">Ocean simulation, built using my OpenGL engine</figcaption>
    </figure>
  </div>
</div>
<br>

I quickly became proficient in OpenGL and was able to build a complete engine using it. However, in efforts to become an all-around better graphics programmer, I wanted to have more APIs in my arsenal, and understand the graphics pipeline at a deeper level. OpenGL, while simple and easy to use and learn, is an outdated and a high-level API, which abstracts a lot of details from the developer and restricts advanced and custom development. As a result, I decided to embark on the journey of learning and mastering Vulkan. Although Vulkan is verbose and difficult to learn and use, it is a low-level API, which provides the programmer so much control over the rendering pipeline. 

<br>
<div class="row mt-3">
  <div class="col-sm mt-3 mt-md-0">
    <figure class="text-center">
      {% include figure.html loading="eager" path="assets/img/Blog/HowIBuiltaVulkanRenderingEngine/PianoRoomScene.png" class="img-fluid rounded z-depth-1" %}
      <figcaption class="mt-2 text-muted">A scene of a piano room in a house, rendered using my OpenGL engine</figcaption>
    </figure>
  </div>
</div>

<br>
### **Early Days** <br>
<br>

I started my journey in January 2025 by first creating a small window with a simple triangle. This took me almost a week just to get right, because of the many vulkan entities that needs to be set and initialized. It takes so many lines of code to just create a simple window. At first, nothing made sense to me. 

What is a window surface ? 
What is the logical and the physical device ? 
What is image and image view ?

Although I was able to create a very simple triangle scene, I didn’t understand much about what was going on under the hood. This was not unusual to me. I have always faced difficulties with new advanced topics, and experience has taught not me to dwell on the lack of understanding, and instead continue progressing deeper into the topic. Grasping the topic is inevitable with time. This rule has never failed me, which is why I continued re-reading the Vulkan documentation, and adding more advanced features. 

<br>
<div class="row mt-3">
  <div class="col-sm mt-3 mt-md-0">
    <figure class="text-center">
      {% include figure.html loading="eager" path="assets/img/Blog/HowIBuiltaVulkanRenderingEngine/Simple TriangleScene.png" class="img-fluid rounded z-depth-1" %}
      <figcaption class="mt-2 text-muted">A scene of a simple triangle</figcaption>
    </figure>
  </div>
</div>
<br>

After rendering that simple triangle, I thought the next logical step would be to load an OBJ model. It’s the simplest extension at that point, since all I had to do was load the OBJ model using the [Assimp]() library, upload the vertex data inside the vertex buffer and create an extra index buffer and upload the index data to it. With just a few extra steps, the engine was capable of rendering more complex 3D models, instead of just a simple polygon. 

<br>
<div class="row mt-3">
  <div class="col-sm mt-3 mt-md-0">
    <figure class="text-center">
      {% include figure.html loading="eager" path="assets/img/Blog/HowIBuiltaVulkanRenderingEngine/Simple ModelSceneNoDepthTesting.png" class="img-fluid rounded z-depth-1" %}
      <figcaption class="mt-2 text-muted">A scene of a simple 3D model</figcaption>
    </figure>
  </div>
</div>
<br>

Although the engine was capable of rendering 3D models, depth testing wasn't implemented at that time, resulting in incorrect scenes. Unlike OpenGL where depth testing is implemented for you, in Vulkan, the developer has to create the depth image and image view, besides the color attachment, and attach it to the main frameBuffer, for depth values to be stored, and for depth testing to be activated. 

<br>
<div class="row mt-3">
  <div class="col-sm mt-3 mt-md-0">
    <figure class="text-center">
      {% include figure.html loading="eager" path="assets/img/Blog/HowIBuiltaVulkanRenderingEngine/Simple ModelScene.png" class="img-fluid rounded z-depth-1" %}
      <figcaption class="mt-2 text-muted">A scene of a simple 3D model</figcaption>
    </figure>
  </div>
</div>
<br>

The development journey, at that point of time, became much smoother. I started enjoying Vulkan, because I was able to experiment with the different configurations, and actually see it reflect directly on the screen. 

For example, I started adding a functionality that allows the camera to roam freely in the scene. This involved a series of steps, which included building a view and a projection matrix, creating a uniform buffer to upload these matrices into, and finally update the descriptor sets to account for the extra binding of the uniform data in the vertex shader. This allowed me to produce renders from different point of views, and create a reasonably good foundation for more advanced scenes.  


----


<br>
### **Refactoring Engine Code** <br>
<br>

At that point, I decided to stop adding more features, and instead try to understand the API in more details. In my experience, the way I do that has always been through refactoring the code. I started separating the code into classes, where each class is responsible for a single task in the rendering pipeline. 

For example, I created a shader class which loads the SPV files and creates a shader module and returns it. I also created another separate class which handles the creation of the graphics pipeline and all its necessary configuration. I continued doing this for all the Vulkan constructs in my program and turned all these engine components into static classes. That is, I transformed all these classes into utility-style classes, so that it doesn’t store any state. This simplified the code a lot, since it delegated each class only one task, which is to manage that particular Vulkan object. 

At that point, Vulkan became a bit clearer to me in some way. In fact, after cleaning out the code, I realized that I actually prefer Vulkan over any other high-level API. It’s verbosity and low-levelness gives so much control over the pipeline, and allows me to understand what really happens under the hood in so many details. 

From then on, I was excited to continue developing the engine further and add more features. The next set of features I added were lighting system, PBR and textures. 


<br> 
### **Adding Support for Textures** <br>
<br>

At that point, the engine was capable of rendering models with solid colors only. The obvious next step of development was to add support for textures. 

<br>
<div class="row mt-3">
  <div class="col-sm mt-3 mt-md-0">
    <figure class="text-center">
      {% include figure.html loading="eager" path="assets/img/Blog/HowIBuiltaVulkanRenderingEngine/MedievalHouseScene.png" class="img-fluid rounded z-depth-1" %}
      <figcaption class="mt-2 text-muted">A scene of a medieval house with a texture, rendered using Vejaler.</figcaption>
    </figure>
  </div>
</div>
<br>

Implementing textures was a bit tricky, as it involved several steps. First, it was apparent to me that I needed to load the image first. This part of implementation is similar to how I used to do it in OpenGL. I used the library STB_Image to load the image and then stored the loaded data inside a buffer. After that, I decided to calculate the maximum number of mip levels of that loaded image. This will be needed later when adding support for mip mapped textures. 

<br>
<div class="row mt-3">
  <div class="col-sm mt-3 mt-md-0">
    <figure class="text-center">
      {% include figure.html loading="eager" path="assets/img/Blog/HowIBuiltaVulkanRenderingEngine/CottageScene.png" class="img-fluid rounded z-depth-1" %}
      <figcaption class="mt-2 text-muted">A scene of a cottage with a texture, rendered using Vejaler.</figcaption>
    </figure>
  </div>
</div>
<br>

The remaining set of steps involved creating a vulkan image, storing the loaded image data in a Vulkan buffer, and then finally copying the data from the buffer to the Vulkan image. After implementing these steps, I only had to update the descriptor sets by adding one more binding slot for the texture, and similarly update the shader code. With these additions in place, I was able to see complex models with textures. 

<br>
<div class="row mt-3">
  <div class="col-sm mt-3 mt-md-0">
    <figure class="text-center">
      {% include figure.html loading="eager" path="assets/img/Blog/HowIBuiltaVulkanRenderingEngine/TruckScene.png" class="img-fluid rounded z-depth-1" %}
      <figcaption class="mt-2 text-muted">A scene of a truck, rendered using Vejaler.</figcaption>
    </figure>
  </div>
</div>
<br>

<br> 
### **Implementing A Lighting System** <br>
<br>

Next, I decided to embark on implementing the lighting system. It was fairly simple. All I had to do was create a new uniform buffer containing information like the position and the color of the light, and update the descriptor set to account for the extra binding of the uniform buffer. This created uniform buffer, which resides in the fragment shader, will actually be useful later, as I can simply append more data inside it like the camera position, for them to be used by the fragment shader code.

<br>
<div class="row mt-3">
  <div class="col-sm mt-3 mt-md-0">
    <figure class="text-center">
      {% include figure.html loading="eager" path="assets/img/Blog/HowIBuiltaVulkanRenderingEngine/FireHydrantScene.png" class="img-fluid rounded z-depth-1" %}
      <figcaption class="mt-2 text-muted">A scene of a Fire Hydrant, featuring PBR, rendered using Vejaler.</figcaption>
    </figure>
  </div>
</div>
<br>

I was enjoying the development journey at that time. So far, it was a smooth experience. There was no major obstacles being faced, and the features added were straightforward to implement. There were no new Vulkan constructs to learn about. I got introduced to all of them at the very beginning when I was creating the simple triangle, and I kept re-using and recreating them for different features. 

<br>
### **Implementing PBR** <br>
<br>

Implementing PBR at that time was easy for me. That’s because I already had a working shader from my OpenGL engine. Refactoring it in my Vulkan engine was straightforward: I just had to replicate the code for implementing I had before, to account for the extra images. 

<br>
<div class="row mt-3">
  <div class="col-sm mt-3 mt-md-0">
    <figure class="text-center">
      {% include figure.html loading="eager" path="assets/img/Blog/HowIBuiltaVulkanRenderingEngine/GramophoneScene.png" class="img-fluid rounded z-depth-1" %}
      <figcaption class="mt-2 text-muted">A scene of a Gramophone, featuring PBR, rendered using Vejaler.</figcaption>
    </figure>
  </div>
</div>
<br>

With this, I was able to have a solid renderer that was able to produce reasonably good images. Nevertheless, I was adamant on adding more features like IBL and HDR skyboxes for better visuals. 

<br>
<div class="row mt-3">
  <div class="col-sm mt-3 mt-md-0">
    <figure class="text-center">
      {% include figure.html loading="eager" path="assets/img/Blog/HowIBuiltaVulkanRenderingEngine/ViolinScene.png" class="img-fluid rounded z-depth-1" %}
      <figcaption class="mt-2 text-muted">A scene of a violin, featuring PBR, rendered using Vejaler</figcaption>
    </figure>
  </div>
</div>
<br>

<br>
### **Adding HDR Skybox** <br>
<br>

A skybox is an important component of any graphics application. Having a solid color as a background image

***

<br>
<br>

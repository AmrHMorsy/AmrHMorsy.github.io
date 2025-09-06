---
layout: post
title: How I Built a Vulkan Rendering Engine
date: 2025-09-04 12:00:00
description:
tags:
categories:
thumbnail: assets/img/Blog/HowIBuiltaVulkanRenderingEngine/Thumbnail.png
featured: false
---

<br>
### **Introduction** <br>
<br>

In this blog post, I am going to share with you my development journey in building a rendering engine using the [Vulkan](https://www.vulkan.org) API. I named the engine **Vejaler** and published it [here](https://vejaler.github.io). The engine features PBR, IBL, frustum culling, clustering, HDR skybox, shadow mapping and z pre-pass. 

Although the engine is still under development, I thought it might worthwhile to document what I have built so far, and the challenges I have faced early-on. 

<br>
<div class="row mt-3">
  <div class="col-sm mt-3 mt-md-0">
    <figure class="text-center">
      {% include figure.html loading="eager" path="assets/img/Blog/HowIBuiltaVulkanRenderingEngine/Thumbnail.png" class="img-fluid rounded z-depth-1" %}
      <figcaption class="mt-2 text-muted">A scene of a car on a bridge in the morning, rendered using Vejaler.</figcaption>
    </figure>
  </div>
</div>
<br>


<br>
### **Why I Wanted To Learn Vulkan** <br>
<br>

I started building the engine a few months ago because I wanted to deepen my knowledge of the Vulkan API, and also to challenge myself in some way. 

The Vulkan API is known for its verbosity and difficulty. Having said that, it’s a valuable tool for  graphics programmers because it gives them so much control over the rendering pipeline. 

Before starting learning Vulkan, I was already proficient in OpenGL and have built a complete rendering engine using it, with many features such as PBR, IBL, shadow mapping and many more. But in efforts to become an all-around better graphics programmer, I wanted to have more APIs in my arsenal, and understand the graphics pipeline at a deeper level, since OpenGL abstracts a lot of details from the developer for the sake of simplicity. That’s why I decided to embark on the journey of learning and mastering the Vulkan API. 

<br>
<div class="row mt-3">
  <div class="col-sm mt-3 mt-md-0">
    <figure class="text-center">
      {% include figure.html loading="eager" path="assets/img/Blog/HowIBuiltaVulkanRenderingEngine/OpenGLScene.png" class="img-fluid rounded z-depth-1" %}
      <figcaption class="mt-2 text-muted">A scene of a piano room in a house, rendered using my OpenGL engine</figcaption>
    </figure>
  </div>
</div>

<br>
### **Early Days** <br>
<br>

I started my journey in January 2025 by first creating a small window with a simple triangle. This took me almost a week just to get right, because of the many vulkan entities that needs to be set and initialized. It takes so many lines of code to just create a simple window. At first, nothing made sense to me. What is a window surface ? What is the logical and the physical device ? Although I was able to create that very simple triangle scene, I didn’t understand much about what was going on under the hood. 

After rendering that simple triangle, I thought the next logical step would be to load an OBJ model. It’s the simplest extension at that point, since all I had to do was load the OBJ model data manually or using the Assimp library, update the data inside the vertex buffer and also add the indices data to an index buffer. This allowed me to quickly start seeing more complex models instead of just a simple polygon. 

Once I reached that point, the development journey after that became much smoother. I started enjoying Vulkan, because I was able to experiment with the configurations in many different ways, and actually see it reflect directly on the screen. For example, I started implementing a camera class and passed on the view and the projection matrices to the shader, which allowed me to move the camera around in the scene freely. 

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

Implementing textures was a bit tricky, as it involved several steps. First, it was apparent to me that I needed to load the image first. This part of implementation is similar to how I used to do it in OpenGL. I used the library STB_Image to load the image and then stored the loaded data inside a buffer. After that, I decided to calculate the maximum number of mip levels of that loaded image. This will be needed later when adding support for mip mapped textures. 

The remaining set of steps involved creating a vulkan image, storing the loaded image data in a Vulkan buffer, and then finally copying the data from the buffer to the Vulkan image. After implementing these steps, I only had to update the descriptor sets by adding one more binding slot for the texture, and similarly update the shader code. With these additions in place, I was able to see complex models with textures. 


<br> 
### **Implementing A Lighting System** <br>
<br>

Next, I decided to embark on implementing the lighting system. It was fairly simple. All I had to do was create a new uniform buffer containing information like the position and the color of the light, and update the descriptor set to account for the extra binding of the uniform buffer. This created uniform buffer, which resides in the fragment shader, will actually be useful later, as I can simply append more data inside it like the camera position, for them to be used by the fragment shader code.

I was enjoying the development journey at that time. So far, it was a smooth experience. There was no major obstacles being faced, and the features added were straightforward to implement. There were no new Vulkan constructs to learn about. I got introduced to all of them at the very beginning when I was creating the simple triangle, and I kept re-using and recreating them for different features. 

<br>
### **Implementing PBR** <br>
<br>

Implementing PBR at that time was easy for me. That’s because I already had a working shader from my OpenGL engine. Refactoring it in my Vulkan engine was straightforward: I just had to replicate the code for implementing I had before, to account for the extra images. 

With this, I was able to have a solid renderer that was able to produce reasonably good images. Nevertheless, I was adamant on adding more features like IBL and HDR skyboxes for better visuals. 

<br>
<div class="row mt-3">
  <div class="col-sm mt-3 mt-md-0">
    <figure class="text-center">
      {% include figure.html loading="eager" path="assets/img/Blog/HowIBuiltaVulkanRenderingEngine/ViolinScene.png" class="img-fluid rounded z-depth-1" %}
      <figcaption class="mt-2 text-muted">A scene of a violin, rendered using Vejaler</figcaption>
    </figure>
  </div>
</div>

<br>

***

<br>
<br>

---
layout: post
title: How I Built a Vulkan Rendering Engine - Part 1
date: 2025-09-04 12:00:00
description:
tags:
categories:
thumbnail: assets/img/Blog/HowIBuiltaVulkanRenderingEnginePart1/Thumbnail.png
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
      {% include figure.html loading="eager" path="assets/img/Blog/HowIBuiltaVulkanRenderingEnginePart1/Thumbnail.png" class="img-fluid rounded z-depth-1" %}
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
      {% include figure.html loading="eager" path="assets/img/Blog/HowIBuiltaVulkanRenderingEnginePart1/OpenGLScene.png" class="img-fluid rounded z-depth-1" %}
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
### **Understanding Vulkan** <br>
<br>

At that point, I decided to stop adding more features, and instead try to understand the API in more details. In my experience, the way I do that has always been to re-read the code again and clean it out a bit. I started separating the code into classes, where each class is responsible for a single task in the rendering pipeline. 

For example, I created a shader class which loads the SPV files and creates a shader module and returns it. I also created another separate class which handles the creation of the graphics pipeline and all its necessary configuration. I continued doing this for all the Vulkan constructs in my program and turned all these engine components into static classes. That is, I transformed all these classes into utility-style classes, so that it doesn’t store any state. This simplified the code a lot, since it delegated each class only one task, which is to manage that particular Vulkan object. 

At that point, Vulkan became a bit clearer to me in some way. In fact, after cleaning out the code, I realized that I actually prefer Vulkan over any other high-level API. It’s verbosity and low-levelness gives so much control over the pipeline, and allows me to understand what really happens under the hood in so many details. 

At that point, I was excited to continue developing the engine further and add more features. The next set of features I added were lighting system, PBR and textures. The journey of developing these features will be shared in the next part of the blog. 

<br>

***

<br>
<br>

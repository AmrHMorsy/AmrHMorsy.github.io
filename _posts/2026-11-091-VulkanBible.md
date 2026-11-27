---
layout: post
title: Vulkan Bible
date: 2026-11-09 09:00:00
description:
tags:
categories:
thumbnail: assets/img/Blog/VulkanBible/
featured: false
---

<br>

<blockquote>
<h3><b>Contents</b></h3>
<br>
<ul>
    <li><a href="#commandBuffer">1.2 &nbsp; Command Buffer</a></li>
    <ul>
        <li><a href="#allocatingCommandBuffers">1.2.1 &nbsp; Allocating Command Buffers</a></li>
        <li><a href="#destroyingCommandBuffers">1.2.2 &nbsp; Destroying Command Buffers</a></li>
        <li><a href="#commandBufferStates">1.2.3 &nbsp; Command Buffers States</a></li>
    </ul>
    <li><a href="#References">References</a></li>
</ul>
</blockquote>
<br>
<hr>
<br>

<br>
<h4 id="commandBuffer"><b>1.2 &nbsp; Command Buffer</b></h4>
<br>

A command buffer is an object of type <span class="vulkan"><b>VkCommandBuffer</b></span>. The purpose of this object is to store the commands we want the GPU to execute. In Vulkan, we do not send the commands one-by-one to the GPU for execution. Instead, we record all the commands into a command buffer first. Once we are done recording, and we do not want to add any more commands, we submit the command buffer to the GPU queue. Only after submission does the GPU start processing these commands individually in the exact order we recorded them. This allows the GPU to execute commands in bulk, saving the CPU some computational overhead from having to continiouusly submit commands to the GPU. 

<br>

We will start by creating a new file called <span class="fileNames"><b>CommandBuffer.h</b></span>. In this file, we will define a class named <span class="classNames"><b>CommandBuffer</b></span>. This class will contain all the functions that pertain command buffer objects. 

```cpp
// CommandBuffer.h

class CommandBuffer{

};
```

<br>
<h5 id="allocatingCommandBuffers"><b>1.2.1 &nbsp; Allocating Command Buffers</b></h5>
<br>

The Vulkan function that is responsible for allocating command buffers is <span class="vulkan"><b>vkAllocateCommandBuffers</b></span>. This function allocates an array of command buffers and returns a variable of type <span class="vulkan"><b>VkResult</b></span>, indicating the status of completion. If the result is <span class="vulkan"><b>VK_SUCCESS</b></span>, then the allocation was successful. Otherwise, the function failed to allocate command buffers. 

<br>

The signature of the <span class="vulkan"><b>vkAllocateCommandBuffers</b></span> function is defined as follows: 

```cpp
VkResult vkAllocateCommandBuffers(
    VkDevice device, 
    const VkCommandBufferAllocateInfo * pAllocateInfo, 
    VkCommandBuffer * pCommandBuffers 
);
```

where

<li><b>device</b> is the logical device.</li>

<li><b>pAllocateInfo</b> is a pointer to a single object of type <span class="vulkan">VkCommandBufferAllocateInfo</span>. This object contain parameters that dictate how the command buffers should be allocated.</li>

<li><b>pCommandBuffers</b> is a pointer to an array of objects of type <span class="vulkan"><b>VkCommandBuffer</b></span>. The allocated command buffers will be stored in this array.</li>
<br>

<br>

The structure <span class="vulkan">VkCommandBufferAllocateInfo</span> is defined as follows: 

```cpp
typedef struct VkCommandBufferAllocateInfo {
    VkStructureType sType, 
    const void * pNext,  
    VkCommandPool commandPool, 
    VkCommandBufferLevel level, 
    uint32_t commandBufferCount 
} VkCommandBufferAllocateInfo;
```
<br>
where

- <b>sType</b> is a value of type <span class="vulkan">VkStructureType</span>. This value serves as an identifier of the structure. We will set it to <span class="vulkan">VK_STRUCTURE_TYPE_COMMAND_BUFFER_ALLOCATE_INFO</span>.

- <b>pNext</b> is a pointer to an extension to this structure. We will set it to <b>nullptr</b> for now. 

- <b>commandPool</b> is an object of type of <span class="vulkan">VkCommandPool</span>. This is the handle of the command pool from which the command buffers will be allocated. 

- <b>level</b> is a value of type <span class="vulkan">VkCommandBufferLevel</span> indicating the level of the command buffer. There are 2 possible levels a command buffer can be in: <b>Primary</b>[ <span class="vulkan">VK_COMMAND_BUFFER_LEVEL_PRIMARY</span>] and <b>Secondary</b> [<span class="vulkan">VK_COMMAND_BUFFER_LEVEL_SECONDARY</span>]. For now, we will only allocate primary command buffers. We will discuss secondary command buffers once we start exploring multi-threading. 

- <b>commandBufferCount</b> is the number of command buffers to be allocated. 

<br>
<br>

We will add a new function to our <span class="classNames"><b>CommandBuffer</b></span> class called <span class="functionNames"><b>Allocate()</b></span>. This function will serve as an abstraction to the command buffers allocation process. Rather than having to repeatedly define and fill a <span class="vulkan"><b>VkCommandBufferAllocateInfo</b></span> structure every time we want to allocate command buffers, which will happen alot in our Vulkan renderer and would cause code bloat if such measure was adopted, we will call this function instead. This function takes as input an empty array of <span class="vulkan"><b>VkCommandBuffer</b></span>, as well as the parameters to be fed to the <span class="vulkan"><b>VkCommandBufferAllocateInfo</b></span> structure. In return, it pursues the allocation process. If it is successful, the given empty array will be filled with the allocated command buffer objects. Otherwise, a run-time exception will be thrown, terminating the program. 

```cpp
// CommandBuffer.h

class CommandBuffer{

public:

    static void Allocate(VkDevice device, VkCommandPool commandPool, VkCommandBufferLevel level, uint32_t commandBufferCount, std::vector<VkCommandBuffer>& commandBuffers)
    {
        VkCommandBufferAllocateInfo info{};
        
        info.sType = VK_STRUCTURE_TYPE_COMMAND_BUFFER_ALLOCATE_INFO;
        info.commandPool = commandPool;
        info.level = level;
        info.commandBufferCount = commandBufferCount;
        info.pNext = nullptr;
        
        commandBuffers.resize(commandBufferCount);
        
        VkResult result = vkAllocateCommandBuffers(device, &info, commandBuffers.data());
        
        if(result != VK_SUCCESS)
            throw std::runtime_error("ERROR::FAILURE TO ALLOCATE COMMAND BUFFERS");
    }
};
```

<br>
<br>

In the function <span class="functionNames"><b>Build()</b></span> in <span class="fileNames"><b>main.cpp</b></span>, we will call the <span class="functionNames"><b>CommandBuffer::Allocate()</b></span> function to allocate <b>MAX_FRAMES_IN_FLIGHT</b> command buffers; a command buffer for each concurrent frame, since using one command buffer for all concurrent frames would cause race conditions. 

```cpp
void Build()
{
    std::vector<VkCommandBuffer> commandBuffers;
    CommandBuffer::Allocate(logicalDevice, commandPool, VK_COMMAND_BUFFER_LEVEL_PRIMARY, MAX_FRAMES_IN_FLIGHT, commandBuffers);
}
```
 
<br>

<blockquote>
Suppose for example we allocated only one command buffer for all concurrent frames. The CPU, then, will record all the commands for frame \(i\) into this command buffer and then submit the buffer to the GPU. While the GPU is reading the commands within this buffer, frame \(i+1\) would already have started recording commands into this same buffer that is currently in processing by the GPU; hence causing a race condition. 

<br>
<br>

If we really want to allocate only one command buffer for all concurrent frames, then we would have to wait for the GPU to finish processing the commands within the buffer for frame \(i\) before starting working on frame \(i+1\). However, this would slow down our rendering pipeline, since the CPU would be idle while the GPU is waiting. A more efficient system would involve tasking the CPU with the next frame while the GPU is processing the current frame, keeping the pipeline continueously working and producing frames to the screen.
</blockquote>
<br>
<br>

<br>
<h5 id="destroyingCommandBuffers"><b>1.2.2 &nbsp; Destroying Command Buffers</b></h5>
<br>

During the process of destroying all vulkan resources at the end of the Vulkan program, we should also make sure to free the allocated command buffers. This is typically done by calling the function <span class="vulkan"><b>vkFreeCommandBuffers</b></span>. 

<br>

The signature of the <span class="vulkan"><b>vkFreeCommandBuffers</b></span> function is defined as follows: 

```cpp
void vkFreeCommandBuffers(
    VkDevice device,
    VkCommandPool commandPool,
    uint32_t commandBufferCount,
    const VkCommandBuffer * pCommandBuffers
);    
```

where 

<li><b>device</b> is the logical device.</li>
<li><b>commandPool</b> is the command pool from which the command buffers that we wish to free were allocated from.</li>
<li><b>commandBufferCount</b> is the number of command buffer objects we wish to free</li>
<li><b>pCommandBuffers</b> is a pointer to an array of command buffer objects. These are command buffer objects we wish to free.</li>

<br>

We will add a new function to our <span class="classNames"><b>CommandBuffer</b></span> class called <span class="functionNames"><b>Free()</b></span>. The responsibility of this function is to simply free the command buffers given the parameters of <span class="vulkan"><b>vkFreeCommandBuffers</b></span>. 

```cpp
// CommandBuffer.h

class CommandBuffer{

public:

    static void Allocate(VkDevice device, VkCommandPool commandPool, VkCommandBufferLevel level, uint32_t commandBufferCount, std::vector<VkCommandBuffer>& commandBuffers)
    {
        VkCommandBufferAllocateInfo info{};
        
        info.sType = VK_STRUCTURE_TYPE_COMMAND_BUFFER_ALLOCATE_INFO;
        info.commandPool = commandPool;
        info.level = level;
        info.commandBufferCount = commandBufferCount;
        info.pNext = nullptr;
        
        commandBuffers.resize(commandBufferCount);
        
        VkResult result = vkAllocateCommandBuffers(device, &info, commandBuffers.data());
        
        if(result != VK_SUCCESS)
            throw std::runtime_error("ERROR::FAILURE TO ALLOCATE COMMAND BUFFERS");
    }
    
    static void Free(VkDevice logicalDevice, VkCommandPool commandPool, std::vector<VkCommandBuffer> commandBuffers)
    {
        vkFreeCommandBuffers(logicalDevice, commandPool, static_cast<uint32_t>(commandBuffers.size()), commandBuffers.data()) ;
    }
};

```

<br>
<br>
<br>
<h5 id="commandBufferStates"><b>1.2.3 &nbsp; Command Buffer States</b></h5>
<br>

<figure class="col-md-12 text-center theme-img repo-img-light">
    {% include figure.html  path="assets/img/Blog/VulkanBible/Dark/CommandBufferLifeCycle.svg" %}
    <figcaption>
        <br>Figure 1.1 [<a href="https://docs.vulkan.org/spec/latest/chapters/cmdbuffers.html">
             Source
        </a>]
    </figcaption>
</figure>
<figure class="col-md-12 text-center theme-img repo-img-dark">
    {% include figure.html  path="assets/img/Blog/VulkanBible/Light/CommandBufferLifeCycle.svg"%}
    <figcaption>
        <br>Figure 1.1 [<a href="https://docs.vulkan.org/spec/latest/chapters/cmdbuffers.html">
             Source
        </a>]
    </figcaption>
</figure>

<br>
<br>

A command buffer object can be in any of the following states: 

<br>
<br>
<u><b>Initial State</b></u>
<br>
<br>

When a command buffer object is just allocated, it is, by default, in the <b>initial</b> state. In this state, the command buffer is idle and not activated. As shown in figure $$1.1$$, a command buffer in either the <b>recording</b>, <b>executable</b>, or <b>invalid</b> state can be reset back to the <b>initial</b> state using the function <span class="vulkan"><b>vkResetCommandBuffer</b></span>. 

<br>

The signature of the <span class="vulkan"><b>vkResetCommandBuffer</b></span> function is defined as follows: 

```cpp
VkResult vkResetCommandBuffer(
    VkCommandBuffer commandBuffer,
    VkCommandBufferResetFlags flags
);
```

where: 

<ul>
    <li><b>commandBuffer</b> is the command buffer object we wish to reset its state.</li>
    <li><b>flags</b> is a bitmask of type <span class="vulkan"><b>VkCommandBufferResetFlags</b></span> specifying the behaviour of the reset operation. We will set it to the default value of \(0\).</li>
</ul>

The function <span class="vulkan"><b>vkResetCommandBuffer</b></span> returns a value of type <span class="vulkan"><b>VkResult</b></span> indicating the status of the resetting operation. A value of <span class="vulkan"><b>VK_SUCCESS</b></span> indicates that the command buffer was successfully resetted. 

<br>

We will add a new function to our <span class="classNames"><b>CommandBuffer</b></span> class called <span class="functionNames"><b>Reset()</b></span>. This function will simply be responsible for reseting a command buffer given the parameters of <span class="vulkan"><b>vkResetCommandBuffer</b></span>. 

```cpp
// CommandBuffer.h

class CommandBuffer{

public:

    static void Allocate(VkDevice device, VkCommandPool commandPool, VkCommandBufferLevel level, uint32_t commandBufferCount, std::vector<VkCommandBuffer>& commandBuffers)
    {
        VkCommandBufferAllocateInfo info{};
        
        info.sType = VK_STRUCTURE_TYPE_COMMAND_BUFFER_ALLOCATE_INFO;
        info.commandPool = commandPool;
        info.level = level;
        info.commandBufferCount = commandBufferCount;
        info.pNext = nullptr;
        
        commandBuffers.resize(commandBufferCount);
        
        VkResult result = vkAllocateCommandBuffers(device, &info, commandBuffers.data());
        
        if(result != VK_SUCCESS)
            throw std::runtime_error("ERROR::FAILURE TO ALLOCATE COMMAND BUFFERS");
    }
    
    static void Free(VkDevice logicalDevice, VkCommandPool commandPool, std::vector<VkCommandBuffer> commandBuffers)
    {
        vkFreeCommandBuffers(logicalDevice, commandPool, static_cast<uint32_t>(commandBuffers.size()), commandBuffers.data()) ;
    }
    
    static void Reset(VkCommandBuffer& commandBuffer)
    {
        if(vkResetCommandBuffer(commandBuffer, 0) != VK_SUCCESS)
            throw std::runtime_error("ERROR::FAILURE TO RESET COMMAND BUFFER");
    }
};
```

<br>
<b><u>Recording</u></b>
<br>
<br>

To activate the command buffer and allow it to start recording commands, we have to convert its state to <b>recording</b>. As shown in figure $$1.1$$, a command buffer can only be converted to the <b>recording</b> if it is in the <b>initial</b> state. Such conversion can be done using the function <span class="vulkan"><b>vkBeginCommandBuffer</b></span>. A command buffer in any other state must first be converted to the <b>initial</b> before transitioning it to the <b>recording</b> state. 

<br>

The signature of the <span class="vulkan"><b>vkBeginCommandBuffer</b></span> function is defined as follows: 

```cpp
VkResult vkBeginCommandBuffer(
    VkCommandBuffer commandBuffer,
    const VkCommandBufferBeginInfo * pBeginInfo
);
```

where: 

<ul>
    <li><b>commandBuffer</b> is the command buffer object we wish to change its state to <b>recording</b>.</li>
    <li><b>pBeginInfo</b> is a pointer to a single object of type <span class="vulkan"><b>VkCommandBufferBeginInfo</b></span>. This object specifies parameters that pertain the recordation process of the command buffer object. </li>
</ul>

<br>

The structure <span class="vulkan">VkCommandBufferBeginInfo</span> is defined as follows: 

```cpp
typedef struct VkCommandBufferBeginInfo {
    VkStructureType sType;
    const void * pNext;
    VkCommandBufferUsageFlags flags;
    const VkCommandBufferInheritanceInfo * pInheritanceInfo;
} VkCommandBufferBeginInfo;
```

where: 

<ul>
    <li><b>sType</b> is a value of type <span class="vulkan">VkStructureType</span>. This value serves as an identifier of the structure. We will set it to <span class="vulkan">VK_STRUCTURE_TYPE_COMMAND_BUFFER_BEGIN_INFO</span>.</li>
    <li><b>pNext</b> is a pointer to an extension to this structure. We will set it to <b>nullptr</b> for now. </li>
</ul>


<br>
<br>
<br>
<b><u>Executable</u></b>
<br>

<br>
<b><u>Pending</u></b>
<br>

<br>
<b><u>Invalid</u></b>
<br>



<br>
<br>
<hr>
<br>
<br>
<h4 id="References"><b>References</b></h4>
<br>

**[1]** $$$$ $$$$ [Vulkan Documentation](https://docs.vulkan.org/spec/latest/index.html)
<br>
<br>
<br>
<hr>
<br>
<br>

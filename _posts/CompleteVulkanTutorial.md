---
layout: post
title: Complete Vulkan Tutorial
date: 2026-01-23 09:00:00
description: Vulkan Tutorial
tags:
categories:
thumbnail: assets/img/Blog/CompleteVulkanTutorial/
featured: false
---

<br>

***


<a href="#Hello-Triangle" class="IndexLink"><b>1 $$$$ Hello Triangle</b></a>
<br>
$$$$ $$$$ $$$$ $$$$ $$$$ $$$$<a href="#Command-Buffer" class="IndexLink">1.1 $$$$ Command Buffer</a>
<br>
$$$$ $$$$ $$$$ $$$$ $$$$ $$$$ $$$$ $$$$ $$$$ $$$$ $$$$ $$$$<a href="#Command-Pool" class="IndexLink">1.1.1 $$$$ Command Pool</a>
<br>
$$$$ $$$$ $$$$ $$$$ $$$$ $$$$ $$$$ $$$$ $$$$ $$$$ $$$$ $$$$<a href="#allocating-command-buffers" class="IndexLink">1.1.2 $$$$ Allocating Command Buffers</a>

***
<br>

<br>
## **1 $$$$ Hello Triangle** {#Hello-Triangle}
<br>

<br>
#### **1.1 $$$$ Command Buffer** {#Command-Buffer}
<br>

A **command buffer** is an object of type <a href="https://docs.vulkan.org/spec/latest/chapters/cmdbuffers.html#VkCommandBuffer" class="vulkan">VkCommandBuffer</a>. It is responsible for storing the commands that you want the GPU to execute. 

In Vulkan, we do not send commands to the GPU one at a time. Instead, we record all the commands that we want the GPU to execute into the command buffer. Once we are done recording and we do not want to add any more commands, we submit the buffer to the GPU queue. Only after submission does the GPU start processing these commands one by one, in the exact order they were recorded.

Before we address how to allocate these command buffers, we first need to discuss another Vulkan object called the **command pool**.

<br>
##### **1.1.1 $$$$ Command Pool** {#Command-Pool}
<br>

A **command pool** is an object of type <a href="https://docs.vulkan.org/spec/latest/chapters/cmdbuffers.html#VkCommandPool" class="vulkan">VkCommandPool</a>. It is responsible for allocating and managing memory for command buffers. Each allocated command buffer must have a defined command pool. A command pool object can have more than one command buffer object. This design allows the command buffers that are within the same command pool be allocated in the same memory region and be treated as a group. This way, operations, such as resetting and destroying, can be done on all of them in one-go, without having to perform it indiviually on each one.

<br>

<div class="row align-items-center mt-3">
        <figure class="col-md-12 text-center theme-img repo-img-light">
        {% include figure.html loading="lazy"
                 path="assets/img/Blog/CompleteVulkanTutorial/Dark/1.png"
                 width="953" height="387" %}
        </figure>
        <figure class="col-md-12 text-center theme-img repo-img-dark">
        {% include figure.html loading="lazy"
                 path="assets/img/Blog/CompleteVulkanTutorial/Light/1.png"
                 width="953" height="387" %}
        </figure>
</div>

<br>

We will start by creating a class called **CommandPool**. This class will encapsulate all functions related to the command pool.

```cpp
class CommandPool{
    
};

```

<br>

We will add a function to this class called **Create()**. This function takes as input a certain set of parameters and returns the created command pool.

```cpp
static VkCommandPool Create(VkDevice logicalDevice, uint32_t queueFamilyIndex, VkCommandPoolCreateFlags flags)
{
    VkCommandPoolCreateInfo commandPoolCreateInfo{};
        
    commandPoolCreateInfo.sType = VK_STRUCTURE_TYPE_COMMAND_POOL_CREATE_INFO;
    commandPoolCreateInfo.flags = flags;
    commandPoolCreateInfo.pNext = nullptr;
    commandPoolCreateInfo.queueFamilyIndex = queueFamilyIndex;
        
    VkCommandPool commandPool;
    VkResult result = vkCreateCommandPool(logicalDevice, &commandPoolCreateInfo, nullptr, &commandPool);
        
    if(result != VK_SUCCESS)
        throw std::runtime_error("ERROR::FAILURE TO CREATE COMMAND POOL");

    return commandPool;
}
```

<br>

<a href="https://docs.vulkan.org/spec/latest/chapters/cmdbuffers.html#vkCreateCommandPool" class="vulkan">vkCreateCommandPool</a> is the function that creates a command pool. It returns a variable of type <a href="https://docs.vulkan.org/spec/latest/chapters/fundamentals.html#VkResult" class="vulkan">VkResult</a>. This variable indicates whether the call succeeded or not. If the variable has the value <a href="https://docs.vulkan.org/spec/latest/chapters/fundamentals.html#VkResult" class="vulkan">VK_SUCCESS</a>, then the creation of the command pool was successful. Otherwise, it means that the call failed. We will handle the unsuccessful case by throwing an exception indicating failure to create a command pool. 

The signature of <a href="https://docs.vulkan.org/spec/latest/chapters/cmdbuffers.html#vkCreateCommandPool" class="vulkan">vkCreateCommandPool</a> is as follows:

```cpp
VkResult vkCreateCommandPool(
    VkDevice device, 
    const VkCommandPoolCreateInfo * pCreateInfo, 
    const VkAllocationCallbacks * pAllocator, 
    VkCommandPool * pCommandPool
);  
```

where: 

- <b>device</b> is the logical device

- <b>pCreateInfo</b> is a pointer to <a href="https://docs.vulkan.org/spec/latest/chapters/cmdbuffers.html#VkCommandPoolCreateInfo" class="vulkan">VkCommandPoolCreateInfo</a> struct. This struct specifies some parameters that dictate how the command pool should be created. 

- <b>pAllocator</b> is an optional pointer to a custom host memory allocator. We will set it to **nullptr**, since we will not be using any custom allocator.

- <b>pCommandPool</b> is the output parameter. If the call is successful, the handle of the created command pool will be written into this variable. 

<br>

The <a href="https://docs.vulkan.org/spec/latest/chapters/cmdbuffers.html#VkCommandPoolCreateInfo" class="vulkan">VkCommandPoolCreateInfo</a> structure specifies some parameters that specify how the command pool should be created. The structure is defined as follows:

```cpp
typedef struct VkCommandPoolCreateInfo {
    VkStructureType sType,
    const void * pNext,
    VkCommandPoolCreateFlags flags,
    uint32_t queueFamilyIndex
} VkCommandPoolCreateInfo;
```

Where:

- <b>sType</b> is a value of type <a href="https://docs.vulkan.org/refpages/latest/refpages/source/VkStructureType.html" class="vulkan">VkStructureType</a> specifying the type of operation. We will set it to <a href="https://docs.vulkan.org/refpages/latest/refpages/source/VkStructureType.html" class="vulkan">VK_STRUCTURE_TYPE_COMMAND_POOL_CREATE_INFO</a>, indicating creation of command pool.

- <b>pNext</b> is a pointer to another structure of type <a href="https://docs.vulkan.org/spec/latest/chapters/cmdbuffers.html#VkCommandPoolCreateInfo" class="vulkan">VkCommandPoolCreateInfo</a> that serves as an extension. We will set it to **nullptr**.

- <b>flags</b> is a bitmask of type <a href="https://docs.vulkan.org/refpages/latest/refpages/source/VkCommandPoolCreateFlags.html" class="vulkan">VkCommandPoolCreateFlags</a> specifying any usage behaviour you want to add for the command pool. We will set it to <a href="https://docs.vulkan.org/refpages/latest/refpages/source/VkCommandPoolCreateFlagBits.html" class="vulkan">VK_COMMAND_POOL_CREATE_RESET_COMMAND_BUFFER_BIT</a>. This is the most commonly used flag indicating that individual command buffers created within this particular command pool can be reset independently. This allows us to reuse command buffers individually without affecting other command buffers in the same pool.

- <b>queueFamilyIndex</b> specifies the index of the family of GPU queues to which the command buffer will be submitted to. This queue index is queried from the physical device in chapter 1.

<br>

At the end of the program, we should make sure to destroy the command pool as part of the cleanup process. Therefore, we will add another function to the class called **Destroy()**.


```cpp
static void Destroy(VkDevice logicalDevice, VkCommandPool commandPool)
{
    vkDestroyCommandPool(logicalDevice, commandPool, nullptr);
}
```

<br>

<a href="https://docs.vulkan.org/spec/latest/chapters/cmdbuffers.html#vkDestroyCommandPool" class="vulkan">vkDestroyCommandPool</a> is the function that destroys the command pool. Its signature is as follows: 

```cpp
void vkDestroyCommandPool(
    VkDevice logicalDevice,
    VkCommandPool commandPool,
    const VkAllocationCallbacks * pAllocator
);
```

where:

- <b>device</b> is the logical device
- <b>pAllocator</b> is the same parameter as the one in the function <a href="https://docs.vulkan.org/spec/latest/chapters/cmdbuffers.html#vkCreateCommandPool" class="vulkan">vkCreateCommandPool</a>. We will set it to **nullptr**, since we are not using any custom allocator.
- <b>commandPool</b> is the command pool to destory.

<br>

We will update the function **main()** to create **MAX_FRAMES_IN_FLIGHT** command pools -- one command pool for each frame. This setup allows us to perform operations on the command pool for one frame, without affecting the command pools of the other frames.


```cpp
std::vector<VkCommandPool> commandPools(MAX_FRAMES_IN_FLIGHT);
for(int i = 0; i < MAX_FRAMES_IN_FLIGHT; i++)
    commandPools[i] = CommandPool::Create(logicalDevice, queueFamilyIndex, VK_COMMAND_POOL_CREATE_RESET_COMMAND_BUFFER_BIT);
```

<br>
<br>

Below is the current implementation of the **CommandPool** class.

```cpp
class CommandPool{

public:

    static VkCommandPool Create(VkDevice logicalDevice, uint32_t queueFamilyIndex, VkCommandPoolCreateFlags flags)
    {
        VkCommandPoolCreateInfo commandPoolCreateInfo{};
            
        commandPoolCreateInfo.sType = VK_STRUCTURE_TYPE_COMMAND_POOL_CREATE_INFO;
        commandPoolCreateInfo.flags = flags;
        commandPoolCreateInfo.pNext = nullptr;
        commandPoolCreateInfo.queueFamilyIndex = queueFamilyIndex;
            
        VkCommandPool commandPool;
        VkResult result = vkCreateCommandPool(logicalDevice, &commandPoolCreateInfo, nullptr, &commandPool);
            
        if(result != VK_SUCCESS)
            throw std::runtime_error("ERROR::FAILURE TO CREATE COMMAND POOL");

        return commandPool;
    }

    static void Destroy(VkDevice logicalDevice, VkCommandPool commandPool)
    {
        vkDestroyCommandPool(logicalDevice, commandPool, nullptr);
    }
};
```

<br>
<br>

Below is the current implementation of the function **main()**.

```cpp
void main()
{
    VkCommandPool commandPool = CommandPool::Create(logicalDevice, queueFamilyIndex, VK_COMMAND_POOL_CREATE_RESET_COMMAND_BUFFER_BIT);
}

```

<br>
<br>

Below is the current program implementation.

```cpp
class CommandPool{

public:

    static VkCommandPool Create(VkDevice logicalDevice, uint32_t queueFamilyIndex, VkCommandPoolCreateFlags flags)
    {
        VkCommandPoolCreateInfo commandPoolCreateInfo{};
            
        commandPoolCreateInfo.sType = VK_STRUCTURE_TYPE_COMMAND_POOL_CREATE_INFO;
        commandPoolCreateInfo.flags = flags;
        commandPoolCreateInfo.pNext = nullptr;
        commandPoolCreateInfo.queueFamilyIndex = queueFamilyIndex;
            
        VkCommandPool commandPool;
        VkResult result = vkCreateCommandPool(logicalDevice, &commandPoolCreateInfo, nullptr, &commandPool);
            
        if(result != VK_SUCCESS)
            throw std::runtime_error("ERROR::FAILURE TO CREATE COMMAND POOL");

        return commandPool;
    }

    static void Destroy(VkDevice logicalDevice, VkCommandPool commandPool)
    {
        vkDestroyCommandPool(logicalDevice, commandPool, nullptr);
    }
};

void main()
{
    VkCommandPool commandPool = CommandPool::Create(logicalDevice, queueFamilyIndex, VK_COMMAND_POOL_CREATE_RESET_COMMAND_BUFFER_BIT);
}

```

<br>

<br>
##### **1.1.2 $$$$ Allocating Command Buffers** {#allocating-command-buffers}
<br>


```cpp
class CommandBuffer{
    
};

```

<br>

```cpp
static std::vector<VkCommandBuffer> Allocate(VkDevice logicalDevice, VkCommandPool commandPool, VkCommandBufferLevel level, uint32_t numCommandBuffers)
{
    VkCommandBufferAllocateInfo commandBufferAllocateInfo{};
        
    commandBufferAllocateInfo.sType = VK_STRUCTURE_TYPE_COMMAND_BUFFER_ALLOCATE_INFO;
    commandBufferAllocateInfo.commandPool = commandPool;
    commandBufferAllocateInfo.level = level;
    commandBufferAllocateInfo.commandBufferCount = numCommandBuffers;
        
    std::vector<VkCommandBuffer> commandBuffers(numCommandBuffers);
        
    VkResult result = vkAllocateCommandBuffers(logicalDevice, &commandBufferAllocateInfo, commandBuffers.data());
        
    if(result != VK_SUCCESS)
        throw std::runtime_error("ERROR::FAILURE TO ALLOCATE COMMAND BUFFERS");
        
    return commandBuffers;
}
```

<br>

```cpp
static void Begin(VkCommandBuffer commandBuffer, VkCommandBufferUsageFlags flag, const VkCommandBufferInheritanceInfo * pInheritanceInfo)
{
    VkCommandBufferBeginInfo commandBufferBeginInfo{};
        
    commandBufferBeginInfo.sType = VK_STRUCTURE_TYPE_COMMAND_BUFFER_BEGIN_INFO;
    commandBufferBeginInfo.flags = flag;
    commandBufferBeginInfo.pInheritanceInfo = pInheritanceInfo;
        
    VkResult result = vkBeginCommandBuffer(commandBuffer, &commandBufferBeginInfo);
        
    if(result != VK_SUCCESS)
        throw std::runtime_error("ERROR::FAILURE TO BEGIN RECORDING COMMAND BUFFER");
}
```

<br>

```cpp
static void End(VkCommandBuffer commandBuffer)
{
    VkResult result = vkEndCommandBuffer(commandBuffer);
        
    if(result != VK_SUCCESS)
        throw std::runtime_error("ERROR::FAILURE TO END RECORDING COMMAND BUFFER");
}
```

<br>

```cpp
static void Reset(VkCommandBuffer commandBuffer)
{
    VkResult result = vkResetCommandBuffer(commandBuffer, 0);
        
    if(result != VK_SUCCESS)
        throw std::runtime_error("ERROR::FAILURE TO RESET COMMAND BUFFER");
}
```

<br>

```cpp
static void Free(VkDevice logicalDevice, VkCommandPool commandPool, std::vector<VkCommandBuffer> commandBuffers)
{
    vkFreeCommandBuffers(logicalDevice, commandPool, static_cast<uint32_t>(commandBuffers.size()), commandBuffers.data());
}
```

<br>

Below is the current implementation of the **CommandBuffer** class.

<br>

```cpp
class CommandBuffer{
    
public:

    static std::vector<VkCommandBuffer> Allocate(VkDevice logicalDevice, VkCommandPool commandPool, VkCommandBufferLevel level, uint32_t numCommandBuffers)
    {
        VkCommandBufferAllocateInfo commandBufferAllocateInfo{};
        
        commandBufferAllocateInfo.sType = VK_STRUCTURE_TYPE_COMMAND_BUFFER_ALLOCATE_INFO;
        commandBufferAllocateInfo.commandPool = commandPool;
        commandBufferAllocateInfo.level = level;
        commandBufferAllocateInfo.commandBufferCount = numCommandBuffers;
        
        std::vector<VkCommandBuffer> commandBuffers(numCommandBuffers);
        
        VkResult result = vkAllocateCommandBuffers(logicalDevice, &commandBufferAllocateInfo, commandBuffers.data());
        
        if(result != VK_SUCCESS)
            throw std::runtime_error("ERROR::FAILURE TO ALLOCATE COMMAND BUFFERS");
        
        return commandBuffers;
    }

    static void Begin(VkCommandBuffer commandBuffer, VkCommandBufferUsageFlags flag, const VkCommandBufferInheritanceInfo * pInheritanceInfo)
    {
        VkCommandBufferBeginInfo commandBufferBeginInfo{};
        
        commandBufferBeginInfo.sType = VK_STRUCTURE_TYPE_COMMAND_BUFFER_BEGIN_INFO;
        commandBufferBeginInfo.flags = flag;
        commandBufferBeginInfo.pInheritanceInfo = pInheritanceInfo;
        
        VkResult result = vkBeginCommandBuffer(commandBuffer, &commandBufferBeginInfo);
        
        if(result != VK_SUCCESS)
            throw std::runtime_error("ERROR::FAILURE TO BEGIN RECORDING COMMAND BUFFER");
    }

    static void End(VkCommandBuffer commandBuffer)
    {
        VkResult result = vkEndCommandBuffer(commandBuffer);
        
        if(result != VK_SUCCESS)
            throw std::runtime_error("ERROR::FAILURE TO END RECORDING COMMAND BUFFER");
    }

    static void Reset(VkCommandBuffer commandBuffer)
    {
        VkResult result = vkResetCommandBuffer(commandBuffer, 0);
        
        if(result != VK_SUCCESS)
            throw std::runtime_error("ERROR::FAILURE TO RESET COMMAND BUFFER");
    }

    static void Free(VkDevice logicalDevice, VkCommandPool commandPool, std::vector<VkCommandBuffer> commandBuffers)
    {
        vkFreeCommandBuffers(logicalDevice, commandPool, static_cast<uint32_t>(commandBuffers.size()), commandBuffers.data()) ;
    }
};
```

<br>

Below is the current implementation of the function **main()**.

```cpp
void main()
{
    VkCommandPool commandPool = CommandPool::Create(logicalDevice, queueFamilyIndex, VK_COMMAND_POOL_CREATE_RESET_COMMAND_BUFFER_BIT);
    
    std::vector<VkCommandBuffer> commandBuffers = CommandBuffer::Allocate(logicalDevice, commandPool, VK_COMMAND_BUFFER_LEVEL_PRIMARY, MAX_FRAMES_IN_FLIGHT);
}
```

<br>

Below is the current program implementation.

```cpp
class CommandPool{

public:

    static VkCommandPool Create(VkDevice logicalDevice, uint32_t queueFamilyIndex, VkCommandPoolCreateFlags flags)
    {
        VkCommandPoolCreateInfo commandPoolCreateInfo{};
            
        commandPoolCreateInfo.sType = VK_STRUCTURE_TYPE_COMMAND_POOL_CREATE_INFO;
        commandPoolCreateInfo.flags = flags;
        commandPoolCreateInfo.pNext = nullptr;
        commandPoolCreateInfo.queueFamilyIndex = queueFamilyIndex;
            
        VkCommandPool commandPool;
        VkResult result = vkCreateCommandPool(logicalDevice, &commandPoolCreateInfo, nullptr, &commandPool);
            
        if(result != VK_SUCCESS)
            throw std::runtime_error("ERROR::FAILURE TO CREATE COMMAND POOL");

        return commandPool;
    }

    static void Destroy(VkDevice logicalDevice, VkCommandPool commandPool)
    {
        vkDestroyCommandPool(logicalDevice, commandPool, nullptr);
    }
};

class CommandBuffer{
    
public:

    static std::vector<VkCommandBuffer> Allocate(VkDevice logicalDevice, VkCommandPool commandPool, VkCommandBufferLevel level, uint32_t numCommandBuffers)
    {
        VkCommandBufferAllocateInfo commandBufferAllocateInfo{};
        
        commandBufferAllocateInfo.sType = VK_STRUCTURE_TYPE_COMMAND_BUFFER_ALLOCATE_INFO;
        commandBufferAllocateInfo.commandPool = commandPool;
        commandBufferAllocateInfo.level = level;
        commandBufferAllocateInfo.commandBufferCount = numCommandBuffers;
        
        std::vector<VkCommandBuffer> commandBuffers(numCommandBuffers);
        
        VkResult result = vkAllocateCommandBuffers(logicalDevice, &commandBufferAllocateInfo, commandBuffers.data());
        
        if(result != VK_SUCCESS)
            throw std::runtime_error("ERROR::FAILURE TO ALLOCATE COMMAND BUFFERS");
        
        return commandBuffers;
    }

    static void Begin(VkCommandBuffer commandBuffer, VkCommandBufferUsageFlags flag, const VkCommandBufferInheritanceInfo * pInheritanceInfo)
    {
        VkCommandBufferBeginInfo commandBufferBeginInfo{};
        
        commandBufferBeginInfo.sType = VK_STRUCTURE_TYPE_COMMAND_BUFFER_BEGIN_INFO;
        commandBufferBeginInfo.flags = flag;
        commandBufferBeginInfo.pInheritanceInfo = pInheritanceInfo;
        
        VkResult result = vkBeginCommandBuffer(commandBuffer, &commandBufferBeginInfo);
        
        if(result != VK_SUCCESS)
            throw std::runtime_error("ERROR::FAILURE TO BEGIN RECORDING COMMAND BUFFER");
    }

    static void End(VkCommandBuffer commandBuffer)
    {
        VkResult result = vkEndCommandBuffer(commandBuffer);
        
        if(result != VK_SUCCESS)
            throw std::runtime_error("ERROR::FAILURE TO END RECORDING COMMAND BUFFER");
    }

    static void Reset(VkCommandBuffer commandBuffer)
    {
        VkResult result = vkResetCommandBuffer(commandBuffer, 0);
        
        if(result != VK_SUCCESS)
            throw std::runtime_error("ERROR::FAILURE TO RESET COMMAND BUFFER");
    }

    static void Free(VkDevice logicalDevice, VkCommandPool commandPool, std::vector<VkCommandBuffer> commandBuffers)
    {
        vkFreeCommandBuffers(logicalDevice, commandPool, static_cast<uint32_t>(commandBuffers.size()), commandBuffers.data()) ;
    }
};

void main()
{
    VkCommandPool commandPool = CommandPool::Create(logicalDevice, queueFamilyIndex, VK_COMMAND_POOL_CREATE_RESET_COMMAND_BUFFER_BIT);
    
    std::vector<VkCommandBuffer> commandBuffers = CommandBuffer::Allocate(logicalDevice, commandPool, VK_COMMAND_BUFFER_LEVEL_PRIMARY, MAX_FRAMES_IN_FLIGHT);
}
```

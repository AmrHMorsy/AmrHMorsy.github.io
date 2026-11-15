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
<h4 id="commandBuffer"><b>1.2 &nbsp; Command Buffer</b></h4>
<br>

A command buffer is an object of type <span class="vulkan"><b>VkCommandBuffer</b></span>. The purpose of this object is to store all the commands we want the GPU to execute. In Vulkan, we do not send the commands one-by-one to the GPU for execution. Instead, we record all the commands into a command buffer first. Once we are done recording, and we do not want to add any more commands, we submit the command buffer to the GPU queue. Only after submission does the GPU start processing these commands individually in the exact order we recorded them. In other words, the only way a Vulkan program can communicate the commands to the GPU is through the command buffer object. Without one allocated, the GPU will remain idle. 

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

To allocate command buffers in Vulkan, we call the function <span class="vulkan"><b>vkAllocateCommandBuffers</b></span>. This function allocates an array of command buffers and returns a variable of type VkResult, indicating the status of completion. If the result is VK_SUCCESS, the allocation was successful. Otherwise, we throw an exception indicating failure to allocate these command buffers.
 
<br>

The signature of the function <span class="vulkan"><b>vkAllocateCommandBuffers</b></span> is defined as follows: 

```cpp
VkResult vkAllocateCommandBuffers(
    VkDevice device, 
    const VkCommandBufferAllocateInfo * pAllocateInfo, 
    VkCommandBuffer * pCommandBuffers 
);
```

where

<li><b>device</b> is the logical device</li>
<li><b>pAllocateInfo</b> is a pointer to an array of objects of type <span class="vulkan">VkCommandBufferAllocateInfo</span>. This object specifies certain parameters pertaining the allocation of the command buffers</li>
<li>pCommandBuffers is a pointer to an array of objects of type VkCommandBuffer. The allocated command buffers will be stored in this array.</li>
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

- sType is a value of type VkStructureType. This variable specifies the type of structur. We will set it to 
-  

<br>

We will start by adding a new function to our <span class="classNames"><b>CommandBuffer</b></span> class called <span class="functionNames"><b>Allocate()</b></span>. This function 


```cpp
// CommandBuffer.h

class CommandBuffer{

public:

    static void Allocate(VkDevice logicalDevice, 
        VkCommandPool commandPool, 
        VkCommandBufferLevel level, 
        std::vector<VkCommandBuffer>& commandBuffers, 
        uint32_t commandBufferCount)
    {
        VkCommandBufferAllocateInfo allocateInfo{};
        
        allocateInfo.sType = VK_STRUCTURE_TYPE_COMMAND_BUFFER_ALLOCATE_INFO;
        allocateInfo.commandPool = commandPool;
        allocateInfo.level = level;
        allocateInfo.commandBufferCount = commandBufferCount;
        
        commandBuffers.resize(numCommandBuffers);
        
        VkResult result = vkAllocateCommandBuffers(logicalDevice, &commandBufferAllocateInfo, commandBuffers.data());
        
        if(result != VK_SUCCESS)
            throw std::runtime_error("\033[31m\nERROR::FAILURE TO ALLOCATE COMMAND BUFFERS\n\033[0m");
    }
};
```


<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>

<figure class="col-md-12 text-center theme-img repo-img-light">
    {% include figure.html  path="assets/img/Blog/VulkanBible/Dark/CommandBufferLifeCycle.svg" %}
    <figcaption>
        <br>Figure 1.1[<a href="https://docs.vulkan.org/spec/latest/chapters/cmdbuffers.html">
             Source
        </a>]
    </figcaption>
</figure>
<figure class="col-md-12 text-center theme-img repo-img-dark">
    {% include figure.html  path="assets/img/Blog/VulkanBible/Light/CommandBufferLifeCycle.svg"%}
    <figcaption>
        <br>Figure 1.1[<a href="https://docs.vulkan.org/spec/latest/chapters/cmdbuffers.html">
             Source
        </a>]
    </figcaption>
</figure>

A command buffer object is always in any of the following states: 

<b><u>Initial</u></b>
<br>
When a command buffer is created, it is, by default, in the initial state. In this state, the command buffer is idle and not activated. A command buffer in any other state can be reset back to the initial state using the function 



<br>
<br>
<br>
<br>


<b><u>Recording</u></b>
<br>

<b><u>Executable</u></b>
<br>

<b><u>Pending</u></b>
<br>

<b><u>Invalid</u></b>
<br>

Figure $$1.1$$ shows the actions needed to transition from one state to another. 



states that a command buffer object can be in: 



In Vulkan, a command buffer object can be in any of the following states: 

<br>



<br>

Vulkan defined several states that command buffer can be in during its lifecycle. 



The command buffer can be 

<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>


In this buffer object, we store all the commands we want the GPU to execute. Examples of these commands include drawing, binding resources, pushing 


<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>








The task of this buffer is to store all the commands the programmer wishes the GPU to execute. In Vulkan, we do not send commands to the GPU one at a time. Instead, we record all the commands into a command buffer first. Once we are done recording, and we do not want to add any more commands, we submit the command buffer to the GPU queue. Only after submission does the GPU start processing these commands, one-by-one in the exact order we recorded them.


<br>
<br>
<br>


In Vulkan, the command buffer is an object of type of **VkCommandBuffer**. It stores all the commands that the programmer wishes the GPU to execute. In a Vulkan program, you do not send commands one at a time to the GPU. Instead, 

<br>
You do not send these commands to the GPU one at a time. Instead, you record all the commands into a command buffer first. Once you are done recording and you do not want to add any more commands, you submit the command buffer to the GPU queue. Only after submission does the GPU start processing these commands — one by one, in the exact order you recorded them. This system design gives you more control and helps the GPU work more efficiently by organizing work in batches. 





<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<h4 id="graphicsPipeline"><b>1.1 &nbsp; Graphics Pipeline</b></h4>
<br>

In **Vulkan**, to create graphics pipelines, we call the function:

```cpp
VkResult vkCreateGraphicsPipelines(
    VkDevice                                    device,
    VkPipelineCache                             pipelineCache,
    uint32_t                                    createInfoCount,
    const VkGraphicsPipelineCreateInfo*         pCreateInfos,
    const VkAllocationCallbacks*                pAllocator,
    VkPipeline*                                 pPipelines
);
```

where 

- device is the logical device
- pipelineCache
- **pCreateInfos** is a pointer to an array of objects of type <a href="https://docs.vulkan.org/spec/latest/chapters/pipelines.html#pipelines-graphics" class="vulkan">VkGraphicsPipelineCreateInfo</a>. Each one of these objects contains parameters that dictate how the corresponding graphics pipeline should be created.
- **createInfoCount** is the number of objects of type <a href="https://docs.vulkan.org/spec/latest/chapters/pipelines.html#pipelines-graphics" class="vulkan">VkGraphicsPipelineCreateInfo</a>. In turn, it is the number of graphics pipeline to be created. 
- **pAllocator** 
- **pPipelines** is a pointer to an array of objects of type <a href="https://docs.vulkan.org/spec/latest/chapters/pipelines.html#pipelines-graphics" class="vulkan">VkPipeline</a>. Each object is a handle to the constructed graphics pipeline. 

<br>
<br>



One of the core components of any renderer is the <b>graphics pipeline</b>. The purpose of the graphics pipeline is to produce a 2D image, given a 3D scene.




The 3D scene consists of a virtual camera, establishing the viewing point, a set of vertices forming polygons, and optionally a set of light sources. The 2D image the pipeline produces is then displayed on the screen, and constitutes one rendered frame. The efficiency of the graphics pipeline is measured by the number of rendered frames it produces in one second (FPS: Frames per second). 

<br>
<br>
<br>

<div class="row align-items-center mt-3">
<div class="col-md-5">



This 2D image is then displayed on the screen, and . 

The 2D image produced by the graphics pipeline goes on to be displayed on the screen. Each image produced consititute one rendered frame. 

<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>


<br>
<br>

, given a 3D scene

The graphics pipeline consists of several stages. Each stage is responsible for a specific task, and is dependent on the output of the previous stage. 

<br>
<br>

The stages of the pipeline in Vulkan are shown in figure 1.1.

 

<br>


All these stages are working together to produce the rendered



Each stage of the pipeline is 

<br>

Each stage of the graphics pipeline is responsible for a specific task, and is dependent on the output of the previous stage. Once a stage is done with its task, it hands off its output to the next stage, and immediately starts working on the next frame. 

<br>


</div>
<br>
<br>
<div class="col-md-7">
    <figure class="col-md-12 text-center theme-img repo-img-light">
        {% include figure.html  path="assets/img/Blog/LightCulling/Dark/vulkan_simplified_pipeline.svg" %}
        <figcaption>
          <br>Figure 1.1[<a href="https://docs.vulkan.org/tutorial/latest/03_Drawing_a_triangle/02_Graphics_pipeline_basics/00_Introduction.html#">
             Source
          </a>]
        </figcaption>
    </figure>
    <figure class="col-md-12 text-center theme-img repo-img-dark">
        {% include figure.html  path="assets/img/Blog/LightCulling/Light/vulkan_simplified_pipeline.svg"%}
        <figcaption>
          <br>Figure 1.1[<a href="https://docs.vulkan.org/tutorial/latest/03_Drawing_a_triangle/02_Graphics_pipeline_basics/00_Introduction.html#">
             Source
          </a>]
        </figcaption>
    </figure>
</div>
</div>



<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>




The output 2D image of the pipeline is displayed on the screen. 


Typically, the pipeline 

<br>
<br>
<br>
<br>




The pipeline consists of several stages. Each stage is responsible for one specific task, and cannot start performing its task until the previous stage has finished its own. 



The purpose of the graphics pipeline is to produce a 2D image for display on the screen, given a 3D scene consisting . 

<br>

The graphics pipeline consists of several stages. Each stage is responsible for one specific task, and cannot start on is dependent on the output of the previous stage. That is, 


<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>





The word **pipeline** refers to a system of connected stations that are working together to produce an output. 

Each station is responsible for the completion of one specific task, and is dependent on the output of the previous station. Once a station has completed its task, it hands off the output to the next station, and immediately starts working on the new batch of data. A station can not start working on its task unless the previous station has finished, and supplied it with the data it needs. 


The effectiveness of a pipeline as a system lies in the fact that all stations are working in parallel. While a station is processing instance $$i$$, 

In the context of rendering, a graphics pipeline is not different from the sandwich pipeline. It differs, however, in the input, the stages, and the output. The input of the graphics pipeline is a 3D scene. Typically, a scene consists of a virtual camera, establishing the viewing point, a set of vertices forming polygons, and optionally a set of virtual light sources. The output of the graphics pipeline is a 2D image to be displayed on the screen. is simply a pipeline with a goal at the end. The end goal is present something to the screen. The input is simply the scene description. A 3D scene, consiting of the vertices, a virtual camera. The stages of the graphics pipeline in Vulkan is shown in figure $$1.1$$. 

<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>

The advantages of the pipeline as a system is that all the stations are working in parallel. Whenever a station is done with its task, it hands off its data to the next station and immediately start working on the new batch of data. This ensures that the system is never idle; it always processes a new batch of data. 

<br>


<br>


<br>
One of the core components of any real-time renderer is the **graphics pipeline**. The purpose of this pipeline is to produce an image, given a 3D scene consisting of a virtual camera, a set of vertices forming polygons, and optionally a set of light sources. Before we explain the stages of the graphics pipeline, let's first explain the term "pipeline" itself.

Vulkan API requires that we explicitly build our own graphics pipeline, and specify the information that govern each stage. 

<br>

Vulkan requires that we build our own graphics pipeline and supply the information governing each station / stage on the pipeline. 

<br>





connected pipes, seperated by stages  



itself means a set of connected 
<br>

We will create a new file called <span class="fileNames">GraphicsPipeline.h</span>. Inside this file, we will define a new class called <span class="classNames">GraphicsPipeline</span>. This class will be responsible for all operations that involve graphics pipeline objects. 

```cpp 
// GraphicsPipeline.h

class GraphicsPipeline{

};
```

<br>

We will start by adding one core function to the class: <span class="functionNames">Build()</span>. The purpose of this function is to construct the graphics pipeline object <span class="vulkan">VkPipeline</span>, given a set of input parameters. 

```cpp
// GraphicsPipeline.h

class GraphicsPipeline{

public:

    void Build();
};
```

<br>
<br>
<br>
<br>





<br>

<blockquote>
<h3><b>Contents</b></h3>
<br>
<ul>
    <a href="#helloTriangle">1 &nbsp; Hello Triangle</a>
    <br>
    <ul>
        <a href="#graphicsPipeline">1.1 &nbsp; Graphics Pipeline</a>
        <ul>
            <a href="#shaders">1.1.1 &nbsp; Shaders</a>
        </ul>
    </ul>
</ul>
</blockquote>
<br>
<hr>
<br>


<br>
<h2 id="helloTriangle"><b>1 &nbsp; Hello Triangle</b></h2>

<br>
<br>


<br>
<br>
<br>



<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>


be responsible for all operations that pertain graphics pipelines. 

be responsible for all the operations that involve the




<br>
<br>

```cpp
typedef struct VkGraphicsPipelineCreateInfo {
    VkStructureType                                  sType;
    const void*                                      pNext;
    VkPipelineCreateFlags                            flags;
    uint32_t                                         stageCount;
    const VkPipelineShaderStageCreateInfo*           pStages;
    const VkPipelineVertexInputStateCreateInfo*      pVertexInputState;
    const VkPipelineInputAssemblyStateCreateInfo*    pInputAssemblyState;
    const VkPipelineTessellationStateCreateInfo*     pTessellationState;
    const VkPipelineViewportStateCreateInfo*         pViewportState;
    const VkPipelineRasterizationStateCreateInfo*    pRasterizationState;
    const VkPipelineMultisampleStateCreateInfo*      pMultisampleState;
    const VkPipelineDepthStencilStateCreateInfo*     pDepthStencilState;
    const VkPipelineColorBlendStateCreateInfo*       pColorBlendState;
    const VkPipelineDynamicStateCreateInfo*          pDynamicState;
    VkPipelineLayout                                 layout;
    VkRenderPass                                     renderPass;
    uint32_t                                         subpass;
    VkPipeline                                       basePipelineHandle;
    int32_t                                          basePipelineIndex;
} VkGraphicsPipelineCreateInfo
```

<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>


```cpp
struct ShaderConfig{
    std::string filePath;
    VkShaderStageFlagBits stageFlag;
};
```

<br>
<br>

```cpp
struct ShaderInfo{
    std::vector<ShaderConfig> config;
    std::vector<uint32_t> shaderFileData;
    std::vector<VkShaderModule> shaderModules;
    std::vector<VkPipelineShaderStageCreateInfo> pipelineShaderStages;
};
```

<br>
<br>

```cpp


class Shader{
    
private:
    
    static void FillPipelineShaderStageCreateInfo(VkShaderModule& shaderModule, VkShaderStageFlagBits& stageFlag, VkPipelineShaderStageCreateInfo& pipelineShaderStageCreateInfo)
    {
        pipelineShaderStageCreateInfo = {};
        pipelineShaderStageCreateInfo.sType = VK_STRUCTURE_TYPE_PIPELINE_SHADER_STAGE_CREATE_INFO;
        pipelineShaderStageCreateInfo.stage = stageFlag;
        pipelineShaderStageCreateInfo.module = shaderModule;
        pipelineShaderStageCreateInfo.pName = "main";
        pipelineShaderStageCreateInfo.pSpecializationInfo = nullptr;
    }
    
    static void CreateShaderModule(VkDevice logicalDevice, std::string filepath, std::vector<uint32_t> fileData, VkShaderModule& shaderModule)
    {
        VkShaderModuleCreateInfo createInfo{};
        
        createInfo.sType = VK_STRUCTURE_TYPE_SHADER_MODULE_CREATE_INFO;
        createInfo.codeSize = fileData.size() * sizeof(uint32_t);
        createInfo.pCode = fileData.data();
            
        VkResult result = vkCreateShaderModule(logicalDevice, &createInfo, nullptr, &shaderModule);
        
        if(result != VK_SUCCESS){
            std::string errorMsg = "\nError::Failure to create shader module corresponding to the file: ";
            errorMsg += filepath;
            throw std::runtime_error(errorMsg);
        }
    }
    
    static void ReadFile(std::string filepath, std::vector<uint32_t>& fileData)
    {
        std::ifstream file(filepath, std::ios::binary | std::ios::ate);
        if(!file.is_open()){
            std::string errorMsg = "\nError::Failure to read the shader file: ";
            errorMsg += filepath;
            throw std::runtime_error(errorMsg);
        }
        
        size_t fileSize = file.tellg();
        file.seekg(0, std::ios::beg);
        fileData.resize(fileSize / sizeof(uint32_t));
        file.read(reinterpret_cast<char*>(fileData.data()), fileSize);
    }
    
public:
    
    static void Build(VkDevice logicalDevice, const std::vector<ShaderConfig>& configs, ShaderInfo& shader)
    {
        shader.configs = configs;
        shader.modules.resize(configs.size());
        shader.pipelineShaderStages.resize(configs.size());
        
        for(uint32_t i = 0; i < configs.size(); i++){
            ReadFile(shader.configs[i].filePath, shader.shaderFileData);
            CreateShaderModule(logicalDevice, shader.shaderFileData, shader.shaderModules[i]);
            FillPipelineShaderStageCreateInfo(shader.shaderModules[i], shader.config.stageFlags[i], shader.pipelineShaderStages[i]);
        }
    }
    
    static void Destroy(VkDevice logicalDevice, ShaderInfo& shader)
    {
        for(size_t i = 0; i < shader.modules.size(); i++)
            vkDestroyShaderModule(logicalDevice, shader.modules[i], NULL);
    }
};
```

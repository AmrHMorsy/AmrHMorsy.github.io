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
<h4 id="graphicsPipeline"><b>1.1 &nbsp; Graphics Pipeline</b></h4>
<br>

One of the core components of any real-time renderer is the **graphics pipeline**. The purpose of the graphics pipeline is to produce an image, given a 3D scene. The word **pipeline** refers to a system of connected stations that are working together to produce an output. Each station is responsible for the completion of a specific task, and is dependent on the output of the previous station. A station can not start working on its task unless the previous station has finished, and supplied it with the data it needs. 

<br>

To further explain the structure and the effectiveness of a pipeline as a system, consider a sandwich pipeline in a restaurant. The purpose of the sandwich pipeline is to produce a sandwich for the customer. The stages of this pipeline include: Bread stage, meat stage, vegetables stage, sauce stage, and a wrapping stage. 

**picture of sandwich pipeline**

<br>

Each stage is managed by a small team. A team cannot start completing its task, unless the previous station has already finished its work. For example, the sauce station cannot apply sauce until it receives the toasted bread from the bread station. The second thing to be highlighted about the sandwich pipeline is that all stations are working in parallel. After the sauce team applies sauce to sandwich $$i$$, it hands it off to the meat station, and immediatley start adding the sauce to sandwich $$i+1$$. In other words, no station is ever idle; they are constantly working on the next sandwich once it is done with its responsibilities in sandwich $$i$$. The time it takes for one sandwich is only the time it takes for the slowest station to finish its work. 

<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>

Before we explain the stages of the graphics pipeline, let's first explain the term "pipeline" itself.
<br>

The advantages of the pipeline as a system is that all the stations are working in parallel. Whenever a station is done with its task, it hands off its data to the next station and immediately start working on the new batch of data. This ensures that the system is never idle; it always processes a new batch of data. 

<br>

The word **pipeline** was originally used in the context of manufacturing. It referred to a system of individually seperated pipes, all connected together with stations positioned along the pipeline. The input supplied to each station is the output of the previous station, forming a series of connected elements, all dependent on each other. Each station along the pipeline has an important task to fulfill. Each station is dependent on the station just before it. If a station fails to complete its task, all the stations that follows it will also fail. 

<br>

In the context of rendering, a graphics pipeline is not different from the sandwich pipeline. It differs, however, in the input, the stages, and the output. The input of the graphics pipeline is the scene we would like to display, and the output is the image that is rendered on the screen. is simply a pipeline with a goal at the end. The end goal is present something to the screen. The input is simply the scene description. A 3D scene, consiting of the vertices, a virtual camera. The stages of the graphics pipeline in Vulkan is shown in figure $$1.1$$. 

<br>
One of the core components of any real-time renderer is the **graphics pipeline**. The purpose of this pipeline is to produce an image, given a 3D scene consisting of a virtual camera, a set of vertices forming polygons, and optionally a set of light sources. Before we explain the stages of the graphics pipeline, let's first explain the term "pipeline" itself.

Vulkan API requires that we explicitly build our own graphics pipeline, and specify the information that govern each stage. 

<br>

Vulkan requires that we build our own graphics pipeline and supply the information governing each station / stage on the pipeline. 

<br>

<div class="row align-items-center mt-3">
<div class="col-md-5">
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



The following is the Vulkan function that creates the graphics pipeline
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

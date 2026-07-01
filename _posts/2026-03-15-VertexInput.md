---
layout: post
title: Automating Vertex Input Setup in Vulkan Using Shader Reflection
date: 2026-03-15 09:00:00
description:
tags:
categories:
thumbnail: assets/img/Blog/VertexInput/
featured: false
---

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

<br>

**pCreateInfos** is a pointer to an array of objects of type <a href="https://docs.vulkan.org/spec/latest/chapters/pipelines.html#pipelines-graphics" class="vulkan">VkGraphicsPipelineCreateInfo</a>. Each one of these objects contains parameters that dictate how the corresponding graphics pipeline should be created.

<br>

The <a href="https://docs.vulkan.org/spec/latest/chapters/pipelines.html#pipelines-graphics" class="vulkan">VkGraphicsPipelineCreateInfo</a> structure is defined as follows:

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

**pVertexInputState** is a pointer to an object of type <a href="https://docs.vulkan.org/spec/latest/chapters/fxvertex.html#VkPipelineVertexInputStateCreateInfo" class="vulkan">VkPipelineVertexInputStateCreateInfo</a>. This object contains detailed description of the input given to the vertex shader. It must be filled accurately according to the vertex shader. 
 

<br>

The structure <a href="https://docs.vulkan.org/spec/latest/chapters/fxvertex.html#VkPipelineVertexInputStateCreateInfo" class="vulkan">VkPipelineVertexInputStateCreateInfo</a> is defined as follows:

```cpp
typedef struct VkPipelineVertexInputStateCreateInfo {
    VkStructureType                             sType;
    const void*                                 pNext;
    VkPipelineVertexInputStateCreateFlags       flags;
    uint32_t                                    vertexBindingDescriptionCount;
    const VkVertexInputBindingDescription*      pVertexBindingDescriptions;
    uint32_t                                    vertexAttributeDescriptionCount;
    const VkVertexInputAttributeDescription*    pVertexAttributeDescriptions;
} VkPipelineVertexInputStateCreateInfo
```

<br>

**pVertexBindingDescriptions** is a pointer to an array of objects of type <a href="https://docs.vulkan.org/spec/latest/chapters/fxvertex.html#VkVertexInputBindingDescription" class="vulkan">VkVertexInputBindingDescription</a>, and **pVertexAttributeDescriptions** is a pointer to an array of objects of type <a href="https://docs.vulkan.org/spec/latest/chapters/fxvertex.html#VkVertexInputAttributeDescription" class="vulkan">VkVertexInputAttributeDescription</a>. Each input to the vertex shader has a corresponding <a href="https://docs.vulkan.org/spec/latest/chapters/fxvertex.html#VkVertexInputAttributeDescription" class="vulkan">VkVertexInputAttributeDescription</a> object containing detailed information about the nature of that input. For each vertex buffer bound to the pipeline, there must be a corresponding <a href="https://docs.vulkan.org/spec/latest/chapters/fxvertex.html#VkVertexInputBindingDescription" class="vulkan">VkVertexInputBindingDescription</a> describing how data is read from that buffer.

<br>

The structure <a href="https://docs.vulkan.org/spec/latest/chapters/fxvertex.html#VkVertexInputBindingDescription" class="vulkan">VkVertexInputBindingDescription</a> is defined as follows: 

```c++
typedef struct VkVertexInputBindingDescription {
    uint32_t             binding;
    uint32_t             stride;
    VkVertexInputRate    inputRate;
} VkVertexInputBindingDescription;
```

where: 
- **binding** is the binding index.
- **stride** is the number of bytes to jump within the buffer to get the next element.
- **inputRate** specifies when should the next set of data be fetched from the buffer:
    - If set to **VK_VERTEX_INPUT_RATE_VERTEX**, new set of data is fetched from the buffer for every vertex. 
    - If set to **VK_VERTEX_INPUT_RATE_INSTANCE**, new set of data is fetched from the buffer for every instance, and is reused for the all vertices of that instance. 

<br>

The structure <a href="https://docs.vulkan.org/spec/latest/chapters/fxvertex.html#VkVertexInputAttributeDescription" class="vulkan">VkVertexInputAttributeDescription</a> is defined as follows: 

```c++
typedef struct VkVertexInputAttributeDescription {
    uint32_t    location;
    uint32_t    binding;
    VkFormat    format;
    uint32_t    offset;
} VkVertexInputAttributeDescription;
```

where: 
- **location** is the location index of the input as described in the vertex shader.
- **binding** is the binding index within the <a href="https://docs.vulkan.org/spec/latest/chapters/fxvertex.html#VkVertexInputBindingDescription" class="vulkan">VkVertexInputBindingDescription</a> object from which this attribute will read its data from.
- **format** is the format of the input. It is set according to its size and its data type. The list of accepted formats can be found <a href="https://docs.vulkan.org/refpages/latest/refpages/source/VkFormat.html#_c_specification" class="vulkan">here</a>.
- **offset** is the byte offset from the start of each vertex element that specifies where the data for that particular attribute begins.

<br>    

As an example, consider the following vertex shader: 

```cpp
#version 450

layout(location = 0) in vec3 vertex;
layout(location = 1) in vec3 normal;
layout(location = 2) in vec2 textureCoordinate;

layout(set = 0, binding = 0) uniform VertexShaderUniformVariables {
    mat4 modelMatrix;
    mat4 cameraViewMatrix;
    mat4 cameraProjectionMatrix;
} vs;

void main()
{
    gl_Position = vs.cameraProjectionMatrix * vs.cameraViewMatrix * vs.modelMatrix * vec4(vertex, 1.0);
}
```

<br>


<figure class="col-md-12 text-center theme-img repo-img-light">
{% include figure.html  path="assets/img/Blog/VertexInput/Dark/1.png" class="scaled-img25"%}
  <figcaption>Figure 1</figcaption>
</figure>

<figure class="col-md-12 text-center theme-img repo-img-dark">
{% include figure.html  path="assets/img/Blog/VertexInput/Light/1.png" class="scaled-img25"%}
  <figcaption>Figure 1</figcaption>
</figure>

<br>

If the input data will be provided interleaved in one buffer as shown in figure $$1$$, then the <a href="https://docs.vulkan.org/spec/latest/chapters/fxvertex.html#VkPipelineVertexInputStateCreateInfo" class="vulkan">VkPipelineVertexInputStateCreateInfo</a> structure can be constructed as follows:


```cpp
VkVertexInputBindingDescription d;
d.binding = 0;
d.stride = 8 * sizeof(float);
d.inputRate = VK_VERTEX_INPUT_RATE_VERTEX;

std::vector<VkVertexInputAttributeDescription> A(3);
A[0].location = 0;
A[0].binding = 0;
A[0].format = VK_FORMAT_R32G32B32_SFLOAT;
A[0].offset = 0;

A[1].location = 1;
A[1].binding = 0;
A[1].format = VK_FORMAT_R32G32B32_SFLOAT;
A[1].offset = 3 * sizeof(float);

A[2].location = 2;
A[2].binding = 0;
A[2].format = VK_FORMAT_R32G32_SFLOAT;
A[2].offset = 6 * sizeof(float);

VkPipelineVertexInputStateCreateInfo info{};
info.sType = VK_STRUCTURE_TYPE_PIPELINE_VERTEX_INPUT_STATE_CREATE_INFO ;
info.vertexBindingDescriptionCount = 1;
info.pVertexBindingDescriptions = &d;
info.vertexAttributeDescriptionCount = 3;
info.pVertexAttributeDescriptions = A.data();
```
<br>

<figure class="col-md-12 text-center theme-img repo-img-light">
{% include figure.html  path="assets/img/Blog/VertexInput/Dark/2.png" class="scaled-img70"%}
  <figcaption>Figure 2</figcaption>
</figure>

<figure class="col-md-12 text-center theme-img repo-img-dark">
{% include figure.html  path="assets/img/Blog/VertexInput/Light/2.png" class="scaled-img70"%}
  <figcaption>Figure 2</figcaption>
</figure>

<br>

If each input data will be provided seperately in its own buffer, as shown in figure $$2$$, then the <a href="https://docs.vulkan.org/spec/latest/chapters/fxvertex.html#VkPipelineVertexInputStateCreateInfo" class="vulkan">VkPipelineVertexInputStateCreateInfo</a> structure can be constructed as follows:

```cpp
std::vector<VkVertexInputBindingDescription> D(3);
D[0].binding = 0;
D[0].stride = 3 * sizeof(float);
D[0].inputRate = VK_VERTEX_INPUT_RATE_VERTEX;

D[1].binding = 1;
D[1].stride = 3 * sizeof(float);
D[1].inputRate = VK_VERTEX_INPUT_RATE_VERTEX;

D[2].binding = 2;
D[2].stride = 2 * sizeof(float);
D[2].inputRate = VK_VERTEX_INPUT_RATE_VERTEX;

std::vector<VkVertexInputAttributeDescription> A(3);
A[0].location = 0;
A[0].binding = 0;
A[0].format = VK_FORMAT_R32G32B32_SFLOAT;
A[0].offset = 0;

A[1].location = 1;
A[1].binding = 1;
A[1].format = VK_FORMAT_R32G32B32_SFLOAT;
A[1].offset = 0;

A[2].location = 2;
A[2].binding = 2;
A[2].format = VK_FORMAT_R32G32_SFLOAT;
A[2].offset = 0;

VkPipelineVertexInputStateCreateInfo info{};
info.sType = VK_STRUCTURE_TYPE_PIPELINE_VERTEX_INPUT_STATE_CREATE_INFO ;
info.vertexBindingDescriptionCount = 3;
info.pVertexBindingDescriptions = D.data();
info.vertexAttributeDescriptionCount = 3;
info.pVertexAttributeDescriptions = A.data();
```

<br>

The problems with this manual way of filling the <a href="https://docs.vulkan.org/spec/latest/chapters/fxvertex.html#VkPipelineVertexInputStateCreateInfo" class="vulkan">VkPipelineVertexInputStateCreateInfo</a> structure are mainly **scalability** and **flexibility**. 

If you edited the vertex input in the shader in any way; for example changing the order or the format of the inputs, you will have to edit the setup code accordingly. This may not be a problem if there is only a few graphics pipelines in the program. However, if the program have many graphics pipelines, it may bloat the code unnecessarily and become time consuming to manually manage the vertex input setup code for all of them.

<br>

Hence, I am proposing an automated way to fill the <a href="https://docs.vulkan.org/spec/latest/chapters/fxvertex.html#VkPipelineVertexInputStateCreateInfo" class="vulkan">VkPipelineVertexInputStateCreateInfo</a> structure. This method reads the vertex shader code, parses it, and accordingly decides what data to fill in each field of the structure. 

The parsing, and the extraction of information from the vertex shader is done using <a href="https://github.com/khronosgroup/spirv-cross">SPIRV-CROSS</a> which is an open-source library provided by <a href="https://www.khronos.org">KhronosGroup</a>. This library reads the raw SPV shader file data and extracts relevant information pertaining that vertex shader, which includes the vertex input. We can then fetch those data to accordingly fill the <a href="https://docs.vulkan.org/spec/latest/chapters/fxvertex.html#VkVertexInputAttributeDescription" class="vulkan">VkVertexInputAttributeDescription</a> structure.

<br>

We will start by creating a struct called **VertexInputInfo** which will package the array of objects of <a href="https://docs.vulkan.org/spec/latest/chapters/fxvertex.html#VkVertexInputAttributeDescription" class="vulkan">VkVertexInputAttributeDescription</a> and <a href="https://docs.vulkan.org/spec/latest/chapters/fxvertex.html#VkVertexInputBindingDescription" class="vulkan">VkVertexInputBindingDescription</a>.

```c++
struct VertexInputInfo{
    std::vector<VkVertexInputAttributeDescription> attributes;
    std::vector<VkVertexInputBindingDescription> bindings;
};
```

<br>

We will create a class called **VertexInput**. This class encapsulates the setup of the vertex input data for the construction of the <a href="https://docs.vulkan.org/spec/latest/chapters/fxvertex.html#VkPipelineVertexInputStateCreateInfo" class="vulkan">VkPipelineVertexInputStateCreateInfo</a> structure for the graphics pipeline creation.

```c++
class VertexInput{

};
```

<br>

We will start by adding a helper function to read the raw file data of the SPV shader file: 

```c++
static std::vector<uint32_t> ReadFile(std::string filepath)
{
    std::ifstream file(filepath, std::ios::binary | std::ios::ate );
    if(!file.is_open())
        throw std::runtime_error("ERROR::FAILURE TO OPEN SHADER FILE FOR READING");
        
    size_t fileSize = file.tellg();
    file.seekg(0, std::ios::beg);
        
    std::vector<uint32_t> fileData;
    fileData.resize(fileSize / sizeof(uint32_t));
    file.read(reinterpret_cast<char*>(fileData.data()), fileSize);
        
    return fileData;
}
```

<br>

We will add another helper function that returns the Vulkan format **VkFormat** of the input, given the data type **spirv_cross::SPIRType** extracted by SPIR-V cross library. 

```c++
static VkFormat GetAttributeFormat(spirv_cross::SPIRType type)
{
    switch(type.basetype){
        case spirv_cross::SPIRType::Float:
            switch(type.vecsize){
                case 4:
                    return VK_FORMAT_R32G32B32A32_SFLOAT;
                case 3:
                    return VK_FORMAT_R32G32B32_SFLOAT;
                case 2:
                    return VK_FORMAT_R32G32_SFLOAT;
                case 1:
                    return VK_FORMAT_R32_SFLOAT;
                default:
                    throw std::runtime_error("ERROR::INVALID SFLOAT VEC_SIZE");
            };
        case spirv_cross::SPIRType::Int:
            switch(type.vecsize){
                case 4:
                    return VK_FORMAT_R32G32B32A32_SINT;
                case 3:
                    return VK_FORMAT_R32G32B32_SINT;
                case 2:
                    return VK_FORMAT_R32G32_SINT;
                case 1:
                    return VK_FORMAT_R32_SINT;
                default:
                    throw std::runtime_error("ERROR::INVALID SINT VEC_SIZE");
            };
        case spirv_cross::SPIRType::UInt:
            switch(type.vecsize){
                case 4:
                    return VK_FORMAT_R32G32B32A32_UINT;
                case 3:
                    return VK_FORMAT_R32G32B32_UINT;
                case 2:
                    return VK_FORMAT_R32G32_UINT;
                case 1:
                    return VK_FORMAT_R32_UINT;
                default:
                    throw std::runtime_error("ERROR::INVALID UINT VEC_SIZE");
            };
        default:
            throw std::runtime_error("ERROR::INVALID BASE_TYPE");
    };
}
```

<br>

We will add one final helper function that returns size of the attribute given the format **VkFormat** of the input: 

```c++
static size_t GetAttributeSize(VkFormat format)
{
    switch(format){
        case VK_FORMAT_R32G32B32A32_SFLOAT:
            return 4 * sizeof(float);
        case VK_FORMAT_R32G32B32_SFLOAT:
            return 3 * sizeof(float);
        case VK_FORMAT_R32G32_SFLOAT:
            return 2 * sizeof(float);
        case VK_FORMAT_R32_SFLOAT:
            return sizeof(float);
        case VK_FORMAT_R32G32B32A32_SINT:
            return 4 * sizeof(int32_t);
        case VK_FORMAT_R32G32B32_SINT:
            return 3 * sizeof(int32_t);
        case VK_FORMAT_R32G32_SINT:
            return 2 * sizeof(int32_t);
        case VK_FORMAT_R32_SINT:
            return sizeof(int32_t);
        case VK_FORMAT_R32G32B32A32_UINT:
            return 4 * sizeof(uint32_t);
        case VK_FORMAT_R32G32B32_UINT:
            return 3 * sizeof(uint32_t);
        case VK_FORMAT_R32G32_UINT:
            return 2 * sizeof(uint32_t);
        case VK_FORMAT_R32_UINT:
            return sizeof(uint32_t);
        default:
            throw std::runtime_error("ERROR::INVALID FORMAT");
    };
}
```

<br>

Now we can start writing the main function of the class **Build()**. The function takes as input: 
 
- **vsFilePath**: FilePath of the vertex shader 
- **interleaved**: A flag indicating whether the vertex input data is going to be interleaved in one buffer, or each input is going to have its own buffer. 

and returns an object of type **VertexInputInfo**. The function reads and parses the vertex shader file, and accordingly fills the arrays of <a href="https://docs.vulkan.org/spec/latest/chapters/fxvertex.html#VkVertexInputAttributeDescription" class="vulkan">VkVertexInputAttributeDescription</a> and <a href="https://docs.vulkan.org/spec/latest/chapters/fxvertex.html#VkVertexInputBindingDescription" class="vulkan">VkVertexInputBindingDescription</a> structures. 

<br>

Below is the code for the function **Build()**

```cpp
static VertexInputInfo Build(std::string vsFilePath, bool interleaved)
{
    std::vector<uint32_t> vsFileData = ReadFile(vsFilePath);

    spirv_cross::Compiler compiler(vsFileData);
    spirv_cross::ShaderResources resources = compiler.get_shader_resources();

    VertexInputInfo v;
    uint32_t offset = 0;
    std::vector<uint32_t> attributeSizes;
    
    // Iterate through each vertex input
    for(uint32_t i = 0; i < resources.stage_inputs.size(); i++){
        spirv_cross::Resource r = resources.stage_inputs[i];
        
        // Extract the data type of vertex input i
        spirv_cross::SPIRType type = compiler.get_type(r.type_id);
        
        // Extract the location of vertex input i
        uint32_t location = compiler.get_decoration(r.id, spv::DecorationLocation);
        
        // Get the format of the input according to its data type
        VkFormat format = GetAttributeFormat(type);
        
        v.attributes.push_back(VkVertexInputAttributeDescription{
            .location = location,
            .binding = (interleaved)? 0: i,
            .offset = (interleaved)? offset: 0,
            .format = format
        });
        
        uint32_t attributeSize = GetAttributeSize(format);
        attributeSizes.push_back(attributeSize);
        
        // Increment the offset for use, in case data is interleaved
        offset += attributeSize;
    }
            
    // If interleaved, only one buffer is needed
    if(interleaved)
        v.bindings.push_back(VkVertexInputBindingDescription{
            .binding = 0,
            .stride = offset,
            .inputRate = VK_VERTEX_INPUT_RATE_VERTEX,
        });
    else{
        for(size_t i = 0; i < v.attributes.size(); i++)
            v.bindings.push_back(VkVertexInputBindingDescription{
                .binding = v.attributes[i].binding,
                .stride = attributeSizes[i],
                .inputRate = VK_VERTEX_INPUT_RATE_VERTEX
            });
    }

    return v;
}
```

<br>

Below is the entire **VertexInput** class: 

```c++
class VertexInput{
    
public:
    
    static VertexInputInfo Build(std::string vsFilePath, bool interleaved)
    {
        std::vector<uint32_t> vsFileData = ReadFile(vsFilePath);

        spirv_cross::Compiler compiler(vsFileData);
        spirv_cross::ShaderResources resources = compiler.get_shader_resources();

        VertexInputInfo v;
        uint32_t offset = 0;
        std::vector<uint32_t> attributeSizes;
        
        for(uint32_t i = 0; i < resources.stage_inputs.size(); i++){
            spirv_cross::Resource r = resources.stage_inputs[i];
            spirv_cross::SPIRType type = compiler.get_type(r.type_id);
            uint32_t location = compiler.get_decoration(r.id, spv::DecorationLocation);
            VkFormat format = GetAttributeFormat(type);
            
            v.attributes.push_back(VkVertexInputAttributeDescription{
                .location = location,
                .binding = (interleaved)? 0: i,
                .offset = (interleaved)? offset: 0,
                .format = format
            });
            
            uint32_t attributeSize = GetAttributeSize(format);
            attributeSizes.push_back(attributeSize);
            offset += attributeSize;
        }
                
        if(interleaved)
            v.bindings.push_back(VkVertexInputBindingDescription{
                .binding = 0,
                .stride = offset,
                .inputRate = VK_VERTEX_INPUT_RATE_VERTEX,
            });
        else{
            for(size_t i = 0; i < v.attributes.size(); i++)
                v.bindings.push_back(VkVertexInputBindingDescription{
                    .binding = v.attributes[i].binding,
                    .stride = attributeSizes[i],
                    .inputRate = VK_VERTEX_INPUT_RATE_VERTEX
                });
        }

        return v;
    }
    
private:
    
    static std::vector<uint32_t> ReadFile(std::string filepath)
    {
        std::ifstream file(filepath, std::ios::binary | std::ios::ate );
        if(!file.is_open())
            throw std::runtime_error("ERROR::FAILURE TO OPEN SHADER FILE FOR READING");
        
        size_t fileSize = file.tellg();
        file.seekg(0, std::ios::beg);
        
        std::vector<uint32_t> fileData;
        fileData.resize(fileSize / sizeof(uint32_t));
        file.read(reinterpret_cast<char*>(fileData.data()), fileSize);
        
        return fileData;
    }

    static size_t GetAttributeSize(VkFormat format)
    {
        switch(format){
            case VK_FORMAT_R32G32B32A32_SFLOAT:
                return 4 * sizeof(float);
            case VK_FORMAT_R32G32B32_SFLOAT:
                return 3 * sizeof(float);
            case VK_FORMAT_R32G32_SFLOAT:
                return 2 * sizeof(float);
            case VK_FORMAT_R32_SFLOAT:
                return sizeof(float);
            case VK_FORMAT_R32G32B32A32_SINT:
                return 4 * sizeof(int32_t);
            case VK_FORMAT_R32G32B32_SINT:
                return 3 * sizeof(int32_t);
            case VK_FORMAT_R32G32_SINT:
                return 2 * sizeof(int32_t);
            case VK_FORMAT_R32_SINT:
                return sizeof(int32_t);
            case VK_FORMAT_R32G32B32A32_UINT:
                return 4 * sizeof(uint32_t);
            case VK_FORMAT_R32G32B32_UINT:
                return 3 * sizeof(uint32_t);
            case VK_FORMAT_R32G32_UINT:
                return 2 * sizeof(uint32_t);
            case VK_FORMAT_R32_UINT:
                return sizeof(uint32_t);
            default:
                throw std::runtime_error("ERROR::INVALID FORMAT");
        };
    }

    static VkFormat GetAttributeFormat(spirv_cross::SPIRType type)
    {
        switch(type.basetype){
            case spirv_cross::SPIRType::Float:
                switch(type.vecsize){
                    case 4:
                        return VK_FORMAT_R32G32B32A32_SFLOAT;
                    case 3:
                        return VK_FORMAT_R32G32B32_SFLOAT;
                    case 2:
                        return VK_FORMAT_R32G32_SFLOAT;
                    case 1:
                        return VK_FORMAT_R32_SFLOAT;
                    default:
                        throw std::runtime_error("ERROR::INVALID SFLOAT VEC_SIZE");
                };
            case spirv_cross::SPIRType::Int:
                switch(type.vecsize){
                    case 4:
                        return VK_FORMAT_R32G32B32A32_SINT;
                    case 3:
                        return VK_FORMAT_R32G32B32_SINT;
                    case 2:
                        return VK_FORMAT_R32G32_SINT;
                    case 1:
                        return VK_FORMAT_R32_SINT;
                    default:
                        throw std::runtime_error("ERROR::INVALID SINT VEC_SIZE");
                };
            case spirv_cross::SPIRType::UInt:
                switch(type.vecsize){
                    case 4:
                        return VK_FORMAT_R32G32B32A32_UINT;
                    case 3:
                        return VK_FORMAT_R32G32B32_UINT;
                    case 2:
                        return VK_FORMAT_R32G32_UINT;
                    case 1:
                        return VK_FORMAT_R32_UINT;
                    default:
                        throw std::runtime_error("ERROR::INVALID UINT VEC_SIZE");
                };
            default:
                throw std::runtime_error("ERROR::INVALID BASE_TYPE");
        };
    }
};
```

<br>

Using this class, we can build the <a href="https://docs.vulkan.org/spec/latest/chapters/fxvertex.html#VkPipelineVertexInputStateCreateInfo" class="vulkan">VkPipelineVertexInputStateCreateInfo</a> structure simply as follows: 

```cpp
VertexInputInfo vi = VertexInput::Build("/path/to/vsFilePath.spv");

VkPipelineVertexInputStateCreateInfo info{};
info.sType = VK_STRUCTURE_TYPE_PIPELINE_VERTEX_INPUT_STATE_CREATE_INFO ;
info.vertexBindingDescriptionCount = static_cast<uint32_t>(vi.vertexBindingDescription.size());
info.pVertexBindingDescriptions = vi.vertexBindingDescription.data();
info.vertexAttributeDescriptionCount = static_cast<uint32_t>(vi.vertexAttributeDescription.size());
info.pVertexAttributeDescriptions = vi.vertexAttributeDescription.data();
``` 

<br>

With this setup, we can freely edit the vertex shader code, and not be obligated to change or re-compile the source code, since the vertex input state is constructed automatically with this class.

<br>

<hr>

<br>

The github repository containing the entire code can be found [here](https://github.com/AmrHMorsy/Vejaler/tree/main/src/Core/VertexInput). 

<br>

***

<br>
### **References**
<br>
- [Vulkan Documentation](https://docs.vulkan.org/spec/latest/index.html)

<br>

<hr>

<br>

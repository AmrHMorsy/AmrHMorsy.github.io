<br>
#### **Compute Pipeline** <br>
<br>

```cpp
class ComputePipeline{
    
public:
    
    static std::vector<VkPipeline> Create(VkDevice logicalDevice, VkPipelineLayout pipelineLayout, VkPipelineShaderStageCreateInfo pipelineShaderStageCreateInfo, uint32_t numComputePipelines)
    {
        VkComputePipelineCreateInfo computePipelineCreateInfo{};
        
        computePipelineCreateInfo.sType = VK_STRUCTURE_TYPE_COMPUTE_PIPELINE_CREATE_INFO;
        computePipelineCreateInfo.stage = pipelineShaderStageCreateInfo;
        computePipelineCreateInfo.layout = pipelineLayout;
        
        std::vector<VkPipeline> computePipelines(numComputePipelines);
        
        VkResult result = vkCreateComputePipelines(logicalDevice, VK_NULL_HANDLE, numComputePipelines, &computePipelineCreateInfo, nullptr, computePipelines.data());
        
        if(result != VK_SUCCESS)
            throw std::runtime_error("ERROR::FAILURE TO CREATE COMPUTE PIPELINES");
        
        return computePipelines;
    }
    
    static void Bind(VkCommandBuffer commandBuffer, VkPipeline computePipeline)
    {
        vkCmdBindPipeline(commandBuffer, VK_PIPELINE_BIND_POINT_COMPUTE, computePipeline);
    }
};
```

<br>
#### **Fence** <br>
<br>

```cpp
class Fence{
    
public:
    
    static VkFence Create(VkDevice logicalDevice, VkFenceCreateFlags flags)
    {
        VkFenceCreateInfo fenceCreateInfo{};
        
        fenceCreateInfo.pNext = nullptr;
        fenceCreateInfo.flags = flags;
        fenceCreateInfo.sType = VK_STRUCTURE_TYPE_FENCE_CREATE_INFO;

        VkFence fence;
        VkResult result = vkCreateFence(logicalDevice, &fenceCreateInfo, nullptr, &fence);
        
        if(result != VK_SUCCESS)
            throw std::runtime_error("\033[31m\nERROR::FAILURE TO CREATE FENCES\n\033[0m");
        
        return fence;
    }
    
    static void Wait(VkDevice logicalDevice, const std::vector<VkFence>& fences, VkBool32 waitAll, uint64_t timeout)
    {
        vkWaitForFences(logicalDevice, static_cast<uint32_t>(fences.size()), fences.data(), waitAll, timeout);
    }
    
    static void Reset(VkDevice logicalDevice, const std::vector<VkFence>& fences)
    {
        vkResetFences(logicalDevice, static_cast<uint32_t>(fences.size()), fences.data()) ;
    }
    
    static void Destroy(VkDevice logicalDevice, VkFence fence)
    {
        vkDestroyFence(logicalDevice, fence, NULL) ;
    }
};
```

<br>
#### **FrameBuffer** <br>
<br>

```cpp
class FrameBuffer{
    
public:
    
    static VkFramebuffer Create(VkDevice logicalDevice, VkRenderPass renderPass, VkExtent2D resolution, uint32_t layers, const std::vector<VkImageView>& imageViews)
    {
        VkFramebufferCreateInfo framebufferCreateInfo{};
        
        framebufferCreateInfo.sType = VK_STRUCTURE_TYPE_FRAMEBUFFER_CREATE_INFO;
        framebufferCreateInfo.renderPass = renderPass;
        framebufferCreateInfo.attachmentCount = static_cast<uint32_t>(imageViews.size());
        framebufferCreateInfo.pAttachments = imageViews.data();
        framebufferCreateInfo.width = resolution.width;
        framebufferCreateInfo.height = resolution.height;
        framebufferCreateInfo.layers = layers;
        
        VkFramebuffer frameBuffer;
        VkResult result = vkCreateFramebuffer(logicalDevice, &framebufferCreateInfo, nullptr, &frameBuffer);
        
        if(result != VK_SUCCESS)
            throw std::runtime_error("\033[31m\nERROR::FAILURE TO CREATE FRAMEBUFFERS\033[0m");

        return frameBuffer ;
    }

    static void Destroy(VkDevice logicalDevice, VkFramebuffer frameBuffer)
    {
        vkDestroyFramebuffer(logicalDevice, frameBuffer, nullptr);
    }
};
```


<br>

***

<br>
#### **References** <br>
<br>

**[1]** [Vulkan Documentation](https://docs.vulkan.org/spec/latest/index.html)


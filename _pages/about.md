---
layout: about
title: About
permalink: /
subtitle:

profile:
  align: right
  image: prof_pic.png
  image_circular: true # crops the image to make it circular
  more_info: >
    <p>Amr Morsy</p>

news: true  # includes a list of news items
latest_posts: true  # includes a list of the newest posts
selected_papers: true # includes a list of papers marked as "selected={true}"
social: true  # includes social icons at the bottom of the page
---

<br>
<br>

<div class="row mt-4">
    <div class="col-md-2">
    {%- include Biography.html %}
    </div>
    
    <div class="col-md-1 profile-column">
    </div>
    
    <div class="col-md-1">
    </div>
    
    <div class="col-md-8">
        <div class="ovrv row mt-4 justify-content-center text-center">
            <div class="col-md-12">
                {%- include latest_postsManager.html %}
            </div>
        </div>
        
        <br><br>
        
        <!--
        <div class="ovrv row mt-4 justify-content-center text-center">
            <div class="col-md-12">
                {%- include LatestPublications.html %}
            </div>
        </div>
        -->
        
        <br><br>
        
        <!--
        <div class="ovrv row mt-4 justify-content-center  text-center">
            <div class="col-md-12">
                {%- include LatestVideosManager.html %}
            </div>
        </div>
        -->
        
        <br><br>
        
        <!--
        <div class="ovrv row mt-4 justify-content-center  text-center">
            <div class="col-md-12">
                {%- include LatestProjects.html %}
            </div>
        </div>
        -->
        
    </div>
</div>

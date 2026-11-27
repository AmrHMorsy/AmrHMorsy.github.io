---
layout: page
title: Videos
permalink: /videos/
description:
nav: false
nav_order: 3
display_categories:
horizontal: false
---

<!-- pages/videos.md -->
<div class="projects">
{%- if site.enable_video_categories and page.display_categories > 0%}
  <!-- Display categorized projects -->
  {%- for category in page.display_categories %}
  <h2 class="category">{{ category }}</h2>
  {%- assign categorized_videos = site.videos | where: "category", category -%}
  {%- assign sorted_videos = categorized_videos | sort: "importance" %}
  <!-- Generate cards for each project -->
  {% if page.horizontal -%}
  <div class="container">
    <div class="row row-cols-2">
    {%- for project in sorted_videos -%}
      {% include videos_horizontal.html %}
    {%- endfor %}
    </div>
  </div>
  {%- else -%}
  <div class="grid">
    {%- for project in sorted_projects -%}
      {% include videos.html %}
    {%- endfor %}
  </div>
  {%- endif -%}
  {% endfor %}

{%- else -%}
<!-- Display projects without categories -->
  {%- assign sorted_videos = site.videos | sort: "importance" -%}
  <!-- Generate cards for each project -->
  {% if page.horizontal -%}
  <div class="container">
    <div class="row row-cols-2">
    {%- for project in sorted_videos -%}
      {% include videos_horizontal.html %}
    {%- endfor %}
    </div>
  </div>
  {%- else -%}
  <div class="grid">
    {%- for video in sorted_videos -%}
      {% include videos.html %}
    {%- endfor %}
  </div>
  {%- endif -%}
{%- endif -%}
</div>

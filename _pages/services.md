---
layout: page
title: Services
permalink: /projects/
description:
nav: true
nav_order: 2
display_categories:
horizontal: false
---

## Computer Graphics Tutoring

I offer one-on-one and group tutoring sessions in computer graphics, covering a wide range of topics—from introductory concepts to advanced techniques. With three years of experience teaching students from various countries, I have helped learners of all levels improve their understanding and skills in graphics programming.

My expertise includes developing game engines, simulations, animations, and video games using low-level graphics APIs such as OpenGL, WebGL, Vulkan, Metal, and Direct3D.

### How I Can Help

My lessons are tailored to your specific needs. Whether you’re looking to:

- Become a graphics programmer
- Deepen your knowledge of computer graphics
- Debug a graphics project
- Get support with an assignment
- Bring a hobby project or dream game to life

I'm here to help.

### Testimonials
(Insert images of testimonials here)

If you’d like to book a session, send me an email, and let’s get in touch.


## Freelancing & Consulting

## Portfolio

<!-- pages/projects.md -->
<div class="projects">
{%- if site.enable_project_categories and page.display_categories %}
  <!-- Display categorized projects -->
  {%- for category in page.display_categories %}
  <h2 class="category">{{ category }}</h2>
  {%- assign categorized_projects = site.projects | where: "category", category -%}
  {%- assign sorted_projects = categorized_projects | sort: "importance" %}
  <!-- Generate cards for each project -->
  {% if page.horizontal -%}
  <div class="container">
    <div class="row row-cols-2">
    {%- for project in sorted_projects -%}
      {% include projects_horizontal.html %}
    {%- endfor %}
    </div>
  </div>
  {%- else -%}
  <div class="grid">
    {%- for project in sorted_projects -%}
      {% include projects.html %}
    {%- endfor %}
  </div>
  {%- endif -%}
  {% endfor %}

{%- else -%}
<!-- Display projects without categories -->
  {%- assign sorted_projects = site.projects | sort: "importance" -%}
  <!-- Generate cards for each project -->
  {% if page.horizontal -%}
  <div class="container">
    <div class="row row-cols-2">
    {%- for project in sorted_projects -%}
      {% include projects_horizontal.html %}
    {%- endfor %}
    </div>
  </div>
  {%- else -%}
  <div class="grid">
    {%- for project in sorted_projects -%}
      {% include projects.html %}
    {%- endfor %}
  </div>
  {%- endif -%}
{%- endif -%}
</div>

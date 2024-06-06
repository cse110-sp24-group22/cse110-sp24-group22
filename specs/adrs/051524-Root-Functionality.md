# General Landing Page Design

## Context and Problem Statement
One of the main features of our website is how the journal entires are presented. We are displaying it as a root (like a plant's root) and the issue arises with how it will be display and how it will function. The look of the root will be one main taproot, 12 offshoots representing months, and smaller offshoots/nodes that represent each day within that month. One thing that is integral to our streaking feature is the visual growth of the root over the course of each day. The problem arises in how it is done. The solutions that were thought off have two categories as specified below:

### The root is a static image/predrawn
1. Root is a .png file and slowly revealed through using clip-path on CSS
2. Root is a .svg file and slowly revealed through using clip-path on CSS


### The root is created generatively  
3. Root is drawn generatively as an svg image using svg.js 

There is an argument for either idea, so we must decide which design idea is feasible and appealing. 


## Considered Options

* clip-path png
* clip-path svg
* svg.js generative draw

## Decision Outcome
We have decided to go with the clip-path svg solution because of 3 main factors: 
  1. Its API seems easy enough to understand and work with within our time constraint. 
  2. It retains the idea of revealing of the root over time.
  3. Using an svg image allows for losses zooming within the root.
  4. Using a predrawn image gives us the option to draw the root to fit our page aesthetic.   

<!-- This is an optional element. Feel free to remove. -->
## Pros and Cons of the Options

### svg.js generative draw
- Good: Very smooth paths for animations
- Good: Creates svg images for quality retaining
- Bad: Very complicated to use leading to a loss of times
- Bad: Drawn svg may look very out of place when compared to the rest of the assets

### clip-path png
- Good: Easy to implement and use
- Good: No generation so reduction in complexity 
- Bad: PNG will become pixaliated if zoomed in

### clip-path svg
- Good: Easy to implement and use
- Good: No generation so reduction in complexity 
- Good: PNG will become retain its quality when zoomed in 
- Bad: Transitions to reveal branches may not be smooth


<!-- This is an optional element. Feel free to remove. -->
## More Information
Documentation for [svg.js](https://svgjs.dev/docs/3.0/) and [clip-path](https://developer.mozilla.org/en-US/docs/Web/CSS/clip-path).

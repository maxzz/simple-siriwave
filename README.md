## Overview

This project is a simple wrapper for the [siriwave.js](https://github.com/kopiro/siriwave) control using the vuejs composition API. This was also done to practice refactoring a custom control with a canvas element using Typescript.

![](src/assets/renders/2020-12-15_17-59-36.png)

## Notes

Limitations found:

* These controls cannot share a common canvas, i.e. each control uses its own canvas instance.
* The control is not aware of parent element resizing.

## Thanks

This project is inspired by and uses work from the [siriwave.js](https://github.com/kopiro/siriwave) project.

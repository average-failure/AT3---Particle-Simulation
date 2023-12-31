"use strict";

// From https://github.com/axln/radial-menu-js

const DEFAULT_SIZE = 100;
const MIN_SECTORS = 1;

export class RadialMenu {
  constructor(params) {
    this.parent = params.parent || [];

    this.size = params.size || DEFAULT_SIZE;
    this.onClick = params.onClick || null;
    this.menuItems = params.menuItems
      ? params.menuItems
      : [
          { id: "one", title: "One" },
          { id: "two", title: "Two" },
        ];

    this.radius = 50;
    this.innerRadius = this.radius * 0.4;
    this.sectorSpace = this.radius * 0.06;
    this.sectorCount = Math.max(this.menuItems.length, MIN_SECTORS);

    this.scale = 1;
    this.holder = null;
    this.parentMenu = [];
    this.parentItems = [];
    this.levelItems = null;

    this.createHolder();
    this.addIconSymbols();

    this.currentMenu = null;

    this.currentSelection = null;
    this.backupSelection = params.defaultSelection || RadialMenu.deepCopy(this.menuItems);

    document.body.addEventListener("mouseup", (event) => {
      const className = event.target.parentNode.getAttribute("class")?.split(" ")[0];
      switch (className) {
        case "sector":
          const index = parseInt(event.target.parentNode.getAttribute("data-index"));
          if (!isNaN(index)) this.setSelectedIndex(index);
          this.handleClick();
          break;
        case "center":
          this.back();
          break;
        default:
          this.close();
          break;
      }
    });
  }

  open(size) {
    if (!this.currentMenu) {
      if (size) this.size = size;
      this.updateHolderSize();
      this.currentMenu = this.createMenu("menu inner", this.menuItems);
      this.setPreviousSelection();
      this.holder.appendChild(this.currentMenu);

      // wait DOM commands to apply and then set class to allow transition to take effect
      RadialMenu.nextTick(() => {
        this.currentMenu.setAttribute("class", "menu");
      });
    }
  }

  close() {
    if (this.currentMenu) {
      let parentMenu;
      while ((parentMenu = this.parentMenu.pop())) {
        parentMenu.remove();
      }

      if (this.reset === true) {
        this.onClick?.([{ id: "reset" }])?.bind(this);
        this.reset = false;
      } else if (this.pause === true) {
        this.onClick?.([{ id: "pause" }])?.bind(this);
        this.pause = false;
      } else if (this.customise === true) {
        this.onClick?.([{ id: "customise" }])?.bind(this);
        this.customise = false;
      } else {
        this.onClick?.(
          RadialMenu.nestedProperty(
            this.backupSelection,
            RadialMenu.getPath(this.backupSelection).join("."),
            true
          )
        )?.bind(this);
      }

      this.parentItems = [];

      RadialMenu.setClassAndWaitForTransition(this.currentMenu, "menu inner").then(() => {
        this.currentMenu?.remove();
        this.currentMenu = null;
      });
    }
  }

  back() {
    if (this.parentMenu.length) this.returnToParentMenu();
    else this.close();
  }

  setPreviousSelection() {
    if (this.reset === true || this.pause === true || this.customise === true) {
      const e =
        this.reset === true ? "reset" : this.pause === true ? "pause" : "customise";
      if (this.levelItems.every(({ id }) => id === e)) {
        this.setSelectedIndex(~~(Math.random() * this.levelItems.length));
      } else {
        this.setSelectedIndex(this.levelItems.findIndex(({ id }) => id === e));
      }
      return;
    }

    let selection;
    if (this.parentMenu.length) {
      selection = RadialMenu.findNested(this.backupSelection, (backup) =>
        this.levelItems.some((item) => item.id === backup[0]?.id)
      )[0].value[0];
    } else {
      selection = this.backupSelection[0];
    }

    const selectedIndex = this.levelItems.findIndex(({ id }) => id === selection.id);

    if (selectedIndex > -1) this.setSelectedIndex(selectedIndex);
  }

  getParentMenu() {
    if (this.parentMenu.length > 0) {
      return this.parentMenu.at(-1);
    } else {
      return null;
    }
  }

  createHolder() {
    this.holder = document.createElement("div");
    this.holder.className = "menuHolder";
    this.holder.style.width = this.size + "px";
    this.holder.style.height = this.size + "px";

    this.parent.appendChild(this.holder);
  }

  updateHolderSize() {
    this.holder.style.width = this.size + "px";
    this.holder.style.height = this.size + "px";
  }

  showNestedMenu(item) {
    this.parentMenu.push(this.currentMenu);
    this.parentItems.push(this.levelItems);
    this.currentMenu = this.createMenu("menu inner", item.items, true);
    this.setPreviousSelection();
    this.holder.appendChild(this.currentMenu);

    // wait DOM commands to apply and then set class to allow transition to take effect
    RadialMenu.nextTick(() => {
      this.getParentMenu().setAttribute("class", "menu outer");
      this.currentMenu.setAttribute("class", "menu");
    });
  }

  returnToParentMenu() {
    this.getParentMenu().setAttribute("class", "menu");
    RadialMenu.setClassAndWaitForTransition(this.currentMenu, "menu inner").then(() => {
      this.currentMenu.remove();
      this.currentMenu = this.parentMenu.pop();
      this.levelItems = this.parentItems.pop();
      this.setPreviousSelection();
    });
  }

  handleClick() {
    const selectedIndex = this.getSelectedIndex();
    if (selectedIndex >= 0) {
      const item = this.levelItems[selectedIndex];

      if (item.id.includes("reset")) {
        this.reset = true;
      } else if (item.id.includes("pause")) {
        this.pause = true;
      } else if (item.id.includes("customise")) {
        this.customise = true;
      } else {
        this.reset = false;
        this.pause = false;
        this.customise = false;

        this.currentSelection = item;

        const backupPath = RadialMenu.findNested(
          this.backupSelection,
          (b) => b === this.currentSelection.id
        )[0].path;

        const parent = RadialMenu.nestedProperty(
          this.backupSelection,
          backupPath.slice(0, -2).join(".")
        );

        const newDefault = parent[backupPath.at(-2)];

        parent.splice(backupPath.at(-2), 1);
        parent.unshift(newDefault);
      }

      if (item.items) this.showNestedMenu(item);
      else this.close();
    }
  }

  createCenter(svg, icon, size) {
    size = size || 8;
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttribute("class", "center");

    const centerCircle = this.createCircle(0, 0, this.innerRadius - this.sectorSpace / 3);
    g.appendChild(centerCircle);

    if (icon) {
      const use = this.createUseTag(0, 0, icon);
      use.setAttribute("width", size);
      use.setAttribute("height", size);
      use.setAttribute(
        "transform",
        "translate(-" +
          RadialMenu.numberToString(size / 2) +
          ",-" +
          RadialMenu.numberToString(size / 2) +
          ")"
      );
      g.appendChild(use);
    }

    svg.appendChild(g);
  }

  getIndexOffset() {
    if (this.levelItems.length < this.sectorCount) {
      switch (this.levelItems.length) {
        case 1:
          return -2;
        case 2:
          return -2;
        case 3:
          return -2;
        default:
          return -1;
      }
    } else {
      return -1;
    }
  }

  createMenu(classValue, levelItems, nested) {
    this.levelItems = levelItems;

    this.sectorCount = Math.max(this.levelItems.length, MIN_SECTORS);
    this.scale = this.calcScale();

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", classValue);
    svg.setAttribute("viewBox", "-50 -50 100 100");
    svg.setAttribute("width", this.size);
    svg.setAttribute("height", this.size);

    const angleStep = 360 / this.sectorCount;
    const angleShift = angleStep / 2 + 270;

    const indexOffset = this.getIndexOffset();

    for (let i = 0; i < this.sectorCount; ++i) {
      const startAngle = angleShift + angleStep * i;
      const endAngle = angleShift + angleStep * (i + 1);

      const itemIndex = RadialMenu.resolveLoopIndex(
        this.sectorCount - i + indexOffset,
        this.sectorCount
      );
      let item;
      if (itemIndex >= 0 && itemIndex < this.levelItems.length) {
        item = this.levelItems[itemIndex];
      } else {
        item = null;
      }

      this.appendSectorPath(startAngle, endAngle, svg, item, itemIndex);
    }

    if (nested) {
      this.createCenter(svg, "#return", 8);
    } else {
      this.createCenter(svg, "#close", 7);
    }

    return svg;
  }

  selectDelta(indexDelta) {
    let selectedIndex = this.getSelectedIndex();

    if (selectedIndex < 0) selectedIndex = 0;

    selectedIndex += indexDelta;

    if (selectedIndex < 0) {
      selectedIndex = this.levelItems.length + selectedIndex;
    } else if (selectedIndex >= this.levelItems.length) {
      selectedIndex -= this.levelItems.length;
    }
    this.setSelectedIndex(selectedIndex);
  }

  getSelectedNode() {
    const items = this.currentMenu.getElementsByClassName("selected");
    if (items.length > 0) {
      return items[0];
    } else {
      return null;
    }
  }

  getSelectedIndex() {
    const selectedNode = this.getSelectedNode();
    if (selectedNode) {
      return parseInt(selectedNode.getAttribute("data-index"));
    } else {
      return -1;
    }
  }

  setSelectedIndex(index) {
    if (index >= 0 && index < this.levelItems.length) {
      const items = this.currentMenu.querySelectorAll('g[data-index="' + index + '"]');
      if (items.length > 0) {
        const itemToSelect = items[0];
        const selectedNode = this.getSelectedNode();
        if (selectedNode) {
          selectedNode.setAttribute("class", "sector");
        }
        itemToSelect.setAttribute("class", "sector selected");
      }
    }
  }

  createUseTag(x, y, link) {
    const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    use.setAttribute("x", RadialMenu.numberToString(x));
    use.setAttribute("y", RadialMenu.numberToString(y));
    use.setAttribute("width", "10");
    use.setAttribute("height", "10");
    use.setAttribute("fill", "white");
    use.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", link);
    return use;
  }

  appendSectorPath(startAngleDeg, endAngleDeg, svg, item, index) {
    const centerPoint = this.getSectorCenter(startAngleDeg, endAngleDeg);
    const translate = {
      x: RadialMenu.numberToString((1 - this.scale) * centerPoint.x),
      y: RadialMenu.numberToString((1 - this.scale) * centerPoint.y),
    };

    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttribute(
      "transform",
      "translate(" + translate.x + " ," + translate.y + ") scale(" + this.scale + ")"
    );

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", this.createSectorCmds(startAngleDeg, endAngleDeg));
    g.appendChild(path);

    if (item) {
      g.setAttribute("class", "sector");
      if (index == 0) {
        g.setAttribute("class", "sector selected");
      }
      g.setAttribute("data-id", item.id);
      g.setAttribute("data-index", index);

      if (item.title) {
        const text = this.createText(centerPoint.x, centerPoint.y, item.title);
        if (item.icon) {
          text.setAttribute("transform", "translate(0,8)");
        } else {
          text.setAttribute("transform", "translate(0,2)");
        }

        g.appendChild(text);
      }

      if (item.icon) {
        const use = this.createUseTag(centerPoint.x, centerPoint.y, item.icon);
        if (item.title) {
          use.setAttribute("transform", "translate(-5,-8)");
        } else {
          use.setAttribute("transform", "translate(-5,-5)");
        }

        g.appendChild(use);
      }
    } else {
      g.setAttribute("class", "dummy");
    }

    svg.appendChild(g);
  }

  createSectorCmds(startAngleDeg, endAngleDeg) {
    const initPoint = RadialMenu.getDegreePos(startAngleDeg, this.radius);
    let path = "M" + RadialMenu.pointToString(initPoint);

    const radiusAfterScale = this.radius * (1 / this.scale);
    path +=
      "A" +
      radiusAfterScale +
      " " +
      radiusAfterScale +
      " 0 0 0" +
      RadialMenu.pointToString(RadialMenu.getDegreePos(endAngleDeg, this.radius));
    path +=
      "L" +
      RadialMenu.pointToString(RadialMenu.getDegreePos(endAngleDeg, this.innerRadius));

    const radiusDiff = this.radius - this.innerRadius;
    const radiusDelta = (radiusDiff - radiusDiff * this.scale) / 2;
    const innerRadius = (this.innerRadius + radiusDelta) * (1 / this.scale);
    path +=
      "A" +
      innerRadius +
      " " +
      innerRadius +
      " 0 0 1 " +
      RadialMenu.pointToString(RadialMenu.getDegreePos(startAngleDeg, this.innerRadius));
    path += "Z";

    return path;
  }

  createText(x, y, title) {
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("x", RadialMenu.numberToString(x));
    text.setAttribute("y", RadialMenu.numberToString(y));
    text.setAttribute("font-size", "25%");
    text.innerHTML = title;
    return text;
  }

  createCircle(x, y, r) {
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", RadialMenu.numberToString(x));
    circle.setAttribute("cy", RadialMenu.numberToString(y));
    circle.setAttribute("r", r);
    return circle;
  }

  calcScale() {
    const totalSpace = this.sectorSpace * this.sectorCount;
    const circleLength = Math.PI * 2 * this.radius;
    const radiusDelta = this.radius - (circleLength - totalSpace) / (Math.PI * 2);
    return (this.radius - radiusDelta) / this.radius;
  }

  getSectorCenter(startAngleDeg, endAngleDeg) {
    return RadialMenu.getDegreePos(
      (startAngleDeg + endAngleDeg) / 2,
      this.innerRadius + (this.radius - this.innerRadius) / 2
    );
  }

  addIconSymbols() {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "icons");

    // return
    const returnSymbol = document.createElementNS("http://www.w3.org/2000/svg", "symbol");
    returnSymbol.setAttribute("id", "return");
    returnSymbol.setAttribute("viewBox", "0 0 489.394 489.394");
    const returnPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    returnPath.setAttribute(
      "d",
      "M375.789,92.867H166.864l17.507-42.795c3.724-9.132,1-19.574-6.691-25.744c-7.701-6.166-18.538-6.508-26.639-0.879" +
        "L9.574,121.71c-6.197,4.304-9.795,11.457-9.563,18.995c0.231,7.533,4.261,14.446,10.71,18.359l147.925,89.823" +
        "c8.417,5.108,19.18,4.093,26.481-2.499c7.312-6.591,9.427-17.312,5.219-26.202l-19.443-41.132h204.886" +
        "c15.119,0,27.418,12.536,27.418,27.654v149.852c0,15.118-12.299,27.19-27.418,27.19h-226.74c-20.226,0-36.623,16.396-36.623,36.622" +
        "v12.942c0,20.228,16.397,36.624,36.623,36.624h226.74c62.642,0,113.604-50.732,113.604-113.379V206.709" +
        "C489.395,144.062,438.431,92.867,375.789,92.867z"
    );
    returnSymbol.appendChild(returnPath);
    svg.appendChild(returnSymbol);

    const closeSymbol = document.createElementNS("http://www.w3.org/2000/svg", "symbol");
    closeSymbol.setAttribute("id", "close");
    closeSymbol.setAttribute("viewBox", "0 0 41.756 41.756");

    const closePath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    closePath.setAttribute(
      "d",
      "M27.948,20.878L40.291,8.536c1.953-1.953,1.953-5.119,0-7.071c-1.951-1.952-5.119-1.952-7.07,0L20.878,13.809L8.535,1.465" +
        "c-1.951-1.952-5.119-1.952-7.07,0c-1.953,1.953-1.953,5.119,0,7.071l12.342,12.342L1.465,33.22c-1.953,1.953-1.953,5.119,0,7.071" +
        "C2.44,41.268,3.721,41.755,5,41.755c1.278,0,2.56-0.487,3.535-1.464l12.343-12.342l12.343,12.343" +
        "c0.976,0.977,2.256,1.464,3.535,1.464s2.56-0.487,3.535-1.464c1.953-1.953,1.953-5.119,0-7.071L27.948,20.878z"
    );
    closeSymbol.appendChild(closePath);
    svg.appendChild(closeSymbol);

    this.holder.appendChild(svg);
  }

  static getDegreePos(angleDeg, length) {
    return {
      x: Math.sin(RadialMenu.degToRad(angleDeg)) * length,
      y: Math.cos(RadialMenu.degToRad(angleDeg)) * length,
    };
  }

  static pointToString(point) {
    return RadialMenu.numberToString(point.x) + " " + RadialMenu.numberToString(point.y);
  }

  static numberToString(n) {
    if (Number.isInteger(n)) {
      return n.toString();
    } else if (n) {
      let r = (+n).toFixed(5);
      if (r.match(/\./)) {
        r = r.replace(/\.?0+$/, "");
      }
      return r;
    }
  }

  static resolveLoopIndex(index, length) {
    if (index < 0) {
      index = length + index;
    }
    if (index >= length) {
      index = index - length;
    }
    if (index < length) {
      return index;
    } else {
      return null;
    }
  }

  static degToRad(deg) {
    return deg * (Math.PI / 180);
  }

  static setClassAndWaitForTransition(node, newClass) {
    return new Promise((resolve) => {
      const handler = (event) => {
        if (event.target == node && event.propertyName == "visibility") {
          node.removeEventListener("transitionend", handler);
          resolve();
        }
      };
      node.addEventListener("transitionend", handler);
      node.setAttribute("class", newClass);
    });
  }

  static nextTick(fn) {
    setTimeout(fn, 10);
  }

  static nestedProperty(obj, path, all, objAll = []) {
    if (all) {
      if (!Array.isArray(obj)) objAll.push(obj);
      if (!path) return objAll;
    }
    if (!path) return obj;
    const props = path.split(".");
    return RadialMenu.nestedProperty(obj[props.shift()], props.join("."), all, objAll);
  }

  static findNested(value, testFn, maxDepth, path = [], depth = 0) {
    const matches = [];

    if (testFn(value)) matches.push({ path, value });

    if (depth >= maxDepth) return matches;

    if (Array.isArray(value) || typeof value === "object") {
      for (const key in value) {
        matches.push(
          ...RadialMenu.findNested(value[key], testFn, maxDepth, [...path, key], depth++)
        );
      }
    }

    return matches;
  }

  static deepCopy = (obj) => JSON.parse(JSON.stringify(obj));

  static getPath = (obj, path = []) => {
    if (!obj) return path;
    let p;
    if (Array.isArray(obj)) p = "0";
    else p = "items";
    path.push(p);
    return RadialMenu.getPath(obj[p], path);
  };
}

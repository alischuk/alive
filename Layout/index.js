import React, { Component } from 'react'
import ReactDom from 'react-dom'
import classNames from 'classnames'
import _ from 'lodash'
import { 
  getReactInstance, 
  getPrevReactSiblingInstance, 
  getNextReactSiblingInstance, 
  getConstructorName,
} from '../Utils/react-utils'
import './layouts.less'

/**
* Contains the declaration for the {@link Layout} class.
* @module Layout
*/
const Layout = (props) => {
  const { className, children, ...otherProps } = props;
  return (
    <div className={classNames('layout-container', className)} {...otherProps}>
      {children}
    </div>
  )
};

/**
* Contains the declaration for the {@link Cols} class.
* @module Cols
*/
class Cols extends Component {

  constructor(props) {
    super(props);
    this.splitters = []
  }
  
  appendSplitter(splitter) {
    this.splitters.push(splitter)
  }
  
  componentDidMount() {
    _.each(this.splitters, (splitter) => splitter.forceUpdate())
  }
  
  render() {
    const { className, children, otherProps } = this.props
    return (
      <div className={classNames('flex-container-row', className)} {...otherProps}>
        {
          React.Children.map(this.props.children, (child) => 
            React.cloneElement(child, {parent: this}))
        }
      </div>
    )
  }
}

/**
* Contains the declaration for the {@link Rows} class.
* @module Rows
*/
class Rows extends Component {

  constructor(props) {
    super(props)
    this.splitters = []
  }
  
  appendSplitter(splitter) {
    this.splitters.push(splitter)
  }
  
  componentDidMount() {
    _.each(this.splitters, (splitter) => splitter.forceUpdate())
  }
  
  render() {
    const { className, children, otherProps } = this.props
    return (
      <div className={classNames('flex-container-col', className)} {...otherProps}>
        {
          React.Children.map(this.props.children, (child) => 
            React.cloneElement(child, {parent: this}))
        }
      </div>
    )
  }
}

/**
* Contains the declaration for the {@link Row} class.
* @module Row
*/
class Row extends Component {

  constructor(props) {
    super(props)
    this.name = 'Row'
  }

  componentWillMount() {
    this.min = +this.props.min || 0
    const height = typeof(this.props.height) !== undefined ? (
      +this.props.height < this.min ? this.min : this.props.height
    ) : undefined
    this.setHeight(height)
  }

  componentDidMount() {
    this.node = ReactDom.findDOMNode(this)
  }
  
  getFlexHeight() {
    return this.node.offsetHeight
  }
  
  setHeight(height) {
    let ajustHeight = +height
    const heightDefined = typeof(height) !== "undefined"
    
    if (heightDefined) {
      ajustHeight = ajustHeight < this.min ? this.min : +height
    }
    
    const hValue = heightDefined
      ? (ajustHeight + 'px') 
      : ''

    this.setState({
      heightValue: ajustHeight,
      height: hValue,
    })
  }
  
  getMinHeight() {
    return this.min
  }
  
  getHeight() {
    return !this.isFlexible() ? this.state.heightValue : this.node.offsetHeight
  }
  
  isFlexible() {
    return this.state.height === ''
  }
  
  render() {
    const { className, height, style = {}, children, parent, ...otherProps } = this.props
    return (
      <div className={classNames('flex-col', className)} style={{...style, ...{maxHeight: this.state.height, minHeight: this.state.height}}} {...otherProps}>
        {children}
      </div>
    )
  }
}

/**
* Contains the declaration for the {@link Col} class.
* @module Col
*/
class Col extends Component {

  constructor(props) {
    super(props);
    this.name = 'Col'
  }

  componentWillMount() {
    this.min = +this.props.min || 0
    const width = typeof(this.props.width) !== undefined ? (
      +this.props.width < this.min ? this.min : this.props.width
    ) : undefined
    this.setWidth(width)
  }
  
  componentDidMount() {
    this.node = ReactDom.findDOMNode(this)
  }
  
  getFlexWidth() {
    return this.node.offsetHeight
  }
  
  setWidth(width) {
    let ajustWidth = +width
    const widthDefined = typeof(width) !== "undefined"
    
    if (widthDefined) {
      ajustWidth = ajustWidth < this.min ? this.min : +width
    }
    
    const wValue = widthDefined
      ? (ajustWidth + 'px') 
      : '';

    this.setState({
      widthValue: ajustWidth,
      width: wValue,
    })
  }
  
  getMinWidth() {
    return this.min;
  }
  
  getWidth() {
    return !this.isFlexible() ? this.state.widthValue : this.node.offsetWidth
  }
  
  isFlexible() {
    return this.state.width === ''
  }
  
  render() {
    const { className, width, style = {}, children, parent, ...otherProps } = this.props
    return (
      <div className={classNames('flex-row', className)} style={{...style, ...{maxWidth: this.state.width, minWidth: this.state.width}}} {...otherProps}>
        {children}
      </div>
    )
  }
}

const direction = {
    HORISONTAL: 'horisontal',
    VERTICAL: 'vertical',
};

/**
* Contains the declaration for the {@link Splitter} class.
* @module Splitter
*/
class Splitter extends Component {
  
  constructor(props) {
    super(props);
    this.cur = {};
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
  }
  
  componentDidMount() {
    const parent = this.props.parent
    if (parent.appendSplitter) {
      parent.appendSplitter(this)
    }
  }
  
  componentWillUpdate() {
    const domNode = ReactDom.findDOMNode(this)
    this.document = domNode.ownerDocument
    this.prevSibling = getPrevReactSiblingInstance(domNode)
    this.nextSibling = getNextReactSiblingInstance(domNode)
    
    const prevName = getConstructorName(this.prevSibling)
    const nextName = getConstructorName(this.nextSibling)
    const errorMessage = "Splitter must have both the same sibling Row or Col"
  
    if (prevName === nextName && (prevName === "Row" || prevName === "Col")) {
      if (prevName === "Row") {
        this.dir = direction.VERTICAL
        this.splitSize = domNode.offsetHeight
      } else {
        this.dir = direction.HORISONTAL
        this.splitSize = domNode.offsetWidth
      }
    } else {
      throw new Error(errorMessage)
    }
    
    if (this.dir) {
      if (this.dir === direction.VERTICAL) {
        this.setResizeMethod  = 'setHeight'
        this.sizeMethod       = 'getHeight'
        this.minMethod        = 'getMinHeight'
        this.getFlexMethod    = 'getFlexHeight'
      } else {
        this.setResizeMethod  = 'setWidth'
        this.sizeMethod       = 'getWidth'
        this.minMethod        = 'getMinWidth'
        this.getFlexMethod    = 'getFlexWidth'
      }
      this.prevSiblingFlex = this.prevSibling.isFlexible()
      this.nextSiblingFlex = this.nextSibling.isFlexible()
      this.mutable = []
      if (this.prevSiblingFlex && this.nextSiblingFlex) {
        this.prevSibling[this.sizeMethod](this.prevSibling[this.getFlexMethod]())
        this.prevSiblingFlex = false
        this.mutable = [true, false]
      } else if (!this.prevSiblingFlex && !this.nextSiblingFlex) {
        this.mutable = [true, true]
      } else if (this.prevSiblingFlex) {
        this.mutable = [false, true]
      } else {
        this.mutable = [true, false]
      }
    }
  }
  
  setResizeCursor() {
    this.document.body.style.cursor = (this.dir === direction.VERTICAL) ? 'row-resize' : 'col-resize'
  }
  
  clearCursor() {
    this.document.body.style.cursor = 'default'
  }

  onMouseMove(event)  {
    event.preventDefault()
    
    if (this.mutable[0] && this.mutable[1]) {
      if (this.dir === direction.VERTICAL) {
        const height = event.clientY - this.cur.top + this.cur.prevStartSize
        if ((height >= this.cur.minMax.prev[0] && height <= this.cur.minMax.prev[1])) {
          this.prevSibling.setHeight(height)
          this.nextSibling.setHeight(this.fullSize - this.splitSize - height)
          this.prevSibling.props.onResize && this.prevSibling.props.onResize({height: this.prevSibling.getHeight()})
          this.nextSibling.props.onResize && this.nextSibling.props.onResize({height: this.nextSibling.getHeight()})
        }
      } else {
        const width = event.clientX - this.cur.left + this.cur.prevStartSize
        if ((width >= this.cur.minMax.prev[0] && width <= this.cur.minMax.prev[1])) {
          this.prevSibling.setWidth(width)
          this.nextSibling.setWidth(this.fullSize - this.splitSize - width)
          this.prevSibling.props.onResize && this.prevSibling.props.onResize({width: this.prevSibling.getWidth()})
          this.nextSibling.props.onResize && this.nextSibling.props.onResize({width: this.nextSibling.getWidth()})
        }
      }
    } else {
      if (this.dir === direction.VERTICAL) {
        const height = (this.mutable[0] ? (event.clientY - this.cur.top + this.cur.prevStartSize) : (this.cur.top - event.clientY + this.cur.nextStartSize))
        const sibling = this.mutable[0] ? 'prevSibling' : 'nextSibling'
        if ((this.mutable[0] && height >= this.cur.minMax.prev[0] && height <= this.cur.minMax.prev[1]) 
          || (this.mutable[1] && height >= this.cur.minMax.next[0] && height <= this.cur.minMax.next[1])) {
          this[sibling].setHeight(height)
          this.prevSibling.props.onResize && this.prevSibling.props.onResize({height: this.prevSibling.getHeight()})
          this.nextSibling.props.onResize && this.nextSibling.props.onResize({height: this.nextSibling.getHeight()})
        }
      } else {
        const width = (this.mutable[0] ? (event.clientX - this.cur.left + this.cur.prevStartSize) : (this.cur.left - event.clientX + this.cur.nextStartSize))
        const sibling = this.mutable[0] ? 'prevSibling' : 'nextSibling'
        if ((this.mutable[0] && width >= this.cur.minMax.prev[0] && width <= this.cur.minMax.prev[1]) 
          || (this.mutable[1] && width >= this.cur.minMax.next[0] && width <= this.cur.minMax.next[1])) {
          this[sibling].setWidth(width)
          this.prevSibling.props.onResize && this.prevSibling.props.onResize({width: this.prevSibling.getWidth()})
          this.nextSibling.props.onResize && this.nextSibling.props.onResize({width: this.nextSibling.getWidth()});
        }
      }
    }
  }
  
  onMouseUp(event) {
    this.clearCursor()
    this.document.body.removeEventListener('mouseup', this.onMouseUp)
    this.document.body.removeEventListener('mousemove', this.onMouseMove)
    this.document.querySelector('html').removeEventListener('mouseup', this.onMouseUp)
  }
  
  onMouseDown(event) {
    if (this.dir) {
      this.setResizeCursor()
      
      if (this.dir === direction.VERTICAL) {
        this.fullSize = this.splitSize + this.prevSibling.getHeight() + this.nextSibling.getHeight()
      } else {
        this.fullSize = this.splitSize + this.prevSibling.getWidth() + this.nextSibling.getWidth()
      }
      
      this.cur = {
        left: event.clientX,
        top: event.clientY,
        prevStartSize: this.prevSibling[this.sizeMethod](),
        nextStartSize: this.nextSibling[this.sizeMethod](),
        minMax: {
          prev: [this.prevSibling[this.minMethod](), this.fullSize - this.splitSize - this.nextSibling[this.minMethod]()],
          next: [this.nextSibling[this.minMethod](), this.fullSize - this.splitSize - this.prevSibling[this.minMethod]()],
        },
        fullSize: this.fullSize,
        splitSize: this.splitSize,
      }
      
      this.document.body.addEventListener('mouseup', this.onMouseUp)
      this.document.body.addEventListener('mousemove', this.onMouseMove)
      this.document.querySelector('html').addEventListener('mouseup', this.onMouseUp)
    }
  }
  
  render() {
    const { width = 3, height = 3, className, ...otherProps } = this.props
    const isVertical = this.dir === direction.VERTICAL
    const spitElement = isVertical ? (
        <Row className={classNames("splitter row", className)} height={height} {...otherProps} onMouseDown={this.onMouseDown.bind(this)} /> 
      ) : ( 
        <Col className={classNames("splitter col", className)} width={width} {...otherProps} onMouseDown={this.onMouseDown.bind(this)} /> 
      );
    return spitElement
  }
}

export {
    Cols, Col, Rows, Row, Splitter, Layout,
}

import React, { Component } from 'react';
import classNames from 'classnames';
import { Spottable } from 'spotlight';
import './Button.less';

/**
* Contains the declaration for the {@link Button} class.
* @module Button
*/
class Button extends Component {
  constructor(props) {
    super(props);
    this.state = {
      down: false,
      disable: false, // eslint-disable-line
      active: true,
    };
    this.onDown = this.onDown.bind(this);
    this.onUp = this.onUp.bind(this);
    this.onClickAnimate = this.onClickAnimate.bind(this);
  }

  onSpotlightEnter() {
    if (this.props.onClick) {
      this.onClickAnimate();
    }
  }

  onDown() {
    if (this.state.active) {
      this.setState({ down: true });
      if (this.props.onIconClick) {
        this.props.onIconClick();
      }
    }
  }

  onUp() {
    if (this.state.active) {
      this.setState({ down: false });
    }
  }

  onClickAnimate() {
    this.onDown();
    global.setTimeout(() => this.onUp(), 100);
  }

  render() {
    const {
      className,
      icon,
      onTap,
      children,
      ...otherProps
    } = this.props;
    return (
      <div
        className={classNames(
          className,
          'button-alive-component',
          (this.state.down ? 'down' : ''),
          (this.state.active ? 'active' : '')
        )}
        {...otherProps}
        onMouseDown={this.onDown} 
        onMouseUp={this.onUp}
        onMouseOut={this.onUp}
      >
        <div className="bg" />
        <div className="client">{icon}{children}</div>
      </div>
    );
  }
}

export default Spottable(Button);

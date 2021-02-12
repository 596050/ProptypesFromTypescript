import * as React from 'react';
import PropTypes from 'prop-types';

const TimelineDot = React.forwardRef(function TimelineDot(props, ref) {
  return <div>Hello</div>;
});

TimelineDot.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // |     To update them edit the d.ts file and run "yarn proptypes"     |
  // ----------------------------------------------------------------------
  /**
   * The content of the component.
   */
  children: PropTypes.node,
  /**
   * Override or extend the styles applied to the component.
   */
  classes: PropTypes.object,
  /**
   * The dot can have a different colors.
   * @default 'grey'
   */
  color: PropTypes.oneOf(['grey', 'inherit', 'primary', 'secondary']),
};

export default TimelineDot;

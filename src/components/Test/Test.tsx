import * as React from "react";
import PropTypes from "prop-types";

const Test = React.forwardRef((props, ref) => {
  return <div>Hello</div>;
});

Test.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated  |
  // |     To update them edit TypeScript types and run "yarn proptypes"  |
  // ----------------------------------------------------------------------
  children: PropTypes.node,
};

export default Test;

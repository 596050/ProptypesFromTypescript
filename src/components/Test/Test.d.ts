import * as React from "react";
import { FormsyInjectedProps } from "formsy-react";

export interface TestPropsVariantOverrides {}
export type TestVariantDefaults = Record<"filled" | "outlined", true>;

export interface TestProps extends React.HTMLAttributes<HTMLSpanElement> {
  /**
   * The content of the component.
   */
  children?: React.ReactNode;
  /**
   * Override or extend the styles applied to the component.
   */
  classes?: {
    /** Styles applied to the root element. */
    root?: string;
    /** Styles applied to the root element if `variant="filled"`. */
    filled?: string;
    /** Styles applied to the root element if `variant="outlined"`. */
    outlined?: string;
    /** Styles applied to the root element if `color="grey"` and `variant="filled"`. */
    filledGrey?: string;
    /** Styles applied to the root element if `color="grey"` and `variant="outlined"`. */
    outlinedGrey?: string;
    /** Styles applied to the root element if `color="primary"` and `variant="filled"`. */
    filledPrimary?: string;
    /** Styles applied to the root element if `color="primary"` and `variant="outlined"`. */
    outlinedPrimary?: string;
    /** Styles applied to the root element if `color="secondary"` and `variant="filled"`. */
    filledSecondary?: string;
    /** Styles applied to the root element if `color="secondary"` and `variant="outlined"`. */
    outlinedSecondary?: string;
  };
  /**
   * The dot can have a different colors.
   * @default 'grey'
   */
  color?: "inherit" | "primary" | "secondary" | "grey";
  variant?: FormsyInjectedProps<string | number>;
}

export type TestClassKey = keyof NonNullable<TestProps["classes"]>;

/**
 *
 * Demos:
 *
 * - [Timeline](https://material-ui.com/components/timeline/)
 *
 * API:
 *
 * - [Test API](https://material-ui.com/api/timeline-dot/)
 */
export default function Test(props: TestProps): JSX.Element;
